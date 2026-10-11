# GroundUp AI Validation and Data Integrity Specification

## 1. Validation model

Validation occurs at five layers. A pass at one layer does not imply a financial fact is verified.

| Layer | Question | Examples | Failure outcome |
|---|---|---|---|
| File | Is the upload safe and readable? | type, size, virus scan, password/corruption | reject/quarantine file |
| Structure | Can the data be parsed? | columns, datatype, locale, date | reject row or draft import |
| Referential | Does it safely relate to known data? | organization, project, account, vendor, budget line | review queue/block approval |
| Business | Does the event obey workflow/accounting rules? | allocations, approvals, statuses | block transition/flag exception |
| Reconciliation | Is the reported fact supported and consistent? | statement balance, funding deposit, invoice/payment | do not mark verified/reconciled |

All error messages must name the field/row, explain the problem in plain language, and say how to resolve it. Validation failures must not discard the user’s draft.

## 2. Standard record states

Use separate state dimensions instead of one overloaded status:

- **Ingestion:** `RECEIVED`, `PROCESSING`, `PROCESSING_FAILED`, `READY_FOR_REVIEW`, `REJECTED`, `ARCHIVED`.
- **Evidence:** `UNSUPPORTED`, `PROPOSED`, `PARTIALLY_SUPPORTED`, `SUPPORTED`, `CONFLICTED`.
- **Review:** `UNREVIEWED`, `NEEDS_REVIEW`, `VERIFIED`, `REJECTED`, `SUPERSEDED`.
- **Reconciliation:** `UNMATCHED`, `SUGGESTED`, `MATCHED`, `PARTIALLY_MATCHED`, `EXCEPTION`, `EXCLUDED`.
- **Workflow:** entity-specific state machine (draw/change order/inspection), with transitions enforced server-side.

“Verified” means a designated human has reviewed the supporting source under the organization’s policy. It does not guarantee that a lender, auditor, or counterparty agrees.

## 3. Global field rules

| Field type | Rules |
|---|---|
| IDs | UUID/opaque server-generated IDs. Client cannot choose organization ID or bypass scope. |
| Currency/money | Required ISO 4217 code. Store exact `numeric(19,4)` or integer minor units. No float. Define currency-specific rounding. |
| Date/time | Date-only fields for accounting/document dates; UTC timestamps for events; capture source timezone where known. Validate real calendar date and permitted range. |
| Text | Trim whitespace; preserve source raw text separately; normalize only searchable copies. Length limits and HTML/script sanitization. |
| Enumerations | Server-controlled allowlists; unknown imported values remain raw and require mapping. |
| Attachments | File hash, MIME sniffing plus extension check, size/page limits, malware scanning, storage key—not user path. |
| Source attribution | Every imported/extracted/derived value stores source type, document/page/row or transaction ID, extraction version, and review decision. |
| Effective dates | Corrections/revisions require effective date and cannot predate project/record existence without override rationale. |

## 4. Import validation

### File-level checks

- Allowed formats: PDF, image, CSV, XLSX, OFX/QFX only when supported. Reject executables, macro-enabled files unless explicitly handled in a sandbox, and MIME/extension mismatch.
- Enforce configurable size, page, worksheet, row, and cell limits. Show clear upload limits before processing.
- Calculate SHA-256 before parsing. Exact duplicate uploads become references to the original rather than new data.
- Virus/malware scan before preview, OCR, or download. Quarantined files have no derived records.
- Preserve source filename, uploader, source folder/email, received time, and hash.

### Tabular import checks

- User maps each incoming column to a canonical field; mappings are versioned templates per source.
- Preview total rows, rows accepted/rejected, date range, debit/credit totals, and unique account/check counts before commit.
- Detect header rows, blank rows, hidden rows, subtotal/total rows, formulas, merged cells, and multiple currency symbols. These require explicit handling rather than blind import.
- Validate a unique source key when present. Without one, generate a non-authoritative fingerprint from account, date, amount, direction, check/reference, and normalized description.
- A partial import may commit valid independent rows only after the user sees and accepts rejected rows. Atomic import is the default for dependent datasets such as a budget revision.
- Reimport is idempotent: same batch fingerprint/source records do not duplicate data.
- Preserve sheet name, row number, cell/range, raw cell values, and formula text in immutable source records. Importers must not replace a formula with a displayed/cached number without retaining both.
- When a workbook contains a subtotal/total formula, recompute the same control from accepted source rows and compare it. A mismatch creates a `FORMULA_TOTAL_MISMATCH` issue; the workbook total cannot be auto-approved as canonical.
- Imported tab/category names and mode labels (for example, `Debit`, `Credit`, `Amex`, `Check`) are source attributes. They do not determine transaction direction, project ownership, or accounting category until mapped and reviewed.

## 5. Financial validation

### Money and allocations

