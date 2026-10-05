// GroundUp AI — Comprehensive SQLite Schema & Database Access Layer
// Normalized Four-Truths Domain Schema matching services, intake, seed data, and provenance

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'groundup.db');
export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- 1. Projects
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      gc_name TEXT NOT NULL,
      lender_name TEXT NOT NULL,
      units INTEGER NOT NULL DEFAULT 1,
      square_feet REAL,
      target_budget REAL NOT NULL,
      start_date TEXT,
      expected_completion TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_by_user_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 2. Loans
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      lender_name TEXT NOT NULL,
      loan_amount REAL NOT NULL,
      interest_rate REAL NOT NULL,
      term_months INTEGER DEFAULT 18,
      holdback_amount REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
      closing_date TEXT,
      entered_by_role TEXT DEFAULT 'CFO',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- 3. Budget Versions
    CREATE TABLE IF NOT EXISTS budget_versions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      version_number INTEGER DEFAULT 1,
      status TEXT DEFAULT 'APPROVED',
      approved_at TEXT,
      approved_by_user_id TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- 4. Budget Lines
    CREATE TABLE IF NOT EXISTS budget_lines (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      version_id TEXT NOT NULL,
      category TEXT NOT NULL,
      sub_category TEXT,
      cost_code TEXT,
      original_amount REAL NOT NULL,
      source_document_id TEXT,
      source_ref TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (version_id) REFERENCES budget_versions(id)
    );

    -- 5. Change Orders
    CREATE TABLE IF NOT EXISTS change_orders (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      change_order_number TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      approval_status TEXT DEFAULT 'APPROVED',
      budget_impact INTEGER DEFAULT 1,
      requested_date TEXT,
      approved_date TEXT,
      approved_by_user_id TEXT,
      description TEXT,
      source_document_id TEXT,
      source_ref TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- 6. Expenses / Invoices
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      category TEXT NOT NULL,
      vendor_id TEXT,
      vendor_name TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'posted',
      invoice_id TEXT,
      source_document_id TEXT,
      source_ref TEXT,
      cost_scope TEXT DEFAULT 'PROJECT',
      lien_waiver_received INTEGER DEFAULT 1,
      description TEXT,
      expense_date TEXT,
      entered_by_role TEXT DEFAULT 'ACCOUNTANT',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- 7. Draws
    CREATE TABLE IF NOT EXISTS draws (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      draw_number INTEGER NOT NULL,
      revision_number INTEGER DEFAULT 0,
      original_draw_id TEXT,
      requested_total REAL DEFAULT 0,
      approved_total REAL DEFAULT 0,
      disbursed_total REAL DEFAULT 0,
      status TEXT DEFAULT 'submitted',
      submitted_date TEXT,
      response_date TEXT,
      disbursed_date TEXT,
      lender_notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- 8. Draw Lines
    CREATE TABLE IF NOT EXISTS draw_lines (
      id TEXT PRIMARY KEY,
      draw_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      category TEXT NOT NULL,
      requested_amount REAL NOT NULL,
      approved_amount REAL DEFAULT 0,
      funded_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'requested',
      rejection_reason_code TEXT,
      rejection_notes TEXT,
      corrective_document_id TEXT,
      source_document_id TEXT,
      source_ref TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (draw_id) REFERENCES draws(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- 9. Schedule Activities
    CREATE TABLE IF NOT EXISTS schedule_activities (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      milestone TEXT NOT NULL,
      trade TEXT NOT NULL,
      planned_start TEXT NOT NULL,
      planned_end TEXT NOT NULL,
      actual_start TEXT,
      actual_end TEXT,
      verified_progress_pct REAL DEFAULT 0,
      last_verified_source TEXT DEFAULT 'PM_confirmation',
      last_verified_date TEXT,
      entered_by_role TEXT DEFAULT 'PM',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- 10. Inspections
    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      milestone TEXT,
      trade TEXT NOT NULL,
      requested_date TEXT,
      inspection_date TEXT,
      result TEXT DEFAULT 'PASSED',
      inspector_name TEXT,
      inspector_agency TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

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
  `);
}
