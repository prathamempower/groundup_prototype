# GroundUp AI Implementation Stack

## Deployment decision

GroundUp AI is a modular monolith: one FastAPI codebase and deployment boundary for transactional domain behavior, one Next.js frontend, PostgreSQL as the source of truth, private S3 for files, and independently scaled Python Celery workers. This is not a microservice architecture.

## Repository shape

```text
frontend/                 Next.js + TypeScript
  app/                    routes and role-aware pages
  components/             UI components
  lib/api/                generated/typed FastAPI client

backend/                  FastAPI modular monolith
  app/api/                versioned REST endpoints
  app/modules/            domain modules
    identity/ onboarding/ projects/ budgets/ spend/
    draws/ progress/ documents/ economics/ reporting/ audit/
  app/db/                 SQLAlchemy models, session, repositories
  app/migrations/         Alembic revisions
  app/workers/            Celery task entry points and task services

infrastructure/           environment, container, S3, Redis, Postgres configuration
```

Modules may call each other through explicit application/domain interfaces inside the monolith. They share the PostgreSQL transaction boundary when a financial workflow requires atomicity. A future split is allowed only after an interface is stable and separate scaling/ownership justifies it.

## Request and job boundaries

| Path | Runs in | Rule |
|---|---|---|
| User interaction, validation, permission check, financial approval | Next.js → FastAPI → PostgreSQL | synchronous, transactional, audit logged |
| Presigned upload authorization | FastAPI → S3 | permission and project scope checked before URL issue |
| OCR, malware scan, extraction, statement parsing | Celery worker | asynchronous; produces proposals only |
| Report export/PDF generation | Celery worker | uses a persisted report request/snapshot |
| Email/in-app notification | Celery worker | delivery status does not change business state |

Celery tasks receive durable IDs, reload current state from PostgreSQL, and use idempotency keys. They must not receive a trusted frontend payload, FastAPI request object, or uncommitted SQLAlchemy session.

## Data and security invariants

- SQLAlchemy and Alembic must implement the schema and integrity rules in `schrma.md`; Alembic migrations are applied before application deployment.
- PostgreSQL RLS and FastAPI authorization both enforce organization/project scope. Next.js route visibility is not a security boundary.
- Private S3 uses encryption, bucket versioning, no public ACLs, strict key prefixes, lifecycle policies, and short-lived presigned URLs.
- Redis carries work only. Financial records, approvals, audit events, review decisions, and job-result references remain in PostgreSQL.
- FastAPI approval endpoints, not Celery workers, transition a proposal to verified/approved financial truth.

## Worker queues

| Queue | Tasks | Priority |
|---|---|---|
| `document_intake` | scan, hash, classify, duplicate detection | high |
| `extraction` | OCR, XLSX/PDF parsing, structured proposals | normal |
| `reconciliation` | match suggestions, control calculations, alerts | normal |
| `reporting` | exports, forecast projections, investor snapshots | normal/low |
| `notifications` | invitation, task, exception, delivery retry | low |

Failed jobs use retry/backoff and an observable dead-letter/error state. Retrying a task must never create duplicate documents, source records, transactions, or financial facts.
