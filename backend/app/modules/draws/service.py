import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import (
    DrawNotFundableException,
    ForbiddenException,
    InvalidStateTransitionException,
    NotFoundException,
    ValidationFailedException,
)
from app.db.audit import record_audit_event
from app.db.models import (
    BudgetLine,
    Draw,
    DrawFunding,
    DrawLine,
    DrawRequirement,
    FinancialTransaction,
    Loan,
    Project,
    User,
    generate_uuid,
    utc_now,
)
from app.modules.draws.schemas import (
    DrawCreate,
    DrawFundingRequest,
    DrawPacketResponse,
    DrawRequirementRead,
    DrawRevisionRequest,
    LenderDecisionRequest,
    UnallocatedFundingItem,
    UpdateDrawLinesRequest,
    VerifyCostRequest,
    VerifyWorkRequest,
)


class DrawService:
    def __init__(self, db: Session):
        self.db = db

    def _get_project_with_access(self, user: User, project_id: uuid.UUID) -> Project:
        project = self.db.get(Project, project_id)
        if not project or project.organization_id != user.organization_id:
            raise NotFoundException(message="Project not found.")
        return project

    # ---------------------------------------------------------
    # 1. DRAW DRAFT CREATION & LINES
    # ---------------------------------------------------------
    def create_draw(self, user: User, project_id: uuid.UUID, data: DrawCreate) -> Draw:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can create draws.")

        project = self._get_project_with_access(user, project_id)

        loan_uuid = uuid.UUID(data.loan_id)
        loan = self.db.get(Loan, loan_uuid)
        if not loan or loan.project_id != project.id:
            raise NotFoundException(message="Loan not found for this project.")

        lender_uuid = uuid.UUID(data.lender_party_id) if data.lender_party_id else loan.lender_party_id
        source_doc_uuid = uuid.UUID(data.source_document_id) if data.source_document_id else None

        draw = Draw(
            id=generate_uuid(),
            organization_id=user.organization_id,
            project_id=project.id,
            loan_id=loan.id,
            draw_number=data.draw_number,
            parent_draw_id=None,
            status="DRAFT",
            period_start=data.period_start,
            period_end=data.period_end,
            lender_party_id=lender_uuid,
            source_document_id=source_doc_uuid,
            created_at=utc_now(),
        )
        self.db.add(draw)
        self.db.flush()

        # Add initial lines
        for l_in in data.lines:
            b_line = self.db.get(BudgetLine, uuid.UUID(l_in.budget_line_id))
            if not b_line:
                raise NotFoundException(message=f"Budget line {l_in.budget_line_id} not found.")

            d_line = DrawLine(
                id=generate_uuid(),
                draw_id=draw.id,
                budget_line_id=b_line.id,
                requested_amount=l_in.requested_amount,
                recommended_amount=0,
                approved_amount=0,
                funded_amount=0,
                reason=l_in.reason,
                evidence_status=l_in.evidence_status,
                created_at=utc_now(),
            )
            self.db.add(d_line)

        # Populate default standard requirements checklist
        std_reqs = [
            ("Contractor Lien Waiver", "LIEN_WAIVER"),
            ("AIA G702 / G703 Application", "INVOICE"),
            ("Architect Progress Inspection", "INSPECTION"),
        ]
        for title, r_type in std_reqs:
            req = DrawRequirement(
                id=generate_uuid(),
                draw_id=draw.id,
                title=title,
                requirement_type=r_type,
                status="MISSING",
                created_at=utc_now(),
            )
            self.db.add(req)

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="DRAW_DRAFT_CREATED",
            entity_type="Draw",
            entity_id=draw.id,
            new_value={"draw_number": draw.draw_number, "line_count": len(data.lines)},
            rationale="User created draw draft",
        )
        return draw

    def get_draw(self, user: User, draw_id: uuid.UUID) -> Draw:
        draw = self.db.get(Draw, draw_id)
        if not draw or draw.organization_id != user.organization_id:
            raise NotFoundException(message="Draw not found.")
        return draw

    def update_draw_lines(
        self, user: User, draw_id: uuid.UUID, data: UpdateDrawLinesRequest
    ) -> list[DrawLine]:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can update draw lines.")

        draw = self.get_draw(user, draw_id)
        if draw.status != "DRAFT":
            raise InvalidStateTransitionException(
                message=f"Cannot edit lines for draw in status '{draw.status}'. Must be in 'DRAFT'."
            )

        # Replace or update draw lines
        existing_lines = self.db.scalars(
            select(DrawLine).where(DrawLine.draw_id == draw.id)
        ).all()
        for el in existing_lines:
            self.db.delete(el)
        self.db.flush()

        new_lines = []
        for l_in in data.lines:
            b_line = self.db.get(BudgetLine, uuid.UUID(l_in.budget_line_id))
            if not b_line:
                raise NotFoundException(message=f"Budget line {l_in.budget_line_id} not found.")

            d_line = DrawLine(
                id=generate_uuid(),
                draw_id=draw.id,
                budget_line_id=b_line.id,
                requested_amount=l_in.requested_amount,
                recommended_amount=0,
                approved_amount=0,
                funded_amount=0,
                reason=l_in.reason,
                evidence_status=l_in.evidence_status,
                created_at=utc_now(),
            )
            self.db.add(d_line)
            new_lines.append(d_line)

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=draw.project_id,
            actor_id=user.id,
            action="DRAW_LINES_UPDATED",
            entity_type="Draw",
            entity_id=draw.id,
            new_value={"line_count": len(new_lines)},
            rationale="User updated draw lines",
        )
        return new_lines

    # ---------------------------------------------------------
    # 2. WORK VERIFICATION (PM) & COST VERIFICATION (CFO)
    # ---------------------------------------------------------
    def verify_work(self, user: User, draw_id: uuid.UUID, data: VerifyWorkRequest) -> Draw:
        if user.role not in ["PM", "OWNER"]:
            raise ForbiddenException(message="Only PM or Owner can verify progress and work for a draw.")

        draw = self.get_draw(user, draw_id)

        # Mark inspection requirement as VERIFIED if present
        insp_req = self.db.scalars(
            select(DrawRequirement).where(
                DrawRequirement.draw_id == draw.id,
                DrawRequirement.requirement_type == "INSPECTION",
            )
        ).first()
        if insp_req:
            insp_req.status = "VERIFIED"

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=draw.project_id,
            actor_id=user.id,
            action="DRAW_WORK_VERIFIED",
            entity_type="Draw",
            entity_id=draw.id,
            new_value={"notes": data.progress_notes},
            rationale="PM verified physical progress",
        )
        return draw

    def verify_cost(self, user: User, draw_id: uuid.UUID, data: VerifyCostRequest) -> Draw:
        if user.role not in ["CFO", "OWNER"]:
            raise ForbiddenException(message="Only CFO or Owner can verify cost and prior payment.")

        draw = self.get_draw(user, draw_id)

        # Mark invoice requirement as VERIFIED if present
        inv_req = self.db.scalars(
            select(DrawRequirement).where(
                DrawRequirement.draw_id == draw.id,
                DrawRequirement.requirement_type == "INVOICE",
            )
        ).first()
        if inv_req:
            inv_req.status = "VERIFIED"

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=draw.project_id,
            actor_id=user.id,
            action="DRAW_COST_VERIFIED",
            entity_type="Draw",
            entity_id=draw.id,
            new_value={"notes": data.cost_notes, "prior_payment_verified": data.prior_payment_verified},
            rationale="CFO verified cost and accounting backup",
        )
        return draw

    # ---------------------------------------------------------
    # 3. PACKET & SUBMISSION
    # ---------------------------------------------------------
    def get_draw_packet(self, user: User, draw_id: uuid.UUID) -> DrawPacketResponse:
        draw = self.get_draw(user, draw_id)
        lines = self.db.scalars(select(DrawLine).where(DrawLine.draw_id == draw.id)).all()
        reqs = self.db.scalars(select(DrawRequirement).where(DrawRequirement.draw_id == draw.id)).all()

        tot_req = sum(line.requested_amount for line in lines)
        tot_rec = sum(line.recommended_amount for line in lines)
        tot_app = sum(line.approved_amount for line in lines)
        tot_fund = sum(line.funded_amount for line in lines)

        all_complete = all(r.status in ["VERIFIED", "WAIVED", "RECEIVED"] for r in reqs) if reqs else True

        portal_summary: dict[str, str | int] = {
            "draw_number": draw.draw_number,
            "period": f"{draw.period_start} to {draw.period_end}",
            "requested_total": tot_req,
            "line_count": len(lines),
            "status": draw.status,
        }

        return DrawPacketResponse(
            draw_id=str(draw.id),
            draw_number=draw.draw_number,
            status=draw.status,
            total_requested=tot_req,
            total_recommended=tot_rec,
            total_approved=tot_app,
            total_funded=tot_fund,
            requirements=[
                DrawRequirementRead(
                    id=str(r.id),
                    draw_id=str(r.draw_id),
                    title=r.title,
                    requirement_type=r.requirement_type,
                    status=r.status,
                    document_id=str(r.document_id) if r.document_id else None,
                    created_at=r.created_at.isoformat(),
                )
                for r in reqs
            ],
            checklist_complete=all_complete,
            portal_entry_summary=portal_summary,
        )

    def mark_submitted(self, user: User, draw_id: uuid.UUID) -> Draw:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owners can record lender portal submission.")

        draw = self.get_draw(user, draw_id)
        if draw.status not in ["DRAFT", "UNDER_REVIEW"]:
            raise InvalidStateTransitionException(
                message=f"Cannot submit draw in state '{draw.status}'. Expected 'DRAFT' or 'UNDER_REVIEW'."
            )

        draw.status = "SUBMITTED"
        draw.submitted_at = utc_now()
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=draw.project_id,
            actor_id=user.id,
            action="DRAW_SUBMITTED",
            entity_type="Draw",
            entity_id=draw.id,
            new_value={"status": "SUBMITTED", "submitted_at": str(draw.submitted_at)},
            rationale="Owner marked submission in lender portal",
        )
        return draw

    # ---------------------------------------------------------
    # 4. LENDER DECISION & CONDITIONS RESUBMISSION
    # ---------------------------------------------------------
    def record_lender_decision(
        self, user: User, draw_id: uuid.UUID, data: LenderDecisionRequest
    ) -> Draw:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can record lender decisions.")

        draw = self.get_draw(user, draw_id)
        if draw.status not in ["SUBMITTED", "UNDER_REVIEW"]:
            raise InvalidStateTransitionException(
                message=f"Cannot record lender decision for draw in state '{draw.status}'. Expected 'SUBMITTED' or 'UNDER_REVIEW'."
            )

        dec = data.decision.upper()
        if dec not in ["APPROVED", "PARTIALLY_APPROVED", "REJECTED"]:
            raise ValidationFailedException(message="Decision must be APPROVED, PARTIALLY_APPROVED, or REJECTED.")

        # Update lines with approved amounts
        lines = self.db.scalars(select(DrawLine).where(DrawLine.draw_id == draw.id)).all()
        line_map = {str(dline.budget_line_id): dline for dline in lines}

        for dl in data.line_decisions:
            if dl.budget_line_id in line_map:
                target_line = line_map[dl.budget_line_id]
                target_line.recommended_amount = dl.recommended_amount
                target_line.approved_amount = dl.approved_amount
                if dl.reason:
                    target_line.reason = dl.reason

        draw.status = dec
        if dec in ["APPROVED", "PARTIALLY_APPROVED"]:
            draw.approved_at = utc_now()
        else:
            draw.rejected_at = utc_now()

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=draw.project_id,
            actor_id=user.id,
            action="DRAW_LENDER_DECISION_RECORDED",
            entity_type="Draw",
            entity_id=draw.id,
            new_value={"status": draw.status, "reason": data.reason},
            rationale=data.reason or f"Recorded lender decision: {dec}",
        )
        return draw

    def create_child_revision(
        self, user: User, draw_id: uuid.UUID, data: DrawRevisionRequest
    ) -> Draw:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owners can create child draw revisions.")

        parent_draw = self.get_draw(user, draw_id)

        # Child revision must retain parent_draw_id
        child_draw = Draw(
            id=generate_uuid(),
            organization_id=user.organization_id,
            project_id=parent_draw.project_id,
            loan_id=parent_draw.loan_id,
            draw_number=data.new_draw_number,
            parent_draw_id=parent_draw.id,
            status="DRAFT",
            period_start=parent_draw.period_start,
            period_end=parent_draw.period_end,
            lender_party_id=parent_draw.lender_party_id,
            source_document_id=parent_draw.source_document_id,
            created_at=utc_now(),
        )
        self.db.add(child_draw)
        self.db.flush()

        # Copy lines or insert new lines
        lines_to_add = data.lines
        if not lines_to_add:
            # Copy parent lines
            parent_lines = self.db.scalars(
                select(DrawLine).where(DrawLine.draw_id == parent_draw.id)
            ).all()
            for pl in parent_lines:
                cl = DrawLine(
                    id=generate_uuid(),
                    draw_id=child_draw.id,
                    budget_line_id=pl.budget_line_id,
                    requested_amount=pl.requested_amount,
                    recommended_amount=0,
                    approved_amount=0,
                    funded_amount=0,
                    reason=pl.reason,
                    evidence_status=pl.evidence_status,
                    created_at=utc_now(),
                )
                self.db.add(cl)
        else:
            for l_in in lines_to_add:
                b_line = self.db.get(BudgetLine, uuid.UUID(l_in.budget_line_id))
                if not b_line:
                    raise NotFoundException(message=f"Budget line {l_in.budget_line_id} not found.")

                cl = DrawLine(
                    id=generate_uuid(),
                    draw_id=child_draw.id,
                    budget_line_id=b_line.id,
                    requested_amount=l_in.requested_amount,
                    recommended_amount=0,
                    approved_amount=0,
                    funded_amount=0,
                    reason=l_in.reason,
                    evidence_status=l_in.evidence_status,
                    created_at=utc_now(),
                )
                self.db.add(cl)

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=parent_draw.project_id,
            actor_id=user.id,
            action="DRAW_REVISION_CREATED",
            entity_type="Draw",
            entity_id=child_draw.id,
            new_value={"parent_draw_id": str(parent_draw.id), "new_draw_number": child_draw.draw_number},
            rationale=data.reason,
        )
        return child_draw

    # ---------------------------------------------------------
    # 5. UNALLOCATED FUNDING & CASH ALLOCATION
    # ---------------------------------------------------------
    def get_unallocated_funding(
        self, user: User, project_id: uuid.UUID
    ) -> list[UnallocatedFundingItem]:
        project = self._get_project_with_access(user, project_id)

        # Get cleared INFLOW transactions for project
        txs = self.db.scalars(
            select(FinancialTransaction).where(
                FinancialTransaction.project_id == project.id,
                FinancialTransaction.direction == "INFLOW",
                FinancialTransaction.cleared_status == "CLEARED",
            )
        ).all()

        items = []
        for tx in txs:
            allocated = self.db.scalar(
                select(func.coalesce(func.sum(DrawFunding.amount), 0)).where(
                    DrawFunding.transaction_id == tx.id
                )
            ) or 0
            unallocated = tx.amount - allocated
            if unallocated > 0:
                items.append(
                    UnallocatedFundingItem(
                        transaction_id=str(tx.id),
                        transaction_date=tx.transaction_date.isoformat(),
                        counterparty=tx.counterparty,
                        amount=tx.amount,
                        allocated_amount=allocated,
                        unallocated_amount=unallocated,
                    )
                )

        return items

    def allocate_draw_funding(
        self, user: User, draw_id: uuid.UUID, data: DrawFundingRequest
    ) -> list[DrawFunding]:
        if user.role not in ["CFO", "OWNER"]:
            raise ForbiddenException(message="Only CFO or Owner can allocate draw funding.")

        draw = self.get_draw(user, draw_id)
        if draw.status not in ["APPROVED", "PARTIALLY_APPROVED", "PARTIALLY_FUNDED"]:
            raise InvalidStateTransitionException(
                message=f"Cannot allocate funding to draw in state '{draw.status}'. Approved is required before funding."
            )

        created_fundings = []
        for item in data.allocations:
            tx = self.db.get(FinancialTransaction, uuid.UUID(item.transaction_id))
            if not tx:
                raise NotFoundException(message=f"Transaction {item.transaction_id} not found.")

            # Rule: cleared_status = CLEARED only! Otherwise 422 DRAW_NOT_FUNDABLE
            if tx.cleared_status != "CLEARED":
                raise DrawNotFundableException(
                    message=f"Transaction {tx.id} has cleared_status '{tx.cleared_status}'. Only CLEARED transactions can fund a draw."
                )

            # Check unallocated deposit balance
            allocated_so_far = self.db.scalar(
                select(func.coalesce(func.sum(DrawFunding.amount), 0)).where(
                    DrawFunding.transaction_id == tx.id
                )
            ) or 0
            if (allocated_so_far + item.amount) > tx.amount:
                raise DrawNotFundableException(
                    message=f"Allocation amount ({item.amount}) exceeds remaining deposit balance on transaction {tx.id}."
                )

            funding = DrawFunding(
                id=generate_uuid(),
                draw_id=draw.id,
                transaction_id=tx.id,
                amount=item.amount,
                funding_date=item.funding_date,
                created_at=utc_now(),
            )
            self.db.add(funding)
            created_fundings.append(funding)

        self.db.flush()

        # Update funded_amount on draw and its lines
        raw_funded = self.db.scalar(
            select(func.coalesce(func.sum(DrawFunding.amount), 0)).where(
                DrawFunding.draw_id == draw.id
            )
        ) or 0
        total_funded = int(raw_funded)

        # Calculate total approved on draw lines
        raw_approved = self.db.scalar(
            select(func.coalesce(func.sum(DrawLine.approved_amount), 0)).where(
                DrawLine.draw_id == draw.id
            )
        ) or 0
        total_approved = int(raw_approved)

        # Pro-rate or allocate funded_amount across draw lines
        lines = self.db.scalars(select(DrawLine).where(DrawLine.draw_id == draw.id)).all()
        rem_fund = total_funded
        for dline in lines:
            dline_funded = min(dline.approved_amount, rem_fund)
            dline.funded_amount = dline_funded
            rem_fund -= dline_funded

        # Lender threshold check: A draw becomes FUNDED only when total_funded >= total_approved
        if total_approved > 0 and total_funded >= total_approved:
            draw.status = "FUNDED"
        elif total_funded > 0:
            draw.status = "PARTIALLY_FUNDED"

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=draw.project_id,
            actor_id=user.id,
            action="DRAW_FUNDING_ALLOCATED",
            entity_type="Draw",
            entity_id=draw.id,
            new_value={"total_funded": total_funded, "status": draw.status},
            rationale="CFO allocated cleared deposits to draw",
        )
        return created_fundings
