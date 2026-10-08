export interface ExtractedLineItem {
  costCode: string;
  category: string;
  subcategory?: string;
  amount: number;
  description?: string;
  confidence: number;
  sourceDoc?: string;
  sourceLine?: number;
}

export interface ExcludedFigure {
  reason: string;
  amount: number;
  rawText: string;
  sourceDoc?: string;
}

export interface ExtractedLoanFacility {
  lenderName: string;
  loanAmount: number;
  interestRate: number;
  disbursedFunded: number;
  loanTermMonths: number;
  interestReserve?: number;
  retainagePercent?: number;
  sourceDocument: string;
  confidence: number;
}

export interface DocumentExtractionResult {
  documentId: string;
  fileName: string;
  documentType: 'SOV' | 'INVOICE' | 'AIA_G702' | 'AIA_G703' | 'RECEIPT' | 'HUD_SETTLEMENT' | 'LOAN_AGREEMENT';
  vendorName: string;
  invoiceNumber: string;
  documentDate: string;
  totalAmount: number;
  lineItems: ExtractedLineItem[];
  excludedFigures: ExcludedFigure[];
  loanFacility?: ExtractedLoanFacility;
  overallConfidence: number;
  extractionVersion: string;
  pipelineSteps: Array<{ step_name: string; status: string; output: string; confidence: number }>;
}

export interface NormalizedSOVItem {
  id: string;
  costCode: string;
  csiDivision: string;
  category: string;
  amount: number;
  sourceDocuments: string[];
  confidence: number;
}

export interface NormalizedInvoiceItem {
  id: string;
  vendor: string;
  category: string;
  costCode: string;
  invoiceNumber: string;
  documentDate: string;
  amount: number;
  lienWaiver: boolean;
  description: string;
  sourceDocument: string;
  confidence: number;
}

export interface CategoryReconciliation {
  category: string;
  costCode: string;
  budgetedAmount: number;
  incurredSpend: number;
  variance: number;
  status: 'ON_BUDGET' | 'APPROACHING_LIMIT' | 'OVER_BUDGET' | 'UNBUDGETED_EXPENSE';
}

export interface MultiDocumentBatchResult {
  batchId: string;
  projectId: string;
  timestamp: string;
  documents: DocumentExtractionResult[];
  normalizedSOV: NormalizedSOVItem[];
  normalizedInvoices: NormalizedInvoiceItem[];
  extractedLoan?: ExtractedLoanFacility;
  crossDocumentReconciliation: CategoryReconciliation[];
  summary: {
    totalBudgetExtracted: number;
    totalSpendExtracted: number;
    totalLoanFacilityExtracted: number;
    totalExcludedAmount: number;
    netCashExposure: number;
    documentCount: number;
    lineItemCount: number;
    overallConfidence: number;
    duplicateWarnings: string[];
  };
}
