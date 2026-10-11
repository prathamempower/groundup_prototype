# GroundUp AI API Specification

## 1. Principles

- REST over HTTPS, versioned at `/api/v1`. FastAPI publishes the OpenAPI contract; the Next.js client is generated from it.
- FastAPI is the only path that moves a proposal to verified/approved financial truth. Celery workers create proposals only.
- Every request is checked for active account, organization, project membership, role, and record scope. PostgreSQL RLS is the second layer.
- Budget, Spend, Funding, and Progress stay in separate resources. No endpoint returns a blended "total" without naming its basis.
- Approved records are never edited. Corrections use `supersede`, `reverse`, or `adjust` actions.
- Every material write records actor, time, previous value, new value, rationale, and source citation in `audit_events`.

## 2. Conventions

| Topic | Rule |
|---|---|
| Auth | `Authorization: Bearer <token>` from the identity provider (SSO/MFA). Org and project scope come from claims plus membership lookup. |
| Money | Integer minor units as string, with explicit currency: `{ "amount": "1250000", "currency": "USD" }`. Never floats. |
| Dates | UTC ISO-8601 timestamps; business dates as `YYYY-MM-DD`. |
| IDs | UUIDs. Nested paths always include `project_id`. |
| Pagination | Cursor based: `?limit=50&cursor=...`. Response includes `next_cursor`. |
| Filtering | `?status=`, `?from=`, `?to=`, `?q=`. Sorting: `?sort=-created_at`. |
| Idempotency | `Idempotency-Key` header required on imports, confirm-upload, approvals, and funding allocation. Same key + same payload returns the original result. |
| Concurrency | Mutable drafts use `If-Match: <version>`. A stale version returns `409 VERSION_CONFLICT`. |
| Async work | Long jobs return `202 Accepted` with a `job` resource; clients poll `GET /jobs/{id}`. |

### Response shape

```json
{ "data": { }, "meta": { "as_of": "2026-10-10T08:00:00Z", "data_quality": "PROVISIONAL" } }
```

Report and dashboard responses always include `as_of`, `data_quality` (`VERIFIED`, `PROVISIONAL`, `INCOMPLETE`), and `warnings[]`.

### Error shape

```json
{
  "error": {
    "code": "DRAW_NOT_FUNDABLE",
    "message": "Funding total is below the lender threshold for this draw.",
    "fields": [{ "path": "allocations[0].amount", "issue": "exceeds_unallocated_balance" }],
    "request_id": "req_8f3a"
  }
}
```

| HTTP | Codes |
|---|---|
| 400 | `VALIDATION_FAILED`, `ALLOCATION_NOT_BALANCED`, `INVALID_STATE_TRANSITION` |
| 401 | `UNAUTHENTICATED`, `MFA_REQUIRED`, `STEP_UP_REQUIRED` |
| 403 | `FORBIDDEN`, `PROJECT_SCOPE_DENIED`, `READINESS_GATE_BLOCKED` |
| 404 | `NOT_FOUND` (also returned for out-of-scope records) |
| 409 | `VERSION_CONFLICT`, `DUPLICATE_DOCUMENT`, `ALREADY_APPROVED`, `PERIOD_ALREADY_RECONCILED` |
| 422 | `ACCOUNT_NOT_MAPPED`, `COVERAGE_GAP`, `CONTINGENCY_EXCEEDED`, `DRAW_NOT_FUNDABLE` |
| 429 | `RATE_LIMITED` |
| 5xx | `INTERNAL_ERROR`, `PROVIDER_UNAVAILABLE` |

## 3. Roles

`OWNER`, `CFO`, `PM`, `GC`, `INVESTOR`. Permissions follow PRD section 2. Investors can only call `/investor/*`. GCs can only read and write their own submissions.

## 4. Endpoints

Legend: **O** Owner, **C** CFO, **P** PM, **G** GC, **I** Investor.

### 4.1 Identity and organization

