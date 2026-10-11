# GroundUp AI Detailed Screen Specification

## Screen system and navigation

The product uses a portfolio-first desktop layout for Owner/CFO work and responsive/mobile-first capture for PM/GC evidence. Every project screen includes a project switcher, lifecycle badge, as-of timestamp, data-quality indicator, global alert count, and source-linked drill-downs. Navigation is permission-aware: hiding a menu does not replace API/database authorization.

**Primary navigation:** Portfolio · Projects · Documents · Reconciliation · Draws · Reports · Alerts · Administration. Inside a project: Overview · Setup · Budget · Transactions · Draws · Timeline · Documents · Economics · Closeout.

## Global and shared screens

### S-01 Sign in and organization selection

**Users:** all roles. **Purpose:** establish authenticated organization and project scope.

- Sign in/SSO, MFA when configured, invitation acceptance, password recovery.
- Organization selector appears only for users belonging to more than one organization.
- Errors: expired invite, deactivated account, insufficient organization membership, required MFA.
- On success, route user to their role-appropriate default screen; audit sign-in and sensitive export sessions.

### S-01A Invitation acceptance and adaptive onboarding

**Users:** invited Owner-admin, CFO, PM, GC, investor, or admin. **Purpose:** complete scoped self-onboarding without burdening the owner.

- Shows organization, assigned role, project scope, invite expiry, security requirements, and privacy/terms acknowledgements.
- One-question-at-a-time experience; each answer can reveal a next question, require an upload, create a task, or show why a step is needed.
- Supports `unknown`, `not yet available`, and `not applicable` with reason and accountable follow-up task.
- Progress displays readiness by outcome, not a fake universal completion percentage: for example, “you can update milestones” while “finance reporting awaits account mapping.”
- User cannot select a different role, grant access, or bypass a server-side question/approval rule.

### S-02 Portfolio dashboard

**Users:** Owner, CFO; read-only summary for permitted PM.

- Project cards/table: stage, original/current profit and ROI, current forecast completion, cash/funding gap, next draw, contingency, data-quality score, and top severity alert.
- Filters: stage, lender, contract model, risk, owner, data-quality state, and reporting as-of date.
- Actions: create project, open project, export permitted summary, save filter/view.
- Empty state directs owner to create/import a project; missing baseline shows `SETUP INCOMPLETE`, not $0 metrics.

### S-03 Global alerts and task center

**Users:** all, scoped by role/project.

- Tabs: My tasks, Exceptions, Approvals, Mentions, Resolved.
- Each item shows severity, project, owner, age, source context, impact, and allowed action.
- Actions: assign, resolve, waive with reason/expiry, request evidence, navigate to record.
- Deduplicate repeated alerts; notifications never resolve an alert automatically.

### S-04 Audit history and report snapshots

**Users:** Owner, authorized CFO/admin.

- Timeline of changes with actor, timestamp, record, old/new values, source, rationale, and correlation/import batch ID.
- Filter by project/entity/action/user/date; export only with required permission.
- Read-only published reports show filter/as-of snapshot and cannot be changed in place.

## Project setup screens

### S-05 Create project wizard

**Users:** Owner.

**Steps:** identity → lifecycle/unit setup → contract/GC → loan and economics → team/access → source checklist → confirmation.

- Required at creation: project name, project entity, address, currency, lifecycle stage, owner.
- Optional fields remain visibly incomplete; wizard does not force fabricated values.
- Conflict check suggests similar entity/address projects but requires an explicit user choice.
- Save draft at any step; creation emits audit event and routes to Project Setup.

### S-06 Project setup and source checklist

**Users:** Owner, CFO; PM sees schedule-specific items.

- Sections: identity, acquisition, financing, contract, budget, timeline, bank/card accounts, disposition, team.
- Each requirement status: not received, uploaded/unreviewed, reviewed, contradicted, not applicable, waived with reason.
- Each item has owner, due date, source link, requested-by, and “request document” action.
- Completion bar is evidence-aware: blank fields do not count as complete.

### S-06A Onboarding orchestration and readiness

**Users:** Owner/Admin; each role sees only its assigned tasks.

