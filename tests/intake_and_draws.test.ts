// Integration Tests for User Intake, Data Readiness, and Draw State Machine

import { describe, it, expect, beforeEach } from 'vitest';
import { db, initDatabase } from '../src/server/db/schema';
import { seedDatabase, seedSampleProjects } from '../src/server/data/seedData';
import {
  addDirectExpense,
  createProjectWithLoan,
  saveMasterBudgetSOV,
  saveScheduleMilestones,
} from '../src/server/services/intakeService';
import {
  createDrawRevision,
  createDrawSubmission,
  getProjectDraws,
  recordLenderReview,
  recordWireDisbursement,
} from '../src/server/services/drawService';
import { getProjectFourTruths } from '../src/server/services/projectService';

describe('User Intake, Data Readiness & Draw State Machine Tests', () => {
  beforeEach(() => {
    initDatabase();
    seedSampleProjects();
  });

  describe('1. User Intake Services', () => {
    it('Allows user to create new project, set loan parameters, and load SOV', () => {
      // 1. Developer creates project
      const { project, loan } = createProjectWithLoan(
        {
          name: 'The Domain Phase II',
          address: '3200 Palm Way, Austin, TX',
          gc_name: 'Apex Construction LLC',
          lender_name: 'Metro National Bank',
          units: 64,
          target_budget: 18000000,
          start_date: '2026-04-01',
          expected_completion: '2027-04-01',
          actor_role: 'DEVELOPER_OWNER',
        },
        {
          loan_amount: 12000000,
          interest_rate: 0.08,
          term_months: 24,
          holdback_amount: 600000,
        }
      );

      expect(project.id).toBeDefined();
      expect(loan?.loan_amount).toBe(12000000);

      // 2. CFO uploads Master Budget & SOV
      const sovResult = saveMasterBudgetSOV(
        project.id,
        [
          { category: 'Concrete', amount: 2000000, cost_code: '03-300' },
          { category: 'Framing', amount: 4000000, cost_code: '06-100' },
        ],
        'CFO'
      );
      expect(sovResult.lines.length).toBe(2);

      // 3. Accountant posts an invoice
      const exp = addDirectExpense(
        project.id,
        {
          category: 'Concrete',
          vendor_name: 'Austin Post-Tension Co',
          amount: 500000,
          expense_date: '2026-04-15',
          description: 'Footings excavation & rebar delivery',
          lien_waiver_received: true,
        },
        'ACCOUNTANT'
      );
      expect(exp.amount).toBe(500000);

      // 4. PM sets schedule milestones
      saveScheduleMilestones(
        project.id,
        [
          {
            milestone: 'Podium Slab Pour',
            trade: 'Concrete',
            planned_start: '2026-04-01',
            planned_end: '2026-05-01',
            verified_progress_pct: 0.25,
          },
        ],
        'PM'
      );

      // 5. Check computed Four Truths for newly created project
      const summary = getProjectFourTruths(project.id);
      expect(summary.total_current_budget).toBe(6000000);
      expect(summary.total_actual_spend).toBe(500000);
      expect(summary.total_amount_funded).toBe(0);
      expect(summary.developer_cash_exposure).toBe(500000); // 500,000 spend - 0 funded
      expect(summary.readiness.is_ready_for_live_tracking).toBe(true);
      expect(summary.readiness.readiness_score).toBe(80); // 4 out of 5 items loaded (Draws optional)
    });
  });

  describe('2. Draw Lifecycle & Revision State Machine', () => {
    it('Creates draw revisions preserving rejected history, recalculates exposure on disbursement', () => {
      const projectId = 'proj-212-maple';

      // Initial funded is 213,200, spend is 312,000, initial exposure is 98,800
      const initialSummary = getProjectFourTruths(projectId);
      expect(initialSummary.total_amount_funded).toBe(213200);
      expect(initialSummary.developer_cash_exposure).toBe(98800);

      // Submit Draw #3 for Framing & Trusses
      const newDraw = createDrawSubmission(
        projectId,
        3,
        [
          { category: 'Framing & Trusses', requested_amount: 50000 },
          { category: 'Exterior & Roofing', requested_amount: 20000 },
        ],
        'CFO'
      );

      // Lender reviews and rejects Exterior line due to missing waiver
      const lenderReview = recordLenderReview(
        newDraw.draw.id,
        {
          lines: [
            {
              id: newDraw.drawLines[0].id,
              approved_amount: 50000,
              status: 'approved',
            },
            {
              id: newDraw.drawLines[1].id,
              approved_amount: 0,
              status: 'rejected',
              rejection_reason_code: 'MISSING_LIEN_WAIVER',
              rejection_notes: 'Sub-tier supplier lien waiver missing',
            },
          ],
          lender_notes: 'Exterior rejected pending roofing supplier waiver',
        },
        'LENDER'
      );

      expect(lenderReview.status).toBe('approved_partial');
      expect(lenderReview.approved_total).toBe(50000);

      // Create Draw Revision 1
      const rev = createDrawRevision(
        newDraw.draw.id,
        [
          {
            category: 'Exterior & Roofing',
            requested_amount: 20000,
            corrective_document_id: 'doc-corrective-waiver',
            notes: 'Attached executed roofing supplier waiver',
          },
        ],
        'CFO'
      );
      expect(rev.revisionDraw.revision_number).toBe(1);

      // Record wire disbursement for approved funds ($50,000)
      recordWireDisbursement(newDraw.draw.id, 50000, 'LENDER');

      const updatedSummary = getProjectFourTruths(projectId);
      expect(updatedSummary.total_amount_funded).toBe(263200); // $213,200 + $50,000
      expect(updatedSummary.developer_cash_exposure).toBe(48800); // $312,000 - $263,200 = $48,800
    });
  });
});

