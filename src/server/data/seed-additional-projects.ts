import { db } from '../db/schema';

export function seedAdditionalProjects() {
  // PROJECT 2: Oakridge Duplex
  const p2 = 'proj-oakridge';
  db.prepare(`
    INSERT INTO projects (id, name, address, gc_name, lender_name, units, square_feet, target_budget, start_date, expected_completion, status, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `).run(
    p2,
    'Oakridge Duplex',
    '410 Oakridge Dr, Round Rock, TX',
    'Acme Builders LLC',
    'Texas Heritage Credit Union',
    2,
    4400,
    1080000,
    '2026-01-05',
    '2026-06-15',
    'user-dev-1'
  );

  db.prepare(`
    INSERT INTO loans (id, project_id, lender_name, loan_amount, interest_rate, term_months, holdback_amount, current_balance, closing_date, entered_by_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CFO')
  `).run('loan-oakridge', p2, 'Texas Heritage Credit Union', 850000, 0.0895, 18, 60000, 520000, '2026-01-05');

  db.prepare(`
    INSERT INTO expenses (id, project_id, category, vendor_id, vendor_name, amount, status, invoice_id, source_document_id, source_ref, cost_scope, lien_waiver_received, expense_date, entered_by_role)
    VALUES ('exp-oakridge-1', ?, 'Drywall & Framing', 'ven-oak', 'Central Texas Framing & Drywall', 695000, 'posted', 'INV-OAK-99', 'doc-oak', 'Ledger Row 44', 'PROJECT', 1, '2026-04-20', 'ACCOUNTANT')
  `).run(p2);

  // PROJECT 3: Elm St 4-Plex
  const p3 = 'proj-elm-st';
  db.prepare(`
    INSERT INTO projects (id, name, address, gc_name, lender_name, units, square_feet, target_budget, start_date, expected_completion, status, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `).run(
    p3,
    'Elm St 4-Plex',
    '108 Elm St, San Antonio, TX',
    'Acme Builders LLC',
    'Lone Star Commercial Bank',
    4,
    6200,
    1860000,
    '2026-03-01',
    '2026-10-30',
    'user-dev-1'
  );

  db.prepare(`
    INSERT INTO loans (id, project_id, lender_name, loan_amount, interest_rate, term_months, holdback_amount, current_balance, closing_date, entered_by_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CFO')
  `).run('loan-elm-st', p3, 'Lone Star Commercial Bank', 1450000, 0.0875, 24, 80000, 200000, '2026-03-01');

  db.prepare(`
    INSERT INTO expenses (id, project_id, category, vendor_id, vendor_name, amount, status, invoice_id, source_document_id, source_ref, cost_scope, lien_waiver_received, expense_date, entered_by_role)
    VALUES ('exp-elm-1', ?, 'Foundation & Site Prep', 'ven-elm', 'Alamo Foundation Partners', 240000, 'posted', 'INV-ELM-10', 'doc-elm', 'Ledger Row 12', 'PROJECT', 1, '2026-04-22', 'ACCOUNTANT')
  `).run(p3);

  // PROJECT 4: Crestview Lot 7
  const p4 = 'proj-crestview';
  db.prepare(`
    INSERT INTO projects (id, name, address, gc_name, lender_name, units, square_feet, target_budget, start_date, expected_completion, status, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `).run(
    p4,
    'Crestview Lot 7',
    'Lot 7 Crestview Meadows, Pflugerville, TX',
    'Acme Builders LLC',
    'Capital Construction Lending',
    1,
    2850,
    685000,
    '2026-04-01',
    '2026-11-15',
    'user-dev-1'
  );

  db.prepare(`
    INSERT INTO loans (id, project_id, lender_name, loan_amount, interest_rate, term_months, holdback_amount, current_balance, closing_date, entered_by_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CFO')
  `).run('loan-crestview', p4, 'Capital Construction Lending', 540000, 0.0925, 12, 35000, 35000, '2026-04-01');

  db.prepare(`
    INSERT INTO expenses (id, project_id, category, vendor_id, vendor_name, amount, status, invoice_id, source_document_id, source_ref, cost_scope, lien_waiver_received, expense_date, entered_by_role)
    VALUES ('exp-crestview-1', ?, 'Pre-construction & Permitting', 'ven-crest', 'Travis County Permits & Engineering', 38000, 'posted', 'INV-CP-01', 'doc-crest', 'Ledger Row 2', 'PROJECT', 1, '2026-04-20', 'ACCOUNTANT')
  `).run(p4);

  // PROJECT 5: Completed Westlake Villa #4
  const p5 = 'proj-westlake-completed';
  db.prepare(`
    INSERT INTO projects (id, name, address, gc_name, lender_name, units, square_feet, target_budget, start_date, expected_completion, status, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?)
  `).run(
    p5,
    'Westlake Villa #4',
    '4400 Westlake Dr, Austin, TX',
    'Acme Builders LLC',
    'Heritage Bank',
    1,
    4100,
    850000,
    '2025-06-01',
    '2026-01-30',
    'user-dev-1'
  );

  db.prepare(`
    INSERT INTO loans (id, project_id, lender_name, loan_amount, interest_rate, term_months, holdback_amount, current_balance, closing_date, entered_by_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CFO')
  `).run('loan-westlake', p5, 'Heritage Bank', 680000, 0.085, 12, 0, 0, '2025-06-01');

  db.prepare(`
    INSERT INTO expenses (id, project_id, category, vendor_id, vendor_name, amount, status, invoice_id, source_document_id, source_ref, cost_scope, lien_waiver_received, expense_date, entered_by_role)
    VALUES ('exp-westlake-1', ?, 'Turnkey Construction', 'ven-wl', 'Acme Builders Master Subcontractors', 850000, 'posted', 'INV-WL-FINAL', 'doc-wl', 'Final Closeout Package', 'PROJECT', 1, '2026-01-25', 'ACCOUNTANT')
  `).run(p5);
}
