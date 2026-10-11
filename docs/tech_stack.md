# GroundUp AI Technology Stack

## Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js with TypeScript | role-aware web UI, server rendering, and typed client integration with the FastAPI API |
| UI | Tailwind CSS, accessible component primitives, React Hook Form, Zod | fast data-heavy workflows with strong input validation |
| Backend API | FastAPI on Python | typed, high-performance REST API and a single transactional domain layer |
| Core data | PostgreSQL | transactional integrity, complex reconciliation queries, database-enforced row-level security |
| ORM | SQLAlchemy 2.x | Python domain models, explicit transactions, and repository/unit-of-work patterns |
| Migrations | Alembic migrations generated/reviewed with SQLAlchemy metadata | append-only, reviewable schema evolution and reproducible environments |
| Authentication | Auth provider supporting SSO/MFA plus application RBAC | secure internal/external role access |
| Files | Private Amazon S3 buckets | encrypted originals/derivatives, versioning, lifecycle policies, and presigned uploads/downloads |
| Background jobs | Celery with Redis broker/result backend | reliable asynchronous ingestion, OCR, extraction, report, notification, and retry jobs |
| Workers | Separate Python Celery worker deployments | isolates long-running/CPU-intensive work from FastAPI request handling |
| Document processing | OCR + structured extraction service behind a provider interface | vendor flexibility and human-review workflow |
| AI | structured-output LLM behind an evaluation/versioning layer | classification, extraction, match suggestions—not autonomous posting |
| Observability | OpenTelemetry, error tracking, structured logs, product analytics | trace import failures and user-review friction |
| Deployment | managed containers/serverless for app and workers, managed Postgres | small operational footprint for pilot |

## Implementation conventions

- Next.js uses strict TypeScript; FastAPI owns backend contracts through versioned OpenAPI schemas. Generate or validate TypeScript API clients from OpenAPI and apply Zod validation at UI boundaries.
- FastAPI modules are domain packages, not separately deployed microservices: `identity`, `onboarding`, `projects`, `budgets`, `spend`, `draws`, `progress`, `documents`, `economics`, `reporting`, and `audit`.
- SQLAlchemy sessions are request/job scoped. Financial writes use a unit of work and PostgreSQL transaction; worker jobs never share a web-request session.
- PostgreSQL `numeric`/minor units for money, UTC timestamps for storage, explicit currency on monetary entities.
- Alembic migrations are append-only, tested from an empty database and from an anonymized production-like fixture, and reviewed in version control. No runtime `create_all` in production.
- Private S3 documents are accessed only through short-lived presigned URLs constrained to exact object key, method, content type, and size. No public buckets, object listing, or public ACLs.
- Financial writes use database transactions, idempotency keys, and append-only audit events.
- Celery tasks are idempotent, use retry/backoff and dead-letter/error visibility, and receive record IDs rather than trusted client payloads. Every task rechecks organization/project authorization and current record state.
- AI outputs must follow versioned JSON Schema and include model/version, confidence, and source citations.

## Integration sequence

1. File upload and XLSX/CSV import.
2. OCR/extraction for PDF/image, then document-review queue.
3. Export CSV/XLSX/PDF reports.
4. Read-only bank/card connectors after the import model and reconciliation workflow are proven.
5. Accounting and lender integrations only after partner-specific data contracts are agreed.

## Quality gates

- Unit tests for calculation, state transition, permission, and importer logic.
- API integration tests against ephemeral PostgreSQL with Alembic migrations applied, including RLS and reconciliation invariants.
- Celery integration tests for retries, duplicate delivery, job failure, and source-document processing; no task may create verified financial facts without a human review transition.
- Golden-document tests from de-identified 73 Broadway/392 samples; compare extraction proposals and citations, not just text accuracy.
- End-to-end tests for owner, CFO, PM, GC, and investor journeys.
- Load test document batches and concurrent reconciliation writes before pilot expansion.
- Security review for access control, file handling, secrets, and audit integrity before external investor access.

## Not recommended for the pilot

Do not start with microservices, a custom OCR model, blockchain, direct bank money movement, or fully automated posting. They add risk before the team has a stable data contract and a reconciled completed-project baseline.
