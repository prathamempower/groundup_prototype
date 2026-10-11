# GroundUp AI Edge Cases and Failure Handling

## Purpose

Construction-finance data is incomplete, late, duplicated, and frequently described differently by the lender, contractor, accountant, and bank. GroundUp AI must preserve the uncertainty, route it to the correct person, and prevent a misleading dashboard. It must not “repair” a conflict by choosing a value automatically.

## Universal handling policy

For every edge case, the system must:

1. retain the original file/import and its source location;
2. show the record as `NEEDS_REVIEW`, `CONFLICTED`, `MISSING_EVIDENCE`, or `EXCLUDED` rather than silently dropping it;
3. prevent the record from entering a verified rollup until an authorized user resolves it;
4. record the resolution, actor, timestamp, rationale, and links to supporting evidence;
5. recalculate affected reports with an `as_of` time and visible data-quality status.

## 1. Tenant, project, and identity

| Edge case | Required behavior |
|---|---|
| Same street address, different project entity or phase | Treat entity + project ID as the identity; address is only an attribute. Never merge by address alone. |
| Address changes because of lot merger, unit conversion, correction, or abbreviation | Keep aliases/address history and require owner confirmation before moving documents. |
| One document covers multiple properties/projects | Store once; create explicit allocations or links. Do not duplicate its financial total into each project. |
| One project has several entities/accounts | Support multiple parties and accounts under a project with ownership/role dates. |
| A vendor is renamed, acquired, or uses several DBA names | Maintain canonical vendor plus aliases; suggestions require finance confirmation. |
| User changes employer/role or is removed | Revoke future access immediately; preserve historical author/audit attribution. |
| Investor should only see one project/unit | Enforce project/unit scopes in database authorization; do not depend on hidden UI controls. |

## 2. File intake, document quality, and extraction

| Edge case | Required behavior |
|---|---|
| Same file uploaded twice with a different name | Detect exact hash duplicate, link to original, do not re-create records. |
| Same statement uploaded as PDF and image/OCR copy | Flag likely semantic duplicate; allow a reviewer to retain the clearer source. |
| Misfiled document (for example, 73 Broadway budget in Woodlawn folder) | Mark `MISFILED`, preserve upload provenance, relink only after review, and exclude from destination totals until confirmed. |
| Wrong document type or document belongs to another organization | Quarantine and require an authorized administrator to reclassify/delete according to retention policy. |
| Password-protected, corrupt, empty, scanned sideways, or unreadable file | Store intake failure reason; request a replacement; never produce zero-value extraction. |
| Multi-page package includes unrelated documents | Classify page ranges/child documents while retaining one immutable parent upload. |
| OCR confuses decimal point, minus sign, dates, check numbers, or currency | Display page crop/citation and confidence; do not auto-post money values below the configured review threshold. |
| Lender report has a total inconsistent with its lines | Record document total and line total separately; create reconciliation exception. |
| XLSX includes formulas, hidden rows, filtered rows, merged cells, or multiple sheets | Preserve original workbook; import values plus formula metadata; user selects sheet/range and receives a row-count/total preview. |
| XLSX/CSV contains macros or unsafe formulas | Do not execute macros; sanitize display; treat formulas as untrusted content. |
| Email body and attachment disagree | Ingest each as distinct evidence and flag the contradiction. |
| A document is later replaced/corrected by lender/GC | Create a successor version with reason and effective date. Do not overwrite original extraction or approved records. |

## 3. Money, dates, and imported transactions

| Edge case | Required behavior |
|---|---|
| `1,200.00`, `1.200,00`, `$1,200`, or parentheses negatives | Normalize using detected locale only after preview; retain raw string and parsing rule. Ambiguity blocks import approval. |
| Blank amount or non-numeric amount | Reject that row with a precise error; import valid independent rows only when user explicitly accepts partial import. |
| Amount is zero | Allow only for a valid informational/voided record; require status/reason so zero is not treated as missing. |
| Negative spend, reversal, credit, returned check, chargeback, or refund | Represent a separate reversal/credit linked to original record; never edit historical amount in place. |
| Debit/credit sign differs between bank and accounting exports | Use source account direction and normalized `money_in`/`money_out`; preview net and gross totals before commit. |
| Posted date differs from transaction date | Store both. Reconciliation uses a configurable date window and shows which date drives a report. |
| Duplicate transaction appears in overlapping statements | Deduplicate using provider/external ID first, then account/date/amount/check-number heuristic; ambiguous matches stay in queue. |
| Same transaction split across two budget lines/projects | Use explicit allocation records that sum exactly to source transaction amount. |
| Foreign currency, exchange fee, or multicurrency transaction | Store source amount/currency, FX rate/source/date, and functional-currency amount; never silently convert. |
| Bank statement is missing months or has an empty export | Mark coverage gap; do not claim “fully reconciled” for affected period. |
| Opening/closing balances do not reconcile | Flag statement-level exception; retain transaction imports but label coverage/integrity issue. |
| A stale ledger export is reimported | Use import fingerprint and source/as-of date; create no duplicate transactions and warn if it predates existing source data. |

