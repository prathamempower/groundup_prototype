# GroundUp AI Data Schema

## Schema principles

1. Keep Budget, Spend, Funding, and Progress separate.
2. Preserve original documents and imported source values.
3. Version approved plans and draw submissions; never overwrite history.
4. Make cross-project transfers neutral until reviewed.
5. Enforce tenant isolation and audit every material change.

## Core entities

| Domain | Tables / entities | Notes |
|---|---|---|
| Tenant and access | `organizations`, `users`, `project_members`, `parties`, `invitations` | `parties` represents vendors, lenders, GC, investor, buyer, etc. |
| Project/economics | `projects`, `acquisitions`, `project_financial_plans`, `dispositions`, `units` | financial plan is versioned original/current pro forma |
| Financing | `loans`, `loan_terms`, `construction_contracts` | includes interest method and reserve fields |
| Budget | `budgets`, `budget_lines`, `change_orders`, `change_order_lines`, `contingency_movements` | baseline is immutable after approval |
| Spend/cash | `financial_accounts`, `statement_periods`, `spend_records`, `financial_transactions`, `reconciliation_matches`, `inter_project_transfers` | spend and transaction may be linked but are not identical; statement coverage is explicit |
| Draws | `draws`, `draw_lines`, `draw_requirements`, `draw_fundings` | supports revision and partial funding |
| Progress | `project_milestones`, `progress_records`, `progress_evidence`, `inspections`, `permits` | milestones map to major categories |
| Documents/AI | `documents`, `source_records`, `document_extractions`, `extraction_fields`, `review_decisions` | immutable file plus raw source row/field and review trace |
| Equity/return | `project_investors`, `investor_contributions`, `investor_distributions` | supports ownership and cashflow chronology |
| Operations | `alerts`, `data_quality_issues`, `audit_events`, `import_batches` | operational trace and exception work |
| Onboarding | `onboarding_sessions`, `onboarding_answers`, `onboarding_tasks`, `configuration_versions` | versioned adaptive question graph and delegated readiness |

## Essential relationships

```text
organization ──< project ──< budget ──< budget_line
                     │             │         ├──< spend_record >── financial_transaction
                     │             │         ├──< draw_line >── draw ──< draw_funding >── financial_transaction
                     │             │         └──< project_milestone ──< progress_evidence >── document
                     │             └──< change_order / contingency_movement
                     ├──< loan
                     ├──< financial_account ──< statement_period ──< financial_transaction
                     ├──< construction_contract
                     ├──< acquisition / disposition / unit
                     ├──< project_investor ──< contribution / distribution
                     ├──< onboarding_session ──< onboarding_answer / onboarding_task
                     └──< document ──< source_record ──< document_extraction / review_decision
```

## Required fields and states

### `projects`

`id`, `organization_id`, `name`, `project_entity`, `address`, `lifecycle_stage`, `contract_model`, `status`, `currency`, `started_at`, `target_completion_at`, `created_at`.

`lifecycle_stage`: `ACQUISITION`, `PRE_CONSTRUCTION`, `CONSTRUCTION`, `COMPLETION`, `MARKETING`, `DISPOSITION`, `CLOSED`.

### `invitations`, `onboarding_sessions`, and `onboarding_answers`

`invitations`: `id`, `organization_id`, `project_id` nullable, `email`, `role`, `scope`, `token_hash`, `expires_at`, `accepted_at`, `revoked_at`, `invited_by`.

`onboarding_sessions`: `id`, `organization_id`, `project_id` nullable, `user_id`, `role`, `state`, `question_graph_version`, `started_at`, `completed_at`.

`onboarding_answers`: `id`, `session_id`, `question_key`, `question_version`, `answer_payload`, `source_document_id` nullable, `status`, `effective_from`, `effective_to`, `answered_by`, `approved_by` nullable, `approved_at` nullable.

`onboarding_tasks`: `id`, `project_id`, `session_id` nullable, `task_type`, `assigned_to`, `status`, `due_at`, `blocking_gate`, `created_from_question_key`, `resolved_by`.

`configuration_versions`: `id`, `project_id`, `configuration_type`, `effective_from`, `effective_to`, `value_payload`, `source_answer_id`, `approved_by`, `approved_at`, `supersedes_id`.

### `budget_lines`

`id`, `budget_id`, `parent_line_id`, `code`, `name`, `category`, `original_amount`, `current_approved_amount`, `is_draw_eligible`, `milestone_id`, `sort_order`. Store monetary values as integer minor units or `numeric(19,4)`, never floating point.

