export interface LienWaiverItem {
  id: string;
  vendor: string;
  trade: string;
  invoiceNo: string;
  amount: number;
  paymentDate: string;
  waiverStatus: 'VERIFIED' | 'MISSING' | 'PENDING';
  drawImpact: string;
}

export interface ReconciliationRow {
  category: string;
  actualSpent: number;
  drawnFunded: number;
  unDrawn: number;
  retainage: number;
}
