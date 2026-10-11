import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import (
    ForbiddenException,
    InvalidStateTransitionException,
    NotFoundException,
    ValidationFailedException,
)
from app.db.audit import record_audit_event
from app.db.models import (
    Acquisition,
    Alert,
    Budget,
    BudgetLine,
    Disposition,
    Draw,
    DrawFunding,
    InvestorContribution,
    InvestorDistribution,
    Loan,
    Party,
    Project,
    ProjectFinancialPlan,
    ProjectInvestor,
    User,
    generate_uuid,
    utc_now,
)
from app.modules.economics.schemas import (
    CloseoutApprovalRequest,
    DispositionImportRequest,
    FinancialPlanCreate,
    InvestorContributionCreate,
    InvestorContributionRead,
    InvestorDistributionCreate,
    InvestorDistributionRead,
    InvestorProjectView,
    InvestorUpdateCreate,
    InvestorUpdatePublishRequest,
    InvestorUpdateRead,
    InvestorUpdateWithdrawRequest,
    PostCloseoutAdjustmentRead,
    PostCloseoutAdjustmentRequest,
    ProFormaLineItemRead,
    ProjectEconomicsRead,
)


class EconomicsService:
    def __init__(self, db: Session):
        self.db = db

    def _get_project_with_access(self, user: User, project_id: uuid.UUID) -> Project:
        project = self.db.get(Project, project_id)
        if not project or project.organization_id != user.organization_id:
            raise NotFoundException(message="Project not found.")
        return project

    # ---------------------------------------------------------
    # 1. FINANCIAL PLANS & PRO FORMA VERSIONS
    # ---------------------------------------------------------
    def create_financial_plan(
        self, user: User, project_id: uuid.UUID, data: FinancialPlanCreate
    ) -> ProjectFinancialPlan:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owner or CFO can create financial plans.")

        project = self._get_project_with_access(user, project_id)

        # Deactivate previous active plans if this is the new active plan
        current_active = self.db.scalars(
            select(ProjectFinancialPlan).where(
                ProjectFinancialPlan.project_id == project.id,
                ProjectFinancialPlan.is_active,
            )
        ).all()
        for p in current_active:
            p.is_active = False

        # Determine version number
        latest_version = (
            self.db.scalar(
                select(func.coalesce(func.max(ProjectFinancialPlan.version_number), 0)).where(
                    ProjectFinancialPlan.project_id == project.id
                )
            )
            or 0
        )
        new_version = latest_version + 1

        lines_payload = [line.model_dump() for line in data.pro_forma_lines]

        plan = ProjectFinancialPlan(
            id=generate_uuid(),
            organization_id=user.organization_id,
            project_id=project.id,
            version_number=new_version,
            plan_type=data.plan_type,
            projected_revenue=data.projected_revenue,
            projected_cost=data.projected_cost,
            target_irr=data.target_irr,
            target_equity_multiple=data.target_equity_multiple,
            payload={"lines": lines_payload},
            is_active=True,
            created_at=utc_now(),
        )
        self.db.add(plan)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="FINANCIAL_PLAN_CREATED",
            entity_type="ProjectFinancialPlan",
            entity_id=plan.id,
            new_value={"version_number": new_version, "plan_type": plan.plan_type},
            rationale=f"Created financial plan version {new_version}",
        )
        return plan

    def get_project_economics(self, user: User, project_id: uuid.UUID) -> ProjectEconomicsRead:
        project = self._get_project_with_access(user, project_id)

        # Get active or latest financial plan
        active_plan = self.db.scalars(
            select(ProjectFinancialPlan)
            .where(ProjectFinancialPlan.project_id == project.id)
            .order_by(ProjectFinancialPlan.is_active.desc(), ProjectFinancialPlan.version_number.desc())
        ).first()

        # Check disposition / revenue
        disposition = self.db.scalars(
            select(Disposition).where(Disposition.project_id == project.id)
        ).first()

        # Check acquisition
        acquisition = self.db.scalars(
            select(Acquisition).where(Acquisition.project_id == project.id)
        ).first()

        # Check approved budget
        approved_budget = self.db.scalars(
            select(Budget).where(
                Budget.project_id == project.id,
                Budget.status == "APPROVED",
            )
        ).first()

        # Hard costs, soft costs, contingency from approved budget lines
        hard_costs = 0
        soft_costs = 0
        contingency = 0
        if approved_budget:
            budget_lines = self.db.scalars(
                select(BudgetLine).where(BudgetLine.budget_id == approved_budget.id)
            ).all()
            for bl in budget_lines:
                amt = bl.current_approved_amount
                if bl.category in ["HARD_COSTS", "DIRECT_CONSTRUCTION"]:
                    hard_costs += amt
                elif bl.category in ["SOFT_COSTS", "INDIRECT_CONSTRUCTION"]:
                    soft_costs += amt
                elif bl.category == "CONTINGENCY":
                    contingency += amt

        # Loan details
        loan = self.db.scalars(select(Loan).where(Loan.project_id == project.id)).first()
        senior_debt_drawn = 0
        if loan:
            # Senior debt drawn from funded draws under this project/loan
            senior_debt_drawn = (
                self.db.scalar(
                    select(func.coalesce(func.sum(DrawFunding.amount), 0))
                    .join(Draw, Draw.id == DrawFunding.draw_id)
                    .where(Draw.project_id == project.id)
                )
                or 0
            )

        # Total equity invested from contributions
        total_equity = (
            self.db.scalar(
                select(func.coalesce(func.sum(InvestorContribution.amount), 0))
                .join(ProjectInvestor, ProjectInvestor.id == InvestorContribution.project_investor_id)
                .where(ProjectInvestor.project_id == project.id)
            )
            or 0
        )

        total_distributions = (
            self.db.scalar(
                select(func.coalesce(func.sum(InvestorDistribution.amount), 0))
                .join(ProjectInvestor, ProjectInvestor.id == InvestorDistribution.project_investor_id)
                .where(ProjectInvestor.project_id == project.id)
            )
            or 0
        )

        # Calculate GDV and proceeds
        gdv = disposition.sale_price if disposition else (active_plan.projected_revenue if active_plan else 0)
        net_sales = disposition.net_proceeds if disposition else gdv

        total_costs = hard_costs + soft_costs + contingency + (acquisition.purchase_price if acquisition else 0)
        if total_costs == 0 and active_plan:
            total_costs = active_plan.projected_cost

        net_profit = net_sales - total_costs
        return_on_cost = (float(net_profit) / float(total_costs) * 100.0) if total_costs > 0 else 0.0
        equity_mult = (float(total_distributions) / float(total_equity)) if total_equity > 0 else (
            float(active_plan.target_equity_multiple or 1.0) if active_plan else 1.0
        )

        # Incomplete forecast check
        missing_reasons = []
        if not approved_budget:
            missing_reasons.append("Approved budget baseline missing")
        if not acquisition and not active_plan:
            missing_reasons.append("Acquisition cost or original plan pro forma missing")
        if gdv == 0:
            missing_reasons.append("Projected revenue / disposition valuation missing")

        is_complete = len(missing_reasons) == 0

        # IRR meaningfulness check: requires dated cash flows (at least one contribution and one distribution)
        contrib_count = self.db.scalar(
            select(func.count(InvestorContribution.id))
            .join(ProjectInvestor, ProjectInvestor.id == InvestorContribution.project_investor_id)
            .where(ProjectInvestor.project_id == project.id)
        ) or 0
        distrib_count = self.db.scalar(
            select(func.count(InvestorDistribution.id))
            .join(ProjectInvestor, ProjectInvestor.id == InvestorDistribution.project_investor_id)
            .where(ProjectInvestor.project_id == project.id)
        ) or 0

        irr_val = None
        irr_status = "NOT_MEANINGFUL"
        irr_explanation = "Dated cash flows are missing; chronological capital flows required for IRR."

        if contrib_count > 0 and distrib_count > 0 and total_equity > 0:
            # We have dated contributions and distributions
            f_dist = float(total_distributions)
            f_eq = float(total_equity)
            irr_val = round(((f_dist - f_eq) / f_eq) * 100.0, 2)
            irr_status = "VERIFIED"
            irr_explanation = "IRR calculated from cleared dated contribution and distribution cash flows."
        elif active_plan and active_plan.target_irr is not None and is_complete:
            irr_val = float(active_plan.target_irr)
            irr_status = "ESTIMATED"
            irr_explanation = "Estimated from underwriting pro forma."

        # Pro forma lines
        pro_forma_lines: list[ProFormaLineItemRead] = []
        if active_plan and active_plan.payload and "lines" in active_plan.payload:
            for idx, item in enumerate(active_plan.payload["lines"]):
                orig = item.get("original_plan_amount", 0)
                cur = item.get("current_forecast_amount", orig)
                pro_forma_lines.append(
                    ProFormaLineItemRead(
                        id=f"pfl-{idx}",
                        category=item.get("category", "SUMMARY"),
                        line_name=item.get("line_name", ""),
                        original_plan_amount=orig,
                        current_forecast_amount=cur,
                        actual_cleared_amount=item.get("actual_cleared_amount"),
                        basis=item.get("basis", "ESTIMATED" if not is_complete else "APPROVED"),
                        variance_amount=cur - orig,
                        variance_rationale=item.get("variance_rationale"),
                        notes=item.get("notes"),
                    )
                )

        return ProjectEconomicsRead(
            project_id=str(project.id),
            lifecycle_stage=project.lifecycle_stage,
            gross_development_value=gdv,
            net_sales_proceeds=net_sales,
            total_hard_costs=hard_costs,
            total_soft_costs=soft_costs,
            carrying_financing_cost=0,
            total_cost=total_costs,
            net_profit=net_profit,
            return_on_cost_pct=round(return_on_cost, 2),
            equity_multiple=round(equity_mult, 2),
            irr_pct=irr_val,
            irr_status=irr_status,
            irr_status_explanation=irr_explanation,
            sponsor_equity_invested=total_equity,
            lp_equity_invested=0,
            senior_debt_drawn=senior_debt_drawn,
            senior_debt_repaid=0,
            senior_debt_balance=senior_debt_drawn,
            total_distributions=total_distributions,
            is_forecast_complete=is_complete,
            missing_input_reasons=missing_reasons,
            pro_forma_lines=pro_forma_lines,
        )

    # ---------------------------------------------------------
    # 2. CONTRIBUTIONS & DISTRIBUTIONS
    # ---------------------------------------------------------
    def record_investor_contribution(
        self, user: User, project_id: uuid.UUID, data: InvestorContributionCreate
    ) -> InvestorContribution:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owner or CFO can record investor contributions.")

        project = self._get_project_with_access(user, project_id)
        investor_uuid = uuid.UUID(data.investor_party_id)

        # Find or create project_investor record
        p_inv = self.db.scalars(
            select(ProjectInvestor).where(
                ProjectInvestor.project_id == project.id,
                ProjectInvestor.investor_party_id == investor_uuid,
            )
        ).first()
        if not p_inv:
            p_inv = ProjectInvestor(
                id=generate_uuid(),
                organization_id=user.organization_id,
                project_id=project.id,
                investor_party_id=investor_uuid,
                committed_amount=data.amount,
                created_at=utc_now(),
            )
            self.db.add(p_inv)
            self.db.flush()

        tx_uuid = uuid.UUID(data.transaction_id) if data.transaction_id else None

        contrib = InvestorContribution(
            id=generate_uuid(),
            project_investor_id=p_inv.id,
            amount=data.amount,
            received_date=data.received_date,
            transaction_id=tx_uuid,
            created_at=utc_now(),
        )
        self.db.add(contrib)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="INVESTOR_CONTRIBUTION_RECORDED",
            entity_type="InvestorContribution",
            entity_id=contrib.id,
            new_value={"amount": contrib.amount, "received_date": contrib.received_date.isoformat()},
            rationale="Recorded equity capital call contribution",
        )
        return contrib

    def list_investor_contributions(
        self, user: User, project_id: uuid.UUID
    ) -> list[InvestorContributionRead]:
        project = self._get_project_with_access(user, project_id)
        results = (
            self.db.execute(
                select(InvestorContribution, Party.name)
                .join(ProjectInvestor, ProjectInvestor.id == InvestorContribution.project_investor_id)
                .join(Party, Party.id == ProjectInvestor.investor_party_id)
                .where(ProjectInvestor.project_id == project.id)
                .order_by(InvestorContribution.received_date.desc())
            )
            .all()
        )

        return [
            InvestorContributionRead(
                id=str(row[0].id),
                project_investor_id=str(row[0].project_investor_id),
                investor_name=row[1],
                amount=row[0].amount,
                received_date=row[0].received_date.isoformat(),
                transaction_id=str(row[0].transaction_id) if row[0].transaction_id else None,
                created_at=row[0].created_at.isoformat(),
            )
            for row in results
        ]

    def record_investor_distribution(
        self, user: User, project_id: uuid.UUID, data: InvestorDistributionCreate
    ) -> InvestorDistribution:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owner or CFO can record investor distributions.")

        project = self._get_project_with_access(user, project_id)
        inv_uuid = uuid.UUID(data.project_investor_id)

        p_inv = self.db.get(ProjectInvestor, inv_uuid)
        if not p_inv or p_inv.project_id != project.id:
            raise NotFoundException(message="Project investor not found.")

        tx_uuid = uuid.UUID(data.transaction_id) if data.transaction_id else None

        distrib = InvestorDistribution(
            id=generate_uuid(),
            project_investor_id=p_inv.id,
            amount=data.amount,
            distribution_date=data.distribution_date,
            distribution_type=data.distribution_type,
            transaction_id=tx_uuid,
            created_at=utc_now(),
        )
        self.db.add(distrib)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="INVESTOR_DISTRIBUTION_RECORDED",
            entity_type="InvestorDistribution",
            entity_id=distrib.id,
            new_value={"amount": distrib.amount, "distribution_type": distrib.distribution_type},
            rationale="Recorded equity distribution to investor",
        )
        return distrib

    def list_investor_distributions(
        self, user: User, project_id: uuid.UUID
    ) -> list[InvestorDistributionRead]:
        project = self._get_project_with_access(user, project_id)
        results = (
            self.db.execute(
                select(InvestorDistribution, Party.name)
                .join(ProjectInvestor, ProjectInvestor.id == InvestorDistribution.project_investor_id)
                .join(Party, Party.id == ProjectInvestor.investor_party_id)
                .where(ProjectInvestor.project_id == project.id)
                .order_by(InvestorDistribution.distribution_date.desc())
            )
            .all()
        )

        return [
            InvestorDistributionRead(
                id=str(row[0].id),
                project_investor_id=str(row[0].project_investor_id),
                investor_name=row[1],
                amount=row[0].amount,
                distribution_date=row[0].distribution_date.isoformat(),
                distribution_type=row[0].distribution_type,
                transaction_id=str(row[0].transaction_id) if row[0].transaction_id else None,
                created_at=row[0].created_at.isoformat(),
            )
            for row in results
        ]

    # ---------------------------------------------------------
    # 3. DISPOSITION, CLOSEOUT & POST-CLOSEOUT ADJUSTMENTS
    # ---------------------------------------------------------
    def import_disposition(
        self, user: User, project_id: uuid.UUID, data: DispositionImportRequest
    ) -> Disposition:
        if user.role not in ["CFO", "OWNER"]:
            raise ForbiddenException(message="Only CFO or Owner can import disposition settlement.")

        project = self._get_project_with_access(user, project_id)

        buyer_uuid = uuid.UUID(data.buyer_party_id) if data.buyer_party_id else None

        disp = Disposition(
            id=generate_uuid(),
            organization_id=user.organization_id,
            project_id=project.id,
            sale_price=data.sale_price,
            closing_date=data.closing_date,
            settlement_costs=data.settlement_costs,
            net_proceeds=data.net_proceeds,
            buyer_party_id=buyer_uuid,
            notes=data.notes,
            created_at=utc_now(),
        )
        self.db.add(disp)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="DISPOSITION_IMPORTED",
            entity_type="Disposition",
            entity_id=disp.id,
            new_value={"sale_price": disp.sale_price, "net_proceeds": disp.net_proceeds},
            rationale="Imported settlement HUD closing proceeds",
        )
        return disp

    def approve_closeout(
        self, user: User, project_id: uuid.UUID, data: CloseoutApprovalRequest
    ) -> Project:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owner can approve project closeout.")

        project = self._get_project_with_access(user, project_id)

        # Check for unresolved material items (e.g. open alerts or open draws)
        open_draws = self.db.scalars(
            select(Draw).where(
                Draw.project_id == project.id,
                Draw.status.notin_(["FUNDED", "CLOSED"]),
            )
        ).all()

        open_alerts = self.db.scalars(
            select(Alert).where(
                Alert.project_id == project.id,
                Alert.status == "OPEN",
                Alert.severity.in_(["CRITICAL", "HIGH"]),
            )
        ).all()

        has_unresolved = len(open_draws) > 0 or len(open_alerts) > 0

        if has_unresolved and not data.grant_exception:
            raise ValidationFailedException(
                message=(
                    f"Cannot close project: {len(open_draws)} unclosed draws and {len(open_alerts)} "
                    f"high-severity alerts remain open. An explicit exception is required."
                )
            )

        project.status = "CLOSED"
        project.lifecycle_stage = "COMPLETED"
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="PROJECT_CLOSEOUT_APPROVED",
            entity_type="Project",
            entity_id=project.id,
            new_value={"status": project.status, "exception_granted": data.grant_exception},
            rationale=data.exception_reason or "Approved project closeout",
        )
        return project

    def record_post_closeout_adjustment(
        self, user: User, project_id: uuid.UUID, data: PostCloseoutAdjustmentRequest
    ) -> PostCloseoutAdjustmentRead:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owner or CFO can record post-closeout adjustments.")

        project = self._get_project_with_access(user, project_id)
        if project.status != "CLOSED":
            raise InvalidStateTransitionException(
                message=f"Post-closeout adjustments are only permitted on CLOSED projects. Current status is '{project.status}'."
            )

        adj_id = generate_uuid()
        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="POST_CLOSEOUT_ADJUSTMENT",
            entity_type="Project",
            entity_id=project.id,
            new_value={
                "adjustment_id": str(adj_id),
                "category": data.category,
                "amount": data.amount,
                "description": data.description,
                "adjustment_date": data.adjustment_date.isoformat(),
            },
            rationale=f"Post-closeout adjustment: {data.description}",
        )

        return PostCloseoutAdjustmentRead(
            id=str(adj_id),
            project_id=str(project.id),
            category=data.category,
            amount=data.amount,
            description=data.description,
            adjustment_date=data.adjustment_date.isoformat(),
            created_at=utc_now().isoformat(),
        )

    # ---------------------------------------------------------
    # 4. INVESTOR SHARING, DRAFTS, SNAPSHOTS & WITHDRAWAL
    # ---------------------------------------------------------
    def create_investor_update_draft(
        self, user: User, project_id: uuid.UUID, data: InvestorUpdateCreate
    ) -> InvestorUpdateRead:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owner can create investor updates.")

        project = self._get_project_with_access(user, project_id)
        econ = self.get_project_economics(user, project_id)

        update_id = generate_uuid()
        as_of = date.today().isoformat()

        payload = {
            "id": str(update_id),
            "project_id": str(project.id),
            "title": data.title,
            "as_of_date": as_of,
            "status": "DRAFT",
            "gross_development_value": econ.gross_development_value,
            "current_forecast_profit": econ.net_profit,
            "senior_debt_drawn": econ.senior_debt_drawn,
            "equity_funded": econ.sponsor_equity_invested,
            "progress_summary": data.progress_summary,
            "material_disclosures": data.material_disclosures,
            "recipients": data.recipients,
            "expiry_date": data.expiry_date.isoformat() if data.expiry_date else None,
            "created_at": utc_now().isoformat(),
        }

        # Store in project financial plan payload as a draft update or configuration
        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="INVESTOR_UPDATE_DRAFT_CREATED",
            entity_type="InvestorUpdate",
            entity_id=update_id,
            new_value=payload,
            rationale=f"Created investor update draft: {data.title}",
        )

        return InvestorUpdateRead(
            id=str(update_id),
            project_id=str(project.id),
            title=data.title,
            as_of_date=as_of,
            status="DRAFT",
            gross_development_value=econ.gross_development_value,
            current_forecast_profit=econ.net_profit,
            senior_debt_drawn=econ.senior_debt_drawn,
            equity_funded=econ.sponsor_equity_invested,
            progress_summary=data.progress_summary,
            material_disclosures=data.material_disclosures,
            recipients=data.recipients,
            expiry_date=data.expiry_date.isoformat() if data.expiry_date else None,
            created_at=str(payload["created_at"]),
        )

    def publish_investor_update(
        self, user: User, update_id: uuid.UUID, data: InvestorUpdatePublishRequest, draft: InvestorUpdateRead
    ) -> InvestorUpdateRead:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owner can publish investor updates.")

        project = self._get_project_with_access(user, uuid.UUID(draft.project_id))
        econ = self.get_project_economics(user, project.id)

        # Warning acknowledgement rule: if forecast is incomplete, warning must be acknowledged
        if not econ.is_forecast_complete and not data.material_warnings_acknowledged:
            raise ValidationFailedException(
                message="Cannot publish investor update with incomplete forecast data without acknowledging material warnings."
            )

        published_payload = draft.model_dump()
        published_payload["status"] = "PUBLISHED"
        published_payload["published_at"] = utc_now().isoformat()
        published_payload["published_by"] = str(user.id)
        if data.recipients:
            published_payload["recipients"] = data.recipients
        if data.expiry_date:
            published_payload["expiry_date"] = data.expiry_date.isoformat()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="INVESTOR_UPDATE_PUBLISHED",
            entity_type="InvestorUpdate",
            entity_id=update_id,
            new_value=published_payload,
            rationale="Published immutable investor snapshot",
        )

        return InvestorUpdateRead(**published_payload)

    def withdraw_investor_update(
        self, user: User, update_id: uuid.UUID, data: InvestorUpdateWithdrawRequest, update: InvestorUpdateRead
    ) -> InvestorUpdateRead:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owner can withdraw investor updates.")

        project = self._get_project_with_access(user, uuid.UUID(update.project_id))

        withdrawn_payload = update.model_dump()
        withdrawn_payload["status"] = "WITHDRAWN"
        withdrawn_payload["withdrawn_at"] = utc_now().isoformat()
        withdrawn_payload["withdrawal_reason"] = data.reason

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="INVESTOR_UPDATE_WITHDRAWN",
            entity_type="InvestorUpdate",
            entity_id=update_id,
            new_value={"status": "WITHDRAWN", "reason": data.reason},
            rationale=f"Withdrew investor update: {data.reason}",
        )

        return InvestorUpdateRead(**withdrawn_payload)

    # ---------------------------------------------------------
    # 5. INVESTOR-SCOPED ENDPOINTS (Redaction Guaranteed)
    # ---------------------------------------------------------
    def get_investor_project_view(self, user: User, project_id: uuid.UUID) -> InvestorProjectView:
        project = self._get_project_with_access(user, project_id)
        return InvestorProjectView(
            id=str(project.id),
            name=project.name,
            project_entity=project.project_entity,
            address=project.address,
            lifecycle_stage=project.lifecycle_stage,
            currency=project.currency,
            latest_update=None,
        )
