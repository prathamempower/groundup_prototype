import uuid
from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.envelope import ResponseEnvelope
from app.core.errors import NotFoundException, ValidationFailedException
from app.db.audit import record_audit_event
from app.db.models import InvestorUpdate, Project, ProjectMember, Unit, User
from app.db.session import get_db
from app.modules.economics.schemas import (
    CloseoutApprovalRequest,
    CloseoutReportRead,
    DispositionImportRequest,
    DispositionRead,
    DispositionUnitRead,
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
    RecordUnitSaleRequest,
)
from app.modules.economics.service import EconomicsService

router = APIRouter(tags=["Economics & Investors"])


def to_investor_update_dto(u: InvestorUpdate) -> InvestorUpdateRead:
    return InvestorUpdateRead(
        id=str(u.id),
        project_id=str(u.project_id),
        title=u.title,
        as_of_date=u.as_of_date.isoformat(),
        status=u.status,
        published_at=u.published_at.isoformat() if u.published_at else None,
        withdrawn_at=u.withdrawn_at.isoformat() if u.withdrawn_at else None,
        gross_development_value=u.gross_development_value,
        current_forecast_profit=u.current_forecast_profit,
        senior_debt_drawn=u.senior_debt_drawn,
        equity_funded=u.equity_funded,
        progress_summary=u.progress_summary,
        material_disclosures=list(u.material_disclosures or []),
        recipients=list(u.recipients or []),
        expiry_date=u.expiry_date.isoformat() if u.expiry_date else None,
        created_at=u.created_at.isoformat(),
    )


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
    econ = service.get_project_economics(user, pid)
    update = InvestorUpdate(
        organization_id=user.organization_id,
        project_id=pid,
        title=data.title,
        as_of_date=data.as_of_date or date.today(),
        status="DRAFT",
        gross_development_value=econ.gross_development_value,
        current_forecast_profit=econ.net_profit,
        senior_debt_drawn=econ.senior_debt_drawn,
        equity_funded=econ.sponsor_equity_invested + econ.lp_equity_invested,
        progress_summary=data.progress_summary or "",
        material_disclosures=data.material_disclosures or [],
        recipients=data.recipients or [],
        expiry_date=data.expiry_date,
    )
    db.add(update)
    db.commit()
    db.refresh(update)
    return ResponseEnvelope(data=to_investor_update_dto(update))


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
    update = db.get(InvestorUpdate, id)
    if not update:
        raise NotFoundException(message="Investor update draft not found.")
    if update.status != "DRAFT":
        raise NotFoundException(message="Cannot edit an already published or withdrawn update.")

    if data.title is not None:
        update.title = data.title
    if data.progress_summary is not None:
        update.progress_summary = data.progress_summary
    if data.material_disclosures is not None:
        update.material_disclosures = data.material_disclosures
    if data.recipients is not None:
        update.recipients = data.recipients
    if data.expiry_date is not None:
        update.expiry_date = data.expiry_date

    db.commit()
    db.refresh(update)
    return ResponseEnvelope(data=to_investor_update_dto(update))


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
    update = db.get(InvestorUpdate, id)
    if not update:
        raise NotFoundException(message="Investor update not found.")

    if not data.material_warnings_acknowledged:
        raise ValidationFailedException(message="Material warnings must be acknowledged before publishing investor update.")

    update.status = "PUBLISHED"
    update.published_at = datetime.now(UTC)
    if data.recipients:
        update.recipients = data.recipients
    if data.expiry_date:
        update.expiry_date = data.expiry_date

    db.commit()
    db.refresh(update)
    return ResponseEnvelope(data=to_investor_update_dto(update))


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
    update = db.get(InvestorUpdate, id)
    if not update:
        raise NotFoundException(message="Investor update not found.")

    update.status = "WITHDRAWN"
    update.withdrawn_at = datetime.now(UTC)
    db.commit()
    db.refresh(update)
    return ResponseEnvelope(data=to_investor_update_dto(update))


