// GroundUp AI — MockInvoiceService Implementation

import { IInvoiceService } from '../interfaces/IInvoiceService';
import {
  Expense,
  UserRole,
  DirectExpenseInputDTO,
  GenericSuccessResponseDTO,
} from '../../types';
import { mockStore } from './MockDataStore';
import { delay } from './delay';

export class MockInvoiceService implements IInvoiceService {
  async getProjectInvoices(projectId: string): Promise<Expense[]> {
    await delay();
    const invoices = mockStore.expenses.filter((e) => e.project_id === projectId);
    return [...invoices];
  }

  async addInvoice(
    projectId: string,
    invoiceData: DirectExpenseInputDTO,
    actorName: string = 'User',
    actorRole: UserRole = 'ACCOUNTANT'
  ): Promise<Expense> {
    await delay();
    const exp: Expense = {
      id: `exp-${projectId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      project_id: projectId,
      category: invoiceData.category,
      vendor_id: `ven-${Math.floor(100 + Math.random() * 900)}`,
      vendor_name: invoiceData.vendor_name,
      amount: Number(invoiceData.amount) || 0,
      status: invoiceData.status || 'posted',
      invoice_id: invoiceData.invoice_id || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      source_document_id: 'doc-invoice',
      source_ref: invoiceData.source_ref || `Invoice #${invoiceData.invoice_id || 'manual'}`,
      cost_scope: invoiceData.cost_scope || 'PROJECT',
      lien_waiver_received: invoiceData.lien_waiver_received ?? true,
      description: invoiceData.description || '',
      expense_date: invoiceData.expense_date || new Date().toISOString().split('T')[0],
      entered_by_role: actorRole,
      created_at: new Date().toISOString(),
    };

    mockStore.expenses.unshift(exp);
    mockStore.recordAuditEvent(
      actorRole,
      actorName,
      'Invoice',
      exp.id,
      'amount',
      '0',
      `$${exp.amount}`,
      'Invoice Added'
    );

    return { ...exp };
  }

  async updateInvoice(
    invoiceId: string,
    updates: Partial<DirectExpenseInputDTO>,
    actorName: string = 'User',
    actorRole: UserRole = 'ACCOUNTANT'
  ): Promise<Expense> {
    await delay();
    const index = mockStore.expenses.findIndex((e) => e.id === invoiceId);
    if (index === -1) {
      throw new Error(`Invoice ${invoiceId} not found.`);
    }

    const current = mockStore.expenses[index];
    mockStore.expenses[index] = {
      ...current,
      vendor_name: updates.vendor_name || current.vendor_name,
      category: updates.category || current.category,
      amount: updates.amount !== undefined ? Number(updates.amount) : current.amount,
      invoice_id: updates.invoice_id || current.invoice_id,
      description: updates.description !== undefined ? updates.description : current.description,
      lien_waiver_received: updates.lien_waiver_received !== undefined ? updates.lien_waiver_received : current.lien_waiver_received,
      expense_date: updates.expense_date || current.expense_date,
    };

    mockStore.recordAuditEvent(
      actorRole,
      actorName,
      'Invoice',
      invoiceId,
      'updates',
      'previous',
      'updated',
      'Invoice Edit'
    );

    return { ...mockStore.expenses[index] };
  }

  async deleteInvoice(invoiceId: string, actorName: string = 'User'): Promise<GenericSuccessResponseDTO> {
    await delay();
    mockStore.expenses = mockStore.expenses.filter((e) => e.id !== invoiceId);
    mockStore.recordAuditEvent(
      'ACCOUNTANT',
      actorName,
      'Invoice',
      invoiceId,
      'deleted',
      'active',
      'deleted',
      'Invoice Deleted'
    );
    return { success: true, message: `Invoice ${invoiceId} removed from project ledger.` };
  }
}
