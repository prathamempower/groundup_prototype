// GroundUp AI — Project & Portfolio Calculation Service

import { db } from '../db/schema';
import { Project, ProjectFourTruthsSummary } from '../../shared/types';
import { computeProjectFourTruths } from '../../shared/engine/reconciliation';

export function getProjectFourTruths(projectId: string): ProjectFourTruthsSummary {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project;
  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  const budgetVersions = db.prepare('SELECT * FROM budget_versions WHERE project_id = ?').all(projectId);
  const budgetLines = db.prepare('SELECT * FROM budget_lines WHERE project_id = ?').all(projectId);
  const changeOrders = db.prepare('SELECT * FROM change_orders WHERE project_id = ?').all(projectId);
  const expenses = db.prepare('SELECT * FROM expenses WHERE project_id = ?').all(projectId);
  const draws = db.prepare('SELECT * FROM draws WHERE project_id = ?').all(projectId);
  const drawLines = db.prepare('SELECT * FROM draw_lines WHERE project_id = ?').all(projectId);
  const activities = db.prepare('SELECT * FROM schedule_activities WHERE project_id = ?').all(projectId);
  const inspections = db.prepare('SELECT * FROM inspections WHERE project_id = ?').all(projectId);
  const loan = db.prepare('SELECT * FROM loans WHERE project_id = ?').get(projectId);

  return computeProjectFourTruths(project, {
    budgetVersions,
    budgetLines,
    changeOrders,
    expenses,
    draws,
    drawLines,
    activities,
    inspections,
    loan,
  });
}

export function getAllProjects(): Project[] {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as Project[];
}

export function updateProject(projectId: string, updates: Partial<Project>): Project {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project;
  if (!existing) {
    throw new Error(`Project ${projectId} not found`);
  }

  const updated: Project = {
    ...existing,
    ...updates,
  };

  db.prepare(`
    UPDATE projects 
    SET name = ?, address = ?, gc_name = ?, lender_name = ?, units = ?, square_feet = ?, target_budget = ?, status = ?
    WHERE id = ?
  `).run(
    updated.name,
    updated.address,
    updated.gc_name,
    updated.lender_name,
    updated.units,
    updated.square_feet || null,
    updated.target_budget,
    updated.status,
    projectId
  );

  return updated;
}

export function deleteProject(projectId: string): { success: boolean } {
  const deleteTx = db.transaction(() => {
    // Delete child dependencies of documents
    try {
      db.prepare(`
        DELETE FROM extraction_fields WHERE extraction_id IN (
          SELECT de.id FROM document_extractions de 
          JOIN documents d ON de.document_id = d.id 
          WHERE d.project_id = ?
        )
      `).run(projectId);
    } catch {}

    try {
      db.prepare(`
        DELETE FROM document_extractions WHERE document_id IN (
          SELECT id FROM documents WHERE project_id = ?
        )
      `).run(projectId);
    } catch {}

    try {
      db.prepare(`
        DELETE FROM pipeline_steps WHERE document_id IN (
          SELECT id FROM documents WHERE project_id = ?
        )
      `).run(projectId);
    } catch {}

    // Delete documents & extractions
    try { db.prepare('DELETE FROM staging_extractions WHERE project_id = ?').run(projectId); } catch {}
    try { db.prepare('DELETE FROM documents WHERE project_id = ?').run(projectId); } catch {}

    // Delete invoices & expense records
    try { db.prepare('DELETE FROM invoice_lines WHERE invoice_id IN (SELECT id FROM invoices WHERE project_id = ?)').run(projectId); } catch {}
    try { db.prepare('DELETE FROM invoices WHERE project_id = ?').run(projectId); } catch {}
    try { db.prepare('DELETE FROM expenses WHERE project_id = ?').run(projectId); } catch {}

    // Delete change orders & budget lines/versions/budgets
    try { db.prepare('DELETE FROM change_order_lines WHERE change_order_id IN (SELECT id FROM change_orders WHERE project_id = ?)').run(projectId); } catch {}
    try { db.prepare('DELETE FROM change_orders WHERE project_id = ?').run(projectId); } catch {}
    try { db.prepare('DELETE FROM budget_lines WHERE project_id = ?').run(projectId); } catch {}
    try { db.prepare('DELETE FROM budget_versions WHERE project_id = ?').run(projectId); } catch {}
    try { db.prepare('DELETE FROM budgets WHERE project_id = ?').run(projectId); } catch {}

    // Delete draws & draw lines
    try { db.prepare('DELETE FROM draw_lines WHERE project_id = ?').run(projectId); } catch {}
    try { db.prepare('DELETE FROM draws WHERE project_id = ?').run(projectId); } catch {}

    // Delete inspections & schedule activities
    try { db.prepare('DELETE FROM inspections WHERE project_id = ?').run(projectId); } catch {}
    try { db.prepare('DELETE FROM schedule_activities WHERE project_id = ?').run(projectId); } catch {}

    // Delete loans & funding facilities / covenants
    try { db.prepare('DELETE FROM lender_covenants WHERE funding_facility_id IN (SELECT id FROM funding_facilities WHERE project_id = ?)').run(projectId); } catch {}
    try { db.prepare('DELETE FROM funding_facilities WHERE project_id = ?').run(projectId); } catch {}
    try { db.prepare('DELETE FROM loans WHERE project_id = ?').run(projectId); } catch {}

    // Delete audit events & main project row
    try { db.prepare('DELETE FROM audit_events WHERE entity_id = ?').run(projectId); } catch {}
    db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
  });

  deleteTx();
  return { success: true };
}
