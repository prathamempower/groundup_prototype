// GroundUp AI — Seed Dataset matching Reference Designs
// Exactly reflects portfolio metrics, draw submissions, Gantt timelines, and Deal Lab underwriting

import { db, initDatabase } from '../db/schema';
import crypto from 'crypto';

export function seedDatabase() {
  initDatabase();

  db.exec(`
    PRAGMA foreign_keys = OFF;
    DELETE FROM pipeline_steps;
    DELETE FROM document_extractions;
    DELETE FROM audit_events;
    DELETE FROM staging_extractions;
    DELETE FROM documents;
    DELETE FROM inspections;
    DELETE FROM schedule_activities;
    DELETE FROM change_orders;
    DELETE FROM draw_lines;
    DELETE FROM draws;
    DELETE FROM expenses;
    DELETE FROM budget_lines;
    DELETE FROM budget_versions;
    DELETE FROM loans;
    DELETE FROM projects;
    PRAGMA foreign_keys = ON;
  `);
}

export function seedSampleProjects() {
  seedDatabase();

  // ==========================================
  // PROJECT 1: 212 Maple Ave (Austin, TX)
  // Single-family · 3,240 sf · Closed Feb 14, 2026 · 18-mo term · Loan $592k · ARV $895k
  // ==========================================
  const p1 = 'proj-212-maple';
  db.prepare(`
    INSERT INTO projects (id, name, address, gc_name, lender_name, units, square_feet, target_budget, start_date, expected_completion, status, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `).run(
    p1,
    '212 Maple Ave',
    '212 Maple Ave, Austin, TX 78704',
    'Acme Builders LLC',
    'Heritage Bank',
    1,
    3240,
    740000,
    '2026-02-14',
    '2026-04-20',
    'user-dev-1'
  );

  // Loan Facility #L-22841 ($592,000 @ 9.75%, drawn $213,200)
  db.prepare(`
    INSERT INTO loans (id, project_id, lender_name, loan_amount, interest_rate, term_months, holdback_amount, current_balance, closing_date, entered_by_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CFO')
  `).run('loan-212-maple', p1, 'Heritage Bank', 592000, 0.0975, 18, 50000, 213200, '2026-02-14');

  // Budget Version
  const docP1 = 'doc-sov-212-maple';
  db.prepare(`
    INSERT INTO documents (id, project_id, file_name, file_size, mime_type, storage_path, type, classification_confidence, sha256_hash, uploaded_by_role)
    VALUES (?, ?, '212_Maple_SOV_Approved.xlsx', 142000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '/docs/212_Maple_SOV_Approved.xlsx', 'BUDGET_SPREADSHEET', 0.99, ?, 'CFO')
  `).run(docP1, p1, crypto.createHash('sha256').update('212_maple_sov').digest('hex'));

  const bvP1 = 'bv-212-maple-v1';
  db.prepare(`
    INSERT INTO budget_versions (id, project_id, version_number, status, approved_at, approved_by_user_id, notes)
    VALUES (?, ?, 1, 'APPROVED', '2026-02-14', 'user-cfo-1', 'GMP Master Budget Heritage Bank')
  `).run(bvP1, p1);

  const budgetLinesP1 = [
    { cat: 'Pre-construction & Permits', sub: 'Architectural, engineering, city permits', code: '01-100', amount: 38000 },
    { cat: 'Site Work & Demolition', sub: 'Excavation & tree protection', code: '02-100', amount: 42000 },
    { cat: 'Foundation & Concrete', sub: 'Engineered post-tension slab', code: '03-300', amount: 135000 },
    { cat: 'Framing & Trusses', sub: '2x6 framing, roof trusses, OSB sheathing', code: '06-100', amount: 185000 },
    { cat: 'MEP Rough-in', sub: 'Plumbing, electrical conduit, HVAC ductwork', code: '22-000', amount: 110000 },
    { cat: 'Drywall & Insulation', sub: 'Spray foam insulation & level 4 drywall', code: '09-200', amount: 65000 },
    { cat: 'Exterior & Roofing', sub: 'Standing seam roof, fiber cement siding', code: '07-100', amount: 55000 },
    { cat: 'Interior Finishes', sub: 'Hardwood floors, custom cabinetry, quartz', code: '09-600', amount: 75000 },
    { cat: 'Contingency', sub: 'Owner construction reserve', code: '00-500', amount: 35000 },
  ];

  for (const bl of budgetLinesP1) {
    db.prepare(`
      INSERT INTO budget_lines (id, project_id, version_id, category, sub_category, cost_code, original_amount, source_document_id, source_ref)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`bl-212-${bl.cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, p1, bvP1, bl.cat, bl.sub, bl.code, bl.amount, docP1, `SOV Line ${bl.code}`);
  }

  // Schedule Milestones for 212 Maple Ave (Day 28 of 64 Gantt)
  const scheduleMilestonesP1 = [
    { name: 'Pre-construction', trade: 'Architecture / Permits', start: '2026-02-14', end: '2026-02-22', prog: 1.0, src: 'PM_confirmation' },
    { name: 'Foundation', trade: 'Concrete & Masonry', start: '2026-02-22', end: '2026-03-06', prog: 1.0, src: 'inspection_result' },
    { name: 'Framing', trade: 'Carpentry & Framing', start: '2026-03-06', end: '2026-03-24', prog: 0.80, src: 'inspection_result' },
    { name: 'MEP rough-in', trade: 'Plumbing, Electrical, HVAC', start: '2026-03-24', end: '2026-04-03', prog: 0.0, src: 'PM_confirmation' },
    { name: 'Drywall + finish', trade: 'Drywall & Painting', start: '2026-04-03', end: '2026-04-13', prog: 0.0, src: 'PM_confirmation' },
    { name: 'Final + CO', trade: 'General / City Inspection', start: '2026-04-13', end: '2026-04-20', prog: 0.0, src: 'PM_confirmation' },
  ];

  for (let i = 0; i < scheduleMilestonesP1.length; i++) {
    const sm = scheduleMilestonesP1[i];
    db.prepare(`
      INSERT INTO schedule_activities (id, project_id, milestone, trade, planned_start, planned_end, verified_progress_pct, last_verified_source, last_verified_date, entered_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, '2026-04-25', 'PM')
    `).run(`sa-212-${i + 1}`, p1, sm.name, sm.trade, sm.start, sm.end, sm.prog, sm.src);
  }

  // Municipal & Bank Inspections
  db.prepare(`
    INSERT INTO inspections (id, project_id, milestone, trade, requested_date, inspection_date, result, inspector_name, inspector_agency, notes)
    VALUES ('insp-212-1', ?, 'Foundation', 'Concrete', '2026-03-04', '2026-03-05', 'PASSED', 'Robert Martinez', 'City of Austin Inspections', 'Post-tension foundation passed pre-pour inspection')
  `).run(p1);

  db.prepare(`
    INSERT INTO inspections (id, project_id, milestone, trade, requested_date, inspection_date, result, inspector_name, inspector_agency, notes)
    VALUES ('insp-212-2', ?, 'Framing', 'Carpentry', '2026-04-24', '2026-04-25', 'PASSED', 'Sarah Henderson', 'Heritage Bank Inspector', 'Framing milestone confirmed at 80%+. Roof trusses set, sheathing complete.')
  `).run(p1);

  // Draws for 212 Maple Ave:
  // Draw #1 Disbursed ($213,200)
  db.prepare(`
    INSERT INTO draws (id, project_id, draw_number, revision_number, requested_total, approved_total, disbursed_total, status, submitted_date, disbursed_date, lender_notes)
    VALUES ('draw-212-1', ?, 1, 0, 213200, 213200, 213200, 'approved_full', '2026-03-07', '2026-03-12', 'Disbursed for Site Work and Foundation milestone')
  `).run(p1);

  db.prepare(`
    INSERT INTO draw_lines (id, draw_id, project_id, category, requested_amount, approved_amount, funded_amount, status)
    VALUES ('dl-212-1-1', 'draw-212-1', ?, 'Foundation & Concrete', 135000, 135000, 135000, 'disbursed')
  `).run(p1);

  db.prepare(`
    INSERT INTO draw_lines (id, draw_id, project_id, category, requested_amount, approved_amount, funded_amount, status)
    VALUES ('dl-212-1-2', 'draw-212-1', ?, 'Site Work & Demolition', 40200, 40200, 40200, 'disbursed')
  `).run(p1);

  db.prepare(`
    INSERT INTO draw_lines (id, draw_id, project_id, category, requested_amount, approved_amount, funded_amount, status)
    VALUES ('dl-212-1-3', 'draw-212-1', ?, 'Pre-construction & Permits', 38000, 38000, 38000, 'disbursed')
  `).run(p1);

  // Draw #2 Ready for Submission ($84,500 pending)
  db.prepare(`
    INSERT INTO draws (id, project_id, draw_number, revision_number, requested_total, approved_total, disbursed_total, status, submitted_date, lender_notes)
    VALUES ('draw-212-2', ?, 2, 0, 84500, 84500, 0, 'submitted', '2026-04-25', 'Draw #2 Framing & Roof Trusses verified via photo inspection')
  `).run(p1);

  db.prepare(`
    INSERT INTO draw_lines (id, draw_id, project_id, category, requested_amount, approved_amount, funded_amount, status)
    VALUES ('dl-212-2-1', 'draw-212-2', ?, 'Framing & Trusses', 54500, 54500, 0, 'requested')
  `).run(p1);

  db.prepare(`
    INSERT INTO draw_lines (id, draw_id, project_id, category, requested_amount, approved_amount, funded_amount, status)
    VALUES ('dl-212-2-2', 'draw-212-2', ?, 'Foundation & Concrete', 30000, 30000, 0, 'requested')
  `).run(p1);


  // Expenses for 212 Maple Ave (Total Posted Spend = $312,000)
  // Out of pocket awaiting draw = $312,000 - $213,200 = $98,800 fronting cash!
  const expensesP1 = [
    { cat: 'Pre-construction & Permits', vendor: 'Austin City Planning', amount: 38000, inv: 'INV-2026-01', ref: 'Permit Receipts #P-881' },
    { cat: 'Site Work & Demolition', vendor: 'Lone Star Excavation LLC', amount: 42000, inv: 'INV-2026-02', ref: 'Excavation Inv #4419' },
    { cat: 'Foundation & Concrete', vendor: 'Titan Concrete Systems', amount: 133200, inv: 'INV-2026-03', ref: 'Concrete Pour Inv #1092' },
    { cat: 'Framing & Trusses', vendor: 'BMC Building Materials', amount: 98800, inv: 'INV-2026-04', ref: 'Lumber & Truss Package Inv #5512' },
  ];

  for (const exp of expensesP1) {
    db.prepare(`
      INSERT INTO expenses (id, project_id, category, vendor_id, vendor_name, amount, status, invoice_id, source_document_id, source_ref, cost_scope, lien_waiver_received, expense_date, entered_by_role)
      VALUES (?, ?, ?, 'ven-1', ?, ?, 'posted', ?, ?, ?, 'PROJECT', 1, '2026-04-20', 'ACCOUNTANT')
    `).run(`exp-212-${exp.cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, p1, exp.cat, exp.vendor, exp.amount, exp.inv, docP1, exp.ref);
  }

  // ==========================================
  // PROJECT 2: Oakridge Duplex (Round Rock, TX)
  // 2-unit · Round Rock, TX · Budget $695k / $1.08M · 2 risks · +8d behind · Drywall 64% complete · Next draw $124k Wed Apr 30 · ARV conf 64%
  // ==========================================
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

  // Spend for Oakridge Duplex = $695,000
  db.prepare(`
    INSERT INTO expenses (id, project_id, category, vendor_id, vendor_name, amount, status, invoice_id, source_document_id, source_ref, cost_scope, lien_waiver_received, expense_date, entered_by_role)
    VALUES ('exp-oakridge-1', ?, 'Drywall & Framing', 'ven-oak', 'Central Texas Framing & Drywall', 695000, 'posted', 'INV-OAK-99', 'doc-oak', 'Ledger Row 44', 'PROJECT', 1, '2026-04-20', 'ACCOUNTANT')
  `).run(p2);

  // ==========================================
  // PROJECT 3: Elm St 4-Plex (San Antonio, TX)
  // Multifamily · San Antonio, TX · Budget $240k / $1.86M · 1 risk · On track · Foundation 18% complete · Next draw $168k Fri May 2 · ARV conf 92%
  // ==========================================
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

  // ==========================================
  // PROJECT 4: Crestview Lot 7 (Pflugerville, TX)
  // SFH · Pflugerville, TX · Budget $38k / $685k · On track · Pre-construction 5% complete · Next draw — · ARV conf 81%
  // ==========================================
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

  // ==========================================
  // PROJECT 5: Completed Project for Filter Testing: Westlake Villa #4
  // ==========================================
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
