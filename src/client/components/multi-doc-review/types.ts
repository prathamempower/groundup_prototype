import {
  MultiDocumentBatchResult,
  NormalizedSOVItem,
  NormalizedInvoiceItem,
  ExcludedFigure
} from '../../../server/services/documentParsingService';

export interface MultiDocExtractionReviewProps {
  batchResult: MultiDocumentBatchResult;
  onApplySOV?: (items: NormalizedSOVItem[]) => void;
  onApplyInvoices?: (items: NormalizedInvoiceItem[]) => void;
  onClose?: () => void;
  mode?: 'full' | 'sov_only' | 'invoices_only';
}

export type MultiDocTab = 'normalized' | 'reconciliation' | 'avoid_rules' | 'documents';
export type { MultiDocumentBatchResult, NormalizedSOVItem, NormalizedInvoiceItem, ExcludedFigure };
