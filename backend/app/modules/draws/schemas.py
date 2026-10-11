from datetime import date

from pydantic import BaseModel, Field


# ---------------------------------------------------------
# Draw Lines
# ---------------------------------------------------------
class DrawLineInput(BaseModel):
    budget_line_id: str
    requested_amount: int = Field(ge=0)
    reason: str | None = None
    evidence_status: str = "PENDING"


class DrawLineRead(BaseModel):
    id: str
    draw_id: str
    budget_line_id: str
    requested_amount: int
    recommended_amount: int
    approved_amount: int
    funded_amount: int
    reason: str | None = None
    evidence_status: str
    created_at: str


# ---------------------------------------------------------
# Draw Requirements & Checklist
# ---------------------------------------------------------
class DrawRequirementRead(BaseModel):
    id: str
    draw_id: str
    title: str
    requirement_type: str
    status: str
    document_id: str | None = None
    created_at: str


class DrawPacketResponse(BaseModel):
    draw_id: str
    draw_number: str
    status: str
    total_requested: int
    total_recommended: int
    total_approved: int
    total_funded: int
    requirements: list[DrawRequirementRead]
    checklist_complete: bool
    portal_entry_summary: dict[str, str | int]


# ---------------------------------------------------------
# Draws
# ---------------------------------------------------------
class DrawCreate(BaseModel):
    loan_id: str
    draw_number: str
    period_start: date
    period_end: date
    lender_party_id: str | None = None
    source_document_id: str | None = None
    lines: list[DrawLineInput] = []


class DrawRead(BaseModel):
    id: str
    organization_id: str
    project_id: str
    loan_id: str
    draw_number: str
    parent_draw_id: str | None = None
    status: str
    period_start: str
    period_end: str
    submitted_at: str | None = None
    approved_at: str | None = None
    rejected_at: str | None = None
    lender_party_id: str | None = None
    source_document_id: str | None = None
    created_at: str
    total_requested: int = 0
    total_recommended: int = 0
    total_approved: int = 0
    total_funded: int = 0
    lines: list[DrawLineRead] = []
    requirements: list[DrawRequirementRead] = []


class UpdateDrawLinesRequest(BaseModel):
    lines: list[DrawLineInput]


class VerifyWorkRequest(BaseModel):
    progress_notes: str = Field(min_length=1)
    inspection_id: str | None = None


class VerifyCostRequest(BaseModel):
    cost_notes: str = Field(min_length=1)
    prior_payment_verified: bool = True


class LenderDecisionLine(BaseModel):
    budget_line_id: str
    recommended_amount: int = Field(ge=0)
    approved_amount: int = Field(ge=0)
    reason: str | None = None


class LenderDecisionRequest(BaseModel):
    decision: str  # APPROVED, PARTIALLY_APPROVED, REJECTED
    reason: str | None = None
    line_decisions: list[LenderDecisionLine] = []


class DrawRevisionRequest(BaseModel):
    new_draw_number: str
    lines: list[DrawLineInput] = []
    reason: str = Field(min_length=1)


# ---------------------------------------------------------
# Funding Allocation
# ---------------------------------------------------------
class FundingAllocationItem(BaseModel):
    transaction_id: str
    amount: int = Field(gt=0)
    funding_date: date


class DrawFundingRequest(BaseModel):
    allocations: list[FundingAllocationItem]


class DrawFundingRead(BaseModel):
    id: str
    draw_id: str
    transaction_id: str
    amount: int
    funding_date: str
    created_at: str


class UnallocatedFundingItem(BaseModel):
    transaction_id: str
    transaction_date: str
    counterparty: str
    amount: int
    allocated_amount: int
    unallocated_amount: int
