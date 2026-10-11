# GroundUp AI Detailed User Flows

## Flow conventions

Each flow identifies the actor, starting condition, main path, branching decisions, outputs, and protections. Roles see only actions appropriate to their scope. Any action that changes verified data, approval state, or investor-visible information is audit logged.

## UF-00: Accept invite and complete adaptive self-onboarding

**Actor:** invited CFO, PM, GC, investor, or admin. **Start:** user receives a time-limited, role/project-scoped invitation.

1. User accepts invite, authenticates, completes MFA/profile, and sees role/project scope.
2. The system asks the first permitted question for that role; it does not display a fixed questionnaire.
3. Each answer evaluates the server-side rule graph and either asks a follow-up, requests a document, creates a delegated task, or proposes configuration.
4. User may answer unknown/not-yet-available with a reason; GroundUp assigns a follow-up task and blocks only dependent gates.
5. When role setup completes, user sees assigned project tasks and activation state.

**Examples:** A CFO who selects “shared bank account” must configure allocation policy; a PM who has no schedule creates a milestone-plan task; a GC with fixed-price terms submits milestone/payment requirements instead of granular invoice rules.

**Output:** a versioned setup record, delegated tasks, and a role-ready state. User cannot change their role/project scope or self-approve high-risk configuration.

## UF-01 Owner creates and configures a project

**Actor:** Owner/Developer. **Start:** a new or existing project needs control.

1. Owner opens Portfolio Dashboard and chooses **Create project**.
2. Enters project entity, address, project type, lifecycle stage, currency, target dates, and unit structure if applicable.
3. Selects construction contract model: open-book, cost-plus, fixed price, milestone based, profit share, or hybrid.
4. Adds internal team and external GC/investor party records with project-scoped roles.
5. Uploads available acquisition, loan, contract, and budget documents or marks each as not yet received.
6. Reviews setup checklist and confirms initial scope.

**Branches:**

- If project identity is ambiguous, save as draft and require organization administrator confirmation.
- If a project already exists at same address, system suggests it but does not merge.
- If contract/budget is absent, project remains `SETUP_INCOMPLETE`; dashboard shows missing baseline instead of financial KPIs.

**Output:** a project workspace, a source-document checklist, and assigned work items.

## UF-02 CFO establishes the financial baseline

**Actor:** CFO/Accounting, then Owner. **Start:** budget/SOV and financing evidence exist.

1. CFO opens Document Inbox and selects imported budget/loan files.
2. Reviews extraction sheet/range, currency, total, line hierarchy, and proposed categories.
3. Maps budget lines to canonical codes and, where useful, major milestone groups.
4. Reviews loan terms: commitment, lender, interest method, reserve, draw constraints, and effective dates.
5. Saves draft baseline and validation report.
6. Owner reviews summary, unresolved differences, and source citations.
7. Owner approves the baseline and loan configuration.

**Branches:**

- If lender SOV differs from owner budget, keep both sources and choose reporting baseline; show variance.
- If totals/line hierarchy fail validation, block approval but preserve draft.
- If only some pages/rows are usable, import valid material into a draft and create a missing-evidence item.

**Output:** immutable original budget, active approved budget view, configured loan terms, and data-quality baseline.

## UF-03 Project manager builds and updates the milestone plan

**Actor:** Project Manager. **Start:** active project with baseline or draft timeline.

1. PM opens Timeline and selects **Create milestone plan**.
2. Creates/accepts major milestones (permits, site work, foundation, framing, mechanical, interiors, completion).
3. Sets planned start/end dates, dependencies, responsible party, and budget category links.
4. Saves plan; owner confirms initial schedule if policy requires.
5. During construction, PM selects a milestone and records actual start/finish, current percent, expected finish, issue/delay cause, and notes.
6. PM uploads photos, permits, and inspection reports; may request verification.
7. The application recalculates forecast date and alerts affected owner/CFO.

**Branches:**

- If dates are missing, show schedule risk as unknown—not zero delay.
- If a forecast moves, require a reason; do not overwrite planned baseline.
- If lender/appraiser evidence disagrees with PM update, show a conflict requiring resolution rather than auto-selecting one.

**Output:** current, evidence-backed progress view and forecast schedule impact.

## UF-04 GC submits a claim, cost evidence, or change request

**Actor:** GC. **Start:** GC is assigned to project and has limited access.

1. GC opens **My submissions** and chooses project/milestone.
2. For fixed/milestone contract, submits a milestone claim with amount, completion statement, photos, and required documents.
3. For open-book/cost-plus project, submits daily update, invoice/cost documents, progress photos, and optional markup details.
4. For scope change, selects **Request change order**, records scope, cost/time effect, rationale, and supporting files.
5. Submits; status becomes `SUBMITTED` and owner/CFO/PM receive the right task.

**Branches:**

- GC cannot directly approve its claim, alter budget, or mark cash as funded.
- Missing required documents keep submission as draft or submit with exception based on project policy.
- Duplicate invoice/claim triggers a warning and finance review.

**Output:** auditable request/evidence package; no automatic payment or budget change.

## UF-05 CFO imports and reconciles spend

**Actor:** CFO/Accounting. **Start:** new bank, card, ledger, invoice, or GC documents exist.

