import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.envelope import ResponseEnvelope
from app.db.models import User
from app.db.session import get_db
from app.modules.budgets.schemas import (
    BudgetCreate,
    BudgetLineRead,
    BudgetRead,
    ChangeOrderCreate,
    ChangeOrderLineRead,
    ChangeOrderRead,
    ChangeOrderRejectRequest,
    ContingencyMovementRead,
    ContingencyMovementRequest,
    CurrentBudgetResponse,
    LinkMilestoneRequest,
)
from app.modules.budgets.service import BudgetService

router = APIRouter(tags=["Budgets"])


@router.post("/projects/{pid}/budgets", response_model=ResponseEnvelope[BudgetRead])
async def create_budget_endpoint(
    pid: uuid.UUID,
    data: BudgetCreate,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = BudgetService(db)
    budget = service.create_draft_budget(user, pid, data)
    lines = service.get_budget_lines(user, budget.id)
    db.commit()

    return ResponseEnvelope(
        data=BudgetRead(
            id=str(budget.id),
            organization_id=str(budget.organization_id),
            project_id=str(budget.project_id),
            version_number=budget.version_number,
            status=budget.status,
            approved_by=str(budget.approved_by) if budget.approved_by else None,
            approved_at=budget.approved_at.isoformat() if budget.approved_at else None,
            total_original_amount=budget.total_original_amount,
            total_current_approved_amount=budget.total_current_approved_amount,
            version=budget.version,
            created_at=budget.created_at.isoformat(),
            lines=[
                BudgetLineRead(
                    id=str(line.id),
                    budget_id=str(line.budget_id),
                    parent_line_id=str(line.parent_line_id) if line.parent_line_id else None,
                    code=line.code,
                    name=line.name,
                    category=line.category,
                    original_amount=line.original_amount,
                    current_approved_amount=line.current_approved_amount,
                    is_draw_eligible=line.is_draw_eligible,
                    milestone_id=str(line.milestone_id) if line.milestone_id else None,
                    sort_order=line.sort_order,
                    created_at=line.created_at.isoformat(),
                )
                for line in lines
            ],
        )
    )


@router.get(
    "/projects/{pid}/budgets/current", response_model=ResponseEnvelope[CurrentBudgetResponse]
)
async def get_current_budget_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
):
    service = BudgetService(db)
    result = service.get_current_budget_view(user, pid)
    return ResponseEnvelope(data=result)


@router.get("/budgets/{id}/lines", response_model=ResponseEnvelope[list[BudgetLineRead]])
async def get_budget_lines_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
):
    service = BudgetService(db)
    lines = service.get_budget_lines(user, id)
    return ResponseEnvelope(
        data=[
            BudgetLineRead(
                id=str(line.id),
                budget_id=str(line.budget_id),
                parent_line_id=str(line.parent_line_id) if line.parent_line_id else None,
                code=line.code,
                name=line.name,
                category=line.category,
                original_amount=line.original_amount,
                current_approved_amount=line.current_approved_amount,
                is_draw_eligible=line.is_draw_eligible,
                milestone_id=str(line.milestone_id) if line.milestone_id else None,
                sort_order=line.sort_order,
                created_at=line.created_at.isoformat(),
            )
            for line in lines
        ]
    )


@router.post("/budgets/{id}/approve", response_model=ResponseEnvelope[BudgetRead])
async def approve_budget_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = BudgetService(db)
    budget = service.approve_budget(user, id)
    lines = service.get_budget_lines(user, budget.id)
    db.commit()

    return ResponseEnvelope(
        data=BudgetRead(
            id=str(budget.id),
            organization_id=str(budget.organization_id),
            project_id=str(budget.project_id),
            version_number=budget.version_number,
            status=budget.status,
            approved_by=str(budget.approved_by) if budget.approved_by else None,
            approved_at=budget.approved_at.isoformat() if budget.approved_at else None,
            total_original_amount=budget.total_original_amount,
            total_current_approved_amount=budget.total_current_approved_amount,
            version=budget.version,
            created_at=budget.created_at.isoformat(),
            lines=[
                BudgetLineRead(
                    id=str(line.id),
                    budget_id=str(line.budget_id),
                    parent_line_id=str(line.parent_line_id) if line.parent_line_id else None,
                    code=line.code,
                    name=line.name,
                    category=line.category,
                    original_amount=line.original_amount,
                    current_approved_amount=line.current_approved_amount,
                    is_draw_eligible=line.is_draw_eligible,
                    milestone_id=str(line.milestone_id) if line.milestone_id else None,
                    sort_order=line.sort_order,
                    created_at=line.created_at.isoformat(),
                )
                for line in lines
            ],
        )
    )


