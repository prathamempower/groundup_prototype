# GroundUp AI Complete Data Flow

## 1. Data-flow principles

GroundUp AI operates on four separate truths—Budget, Spend, Funding, and Progress—and connects them through reviewed links. Original source files are immutable. Imported and AI-extracted values are proposals until a permitted person reviews them. Reports calculate from canonical reviewed records and always show an as-of time and data-quality state.

```text
Source evidence
  → Next.js requests FastAPI-authorized private S3 upload
  → FastAPI records document and dispatches Celery job through Redis
  → separate Python worker scans, hashes, deduplicates, classifies
  → worker persists extract/import proposals
  → human review and canonical records
  → matching and reconciliation
  → workflow decisions and approvals
  → derived forecasts, alerts, dashboards, exports
```

## 2. Source systems and evidence

| Source | Typical contents | Owner | GroundUp treatment |
|---|---|---|---|
| Acquisition/HUD/closing statement | purchase price, closing costs, entity, loan proceeds | Owner/CFO | acquisition and financing proposals |
| Loan/commitment/loan report | commitments, interest terms, draw requirements, reserve | Owner/CFO | loan terms and draw policy proposals |
| Budget/SOV/XLSX | baseline costs, line codes, GC fee, contingency | Owner/CFO | versioned budget proposal |
| Contract/change order | contract model, milestones, markup, schedule/cost changes | Owner/GC | contract and change-control proposal |
| Bank statement | cleared deposits, payments, transfers, balances | CFO | immutable cash-transaction import |
| Card statement | purchase activity and card settlements | CFO | expense/payment proposals with double-count protection |
| Invoice/check/payment request | vendor obligation, scope, payment evidence | GC/CFO | spend evidence and allocation proposal |
| Draw application/inspection report | requested/recommended/approved work, comments | Owner/CFO | draw/draw-line/progress proposals |
| Photo/inspection/permit | progress and approval evidence | PM/GC | milestone evidence and inspection events |
| Sale/HUD/distribution record | proceeds, payoff, costs, investor cash flows | Owner/CFO | disposition/equity proposals |

## 2.1 Adaptive onboarding and configuration flow

```text
Owner creates organization/project and invite
  → user accepts scoped invite and completes identity/security setup
  → onboarding service evaluates role/project answers
  → next question, delegated task, required document, or configuration proposal
  → assigned role completes/reviews task
  → required owner/admin approval for high-risk configuration
  → readiness gate opens the appropriate workflow
```

Examples: a `COST_PLUS` answer enables granular spend/invoice requirements; a `FIXED_PRICE` answer enables milestone claims; a shared operating-account answer requires allocation/transfer policy; an interest-reserve answer enables reserve depletion forecasting. Unknown answers create work items and block only dependent outcomes.

## 3. Canonical data lifecycle

### 3.1 Intake and preservation

1. An authorized user selects a project or submits to the organization inbox when project is unknown.
2. Next.js calls FastAPI to authorize a restricted S3 upload URL and records intended document type/source.
3. The browser uploads the original directly to private S3. FastAPI confirms object metadata and records immutable storage key, SHA-256 hash, file metadata, uploader, intake time, and project candidate.
4. FastAPI enqueues an idempotent Celery task through Redis. A separate Python worker performs security/readability checks before preview/extraction. Malware/corrupt/empty files are quarantined with a visible resolution path.
5. Exact and likely duplicate checks run. An exact duplicate creates a reference, not another canonical document. A likely duplicate is reviewable.

**Output:** one `document` in an intake state; no project economics change at this point.

### 3.2 Classification and extraction

1. A Python Celery worker identifies format and likely document type.
2. OCR/table parsing runs where needed; source page/row/cell citations are retained.
3. Structured extractors produce proposed entities/fields—never direct financial writes—with raw value, normalized value, confidence, extraction version, and citation.
4. Rules identify possible project, lender, account, vendor, draw number, invoice number, or budget mapping.
5. Low-confidence, conflicting, or unmatched fields go to review. A failed extraction stays recoverable through manual entry linked to the file.

**Output:** `document_extractions` and `extraction_fields` in `READY_FOR_REVIEW`.

### 3.3 Human review and canonicalization

1. The responsible role opens the document review screen.
2. The role accepts, edits, rejects, or marks each proposed field/document link as duplicate, misfiled, irrelevant, or not applicable.
3. Accepted values create/version canonical records inside one database transaction.
4. The system writes an audit event with previous/new values, actor, rationale, and source citations.
5. Derived projections and alerts recalculate asynchronously after commit.

**Output:** source-linked, review-stamped canonical records. A rejected proposal remains visible in the source history.

## 4. Financial truth flows

### 4.1 Budget truth

```text
Budget/SOV upload
  → extract/import lines and hierarchy
  → owner/CFO review
  → approved immutable baseline budget
  → approved change orders + contingency movements
  → current approved budget view
```

The initial approved budget is never edited. A later budget sheet becomes a new revision or a source for proposed line mappings. The current approved amount is derived from baseline plus approved effective changes. A line can link to a major milestone and one or more draw lines, but those links do not change its approved amount.

**Produces:** `budgets`, `budget_lines`, `change_orders`, `change_order_lines`, `contingency_movements`.

### 4.2 Spend truth

```text
Invoice / check / card export / bank transaction
  → source record
  → proposed vendor, project, budget-line and payment links
  → CFO review/allocations
  → verified spend record and/or cleared transaction
  → budget variance and payment-status projection
```

