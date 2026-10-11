import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.envelope import ResponseEnvelope
from app.db.models import User
from app.db.session import get_db
from app.modules.draws.schemas import (
    DrawCreate,
    DrawFundingRead,
    DrawFundingRequest,
    DrawLineRead,
    DrawPacketResponse,
    DrawRead,
    DrawRequirementRead,
    DrawRevisionRequest,
    LenderDecisionRequest,
    UnallocatedFundingItem,
    UpdateDrawLinesRequest,
    VerifyCostRequest,
    VerifyWorkRequest,
)
from app.modules.draws.service import DrawService

router = APIRouter(tags=["Draws & Funding"])


@router.post("/projects/{pid}/draws", response_model=ResponseEnvelope[DrawRead])
async def create_draw_endpoint(
    pid: uuid.UUID,
    data: DrawCreate,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    draw = service.create_draw(user, pid, data)
    db.commit()

    return ResponseEnvelope(
        data=DrawRead(
            id=str(draw.id),
            organization_id=str(draw.organization_id),
            project_id=str(draw.project_id),
            loan_id=str(draw.loan_id),
            draw_number=draw.draw_number,
            parent_draw_id=str(draw.parent_draw_id) if draw.parent_draw_id else None,
            status=draw.status,
            period_start=draw.period_start.isoformat(),
            period_end=draw.period_end.isoformat(),
            submitted_at=draw.submitted_at.isoformat() if draw.submitted_at else None,
            approved_at=draw.approved_at.isoformat() if draw.approved_at else None,
            rejected_at=draw.rejected_at.isoformat() if draw.rejected_at else None,
            lender_party_id=str(draw.lender_party_id) if draw.lender_party_id else None,
            source_document_id=str(draw.source_document_id) if draw.source_document_id else None,
            created_at=draw.created_at.isoformat(),
            total_requested=sum(dline.requested_amount for dline in draw.lines),
            total_recommended=sum(dline.recommended_amount for dline in draw.lines),
            total_approved=sum(dline.approved_amount for dline in draw.lines),
            total_funded=sum(dline.funded_amount for dline in draw.lines),
            lines=[
                DrawLineRead(
                    id=str(dline.id),
                    draw_id=str(dline.draw_id),
                    budget_line_id=str(dline.budget_line_id),
                    requested_amount=dline.requested_amount,
                    recommended_amount=dline.recommended_amount,
                    approved_amount=dline.approved_amount,
                    funded_amount=dline.funded_amount,
                    reason=dline.reason,
                    evidence_status=dline.evidence_status,
                    created_at=dline.created_at.isoformat(),
                )
                for dline in draw.lines
            ],
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
                for r in draw.requirements
            ],
        )
    )


@router.get("/draws/{id}", response_model=ResponseEnvelope[DrawRead])
async def get_draw_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    draw = service.get_draw(user, id)

    return ResponseEnvelope(
        data=DrawRead(
            id=str(draw.id),
            organization_id=str(draw.organization_id),
            project_id=str(draw.project_id),
            loan_id=str(draw.loan_id),
            draw_number=draw.draw_number,
            parent_draw_id=str(draw.parent_draw_id) if draw.parent_draw_id else None,
            status=draw.status,
            period_start=draw.period_start.isoformat(),
            period_end=draw.period_end.isoformat(),
            submitted_at=draw.submitted_at.isoformat() if draw.submitted_at else None,
            approved_at=draw.approved_at.isoformat() if draw.approved_at else None,
            rejected_at=draw.rejected_at.isoformat() if draw.rejected_at else None,
            lender_party_id=str(draw.lender_party_id) if draw.lender_party_id else None,
            source_document_id=str(draw.source_document_id) if draw.source_document_id else None,
            created_at=draw.created_at.isoformat(),
            total_requested=sum(dline.requested_amount for dline in draw.lines),
            total_recommended=sum(dline.recommended_amount for dline in draw.lines),
            total_approved=sum(dline.approved_amount for dline in draw.lines),
            total_funded=sum(dline.funded_amount for dline in draw.lines),
            lines=[
                DrawLineRead(
                    id=str(dline.id),
                    draw_id=str(dline.draw_id),
                    budget_line_id=str(dline.budget_line_id),
                    requested_amount=dline.requested_amount,
                    recommended_amount=dline.recommended_amount,
                    approved_amount=dline.approved_amount,
                    funded_amount=dline.funded_amount,
                    reason=dline.reason,
                    evidence_status=dline.evidence_status,
                    created_at=dline.created_at.isoformat(),
                )
                for dline in draw.lines
            ],
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
                for r in draw.requirements
            ],
        )
    )


