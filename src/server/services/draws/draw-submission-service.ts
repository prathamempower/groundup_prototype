import { db } from '../../db/schema';
import { Draw, DrawLine, UserRole, USER_ROLES } from '../../../shared/types';
import { broadcastEvent } from '../../index';

function recordAuditEvent(
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

export function getProjectDraws(projectId: string): { draws: Draw[]; drawLines: DrawLine[] } {
  const draws = db.prepare('SELECT * FROM draws WHERE project_id = ? ORDER BY draw_number ASC, revision_number ASC').all(projectId) as Draw[];
  const drawLines = db.prepare('SELECT * FROM draw_lines WHERE project_id = ?').all(projectId) as DrawLine[];
  return { draws, drawLines };
}

export function createDrawSubmission(
  projectId: string,
  drawNumber: number,
  lines: { category: string; requested_amount: number; source_document_id?: string; source_ref?: string }[],
  actorRole: UserRole = 'CFO'
): { draw: Draw; drawLines: DrawLine[] } {
  const actor = USER_ROLES[actorRole];
  const drawId = `draw-${projectId}-${drawNumber}-rev0`;
  const requestedTotal = lines.reduce((sum, l) => sum + l.requested_amount, 0);

  const draw: Draw = {
    id: drawId,
    project_id: projectId,
    draw_number: drawNumber,
    revision_number: 0,
    requested_total: requestedTotal,
    approved_total: 0,
    disbursed_total: 0,
    status: 'submitted',
    submitted_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO draws (id, project_id, draw_number, revision_number, requested_total, approved_total, disbursed_total, status, submitted_date)
    VALUES (?, ?, ?, 0, ?, 0, 0, 'submitted', ?)
  `).run(draw.id, draw.project_id, draw.draw_number, draw.requested_total, draw.submitted_date);

  const createdLines: DrawLine[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const lineId = `dl-${drawId}-${i + 1}`;
    const dl: DrawLine = {
      id: lineId,
      draw_id: drawId,
      project_id: projectId,
      category: l.category,
      requested_amount: l.requested_amount,
      approved_amount: 0,
      funded_amount: 0,
      status: 'requested',
      source_document_id: l.source_document_id,
      source_ref: l.source_ref,
    };
    db.prepare(`
      INSERT INTO draw_lines (id, draw_id, project_id, category, requested_amount, approved_amount, funded_amount, status, source_document_id, source_ref)
      VALUES (?, ?, ?, ?, ?, 0, 0, 'requested', ?, ?)
    `).run(dl.id, dl.draw_id, dl.project_id, dl.category, dl.requested_amount, dl.source_document_id || null, dl.source_ref || null);
    createdLines.push(dl);
  }

  recordAuditEvent(actorRole, actor.name, 'Draw', draw.id, 'status', 'NEW', 'submitted', `Draw #${drawNumber} Submission`);
  broadcastEvent({ type: 'DRAW_UPDATED', project_id: projectId });

  return { draw, drawLines: createdLines };
}
