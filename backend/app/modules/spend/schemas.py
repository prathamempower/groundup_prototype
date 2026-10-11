from datetime import date
from typing import Any

from pydantic import BaseModel, Field


# ---------------------------------------------------------
# Financial Accounts
# ---------------------------------------------------------
class FinancialAccountCreate(BaseModel):
    institution: str = Field(min_length=1, max_length=255)
    masked_identifier: str = Field(min_length=1, max_length=50)  # e.g. *1234
    account_purpose: str = "OPERATING"  # OPERATING, ESCROW, CREDIT_CARD
    currency: str = "USD"
    active_from: date
    active_to: date | None = None
    party_id: str | None = None


class FinancialAccountRead(BaseModel):
    id: str
    organization_id: str
    party_id: str | None = None
    institution: str
    masked_identifier: str
    account_purpose: str
    currency: str
    active_from: str
    active_to: str | None = None
    status: str
    created_at: str


class ApproveMappingRequest(BaseModel):
    project_id: str
    rationale: str | None = None


# ---------------------------------------------------------
# Statement Periods
# ---------------------------------------------------------
class StatementPeriodCreate(BaseModel):
    period_start: date
    period_end: date
    opening_balance: int
    closing_balance: int
    source_document_id: str | None = None


class StatementPeriodRead(BaseModel):
    id: str
    financial_account_id: str
    period_start: str
    period_end: str
    opening_balance: int
    closing_balance: int
    source_document_id: str | None = None
    coverage_status: str
    reconciled_by: str | None = None
    reconciled_at: str | None = None
    created_at: str


class PeriodSignoffRequest(BaseModel):
    waiver_reason: str | None = None


# ---------------------------------------------------------
# Import Batches
# ---------------------------------------------------------
class ImportBatchCreate(BaseModel):
    adapter: str = "CSV"  # CSV, XLSX
    version: str = "v1"
    raw_content: str  # CSV string or text payload
    column_mapping: dict[str, str] = Field(
        default_factory=dict
    )  # e.g. {"Date": "transaction_date", "Amount": "amount", ...}
    financial_account_id: str | None = None
    control_total: int | None = None  # Expected formula / sum total for verification


class ImportBatchRead(BaseModel):
    id: str
    organization_id: str
    project_id: str
    adapter: str
    version: str
    status: str
    total_rows: int
    accepted_rows: int
    rejected_rows: int
    duplicate_rows: int
    uploaded_by: str
    created_at: str


class SourceRecordRead(BaseModel):
    id: str
    document_id: str | None = None
    import_batch_id: str | None = None
    project_candidate_id: str | None = None
    source_kind: str
    sheet_name: str | None = None
    row_number: int | None = None
    cell_range: str | None = None
    raw_payload: dict[str, Any]
    raw_formula: str | None = None
    normalization_status: str
    record_fingerprint: str | None = None
    created_at: str


# ---------------------------------------------------------
# Reconciliation Matches
# ---------------------------------------------------------
class ReconciliationMatchRead(BaseModel):
    id: str
    organization_id: str
    project_id: str
    transaction_id: str
    spend_record_id: str | None = None
    match_type: str
    confidence_score: float | None = None
    decision: str
    decided_by: str | None = None
    decided_at: str | None = None
    notes: str | None = None
    created_at: str
    transaction_amount: int | None = None
    transaction_counterparty: str | None = None


class ReconciliationDecisionRequest(BaseModel):
    decision: str  # ACCEPT, SPLIT, REMAP, EXCLUDE, MARK_TRANSFER
    notes: str | None = None
    target_spend_record_id: str | None = None
    target_budget_line_id: str | None = None
    to_project_id: str | None = None  # If MARK_TRANSFER


# ---------------------------------------------------------
# Spend Records & Allocations
# ---------------------------------------------------------
class AllocationItem(BaseModel):
    budget_line_id: str
    amount: int = Field(gt=0)
    description: str | None = None


class SpendAllocationRequest(BaseModel):
    allocations: list[AllocationItem]
    rationale: str | None = None


class SpendReverseRequest(BaseModel):
    reversal_type: str = "REVERSAL"  # REVERSAL, REFUND, VOID, CHARGEBACK
    reason: str = Field(min_length=1)


class SpendRecordRead(BaseModel):
    id: str
    project_id: str
    vendor_party_id: str | None = None
    transaction_date: str
    amount: int
    currency: str
    description: str
    status: str
    evidence_strength: str
    source_document_id: str | None = None
    transaction_id: str | None = None
    budget_line_id: str | None = None
    match_status: str
    reviewed_by: str | None = None
    reviewed_at: str | None = None
    created_at: str


# ---------------------------------------------------------
# Inter-Project Transfers
# ---------------------------------------------------------
class InterProjectTransferCreate(BaseModel):
    from_project_id: str
    to_project_id: str
    amount: int = Field(gt=0)
    transfer_date: date
    type: str = "TEMPORARY_ADVANCE"
    transaction_id: str | None = None


class InterProjectTransferRepayRequest(BaseModel):
    repaid_amount: int = Field(gt=0)
    repaid_date: date


class InterProjectTransferRead(BaseModel):
    id: str
    organization_id: str
    from_project_id: str
    to_project_id: str
    transaction_id: str | None = None
    amount: int
    type: str
    transfer_date: str
    repaid_amount: int
    repaid_date: str | None = None
    status: str
    reviewed_by: str | None = None
    created_at: str
