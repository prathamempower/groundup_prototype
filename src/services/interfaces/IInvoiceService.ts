// GroundUp AI — IInvoiceService Interface Contract

import {
  Expense,
  UserRole,
  DirectExpenseInputDTO,
  GenericSuccessResponseDTO,
} from '../../types';

export interface IInvoiceService {
  /**
   * Fetch all invoices / expenses for a specific project.
   */
  getProjectInvoices(projectId: string): Promise<Expense[]>;

  /**
   * Add a new contractor invoice / expense to Spend Truth.
   */
  addInvoice(
    projectId: string,
    invoiceData: DirectExpenseInputDTO,
    actorName?: string,
    actorRole?: UserRole
  ): Promise<Expense>;

  /**
   * Update an existing invoice.
   */
  updateInvoice(
    invoiceId: string,
    updates: Partial<DirectExpenseInputDTO>,
    actorName?: string,
    actorRole?: UserRole
  ): Promise<Expense>;

  /**
   * Delete an invoice from the project ledger.
   */
  deleteInvoice(invoiceId: string, actorName?: string): Promise<GenericSuccessResponseDTO>;
}