| Method | Path | Purpose | Roles |
|---|---|---|---|
| GET | `/me` | Current user, memberships, permissions | All |
| POST | `/organizations` | Create organization | O |
| GET/PATCH | `/organizations/{id}` | Read or update defaults and security policy | O |
| POST | `/invitations` | Create scoped invite (role, projects, expiry) | O |
| GET | `/invitations` | List organization invitations and their status | O |
| GET | `/invitations/{token}` | Read invitation scope before acceptance | Invitee |
| POST | `/invitations/bulk` | CSV bulk invite | O |
| POST | `/invitations/{token}/accept` | Accept invite | Invitee |
| POST | `/invitations/{id}/revoke` | Revoke invite | O |
| PATCH | `/projects/{pid}/members/{uid}` | Change project role or remove access | O |

### 4.2 Projects and onboarding

| Method | Path | Purpose | Roles |
|---|---|---|---|
| GET/POST | `/projects` | List or create projects | O (create), all (list in scope) |
| GET/PATCH | `/projects/{pid}` | Read or update identity fields | O |
| GET | `/projects/{pid}/readiness` | Readiness gates and blockers | O, C, P |
| GET | `/onboarding/sessions/current` | Current session and next permitted question | All |
| POST | `/onboarding/sessions/{sid}/answers` | Submit answer (supports `UNKNOWN`, `NOT_YET_AVAILABLE`, `NOT_APPLICABLE`) | Role in scope |
| GET | `/projects/{pid}/onboarding/tasks` | Delegated tasks | O, C, P, G |
| POST | `/configuration-versions/{id}/approve` | Approve high-risk configuration | O |
| POST | `/configuration-versions/{id}/reject` | Reject with reason | O |

The server returns only the next permitted question. The client cannot skip rules.

### 4.3 Documents and review

| Method | Path | Purpose | Roles |
|---|---|---|---|
| POST | `/documents/upload-url` | Authorize presigned S3 upload (key, method, content type, size limits) | O, C, P, G |
| POST | `/documents/{id}/confirm-upload` | Verify object, store SHA-256, enqueue job (`202`) | Uploader |
| GET | `/projects/{pid}/documents` | List with status, type, duplicates | O, C, P |
| GET | `/documents/{id}` | Metadata, extraction state, links | Scoped |
| GET | `/documents/{id}/download-url` | Short-lived signed URL | Scoped |
| GET | `/documents/{id}/extractions` | Proposed fields with confidence and citations | O, C, P |
| POST | `/extraction-fields/{id}/decision` | `ACCEPT`, `EDIT`, `REJECT` with rationale | Responsible role |
| POST | `/documents/{id}/mark` | `DUPLICATE`, `MISFILED`, `IRRELEVANT`, `NOT_APPLICABLE` | O, C |
| POST | `/documents/{id}/assign-project` | Link an inbox document to a project | O, C |
| POST | `/documents/{id}/manual-entry` | Source-linked manual entry when extraction fails | C, P |

Upload flow: `upload-url` → browser PUT to S3 → `confirm-upload` → worker scans, classifies, extracts → `READY_FOR_REVIEW`.

### 4.4 Budget and change control

| Method | Path | Purpose | Roles |
|---|---|---|---|
| POST | `/projects/{pid}/budgets` | Create draft budget from reviewed import | O, C |
| GET | `/projects/{pid}/budgets/current` | Original, current approved, spend, committed, draw values per line | O, C, P |
| GET | `/budgets/{id}/lines` | Line hierarchy | O, C, P |
| POST | `/budgets/{id}/approve` | Approve as immutable baseline (validation must pass) | O |
| POST | `/projects/{pid}/change-orders` | Request or create change order | O, C, G (request) |
| POST | `/change-orders/{id}/approve` | Approve; updates current approved amount | O |
| POST | `/change-orders/{id}/reject` | Reject with reason | O |
| POST | `/projects/{pid}/contingency-movements` | Move contingency (cannot exceed available) | O |
| PATCH | `/budget-lines/{id}/milestone` | Link line to milestone (no amount change) | O, C, P |

### 4.5 Spend, accounts, and reconciliation

