# Dataset Feasibility Assessment

## Decision

The GroundUp AI plan is feasible for the supplied material **if it is delivered as a source-led reconciliation product, not as a one-click spreadsheet conversion tool**. The files support the planned Budget, Spend, Funding, Progress, Acquisition, and Disposition workflows. They also demonstrate why the product must preserve raw rows, parse document-specific facts, and require review before producing verified totals.

The best pilot order is:

1. **392 First Street** — completed-project reconstruction and closeout validation.
2. **73 Broadway** — live-project monitoring, bank/draw reconciliation, and evidence workflow.
3. **161 Woodlawn Ave** — controlled retrospective import after missing loan, draw, invoice, schedule, and sale/closeout records are supplied or formally waived.

## Dataset inventory reviewed

| Project | Structured files | PDFs | What is usable now | Material gaps / caution |
|---|---:|---:|---|---|
| 392 First Street | 2 XLSX, 5 extracted Markdown files | 48 | partner funding, unit sales, categorized expenses, internal transfers, card activity, loan report with 15 draws, one draw/inspection package, BCB statements, HUD statements | source-led matching needed; ledger categories and workbook formulas are not proof; some date ordering is not chronological |
| 73 Broadway | 2 XLSX, 10 Markdown/TXT extracts | 54 | partner ratios/funding, categorized project ledger, inter-project transfers, land/acquisition data, budget, loan/commitment material, AIA, inspection reports, BCB and Columbia statements | account/statement coverage and supporting invoices remain incomplete; source has an anomalous 2020 date and inconsistent sign conventions |
| 161 Woodlawn Ave | 1 XLSX | 26 | partner funding, categorized expenses, loan payments, unit-sale sheet structure, 2024–2026 Bank of America statements | no draw package/loan agreement/inspection/GC schedule or invoices in current folder; a `Budget for 73 Broadway` PDF is misfiled in this project folder |

The corpus contains 128 PDFs across the three projects. Raw PDFs must remain private source evidence; extracted Markdown/TXT is helpful for search/review but cannot replace the original PDF.

## What the source workbooks prove about implementation

### 1. Import by source row, not by worksheet total

The three workbooks are manually maintained accounting ledgers with multiple categorized sheets. They contain formulas that reference wide ranges, irregular starting rows, manual labels, and summary sheets. Examples observed in the source include:

- `73 Broadway` construction total formula begins at `D3`, although a transaction exists on row 2.
- `161 Woodlawn` labour, construction, and municipality total formulas begin after one or more populated rows.
- `392 First Street` combines manual totals, formulas, sale calculations, card data, and dated activity on separate sheets.

**Implementation decision:** import each non-empty source row/cell with workbook, sheet, row, cell/range, raw values, formula text where present, and import-batch ID. Treat summary formulas as a claim that must be compared with GroundUp’s independently computed source-row total. Never use a workbook formula total as the canonical total by default.

### 2. Workbook categories are a proposed classification

The sheets use categories such as `Construction Exp`, `Labour`, `Misc`, `Bank Fee`, and `Inner Bank Transfer`; individual row descriptions include checks, wires, cards, cash, deposits, returns, and account-to-account transfers. The categorization is useful input but it is not sufficient proof of expense type, project ownership, or budget-line mapping.

**Implementation decision:** preserve `source_sheet_category` and `source_mode` as raw attributes. Map them to canonical transaction direction, spend type, and budget line only through rules plus CFO review. “Credit”/“Debit” text and sign must be validated against the source account and statement.

### 3. Statement coverage is a first-class requirement

The source has multiple operating accounts, lender/deposit accounts, statement formats (Bank of America, BCB, Columbia), NSF/overdraft notices, and cross-project transfers. The 73 Broadway Columbia statements show draw deposits in a separate account from construction expenses. The BCB statement examples show transfers, checks, fees, and negative balances. This validates the planned distinction between lender funding, operating spend, and inter-project transfers.

**Implementation decision:** maintain accounts and statement periods as canonical entities. Before a period is signed off, the system validates statement coverage and statement roll-forward. An account’s last four digits may be displayed to ordinary users; full account identifiers must be encrypted/limited.

### 4. Draw workflow fits the lender data, but needs configurable terminology