- Amount cannot be null for a financial fact. Zero requires a valid status/reason.
- All allocations of a transaction, invoice, payment, draw deposit, or settlement line must equal its source amount within an explicit rounding tolerance. Store unallocated remainder; never hide it.
- Allocation must use the same organization and permitted project. Cross-project allocation requires an explicit transfer/shared-cost workflow and reviewer.
- A reversal/refund/chargeback must link to the original where known and has its own source/effective date.
- A financial transaction is immutable after verification; corrections create adjustment/reversal records.

### Budget and commitments

- `original_amount` is immutable after baseline approval.
- `current_approved_amount` is derived from baseline plus approved change order lines and approved contingency movements. Manual override requires a privileged correction workflow and audit reason.
- Parent/child budget totals must reconcile; report an explicit rounding/residual line if necessary.
- Budget revision cannot be approved if any line mapping is orphaned, duplicate, or changes baseline without an authorized reason.
- Commitment/spend may exceed budget, but must create an overrun exception; it is not rejected merely because real projects overrun.
- Lender eligibility is separately validated from project budget eligibility.

### Invoice, expense, and payment

- Invoice date, due date, and payment date have chronological warnings; out-of-order dates need rationale, not automatic rejection.
- Duplicate detection considers vendor, invoice number, date, amount, currency, and source hash. A possible duplicate cannot be auto-posted.
- Payment allocation cannot exceed invoice outstanding amount unless it is an allowed prepayment/overpayment with explicit status.
- Card statement settlement cannot be categorized as a second project expense when the underlying card charges were imported.
- Bank data and ledger data are separate sources. Matching one to another creates a reconciliation relation; it never deletes either record.

### Loans, draws, and funding

- Loan terms require lender, principal/commitment amount, currency, status, effective date, and interest method before forecasting interest.
- `requested`, `recommended`, `approved`, and `funded` are separate non-negative amounts. A funded amount must be linked to a cleared transaction or explicitly marked unverified with reason.
- Draw revision requires a parent draw and cannot reuse the same active internal revision number.
- Draw line must point to an eligible budget line or have a documented exception/change authorization.
- Sum of draw-line approved/funded amounts must reconcile to draw header totals or show a documented adjustment/unallocated amount.
- A draw cannot transition to `FUNDED` if the linked cleared funding amount is less than required by the state policy. It may be `PARTIALLY_FUNDED`.
- Funding received prior to documentation stays `UNALLOCATED_FUNDING` and is excluded from “verified lender funding by line.”
- Retainage, lender fee, interest reserve, and holdback are separate components; do not net them without showing gross and components.

## 6. Progress and schedule validation


## 7. Lifecycle, economics, and return validation

- Project cannot be closed while open draws, unallocated cash, - Each milestone belongs to one project and may link to multiple budget lines; a budget line can link to zero/multiple milestones only through explicit allocation rules.
- `actual_start <= actual_finish`; `planned_start <= planned_finish`; forecast date cannot be before actual start when work has started.
- Progress is 0–100; values outside range are blocked. Regressing progress requires a correction reason and audit event.
- Delay days are derived from versioned baseline/forecast policy. If dates are missing, display `UNKNOWN`, never `0`.
- Evidence must record upload time, capture time if available, submitter, type, and verification status. GPS/EXIF is optional evidence and never sole proof.
- Inspection events are append-only. Latest state drives the summary, history remains available.
unresolved material reconciliation exceptions, or unrecorded loan payoff exist unless an owner approves a closeout exception.
- Acquisition cost, construction cost, financing cost, holding cost, sale proceeds, selling cost, debt payoff, and distributions are separately modeled; no “total cost” manual field overrides them without a documented adjustment.
- Forecast figures show methodology and component coverage. Missing inputs result in `INCOMPLETE_FORECAST`, not zero.
- Sale/unit proceeds cannot be counted twice in project disposition totals. Allocation of shared settlement costs must reconcile to total statement value.
- ROI calculation states its denominator (invested equity/cash contributed) and date basis. IRR requires at least one negative and one positive dated cash flow; otherwise return `NOT_MEANINGFUL`.
- Ownership percentage changes, contribution changes, and distribution waterfalls require effective dates and approval evidence.

## 8. Security and authorization validation

- Validate tenant/project membership at every API request and database query. UI permission is not authorization.
- Require step-up authentication for export of bank-level data, changing access, changing verified financial records, and publishing investor views.
- Role changes are effective from a recorded timestamp; terminated users cannot act through existing tokens after revocation.
- Validate signed upload/download URL scope, expiry, content type, max size, and object key prefix.
- Prevent IDOR by using authorization checks on every direct record/document request.
- Rate-limit authentication, upload, export, and costly extraction endpoints. Record anomalous activity without logging sensitive document contents.
- Invitations are time-limited, stored as token hashes, scoped to organization/project/role, revocable, and single-use unless an explicit enterprise bulk-invite policy says otherwise.
- The server evaluates onboarding question visibility, transition, and readiness rules. The client cannot submit hidden answers, self-assign a role, mark an answer approved, or open a blocked workflow by changing client state.
- High-risk configuration answers require versioned approval and effective dates. Changed answers must create a new configuration version and re-evaluate affected readiness gates.