## 4. Budget, contract, change order, and contingency

| Edge case | Required behavior |
|---|---|
| Original budget total differs from lender SOV | Store as separate baselines with purpose/source; require the owner to choose reporting baseline. Never overwrite either. |
| Budget has subtotal/total rounding difference | Apply documented rounding tolerance only; show material variance as exception. |
| Budget line is renamed, split, combined, or renumbered in a revision | Preserve stable internal ID and create line-mapping records. Do not assume matching by label/code. |
| A line appears in expenses but not in budget | Create `UNBUDGETED` exception; require change order, contingency movement, or explicit exclusion. |
| Change order is pending, rejected, verbal, or approved after work started | Track requested/approved/effective states independently. Only approved effective amount changes current approved budget. |
| Change order affects schedule but not cost | Permit zero-cost change with time impact and evidence. |
| Contingency movement is requested but original category needs more work later | Track remaining contingency and destination allocations; reverse via a new approved movement, never mutate history. |
| Lender refuses soft costs/contingency but project budget includes them | Maintain lender-eligible and project-approved views; funding gap must use lender eligibility. |
| GC markup/fee is embedded in costs vs a separate line | Configure contract method and mapping rules; avoid double-counting markup. |
| Fixed-price contract has a material invoice detail request | Allow attachment/review but do not require granular subcontractor reconciliation for payment eligibility unless contract/lender policy says so. |

## 5. Draws, inspections, retainage, and lender funding

| Edge case | Required behavior |
|---|---|
| Same draw number is reused, skipped, or uses lender-specific application vs inspection numbers | Use internal draw ID plus lender draw/reference fields; do not rely on sequence alone. |
| Draw is revised before decision | Create child revision, mark previous revision superseded, keep links to both documents. |
| Draw line requested amount exceeds line budget | Block submission-ready status unless approved change/reallocation exists; allow draft with warning. |
| Draw line is approved less than requested | Preserve requested, recommended, approved, and shortfall reason. Do not reduce the underlying expense. |
| Lender funds a percentage of approved work | Store lender policy/funding percentage and actual funded amount separately; never derive deposit as a certainty from approval. |
| Lender deposit combines several draws or includes fee/interest offsets | Allocate confirmed portions to draw fundings; leave unallocated amount in reconciliation queue. |
| Draw is approved but deposit has not arrived | Status remains `APPROVED`, not `FUNDED`; alert based on expected funding date. |
| Deposit arrives before draw document | Import cash as `UNALLOCATED_FUNDING`; finance links it after evidence arrives. |
| Partially approved draw is resubmitted | Link the resubmission to original draw and specify whether it requests the shortfall, new work, or both. |
| Inspection denies work due to missing photos or incomplete work | Capture lender comment/condition against the line; do not infer that no expense occurred. |
| Inspector’s reported percent conflicts with PM progress | Display both sources and flag a progress conflict; owner/PM resolves forecast, not historical report. |
| Retainage shown in AIA but lender does not hold retainage | Track contractual retainage and lender funding policy separately. |
| Interest reserve pays interest | Record interest expense and reserve reduction; do not create a cash-bank debit if none occurred. |
| Monthly out-of-pocket interest is paid late or capitalized | Record accrual, payment, and capitalization events separately; update cash and profit forecasts accordingly. |
| Loan is refinanced, modified, assigned, or paid off | Close/supersede terms with effective date and open a new loan/term version; preserve draw history under original loan. |

## 6. Spend, invoices, cards, and payments

| Edge case | Required behavior |
|---|---|
| One invoice is paid by multiple checks/cards | Record invoice-to-payment allocations; invoice cannot be marked fully paid until allocations equal amount within tolerance. |
| One payment covers several invoices/vendors or includes sales tax/shipping | Support one-to-many allocations and separate unallocated/tax components. |
| Invoice total, purchase order, and payment amount differ | Show three amounts and variance reason; no automatic “paid in full.” |
| Duplicate invoice number from different vendors | Unique key is vendor + invoice number + project/account context, not invoice number alone. |
| Vendor invoice covers more than one project | Require project allocations and evidence; do not assign whole invoice to first selected project. |
| Personal charge appears on project card or business charge on personal card | Flag category/ownership exception; require finance disposition and prevent automatic project cost inclusion. |
| Check memo identifies a trade but no invoice exists | Allow provisional spend with `BANK_TRANSACTION` evidence strength; make missing invoice an open exception. |
| Cash payment, petty cash, or reimbursement | Require payee, approver, evidence, amount, date, and reimbursement status; default to heightened review. |
| Voided/reissued check | Link replacement and void records; protect against double-counting payment. |
| Credit card statement payment is imported along with individual card purchases | Identify card payment as liability settlement; do not count both as construction expense. |
| Accrual is booked before payment | Track obligation and cash separately, with status and linkage. |
| Expense belongs to a completed/sold project after closeout | Allow post-closeout obligation with period tag and re-open approval; report it as closeout adjustment. |

