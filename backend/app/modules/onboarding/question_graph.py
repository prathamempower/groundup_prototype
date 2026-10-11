from typing import Any, Callable
from app.modules.onboarding.schemas import OnboardingQuestion, QuestionOption

# ==========================================
# QUESTION DEFINITIONS
# ==========================================

QUESTIONS_BY_KEY: dict[str, OnboardingQuestion] = {
    # ------------------------------------------
    # 1. OWNER QUESTIONS
    # ------------------------------------------
    "OWNER_PROPERTY_ACQUIRED": OnboardingQuestion(
        question_key="OWNER_PROPERTY_ACQUIRED",
        question_version="v1.0",
        prompt="Has the real estate property been formally acquired?",
        role_scope="OWNER",
        input_type="BOOLEAN",
        section="CAPITAL_LOANS",
        help_text="Indicate whether deed transfer/closing has completed or is pending closing.",
        unlocks="Acquisition loan configuration and site possession baseline.",
        options=[
            QuestionOption(value="true", label="Yes, property is acquired"),
            QuestionOption(value="false", label="No, acquisition pending / under contract"),
        ],
        is_high_risk=False,
    ),
    "OWNER_ACQUISITION_FUNDING": OnboardingQuestion(
        question_key="OWNER_ACQUISITION_FUNDING",
        question_version="v1.0",
        prompt="What is the primary funding source for property acquisition?",
        role_scope="OWNER",
        input_type="SELECT",
        section="CAPITAL_LOANS",
        help_text="Determines whether debt terms or equity capital calls need tracking.",
        unlocks="Acquisition debt schedule and interest baseline.",
        options=[
            QuestionOption(value="CASH_EQUITY", label="All-Cash Equity"),
            QuestionOption(value="ACQUISITION_LOAN", label="Acquisition / Bridge Loan"),
            QuestionOption(value="SELLER_FINANCING", label="Seller Financing"),
            QuestionOption(value="OTHER", label="Other (Specify funding structure)"),
        ],
        is_high_risk=True,
    ),
    "OWNER_TARGET_CLOSING_TIMELINE": OnboardingQuestion(
        question_key="OWNER_TARGET_CLOSING_TIMELINE",
        question_version="v1.0",
        prompt="What is the expected closing date or earnest money due diligence window?",
        role_scope="OWNER",
        input_type="TEXT",
        section="CAPITAL_LOANS",
        help_text="Provide target closing date (YYYY-MM-DD) or current inspection timeline.",
        unlocks="Acquisition milestone target on project calendar.",
        is_high_risk=False,
    ),
    "OWNER_ACQUISITION_LOAN_TERMS": OnboardingQuestion(
        question_key="OWNER_ACQUISITION_LOAN_TERMS",
        question_version="v1.0",
        prompt="Enter acquisition/bridge loan details (Lender Name, Principal Amount, Rate %):",
        role_scope="OWNER",
        input_type="TEXT",
        section="CAPITAL_LOANS",
        help_text="e.g. Genesis Capital, $2,500,000, 8.5% interest-only.",
        unlocks="Bridge loan tracking, interest accrual calculations, and payoff planning.",
        is_high_risk=True,
    ),
    "OWNER_CONSTRUCTION_LOAN_STATUS": OnboardingQuestion(
        question_key="OWNER_CONSTRUCTION_LOAN_STATUS",
        question_version="v1.0",
        prompt="Is there an active or planned construction loan for vertical development?",
        role_scope="OWNER",
        input_type="BOOLEAN",
        section="CAPITAL_LOANS",
        help_text="If yes, GroundUp activates lender draw packet generation and inspection tracking.",
        unlocks="Lender Draw Management and cleared cash deposit reconciliation.",
        options=[
            QuestionOption(value="true", label="Yes, construction loan in place / in underwriting"),
            QuestionOption(value="false", label="No, all-equity / self-funded construction"),
        ],
        is_high_risk=False,
    ),
    "OWNER_CONSTRUCTION_LENDER_POLICY": OnboardingQuestion(
        question_key="OWNER_CONSTRUCTION_LENDER_POLICY",
        question_version="v1.0",
        prompt="Specify construction lender details and interest reserve method:",
        role_scope="OWNER",
        input_type="SELECT",
        section="CAPITAL_LOANS",
        help_text="Lender interest reserve handles monthly debt service vs monthly cash payments.",
        unlocks="Draw inspection schedules and interest reserve depletion forecasting.",
        options=[
            QuestionOption(value="INTEREST_RESERVE", label="Interest Reserve funded inside loan commitment"),
            QuestionOption(value="MONTHLY_DIRECT_PAY", label="Monthly direct debt-service invoice / billed cash"),
            QuestionOption(value="CAPITALIZED", label="Capitalized interest added to principal balance"),
        ],
        is_high_risk=True,
    ),
    "OWNER_EQUITY_STRUCTURE": OnboardingQuestion(
        question_key="OWNER_EQUITY_STRUCTURE",
        question_version="v1.0",
        prompt="What is the project equity capital structure?",
        role_scope="OWNER",
        input_type="SELECT",
        section="CAPITAL_LOANS",
        help_text="Identifies if external LP investors will receive periodic updates and capital accounting.",
        unlocks="Investor portal, capital contribution tracking, and reporting.",
        options=[
            QuestionOption(value="LP_INVESTORS", label="Syndicated / LP Equity Investors + GP Sponsor"),
            QuestionOption(value="OWNER_ONLY", label="100% Sponsor / Internal Developer Equity"),
            QuestionOption(value="JOINT_VENTURE", label="50/50 Institutional Joint Venture"),
            QuestionOption(value="OTHER", label="Other (Specify equity structure)"),
        ],
        is_high_risk=False,
    ),
    "OWNER_INVESTOR_WATERFALL_KNOWN": OnboardingQuestion(
        question_key="OWNER_INVESTOR_WATERFALL_KNOWN",
        question_version="v1.0",
        prompt="Are investor hurdle rates, preferred return, and distribution waterfalls finalized?",
        role_scope="OWNER",
        input_type="BOOLEAN",
        section="CAPITAL_LOANS",
        help_text="If finalized, distribution calculations can be prepared; if not, an LP policy task is assigned.",
        unlocks="Pro-forma waterfall distribution model.",
        options=[
            QuestionOption(value="true", label="Yes, operating agreement waterfall terms are set"),
            QuestionOption(value="false", label="No, terms pending final operating agreement"),
        ],
        is_high_risk=False,
    ),
    "OWNER_CONTRACT_MODEL": OnboardingQuestion(
        question_key="OWNER_CONTRACT_MODEL",
        question_version="v1.0",
        prompt="Which construction contract model governs the general contractor agreement?",
        role_scope="OWNER",
        input_type="SELECT",
        section="GOVERNANCE_CONTRACT",
        help_text="Determines required billing evidence, retainage rules, and change order workflows.",
        unlocks="GC submission requirements and budget contract matching.",
        options=[
            QuestionOption(value="GMP", label="Guaranteed Maximum Price (GMP)"),
            QuestionOption(value="COST_PLUS", label="Cost-Plus with Capped Fee"),
            QuestionOption(value="FIXED_PRICE", label="Lump Sum / Fixed Price"),
            QuestionOption(value="MILESTONE_BASED", label="Milestone / Staged Payments"),
            QuestionOption(value="HYBRID", label="Hybrid (Separate Fixed and Open-Book scopes)"),
        ],
        is_high_risk=True,
    ),
    "OWNER_COST_PLUS_RULES": OnboardingQuestion(
        question_key="OWNER_COST_PLUS_RULES",
        question_version="v1.0",
        prompt="Specify GC markup percentage and invoice verification threshold:",
        role_scope="OWNER",
        input_type="TEXT",
        section="GOVERNANCE_CONTRACT",
        help_text="e.g. 10% GC fee, trade backup required on all line items over $1,000.",
        unlocks="Automated GC bill validation and markup calculation rules.",
        is_high_risk=True,
    ),
    "OWNER_RETAINAGE_POLICY": OnboardingQuestion(
        question_key="OWNER_RETAINAGE_POLICY",
        question_version="v1.0",
        prompt="What retainage percentage is withheld from monthly progress billing?",
        role_scope="OWNER",
        input_type="SELECT",
        section="GOVERNANCE_CONTRACT",
        help_text="Retainage is withheld until substantial completion or release milestones.",
        unlocks="Retainage escrow ledger and draw calculation formulas.",
        options=[
            QuestionOption(value="10_PERCENT", label="10% Standard Retainage"),
            QuestionOption(value="5_PERCENT", label="5% Reduced Retainage"),
            QuestionOption(value="TIERED_10_TO_5", label="10% until 50% complete, then 5%"),
            QuestionOption(value="ZERO_RETAINAGE", label="0% No retainage withheld"),
        ],
        is_high_risk=True,
    ),
    "OWNER_HYBRID_SCOPE_SPLIT": OnboardingQuestion(
        question_key="OWNER_HYBRID_SCOPE_SPLIT",
        question_version="v1.0",
        prompt="Define scopes governed by Fixed Price vs Cost-Plus:",
        role_scope="OWNER",
        input_type="TEXT",
        section="GOVERNANCE_CONTRACT",
        help_text="e.g. Sitework & Foundation: Cost-Plus; Framing & Finishes: Fixed Lump Sum.",
        unlocks="Dual-schedule budget allocation and compliance validation.",
        is_high_risk=True,
    ),
    "OWNER_MILESTONE_DISBURSEMENT_TERMS": OnboardingQuestion(
        question_key="OWNER_MILESTONE_DISBURSEMENT_TERMS",
        question_version="v1.0",
        prompt="Who holds sign-off authority to release milestone lump sum disbursements?",
        role_scope="OWNER",
        input_type="SELECT",
        section="GOVERNANCE_CONTRACT",
        help_text="Field verification sign-off rule before funds can be scheduled.",
        unlocks="Milestone payment release approval gate.",
        options=[
            QuestionOption(value="OWNER_ONLY", label="Owner / Developer Sign-Off Only"),
            QuestionOption(value="ARCHITECT_AND_OWNER", label="Third-Party Architect + Owner Certification"),
            QuestionOption(value="PM_AND_OWNER", label="Project Manager Verification + Owner Approval"),
        ],
        is_high_risk=False,
    ),
    "OWNER_OPERATING_ACCOUNT_MODEL": OnboardingQuestion(
        question_key="OWNER_OPERATING_ACCOUNT_MODEL",
        question_version="v1.0",
        prompt="What financial operating account model will be used for construction disbursements?",
        role_scope="OWNER",
        input_type="SELECT",
        section="OPERATING_ACCOUNTS",
        help_text="Dedicated project accounts eliminate commingling risk. Shared accounts require strict transfer policy.",
        unlocks="Bank reconciliation workbench and cash verification gate.",
        options=[
            QuestionOption(value="DEDICATED", label="Dedicated Project Bank Account (Single Entity LLC)"),
            QuestionOption(value="SHARED", label="Shared / Commingled Master Account across multiple entities"),
        ],
        is_high_risk=True,
    ),
    "OWNER_COMMINGLED_ALLOCATION_POLICY": OnboardingQuestion(
        question_key="OWNER_COMMINGLED_ALLOCATION_POLICY",
        question_version="v1.0",
        prompt="Specify allocation policy and transfer controls for commingled bank account:",
        role_scope="OWNER",
        input_type="TEXT",
        section="OPERATING_ACCOUNTS",
        help_text="Detail how inter-company transfers and shared vendor payments will be reconciled.",
        unlocks="Inter-project transfer tracking in Reconciliation Workbench.",
        is_high_risk=True,
        blocking_gate="VERIFIED_DASHBOARD",
    ),

    # ------------------------------------------
    # 2. CFO / ACCOUNTING QUESTIONS
    # ------------------------------------------
    "CFO_OPERATING_ACCOUNT": OnboardingQuestion(
        question_key="CFO_OPERATING_ACCOUNT",
        question_version="v1.0",
        prompt="Does this project utilize a dedicated bank operating account?",
        role_scope="CFO",
        input_type="BOOLEAN",
        section="OPERATING_ACCOUNTS",
        help_text="Determines if transactions are 1:1 or require inter-project allocation rules.",
        unlocks="Opening balance reconciliation and statement schedule.",
        options=[
            QuestionOption(value="true", label="Yes, dedicated account for this entity only"),
            QuestionOption(value="false", label="No, commingled / shared master account"),
        ],
        is_high_risk=True,
    ),
    "CFO_BANK_ACCOUNT_DETAILS": OnboardingQuestion(
        question_key="CFO_BANK_ACCOUNT_DETAILS",
        question_version="v1.0",
        prompt="Enter primary banking institution and account identifier (Last 4 Digits):",
        role_scope="CFO",
        input_type="TEXT",
        section="OPERATING_ACCOUNTS",
        help_text="e.g. JPMorgan Chase ending in 4091. Never input full account numbers or passwords.",
        unlocks="Statement import template and transaction linking.",
        is_high_risk=False,
    ),
    "CFO_SHARED_ACCOUNT_ALLOCATION": OnboardingQuestion(
        question_key="CFO_SHARED_ACCOUNT_ALLOCATION",
        question_version="v1.0",
        prompt="Describe the allocation methodology and responsible officer for inter-project transfers:",
        role_scope="CFO",
        input_type="TEXT",
        section="OPERATING_ACCOUNTS",
        help_text="Explain how shared card charges or wires will be partitioned without commingling audit errors.",
        unlocks="Reconciliation multi-project split tool.",
        is_high_risk=True,
        blocking_gate="VERIFIED_DASHBOARD",
    ),
    "CFO_PAYMENT_CHANNELS": OnboardingQuestion(
        question_key="CFO_PAYMENT_CHANNELS",
        question_version="v1.0",
        prompt="Which payment channels are permitted for field and project expenses?",
        role_scope="CFO",
        input_type="SELECT",
        section="OPERATING_ACCOUNTS",
        help_text="If corporate credit cards or reimbursements are active, expense receipt upload policies are enforced.",
        unlocks="Expense categorization rules and card statement import.",
        options=[
            QuestionOption(value="ACH_WIRE_ONLY", label="Direct ACH / Wire Transfers Only (No Cards/Cash)"),
            QuestionOption(value="CARDS_AND_WIRE", label="Corporate Credit Cards + ACH / Wires"),
            QuestionOption(value="ALL_CHANNELS", label="Cards, Wires, Petty Cash, and Personal Reimbursements"),
        ],
        is_high_risk=False,
    ),
    "CFO_RECEIPT_POLICY": OnboardingQuestion(
        question_key="CFO_RECEIPT_POLICY",
        question_version="v1.0",
        prompt="What is the mandatory receipt threshold and missing-receipt escalation policy?",
        role_scope="CFO",
        input_type="TEXT",
        section="OPERATING_ACCOUNTS",
        help_text="e.g. Receipts mandatory for all charges > $75; missing receipts require Owner exception sign-off.",
        unlocks="Automated receipt compliance flags in Spend module.",
        is_high_risk=False,
    ),
    "CFO_BUDGET_BASELINE_SOURCE": OnboardingQuestion(
        question_key="CFO_BUDGET_BASELINE_SOURCE",
        question_version="v1.0",
        prompt="What is the source and format for establishing the initial budget baseline?",
        role_scope="CFO",
        input_type="SELECT",
        section="OPERATING_ACCOUNTS",
        help_text="Establishes original budget lock; baselines are immutable once approved by Owner.",
        unlocks="Budget import wizard and variance tracking.",
        options=[
            QuestionOption(value="EXCEL_CSV", label="Detailed Excel / CSV Pro-Forma Schedule"),
            QuestionOption(value="AIA_SOV", label="Executed GC Schedule of Values (AIA G703)"),
            QuestionOption(value="QUICKBOOKS", label="QuickBooks / Accounting System Export"),
            QuestionOption(value="OTHER", label="Other (Specify accounting software / format)"),
        ],
        is_high_risk=False,
    ),
    "CFO_BUDGET_MAPPING_STATUS": OnboardingQuestion(
        question_key="CFO_BUDGET_MAPPING_STATUS",
        question_version="v1.0",
        prompt="Has the budget baseline been mapped to CSI / standard cost codes?",
        role_scope="CFO",
        input_type="BOOLEAN",
        section="OPERATING_ACCOUNTS",
        help_text="If not mapped, a task is created to map cost items before the budget is locked.",
        unlocks="Automated invoice-to-budget line matching.",
        options=[
            QuestionOption(value="true", label="Yes, standard CSI / division cost codes are assigned"),
            QuestionOption(value="false", label="No, custom categories need mapping"),
        ],
        is_high_risk=False,
    ),
    "CFO_SOV_CONTINGENCY_POLICY": OnboardingQuestion(
        question_key="CFO_SOV_CONTINGENCY_POLICY",
        question_version="v1.0",
        prompt="Specify Owner hard-cost and soft-cost contingency allocation policy:",
        role_scope="CFO",
        input_type="TEXT",
        section="OPERATING_ACCOUNTS",
        help_text="e.g. 5% hard cost contingency; transfers require Owner written authorization.",
        unlocks="Contingency draw authorization rules.",
        is_high_risk=True,
    ),
    "CFO_DRAW_RECONCILIATION_OWNER": OnboardingQuestion(
        question_key="CFO_DRAW_RECONCILIATION_OWNER",
        question_version="v1.0",
        prompt="Who reconciles cleared lender wire deposits against requested draw disbursements?",
        role_scope="CFO",
        input_type="SELECT",
        section="OPERATING_ACCOUNTS",
        help_text="Ensures cleared cash—not loan approval—is the single funding truth.",
        unlocks="Cleared cash matching and draw closing workflow.",
        options=[
            QuestionOption(value="CFO", label="CFO / Lead Controller"),
            QuestionOption(value="OWNER", label="Owner / Managing Principal"),
            QuestionOption(value="BOOKKEEPER", label="Staff Accountant / Bookkeeper"),
        ],
        is_high_risk=False,
    ),
    "CFO_STATEMENT_FREQUENCY": OnboardingQuestion(
        question_key="CFO_STATEMENT_FREQUENCY",
        question_version="v1.0",
        prompt="What is the reconciliation statement frequency and monthly close cutoff date?",
        role_scope="CFO",
        input_type="SELECT",
        section="OPERATING_ACCOUNTS",
        help_text="Defines accounting period boundaries and sign-off deadlines.",
        unlocks="Period Close Workbench and statement audit trail.",
        options=[
            QuestionOption(value="MONTHLY", label="Monthly (Calendar Month Close by 10th)"),
            QuestionOption(value="QUARTERLY", label="Quarterly Close with Interim Monthly Reviews"),
        ],
        is_high_risk=False,
    ),

    # ------------------------------------------
    # 3. PM (PROJECT MANAGER) QUESTIONS
    # ------------------------------------------
    "PM_SCHEDULE_SOURCE": OnboardingQuestion(
        question_key="PM_SCHEDULE_SOURCE",
        question_version="v1.0",
        prompt="What is the primary source for project schedule and milestone planning?",
        role_scope="PM",
        input_type="SELECT",
        section="MILESTONES_PERMITS",
        help_text="Select where master milestone commitments and critical path originate.",
        unlocks="Timeline baseline and forecast carry-cost modeling.",
        options=[
            QuestionOption(value="GC_SCHEDULE", label="General Contractor Master CPM Schedule (Primavera / MS Project)"),
            QuestionOption(value="INTERNAL_PM", label="Internal Owner/PM Milestone Schedule"),
            QuestionOption(value="ARCHITECT_TIMELINE", label="Architect / Construction Admin Phasing Plan"),
            QuestionOption(value="OTHER", label="Other (Specify schedule origin / format)"),
        ],
        is_high_risk=False,
    ),
    "PM_GC_SCHEDULE_STATUS": OnboardingQuestion(
        question_key="PM_GC_SCHEDULE_STATUS",
        question_version="v1.0",
        prompt="Has the General Contractor submitted an approved baseline Gantt / CPM schedule?",
        role_scope="PM",
        input_type="BOOLEAN",
        section="MILESTONES_PERMITS",
        help_text="If pending, GroundUp assigns an intake task rather than fabricating milestone dates.",
        unlocks="Timeline Gantt import and milestone dependency linking.",
        options=[
            QuestionOption(value="true", label="Yes, signed baseline schedule is available"),
            QuestionOption(value="false", label="No, schedule draft is pending GC submission"),
        ],
        is_high_risk=False,
    ),
    "PM_MILESTONE_CREATION_METHOD": OnboardingQuestion(
        question_key="PM_MILESTONE_CREATION_METHOD",
        question_version="v1.0",
        prompt="How will the internal PM milestone schedule be entered?",
        role_scope="PM",
        input_type="SELECT",
        section="MILESTONES_PERMITS",
        help_text="Choose between uploading a schedule export or building directly in Timeline.",
        unlocks="Timeline Builder and milestone progress tracking.",
        options=[
            QuestionOption(value="CSV_IMPORT", label="Import MS Project / Primavera XML / CSV"),
            QuestionOption(value="MANUAL_BUILD", label="Build milestones directly in GroundUp Timeline"),
        ],
        is_high_risk=False,
    ),
    "PM_SCHEDULE_TASK_CREATION": OnboardingQuestion(
        question_key="PM_SCHEDULE_TASK_CREATION",
        question_version="v1.0",
        prompt="Set a target deadline to establish and lock the initial milestone baseline:",
        role_scope="PM",
        input_type="TEXT",
        section="MILESTONES_PERMITS",
        help_text="e.g. 14 days post-onboarding. Creates an accountable follow-up milestone task.",
        unlocks="Milestone baseline commitment task in Alert Center.",
        is_high_risk=False,
    ),
    "PM_PERMIT_STATUS": OnboardingQuestion(
        question_key="PM_PERMIT_STATUS",
        question_version="v1.0",
        prompt="What is the current municipal building and site permit status?",
        role_scope="PM",
        input_type="SELECT",
        section="MILESTONES_PERMITS",
        help_text="Unissued permits represent critical-path delivery risk.",
        unlocks="Permit tracking checklist and inspection gate.",
        options=[
            QuestionOption(value="ISSUED", label="Full Building Permit Issued & Active"),
            QuestionOption(value="IN_REVIEW", label="Permit Applications Under Municipal Review"),
            QuestionOption(value="PHASED", label="Foundation / Demolition Permit Issued; Full Shell Pending"),
        ],
        is_high_risk=False,
    ),
    "PM_PERMIT_AUTHORITY_TRACKING": OnboardingQuestion(
        question_key="PM_PERMIT_AUTHORITY_TRACKING",
        question_version="v1.0",
        prompt="Enter Municipality / Building Dept name, permit application #, and target issuance date:",
        role_scope="PM",
        input_type="TEXT",
        section="MILESTONES_PERMITS",
        help_text="e.g. City of Austin Development Services, Permit #2026-08192, Target: 2026-11-15.",
        unlocks="Permit inspection alert triggers.",
        is_high_risk=False,
    ),
    "PM_FIELD_VERIFICATION_WORKFLOW": OnboardingQuestion(
        question_key="PM_FIELD_VERIFICATION_WORKFLOW",
        question_version="v1.0",
        prompt="Who conducts physical site verification before monthly draw progress is certified?",
        role_scope="PM",
        input_type="SELECT",
        section="MILESTONES_PERMITS",
        help_text="Draw requests require verified completion percentages before submission to lender.",
        unlocks="Draw inspection sign-off and verification checklist.",
        options=[
            QuestionOption(value="INTERNAL_PM", label="Internal Project Manager Site Inspection"),
            QuestionOption(value="LENDER_INSPECTOR", label="Bank / Third-Party Inspection Consultant"),
            QuestionOption(value="ARCHITECT", label="Supervising Architect / Engineer"),
        ],
        is_high_risk=False,
    ),
    "PM_EVIDENCE_PHOTO_CADENCE": OnboardingQuestion(
        question_key="PM_EVIDENCE_PHOTO_CADENCE",
        question_version="v1.0",
        prompt="What is the required job site progress photo capture frequency?",
        role_scope="PM",
        input_type="SELECT",
        section="MILESTONES_PERMITS",
        help_text="Progress photos back up percent-complete assertions and defend against draw audit pushback.",
        unlocks="Mobile photo upload requirements and evidence stream.",
        options=[
            QuestionOption(value="WEEKLY", label="Weekly Trade & Milestone Progress Photos"),
            QuestionOption(value="MONTHLY_DRAW", label="Monthly Draw Inspection Package Photos Only"),
            QuestionOption(value="DAILY_LOG", label="Daily Field Superintendent Logs & Photos"),
        ],
        is_high_risk=False,
    ),
    "PM_DELAY_TAXONOMY": OnboardingQuestion(
        question_key="PM_DELAY_TAXONOMY",
        question_version="v1.0",
        prompt="Acknowledge delay taxonomy: Forecast completion moves require recorded causes & carry impact:",
        role_scope="PM",
        input_type="SELECT",
        section="MILESTONES_PERMITS",
        help_text="GroundUp strictly enforces that forecast moves do not silently overwrite initial baselines.",
        unlocks="Schedule change audit log and carry cost impact calculations.",
        options=[
            QuestionOption(value="ACKNOWLEDGED", label="Acknowledge: Reasons required for all forecast moves"),
        ],
        is_high_risk=False,
    ),

    # ------------------------------------------
    # 4. GC (GENERAL CONTRACTOR) QUESTIONS
    # ------------------------------------------
    "GC_CONTRACT_CONFIRMATION": OnboardingQuestion(
        question_key="GC_CONTRACT_CONFIRMATION",
        question_version="v1.0",
        prompt="Confirm assigned project scope and executed General Contractor agreement status:",
        role_scope="GC",
        input_type="SELECT",
        section="SUBMISSIONS",
        help_text="Any contract value or scope discrepancy will notify the Owner without editing baselines.",
        unlocks="My Submissions portal for monthly pay applications.",
        options=[
            QuestionOption(value="CONFIRMED_MATCH", label="Confirmed: Scope & Contract Model match executed agreement"),
            QuestionOption(value="DISCREPANCY_FLAG", label="Discrepancy noted: Needs clarification with Developer"),
        ],
        is_high_risk=False,
    ),
    "GC_PAYMENT_APPLICATION_FORMAT": OnboardingQuestion(
        question_key="GC_PAYMENT_APPLICATION_FORMAT",
        question_version="v1.0",
        prompt="Which standard format will be submitted for monthly payment applications?",
        role_scope="GC",
        input_type="SELECT",
        section="SUBMISSIONS",
        help_text="Standardized pay app format ensures automated OCR and line matching.",
        unlocks="Document upload parser for monthly billing cycles.",
        options=[
            QuestionOption(
                value="AIA_G702_G703",
                label="AIA Document G702 / G703 Application and Certificate for Payment",
            ),
            QuestionOption(value="CUSTOM_SOV", label="Itemized Schedule of Values Spreadsheet"),
            QuestionOption(value="OTHER", label="Other (Specify billing software / format)"),
        ],
        is_high_risk=False,
    ),
    "GC_COST_EVIDENCE_METHOD": OnboardingQuestion(
        question_key="GC_COST_EVIDENCE_METHOD",
        question_version="v1.0",
        prompt="Confirm trade backup documentation requirements for open-book billing:",
        role_scope="GC",
        input_type="SELECT",
        section="SUBMISSIONS",
        help_text="Open-book billing requires attached subcontractor invoices, material receipts, and labor logs.",
        unlocks="Direct cost invoice submission checklist.",
        options=[
            QuestionOption(value="DETAILED_BACKUP", label="Subcontractor invoices, material tickets, and payroll backup attached"),
            QuestionOption(value="SUMMARY_INVOICE", label="Summary GC master invoice with trade breakdown only"),
        ],
        is_high_risk=False,
    ),
    "GC_BILLING_CUTOFF_DAY": OnboardingQuestion(
        question_key="GC_BILLING_CUTOFF_DAY",
        question_version="v1.0",
        prompt="What is the monthly pay application submission deadline day?",
        role_scope="GC",
        input_type="SELECT",
        section="SUBMISSIONS",
        help_text="e.g. 25th of the month for work completed through the end of the month.",
        unlocks="Automated billing cycle reminder and submission window.",
        options=[
            QuestionOption(value="20TH", label="20th of the month"),
            QuestionOption(value="25TH", label="25th of the month"),
            QuestionOption(value="LAST_DAY", label="Last calendar day of the month"),
        ],
        is_high_risk=False,
    ),
    "GC_LIEN_WAIVER_POLICY": OnboardingQuestion(
        question_key="GC_LIEN_WAIVER_POLICY",
        question_version="v1.0",
        prompt="Acknowledge lien waiver policy: Conditional waiver required with application, Unconditional from prior cycle:",
        role_scope="GC",
        input_type="SELECT",
        section="SUBMISSIONS",
        help_text="Payment cannot be disbursed without active lien waiver compliance.",
        unlocks="Lien waiver validation badge in draw packets.",
        options=[
            QuestionOption(value="AGREED", label="Agreed: Conditional with bill, Unconditional upon payment receipt"),
        ],
        is_high_risk=False,
    ),
    "GC_CHANGE_ORDER_NOTICE": OnboardingQuestion(
        question_key="GC_CHANGE_ORDER_NOTICE",
        question_version="v1.0",
        prompt="What is the contractual advance notice window for submitting potential change orders (PCOs)?",
        role_scope="GC",
        input_type="SELECT",
        section="SUBMISSIONS",
        help_text="Defines the days within discovering a scope change to submit a formal request.",
        unlocks="Change order intake window and notifications.",
        options=[
            QuestionOption(value="5_DAYS", label="Within 5 calendar days of event / discovery"),
            QuestionOption(value="10_DAYS", label="Within 10 calendar days of event / discovery"),
            QuestionOption(value="14_DAYS", label="Within 14 calendar days of event / discovery"),
        ],
        is_high_risk=False,
    ),

    # ------------------------------------------
    # 5. INVESTOR QUESTIONS
    # ------------------------------------------
    "INVESTOR_READ_ONLY_ACK": OnboardingQuestion(
        question_key="INVESTOR_READ_ONLY_ACK",
        question_version="v1.0",
        prompt="Acknowledge read-only visibility to published reports and milestone snapshots:",
        role_scope="INVESTOR",
        input_type="SELECT",
        section="INVESTOR_PREFERENCES",
        help_text="Investors have read-only access to Owner-approved and published reports.",
        unlocks="Investor Project Update Portal.",
        options=[
            QuestionOption(value="ACKNOWLEDGED", label="Understood: Access is read-only for published updates"),
        ],
        is_high_risk=False,
    ),
    "INVESTOR_REPORTING_PREFERENCE": OnboardingQuestion(
        question_key="INVESTOR_REPORTING_PREFERENCE",
        question_version="v1.0",
        prompt="Preferred delivery format for published investor milestone updates?",
        role_scope="INVESTOR",
        input_type="SELECT",
        section="INVESTOR_PREFERENCES",
        help_text="Choose how you wish to receive periodic development updates.",
        unlocks="Investor notification routing and dispatch engine.",
        options=[
            QuestionOption(value="DIGITAL_PORTAL", label="Online Investor Portal Only"),
            QuestionOption(value="EMAIL_SUMMARY", label="Email Digest & Attached PDF Summary"),
            QuestionOption(value="BOTH", label="Both (Portal Access + Direct Email Alerts)"),
        ],
        is_high_risk=False,
    ),
    "INVESTOR_DIGEST_FREQUENCY": OnboardingQuestion(
        question_key="INVESTOR_DIGEST_FREQUENCY",
        question_version="v1.0",
        prompt="Preferred frequency for receiving published progress digests:",
        role_scope="INVESTOR",
        input_type="SELECT",
        section="INVESTOR_PREFERENCES",
        help_text="Owner will publish updates on this cadence.",
        unlocks="Digest subscription profile.",
        options=[
            QuestionOption(value="MONTHLY", label="Monthly Development & Financial Summary"),
            QuestionOption(value="QUARTERLY", label="Quarterly Comprehensive Report"),
            QuestionOption(value="MILESTONES_ONLY", label="Major Milestones Only (Foundation, Framing, CO)"),
        ],
        is_high_risk=False,
    ),
    "INVESTOR_TAX_K1_RECIPIENT": OnboardingQuestion(
        question_key="INVESTOR_TAX_K1_RECIPIENT",
        question_version="v1.0",
        prompt="Provide primary entity or accounting contact email for annual tax / K-1 distribution:",
        role_scope="INVESTOR",
        input_type="TEXT",
        section="INVESTOR_PREFERENCES",
        help_text="e.g. accounting@investorcapital.com. Used only for tax document routing by Sponsor.",
        unlocks="Year-end tax communication contact.",
        is_high_risk=False,
    ),
}

