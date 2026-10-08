export const PIPELINE_TABLES_SQL = `
  -- 11. Documents
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    mime_type TEXT DEFAULT 'application/pdf',
    storage_path TEXT NOT NULL,
    type TEXT NOT NULL,
    classification_confidence REAL DEFAULT 1.0,
    sha256_hash TEXT,
    uploaded_by_role TEXT DEFAULT 'ACCOUNTANT',
    uploaded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  -- 12. Document Extractions
  CREATE TABLE IF NOT EXISTS document_extractions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    extraction_version TEXT DEFAULT 'v1.0',
    model_provider TEXT DEFAULT 'Claude 3.5 Sonnet',
    model_name TEXT DEFAULT 'anthropic.claude-3-5-sonnet',
    status TEXT DEFAULT 'VERIFIED',
    extracted_data TEXT,
    overall_confidence REAL DEFAULT 0.98,
    verification_status TEXT DEFAULT 'VERIFIED',
    verified_by TEXT DEFAULT 'user-dev-1',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (document_id) REFERENCES documents(id)
  );

  -- 13. Extraction Fields
  CREATE TABLE IF NOT EXISTS extraction_fields (
    id TEXT PRIMARY KEY,
    extraction_id TEXT NOT NULL,
    field_name TEXT NOT NULL,
    field_value TEXT,
    normalized_value TEXT,
    confidence REAL DEFAULT 0.95,
    page_number INTEGER DEFAULT 1,
    source_text TEXT,
    status TEXT DEFAULT 'VERIFIED',
    verified_by TEXT DEFAULT 'user-dev-1',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (extraction_id) REFERENCES document_extractions(id)
  );

  -- 14. Pipeline Steps
  CREATE TABLE IF NOT EXISTS pipeline_steps (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    step_name TEXT NOT NULL,
    status TEXT NOT NULL,
    output TEXT,
    confidence REAL DEFAULT 1.0,
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (document_id) REFERENCES documents(id)
  );

  -- 15. Staging Extractions
  CREATE TABLE IF NOT EXISTS staging_extractions (
    id TEXT PRIMARY KEY,
    job_id TEXT,
    project_id TEXT NOT NULL,
    category TEXT,
    vendor_name TEXT,
    amount REAL,
    date TEXT,
    description TEXT,
    confidence_score REAL DEFAULT 0.95,
    field_confidences TEXT,
    source_location TEXT,
    status TEXT DEFAULT 'PENDING_REVIEW',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  -- 16. Audit Events
  CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    actor_role TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    source TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
  );

  -- 17. Alerts
  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'HIGH',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recommended_action TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TEXT DEFAULT (datetime('now')),
    resolved_at TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  -- 18. Tasks
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    alert_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT,
    priority TEXT DEFAULT 'HIGH',
    status TEXT DEFAULT 'PENDING',
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  -- 19. Reconciliation Exceptions
  CREATE TABLE IF NOT EXISTS reconciliation_exceptions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    exception_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'HIGH',
    status TEXT NOT NULL DEFAULT 'OPEN',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_line_id TEXT,
    invoice_id TEXT,
    expense_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );
`;
