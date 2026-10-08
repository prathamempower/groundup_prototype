import { UserRole } from './user-types';

export type GCContractModel = 'FIXED_PRICE' | 'DAILY_UPDATES';
export type InterestPaymentMethod = 'RESERVE' | 'MONTHLY_OUT_OF_POCKET' | 'CAPITALIZED';
export type EvidenceStrength = 
  | 'VERIFIED_INVOICE' 
  | 'SIGNED_CONTRACT' 
  | 'BANK_TRANSACTION' 
  | 'CARD_TRANSACTION' 
  | 'GC_CONFIRMATION' 
  | 'MANUAL_ENTRY';

export interface Project {
  id: string;
  name: string;
  address: string;
  gc_name: string;
  gc_contract_model?: GCContractModel;
  lender_name: string;
  units: number;
  square_feet?: number;
  target_budget: number;
  start_date: string;
  expected_completion: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  created_by_user_id: string;
  created_at: string;
  acquisition_cost?: number;
  expected_sale_price?: number;
  contingency_initial?: number;
  contingency_remaining?: number;
}

export interface Loan {
  id: string;
  project_id: string;
  lender_name: string;
  loan_amount: number;
  interest_rate: number;
  term_months: number;
  holdback_amount: number;
  current_balance: number;
  closing_date: string;
  entered_by_role: UserRole;
  interest_payment_method?: InterestPaymentMethod;
  interest_reserve_initial?: number;
  interest_reserve_remaining?: number;
}

export interface ContingencyMovement {
  id: string;
  project_id: string;
  source_category: string;
  destination_category: string;
  amount: number;
  reason: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  approved_by: string;
  approved_at: string;
}

export interface UnitSale {
  id: string;
  project_id: string;
  unit_name: string;
  sq_ft: number;
  beds_baths: string;
  asking_price: number;
  contract_price?: number;
  deposit_amount?: number;
  status: 'AVAILABLE' | 'UNDER_CONTRACT' | 'CLOSED';
  buyer_name?: string;
  contract_date?: string;
  closing_date?: string;
  broker_commission_pct: number;
  closing_costs_est: number;
  net_proceeds: number;
  loan_payoff_allocation: number;
  investor_distribution: number;
}

export interface ProjectProForma {
  project_id: string;
  original_acquisition: number;
  current_acquisition: number;
  original_construction: number;
  current_construction: number;
  original_soft_costs: number;
  current_soft_costs: number;
  original_interest_carry: number;
  current_interest_carry: number;
  original_total_cost: number;
  current_total_cost: number;
  expected_sale_price: number;
  selling_costs: number;
  original_profit: number;
  current_profit: number;
  profit_drift: number;
  original_roi_pct: number;
  current_roi_pct: number;
  roi_drift_pct: number;
  causes_of_drift: Array<{ factor: string; impact_dollars: number; description: string }>;
}

export interface ComparableSale {
  id: string;
  address: string;
  distance_mi: number;
  sf: number;
  beds: number;
  sold_price: number;
  price_per_sf: number;
  closed_date: string;
  match_strength: 'Strong' | 'Moderate' | 'Weak';
}

export interface DealLabOpportunity {
  id: string;
  address: string;
  city_zip: string;
  property_type: string;
  target_sf: number;
  listed_days_ago: number;
  asking_price: number;
  acres: number;
  source_channel: string;
  verdict_badge: 'STRONG' | 'MAYBE' | 'PASS';
  verdict_title: string;
  verdict_desc: string;
  projected_profit: number;
  lot_acquisition: number;
  hard_costs: number;
  soft_costs: number;
  selling_costs: number;
  arv: number;
  net_profit: number;
  margin_pct: number;
  irr_pct: number;
  cash_on_cash_pct: number;
  term_months: number;
  comps: ComparableSale[];
}

export interface PortfolioBriefCard {
  id: string;
  project_id?: string;
  type: 'delay_risk' | 'draw_ready' | 'comp_update';
  title: string;
  description: string;
  action_label: string;
  action_target: string;
}
