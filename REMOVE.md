# GroundUp AI: Code Optimization and Anti-Pattern Removal Guide (REMOVE.md)

This document identifies inefficient, deadlock-prone, redundant, and buggy code patterns across the platform, providing concrete architectural refactoring solutions to ensure high concurrency, zero deadlocks, and clean maintainability.

***

## 1. Deadlock-Creating and Concurrency Anti-Patterns

### Anti-Pattern 1.1: Deferred SQLite Transaction Upgrades
* **The Bug:** Starting a transaction with standard `BEGIN;` defaults to a `DEFERRED` lock in SQLite. If two concurrent requests begin as readers and subsequently attempt to write, both attempt to upgrade their shared lock to a reserved/exclusive lock simultaneously. This causes immediate mutual blocking and crashes with `SQLITE_BUSY: database is locked`.
* **The Solution:** Always initiate write transactions using `BEGIN IMMEDIATE;`. This acquires the reserved lock immediately at transaction start, serializing concurrent writers cleanly and eliminating deadlock loops.
```typescript
// INSUFFICIENT (Prone to concurrent deadlock)
db.exec('BEGIN;');
try {
  mutateRecords();
  db.exec('COMMIT;');
} catch (err) {
  db.exec('ROLLBACK;');
}

// OPTIMIZED (Deterministic serialization)
db.exec('BEGIN IMMEDIATE;');
try {
  mutateRecords();
  db.exec('COMMIT;');
} catch (err) {
  db.exec('ROLLBACK;');
  throw err;
}
```

### Anti-Pattern 1.2: Inconsistent Multi-Table Lock Acquisition Order
* **The Bug:** When Request A updates `budget_lines` then `expenses`, while Request B updates `expenses` then `budget_lines`, a classic cycle deadlock occurs when both run concurrently in distributed databases (such as MariaDB or PostgreSQL).
* **The Solution:** Enforce strict deterministic lock ordering across all transactional workflows. Always mutate entities in alphabetical order or parent-to-child hierarchy: `projects` -> `budget_lines` -> `expenses` -> `draws` -> `draw_lines`.

***

## 2. Parameter Normalization and SQL Engine Traps

### Anti-Pattern 2.1: Array Parameter Passing in Modern SQLite Engines
* **The Bug:** In `node:sqlite` (DatabaseSync), passing raw JavaScript arrays directly to positional `?` placeholders causes the engine to interpret the array as a named parameter object keyed by index strings (`'0'`, `'1'`), resulting in runtime crashes: `Unknown named parameter '0'`.
* **The Solution:** Normalize all parameters before statement execution by serializing arrays to JSON strings and converting booleans to integers:
```typescript
function normalizeParam(value: any): any {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value === undefined) return null;
  if (Array.isArray(value)) return JSON.stringify(value);
  return value;
}
```

### Anti-Pattern 2.2: Raw SQL String Concatenation
* **The Bug:** Constructing queries via template literals: `db.prepare(\`SELECT * FROM projects WHERE id = '${projectId}'\`)`.
* **The Danger:** Critical SQL injection vulnerability, query plan cache misses, and syntax breakage on single quotes or special characters.
* **The Solution:** Mandate parameterized prepared statements: `db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId)`.

***

## 3. Performance Bottlenecks and N+1 Query Patterns

### Anti-Pattern 3.1: Loop-Based Financial Aggregations (N+1 Queries)
* **The Bug:** Querying a project's budget lines, then executing an individual query for every budget line to sum matching subcontractor invoices. For a 150-line Schedule of Values (SOV), this triggers 151 round-trips to the database.
* **The Solution:** Replace loops with a single grouped aggregation query or Common Table Expression (CTE):
```sql
SELECT 
  bl.id AS budget_line_id,
  bl.cost_code,
  bl.original_amount,
  COALESCE(SUM(e.amount), 0) AS total_incurred_spend
FROM budget_lines bl
LEFT JOIN expenses e ON e.project_id = bl.project_id AND e.category = bl.category
WHERE bl.project_id = ?
GROUP BY bl.id, bl.cost_code, bl.original_amount;
```

### Anti-Pattern 3.2: Missing Indexes on High-Cardinality Foreign Keys
* **The Bug:** Querying `expenses`, `draw_lines`, or `audit_events` filtering by `project_id` or `org_id` without explicit indexes causes full table scans on large ledgers.
* **The Solution:** Add composite indexes on high-frequency filtering paths:
```sql
CREATE INDEX IF NOT EXISTS idx_expenses_project_category ON expenses(project_id, category);
CREATE INDEX IF NOT EXISTS idx_draw_lines_draw_project ON draw_lines(draw_id, project_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_session ON onboarding_responses(session_id, user_id);
```

***

## 4. Frontend Memory Leaks and Render Traps

### Anti-Pattern 4.1: Substring Matching Collisions in Automated Testing
* **The Bug:** Writing DOM queries such as `page.locator('button:has-text("Back")')`. If an option card contains words like "holdbacks" or "background", the locator encounters ambiguous elements and times out.
* **The Solution:** Enforce unique, explicit DOM IDs for all critical user actions: `#btn-onboarding-back`, `#btn-onboarding-next`, `#btn-onboarding-launch`, `#btn-onboarding-review-answers`.

### Anti-Pattern 4.2: Unbounded Viewport Dropdown Clipping
* **The Bug:** Role dropdowns and option lists with 10+ entries rendering without vertical scroll constraints, overflowing below the browser viewport and preventing click events.
* **The Solution:** Constrain all tall popovers with `max-h-[75vh] overflow-y-auto`.

***

## 5. Architectural Removal and Deprecation Checklist

| Deprecated Item | Reason for Removal | Modern Replacement |
| :--- | :--- | :--- |
| `better-sqlite3` dependency | Node.js v22 includes native high-performance `node:sqlite` DatabaseSync without node-gyp build overhead | Native `node:sqlite` DatabaseSync with WAL pragma |
| Raw unparameterized queries | SQL injection vulnerability and query cache misses | Parameterized prepared statements |
| `BEGIN DEFERRED` transactions | SQLite database lock contention and deadlocks | `BEGIN IMMEDIATE` with deterministic lock ordering |
| Unbounded dropdown menus | Viewport clipping and accessibility failures | Constrained `max-h-[75vh] overflow-y-auto` panels |
| Combined role identifiers (`Owner / Developer`) | Ambiguous permissions and broken RBAC | Individual canonical roles (`Owner`, `Developer`) |
| Unindexed foreign key lookups | Full table scans on multi-tenant queries | Composite B-tree indexes on `project_id`, `session_id`, `category` |
| Client-side financial mocks | Deceptive reporting and calculation inaccuracies | Four Truths deterministic engine with live ledger math |

