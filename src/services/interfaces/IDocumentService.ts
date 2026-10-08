// GroundUp AI — IDocumentService Interface Contract

import {
  Document,
  ParseDocumentRequestDTO,
  DocumentExtractionResultDTO,
  ParseBatchDocumentsRequestDTO,
  BatchExtractionResultDTO,
  ApplyBatchDocumentsRequestDTO,
  GenericSuccessResponseDTO,
} from '../../types';

export interface IDocumentService {
  /**
   * Parse a single document file or text payload with KEEP vs AVOID rules.
   */
  parseDocument(payload: ParseDocumentRequestDTO): Promise<DocumentExtractionResultDTO>;

  /**
   * Parse a batch of multi-format documents (.xlsx, .csv, .pdf, .docx).
   */
  parseBatchDocuments(payload: ParseBatchDocumentsRequestDTO): Promise<BatchExtractionResultDTO>;

  /**
   * Commit and apply extracted SOV budget lines and invoices to the project ledger.
   */
  applyBatchDocuments(payload: ApplyBatchDocumentsRequestDTO): Promise<GenericSuccessResponseDTO>;

  /**
   * Fetch all uploaded documents for a project.
   */
  getProjectDocuments(projectId: string): Promise<Document[]>;
}