1. CFO chooses **Import data** from Reconciliation Workbench.
2. Uploads/chooses source and maps columns/sheet; sees source totals, date range, errors, duplicates, and coverage warnings.
3. Confirms import into a draft batch.
4. Opens each suggested match and accepts, splits, remaps, excludes, or marks temporary inter-project transfer.
5. Links invoice to payment where supported; marks evidence strength and unresolved receipt/invoice gaps.
6. Reviews remaining unmatched and conflicting rows.
7. Signs off the period only when coverage/reconciliation rules pass or approved exceptions exist.

**Branches:**

- If card settlement and card transactions both exist, card settlement is classified as liability payment, not project spend.
- If one payment serves multiple lines/projects, CFO allocates it; allocations must balance exactly.
- If a source is absent, CFO creates a missing-evidence work item instead of manual “verified” data.

**Output:** reviewed actual spend/cash records, budget variance, exception queue, and period sign-off state.

## UF-06 Owner prepares a draw; lender outcome is reconciled

**Actors:** Owner, PM, CFO. **Start:** completed work needs lender funding.

1. Owner opens Draw Workspace and chooses **Create draw** for loan/period.
2. System proposes eligible budget lines, current progress, supporting evidence, prior funding, retainage, and missing requirements.
3. PM verifies work/inspection status; CFO verifies cost and prior payment evidence; owner selects lines/amounts.
4. Owner reviews packet checklist and exported portal-entry summary, then submits outside GroundUp through lender portal.
5. Owner/CFO imports lender application, inspection, or decision. System creates/updates draw revision with requested/recommended/approved values and lender comments.
6. CFO imports bank statement. When cleared deposit appears, allocates funds to the draw or retains it as unallocated funding.
7. Dashboard shows funded/short-funded status and any resubmission/condition task.

**Branches:**

- Incomplete evidence blocks `submission-ready` according to lender policy but may still create a draft.
- Partial approval keeps original requested amount and creates a shortfall; it never edits spend down.
- Combined deposit is allocated across draws; it cannot mark all draws fully funded by default.
- Rejected draw becomes a child revision when resubmitted; original history remains.

**Output:** traceable draw lifecycle from request through cleared funding and unresolved conditions.

## UF-07 Owner handles an overrun or contingency request

**Actors:** CFO, Owner. **Start:** actual/committed/forecast amount breaches threshold.

1. System creates an alert linked to affected budget line, transactions, milestone, and forecast impact.
2. CFO verifies source and classifies: data error, unbudgeted cost, expected cost increase, or approved change pending.
3. Owner opens decision panel and chooses: correct source, reject cost, approve change order, move contingency, accept unapproved exposure, or request more evidence.
4. Required approver confirms decision.
5. System records a new change/contingency/exception record and recalculates current budget and forecast.

**Branches:**

- Original budget is never overwritten.
- A contingency movement cannot exceed available approved contingency.
- An unresolved overrun remains in forecast as provisional exposure according to policy and remains visible.

**Output:** an accountable decision and updated original-versus-current variance explanation.

## UF-08 Owner reviews project health and publishes investor update

**Actor:** Owner. **Start:** periodic review, alert, or investor reporting date.

1. Owner opens Project Control Center.
2. Reviews profit/ROI trend, cash gap, draw status, milestone forecast, contingency, data-quality state, and top exceptions.
3. Drills into any KPI to see its source records and unresolved dependencies.
4. Selects **Create investor update**; system generates a draft using only approved report data.
5. Owner edits, approves snapshot, chooses recipients/expiry, and publishes.
6. Investor receives read-only notification/link and views the immutable shared snapshot.

**Branches:**

- If report has material incomplete/exception data, publishing requires explicit owner acknowledgement and includes disclosure.
- Investor cannot see bank data, vendor detail, internal notes, or document inbox.
- Owner can withdraw publication; original shared snapshot stays auditable.

**Output:** decision-ready owner review and controlled external communication.

## UF-09 Close out project and calculate actual returns

**Actors:** Owner, CFO. **Start:** project/units sold or construction complete.

1. CFO imports sale/HUD/settlement records, loan payoff, final invoices, retainage release, and investor distributions.
2. System proposes unit and disposition allocations; CFO reconciles all proceeds/costs to settlement and cash evidence.
3. Owner reviews unresolved liabilities, warranty/claim reserve, outstanding transfers, and final draw status.
4. System compares original plan, last forecast, and actual total project cost, net proceeds, profit, ROI, and eligible IRR.
5. Owner approves closeout or grants an explicit closeout exception.
6. Project becomes read-only for ordinary operations; authorized post-closeout adjustments use a dedicated adjustment workflow.

**Branches:**

- Project cannot be silently closed with material unallocated cash or open draw condition.
- Post-sale warranty cost creates a labelled post-closeout adjustment, not a changed historic total.
- IRR is withheld as `NOT_MEANINGFUL` when required dated cashflows are absent.

**Output:** auditable closeout, return analysis, and reusable completed-project benchmark.

## UF-10 Investor reads a project update

**Actor:** Investor. **Start:** owner shares a published update.

1. Investor authenticates or opens controlled invitation.
2. Sees only shared projects and published snapshots/current allowed summary.
3. Reviews high-level project stage, original/current economics, progress, risks, sales status, and next funding event.
4. Can download permitted published report or contact the owner through configured channel.

**Restrictions:** no editing, raw-document access, invoice/vendor detail, bank data, internal tasks, or other investor data.

## Full journey summary

```text
Create project → establish budget/loan baseline → plan milestones
→ collect evidence and reconcile actuals → prepare/reconcile draws
→ monitor forecast and decide on changes → publish investor updates
→ record sale/payoff/distributions → reconcile closeout and actual return
```
