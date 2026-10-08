import { db } from '../../db/schema';
import { Expense, UserRole, USER_ROLES } from '../../../shared/types';
import { broadcastEvent } from '../../index';
import { recordAuditEvent } from './intake-audit-logger';

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
