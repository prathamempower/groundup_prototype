import { UserRole } from '../domain';

export interface ParseDocumentRequestDTO {
  fileName: string;
  content?: string;
  projectId?: string;
  bufferBase64?: string;
}

export interface ExtractedLineItemDTO {
  lineIndex: number;
  category: string;
  subCategory?: string;
  costCode: string;
  amount: number;
  confidence: number;
  rawText: string;
  sourceLocation: string;
}

export interface ExcludedFigureDTO {
  rawText: string;
  amount: number;
  reason: string;
  ruleCategory: 'PREVIOUS_BALANCE' | 'TAX_ESCROW' | 'INTEREST_FEES' | 'SUBTOTAL' | 'DOWN_PAYMENT' | 'UNRECOGNIZED';
}

export interface DocumentExtractionResultDTO {
  documentId: string;
  fileName: string;
  documentType: string;
  confidence: number;
  totalAmount: number;
  lineItems: ExtractedLineItemDTO[];
  excludedFigures: ExcludedFigureDTO[];
  extractedMetadata: {
    vendorName?: string;
    invoiceNumber?: string;
    documentDate?: string;
    periodCovered?: string;
    projectReference?: string;
  };
}

export interface FilePayloadDTO {
  fileName: string;
  bufferBase64: string;
  size: number;
}

export interface ParseBatchDocumentsRequestDTO {
  files: FilePayloadDTO[];
  projectId?: string;
}

export interface NormalizedSOVItemDTO {
  category: string;
  costCode: string;
  amount: number;
  confidence: number;
  sourceDocument: string;
}

export interface NormalizedInvoiceItemDTO {
  id?: string;
  vendor: string;
  category: string;
  costCode?: string;
  amount: number;
  invoiceNumber: string;
  documentDate: string;
  lienWaiver: boolean;
  confidence: number;
  sourceDocument: string;
  description?: string;
}

export interface BatchExtractionResultDTO {
  summary: {
    documentCount: number;
    totalBudgetExtracted: number;
    totalSpendExtracted: number;
    totalExcludedAmount: number;
    overallConfidence: number;
  };
  normalizedSOV: NormalizedSOVItemDTO[];
  normalizedInvoices: NormalizedInvoiceItemDTO[];
  results: DocumentExtractionResultDTO[];
}

export interface ApplyBatchDocumentsRequestDTO {
  projectId: string;
  sovLines?: Array<{
    category: string;
    costCode?: string;
    cost_code?: string;
    amount: number;
  }>;
  invoices?: Array<{
    category: string;
    vendor?: string;
    vendor_name?: string;
    amount: number;
    invoice_id?: string;
    invoiceNumber?: string;
    description?: string;
    expense_date?: string;
    documentDate?: string;
    lien_waiver_received?: boolean;
    lienWaiver?: boolean;
  }>;
  actorName?: string;
  actorRole?: UserRole;
}
