# GroundUp AI Product Requirements Document

## 1. Product scope

GroundUp AI is a multi-tenant web application for developers/sponsors to control project economics across acquisition, construction, lender draws, and disposition. Version 1 is an owner-side control layer: it ingests evidence, maintains separate budget/spend/funding/progress records, supports human reconciliation, and produces a current profit forecast.

### In scope for V1

- Project setup, lifecycle, team access, and contract model selection.
- Source-document ingestion, extraction proposals, validation queues, and audit trail.
- Immutable approved budgets/SOVs, approved change orders, contingency movements, and budget revisions.
- Expense and cash-transaction import; matching to budget lines with human approval.
- Draw requests, revisions, lender decisions, funding confirmation, draw conditions, and packet checklist.
- Milestone-level timeline, progress evidence, inspections, and delay attribution.
- Acquisition, loan, disposition, investor contribution/distribution, and original-versus-current pro-forma forecasting.
- Owner dashboard, finance/reconciliation workspace, PM progress workspace, limited GC intake, and read-only investor summaries.

### Explicitly out of scope for V1

- Replacing lender draw portals or automatically submitting a draw.
- General ledger/accounting-system replacement, payroll, AP payment execution, or bank money movement.
- Autonomously approving financial data, change orders, or draw requests.
- Automated card/bank integrations; CSV/XLSX/PDF import is sufficient for the pilot.
- Lender as an active application user.

## 2. Users and permissions

| Role | Can provide/change | Can view |
|---|---|---|
| Owner/Developer | project setup, source documents, contract model, approvals, investor sharing | all project data |
| CFO/Accounting | expense imports, transaction reconciliation, financial review | financial modules and reports |
| Project Manager | milestones, inspections, delays, progress evidence | timeline/evidence and relevant financial context |
| GC | claims, invoices/costs where enabled, photos, change-order requests | own assigned project submissions |
| Investor/Partner | nothing | owner-shared summary, not vendor-level detail |

Permission is organization- and project-scoped. Every write records actor, time, prior value, new value, and source or rationale.

## 2.1 Adaptive onboarding and delegated setup

The owner creates the organization and project, sets approval boundaries, and invites participants. The platform then runs a versioned, role-specific question graph rather than one fixed form. Each answer can reveal the next relevant question, create a document/task requirement, configure a workflow, or require a designated approval. CFOs configure sources/account mappings; PMs configure milestones/inspections; GCs confirm contract and submission requirements; investors complete profile/notification setup only.

Answers may be `UNKNOWN`, `NOT_YET_AVAILABLE`, or `NOT_APPLICABLE`; the system creates an accountable task rather than forcing a fabricated value. High-risk configuration changes—contract model, loan/account mapping, approved baseline, investor visibility, and approval policy—require owner approval and retain configuration history.

## 3. Functional requirements

### Project onboarding

The owner creates a project with identity/lifecycle data and chooses or defers key model answers: financing, account model, and construction contract model: `OPEN_BOOK`, `COST_PLUS`, `FIXED_PRICE`, `MILESTONE_BASED`, `PROFIT_SHARE`, or `HYBRID`. The resulting onboarding graph assigns only relevant follow-up questions to the correct role. Uploading the GC contract is preferred; extraction may prefill payment structure, milestones, markup, retainage, and change-order rules, but the owner confirms material configuration.

### Document intake and evidence

The system accepts PDF, image, XLSX, CSV, and email-exported files. Each file is immutable, hashed, classified, and connected to a project only after review. Extraction creates proposals—not records of truth. Users can correct fields, mark the file duplicate/misfiled/irrelevant, and see whether a figure is supported by an invoice, contract, bank/card transaction, or manual confirmation.

For pilot workbooks, GroundUp imports raw source rows/cells and their workbook, sheet, and row lineage. It does not trust a summary-sheet total or a source category as an accounting fact until it independently recomputes and reviews the underlying rows. Workbook layouts are versioned import templates with a manual-mapping fallback.

### Budget and change control

An approved baseline budget is versioned and never overwritten. Budget lines roll up to categories and may be linked to a milestone. All changes require an approved change order or approved contingency movement. The application shows original budget, current approved budget, actual spend, committed amount, draw-requested, draw-approved, lender-funded, and remaining exposure separately.

### Spend, transfers, and reconciliation

Finance imports ledger rows or transactions, preserves original values, and approves any mapping to a project/budget line. The system supports invoice, check, card, contract, GC confirmation, and manual evidence strengths. A temporary transfer between projects is recorded in a distinct transfer ledger with repayment state; it cannot affect revenue, cost, or profit until explicitly classified by a reviewer.