392 First Street’s loan report has scheduled value, change orders, Draw 1–15, drawn-to-date, balance remaining, inspection indicator, and draw dates. 73 Broadway inspection reports distinguish requested amount, inspector-approved amount, and a lender funding percentage/recommendation. These are different documents and should not be forced into a single vendor-specific field set.

**Implementation decision:** use a canonical draw model with optional `requested`, `inspector_recommended`, `lender_approved`, and `cleared_funded` values. Preserve source document type/reference and configurable display labels. The source does not establish that every “approved” value was deposited, so only cleared bank linkage marks funding truth.

### 5. Investor and disposition workflows are feasible but need source completeness checks

392 First Street and the Woodlawn workbook contain partner ratios/funding and unit-sale structures. 392 includes unit sale figures and closing/loan payoff fields. This supports the project economics and investor return design. However, investors’ contribution evidence and distribution formulas are incomplete/partly manual in the supplied set.

**Implementation decision:** load ownership ratios, contributions, distributions, and sale values as reviewable claims. Do not calculate verified ROI/IRR until source cash flows, allocation policy, and sale/payoff records pass completeness checks.

## Required ingestion adapters for the pilot

| Adapter | Input | Canonical output | Human review requirement |
|---|---|---|---|
| Workbook ledger adapter | current project XLSX layouts | source rows, transaction/spend proposals, category claims, summary-total checks | CFO maps category/direction/project/budget line |
| Budget/SOV adapter | 73 budget, 392 loan schedule, lender SOV formats | budget version, line hierarchy, lender eligibility | owner/CFO approve baseline and line mapping |
| Bank statement adapter | BCB, Columbia, Bank of America PDFs | account, statement period, transaction proposals, balance control | CFO verifies account mapping/duplicates/allocations |
| Draw/inspection adapter | lender draw forms, loan report, AIA, ATD reports | draw versions/lines, decision values, conditions, progress evidence | owner/CFO confirm state and map deposit |
| Closing/disposition adapter | HUD/settlement and unit-sale sheets | acquisition/disposition/unit/proceeds/payoff proposals | CFO allocates/approves settlement lines |
| Evidence adapter | invoices, photos, permits, inspection/NSF records | document/evidence/exception records | responsible role verifies relevance |

These adapters should be configuration-driven and versioned. Do not build a generic “AI spreadsheet importer” and assume it understands every future workbook; use the current layouts as pilot templates, preserve an escape hatch for manual mapping, and keep all transformation rules observable.

## Required schema additions and operating controls

- `financial_accounts`: project/entity/account relationship, institution, masked identifier, account purpose, active date range, and authorization state.
- `statement_periods`: account, start/end, opening/closing balances, source document, coverage state, and reconciliation sign-off.
- `source_records`: immutable extracted/imported row/field object with raw payload, workbook/sheet/row/cell or PDF page/table location, source hash, import batch, parse status, and normalized-candidate links.
- `data_quality_issues`: deduplicated cross-domain exceptions with severity, affected record/report, owner, status, waiver, and resolution evidence.
- A generic allocation table or allocation child model to split source transaction, payment, funding deposit, invoice, or settlement lines without losing the original amount.
- A source-account mapping stage before financial import approval; do not infer project from a spreadsheet tab name alone.

## Pilot acceptance tests based on the actual files

1. Upload each workbook without changing its original formulas or values; import raw rows with workbook/sheet/row lineage.
2. Flag formula/row-total mismatch for source totals that omit populated rows rather than importing their result as canonical.
3. Import one BCB, one Columbia, and one Bank of America statement; reproduce opening + activity = closing and flag account-period gaps.
4. Load the 392 loan report’s 15 draw columns as draw events and preserve their original draw dates/reference.
5. Load the 73 Broadway inspection reports with requested, approved, and funding-recommendation values as separate fields; do not infer a deposit until it matches a cleared statement transaction.
6. Detect/review the misfiled 73 Broadway budget located inside the Woodlawn folder.
7. Classify raw inter-account/project transfers separately from expenses and demonstrate that they do not alter project P&L.
8. Prevent a project from being labelled “reconciled” where statement coverage, invoice support, draw-to-deposit linkage, or data-quality exceptions remain incomplete.

## Feasibility conclusion

The planned system will work with this data if implementation begins with **reviewable imports, configurable adapters, and reconciliation controls**. It will not be reliable if it relies on spreadsheet totals, filename/folder identity, text labels, or AI extraction alone.
