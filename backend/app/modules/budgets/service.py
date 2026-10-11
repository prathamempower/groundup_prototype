import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import (
    ContingencyExceededException,
    ForbiddenException,
    InvalidStateTransitionException,
    NotFoundException,
    ValidationFailedException,
)
from app.db.audit import record_audit_event
from app.db.models import (
    Budget,
    BudgetLine,
    ChangeOrder,
    ChangeOrderLine,
    ContingencyMovement,
    DrawLine,
    Project,
    ProjectMilestone,
    SpendRecord,
    User,
    generate_uuid,
    utc_now,
)
from app.modules.budgets.schemas import (
    BudgetCreate,
    BudgetLineCurrentView,
    ChangeOrderCreate,
    ChangeOrderRejectRequest,
    ContingencyMovementRequest,
    CurrentBudgetResponse,
    LinkMilestoneRequest,
)


class BudgetService:
    def __init__(self, db: Session):
        self.db = db

    def _get_project_with_access(self, user: User, project_id: uuid.UUID) -> Project:
        project = self.db.get(Project, project_id)
        if not project or project.organization_id != user.organization_id:
            raise NotFoundException(message="Project not found.")
        return project

    def create_draft_budget(self, user: User, project_id: uuid.UUID, data: BudgetCreate) -> Budget:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owners and CFOs can create a budget.")

        project = self._get_project_with_access(user, project_id)

        if not data.lines:
            raise ValidationFailedException(message="A budget must contain at least one line item.")

        # Determine next version number
        latest_version = (
            self.db.scalar(
                select(func.max(Budget.version_number)).where(
                    Budget.project_id == project.id,
                    Budget.organization_id == user.organization_id,
                )
            )
            or 0
        )
        new_version_number = latest_version + 1

        # Check unique line codes within this draft
        codes = [line.code for line in data.lines]
        if len(codes) != len(set(codes)):
            raise ValidationFailedException(
                message="Budget line codes must be unique within the budget."
            )

        budget = Budget(
            id=generate_uuid(),
            organization_id=user.organization_id,
            project_id=project.id,
            version_number=new_version_number,
            status="DRAFT",
            total_original_amount=0,
            total_current_approved_amount=0,
            version=1,
            created_at=utc_now(),
        )
        self.db.add(budget)
        self.db.flush()

        code_to_line_map: dict[str, BudgetLine] = {}

        # 1. First pass: Create parent lines / lines without parent_line_code
        for l_in in data.lines:
            milestone_uuid = uuid.UUID(l_in.milestone_id) if l_in.milestone_id else None
            if milestone_uuid:
                ms = self.db.get(ProjectMilestone, milestone_uuid)
                if not ms or ms.project_id != project.id:
                    raise ValidationFailedException(
                        message=f"Milestone {l_in.milestone_id} does not exist in project."
                    )

            line = BudgetLine(
                id=generate_uuid(),
                budget_id=budget.id,
                parent_line_id=None,
                code=l_in.code,
                name=l_in.name,
                category=l_in.category,
                original_amount=l_in.original_amount,
                current_approved_amount=l_in.original_amount,
                is_draw_eligible=l_in.is_draw_eligible,
                milestone_id=milestone_uuid,
                sort_order=l_in.sort_order,
                created_at=utc_now(),
            )
            self.db.add(line)
            code_to_line_map[l_in.code] = line

        self.db.flush()

        # 2. Second pass: Link parent line IDs and validate hierarchy
        total_original = 0
        for l_in in data.lines:
            line = code_to_line_map[l_in.code]
            if l_in.parent_line_code:
                if l_in.parent_line_code not in code_to_line_map:
                    raise ValidationFailedException(
                        message=f"Parent line code '{l_in.parent_line_code}' not found in budget lines."
                    )
                parent_line = code_to_line_map[l_in.parent_line_code]
                if parent_line.id == line.id:
                    raise ValidationFailedException(
                        message="A budget line cannot be its own parent."
                    )
                line.parent_line_id = parent_line.id

            total_original += line.original_amount

        budget.total_original_amount = total_original
        budget.total_current_approved_amount = total_original
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="BUDGET_DRAFT_CREATED",
            entity_type="Budget",
            entity_id=budget.id,
            new_value={
                "version_number": budget.version_number,
                "total_original_amount": budget.total_original_amount,
                "line_count": len(data.lines),
            },
            rationale="User created budget draft",
        )

        return budget

    def get_budget_lines(self, user: User, budget_id: uuid.UUID) -> list[BudgetLine]:
        budget = self.db.get(Budget, budget_id)
        if not budget or budget.organization_id != user.organization_id:
            raise NotFoundException(message="Budget not found.")

        stmt = (
            select(BudgetLine)
            .where(BudgetLine.budget_id == budget.id)
            .order_by(BudgetLine.sort_order, BudgetLine.code)
        )
        return list(self.db.scalars(stmt).all())

    def approve_budget(self, user: User, budget_id: uuid.UUID) -> Budget:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owners can approve a budget baseline.")

        budget = self.db.get(Budget, budget_id)
        if not budget or budget.organization_id != user.organization_id:
            raise NotFoundException(message="Budget not found.")

        if budget.status == "APPROVED":
            return budget
        if budget.status != "DRAFT":
            raise InvalidStateTransitionException(
                message=f"Cannot approve budget in state '{budget.status}'. Expected 'DRAFT'."
            )

        # Baseline approval: validate hierarchy totals
        lines = self.get_budget_lines(user, budget_id)
        parent_children: dict[uuid.UUID, list[BudgetLine]] = {}
        for bline in lines:
            if bline.parent_line_id:
                parent_children.setdefault(bline.parent_line_id, []).append(bline)

        # For every parent line, verify children sum == parent amount (if children exist)
        for parent_id, children in parent_children.items():
            parent = next((bline for bline in lines if bline.id == parent_id), None)
            if parent:
                children_sum = sum(c.original_amount for c in children)
                if children_sum != parent.original_amount:
                    raise ValidationFailedException(
                        message=f"Parent line '{parent.code}' amount ({parent.original_amount}) does not equal sum of its child lines ({children_sum})."
                    )

        # If there are prior approved budgets for this project, mark them SUPERSEDED
        prior_approved = self.db.scalars(
            select(Budget).where(
                Budget.project_id == budget.project_id,
                Budget.organization_id == user.organization_id,
                Budget.status == "APPROVED",
                Budget.id != budget.id,
            )
        ).all()
        for b in prior_approved:
            b.status = "SUPERSEDED"

        budget.status = "APPROVED"
        budget.approved_by = user.id
        budget.approved_at = utc_now()
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=budget.project_id,
            actor_id=user.id,
            action="BUDGET_APPROVED",
            entity_type="Budget",
            entity_id=budget.id,
            new_value={
                "version_number": budget.version_number,
                "status": "APPROVED",
                "total_original_amount": budget.total_original_amount,
            },
            rationale="Owner approved baseline budget",
        )

        return budget

    def get_current_budget_view(self, user: User, project_id: uuid.UUID) -> CurrentBudgetResponse:
        self._get_project_with_access(user, project_id)

        # Fetch latest approved budget; if none approved, get latest draft
        budget = self.db.scalars(
            select(Budget)
            .where(
                Budget.project_id == project_id,
                Budget.organization_id == user.organization_id,
                Budget.status == "APPROVED",
            )
            .order_by(Budget.version_number.desc())
        ).first()

        if not budget:
            budget = self.db.scalars(
                select(Budget)
                .where(
                    Budget.project_id == project_id,
                    Budget.organization_id == user.organization_id,
                )
                .order_by(Budget.version_number.desc())
            ).first()

        if not budget:
            raise NotFoundException(message="No budget found for this project.")

        lines = self.get_budget_lines(user, budget.id)

        line_views: list[BudgetLineCurrentView] = []
        tot_orig = 0
        tot_curr = 0
        tot_spend = 0
        tot_committed = 0
        tot_draw_req = 0
        tot_draw_app = 0
        tot_draw_fund = 0
        tot_remaining_exp = 0
        has_any_overrun = False

        for bline in lines:
            # Aggregate spend from SpendRecord
            spend_sum = (
                self.db.scalar(
                    select(func.coalesce(func.sum(SpendRecord.amount), 0)).where(
                        SpendRecord.budget_line_id == bline.id,
                        SpendRecord.status.in_(["VERIFIED", "IMPORTED", "NEEDS_REVIEW"]),
                    )
                )
                or 0
            )

            # Aggregate draw lines
            draw_agg = self.db.execute(
                select(
                    func.coalesce(func.sum(DrawLine.requested_amount), 0),
                    func.coalesce(func.sum(DrawLine.approved_amount), 0),
                    func.coalesce(func.sum(DrawLine.funded_amount), 0),
                ).where(DrawLine.budget_line_id == bline.id)
            ).one()

            draw_req = int(draw_agg[0])
            draw_app = int(draw_agg[1])
            draw_fund = int(draw_agg[2])

            committed = max(spend_sum, draw_app)
            remaining_exposure = bline.current_approved_amount - committed
            is_overrun = committed > bline.current_approved_amount

            if is_overrun:
                has_any_overrun = True

            tot_orig += bline.original_amount
            tot_curr += bline.current_approved_amount
            tot_spend += spend_sum
            tot_committed += committed
            tot_draw_req += draw_req
            tot_draw_app += draw_app
            tot_draw_fund += draw_fund
            tot_remaining_exp += remaining_exposure

            line_views.append(
                BudgetLineCurrentView(
                    id=str(bline.id),
                    code=bline.code,
                    name=bline.name,
                    category=bline.category,
                    parent_line_id=str(bline.parent_line_id) if bline.parent_line_id else None,
                    original_amount=bline.original_amount,
                    current_approved_amount=bline.current_approved_amount,
                    spend_amount=spend_sum,
                    committed_amount=committed,
                    draw_requested_amount=draw_req,
                    draw_approved_amount=draw_app,
                    draw_funded_amount=draw_fund,
                    remaining_exposure=remaining_exposure,
                    is_overrun=is_overrun,
                    is_draw_eligible=bline.is_draw_eligible,
                    milestone_id=str(bline.milestone_id) if bline.milestone_id else None,
                )
            )

        return CurrentBudgetResponse(
            budget_id=str(budget.id),
            version_number=budget.version_number,
            status=budget.status,
            total_original_amount=tot_orig,
            total_current_approved_amount=tot_curr,
            total_spend_amount=tot_spend,
            total_committed_amount=tot_committed,
            total_draw_requested_amount=tot_draw_req,
            total_draw_approved_amount=tot_draw_app,
            total_draw_funded_amount=tot_draw_fund,
            total_remaining_exposure=tot_remaining_exp,
            has_overrun=has_any_overrun,
            lines=line_views,
        )

    def request_change_order(
        self, user: User, project_id: uuid.UUID, data: ChangeOrderCreate
    ) -> ChangeOrder:
        if user.role not in ["OWNER", "CFO", "GC"]:
            raise ForbiddenException(message="Role not permitted to request change order.")

        project = self._get_project_with_access(user, project_id)

        if not data.lines:
            raise ValidationFailedException(
                message="Change order must specify at least one line item."
            )

        # Compute total requested amount
        tot_requested = sum(coline.amount for coline in data.lines)

        # Validate budget line IDs exist in project
        for l_in in data.lines:
            b_line = self.db.get(BudgetLine, uuid.UUID(l_in.budget_line_id))
            if not b_line:
                raise NotFoundException(message=f"Budget line {l_in.budget_line_id} not found.")

        # Generate change order number if not specified
        co_number = data.change_order_number
        if not co_number:
            co_count = (
                self.db.scalar(
                    select(func.count(ChangeOrder.id)).where(
                        ChangeOrder.project_id == project.id,
                        ChangeOrder.organization_id == user.organization_id,
                    )
                )
                or 0
            )
            co_number = f"CO-{co_count + 1:03d}"

        # Status: OWNER and CFO create SUBMITTED directly, GC creates SUBMITTED
        co = ChangeOrder(
            id=generate_uuid(),
            organization_id=user.organization_id,
            project_id=project.id,
            change_order_number=co_number,
            title=data.title,
            reason=data.reason,
            status="SUBMITTED",
            requested_amount=tot_requested,
            requested_by=user.id,
            created_at=utc_now(),
        )
        self.db.add(co)
        self.db.flush()

        for l_in in data.lines:
            co_line = ChangeOrderLine(
                id=generate_uuid(),
                change_order_id=co.id,
                budget_line_id=uuid.UUID(l_in.budget_line_id),
                amount=l_in.amount,
                description=l_in.description,
                created_at=utc_now(),
            )
            self.db.add(co_line)

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="CHANGE_ORDER_REQUESTED",
            entity_type="ChangeOrder",
            entity_id=co.id,
            new_value={
                "change_order_number": co.change_order_number,
                "requested_amount": tot_requested,
                "line_count": len(data.lines),
            },
            rationale=data.reason,
        )

        return co

    def approve_change_order(self, user: User, change_order_id: uuid.UUID) -> ChangeOrder:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owners can approve change orders.")

        co = self.db.get(ChangeOrder, change_order_id)
        if not co or co.organization_id != user.organization_id:
            raise NotFoundException(message="Change order not found.")

        if co.status == "APPROVED":
            return co
        if co.status not in ["SUBMITTED", "DRAFT"]:
            raise InvalidStateTransitionException(
                message=f"Cannot approve change order in state '{co.status}'. Expected 'SUBMITTED' or 'DRAFT'."
            )

        # Baseline must never be touched! We update current_approved_amount on budget lines
        co_lines = self.db.scalars(
            select(ChangeOrderLine).where(ChangeOrderLine.change_order_id == co.id)
        ).all()

        budget: Budget | None = None
        for cl in co_lines:
            b_line = self.db.get(BudgetLine, cl.budget_line_id)
            if b_line:
                # Update current approved amount only
                b_line.current_approved_amount += cl.amount
                if not budget:
                    budget = self.db.get(Budget, b_line.budget_id)

        if budget:
            budget.total_current_approved_amount += co.requested_amount

        co.status = "APPROVED"
        co.approved_amount = co.requested_amount
        co.approved_by = user.id
        co.approved_at = utc_now()
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=co.project_id,
            actor_id=user.id,
            action="CHANGE_ORDER_APPROVED",
            entity_type="ChangeOrder",
            entity_id=co.id,
            new_value={
                "change_order_number": co.change_order_number,
                "approved_amount": co.approved_amount,
                "status": "APPROVED",
            },
            rationale="Owner approved change order",
        )

        return co

    def reject_change_order(
        self, user: User, change_order_id: uuid.UUID, data: ChangeOrderRejectRequest
    ) -> ChangeOrder:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owners can reject change orders.")

        co = self.db.get(ChangeOrder, change_order_id)
        if not co or co.organization_id != user.organization_id:
            raise NotFoundException(message="Change order not found.")

        if co.status != "SUBMITTED":
            raise InvalidStateTransitionException(
                message=f"Cannot reject change order in state '{co.status}'. Expected 'SUBMITTED'."
            )

        co.status = "REJECTED"
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=co.project_id,
            actor_id=user.id,
            action="CHANGE_ORDER_REJECTED",
            entity_type="ChangeOrder",
            entity_id=co.id,
            new_value={"status": "REJECTED", "reason": data.reason},
            rationale=data.reason,
        )

        return co

    def move_contingency(
        self, user: User, project_id: uuid.UUID, data: ContingencyMovementRequest
    ) -> ContingencyMovement:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owners can authorize contingency movements.")

        project = self._get_project_with_access(user, project_id)

        from_id = uuid.UUID(data.from_budget_line_id)
        to_id = uuid.UUID(data.to_budget_line_id)

        if from_id == to_id:
            raise ValidationFailedException(
                message="Source and target budget lines cannot be identical."
            )

        from_line = self.db.get(BudgetLine, from_id)
        to_line = self.db.get(BudgetLine, to_id)

        if not from_line or not to_line:
            raise NotFoundException(message="Budget line not found.")

        # Check that both lines belong to the project's current active budget
        from_budget = self.db.get(Budget, from_line.budget_id)
        to_budget = self.db.get(Budget, to_line.budget_id)
        if (
            not from_budget
            or not to_budget
            or from_budget.project_id != project.id
            or to_budget.project_id != project.id
        ):
            raise ValidationFailedException(message="Budget lines do not belong to this project.")

        # Available-balance check on from_line:
        # available = current_approved_amount - max(spend, draw_approved)
        spend_sum = (
            self.db.scalar(
                select(func.coalesce(func.sum(SpendRecord.amount), 0)).where(
                    SpendRecord.budget_line_id == from_line.id,
                    SpendRecord.status.in_(["VERIFIED", "IMPORTED", "NEEDS_REVIEW"]),
                )
            )
            or 0
        )
        draw_app = (
            self.db.scalar(
                select(func.coalesce(func.sum(DrawLine.approved_amount), 0)).where(
                    DrawLine.budget_line_id == from_line.id
                )
            )
            or 0
        )
        committed = max(spend_sum, draw_app)
        available_balance = from_line.current_approved_amount - committed

        if data.amount > available_balance:
            raise ContingencyExceededException(
                message=f"Contingency movement amount ({data.amount}) exceeds available balance ({available_balance}) on source line '{from_line.code}'."
            )

        # Baseline original_amount remains unchanged!
        # Adjust current_approved_amount on both lines:
        from_line.current_approved_amount -= data.amount
        to_line.current_approved_amount += data.amount

        movement = ContingencyMovement(
            id=generate_uuid(),
            organization_id=user.organization_id,
            project_id=project.id,
            from_budget_line_id=from_line.id,
            to_budget_line_id=to_line.id,
            amount=data.amount,
            reason=data.reason,
            approved_by=user.id,
            approved_at=utc_now(),
            created_at=utc_now(),
        )
        self.db.add(movement)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="CONTINGENCY_MOVEMENT_APPROVED",
            entity_type="ContingencyMovement",
            entity_id=movement.id,
            new_value={
                "from_line": from_line.code,
                "to_line": to_line.code,
                "amount": movement.amount,
                "reason": movement.reason,
            },
            rationale=movement.reason,
        )

        return movement

    def link_budget_line_milestone(
        self, user: User, line_id: uuid.UUID, data: LinkMilestoneRequest
    ) -> BudgetLine:
        if user.role not in ["OWNER", "CFO", "PM"]:
            raise ForbiddenException(message="Role not permitted to link milestone.")

        line = self.db.get(BudgetLine, line_id)
        if not line:
            raise NotFoundException(message="Budget line not found.")

        budget = self.db.get(Budget, line.budget_id)
        if not budget or budget.organization_id != user.organization_id:
            raise NotFoundException(message="Budget line not found.")

        ms_uuid = uuid.UUID(data.milestone_id) if data.milestone_id else None
        if ms_uuid:
            ms = self.db.get(ProjectMilestone, ms_uuid)
            if not ms or ms.project_id != budget.project_id:
                raise ValidationFailedException(
                    message="Milestone does not belong to this project."
                )

        prev_ms = str(line.milestone_id) if line.milestone_id else None
        line.milestone_id = ms_uuid
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=budget.project_id,
            actor_id=user.id,
            action="BUDGET_LINE_MILESTONE_LINKED",
            entity_type="BudgetLine",
            entity_id=line.id,
            previous_value={"milestone_id": prev_ms},
            new_value={"milestone_id": str(ms_uuid) if ms_uuid else None},
            rationale="User linked budget line to milestone",
        )

        return line
