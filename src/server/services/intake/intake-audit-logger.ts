import { db } from '../../db/schema';
import { UserRole } from '../../../shared/types';

export function recordAuditEvent(
  actorRole: UserRole,
  actorName: string,
  entity: string,
  entityId: string,
  field: string,
  oldVal: string,
  newVal: string,
  source: string
) {
  const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  db.prepare(`
    INSERT INTO audit_events (id, actor_role, actor_name, entity, entity_id, field, old_value, new_value, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, actorRole, actorName, entity, entityId, field, oldVal, newVal, source);
}