## 7. Schedule, progress, permits, and evidence

| Edge case | Required behavior |
|---|---|
| Milestone has no planned dates | Mark schedule incomplete; do not calculate delay as zero. |
| Actual finish precedes actual start or progress is over 100% | Block save with actionable validation error. |
| Planned duration changes due to approved schedule change | Version the baseline/forecast and preserve why dates moved. |
| Multiple dependencies delay one milestone | Support many causes and dependencies; avoid forcing a single blame label. |
| Weather/force majeure/owner decision causes delay | Use neutral cause taxonomy and evidence; do not assign fault automatically. |
| Photo upload has unreliable metadata or is reused across milestones | Store capture/upload times separately; hash/perceptual-dedupe; require user assignment/verification. |
| Inspection is scheduled, failed, then passed | Preserve each inspection event; status is derived from latest event but history remains visible. |
| Permit expires or has different parcel/unit scope | Alert owner/PM; do not attach it to all units by default. |
| Project is paused, abandoned, or resumed | Pause forecast rules with explicit dates/reason; interest/carry model continues only as configured. |

## 8. Acquisition, sale, equity, and returns

| Edge case | Required behavior |
|---|---|
| Acquisition purchased in cash then financed later | Capture acquisition and construction loans separately; link only through project economics. |
| One closing statement includes several units or projects | Use allocations; keep raw settlement values and allocation method. |
| Sale contract, closing date, and cash received occur on different dates | Store contract, close, and settlement/cash dates separately. |
| Unit sells below forecast or deal falls through | Update only current disposition forecast; preserve original assumption and history. |
| Loan payoff includes prepayment penalty/interest adjustment | Record as separate disposition/financing cost with source. |
| Investor contributes cash, services, or property | Track contribution type and valuation/evidence; only cash counts toward cash-flow ROI/IRR unless policy states otherwise. |
| Distributions do not follow ownership percentages | Allow waterfall/distribution terms and manual approved allocations; flag variance from default ratio. |
| Investor return has negative cash flows, uneven dates, or no exit | ROI can be shown; IRR requires dated cashflows and must show `NOT_MEANINGFUL` where mathematics or data is insufficient. |
| Completed project is reopened due to warranty/claim | Create post-closeout adjustment period and identify it separately in actual profitability. |

## 9. Workflow, access, and operational failures

| Edge case | Required behavior |
|---|---|
| Two users edit/reconcile same record | Use optimistic locking/version number; second user sees conflict and must refresh/merge. |
| User loses network during upload/import | Resume or fail safely using idempotency key; do not create partial canonical records. |
| Background extraction times out or provider is unavailable | Keep document `PROCESSING_FAILED`, retry safely, expose error and manual-entry fallback. |
| Notification is undeliverable or duplicated | Track delivery state; notifications never change business status. |
| Unauthorized user guesses a record/download URL | API and storage must deny by tenant/project permission; log access denial. |
| User deletes a reviewed record by mistake | Financial and approved records are reversed/superseded, not hard-deleted; drafts may be soft-deleted with audit trail. |
| Invite is forwarded, expired, revoked, or accepted by the wrong person | Require authentication plus email/domain verification; enforce invite scope/expiry/revocation and let the owner resend a new invitation. |
| User selects “unknown” just to bypass onboarding | Allow unknown only with reason and assigned follow-up owner; block only workflows that depend on the missing decision. |
| A changed onboarding answer invalidates workflow configuration | Create a new effective configuration version, reopen affected readiness gates, alert approvers, and preserve prior decision history. |
| LLM prompt injection appears in uploaded text | Treat document text as data only; extraction workers do not execute instructions or access unrelated data. |
| AI model changes its extraction format/quality | Pin extraction schema/model version, run regression corpus, and route failures to review. |
| Report is exported while data changes | Export carries a consistent as-of snapshot, filter parameters, and data-quality disclaimer. |

## Escalation and blocking matrix

| Condition | Can save draft | Can affect verified dashboard | Can mark period reconciled | Required action |
|---|---:|---:|---:|---|
| Missing optional attachment | Yes | Yes, with warning | Yes | track checklist item |
| Missing required source for material money value | Yes | No | No | upload/approve supporting evidence |
| Duplicate suspected | Yes | No for duplicate candidate | No if material | finance review |
| Conflicting values | Yes | No for affected rollup | No | select/justify source or create adjustment |
| Out-of-balance allocation | No | No | No | correct allocations |
| Approval/funding conflict | Yes | Show as exception only | No | reconcile lender document and cleared cash |
| Unauthorized state transition | No | No | No | use correct role/approval workflow |
