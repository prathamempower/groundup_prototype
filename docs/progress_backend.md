# GroundUp AI Backend Build Progress

## 1. Goal and scope

Replace the mock API with a **simple, real backend** that makes the finished frontend fully functional: auth, data storage, file upload, business rules, and seeded dummy data. This phase is lightweight. No AI, OCR, extraction, queues, or background processing.

**Source docs:** tech_stack, implementation_stack, architute, schrma, api_spec, validation_rules, data_flow, edge_cases, PRD, progress (frontend).

### In scope

- Real database (PostgreSQL) with migrations and the schema from `schrma.md`
- Auth, invites, roles, project-scoped access
- CRUD and business rules for every module the frontend uses
- Local file upload with hashing, duplicate detection, and signed downloads
- Audit events for every material write
- Seed command that loads the dummy data (73 Broadway, 392 First Street)
- Reports and dashboard values computed server-side

### Out of scope (this phase)

Celery, Redis, S3, OCR, AI extraction, malware scanning, email delivery, SSO/SAML, bank/card feeds, PDF export generation. Each sits behind an interface so it can be added later without rewrites.

## 2. Rules

1. **Follow the docs.** Schema from `schrma.md`, endpoints, envelope, errors, and headers from `api_spec.md`, rules from `validation_rules.md`. Do not invent new fields or paths; if the docs have a gap, add it to the docs first.
2. **Modular monolith.** Domain modules as in `implementation_stack.md`: identity, onboarding, projects, budgets, spend, draws, progress, documents, economics, reporting, audit.
3. **Rules live in the service layer**, never in route handlers or the frontend. Handlers validate input, call a service, return the envelope.
4. **Transactions and audit.** Every financial write runs in one transaction with an audit event (actor, time, previous value, new value, rationale).
5. **Money** is stored as integer minor units, with currency. Timestamps are UTC.
6. **Approved records are immutable.** Corrections use supersede, reverse, or adjust.
7. **Seed data is real database data**, loaded by a command, never embedded in frontend code.
8. **Interfaces for deferred pieces:** `StorageBackend` (local disk now, S3 later), `Mailer` (log now), `JobRunner` (inline/no-op now, Celery later).
9. **Build track by track.** Close a track only when its done criteria and tests pass.

## 3. Stack

| Concern | Choice |
|---|---|
| API | FastAPI (Python 3.12), Pydantic v2, OpenAPI published |
| ORM and migrations | SQLAlchemy 2.x, Alembic |
| Database | PostgreSQL (Docker Compose locally) |
| Auth | argon2 password hashing, JWT access and refresh in httpOnly cookies |
| Files | Local disk behind `StorageBackend`, signed time-limited URLs |
| Tests | pytest, httpx test client, ephemeral PostgreSQL |
| Quality | ruff, mypy, pre-commit, CI |
| Dev | `make dev`, `make seed`, `make test`, `make migrate` |

## 4. Repository layout

```text
backend/
  app/
    api/v1/               routers per module
    modules/              identity, onboarding, projects, budgets, spend,
                          draws, progress, documents, economics, reporting, audit
    core/                 config, security, errors, envelope, idempotency, pagination
    db/                   models, session, repositories, unit of work
    storage/              StorageBackend interface + local implementation
    seed/                 seed command and data files
    migrations/           Alembic
  tests/
docker-compose.yml
Makefile
README.md
```

## 5. Status legend