- Displays configuration decision tree: project stage, financing path, loan/interest model, GC contract model, account model, disposition/investor path.
- Shows generated role tasks, required documents, answer status, owner, due date, gate impact, and required approval.
- Owner actions: invite/resend/revoke, reassign task, approve/reject high-risk configuration, waive a requirement with reason/expiry.
- Each configuration card shows current effective answer, source/evidence, question/rule version, and change history.
- Distinguishes `ACTIVE`, `READY_FOR_APPROVAL`, `BLOCKED`, and `INCOMPLETE`; project need not wait for unrelated role tasks.

### S-07 Team, parties, and access

**Users:** Owner/admin.

- Tabs: internal team, GC/vendors, lenders, investors, buyers/other parties.
- Project roles, effective dates, restricted scopes, invitation status, and audit history.
- Owner can invite, modify, revoke, or resend invitation; cannot alter historical audit attribution.
- Investor/GC role selection previews exactly what data they will be able to see/do.
- Supports email invite, expiring project-scoped link, and enterprise bulk invitation. Role escalation, project-scope increase, and admin access require authorized approval.

### S-08 Loan and contract configuration

**Users:** Owner, CFO.

- Contract model, contract total, GC fee/markup, retainage, payment rules, change-order rules, and linked source contract.
- Loan terms: lender, commitment, interest/payment method, interest reserve, rates, draw policy, effective dates, source documents.
- Displays extraction suggestions side-by-side with user-confirmed fields.
- Term amendments create versions; prior terms remain visible. Forecast is blocked as complete when required terms are missing.

## Document and data-intake screens

### S-09 Document inbox

**Users:** Owner, CFO, PM based on scope.

- Table/card list: file name, source, project candidate, type, date, ingestion/review state, confidence, duplicate/misfiled flag, uploader, and related entities.
- Filters: project, document type, state, duplicate/conflict, source, owner, date; bulk assign/review where permission allows.
- Actions: upload, assign project, classify, mark duplicate/misfiled, open review, create manual source-linked record.
- Quarantined/corrupt files expose a replacement/request path, never a blank preview pretending success.

### S-10 Document review and extraction

**Users:** Owner/CFO/PM according to document type.

- Three panes: document list/context; secure page/spreadsheet preview; extracted fields/table candidates and proposed links.
- Field rows show raw source, normalized value, confidence, page/row citation, status, and reviewer decision.
- Actions: accept, edit, reject, split document pages, link to project/entity, mark misfiled/duplicate/irrelevant.
- Footer shows import impact preview: records to create/update, totals, warnings, and required approval.
- Cannot apply an extraction whose material required fields are invalid; user can save a reviewed partial draft with missing-data tasks.

### S-11 Import wizard and batch results

**Users:** CFO, Owner for permitted sources.

- Select source type (bank/card/ledger/budget/transactions), upload file, choose sheet/range, map columns, select locale/currency, and preview parsed rows/totals.
- Validation screen shows accepted, warning, and rejected rows with downloadable error file.
- Commit screen requires explicit decision for partial import and idempotency/duplicate warning acknowledgement.
- Batch details retain source metadata, mapping version, totals, rows, errors, actor, and resulting records; supports safe retry.

## Core financial-control screens

### S-12 Project control center

**Users:** Owner; CFO sees financial detail; PM sees assigned operational details.

- Header: project identity, stage, contract model, as-of, data quality, and quick actions.
- KPI band: original/current forecast profit, ROI, total forecast cost, cleared lender/equity funding, funding gap, forecast completion, delay days, contingency remaining.
- Decision panels: top variance drivers, open draw conditions, milestone risks, evidence gaps, outstanding transfers, and near-term approvals.
- Every number opens a scoped drill-down showing contributing actual/committed/estimated values and sources. Incomplete inputs display warning and methodology—not precision theater.

### S-13 Budget/SOV workspace

**Users:** Owner, CFO; PM read-only context.

- Hierarchical expandable grid: code/name, original, approved current, committed, actual, requested, approved, funded, remaining, variance, lender eligibility, evidence/review state.
- Scenario selector: original baseline, current approved, selected historical revision; no one edits original approved values inline.
- Line detail drawer: source documents, mapping history, transactions, invoices, draw lines, milestone/evidence, changes, alerts.
- Actions: import revision, propose line mapping, create change order, request contingency movement, export.
- Invariants displayed: child/parent rollup totals, unbudgeted costs, overrun exposure, duplicate-line warning.

