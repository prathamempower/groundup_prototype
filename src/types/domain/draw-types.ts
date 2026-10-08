export type DrawStatus = 'draft' | 'submitted' | 'approved_full' | 'approved_partial' | 'rejected';
export type DrawLineStatus = 'requested' | 'approved' | 'partially_approved' | 'rejected' | 'disbursed';

export type RejectionReasonCode =
  | 'MISSING_LIEN_WAIVER'
  | 'WORK_NOT_VERIFIED'
  | 'INVOICE_MISMATCH'
  | 'OVER_BUDGET_LINE'
  | 'INSPECTION_FAILED'
  | 'UNAPPROVED_CHANGE_ORDER'
  | 'OTHER';

export interface Draw {
  id: string;
  project_id: string;
  draw_number: number;
  revision_number: number;
  original_draw_id?: string;
  requested_total: number;
  approved_total: number;
  disbursed_total: number;
  status: DrawStatus;
  submitted_date: string;
  response_date?: string;
  disbursed_date?: string;
  lender_notes?: string;
  created_at: string;
}

export interface DrawLine {
  id: string;
  draw_id: string;
  project_id: string;
  category: string;
  requested_amount: number;
  approved_amount: number;
  funded_amount: number;
  status: DrawLineStatus;
  rejection_reason_code?: RejectionReasonCode;
  rejection_notes?: string;
  corrective_document_id?: string;
  source_document_id?: string;
  source_ref?: string;
}
