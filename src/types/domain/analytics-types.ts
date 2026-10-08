import { UserRole } from './user-types';

export interface AlertRisk {
  id: string;
  project_id: string;
  project_name?: string;
  type: 'RECONCILIATION_EXCEPTION' | 'OVER_BUDGET' | 'DRAW_REJECTED' | 'SCHEDULE_DELAY' | 'LIEN_WAIVER_MISSING';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  category?: string;
  source_values: {
    budget?: number;
    spend?: number;
    funded?: number;
    progress_pct?: number;
    spend_pct?: number;
    delay_days?: number;
    delay_cost?: number;
    variance_dollars?: number;
  };
  is_resolved: boolean;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  actor_role: UserRole | string;
  actor_name: string;
  entity: string;
  entity_id: string;
  field: string;
  old_value?: string;
  new_value: string;
  source: string;
  timestamp: string;
}

export interface DataChecklistItem {
  id: string;
  title: string;
  description: string;
  required_role: UserRole;
  is_complete: boolean;
  item_count: number;
  severity: 'BLOCKING' | 'WARNING' | 'OPTIONAL';
  missing_guidance?: string;
}

export interface ProjectDataReadiness {
  project_id: string;
  readiness_score: number;
  is_ready_for_live_tracking: boolean;
  checklist: DataChecklistItem[];
}

export interface CategoryTruth {
  category: string;
  approved_budget: number;
  approved_change_orders: number;
  current_budget: number;
  actual_spend: number;
  pending_spend: number;
  budget_variance: number;
  budget_variance_pct: number;
  spend_pct: number;
  amount_requested_draw: number;
  amount_approved_draw: number;
  amount_funded: number;
  verified_progress_pct: number;
  progress_source: string;
  is_over_budget: boolean;
  has_reconciliation_flag: boolean;
  reconciliation_delta_pct?: number;
}

export interface ProjectFourTruthsSummary {
  project_id: string;
  project_name: string;
  total_original_budget: number;
  total_approved_change_orders: number;
  total_current_budget: number;
  total_actual_spend: number;
  total_pending_spend: number;
  total_budget_variance: number;
  total_budget_variance_pct: number;
  total_requested_draws: number;
  total_approved_draws: number;
  total_amount_funded: number;
  developer_cash_exposure: number;
  overall_progress_pct: number;
  schedule_delay_days: number;
  loan_balance: number;
  interest_rate: number;
  daily_carrying_cost: number;
  estimated_delay_cost: number;
  categories: CategoryTruth[];
  active_alerts: AlertRisk[];
  readiness: ProjectDataReadiness;
}

export interface ProvenanceNode {
  id: string;
  title: string;
  amount?: number;
  date?: string;
  vendor?: string;
  actor_role?: UserRole | string;
  actor_name?: string;
  status: string;
  source_document_name: string;
  source_document_id: string;
  source_ref: string;
  extraction_confidence?: number;
}

export interface ProvenanceDrillDown {
  figure_name: string;
  amount: number;
  category?: string;
  project_name: string;
  truth_domain: 'Budget' | 'Spend' | 'Funding' | 'Progress';
  formula_applied: string;
  provenance_nodes: ProvenanceNode[];
}
