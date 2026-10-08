export const CORE_TABLES_SQL = `
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
`;
