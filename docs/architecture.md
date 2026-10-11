# GroundUp AI Architecture

## Architecture decision

Build GroundUp AI as a modular, multi-tenant web application with a relational financial core and asynchronous document-processing pipeline. The system of record is the reviewed relational model; object storage retains originals; AI provides extracted proposals and matching suggestions only.

## Logical architecture

```text
Next.js + TypeScript frontend
  ├─ Owner, CFO, PM, GC, Investor experiences
  └─ typed FastAPI client generated from OpenAPI
        │
FastAPI modular-monolith API (Python)
  ├─ identity, organization, RBAC, onboarding
  ├─ projects, budgets, spend, draws, progress
  ├─ documents, economics, reporting, audit
  ├─ SQLAlchemy unit of work + transactional domain services
  └─ PostgreSQL with RLS, audit events, reporting projections
        │                         │
        │                         └─ Celery tasks via Redis
        │                              ├─ malware/file validation
        │                              ├─ OCR/classification/extraction
        │                              ├─ import/reconciliation proposals
        │                              ├─ report generation
        │                              └─ notifications/retries
        │
        └─ private Amazon S3
             ├─ immutable originals
             └─ controlled derived previews
```

## Components and responsibilities

| Component | Responsibility | Must not do |
|---|---|---|
| Next.js frontend | role-aware UI, client validation, API presentation, presigned-upload initiation | compute unsourced financial facts or enforce authorization only in UI |
| FastAPI modular-monolith API | transactional writes, RBAC, workflow transitions, domain rules, OpenAPI contract | bypass audit trail or execute long-running document work inline |
| Onboarding/configuration service | server-side question graph, delegated tasks, readiness gates, versioned configuration | grant role escalation or apply high-risk configuration without approval |
| SQLAlchemy/Alembic | explicit model persistence and reviewed schema migrations | bypass PostgreSQL constraints/RLS or mutate approved history |
| PostgreSQL | canonical entities, immutable versions, RLS, reporting projections | store source files as blobs |
| Private S3 | originals, derived previews, encrypted versioned storage, presigned access | grant public access |
| Celery + Redis + Python workers | OCR, classification, virus scan, extraction, imports, reports, notifications, retries | directly confirm financial facts or share FastAPI request state |
| AI provider | structured extraction/match suggestions | write production records without approval |
| Reporting layer | rollups, forecast, exception metrics | replace canonical data |

## Core workflows

### Ingestion

1. Next.js requests an authorized presigned S3 upload through FastAPI.
2. The client uploads directly to the restricted object key; FastAPI creates a document record and Celery job only after upload completion is confirmed.
3. A separate Python Celery worker scans, hashes, classifies, and detects likely duplicates.
4. The worker extracts structured candidates with page/row citations and confidence, then persists only reviewable proposals through the domain layer.
5. A reviewer accepts, corrects, rejects, or marks the document misfiled through FastAPI.
6. Accepted candidates create or link canonical records in a database transaction; the original and decision remain immutable.

For XLSX/CSV, the worker first creates immutable `source_records` for each relevant source row/cell and only then produces normalized candidates. A sheet total/formula is independently evaluated as a control, never imported as the authoritative total. Source adapters are versioned by file layout (for example, workbook ledger, bank statement, or lender draw report) and expose their transformation rules to reviewers.

### Adaptive onboarding

The onboarding service evaluates a versioned server-side question graph using organization role, project role, lifecycle, contract model, financing, and prior answers. It returns only permitted next questions and creates delegated tasks, document requirements, and readiness gates. Answers that configure financial/access/reporting behavior produce a pending configuration version until the required approver accepts it. Changing an answer creates a new effective configuration version rather than mutating historical setup.

### Financial reconciliation

Budget lines, spend records, draw lines, funding transactions, and milestones are separate entities. The matching service proposes links with confidence and reasons. A finance reviewer confirms the link. Materialized/reporting views then calculate variance, funding gap, and forecast.

### Draw workflow

Draw revisions are append-only. A draw line may have requested, recommended, approved, and funded amounts. A cleared bank transaction can be allocated to one or many draw funding records, enabling partial deposits and avoiding false “funded” status.

## Security and reliability

- Enforce organization and project isolation in the database with RLS plus API authorization; never rely on client filtering.
- Use signed, time-limited downloads; encrypt data in transit and at rest; redact sensitive identifiers from application logs.
- Append audit events for all material state changes and retain source hashes/version identifiers.
- Use idempotency keys for API imports and Celery jobs; retries must not duplicate documents or transactions.
- Redis is a queue/cache transport, not a financial system of record. PostgreSQL persists all canonical state, job outcome references, and audit events.
- Back up the database, version object storage, monitor failed extraction/reconciliation jobs, and provide a dead-letter queue.
- Treat uploaded documents and extracted text as untrusted data; do not execute embedded instructions or macros.

## Deployment shape

Start as a modular monolith plus workers. This keeps financial transactions consistent and makes the pilot operable. Split services only when independent scale, ownership, or reliability demands it. Use separate development, staging, and production environments; production data must never be used in development without approved de-identification.

## Reporting calculations

Reports are derived and display source state:

- **Budget variance** = current approved budget − actual/committed spend, with separate unsourced/unmatched totals.
- **Funding gap** = eligible/approved project cost minus cleared lender/equity funding; do not use a submitted draw.
- **Forecast profit** = forecast net sales − forecast total project cost.
- **Forecast total project cost** includes acquisition, construction, soft costs, financing/interest, taxes, insurance, carrying cost, selling cost, and approved changes.

Every report includes `as_of`, data-quality status, and a drill-down to contributing records.
