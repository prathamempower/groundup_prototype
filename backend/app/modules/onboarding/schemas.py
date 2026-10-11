from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

# ==========================================
# PROJECTS
# ==========================================


class ProjectDuplicateCheckRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    address: str = Field(min_length=1, max_length=500)
    project_entity: str | None = None


class ProjectDuplicateMatch(BaseModel):
    id: str
    name: str
    address: str
    project_entity: str
    lifecycle_stage: str
    similarity_reason: str


class ProjectDuplicateCheckResponse(BaseModel):
    has_matches: bool
    matches: list[ProjectDuplicateMatch] = Field(default_factory=list)


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    project_entity: str = Field(min_length=1, max_length=255)
    address: str = Field(min_length=1, max_length=500)
    lifecycle_stage: str = "PRE_CONSTRUCTION"  # ACQUISITION, PRE_CONSTRUCTION, CONSTRUCTION, COMPLETION, MARKETING, DISPOSITION, CLOSED
    contract_model: str = (
        "GMP"  # OPEN_BOOK, COST_PLUS, FIXED_PRICE, MILESTONE_BASED, PROFIT_SHARE, HYBRID
    )
    currency: str = "USD"
    status: str = "SETUP_INCOMPLETE"
    started_at: datetime | None = None
    target_completion_at: datetime | None = None
    draft_payload: dict[str, Any] | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    project_entity: str | None = Field(default=None, min_length=1, max_length=255)
    address: str | None = Field(default=None, min_length=1, max_length=500)
    lifecycle_stage: str | None = None
    contract_model: str | None = None
    status: str | None = None
    target_completion_at: datetime | None = None


class ProjectRead(BaseModel):
    id: str
    organization_id: str
    name: str
    project_entity: str
    address: str
    lifecycle_stage: str
    contract_model: str
    status: str
    currency: str
    started_at: str | None = None
    target_completion_at: str | None = None
    version: int
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


# ==========================================
# ONBOARDING SESSIONS & QUESTIONS
# ==========================================


class QuestionOption(BaseModel):
    value: str
    label: str


class OnboardingQuestion(BaseModel):
    question_key: str
    question_version: str
    prompt: str
    role_scope: str
    input_type: str  # SELECT, TEXT, NUMBER, BOOLEAN
    section: str = "GENERAL"  # IDENTITY, CAPITAL_LOANS, GOVERNANCE_CONTRACT, OPERATING_ACCOUNTS, MILESTONES_PERMITS, SUBMISSIONS, INVESTOR_PREFERENCES
    help_text: str | None = None
    unlocks: str | None = None
    options: list[QuestionOption] | None = None
    is_high_risk: bool = False
    allow_special_answers: bool = True  # Allows UNKNOWN, NOT_YET_AVAILABLE, NOT_APPLICABLE
    blocking_gate: str | None = None


class OnboardingSessionRead(BaseModel):
    id: str
    organization_id: str
    project_id: str | None = None
    user_id: str
    role: str
    state: str
    question_graph_version: str
    started_at: str
    completed_at: str | None = None
    next_question: OnboardingQuestion | None = None

    model_config = {"from_attributes": True}


class OnboardingAnswerCreate(BaseModel):
    question_key: str
    question_version: str = "v1.0"
    answer_payload: dict[
        str, Any
    ]  # e.g. {"value": "COST_PLUS"} or {"special": "UNKNOWN", "reason": "Contract pending"}
    source_document_id: str | None = None


class OnboardingAnswerRead(BaseModel):
    id: str
    session_id: str
    question_key: str
    question_version: str
    answer_payload: dict[str, Any]
    source_document_id: str | None = None
    status: str
    effective_from: str
    effective_to: str | None = None
    answered_by: str
    approved_by: str | None = None
    approved_at: str | None = None

    model_config = {"from_attributes": True}


# ==========================================
# ONBOARDING TASKS
# ==========================================


class OnboardingTaskRead(BaseModel):
    id: str
    project_id: str
    session_id: str | None = None
    task_type: str
    assigned_to: str | None = None
    status: str
    due_at: str | None = None
    blocking_gate: str | None = None
    created_from_question_key: str | None = None
    resolved_by: str | None = None
    created_at: str

    model_config = {"from_attributes": True}


# ==========================================
# CONFIGURATION VERSIONS
# ==========================================


class ConfigurationVersionRead(BaseModel):
    id: str
    project_id: str
    configuration_type: str
    effective_from: str
    effective_to: str | None = None
    value_payload: dict[str, Any]
    source_answer_id: str | None = None
    approved_by: str | None = None
    approved_at: str | None = None
    supersedes_id: str | None = None
    created_at: str

    model_config = {"from_attributes": True}


class ConfigurationDecisionRequest(BaseModel):
    reason: str | None = None


# ==========================================
# READINESS GATES
# ==========================================


class ReadinessGate(BaseModel):
    gate_name: str
    is_open: bool
    blockers: list[str] = Field(default_factory=list)


class ProjectReadinessRead(BaseModel):
    project_id: str
    overall_status: str  # READY, IN_PROGRESS, BLOCKED
    gates: list[ReadinessGate]
