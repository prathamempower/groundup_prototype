import { CANONICAL_CSI_DIVISIONS } from './csi-divisions';

export function extractDollarAmount(text: string): number | null {
  if (!text) return null;

  const cleanText = text
    .replace(/\b\d{2}-\d{3}\b/g, ' ')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ')
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, ' ');

  const currencyMatch = cleanText.match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/);
  if (currencyMatch) {
    const num = parseFloat(currencyMatch[1].replace(/,/g, ''));
    return isNaN(num) || num <= 10 ? null : num;
  }

  const commaMatch = cleanText.match(/\b([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?)\b/);
  if (commaMatch) {
    const num = parseFloat(commaMatch[1].replace(/,/g, ''));
    return isNaN(num) || num <= 10 ? null : num;
  }

  const matches = Array.from(cleanText.matchAll(/\b([0-9]+(?:\.[0-9]{2})?)\b/g));
  if (matches.length === 0) return null;

  const validNums = matches
    .map((m) => parseFloat(m[1]))
    .filter((n) => !isNaN(n) && n > 10);

  if (validNums.length === 0) return null;
  return validNums[validNums.length - 1];
}

export function extractCostCode(text: string, defaultIndex: number = 0): string {
  if (!text) return `0${(defaultIndex % 9) + 1}-100`;
  const match = text.match(/\b\d{2}-\d{3}\b/);
  if (match) return match[0];
  const simpleMatch = text.match(/\b\d{4,6}\b/);
  if (simpleMatch) {
    const s = simpleMatch[0];
    return `${s.slice(0, 2)}-${s.slice(2, 5)}`;
  }
  return `0${(defaultIndex % 9) + 1}-100`;
}

