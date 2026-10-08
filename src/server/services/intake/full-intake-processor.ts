import { db } from '../../db/schema';
import { Project } from '../../../shared/types';
import { broadcastEvent } from '../../index';
import { recordAuditEvent } from './intake-audit-logger';

export function createFullUserProjectIntake(data: {
  user: { name: string; company: string; email: string; role?: string };
  project: {
    name: string;
    address: string;
    propertyType?: string;
    units?: number;
    square_feet?: number;
    status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
    target_budget: number;
  };
  loan?: {
    lender_name: string;
    loan_amount: number;
    interest_rate: number;
    disbursed_funded: number;
    term_months?: number;
  };
  sovLines?: Array<{ category: string; amount: number; cost_code?: string }>;
  invoices?: Array<{ vendor: string; category: string; amount: number; inv: string; waiver: boolean; description?: string }>;
  milestones?: Array<{ milestone: string; trade: string; planned_start: string; planned_end: string; verified_progress_pct?: number }>;
}) {
  const projectId = `proj-user-${Date.now()}`;
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  db.prepare(`
    INSERT INTO projects (id, name, address, gc_name, lender_name, units, square_feet, target_budget, start_date, expected_completion, status, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId,
    data.project.name,
    data.project.address,
    data.user.company,
    data.loan?.lender_name || 'Heritage Bank',
    data.project.units || 1,
    data.project.square_feet || 3200,
    data.project.target_budget,
    dateStr,
    '2026-12-31',
    data.project.status,
    data.user.email
  );

  const loanAmount = data.loan?.loan_amount || data.project.target_budget * 0.8;
  const interestRate = data.loan?.interest_rate ? data.loan.interest_rate / 100 : 0.0975;
  const disbursedFunded = data.loan?.disbursed_funded || 0;

  db.prepare(`
    INSERT INTO loans (id, project_id, lender_name, loan_amount, interest_rate, term_months, holdback_amount, current_balance, closing_date, entered_by_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CFO')
  `).run(
    `loan-${projectId}`,
    projectId,
    data.loan?.lender_name || 'Heritage Bank',
    loanAmount,
    interestRate,
    data.loan?.term_months || 18,
    50000,
    disbursedFunded,
    dateStr
  );

  const versionId = `bv-${projectId}-v1`;
  db.prepare(`
    INSERT INTO budget_versions (id, project_id, version_number, status, approved_at, approved_by_user_id, notes)
    VALUES (?, ?, 1, 'APPROVED', datetime('now'), ?, 'User Custom SOV')
  `).run(versionId, projectId, data.user.email);

  const defaultSov = [
    { category: 'Pre-construction & Permits', amount: Math.round(data.project.target_budget * 0.05), cost_code: '01-100' },
    { category: 'Site Work & Demolition', amount: Math.round(data.project.target_budget * 0.06), cost_code: '02-100' },
    { category: 'Foundation & Concrete', amount: Math.round(data.project.target_budget * 0.18), cost_code: '03-300' },
    { category: 'Framing & Trusses', amount: Math.round(data.project.target_budget * 0.25), cost_code: '06-100' },
    { category: 'MEP Rough-in', amount: Math.round(data.project.target_budget * 0.15), cost_code: '22-000' },
    { category: 'Drywall & Insulation', amount: Math.round(data.project.target_budget * 0.09), cost_code: '09-200' },
    { category: 'Exterior & Roofing', amount: Math.round(data.project.target_budget * 0.08), cost_code: '07-100' },
    { category: 'Interior Finishes', amount: Math.round(data.project.target_budget * 0.10), cost_code: '09-600' },
    { category: 'Contingency', amount: Math.round(data.project.target_budget * 0.04), cost_code: '00-500' },
  ];

  const sovToInsert = data.sovLines && data.sovLines.length > 0 ? data.sovLines : defaultSov;
  for (let i = 0; i < sovToInsert.length; i++) {
    const s = sovToInsert[i];
    db.prepare(`
      INSERT INTO budget_lines (id, project_id, version_id, category, cost_code, original_amount, source_ref)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `bl-${projectId}-${i + 1}`,
      projectId,
      versionId,
      s.category,
      s.cost_code || `0${i + 1}-000`,
      s.amount,
      `User SOV Input, Line ${i + 1}`
    );
  }

  if (data.invoices && data.invoices.length > 0) {
    for (let i = 0; i < data.invoices.length; i++) {
      const inv = data.invoices[i];
      db.prepare(`
        INSERT INTO expenses (id, project_id, category, vendor_id, vendor_name, amount, status, invoice_id, source_document_id, source_ref, cost_scope, lien_waiver_received, description, expense_date, entered_by_role)
        VALUES (?, ?, ?, ?, ?, ?, 'posted', ?, ?, ?, 'PROJECT', ?, ?, ?, 'OWNER')
      `).run(
        `exp-${projectId}-${i + 1}`,
        projectId,
        inv.category,
        `ven-${i + 1}`,
        inv.vendor,
        inv.amount,
        inv.inv || `INV-${i + 100}`,
        `doc-inv-${inv.inv || i + 100}`,
        `Invoice #${inv.inv || i + 100} · Entered by ${data.user.name} (${data.user.company})`,
        inv.waiver ? 1 : 0,
        inv.description || 'Contractor draw invoice',
        dateStr
      );
    }
  }

  if (disbursedFunded > 0) {
    const drawId = `draw-${projectId}-1`;
    db.prepare(`
      INSERT INTO draws (id, project_id, draw_number, revision_number, requested_total, approved_total, disbursed_total, status, submitted_date, disbursed_date, lender_notes)
      VALUES (?, ?, 1, 0, ?, ?, ?, 'approved_full', ?, ?, 'Initial construction draw disbursed by lender')
    `).run(drawId, projectId, disbursedFunded, disbursedFunded, disbursedFunded, dateStr, dateStr);

    db.prepare(`
      INSERT INTO draw_lines (id, draw_id, project_id, category, requested_amount, approved_amount, funded_amount, status)
      VALUES (?, ?, ?, 'Foundation & Concrete', ?, ?, ?, 'disbursed')
    `).run(`dl-${drawId}-1`, drawId, projectId, disbursedFunded, disbursedFunded, disbursedFunded);
  }

  const defaultMilestones = [
    { milestone: 'Pre-construction', trade: 'Architecture / Permits', planned_start: dateStr, planned_end: '2026-03-01', verified_progress_pct: data.project.status === 'COMPLETED' ? 1.0 : 1.0 },
    { milestone: 'Foundation', trade: 'Concrete & Masonry', planned_start: '2026-03-01', planned_end: '2026-04-15', verified_progress_pct: data.project.status === 'COMPLETED' ? 1.0 : data.project.status === 'ACTIVE' ? 0.8 : 0.0 },
    { milestone: 'Framing', trade: 'Carpentry & Framing', planned_start: '2026-04-15', planned_end: '2026-06-01', verified_progress_pct: data.project.status === 'COMPLETED' ? 1.0 : data.project.status === 'ACTIVE' ? 0.4 : 0.0 },
    { milestone: 'MEP rough-in', trade: 'Plumbing, Electrical, HVAC', planned_start: '2026-06-01', planned_end: '2026-08-01', verified_progress_pct: data.project.status === 'COMPLETED' ? 1.0 : 0.0 },
    { milestone: 'Drywall + finish', trade: 'Drywall & Painting', planned_start: '2026-08-01', planned_end: '2026-10-15', verified_progress_pct: data.project.status === 'COMPLETED' ? 1.0 : 0.0 },
    { milestone: 'Final + CO', trade: 'City Inspection / Closeout', planned_start: '2026-10-15', planned_end: '2026-12-31', verified_progress_pct: data.project.status === 'COMPLETED' ? 1.0 : 0.0 },
  ];

  const milestonesToInsert = data.milestones || defaultMilestones;
  for (let i = 0; i < milestonesToInsert.length; i++) {
    const m = milestonesToInsert[i];
    db.prepare(`
      INSERT INTO schedule_activities (id, project_id, milestone, trade, planned_start, planned_end, verified_progress_pct, last_verified_source, last_verified_date, entered_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PM_confirmation', ?, 'PM')
    `).run(
      `sa-${projectId}-${i + 1}`,
      projectId,
      m.milestone,
      m.trade,
      m.planned_start,
      m.planned_end,
      m.verified_progress_pct || 0,
      dateStr
    );
  }

  recordAuditEvent('DEVELOPER_OWNER', data.user.name, 'Project', projectId, 'status', 'NEW', data.project.status, `Full Intake by ${data.user.name} (${data.user.company})`);
  broadcastEvent({ type: 'PROJECT_CREATED', project_id: projectId });

  const projectRecord = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project;
  return { projectId, project: projectRecord };
}
