import * as XLSX from 'xlsx';
import {
  ParseDocumentRequestDTO,
  DocumentExtractionResultDTO,
  ExtractedLineItemDTO,
  ExcludedFigureDTO,
} from '../../types';
import { extractDollarAmount, checkAvoidRules, normalizeCategoryAndCostCode } from './mock-document-helpers';

export function parseSingleDocument(payload: ParseDocumentRequestDTO): DocumentExtractionResultDTO {
  const fileName = payload.fileName || 'Uploaded_Document.pdf';
  let text = payload.content || '';

  if (!text && payload.bufferBase64) {
    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const binary = atob(payload.bufferBase64);
        const workbook = XLSX.read(binary, { type: 'binary' });
        const firstSheet = workbook.SheetNames[0];
        text = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
      } else {
        text = atob(payload.bufferBase64);
      }
    } catch {
      text = `Extracted text from ${fileName}`;
    }
  }

  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const lineItems: ExtractedLineItemDTO[] = [];
  const excludedFigures: ExcludedFigureDTO[] = [];
  let totalAmount = 0;

  let lineIndex = 1;
  for (const rawLine of rawLines) {
    if (/^(category|cost code|item|description|amount)/i.test(rawLine)) continue;

    const amt = extractDollarAmount(rawLine);
    if (amt === null || amt <= 0) continue;

    const avoid = checkAvoidRules(rawLine, amt);
    if (avoid.isAvoid) {
      excludedFigures.push({
        rawText: rawLine,
        amount: amt,
        reason: avoid.reason || 'Excluded figure',
        ruleCategory: avoid.ruleCategory || 'UNRECOGNIZED',
      });
      continue;
    }

    const norm = normalizeCategoryAndCostCode(rawLine);
    lineItems.push({
      lineIndex: lineIndex++,
      category: norm.category,
      subCategory: rawLine.replace(/[\d$,.:]/g, '').trim() || norm.category,
      costCode: norm.costCode,
      amount: amt,
      confidence: 0.96,
      rawText: rawLine,
      sourceLocation: `Line ${lineIndex}`,
    });
    totalAmount += amt;
  }

  if (lineItems.length === 0) {
    lineItems.push({
      lineIndex: 1,
      category: 'Foundation & Concrete',
      costCode: '03-300',
      amount: 133200,
      confidence: 0.98,
      rawText: '03-300 Cast-in-Place Concrete Slab: $133,200.00',
      sourceLocation: 'Line 1',
    });
    totalAmount = 133200;
    excludedFigures.push({
      rawText: 'Previous Statement Balance: $45,000.00',
      amount: 45000,
      reason: 'Previous Statement Balance excluded to avoid double-counting',
      ruleCategory: 'PREVIOUS_BALANCE',
    });
  }

  const docType = fileName.toLowerCase().includes('sov') || fileName.toLowerCase().includes('budget')
    ? 'SOV'
    : fileName.toLowerCase().includes('hud')
    ? 'HUD_SETTLEMENT'
    : 'INVOICE';

  return {
    documentId: `doc-${Date.now()}`,
    fileName,
    documentType: docType,
    confidence: 0.97,
    totalAmount,
    lineItems,
    excludedFigures,
    extractedMetadata: {
      vendorName: fileName.replace(/[_.-]/g, ' ').replace(/\b(pdf|xlsx|csv|txt)\b/gi, '').trim(),
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      documentDate: new Date().toISOString().split('T')[0],
    },
  };
}
