import { UserRole } from './user-types';
import { EvidenceStrength } from './project-types';

export type BudgetStatus = 'DRAFT' | 'APPROVED' | 'SUPERSEDED';
export type CostScope = 'PROJECT' | 'PARTNER_SPECIFIC' | 'INVESTOR_SPECIFIC' | 'NON_PROJECT';
export type ExpenseStatus = 'pending' | 'posted' | 'rejected';

export interface BudgetVersion {
  id: string;
  project_id: string;
  version_number: number;
  status: BudgetStatus;
  approved_at?: string;
  approved_by_user_id?: string;
  notes?: string;
  created_at: string;
}

export interface BudgetLine {
  id: string;
  project_id: string;
  version_id: string;
  category: string;
  sub_category?: string;
  cost_code?: string;
  original_amount: number;
  source_document_id?: string;
  source_ref?: string;
}

export interface Expense {
  id: string;
  project_id: string;
  category: string;
  vendor_id: string;
  vendor_name: string;
  amount: number;
  status: ExpenseStatus;
  invoice_id?: string;
  source_document_id: string;
  source_ref: string;
  cost_scope: CostScope;
  lien_waiver_received: boolean;
  description?: string;
  expense_date: string;
  entered_by_role: UserRole;
  created_at: string;
}

export interface ChangeOrder {
  id: string;
  project_id: string;
  change_order_number: string;
  category: string;
  amount: number;
  approval_status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  budget_impact: boolean;
  requested_date: string;
  approved_date?: string;
  approved_by_user_id?: string;
  description: string;
  source_document_id?: string;
  source_ref?: string;
}

export interface AmexCardTransaction {
  id: string;
  project_id: string;
  card_last4: string;
  card_label: string;
  date: string;
  vendor: string;
  amount: number;
  ai_suggested_category: string;
  ai_confidence: number;
  status: 'MATCHED' | 'NEEDS_REVIEW' | 'FLAGGED';
  memo?: string;
  evidence_strength: EvidenceStrength;
}
