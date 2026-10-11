# GroundUp AI Use Cases

## Role-by-role matrix

| Role | Primary goal | Provides | Decides | Sees |
|---|---|---|---|---|
| Owner/Developer | protect profit and make the next decision | setup docs, contract, approvals | budget/change/contingency approval; sharing | full project health and drill-downs |
| CFO/Accounting | reconcile actuals and funding | ledgers, transactions, reviews | match acceptance and financial-data verification | budget/spend/draw/transfer detail |
| Project Manager | keep plan and field reality aligned | milestones, dates, inspection/evidence | progress/delay classification | timeline and related budget context |
| GC | request payment/prove work | claims, photos, invoices where applicable, change requests | submission only | assigned submission status |
| Investor | understand capital and risk | none | none in V1 | owner-shared summary only |

## UC-01: Onboard a project

**Actor:** Owner. **Trigger:** a new acquisition or active project is selected for control.

The owner creates the project, selects lifecycle stage and contract model, uploads the budget/SOV, loan and acquisition documents, and assigns team members. The system creates a missing-data checklist rather than assuming absent details are zero. **Success:** the project has an approved baseline or an explicitly incomplete setup status.

## UC-02: Build an approved budget baseline

**Actor:** Owner with CFO. **Trigger:** lender/GC budget is available.

The user imports the SOV, maps categories/lines, associates major lines with milestones, reviews extracted values, and approves the baseline. **Success:** original values are immutable, with source citations and a current approved version.

## UC-03: Reconcile spend to plan

**Actor:** CFO. **Trigger:** bank/card/expense data arrives.

The CFO imports transactions or expense records. GroundUp proposes vendor and budget-line matches, displays evidence strength and conflicts, and requires approval for material matches. **Success:** confirmed matches update reporting; unmatched/conflicting rows remain in a review queue.

## UC-04: Track a draw from request to cleared funding

**Actor:** Owner/CFO. **Trigger:** a draw is prepared or lender report arrives.

The user creates/imports a draw, attaches draw lines, evidence, inspection and lender feedback. The system tracks requested, recommended, approved, and cleared-funded amounts independently. **Success:** the dashboard shows short funding and open conditions; a bank deposit is allocated only after confirmation.

## UC-05: Record field progress and delay

**Actor:** Project Manager. **Trigger:** status update, inspection, or site visit.

The PM updates a major milestone’s dates/percent, uploads evidence, records inspection state, and attributes a delay. GroundUp estimates the time/carry impact using configured loan assumptions. **Success:** forecast completion and owner alerts update without changing financial facts.

## UC-06: Control an overrun

**Actor:** Owner. **Trigger:** actual/forecast spend exceeds a line.

The system raises an alert. The owner chooses to reject/correct the input, approve a change order, move approved contingency, or leave the amount unapproved. **Success:** the original budget remains intact and the decision changes the current forecast transparently.

## UC-07: Track temporary project-to-project funding

**Actor:** CFO. **Trigger:** one project temporarily supports another.

The CFO records the transfer, linked bank transactions, repayment plan, and review evidence. **Success:** neither project’s revenue/expense/profit is distorted; the outstanding balance appears as a separate exception.

## UC-08: Monitor project economics

**Actor:** Owner. **Trigger:** review cadence or alert.

The owner opens the project control center and compares original versus current pro forma, cash gap, draw status, contingency, completion forecast, sales forecast, and top causes of variance. **Success:** each value drills down to reviewed source records and open exceptions.

## UC-09: Share investor update

**Actor:** Owner. **Trigger:** monthly update or funding event.

The owner reviews a generated summary, edits it, and shares a read-only view. **Success:** investor sees project-level economics/status and next funding event, but not invoices, bank account data, or internal exceptions.

## UC-10: Close out and compare forecast to actual

**Actor:** Owner/CFO. **Trigger:** units sold/project completed.

The team records sale proceeds, selling costs, loan payoff, distributions, and unresolved obligations. GroundUp compares actual profit/ROI with original and last forecast. **Success:** completed-project lessons feed future assumptions while historical records stay traceable.