| Method | Path | Purpose | Roles |
|---|---|---|---|
| GET/POST | `/financial-accounts` | List or register account (masked identifier) | C, O |
| POST | `/financial-accounts/{id}/approve-mapping` | Confirm account-to-project/entity mapping | O |
| GET | `/financial-accounts/{id}/statement-periods` | Periods with coverage state | C, O |
| POST | `/projects/{pid}/import-batches` | Start import with adapter and version (`202`) | C |
| GET | `/import-batches/{id}` | Row counts, errors, duplicates, control-total check | C |
| GET | `/import-batches/{id}/source-records` | Immutable source rows with lineage | C |
| GET | `/projects/{pid}/reconciliation/queue` | Proposed matches with confidence and reasons | C |
| POST | `/reconciliation-matches/{id}/decision` | `ACCEPT`, `SPLIT`, `REMAP`, `EXCLUDE`, `MARK_TRANSFER` | C |
| POST | `/spend-records/{id}/allocations` | Split across lines or projects (sum must equal source amount) | C |
| POST | `/spend-records/{id}/reverse` | Reversal, refund, void, or chargeback record | C |
| POST | `/statement-periods/{id}/signoff` | Sign off period (coverage and balance controls must pass) | C |
| GET/POST | `/projects/{pid}/inter-project-transfers` | Track temporary transfers and repayment | C |

### 4.6 Draws and funding

| Method | Path | Purpose | Roles |
|---|---|---|---|
| POST | `/projects/{pid}/draws` | Create draw draft for loan and period | O, C |
| GET | `/draws/{id}` | Draw, lines, requirements, revisions | O, C, P |
| POST | `/draws/{id}/lines` | Add or update lines (requested, evidence) | O, C |
| POST | `/draws/{id}/verify-work` | PM verification of progress and inspection | P |
| POST | `/draws/{id}/verify-cost` | CFO verification of cost and prior payment | C |
| GET | `/draws/{id}/packet` | Checklist and portal-entry summary | O, C |
| POST | `/draws/{id}/mark-submitted` | Record submission made in the lender portal | O |
| POST | `/draws/{id}/lender-decision` | Record requested, recommended, approved values | O, C |
| POST | `/draws/{id}/revisions` | Resubmit; creates child revision | O |
| GET | `/projects/{pid}/funding/unallocated` | Cleared deposits not yet allocated | C |
| POST | `/draws/{id}/fundings` | Allocate cleared transaction(s) to draw lines | C |

`fundings` only accepts transactions with `cleared_status = CLEARED`. One deposit can be split across draws. A draw becomes `FUNDED` only when the lender threshold is met.

### 4.7 Progress

| Method | Path | Purpose | Roles |
|---|---|---|---|
| GET/POST | `/projects/{pid}/milestones` | Plan major milestones | P, O |
| PATCH | `/milestones/{id}` | Update actuals, percent, forecast date (reason required when forecast moves) | P |
| POST | `/milestones/{id}/evidence` | Attach photos, permits, inspections | P, G |
| POST | `/milestones/{id}/verify` | Verify progress | P |
| GET | `/projects/{pid}/schedule/forecast` | Forecast completion and carry impact | O, C, P |

### 4.8 GC submissions

| Method | Path | Purpose | Roles |
|---|---|---|---|
| GET | `/me/submissions` | GC's own submissions | G |
| POST | `/projects/{pid}/submissions` | Milestone claim, cost evidence, or change request | G |
| POST | `/submissions/{id}/submit` | Submit; creates tasks for Owner, CFO, PM | G |

GC calls cannot approve, alter budget, or mark funding.

### 4.9 Economics and closeout

| Method | Path | Purpose | Roles |
|---|---|---|---|
| GET | `/projects/{pid}/economics` | Original vs current forecast, labeled by basis | O, C |
| POST | `/projects/{pid}/financial-plans` | New pro-forma version | O, C |
| GET/POST | `/projects/{pid}/investors/contributions` | Contribution records | O, C |
| GET/POST | `/projects/{pid}/investors/distributions` | Distribution records | O, C |
| POST | `/projects/{pid}/disposition/import` | Start sale/HUD import (`202`) | C |
| POST | `/projects/{pid}/closeout/approve` | Approve closeout or grant explicit exception | O |
| POST | `/projects/{pid}/post-closeout-adjustments` | Labelled adjustment after closeout | O, C |

### 4.10 Alerts, data quality, reports