### S-14 Change orders and contingency

**Users:** Owner, CFO; GC can submit requests.

- Separate tabs for change orders and contingency movements with status/lifecycle filter.
- Form captures scope, cost, schedule impact, cause, source/evidence, linked lines, effective date, approver.
- Approval screen shows original/current/after-change forecast impact and available contingency.
- Actions: submit, approve, reject, withdraw, supersede; completed decision writes immutable adjustment and audit event.
- Pending/denied request never changes approved budget but can appear as forecast risk if policy enables it.

### S-15 Transactions and spend ledger

**Users:** CFO; Owner summary; PM restricted context.

- Views: all transactions, spend records, invoices, payment status, card activity, reversals/refunds.
- Columns: source/date/posted date, vendor, memo, gross, allocation, evidence strength, budget/milestone, payment/review/reconciliation status.
- Actions: open source, approve/reject match, split allocation, link invoice/payment, create adjustment, flag personal/shared charge.
- Totals distinguish obligations, cleared cash, cards, refunds, and unallocated amount.

### S-16 Reconciliation workbench

**Users:** CFO.

- Queue tabs: suggested matches, unmatched cash, potential duplicates, statement coverage, invoice-payment gaps, exceptions, inter-project transfers.
- Side-by-side source comparison with matching reasons/confidence and linked source documents.
- Actions: accept full/partial match, split, remap, exclude with reason, create transfer, request evidence, mark false duplicate.
- Period-close panel shows opening/activity/closing balance proof, completion percentage, material exceptions, and finance sign-off.
- Guardrail: a record may be saved as provisional but cannot become verified/reconciled without required evidence/reviewer.

### S-17 Inter-project transfer ledger

**Users:** CFO, Owner.

- Lists temporary loan/capital/reimbursement transfers with from/to project, source transaction, amount, date, outstanding/repaid, status, owner, and evidence.
- Actions: create/confirm transfer, allocate repayments, dispute, attach documentation, close only when balance is zero or waived.
- Shows transfers separately from project P&L and funding KPIs to prevent false revenue/expense.

## Draw and construction screens

### S-18 Draw dashboard

**Users:** Owner, CFO; PM sees evidence tasks.

- Draw timeline/table: internal/lender identifiers, revision, period, requested/recommended/approved/funded, status, expected cash date, shortfall, conditions, data quality.
- Quick actions: create draft, import lender outcome, open packet, allocate deposit, export draw history.
- Banner distinguishes approved but unfunded, partially funded, and fully funded; never uses status color alone for cash reality.

### S-19 Draw workspace and packet checklist

**Users:** Owner, CFO, PM.

- Header: lender/loan, draw revision lineage, period, current status, role approvals, lender portal reminder.
- Line grid: budget line, prior funded, current requested/recommended/approved/funded, evidence, inspection finding, lender comment, holdback, shortfall reason.
- Packet checklist: invoices/receipts, photos, inspections, lien waivers, forms, conditions, missing owner; each item links to source/upload/request task.
- Actions: add/remove line, attach evidence, route verification, save draft, mark submission-ready, export portal-entry summary, record external submission.
- Cannot mark submission-ready when mandatory conditions fail; can save incomplete draft with visible blockers.

### S-20 Draw decision and funding allocation

**Users:** CFO, Owner.

- Decision view compares requested vs inspector recommendation vs lender approval and explains adjustments per line.
- Funding tab lists cleared candidate deposits, fees/interest offsets, allocations, remaining amount, and deposit proof.
- Actions: import decision, create draw revision, allocate/split deposit, record unallocated funding, record lender condition, initiate shortfall follow-up.
- Status changes to partial/full funded only from cleared allocated cash according to policy.

### S-21 Timeline and milestone board

**Users:** PM, Owner; GC limited assigned action.

- Gantt/list/board modes by major budget category. Columns: baseline dates, actual dates, forecast, progress, dependency, responsible party, funding/evidence state, inspection, delay impact.
- Actions: create/update milestone, reorder dependency, set progress, change forecast with reason, link budget lines, attach evidence.
- Baseline and forecast remain visually distinct. Unknown dates are shown as unknown; no false zero-delay state.

