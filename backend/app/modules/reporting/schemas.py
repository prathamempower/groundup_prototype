from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

# -----------------------------------------------------------------------------
# Alerts Schemas
# -----------------------------------------------------------------------------

AlertType = Literal[
    "OVERRUN",
    "MISSING_EVIDENCE",
    "SHORT_FUNDED_DRAW",
    "UNALLOCATED_CASH",
    "DELAYED_MILESTONE",
    "DUPLICATE",
    "DATA_CONFLICT",
]
AlertSeverity = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
AlertStatus = Literal["OPEN", "RESOLVED", "WAIVED", "ESCALATED"]


class AlertRead(BaseModel):
    id: str
    organization_id: str
    project_id: str
    alert_type: str
    severity: str
    title: str
    description: str
    status: str
    owner_id: str | None = None
    waived_by: str | None = None
    waived_until: str | None = None
    waive_reason: str | None = None
    resolved_at: str | None = None
    created_at: str


class AlertResolveRequest(BaseModel):
    notes: str = Field(..., min_length=1, description="Resolution notes")


class AlertWaiveRequest(BaseModel):
    reason: str = Field(..., min_length=1, description="Formal waiver justification")
    expiry_date: datetime = Field(..., description="Waiver expiration date")


class AlertEscalateRequest(BaseModel):
    reason: str = Field(..., min_length=1, description="Escalation rationale")


# -----------------------------------------------------------------------------
# Data Quality Issues Schemas
# -----------------------------------------------------------------------------

DataQualityIssueType = Literal[
    "FORMULA_TOTAL_MISMATCH",
    "MISFILED_DOCUMENT",
    "STATEMENT_COVERAGE_GAP",
    "DUPLICATE_CANDIDATE",
    "DRAW_DEPOSIT_MISMATCH",
]
DataQualityStatus = Literal["OPEN", "RESOLVED", "WAIVED"]


class DataQualityIssueRead(BaseModel):
    id: str
    organization_id: str
    project_id: str
    issue_type: str
    severity: str
    status: str
    source_record_id: str | None = None
    affected_entity_type: str
    affected_entity_id: str
    owner_id: str | None = None
    detected_at: str
    resolved_at: str | None = None
    resolution: str | None = None
    waived_by: str | None = None
    waived_until: str | None = None


class DataQualityResolveRequest(BaseModel):
    resolution: str = Field(..., min_length=1, description="Resolution rationale or action taken")
    resolution_evidence_id: str | None = Field(None, description="Optional document or record proving resolution")
    waive: bool = Field(False, description="Whether to waive rather than resolve")
    waive_until: datetime | None = Field(None, description="Expiration date if waiving")


# -----------------------------------------------------------------------------
# Reports & Dashboard Schemas
# -----------------------------------------------------------------------------

class SourceRef(BaseModel):
    entity_type: str
    entity_id: str
    label: str | None = None
    citation: str | None = None


class ReportRow(BaseModel):
    row_id: str
    category: str
    title: str
    original_budget: int = 0
    current_approved: int = 0
    spent: int = 0
    committed: int = 0
    drawn: int = 0
    funded: int = 0
    remaining: int = 0
    variance: int = 0
    basis: str = "ESTIMATED"  # ACTUAL, COMMITTED, APPROVED, ESTIMATED
    status: str = "NORMAL"
    source_refs: list[SourceRef] = Field(default_factory=list)


class ReportRead(BaseModel):
    project_id: str
    report_type: str  # VARIANCE, FUNDING_GAP, FORECAST, DRAW_STATUS
    as_of: str
    currency: str
    version: str = "v1.0"
    data_quality_state: str  # VERIFIED, PROVISIONAL, INCOMPLETE
    open_exceptions_count: int
    rows: list[ReportRow]
    summary_totals: dict[str, Any]
    source_refs: list[SourceRef] = Field(default_factory=list)


class DashboardExceptionSummary(BaseModel):
    alert_id: str
    alert_type: str
    severity: str
    title: str
    owner_name: str | None = None
    created_at: str


class DashboardControlCenterRead(BaseModel):
    project_id: str
    as_of: str
    currency: str
    data_quality_status: str  # VERIFIED, PROVISIONAL, INCOMPLETE
    gross_development_value: int
    forecast_completion_cost: int
    net_profit: int
    cash_gap: int
    contingency_remaining: int
    senior_debt_committed: int
    senior_debt_drawn: int
    equity_committed: int
    equity_funded: int
    active_draws_count: int
    open_exceptions_count: int
    top_exceptions: list[DashboardExceptionSummary]
    source_refs: list[SourceRef] = Field(default_factory=list)


# -----------------------------------------------------------------------------
# Report Export Schemas
# -----------------------------------------------------------------------------

ExportFormat = Literal["CSV", "XLSX", "PDF"]


class ReportExportRequest(BaseModel):
    report_type: str = Field(..., description="VARIANCE, FUNDING_GAP, FORECAST, DRAW_STATUS")
    format: ExportFormat = Field(..., description="Export format")
    as_of: datetime | None = None


class ReportExportRead(BaseModel):
    id: str
    project_id: str
    report_type: str
    format: str
    status: str  # COMPLETED, FAILED
    download_url: str
    created_at: str


# -----------------------------------------------------------------------------
# Audit Event Schemas
# -----------------------------------------------------------------------------

class AuditEventRead(BaseModel):
    id: str
    organization_id: str
    project_id: str | None = None
    actor_id: str
    action: str
    entity_type: str
    entity_id: str
    previous_value: dict[str, Any] | None = None
    new_value: dict[str, Any] | None = None
    rationale: str | None = None
    source_citation: str | None = None
    occurred_at: str
