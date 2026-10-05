// GroundUp AI — Normalized Domain Model & Types
// Intake-First Architecture with Role-Based Context and Zero-Hallucination Lineage

export type UserRole = 
  | 'DEVELOPER_OWNER' 
  | 'CFO' 
  | 'PM' 
  | 'GC_FIXED' 
  | 'GC_DAILY' 
  | 'INVESTOR' 
  | 'ACCOUNTANT' 
  | 'LENDER';

export interface UserContext {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  roleDescription: string;
  badgeColor: string;
}

export const USER_ROLES: Record<UserRole, UserContext> = {
  DEVELOPER_OWNER: {
    id: 'user-dev-1',
    name: 'Hardik Parikh',
    role: 'DEVELOPER_OWNER',
    roleTitle: 'Developer / Owner',
    roleDescription: 'Full control: portfolio economics, pro forma ROI, cash gap, change order approvals, draw packets.',
    badgeColor: 'bg-slate-900 text-white',
  },
  CFO: {
    id: 'user-cfo-1',
    name: 'Sarah Jenkins',
    role: 'CFO',
    roleTitle: 'CFO / Accounting',
    roleDescription: 'Financial ledger: matches expenses to budget lines, Amex card feeds, contingency absorption, draw reconciliation.',
    badgeColor: 'bg-emerald-800 text-white',
  },
  PM: {
    id: 'user-pm-1',
    name: 'Marcus Vance',
    role: 'PM',
    roleTitle: 'Project Manager',
    roleDescription: 'Field & Schedule: milestone progress %, municipal inspections, root-cause delay attribution & carrying costs.',
    badgeColor: 'bg-blue-800 text-white',
  },
  GC_FIXED: {
    id: 'user-gc-fixed',
    name: 'Kunal Shah',
    role: 'GC_FIXED',
    roleTitle: 'GC (Fixed / Milestone)',
    roleDescription: 'Submits milestone claims upon completion with photo proof & inspection reports; submits change orders.',
    badgeColor: 'bg-indigo-700 text-white',
  },
  GC_DAILY: {
    id: 'user-gc-daily',
    name: 'Sylvia Concrete & Framing',
    role: 'GC_DAILY',
    roleTitle: 'GC (Daily Updates)',
    roleDescription: 'Open-book / cost-plus: daily work logs, material & subcontractor receipts with GC markup, daily progress photos.',
    badgeColor: 'bg-teal-700 text-white',
  },
  INVESTOR: {
    id: 'user-investor-1',
    name: 'Krutarth Shah',
    role: 'INVESTOR',
    roleTitle: 'Investor / Partner',
    roleDescription: 'Read-only transparency: capital deployed, projected ROI vs baseline, next funding events, narrative monthly updates.',
    badgeColor: 'bg-purple-800 text-white',
  },
  ACCOUNTANT: {
    id: 'user-acct-1',
    name: 'Elena Rostova',
    role: 'ACCOUNTANT',
    roleTitle: 'Project Accountant',
    roleDescription: 'Expense ledger, invoice tracking, lien waiver audits, and financial reporting.',
    badgeColor: 'bg-cyan-800 text-white',
  },
  LENDER: {
    id: 'user-lender-1',
    name: 'David Sterling',
    role: 'LENDER',
    roleTitle: 'Construction Lender (BCB Bank)',
    roleDescription: 'Draw packet review, inspection verification, line-item approvals/rejections, wire disbursement.',
    badgeColor: 'bg-amber-800 text-white',
  },
};

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
  interest_rate: number; // e.g. 0.0975 (9.75%)
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

export interface AmexCardTransaction {
  id: string;
  project_id: string;
  card_last4: string;
  card_label: string;
  date: string;
  vendor: string;
  amount: number;
  ai_suggested_category: string;
  ai_confidence: number;
  status: 'MATCHED' | 'NEEDS_REVIEW' | 'FLAGGED';
  memo?: string;
  evidence_strength: EvidenceStrength;
}

