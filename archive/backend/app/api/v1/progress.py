import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.envelope import ResponseEnvelope
from app.db.models import User
from app.db.session import get_db
from app.modules.progress.schemas import (
    EvidenceRead,
    MilestoneCreate,
    MilestoneEvidenceCreate,
    MilestoneRead,
    MilestoneUpdate,
    MilestoneVerifyRequest,
    ScheduleForecastRead,
)
from app.modules.progress.service import ProgressService

router = APIRouter(tags=["Progress & Milestones"])


@router.get(
    "/projects/{pid}/milestones",
    response_model=ResponseEnvelope[list[MilestoneRead]],
)
async def list_milestones_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "GC", "INVESTOR"])),
    db: Session = Depends(get_db),
):
    service = ProgressService(db)
    milestones = service.list_milestones(user, pid)
    return ResponseEnvelope(data=[service.serialize_milestone(m) for m in milestones])


@router.post(
    "/projects/{pid}/milestones",
    response_model=ResponseEnvelope[MilestoneRead],
)
async def create_milestone_endpoint(
    pid: uuid.UUID,
    data: MilestoneCreate,
    user: User = Depends(require_role(["OWNER", "PM"])),
    db: Session = Depends(get_db),
):
    service = ProgressService(db)
    milestone = service.create_milestone(user, pid, data)
    db.commit()
    return ResponseEnvelope(data=service.serialize_milestone(milestone))


@router.patch(
    "/milestones/{id}",
    response_model=ResponseEnvelope[MilestoneRead],
)
async def update_milestone_endpoint(
    id: uuid.UUID,
    data: MilestoneUpdate,
    user: User = Depends(require_role(["PM", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = ProgressService(db)
    milestone = service.update_milestone(user, id, data)
    db.commit()
    return ResponseEnvelope(data=service.serialize_milestone(milestone))


@router.post(
    "/milestones/{id}/evidence",
    response_model=ResponseEnvelope[EvidenceRead],
)
async def attach_evidence_endpoint(
    id: uuid.UUID,
    data: MilestoneEvidenceCreate,
    user: User = Depends(require_role(["PM", "GC", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = ProgressService(db)
    evidence = service.attach_evidence(user, id, data)
    db.commit()
    return ResponseEnvelope(
        data=EvidenceRead(
            id=str(evidence.id),
            milestone_id=str(evidence.milestone_id),
            document_id=str(evidence.document_id),
            evidence_type=evidence.evidence_type,
            description=evidence.description,
            verified_by=str(evidence.verified_by) if evidence.verified_by else None,
            created_at=evidence.created_at.isoformat(),
        )
    )


@router.post(
    "/milestones/{id}/verify",
    response_model=ResponseEnvelope[MilestoneRead],
)
async def verify_milestone_endpoint(
    id: uuid.UUID,
    data: MilestoneVerifyRequest,
    user: User = Depends(require_role(["PM", "OWNER"])),
    db: Session = Depends(get_db),
):
    service = ProgressService(db)
    milestone = service.verify_milestone_progress(user, id, data)
    db.commit()
    return ResponseEnvelope(data=service.serialize_milestone(milestone))


@router.get(
    "/projects/{pid}/schedule/forecast",
    response_model=ResponseEnvelope[ScheduleForecastRead],
)
async def get_schedule_forecast_endpoint(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "INVESTOR"])),
    db: Session = Depends(get_db),
):
    service = ProgressService(db)
    forecast = service.get_schedule_forecast(user, pid)
    return ResponseEnvelope(data=forecast)
