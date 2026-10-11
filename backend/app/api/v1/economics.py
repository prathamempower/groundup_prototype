import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.envelope import ResponseEnvelope
from app.core.errors import NotFoundException
from app.db.models import Project, ProjectMember, User
from app.db.session import get_db
from app.modules.economics.schemas import (
    CloseoutApprovalRequest,
    DispositionImportRequest,
    DispositionRead,
    FinancialPlanCreate,
    FinancialPlanRead,
    InvestorContributionCreate,
    InvestorContributionRead,
    InvestorDistributionCreate,
    InvestorDistributionRead,
    InvestorProjectView,
    InvestorUpdateCreate,
    InvestorUpdatePatch,
    InvestorUpdatePublishRequest,
    InvestorUpdateRead,
    InvestorUpdateWithdrawRequest,
    PostCloseoutAdjustmentRead,
    PostCloseoutAdjustmentRequest,
    ProFormaLineItemRead,
    ProjectEconomicsRead,
)
from app.modules.economics.service import EconomicsService

router = APIRouter(tags=["Economics & Investors"])

# In-memory storage for active investor update drafts & published snapshots
# Keyed by update_id string
_INVESTOR_UPDATES: dict[str, InvestorUpdateRead] = {}


# ---------------------------------------------------------
# Economics & Pro Forma
# ---------------------------------------------------------
@router.get(
    "/projects/{pid}/economics",
    response_model=ResponseEnvelope[ProjectEconomicsRead],
)
async def get_project_economics_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    econ = service.get_project_economics(user, pid)
    return ResponseEnvelope(data=econ)


