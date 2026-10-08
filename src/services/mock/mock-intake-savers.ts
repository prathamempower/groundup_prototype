import {
  BudgetLine,
  Expense,
  ScheduleActivity,
  UserRole,
  BudgetLineInputDTO,
  DirectExpenseInputDTO,
  MilestoneActivityInputDTO,
  SaveMasterBudgetSOVResponseDTO,
  SaveScheduleMilestonesResponseDTO,
} from '../../types';
import { mockStore } from './MockDataStore';

export function saveMockMasterBudgetSOV(
  projectId: string,
  lines: BudgetLineInputDTO[],
  actorRole: UserRole = 'CFO'
): SaveMasterBudgetSOVResponseDTO {
  mockStore.budgetLines = mockStore.budgetLines.filter((bl) => bl.project_id !== projectId);

  const versionId = `bv-${projectId}-v1`;
  mockStore.budgetVersions = mockStore.budgetVersions.filter((bv) => bv.project_id !== projectId);
  mockStore.budgetVersions.push({
    id: versionId,
    project_id: projectId,
    version_number: 1,
    status: 'APPROVED',
    approved_at: new Date().toISOString(),
    approved_by_user_id: 'user-cfo-1',
    notes: 'Master Budget SOV',
    created_at: new Date().toISOString(),
  });

  const createdLines: BudgetLine[] = [];
  let total = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bl: BudgetLine = {
      id: `bl-${projectId}-${i + 1}`,
      project_id: projectId,
      version_id: versionId,
      category: line.category,
      sub_category: line.sub_category,
      cost_code: line.cost_code || `0${i + 1}-100`,
      original_amount: Number(line.amount) || 0,
      source_ref: `SOV Line ${i + 1}`,
    };
    mockStore.budgetLines.push(bl);
    createdLines.push(bl);
    total += bl.original_amount;
  }

  mockStore.recordAuditEvent(
    actorRole,
    'User',
    'BudgetSOV',
    projectId,
    'budget_lines',
    '0',
    `${lines.length} lines`,
    'SOV Upload / Entry'
  );

  return { success: true, lines: createdLines, totalBudget: total };
}

export function addMockDirectExpense(
  projectId: string,
  expenseData: DirectExpenseInputDTO,
  actorRole: UserRole = 'ACCOUNTANT',
  actorName: string = 'User'
): Expense {
  const exp: Expense = {
    id: `exp-${projectId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    project_id: projectId,
    category: expenseData.category,
    vendor_id: `ven-${Math.floor(Math.random() * 1000)}`,
    vendor_name: expenseData.vendor_name,
    amount: Number(expenseData.amount) || 0,
    status: expenseData.status || 'posted',
    invoice_id: expenseData.invoice_id || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    source_document_id: 'doc-manual',
    source_ref: expenseData.source_ref || `Invoice #${expenseData.invoice_id || 'manual'}`,
    cost_scope: expenseData.cost_scope || 'PROJECT',
    lien_waiver_received: expenseData.lien_waiver_received ?? true,
    description: expenseData.description,
    expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
    entered_by_role: actorRole,
    created_at: new Date().toISOString(),
  };

  mockStore.expenses.push(exp);
  mockStore.recordAuditEvent(
    actorRole,
    actorName,
    'Expense',
    exp.id,
    'amount',
    '0',
    `$${exp.amount}`,
    'Direct Expense Entry'
  );

  return { ...exp };
}

export function saveMockScheduleMilestones(
  projectId: string,
  activities: MilestoneActivityInputDTO[],
  actorRole: UserRole = 'PM'
): SaveScheduleMilestonesResponseDTO {
  mockStore.activities = mockStore.activities.filter((a) => a.project_id !== projectId);

  for (let i = 0; i < activities.length; i++) {
    const act = activities[i];
    const sa: ScheduleActivity = {
      id: `sa-${projectId}-${i + 1}`,
      project_id: projectId,
      milestone: act.milestone,
      trade: act.trade,
      planned_start: act.planned_start,
      planned_end: act.planned_end,
      verified_progress_pct: act.verified_progress_pct || 0,
      last_verified_source: 'PM_confirmation',
      last_verified_date: new Date().toISOString().split('T')[0],
      entered_by_role: actorRole,
    };
    mockStore.activities.push(sa);
  }

  mockStore.recordAuditEvent(
    actorRole,
    'User',
    'Schedule',
    projectId,
    'milestones',
    '0',
    `${activities.length} milestones`,
    'Schedule Intake'
  );

  return { success: true, count: activities.length };
}