export function normalizeVendorName(raw: string): string {
  if (!raw) return 'Contractor / Trade Partner';
  let clean = raw.trim()
    .replace(/^(from|vendor|payee|subcontractor|bill\s+to|payable\s+to|contractor)[:\s]+/i, '')
    .replace(/\s+(llc|inc|corp|co|corporation|ltd|limited)\.?$/i, '')
    .trim();
  
  if (!clean || clean.length < 2) return 'Contractor / Trade Partner';
  return clean
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeCategoryAndCostCode(rawText: string, rawCostCode?: string): { costCode: string; category: string; csiDivision: string } {
  const textLower = (rawText || '').toLowerCase();
  
  if (rawCostCode) {
    const prefix = rawCostCode.slice(0, 2);
    if (CANONICAL_CSI_DIVISIONS[prefix]) {
      return {
        costCode: rawCostCode,
        category: CANONICAL_CSI_DIVISIONS[prefix].name,
        csiDivision: CANONICAL_CSI_DIVISIONS[prefix].code,
      };
    }
  }

  if (textLower.includes('permit') || textLower.includes('architect') || textLower.includes('engineering') || textLower.includes('general condition') || textLower.includes('pre-con') || textLower.includes('insurance')) {
    return { costCode: '01-100', category: CANONICAL_CSI_DIVISIONS['01'].name, csiDivision: '01-000' };
  }
  if (textLower.includes('site') || textLower.includes('demolition') || textLower.includes('excavat') || textLower.includes('grading') || textLower.includes('earthwork')) {
    return { costCode: '02-100', category: CANONICAL_CSI_DIVISIONS['02'].name, csiDivision: '02-000' };
  }
  if (textLower.includes('concrete') || textLower.includes('slab') || textLower.includes('foundation') || textLower.includes('footing') || textLower.includes('rebar')) {
    return { costCode: '03-300', category: CANONICAL_CSI_DIVISIONS['03'].name, csiDivision: '03-000' };
  }
  if (textLower.includes('masonry') || textLower.includes('brick') || textLower.includes('stone') || textLower.includes('cmu')) {
    return { costCode: '04-200', category: CANONICAL_CSI_DIVISIONS['04'].name, csiDivision: '04-000' };
  }
  if (textLower.includes('steel') || textLower.includes('metal') || textLower.includes('iron')) {
    return { costCode: '05-100', category: CANONICAL_CSI_DIVISIONS['05'].name, csiDivision: '05-000' };
  }
  if (textLower.includes('framing') || textLower.includes('lumber') || textLower.includes('truss') || textLower.includes('carpentry') || textLower.includes('rough wood')) {
    return { costCode: '06-100', category: CANONICAL_CSI_DIVISIONS['06'].name, csiDivision: '06-000' };
  }
  if (textLower.includes('roof') || textLower.includes('waterproof') || textLower.includes('insulation') || textLower.includes('siding') || textLower.includes('shingle')) {
    return { costCode: '07-100', category: CANONICAL_CSI_DIVISIONS['07'].name, csiDivision: '07-000' };
  }
  if (textLower.includes('door') || textLower.includes('window') || textLower.includes('glass') || textLower.includes('glazing')) {
    return { costCode: '08-100', category: CANONICAL_CSI_DIVISIONS['08'].name, csiDivision: '08-000' };
  }
  if (textLower.includes('drywall') || textLower.includes('paint') || textLower.includes('finish') || textLower.includes('floor') || textLower.includes('tile') || textLower.includes('carpet')) {
    return { costCode: '09-200', category: CANONICAL_CSI_DIVISIONS['09'].name, csiDivision: '09-000' };
  }
  if (textLower.includes('fire') || textLower.includes('sprinkler')) {
    return { costCode: '21-000', category: CANONICAL_CSI_DIVISIONS['21'].name, csiDivision: '21-000' };
  }
  if (textLower.includes('plumb') || textLower.includes('pipe') || textLower.includes('drain') || textLower.includes('fixture')) {
    return { costCode: '22-000', category: CANONICAL_CSI_DIVISIONS['22'].name, csiDivision: '22-000' };
  }
  if (textLower.includes('hvac') || textLower.includes('mechanical') || textLower.includes('duct') || textLower.includes('ac') || textLower.includes('furnace')) {
    return { costCode: '23-000', category: CANONICAL_CSI_DIVISIONS['23'].name, csiDivision: '23-000' };
  }
  if (textLower.includes('electr') || textLower.includes('wire') || textLower.includes('panel') || textLower.includes('lighting')) {
    return { costCode: '26-000', category: CANONICAL_CSI_DIVISIONS['26'].name, csiDivision: '26-000' };
  }
  if (textLower.includes('contingency') || textLower.includes('reserve') || textLower.includes('soft cost')) {
    return { costCode: '00-500', category: CANONICAL_CSI_DIVISIONS['00'].name, csiDivision: '00-500' };
  }

  return { costCode: rawCostCode || '01-100', category: rawText.slice(0, 40) || 'Trade Scope & Materials', csiDivision: '01-000' };
}

export function checkAvoidRules(text: string, amount: number): { isAvoid: boolean; reason: string } {
  const rowLower = text.toLowerCase();

  if (rowLower.includes('previous balance') || rowLower.includes('prior amount billed') || rowLower.includes('balance forward') || rowLower.includes('previous statement') || rowLower.includes('prior billings')) {
    return {
      isAvoid: true,
      reason: 'AVOID: Previous Balance / Prior Amount Billed footer (Prevents double counting)',
    };
  }

  if (
    rowLower.includes('subtotal') ||
    rowLower.includes('grand total') ||
    rowLower.includes('total amount due') ||
    rowLower.includes('total due') ||
    rowLower.includes('total:') ||
    rowLower.includes('summary total') ||
    rowLower.includes('net amount due') ||
    rowLower.includes('net due')
  ) {
    return {
      isAvoid: true,
      reason: 'AVOID: Subtotal / Grand Total / Net Due aggregate footer (Line items extracted separately)',
    };
  }

  if (rowLower.includes('tax proration') || rowLower.includes('escrow reserve') || rowLower.includes('prepaid tax') || rowLower.includes('county tax')) {
    return {
      isAvoid: true,
      reason: 'AVOID: Non-construction Tax Proration & Escrow Reserve (HUD Line 106)',
    };
  }

  if (rowLower.includes('draft change') || rowLower.includes('unapproved change') || rowLower.includes('pending co')) {
    return {
      isAvoid: true,
      reason: 'AVOID: Draft / Unapproved Change Order (Pending formal signature)',
    };
  }

  return { isAvoid: false, reason: '' };
}