# ==========================================
# DYNAMIC DECISION GRAPH ENGINE
# ==========================================

def _get_answer_val(answers_map: dict[str, dict[str, Any]], key: str) -> str | None:
    ans = answers_map.get(key)
    if not ans:
        return None
    val = ans.get("value")
    if val is not None:
        return str(val)
    special = ans.get("special")
    if special is not None:
        return str(special)
    return None

def get_next_question_for_role(
    role: str,
    answered_keys: set[str],
    answers_map: dict[str, dict[str, Any]] | None = None,
) -> OnboardingQuestion | None:
    """
    Evaluates the server-side dynamic decision graph based on the user's role
    and previous answers, returning the next permitted question or None if complete.
    """
    answers = answers_map or {}
    r = role.upper()

    if r == "OWNER":
        # 1. Has property been acquired?
        if "OWNER_PROPERTY_ACQUIRED" not in answered_keys:
            return QUESTIONS_BY_KEY["OWNER_PROPERTY_ACQUIRED"]
        
        acquired = _get_answer_val(answers, "OWNER_PROPERTY_ACQUIRED")
        if acquired in ["true", "True", "YES"]:
            if "OWNER_ACQUISITION_FUNDING" not in answered_keys:
                return QUESTIONS_BY_KEY["OWNER_ACQUISITION_FUNDING"]
            funding = _get_answer_val(answers, "OWNER_ACQUISITION_FUNDING")
            if funding in ["ACQUISITION_LOAN", "SELLER_FINANCING"]:
                if "OWNER_ACQUISITION_LOAN_TERMS" not in answered_keys:
                    return QUESTIONS_BY_KEY["OWNER_ACQUISITION_LOAN_TERMS"]
        else:
            if "OWNER_TARGET_CLOSING_TIMELINE" not in answered_keys:
                return QUESTIONS_BY_KEY["OWNER_TARGET_CLOSING_TIMELINE"]

        # 2. Construction Loan
        if "OWNER_CONSTRUCTION_LOAN_STATUS" not in answered_keys:
            return QUESTIONS_BY_KEY["OWNER_CONSTRUCTION_LOAN_STATUS"]
        c_loan = _get_answer_val(answers, "OWNER_CONSTRUCTION_LOAN_STATUS")
        if c_loan in ["true", "True", "YES"]:
            if "OWNER_CONSTRUCTION_LENDER_POLICY" not in answered_keys:
                return QUESTIONS_BY_KEY["OWNER_CONSTRUCTION_LENDER_POLICY"]

        # 3. Equity Structure
        if "OWNER_EQUITY_STRUCTURE" not in answered_keys:
            return QUESTIONS_BY_KEY["OWNER_EQUITY_STRUCTURE"]
        equity = _get_answer_val(answers, "OWNER_EQUITY_STRUCTURE")
        if equity in ["LP_INVESTORS", "JOINT_VENTURE"]:
            if "OWNER_INVESTOR_WATERFALL_KNOWN" not in answered_keys:
                return QUESTIONS_BY_KEY["OWNER_INVESTOR_WATERFALL_KNOWN"]

        # 4. GC Contract Model
        if "OWNER_CONTRACT_MODEL" not in answered_keys:
            return QUESTIONS_BY_KEY["OWNER_CONTRACT_MODEL"]
        contract = _get_answer_val(answers, "OWNER_CONTRACT_MODEL")
        if contract in ["COST_PLUS", "OPEN_BOOK"]:
            if "OWNER_COST_PLUS_RULES" not in answered_keys:
                return QUESTIONS_BY_KEY["OWNER_COST_PLUS_RULES"]
        elif contract in ["GMP", "FIXED_PRICE"]:
            if "OWNER_RETAINAGE_POLICY" not in answered_keys:
                return QUESTIONS_BY_KEY["OWNER_RETAINAGE_POLICY"]
        elif contract == "HYBRID":
            if "OWNER_HYBRID_SCOPE_SPLIT" not in answered_keys:
                return QUESTIONS_BY_KEY["OWNER_HYBRID_SCOPE_SPLIT"]
        elif contract == "MILESTONE_BASED":
            if "OWNER_MILESTONE_DISBURSEMENT_TERMS" not in answered_keys:
                return QUESTIONS_BY_KEY["OWNER_MILESTONE_DISBURSEMENT_TERMS"]

        # 5. Operating Account Model
        if "OWNER_OPERATING_ACCOUNT_MODEL" not in answered_keys:
            return QUESTIONS_BY_KEY["OWNER_OPERATING_ACCOUNT_MODEL"]
        acct = _get_answer_val(answers, "OWNER_OPERATING_ACCOUNT_MODEL")
        if acct == "SHARED":
            if "OWNER_COMMINGLED_ALLOCATION_POLICY" not in answered_keys:
                return QUESTIONS_BY_KEY["OWNER_COMMINGLED_ALLOCATION_POLICY"]

        return None

    elif r == "CFO":
        # 1. Operating Account
        if "CFO_OPERATING_ACCOUNT" not in answered_keys:
            return QUESTIONS_BY_KEY["CFO_OPERATING_ACCOUNT"]
        acct = _get_answer_val(answers, "CFO_OPERATING_ACCOUNT")
        if acct in ["true", "True", "YES"]:
            if "CFO_BANK_ACCOUNT_DETAILS" not in answered_keys:
                return QUESTIONS_BY_KEY["CFO_BANK_ACCOUNT_DETAILS"]
        else:
            if "CFO_SHARED_ACCOUNT_ALLOCATION" not in answered_keys:
                return QUESTIONS_BY_KEY["CFO_SHARED_ACCOUNT_ALLOCATION"]

        # 2. Payment Channels
        if "CFO_PAYMENT_CHANNELS" not in answered_keys:
            return QUESTIONS_BY_KEY["CFO_PAYMENT_CHANNELS"]
        ch = _get_answer_val(answers, "CFO_PAYMENT_CHANNELS")
        if ch in ["CARDS_AND_WIRE", "ALL_CHANNELS"]:
            if "CFO_RECEIPT_POLICY" not in answered_keys:
                return QUESTIONS_BY_KEY["CFO_RECEIPT_POLICY"]

        # 3. Budget Baseline Source
        if "CFO_BUDGET_BASELINE_SOURCE" not in answered_keys:
            return QUESTIONS_BY_KEY["CFO_BUDGET_BASELINE_SOURCE"]
        src = _get_answer_val(answers, "CFO_BUDGET_BASELINE_SOURCE")
        if src in ["EXCEL_CSV", "QUICKBOOKS", "OTHER"]:
            if "CFO_BUDGET_MAPPING_STATUS" not in answered_keys:
                return QUESTIONS_BY_KEY["CFO_BUDGET_MAPPING_STATUS"]
        elif src == "AIA_SOV":
            if "CFO_SOV_CONTINGENCY_POLICY" not in answered_keys:
                return QUESTIONS_BY_KEY["CFO_SOV_CONTINGENCY_POLICY"]

        # 4. Reconciliation Authority & Cutoff
        if "CFO_DRAW_RECONCILIATION_OWNER" not in answered_keys:
            return QUESTIONS_BY_KEY["CFO_DRAW_RECONCILIATION_OWNER"]
        if "CFO_STATEMENT_FREQUENCY" not in answered_keys:
            return QUESTIONS_BY_KEY["CFO_STATEMENT_FREQUENCY"]

        return None

    elif r == "PM":
        # 1. Schedule Source
        if "PM_SCHEDULE_SOURCE" not in answered_keys:
            return QUESTIONS_BY_KEY["PM_SCHEDULE_SOURCE"]
        src = _get_answer_val(answers, "PM_SCHEDULE_SOURCE")
        if src == "GC_SCHEDULE":
            if "PM_GC_SCHEDULE_STATUS" not in answered_keys:
                return QUESTIONS_BY_KEY["PM_GC_SCHEDULE_STATUS"]
            gc_status = _get_answer_val(answers, "PM_GC_SCHEDULE_STATUS")
            if gc_status in ["false", "False", "NO"] and "PM_SCHEDULE_TASK_CREATION" not in answered_keys:
                return QUESTIONS_BY_KEY["PM_SCHEDULE_TASK_CREATION"]
        elif src in ["INTERNAL_PM", "OTHER"]:
            if "PM_MILESTONE_CREATION_METHOD" not in answered_keys:
                return QUESTIONS_BY_KEY["PM_MILESTONE_CREATION_METHOD"]
        elif src == "ARCHITECT_TIMELINE":
            if "PM_SCHEDULE_TASK_CREATION" not in answered_keys:
                return QUESTIONS_BY_KEY["PM_SCHEDULE_TASK_CREATION"]

        # 2. Permits
        if "PM_PERMIT_STATUS" not in answered_keys:
            return QUESTIONS_BY_KEY["PM_PERMIT_STATUS"]
        perm = _get_answer_val(answers, "PM_PERMIT_STATUS")
        if perm in ["IN_REVIEW", "PHASED"]:
            if "PM_PERMIT_AUTHORITY_TRACKING" not in answered_keys:
                return QUESTIONS_BY_KEY["PM_PERMIT_AUTHORITY_TRACKING"]

        # 3. Field Verification & Photos
        if "PM_FIELD_VERIFICATION_WORKFLOW" not in answered_keys:
            return QUESTIONS_BY_KEY["PM_FIELD_VERIFICATION_WORKFLOW"]
        if "PM_EVIDENCE_PHOTO_CADENCE" not in answered_keys:
            return QUESTIONS_BY_KEY["PM_EVIDENCE_PHOTO_CADENCE"]
        if "PM_DELAY_TAXONOMY" not in answered_keys:
            return QUESTIONS_BY_KEY["PM_DELAY_TAXONOMY"]

        return None

    elif r == "GC":
        # 1. Contract Confirmation
        if "GC_CONTRACT_CONFIRMATION" not in answered_keys:
            return QUESTIONS_BY_KEY["GC_CONTRACT_CONFIRMATION"]

        # 2. Payment Application Format & Cost Evidence
        if "GC_PAYMENT_APPLICATION_FORMAT" not in answered_keys:
            return QUESTIONS_BY_KEY["GC_PAYMENT_APPLICATION_FORMAT"]
        fmt = _get_answer_val(answers, "GC_PAYMENT_APPLICATION_FORMAT")
        if fmt == "CUSTOM_SOV" and "GC_COST_EVIDENCE_METHOD" not in answered_keys:
            return QUESTIONS_BY_KEY["GC_COST_EVIDENCE_METHOD"]

        # 3. Billing Cutoff & Policies
        if "GC_BILLING_CUTOFF_DAY" not in answered_keys:
            return QUESTIONS_BY_KEY["GC_BILLING_CUTOFF_DAY"]
        if "GC_LIEN_WAIVER_POLICY" not in answered_keys:
            return QUESTIONS_BY_KEY["GC_LIEN_WAIVER_POLICY"]
        if "GC_CHANGE_ORDER_NOTICE" not in answered_keys:
            return QUESTIONS_BY_KEY["GC_CHANGE_ORDER_NOTICE"]

        return None

    elif r == "INVESTOR":
        if "INVESTOR_READ_ONLY_ACK" not in answered_keys:
            return QUESTIONS_BY_KEY["INVESTOR_READ_ONLY_ACK"]
        if "INVESTOR_REPORTING_PREFERENCE" not in answered_keys:
            return QUESTIONS_BY_KEY["INVESTOR_REPORTING_PREFERENCE"]
        pref = _get_answer_val(answers, "INVESTOR_REPORTING_PREFERENCE")
        if pref in ["EMAIL_SUMMARY", "BOTH"]:
            if "INVESTOR_DIGEST_FREQUENCY" not in answered_keys:
                return QUESTIONS_BY_KEY["INVESTOR_DIGEST_FREQUENCY"]
        if "INVESTOR_TAX_K1_RECIPIENT" not in answered_keys:
            return QUESTIONS_BY_KEY["INVESTOR_TAX_K1_RECIPIENT"]

        return None

    return None
