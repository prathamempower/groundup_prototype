# GroundUp AI Problem Statement

## The problem to solve

Real-estate developers running ground-up and heavy-rehab projects cannot reliably answer four operating questions from their current files: **What did we plan to spend? What have we actually spent? What has the lender funded? What will we now make?** Budgets, lender draw forms, operating-bank statements, credit-card activity, inspections, photos, acquisition closing documents, and sale documents live in separate files and are reconciled manually after the fact.

The result is delayed visibility into cost overruns, short-funded draws, missing evidence, schedule slips, interest/carry exposure, and changes to projected profit. A developer may know that work is progressing but still not know whether that work has been paid, is draw-eligible, or has reduced the expected investor return.

GroundUp AI is an owner-side financial control layer. It turns project records into a traceable, reviewable view of the complete lifecycle: acquisition → financing → construction → draw funding → sale/disposition → investor return. It does not replace a lender portal, accounting system, or construction-management suite.

## Evidence from the supplied material

The supplied records validate the problem but are not a clean source of truth:

- **73 Broadway** contains a construction budget, loan/closing material, lender inspection reports, BCB and Columbia statements, and an accounting workbook. The lender reports demonstrate that a requested draw can be adjusted by inspection and then funded at a lender-specific percentage; requested, approved, and funded are therefore distinct facts.
- **392 First Street** is the strongest completed-project reconstruction sample: acquisition/HUD material, loan report, draw data, operating-bank statements, card activity, and sale/HUD material. The loan report identifies 15 draws, while the query log flags a 2024 draw date that is not yet corroborated by the available statements.
- **161 Woodlawn Ave** is incomplete and should not be the first source-of-truth pilot. It has a workbook and statements, but the requested loan, draw, invoice, schedule, and closeout evidence is not present. A misfiled `Budget for 73 Broadway` document appears inside this project folder.
- The query sheet contains **13 unresolved or pending questions**, including missing vendor invoices, loan approval/draw support, investor formula, account/project inventory, and partial-draw treatment. These are product requirements for exception handling—not facts the system may invent.

## Product thesis

At any point in a project, GroundUp AI should tell the owner:

1. the original expected profit and return;
2. the current forecast and the variance from the original;
3. the budget, spend, funding, schedule, and evidence behind that forecast; and
4. the exact items requiring a human decision or missing support.

## Non-negotiable truth model

Four truths remain separate and are reconciled only in reports:

| Truth | Meaning | Examples of evidence |
|---|---|---|
| Budget | Approved plan | budget/SOV, approved change order, contingency transfer |
| Spend | Actual obligation or cash outflow | invoice, signed contract, cleared check, card transaction |
| Funding | Cleared lender or equity cash | draw decision, cleared bank deposit, equity contribution |
| Progress | Work performed and schedule status | photos, inspection, GC confirmation, appraiser report |

AI can extract and propose links. It must never silently alter financial facts, treat an approved draw as funded cash, or classify a transfer between projects as project revenue or expense.

## Success criteria for the first release

- Reconstruct one completed project (392 First Street) with every material value linked to a source document/transaction and a reconciliation status.
- Run one live project prospectively (73 Broadway) from document upload through draw tracking, variance review, and forecast updates.
- Surface missing/contradictory records and short-funded draws as work items instead of hiding them.
- Give the owner a credible original-versus-current profit forecast with a visible explanation of change.