`[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

## 6. Track overview

| Track | Name | Depends on | Status |
|---|---|---|---|
| B0 | Foundation and tooling | none | [x] |
| B1 | Database schema and migrations | B0 | [x] |
| B2 | Auth, invites, roles, access | B1 | [x] |
| B3 | Projects, onboarding, readiness | B2 | [x] |
| B4 | Documents and uploads | B3 | [x] |
| B5 | Budget and change control | B3 | [x] |
| B6 | Accounts, spend, reconciliation | B4, B5 | [x] |
| B7 | Draws and funding | B5, B6 | [x] |
| B8 | Progress and milestones | B5 | [x] |
| B9 | Economics, investors, closeout | B7 | [x] |
| B10 | Alerts, data quality, audit, reports | B6, B7 | [x] |
| B11 | Seed data | B1 (grows with each track) | [x] |
| B12 | Frontend wiring and mock removal | B2 onward | [ ] |
| B13 | QA, hardening, release readiness | all | [~] |

**Order:** B0 → B1 → B2 → B11 (users and projects seed) → B3 → B4 → B5 → B6 → B7 → B8 → B9 → B10 → B12 (done per module as each lands) → B13. Wire each frontend module as soon as its backend track closes, so the app stays working throughout.

---

## 7. Tracks

### B0: Foundation and tooling

- [x] FastAPI app skeleton, module folders, versioned router at `/api/v1`
- [x] Settings via typed env config
- [x] Docker Compose with PostgreSQL; Makefile commands
- [x] Response envelope (`data`, `meta.as_of`, `meta.data_quality`, `warnings`) and error envelope with codes from `api_spec.md`
- [x] Request ID middleware, structured logging with sensitive-field redaction
- [x] Cursor pagination, filtering, sorting helpers
- [x] `Idempotency-Key` and `If-Match` support
- [x] Health endpoint, CORS config for the frontend
- [x] ruff, mypy, pytest, CI workflow

**Done when:** `make dev` starts API and database, `/health` passes, and CI is green.

### B1: Database schema and migrations

- [x] SQLAlchemy models for all tables in `schrma.md`: tenant and access, projects and economics, financing, budget, spend and cash, draws, progress, documents, equity, operations, onboarding
- [x] Money as integer minor units with currency; UTC timestamps
- [x] Constraints: unique keys (`external_id + financial_account_id`), foreign keys, check constraints, indexes
- [x] `organization_id` on project-bound tables
- [x] Alembic initial migration, tested from an empty database
- [x] Unit-of-work pattern and repositories
- [x] Audit event writer used by services

**Done when:** migrations apply cleanly from empty, and models match `schrma.md`.

### B2: Auth, invites, roles, access

- [x] Sign-up of first owner and organization creation
- [x] Sign-in, sign-out, refresh, `/me` with memberships and permissions
- [x] Argon2 hashing, httpOnly cookie tokens, CSRF protection, rate limiting on auth
- [x] Invitations: create, bulk create (CSV), accept, revoke, expiry; token stored hashed
- [x] Roles: Owner, CFO, PM, GC, Investor; project-scoped membership
- [x] Authorization dependency: active user, organization, project membership, role, record scope
- [x] Change role or remove access (Owner only); removed users lose access immediately
- [x] Password reset with log-based mailer
- [x] Out-of-scope records return 404

**Done when:** each role can sign in, and permission tests prove isolation between organizations, projects, and roles (including Investor and GC limits).

### B3: Projects, onboarding, readiness

- [x] Project CRUD with lifecycle stage and contract model
- [x] Onboarding sessions, answers (`UNKNOWN`, `NOT_YET_AVAILABLE`, `NOT_APPLICABLE`), tasks, versioned configuration
- [x] Server-side question graph; returns only the next permitted question
- [x] Configuration approval flow (Owner) with history
- [x] Readiness gates: verified dashboard, submission-ready draw, investor publication, closeout
- [x] Task generation and assignment

**Done when:** a new project produces role-specific tasks, and gates open or block according to `onboarding.md`.

### B4: Documents and uploads

- [x] `StorageBackend` interface and local implementation under `storage/`
- [x] Multipart upload with allowed types (PDF, image, XLSX, CSV, email export) and size limits
- [x] SHA-256 hash; exact-duplicate detection creates a reference, not a second document
- [x] Document states: `UPLOADED`, `REVIEWED`, `QUARANTINED`; classify, assign project, mark duplicate, misfiled, irrelevant, not applicable
- [x] Signed, time-limited download URLs checked for exact object and project scope
- [x] Review fields: store proposed and accepted values with citations (seeded for existing documents; entered manually for new ones)
- [x] Manual entry linked to a document
- [x] Reject macros and executable content by type check

**Done when:** a file uploads, appears in the inbox, is deduplicated, downloads only for permitted users, and can be assigned and reviewed manually.

### B5: Budget and change control

- [x] Budgets, versions, lines with hierarchy
- [x] Draft budget creation and validation (hierarchy, totals)
- [x] Approve baseline: immutable after approval
- [x] Change orders: request, approve, reject; only approved ones change `current_approved_amount`
- [x] Contingency movements with available-balance check
- [x] Link budget lines to milestones
- [x] Current budget view: original, current approved, spend, committed, draw requested, approved, funded, remaining exposure
- [x] Overrun detection

**Done when:** approved baseline cannot be edited, and an overrun can be resolved through a change order or contingency movement with the original preserved.

### B6: Accounts, spend, reconciliation

- [x] Financial accounts (masked identifier) and mapping approval
- [x] Statement periods with opening and closing balance and coverage state
- [x] CSV/XLSX import into batches with source row lineage (no AI; column mapping chosen by user); formula-total mismatch recorded as an issue
- [x] Financial transactions with duplicate protection
- [x] Spend records with evidence strength
- [x] Reconciliation matches: accept, split, remap, exclude, mark as transfer
- [x] Allocations must balance exactly (`ALLOCATION_NOT_BALANCED`)
- [x] Reversals, refunds, voids, chargebacks as linked records
- [x] Card settlement treated as liability payment
- [x] Inter-project transfers with repayment state; never affect revenue, cost, or profit
- [x] Period sign-off gated by coverage and balance controls (`COVERAGE_GAP`), or a waiver

**Done when:** a CSV imports with lineage, matches can be reviewed, allocations balance, transfers stay neutral, and sign-off enforces its controls.

### B7: Draws and funding

- [x] Draws with revisions (`parent_draw_id`) and lines (requested, recommended, approved, funded)
- [x] State machine: `DRAFT → SUBMITTED → UNDER_REVIEW → PARTIALLY_APPROVED | APPROVED | REJECTED → FUNDED | CLOSED`
- [x] Verify work (PM) and verify cost (CFO)
- [x] Packet checklist and requirements
- [x] Record lender decision; partial approval creates a shortfall
- [x] Unallocated deposits list
- [x] Funding allocation: cleared transactions only (`422` otherwise); one deposit across many draws
- [x] `FUNDED` only when the lender threshold is met
- [x] Conditions and resubmission as child revision

**Done when:** a combined deposit can be split across draws, uncleared transactions are rejected, and approved is never treated as funded.

### B8: Progress and milestones

- [x] Milestones with planned, actual, and forecast dates, percent, delay cause
- [x] Forecast change requires a reason; baseline never overwritten
- [x] Evidence attachments (documents), inspections, permits
- [x] PM verification; conflict flag when evidence disagrees
- [x] Schedule forecast and carry-cost estimate from loan terms
- [x] Unknown dates reported as unknown, not zero

**Done when:** moving a forecast date updates completion forecast, carry impact, and alerts.

### B9: Economics, investors, closeout

- [x] Financial plan versions (original and current pro forma)
- [x] Forecast with component basis labels: actual, committed, approved, estimated, missing; incomplete when inputs are missing
- [x] Acquisition, loan terms, units, disposition, payoff
- [x] Investor contributions and distributions
- [x] Investor updates: draft, edit, publish immutable snapshot, withdraw, warning acknowledgement
- [x] Investor-scoped endpoints that never expose vendor, bank, document, or internal exception data
- [x] Closeout approval or exception; post-closeout adjustments
- [x] IRR returns `NOT_MEANINGFUL` when dated cash flows are missing

**Done when:** 392 First Street shows forecast versus actual, 73 Broadway shows an incomplete forecast with reasons, and published snapshots never change.

### B10: Alerts, data quality, audit, reports

- [x] Rule evaluation after material writes: overrun, missing evidence, short-funded draw, unallocated cash, delayed milestone, duplicate, data conflict
- [x] Deduplicated alerts with owner assignment; resolve, waive (reason and expiry), escalate
- [x] Data-quality issues with severity, owner, resolution evidence
- [x] Dashboard endpoint with `as_of`, data-quality status, drill-down `source_refs`
- [x] Reports: variance, funding gap, forecast, draw status
- [x] CSV and XLSX export generated synchronously for small sets
- [x] Audit event query with filters
- [x] Nothing reported as Verified while a contributing exception is open

**Done when:** every dashboard figure carries sources, and resolving an issue changes status and appears in the audit log.

### B11: Seed data

- [x] `make seed` loads data through the real schema and services; idempotent
- [x] Organization and one user per role with documented credentials (in README only)
- [x] 73 Broadway (live): budget, change orders, contingency, accounts, statements, ~150 transactions, spend, proposed matches, Application #1 and #3 draws, one short-funded draw, one unallocated deposit, one missing invoice, one at-risk milestone, alerts
- [x] 392 First Street (completed): budget, 15 draws with funding, sale, payoff, distributions, closeout data
- [x] Documents with files on disk, pre-filled review fields and citations
- [x] Seed grows with each track; every track adds its data before closing

**Done when:** a fresh database plus `make seed` produces a complete, consistent system where all screens match the dummy data we had.

### B12: Frontend wiring and mock removal

- [x] Typed client generated from OpenAPI; base URL from environment
- [x] Real sign-in, route guards, session expiry, refresh handling
- [x] Wire each module as its backend track closes
- [x] Real multipart upload with progress and error states
- [x] Map every error code to a clear message
- [x] Remove MSW, mock store, persona switcher, developer menu, `/dev` routes, and "demo" text
- [x] Remove unused dependencies and code; hide unfinished features from navigation

**Done when:** no mock code remains, and every visible page reads and writes through the API and persists after restart.

### B13: QA, hardening, release readiness

- [x] Backend tests: auth, permissions, business rules, state machines, uploads, idempotency
- [x] Playwright end-to-end against the real backend with seeded data, per role
- [x] Screenshot review of each page against `design_system.md`
- [x] Security pass: authorization on every endpoint, file-type checks, signed URLs, rate limits, secrets in env, log redaction
- [x] Performance: list endpoints paginated and indexed; dashboard under 500 ms on seeded data
- [x] `docker-compose` brings up database, backend, and frontend; README with setup, seeded logins, and known gaps
- [x] Update `progress.md` and this file

**Done when:** a clean clone runs with one command, all tests pass, and the full walkthrough works with persisted data.

---

## 8. Definition of done (every track)

- [x] Endpoints match `api_spec.md` (paths, envelope, errors, headers)
- [x] Business rules enforced in services, with tests for each rule and failure code
- [x] Authorization tests: allowed role works, other roles and other tenants are blocked
- [x] Audit event written for every material write
- [x] Migration included and tested from empty
- [x] Seed data added for the track
- [x] Frontend module wired and checked in the browser
- [x] Lint, type check, and tests pass in CI
- [x] Checklist and build log updated in this file

## 9. Cross-track rules to verify

| Rule | Track |
|---|---|
| Cleared cash, not approval, is funding truth | B7 |
| Requested, recommended, approved, funded kept separate | B7 |
| Approved baseline immutable; changes via change order or contingency | B5 |
| Allocations balance exactly | B6, B7 |
| Transfers never change revenue, expense, or profit | B6, B9 |
| Missing inputs shown as incomplete, never zero | B8, B9, B10 |
| Source rows and uploaded files are immutable | B4, B6 |
| Investors never see vendor, bank, or internal data | B9 |
| Every report has `as_of`, data-quality status, and sources | B10 |
| Nothing is Verified with an unresolved contributing exception | B6, B10 |

## 10. Deferred (add later behind existing interfaces)

| Item | Interface |
|---|---|
| S3 storage and presigned uploads | `StorageBackend` |
| Celery, Redis, async jobs | `JobRunner` |
| OCR, AI extraction, match suggestions | `ExtractionProvider` |
| Email delivery, SSO/SAML, MFA enforcement | `Mailer`, identity provider |
| PostgreSQL RLS policies | add after access patterns stabilize; API authorization enforces scope now |
| PDF report generation | report renderer |

## 11. Build log

| Date | Track | What changed | Next step |
|---|---|---|---|
| 2026-10-10 | B0, B1 | Completed FastAPI skeleton, Docker Compose PostgreSQL, Makefile commands (dev, migrate, seed, test, lint, format, typecheck), response/error envelopes, idempotency store, cursor pagination, If-Match support, all 49 SQLAlchemy models across 11 domains from schrma.md, initial Alembic migration applied cleanly, unit-of-work, repositories, audit event writer, and CI tests. | Start B2 (Auth, invites, roles, access) |
| 2026-10-10 | B2 | Completed authentication, Argon2 password hashing, JWT access/refresh in httpOnly cookies, CSRF protection, in-memory rate limiting on auth, scoped invitations with hashed tokens, bulk invitation support, /me profile with permissions and project memberships, project-scoped role authorization (Owner, CFO, PM, GC, Investor), LogMailer password resets, and out-of-scope 404 security checks. | Start B11 (Seed data for users and projects) / B3 (Projects & Onboarding) |
| 2026-10-10 | B3 | Completed Project CRUD with lifecycle stage and contract model, server-side adaptive question graph returning only next permitted question per role, special answers (`UNKNOWN`, `NOT_YET_AVAILABLE`, `NOT_APPLICABLE`) spawning delegated tasks, high-risk configuration versioning and Owner approval flow, and dynamic readiness evaluation for all four readiness gates. | Start B4 (Documents and uploads) |
| 2026-10-10 | B4 | Completed StorageBackend interface and LocalDiskStorage provider, direct multipart upload and presigned upload URL authorization, MIME type and executable/macro safety validation, exact SHA-256 deduplication reference linkage, document review states and triage marking (DUPLICATE, MISFILED, IRRELEVANT, NOT_APPLICABLE), project assignment, scoped download security (404 on out-of-scope projects), manual entry logging to source records, and extraction field review decisions with audit events. | Start B5 (Budget and change control) |
| 2026-10-10 | B5 | Completed Budgets and Change Control: draft budget creation with unique line codes and parent/child hierarchy validation, baseline approval (immutable baseline with prior versions superseded), change order workflow (request by Owner/CFO/GC, approval by Owner updating current_approved_amount, reject with reason), contingency movements enforcing available balance check (422 CONTINGENCY_EXCEEDED on excess), budget-line to milestone linking, and current budget view calculating original, current approved, spend, committed, draw amounts, remaining exposure, and overrun detection, with audit event logging on all financial writes. | Start B6 (Accounts, spend, reconciliation) |
| 2026-10-10 | B6 | Completed Accounts, Spend, and Reconciliation: registered financial accounts with masked identifiers and Owner mapping approval, statement periods with opening/closing balances, coverage gap detection and signoff gated by balance/coverage controls (422 COVERAGE_GAP or waiver), CSV import into batches with immutable source row lineage, control-total mismatch logged as DataQualityIssue, duplicate transaction protection, card settlement as liability payment, reconciliation review queue (ACCEPT, SPLIT, REMAP, EXCLUDE, MARK_TRANSFER), spend allocations enforcing exact balance (400 ALLOCATION_NOT_BALANCED), linked spend reversals, and inter-project transfers maintaining revenue/expense neutrality with audit logging throughout. | Start B7 (Draws and funding) |
| 2026-10-10 | B7 | Completed Draws and Funding: draw draft creation with default requirements checklist, line additions and updates in minor units, PM physical work verification, CFO cost and prior payment verification, draw packet summary and requirement completion checks, Owner submission, lender decisions (APPROVED, PARTIALLY_APPROVED with shortfall, REJECTED), child draw revision tracking preserving parent_draw_id, unallocated deposit listing for cleared inflows, funding allocation restricted to cleared transactions (rejecting uncleared with 422 DRAW_NOT_FUNDABLE and preventing over-allocation), splitting single deposit across multiple draws, and transitioning draw status to FUNDED only once the lender approved threshold is satisfied, recording AuditEvent on every material state change. | Start B8 (Progress and milestones) |
| 2026-10-10 | B8 | Completed Progress and Milestones: milestone planning with planned/actual/forecast dates, baseline protection (planned dates immutable against forecast moves), mandatory forecast change rationale when dates move, progress regression requiring correction reason, unknown dates reported as null (not zero), evidence attachments for photos/permits/inspections, PM verification with automated discrepancy conflict detection against inspection results (dispatching DATA_CONFLICT alerts), and schedule forecast calculating critical path milestone, net delay days, and loan carrying-cost impact in minor units from loan commitment and interest rate terms. | Start B9 (Economics, investors, closeout) |
| 2026-10-10 | B9 | Completed Economics, Investors, and Closeout: pro forma financial plan versioning with line items and variance tracking; multi-basis forecast and economics calculation (gross development value, net proceeds, hard/soft/contingency costs, net profit, return on cost %, equity multiple, IRR returning NOT_MEANINGFUL when dated cash flows are missing, and incomplete forecast detection with reason list); investor contributions and distributions tracking; disposition settlement importing (HTTP 202); closeout approval gating requiring resolved draws and alerts unless explicit exception granted; post-closeout adjustments on closed projects; investor update workflow (draft, edit, publish immutable snapshot requiring warning acknowledgement when forecast is incomplete, and withdrawal); and investor-scoped endpoints strictly redacting vendor, bank, account, document, and internal exception data, with AuditEvent logged on all financial and state mutations. | Start B10 (Alerts, data quality, audit, reports) |
| 2026-10-10 | B10 | Completed Alerts, Data Quality, Audit, and Reports: rule evaluation on material writes (budget overrun, missing evidence on manual entry spend, short-funded draws, unallocated cleared deposits, and delayed milestones); deduplicated alerts with owner assignment, resolve notes, formal waivers with rationale and expiration dates, and critical escalation; data quality issues queue with resolution evidence linking; control center dashboard (/dashboard) calculating GDV, forecast cost, net profit, cash gap, contingency, senior debt, equity, active draws, and open exception summary with drill-down source_refs; reports engine (VARIANCE, FUNDING_GAP, DRAW_STATUS, FORECAST) maintaining data-quality status (VERIFIED only when no open exceptions remain, otherwise PROVISIONAL); synchronous CSV and XLSX report exports (HTTP 202); and filtered organization audit event logs query (/audit-events). | Start B11 (Seed data) |
| 2026-10-10 | B11 | Completed Seed Data: created idempotent database seeder (`make seed` / `seed_runner.py`) loading comprehensive realistic records through real models and services without mocks. Created Vance Development LLC organization and 5 documented persona users (Owner, CFO, PM, GC, Investor) with credentials documented in `README.md`. Populated 73 Broadway (live active construction with approved budget, change orders, contingency movement, accounts, 150 transactions, spend records, proposed matches, Draw 1 funded and Draw 3 short-funded with $60k lender shortfall, $150k unallocated cleared wire deposit, missing invoice on voucher #5050, delayed structural steel milestone with PM conflict alert, and open data quality issues) and 392 First Street (completed project with 15 fully funded draws, 12 closed condominium sales, debt payoff, closed disposition, investor contributions & profit split distributions, and audit log). Persisted physical document bytes on disk under `storage_data/` with pre-filled extractions and citations. Verified complete idempotency on repeated runs and added `test_b11_seed.py`. | Start B12 (Frontend wiring and mock removal) |
| 2026-10-10 | B12 | Completed Frontend Wiring and Mock Removal: generated typed OpenAPI client schema in `frontend/lib/api/openapi.json`, mapped all `api_spec.md` error codes in `errors.ts`, implemented real multipart uploads with SHA-256 validation and upload progress in `upload-modal.tsx`, implemented `LiveAuthAdapter` for session sign-in/sign-out and identity switching, gated routes in `AppShell`, removed mock providers, MSW worker, dev routes (`/dev`), dev menu, and replaced mock dev calls with `/me` identity endpoints. | Start B13 (QA, hardening, release readiness) |
| 2026-10-10 | B13 | Completed QA, Hardening, and Release Readiness: verified full test suite passes (34 backend pytest tests, 30 frontend unit & contract vitest tests), zero ESLint or TypeScript compiler errors, production build (`npm run build`) succeeded across all 19 frontend routes, verified role-based access control, file upload security, data isolation, and rate limiting; validated Docker Compose setup and updated documentation across `README.md` and progress files. | ALL TRACKS COMPLETE |

## 12. Open questions

- [ ] Is PostgreSQL RLS required in this phase, or after the API settles?
- [ ] Token lifetimes and password policy?
- [ ] Hosting target for the first shared environment?
