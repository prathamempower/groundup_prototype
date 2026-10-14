GroundUp AI --- V2 Database Schema (33 Core Tables) Full Lifecycle
Financial Control Baseline (Acquisition !' Budget !' Spend !' Draws !'
Disposition) VERSION TABLES DOMAINS RELATIONSHIPS PRINCIPLES DATE 2.0.0
33 10 104 8 October 5, 2026 Architectural Core Principles \# Core
Engineering Principle #1 Separate the Four Truths: Budget Truth, Spend
Truth, Funding Truth, and Progress Truth must never be collapsed into
one transaction object. #2 Never guess a number: Every financial fact
must originate from an approved contract, invoice, or cleared bank
transaction. #3 AI proposals are not truth: OCR and AI document
extractions remain pending proposals until human verification confirms
them. #4 Original budgets are immutable: Approved baseline amounts are
never rewritten; modifications must be approved change orders or
contingency movements. #5 Only cleared cash is Funding Truth: Submitted
or approved lender draws do not count as funded until the bank
transaction is cleared. #6 Preserve draw lineage: Revised or rejected
draws create a child revision (parent_draw_id) rather than mutating the
historical submission. #7 Inter-project transfers are neutral: Temporary
loans or capital movements between projects are reconciled separately
and never counted as project revenue or expense. #8 Complete
organizational isolation: Multi-tenant safety with strict foreign-key
integrity and RLS policies across all 33 core tables. Functional Domains
& ERD Layout Blueprint ID Functional Domain Story Stage Count Included
Models (Hubs Marked) 1. C ore &T eam Organization & Team core 3 tables
organizations (Hub), users (Hub), parties (Hub) 2. P roje cts &E con omi
cs Projects & Economics projects 3 tables projects (Hub), acquisitions,
project_financial_plans 3. Fi nan cing &C ontr acts Financing &
Contracts financing 2 tables loans (Hub), construction_contracts 4. B
udg ets &C han ges Budgets & Changes budget 5 tables budgets (Hub),
budget_lines (Hub), contingency_movements, change_orders,
change_order_lines 5. S pen d& Cas h Spend & Cash Reconciliation spend 4
tables spend_records (Hub), financial_transactions (Hub),
reconciliation_matches, inter_project_transfers 6. D raw s& Fun ding
Draw Requests & Requirements draws 3 tables draws (Hub), draw_lines,
draw_requirements GroundUp AI Construction Financial Control
Architecture Page 1 of 23 GroundUp AI • Database Architecture & ERD
Specification Version: 2.0.0 ID Functional Domain Story Stage Count
Included Models (Hubs Marked) 7. D ocu men ts & AI Documents & AI OCR
docs 2 tables documents (Hub), document_extractions 8. P rogr ess & Pr
oof Timeline & Progress progress 5 tables project_milestones (Hub),
progress_records, progress_evidence, inspections, permits 9. E quit y&
Dis posi tion Investors & Disposition investors 4 tables
project_investors (Hub), investor_contributions, investor_distributions,
dispositions 10. Aud it & Aler ts Audit & Alerts audit 2 tables alerts
(Hub), audit_events (Hub) GroundUp AI Construction Financial Control
Architecture Page 2 of 23 GroundUp AI • Database Architecture & ERD
Specification Version: 2.0.0 Complete Data Dictionary (All Tables &
Attributes) Detailed column types, primary/foreign key relationships,
nullability, percentage explanations, and business roles. #01
organizations Domain: Organization & Team • Role: Company Workspace /
Tenant Boundary \| • Stores: Tenant identity, organization name, account
status, timestamps \| • Key Use: Top-level tenant boundary isolating all
enterprise data and projects Column Name Type Key Null Notes /
Percentage Meaning id uuid PK NOT NULL Default: gen_random_uuid() name
varchar(255) - NOT NULL - status enum(OrganizationStatus) - NOT NULL
Default: ACTIVE created_at timestamptz - NOT NULL Default: now()
updated_at timestamptz - NOT NULL Default: now() deleted_at
timestamptz - NULL - #02 users Domain: Organization & Team • Role:
Authenticated Application Users & RBAC \| • Stores: User identity,
credentials, tenant link, organizational role, account status \| • Key
Use: Authentication, authorization, and audit attribution Column Name
Type Key Null Notes / Percentage Meaning id uuid PK NOT NULL Default:
gen_random_uuid() organization_id uuid FK -\> organizations NOT NULL -
auth_user_id uuid - NULL UNIQUE email varchar(320) - NOT NULL UNIQUE
first_name varchar(120) - NULL - last_name varchar(120) - NULL - role
enum(UserRole) - NOT NULL - status enum(UserStatus) - NOT NULL Default:
INVITED created_at timestamptz - NOT NULL Default: now() updated_at
timestamptz - NOT NULL Default: now() #03 projects Domain: Projects &
Economics • Role: Capital Project Master Container \| • Stores: Site
location, stages, lifecycle dates, GC and lender party links \| • Key
Use: Core entity anchor linking all financial, schedule, and contract
data Column Name Type Key Null Notes / Percentage Meaning id uuid PK NOT
NULL Default: gen_random_uuid() organization_id uuid FK -\>
organizations NOT NULL - created_by_user_id uuid FK -\> users NOT NULL -
owner_user_id uuid FK -\> users NOT NULL - general_contractor_party_id
uuid FK -\> parties NULL - primary_lender_party_id uuid FK -\> parties
NULL - name varchar(255) - NOT NULL - site_address varchar(500) - NOT
NULL - project_type varchar(100) - NULL - units integer - NULL - stage
enum(ProjectStage) - NOT NULL Default: ACQUISITION status
enum(ProjectStatus) - NOT NULL Default: SETUP start_date date - NULL
GroundUp AI Construction Financial Control Architecture - Page 3 of 23
GroundUp AI • Database Architecture & ERD Specification Version: 2.0.0
Column Name Type Key Null Notes / Percentage Meaning
baseline_completion_date date - NULL - current_forecast_completion_d ate
date - NULL - actual_completion_date date - NULL - created_at
timestamptz - NOT NULL Default: now() updated_at timestamptz - NOT NULL
Default: now() deleted_at timestamptz - NULL - #04 parties Domain:
Organization & Team • Role: Counterparty & Vendor Directory \| • Stores:
Legal names, contact info, counterparty type (GC, lender, vendor,
investor) \| • Key Use: Normalized entity directory replacing raw string
counterparty names Column Name Type Key Null Notes / Percentage Meaning
id uuid PK NOT NULL Default: gen_random_uuid() organization_id uuid FK
-\> organizations NOT NULL - party_type enum(PartyType) - NOT NULL -
legal_name varchar(255) - NOT NULL - display_name varchar(255) - NULL -
email varchar(320) - NULL - phone varchar(50) - NULL - address
varchar(500) - NULL - created_at timestamptz - NOT NULL Default: now()
updated_at timestamptz - NOT NULL Default: now() #05 acquisitions
Domain: Projects & Economics • Role: Property Acquisition Economics \| •
Stores: Purchase price, closing costs, legal fees, recording fees,
initial equity \| • Key Use: Isolates property buy costs outside the
construction budget Column Name Type Key Null Notes / Percentage Meaning
id uuid PK NOT NULL Default: gen_random_uuid() project_id uuid FK -\>
projects NOT NULL UNIQUE acquisition_date date - NULL - purchase_price
numeric(18,2) - NOT NULL - closing_costs numeric(18,2) - NOT NULL
Default: 0 legal_costs numeric(18,2) - NOT NULL Default: 0
recording_fees numeric(18,2) - NOT NULL Default: 0
other_acquisition_costs numeric(18,2) - NOT NULL Default: 0
initial_equity numeric(18,2) - NOT NULL Default: 0 source_document_id
uuid FK -\> documents NULL - notes text - NULL - created_at
timestamptz - NOT NULL Default: now() updated_at timestamptz - NOT NULL
Default: now() GroundUp AI Construction Financial Control Architecture
Page 4 of 23 GroundUp AI • Database Architecture & ERD Specification
Version: 2.0.0 #06 loans Domain: Financing & Contracts • Role: Project
Debt Financing Facility \| • Stores: Commitment amount, interest rate,
payment method, maturity, lender party link \| • Key Use: Tracks
acquisition and construction loan agreements and interest reserve Column
Name Type Key Null Notes / Percentage Meaning id uuid PK NOT NULL
Default: gen_random_uuid() project_id uuid FK -\> projects NOT NULL -
lender_party_id uuid FK -\> parties NOT NULL - loan_type
enum(LoanType) - NOT NULL - loan_reference varchar(255) - NULL -
commitment_amount numeric(18,2) - NULL - interest_rate numeric(7,4) -
NULL - interest_rate_type varchar(50) - NULL - interest_payment_method
enum(InterestPaymentMet hod) NOT NULL - interest_reserve_initial
numeric(18,2) - NOT NULL Default: 0 loan_start_date date - NULL -
loan_maturity_date date - NULL - source_document_id uuid FK -\>
documents NULL - notes text - NULL - created_at timestamptz - NOT NULL
Default: now() updated_at timestamptz - NOT NULL Default: now() #07
project_financial_plans Domain: Projects & Economics • Role: Pro Forma
vs Current Economics \| • Stores: Original baseline assumptions compared
to current live forecasts across all cost categories \| • Key Use:
Answers \'what did we expect, what changed, and why?\' Column Name Type
Key Null Notes / Percentage Meaning id uuid PK NOT NULL Default:
gen_random_uuid() project_id uuid FK -\> projects NOT NULL UNIQUE
original_acquisition_cost numeric(18,2) - NULL -
current_acquisition_cost numeric(18,2) - NULL -
original_construction_budget numeric(18,2) - NULL -
current_construction_forecast numeric(18,2) - NULL - original_soft_costs
numeric(18,2) - NULL - current_soft_cost_forecast numeric(18,2) - NULL -
original_financing_costs numeric(18,2) - NULL -
current_financing_cost_foreca st numeric(18,2) - NULL -
original_interest_cost numeric(18,2) - NULL -
current_interest_cost_forecast numeric(18,2) - NULL - original_taxes
numeric(18,2) - NULL - current_taxes_forecast numeric(18,2) - NULL -
original_insurance numeric(18,2) - NULL - current_insurance_forecast
numeric(18,2) - NULL - original_carrying_costs numeric(18,2) - NULL -
current_carrying_cost_forecast numeric(18,2) - NULL -
original_sale_price - NULL - numeric(18,2) GroundUp AI Construction
Financial Control Architecture Page 5 of 23 GroundUp AI • Database
Architecture & ERD Specification Version: 2.0.0 Column Name Type Key
Null Notes / Percentage Meaning current_sale_price_forecast
numeric(18,2) - NULL - original_selling_costs numeric(18,2) - NULL -
current_selling_cost_forecast numeric(18,2) - NULL -
original_target_profit numeric(18,2) - NULL - original_target_roi_pct
numeric(7,4) - NULL Percentage: Original Target ROI Percentage (%)
original_duration_days integer - NULL - current_duration_days_forecas t
integer - NULL - forecast_updated_at timestamptz - NULL - created_at
timestamptz - NOT NULL Default: now() updated_at timestamptz - NOT NULL
Default: now() #08 construction_contracts Domain: Financing & Contracts
• Role: General Contractor Master Agreement \| • Stores: Contract model
(open-book, fixed, GMP), retainage %, profit share %, terms \| • Key
Use: Governs billing terms, retainage holdbacks, and draw evidence
requirements Column Name Type Key Null Notes / Percentage Meaning id
uuid PK NOT NULL Default: gen_random_uuid() project_id uuid FK -\>
projects NOT NULL - gc_party_id uuid FK -\> parties NOT NULL -
contract_model enum(ConstructionContra ctModel) - NOT NULL -
contract_amount numeric(18,2) - NULL - payment_structure varchar(255) -
NULL - markup_pct numeric(7,4) - NULL Percentage: Markup Percentage (%)
profit_share_pct numeric(7,4) - NULL Percentage: Profit Share Percentage
(%) retainage_pct numeric(7,4) - NULL Percentage: Retainage Percentage
(%) change_order_rules text - NULL - required_documentation text -
NULL - payment_terms text - NULL - effective_date date - NULL -
source_document_id uuid FK -\> documents NULL - status
enum(ContractStatus) - NOT NULL Default: ACTIVE created_at timestamptz -
NOT NULL Default: now() updated_at timestamptz - NOT NULL Default: now()
#09 budgets Domain: Budgets & Changes • Role: Approved Budget Revision
Container \| • Stores: Budget version, approval timestamp, total amount,
version lineage link \| • Key Use: Enforces Budget Truth; only approved
versions represent official cost plan Column Name Type Key Null Notes /
Percentage Meaning id uuid PK NOT NULL Default: gen_random_uuid()
project_id uuid FK -\> projects NOT NULL - version_number integer - NOT
NULL - name varchar(255) - NOT NULL - status enum(BudgetStatus) - NOT
NULL - effective_date date - NULL - GroundUp AI Construction Financial
Control Architecture Page 6 of 23 GroundUp AI • Database Architecture &
ERD Specification Version: 2.0.0 Column Name Type Key Null Notes /
Percentage Meaning previous_budget_id uuid FK -\> budgets NULL -
total_amount numeric(18,2) - NULL - approved_by_user_id uuid FK -\>
users NULL - approved_at timestamptz - NULL - source_document_id uuid FK
-\> documents NULL - notes text - NULL - created_at timestamptz - NOT
NULL Default: now() updated_at timestamptz - NOT NULL Default: now() #10
budget_lines Domain: Budgets & Changes • Role: Budget Cost Line Item \|
• Stores: Cost code, trade category, original baseline, current approved
amount \| • Key Use: Granular cost allocation anchor for spend, change
orders, and draws Column Name Type Key Null Notes / Percentage Meaning
id uuid PK NOT NULL Default: gen_random_uuid() budget_id uuid FK -\>
budgets NOT NULL - project_id uuid FK -\> projects NOT NULL - cost_code
varchar(100) - NULL - category varchar(150) - NOT NULL - phase
varchar(150) - NULL - description varchar(500) - NOT NULL -
original_amount numeric(18,2) - NOT NULL - current_amount
numeric(18,2) - NOT NULL - lender_required boolean - NOT NULL Default:
false is_contingency boolean - NOT NULL Default: false created_at
timestamptz - NOT NULL Default: now() updated_at timestamptz - NOT NULL
Default: now() #11 change_orders Domain: Budgets & Changes • Role:
Budget Scope Modification Header \| • Stores: Change order number,
authorization audit, approval state, source doc \| • Key Use: Formal
audit header for additions, deductions, or scope changes Column Name
Type Key Null Notes / Percentage Meaning id uuid PK NOT NULL Default:
gen_random_uuid() project_id uuid FK -\> projects NOT NULL -
change_order_number varchar(100) - NOT NULL - title varchar(255) - NOT
NULL - description text - NULL - status enum(ChangeOrderStatus ) NOT
NULL - requested_by_user_id uuid FK -\> users NULL - approved_by_user_id
uuid FK -\> users NULL - approved_at timestamptz - NULL -
source_document_id uuid FK -\> documents NULL - created_at timestamptz -
NOT NULL Default: now() updated_at timestamptz - NOT NULL Default: now()
GroundUp AI Construction Financial Control Architecture Page 7 of 23
GroundUp AI • Database Architecture & ERD Specification Version: 2.0.0
#12 change_order_lines Domain: Budgets & Changes • Role: Multi-Line
Budget Adjustment \| • Stores: Specific budget line link, adjustment
amount (positive or negative), reason \| • Key Use: Allows one approved
change order to adjust multiple cost line items Column Name Type Key
Null Notes / Percentage Meaning id uuid PK NOT NULL Default:
gen_random_uuid() change_order_id uuid FK -\> change_orders NOT NULL -
budget_line_id uuid FK -\> budget_lines NOT NULL - adjustment_amount
numeric(18,2) - NOT NULL - reason text - NULL - created_at timestamptz -
NOT NULL Default: now() #13 contingency_movements Domain: Budgets &
Changes • Role: Contingency Drawdown & Transfer \| • Stores: Contingency
source line, recipient cost line, transfer amount, reason \| • Key Use:
Reallocates contingency to overrun categories without rewriting baseline
Column Name Type Key Null Notes / Percentage Meaning id uuid PK NOT NULL
Default: gen_random_uuid() project_id uuid FK -\> projects NOT NULL -
source_budget_line_id uuid FK -\> budget_lines NOT NULL -
destination_budget_line_id uuid FK -\> budget_lines NOT NULL - amount
numeric(18,2) - NOT NULL - reason text - NOT NULL - status
enum(ContingencyMovem entStatus) NOT NULL - approved_by_user_id uuid FK
-\> users NULL - approved_at timestamptz - NULL - created_at
timestamptz - NOT NULL Default: now() #14 project_milestones Domain:
Timeline & Progress • Role: Major Construction Milestone \| • Stores:
Planned/actual schedule, weighted completion %, delay diagnostics \| •
Key Use: Bridges Budget, Timeline, Field Evidence, and Draw release
criteria Column Name Type Key Null Notes / Percentage Meaning id uuid PK
NOT NULL Default: gen_random_uuid() project_id uuid FK -\> projects NOT
NULL - budget_line_id uuid FK -\> budget_lines NULL - name
varchar(255) - NOT NULL - trade varchar(150) - NULL - sequence_number
integer - NULL - planned_start_date date - NULL -
planned_completion_date date - NULL - actual_start_date date - NULL -
actual_completion_date date - NULL - expected_completion_date date -
NULL - progress_pct numeric(7,4) - NOT NULL weight_pct numeric(7,4) -
NULL Percentage: Weight Percentage (%) delay_source varchar(150) -
NULL - GroundUp AI Construction Financial Control Architecture
Percentage: Progress Percentage (%); Default: 0 Page 8 of 23 GroundUp AI
• Database Architecture & ERD Specification Version: 2.0.0 Column Name
Type Key Null Notes / Percentage Meaning delay_reason text - NULL -
status enum(MilestoneStatus) - NOT NULL - created_at timestamptz - NOT
NULL Default: now() updated_at timestamptz - NOT NULL Default: now() #15
progress_records Domain: Timeline & Progress • Role: Field Progress
Observation \| • Stores: Reported vs verified completion %, observation
date, verifier audit \| • Key Use: Enforces Progress Truth; reported
numbers are unverified until signed off Column Name Type Key Null Notes
/ Percentage Meaning id uuid PK NOT NULL Default: gen_random_uuid()
project_id uuid FK -\> projects NOT NULL - milestone_id uuid FK -\>
project_milestones NOT NULL - observed_on date - NOT NULL -
reported_completion_pct numeric(7,4) - NULL Percentage: Reported
Completion Percentage (%) verified_completion_pct numeric(7,4) - NULL
Percentage: Verified Completion Percentage (%) status
enum(ProgressVerification Status) reported_by_user_id uuid
verified_by_user_id NOT NULL - FK -\> users NULL - uuid FK -\> users
NULL - verified_at timestamptz - NULL - notes text - NULL - created_at
timestamptz - NOT NULL Default: now() #16 progress_evidence Domain:
Timeline & Progress • Role: Physical Progress Evidence \| • Stores:
Photo/inspection link, timestamp, verifier audit, document vault link \|
• Key Use: Substantiates reported work with real site photos and
engineer sign-offs Column Name Type Key Null Notes / Percentage Meaning
id uuid PK NOT NULL Default: gen_random_uuid() project_id uuid FK -\>
projects NOT NULL - milestone_id uuid FK -\> project_milestones NULL -
budget_line_id uuid FK -\> budget_lines NULL - progress_record_id uuid
FK -\> progress_records NULL - document_id uuid FK -\> documents NOT
NULL - evidence_type enum(ProgressEvidenceT ype) - NOT NULL -
captured_at timestamptz - NULL - uploaded_by_user_id uuid FK -\> users
NULL - verified_status enum(VerificationStatus) - NOT NULL -
verified_by_user_id uuid FK -\> users NULL - verified_at timestamptz -
NULL - notes text - NULL - created_at timestamptz - NOT NULL GroundUp AI
Construction Financial Control Architecture Default: now() Page 9 of 23
GroundUp AI • Database Architecture & ERD Specification Version: 2.0.0
#17 inspections Domain: Timeline & Progress • Role: Site & Regulatory
Inspection \| • Stores: Inspection type (city, lender, special),
pass/fail result, inspector name \| • Key Use: Validates code compliance
and satisfies lender draw condition gates Column Name Type Key Null
Notes / Percentage Meaning id uuid PK NOT NULL Default:
gen_random_uuid() project_id uuid FK -\> projects NOT NULL -
milestone_id uuid FK -\> project_milestones NULL - inspection_type
varchar(150) - NULL - inspection_date date - NULL - result
enum(InspectionResult) - NOT NULL - inspector_name varchar(255) - NULL -
source_document_id uuid FK -\> documents NULL - notes text - NULL -
created_at timestamptz - NOT NULL Default: now() updated_at
timestamptz - NOT NULL Default: now() #18 permits Domain: Timeline &
Progress • Role: Municipal Building Permit \| • Stores: Permit number,
type (framing, MEP, foundation), issue & expiry dates \| • Key Use:
Prevents stop-work orders and clears municipal draw requirements Column
Name Type Key Null Notes / Percentage Meaning id uuid PK NOT NULL
Default: gen_random_uuid() project_id uuid FK -\> projects NOT NULL -
permit_type varchar(150) - NOT NULL - permit_number varchar(150) -
NULL - status enum(PermitStatus) - NOT NULL - applied_date date - NULL -
issued_date date - NULL - expiration_date date - NULL -
source_document_id uuid FK -\> documents NULL - notes text - NULL -
created_at timestamptz - NOT NULL Default: now() updated_at
timestamptz - NOT NULL Default: now() #19 documents Domain: Documents &
AI OCR • Role: Immutable Document Vault \| • Stores: Secure storage URL,
SHA-256 hash, document category, upload audit \| • Key Use: Canonical
source evidence repository for all project transactions Column Name Type
Key Null Notes / Percentage Meaning id uuid PK NOT NULL Default:
gen_random_uuid() organization_id uuid FK -\> organizations NOT NULL -
project_id uuid FK -\> projects NULL - file_name varchar(500) - NOT
NULL - file_url text - NOT NULL - file_hash varchar(64) - NOT NULL -
document_type enum(DocumentType) - NULL - GroundUp AI Construction
Financial Control Architecture Page 10 of 23 GroundUp AI • Database
Architecture & ERD Specification Version: 2.0.0 Column Name Type Key
Null Notes / Percentage Meaning source enum(DocumentSource) - NOT NULL -
status enum(DocumentStatus) - NOT NULL - uploaded_by_user_id uuid FK -\>
users NULL - uploaded_at timestamptz - NOT NULL Default: now()
created_at timestamptz - NOT NULL Default: now() updated_at
timestamptz - NOT NULL Default: now() #20 document_extractions Domain:
Documents & AI OCR • Role: AI OCR Parsing & Human Verification \| •
Stores: Raw AI payload, normalized JSON, human-verified JSON, confidence
score \| • Key Use: Ensures AI proposals never become financial truth
without human signoff Column Name Type Key Null Notes / Percentage
Meaning id uuid PK NOT NULL Default: gen_random_uuid() document_id uuid
FK -\> documents NOT NULL - attempt_number integer - NOT NULL Default: 1
provider varchar(100) - NULL - model_name varchar(150) - NULL -
model_version varchar(100) - NULL - parser_version varchar(100) - NULL -
status enum(ExtractionStatus) - NOT NULL - raw_output jsonb - NULL -
extracted_data jsonb - NULL - confidence numeric(7,4) - NULL -
verification_status enum(VerificationStatus) - NOT NULL - verified_data
jsonb - NULL - verified_by_user_id uuid FK -\> users NULL - verified_at
timestamptz - NULL - error_message text - NULL - started_at
timestamptz - NULL - completed_at timestamptz - NULL - created_at
timestamptz - NOT NULL Default: now() #21 spend_records Domain: Spend &
Cash Reconciliation • Role: Verified Incurred Spend Truth \| • Stores:
Amount, vendor link, cost code, evidence type, bank transaction link \|
• Key Use: Single source of truth for project cost incurred; works with
or without invoice Column Name Type Key Null Notes / Percentage Meaning
id uuid PK NOT NULL Default: gen_random_uuid() project_id uuid FK -\>
projects NOT NULL - vendor_party_id uuid FK -\> parties NULL -
budget_line_id uuid FK -\> budget_lines NOT NULL - loan_id uuid FK -\>
loans NULL - amount numeric(18,2) - NOT NULL - incurred_date date - NOT
NULL - reference_number varchar(150) - NULL - description text - NULL -
GroundUp AI Construction Financial Control Architecture Page 11 of 23
GroundUp AI • Database Architecture & ERD Specification Version: 2.0.0
Column Name Type Key Null Notes / Percentage Meaning evidence_strength
enum(EvidenceStrength) - NOT NULL - source_document_id uuid FK -\>
documents NULL - financial_transaction_id uuid FK -\>
financial_transactions NULL - payment_status enum(PaymentStatus) - NOT
NULL - verification_status enum(VerificationStatus) - NOT NULL -
verified_by_user_id uuid FK -\> users NULL - verified_at timestamptz -
NULL - voided_at timestamptz - NULL - created_at timestamptz - NOT NULL
Default: now() updated_at timestamptz - NOT NULL Default: now() #22
financial_transactions Domain: Spend & Cash Reconciliation • Role:
Actual Cash Movement (Funding Truth) \| • Stores: Cleared bank amount,
direction (in/out), transaction type, GL/bank ref \| • Key Use: The cash
layer defining Funding Truth when cleared Column Name Type Key Null
Notes / Percentage Meaning id uuid PK NOT NULL Default:
gen_random_uuid() organization_id uuid FK -\> organizations NOT NULL -
project_id uuid FK -\> projects NULL - loan_id uuid FK -\> loans NULL -
external_tx_id varchar(255) - NULL - account_reference varchar(150) -
NULL - transaction_date date - NOT NULL - posted_at timestamptz - NULL -
amount numeric(18,2) - NOT NULL - direction enum(TransactionDirectio
n) - NOT NULL - transaction_type enum(FinancialTransactio nType) - NOT
NULL - description text - NULL - status enum(FinancialTransactio
nStatus) - NOT NULL - source_document_id uuid FK -\> documents NULL -
created_at timestamptz - NOT NULL Default: now() updated_at
timestamptz - NOT NULL Default: now() #23 reconciliation_matches Domain:
Spend & Cash Reconciliation • Role: Cash to Spend Multi-Match Layer \| •
Stores: Matched amount, match confidence, match resolution audit \| •
Key Use: Supports 1:many, many:1, and split/partial matching between
bank and spend Column Name Type Key Null Notes / Percentage Meaning id
uuid PK NOT NULL Default: gen_random_uuid() project_id uuid FK -\>
projects NOT NULL - financial_transaction_id uuid FK -\>
financial_transactions NOT NULL - spend_record_id uuid FK -\>
spend_records NOT NULL - matched_amount numeric(18,2) - NOT NULL -
match_score numeric(7,4) - NULL - GroundUp AI Construction Financial
Control Architecture Page 12 of 23 GroundUp AI • Database Architecture &
ERD Specification Version: 2.0.0 Column Name Type Key Null Notes /
Percentage Meaning status enum(ReconciliationMatch Status) NOT NULL -
resolved_by_user_id uuid FK -\> users NULL - resolved_at timestamptz -
NULL - notes text - NULL - created_at timestamptz - NOT NULL Default:
now() #24 inter_project_transfers Domain: Spend & Cash Reconciliation •
Role: Temporary Capital Movement Between Projects \| • Stores:
Sending/receiving project, transfer amount, repayment status \| • Key
Use: Prevents inter-entity loans from distorting project profit or spend
Column Name Type Key Null Notes / Percentage Meaning id uuid PK NOT NULL
Default: gen_random_uuid() organization_id uuid FK -\> organizations NOT
NULL - from_project_id uuid FK -\> projects NOT NULL - to_project_id
uuid FK -\> projects NOT NULL - amount numeric(18,2) - NOT NULL -
transfer_date date - NOT NULL - type enum(InterProjectTransfer Type) NOT
NULL - repaid_amount numeric(18,2) - NOT NULL Default: 0 repaid_date
date - NULL - status enum(InterProjectTransfer Status) NOT NULL -
outbound_transaction_id uuid FK -\> financial_transactions NULL -
inbound_transaction_id uuid FK -\> financial_transactions NULL - notes
text - NULL - created_at timestamptz - NOT NULL Default: now()
updated_at timestamptz - NOT NULL Default: now() #25 draws Domain: Draw
Requests & Requirements • Role: Lender Draw Request & Revision Lineage
\| • Stores: Draw #, revision #, requested/approved/funded amounts,
decision notes \| • Key Use: Manages draw lifecycle without overwriting
rejected/modified submissions Column Name Type Key Null Notes /
Percentage Meaning id uuid PK NOT NULL Default: gen_random_uuid()
project_id uuid FK -\> projects NOT NULL - parent_draw_id uuid FK -\>
draws NULL - draw_number integer - NOT NULL - revision_number integer -
NOT NULL Default: 1 requested_amount numeric(18,2) - NOT NULL -
approved_amount numeric(18,2) - NULL - funded_amount numeric(18,2) -
NULL - deducted_amount numeric(18,2) - NULL - status enum(DrawStatus) -
NOT NULL - requested_period_start date - NULL - requested_period_end
date - NULL - GroundUp AI Construction Financial Control Architecture
Page 13 of 23 GroundUp AI • Database Architecture & ERD Specification
Version: 2.0.0 Column Name Type Key Null Notes / Percentage Meaning
owner_approved_at timestamptz - NULL - owner_approved_by_user_id uuid FK
-\> users NULL - submitted_at timestamptz - NULL - submitted_by_user_id
uuid FK -\> users NULL - lender_decision_at timestamptz - NULL -
lender_decision enum(LenderDecisionTyp e) - NULL - lender_notes text -
NULL - disbursement_transaction_id uuid FK -\> financial_transactions
NULL - source_document_id uuid FK -\> documents NULL - created_at
timestamptz - NOT NULL Default: now() updated_at timestamptz - NOT NULL
Default: now() #26 draw_lines Domain: Draw Requests & Requirements •
Role: Individual Draw Claim Line \| • Stores: Budget line link,
milestone link, requested/approved amounts, status \| • Key Use:
Supports draw claims backed by spend or completed milestones Column Name
Type Key Null Notes / Percentage Meaning id uuid PK NOT NULL Default:
gen_random_uuid() draw_id uuid FK -\> draws NOT NULL - budget_line_id
uuid FK -\> budget_lines NOT NULL - milestone_id uuid FK -\>
project_milestones NULL - requested_amount numeric(18,2) - NOT NULL -
approved_amount numeric(18,2) - NULL - funded_amount numeric(18,2) -
NULL - deducted_amount numeric(18,2) - NULL - status
enum(DrawLineStatus) - NOT NULL - notes text - NULL - created_at
timestamptz - NOT NULL Default: now() updated_at timestamptz - NOT NULL
Default: now() #27 draw_requirements Domain: Draw Requests &
Requirements • Role: Draw Readiness Checklist & Gate \| • Stores:
Requirement type (lien waiver, inspection, permit), blocking status \| •
Key Use: Prevents draw submission until mandatory lender covenants are
satisfied Column Name Type Key Null Notes / Percentage Meaning id uuid
PK NOT NULL Default: gen_random_uuid() draw_id uuid FK -\> draws NOT
NULL - requirement_type enum(DrawRequirementT ype) - NOT NULL - name
varchar(255) - NOT NULL - description text - NULL - blocking boolean -
NOT NULL Default: true status enum(DrawRequirementS tatus) - NOT NULL -
document_id uuid FK -\> documents NULL - inspection_id uuid FK -\>
inspections NULL - GroundUp AI Construction Financial Control
Architecture Page 14 of 23 GroundUp AI • Database Architecture & ERD
Specification Version: 2.0.0 Column Name Type Key Null Notes /
Percentage Meaning permit_id uuid FK -\> permits NULL - satisfied_at
timestamptz - NULL - created_at timestamptz - NOT NULL Default: now()
updated_at timestamptz - NOT NULL Default: now() #28 project_investors
Domain: Investors & Disposition • Role: Equity Investor Cap Table Link
\| • Stores: Investor party link, equity ownership %, preferred return
rate, status \| • Key Use: Normalizes investor participation and
ownership stakes Column Name Type Key Null Notes / Percentage Meaning id
uuid PK NOT NULL Default: gen_random_uuid() project_id uuid FK -\>
projects NOT NULL - investor_party_id uuid FK -\> parties NOT NULL -
ownership_pct numeric(7,4) - NULL Percentage: Ownership Percentage (%)
target_return_pct numeric(7,4) - NULL Percentage: Target Return
Percentage (%) status enum(ProjectInvestorStat us) - NOT NULL - notes
text - NULL - created_at timestamptz - NOT NULL Default: now()
updated_at timestamptz - NOT NULL Default: now() #29
investor_contributions Domain: Investors & Disposition • Role: LP Equity
Capital Contribution \| • Stores: Contributed amount, date, funding
transaction link, subscription doc \| • Key Use: Tracks actual received
equity cash for capital call verification Column Name Type Key Null
Notes / Percentage Meaning id uuid PK NOT NULL Default:
gen_random_uuid() project_investor_id uuid FK -\> project_investors NOT
NULL - amount numeric(18,2) - NOT NULL - contribution_date date - NOT
NULL - status enum(ContributionStatus) - NOT NULL -
financial_transaction_id uuid FK -\> financial_transactions NULL -
source_document_id uuid FK -\> documents NULL - notes text - NULL -
created_at timestamptz - NOT NULL Default: now() updated_at
timestamptz - NOT NULL Default: now() #30 investor_distributions Domain:
Investors & Disposition • Role: Investor Capital Return & Distribution
\| • Stores: Distribution amount, date, bank transaction link,
distribution status \| • Key Use: Records return of capital and profit
paid out to project equity partners Column Name Type Key Null Notes /
Percentage Meaning id uuid PK NOT NULL Default: gen_random_uuid()
project_investor_id uuid FK -\> project_investors NOT NULL - amount
numeric(18,2) - NOT NULL - distribution_date date - NULL - GroundUp AI
Construction Financial Control Architecture Page 15 of 23 GroundUp AI •
Database Architecture & ERD Specification Version: 2.0.0 Column Name
Type Key Null Notes / Percentage Meaning status
enum(DistributionStatus) - NOT NULL - financial_transaction_id uuid FK
-\> financial_transactions NULL - notes text - NULL - created_at
timestamptz - NOT NULL Default: now() updated_at timestamptz - NOT NULL
Default: now() #31 dispositions Domain: Investors & Disposition • Role:
Project Exit & Disposition Economics \| • Stores: Gross sale price,
commissions, closing costs, payoff, net proceeds \| • Key Use: Finalizes
the project lifecycle to calculate net profit and returns Column Name
Type Key Null Notes / Percentage Meaning id uuid PK NOT NULL Default:
gen_random_uuid() project_id uuid FK -\> projects NOT NULL UNIQUE
projected_sale_price numeric(18,2) - NULL - actual_sale_price
numeric(18,2) - NULL - projected_sale_date date - NULL -
actual_sale_date date - NULL - realtor_commission numeric(18,2) - NOT
NULL Default: 0 seller_closing_costs numeric(18,2) - NOT NULL Default: 0
legal_fees numeric(18,2) - NOT NULL Default: 0 other_selling_expenses
numeric(18,2) - NOT NULL Default: 0 loan_payoff numeric(18,2) - NOT NULL
Default: 0 status enum(DispositionStatus) - NOT NULL -
source_document_id uuid FK -\> documents NULL - notes text - NULL -
created_at timestamptz - NOT NULL Default: now() updated_at
timestamptz - NOT NULL Default: now() #32 alerts Domain: Audit & Alerts
• Role: Actionable Financial & Risk Alerts \| • Stores: Alert type
(budget overrun, delay, draw blocker), severity, resolution \| • Key
Use: Surfaces proactive warnings on budget overruns and schedule
slippages Column Name Type Key Null Notes / Percentage Meaning id uuid
PK NOT NULL Default: gen_random_uuid() organization_id uuid FK -\>
organizations NOT NULL - project_id uuid FK -\> projects NULL -
alert_type enum(AlertType) - NOT NULL - severity enum(AlertSeverity) -
NOT NULL - status enum(AlertStatus) - NOT NULL - title varchar(255) -
NOT NULL - message text - NOT NULL - source_type varchar(100) - NULL -
source_id uuid - NULL - acknowledged_by_user_id uuid FK -\> users NULL -
acknowledged_at timestamptz - NULL - resolved_by_user_id uuid FK -\>
users NULL - GroundUp AI Construction Financial Control Architecture
Page 16 of 23 GroundUp AI • Database Architecture & ERD Specification
Version: 2.0.0 Column Name Type Key Null Notes / Percentage Meaning
resolved_at timestamptz - NULL - resolution_notes text - NULL -
created_at timestamptz - NOT NULL Default: now() updated_at
timestamptz - NOT NULL Default: now() #33 audit_events Domain: Audit &
Alerts • Role: Immutable Forensic Audit Trail \| • Stores: Actor ID,
action type, before/after JSON snapshots, audit metadata \| • Key Use:
Tamper-evident log of all financial and authorization mutations Column
Name Type Key Null Notes / Percentage Meaning id uuid PK NOT NULL
Default: gen_random_uuid() organization_id uuid FK -\> organizations NOT
NULL - project_id uuid FK -\> projects NULL - actor_user_id uuid FK -\>
users NULL - entity_type varchar(100) - NOT NULL - entity_id uuid - NOT
NULL - action varchar(150) - NOT NULL - previous_state jsonb - NULL -
new_state jsonb - NULL - metadata jsonb - NULL - created_at
timestamptz - NOT NULL GroundUp AI Construction Financial Control
Architecture Default: now() Page 17 of 23 GroundUp AI • Database
Architecture & ERD Specification Version: 2.0.0 Foreign Key
Relationships Matrix Source Column Target Entity Card. Kind Business
Description & Meaning users.organization_id organizations N:1 STRUCTURA
L Connects users.organization_id to parent organizations entity.
projects.organization_id organizations N:1 STRUCTURA L Connects
projects.organization_id to parent organizations entity.
projects.created_by_user_id users N:1 AUDIT Audits/references
created_by_user_id on projects to users. projects.owner_user_id users
N:1 STRUCTURA L Connects projects.owner_user_id to parent users entity.
projects.general_contractor_part parties y_id N:1 STRUCTURA L Connects
projects.general_contractor_party_id to parent parties entity.
projects.primary_lender_party_i d parties N:1 STRUCTURA L Connects
projects.primary_lender_party_id to parent parties entity.
parties.organization_id organizations N:1 STRUCTURA L Connects
parties.organization_id to parent organizations entity.
acquisitions.project_id projects N:1 STRUCTURA L Connects
acquisitions.project_id to parent projects entity.
acquisitions.source_document_i d documents N:1 SOURCE Attaches source
document proof from documents to acquisitions. loans.project_id projects
N:1 STRUCTURA L Connects loans.project_id to parent projects entity.
loans.lender_party_id parties N:1 STRUCTURA L Connects
loans.lender_party_id to parent parties entity. loans.source_document_id
documents N:1 SOURCE Attaches source document proof from documents to
loans. project_financial_plans.project_i d projects N:1 STRUCTURA L
Connects project_financial_plans.project_id to parent projects entity.
construction_contracts.project_i d projects N:1 STRUCTURA L Connects
construction_contracts.project_id to parent projects entity.
construction_contracts.gc_party \_id parties N:1 STRUCTURA L Connects
construction_contracts.gc_party_id to parent parties entity.
construction_contracts.source\_ document_id documents N:1 SOURCE
Attaches source document proof from documents to construction_contracts.
budgets.project_id projects N:1 STRUCTURA L Connects budgets.project_id
to parent projects entity. budgets.previous_budget_id budgets N:1
STRUCTURA L Connects budgets.previous_budget_id to parent budgets
entity. budgets.approved_by_user_id users N:1 AUDIT Audits/references
approved_by_user_id on budgets to users. budgets.source_document_id
documents N:1 SOURCE Attaches source document proof from documents to
budgets. budget_lines.budget_id budgets N:1 STRUCTURA L Connects
budget_lines.budget_id to parent budgets entity. budget_lines.project_id
projects N:1 STRUCTURA L Connects budget_lines.project_id to parent
projects entity. change_orders.project_id projects N:1 STRUCTURA L
Connects change_orders.project_id to parent projects entity.
change_orders.requested_by_us users er_id N:1 AUDIT Audits/references
requested_by_user_id on change_orders to users.
change_orders.approved_by_us er_id N:1 AUDIT Audits/references
approved_by_user_id on change_orders to users.
change_orders.source_documen documents t_id N:1 SOURCE Attaches source
document proof from documents to change_orders.
change_order_lines.change_ord er_id change_orders N:1 STRUCTURA L
Connects change_order_lines.change_order_id to parent change_orders
entity. change_order_lines.budget_line \_id budget_lines N:1 STRUCTURA L
Connects change_order_lines.budget_line_id to parent budget_lines
entity. contingency_movements.project \_id projects N:1 STRUCTURA L
Connects contingency_movements.project_id to parent projects entity.
contingency_movements.source budget_lines N:1 SOURCE users GroundUp AI
Construction Financial Control Architecture Attaches source document
proof from budget_lines to Page 18 of 23 GroundUp AI • Database
Architecture & ERD Specification Source Column Target Entity Version:
2.0.0 Card. Kind \_budget_line_id Business Description & Meaning
contingency_movements. contingency_movements.destina budget_lines
tion_budget_line_id N:1 STRUCTURA L contingency_movements.approv
ed_by_user_id users N:1 AUDIT project_milestones.project_id projects N:1
STRUCTURA L Connects project_milestones.project_id to parent projects
entity. project_milestones.budget_line\_ id budget_lines N:1 STRUCTURA L
Connects project_milestones.budget_line_id to parent budget_lines
entity. progress_records.project_id projects N:1 STRUCTURA L Connects
progress_records.project_id to parent projects entity.
progress_records.milestone_id project_milestones N:1 STRUCTURA L
Connects progress_records.milestone_id to parent project_milestones
entity. progress_records.reported_by_u users ser_id N:1 AUDIT
Audits/references reported_by_user_id on progress_records to users.
progress_records.verified_by_us users er_id N:1 AUDIT Audits/references
verified_by_user_id on progress_records to users.
progress_evidence.project_id projects N:1 STRUCTURA L Connects
progress_evidence.project_id to parent projects entity.
progress_evidence.milestone_id project_milestones N:1 STRUCTURA L
Connects progress_evidence.milestone_id to parent project_milestones
entity. progress_evidence.budget_line\_ id budget_lines N:1 STRUCTURA L
Connects progress_evidence.budget_line_id to parent budget_lines entity.
progress_evidence.progress_rec progress_records ord_id N:1 STRUCTURA L
Connects progress_evidence.progress_record_id to parent progress_records
entity. progress_evidence.document_id documents N:1 SOURCE Attaches
source document proof from documents to progress_evidence.
progress_evidence.uploaded_by \_user_id users N:1 AUDIT
Audits/references uploaded_by_user_id on progress_evidence to users.
progress_evidence.verified_by\_ user_id users N:1 AUDIT
Audits/references verified_by_user_id on progress_evidence to users.
inspections.project_id projects N:1 STRUCTURA L Connects
inspections.project_id to parent projects entity.
inspections.milestone_id project_milestones N:1 STRUCTURA L Connects
inspections.milestone_id to parent project_milestones entity.
inspections.source_document_i d documents N:1 SOURCE Attaches source
document proof from documents to inspections. permits.project_id
projects N:1 STRUCTURA L permits.source_document_id documents N:1 SOURCE
Attaches source document proof from documents to permits.
documents.organization_id organizations N:1 STRUCTURA L Connects
documents.organization_id to parent organizations entity.
documents.project_id projects N:1 STRUCTURA L Connects
documents.project_id to parent projects entity.
documents.uploaded_by_user_i d users N:1 AUDIT Audits/references
uploaded_by_user_id on documents to users. document_extractions.document
documents \_id N:1 SOURCE Attaches source document proof from documents
to document_extractions. document_extractions.verified_b users y_user_id
N:1 AUDIT Audits/references verified_by_user_id on document_extractions
to users. spend_records.project_id projects N:1 STRUCTURA L Connects
spend_records.project_id to parent projects entity.
spend_records.vendor_party_id parties N:1 STRUCTURA L Connects
spend_records.vendor_party_id to parent parties entity.
spend_records.budget_line_id budget_lines N:1 STRUCTURA L Connects
spend_records.budget_line_id to parent budget_lines entity.
spend_records.loan_id loans N:1 STRUCTURA L Connects
spend_records.loan_id to parent loans entity. GroundUp AI Construction
Financial Control Architecture Connects
contingency_movements.destination_budget_line_id to parent budget_lines
entity. Audits/references approved_by_user_id on contingency_movements
to users. Connects permits.project_id to parent projects entity. Page 19
of 23 GroundUp AI • Database Architecture & ERD Specification Source
Column Target Entity Version: 2.0.0 Card. Kind Business Description &
Meaning spend_records.source_documen documents t_id N:1 SOURCE
spend_records.financial_transac tion_id financial_transaction s N:1
STRUCTURA L Connects spend_records.financial_transaction_id to parent
financial_transactions entity. spend_records.verified_by_user \_id users
N:1 AUDIT Audits/references verified_by_user_id on spend_records to
users. financial_transactions.organizati on_id organizations N:1
STRUCTURA L Connects financial_transactions.organization_id to parent
organizations entity. financial_transactions.project_id projects N:1
STRUCTURA L Connects financial_transactions.project_id to parent
projects entity. financial_transactions.loan_id loans N:1 STRUCTURA L
Connects financial_transactions.loan_id to parent loans entity.
financial_transactions.source_d ocument_id documents N:1 SOURCE
reconciliation_matches.project_i d projects N:1 STRUCTURA L Connects
reconciliation_matches.project_id to parent projects entity.
reconciliation_matches.financial \_transaction_id financial_transaction
s N:1 STRUCTURA L Connects
reconciliation_matches.financial_transaction_id to parent
financial_transactions entity. reconciliation_matches.spend_r ecord_id
spend_records N:1 STRUCTURA L Connects
reconciliation_matches.spend_record_id to parent spend_records entity.
reconciliation_matches.resolved \_by_user_id users N:1 AUDIT
inter_project_transfers.organizat ion_id organizations N:1 STRUCTURA L
Connects inter_project_transfers.organization_id to parent organizations
entity. inter_project_transfers.from_pro ject_id projects N:1 STRUCTURA
L Connects inter_project_transfers.from_project_id to parent projects
entity. inter_project_transfers.to_projec projects t_id N:1 STRUCTURA L
Connects inter_project_transfers.to_project_id to parent projects
entity. inter_project_transfers.outbound financial_transaction
\_transaction_id s N:1 STRUCTURA L Connects
inter_project_transfers.outbound_transaction_id to parent
financial_transactions entity. inter_project_transfers.inbound\_
financial_transaction transaction_id s N:1 STRUCTURA L Connects
inter_project_transfers.inbound_transaction_id to parent
financial_transactions entity. draws.project_id projects N:1 STRUCTURA L
Connects draws.project_id to parent projects entity.
draws.parent_draw_id draws N:1 STRUCTURA L Connects draws.parent_draw_id
to parent draws entity. draws.owner_approved_by_user \_id users N:1
AUDIT Audits/references owner_approved_by_user_id on draws to users.
draws.submitted_by_user_id users N:1 AUDIT Audits/references
submitted_by_user_id on draws to users. draws.disbursement_transaction
financial_transaction \_id s N:1 STRUCTURA L draws.source_document_id
documents N:1 SOURCE draw_lines.draw_id draws N:1 STRUCTURA L Connects
draw_lines.draw_id to parent draws entity. draw_lines.budget_line_id
budget_lines N:1 STRUCTURA L Connects draw_lines.budget_line_id to
parent budget_lines entity. draw_lines.milestone_id project_milestones
N:1 STRUCTURA L Connects draw_lines.milestone_id to parent
project_milestones entity. draw_requirements.draw_id draws N:1 STRUCTURA
L Connects draw_requirements.draw_id to parent draws entity.
draw_requirements.document_id documents N:1 SOURCE Attaches source
document proof from documents to draw_requirements.
draw_requirements.inspection_i d inspections N:1 STRUCTURA L Connects
draw_requirements.inspection_id to parent inspections entity.
draw_requirements.permit_id permits N:1 STRUCTURA L Connects
draw_requirements.permit_id to parent permits entity.
project_investors.project_id projects N:1 STRUCTURA L Connects
project_investors.project_id to parent projects entity. GroundUp AI
Construction Financial Control Architecture Attaches source document
proof from documents to spend_records. Attaches source document proof
from documents to financial_transactions. Audits/references
resolved_by_user_id on reconciliation_matches to users. Connects
draws.disbursement_transaction_id to parent financial_transactions
entity. Attaches source document proof from documents to draws. Page 20
of 23 GroundUp AI • Database Architecture & ERD Specification Source
Column Target Entity project_investors.investor_party \_id parties
investor_contributions.project_i nvestor_id project_investors Version:
2.0.0 Kind Business Description & Meaning N:1 STRUCTURA L Connects
project_investors.investor_party_id to parent parties entity. N:1
STRUCTURA L Connects investor_contributions.project_investor_id to
parent project_investors entity. investor_contributions.financial\_
financial_transaction transaction_id s N:1 STRUCTURA L Connects
investor_contributions.financial_transaction_id to parent
financial_transactions entity. investor_contributions.source_d
ocument_id documents N:1 SOURCE investor_distributions.project_in
vestor_id project_investors N:1 STRUCTURA L Connects
investor_distributions.project_investor_id to parent project_investors
entity. investor_distributions.financial_t financial_transaction
ransaction_id s N:1 STRUCTURA L Connects
investor_distributions.financial_transaction_id to parent
financial_transactions entity. dispositions.project_id projects N:1
STRUCTURA L Connects dispositions.project_id to parent projects entity.
dispositions.source_document_i d documents N:1 SOURCE
alerts.organization_id organizations N:1 STRUCTURA L Connects
alerts.organization_id to parent organizations entity. alerts.project_id
projects N:1 STRUCTURA L Connects alerts.project_id to parent projects
entity. alerts.acknowledged_by_user_id users N:1 AUDIT Audits/references
acknowledged_by_user_id on alerts to users. alerts.resolved_by_user_id
users N:1 AUDIT Audits/references resolved_by_user_id on alerts to
users. audit_events.organization_id organizations N:1 STRUCTURA L
Connects audit_events.organization_id to parent organizations entity.
audit_events.project_id projects N:1 STRUCTURA L Connects
audit_events.project_id to parent projects entity.
audit_events.actor_user_id users N:1 AUDIT Audits/references
actor_user_id on audit_events to users. GroundUp AI Construction
Financial Control Architecture Card. Attaches source document proof from
documents to investor_contributions. Attaches source document proof from
documents to dispositions. Page 21 of 23 GroundUp AI • Database
Architecture & ERD Specification Version: 2.0.0 Enumerated Types
Dictionary Enum Name Count Allowed Values OrganizationStatus 3 values
ACTIVE, SUSPENDED, ARCHIVED UserRole 7 values OWNER, ADMIN, FINANCE,
PROJECT_MANAGER, ACCOUNTANT, INVESTOR, VIEWER UserStatus 4 values
INVITED, ACTIVE, SUSPENDED, DEACTIVATED ProjectStage 6 values
ACQUISITION, PRE_CONSTRUCTION, CONSTRUCTION, COMPLETION, DISPOSITION,
CLOSED ProjectStatus 5 values SETUP, ACTIVE, ON_HOLD, COMPLETED,
CANCELLED PartyType 2 values PERSON, ORGANIZATION LoanType 4 values
ACQUISITION, CONSTRUCTION, BRIDGE, OTHER InterestPaymentMethod 4 values
RESERVE, MONTHLY_OUT_OF_POCKET, CAPITALIZED, OTHER
ConstructionContractModel 6 values OPEN_BOOK, COST_PLUS, FIXED_PRICE,
MILESTONE_BASED, PROFIT_SHARE, HYBRID ContractStatus 4 values DRAFT,
ACTIVE, COMPLETED, TERMINATED BudgetStatus 5 values DRAFT,
PENDING_APPROVAL, APPROVED, SUPERSEDED, ARCHIVED ChangeOrderStatus 6
values DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED
ContingencyMovementStatus 5 values DRAFT, PENDING_APPROVAL, APPROVED,
REJECTED, CANCELLED DocumentSource 7 values UPLOAD, EMAIL, IMPORT, API,
MOBILE, PORTAL, SCAN DocumentStatus 6 values UPLOADED, PROCESSING,
PROCESSED, FAILED, NEEDS_REVIEW, VERIFIED DocumentType 16 values
PURCHASE_CLOSING, GC_CONTRACT, LOAN_DOCUMENT, BUDGET, CHANGE_ORDER,
INVOICE, BANK_STATEMENT, CHECK, CARD_TRANSACTION, DRAW_PACKAGE,
LIEN_WAIVER, INSPECTION_REPORT, PERMIT, PROGRESS_PHOTO, SALE_CLOSING,
OTHER ExtractionStatus 5 values PENDING, PROCESSING, COMPLETED, FAILED,
NEEDS_REVIEW VerificationStatus 4 values UNVERIFIED, PENDING_REVIEW,
VERIFIED, REJECTED MilestoneStatus 5 values NOT_STARTED, IN_PROGRESS,
COMPLETE, DELAYED, CANCELLED ProgressVerificationStatus 4 values
REPORTED, PENDING_REVIEW, VERIFIED, REJECTED ProgressEvidenceType 6
values PHOTO, INSPECTION, GC_CONFIRMATION, LENDER_INSPECTION,
APPRAISER_REPORT, OTHER InspectionResult 4 values PENDING, PASS, FAIL,
CONDITIONAL_PASS PermitStatus 7 values APPLIED, UNDER_REVIEW, APPROVED,
ISSUED, EXPIRED, REJECTED, REVOKED EvidenceStrength 6 values
VERIFIED_INVOICE, SIGNED_CONTRACT, BANK_TRANSACTION, CARD_TRANSACTION,
GC_CONFIRMATION, MANUAL_ENTRY PaymentStatus 4 values UNPAID,
PARTIALLY_PAID, PAID, VOID TransactionDirection 2 values INFLOW, OUTFLOW
FinancialTransactionStatus 6 values IMPORTED, PENDING_REVIEW, CLEARED,
REVERSED, FAILED, IGNORED FinancialTransactionType 8 values
EXPENSE_PAYMENT, LOAN_DISBURSEMENT, EQUITY_CONTRIBUTION,
INTEREST_PAYMENT, TRANSFER, FEE, SALE_PROCEEDS, OTHER
ReconciliationMatchStatus 5 values SUGGESTED, CONFIRMED,
MANUALLY_CONFIRMED, REJECTED, DUPLICATE InterProjectTransferType 4
values TEMPORARY_LOAN, CAPITAL_TRANSFER, REIMBURSEMENT, OTHER
InterProjectTransferStatus 4 values PENDING, PARTIALLY_REPAID, REPAID,
CANCELLED DrawStatus 10 values DRAFT, READY, SUBMITTED, IN_REVIEW,
APPROVED, PARTIALLY_APPROVED, REJECTED, REVISED, FUNDED, CANCELLED
DrawLineStatus 5 values PENDING, APPROVED, ADJUSTED, REJECTED, FUNDED
LenderDecisionType 4 values APPROVED, PARTIALLY_APPROVED, REJECTED,
MORE_INFO_REQUIRED GroundUp AI Construction Financial Control
Architecture Page 22 of 23 GroundUp AI • Database Architecture & ERD
Specification Enum Name Count Version: 2.0.0 Allowed Values
DrawRequirementType 8 values LIEN_WAIVER, INSPECTION_REPORT, PERMIT,
INVOICE_BACKUP, PHOTO_EVIDENCE, ARCHITECT_CERTIFICATE, TITLE_UPDATE,
OTHER DrawRequirementStatus 4 values PENDING, SATISFIED, WAIVED,
REJECTED ProjectInvestorStatus 2 values ACTIVE, INACTIVE
ContributionStatus 4 values EXPECTED, RECEIVED, VERIFIED, CANCELLED
DistributionStatus 3 values PLANNED, PAID, CANCELLED DispositionStatus 4
values PROJECTED, UNDER_CONTRACT, CLOSED, CANCELLED AlertType 10 values
BUDGET_OVERRUN, SCHEDULE_DELAY, FUNDING_GAP, DRAW_BLOCKER,
COMPLIANCE_MISSING, RECONCILIATION_EXCEPTION, CONTINGENCY_ALERT,
PROFIT_RISK, INTEREST_RESERVE_ALERT, GENERAL AlertSeverity 4 values
INFO, WARNING, ERROR, CRITICAL AlertStatus 4 values OPEN, ACKNOWLEDGED,
RESOLVED, DISMISSED GroundUp AI Construction Financial Control
Architecture Page 23 of 23 