export interface DailyLogEntry {
  id: string;
  project_id: string;
  date: string;
  gc_name: string;
  weather: string;
  workers_on_site: number;
  trades_active: string[];
  work_completed: string;
  issues_or_delays?: string;
  photos_count: number;
  photo_urls?: string[];
  sub_costs: number;
  gc_markup_pct: number;
  total_billed: number;
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

export type BudgetStatus = 'DRAFT' | 'APPROVED' | 'SUPERSEDED';

export interface BudgetVersion {
  id: string;
  project_id: string;
  version_number: number;
  status: BudgetStatus;
  approved_at?: string;
  approved_by_user_id?: string;
  notes?: string;
  created_at: string;
}

export interface BudgetLine {
  id: string;
  project_id: string;
  version_id: string;
  category: string; // e.g. 'Demolition & Site Prep', 'Concrete & Foundation', 'Plumbing'
  sub_category?: string;
  cost_code?: string;
  original_amount: number;
  source_document_id?: string;
  source_ref?: string;
}

export type CostScope = 'PROJECT' | 'PARTNER_SPECIFIC' | 'INVESTOR_SPECIFIC' | 'NON_PROJECT';
export type ExpenseStatus = 'pending' | 'posted' | 'rejected';

export interface Expense {
  id: string;
  project_id: string;
  category: string;
  vendor_id: string;
  vendor_name: string;
  amount: number;
  status: ExpenseStatus; // Only 'posted' enters Spend Truth
  invoice_id?: string;
  source_document_id: string; // Strict provenance
  source_ref: string;         // Strict provenance (e.g., 'Sheet: April_Expenses, Row: 147')
  cost_scope: CostScope;
  lien_waiver_received: boolean;
  description?: string;
  expense_date: string;
  entered_by_role: UserRole;
  created_at: string;
}

export interface ChangeOrder {
  id: string;
  project_id: string;
  change_order_number: string;
  category: string;
  amount: number;
  approval_status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  budget_impact: boolean;
  requested_date: string;
  approved_date?: string;
  approved_by_user_id?: string;
  description: string;
  source_document_id?: string;
  source_ref?: string;
}

export interface ScheduleActivity {
  id: string;
  project_id: string;
  milestone: string;
  trade: string;
  planned_start: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  verified_progress_pct: number; // 0.0 to 1.0 (Progress Truth)
  last_verified_source: 'inspection_result' | 'PM_confirmation' | 'lender_inspection';
  last_verified_date: string;
  entered_by_role: UserRole;
}

export interface Inspection {
  id: string;
  project_id: string;
  milestone: string;
  trade: string;
  requested_date: string;
  inspection_date?: string;
  result: 'PASSED' | 'FAILED' | 'PARTIAL_PASS' | 'PENDING';
  inspector_name?: string;
  inspector_agency?: string;
  notes?: string;
}

export type DrawStatus = 'draft' | 'submitted' | 'approved_full' | 'approved_partial' | 'rejected';
export type DrawLineStatus = 'requested' | 'approved' | 'partially_approved' | 'rejected' | 'disbursed';

export type RejectionReasonCode =
  | 'MISSING_LIEN_WAIVER'
  | 'WORK_NOT_VERIFIED'
  | 'INVOICE_MISMATCH'
  | 'OVER_BUDGET_LINE'
  | 'INSPECTION_FAILED'
  | 'UNAPPROVED_CHANGE_ORDER'
  | 'OTHER';

export interface Draw {
  id: string;
  project_id: string;
  draw_number: number;
  revision_number: number; // 0 = original, 1+ = revision chain
  original_draw_id?: string;
  requested_total: number;
  approved_total: number;
  disbursed_total: number;
  status: DrawStatus;
  submitted_date: string;
  response_date?: string;
  disbursed_date?: string;
  lender_notes?: string;
  created_at: string;
}

export interface DrawLine {
  id: string;
  draw_id: string;
  project_id: string;
  category: string;
  requested_amount: number;
  approved_amount: number;
  funded_amount: number; // Disbursed amount = Funding Truth
  status: DrawLineStatus;
  rejection_reason_code?: RejectionReasonCode;
  rejection_notes?: string;
  corrective_document_id?: string;
  source_document_id?: string;
  source_ref?: string;
}

export interface Document {
  id: string;
  project_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  type:
    | 'BUDGET_SPREADSHEET'
    | 'EXPENSE_LEDGER'
    | 'LOAN_APPROVAL'
    | 'DRAW_PACKAGE'
    | 'SCHEDULE_SPREADSHEET'
    | 'INVOICE'
    | 'LIEN_WAIVER'
    | 'UNKNOWN';
  classification_confidence: number;
  sha256_hash: string;
  uploaded_by_role: UserRole;
  uploaded_at: string;
}

export interface StagingExtraction {
  id: string;
  job_id: string;
  project_id: string;
  category: string;
  vendor_name?: string;
  amount?: number;
  date?: string;
  description?: string;
  confidence_score: number;
  field_confidences: Record<string, number>;
  source_location: {
    sheet?: string;
    row?: number;
    col?: string | number;
    raw_text?: string;
  };
  status: 'PENDING_REVIEW' | 'AUTO_POSTED' | 'CONFIRMED' | 'REJECTED';
}

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
  actor_role: UserRole;
  actor_name: string;
  entity: string;
  entity_id: string;
  field: string;
  old_value?: string;
  new_value: string;
  source: string;
  timestamp: string;
}

