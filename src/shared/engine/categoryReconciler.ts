import { AlertRisk, CategoryTruth, Project } from '../types';
import {
  generateReconciliationAlert,
  generateOverBudgetAlert,
} from './reconciliation-alerts';

function round(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function reconcileCategories(
  project: Project,
  budgetResult: any,
  spendResult: any,
  fundingResult: any,
  categoryProgressMap: Record<string, { pct: number; source: string }>,
  divergenceThreshold: number
): { categories: CategoryTruth[]; generatedAlerts: AlertRisk[] } {
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
      generatedAlerts.push(
        generateReconciliationAlert(
          project,
          cat,
          divergence,
          progressPct,
          spendPct,
          s.actual_spend,
          b.current_budget,
          f.funded_amount,
          s.budget_variance
        )
      );
    }

    if (s.is_over_budget) {
      generatedAlerts.push(
        generateOverBudgetAlert(project, cat, s.actual_spend, b.current_budget, s.budget_variance)
      );
    }
  }

  return { categories, generatedAlerts };
}