An invoice is an obligation; a cleared bank/card transaction is a cash event. They may be linked, but neither replaces the other. A single source amount can be split among budget lines or projects only through allocations whose total equals the source amount. Refunds, reversals, voided checks, and chargebacks are new linked records rather than edits.

**Produces:** `spend_records`, `financial_transactions`, `reconciliation_matches`, allocation records, and potentially `inter_project_transfers`.

### 4.3 Funding truth

```text
Draw request / lender inspection / approval
  → draw revision and draw lines
  → requested, recommended, approved amounts
  → cleared deposit in bank statement
  → CFO allocates deposit to draw funding
  → funded status and cash/funding-gap projection
```

Lender approval is not cash. Cleared cash can arrive before its paperwork or combine multiple draws. The application holds it as unallocated funding until reviewed. Funded amounts can be less than approval due to funding percentages, retainage, lender fees, or partial disbursement.

**Produces:** `draws`, `draw_lines`, `draw_requirements`, `draw_fundings`, `financial_transactions`.

### 4.4 Progress truth

```text
PM/GC update, photo, inspection, permit, appraiser report
  → milestone update/evidence intake
  → PM review and verification
  → planned vs actual vs forecast status
  → delay attribution and carry-cost forecast
```

Milestones represent material categories—permits, site work, foundation, framing, mechanical, interiors, completion—not every small transaction. A milestone can connect the project plan, budget roll-up, actual spend, draw evidence, and schedule; its evidence does not prove a payment unless payment evidence also exists.

**Produces:** `project_milestones`, `progress_records`, `progress_evidence`, `inspections`, `permits`.

### 4.5 Project economics and return

```text
Acquisition + baseline budget + approved changes + spend/commitments
+ loan/carry terms + forecast dates + disposition assumptions
  → original and current pro-forma versions
  → forecast total cost, net proceeds, profit, ROI

Actual sale settlement + payoff + distributions
  → actual closeout and investor cash-flow history
  → forecast-to-actual comparison; IRR where meaningful
```

Forecast calculations label components as actual, committed, approved, estimated, or missing. If essential inputs are missing, the product reports an incomplete forecast rather than treating them as zero.

## 5. Reconciliation flow

```text
Import batch
  → exact duplicate check
  → candidate match generation
  → finance review queue
      ├─ accept full match
      ├─ split/allocate
      ├─ remap
      ├─ exclude with reason
      ├─ identify temporary inter-project transfer
      └─ create exception/request evidence
  → reconciled period sign-off
```

### Required comparison views

| Comparison | Purpose | Do not assume |
|---|---|---|
| Budget line ↔ spend | cost variance | spend is lender eligible |
| Spend ↔ cleared payment | payment status | invoice date equals payment date |
| Draw line ↔ progress/evidence | work eligibility | work completion equals cash received |
| Approved draw ↔ cleared deposit | funding confirmation | approved equals funded |
| Bank transactions ↔ statement balance | cash completeness | the statement covers all project accounts |
| Project transfer ↔ repayment | working-capital exposure | transfer is revenue/expense |
| Forecast ↔ sale/distribution | actual return | unrealized sale value is cash |

## 6. Alert and work-item flow

1. A domain event is written after any accepted import, decision, or state transition.
2. Rules evaluate threshold and context: overrun, missing required evidence, short-funded draw, unallocated cash, lender condition, delayed milestone, reserve depletion, duplicate, or data conflict.
3. The system creates a deduplicated `alert` and assigns an owner/role based on policy.
4. The assignee resolves, waives with reason/expiry, or escalates. Resolution does not erase original exception history.
5. Dashboard badges show open material alerts and data-quality impact.

Notifications are delivery mechanisms only. They must not change a financial or workflow state.

## 7. Reporting and export flow

```text
Reviewed canonical tables
  → versioned reporting projection / materialized calculation
  → dashboard or report request with filters
  → permission + snapshot/as-of validation
  → rendered view/export with totals, drill-down, sources, quality status
```

Reports are read models. They never become the source of truth and cannot be directly edited. Every export includes organization/project, applied filters, currency, `as_of`, verified/provisional inclusion policy, generation time, and data-quality warnings.

## 8. Access-control flow

1. User authenticates and receives organization membership/role claims.
2. Every API call verifies active account, organization, project membership, role, and record scope.
3. The database applies row-level security as a second enforcement layer.
4. Private documents use short-lived signed URLs validated for exact object/project scope.
5. Sensitive actions—access changes, publication, verified-record correction, high-sensitivity export—require the correct role and, where configured, step-up authentication.

## 9. End-to-end flow for a live project

```text
Owner creates project
  → uploads acquisition/loan/contract/budget
  → owner+CFO approve baseline and configure contract/draw rules
  → PM creates milestone plan
  → GC/PM supplies progress, invoices and evidence
  → CFO imports bank/card/ledger data and reconciles spend
  → owner builds draw packet; lender decision is imported
  → CFO confirms cleared funding and shortfalls
  → dashboard updates forecast, risks and investor-ready summary
  → repeat during construction
  → record sale, payoff and distributions
  → closeout reconciliation and forecast-to-actual analysis
```

## 10. Failure and recovery path

No source-data failure should create a dead end. An unreadable file creates a replacement request; failed OCR enables manual source-linked entry; missing bank coverage creates a period exception; conflicting sources show side-by-side evidence; an erroneous verified record is corrected by adjustment/supersession. Every recovery path preserves the original and records who made the final decision.
