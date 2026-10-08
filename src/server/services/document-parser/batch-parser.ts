import {
  MultiDocumentBatchResult,
  DocumentExtractionResult,
  ExcludedFigure,
  NormalizedSOVItem,
  NormalizedInvoiceItem,
  CategoryReconciliation,
} from './types';
import { parseDocumentContent } from './document-extractor';
import { normalizeCategoryAndCostCode, normalizeVendorName } from './parser-helpers';

export async function parseMultipleDocuments(
  files: Array<{ fileName: string; content?: string; bufferBase64?: string }>,
  projectId: string = 'proj-user-active'
): Promise<MultiDocumentBatchResult> {
  const batchId = `batch-${Date.now()}`;
  const extractedDocs: DocumentExtractionResult[] = [];
  const allExcludedFigures: ExcludedFigure[] = [];

  for (const file of files) {
    const docResult = await parseDocumentContent(file.fileName, file.content || '', projectId, file.bufferBase64);
    extractedDocs.push(docResult);
    allExcludedFigures.push(...docResult.excludedFigures);
  }

  const loanDocs = extractedDocs.filter((d) => d.documentType === 'LOAN_AGREEMENT');
  const sovDocs = extractedDocs.filter((d) => d.documentType === 'SOV' || d.documentType === 'AIA_G703');
  const hudDocs = extractedDocs.filter((d) => d.documentType === 'HUD_SETTLEMENT');
  const invoiceDocs = extractedDocs.filter(
    (d) => d.documentType === 'INVOICE' || d.documentType === 'AIA_G702' || d.documentType === 'RECEIPT' || d.documentType === 'HUD_SETTLEMENT'
  );

  const extractedLoan = loanDocs.find((d) => d.loanFacility)?.loanFacility;

  const candidateBudgetDocs: DocumentExtractionResult[] = [];
  if (sovDocs.length > 0) {
    candidateBudgetDocs.push(...sovDocs);
  } else if (loanDocs.length > 0) {
    candidateBudgetDocs.push(...loanDocs);
  }
  for (const hud of hudDocs) {
    if (!candidateBudgetDocs.includes(hud)) {
      candidateBudgetDocs.push(hud);
    }
  }
  if (candidateBudgetDocs.length === 0) {
    candidateBudgetDocs.push(
      ...extractedDocs.filter((d) => d.fileName.toLowerCase().includes('budget') || d.fileName.toLowerCase().includes('sov'))
    );
  }

  const sovMap = new Map<string, NormalizedSOVItem>();

  for (const doc of candidateBudgetDocs) {
    for (const item of doc.lineItems) {
      const norm = normalizeCategoryAndCostCode(item.category, item.costCode);
      const key = norm.csiDivision;

      if (sovMap.has(key)) {
        const existing = sovMap.get(key)!;
        existing.amount += item.amount;
        if (!existing.sourceDocuments.includes(doc.fileName)) {
          existing.sourceDocuments.push(doc.fileName);
        }
      } else {
        sovMap.set(key, {
          id: `sov-norm-${norm.costCode}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          costCode: norm.costCode,
          csiDivision: norm.csiDivision,
          category: norm.category,
          amount: item.amount,
          sourceDocuments: [doc.fileName],
          confidence: item.confidence,
        });
      }
    }
  }

  const normalizedSOV = Array.from(sovMap.values());
  const normalizedInvoices: NormalizedInvoiceItem[] = [];
  const invoiceNumbersSeen = new Set<string>();
  const duplicateWarnings: string[] = [];

  for (const doc of invoiceDocs) {
    if (invoiceNumbersSeen.has(doc.invoiceNumber)) {
      duplicateWarnings.push(`Duplicate Invoice #${doc.invoiceNumber} detected in ${doc.fileName}`);
    } else {
      invoiceNumbersSeen.add(doc.invoiceNumber);
    }

    for (let idx = 0; idx < doc.lineItems.length; idx++) {
      const item = doc.lineItems[idx];
      const norm = normalizeCategoryAndCostCode(item.category, item.costCode);

      normalizedInvoices.push({
        id: `inv-norm-${doc.documentId}-${idx + 1}`,
        vendor: normalizeVendorName(doc.vendorName),
        category: norm.category,
        costCode: norm.costCode,
        invoiceNumber: doc.lineItems.length > 1 ? `${doc.invoiceNumber}-L${idx + 1}` : doc.invoiceNumber,
        documentDate: doc.documentDate,
        amount: item.amount,
        lienWaiver: true,
        description: item.description || `Extracted from ${doc.fileName} (${norm.category})`,
        sourceDocument: doc.fileName,
        confidence: item.confidence,
      });
    }
  }

  const crossDocumentReconciliation: CategoryReconciliation[] = [];
  const allCategories = new Set<string>();

  normalizedSOV.forEach((s) => allCategories.add(s.category));
  normalizedInvoices.forEach((i) => allCategories.add(i.category));

  for (const cat of allCategories) {
    const budgetItem = normalizedSOV.find((s) => s.category === cat);
    const spendItems = normalizedInvoices.filter((i) => i.category === cat);

    const budgetedAmount = budgetItem ? budgetItem.amount : 0;
    const incurredSpend = spendItems.reduce((sum, item) => sum + item.amount, 0);
    const variance = budgetedAmount - incurredSpend;

    let status: CategoryReconciliation['status'] = 'ON_BUDGET';
    if (budgetedAmount === 0 && incurredSpend > 0) {
      status = 'UNBUDGETED_EXPENSE';
    } else if (variance < 0) {
      status = 'OVER_BUDGET';
    } else if (incurredSpend >= budgetedAmount * 0.85) {
      status = 'APPROACHING_LIMIT';
    }

    crossDocumentReconciliation.push({
      category: cat,
      costCode: budgetItem?.costCode || spendItems[0]?.costCode || '01-100',
      budgetedAmount,
      incurredSpend,
      variance,
      status,
    });
  }

  const totalBudgetExtracted = normalizedSOV.reduce((sum, item) => sum + item.amount, 0);
  const totalSpendExtracted = normalizedInvoices.reduce((sum, item) => sum + item.amount, 0);
  const totalLoanFacilityExtracted = extractedLoan?.loanAmount || 0;
  const totalExcludedAmount = allExcludedFigures.reduce((sum, item) => sum + item.amount, 0);
  const netCashExposure = Math.max(0, totalSpendExtracted - (extractedLoan?.disbursedFunded || 0));
  const lineItemCount = extractedDocs.reduce((sum, d) => sum + d.lineItems.length, 0);
  const overallConfidence =
    extractedDocs.length > 0 ? Number((extractedDocs.reduce((sum, d) => sum + d.overallConfidence, 0) / extractedDocs.length).toFixed(3)) : 0.98;

  return {
    batchId,
    projectId,
    timestamp: new Date().toISOString(),
    documents: extractedDocs,
    normalizedSOV,
    normalizedInvoices,
    extractedLoan,
    crossDocumentReconciliation,
    summary: {
      totalBudgetExtracted,
      totalSpendExtracted,
      totalLoanFacilityExtracted,
      totalExcludedAmount,
      netCashExposure,
      documentCount: files.length,
      lineItemCount,
      overallConfidence,
      duplicateWarnings,
    },
  };
}
