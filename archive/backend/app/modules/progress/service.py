import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import (
    ForbiddenException,
    NotFoundException,
    ValidationFailedException,
)
from app.db.audit import record_audit_event
from app.db.models import (
    Alert,
    Document,
    Inspection,
    Loan,
    LoanTerm,
    ProgressEvidence,
    ProgressRecord,
    Project,
    ProjectMilestone,
    User,
    generate_uuid,
    utc_now,
)
from app.modules.progress.schemas import (
    EvidenceRead,
    MilestoneCreate,
    MilestoneEvidenceCreate,
    MilestoneRead,
    MilestoneUpdate,
    MilestoneVerifyRequest,
    ProgressConflictRead,
    ScheduleForecastRead,
)


class ProgressService:
    def __init__(self, db: Session):
        self.db = db

    def _get_project_with_access(self, user: User, project_id: uuid.UUID) -> Project:
        project = self.db.get(Project, project_id)
        if not project or project.organization_id != user.organization_id:
            raise NotFoundException(message="Project not found.")
        return project

    def _get_milestone_with_access(self, user: User, milestone_id: uuid.UUID) -> ProjectMilestone:
        milestone = self.db.get(ProjectMilestone, milestone_id)
        if not milestone or milestone.organization_id != user.organization_id:
            raise NotFoundException(message="Milestone not found.")
        return milestone

    # ---------------------------------------------------------
    # 1. MILESTONE CRUD & LIST
    # ---------------------------------------------------------
    def list_milestones(self, user: User, project_id: uuid.UUID) -> list[ProjectMilestone]:
        self._get_project_with_access(user, project_id)
        return list(
            self.db.scalars(
                select(ProjectMilestone)
                .where(ProjectMilestone.project_id == project_id)
                .order_by(ProjectMilestone.planned_completion_date.asc().nulls_last())
            ).all()
        )

    def create_milestone(
        self, user: User, project_id: uuid.UUID, data: MilestoneCreate
    ) -> ProjectMilestone:
        if user.role not in ["OWNER", "PM"]:
            raise ForbiddenException(message="Only PM or Owner can plan major milestones.")

        project = self._get_project_with_access(user, project_id)

        # Validation rule: planned_start <= planned_finish if both provided
        if data.planned_start_date and data.planned_completion_date:
            if data.planned_start_date > data.planned_completion_date:
                raise ValidationFailedException(
                    message="planned_start_date cannot be after planned_completion_date."
                )

        if data.actual_start_date and data.actual_completion_date:
            if data.actual_start_date > data.actual_completion_date:
                raise ValidationFailedException(
                    message="actual_start_date cannot be after actual_completion_date."
                )

        # Initial status
        init_status = "NOT_STARTED"
        if data.progress_percentage >= 100.0 or data.actual_completion_date:
            init_status = "COMPLETED"
        elif data.progress_percentage > 0.0 or data.actual_start_date:
            init_status = "IN_PROGRESS"

        milestone = ProjectMilestone(
            id=generate_uuid(),
            organization_id=user.organization_id,
            project_id=project.id,
            name=data.name,
            code=data.code,
            planned_start_date=data.planned_start_date,
            planned_completion_date=data.planned_completion_date,
            actual_start_date=data.actual_start_date,
            actual_completion_date=data.actual_completion_date,
            forecast_completion_date=data.forecast_completion_date or data.planned_completion_date,
            progress_percentage=data.progress_percentage,
            status=init_status,
            created_at=utc_now(),
        )
        self.db.add(milestone)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="MILESTONE_CREATED",
            entity_type="ProjectMilestone",
            entity_id=milestone.id,
            new_value={"name": milestone.name, "code": milestone.code},
            rationale="Planned major milestone",
        )
        return milestone

    # ---------------------------------------------------------
    # 2. UPDATE MILESTONE (PM)
    # ---------------------------------------------------------
    def update_milestone(
        self, user: User, milestone_id: uuid.UUID, data: MilestoneUpdate
    ) -> ProjectMilestone:
        if user.role not in ["PM", "OWNER"]:
            raise ForbiddenException(message="Only PM or Owner can update milestones.")

        milestone = self._get_milestone_with_access(user, milestone_id)

        # Baseline protection: planned_start_date and planned_completion_date are NEVER modified here
        # Moving forecast date requires a reason
        if data.forecast_completion_date is not None:
            if (
                milestone.forecast_completion_date is not None
                and data.forecast_completion_date != milestone.forecast_completion_date
            ):
                if not data.forecast_change_reason or not data.forecast_change_reason.strip():
                    raise ValidationFailedException(
                        message="A reason is required when moving the milestone forecast completion date."
                    )
            milestone.forecast_completion_date = data.forecast_completion_date
            if data.forecast_change_reason:
                milestone.forecast_change_reason = data.forecast_change_reason

        # Actual start / completion dates
        if data.actual_start_date is not None:
            milestone.actual_start_date = data.actual_start_date

        if data.actual_completion_date is not None:
            milestone.actual_completion_date = data.actual_completion_date

        if milestone.actual_start_date and milestone.actual_completion_date:
            if milestone.actual_start_date > milestone.actual_completion_date:
                raise ValidationFailedException(
                    message="actual_start_date cannot be after actual_completion_date."
                )

        if milestone.actual_start_date and milestone.forecast_completion_date:
            if milestone.forecast_completion_date < milestone.actual_start_date:
                raise ValidationFailedException(
                    message="forecast_completion_date cannot be before actual_start_date once work has started."
                )

        # Progress percentage update
        prev_percent = float(milestone.progress_percentage)
        if data.progress_percentage is not None:
            new_percent = data.progress_percentage
            # Regressing progress requires a correction reason
            if new_percent < prev_percent:
                if not data.regression_reason or not data.regression_reason.strip():
                    raise ValidationFailedException(
                        message="Regressing milestone progress requires a correction reason."
                    )
            milestone.progress_percentage = new_percent

            # Add progress record entry
            p_rec = ProgressRecord(
                id=generate_uuid(),
                milestone_id=milestone.id,
                recorded_date=date.today(),
                percentage=new_percent,
                notes=data.forecast_change_reason or data.regression_reason or "Progress updated",
                verified_by=user.id,
                created_at=utc_now(),
            )
            self.db.add(p_rec)

        # Status derivation
        curr_percent = float(milestone.progress_percentage)
        if curr_percent >= 100.0 or milestone.actual_completion_date:
            milestone.status = "COMPLETED"
        elif milestone.planned_completion_date and milestone.forecast_completion_date:
            if milestone.forecast_completion_date > milestone.planned_completion_date:
                milestone.status = "DELAYED"
            elif curr_percent > 0.0 or milestone.actual_start_date:
                milestone.status = "IN_PROGRESS"
        elif curr_percent > 0.0 or milestone.actual_start_date:
            milestone.status = "IN_PROGRESS"

        self.db.flush()

        # Trigger delayed milestone alert check
        self._evaluate_milestone_delay_alert(user, milestone, data.delay_cause)

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=milestone.project_id,
            actor_id=user.id,
            action="MILESTONE_UPDATED",
            entity_type="ProjectMilestone",
            entity_id=milestone.id,
            new_value={
                "progress_percentage": float(milestone.progress_percentage),
                "forecast_completion_date": (
                    milestone.forecast_completion_date.isoformat()
                    if milestone.forecast_completion_date
                    else None
                ),
                "status": milestone.status,
            },
            rationale=data.forecast_change_reason or "Milestone progress updated",
        )
        return milestone

    def _evaluate_milestone_delay_alert(
        self, user: User, milestone: ProjectMilestone, delay_cause: str | None
    ) -> None:
        if (
            milestone.planned_completion_date
            and milestone.forecast_completion_date
            and milestone.forecast_completion_date > milestone.planned_completion_date
        ):
            delay_days = (milestone.forecast_completion_date - milestone.planned_completion_date).days
            # Check if active DELAYED_MILESTONE alert exists
            existing_alert = self.db.scalars(
                select(Alert).where(
                    Alert.project_id == milestone.project_id,
                    Alert.alert_type == "DELAYED_MILESTONE",
                    Alert.status == "OPEN",
                )
            ).first()

            desc = f"Milestone '{milestone.name}' delayed by {delay_days} days."
            if delay_cause:
                desc += f" Cause: {delay_cause}"

            if not existing_alert:
                alert = Alert(
                    id=generate_uuid(),
                    organization_id=user.organization_id,
                    project_id=milestone.project_id,
                    alert_type="DELAYED_MILESTONE",
                    severity="HIGH" if delay_days > 14 else "MEDIUM",
                    title=f"Schedule Delay: {milestone.name}",
                    description=desc,
                    status="OPEN",
                    created_at=utc_now(),
                )
                self.db.add(alert)
            else:
                existing_alert.description = desc
                existing_alert.severity = "HIGH" if delay_days > 14 else "MEDIUM"

    # ---------------------------------------------------------
    # 3. ATTACH EVIDENCE (PM, GC)
    # ---------------------------------------------------------
    def attach_evidence(
        self, user: User, milestone_id: uuid.UUID, data: MilestoneEvidenceCreate
    ) -> ProgressEvidence:
        if user.role not in ["PM", "GC", "OWNER"]:
            raise ForbiddenException(message="Only PM, GC, or Owner can attach milestone evidence.")

        milestone = self._get_milestone_with_access(user, milestone_id)

        doc_uuid = uuid.UUID(data.document_id)
        doc = self.db.get(Document, doc_uuid)
        if not doc or doc.organization_id != user.organization_id:
            raise NotFoundException(message=f"Document {data.document_id} not found.")

        evidence = ProgressEvidence(
            id=generate_uuid(),
            milestone_id=milestone.id,
            document_id=doc.id,
            evidence_type=data.evidence_type,
            description=data.description,
            verified_by=user.id if user.role == "PM" else None,
            created_at=utc_now(),
        )
        self.db.add(evidence)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=milestone.project_id,
            actor_id=user.id,
            action="PROGRESS_EVIDENCE_ATTACHED",
            entity_type="ProgressEvidence",
            entity_id=evidence.id,
            new_value={"evidence_type": evidence.evidence_type, "document_id": str(doc.id)},
            rationale="Attached progress evidence attachment",
        )
        return evidence

    # ---------------------------------------------------------
    # 4. PM VERIFICATION & DISCREPANCY CONFLICT
    # ---------------------------------------------------------
    def verify_milestone_progress(
        self, user: User, milestone_id: uuid.UUID, data: MilestoneVerifyRequest
    ) -> ProjectMilestone:
        if user.role not in ["PM", "OWNER"]:
            raise ForbiddenException(message="Only PM or Owner can verify milestone progress.")

        milestone = self._get_milestone_with_access(user, milestone_id)

        # Check latest inspection for this project to check discrepancy
        latest_inspection = self.db.scalars(
            select(Inspection)
            .where(Inspection.project_id == milestone.project_id)
            .order_by(Inspection.inspection_date.desc(), Inspection.created_at.desc())
        ).first()

        conflict_flag = data.conflict_flag
        # If inspection is FAILED or CONDITIONAL while claimed percent is high, flag conflict
        if latest_inspection and latest_inspection.result in ["FAILED", "CONDITIONAL"]:
            if data.percentage > 50.0 and not data.rebuttal_notes:
                conflict_flag = True

        if conflict_flag:
            # Raise DATA_CONFLICT Alert
            existing_alert = self.db.scalars(
                select(Alert).where(
                    Alert.project_id == milestone.project_id,
                    Alert.alert_type == "DATA_CONFLICT",
                    Alert.status == "OPEN",
                )
            ).first()

            if not existing_alert:
                alert = Alert(
                    id=generate_uuid(),
                    organization_id=user.organization_id,
                    project_id=milestone.project_id,
                    alert_type="DATA_CONFLICT",
                    severity="HIGH",
                    title=f"Progress Evidence Conflict: {milestone.name}",
                    description=(
                        f"PM claimed {data.percentage}% complete, but attached inspection evidence "
                        f"reports discrepancy ({latest_inspection.result if latest_inspection else 'disputed'})."
                    ),
                    status="OPEN",
                    created_at=utc_now(),
                )
                self.db.add(alert)

        # Record progress verification
        p_rec = ProgressRecord(
            id=generate_uuid(),
            milestone_id=milestone.id,
            recorded_date=date.today(),
            percentage=data.percentage,
            notes=data.notes or ("Conflict noted" if conflict_flag else "PM Verified"),
            verified_by=user.id,
            created_at=utc_now(),
        )
        self.db.add(p_rec)

        milestone.progress_percentage = data.percentage
        if data.percentage >= 100.0:
            milestone.status = "COMPLETED"
        elif milestone.status != "DELAYED":
            milestone.status = "IN_PROGRESS"

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=milestone.project_id,
            actor_id=user.id,
            action="MILESTONE_PROGRESS_VERIFIED",
            entity_type="ProjectMilestone",
            entity_id=milestone.id,
            new_value={"percentage": data.percentage, "conflict_flag": conflict_flag},
            rationale="PM verified physical milestone progress",
        )
        return milestone

    # ---------------------------------------------------------
    # 5. SCHEDULE FORECAST & CARRY COST ESTIMATION
    # ---------------------------------------------------------
    def get_schedule_forecast(self, user: User, project_id: uuid.UUID) -> ScheduleForecastRead:
        project = self._get_project_with_access(user, project_id)

        milestones = list(
            self.db.scalars(
                select(ProjectMilestone)
                .where(ProjectMilestone.project_id == project.id)
                .order_by(ProjectMilestone.planned_completion_date.asc().nulls_last())
            ).all()
        )

        has_baseline = any(m.planned_completion_date is not None for m in milestones)
        target_dates: list[date] = [
            m.planned_completion_date for m in milestones if m.planned_completion_date is not None
        ]
        forecast_dates: list[date] = [
            (m.forecast_completion_date or m.planned_completion_date)  # type: ignore[misc]
            for m in milestones
            if (m.forecast_completion_date is not None or m.planned_completion_date is not None)
        ]

        target_completion: date | None = max(target_dates) if target_dates else None
        forecast_completion: date | None = max(forecast_dates) if forecast_dates else None

        delay_days = 0
        is_delayed = False
        critical_milestone = None
        critical_milestone_id = None

        if target_completion and forecast_completion:
            if forecast_completion > target_completion:
                delay_days = (forecast_completion - target_completion).days
                is_delayed = True

        # Find critical path milestone (latest forecast completion)
        if milestones:
            sorted_by_forecast = sorted(
                milestones,
                key=lambda m: (m.forecast_completion_date or m.planned_completion_date or date.min),
                reverse=True,
            )
            critical_milestone = sorted_by_forecast[0].name
            critical_milestone_id = str(sorted_by_forecast[0].id)

        # Carry-cost estimation from loan terms
        loan = self.db.scalars(select(Loan).where(Loan.project_id == project.id)).first()
        monthly_carry = 0
        total_carry_exposure = 0

        if loan and is_delayed and delay_days > 0:
            loan_term = self.db.scalars(
                select(LoanTerm).where(LoanTerm.loan_id == loan.id)
            ).first()
            rate = float(loan_term.interest_rate) if loan_term else 0.05
            if rate > 1.0:
                rate = rate / 100.0  # Convert percentage to decimal if needed

            commitment = loan.commitment_amount  # in cents
            # Annual interest = commitment * rate
            # Monthly carry = commitment * rate / 12
            monthly_carry = int(round((commitment * rate) / 12.0))
            # Total carry cost = (commitment * rate / 365) * delay_days
            daily_carry = (commitment * rate) / 365.0
            total_carry_exposure = int(round(daily_carry * delay_days))

        # Check active discrepancies
        active_discrepancies = len(
            self.db.scalars(
                select(Alert).where(
                    Alert.project_id == project.id,
                    Alert.alert_type == "DATA_CONFLICT",
                    Alert.status == "OPEN",
                )
            ).all()
        )

        total_milestones = len(milestones)
        completed_milestones = sum(1 for m in milestones if m.status == "COMPLETED" or float(m.progress_percentage) >= 100.0)
        overall_progress = (
            sum(float(m.progress_percentage) for m in milestones) / total_milestones
            if total_milestones > 0
            else 0.0
        )

        return ScheduleForecastRead(
            project_id=str(project.id),
            has_schedule_baseline=has_baseline,
            target_completion=target_completion.isoformat() if target_completion else None,
            forecast_completion=forecast_completion.isoformat() if forecast_completion else None,
            delay_days=delay_days,
            is_delayed=is_delayed,
            critical_path_milestone=critical_milestone,
            critical_path_milestone_id=critical_milestone_id,
            carry_impact_monthly=monthly_carry,
            total_carry_cost_exposure=total_carry_exposure,
            active_discrepancies_count=active_discrepancies,
            total_milestones=total_milestones,
            completed_milestones=completed_milestones,
            overall_progress_percent=round(overall_progress, 2),
        )

    # ---------------------------------------------------------
    # 6. SERIALIZATION HELPER
    # ---------------------------------------------------------
    def serialize_milestone(self, milestone: ProjectMilestone) -> MilestoneRead:
        # Check delay days: Report unknown as None, not zero
        delay_days: int | None = None
        if milestone.planned_completion_date and milestone.forecast_completion_date:
            delay_days = (milestone.forecast_completion_date - milestone.planned_completion_date).days

        # Check conflict from latest Inspection
        conflict: ProgressConflictRead | None = None
        latest_inspection = self.db.scalars(
            select(Inspection)
            .where(Inspection.project_id == milestone.project_id)
            .order_by(Inspection.inspection_date.desc(), Inspection.created_at.desc())
        ).first()

        if latest_inspection and latest_inspection.result in ["FAILED", "CONDITIONAL"]:
            conflict = ProgressConflictRead(
                has_conflict=True,
                pm_percent=float(milestone.progress_percentage),
                inspector_percent=0.0 if latest_inspection.result == "FAILED" else 50.0,
                discrepancy_percent=float(milestone.progress_percentage),
                inspection_id=str(latest_inspection.id),
                notes=latest_inspection.notes,
            )

        evidence_items = [
            EvidenceRead(
                id=str(ev.id),
                milestone_id=str(ev.milestone_id),
                document_id=str(ev.document_id),
                evidence_type=ev.evidence_type,
                description=ev.description,
                verified_by=str(ev.verified_by) if ev.verified_by else None,
                created_at=ev.created_at.isoformat(),
            )
            for ev in milestone.evidence
        ]

        return MilestoneRead(
            id=str(milestone.id),
            organization_id=str(milestone.organization_id),
            project_id=str(milestone.project_id),
            name=milestone.name,
            code=milestone.code,
            planned_start_date=milestone.planned_start_date.isoformat() if milestone.planned_start_date else None,
            planned_completion_date=milestone.planned_completion_date.isoformat() if milestone.planned_completion_date else None,
            actual_start_date=milestone.actual_start_date.isoformat() if milestone.actual_start_date else None,
            actual_completion_date=milestone.actual_completion_date.isoformat() if milestone.actual_completion_date else None,
            forecast_completion_date=milestone.forecast_completion_date.isoformat() if milestone.forecast_completion_date else None,
            forecast_change_reason=milestone.forecast_change_reason,
            progress_percentage=float(milestone.progress_percentage),
            status=milestone.status,
            delay_days=delay_days,
            delay_cause=milestone.forecast_change_reason,
            evidence=evidence_items,
            conflict=conflict,
            created_at=milestone.created_at.isoformat(),
        )
