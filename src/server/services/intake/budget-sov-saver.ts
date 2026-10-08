import { db } from '../../db/schema';
import { BudgetLine, UserRole, USER_ROLES } from '../../../shared/types';
import { broadcastEvent } from '../../index';
import { recordAuditEvent } from './intake-audit-logger';

export function saveMasterBudgetSOV(
  projectId: string,
  lines: { category: string; sub_category?: string; cost_code?: string; amount: number }[],
  actorRole: UserRole = 'CFO'
) {
  const actor = USER_ROLES[actorRole];
  const versionId = `bv-${projectId}-v1`;

  db.prepare(`
    INSERT OR REPLACE INTO budget_versions (id, project_id, version_number, status, approved_at, approved_by_user_id, notes)
    VALUES (?, ?, 1, 'APPROVED', datetime('now'), ?, 'User Master Budget & SOV Intake')
  `).run(versionId, projectId, actor.id);

  db.prepare('DELETE FROM budget_lines WHERE project_id = ?').run(projectId);

  const createdLines: BudgetLine[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const lineId = `bl-${projectId}-${i + 1}`;
    const bl: BudgetLine = {
      id: lineId,
      project_id: projectId,
      version_id: versionId,
      category: l.category,
      sub_category: l.sub_category,
      cost_code: l.cost_code || `0${i + 1}-000`,
      original_amount: l.amount,
      source_ref: `User Form / SOV Input, Line ${i + 1}`,
    };

    db.prepare(`
      INSERT INTO budget_lines (id, project_id, version_id, category, sub_category, cost_code, original_amount, source_ref)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(bl.id, bl.project_id, bl.version_id, bl.category, bl.sub_category || null, bl.cost_code, bl.original_amount, bl.source_ref);

    createdLines.push(bl);
  }

  recordAuditEvent(actorRole, actor.name, 'BudgetVersion', versionId, 'status', 'DRAFT', 'APPROVED', 'Master Budget Intake Submission');
  broadcastEvent({ type: 'BUDGET_UPDATED', project_id: projectId });

  return { versionId, lines: createdLines };
}
