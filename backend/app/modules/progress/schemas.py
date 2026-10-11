from datetime import date

from pydantic import BaseModel, Field


class MilestoneCreate(BaseModel):
    name: str = Field(min_length=1)
    code: str = Field(min_length=1)
    planned_start_date: date | None = None
    planned_completion_date: date | None = None
    actual_start_date: date | None = None
    actual_completion_date: date | None = None
    forecast_completion_date: date | None = None
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)


class MilestoneUpdate(BaseModel):
    actual_start_date: date | None = None
    actual_completion_date: date | None = None
    forecast_completion_date: date | None = None
    forecast_change_reason: str | None = None
    progress_percentage: float | None = Field(default=None, ge=0.0, le=100.0)
    delay_cause: str | None = None
    regression_reason: str | None = None


class MilestoneEvidenceCreate(BaseModel):
    document_id: str
    evidence_type: str = "PHOTO"  # PHOTO, INSPECTION_REPORT, PERMIT, CONTRACTOR_AFFIDAVIT
    description: str | None = None


class MilestoneVerifyRequest(BaseModel):
    percentage: float = Field(ge=0.0, le=100.0)
    notes: str | None = None
    conflict_flag: bool = False
    rebuttal_notes: str | None = None


class EvidenceRead(BaseModel):
    id: str
    milestone_id: str
    document_id: str
    evidence_type: str
    description: str | None = None
    verified_by: str | None = None
    created_at: str


class ProgressConflictRead(BaseModel):
    has_conflict: bool
    pm_percent: float
    inspector_percent: float
    discrepancy_percent: float
    inspection_id: str | None = None
    notes: str | None = None


class MilestoneRead(BaseModel):
    id: str
    organization_id: str
    project_id: str
    name: str
    code: str
    planned_start_date: str | None = None
    planned_completion_date: str | None = None
    actual_start_date: str | None = None
    actual_completion_date: str | None = None
    forecast_completion_date: str | None = None
    forecast_change_reason: str | None = None
    progress_percentage: float
    status: str
    delay_days: int | None = None
    delay_cause: str | None = None
    evidence: list[EvidenceRead] = []
    conflict: ProgressConflictRead | None = None
    created_at: str


class ScheduleForecastRead(BaseModel):
    project_id: str
    has_schedule_baseline: bool
    target_completion: str | None = None
    forecast_completion: str | None = None
    delay_days: int
    is_delayed: bool
    critical_path_milestone: str | None = None
    critical_path_milestone_id: str | None = None
    carry_impact_monthly: int  # minor units (cents)
    total_carry_cost_exposure: int  # minor units (cents)
    active_discrepancies_count: int
    total_milestones: int
    completed_milestones: int
    overall_progress_percent: float
