import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.db.models import AuditEvent, generate_uuid, utc_now


def record_audit_event(
    db: Session,
    organization_id: uuid.UUID,
    actor_id: uuid.UUID,
    action: str,
    entity_type: str,
    entity_id: uuid.UUID,
    previous_value: dict[str, Any] | None = None,
    new_value: dict[str, Any] | None = None,
    rationale: str | None = None,
    source_citation: str | None = None,
    project_id: uuid.UUID | None = None,
) -> AuditEvent:
    """
    Appends an immutable audit event for financial writes.
    Must be called within the active database transaction.
    """
    event = AuditEvent(
        id=generate_uuid(),
        organization_id=organization_id,
        project_id=project_id,
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        previous_value=previous_value,
        new_value=new_value,
        rationale=rationale,
        source_citation=source_citation,
        occurred_at=utc_now(),
    )
    db.add(event)
    db.flush()
    return event
