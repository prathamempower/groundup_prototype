import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_project_scope, require_role
from app.core.envelope import ResponseEnvelope
from app.db.models import OnboardingTask, Project, User
from app.db.session import get_db
from app.modules.onboarding.schemas import (
    ConfigurationDecisionRequest,
    ConfigurationVersionRead,
    OnboardingAnswerCreate,
    OnboardingAnswerRead,
    OnboardingSessionRead,
    OnboardingTaskRead,
    ProjectCreate,
    ProjectDuplicateCheckRequest,
    ProjectDuplicateCheckResponse,
    ProjectRead,
    ProjectReadinessRead,
    ProjectUpdate,
)
from app.modules.onboarding.service import OnboardingService

router = APIRouter()


# ==========================================
# PROJECTS
# ==========================================


@router.post("/projects/check-duplicates", response_model=ResponseEnvelope[ProjectDuplicateCheckResponse])
async def check_project_duplicates_endpoint(
    data: ProjectDuplicateCheckRequest,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = OnboardingService(db)
    result = service.check_duplicates(owner, data)
    return ResponseEnvelope(data=result)


@router.get("/projects", response_model=ResponseEnvelope[list[ProjectRead]])
async def list_projects(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = OnboardingService(db)
    projects = service.list_projects_for_user(user)
    results = [
        ProjectRead(
            id=str(p.id),
            organization_id=str(p.organization_id),
            name=p.name,
            project_entity=p.project_entity,
            address=p.address,
            lifecycle_stage=p.lifecycle_stage,
            contract_model=p.contract_model,
            status=p.status,
            currency=p.currency,
            started_at=p.started_at.isoformat() if p.started_at else None,
            target_completion_at=p.target_completion_at.isoformat()
            if p.target_completion_at
            else None,
            version=p.version,
            created_at=p.created_at.isoformat(),
            updated_at=p.updated_at.isoformat(),
        )
        for p in projects
    ]
    return ResponseEnvelope(data=results)


@router.post("/projects", response_model=ResponseEnvelope[ProjectRead])
async def create_project_endpoint(
    data: ProjectCreate,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = OnboardingService(db)
    p = service.create_project(owner, data)
    db.commit()
    return ResponseEnvelope(
        data=ProjectRead(
            id=str(p.id),
            organization_id=str(p.organization_id),
            name=p.name,
            project_entity=p.project_entity,
            address=p.address,
            lifecycle_stage=p.lifecycle_stage,
            contract_model=p.contract_model,
            status=p.status,
            currency=p.currency,
            started_at=p.started_at.isoformat() if p.started_at else None,
            target_completion_at=p.target_completion_at.isoformat()
            if p.target_completion_at
            else None,
            version=p.version,
            created_at=p.created_at.isoformat(),
            updated_at=p.updated_at.isoformat(),
        )
    )


@router.get("/projects/{pid}", response_model=ResponseEnvelope[ProjectRead])
async def get_project(
    pid: uuid.UUID,
    project: Project = Depends(require_project_scope),
):
    return ResponseEnvelope(
        data=ProjectRead(
            id=str(project.id),
            organization_id=str(project.organization_id),
            name=project.name,
            project_entity=project.project_entity,
            address=project.address,
            lifecycle_stage=project.lifecycle_stage,
            contract_model=project.contract_model,
            status=project.status,
            currency=project.currency,
            started_at=project.started_at.isoformat() if project.started_at else None,
            target_completion_at=project.target_completion_at.isoformat()
            if project.target_completion_at
            else None,
            version=project.version,
            created_at=project.created_at.isoformat(),
            updated_at=project.updated_at.isoformat(),
        )
    )


@router.patch("/projects/{pid}", response_model=ResponseEnvelope[ProjectRead])
async def update_project_endpoint(
    pid: uuid.UUID,
    data: ProjectUpdate,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = OnboardingService(db)
    p = service.update_project(owner, pid, data)
    db.commit()
    return ResponseEnvelope(
        data=ProjectRead(
            id=str(p.id),
            organization_id=str(p.organization_id),
            name=p.name,
            project_entity=p.project_entity,
            address=p.address,
            lifecycle_stage=p.lifecycle_stage,
            contract_model=p.contract_model,
            status=p.status,
            currency=p.currency,
            started_at=p.started_at.isoformat() if p.started_at else None,
            target_completion_at=p.target_completion_at.isoformat()
            if p.target_completion_at
            else None,
            version=p.version,
            created_at=p.created_at.isoformat(),
            updated_at=p.updated_at.isoformat(),
        )
    )


@router.get("/projects/{pid}/readiness", response_model=ResponseEnvelope[ProjectReadinessRead])
async def get_project_readiness(
    pid: uuid.UUID,
    project: Project = Depends(require_project_scope),
    db: Session = Depends(get_db),
):
    service = OnboardingService(db)
    readiness = service.evaluate_project_readiness(project)
    return ResponseEnvelope(data=readiness)


# ==========================================
# ONBOARDING SESSIONS & QUESTION GRAPH
# ==========================================


@router.get("/onboarding/sessions/current", response_model=ResponseEnvelope[OnboardingSessionRead])
async def get_current_onboarding_session(
    project_id: uuid.UUID | None = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = OnboardingService(db)
    session_read = service.get_or_create_current_session(user, project_id)
    db.commit()
    return ResponseEnvelope(data=session_read)


@router.post(
    "/onboarding/sessions/{sid}/answers", response_model=ResponseEnvelope[OnboardingAnswerRead]
)
async def submit_onboarding_answer(
    sid: uuid.UUID,
    data: OnboardingAnswerCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = OnboardingService(db)
    ans = service.submit_answer(user, sid, data)
    db.commit()
    return ResponseEnvelope(
        data=OnboardingAnswerRead(
            id=str(ans.id),
            session_id=str(ans.session_id),
            question_key=ans.question_key,
            question_version=ans.question_version,
            answer_payload=ans.answer_payload,
            source_document_id=str(ans.source_document_id) if ans.source_document_id else None,
            status=ans.status,
            effective_from=ans.effective_from.isoformat(),
            effective_to=ans.effective_to.isoformat() if ans.effective_to else None,
            answered_by=str(ans.answered_by),
            approved_by=str(ans.approved_by) if ans.approved_by else None,
            approved_at=ans.approved_at.isoformat() if ans.approved_at else None,
        )
    )


# ==========================================
# DELEGATED TASKS
# ==========================================


@router.get(
    "/projects/{pid}/onboarding/tasks", response_model=ResponseEnvelope[list[OnboardingTaskRead]]
)
async def list_onboarding_tasks(
    pid: uuid.UUID,
    project: Project = Depends(require_project_scope),
    db: Session = Depends(get_db),
):
    tasks = db.scalars(select(OnboardingTask).where(OnboardingTask.project_id == project.id)).all()
    results = [
        OnboardingTaskRead(
            id=str(t.id),
            project_id=str(t.project_id),
            session_id=str(t.session_id) if t.session_id else None,
            task_type=t.task_type,
            assigned_to=str(t.assigned_to) if t.assigned_to else None,
            status=t.status,
            due_at=t.due_at.isoformat() if t.due_at else None,
            blocking_gate=t.blocking_gate,
            created_from_question_key=t.created_from_question_key,
            resolved_by=str(t.resolved_by) if t.resolved_by else None,
            created_at=t.created_at.isoformat(),
        )
        for t in tasks
    ]
    return ResponseEnvelope(data=results)


# ==========================================
# CONFIGURATION VERSION APPROVAL FLOW
# ==========================================


@router.post(
    "/configuration-versions/{id}/approve",
    response_model=ResponseEnvelope[ConfigurationVersionRead],
)
async def approve_configuration_endpoint(
    id: uuid.UUID,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = OnboardingService(db)
    config = service.approve_configuration(owner, id)
    db.commit()
    return ResponseEnvelope(
        data=ConfigurationVersionRead(
            id=str(config.id),
            project_id=str(config.project_id),
            configuration_type=config.configuration_type,
            effective_from=config.effective_from.isoformat(),
            effective_to=config.effective_to.isoformat() if config.effective_to else None,
            value_payload=config.value_payload,
            source_answer_id=str(config.source_answer_id) if config.source_answer_id else None,
            approved_by=str(config.approved_by) if config.approved_by else None,
            approved_at=config.approved_at.isoformat() if config.approved_at else None,
            supersedes_id=str(config.supersedes_id) if config.supersedes_id else None,
            created_at=config.created_at.isoformat(),
        )
    )


@router.post(
    "/configuration-versions/{id}/reject", response_model=ResponseEnvelope[ConfigurationVersionRead]
)
async def reject_configuration_endpoint(
    id: uuid.UUID,
    data: ConfigurationDecisionRequest | None = None,
    owner: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
):
    service = OnboardingService(db)
    reason = data.reason if data else None
    config = service.reject_configuration(owner, id, reason)
    db.commit()
    return ResponseEnvelope(
        data=ConfigurationVersionRead(
            id=str(config.id),
            project_id=str(config.project_id),
            configuration_type=config.configuration_type,
            effective_from=config.effective_from.isoformat(),
            effective_to=config.effective_to.isoformat() if config.effective_to else None,
            value_payload=config.value_payload,
            source_answer_id=str(config.source_answer_id) if config.source_answer_id else None,
            approved_by=str(config.approved_by) if config.approved_by else None,
            approved_at=config.approved_at.isoformat() if config.approved_at else None,
            supersedes_id=str(config.supersedes_id) if config.supersedes_id else None,
            created_at=config.created_at.isoformat(),
        )
    )