| Method | Path | Purpose | Roles |
|---|---|---|---|
| GET | `/projects/{pid}/dashboard` | Control center: forecast, cash gap, draws, contingency, top exceptions | O |
| GET | `/projects/{pid}/alerts` | Open alerts by severity and owner | O, C, P |
| POST | `/alerts/{id}/resolve` | Resolve with note | Assignee |
| POST | `/alerts/{id}/waive` | Waive with reason and expiry | O, C |
| GET | `/projects/{pid}/data-quality-issues` | Deduplicated exceptions | O, C |
| POST | `/data-quality-issues/{id}/resolve` | Resolve or waive with evidence | C, O |
| GET | `/projects/{pid}/reports/{type}` | Variance, funding gap, forecast, draw status | O, C |
| POST | `/projects/{pid}/report-exports` | Request CSV/XLSX/PDF (`202`) | O, C |
| GET | `/report-exports/{id}` | Status and signed download URL | Requester |
| GET | `/audit-events` | Filter by entity, actor, date | O |

Drill-down: every report row includes `source_refs[]` pointing to contributing records.

### 4.11 Investor sharing

| Method | Path | Purpose | Roles |
|---|---|---|---|
| POST | `/projects/{pid}/investor-updates` | Generate draft from approved report data | O |
| PATCH | `/investor-updates/{id}` | Edit draft | O |
| POST | `/investor-updates/{id}/publish` | Publish immutable snapshot (requires warning acknowledgement if data is incomplete) | O |
| POST | `/investor-updates/{id}/withdraw` | Withdraw publication | O |
| GET | `/investor/projects` | Shared projects | I |
| GET | `/investor/updates/{id}` | Published snapshot only | I |

Investor responses never include vendor, bank, document, or internal exception data.

### 4.12 Jobs

| Method | Path | Purpose |
|---|---|---|
| GET | `/jobs/{id}` | Status: `QUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `DEAD_LETTERED`, with result reference |
| POST | `/jobs/{id}/retry` | Retry a failed job (idempotent) |

## 5. State transitions enforced by the API

| Entity | Allowed path |
|---|---|
| Draw | `DRAFT → SUBMITTED → UNDER_REVIEW → PARTIALLY_APPROVED \| APPROVED \| REJECTED → FUNDED \| CLOSED` |
| Document | `UPLOADED → SCANNING → CLASSIFIED → READY_FOR_REVIEW → REVIEWED`; `QUARANTINED` as a side state |
| Budget | `DRAFT → APPROVED` (then superseded by a revision, never edited) |
| Import batch | `DRAFT → CONFIRMED → PROPOSALS_READY → CLOSED` |
| Onboarding | `INVITED → ACCOUNT_CREATED → PROFILE_COMPLETE → ROLE_SETUP_IN_PROGRESS → PROJECT_SETUP_IN_PROGRESS → READY_FOR_APPROVAL → ACTIVE` |

An invalid move returns `400 INVALID_STATE_TRANSITION` with the allowed next states.

## 6. Security and limits

- Step-up authentication for access changes, publishing, verified-record correction, and high-sensitivity export.
- Presigned URLs are bound to exact key, method, content type, and size, and expire in minutes.
- Upload limits: PDF, image, XLSX, CSV, email export. Reject macros and executable content.
- Rate limits: 600 requests/minute per user; 20 uploads/minute per user; 5 export requests/minute per project.
- Logs redact account numbers, tokens, and personal identifiers.
- Webhooks are out of scope for V1. Notifications are delivery only and never change state.

## 7. Acceptance checks for the API

1. An investor token calling any non-`/investor` path returns `404` or `403`.
2. Repeating `confirm-upload` with the same idempotency key creates one document and one job.
3. `POST /draws/{id}/fundings` with an uncleared transaction returns `422`.
4. `POST /spend-records/{id}/allocations` with a non-balanced total returns `400 ALLOCATION_NOT_BALANCED`.
5. Approving a budget with failed hierarchy or total validation is blocked and the draft is preserved.
6. Signing off a statement period with a coverage gap returns `422 COVERAGE_GAP` unless a waiver exists.
7. A worker-created record never appears as `VERIFIED` without a `review_decisions` entry.