## 9. State-transition validation

| Entity | Examples of allowed transition rules |
|---|---|
| Budget | `DRAFT → UNDER_REVIEW → APPROVED`; approved baseline can only become `SUPERSEDED`, never edited. |
| Change order | `DRAFT → SUBMITTED → APPROVED | REJECTED | WITHDRAWN`; only approved and effective orders affect current budget. |
| Draw | `DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED | PARTIALLY_APPROVED | REJECTED`; `APPROVED/PARTIALLY_APPROVED → PARTIALLY_FUNDED/FUNDED` only with cash linkage. |
| Spend record | `IMPORTED → NEEDS_REVIEW → VERIFIED | REJECTED`; verified record is corrected by `SUPERSEDED/ADJUSTED`, not edited. |
| Document | `RECEIVED → PROCESSING → READY_FOR_REVIEW → REVIEWED`; corrupted/quarantined file never advances to extraction acceptance. |
| Investor publication | `DRAFT → OWNER_APPROVED → PUBLISHED → WITHDRAWN`; publication uses an immutable report snapshot. |

All transitions are checked server-side against current version, actor role, required evidence, and prerequisite fields. A rejected transition returns a user-readable explanation and is audit logged when material.

## 10. Reconciliation and data-quality rules

### Reconciliation statuses

- **Verified:** required source and review exist; no unresolved conflict for that fact.
- **Reconciled:** source values have been matched according to a defined rule and any variance is within approved tolerance.
- **Provisional:** usable for planning but has weak/missing support; excluded from verified financial totals by default.
- **Exception:** a detected issue needs a disposition; it stays visible until resolved/waived.

### Source-led controls required by the supplied project data

- A transaction cannot be labelled cleared bank cash unless it is linked to a mapped financial account and source statement period, or a reviewer records an approved exception.
- A workbook/ledger row can be classified as expense, funding, transfer, card settlement, refund, or other only after normalization rules and reviewer confirmation; a negative sign alone is insufficient.
- An imported document found in a conflicting project folder is `MISFILED` until explicitly reclassified. Folder path is provenance, not project identity.
- Formula totals, summary tabs, and manually typed project totals are report controls. GroundUp computes its own total from accepted detail and exposes the variance.

### Period close criteria

A period may be marked reconciled only when:

1. all expected bank/card statement coverage is recorded or formally waived;
2. statement opening plus activity equals closing balance within configured tolerance;
3. all material transactions are matched, excluded with reason, or assigned an approved exception;
4. draw approvals and cleared funding have been reconciled or disclosed as timing differences;
5. approved budget changes are present in current budget; and
6. an authorized finance user signs off, capturing the as-of timestamp and exception count.

## 11. Report validation and presentation

- Every report must display organization/project, filter values, currency, as-of time, report version, and data-quality state.
- Aggregates must state whether they include `VERIFIED` only, verified plus provisional, or all imported data.
- Drill-down totals must equal the displayed aggregate under the same filters. Automated tests enforce this.
- Forecast reports must distinguish actual, committed, approved, and estimated values.
- If a material exception affects a displayed KPI, attach a visible warning and link to exceptions; do not show a deceptively precise number.
- Exports are immutable snapshots. A later correction creates a new export, not a modified historic file.

## 12. Validation ownership and service levels

| Validation / exception | Owner | Target response |
|---|---|---|
| File/extraction failure | uploader or operations | immediate actionable message; retry/manual path |
| Expense/transaction mapping | CFO/Accounting | before period close or draw preparation |
| Budget/change/contingency | Owner + finance | before changing approved forecast |
| Milestone/inspection evidence | PM | before draw submission/next progress update |
| Draw/lender discrepancy | Owner + CFO | before claiming funds as cleared/available |
| Access/security anomaly | Administrator/security | immediate containment and audit review |

## 13. Required automated tests

- Property-based tests for allocation sums, rounding, reversal, and multi-currency conversions.
- State-machine tests that attempt every invalid transition and permission combination.
- Import fixtures for malformed CSV/XLSX, duplicate statements, blank/hidden rows, locale ambiguity, and formula cells.
- Golden-document tests for key PDFs with page citations, no silent extraction regression, and manual-review fallback.
- Reconciliation tests for short-funded draws, combined deposits, interest reserve, retainage, chargebacks, card settlement, and project-to-project transfers.
- RLS/API tests proving one tenant, investor, GC, or removed user cannot access another scope.
- Report invariant tests: aggregate equals drill-down; original budget never changes; approved draw does not equal funded cash; transfers do not affect P&L.
