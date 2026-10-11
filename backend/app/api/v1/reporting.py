import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.envelope import ResponseEnvelope, ResponseMeta
from app.db.models import User
from app.db.session import get_db
from app.modules.reporting.schemas import (
    AlertEscalateRequest,
    AlertRead,
    AlertResolveRequest,
    AlertWaiveRequest,
    AuditEventRead,
    DashboardControlCenterRead,
    DataQualityIssueRead,
    DataQualityResolveRequest,
    ReportExportRead,
    ReportExportRequest,
    ReportRead,
)
from app.modules.reporting.service import ReportingService

router = APIRouter()


# -----------------------------------------------------------------------------
# Control Center Dashboard
# -----------------------------------------------------------------------------
@router.get(
    "/projects/{pid}/dashboard",
    response_model=ResponseEnvelope[DashboardControlCenterRead],
)
def get_project_dashboard(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[DashboardControlCenterRead]:
    service = ReportingService(db)
    dashboard = service.get_dashboard(user, pid)
    db.commit()
    return ResponseEnvelope(
        data=dashboard,
        meta=ResponseMeta(
            as_of=dashboard.as_of,
            data_quality=dashboard.data_quality_status,
            warnings=[e.title for e in dashboard.top_exceptions],
        ),
    )


# -----------------------------------------------------------------------------
# Alerts Management
# -----------------------------------------------------------------------------
@router.get(
    "/projects/{pid}/alerts",
    response_model=ResponseEnvelope[list[AlertRead]],
)
def list_project_alerts(
    pid: uuid.UUID,
    severity: Annotated[str | None, Query()] = None,
    alert_status: Annotated[str | None, Query(alias="status")] = None,
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "GC"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[list[AlertRead]]:
    service = ReportingService(db)
    alerts = service.list_alerts(user, pid, severity=severity, status=alert_status)
    db.commit()
    return ResponseEnvelope(data=alerts)


@router.post(
    "/alerts/{id}/resolve",
    response_model=ResponseEnvelope[AlertRead],
)
def resolve_alert(
    id: uuid.UUID,
    data: AlertResolveRequest,
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "GC"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[AlertRead]:
    service = ReportingService(db)
    alert = service.resolve_alert(user, id, data)
    db.commit()
    return ResponseEnvelope(data=alert)


@router.post(
    "/alerts/{id}/waive",
    response_model=ResponseEnvelope[AlertRead],
)
def waive_alert(
    id: uuid.UUID,
    data: AlertWaiveRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[AlertRead]:
    service = ReportingService(db)
    alert = service.waive_alert(user, id, data)
    db.commit()
    return ResponseEnvelope(data=alert)


@router.post(
    "/alerts/{id}/escalate",
    response_model=ResponseEnvelope[AlertRead],
)
def escalate_alert(
    id: uuid.UUID,
    data: AlertEscalateRequest,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[AlertRead]:
    service = ReportingService(db)
    alert = service.escalate_alert(user, id, data)
    db.commit()
    return ResponseEnvelope(data=alert)


# -----------------------------------------------------------------------------
# Data Quality Issues
# -----------------------------------------------------------------------------
@router.get(
    "/projects/{pid}/data-quality-issues",
    response_model=ResponseEnvelope[list[DataQualityIssueRead]],
)
def list_project_data_quality_issues(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[list[DataQualityIssueRead]]:
    service = ReportingService(db)
    issues = service.list_data_quality_issues(user, pid)
    return ResponseEnvelope(data=issues)


@router.post(
    "/data-quality-issues/{id}/resolve",
    response_model=ResponseEnvelope[DataQualityIssueRead],
)
def resolve_data_quality_issue(
    id: uuid.UUID,
    data: DataQualityResolveRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[DataQualityIssueRead]:
    service = ReportingService(db)
    issue = service.resolve_data_quality_issue(user, id, data)
    db.commit()
    return ResponseEnvelope(data=issue)


# -----------------------------------------------------------------------------
# Reports Engine
# -----------------------------------------------------------------------------
@router.get(
    "/projects/{pid}/reports/{type}",
    response_model=ResponseEnvelope[ReportRead],
)
def get_project_report(
    pid: uuid.UUID,
    type: str,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[ReportRead]:
    service = ReportingService(db)
    report = service.generate_report(user, pid, type)
    return ResponseEnvelope(
        data=report,
        meta=ResponseMeta(
            as_of=report.as_of,
            data_quality=report.data_quality_state,
        ),
    )


# -----------------------------------------------------------------------------
# Synchronous Report Export
# -----------------------------------------------------------------------------
@router.post(
    "/projects/{pid}/report-exports",
    response_model=ResponseEnvelope[ReportExportRead],
    status_code=status.HTTP_202_ACCEPTED,
)
def export_project_report(
    pid: uuid.UUID,
    data: ReportExportRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[ReportExportRead]:
    service = ReportingService(db)
    export_result = service.export_report(user, pid, data)
    db.commit()
    return ResponseEnvelope(data=export_result)


@router.get(
    "/report-exports/{id}",
    response_model=ResponseEnvelope[ReportExportRead],
)
def get_report_export(
    id: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[ReportExportRead]:
    # Returns export descriptor with download link
    from app.db.models import Document
    doc = db.scalars(
        select(Document).where(
            Document.id == id,
            Document.organization_id == user.organization_id,
        )
    ).first()
    if not doc:
        from app.core.errors import NotFoundException
        raise NotFoundException(message="Report export not found.")

    res = ReportExportRead(
        id=str(doc.id),
        project_id=str(doc.project_id) if doc.project_id else "",
        report_type=doc.document_type,
        format="CSV" if "csv" in doc.mime_type else "XLSX",
        status="COMPLETED",
        download_url=f"/api/v1/documents/{doc.id}/download",
        created_at=doc.uploaded_at.isoformat(),
    )
    return ResponseEnvelope(data=res)


# -----------------------------------------------------------------------------
# Audit Events Log Query
# -----------------------------------------------------------------------------
@router.get(
    "/audit-events",
    response_model=ResponseEnvelope[list[AuditEventRead]],
)
def query_audit_events(
    entity_type: Annotated[str | None, Query()] = None,
    entity_id: Annotated[uuid.UUID | None, Query()] = None,
    actor_id: Annotated[uuid.UUID | None, Query()] = None,
    project_id: Annotated[uuid.UUID | None, Query()] = None,
    user: User = Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[list[AuditEventRead]]:
    service = ReportingService(db)
    events = service.list_audit_events(
        user=user,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
        project_id=project_id,
    )
    return ResponseEnvelope(data=events)
