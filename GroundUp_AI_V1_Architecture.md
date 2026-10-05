# GroundUp AI — V1 System Architecture & Build Plan

## 0. Governing Principles (non-negotiable)

These five rules from the source document are the spine of every design decision below. Every module must be checked against them before it ships.

1. **Never destroy history.** No overwrites of rejected draws, budget versions, or expense reclassifications — everything is append-only + versioned.
2. **Multiple truths by domain.** Budget Truth, Spend Truth, Funding Truth, Progress Truth are separate first-class objects. Nothing forces them into one number.
3. **AI proposes, deterministic code calculates.** LLMs extract/classify/summarize/flag. Every dollar figure shown to a user is produced by pure functions/SQL, never by a language model.
4. **Uncertainty becomes an exception, not a guess.** Low-confidence extraction blocks canonical posting; it never silently rounds or estimates into the ledger.
5. **Every number has provenance.** Any figure on screen must be click-through traceable to its source row/document.

Three explicit V1 non-goals: no wallet/payment movement, no autonomous AI posting of uncertain data, no rigid one-size-fits-all milestone schema.

---

## 1. High-Level System Layers

```
┌─────────────────────────────────────────────────────────────┐
│ INPUT LAYER                                                  │
│ Upload (PDF/XLSX/CSV/IMG) · Email ingestion · QuickBooks/Xero│
│ · Buildertrend/Procore (later) · Lender portal (later)       │
└───────────────────────────┬───────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ INGESTION & QUEUE LAYER                                      │
│ Object storage → Ingestion Job Queue → Document Classifier   │
│ → Extraction Workers → Staging Tables (raw + proposed)       │
└───────────────────────────┬───────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ REVIEW / CONFIRMATION LAYER                                  │
│ Confidence router → Human review queue → Canonical Poster    │
└───────────────────────────┬───────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ NORMALIZED DATA LAYER (Postgres, RLS)                        │
│ Project · Loan · BudgetLine · Expense · Invoice · Draw ·      │
│ DrawLine · Vendor · ChangeOrder · ScheduleActivity ·          │
│ Inspection · Document · Investor · AlertRisk · AuditEvent     │
└───────────────────────────┬───────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ CALCULATION ENGINE (deterministic, versioned, pure functions) │
│ Variance · Cash Exposure · Funding Gap · Delay Cost ·          │
│ Reconciliation Exceptions · Portfolio Rollups                 │
└───────────────────────────┬───────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ REAL-TIME DISTRIBUTION LAYER                                  │
│ Postgres LOGICAL replication / outbox → event bus →           │
│ WebSocket/SSE gateway → client cache invalidation              │
└───────────────────────────┬───────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION / API LAYER (REST+GraphQL, RLS-scoped)            │
└───────────────────────────┬───────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ UI LAYER — Project Dashboard · Inbox · Reconciliation ·       │
│ Draw Tracker · Drill-down Provenance Viewer · Alerts Center    │
└─────────────────────────────────────────────────────────────┘
```

Why this shape prevents backlog and deadlock is explained per-layer below.

---

## 2. Ingestion Pipeline — Zero Backlog, No Deadlocks

### 2.1 Queue design
- Every uploaded/emailed/synced document becomes one **immutable blob** in object storage, then one row in `ingestion_jobs` (status: `received → classifying → extracting → staged → needs_review → posted | rejected | failed`).
- Workers are **stateless and horizontally scalable** — a job never blocks another job. A stuck PDF cannot stall the queue for a CSV.
- Use a durable queue (e.g., Postgres-backed job table with `SELECT ... FOR UPDATE SKIP LOCKED`, or SQS/PubSub). `SKIP LOCKED` is the specific mechanism that eliminates lock contention/deadlocks between concurrent workers pulling from the same queue.
- Each job has: `attempt_count`, `max_attempts`, `backoff_until`, `last_error`. Exponential backoff on transient failure; after `max_attempts` the job moves to a **dead-letter state** (`failed_needs_human`) and raises an Alert — it never silently disappears and never blocks the queue behind it.
- **Idempotency key** = hash(file bytes + project_id). Re-uploading the same file resolves to the same job instead of creating duplicate financial rows.

### 2.2 Why no deadlocks
- No two workers ever need to lock the same row set in conflicting order: extraction writes only to `staging_*` tables (one row per job, owned by that job). Only the **Canonical Poster** service writes to production tables (`expense`, `draw_line`, `budget_line`), and it does so in **single-row, short-lived transactions** with a fixed lock order (Project → BudgetLine → Expense), never nested cross-service transactions.
- Long-running AI extraction never happens inside a DB transaction — extraction is fully async against the staging table; only the final "commit proposed values" step touches production tables, and that step is a fast, single-statement upsert.

