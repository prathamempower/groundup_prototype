export type PortfolioFilter = 'All' | 'Active' | 'Completed';

export interface EnrichedProject {
  id: string;
  name: string;
  address: string;
  status: string;
  category?: 'MULTIFAMILY' | 'COMMERCIAL' | 'MIXED_USE' | 'CONDO_CONVERSION' | string;
  units?: number;
  squareFeet?: number;
  currentPhase?: string;
  healthScore?: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL';
  budget: number;
  spent: number;
  funded: number;
  cashExposure: number;
  progress: number;
  pendingDraw: string;
  alerts: number;
  gc: string;
  lender: string;
  lastUpdated: string;
  finalSale?: number;
  totalCost?: number;
  netProfit?: number;
  roi?: number;
  closed?: string;
}
