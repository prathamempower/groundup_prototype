import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.envelope import ResponseEnvelope
from app.core.errors import NotFoundException
from app.db.models import GCSubmission, Project, SpendRecord, User
from app.db.session import get_db

router = APIRouter(tags=["General Contractor Submissions"])


# ---------------------------------------------------------
# Schemas
# ---------------------------------------------------------
class GCSubmissionEvidence(BaseModel):
    id: str
    filename: str
    type: str = "INVOICE"
    file_size_bytes: int = 150000
    uploaded_at: str
    invoice_number: str | None = None
    vendor_name: str | None = None
    amount: str | None = None
    notes: str | None = None


class GCSubmissionReview(BaseModel):
    role: str
    reviewer_name: str | None = None
    status: str = "PENDING"
    reviewed_at: str | None = None
    comments: str | None = None


class GCSubmissionRead(BaseModel):
    id: str
    project_id: str
    submission_number: str
    type: str  # MILESTONE_CLAIM, CHANGE_ORDER_REQUEST, COST_EVIDENCE
    title: str
    description: str
    contract_model: str = "COST_PLUS"
    status: str = "UNDER_REVIEW"  # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
    submitted_at: str
    submitted_by: str
    contractor_name: str = "Apex Construction LLC"
    milestone_id: str | None = None
    milestone_name: str | None = None
    csi_code: str | None = None
    csi_category: str | None = None
    claimed_amount: str
    retainage_rate_pct: float = 10.0
    retainage_amount: str
    net_payable_amount: str
    prior_claimed_pct: float = 0.0
    current_claimed_pct: float = 50.0
    incremental_claimed_pct: float = 50.0
    schedule_delay_days: int | None = None
    evidence_items: list[GCSubmissionEvidence] = []
    invoice_numbers: list[str] = []
    reviews: list[GCSubmissionReview] = []


class CreateGCSubmissionRequest(BaseModel):
    type: str
    title: str
    description: str
    milestone_id: str | None = None
    claimed_amount: str
    retainage_rate_pct: float = 10.0
    csi_code: str | None = None
    csi_category: str | None = None
    schedule_delay_days: int | None = None
    evidence_items: list[dict[str, Any]] = []


class ReviewGCSubmissionRequest(BaseModel):
    status: str  # APPROVED, REJECTED
    comments: str | None = None


class DuplicateInvoiceCheckRequest(BaseModel):
    invoice_number: str
    amount: str | None = None


class DuplicateInvoiceCheckResponse(BaseModel):
    is_duplicate: bool = False
    existing_submission_number: str | None = None
    existing_invoice_number: str | None = None
    warning_message: str | None = None


def to_read_dto(sub: GCSubmission) -> GCSubmissionRead:
    return GCSubmissionRead(
        id=str(sub.id),
        project_id=str(sub.project_id),
        submission_number=sub.submission_number,
        type=sub.type,
        title=sub.title,
        description=sub.description,
        contract_model=sub.contract_model,
        status=sub.status,
        submitted_at=sub.submitted_at.isoformat() if sub.submitted_at else "",
        submitted_by=sub.submitted_by,
        contractor_name=sub.contractor_name,
        milestone_id=str(sub.milestone_id) if sub.milestone_id else None,
        milestone_name=sub.milestone_name,
        csi_code=sub.csi_code,
        csi_category=sub.csi_category,
        claimed_amount=str(sub.claimed_amount),
        retainage_rate_pct=float(sub.retainage_rate_pct),
        retainage_amount=str(sub.retainage_amount),
        net_payable_amount=str(sub.net_payable_amount),
        prior_claimed_pct=float(sub.prior_claimed_pct),
        current_claimed_pct=float(sub.current_claimed_pct),
        incremental_claimed_pct=float(sub.incremental_claimed_pct),
        schedule_delay_days=sub.schedule_delay_days,
        evidence_items=[GCSubmissionEvidence(**ev) for ev in (sub.evidence_items or [])],
        invoice_numbers=list(sub.invoice_numbers or []),
        reviews=[GCSubmissionReview(**r) for r in (sub.reviews or [])],
    )


# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------
@router.get(
    "/projects/{pid}/submissions",
    response_model=ResponseEnvelope[list[GCSubmissionRead]],
)
def list_project_submissions_endpoint(
    pid: uuid.UUID,
    type: str | None = None,
    status: str | None = None,
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "GC"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[list[GCSubmissionRead]]:
    query = select(GCSubmission).where(GCSubmission.project_id == pid)
    if type:
        query = query.where(GCSubmission.type == type)
    if status:
        query = query.where(GCSubmission.status == status)
    query = query.order_by(GCSubmission.submitted_at.desc())
    subs = db.scalars(query).all()
    return ResponseEnvelope(data=[to_read_dto(s) for s in subs])


@router.get(
    "/submissions/{id}",
    response_model=ResponseEnvelope[GCSubmissionRead],
)
def get_submission_endpoint(
    id: str,
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "GC"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[GCSubmissionRead]:
    try:
        sub_uuid = uuid.UUID(id)
        sub = db.get(GCSubmission, sub_uuid)
    except ValueError:
        sub = db.scalars(select(GCSubmission).where(GCSubmission.submission_number == id)).first()
    if not sub:
        raise NotFoundException(message=f"Submission {id} not found.")
    return ResponseEnvelope(data=to_read_dto(sub))


@router.post(
    "/projects/{pid}/submissions",
    response_model=ResponseEnvelope[GCSubmissionRead],
)
def create_project_submission_endpoint(
    pid: uuid.UUID,
    req: CreateGCSubmissionRequest,
    user: User = Depends(require_role(["GC", "OWNER", "PM"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[GCSubmissionRead]:
    claimed = int(req.claimed_amount)
    retainage = int(claimed * (req.retainage_rate_pct / 100.0))
    net_payable = claimed - retainage

    count = db.scalar(select(func.count(GCSubmission.id)).where(GCSubmission.project_id == pid)) or 0
    sub_num = f"GC-{req.type[:4]}-{count + 1:03d}"

    inv_nums = [ev.get("invoice_number") for ev in req.evidence_items if ev.get("invoice_number")]

    sub = GCSubmission(
        organization_id=user.organization_id,
        project_id=pid,
        submission_number=sub_num,
        type=req.type,
        title=req.title,
        description=req.description,
        contract_model="COST_PLUS",
        status="UNDER_REVIEW",
        submitted_at=datetime.now(UTC),
        submitted_by=f"{user.first_name} {user.last_name}",
        contractor_name="Apex Construction LLC",
        milestone_id=uuid.UUID(req.milestone_id) if req.milestone_id else None,
        csi_code=req.csi_code,
        csi_category=req.csi_category,
        claimed_amount=claimed,
        retainage_rate_pct=req.retainage_rate_pct,
        retainage_amount=retainage,
        net_payable_amount=net_payable,
        schedule_delay_days=req.schedule_delay_days,
        evidence_items=req.evidence_items,
        invoice_numbers=inv_nums,
        reviews=[],
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return ResponseEnvelope(data=to_read_dto(sub))


@router.post(
    "/submissions/{id}/review",
    response_model=ResponseEnvelope[GCSubmissionRead],
)
def review_submission_endpoint(
    id: str,
    req: ReviewGCSubmissionRequest,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[GCSubmissionRead]:
    try:
        sub_uuid = uuid.UUID(id)
        sub = db.get(GCSubmission, sub_uuid)
    except ValueError:
        sub = db.scalars(select(GCSubmission).where(GCSubmission.submission_number == id)).first()
    if not sub:
        raise NotFoundException(message=f"Submission {id} not found.")

    sub.status = req.status
    reviews = list(sub.reviews or [])
    reviews.append({
        "role": user.role,
        "reviewer_name": f"{user.first_name} {user.last_name}",
        "status": req.status,
        "reviewed_at": datetime.now(UTC).isoformat(),
        "comments": req.comments,
    })
    sub.reviews = reviews
    db.commit()
    db.refresh(sub)
    return ResponseEnvelope(data=to_read_dto(sub))


@router.post(
    "/projects/{pid}/check-duplicate-invoice",
    response_model=ResponseEnvelope[DuplicateInvoiceCheckResponse],
)
def check_duplicate_invoice_endpoint(
    pid: uuid.UUID,
    req: DuplicateInvoiceCheckRequest,
    user: User = Depends(require_role(["GC", "OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[DuplicateInvoiceCheckResponse]:
    subs = db.scalars(select(GCSubmission).where(GCSubmission.project_id == pid)).all()
    for s in subs:
        if s.invoice_numbers and req.invoice_number in s.invoice_numbers:
            return ResponseEnvelope(
                data=DuplicateInvoiceCheckResponse(
                    is_duplicate=True,
                    existing_submission_number=s.submission_number,
                    existing_invoice_number=req.invoice_number,
                    warning_message=f"Invoice #{req.invoice_number} is already associated with {s.submission_number}.",
                )
            )

    spend_dupe = db.scalars(
        select(SpendRecord).where(
            SpendRecord.project_id == pid,
            SpendRecord.description.ilike(f"%{req.invoice_number}%"),
        )
    ).first()
    if spend_dupe:
        return ResponseEnvelope(
            data=DuplicateInvoiceCheckResponse(
                is_duplicate=True,
                existing_submission_number=f"SPEND-{spend_dupe.id.hex[:6].upper()}",
                existing_invoice_number=req.invoice_number,
                warning_message=f"Invoice #{req.invoice_number} already recorded in general ledger.",
            )
        )

    return ResponseEnvelope(
        data=DuplicateInvoiceCheckResponse(is_duplicate=False)
    )