The system separately maintains financial accounts and statement periods. Bank-statement coverage, opening/closing-balance controls, and account-to-project/entity mapping are prerequisites for a reconciled period. Spreadsheet tab names, descriptions, and debit/credit labels are proposals, not account identity or transaction direction.

### Draw control

A draw has a versioned lifecycle: `DRAFT → SUBMITTED → UNDER_REVIEW → PARTIALLY_APPROVED | APPROVED | REJECTED → FUNDED | CLOSED`. Revised/rejected submissions retain lineage. Draw lines link to budget lines, requested/approved/funded values, work evidence, inspection evidence, lender comments, and missing conditions. A funding record is created only from a confirmed/cleared deposit.

### Timeline, progress, and delays

Milestones use major budget categories rather than every small cost line. Each has planned, actual, and forecast dates; progress percentage; evidence; inspection state; delay cause; and estimated financing/carry impact. The dashboard must identify dependencies that are at risk, not merely display a calendar.

### Economics and disposition

The product stores original pro-forma assumptions and calculates a current forecast from approved budgets, actual spend, loan/carry assumptions, and disposition assumptions. It supports acquisition costs, project debt, interest-reserve or monthly-interest models, investor contributions/distributions, unit sales, commissions, closing costs, loan payoff, net proceeds, profit, ROI, and later IRR. Forecast values must label their basis and confidence.

## 4. Key business rules

- Cleared cash, not draw approval, is funding truth.
- A lender can partially approve a line or apply a funding percentage; do not equate application, certificate, recommendation, approval, and deposit.
- Fixed/milestone contracts show claims and proof; open-book/cost-plus projects allow granular expense reconciliation. The project setting changes the workflow.
- Evidence is graded, not assumed. Missing invoices remain visible as an exception.
- A manually entered value has an explicit author/reason and lower evidence strength until corroborated.
- Investor views are read-only and hide vendor, bank, and internal exception detail by default.

## 5. MVP acceptance criteria

1. Import 392 First Street’s supplied documents and produce a source-linked reconciliation queue without silently creating transactions.
2. Import 73 Broadway budget, inspection reports, lender documents, and statements; show Application #1 and Application #3 as separate draw events with requested, approved, and recommended/funded fields that are not conflated.
3. A CFO can confirm/reject each expense-to-budget match; rejected/missing evidence remains actionable.
4. An owner can see original vs current profit forecast, cash/funding gap, schedule forecast, contingency remaining, and top exceptions.
5. Every material financial field is traceable to source document, page/row where available, reviewer, and audit history.
6. A workbook formula/summary total that differs from independently imported source rows produces an exception and cannot be used as the canonical total without finance approval.

## 5.1 Implementation constraints

- The production application uses a Next.js/TypeScript frontend and a FastAPI/Python backend in a modular-monolith deployment.
- PostgreSQL is the sole canonical financial data store. SQLAlchemy manages persistence and Alembic is the only production schema-migration path.
- Celery workers, using Redis as broker/result transport, process document ingestion, OCR, extraction, import proposals, notifications, and long-running reports outside web requests.
- Private S3 stores originals and derived previews. The browser accesses objects only through FastAPI-authorized presigned URLs.
- The specified stack must preserve all source-led financial validation, approval, audit, RBAC, RLS, and human-review rules in this PRD and companion specifications.

## 6. Delivery plan and gates

| Phase | Outcome | Exit gate |
|---|---|---|
| 0: Data contract | canonical import templates, document taxonomy, reconciliation rules | stakeholders approve field definitions and evidence policy |
| 1: Completed-project reconstruction | 392 First Street mapped end-to-end | finance signs off on reconciliation exception list |
| 2: Live-project pilot | 73 Broadway monitoring and draw workflow | owner accepts dashboard and review cadence |
| 3: Economics/closeout | sale, distributions, forecast-to-actual report | completed-project profitability is explainable |
| 4: Automation | bank/card feeds and smarter extraction | measured precision and review-time improvement |

## 7. Data readiness risks

The plan assumes incomplete and contradictory input. Before production use, resolve or record as exceptions: missing invoices/receipts, 392 draw-date-to-bank-statement mismatch, empty/duplicate statement files, incomplete 161 Woodlawn evidence, unverified investor formula, undocumented account/project mappings, and source-workbook total/row discrepancies. No aggregate or forecast may be marked “verified” while a contributing exception is unresolved.
