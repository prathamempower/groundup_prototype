import { FinalReportDataDTO as FinalReportData } from '../../../types';

export interface PipelineStepLog {
  stepNumber: number;
  stepName: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'EXCEPTION_FLAGGED';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
}

export type InputSource = 'FILE_UPLOAD' | 'EMAIL_ATTACHMENT' | 'BANK_FEED' | 'CONTRACTOR_PORTAL';

export interface AIPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPipelineCompleted: (projectId: string, finalReport: FinalReportData) => void;
  onViewFinalReport: (projectId: string) => void;
}

export interface StagedDoc {
  name: string;
  size: string;
  type: string;
}

export const STEP_DEFINITIONS = [
  { number: 1, name: 'Ingestion', sub: 'Receive incoming documents from selected sources' },
  { number: 2, name: 'Storage', sub: 'Save original files into secure Cloud Vault with SHA-256' },
  { number: 3, name: 'Classification', sub: 'Identify document types (SOV, Invoice, Loan, AIA G702)' },
  { number: 4, name: 'Extraction (AI)', sub: 'Pull key data: amounts, dates, vendors & line items' },
  { number: 5, name: 'Normalization', sub: 'Standardize into CSI MasterFormat division codes' },
  { number: 6, name: 'Confidence Check', sub: 'Score extracted data quality & field reliability' },
  { number: 7, name: 'Validation', sub: 'Check for missing info or duplicates in database' },
  { number: 8, name: 'Matching', sub: 'Link to budget category & vendor (Auto-Match / Review)' },
  { number: 9, name: 'Verification', sub: 'Final reconciliation and review across budget, expenses, and draw milestones' },
  { number: 10, name: 'Database Update', sub: 'Save data with immutable audit log into SQLite' },
];
