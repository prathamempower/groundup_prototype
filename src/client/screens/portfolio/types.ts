import { GCContractModel } from '../../../types';

export type PortfolioFilter = 'All' | 'Active' | 'Completed';

export interface EnrichedProject {
  id: string;
  name: string;
  address: string;
  status: string;
  gc_contract_model?: GCContractModel | 'DAILY_LOG_T_M';
  units?: number;
  squareFeet?: number;
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
