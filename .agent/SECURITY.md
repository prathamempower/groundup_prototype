# GroundUp AI: Security Guardrails and Vulnerability Boundaries

This specification defines the mandatory security architecture, authorization rules, and data protection boundaries enforced across GroundUp AI services.

***

## 1. Authentication and Authorization

* **Identity Model:** Authenticated user sessions authenticate via secure session tokens or Bearer JWTs mapped directly to `users(id)` and verified organizational memberships in `organization_members`.
* **Server-Authoritative RBAC:** Client-side interface filtering does not constitute authorization. Every backend endpoint must execute capability checks against the user's role:
  * Capabilities include `VIEW_PROJECT`, `EDIT_PROJECT`, `VIEW_BUDGET`, `EDIT_BUDGET`, `VIEW_SPEND`, `VERIFY_EXPENSE`, `VIEW_FUNDING`, `CREATE_DRAW`, `REVIEW_DRAW`, `SUBMIT_DRAW`, `VIEW_DOCUMENTS`, `UPLOAD_DOCUMENTS`, `VIEW_RECONCILIATION`, `RESOLVE_EXCEPTION`, `VIEW_FORECAST`, `EDIT_FORECAST`, `VIEW_INVESTOR_REPORT`, `MANAGE_USERS`, `MANAGE_ORGANIZATION`, `VIEW_AUDIT_LOGS`.
* **Multi-Tenant Data Isolation:** Every database query, transaction, and mutation must explicitly filter by `organization_id` (or `org_id`) and verify project membership via `project_members`. Cross-tenant data leaks are treated as critical security incidents.
* **Role Hierarchy Boundaries:**
  * **Owner:** Full executive control across portfolio, pro formas, draw packages, and organization settings. Cannot bypass immutable audit log requirements.
  * **Finance Lead:** Access to financial ledgers, bank reconciliation, spend verification, and draw packet compilation. Restricted from owner-only organization deletion or project ownership transfers.
  * **Project Manager:** Access to site progress, milestones, inspections, and evidence. Financial management and bank accounts are restricted.
  * **General Contractor:** Masked access restricted to milestone claims, photo evidence, and change orders. Overall project profitability, debt covenants, and investor returns are strictly concealed.
  * **Investor:** Read-only access to equity visibility and certified distribution reports. All mutation controls return HTTP 403 Forbidden.

***

## 2. API and Data Protection

* **Strict Input Validation:** Validate 100% of incoming request payloads using rigorous schema validators (such as Zod) before invoking domain logic or database transactions.
* **SQL Injection Prevention:** Concatenating raw SQL strings is strictly prohibited. Always use parameterized queries with prepared statements via the database wrapper (`stmt.run(...)`, `stmt.get(...)`, `stmt.all(...)`).
* **Ingestion Chain of Custody and Anti-Malware Sandboxing:**
  * Universal file ingestion executes in isolated worker sandboxes.
  * Compute and store an immutable SHA-256 cryptographic hash immediately upon upload.
  * Reject duplicate file uploads prior to invoking extraction pipelines.
* **Cross-Site Scripting (XSS) Prevention:** Escape all user-provided strings before rendering. Markdown rendering components must sanitize HTML markup using strict element allowlists.
* **Sanitized Error Responses:** Never expose raw database engine exceptions, internal file paths, or system stack traces to the frontend client. Return structured error bodies:
  ```json
  {
    "error": "Access Denied",
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "User lacks capability SUBMIT_DRAW for this project"
  }
  ```

***

## 3. Statutory Lien Waiver Compliance and Financial Integrity

* **Statutory Compliance Rules:** Prior to authorizing payment releases on subcontractor invoices, the platform validates statutory lien waiver status under California Civil Code Sections 8132, 8134, 8136, and 8138:
  * Progress Payments: Require Conditional Progress (Section 8132) on claim submission, followed by Unconditional Progress (Section 8134) upon payment receipt.
  * Final Retention: Require Conditional Final (Section 8136) on final billing, followed by Unconditional Final (Section 8138) on wire clearance.
* **Retainage Verification:** Ensure mathematical validation on every invoice:
  $$\text{Net Payable} = \text{Gross Incurred} - \text{Retainage Withheld (10\%)}$$

***

## 4. Concurrency Safety and Deadlock Prevention

* **Deterministic Lock Ordering:** When locking resources across multiple tables (for example, reconciling an invoice against a budget line and a draw line), always acquire locks in consistent alphabetical or hierarchical order (`budget_lines` -> `expenses` -> `draw_lines`).
* **Immediate Transaction Execution:** Use `BEGIN IMMEDIATE` for SQLite transactions to prevent deferred lock upgrades from causing `SQLITE_BUSY` or deadlock states under concurrent traffic.
* **Immutable Audit Trail:** Record all sensitive state mutations in `audit_events` (capturing actor role, actor name, entity, entity id, field, old value, and new value).

***

## 5. Secrets and Credential Hygiene

* **Zero Committed Secrets:** Never commit `.env`, `.env.local`, or configuration files containing private keys, database passwords, or third-party API credentials to source control.
* **Environment Variable Access:** Access sensitive variables exclusively through `process.env`.
* **Prohibition of In-Code Tokens:** Never hardcode secrets in code, comments, test fixtures, or markdown documentation.