### `spend_records`

`id`, `project_id`, `vendor_party_id`, `transaction_date`, `amount`, `currency`, `description`, `status`, `evidence_strength`, `source_document_id`, `transaction_id`, `budget_line_id`, `match_status`, `reviewed_by`, `reviewed_at`.

`evidence_strength`: `VERIFIED_INVOICE`, `SIGNED_CONTRACT`, `BANK_TRANSACTION`, `CARD_TRANSACTION`, `GC_CONFIRMATION`, `MANUAL_ENTRY`.

### `draws` and `draw_lines`

`draws`: `id`, `project_id`, `loan_id`, `draw_number`, `parent_draw_id`, `status`, `period_start`, `period_end`, `submitted_at`, `approved_at`, `rejected_at`, `lender_party_id`, `source_document_id`.

`draw_lines`: `id`, `draw_id`, `budget_line_id`, `requested_amount`, `recommended_amount`, `approved_amount`, `funded_amount`, `reason`, `evidence_status`. `draw_fundings` links a draw to a cleared transaction and stores amount/date.

### `financial_transactions`

`id`, `project_id` nullable, `financial_account_id` nullable, `account_ref`, `transaction_date`, `posted_date`, `amount`, `direction`, `counterparty`, `memo`, `source_record_id`, `source_document_id`, `external_id`, `cleared_status`. `external_id + financial_account_id` is unique when supplied. A missing account map keeps a row in review; it must not become verified project cash.

### `financial_accounts` and `statement_periods`

`financial_accounts`: `id`, `organization_id`, `party_id`, `institution`, `masked_identifier`, `account_purpose`, `currency`, `active_from`, `active_to`, `status`, `source_document_id`.

`statement_periods`: `id`, `financial_account_id`, `period_start`, `period_end`, `opening_balance`, `closing_balance`, `source_document_id`, `coverage_status`, `reconciled_by`, `reconciled_at`. One account-period has at most one active statement source; corrected statements supersede prior sources.

### `inter_project_transfers`

`id`, `from_project_id`, `to_project_id`, `transaction_id`, `amount`, `type`, `transfer_date`, `repaid_amount`, `repaid_date`, `status`, `reviewed_by`. It never posts directly to project income or expense.

### `documents`

`id`, `organization_id`, `project_id`, `storage_key`, `sha256`, `original_filename`, `mime_type`, `document_type`, `document_date`, `source_system`, `ingestion_status`, `duplicate_of_document_id`, `uploaded_by`, `uploaded_at`. Store page/row citations on extraction fields and links.

### `source_records` and `data_quality_issues`

`source_records`: `id`, `document_id`, `import_batch_id`, `project_candidate_id`, `source_kind`, `sheet_name`, `row_number`, `cell_range`, `page_number`, `raw_payload`, `raw_formula`, `normalization_status`, `record_fingerprint`, `created_at`. It is immutable and can link to one or more canonical proposals/records.

`data_quality_issues`: `id`, `organization_id`, `project_id`, `issue_type`, `severity`, `status`, `source_record_id`, `affected_entity_type`, `affected_entity_id`, `owner_id`, `detected_at`, `resolved_at`, `resolution`, `waived_by`, `waived_until`. Examples include formula-total mismatch, misfiled document, statement-coverage gap, duplicate candidate, and draw-to-deposit mismatch.

## Integrity constraints

- All project-bound tables include `organization_id` directly or enforce it through a project FK and RLS policy.
- `approved_amount <= requested_amount` is not universal; adjustments and change orders can change basis. Preserve values and use validation warnings, not destructive constraints.
- A cleared funding record must reference a `CLEARED` transaction; a draw cannot be `FUNDED` unless funded total covers the required state threshold defined by the lender.
- Only approved change orders/contingency movements alter `current_approved_amount`.
- Soft deletion is allowed only for non-financial drafts; approved records are reversed/superseded with audit evidence.
- Every entity that drives a report exposes source and review state.
- A spreadsheet summary/formula value is stored as raw evidence only. Canonical totals are recomputed from accepted source rows or independently verified through a finance adjustment record.
- A period cannot be marked reconciled without a mapped financial account, statement period, and explicit coverage/reconciliation state.
- Invitation tokens are stored hashed; role/project scope, expiry, revocation, and acceptance are enforced server-side. Onboarding answers that configure workflows retain question/rule versions and effective dates.
