import Papa from 'papaparse';
import { ExtractedLineItem, ExcludedFigure } from './types';
import { extractDollarAmount, extractCostCode, normalizeCategoryAndCostCode, checkAvoidRules } from './parser-helpers';

export function parseCsvContent(
  csvString: string,
  fileName: string
): { lineItems: ExtractedLineItem[]; excludedFigures: ExcludedFigure[]; vendorName: string; invoiceNumber: string; docType: 'SOV' | 'INVOICE' } {
  const lineItems: ExtractedLineItem[] = [];
  const excludedFigures: ExcludedFigure[] = [];
  let vendorName = 'Contractor / Trade Partner';
  let invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const parsed = Papa.parse(csvString, { skipEmptyLines: true });
    const rawRows = parsed.data as any[][];

    let headerRowIdx = -1;
    let colIndices = { costCode: -1, category: -1, amount: -1, description: -1 };

    for (let r = 0; r < Math.min(10, rawRows.length); r++) {
      const row = rawRows[r] || [];
      const currentIndices = { costCode: -1, category: -1, amount: -1, description: -1 };
      let matchCount = 0;

      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || '').toLowerCase().trim();
        if (cell.includes('cost code') || cell.includes('csi') || cell === 'code') {
          currentIndices.costCode = c;
          matchCount++;
        } else if (cell.includes('category') || cell.includes('trade') || cell.includes('scope') || cell.includes('item')) {
          currentIndices.category = c;
          matchCount++;
        } else if (cell.includes('amount') || cell.includes('total') || cell.includes('budget') || cell.includes('price') || cell.includes('cost')) {
          currentIndices.amount = c;
          matchCount++;
        } else if (cell.includes('description') || cell.includes('notes')) {
          currentIndices.description = c;
          matchCount++;
        }
      }

      if (matchCount >= 2 || (currentIndices.amount !== -1 && row.length >= 2)) {
        colIndices = currentIndices;
        headerRowIdx = r;
        break;
      }
    }

    const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;

    for (let r = startRow; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;
      const rowStr = row.join(' ');

      const rawAmt = colIndices.amount !== -1 ? row[colIndices.amount] : null;
      let amount: number | null = null;

      if (rawAmt !== null && rawAmt !== undefined && String(rawAmt).trim().length > 0) {
        amount = extractDollarAmount(String(rawAmt));
      } else {
        amount = extractDollarAmount(rowStr);
      }

      if (!amount || amount <= 10) continue;

      const avoidCheck = checkAvoidRules(rowStr, amount);
      if (avoidCheck.isAvoid) {
        excludedFigures.push({
          reason: avoidCheck.reason,
          amount,
          rawText: rowStr.slice(0, 100),
          sourceDoc: fileName,
        });
        continue;
      }

      const costCode = colIndices.costCode !== -1 && row[colIndices.costCode] ? String(row[colIndices.costCode]).trim() : extractCostCode(rowStr, r);
      let catText = colIndices.category !== -1 && row[colIndices.category] ? String(row[colIndices.category]).trim() : rowStr.replace(/[$0-9,.]/g, ' ').trim();
      const norm = normalizeCategoryAndCostCode(catText, costCode);

      lineItems.push({
        costCode: norm.costCode,
        category: norm.category,
        amount,
        description: `CSV Row ${r + 1} from ${fileName}`,
        confidence: 0.98,
        sourceDoc: fileName,
        sourceLine: r + 1,
      });
    }
  } catch (err) {
    console.warn(`CSV parsing error for ${fileName}:`, err);
  }

  const docType = fileName.toLowerCase().includes('sov') || fileName.toLowerCase().includes('budget') || lineItems.length > 5 ? 'SOV' : 'INVOICE';
  return { lineItems, excludedFigures, vendorName, invoiceNumber, docType };
}