@router.post(
    "/projects/{pid}/financial-plans",
    response_model=ResponseEnvelope[FinancialPlanRead],
)
async def create_financial_plan_endpoint(
    pid: uuid.UUID,
    data: FinancialPlanCreate,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    plan = service.create_financial_plan(user, pid, data)
    db.commit()

    lines: list[ProFormaLineItemRead] = []
    if plan.payload and "lines" in plan.payload:
        for idx, item in enumerate(plan.payload["lines"]):
            orig = item.get("original_plan_amount", 0)
            cur = item.get("current_forecast_amount", orig)
            lines.append(
                ProFormaLineItemRead(
                    id=f"pfl-{idx}",
                    category=item.get("category", "SUMMARY"),
                    line_name=item.get("line_name", ""),
                    original_plan_amount=orig,
                    current_forecast_amount=cur,
                    actual_cleared_amount=item.get("actual_cleared_amount"),
                    basis=item.get("basis", "ESTIMATED"),
                    variance_amount=cur - orig,
                    variance_rationale=item.get("variance_rationale"),
                    notes=item.get("notes"),
                )
            )

    return ResponseEnvelope(
        data=FinancialPlanRead(
            id=str(plan.id),
            organization_id=str(plan.organization_id),
            project_id=str(plan.project_id),
            version_number=plan.version_number,
            plan_type=plan.plan_type,
            projected_revenue=plan.projected_revenue,
            projected_cost=plan.projected_cost,
            target_irr=float(plan.target_irr) if plan.target_irr is not None else None,
            target_equity_multiple=float(plan.target_equity_multiple) if plan.target_equity_multiple is not None else None,
            is_active=plan.is_active,
            created_at=plan.created_at.isoformat(),
            pro_forma_lines=lines,
        )
    )


# ---------------------------------------------------------
# Investor Contributions & Distributions
# ---------------------------------------------------------
@router.get(
    "/projects/{pid}/investors/contributions",
    response_model=ResponseEnvelope[list[InvestorContributionRead]],
)
async def list_contributions_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    items = service.list_investor_contributions(user, pid)
    return ResponseEnvelope(data=items)


@router.post(
    "/projects/{pid}/investors/contributions",
    response_model=ResponseEnvelope[InvestorContributionRead],
)
async def record_contribution_endpoint(
    pid: uuid.UUID,
    data: InvestorContributionCreate,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    contrib = service.record_investor_contribution(user, pid, data)
    db.commit()
    items = service.list_investor_contributions(user, pid)
    found = next((i for i in items if i.id == str(contrib.id)), None)
    return ResponseEnvelope(data=found or items[0])


@router.get(
    "/projects/{pid}/investors/distributions",
    response_model=ResponseEnvelope[list[InvestorDistributionRead]],
)
async def list_distributions_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    items = service.list_investor_distributions(user, pid)
    return ResponseEnvelope(data=items)


@router.post(
    "/projects/{pid}/investors/distributions",
    response_model=ResponseEnvelope[InvestorDistributionRead],
)
async def record_distribution_endpoint(
    pid: uuid.UUID,
    data: InvestorDistributionCreate,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    distrib = service.record_investor_distribution(user, pid, data)
    db.commit()
    items = service.list_investor_distributions(user, pid)
    found = next((i for i in items if i.id == str(distrib.id)), None)
    return ResponseEnvelope(data=found or items[0])


# ---------------------------------------------------------
# Disposition & Closeout
# ---------------------------------------------------------
@router.post(
    "/projects/{pid}/disposition/import",
    response_model=ResponseEnvelope[DispositionRead],
    status_code=status.HTTP_202_ACCEPTED,
)
async def import_disposition_endpoint(
    pid: uuid.UUID,
    data: DispositionImportRequest,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    disp = service.import_disposition(user, pid, data)
    db.commit()
    return ResponseEnvelope(
        data=DispositionRead(
            id=str(disp.id),
            project_id=str(disp.project_id),
            sale_price=disp.sale_price,
            closing_date=disp.closing_date.isoformat(),
            settlement_costs=disp.settlement_costs,
            net_proceeds=disp.net_proceeds,
            notes=disp.notes,
            created_at=disp.created_at.isoformat(),
        )
    )


@router.post(
    "/projects/{pid}/closeout/approve",
    response_model=ResponseEnvelope[dict],
)
async def approve_closeout_endpoint(
    pid: uuid.UUID,
    data: CloseoutApprovalRequest,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    project = service.approve_closeout(user, pid, data)
    db.commit()
    return ResponseEnvelope(data={"status": project.status, "lifecycle_stage": project.lifecycle_stage})


@router.post(
    "/projects/{pid}/post-closeout-adjustments",
    response_model=ResponseEnvelope[PostCloseoutAdjustmentRead],
)
async def record_post_closeout_adjustment_endpoint(
    pid: uuid.UUID,
    data: PostCloseoutAdjustmentRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    adj = service.record_post_closeout_adjustment(user, pid, data)
    db.commit()
    return ResponseEnvelope(data=adj)


# ---------------------------------------------------------
# Investor Updates Management (Owner)
# ---------------------------------------------------------
@router.post(
    "/projects/{pid}/investor-updates",
    response_model=ResponseEnvelope[InvestorUpdateRead],
)
async def create_investor_update_endpoint(
    pid: uuid.UUID,
    data: InvestorUpdateCreate,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    draft = service.create_investor_update_draft(user, pid, data)
    _INVESTOR_UPDATES[draft.id] = draft
    db.commit()
    return ResponseEnvelope(data=draft)


@router.patch(
    "/investor-updates/{id}",
    response_model=ResponseEnvelope[InvestorUpdateRead],
)
async def edit_investor_update_endpoint(
    id: uuid.UUID,
    data: InvestorUpdatePatch,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    update_id_str = str(id)
    if update_id_str not in _INVESTOR_UPDATES:
        raise NotFoundException(message="Investor update draft not found.")

    current = _INVESTOR_UPDATES[update_id_str]
    if current.status != "DRAFT":
        raise NotFoundException(message="Cannot edit an already published or withdrawn update.")

    updated_dict = current.model_dump()
    if data.title is not None:
        updated_dict["title"] = data.title
    if data.progress_summary is not None:
        updated_dict["progress_summary"] = data.progress_summary
    if data.material_disclosures is not None:
        updated_dict["material_disclosures"] = data.material_disclosures
    if data.recipients is not None:
        updated_dict["recipients"] = data.recipients
    if data.expiry_date is not None:
        updated_dict["expiry_date"] = data.expiry_date.isoformat()

    new_obj = InvestorUpdateRead(**updated_dict)
    _INVESTOR_UPDATES[update_id_str] = new_obj
    return ResponseEnvelope(data=new_obj)


@router.post(
    "/investor-updates/{id}/publish",
    response_model=ResponseEnvelope[InvestorUpdateRead],
)
async def publish_investor_update_endpoint(
    id: uuid.UUID,
    data: InvestorUpdatePublishRequest,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    update_id_str = str(id)
    if update_id_str not in _INVESTOR_UPDATES:
        raise NotFoundException(message="Investor update not found.")

    draft = _INVESTOR_UPDATES[update_id_str]
    service = EconomicsService(db)
    published = service.publish_investor_update(user, id, data, draft)
    _INVESTOR_UPDATES[update_id_str] = published
    db.commit()
    return ResponseEnvelope(data=published)


@router.post(
    "/investor-updates/{id}/withdraw",
    response_model=ResponseEnvelope[InvestorUpdateRead],
)
async def withdraw_investor_update_endpoint(
    id: uuid.UUID,
    data: InvestorUpdateWithdrawRequest,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    update_id_str = str(id)
    if update_id_str not in _INVESTOR_UPDATES:
        raise NotFoundException(message="Investor update not found.")

    current = _INVESTOR_UPDATES[update_id_str]
    service = EconomicsService(db)
    withdrawn = service.withdraw_investor_update(user, id, data, current)
    _INVESTOR_UPDATES[update_id_str] = withdrawn
    db.commit()
    return ResponseEnvelope(data=withdrawn)


# ---------------------------------------------------------
# Investor-Scoped Endpoints (INVESTOR role only)
# ---------------------------------------------------------
@router.get(
    "/investor/projects",
    response_model=ResponseEnvelope[list[InvestorProjectView]],
)
async def get_investor_projects_endpoint(
    user: User = Depends(require_role(["INVESTOR"])),
    db: Session = Depends(get_db),
):
    # Retrieve projects user has access to as an investor
    memberships = db.scalars(
        db.query(ProjectMember).filter(ProjectMember.user_id == user.id).statement
    ).all()
    project_ids = [m.project_id for m in memberships]

    projects = db.scalars(
        db.query(Project).filter(
            Project.id.in_(project_ids),
            Project.organization_id == user.organization_id,
        ).statement
    ).all()

    views = []
    for p in projects:
        # Find latest published update
        latest = next(
            (
                u for u in _INVESTOR_UPDATES.values()
                if u.project_id == str(p.id) and u.status == "PUBLISHED"
            ),
            None,
        )
        views.append(
            InvestorProjectView(
                id=str(p.id),
                name=p.name,
                project_entity=p.project_entity,
                address=p.address,
                lifecycle_stage=p.lifecycle_stage,
                currency=p.currency,
                latest_update=latest,
            )
        )
    return ResponseEnvelope(data=views)


@router.get(
    "/investor/updates/{id}",
    response_model=ResponseEnvelope[InvestorUpdateRead],
)
async def get_investor_update_snapshot_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["INVESTOR", "OWNER"])),
    db: Session = Depends(get_db),
):
    update_id_str = str(id)
    if update_id_str not in _INVESTOR_UPDATES:
        raise NotFoundException(message="Investor update not found.")

    snap = _INVESTOR_UPDATES[update_id_str]
    # Investors can only view PUBLISHED snapshots
    if user.role == "INVESTOR" and snap.status != "PUBLISHED":
        raise NotFoundException(message="Investor update not published.")

    # Scoping check
    project = db.get(Project, uuid.UUID(snap.project_id))
    if not project or project.organization_id != user.organization_id:
        raise NotFoundException(message="Project not found.")

    return ResponseEnvelope(data=snap)