@router.post("/projects/{pid}/change-orders", response_model=ResponseEnvelope[ChangeOrderRead])
async def request_change_order_endpoint(
    pid: uuid.UUID,
    data: ChangeOrderCreate,
    user: User = Depends(require_role(["OWNER", "CFO", "GC"])),
    db: Session = Depends(get_db),
):
    service = BudgetService(db)
    co = service.request_change_order(user, pid, data)
    db.commit()

    return ResponseEnvelope(
        data=ChangeOrderRead(
            id=str(co.id),
            organization_id=str(co.organization_id),
            project_id=str(co.project_id),
            change_order_number=co.change_order_number,
            title=co.title,
            reason=co.reason,
            status=co.status,
            requested_amount=co.requested_amount,
            approved_amount=co.approved_amount,
            requested_by=str(co.requested_by),
            approved_by=str(co.approved_by) if co.approved_by else None,
            approved_at=co.approved_at.isoformat() if co.approved_at else None,
            created_at=co.created_at.isoformat(),
            lines=[
                ChangeOrderLineRead(
                    id=str(coline.id),
                    change_order_id=str(coline.change_order_id),
                    budget_line_id=str(coline.budget_line_id),
                    amount=coline.amount,
                    description=coline.description,
                    created_at=coline.created_at.isoformat(),
                )
                for coline in co.lines
            ],
        )
    )


@router.post("/change-orders/{id}/approve", response_model=ResponseEnvelope[ChangeOrderRead])
async def approve_change_order_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = BudgetService(db)
    co = service.approve_change_order(user, id)
    db.commit()

    return ResponseEnvelope(
        data=ChangeOrderRead(
            id=str(co.id),
            organization_id=str(co.organization_id),
            project_id=str(co.project_id),
            change_order_number=co.change_order_number,
            title=co.title,
            reason=co.reason,
            status=co.status,
            requested_amount=co.requested_amount,
            approved_amount=co.approved_amount,
            requested_by=str(co.requested_by),
            approved_by=str(co.approved_by) if co.approved_by else None,
            approved_at=co.approved_at.isoformat() if co.approved_at else None,
            created_at=co.created_at.isoformat(),
            lines=[
                ChangeOrderLineRead(
                    id=str(coline.id),
                    change_order_id=str(coline.change_order_id),
                    budget_line_id=str(coline.budget_line_id),
                    amount=coline.amount,
                    description=coline.description,
                    created_at=coline.created_at.isoformat(),
                )
                for coline in co.lines
            ],
        )
    )


@router.post("/change-orders/{id}/reject", response_model=ResponseEnvelope[ChangeOrderRead])
async def reject_change_order_endpoint(
    id: uuid.UUID,
    data: ChangeOrderRejectRequest,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = BudgetService(db)
    co = service.reject_change_order(user, id, data)
    db.commit()

    return ResponseEnvelope(
        data=ChangeOrderRead(
            id=str(co.id),
            organization_id=str(co.organization_id),
            project_id=str(co.project_id),
            change_order_number=co.change_order_number,
            title=co.title,
            reason=co.reason,
            status=co.status,
            requested_amount=co.requested_amount,
            approved_amount=co.approved_amount,
            requested_by=str(co.requested_by),
            approved_by=str(co.approved_by) if co.approved_by else None,
            approved_at=co.approved_at.isoformat() if co.approved_at else None,
            created_at=co.created_at.isoformat(),
            lines=[
                ChangeOrderLineRead(
                    id=str(coline.id),
                    change_order_id=str(coline.change_order_id),
                    budget_line_id=str(coline.budget_line_id),
                    amount=coline.amount,
                    description=coline.description,
                    created_at=coline.created_at.isoformat(),
                )
                for coline in co.lines
            ],
        )
    )


@router.post(
    "/projects/{pid}/contingency-movements",
    response_model=ResponseEnvelope[ContingencyMovementRead],
)
async def move_contingency_endpoint(
    pid: uuid.UUID,
    data: ContingencyMovementRequest,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = BudgetService(db)
    cm = service.move_contingency(user, pid, data)
    db.commit()

    return ResponseEnvelope(
        data=ContingencyMovementRead(
            id=str(cm.id),
            organization_id=str(cm.organization_id),
            project_id=str(cm.project_id),
            from_budget_line_id=str(cm.from_budget_line_id),
            to_budget_line_id=str(cm.to_budget_line_id),
            amount=cm.amount,
            reason=cm.reason,
            approved_by=str(cm.approved_by),
            approved_at=cm.approved_at.isoformat(),
            created_at=cm.created_at.isoformat(),
        )
    )


@router.patch("/budget-lines/{id}/milestone", response_model=ResponseEnvelope[BudgetLineRead])
async def link_budget_line_milestone_endpoint(
    id: uuid.UUID,
    data: LinkMilestoneRequest,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
):
    service = BudgetService(db)
    line = service.link_budget_line_milestone(user, id, data)
    db.commit()

    return ResponseEnvelope(
        data=BudgetLineRead(
            id=str(line.id),
            budget_id=str(line.budget_id),
            parent_line_id=str(line.parent_line_id) if line.parent_line_id else None,
            code=line.code,
            name=line.name,
            category=line.category,
            original_amount=line.original_amount,
            current_approved_amount=line.current_approved_amount,
            is_draw_eligible=line.is_draw_eligible,
            milestone_id=str(line.milestone_id) if line.milestone_id else None,
            sort_order=line.sort_order,
            created_at=line.created_at.isoformat(),
        )
    )
