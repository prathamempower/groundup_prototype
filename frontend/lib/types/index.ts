export type UserRole = "OWNER" | "CFO" | "PM" | "GC" | "INVESTOR";

export interface UserProfile {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  company: string;
  avatarInitials: string;
  is_active: boolean;
  project_memberships: Array<{ project_id: string; role: string }>;
  permissions: string[];
}

export type LifecycleStage =
  | "ACQUISITION"
  | "PRE_CONSTRUCTION"
  | "CONSTRUCTION"
  | "COMPLETION"
  | "MARKETING"
  | "DISPOSITION"
  | "CLOSED";

export type ContractModel =
  | "OPEN_BOOK"
  | "COST_PLUS"
  | "FIXED_PRICE"
  | "MILESTONE_BASED"
  | "PROFIT_SHARE"
  | "HYBRID";

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  project_entity: string;
  address: string;
  lifecycle_stage: LifecycleStage;
  contract_model: ContractModel;
  status: "ACTIVE" | "COMPLETED" | "SETUP_INCOMPLETE";
  currency: string;
  loan_commitment: string; // minor units in cents as string
  started_at: string;
  target_completion_at: string;
  created_at: string;
}

export interface ApiMeta {
  as_of: string;
  data_quality: "VERIFIED" | "PROVISIONAL" | "INCOMPLETE";
  warnings?: string[];
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  path?: string;
  issue: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: ApiErrorDetail[];
    request_id: string;
  };
}

export interface SourceCitation {
  document_id: string;
  document_name: string;
  page_number?: number;
  row_number?: number;
  sheet_name?: string;
  reviewer: string;
  reviewed_at: string;
  extraction_version: string;
  direct_url?: string;
}

export interface KeyFigureWithBasis {
  amount: string; // in minor units (cents)
  currency: string;
  basis: string;
  variance_from_original?: string;
  variance_pct?: number;
  status?: "success" | "warning" | "danger" | "info";
  sources?: SourceCitation[];
}

export interface ProjectDashboard {
  project: Project;
  kpis: {
    forecast_profit: KeyFigureWithBasis;
    cash_gap: KeyFigureWithBasis;
    contingency_left: KeyFigureWithBasis & { total_contingency: string };
    forecast_completion: {
      date: string;
      basis: string;
      delay_days: number;
      sources?: SourceCitation[];
    };
  };
  forecast_table: Array<{
    category: string;
    original_budget: string;
    current_approved: string;
    actual_spend: string;
    forecast_final: string;
    variance: string;
    variance_reason: string;
    sources?: SourceCitation[];
  }>;
  draw_summary: {
    latest_draw_number: number;
    status: string;
    requested: string;
    recommended: string;
    approved: string;
    cleared_funded: string;
    shortfall: string;
    unallocated_deposit: string;
  };
  open_exceptions: Array<{
    id: string;
    title: string;
    category: string;
    severity: "danger" | "warning" | "info";
    owner: string;
    age_days: number;
    created_at: string;
  }>;
  schedule_risk: {
    at_risk_milestone: string;
    delay_days: number;
    carry_cost_impact: string;
  };
  profit_trend?: Array<{
    month: string;
    original_baseline_profit: number;
    forecast_profit: number;
    cumulative_spend: number;
    approved_budget: number;
  }>;
}

// ----------------- ONBOARDING & READINESS TYPES -----------------

export type OnboardingSessionState =
  | "INVITED"
  | "ACCOUNT_CREATED"
  | "PROFILE_COMPLETE"
  | "ROLE_SETUP_IN_PROGRESS"
  | "PROJECT_SETUP_IN_PROGRESS"
  | "READY_FOR_APPROVAL"
  | "ACTIVE";

export type SpecialAnswerType = "STANDARD" | "UNKNOWN" | "NOT_YET_AVAILABLE" | "NOT_APPLICABLE";

export interface OnboardingQuestion {
  question_key: string;
  question_version: string;
  prompt: string;
  role_scope: string;
  input_type: "SELECT" | "TEXT" | "NUMBER" | "BOOLEAN";
  section?: string;
  help_text?: string;
  unlocks?: string;
  options?: Array<{ label: string; value: string }>;
  is_high_risk: boolean;
  allow_special_answers: boolean;
  blocking_gate?: string;
}

