// GroundUp AI — Invoice & Expense Management Service
// Full support for invoice creation, revisions, lien waiver tracking, and automatic spend recalculation

import { db } from '../db/schema';
import { Expense, UserRole } from '../../shared/types';
import { broadcastEvent } from '../index';
import crypto from 'crypto';

export function getProjectInvoices(projectId: string): Expense[] {
  return db.prepare('SELECT * FROM expenses WHERE project_id = ? ORDER BY expense_date DESC').all(projectId) as Expense[];
}

export function addInvoice(
  projectId: string,
  invoiceData: {
    category: string;
    vendor_name: string;
    amount: number;
    invoice_id: string;
    description?: string;
    expense_date?: string;
    lien_waiver_received?: boolean;
    cost_scope?: string;
  },
  actorName: string,
  actorRole: UserRole = 'ACCOUNTANT'
): Expense {
  const expenseId = `exp-${Date.now()}`;
  const now = new Date().toISOString();
  const dateStr = invoiceData.expense_date || now.split('T')[0];

  const expense: Expense = {
    id: expenseId,
    project_id: projectId,
    category: invoiceData.category,
    vendor_id: `ven-${Date.now()}`,
    vendor_name: invoiceData.vendor_name,
    amount: Number(invoiceData.amount),
    status: 'posted',
    invoice_id: invoiceData.invoice_id,
    source_document_id: `doc-inv-${invoiceData.invoice_id}`,
    source_ref: `Invoice #${invoiceData.invoice_id} · Uploaded by ${actorName}`,
    cost_scope: (invoiceData.cost_scope as any) || 'PROJECT',
    lien_waiver_received: invoiceData.lien_waiver_received ?? true,
    description: invoiceData.description || 'Contractor progress invoice',
    expense_date: dateStr,
    entered_by_role: actorRole,
    created_at: now,
  };

  db.prepare(`
    INSERT INTO expenses (id, project_id, category, vendor_id, vendor_name, amount, status, invoice_id, source_document_id, source_ref, cost_scope, lien_waiver_received, description, expense_date, entered_by_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    expense.id,
    expense.project_id,
    expense.category,
    expense.vendor_id,
    expense.vendor_name,
    expense.amount,
    expense.status,
    expense.invoice_id,
    expense.source_document_id,
    expense.source_ref,
    expense.cost_scope,
    expense.lien_waiver_received ? 1 : 0,
    expense.description,
    expense.expense_date,
    expense.entered_by_role
  );

  // Record Audit Event
  db.prepare(`
    INSERT INTO audit_events (id, actor_role, actor_name, entity, entity_id, field, new_value, source, timestamp)
    VALUES (?, ?, ?, 'Expense', ?, 'amount', ?, ?, ?)
  `).run(`aud-${Date.now()}`, actorRole, actorName, expense.id, `${expense.amount}`, `Added Invoice #${invoiceData.invoice_id}`, now);

  broadcastEvent({ type: 'INVOICE_ADDED', project_id: projectId, payload: expense });
  return expense;
}

export function updateInvoice(
  invoiceId: string,
  updates: Partial<Expense>,
  actorName: string,
  actorRole: UserRole = 'ACCOUNTANT'
): Expense {
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(invoiceId) as Expense;
  if (!existing) {
    throw new Error(`Invoice ${invoiceId} not found`);
  }

  const updated: Expense = {
    ...existing,
    ...updates,
    amount: updates.amount !== undefined ? Number(updates.amount) : existing.amount,
    lien_waiver_received: updates.lien_waiver_received !== undefined ? Boolean(updates.lien_waiver_received) : Boolean(existing.lien_waiver_received),
    source_ref: `Invoice #${updates.invoice_id || existing.invoice_id} · Revised by ${actorName}`,
  };

  db.prepare(`
    UPDATE expenses
    SET category = ?, vendor_name = ?, amount = ?, invoice_id = ?, description = ?, lien_waiver_received = ?, status = ?, source_ref = ?
    WHERE id = ?
  `).run(
    updated.category,
    updated.vendor_name,
    updated.amount,
    updated.invoice_id,
    updated.description,
    updated.lien_waiver_received ? 1 : 0,
    updated.status,
    updated.source_ref,
    invoiceId
  );

  // Audit Event for Revision
  db.prepare(`
    INSERT INTO audit_events (id, actor_role, actor_name, entity, entity_id, field, old_value, new_value, source, timestamp)
    VALUES (?, ?, ?, 'Expense', ?, 'amount', ?, ?, ?, ?)
  `).run(
    `aud-${Date.now()}`,
    actorRole,
    actorName,
    invoiceId,
    `${existing.amount}`,
    `${updated.amount}`,
    `Revised by ${actorName}`,
    new Date().toISOString()
  );

  broadcastEvent({ type: 'INVOICE_UPDATED', project_id: existing.project_id, payload: updated });
  return updated;
}

export function deleteInvoice(invoiceId: string, actorName: string): { success: boolean } {
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(invoiceId) as Expense;
  if (existing) {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(invoiceId);
    broadcastEvent({ type: 'INVOICE_DELETED', project_id: existing.project_id, payload: { invoiceId } });
  }
  return { success: true };
}