// ----------------------------------------------------
// Data Completeness & Readiness Checklist Types
// ----------------------------------------------------

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
  readiness_score: number; // 0 to 100%
  is_ready_for_live_tracking: boolean;
  checklist: DataChecklistItem[];
}

// ----------------------------------------------------
// Calculated Four Truths Output
// ----------------------------------------------------

export interface CategoryTruth {
  category: string;
  approved_budget: number;
  approved_change_orders: number;
  current_budget: number;        // Budget Truth
  actual_spend: number;          // Spend Truth (posted only)
  pending_spend: number;         // Unconfirmed spend
  budget_variance: number;       // ActualSpend - CurrentBudget
  budget_variance_pct: number;
  spend_pct: number;             // ActualSpend / CurrentBudget
  amount_requested_draw: number;
  amount_approved_draw: number;
  amount_funded: number;         // Funding Truth (disbursed only)
  verified_progress_pct: number; // Progress Truth (0.0 to 1.0)
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
  total_current_budget: number;       // 1. Budget Truth
  total_actual_spend: number;         // 2. Spend Truth
  total_pending_spend: number;
  total_budget_variance: number;
  total_budget_variance_pct: number;
  total_requested_draws: number;
  total_approved_draws: number;
  total_amount_funded: number;        // 3. Funding Truth
  developer_cash_exposure: number;    // HERO METRIC: Spend - Funded
  overall_progress_pct: number;       // 4. Progress Truth
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
  actor_role?: UserRole;
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

// ----------------------------------------------------
// Reference Design UI Types (Screens 1 to 4)
// ----------------------------------------------------

export interface UserBuilderProfile {
  id: string;
  name: string;
  company_name: string;
  email: string;
  role: string;
}

export interface SitePhotoInspection {
  id: string;
  photo_title: string;
  timestamp: string;
  milestone_tags: Array<{ label: string; status: 'completed' | 'in_progress' | 'not_started' | 'passed' }>;
  image_url: string;
  ai_confidence: number;
  verification_notes?: string;
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

export interface ProjectGanttMilestone {
  id: string;
  name: string;
  day_start: number;
  day_end: number;
  status: 'Done' | 'Active' | 'Upcoming' | 'At risk';
  code: string;
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

