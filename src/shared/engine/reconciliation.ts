// GroundUp AI — Four Truths Reconciliation Engine
// Rule 2: Multiple truths by domain. Nothing forces them into one number.
// Rule 3: AI proposes, deterministic code calculates.

import {
  AlertRisk,
  CategoryTruth,
  Project,
  ProjectFourTruthsSummary,
} from '../types';
import { calculateBudgetTruth } from './budgetTruth';
import { calculateSpendTruth } from './spendTruth';
import { calculateFundingTruth } from './fundingTruth';
import { calculateProgressTruth } from './progressTruth';
import { evaluateDataReadiness } from './dataReadiness';

export function computeProjectFourTruths(
  project: Project,
  data: {
    budgetVersions: any[];
    budgetLines: any[];
    changeOrders: any[];
    expenses: any[];
    draws: any[];
    drawLines: any[];
    activities: any[];
    inspections: any[];
    loan?: any;
    existingAlerts?: AlertRisk[];
  },
  divergenceThreshold: number = 0.15
): ProjectFourTruthsSummary {
  // 1. Budget Truth
  const budgetResult = calculateBudgetTruth(
    data.budgetVersions || [],
    data.budgetLines || [],
    data.changeOrders || []
  );

  const currentBudgetMap: Record<string, number> = {};
  for (const [cat, res] of Object.entries(budgetResult.categories)) {
    currentBudgetMap[cat] = res.current_budget;
  }

  // 2. Spend Truth
  const spendResult = calculateSpendTruth(data.expenses || [], currentBudgetMap);

  // 3. Funding Truth
  const fundingResult = calculateFundingTruth(
    data.draws || [],
    data.drawLines || [],
    spendResult.total_actual_spend
  );

  // 4. Progress Truth
  const progressResult = calculateProgressTruth(
    data.activities || [],
    data.inspections || [],
    data.loan
  );

  // 5. Evaluate Data Readiness
  const readiness = evaluateDataReadiness(project.id, {
    loan: data.loan,
    budgetLines: data.budgetLines || [],
    expenses: data.expenses || [],
    activities: data.activities || [],
    draws: data.draws || [],
    inspections: data.inspections || [],
  });

  const categoryProgressMap: Record<string, { pct: number; source: string }> = {};
  for (const act of progressResult.milestones) {
    categoryProgressMap[act.trade] = {
      pct: act.verified_progress_pct,
      source: act.last_verified_source,
    };
    categoryProgressMap[act.milestone] = {
      pct: act.verified_progress_pct,
      source: act.last_verified_source,
    };
  }

  const allCategories = new Set<string>([
    ...Object.keys(budgetResult.categories),
    ...Object.keys(spendResult.categories),
    ...Object.keys(fundingResult.categories),
  ]);

  const categories: CategoryTruth[] = [];
  const generatedAlerts: AlertRisk[] = [];

  for (const cat of allCategories) {
    const b = budgetResult.categories[cat] || {
      original_amount: 0,
      approved_change_orders: 0,
      current_budget: 0,
    };

    const s = spendResult.categories[cat] || {
      actual_spend: 0,
      pending_spend: 0,
      budget_variance: 0,
      budget_variance_pct: 0,
      is_over_budget: false,
    };

    const f = fundingResult.categories[cat] || {
      requested_amount: 0,
      approved_amount: 0,
      funded_amount: 0,
      rejected_amount: 0,
    };

    const p = categoryProgressMap[cat] || {
      pct: 0,
      source: 'unverified',
    };

    const spendPct = b.current_budget > 0 ? s.actual_spend / b.current_budget : s.actual_spend > 0 ? 1 : 0;
    const progressPct = p.pct;
    const divergence = round(spendPct - progressPct);
    const hasReconciliationFlag = divergence > divergenceThreshold && s.actual_spend > 0;

    const catTruth: CategoryTruth = {
      category: cat,
      approved_budget: b.original_amount,
      approved_change_orders: b.approved_change_orders,
      current_budget: b.current_budget,
      actual_spend: s.actual_spend,
      pending_spend: s.pending_spend,
      budget_variance: s.budget_variance,
      budget_variance_pct: s.budget_variance_pct,
      spend_pct: round(spendPct * 100) / 100,
      amount_requested_draw: f.requested_amount,
      amount_approved_draw: f.approved_amount,
      amount_funded: f.funded_amount,
      verified_progress_pct: round(progressPct * 100) / 100,
      progress_source: p.source,
      is_over_budget: s.is_over_budget,
      has_reconciliation_flag: hasReconciliationFlag,
      reconciliation_delta_pct: round(divergence * 100),
    };

    categories.push(catTruth);

    if (hasReconciliationFlag) {
      generatedAlerts.push({
        id: `alert-recon-${project.id}-${cat.toLowerCase().replace(/\s+/g, '-')}`,
        project_id: project.id,
        project_name: project.name,
        type: 'RECONCILIATION_EXCEPTION',
        severity: divergence >= 0.25 ? 'CRITICAL' : 'HIGH',
        title: `Reconciliation Discrepancy: ${cat}`,
        description: `${cat} is ${Math.round(progressPct * 100)}% verified on site but ${Math.round(
          spendPct * 100
        )}% spent ($${s.actual_spend.toLocaleString()} spent vs $${b.current_budget.toLocaleString()} budget). Divergence: +${Math.round(
          divergence * 100
        )}%.`,
        category: cat,
        source_values: {
          budget: b.current_budget,
          spend: s.actual_spend,
          funded: f.funded_amount,
          progress_pct: round(progressPct * 100),
          spend_pct: round(spendPct * 100),
          variance_dollars: s.budget_variance,
        },
        is_resolved: false,
        created_at: new Date().toISOString(),
      });
    }

    if (s.is_over_budget) {
      generatedAlerts.push({
        id: `alert-overbudget-${project.id}-${cat.toLowerCase().replace(/\s+/g, '-')}`,
        project_id: project.id,
        project_name: project.name,
        type: 'OVER_BUDGET',
        severity: 'HIGH',
        title: `Over Budget Alert: ${cat}`,
        description: `Actual posted spend of $${s.actual_spend.toLocaleString()} exceeds approved budget of $${b.current_budget.toLocaleString()} by $${s.budget_variance.toLocaleString()}.`,
        category: cat,
        source_values: {
          budget: b.current_budget,
          spend: s.actual_spend,
          variance_dollars: s.budget_variance,
        },
        is_resolved: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  for (const draw of data.draws || []) {
    if (draw.status === 'approved_partial' || draw.status === 'rejected') {
      generatedAlerts.push({
        id: `alert-draw-${draw.id}`,
        project_id: project.id,
        project_name: project.name,
        type: 'DRAW_REJECTED',
        severity: 'CRITICAL',
        title: `Lender Partial/Rejected Draw #${draw.draw_number} (Rev ${draw.revision_number})`,
        description: `Lender rejected $${(draw.requested_total - draw.approved_total).toLocaleString()} of Draw #${
          draw.draw_number
        }. Developer Cash Exposure increased. Corrective docs required.`,
        source_values: {
          funded: draw.disbursed_total,
          variance_dollars: draw.requested_total - draw.approved_total,
        },
        is_resolved: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  return {
    project_id: project.id,
    project_name: project.name,
    total_original_budget: budgetResult.total_original_budget,
    total_approved_change_orders: budgetResult.total_approved_change_orders,
    total_current_budget: budgetResult.total_current_budget,
    total_actual_spend: spendResult.total_actual_spend,
    total_pending_spend: spendResult.total_pending_spend,
    total_budget_variance: spendResult.total_budget_variance,
    total_budget_variance_pct: spendResult.total_budget_variance_pct,
    total_requested_draws: fundingResult.total_requested_draws,
    total_approved_draws: fundingResult.total_approved_draws,
    total_amount_funded: fundingResult.total_amount_funded,
    developer_cash_exposure: fundingResult.developer_cash_exposure,
    overall_progress_pct: progressResult.overall_progress_pct,
    schedule_delay_days: progressResult.total_delay_days,
    loan_balance: progressResult.loan_balance,
    interest_rate: progressResult.interest_rate,
    daily_carrying_cost: progressResult.daily_carrying_cost,
    estimated_delay_cost: progressResult.total_estimated_delay_cost,
    categories,
    active_alerts: generatedAlerts,
    readiness,
  };
}

function round(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}