export interface ProjectDuplicateMatch {
  id: string;
  name: string;
  address: string;
  project_entity: string;
  lifecycle_stage: string;
  similarity_reason: string;
}

export interface ProjectDuplicateCheckResponse {
  has_matches: boolean;
  matches: ProjectDuplicateMatch[];
}

export interface OnboardingSession {
  id: string;
  organization_id: string;
  project_id: string | null;
  user_id: string;
  role: UserRole;
  state: OnboardingSessionState;
  question_graph_version: string;
  next_question?: OnboardingQuestion | null;
  started_at: string;
  completed_at?: string;
}

export interface OnboardingAnswer {
  id: string;
  session_id: string;
  question_key: string;
  question_version: string;
  answer_type: SpecialAnswerType;
  answer_value: string;
  reason?: string;
  answered_by: string;
  answered_at: string;
  approved_by?: string;
  approved_at?: string;
}

export interface OnboardingTask {
  id: string;
  project_id: string;
  title: string;
  description: string;
  task_type: "MISSING_CONFIGURATION" | "EVIDENCE_UPLOAD" | "ACCOUNT_MAPPING" | "BASELINE_REVIEW";
  assigned_to_role: UserRole;
  assigned_to_name: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  blocking_gate: "VERIFIED_DASHBOARD" | "DRAW_SUBMISSION" | "INVESTOR_PUBLICATION" | "PROJECT_CLOSEOUT";
  created_from_question_key?: string;
  created_at: string;
}

