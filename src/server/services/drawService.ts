// GroundUp AI — Draw Lifecycle & Rejection State Machine Service
// Section 8: State Machine & Append-Only Revision Chains

import { db } from '../db/schema';
import { Draw, DrawLine, RejectionReasonCode, UserRole, USER_ROLES } from '../../shared/types';
import { broadcastEvent } from '../index';

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

export function recordLenderReview(
  drawId: string,
  response: {
    lines: {
      id: string;
      approved_amount: number;
      status: 'approved' | 'rejected' | 'partially_approved';
      rejection_reason_code?: RejectionReasonCode;
      rejection_notes?: string;
    }[];
    lender_notes?: string;
  },
  actorRole: UserRole = 'LENDER'
): Draw {
  const actor = USER_ROLES[actorRole];
  const draw = db.prepare('SELECT * FROM draws WHERE id = ?').get(drawId) as Draw;
  if (!draw) throw new Error(`Draw ${drawId} not found`);

  let approvedTotal = 0;
  let hasRejections = false;

  for (const l of response.lines) {
    approvedTotal += l.approved_amount;
    if (l.status === 'rejected' || l.status === 'partially_approved') {
      hasRejections = true;
    }

    db.prepare(`
      UPDATE draw_lines
      SET approved_amount = ?, status = ?, rejection_reason_code = ?, rejection_notes = ?
      WHERE id = ?
    `).run(l.approved_amount, l.status, l.rejection_reason_code || null, l.rejection_notes || null, l.id);

    recordAuditEvent(actorRole, actor.name, 'DrawLine', l.id, 'status', 'requested', l.status, 'Lender Draw Certificate Review');
  }

  const overallStatus = hasRejections
    ? approvedTotal === 0
      ? 'rejected'
      : 'approved_partial'
    : 'approved_full';

  const responseDate = new Date().toISOString().split('T')[0];

  db.prepare(`
    UPDATE draws
    SET approved_total = ?, status = ?, response_date = ?, lender_notes = ?
    WHERE id = ?
  `).run(approvedTotal, overallStatus, responseDate, response.lender_notes || null, drawId);

  recordAuditEvent(actorRole, actor.name, 'Draw', drawId, 'status', draw.status, overallStatus, 'Lender Draw Decision');
  broadcastEvent({ type: 'DRAW_UPDATED', project_id: draw.project_id });

  return db.prepare('SELECT * FROM draws WHERE id = ?').get(drawId) as Draw;
}

export function createDrawRevision(
  originalDrawId: string,
  correctiveLines: {
    category: string;
    requested_amount: number;
    corrective_document_id?: string;
    notes?: string;
  }[],
  actorRole: UserRole = 'CFO'
): { revisionDraw: Draw; drawLines: DrawLine[] } {
  const actor = USER_ROLES[actorRole];
  const origDraw = db.prepare('SELECT * FROM draws WHERE id = ?').get(originalDrawId) as Draw;
  if (!origDraw) throw new Error(`Original Draw ${originalDrawId} not found`);

  const nextRevNumber = origDraw.revision_number + 1;
  const revDrawId = `draw-${origDraw.project_id}-${origDraw.draw_number}-rev${nextRevNumber}`;
  const requestedTotal = correctiveLines.reduce((sum, l) => sum + l.requested_amount, 0);

  const revisionDraw: Draw = {
    id: revDrawId,
    project_id: origDraw.project_id,
    draw_number: origDraw.draw_number,
    revision_number: nextRevNumber,
    original_draw_id: origDraw.original_draw_id || origDraw.id,
    requested_total: requestedTotal,
    approved_total: 0,
    disbursed_total: 0,
    status: 'submitted',
    submitted_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO draws (id, project_id, draw_number, revision_number, original_draw_id, requested_total, approved_total, disbursed_total, status, submitted_date)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'submitted', ?)
  `).run(
    revisionDraw.id,
    revisionDraw.project_id,
    revisionDraw.draw_number,
    revisionDraw.revision_number,
    revisionDraw.original_draw_id,
    revisionDraw.requested_total,
    revisionDraw.submitted_date
  );

  const createdLines: DrawLine[] = [];
  for (let i = 0; i < correctiveLines.length; i++) {
    const l = correctiveLines[i];
    const lineId = `dl-${revDrawId}-${i + 1}`;
    const dl: DrawLine = {
      id: lineId,
      draw_id: revDrawId,
      project_id: origDraw.project_id,
      category: l.category,
      requested_amount: l.requested_amount,
      approved_amount: 0,
      funded_amount: 0,
      status: 'requested',
      corrective_document_id: l.corrective_document_id,
    };

    db.prepare(`
      INSERT INTO draw_lines (id, draw_id, project_id, category, requested_amount, approved_amount, funded_amount, status, corrective_document_id)
      VALUES (?, ?, ?, ?, ?, 0, 0, 'requested', ?)
    `).run(dl.id, dl.draw_id, dl.project_id, dl.category, dl.requested_amount, dl.corrective_document_id || null);

    createdLines.push(dl);
  }

  recordAuditEvent(actorRole, actor.name, 'Draw', revDrawId, 'status', 'NEW', 'submitted', `Draw #${origDraw.draw_number} Resubmission (Rev ${nextRevNumber})`);
  broadcastEvent({ type: 'DRAW_UPDATED', project_id: origDraw.project_id });

  return { revisionDraw, drawLines: createdLines };
}

export function recordWireDisbursement(drawId: string, disbursedAmount: number, actorRole: UserRole = 'LENDER'): Draw {
  const actor = USER_ROLES[actorRole];
  const draw = db.prepare('SELECT * FROM draws WHERE id = ?').get(drawId) as Draw;
  if (!draw) throw new Error(`Draw ${drawId} not found`);

  const disbursedDate = new Date().toISOString().split('T')[0];

  const lines = db.prepare('SELECT * FROM draw_lines WHERE draw_id = ?').all(drawId) as DrawLine[];
  for (const l of lines) {
    if (l.approved_amount > 0) {
      db.prepare(`
        UPDATE draw_lines
        SET funded_amount = approved_amount, status = 'disbursed'
        WHERE id = ?
      `).run(l.id);
    }
  }

  db.prepare(`
    UPDATE draws
    SET disbursed_total = ?, disbursed_date = ?
    WHERE id = ?
  `).run(disbursedAmount, disbursedDate, drawId);

  // Update loan current balance
  db.prepare(`
    UPDATE loans
    SET current_balance = current_balance + ?
    WHERE project_id = ?
  `).run(disbursedAmount, draw.project_id);

  recordAuditEvent(actorRole, actor.name, 'Draw', drawId, 'disbursed_total', String(draw.disbursed_total), String(disbursedAmount), 'Lender Wire Notification');
  broadcastEvent({ type: 'DRAW_DISBURSED', project_id: draw.project_id });

  return db.prepare('SELECT * FROM draws WHERE id = ?').get(drawId) as Draw;
}

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