### S-22 Milestone detail and field update

**Users:** PM, GC limited; Owner read-only/approval where required.

- Shows plan/current status, budget rollup, spend/funding context, evidence gallery, inspections, delay events, and audit trail.
- Mobile field form supports photo capture/upload, notes, percent, actual/forecast dates, issue/cause, and request verification.
- Validates date order and 0–100 progress; reduction of progress requires correction reason.
- Photo metadata is displayed but not treated as unquestionable proof.

### S-23 Inspections, permits, and evidence register

**Users:** PM, Owner, CFO read-only draw relevance.

- Register lists permit/inspection/evidence type, scope, date, status, responsible party, expiration, linked milestone/draw/line, and source.
- Append-only inspection event history supports scheduled, passed, failed, delayed, cancelled, and reinspection.
- Alerts on missing/failed/expired evidence; actions request follow-up, upload report, link condition to draw.

## Economics, reports, and external screens

### S-24 Project economics and forecast

**Users:** Owner, CFO.

- Original/current/actual tabs with cost and revenue model: acquisition, construction, soft cost, financing/interest, taxes/insurance/carry, sales, commissions/closing, payoff, net proceeds, profit, ROI, IRR when meaningful.
- Waterfall and variance explanation: budget changes, actual variances, schedule/carry impact, loan assumptions, disposition changes, missing data.
- Inputs show actual/committed/approved/estimated/missing basis; user may change approved forecast assumptions only through versioned plan/assumption workflow.
- Alerts on negative profit, ROI drop, reserve exhaustion, or incomplete forecast.

### S-25 Units, sales, and closeout

**Users:** Owner, CFO.

- Unit list: planned/contracted/sold state, buyer (restricted), contract/close/cash dates, sale price, allocation of costs, source settlement.
- Closeout checklist: final draw, loan payoff, retainage, warranties/claims, final bills, transfers, distributions, unresolved exceptions.
- Actual profitability comparison and post-closeout adjustment log.
- Project close is blocked or explicitly exception-approved when material unresolved items exist.

### S-26 Investor publication manager

**Users:** Owner.

- Generates a draft from approved report snapshot; owner edits narrative and selects recipients, expiry, visibility, and disclosure text.
- Preview clearly redacts vendor, bank, internal task, and confidential source details.
- Actions: approve/publish, resend, withdraw, view access history. Every publication uses frozen values/as-of date.

### S-27 Investor portal

**Users:** Investor.

- Read-only project cards and published updates: project phase, selected progress, approved economics summary, high-level risk, sales status, next funding event, report downloads.
- No raw documents, bank details, vendor data, internal exception detail, or edit capability.
- Empty state explains that owner has not yet shared an update; invite and access errors are explicit.

### S-28 Reports and exports

**Users:** Owner, CFO, permitted PM/investor summary only.

- Templates: budget vs actual, draw history, funding gap, reconciliation status, milestone/schedule, forecast vs actual, investor update, closeout.
- Filter panel: project/unit, period, currency, source/review inclusion, baseline/scenario, as-of date.
- Preview requires report totals equal drill-downs; exported file includes filters, as-of, quality state, methodology, and warning list.

## Administration screens

### S-29 Organization settings and policy

**Users:** Organization admin.

- Currency/default timezone, roles, approval thresholds, document requirements, evidence policy, data-retention policy, notification policy, and integration credentials.
- Changing policies is versioned and effective-dated; historical report logic remains reproducible.

### S-30 Integrations and import templates

**Users:** Admin, CFO.

- Bank/card/accounting connection state, scopes, last sync, error/retry history, account-to-project mapping, and import templates.
- Manual import stays available if connector fails. Sync errors cannot delete existing transactions.

## Cross-screen UX rules

- Money always has currency, data basis, source/review state, and as-of date.
- Status badges expose meaningful differences: draft, submitted, approved, cleared-funded, verified, provisional, conflicted, and missing—not generic “complete.”
- All destructive-looking actions use reversible status/adjustment flows for financial records and clear confirmation for drafts.
- Tables support filters, saved views, column controls, export, accessible keyboard operation, and no data loss during navigation.
- Mobile is required for capture/review tasks; complex reconciliation, budgeting, and forecasting are desktop-first.
