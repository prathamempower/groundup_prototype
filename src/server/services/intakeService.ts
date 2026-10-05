// GroundUp AI — User Intake & Data Processing Service
// Handles user-entered project profiles, loan terms, SOVs, invoices, schedule, and draws

import { db } from '../db/schema';
import { Project, Loan, BudgetLine, Expense, ScheduleActivity, UserRole, USER_ROLES } from '../../shared/types';
import { broadcastEvent } from '../index';
import crypto from 'crypto';

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

export function createProjectWithLoan(
  projectData: {
    name: string;
    address: string;
    gc_name: string;
    lender_name: string;
    units: number;
    square_feet?: number;
    target_budget: number;
    start_date: string;
    expected_completion: string;
    actor_role?: UserRole;
  },
  loanData?: {
    loan_amount: number;
    interest_rate: number;
    term_months: number;
    holdback_amount: number;
  }
): { project: Project; loan?: Loan } {
  const projectId = `proj-${Date.now()}`;
  const actorRole = projectData.actor_role || 'DEVELOPER_OWNER';
  const actor = USER_ROLES[actorRole];

  const project: Project = {
    id: projectId,
    name: projectData.name,
    address: projectData.address,
    gc_name: projectData.gc_name,
    lender_name: projectData.lender_name,
    units: projectData.units,
    square_feet: projectData.square_feet,
    target_budget: projectData.target_budget,
    start_date: projectData.start_date,
    expected_completion: projectData.expected_completion,
    status: 'ACTIVE',
    created_by_user_id: actor.id,
    created_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO projects (id, name, address, gc_name, lender_name, units, square_feet, target_budget, start_date, expected_completion, status, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `).run(
    project.id,
    project.name,
    project.address,
    project.gc_name,
    project.lender_name,
    project.units,
    project.square_feet || null,
    project.target_budget,
    project.start_date,
    project.expected_completion,
    project.created_by_user_id
  );

  let loanObj: Loan | undefined;
  if (loanData && loanData.loan_amount > 0) {
    loanObj = {
      id: `loan-${projectId}`,
      project_id: projectId,
      lender_name: project.lender_name,
      loan_amount: loanData.loan_amount,
      interest_rate: loanData.interest_rate,
      term_months: loanData.term_months,
      holdback_amount: loanData.holdback_amount,
      current_balance: 0,
      closing_date: project.start_date,
      entered_by_role: actorRole,
    };

    db.prepare(`
      INSERT INTO loans (id, project_id, lender_name, loan_amount, interest_rate, term_months, holdback_amount, current_balance, closing_date, entered_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      loanObj.id,
      loanObj.project_id,
      loanObj.lender_name,
      loanObj.loan_amount,
      loanObj.interest_rate,
      loanObj.term_months,
      loanObj.holdback_amount,
      loanObj.current_balance,
      loanObj.closing_date,
      loanObj.entered_by_role
    );
  }

  recordAuditEvent(actorRole, actor.name, 'Project', projectId, 'status', 'NEW', 'ACTIVE', 'User Project Creation');
  broadcastEvent({ type: 'PROJECT_CREATED', project_id: projectId });

  return { project, loan: loanObj };
}

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

  // Delete previous draft/initial lines
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

export function addDirectExpense(
  projectId: string,
  expenseData: {
    category: string;
    vendor_name: string;
    amount: number;
    expense_date: string;
    description?: string;
    lien_waiver_received?: boolean;
    source_ref?: string;
  },
  actorRole: UserRole = 'ACCOUNTANT'
): Expense {
  const actor = USER_ROLES[actorRole];
  const expenseId = `exp-${Date.now()}`;
  const vendorId = `ven-${expenseData.vendor_name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}`;

  const expense: Expense = {
    id: expenseId,
    project_id: projectId,
    category: expenseData.category,
    vendor_id: vendorId,
    vendor_name: expenseData.vendor_name,
    amount: expenseData.amount,
    status: 'posted',
    source_document_id: 'doc-user-entry',
    source_ref: expenseData.source_ref || 'Direct User Invoice Entry',
    cost_scope: 'PROJECT',
    lien_waiver_received: Boolean(expenseData.lien_waiver_received),
    description: expenseData.description,
    expense_date: expenseData.expense_date,
    entered_by_role: actorRole,
    created_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO expenses (id, project_id, category, vendor_id, vendor_name, amount, status, source_document_id, source_ref, cost_scope, lien_waiver_received, description, expense_date, entered_by_role)
    VALUES (?, ?, ?, ?, ?, ?, 'posted', ?, ?, 'PROJECT', ?, ?, ?, ?)
  `).run(
    expense.id,
    expense.project_id,
    expense.category,
    expense.vendor_id,
    expense.vendor_name,
    expense.amount,
    expense.source_document_id,
    expense.source_ref,
    expense.lien_waiver_received ? 1 : 0,
    expense.description || null,
    expense.expense_date,
    expense.entered_by_role
  );

  recordAuditEvent(actorRole, actor.name, 'Expense', expenseId, 'amount', '0', String(expense.amount), 'Invoice Intake Entry');
  broadcastEvent({ type: 'EXPENSE_POSTED', project_id: projectId });

  return expense;
}

export function saveScheduleMilestones(
  projectId: string,
  activities: {
    milestone: string;
    trade: string;
    planned_start: string;
    planned_end: string;
    verified_progress_pct?: number;
    last_verified_source?: 'inspection_result' | 'PM_confirmation' | 'lender_inspection';
  }[],
  actorRole: UserRole = 'PM'
) {
  const actor = USER_ROLES[actorRole];
  db.prepare('DELETE FROM schedule_activities WHERE project_id = ?').run(projectId);

  const createdActs: ScheduleActivity[] = [];
  for (let i = 0; i < activities.length; i++) {
    const a = activities[i];
    const actId = `act-${projectId}-${i + 1}`;
    const act: ScheduleActivity = {
      id: actId,
      project_id: projectId,
      milestone: a.milestone,
      trade: a.trade,
      planned_start: a.planned_start,
      planned_end: a.planned_end,
      verified_progress_pct: a.verified_progress_pct || 0,
      last_verified_source: a.last_verified_source || 'PM_confirmation',
      last_verified_date: new Date().toISOString().split('T')[0],
      entered_by_role: actorRole,
    };

    db.prepare(`
      INSERT INTO schedule_activities (id, project_id, milestone, trade, planned_start, planned_end, verified_progress_pct, last_verified_source, last_verified_date, entered_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      act.id,
      act.project_id,
      act.milestone,
      act.trade,
      act.planned_start,
      act.planned_end,
      act.verified_progress_pct,
      act.last_verified_source,
      act.last_verified_date,
      act.entered_by_role
    );

    createdActs.push(act);
  }

  recordAuditEvent(actorRole, actor.name, 'ScheduleActivity', projectId, 'count', '0', String(activities.length), 'Schedule Intake Submission');
  broadcastEvent({ type: 'SCHEDULE_UPDATED', project_id: projectId });

  return createdActs;
}

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

  // 1. Insert Project
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

  // 2. Insert Loan
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

  // 3. Insert Master Budget & SOV
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

  // 4. Insert User Invoices
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

  // 5. If there is a disbursed draw amount, insert Draw #1 record
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

  // 6. Insert Schedule Activities
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

