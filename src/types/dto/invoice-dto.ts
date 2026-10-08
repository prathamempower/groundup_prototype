import { UserRole } from '../domain';
import { DirectExpenseInputDTO } from './intake-dto';

export interface AddInvoiceRequestDTO {
  projectId: string;
  invoiceData: DirectExpenseInputDTO;
  actorName?: string;
  actorRole?: UserRole;
}

export interface UpdateInvoiceRequestDTO {
  invoiceId: string;
  updates: Partial<DirectExpenseInputDTO>;
  actorName?: string;
  actorRole?: UserRole;
}

export interface DeleteInvoiceRequestDTO {
  invoiceId: string;
  actorName?: string;
}

export interface GenericSuccessResponseDTO {
  success: boolean;
  message?: string;
}
