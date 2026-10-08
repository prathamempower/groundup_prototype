import { UserRole } from './user-types';

export interface Document {
  id: string;
  project_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  type:
    | 'BUDGET_SPREADSHEET'
    | 'EXPENSE_LEDGER'
    | 'LOAN_APPROVAL'
    | 'DRAW_PACKAGE'
    | 'SCHEDULE_SPREADSHEET'
    | 'INVOICE'
    | 'LIEN_WAIVER'
    | 'UNKNOWN';
  classification_confidence: number;
  sha256_hash: string;
  uploaded_by_role: UserRole;
  uploaded_at: string;
}

export interface StagingExtraction {
  id: string;
  job_id: string;
  project_id: string;
  category: string;
  vendor_name?: string;
  amount?: number;
  date?: string;
  description?: string;
  confidence_score: number;
  field_confidences: Record<string, number>;
  source_location: {
    sheet?: string;
    row?: number;
    col?: string | number;
    raw_text?: string;
  };
  status: 'PENDING_REVIEW' | 'AUTO_POSTED' | 'CONFIRMED' | 'REJECTED';
}
