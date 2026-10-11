import csv
import io
import uuid
from datetime import UTC, datetime
from typing import Any

import openpyxl
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.errors import (
    ForbiddenException,
    NotFoundException,
)
from app.db.audit import record_audit_event
from app.db.models import (
    Alert,
    AuditEvent,
    Budget,
    BudgetLine,
    DataQualityIssue,
    Document,
    Draw,
    DrawFunding,
    DrawLine,
    FinancialTransaction,
    InvestorContribution,
    Loan,
    Project,
    ProjectFinancialPlan,
    ProjectInvestor,
    ProjectMilestone,
    SpendRecord,
    User,
    generate_uuid,
    utc_now,
)
from app.modules.reporting.schemas import (
    AlertEscalateRequest,
    AlertRead,
    AlertResolveRequest,
    AlertWaiveRequest,
    AuditEventRead,
    DashboardControlCenterRead,
    DashboardExceptionSummary,
    DataQualityIssueRead,
    DataQualityResolveRequest,
    ReportExportRead,
    ReportExportRequest,
    ReportRead,
    ReportRow,
    SourceRef,
)


class ReportingService:
    def __init__(self, db: Session):
        self.db = db

    def _get_project_with_access(self, user: User, project_id: uuid.UUID) -> Project:
        project = self.db.scalars(
            select(Project).where(
                Project.id == project_id,
                Project.organization_id == user.organization_id,
            )
        ).first()
        if not project:
            raise NotFoundException(message="Project not found.")
        return project

    # =========================================================================
    # Rule Evaluation (Material Writes Triggers)
    # =========================================================================

    def evaluate_project_rules(self, project_id: uuid.UUID, user: User | None = None) -> list[Alert]:
        """
        Evaluates material integrity rules across budget, spend, funding, draws, and milestones.
        Deduplicates open alerts by project and alert_type.
        """
        project = self.db.scalars(select(Project).where(Project.id == project_id)).first()
        if not project:
            return []

        generated_alerts: list[Alert] = []

        # Find owner user for default assignment
        owner_user = self.db.scalars(
            select(User).where(
                User.organization_id == project.organization_id,
                User.role == "OWNER",
            )
        ).first()
        owner_id = owner_user.id if owner_user else None

        # 1. OVERRUN: Budget line spend + committed > current_approved_amount
        active_budget = self.db.scalars(
            select(Budget).where(
                Budget.project_id == project_id,
                Budget.status == "APPROVED",
            )
        ).first()
        if active_budget:
            budget_lines = self.db.scalars(
                select(BudgetLine).where(BudgetLine.budget_id == active_budget.id)
            ).all()
            for line in budget_lines:
                spent = self.db.scalar(
                    select(func.coalesce(func.sum(SpendRecord.amount), 0)).where(
                        SpendRecord.budget_line_id == line.id
                    )
                ) or 0
                if spent > line.current_approved_amount:
                    alert = self._upsert_alert(
                        project_id=project_id,
                        organization_id=project.organization_id,
                        alert_type="OVERRUN",
                        severity="CRITICAL",
                        title=f"Budget Overrun on {line.name} ({line.code})",
                        description=f"Spend of ${spent/100:,.2f} exceeds approved budget of ${line.current_approved_amount/100:,.2f} by ${(spent - line.current_approved_amount)/100:,.2f}.",
                        default_owner_id=owner_id,
                    )
                    generated_alerts.append(alert)

        # 2. MISSING_EVIDENCE: Spend records marked MANUAL_ENTRY or without source_document_id
        unsupported_spend_count = self.db.scalar(
            select(func.count(SpendRecord.id)).where(
                SpendRecord.project_id == project_id,
                SpendRecord.source_document_id.is_(None),
            )
        ) or 0
        if unsupported_spend_count > 0:
            alert = self._upsert_alert(
                project_id=project_id,
                organization_id=project.organization_id,
                alert_type="MISSING_EVIDENCE",
                severity="HIGH",
                title=f"{unsupported_spend_count} spend records missing source documentation",
                description=f"Detected {unsupported_spend_count} expenses without an attached invoice or receipt.",
                default_owner_id=owner_id,
            )
            generated_alerts.append(alert)

        # 3. SHORT_FUNDED_DRAW: Draws where lender approved < requested and status is PARTIALLY_APPROVED
        short_funded_draws = self.db.scalars(
            select(Draw).where(
                Draw.project_id == project_id,
                Draw.status == "PARTIALLY_APPROVED",
            )
        ).all()
        for d in short_funded_draws:
            alert = self._upsert_alert(
                project_id=project_id,
                organization_id=project.organization_id,
                alert_type="SHORT_FUNDED_DRAW",
                severity="HIGH",
                title=f"Draw #{d.draw_number} Short-Funded",
                description=f"Lender partially approved Draw #{d.draw_number}. Shortfall requires contingency rebalancing or borrower injection.",
                default_owner_id=owner_id,
            )
            generated_alerts.append(alert)

        # 4. UNALLOCATED_CASH: Cleared transaction deposits that have not been allocated to draws
        unallocated_deposits = self.db.scalars(
            select(FinancialTransaction).where(
                FinancialTransaction.project_id == project_id,
                FinancialTransaction.direction == "INFLOW",
                FinancialTransaction.cleared_status == "CLEARED",
            )
        ).all()
        unallocated_total = 0
        for tx in unallocated_deposits:
            allocated = self.db.scalar(
                select(func.coalesce(func.sum(DrawFunding.amount), 0)).where(
                    DrawFunding.transaction_id == tx.id
                )
            ) or 0
            if tx.amount > allocated:
                unallocated_total += (tx.amount - allocated)

        if unallocated_total > 0:
            alert = self._upsert_alert(
                project_id=project_id,
                organization_id=project.organization_id,
                alert_type="UNALLOCATED_CASH",
                severity="MEDIUM",
                title="Unallocated Cleared Cash Detected",
                description=f"${unallocated_total/100:,.2f} in cleared inbound deposits remains unallocated across project draws.",
                default_owner_id=owner_id,
            )
            generated_alerts.append(alert)

        # 5. DELAYED_MILESTONE: Milestones whose forecast date exceeds planned date
        milestones = self.db.scalars(
            select(ProjectMilestone).where(ProjectMilestone.project_id == project_id)
        ).all()
        delayed_count = 0
        for m in milestones:
            if m.forecast_completion_date and m.planned_completion_date and m.forecast_completion_date > m.planned_completion_date:
                delayed_count += 1
        if delayed_count > 0:
            alert = self._upsert_alert(
                project_id=project_id,
                organization_id=project.organization_id,
                alert_type="DELAYED_MILESTONE",
                severity="MEDIUM",
                title=f"{delayed_count} Milestones Forecast Past Baseline",
                description=f"{delayed_count} milestones are currently tracking behind original planned schedule.",
                default_owner_id=owner_id,
            )
            generated_alerts.append(alert)

        return generated_alerts

    def _upsert_alert(
        self,
        project_id: uuid.UUID,
        organization_id: uuid.UUID,
        alert_type: str,
        severity: str,
        title: str,
        description: str,
        default_owner_id: uuid.UUID | None,
    ) -> Alert:
        # Check if an OPEN or ESCALATED alert of this type already exists
        existing = self.db.scalars(
            select(Alert).where(
                Alert.project_id == project_id,
                Alert.alert_type == alert_type,
                Alert.status.in_(["OPEN", "ESCALATED"]),
            )
        ).first()

        if existing:
            # Update description and severity if needed
            existing.description = description
            existing.severity = severity
            existing.title = title
            self.db.flush()
            return existing

        new_alert = Alert(
            id=generate_uuid(),
            organization_id=organization_id,
            project_id=project_id,
            alert_type=alert_type,
            severity=severity,
            title=title,
            description=description,
            status="OPEN",
            owner_id=default_owner_id,
            created_at=utc_now(),
        )
        self.db.add(new_alert)
        self.db.flush()
        return new_alert

    # =========================================================================
    # Alerts Management
    # =========================================================================

    def list_alerts(
        self,
        user: User,
        project_id: uuid.UUID,
        severity: str | None = None,
        status: str | None = None,
    ) -> list[AlertRead]:
        project = self._get_project_with_access(user, project_id)

        # Refresh rules synchronously before listing
        self.evaluate_project_rules(project.id, user)

        query = select(Alert).where(Alert.project_id == project.id)
        if severity:
            query = query.where(Alert.severity == severity.upper())
        if status:
            query = query.where(Alert.status == status.upper())
        else:
            # Default to active alerts (OPEN, ESCALATED) unless waived still active
            query = query.where(Alert.status.in_(["OPEN", "ESCALATED", "WAIVED"]))

        query = query.order_by(desc(Alert.created_at))
        alerts = self.db.scalars(query).all()

        results: list[AlertRead] = []
        for a in alerts:
            results.append(
                AlertRead(
                    id=str(a.id),
                    organization_id=str(a.organization_id),
                    project_id=str(a.project_id),
                    alert_type=a.alert_type,
                    severity=a.severity,
                    title=a.title,
                    description=a.description,
                    status=a.status,
                    owner_id=str(a.owner_id) if a.owner_id else None,
                    waived_by=str(a.waived_by) if a.waived_by else None,
                    waived_until=a.waived_until.isoformat() if a.waived_until else None,
                    waive_reason=a.waive_reason,
                    resolved_at=a.resolved_at.isoformat() if a.resolved_at else None,
                    created_at=a.created_at.isoformat(),
                )
            )
        return results

    def resolve_alert(self, user: User, alert_id: uuid.UUID, data: AlertResolveRequest) -> AlertRead:
        alert = self.db.scalars(
            select(Alert).where(
                Alert.id == alert_id,
                Alert.organization_id == user.organization_id,
            )
        ).first()
        if not alert:
            raise NotFoundException(message="Alert not found.")

        # Permission check: owner of alert, or Owner/CFO
        if alert.owner_id and alert.owner_id != user.id and user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only the assigned owner or an administrator can resolve this alert.")

        prev_val = {"status": alert.status}
        alert.status = "RESOLVED"
        alert.resolved_at = utc_now()
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=alert.project_id,
            actor_id=user.id,
            action="ALERT_RESOLVED",
            entity_type="Alert",
            entity_id=alert.id,
            previous_value=prev_val,
            new_value={"status": alert.status, "notes": data.notes},
            rationale=data.notes,
        )

        return AlertRead(
            id=str(alert.id),
            organization_id=str(alert.organization_id),
            project_id=str(alert.project_id),
            alert_type=alert.alert_type,
            severity=alert.severity,
            title=alert.title,
            description=alert.description,
            status=alert.status,
            owner_id=str(alert.owner_id) if alert.owner_id else None,
            waived_by=str(alert.waived_by) if alert.waived_by else None,
            waived_until=alert.waived_until.isoformat() if alert.waived_until else None,
            waive_reason=alert.waive_reason,
            resolved_at=alert.resolved_at.isoformat() if alert.resolved_at else None,
            created_at=alert.created_at.isoformat(),
        )

    def waive_alert(self, user: User, alert_id: uuid.UUID, data: AlertWaiveRequest) -> AlertRead:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owner or CFO can waive alerts.")

        alert = self.db.scalars(
            select(Alert).where(
                Alert.id == alert_id,
                Alert.organization_id == user.organization_id,
            )
        ).first()
        if not alert:
            raise NotFoundException(message="Alert not found.")

        prev_val = {"status": alert.status}
        alert.status = "WAIVED"
        alert.waived_by = user.id
        alert.waived_until = data.expiry_date
        alert.waive_reason = data.reason
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=alert.project_id,
            actor_id=user.id,
            action="ALERT_WAIVED",
            entity_type="Alert",
            entity_id=alert.id,
            previous_value=prev_val,
            new_value={"status": alert.status, "waived_until": data.expiry_date.isoformat(), "reason": data.reason},
            rationale=data.reason,
        )

        return AlertRead(
            id=str(alert.id),
            organization_id=str(alert.organization_id),
            project_id=str(alert.project_id),
            alert_type=alert.alert_type,
            severity=alert.severity,
            title=alert.title,
            description=alert.description,
            status=alert.status,
            owner_id=str(alert.owner_id) if alert.owner_id else None,
            waived_by=str(alert.waived_by) if alert.waived_by else None,
            waived_until=alert.waived_until.isoformat() if alert.waived_until else None,
            waive_reason=alert.waive_reason,
            resolved_at=alert.resolved_at.isoformat() if alert.resolved_at else None,
            created_at=alert.created_at.isoformat(),
        )

    def escalate_alert(self, user: User, alert_id: uuid.UUID, data: AlertEscalateRequest) -> AlertRead:
        alert = self.db.scalars(
            select(Alert).where(
                Alert.id == alert_id,
                Alert.organization_id == user.organization_id,
            )
        ).first()
        if not alert:
            raise NotFoundException(message="Alert not found.")

        prev_val = {"status": alert.status, "severity": alert.severity}
        alert.status = "ESCALATED"
        alert.severity = "CRITICAL"
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=alert.project_id,
            actor_id=user.id,
            action="ALERT_ESCALATED",
            entity_type="Alert",
            entity_id=alert.id,
            previous_value=prev_val,
            new_value={"status": alert.status, "severity": alert.severity, "reason": data.reason},
            rationale=data.reason,
        )

        return AlertRead(
            id=str(alert.id),
            organization_id=str(alert.organization_id),
            project_id=str(alert.project_id),
            alert_type=alert.alert_type,
            severity=alert.severity,
            title=alert.title,
            description=alert.description,
            status=alert.status,
            owner_id=str(alert.owner_id) if alert.owner_id else None,
            waived_by=str(alert.waived_by) if alert.waived_by else None,
            waived_until=alert.waived_until.isoformat() if alert.waived_until else None,
            waive_reason=alert.waive_reason,
            resolved_at=alert.resolved_at.isoformat() if alert.resolved_at else None,
            created_at=alert.created_at.isoformat(),
        )

    # =========================================================================
    # Data Quality Issues
    # =========================================================================

    def list_data_quality_issues(self, user: User, project_id: uuid.UUID) -> list[DataQualityIssueRead]:
        project = self._get_project_with_access(user, project_id)
        issues = self.db.scalars(
            select(DataQualityIssue)
            .where(DataQualityIssue.project_id == project.id)
            .order_by(desc(DataQualityIssue.detected_at))
        ).all()

        results: list[DataQualityIssueRead] = []
        for i in issues:
            results.append(
                DataQualityIssueRead(
                    id=str(i.id),
                    organization_id=str(i.organization_id),
                    project_id=str(i.project_id),
                    issue_type=i.issue_type,
                    severity=i.severity,
                    status=i.status,
                    source_record_id=str(i.source_record_id) if i.source_record_id else None,
                    affected_entity_type=i.affected_entity_type,
                    affected_entity_id=str(i.affected_entity_id),
                    owner_id=str(i.owner_id) if i.owner_id else None,
                    detected_at=i.detected_at.isoformat(),
                    resolved_at=i.resolved_at.isoformat() if i.resolved_at else None,
                    resolution=i.resolution,
                    waived_by=str(i.waived_by) if i.waived_by else None,
                    waived_until=i.waived_until.isoformat() if i.waived_until else None,
                )
            )
        return results

    def resolve_data_quality_issue(
        self, user: User, issue_id: uuid.UUID, data: DataQualityResolveRequest
    ) -> DataQualityIssueRead:
        if user.role not in ["OWNER", "CFO"]:
            raise ForbiddenException(message="Only Owner or CFO can resolve data quality issues.")

        issue = self.db.scalars(
            select(DataQualityIssue).where(
                DataQualityIssue.id == issue_id,
                DataQualityIssue.organization_id == user.organization_id,
            )
        ).first()
        if not issue:
            raise NotFoundException(message="Data quality issue not found.")

        prev_val = {"status": issue.status}
        if data.waive:
            issue.status = "WAIVED"
            issue.waived_by = user.id
            issue.waived_until = data.waive_until
            issue.resolution = data.resolution
        else:
            issue.status = "RESOLVED"
            issue.resolved_at = utc_now()
            issue.resolution = data.resolution

        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=issue.project_id,
            actor_id=user.id,
            action="DATA_QUALITY_ISSUE_RESOLVED" if not data.waive else "DATA_QUALITY_ISSUE_WAIVED",
            entity_type="DataQualityIssue",
            entity_id=issue.id,
            previous_value=prev_val,
            new_value={"status": issue.status, "resolution": data.resolution, "evidence_id": data.resolution_evidence_id},
            rationale=data.resolution,
        )

        return DataQualityIssueRead(
            id=str(issue.id),
            organization_id=str(issue.organization_id),
            project_id=str(issue.project_id),
            issue_type=issue.issue_type,
            severity=issue.severity,
            status=issue.status,
            source_record_id=str(issue.source_record_id) if issue.source_record_id else None,
            affected_entity_type=issue.affected_entity_type,
            affected_entity_id=str(issue.affected_entity_id),
            owner_id=str(issue.owner_id) if issue.owner_id else None,
            detected_at=issue.detected_at.isoformat(),
            resolved_at=issue.resolved_at.isoformat() if issue.resolved_at else None,
            resolution=issue.resolution,
            waived_by=str(issue.waived_by) if issue.waived_by else None,
            waived_until=issue.waived_until.isoformat() if issue.waived_until else None,
        )

    # =========================================================================
    # Control Center Dashboard
    # =========================================================================

    def get_dashboard(self, user: User, project_id: uuid.UUID) -> DashboardControlCenterRead:
        project = self._get_project_with_access(user, project_id)

        # Trigger automatic rules evaluation
        self.evaluate_project_rules(project.id, user)

        # 1. Open exceptions and data quality
        active_alerts = self.db.scalars(
            select(Alert).where(
                Alert.project_id == project.id,
                Alert.status.in_(["OPEN", "ESCALATED"]),
            ).order_by(desc(Alert.created_at))
        ).all()
        open_dq_count = self.db.scalar(
            select(func.count(DataQualityIssue.id)).where(
                DataQualityIssue.project_id == project.id,
                DataQualityIssue.status == "OPEN",
            )
        ) or 0

        total_open_exceptions = len(active_alerts) + open_dq_count
        dq_status = "VERIFIED"
        if total_open_exceptions > 0:
            dq_status = "PROVISIONAL"

        # 2. Financial plans & Economics
        plan = self.db.scalars(
            select(ProjectFinancialPlan).where(
                ProjectFinancialPlan.project_id == project.id,
                ProjectFinancialPlan.is_active,
            )
        ).first()

        gdv = plan.projected_revenue if plan else 0
        forecast_cost = plan.projected_cost if plan else 0
        net_profit = gdv - forecast_cost

        # 3. Contingency
        active_budget = self.db.scalars(
            select(Budget).where(
                Budget.project_id == project.id,
                Budget.status == "APPROVED",
            )
        ).first()
        contingency_remaining = 0
        if active_budget:
            # Contingency lines (code CON or category CONTINGENCY)
            contingency_lines = self.db.scalars(
                select(BudgetLine).where(
                    BudgetLine.budget_id == active_budget.id,
                    BudgetLine.category == "CONTINGENCY",
                )
            ).all()
            for cl in contingency_lines:
                contingency_remaining += cl.current_approved_amount

        # 4. Debt & Equity
        loan = self.db.scalars(select(Loan).where(Loan.project_id == project.id)).first()
        senior_debt_committed = loan.commitment_amount if loan else 0
        senior_debt_drawn = (
            self.db.scalar(
                select(func.coalesce(func.sum(DrawFunding.amount), 0))
                .join(Draw, Draw.id == DrawFunding.draw_id)
                .where(Draw.project_id == project.id)
            )
            or 0
        )

        equity_funded = (
            self.db.scalar(
                select(func.coalesce(func.sum(InvestorContribution.amount), 0))
                .join(ProjectInvestor, ProjectInvestor.id == InvestorContribution.project_investor_id)
                .where(ProjectInvestor.project_id == project.id)
            )
            or 0
        )
        equity_committed = max(0, forecast_cost - senior_debt_committed)

        # 5. Cash Gap = Forecast Cost - (Drawn Senior Debt + Funded Equity)
        cash_gap = max(0, forecast_cost - (senior_debt_drawn + equity_funded))

        # 6. Active draws count
        active_draws_count = self.db.scalar(
            select(func.count(Draw.id)).where(
                Draw.project_id == project.id,
                Draw.status.in_(["SUBMITTED", "UNDER_REVIEW", "PARTIALLY_APPROVED", "APPROVED"]),
            )
        ) or 0

        # Top 5 exceptions
        top_exceptions: list[DashboardExceptionSummary] = []
        for a in active_alerts[:5]:
            top_exceptions.append(
                DashboardExceptionSummary(
                    alert_id=str(a.id),
                    alert_type=a.alert_type,
                    severity=a.severity,
                    title=a.title,
                    owner_name=None,
                    created_at=a.created_at.isoformat(),
                )
            )

        # Source refs for drill-down
        source_refs: list[SourceRef] = []
        if plan:
            source_refs.append(SourceRef(entity_type="ProjectFinancialPlan", entity_id=str(plan.id), label="Active Financial Plan"))
        if active_budget:
            source_refs.append(SourceRef(entity_type="Budget", entity_id=str(active_budget.id), label="Approved Baseline Budget"))
        if loan:
            source_refs.append(SourceRef(entity_type="Loan", entity_id=str(loan.id), label="Senior Debt Commitment"))

        return DashboardControlCenterRead(
            project_id=str(project.id),
            as_of=utc_now().isoformat(),
            currency=project.currency,
            data_quality_status=dq_status,
            gross_development_value=gdv,
            forecast_completion_cost=forecast_cost,
            net_profit=net_profit,
            cash_gap=cash_gap,
            contingency_remaining=contingency_remaining,
            senior_debt_committed=senior_debt_committed,
            senior_debt_drawn=senior_debt_drawn,
            equity_committed=equity_committed,
            equity_funded=equity_funded,
            active_draws_count=active_draws_count,
            open_exceptions_count=total_open_exceptions,
            top_exceptions=top_exceptions,
            source_refs=source_refs,
        )

    # =========================================================================
    # Reports Engine: VARIANCE, FUNDING_GAP, FORECAST, DRAW_STATUS
    # =========================================================================

    def generate_report(self, user: User, project_id: uuid.UUID, report_type: str) -> ReportRead:
        project = self._get_project_with_access(user, project_id)
        report_type_clean = report_type.upper().replace("-", "_")

        # Open exceptions count
        active_alerts = self.db.scalars(
            select(Alert).where(
                Alert.project_id == project.id,
                Alert.status.in_(["OPEN", "ESCALATED"]),
            )
        ).all()
        open_dq_count = self.db.scalar(
            select(func.count(DataQualityIssue.id)).where(
                DataQualityIssue.project_id == project.id,
                DataQualityIssue.status == "OPEN",
            )
        ) or 0
        total_exceptions = len(active_alerts) + open_dq_count
        dq_state = "VERIFIED" if total_exceptions == 0 else "PROVISIONAL"

        rows: list[ReportRow] = []
        summary_totals: dict[str, Any] = {}
        top_source_refs: list[SourceRef] = []

        if report_type_clean == "VARIANCE":
            # Budget vs Spend Variance report
            active_budget = self.db.scalars(
                select(Budget).where(
                    Budget.project_id == project.id,
                    Budget.status == "APPROVED",
                )
            ).first()

            tot_orig = 0
            tot_appr = 0
            tot_spent = 0
            tot_variance = 0

            if active_budget:
                top_source_refs.append(SourceRef(entity_type="Budget", entity_id=str(active_budget.id), label="Baseline Budget"))
                lines = self.db.scalars(
                    select(BudgetLine).where(BudgetLine.budget_id == active_budget.id).order_by(BudgetLine.sort_order)
                ).all()

                for line in lines:
                    spent = self.db.scalar(
                        select(func.coalesce(func.sum(SpendRecord.amount), 0)).where(
                            SpendRecord.budget_line_id == line.id
                        )
                    ) or 0
                    var = spent - line.current_approved_amount
                    tot_orig += line.original_amount
                    tot_appr += line.current_approved_amount
                    tot_spent += spent
                    tot_variance += var

                    row_refs = [SourceRef(entity_type="BudgetLine", entity_id=str(line.id), label=line.code)]
                    rows.append(
                        ReportRow(
                            row_id=str(line.id),
                            category=line.category,
                            title=line.name,
                            original_budget=line.original_amount,
                            current_approved=line.current_approved_amount,
                            spent=spent,
                            remaining=max(0, line.current_approved_amount - spent),
                            variance=var,
                            basis="ACTUAL" if spent > 0 else "APPROVED",
                            status="OVERRUN" if var > 0 else "NORMAL",
                            source_refs=row_refs,
                        )
                    )

            summary_totals = {
                "total_original_budget": tot_orig,
                "total_current_approved": tot_appr,
                "total_spent": tot_spent,
                "total_variance": tot_variance,
            }

        elif report_type_clean == "DRAW_STATUS":
            # Draw Progress & Status report
            draws = self.db.scalars(
                select(Draw).where(Draw.project_id == project.id).order_by(Draw.draw_number)
            ).all()

            tot_req = 0
            tot_appr = 0
            tot_funded = 0

            for d in draws:
                req = self.db.scalar(
                    select(func.coalesce(func.sum(DrawLine.requested_amount), 0)).where(DrawLine.draw_id == d.id)
                ) or 0
                appr = self.db.scalar(
                    select(func.coalesce(func.sum(DrawLine.approved_amount), 0)).where(DrawLine.draw_id == d.id)
                ) or 0
                funded = self.db.scalar(
                    select(func.coalesce(func.sum(DrawFunding.amount), 0)).where(DrawFunding.draw_id == d.id)
                ) or 0

                tot_req += req
                tot_appr += appr
                tot_funded += funded

                rows.append(
                    ReportRow(
                        row_id=str(d.id),
                        category="DRAW",
                        title=f"Draw Application #{d.draw_number}",
                        current_approved=appr,
                        drawn=req,
                        funded=funded,
                        remaining=max(0, appr - funded),
                        variance=req - appr,
                        basis="APPROVED" if appr > 0 else "ESTIMATED",
                        status=d.status,
                        source_refs=[SourceRef(entity_type="Draw", entity_id=str(d.id), label=f"Draw #{d.draw_number}")],
                    )
                )

            summary_totals = {
                "total_requested": tot_req,
                "total_approved": tot_appr,
                "total_funded": tot_funded,
                "total_draws": len(draws),
            }

        elif report_type_clean == "FUNDING_GAP":
            # Cash & Capital Funding Gap
            loan = self.db.scalars(select(Loan).where(Loan.project_id == project.id)).first()
            senior_debt_committed = loan.commitment_amount if loan else 0
            senior_debt_drawn = (
                self.db.scalar(
                    select(func.coalesce(func.sum(DrawFunding.amount), 0))
                    .join(Draw, Draw.id == DrawFunding.draw_id)
                    .where(Draw.project_id == project.id)
                )
                or 0
            )
            equity_funded = (
                self.db.scalar(
                    select(func.coalesce(func.sum(InvestorContribution.amount), 0))
                    .join(ProjectInvestor, ProjectInvestor.id == InvestorContribution.project_investor_id)
                    .where(ProjectInvestor.project_id == project.id)
                )
                or 0
            )

            # Total spent to date
            total_spent = self.db.scalar(
                select(func.coalesce(func.sum(SpendRecord.amount), 0)).where(SpendRecord.project_id == project.id)
            ) or 0

            cash_available = (senior_debt_drawn + equity_funded) - total_spent
            gap = max(0, -cash_available)

            rows.append(
                ReportRow(
                    row_id="senior-debt",
                    category="DEBT",
                    title="Senior Debt Facility",
                    current_approved=senior_debt_committed,
                    funded=senior_debt_drawn,
                    remaining=max(0, senior_debt_committed - senior_debt_drawn),
                    basis="COMMITTED",
                    status="NORMAL",
                    source_refs=[SourceRef(entity_type="Loan", entity_id=str(loan.id))] if loan else [],
                )
            )
            rows.append(
                ReportRow(
                    row_id="sponsor-equity",
                    category="EQUITY",
                    title="Investor Equity Funded",
                    funded=equity_funded,
                    basis="ACTUAL",
                    status="NORMAL",
                )
            )
            rows.append(
                ReportRow(
                    row_id="total-spend",
                    category="OUTFLOW",
                    title="Cumulative Project Spend",
                    spent=total_spent,
                    basis="ACTUAL",
                    status="NORMAL",
                )
            )

            summary_totals = {
                "senior_debt_drawn": senior_debt_drawn,
                "equity_funded": equity_funded,
                "total_spent": total_spent,
                "net_cash_available": cash_available,
                "funding_gap": gap,
            }

        else:
            # Default / FORECAST: Pro forma lines and completion cost
            plan = self.db.scalars(
                select(ProjectFinancialPlan).where(
                    ProjectFinancialPlan.project_id == project.id,
                    ProjectFinancialPlan.is_active,
                )
            ).first()

            if plan and plan.payload and "lines" in plan.payload:
                top_source_refs.append(SourceRef(entity_type="ProjectFinancialPlan", entity_id=str(plan.id), label="Pro Forma Plan"))
                for idx, line_dict in enumerate(plan.payload["lines"]):
                    orig = line_dict.get("original_plan_amount", 0)
                    cur = line_dict.get("current_forecast_amount", orig)
                    actual = line_dict.get("actual_cleared_amount", 0) or 0
                    basis = line_dict.get("basis", "ESTIMATED")

                    rows.append(
                        ReportRow(
                            row_id=f"pfr-{idx}",
                            category=line_dict.get("category", "EXPENSE"),
                            title=line_dict.get("line_name", f"Line {idx}"),
                            original_budget=orig,
                            current_approved=cur,
                            spent=actual,
                            remaining=max(0, cur - actual),
                            variance=cur - orig,
                            basis=basis,
                            status="NORMAL",
                        )
                    )

            summary_totals = {
                "projected_revenue": plan.projected_revenue if plan else 0,
                "projected_cost": plan.projected_cost if plan else 0,
            }

        return ReportRead(
            project_id=str(project.id),
            report_type=report_type_clean,
            as_of=utc_now().isoformat(),
            currency=project.currency,
            version="v1.0",
            data_quality_state=dq_state,
            open_exceptions_count=total_exceptions,
            rows=rows,
            summary_totals=summary_totals,
            source_refs=top_source_refs,
        )

    # =========================================================================
    # Report Synchronous Export (CSV & XLSX)
    # =========================================================================

    def export_report(self, user: User, project_id: uuid.UUID, data: ReportExportRequest) -> ReportExportRead:
        project = self._get_project_with_access(user, project_id)
        report = self.generate_report(user, project.id, data.report_type)

        export_id = generate_uuid()
        fmt = data.format.upper()

        if fmt == "CSV":
            content_bytes = self._render_csv(report)
            filename = f"report_{report.report_type.lower()}_{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}.csv"
            mime_type = "text/csv"
        elif fmt == "XLSX":
            content_bytes = self._render_xlsx(report)
            filename = f"report_{report.report_type.lower()}_{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}.xlsx"
            mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        else:
            # Fallback to CSV for PDF in lightweight phase
            content_bytes = self._render_csv(report)
            filename = f"report_{report.report_type.lower()}_{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}.csv"
            mime_type = "text/csv"

        # Create Document record to store export snapshot
        doc = Document(
            id=export_id,
            organization_id=user.organization_id,
            project_id=project.id,
            storage_key=f"exports/{project.id}/{export_id}/{filename}",
            sha256=func.md5(content_bytes),  # placeholder
            original_filename=filename,
            mime_type=mime_type,
            document_type="REPORT_EXPORT",
            ingestion_status="REVIEWED",
            uploaded_by=user.id,
            uploaded_at=utc_now(),
        )
        self.db.add(doc)
        self.db.flush()

        record_audit_event(
            db=self.db,
            organization_id=user.organization_id,
            project_id=project.id,
            actor_id=user.id,
            action="REPORT_EXPORT_GENERATED",
            entity_type="Document",
            entity_id=doc.id,
            new_value={"report_type": report.report_type, "format": fmt, "filename": filename},
            rationale=f"Generated {fmt} export for {report.report_type}",
        )

        return ReportExportRead(
            id=str(export_id),
            project_id=str(project.id),
            report_type=report.report_type,
            format=fmt,
            status="COMPLETED",
            download_url=f"/api/v1/documents/{doc.id}/download",
            created_at=utc_now().isoformat(),
        )

    def _render_csv(self, report: ReportRead) -> bytes:
        out = io.StringIO()
        writer = csv.writer(out)
        writer.writerow(["Report Type", report.report_type])
        writer.writerow(["Project ID", report.project_id])
        writer.writerow(["As Of", report.as_of])
        writer.writerow(["Data Quality State", report.data_quality_state])
        writer.writerow([])
        writer.writerow([
            "Category",
            "Title",
            "Original Budget ($)",
            "Current Approved ($)",
            "Spent ($)",
            "Remaining ($)",
            "Variance ($)",
            "Basis",
            "Status",
        ])

        for r in report.rows:
            writer.writerow([
                r.category,
                r.title,
                f"{r.original_budget / 100:.2f}",
                f"{r.current_approved / 100:.2f}",
                f"{r.spent / 100:.2f}",
                f"{r.remaining / 100:.2f}",
                f"{r.variance / 100:.2f}",
                r.basis,
                r.status,
            ])

        return out.getvalue().encode("utf-8")

    def _render_xlsx(self, report: ReportRead) -> bytes:
        wb = openpyxl.Workbook()
        ws = wb.active
        if ws is None:
            ws = wb.create_sheet(title=report.report_type[:30])
        else:
            ws.title = report.report_type[:30]

        ws.append(["Report Type", report.report_type])
        ws.append(["Project ID", report.project_id])
        ws.append(["As Of", report.as_of])
        ws.append(["Data Quality State", report.data_quality_state])
        ws.append([])
        ws.append([
            "Category",
            "Title",
            "Original Budget ($)",
            "Current Approved ($)",
            "Spent ($)",
            "Remaining ($)",
            "Variance ($)",
            "Basis",
            "Status",
        ])

        for r in report.rows:
            ws.append([
                r.category,
                r.title,
                r.original_budget / 100,
                r.current_approved / 100,
                r.spent / 100,
                r.remaining / 100,
                r.variance / 100,
                r.basis,
                r.status,
            ])

        out = io.BytesIO()
        wb.save(out)
        return out.getvalue()

    # =========================================================================
    # Audit Events Query
    # =========================================================================

    def list_audit_events(
        self,
        user: User,
        entity_type: str | None = None,
        entity_id: uuid.UUID | None = None,
        actor_id: uuid.UUID | None = None,
        project_id: uuid.UUID | None = None,
    ) -> list[AuditEventRead]:
        if user.role != "OWNER":
            raise ForbiddenException(message="Only Owner can query organization audit logs.")

        query = select(AuditEvent).where(AuditEvent.organization_id == user.organization_id)
        if entity_type:
            query = query.where(AuditEvent.entity_type == entity_type)
        if entity_id:
            query = query.where(AuditEvent.entity_id == entity_id)
        if actor_id:
            query = query.where(AuditEvent.actor_id == actor_id)
        if project_id:
            query = query.where(AuditEvent.project_id == project_id)

        query = query.order_by(desc(AuditEvent.occurred_at))
        events = self.db.scalars(query).all()

        results: list[AuditEventRead] = []
        for e in events:
            results.append(
                AuditEventRead(
                    id=str(e.id),
                    organization_id=str(e.organization_id),
                    project_id=str(e.project_id) if e.project_id else None,
                    actor_id=str(e.actor_id),
                    action=e.action,
                    entity_type=e.entity_type,
                    entity_id=str(e.entity_id),
                    previous_value=e.previous_value,
                    new_value=e.new_value,
                    rationale=e.rationale,
                    source_citation=e.source_citation,
                    occurred_at=e.occurred_at.isoformat(),
                )
            )
        return results
