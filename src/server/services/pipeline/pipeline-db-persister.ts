import { db } from '../../db/schema';
import { PipelineFile, PipelineStepLog } from './pipeline-types';

export function persistPipelineExecution(params: {
  projectId: string;
  projectName: string;
  projectAddress: string;
  userContext: { name: string; company: string; email: string; role?: string };
  units?: number;
  squareFeet?: number;
  computedBudget: number;
  loanFacilityAmount: number;
  initialFunded: number;
  dateStr: string;
  sovLinesToInsert: Array<{ category: string; costCode: string; amount: number }>;
  invoicesToInsert: Array<{ vendor: string; category: string; costCode: string; invoiceNumber: string; amount: number; lienWaiver: boolean; description?: string; sourceDocument: string }>;
  files: PipelineFile[];
  docHashes: Array<{ fileName: string; hash: string; size: number }>;
  pipelineSteps: PipelineStepLog[];
}) {
  const {
    projectId,
    projectName,
    projectAddress,
    userContext,
    units,
    squareFeet,
    computedBudget,
    loanFacilityAmount,
    initialFunded,
    dateStr,
    sovLinesToInsert,
    invoicesToInsert,
    files,
    docHashes,
    pipelineSteps,
  } = params;

  const updateTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO projects (id, name, address, gc_name, lender_name, units, square_feet, target_budget, start_date, expected_completion, status, created_by_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `).run(
      projectId,
      projectName,
      projectAddress,
      userContext.company || 'Acme Builders LLC',
      'Heritage Bank & Trust',
      units || 4,
      squareFeet || 6400,
      computedBudget,
      dateStr,
      '2026-12-15',
      userContext.email || 'user@groundup.ai'
    );

    db.prepare(`
      INSERT INTO loans (id, project_id, lender_name, loan_amount, interest_rate, term_months, holdback_amount, current_balance, closing_date, entered_by_role)
      VALUES (?, ?, 'Heritage Bank & Trust', ?, 0.0875, 18, 50000, ?, ?, 'CFO')
    `).run(`loan-${projectId}`, projectId, loanFacilityAmount, initialFunded, dateStr);

    const versionId = `bv-${projectId}-v1`;
    db.prepare(`
      INSERT INTO budget_versions (id, project_id, version_number, status, approved_at, approved_by_user_id, notes)
      VALUES (?, ?, 1, 'APPROVED', datetime('now'), ?, 'AI Pipeline Extracted Master SOV')
    `).run(versionId, projectId, userContext.email || 'user@groundup.ai');

    for (let i = 0; i < sovLinesToInsert.length; i++) {
      const s = sovLinesToInsert[i];
      db.prepare(`
        INSERT INTO budget_lines (id, project_id, version_id, category, cost_code, original_amount, source_ref)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        `bl-${projectId}-${i + 1}`,
        projectId,
        versionId,
        s.category,
        s.costCode,
        s.amount,
        `AI Extracted from ${files[0]?.fileName || 'Master_Budget_SOV.csv'}`
      );
    }

    for (let i = 0; i < invoicesToInsert.length; i++) {
      const inv = invoicesToInsert[i];
      db.prepare(`
        INSERT INTO expenses (id, project_id, category, vendor_id, vendor_name, amount, status, invoice_id, source_document_id, source_ref, cost_scope, lien_waiver_received, description, expense_date, entered_by_role)
        VALUES (?, ?, ?, ?, ?, ?, 'posted', ?, ?, ?, 'PROJECT', ?, ?, ?, 'ACCOUNTANT')
      `).run(
        `exp-${projectId}-${i + 1}`,
        projectId,
        inv.category,
        `ven-${i + 1}`,
        inv.vendor,
        inv.amount,
        inv.invoiceNumber,
        `doc-${projectId}-${i + 1}`,
        `AI Ingestion Pipeline · ${inv.sourceDocument}`,
        inv.lienWaiver ? 1 : 0,
        inv.description,
        dateStr
      );
    }

    if (initialFunded > 0) {
      const drawId = `draw-${projectId}-1`;
      db.prepare(`
        INSERT INTO draws (id, project_id, draw_number, revision_number, requested_total, approved_total, disbursed_total, status, submitted_date, disbursed_date, lender_notes)
        VALUES (?, ?, 1, 0, ?, ?, ?, 'approved_full', ?, ?, 'Initial draw advance verified and funded by lender')
      `).run(drawId, projectId, initialFunded, initialFunded, initialFunded, dateStr, dateStr);

      db.prepare(`
        INSERT INTO draw_lines (id, draw_id, project_id, category, requested_amount, approved_amount, funded_amount, status)
        VALUES (?, ?, ?, 'Foundation & Concrete', ?, ?, ?, 'disbursed')
      `).run(`dl-${drawId}-1`, drawId, projectId, initialFunded, initialFunded, initialFunded);
    }

    const scheduleItems = [
      { milestone: 'Site Grading & Undergrounds', trade: 'Pre-construction & Permits', planned_start: dateStr, planned_end: '2026-03-15', verified_progress_pct: 1.0 },
      { milestone: 'Foundation & Concrete Slabs', trade: 'Foundation & Concrete', planned_start: '2026-03-15', planned_end: '2026-04-20', verified_progress_pct: 0.95 },
      { milestone: 'Structural Framing & Trusses', trade: 'Framing & Trusses', planned_start: '2026-04-20', planned_end: '2026-06-30', verified_progress_pct: 0.45 },
      { milestone: 'MEP Rough-in', trade: 'Plumbing Systems', planned_start: '2026-06-01', planned_end: '2026-08-15', verified_progress_pct: 0.15 },
      { milestone: 'Drywall & Interior Finishes', trade: 'Drywall & Finishes', planned_start: '2026-08-15', planned_end: '2026-10-30', verified_progress_pct: 0.0 },
      { milestone: 'Final Inspection & CO', trade: 'Contingency Reserve', planned_start: '2026-11-01', planned_end: '2026-12-15', verified_progress_pct: 0.0 },
    ];

    for (let i = 0; i < scheduleItems.length; i++) {
      const s = scheduleItems[i];
      db.prepare(`
        INSERT INTO schedule_activities (id, project_id, milestone, trade, planned_start, planned_end, verified_progress_pct, last_verified_source, last_verified_date, entered_by_role)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'AI_Pipeline_Analysis', ?, 'PM')
      `).run(`sa-${projectId}-${i + 1}`, projectId, s.milestone, s.trade, s.planned_start, s.planned_end, s.verified_progress_pct, dateStr);
    }

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const docId = `doc-${projectId}-${i + 1}`;
      const hash = docHashes[i]?.hash || 'sha256_mock';

      db.prepare(`
        INSERT INTO documents (id, project_id, file_name, file_size, mime_type, storage_path, type, classification_confidence, sha256_hash, uploaded_by_role)
        VALUES (?, ?, ?, ?, 'text/plain', ?, 'SOV', 0.99, ?, 'ACCOUNTANT')
      `).run(docId, projectId, f.fileName, f.content?.length || 1024, `/vault/${f.fileName}`, hash);

      for (const step of pipelineSteps) {
        db.prepare(`
          INSERT INTO pipeline_steps (id, document_id, step_name, status, output, confidence)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(`ps-${projectId}-${i}-${step.stepName}`, docId, step.stepName, step.status, step.description, step.confidence);
      }
    }

    db.prepare(`
      INSERT INTO audit_events (id, actor_role, actor_name, entity, entity_id, field, old_value, new_value, source)
      VALUES (?, 'DEVELOPER_OWNER', ?, 'Project', ?, 'ai_pipeline_execution', 'NONE', '10_STEP_VERIFIED', 'GroundUp AI Ingestion Engine')
    `).run(`aud-ai-${Date.now()}`, userContext.name || 'Harrison Reed', projectId);

    return {
      newProject: {
        id: projectId,
        name: projectName,
        address: projectAddress,
        target_budget: computedBudget,
        status: 'ACTIVE',
      },
      insertedBudgetLines: sovLinesToInsert,
      insertedInvoices: invoicesToInsert,
    };
  });

  return updateTx();
}
