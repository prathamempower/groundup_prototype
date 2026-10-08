import { IDocumentService } from '../interfaces/IDocumentService';
import {
  Document,
  ParseDocumentRequestDTO,
  DocumentExtractionResultDTO,
  ParseBatchDocumentsRequestDTO,
  BatchExtractionResultDTO,
  ApplyBatchDocumentsRequestDTO,
  GenericSuccessResponseDTO,
  NormalizedSOVItemDTO,
  NormalizedInvoiceItemDTO,
} from '../../types';
import { mockStore } from './MockDataStore';
import { delay } from './delay';
import { parseSingleDocument } from './mock-document-parser';

export * from './mock-document-helpers';
export * from './mock-document-parser';

export class MockDocumentService implements IDocumentService {
  async parseDocument(payload: ParseDocumentRequestDTO): Promise<DocumentExtractionResultDTO> {
    await delay(100, 250);
    return parseSingleDocument(payload);
  }

  async parseBatchDocuments(payload: ParseBatchDocumentsRequestDTO): Promise<BatchExtractionResultDTO> {
    await delay(350, 650);

    const results: DocumentExtractionResultDTO[] = [];
    const normalizedSOV: NormalizedSOVItemDTO[] = [];
    const normalizedInvoices: NormalizedInvoiceItemDTO[] = [];

    let totalBudget = 0;
    let totalSpend = 0;
    let totalExcluded = 0;

    for (const file of payload.files) {
      const parsed = await this.parseDocument({
        fileName: file.fileName,
        bufferBase64: file.bufferBase64,
        projectId: payload.projectId,
      });
      results.push(parsed);

      for (const ex of parsed.excludedFigures) {
        totalExcluded += ex.amount;
      }

      if (parsed.documentType === 'SOV') {
        for (const item of parsed.lineItems) {
          normalizedSOV.push({
            category: item.category,
            costCode: item.costCode,
            amount: item.amount,
            confidence: item.confidence,
            sourceDocument: file.fileName,
          });
          totalBudget += item.amount;
        }
      } else {
        for (const item of parsed.lineItems) {
          normalizedInvoices.push({
            id: `inv-${Date.now()}-${normalizedInvoices.length}`,
            vendor: parsed.extractedMetadata.vendorName || 'Extracted Vendor',
            category: item.category,
            costCode: item.costCode,
            amount: item.amount,
            invoiceNumber: parsed.extractedMetadata.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
            documentDate: parsed.extractedMetadata.documentDate || new Date().toISOString().split('T')[0],
            lienWaiver: true,
            confidence: item.confidence,
            sourceDocument: file.fileName,
            description: item.rawText,
          });
          totalSpend += item.amount;
        }
      }
    }

    return {
      summary: {
        documentCount: payload.files.length,
        totalBudgetExtracted: totalBudget,
        totalSpendExtracted: totalSpend,
        totalExcludedAmount: totalExcluded,
        overallConfidence: 0.98,
      },
      normalizedSOV,
      normalizedInvoices,
      results,
    };
  }

  async applyBatchDocuments(payload: ApplyBatchDocumentsRequestDTO): Promise<GenericSuccessResponseDTO> {
    await delay();

    if (payload.sovLines && payload.sovLines.length > 0) {
      mockStore.budgetLines = mockStore.budgetLines.filter((bl) => bl.project_id !== payload.projectId);
      payload.sovLines.forEach((l, idx) => {
        mockStore.budgetLines.push({
          id: `bl-${payload.projectId}-${idx + 1}`,
          project_id: payload.projectId,
          version_id: `bv-${payload.projectId}-v1`,
          category: l.category,
          cost_code: l.costCode || l.cost_code || `0${idx + 1}-100`,
          original_amount: Number(l.amount) || 0,
          source_ref: 'Batch Extracted SOV',
        });
      });
    }

    if (payload.invoices && payload.invoices.length > 0) {
      payload.invoices.forEach((inv, idx) => {
        mockStore.expenses.push({
          id: `exp-${payload.projectId}-${Date.now()}-${idx}`,
          project_id: payload.projectId,
          category: inv.category,
          vendor_id: `ven-${idx + 1}`,
          vendor_name: inv.vendor || inv.vendor_name || 'Subcontractor',
          amount: Number(inv.amount) || 0,
          status: 'posted',
          invoice_id: inv.invoice_id || inv.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          source_document_id: 'doc-batch',
          source_ref: `Extracted Invoice: ${inv.description || inv.category}`,
          cost_scope: 'PROJECT',
          lien_waiver_received: inv.lien_waiver_received ?? inv.lienWaiver ?? true,
          description: inv.description,
          expense_date: inv.expense_date || inv.documentDate || new Date().toISOString().split('T')[0],
          entered_by_role: payload.actorRole || 'ACCOUNTANT',
          created_at: new Date().toISOString(),
        });
      });
    }

    return {
      success: true,
      message: 'Extracted batch documents successfully committed to project.',
    };
  }

  async getProjectDocuments(projectId: string): Promise<Document[]> {
    await delay();
    return mockStore.documents.filter((d) => d.project_id === projectId);
  }
}