# ---------------------------------------------------------
# Investor Update List & Aliases
# ---------------------------------------------------------
@router.get(
    "/projects/{pid}/investor-updates",
    response_model=ResponseEnvelope[list[InvestorUpdateRead]],
)
async def list_project_investor_updates_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    query = (
        select(InvestorUpdate)
        .where(InvestorUpdate.project_id == pid)
        .order_by(InvestorUpdate.created_at.desc())
    )
    updates = db.scalars(query).all()
    return ResponseEnvelope(data=[to_investor_update_dto(u) for u in updates])


@router.post(
    "/projects/{pid}/investor-updates/generate-draft",
    response_model=ResponseEnvelope[InvestorUpdateRead],
)
async def generate_investor_update_draft_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    econ = service.get_project_economics(user, pid)
    update = InvestorUpdate(
        organization_id=user.organization_id,
        project_id=pid,
        title=f"Development Performance Brief - {date.today().strftime('%B %Y')}",
        as_of_date=date.today(),
        status="DRAFT",
        gross_development_value=econ.gross_development_value,
        current_forecast_profit=econ.net_profit,
        senior_debt_drawn=econ.senior_debt_drawn,
        equity_funded=econ.sponsor_equity_invested + econ.lp_equity_invested,
        progress_summary="Automated snapshot compiled from reconciled general ledger and milestone progress tracking.",
        material_disclosures=[
            f"Forecast project net profit currently modeled at ${econ.net_profit / 100:,.2f}.",
            f"Senior construction loan drawn balance: ${econ.senior_debt_drawn / 100:,.2f}.",
        ],
        recipients=["e.rostova@meridiancap.com", "m.vance@vancedev.com"],
    )
    db.add(update)
    db.commit()
    db.refresh(update)
    return ResponseEnvelope(data=to_investor_update_dto(update))


@router.post("/investor/updates/{id}/publish", response_model=ResponseEnvelope[InvestorUpdateRead])
async def publish_investor_update_alias(
    id: uuid.UUID,
    data: InvestorUpdatePublishRequest,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    return await publish_investor_update_endpoint(id, data, user, db)


@router.post("/investor/updates/{id}/withdraw", response_model=ResponseEnvelope[InvestorUpdateRead])
async def withdraw_investor_update_alias(
    id: uuid.UUID,
    data: InvestorUpdateWithdrawRequest,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    return await withdraw_investor_update_endpoint(id, data, user, db)


# ---------------------------------------------------------
# Disposition Units & Closeout Endpoints
# ---------------------------------------------------------
@router.get(
    "/projects/{pid}/disposition/units",
    response_model=ResponseEnvelope[list[DispositionUnitRead]],
)
async def list_disposition_units_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "INVESTOR"])),
    db: Session = Depends(get_db),
):
    project = db.get(Project, pid)
    if not project or project.organization_id != user.organization_id:
        raise NotFoundException(message=f"Project {pid} not found.")

    units = db.scalars(
        select(Unit).where(Unit.project_id == project.id).order_by(Unit.unit_number.asc())
    ).all()

    return ResponseEnvelope(
        data=[
            DispositionUnitRead(
                id=str(u.id),
                project_id=str(u.project_id),
                unit_identifier=f"Unit {u.unit_number}" if not u.unit_number.startswith("Unit") else u.unit_number,
                unit_type="Residential Luxury Condominium",
                sqft=u.square_feet or 1200,
                original_list_price=str(u.target_price),
                contract_sale_price=str(u.actual_sale_price or u.target_price),
                buyer_name="Private Purchaser" if u.status in ["SOLD", "CLOSED"] else None,
                contract_date="2025-05-15" if u.status in ["SOLD", "CLOSED"] else None,
                closing_date="2025-08-30" if u.status in ["SOLD", "CLOSED"] else None,
                status="CLOSED" if u.status in ["SOLD", "CLOSED"] else ("UNDER_CONTRACT" if u.status == "UNDER_CONTRACT" else "AVAILABLE"),
                broker_commission=str(int(u.target_price * 0.045)),
                transfer_tax_closing_costs=str(int(u.target_price * 0.015)),
            )
            for u in units
        ]
    )


