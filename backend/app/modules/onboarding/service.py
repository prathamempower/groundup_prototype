import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import (
    ForbiddenException,
    NotFoundException,
    ValidationFailedException,
)
from app.db.audit import record_audit_event
from app.db.models import (
    ConfigurationVersion,
    OnboardingAnswer,
    OnboardingSession,
    OnboardingTask,
    Project,
    User,
    generate_uuid,
    utc_now,
)
from app.modules.onboarding.question_graph import get_next_question_for_role
from app.modules.onboarding.schemas import (
    OnboardingAnswerCreate,
    OnboardingSessionRead,
    ProjectCreate,
    ProjectDuplicateCheckRequest,
    ProjectDuplicateCheckResponse,
    ProjectDuplicateMatch,
    ProjectReadinessRead,
    ProjectUpdate,
    ReadinessGate,
)


class OnboardingService:
    def __init__(self, db: Session):
        self.db = db

    # ==========================================
    # PROJECT MANAGEMENT
    # ==========================================

    def check_duplicates(
        self, owner: User, data: ProjectDuplicateCheckRequest
    ) -> ProjectDuplicateCheckResponse:
        projects = self.db.scalars(
            select(Project).where(Project.organization_id == owner.organization_id)
        ).all()
        matches: list[ProjectDuplicateMatch] = []
        req_name = data.name.strip().lower()
        req_addr = data.address.strip().lower()
        req_ent = (data.project_entity or "").strip().lower()

        for p in projects:
            p_name = p.name.strip().lower()
            p_addr = p.address.strip().lower()
            p_ent = (p.project_entity or "").strip().lower()

            reasons: list[str] = []
            if req_addr and (req_addr in p_addr or p_addr in req_addr):
                reasons.append("Matching address")
            if req_name and (req_name in p_name or p_name in req_name):
                reasons.append("Similar project name")
            if req_ent and p_ent and (req_ent in p_ent or p_ent in req_ent):
                reasons.append("Matching legal entity")

            if reasons:
                matches.append(
                    ProjectDuplicateMatch(
                        id=str(p.id),
                        name=p.name,
                        address=p.address,
                        project_entity=p.project_entity,
                        lifecycle_stage=p.lifecycle_stage,
                        similarity_reason=", ".join(reasons),
                    )
                )

        return ProjectDuplicateCheckResponse(
            has_matches=len(matches) > 0,
            matches=matches,
        )

    def create_project(self, owner: User, data: ProjectCreate) -> Project:
        if owner.role != "OWNER":
            raise ForbiddenException(message="Only Owners can create new projects.")

        project = Project(
            id=generate_uuid(),
            organization_id=owner.organization_id,
            name=data.name,
            project_entity=data.project_entity,
            address=data.address,
            lifecycle_stage=data.lifecycle_stage,
            contract_model=data.contract_model,
            status=data.status or "SETUP_INCOMPLETE",
            currency=data.currency,
            started_at=data.started_at,
            target_completion_at=data.target_completion_at,
            version=1,
            created_at=utc_now(),
        )
        self.db.add(project)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=owner.organization_id,
            project_id=project.id,
            actor_id=owner.id,
            action="PROJECT_CREATED",
            entity_type="Project",
            entity_id=project.id,
            new_value={
                "name": project.name,
                "entity": project.project_entity,
                "contract_model": project.contract_model,
            },
            rationale="Owner created project",
        )

        # Automatically spawn initial onboarding tasks for CFO and PM
        cfo_task = OnboardingTask(
            id=generate_uuid(),
            project_id=project.id,
            task_type="CONFIGURE_FINANCIAL_ACCOUNTS",
            status="PENDING",
            blocking_gate="VERIFIED_DASHBOARD",
            created_at=utc_now(),
        )
        pm_task = OnboardingTask(
            id=generate_uuid(),
            project_id=project.id,
            task_type="ESTABLISH_MILESTONE_SCHEDULE",
            status="PENDING",
            blocking_gate="SUBMISSION_READY_DRAW",
            created_at=utc_now(),
        )
        self.db.add(cfo_task)
        self.db.add(pm_task)
        self.db.flush()

        return project

    def list_projects_for_user(self, user: User) -> list[Project]:
        if user.role in ["OWNER", "CFO"]:
            stmt = select(Project).where(Project.organization_id == user.organization_id)
            return list(self.db.scalars(stmt).all())

        # For PM, GC, INVESTOR, filter by project memberships
        from app.db.models import ProjectMember

        stmt = (
            select(Project)
            .join(ProjectMember, ProjectMember.project_id == Project.id)
            .where(ProjectMember.user_id == user.id)
        )
        return list(self.db.scalars(stmt).all())

    def update_project(self, owner: User, project_id: uuid.UUID, data: ProjectUpdate) -> Project:
        if owner.role != "OWNER":
            raise ForbiddenException(message="Only Owners can update project identity fields.")

        project = self.db.get(Project, project_id)
        if not project or project.organization_id != owner.organization_id:
            raise NotFoundException(message="Project not found.")

        prev_val = {
            "name": project.name,
            "lifecycle_stage": project.lifecycle_stage,
            "contract_model": project.contract_model,
        }

        if data.name:
            project.name = data.name
        if data.project_entity:
            project.project_entity = data.project_entity
        if data.address:
            project.address = data.address
        if data.lifecycle_stage:
            project.lifecycle_stage = data.lifecycle_stage
        if data.contract_model:
            project.contract_model = data.contract_model
        if data.status:
            project.status = data.status
        if data.target_completion_at:
            project.target_completion_at = data.target_completion_at

        project.version += 1
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=owner.organization_id,
            project_id=project.id,
            actor_id=owner.id,
            action="PROJECT_UPDATED",
            entity_type="Project",
            entity_id=project.id,
            previous_value=prev_val,
            new_value={
                "name": project.name,
                "lifecycle_stage": project.lifecycle_stage,
                "contract_model": project.contract_model,
            },
            rationale="Owner updated project fields",
        )

        return project

    # ==========================================
    # ONBOARDING SESSIONS & QUESTION GRAPH
    # ==========================================

    def get_or_create_current_session(
        self, user: User, project_id: uuid.UUID | None = None
    ) -> OnboardingSessionRead:
        stmt = select(OnboardingSession).where(
            OnboardingSession.user_id == user.id,
            OnboardingSession.state != "COMPLETED",
        )
        if project_id:
            stmt = stmt.where(OnboardingSession.project_id == project_id)

        session = self.db.scalars(stmt).first()
        if not session:
            session = OnboardingSession(
                id=generate_uuid(),
                organization_id=user.organization_id,
                project_id=project_id,
                user_id=user.id,
                role=user.role,
                state="ROLE_SETUP_IN_PROGRESS",
                question_graph_version="v1.0",
                started_at=utc_now(),
            )
            self.db.add(session)
            self.db.flush()

        # Find answered questions
        answers = self.db.scalars(
            select(OnboardingAnswer).where(OnboardingAnswer.session_id == session.id)
        ).all()
        answered_keys = {a.question_key for a in answers}
        answers_map = {a.question_key: a.answer_payload for a in answers}

        # Calculate next permitted question from graph
        next_q = get_next_question_for_role(user.role, answered_keys, answers_map)

        return OnboardingSessionRead(
            id=str(session.id),
            organization_id=str(session.organization_id),
            project_id=str(session.project_id) if session.project_id else None,
            user_id=str(session.user_id),
            role=session.role,
            state=session.state,
            question_graph_version=session.question_graph_version,
            started_at=session.started_at.isoformat(),
            completed_at=session.completed_at.isoformat() if session.completed_at else None,
            next_question=next_q,
        )

    def submit_answer(
        self, user: User, session_id: uuid.UUID, data: OnboardingAnswerCreate
    ) -> OnboardingAnswer:
        session = self.db.get(OnboardingSession, session_id)
        if not session or session.user_id != user.id:
            raise NotFoundException(message="Onboarding session not found.")

        # Validate that this is the expected next permitted question
        answers = self.db.scalars(
            select(OnboardingAnswer).where(OnboardingAnswer.session_id == session.id)
        ).all()
        answered_keys = {a.question_key for a in answers}
        answers_map = {a.question_key: a.answer_payload for a in answers}
        expected_q = get_next_question_for_role(user.role, answered_keys, answers_map)

        if not expected_q or expected_q.question_key != data.question_key:
            raise ValidationFailedException(
                message=f"Question '{data.question_key}' is not permitted or already answered."
            )

        payload = data.answer_payload
        is_special = any(
            k in payload for k in ["UNKNOWN", "NOT_YET_AVAILABLE", "NOT_APPLICABLE"]
        ) or payload.get("special") in ["UNKNOWN", "NOT_YET_AVAILABLE", "NOT_APPLICABLE"]

        status = "SUBMITTED"

        answer = OnboardingAnswer(
            id=generate_uuid(),
            session_id=session.id,
            question_key=data.question_key,
            question_version=data.question_version,
            answer_payload=payload,
            source_document_id=uuid.UUID(data.source_document_id)
            if data.source_document_id
            else None,
            status=status,
            effective_from=utc_now(),
            answered_by=user.id,
        )
        self.db.add(answer)
        self.db.flush()

        # If answer is UNKNOWN / NOT_YET_AVAILABLE, create follow-up task
        if is_special and session.project_id:
            task = OnboardingTask(
                id=generate_uuid(),
                project_id=session.project_id,
                session_id=session.id,
                task_type=f"RESOLVE_ANSWER_{data.question_key}",
                assigned_to=user.id,
                status="PENDING",
                created_from_question_key=data.question_key,
                created_at=utc_now(),
            )
            self.db.add(task)

        # If question is high-risk, create a ConfigurationVersion requiring Owner approval
        if expected_q.is_high_risk and session.project_id:
            config_ver = ConfigurationVersion(
                id=generate_uuid(),
                project_id=session.project_id,
                configuration_type=data.question_key,
                effective_from=utc_now(),
                value_payload=payload,
                source_answer_id=answer.id,
                created_at=utc_now(),
            )
            self.db.add(config_ver)

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=session.organization_id,
            project_id=session.project_id,
            actor_id=user.id,
            action="ONBOARDING_ANSWER_SUBMITTED",
            entity_type="OnboardingAnswer",
            entity_id=answer.id,
            new_value={"question_key": answer.question_key, "payload": answer.answer_payload},
            rationale="User submitted onboarding answer",
        )

        return answer

    # ==========================================
    # CONFIGURATION VERSION APPROVALS (OWNER)
    # ==========================================

    def approve_configuration(self, owner: User, config_id: uuid.UUID) -> ConfigurationVersion:
        if owner.role != "OWNER":
            raise ForbiddenException(message="Only Owners can approve high-risk configurations.")

        config = self.db.get(ConfigurationVersion, config_id)
        if not config:
            raise NotFoundException(message="Configuration version not found.")

        config.approved_by = owner.id
        config.approved_at = utc_now()
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=owner.organization_id,
            project_id=config.project_id,
            actor_id=owner.id,
            action="CONFIGURATION_VERSION_APPROVED",
            entity_type="ConfigurationVersion",
            entity_id=config.id,
            new_value={"type": config.configuration_type, "payload": config.value_payload},
            rationale="Owner approved configuration version",
        )

        return config

    def reject_configuration(
        self, owner: User, config_id: uuid.UUID, reason: str | None
    ) -> ConfigurationVersion:
        if owner.role != "OWNER":
            raise ForbiddenException(message="Only Owners can reject configurations.")

        config = self.db.get(ConfigurationVersion, config_id)
        if not config:
            raise NotFoundException(message="Configuration version not found.")

        config.effective_to = utc_now()
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=owner.organization_id,
            project_id=config.project_id,
            actor_id=owner.id,
            action="CONFIGURATION_VERSION_REJECTED",
            entity_type="ConfigurationVersion",
            entity_id=config.id,
            rationale=reason or "Owner rejected configuration version",
        )

        return config

    # ==========================================
    # READINESS GATES
    # ==========================================

    def evaluate_project_readiness(self, project: Project) -> ProjectReadinessRead:
        # Check open blocking tasks
        open_tasks = self.db.scalars(
            select(OnboardingTask).where(
                OnboardingTask.project_id == project.id,
                OnboardingTask.status.in_(["PENDING", "IN_PROGRESS", "BLOCKED"]),
            )
        ).all()

        dashboard_blockers = [
            t.task_type for t in open_tasks if t.blocking_gate == "VERIFIED_DASHBOARD"
        ]
        draw_blockers = [
            t.task_type for t in open_tasks if t.blocking_gate == "SUBMISSION_READY_DRAW"
        ]
        investor_blockers: list[str] = []
        closeout_blockers: list[str] = []

        if project.lifecycle_stage != "CLOSED":
            closeout_blockers.append("Project is not in disposition/completion phase")

        gates = [
            ReadinessGate(
                gate_name="VERIFIED_DASHBOARD",
                is_open=len(dashboard_blockers) == 0,
                blockers=dashboard_blockers,
            ),
            ReadinessGate(
                gate_name="SUBMISSION_READY_DRAW",
                is_open=len(draw_blockers) == 0,
                blockers=draw_blockers,
            ),
            ReadinessGate(
                gate_name="INVESTOR_PUBLICATION", is_open=True, blockers=investor_blockers
            ),
            ReadinessGate(
                gate_name="PROJECT_CLOSEOUT",
                is_open=len(closeout_blockers) == 0,
                blockers=closeout_blockers,
            ),
        ]

        any_blocked = any(not g.is_open for g in gates)

        return ProjectReadinessRead(
            project_id=str(project.id),
            overall_status="BLOCKED" if any_blocked else "READY",
            gates=gates,
        )