@router.post("/draws/{id}/lines", response_model=ResponseEnvelope[list[DrawLineRead]])
async def update_draw_lines_endpoint(
    id: uuid.UUID,
    data: UpdateDrawLinesRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    lines = service.update_draw_lines(user, id, data)
    db.commit()

    return ResponseEnvelope(
        data=[
            DrawLineRead(
                id=str(dline.id),
                draw_id=str(dline.draw_id),
                budget_line_id=str(dline.budget_line_id),
                requested_amount=dline.requested_amount,
                recommended_amount=dline.recommended_amount,
                approved_amount=dline.approved_amount,
                funded_amount=dline.funded_amount,
                reason=dline.reason,
                evidence_status=dline.evidence_status,
                created_at=dline.created_at.isoformat(),
            )
            for dline in lines
        ]
    )


@router.post("/draws/{id}/verify-work", response_model=ResponseEnvelope[DrawRead])
async def verify_work_endpoint(
    id: uuid.UUID,
    data: VerifyWorkRequest,
    user: User = Depends(require_role(["PM", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    draw = service.verify_work(user, id, data)
    db.commit()
    return await get_draw_endpoint(id=draw.id, user=user, db=db)


@router.post("/draws/{id}/verify-cost", response_model=ResponseEnvelope[DrawRead])
async def verify_cost_endpoint(
    id: uuid.UUID,
    data: VerifyCostRequest,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    draw = service.verify_cost(user, id, data)
    db.commit()
    return await get_draw_endpoint(id=draw.id, user=user, db=db)


@router.get("/draws/{id}/packet", response_model=ResponseEnvelope[DrawPacketResponse])
async def get_draw_packet_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    packet = service.get_draw_packet(user, id)
    return ResponseEnvelope(data=packet)


@router.post("/draws/{id}/mark-submitted", response_model=ResponseEnvelope[DrawRead])
async def mark_submitted_endpoint(
    id: uuid.UUID,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    draw = service.mark_submitted(user, id)
    db.commit()
    return await get_draw_endpoint(id=draw.id, user=user, db=db)


@router.post("/draws/{id}/lender-decision", response_model=ResponseEnvelope[DrawRead])
async def record_lender_decision_endpoint(
    id: uuid.UUID,
    data: LenderDecisionRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    draw = service.record_lender_decision(user, id, data)
    db.commit()
    return await get_draw_endpoint(id=draw.id, user=user, db=db)


@router.post("/draws/{id}/revisions", response_model=ResponseEnvelope[DrawRead])
async def create_child_revision_endpoint(
    id: uuid.UUID,
    data: DrawRevisionRequest,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    child = service.create_child_revision(user, id, data)
    db.commit()
    return await get_draw_endpoint(id=child.id, user=user, db=db)


@router.get("/projects/{pid}/funding/unallocated", response_model=ResponseEnvelope[list[UnallocatedFundingItem]])
async def get_unallocated_funding_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    items = service.get_unallocated_funding(user, pid)
    return ResponseEnvelope(data=items)


@router.post("/draws/{id}/fundings", response_model=ResponseEnvelope[list[DrawFundingRead]])
async def allocate_draw_funding_endpoint(
    id: uuid.UUID,
    data: DrawFundingRequest,
    user: User = Depends(require_role(["CFO", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = DrawService(db)
    fundings = service.allocate_draw_funding(user, id, data)
    db.commit()

    return ResponseEnvelope(
        data=[
            DrawFundingRead(
                id=str(f.id),
                draw_id=str(f.draw_id),
                transaction_id=str(f.transaction_id),
                amount=f.amount,
                funding_date=f.funding_date.isoformat(),
                created_at=f.created_at.isoformat(),
            )
            for f in fundings
        ]
    )
