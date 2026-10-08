import { LienWaiverItem, ReconciliationRow } from './types';

export const INITIAL_LIEN_WAIVERS: LienWaiverItem[] = [
  {
    id: 'lw-1',
    vendor: 'ABC Electric LLC',
    trade: 'Electrical',
    invoiceNo: 'INV-2026-089',
    amount: 68400,
    paymentDate: 'Sep 15, 2026',
    waiverStatus: 'MISSING',
    drawImpact: 'Draw #3 Electrical line blocked',
  },
  {
    id: 'lw-2',
    vendor: 'Sylvia Concrete LLC',
    trade: 'Foundation',
    invoiceNo: 'INV-2026-042',
    amount: 95000,
    paymentDate: 'Jul 20, 2026',
    waiverStatus: 'VERIFIED',
    drawImpact: 'None · Fully funded',
  },
  {
    id: 'lw-3',
    vendor: 'Kuiken Brothers Lumber',
    trade: 'Framing Material',
    invoiceNo: 'KB-88910',
    amount: 142000,
    paymentDate: 'Aug 10, 2026',
    waiverStatus: 'VERIFIED',
    drawImpact: 'None · Fully funded',
  },
  {
    id: 'lw-4',
    vendor: 'NJ Pipe Services LLC',
    trade: 'Plumbing',
    invoiceNo: 'INV-2026-0982',
    amount: 28400,
    paymentDate: 'Sep 28, 2026',
    waiverStatus: 'MISSING',
    drawImpact: 'Upcoming Draw #4',
  },
];

export const INITIAL_RECONCILIATION_ROWS: ReconciliationRow[] = [
  { category: 'Plans & Permits', actualSpent: 44500, drawnFunded: 44500, unDrawn: 0, retainage: 0 },
  { category: 'Site Work', actualSpent: 82000, drawnFunded: 67000, unDrawn: 15000, retainage: 6700 },
  { category: 'Foundation', actualSpent: 95000, drawnFunded: 95000, unDrawn: 0, retainage: 9500 },
  { category: 'Framing', actualSpent: 142000, drawnFunded: 142000, unDrawn: 0, retainage: 14200 },
  { category: 'Rough Plumbing', actualSpent: 55760, drawnFunded: 0, unDrawn: 55760, retainage: 0 },
  { category: 'Rough Electrical', actualSpent: 68400, drawnFunded: 0, unDrawn: 68400, retainage: 0 },
  { category: 'Exterior & Roofing', actualSpent: 88000, drawnFunded: 0, unDrawn: 88000, retainage: 0 },
  { category: 'Windows & Doors', actualSpent: 58000, drawnFunded: 0, unDrawn: 58000, retainage: 0 },
];
