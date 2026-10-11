import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.core.envelope import ResponseEnvelope, ResponseMeta
from app.core.errors import NotFoundException
from app.db.models import Notification, User
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
    DQIWaiveRequest,
    NotificationRead,
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
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
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
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
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


# -----------------------------------------------------------------------------
# Report Exports List & Request Alias
# -----------------------------------------------------------------------------
@router.get(
    "/projects/{pid}/exports",
    response_model=ResponseEnvelope[list[ReportExportRead]],
)
def list_project_report_exports(
    pid: uuid.UUID,
    user: User = Depends(require_role(["OWNER", "CFO", "PM"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[list[ReportExportRead]]:
    from app.db.models import Document
    docs = db.scalars(
        select(Document).where(
            Document.project_id == pid,
            Document.document_type.in_(["REPORT", "EXPORT", "AIA_G702", "SOV_BASELINE"]),
        ).order_by(Document.uploaded_at.desc())
    ).all()

    return ResponseEnvelope(
        data=[
            ReportExportRead(
                id=str(d.id),
                project_id=str(d.project_id),
                report_type=d.document_type,
                format="PDF" if "pdf" in d.mime_type else "XLSX",
                status="COMPLETED",
                download_url=f"/api/v1/documents/{d.id}/download",
                created_at=d.uploaded_at.isoformat(),
            )
            for d in docs
        ]
    )


@router.post(
    "/projects/{pid}/exports/request",
    response_model=ResponseEnvelope[ReportExportRead],
)
def request_report_export_alias(
    pid: uuid.UUID,
    req: ReportExportRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[ReportExportRead]:
    return create_report_export(pid, req, user, db)


# -----------------------------------------------------------------------------
# Data Quality Issues Waive
# -----------------------------------------------------------------------------
@router.post(
    "/data-quality-issues/{id}/waive",
    response_model=ResponseEnvelope[DataQualityIssueRead],
)
def waive_dqi_endpoint(
    id: uuid.UUID,
    req: DQIWaiveRequest,
    user: User = Depends(require_role(["OWNER", "CFO"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[DataQualityIssueRead]:
    service = ReportingService(db)
    resolve_req = DataQualityResolveRequest(
        resolution=f"Waived: {req.reason}",
        waive=True,
    )
    dqi = service.resolve_data_quality_issue(user, id, resolve_req)
    db.commit()
    return ResponseEnvelope(data=dqi)


# -----------------------------------------------------------------------------
# In-App Notifications
# -----------------------------------------------------------------------------
def to_notification_dto(n: Notification) -> NotificationRead:
    return NotificationRead(
        id=str(n.id),
        project_id=str(n.project_id) if n.project_id else None,
        title=n.title,
        message=n.message,
        type=n.type,
        severity=n.severity,
        read=n.read,
        link_url=n.link_url,
        created_at=n.created_at.isoformat() if n.created_at else "",
    )


@router.get(
    "/notifications",
    response_model=ResponseEnvelope[list[NotificationRead]],
)
def list_notifications_endpoint(
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "GC", "INVESTOR"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[list[NotificationRead]]:
    # Filter notifications: either assigned specifically to this user, or general/unassigned within the organization and appropriate for the role
    query = select(Notification).where(Notification.organization_id == user.organization_id)
    if user.role != "OWNER":
        query = query.where(
            (Notification.user_id == user.id) | (Notification.user_id.is_(None))
        )
    query = query.order_by(Notification.created_at.desc())
    notifs = db.scalars(query).all()
    return ResponseEnvelope(
        data=[to_notification_dto(n) for n in notifs]
    )


@router.post(
    "/notifications/{id}/read",
    response_model=ResponseEnvelope[NotificationRead],
)
def mark_notification_read_endpoint(
    id: str,
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "GC", "INVESTOR"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[NotificationRead]:
    try:
        notif_uuid = uuid.UUID(id)
        notif = db.get(Notification, notif_uuid)
    except ValueError:
        notif = None

    if not notif:
        raise NotFoundException(message=f"Notification {id} not found.")

    notif.read = True
    db.commit()
    db.refresh(notif)
    return ResponseEnvelope(data=to_notification_dto(notif))


@router.post(
    "/notifications/read-all",
    response_model=ResponseEnvelope[dict[str, str]],
)
def mark_all_notifications_read_endpoint(
    user: User = Depends(require_role(["OWNER", "CFO", "PM", "GC", "INVESTOR"])),
    db: Session = Depends(get_db),
) -> ResponseEnvelope[dict[str, str]]:
    notifs = db.scalars(
        select(Notification).where(
            Notification.organization_id == user.organization_id,
            Notification.read.is_(False),
        )
    ).all()
    for n in notifs:
        n.read = True
    db.commit()
    return ResponseEnvelope(data={"status": "all_marked_read"})

