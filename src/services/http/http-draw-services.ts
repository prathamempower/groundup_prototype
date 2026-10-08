import { IDrawService, IInvoiceService } from '../interfaces';
import {
  Expense,
  Draw,
  UserRole,
  DirectExpenseInputDTO,
  ProjectDrawsResponseDTO,
  CreateDrawSubmissionResponseDTO,
  CreateDrawRevisionResponseDTO,
  RecordWireDisbursementResponseDTO,
  DrawLineSubmissionInputDTO,
  LenderReviewLineItemDTO,
  DrawRevisionLineInputDTO,
} from '../../types';
import { http } from './http-client';

export class HttpDrawService implements IDrawService {
  getProjectDraws(projectId: string): Promise<ProjectDrawsResponseDTO> {
    return http<ProjectDrawsResponseDTO>(`/api/draws/project/${projectId}`);
  }

  createDrawSubmission(
    projectId: string,
    drawNumber: number,
    lines: DrawLineSubmissionInputDTO[],
    actorRole?: UserRole
  ): Promise<CreateDrawSubmissionResponseDTO> {
    return http<CreateDrawSubmissionResponseDTO>('/api/draws/submit', {
      method: 'POST',
      body: JSON.stringify({ projectId, drawNumber, lines, actorRole }),
    });
  }

  recordLenderReview(
    drawId: string,
    response: {
      lines: LenderReviewLineItemDTO[];
      lender_notes?: string;
    },
    actorRole?: UserRole
  ): Promise<Draw> {
    return http<Draw>('/api/draws/review', {
      method: 'POST',
      body: JSON.stringify({ drawId, response, actorRole }),
    });
  }

  createDrawRevision(
    drawId: string,
    correctiveLines: DrawRevisionLineInputDTO[],
    actorRole?: UserRole
  ): Promise<CreateDrawRevisionResponseDTO> {
    return http<CreateDrawRevisionResponseDTO>('/api/draws/revise', {
      method: 'POST',
      body: JSON.stringify({ drawId, correctiveLines, actorRole }),
    });
  }

  recordWireDisbursement(
    drawId: string,
    disbursedAmount: number,
    actorRole?: UserRole
  ): Promise<RecordWireDisbursementResponseDTO> {
    return http<RecordWireDisbursementResponseDTO>('/api/draws/disburse', {
      method: 'POST',
      body: JSON.stringify({ drawId, disbursedAmount, actorRole }),
    });
  }
}

export class HttpInvoiceService implements IInvoiceService {
  getProjectInvoices(projectId: string): Promise<Expense[]> {
    return http<Expense[]>(`/api/invoices/project/${projectId}`);
  }

  addInvoice(
    projectId: string,
    invoiceData: DirectExpenseInputDTO,
    actorName?: string,
    actorRole?: UserRole
  ): Promise<Expense> {
    return http<Expense>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify({ projectId, expenseData: invoiceData, actorRole, actorName }),
    });
  }

  createInvoice(
    projectId: string,
    data: DirectExpenseInputDTO,
    actorRole?: UserRole,
    actorName?: string
  ): Promise<Expense> {
    return this.addInvoice(projectId, data, actorName, actorRole);
  }

  updateInvoice(
    invoiceId: string,
    data: Partial<DirectExpenseInputDTO>,
    actorRole?: UserRole,
    actorName?: string
  ): Promise<Expense> {
    return http<Expense>(`/api/invoices/${invoiceId}`, {
      method: 'PATCH',
      body: JSON.stringify({ data, actorRole, actorName }),
    });
  }

  deleteInvoice(
    invoiceId: string,
    actorRole?: UserRole,
    actorName?: string
  ): Promise<{ success: boolean; id: string }> {
    return http<{ success: boolean; id: string }>(`/api/invoices/${invoiceId}`, {
      method: 'DELETE',
      body: JSON.stringify({ actorRole, actorName }),
    });
  }
}
