import { ExcludedFigureDTO } from '../../types';

export const CANONICAL_CSI_DIVISIONS: Record<string, { code: string; name: string }> = {
  '01': { code: '01-000', name: 'Pre-construction, Permits & General Requirements' },
  '02': { code: '02-000', name: 'Site Work, Demolition & Earthwork' },
  '03': { code: '03-000', name: 'Foundation & Concrete' },
  '04': { code: '04-000', name: 'Masonry & Stone' },
  '05': { code: '05-000', name: 'Metals & Structural Steel' },
  '06': { code: '06-000', name: 'Framing, Lumber & Structural Carpentry' },
  '07': { code: '07-000', name: 'Thermal & Moisture Protection / Roofing' },
  '08': { code: '08-000', name: 'Openings (Doors & Windows)' },
  '09': { code: '09-000', name: 'Finishes (Drywall, Flooring, Painting)' },
  '21': { code: '21-000', name: 'Fire Suppression' },
  '22': { code: '22-000', name: 'Plumbing Systems' },
  '23': { code: '23-000', name: 'HVAC (Heating, Venting, AC)' },
  '26': { code: '26-000', name: 'Electrical Systems & Distribution' },
  '31': { code: '31-000', name: 'Earthwork & Utilities' },
  '00': { code: '00-500', name: 'Contingency & General Soft Costs' },
};

export function extractDollarAmount(str: string): number | null {
  if (!str || typeof str !== 'string') return null;
  
  const dollarMatch = str.match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/);
  if (dollarMatch) {
    const num = parseFloat(dollarMatch[1].replace(/,/g, ''));
    if (!isNaN(num) && num >= 10) return Math.round(num * 100) / 100;
  }

  const parts = str.split(/[,;\t]/).map((p) => p.trim());
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part.includes('-')) continue;
    const cleaned = part.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num >= 10 && /^\d+(\.\d+)?$/.test(cleaned)) {
      return Math.round(num * 100) / 100;
    }
  }

  const tokens = str.trim().split(/\s+/);
  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = tokens[i];
    if (t.includes('-')) continue;
    const cleaned = t.replace(/[$,:]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num >= 10 && /^\d+(\.\d+)?$/.test(cleaned)) {
      return Math.round(num * 100) / 100;
    }
  }

  return null;
}

export function extractCostCode(text: string, defaultDivision: number = 3): string {
  const match = text.match(/\b(\d{2})[-–]?(\d{3})\b/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  const matchShort = text.match(/\b(\d{5})\b/);
  if (matchShort) {
    return `${matchShort[1].slice(0, 2)}-${matchShort[1].slice(2)}`;
  }
  const padded = String(defaultDivision).padStart(2, '0');
  return `${padded}-100`;
}

export function normalizeCategoryAndCostCode(text: string): { csiDivision: string; category: string; costCode: string } {
  const lower = text.toLowerCase();
  const code = extractCostCode(text, 3);

  if (lower.includes('permit') || lower.includes('architect') || lower.includes('pre-con') || lower.includes('general req')) {
    return { csiDivision: '01-000', category: 'Pre-construction & Permits', costCode: code.startsWith('01') ? code : '01-100' };
  }
  if (lower.includes('site') || lower.includes('demo') || lower.includes('excavat') || lower.includes('earthwork')) {
    return { csiDivision: '02-000', category: 'Site Work & Demolition', costCode: code.startsWith('02') ? code : '02-100' };
  }
  if (lower.includes('concrete') || lower.includes('foundation') || lower.includes('slab') || lower.includes('footing') || lower.includes('rebar')) {
    return { csiDivision: '03-000', category: 'Foundation & Concrete', costCode: code.startsWith('03') ? code : '03-300' };
  }
  if (lower.includes('fram') || lower.includes('lumber') || lower.includes('truss') || lower.includes('carpentry')) {
    return { csiDivision: '06-000', category: 'Framing & Trusses', costCode: code.startsWith('06') ? code : '06-100' };
  }
  if (lower.includes('roof') || lower.includes('exterior') || lower.includes('siding') || lower.includes('stucco') || lower.includes('waterproof')) {
    return { csiDivision: '07-000', category: 'Exterior & Roofing', costCode: code.startsWith('07') ? code : '07-100' };
  }
  if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('drain')) {
    return { csiDivision: '22-000', category: 'Plumbing', costCode: code.startsWith('22') ? code : '22-000' };
  }
  if (lower.includes('electr') || lower.includes('conduit') || lower.includes('panel') || lower.includes('wire')) {
    return { csiDivision: '26-000', category: 'Electrical', costCode: code.startsWith('26') ? code : '26-000' };
  }
  if (lower.includes('hvac') || lower.includes('duct') || lower.includes('air cond')) {
    return { csiDivision: '23-000', category: 'HVAC & Mechanical', costCode: code.startsWith('23') ? code : '23-000' };
  }
  if (lower.includes('drywall') || lower.includes('sheetrock') || lower.includes('insulat') || lower.includes('paint') || lower.includes('finish') || lower.includes('floor')) {
    return { csiDivision: '09-000', category: 'Interior Finishes', costCode: code.startsWith('09') ? code : '09-600' };
  }
  if (lower.includes('contingenc') || lower.includes('reserve')) {
    return { csiDivision: '00-500', category: 'Contingency', costCode: '00-500' };
  }

  return { csiDivision: '01-000', category: text.split(/[,;\t]/)[0]?.trim() || 'General Construction', costCode: code };
}

export function checkAvoidRules(line: string, _amount: number): { isAvoid: boolean; reason?: string; ruleCategory?: ExcludedFigureDTO['ruleCategory'] } {
  const lower = line.toLowerCase();

  if (lower.includes('previous balance') || lower.includes('prior balance') || lower.includes('statement balance') || lower.includes('prior billing') || lower.includes('balance forward')) {
    return { isAvoid: true, reason: 'Previous statement balance excluded to avoid double-counting', ruleCategory: 'PREVIOUS_BALANCE' };
  }
  if (lower.includes('tax proration') || lower.includes('county tax') || lower.includes('escrow') || lower.includes('transfer tax') || lower.includes('title fee')) {
    return { isAvoid: true, reason: 'Non-construction tax proration / closing settlement escrow', ruleCategory: 'TAX_ESCROW' };
  }
  if (lower.includes('subtotal') || lower.includes('total due') || lower.includes('total amount due') || lower.includes('grand total') || lower.includes('total hard costs')) {
    return { isAvoid: true, reason: 'Summary subtotal / total excluded from line-item sum', ruleCategory: 'SUBTOTAL' };
  }
  if (lower.includes('down payment') || lower.includes('deposit paid') || lower.includes('earnest money')) {
    return { isAvoid: true, reason: 'Equity / down payment credit excluded from hard cost spend', ruleCategory: 'DOWN_PAYMENT' };
  }

  return { isAvoid: false };
}