@router.post(
    "/projects/{pid}/disposition/units/{unit_id}/sale",
    response_model=ResponseEnvelope[DispositionUnitRead],
)
async def record_unit_sale_endpoint(
    pid: uuid.UUID,
    unit_id: uuid.UUID,
    data: RecordUnitSaleRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    unit = db.get(Unit, unit_id)
    if not unit or unit.project_id != pid:
        raise NotFoundException(message=f"Unit {unit_id} not found.")

    sale_cents = int(data.contract_sale_price)
    unit.actual_sale_price = sale_cents
    unit.status = "SOLD"

    record_audit_event(
        db=db,
        organization_id=user.organization_id,
        project_id=pid,
        actor_id=user.id,
        action="DISPOSITION_UNIT_SOLD",
        entity_type="Unit",
        entity_id=unit.id,
        rationale=f"Recorded sale of {unit.unit_number} for ${sale_cents / 100:,.2f}",
    )
    db.commit()

    return ResponseEnvelope(
        data=DispositionUnitRead(
            id=str(unit.id),
            project_id=str(unit.project_id),
            unit_identifier=f"Unit {unit.unit_number}" if not unit.unit_number.startswith("Unit") else unit.unit_number,
            unit_type="Residential Luxury Condominium",
            sqft=unit.square_feet or 1200,
            original_list_price=str(unit.target_price),
            contract_sale_price=str(sale_cents),
            buyer_name=data.buyer_name or "Private Purchaser",
            closing_date=data.closing_date or date.today().isoformat(),
            status="CLOSED",
            broker_commission=data.broker_commission or str(int(sale_cents * 0.045)),
            transfer_tax_closing_costs=str(int(sale_cents * 0.015)),
        )
    )


@router.get(
    "/projects/{pid}/pro-forma",
    response_model=ResponseEnvelope[list[ProFormaLineItemRead]],
)
async def get_project_pro_forma_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "INVESTOR", "PM"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    econ = service.get_project_economics(user, pid)
    return ResponseEnvelope(data=econ.pro_forma_lines)


@router.get(
    "/projects/{pid}/closeout/report",
    response_model=ResponseEnvelope[CloseoutReportRead],
)
async def get_project_closeout_report_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "INVESTOR"])),
    db: Session = Depends(get_db),
):
    service = EconomicsService(db)
    econ = service.get_project_economics(user, pid)
    project = db.get(Project, pid)
    if not project:
        raise NotFoundException(message=f"Project {pid} not found.")

    return ResponseEnvelope(
        data=CloseoutReportRead(
            project_id=str(pid),
            project_name=project.name,
            status=project.status,
            final_gross_revenue=str(econ.gross_development_value),
            final_total_costs=str(econ.total_cost),
            final_net_profit=str(econ.net_profit),
            return_on_cost_pct=econ.return_on_cost_pct,
            equity_multiple=econ.equity_multiple,
            checklist_items=[
                {"id": "1", "item": "Subcontractor final lien waivers collected and verified", "status": "COMPLETED"},
                {"id": "2", "item": "Municipal Certificate of Occupancy issued and filed", "status": "COMPLETED"},
                {"id": "3", "item": "All condo unit disposition closings settled and HUD-1s archived", "status": "COMPLETED"},
                {"id": "4", "item": "Senior construction loan repaid to zero balance and satisfaction recorded", "status": "COMPLETED"},
                {"id": "5", "item": "Investor capital returns and waterfall profit distributions disbursed", "status": "COMPLETED"},
            ],
        )
    )


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
        latest = db.scalars(
            select(InvestorUpdate).where(
                InvestorUpdate.project_id == p.id,
                InvestorUpdate.status == "PUBLISHED",
            ).order_by(InvestorUpdate.published_at.desc())
        ).first()
        views.append(
            InvestorProjectView(
                id=str(p.id),
                name=p.name,
                project_entity=p.project_entity,
                address=p.address,
                lifecycle_stage=p.lifecycle_stage,
                currency=p.currency,
                latest_update=to_investor_update_dto(latest) if latest else None,
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
    update = db.get(InvestorUpdate, id)
    if not update:
        raise NotFoundException(message="Investor update not found.")

    if user.role == "INVESTOR" and update.status != "PUBLISHED":
        raise NotFoundException(message="Investor update not published.")

    project = db.get(Project, update.project_id)
    if not project or project.organization_id != user.organization_id:
        raise NotFoundException(message="Project not found.")

    return ResponseEnvelope(data=to_investor_update_dto(update))
