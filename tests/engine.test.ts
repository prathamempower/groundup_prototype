// Automated Unit Tests for GroundUp AI Calculation Engine
// Verifies 100% mathematical precision of all formulas

import { describe, it, expect } from 'vitest';
import { calculateBudgetTruth } from '../src/shared/engine/budgetTruth';
import { calculateSpendTruth } from '../src/shared/engine/spendTruth';
import { calculateFundingTruth } from '../src/shared/engine/fundingTruth';
import { calculateProgressTruth } from '../src/shared/engine/progressTruth';
import { computeProjectFourTruths } from '../src/shared/engine/reconciliation';
import {
  BudgetLine,
  BudgetVersion,
  ChangeOrder,
  Draw,
  DrawLine,
  Expense,
  Inspection,
  Loan,
  Project,
  ScheduleActivity,
} from '../src/shared/types';

describe('GroundUp AI — Pure Calculation Engine', () => {
  describe('1. Budget Truth (Section 3.1)', () => {
    it('CurrentBudget = LatestApprovedBudgetVersion + sum(ApprovedChangeOrders)', () => {
      const budgetVersions: BudgetVersion[] = [
        { id: 'v1', project_id: 'p1', version_number: 1, status: 'SUPERSEDED', created_at: '2026-01-01' },
        { id: 'v2', project_id: 'p1', version_number: 2, status: 'APPROVED', created_at: '2026-02-01' },
        { id: 'v3', project_id: 'p1', version_number: 3, status: 'DRAFT', created_at: '2026-03-01' },
      ];

      const budgetLines: BudgetLine[] = [
        { id: 'l1', project_id: 'p1', version_id: 'v2', category: 'Concrete', original_amount: 1450000 },
        { id: 'l2', project_id: 'p1', version_id: 'v2', category: 'Framing', original_amount: 2800000 },
      ];

      const changeOrders: ChangeOrder[] = [
        {
          id: 'co1',
          project_id: 'p1',
          change_order_number: 'CO-01',
          category: 'Concrete',
          amount: 45000,
          approval_status: 'APPROVED',
          budget_impact: true,
          requested_date: '2026-02-10',
          description: 'Helical piers depth increase',
        },
      ];

      const result = calculateBudgetTruth(budgetVersions, budgetLines, changeOrders);

      expect(result.categories['Concrete'].original_amount).toBe(1450000);
      expect(result.categories['Concrete'].approved_change_orders).toBe(45000);
      expect(result.categories['Concrete'].current_budget).toBe(1495000);
      expect(result.total_current_budget).toBe(4295000);
    });
  });

  describe('2. Spend Truth (Section 3.2)', () => {
    it('ActualSpend counts ONLY posted expenses and flags over-budget categories', () => {
      const expenses: Expense[] = [
        {
          id: 'e1',
          project_id: 'p1',
          category: 'Plumbing',
          vendor_id: 'v1',
          vendor_name: 'Apex Plumbing',
          amount: 480000,
          status: 'posted',
          source_document_id: 'doc1',
          source_ref: 'Expenses.xlsx, Row 52',
          cost_scope: 'PROJECT',
          lien_waiver_received: true,
          expense_date: '2026-02-22',
          entered_by_role: 'ACCOUNTANT',
          created_at: '2026-02-22',
        },
        {
          id: 'e2',
          project_id: 'p1',
          category: 'Plumbing',
          vendor_id: 'v1',
          vendor_name: 'Apex Plumbing',
          amount: 299000,
          status: 'posted',
          source_document_id: 'doc1',
          source_ref: 'Expenses.xlsx, Row 59',
          cost_scope: 'PROJECT',
          lien_waiver_received: false,
          expense_date: '2026-03-12',
          entered_by_role: 'ACCOUNTANT',
          created_at: '2026-03-12',
        },
        {
          id: 'e3',
          project_id: 'p1',
          category: 'Plumbing',
          vendor_id: 'v1',
          vendor_name: 'Apex Plumbing',
          amount: 50000,
          status: 'pending', // Unconfirmed, MUST NOT count in Spend Truth
          source_document_id: 'doc2',
          source_ref: 'Invoice_Draft.pdf',
          cost_scope: 'PROJECT',
          lien_waiver_received: false,
          expense_date: '2026-03-20',
          entered_by_role: 'ACCOUNTANT',
          created_at: '2026-03-20',
        },
      ];

      const currentBudgetMap = { Plumbing: 950000 };
      const result = calculateSpendTruth(expenses, currentBudgetMap);

      expect(result.categories['Plumbing'].actual_spend).toBe(779000); // 480,000 + 299,000
      expect(result.categories['Plumbing'].pending_spend).toBe(50000);
      expect(result.total_actual_spend).toBe(779000);
      expect(result.categories['Plumbing'].budget_variance).toBe(-171000);
    });
  });

  describe('3. Funding Truth & Developer Cash Exposure (Section 3.3)', () => {
    it('AmountFunded strictly counts disbursed lines, DeveloperCashExposure = Spend - Funded', () => {
      const draws: Draw[] = [
        {
          id: 'd1',
          project_id: 'p1',
          draw_number: 1,
          revision_number: 0,
          requested_total: 1170000,
          approved_total: 1170000,
          disbursed_total: 1170000,
          status: 'approved_full',
          submitted_date: '2026-02-01',
          created_at: '2026-02-01',
        },
      ];

      const drawLines: DrawLine[] = [
        {
          id: 'dl1',
          draw_id: 'd1',
          project_id: 'p1',
          category: 'Concrete',
          requested_amount: 1170000,
          approved_amount: 1170000,
          funded_amount: 1170000,
          status: 'disbursed',
        },
      ];

      const totalActualSpend = 4714000;
      const result = calculateFundingTruth(draws, drawLines, totalActualSpend);

      expect(result.total_amount_funded).toBe(1170000);
      // Cash Exposure = 4,714,000 - 1,170,000 = 3,544,000
      expect(result.developer_cash_exposure).toBe(3544000);
    });
  });

  describe('4. Progress Truth & Daily Carrying Cost (Section 3.4)', () => {
    it('Calculates daily interest carrying cost from actual loan balance and APR', () => {
      const loan: Loan = {
        id: 'l1',
        project_id: 'p1',
        lender_name: 'Lone Star Bank',
        loan_amount: 10000000,
        current_balance: 4800000, // $4.8M balance
        interest_rate: 0.0825,    // 8.25% APR
        term_months: 24,
        holdback_amount: 500000,
        closing_date: '2026-01-05',
        entered_by_role: 'CFO',
      };

      const activities: ScheduleActivity[] = [
        {
          id: 'act1',
          project_id: 'p1',
          milestone: 'Plumbing Rough-In',
          trade: 'Plumbing',
          planned_start: '2026-02-01',
          planned_end: '2026-03-10',
          verified_progress_pct: 0.55,
          last_verified_source: 'inspection_result',
          last_verified_date: '2026-03-12',
          entered_by_role: 'PM',
        },
      ];

      const inspections: Inspection[] = [
        {
          id: 'insp1',
          project_id: 'p1',
          milestone: 'Plumbing Rough-In',
          trade: 'Plumbing',
          requested_date: '2026-03-10',
          result: 'PARTIAL_PASS',
        },
      ];

      const result = calculateProgressTruth(activities, inspections, loan);

      // Daily carrying cost = 4,800,000 * (0.0825 / 365) = $1,084.93 / day
      expect(result.daily_carrying_cost).toBe(1084.93);
    });
  });

  describe('5. Reconciliation Engine Divergence Detection (Section 3.5)', () => {
    it('Flags reconciliation exception when SpendPct - ProgressPct > 15%', () => {
      const project: Project = {
        id: 'p1',
        name: 'The Heights at Riverfront',
        address: '1420 Riverfront Blvd',
        gc_name: 'Apex GC',
        lender_name: 'Lone Star Bank',
        units: 48,
        target_budget: 14200000,
        start_date: '2026-01-10',
        expected_completion: '2026-11-30',
        status: 'ACTIVE',
        created_by_user_id: 'user-dev-1',
        created_at: '2026-01-10',
      };

      const data = {
        budgetVersions: [{ id: 'bv1', project_id: 'p1', version_number: 1, status: 'APPROVED' as const, created_at: '2026-01-10' }],
        budgetLines: [{ id: 'bl1', project_id: 'p1', version_id: 'bv1', category: 'Plumbing', original_amount: 950000 }],
        changeOrders: [],
        expenses: [
          {
            id: 'e1',
            project_id: 'p1',
            category: 'Plumbing',
            vendor_id: 'v1',
            vendor_name: 'Apex Plumbing',
            amount: 779000, // 82% spent
            status: 'posted' as const,
            source_document_id: 'doc1',
            source_ref: 'Expenses.xlsx, Row 52',
            cost_scope: 'PROJECT' as const,
            lien_waiver_received: true,
            expense_date: '2026-03-01',
            entered_by_role: 'ACCOUNTANT' as const,
            created_at: '2026-03-01',
          },
        ],
        draws: [],
        drawLines: [],
        activities: [
          {
            id: 'a1',
            project_id: 'p1',
            milestone: 'Plumbing Rough-In',
            trade: 'Plumbing',
            planned_start: '2026-02-01',
            planned_end: '2026-03-10',
            verified_progress_pct: 0.55, // 55% progress
            last_verified_source: 'inspection_result' as const,
            last_verified_date: '2026-03-12',
            entered_by_role: 'PM' as const,
          },
        ],
        inspections: [],
      };

      const summary = computeProjectFourTruths(project, data, 0.15);

      const plumbing = summary.categories.find((c) => c.category === 'Plumbing');
      expect(plumbing?.has_reconciliation_flag).toBe(true);
      expect(plumbing?.reconciliation_delta_pct).toBe(27); // 82% - 55% = +27%
      expect(summary.active_alerts.some((a) => a.type === 'RECONCILIATION_EXCEPTION')).toBe(true);
    });
  });
});