export interface ConfigurationVersion {
  id: string;
  project_id: string;
  configuration_type: "CONTRACT_MODEL" | "ACCOUNT_MAPPING" | "BUDGET_BASELINE" | "APPROVAL_POLICY" | "INVESTOR_VISIBILITY";
  title: string;
  summary: string;
  proposed_value: string;
  status: "PENDING_OWNER_APPROVAL" | "APPROVED" | "REJECTED";
  proposed_by: string;
  proposed_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface ReadinessGate {
  id: string;
  name: string;
  description: string;
  is_unlocked: boolean;
  prerequisites: Array<{
    label: string;
    is_met: boolean;
    blocker_description?: string;
    action_href?: string;
  }>;
}

export interface ProjectReadiness {
  project_id: string;
  overall_readiness_pct: number;
  gates: ReadinessGate[];
  open_tasks: OnboardingTask[];
  pending_approvals: ConfigurationVersion[];
}

export interface ProjectInvitation {
  id: string;
  organization_id: string;
  project_id?: string;
  project_name?: string;
  organization_name?: string;
  email: string;
  role: UserRole;
  scope: string;
  invited_by: string;
  invitation_url?: string | null;
  expires_at: string;
  status?: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
}

// ----------------- OTHER SYSTEM ENTITIES -----------------

export interface DocumentItem {
  id: string;
  organization_id: string;
  project_id: string;
  original_filename: string;
  mime_type: string;
  document_type: "INVOICE" | "BANK_STATEMENT" | "DRAW_PACKAGE" | "BUDGET_SOV" | "INSPECTION" | "PERMIT" | "CONTRACT";
  document_date: string;
  ingestion_status: "UPLOADED" | "SCANNING" | "CLASSIFIED" | "READY_FOR_REVIEW" | "REVIEWED" | "QUARANTINED";
  duplicate_of_document_id?: string | null;
  sha256?: string;
  uploaded_by: string;
  uploaded_at: string;
  pages_count: number;
  notes?: string;
}

export interface ExtractionField {
  id: string;
  document_id: string;
  field_name: string;
  raw_value: string;
  normalized_value: string;
  confidence: number;
  citation: {
    page_number?: number;
    row_number?: number;
    sheet_name?: string;
    bounding_box?: number[];
  };
  status: "PROPOSED" | "ACCEPTED" | "EDITED" | "REJECTED";
  decision_rationale?: string;
}

export interface BudgetLine {
  id: string;
  budget_id: string;
  parent_line_id?: string | null;
  code: string;
  name: string;
  category: string;
  original_amount: string; // in cents
  current_approved_amount: string; // in cents
  actual_spend: string; // in cents
  committed_amount: string; // in cents
  is_draw_eligible: boolean;
  milestone_id?: string | null;
  sort_order: number;
}

export interface ChangeOrder {
  id: string;
  project_id: string;
  change_order_number: string;
  title: string;
  scope_description: string;
  requested_amount: string; // cents
  approved_amount?: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  target_budget_line_id: string;
  funding_source: "CONTINGENCY" | "SPONSOR_EQUITY" | "LOAN_EXPANSION";
  requested_by: string;
  requested_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface ContingencyMovement {
  id: string;
  project_id: string;
  amount: string; // cents
  source_line_id: string;
  destination_line_id: string;
  reason: string;
  change_order_id?: string;
  approved_by: string;
  approved_at: string;
}

export interface DrawLine {
  id: string;
  draw_id: string;
  budget_line_id: string;
  budget_line_name: string;
  budget_line_code: string;
  requested_amount: string; // cents
  recommended_amount: string;
  approved_amount: string;
  funded_amount: string;
  evidence_status: "VERIFIED" | "PENDING_INSPECTION" | "MISSING_INVOICE";
  lender_notes?: string;
}

export interface DrawCondition {
  id: string;
  title: string;
  status: "OPEN" | "SATISFIED" | "WAIVED";
  required_for: string;
  document_id?: string;
  notes?: string;
}

export interface DrawPacketItem {
  id: string;
  requirement: string;
  status: "COMPLETE" | "PENDING_SIGNOFF" | "MISSING";
  document_name?: string;
  notes?: string;
}

export interface DrawPortalSummary {
  vendor_count: number;
  total_requested: string;
  retainage_withheld: string;
  net_payable: string;
  commitment_id?: string;
}

export interface DrawItem {
  id: string;
  project_id: string;
  loan_id: string;
  draw_number: number;
  revision_label?: string;
  parent_draw_id?: string | null;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "PARTIALLY_APPROVED" | "APPROVED" | "REJECTED" | "FUNDED" | "CLOSED";
  period_start: string;
  period_end: string;
  submitted_at?: string;
  approved_at?: string;
  lender_name: string;
  requested_amount: string; // cents
  recommended_amount: string;
  approved_amount: string;
  funded_amount: string;
  shortfall_amount: string;
  unallocated_available?: string;
  lines?: DrawLine[];
  lender_decision_notes?: string;
  conditions?: DrawCondition[];
  packet_checklist?: DrawPacketItem[];
  portal_summary?: DrawPortalSummary;
  pm_verification?: {
    verified_by: string;
    verified_at: string;
    inspection_passed: boolean;
    notes: string;
  };
  cfo_verification?: {
    verified_by: string;
    verified_at: string;
    costs_verified: boolean;
    prior_payments_verified: boolean;
  };
}

export interface MilestoneEvidence {
  id: string;
  milestone_id: string;
  filename: string;
  type: "PHOTO" | "PERMIT" | "INSPECTION_REPORT" | "ENGINEERING_MEMO";
  file_size_bytes?: number;
  uploaded_at: string;
  uploaded_by: string;
  notes?: string;
  document_id?: string;
  thumbnail_url?: string;
  inspector_name?: string;
  verification_status?: "VERIFIED" | "PENDING_REVIEW" | "DISPUTED";
}

export interface MilestoneProgressConflict {
  has_conflict: boolean;
  pm_percent: number;
  inspector_percent: number;
  discrepancy_percent: number;
  estimated_value_at_risk: string; // cents
  inspector_report_name: string;
  inspector_report_id?: string;
  inspection_date: string;
  status: "OPEN" | "RESOLVED" | "REBUTTAL_SUBMITTED";
  resolution_note?: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface MilestoneItem {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  budget_line_id?: string | null;
  budget_line_code?: string;
  budget_line_name?: string;
  planned_start: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  forecast_end: string;
  percent_complete: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "AT_RISK" | "COMPLETED" | "DELAYED";
  critical_path: boolean;
  dependencies: string[]; // predecessor milestone IDs
  responsible_party?: string;
  delay_cause?: string;
  delay_days?: number;
  carry_impact?: string;
  carry_cost_amount?: string; // cents
  evidence_count: number;
  evidence_attachments?: MilestoneEvidence[];
  inspector_percent_complete?: number;
  progress_conflict?: MilestoneProgressConflict;
  last_updated_by?: string;
  last_updated_at?: string;
  update_rationale?: string;
}

export interface ScheduleForecast {
  project_id: string;
  has_schedule_baseline: boolean;
  target_completion: string | null;
  forecast_completion: string | null;
  delay_days: number;
  is_delayed: boolean;
  critical_path_milestone: string;
  critical_path_milestone_id?: string;
  carry_impact_monthly: string;
  total_carry_cost_exposure: string; // cents
  active_discrepancies_count: number;
  total_milestones: number;
  completed_milestones: number;
  overall_progress_percent: number;
}

export interface FinancialAccount {
  id: string;
  organization_id: string;
  institution: string;
  masked_identifier: string; // e.g. "•••• 4182"
  account_purpose: string;
  currency: string;
  status: "ACTIVE" | "CLOSED";
  opening_balance?: string;
  current_balance?: string;
}

export interface StatementPeriod {
  id: string;
  financial_account_id: string;
  period_start: string;
  period_end: string;
  opening_balance: string; // cents
  closing_balance: string;
  total_debits: string;
  total_credits: string;
  coverage_status: "COMPLETE" | "GAP_DETECTED" | "WAIVED";
  reconciled_status: "RECONCILED" | "PENDING_REVIEW" | "UNBALANCED";
  reconciled_by?: string;
  reconciled_at?: string;
}

export interface FinancialTransaction {
  id: string;
  project_id?: string;
  financial_account_id: string;
  account_ref: string;
  transaction_date: string;
  amount: string; // in cents
  direction: "DEBIT" | "CREDIT";
  counterparty: string;
  memo: string;
  cleared_status: "CLEARED" | "PENDING" | "UNRECONCILED";
  matched_spend_record_id?: string;
  is_transfer?: boolean;
  is_liability_settlement?: boolean;
  document_id?: string;
  invoice_reference?: string;
}

export interface SpendRecord {
  id: string;
  project_id: string;
  transaction_id?: string;
  vendor_name: string;
  amount: string; // cents
  transaction_date: string;
  description: string;
  status: "REVIEWED" | "PENDING_REVIEW" | "SPLIT" | "EXCLUDED" | "REVERSED";
  evidence_strength: "VERIFIED_INVOICE" | "SIGNED_CONTRACT" | "BANK_TRANSACTION" | "CARD_TRANSACTION" | "GC_CONFIRMATION" | "MANUAL_ENTRY";
  budget_line_id: string;
  budget_line_name: string;
  source_document_id?: string;
  allocations?: Array<{
    budget_line_id: string;
    amount: string;
  }>;
}

export interface ReconciliationMatch {
  id: string;
  transaction_id: string;
  project_id: string;
  amount: string;
  counterparty: string;
  transaction_date: string;
  proposed_budget_line_name: string;
  proposed_budget_line_id: string;
  confidence: number;
  confidence_reasons: string[];
  evidence_strength: "VERIFIED_INVOICE" | "SIGNED_CONTRACT" | "BANK_TRANSACTION" | "CARD_TRANSACTION" | "GC_CONFIRMATION" | "MANUAL_ENTRY";
  status: "PENDING_REVIEW" | "ACCEPTED" | "SPLIT" | "REMAP" | "EXCLUDED" | "TRANSFER";
  document_id?: string;
  invoice_reference?: string;
  is_liability_settlement?: boolean;
  remap_budget_line_id?: string;
  remap_rationale?: string;
  exclusion_rationale?: string;
  allocations?: Array<{
    budget_line_id: string;
    budget_line_name?: string;
    amount: string;
  }>;
}

export interface InterProjectTransfer {
  id: string;
  from_project_id: string;
  from_project_name: string;
  to_project_id: string;
  to_project_name: string;
  transaction_id: string;
  amount: string; // cents
  transfer_date: string;
  status: "ACTIVE_TEMPORARY" | "REPAID" | "PERMANENT_EQUITY";
  repaid_amount?: string;
  repaid_date?: string;
  reviewed_by: string;
  notes: string;
}

export interface ImportBatch {
  id: string;
  organization_id: string;
  project_id: string;
  adapter: string;
  version: string;
  status: string;
  total_rows: number;
  accepted_rows: number;
  rejected_rows: number;
  duplicate_rows: number;
  uploaded_by: string;
  created_at: string;
}

export interface ImportSourceRecord {
  id: string;
  batch_id: string;
  row_number: number;
  date: string;
  description: string;
  amount: string; // cents
  direction: "DEBIT" | "CREDIT";
  reference_number?: string;
  memo?: string;
  raw_formula?: string;
  is_duplicate?: boolean;
}

export interface InvestorUpdateSnapshot {
  id: string;
  project_id: string;
  title: string;
  as_of_date: string;
  published_at?: string;
  published_by?: string;
  status: "PUBLISHED" | "WITHDRAWN" | "DRAFT";
  gross_development_value: string; // cents
  current_forecast_profit: string; // cents
  senior_debt_drawn: string; // cents
  equity_funded: string; // cents
  progress_summary: string;
  material_disclosures: string[];
  recipients?: string[];
  expiry_date?: string;
  withdrawn_at?: string;
  withdrawn_by?: string;
  withdrawal_reason?: string;
  milestones_summary?: Array<{
    name: string;
    percent_complete: number;
    status: string;
    forecast_end: string;
  }>;
  capital_stack_summary?: {
    sponsor_equity: string;
    lp_equity: string;
    senior_debt_drawn: string;
    senior_debt_facility: string;
    total_budget: string;
  };
  sales_summary?: {
    total_units: number;
    closed_units: number;
    contracted_units: number;
    gross_sales_value: string;
  };
}

export interface PublishInvestorUpdatePayload {
  recipients: string[];
  expiry_date?: string;
  material_warnings_acknowledged: boolean;
}

export interface WithdrawInvestorUpdatePayload {
  reason: string;
}


export interface AlertItem {
  id: string;
  project_id: string;
  title: string;
  description: string;
  severity: "DANGER" | "WARNING" | "INFO";
  owner: string;
  status: "OPEN" | "RESOLVED" | "WAIVED";
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_note?: string;
  waived_reason?: string;
  waived_until?: string;
  waived_by?: string;
  escalated_to?: string;
  escalated_at?: string;
  escalation_notes?: string;
}

export interface ResolveAlertPayload {
  resolution_note?: string;
}

export interface WaiveAlertPayload {
  reason: string;
  waived_until?: string;
}

export interface EscalateAlertPayload {
  escalated_to: string;
  escalation_notes: string;
}

export interface DataQualityIssue {
  id: string;
  project_id: string;
  issue_type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "RESOLVED" | "WAIVED";
  description: string;
  affected_entity_type: string;
  affected_entity_id: string;
  detected_at: string;
  owner: string;
  resolved_at?: string;
  resolution_note?: string;
  waived_reason?: string;
}

export interface ResolveDqiPayload {
  resolution_note?: string;
  waived?: boolean;
  waiver_reason?: string;
}

export interface AuditEvent {
  id: string;
  project_id: string;
  actor_name: string;
  actor_role: UserRole;
  action_type: string;
  entity_type: string;
  entity_id: string;
  previous_value?: string;
  new_value?: string;
  rationale: string;
  source_citation?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  project_id: string;
  title: string;
  message: string;
  type: "ALERT" | "DRAW" | "SUBMISSION" | "RECONCILIATION" | "MILESTONE" | "SYSTEM";
  severity: "CRITICAL" | "WARNING" | "INFO" | "SUCCESS";
  read: boolean;
  created_at: string;
  link_url?: string;
}

export interface TeamMember {
  id: string;
  project_id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  company: string;
  avatarInitials: string;
  status: "ACTIVE" | "INVITED" | "REVOKED";
  added_at: string;
  scope?: string;
}

export interface InviteTeamMemberPayload {
  project_id: string;
  name?: string;
  email: string;
  role: UserRole;
  title?: string;
  company?: string;
  scope?: string;
}

export interface UpdateTeamMemberRolePayload {
  role: UserRole;
  title?: string;
  scope?: string;
}

export type ReportExportType =
  | "BUDGET_SOV_EXCEL"
  | "DRAW_PACKAGE_PDF"
  | "AUDIT_LOG_CSV"
  | "CLOSEOUT_RETURNS_PDF"
  | "INVESTOR_UPDATE_PDF";

export interface ReportExportItem {
  id: string;
  project_id: string;
  report_type: ReportExportType;
  title: string;
  format: "PDF" | "XLSX" | "CSV";
  status: "GENERATING" | "READY" | "FAILED";
  requested_by: string;
  requested_at: string;
  completed_at?: string;
  file_size?: string;
  download_url?: string;
  record_count?: number;
}

export interface RequestExportPayload {
  report_type: ReportExportType;
  format?: "PDF" | "XLSX" | "CSV";
  parameters?: Record<string, string>;
}

// ----------------- TRACK T10: ECONOMICS & CLOSEOUT TYPES -----------------

export type DataBasis = "ACTUAL" | "COMMITTED" | "APPROVED" | "ESTIMATED" | "MISSING";

export interface ProFormaLineItem {
  id: string;
  category: "REVENUE" | "HARD_COST" | "SOFT_COST" | "FINANCING" | "SUMMARY";
  line_name: string;
  original_plan_amount: string; // cents
  current_forecast_amount: string; // cents
  actual_cleared_amount?: string; // cents
  basis: DataBasis;
  variance_amount: string; // cents (current - original)
  variance_rationale?: string;
  notes?: string;
}

export interface ProjectEconomics {
  project_id: string;
  lifecycle_stage: LifecycleStage;
  gross_development_value: string; // cents
  net_sales_proceeds: string; // cents
  total_hard_costs: string; // cents
  total_soft_costs: string; // cents
  carrying_financing_cost: string; // cents
  total_cost: string; // cents
  net_profit: string; // cents
  return_on_cost_pct: number; // e.g. 23.2
  equity_multiple: number; // e.g. 1.85
  irr_pct: number | null; // e.g. 18.4 or null if missing cash flows
  irr_status: "VERIFIED" | "NOT_MEANINGFUL" | "ESTIMATED";
  irr_status_explanation: string;
  sponsor_equity_invested: string; // cents
  lp_equity_invested: string; // cents
  senior_debt_drawn: string; // cents
  senior_debt_repaid: string; // cents
  senior_debt_balance: string; // cents
  total_distributions: string; // cents
  pro_forma_lines: ProFormaLineItem[];
}

export interface InvestorContribution {
  id: string;
  project_id: string;
  investor_name: string;
  investor_type: "SPONSOR" | "LP_INVESTOR";
  call_number: string;
  amount: string; // cents
  effective_date: string;
  wire_reference: string;
  notes?: string;
}

export interface InvestorDistribution {
  id: string;
  project_id: string;
  investor_name: string;
  investor_type: "SPONSOR" | "LP_INVESTOR";
  distribution_type: "RETURN_OF_CAPITAL" | "PREFERRED_RETURN" | "PROFIT_SPLIT";
  amount: string; // cents
  effective_date: string;
  status: "CLEARED" | "PENDING";
  wire_reference?: string;
  notes?: string;
}

export interface DispositionUnit {
  id: string;
  project_id: string;
  unit_identifier: string; // e.g. "Unit 101", "Unit 4B"
  unit_type: string; // "2BR / 2BA Luxury Condominium"
  sqft: number;
  original_list_price: string; // cents
  contract_sale_price: string; // cents
  buyer_name?: string;
  contract_date?: string;
  closing_date?: string;
  status: "AVAILABLE" | "UNDER_CONTRACT" | "CLOSED";
  hud_settlement_id?: string;
  settlement_document_name?: string;
  broker_commission: string; // cents
  transfer_tax_closing_costs: string; // cents
  net_proceeds: string; // cents
}

export interface CloseoutChecklistItem {
  id: string;
  title: string;
  category: "MUNICIPAL" | "FINANCING" | "CONTRACTOR" | "ACCOUNTING" | "INVESTOR";
  is_satisfied: boolean;
  blocker_reason?: string;
  verified_at?: string;
  verified_by?: string;
  document_name?: string;
}

export interface PostCloseoutAdjustment {
  id: string;
  project_id: string;
  category: string;
  amount: string; // cents
  direction: "DEBIT" | "CREDIT";
  effective_date: string;
  recorded_by: string;
  recorded_at: string;
  rationale: string;
  document_name?: string;
}

export interface CloseoutReport {
  project_id: string;
  lifecycle_stage: LifecycleStage;
  status: "READY_FOR_CLOSEOUT" | "BLOCKED" | "CLOSED";
  completion_percent: number;
  checklist: CloseoutChecklistItem[];
  approved_closeout_record?: {
    approved_at: string;
    approved_by: string;
    closeout_certificate_id: string;
    rationale: string;
    is_exception_override?: boolean;
  };
  post_closeout_adjustments: PostCloseoutAdjustment[];
}

export type GCSubmissionType = "PROGRESS_CLAIM" | "COST_EVIDENCE" | "CHANGE_ORDER_REQUEST";
export type GCSubmissionStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface GCSubmissionEvidence {
  id: string;
  filename: string;
  type: "INVOICE" | "PHOTO" | "LIEN_WAIVER" | "PAYROLL" | "CUT_SHEET" | "OTHER";
  file_size_bytes: number;
  uploaded_at: string;
  invoice_number?: string;
  vendor_name?: string;
  amount?: string; // in cents
  notes?: string;
}

export interface GCSubmissionReview {
  role: "PM" | "CFO" | "OWNER";
  reviewer_name?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewed_at?: string;
  comments?: string;
}

export interface GCSubmission {
  id: string;
  project_id: string;
  submission_number: string; // e.g. "GC-CLAIM-004", "GC-COR-003", "GC-COST-002"
  type: GCSubmissionType;
  title: string;
  description: string;
  contract_model: "COST_PLUS" | "FIXED_PRICE" | "MILESTONE_BASED" | "PROFIT_SHARE" | "HYBRID" | "OPEN_BOOK";
  status: GCSubmissionStatus;
  submitted_at: string;
  submitted_by: string;
  contractor_name: string;
  milestone_id?: string;
  milestone_name?: string;
  csi_code?: string;
  csi_category?: string;
  claimed_amount: string; // cents
  retainage_rate_pct: number; // e.g. 10
  retainage_amount: string; // cents
  net_payable_amount: string; // cents
  prior_claimed_pct?: number;
  current_claimed_pct?: number;
  incremental_claimed_pct?: number;
  schedule_delay_days?: number; // for COR
  evidence_items: GCSubmissionEvidence[];
  invoice_numbers: string[];
  reviews: GCSubmissionReview[];
  created_task_ids: string[];
  rejection_reason?: string;
}

export interface DuplicateInvoiceCheckResult {
  is_duplicate: boolean;
  invoice_number: string;
  existing_record?: {
    source: string;
    amount: string; // cents
    date: string;
    vendor: string;
    draw_number?: number;
    submission_number?: string;
  };
}

export interface CreateGCSubmissionPayload {
  project_id: string;
  type: GCSubmissionType;
  title: string;
  description: string;
  milestone_id?: string;
  csi_code?: string;
  csi_category?: string;
  claimed_amount: string; // cents
  retainage_rate_pct?: number;
  prior_claimed_pct?: number;
  current_claimed_pct?: number;
  schedule_delay_days?: number;
  evidence_items: Omit<GCSubmissionEvidence, "id" | "uploaded_at">[];
  invoice_numbers?: string[];
  contractor_name?: string;
}

export interface ReviewGCSubmissionPayload {
  role: "PM" | "CFO" | "OWNER";
  decision: "APPROVED" | "REJECTED";
  comments?: string;
}