### 2.3 Fallback ladder per document (this is what "no backlog" really means operationally)
1. AI classifies document type + project → if confidence ≥ threshold, auto-tag.
2. If classification confidence is low → job still gets created and visible in the Inbox as "Needs project/type," not dropped.
3. If extraction partially fails (e.g., table parses but totals don't reconcile) → GroundUp stages what it *could* extract and flags the missing fields explicitly, rather than blocking the whole document.
4. If a required file type can't be parsed at all (corrupt PDF, scanned image with bad OCR) → job routes to `manual_entry_required` with the original file still attached, so a human can key it in without losing provenance.
5. Nothing ever silently vanishes: every path terminates in a state the user can see in the Inbox.

---

## 3. The Four Truths — Exact Formulas

All formulas below are the **only** place dollar/date math happens. UI and AI layers only display outputs of these functions.

### 3.1 Budget Truth
```
CurrentBudget(category) = LatestApprovedBudgetVersion(category)
                         + Σ ApprovedChangeOrders(category)
```
- Budget is versioned (`budget_version_id`); "current" always resolves to the latest *approved* version, never a draft.

### 3.2 Spend Truth
```
ActualSpend(category) = Σ PostedExpenses(category)
                        where expense.status = 'posted'
                        (posted = human-confirmed OR auto-posted per confidence rule)
```
```
BudgetVariance(category) = ActualSpend(category) − CurrentBudget(category)
BudgetVariancePct(category) = ActualSpend(category) / CurrentBudget(category)
```
Flag: `ActualSpend > CurrentBudget` → 🔴 over-budget alert with exact `$` delta.

### 3.3 Funding Truth
```
AmountFunded(project) = Σ DrawLine.funded_amount
                         where draw_line.status = 'disbursed'
```
Note: **approved ≠ funded**. `approved_amount` is tracked separately and only `disbursed` events move this number.
```
DeveloperCashExposure(project) = TotalActualSpend(project) − AmountFunded(project)
```
This is the single most important derived number in the product and must always be computed from posted, not estimated, values.

### 3.4 Progress Truth
```
ProgressTruth(milestone) = latest verified status
                            from {inspection_result, PM_confirmation, lender_inspection}
                            (never inferred from invoice %)
```
```
ScheduleDelayDays(milestone) = ActualDate − PlannedDate   (only once ActualDate is verified)
EstimatedDelayCost = ScheduleDelayDays × DailyCarryingCost
                      where DailyCarryingCost = LoanBalance × (AnnualInterestRate / 365)
```
`DailyCarryingCost` should be computed from the loan's actual outstanding balance and rate stored on the `Loan` entity — never a hardcoded placeholder.

### 3.5 Reconciliation Engine
The engine runs on every relevant write (expense posted, draw line updated, inspection recorded, milestone confirmed) and compares the four truths for the same category/milestone:
```
ReconciliationException raised when, for the same cost category:
   ProgressPct is materially behind SpendPct
   e.g. SpendPct(category) − ProgressPct(category) > threshold (configurable, default 15%)
```
It **never overwrites** one truth with another — it creates an `AlertRisk` row referencing all four source values plus their provenance, exactly per the document's "Plumbing 55% complete / 82% spent" example.

### 3.6 Portfolio Rollups
All portfolio-level totals (across projects) are `SUM()`/`GROUP BY` aggregations over the same per-project functions above — never separately re-derived — so a single formula library guarantees project and portfolio numbers can never drift apart.

---

## 4. AI Extraction & Confidence Routing

```
Extracted field → confidence score (0–100%)
   ≥ auto_post_threshold (customer-configurable, e.g. 95%)
        → eligible for auto-post IF customer has enabled auto-post rules for that field/vendor
   review_threshold ≤ score < auto_post_threshold (e.g. 70–95%)
        → goes to Human Review Queue, shown with the AI's proposed value + source highlight
   < review_threshold
        → goes to Human Review Queue as "low confidence," AI proposes nothing definitive,
          UI shows "⚠️ Amount uncertain — please verify" (never a plugged-in guess)
```
- Every extraction stores: `source_file_id`, `source_location` (page/row/cell), `model_provider`, `model_version`, `extraction_run_id`, `confidence_by_field`. This is what powers the click-to-source drill-down in Section 6.
- Customer documents are **not** used to train shared models by default (per-org flag, off by default).

---

## 5. Real-Time Tracking

- **Change data capture**: every insert/update to `expense`, `draw_line`, `budget_line`, `inspection`, `alert_risk` writes an outbox row in the same transaction (transactional outbox pattern — avoids dual-write inconsistency between DB and event bus).
- A relay process publishes outbox rows to an event stream (e.g. Postgres `LISTEN/NOTIFY` for V1 scale, or a lightweight broker if multi-instance).
- Clients hold a WebSocket/SSE subscription per project; on event, the client invalidates only the affected cache keys (category-level, not full page) so dashboards update within seconds of a document being processed — no polling, no stale numbers.
- Recalculation is **incremental**: only the affected category/project aggregates recompute (not a full-portfolio recalculation job), keeping real-time latency low even as data volume grows.

---

## 6. Provenance & Drill-Down (UI + data requirement)

Every displayed number is a clickable node in a provenance tree:
```
Actual Spend: $1.24M
 └─ Electrical: $225K
     └─ ABC Electric: $82,450
         └─ Source: April_Expenses.xlsx · Sheet "Expenses" · Row 147
              [View original document] [View extraction confidence]
```
Implementation: every leaf financial row (`expense`, `draw_line`) carries a mandatory `source_document_id` + `source_ref` (row/page/cell) foreign key — the schema simply does not allow a financial row to exist without a source reference (manual entries get `source_type = 'manual'` + `entered_by_user_id` instead).

---

## 7. Normalized Data Model (core entities)

| Entity | Key fields | Notes |
|---|---|---|
| Project | org_id, name, GC, lender, units, expected_completion | tenant root |
| Loan | project_id, amount, rate, term, holdback, balance | drives carrying-cost calc |
| BudgetLine | project_id, category, version_id, amount | versioned, append-only |
| Expense | project_id, category, vendor_id, amount, status(posted/pending), source_document_id | Spend Truth |
| Invoice | vendor_id, project_id, amount, invoice_number, supporting_doc_id | |
| Draw | project_id, draw_number, requested_total, approved_total, status, revision_number, original_draw_id | never overwritten, revisions chain |
| DrawLine | draw_id, category, requested_amount, approved_amount, funded_amount, rejection_reason_code | Funding Truth |
| Vendor | name, normalized_id (dedup) | |
| ChangeOrder | project_id, category, amount, approval_status, budget_impact | |
| ScheduleActivity | project_id, milestone, planned_date, actual_date, trade | Progress Truth |
| Inspection | project_id, milestone, requested_date, result, responsible_trade | Progress Truth |
| Document | org_id, project_id, file_ref, type, classification_confidence | source of truth for provenance |
| Investor | project_id, equity, ownership_pct, distributions | |
| AlertRisk | project_id, type, severity, related_entities[], created_at, resolved_at | reconciliation output |
| AuditEvent | actor_id, entity, field, old_value, new_value, source, timestamp | append-only |
| CostAllocation (on Expense/ChangeOrder) | cost_scope (PROJECT / PARTNER_SPECIFIC / INVESTOR_SPECIFIC / NON_PROJECT), funded_by_party_id, shared_cost | supports partner-specific costs (Q6) |
| Milestone / PaymentRequirement | flexible type/trade/status fields, no hardcoded trade columns | supports configurable workflows (Q2) |

All tables use PostgreSQL **Row Level Security** keyed on `organization_id`, with role-based policies (Owner/Admin, CFO/Finance, PM, Accountant, Viewer, Investor) — enforced at the database layer, not just the app layer, so a bug in application code cannot leak cross-tenant data.

---

## 8. Draw Rejection Workflow (state machine)

```
Requested → (Lender Response) → Approved(full) | Approved(partial) | Rejected(line-level)
     Rejected/partial lines get: rejection_reason_code (standardized enum)
     → Exception/task created per line
     → Developer's cash exposure recalculated immediately (spend already incurred, funding didn't arrive)
     → User uploads corrective docs, linked to the specific draw line
     → Resubmission creates Draw Revision N (original_draw_id preserved, nothing overwritten)
     → New lender response recorded against the revision
     → Only actual disbursement event updates Funding Truth (approval alone does not)
```

---

## 9. Ingestion Phasing (build order — matches the document's staged rollout)

1. **Phase 1 — Upload Inbox**: drag-and-drop per project, AI classify → propose → human confirm. This is the V1 floor and must work flawlessly before anything else is built.
2. **Phase 2 — Email ingestion**: per-project inbound address, same classify → propose → confirm pipeline, just a different entry point into the same `ingestion_jobs` queue.
3. **Phase 3 — Accounting integrations** (QuickBooks/Xero): nightly + on-demand sync, same confidence-routing pipeline, not a separate code path.
4. **Phase 4 — Construction platform integrations** (Buildertrend/Procore): additive only — the system must be fully functional with zero integrations connected.
5. **Phase 5 — Lender integrations**: draw lifecycle events ingested automatically once available; until then, PDFs/emails/manual entry cover the same state machine.

**Critical design rule**: every phase writes into the *same* normalized tables through the *same* confidence-routing and reconciliation engine. There is never a "integration data path" vs. an "upload data path" — this is what prevents special-case bugs and backlog later.

---

## 10. Security, Audit, Retention (V1 bar)

- Auth: managed provider (e.g. Supabase Auth), email verification, MFA for Owner/Admin roles.
- Every mutation to financial data writes an `AuditEvent` (who, what field, old→new, source, timestamp), append-only.
- Encryption in transit (TLS) and at rest (managed disk/db encryption); no secrets in frontend bundles.
- Do not store SSNs, full card numbers, or banking credentials; mask account numbers in UI where they appear in source docs.
- Soft-delete only; audit history preserved; org-configurable retention policy (no hardcoded "7 years" claim).
- Prepare CCPA/CPRA-style export/delete tooling and a subprocessor list; defer formal SOC 2 to post-pilot.

---

## 11. Tech Stack (concrete, V1-appropriate)

| Layer | Choice | Why |
|---|---|---|
| DB | PostgreSQL (Row Level Security) | native multi-tenant isolation, `SKIP LOCKED` queueing, transactional outbox |
| Auth | Supabase Auth (or Auth0) | fast MFA + RLS integration |
| Object storage | S3-compatible | immutable source documents |
| Job queue | Postgres-backed (`FOR UPDATE SKIP LOCKED`) → migrate to SQS/Cloud Tasks at scale | avoids extra infra for V1, no deadlock risk |
| Extraction | LLM (document understanding) + rules/regex validators | AI proposes, code validates arithmetic (e.g., line items sum to total) before ever showing confidence |
| Calculation engine | Pure functions in application layer (or Postgres views/materialized functions) | single source of truth for every formula in Section 3 |
| Real-time | Transactional outbox + LISTEN/NOTIFY (or lightweight broker) → WebSocket/SSE | incremental, low-latency updates |
| Frontend | React/Next.js + component library | dashboard, Inbox, drill-down tree, alerts |
| API | REST/GraphQL, RLS-scoped by JWT org/role claims | |

---

## 12. UI Plan (clean, calculation-first)

**Primary screens:**
1. **Portfolio Dashboard** — "🔴 N things require attention today," cards per project with Budget/Spend/Funded/Exposure at a glance, all values computed live by the calculation engine.
2. **Project Overview** — four-truth summary strip (Budget | Spend | Funded | Progress) + reconciliation exceptions list, each item linking to drill-down.
3. **Inbox** — per-project upload/email queue showing job status (`classifying / needs review / posted / failed`), so nothing is ever invisible or "stuck."
4. **Reconciliation / Exceptions view** — one row per `AlertRisk`, showing the conflicting values from each truth side-by-side plus recommended action, never a forced single number.
5. **Draw Tracker** — draw list with revision chain visible, line-item requested/approved/funded/variance table, rejection reason codes, linked corrective documents.
6. **Budget vs. Actual view** — category table with variance %, color-coded, click-through to expense-level provenance.
7. **Provenance Viewer** (modal/panel) — the drill-down tree from Section 6, with a link to view the original source document/cell.
8. **Alerts Center** — chronological + severity-sorted feed of all `AlertRisk` events, filterable by project/category/type.

**UI principles:**
- Every number is a link, not static text.
- Uncertain/low-confidence values are visually distinct (e.g., amber "⚠️ verify" treatment) and never rendered identically to confirmed figures.
- No screen aggregates data the calculation engine hasn't produced — the frontend never does ad hoc math on raw rows.

---

## 13. V1 "Definition of Done"

GroundUp V1 is complete when, from exactly these five inputs:
1. Project budget spreadsheet
2. Expense ledger spreadsheet
3. Loan approval PDF
4. Lender draw approval PDF
5. Project schedule spreadsheet

...the system reliably and correctly (via the formulas in Section 3, not estimation) produces: Current Budget, Actual Spend, Amount Funded, Developer Cash Exposure, Budget Variances, Draw Status, Schedule Status, and Estimated Delay Cost — with full provenance on every figure, zero silent data loss in the ingestion pipeline, and real-time propagation to the dashboard.

**Explicit non-goals for V1:** wallet/payment movement, fully autonomous AI posting of uncertain data, one-size-fits-all milestone schema.
