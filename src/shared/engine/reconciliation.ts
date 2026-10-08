// GroundUp AI — Four Truths Reconciliation Engine
// Rule 2: Multiple truths by domain. Nothing forces them into one number.
// Rule 3: AI proposes, deterministic code calculates.

import {
  AlertRisk,
  Project,
  ProjectFourTruthsSummary,
} from '../types';
import { calculateBudgetTruth } from './budgetTruth';
import { calculateSpendTruth } from './spendTruth';
import { calculateFundingTruth } from './fundingTruth';
import { calculateProgressTruth } from './progressTruth';
import { evaluateDataReadiness } from './dataReadiness';
import { generateDrawAlerts } from './reconciliation-alerts';
import { reconcileCategories } from './categoryReconciler';

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
  const budgetResult = calculateBudgetTruth(
    data.budgetVersions || [],
    data.budgetLines || [],
    data.changeOrders || []
  );

  const currentBudgetMap: Record<string, number> = {};
  for (const [cat, res] of Object.entries(budgetResult.categories)) {
    currentBudgetMap[cat] = res.current_budget;
  }

  const spendResult = calculateSpendTruth(data.expenses || [], currentBudgetMap);

  const fundingResult = calculateFundingTruth(
    data.draws || [],
    data.drawLines || [],
    spendResult.total_actual_spend
  );

  const progressResult = calculateProgressTruth(
    data.activities || [],
    data.inspections || [],
    data.loan
  );

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

  const { categories, generatedAlerts } = reconcileCategories(
    project,
    budgetResult,
    spendResult,
    fundingResult,
    categoryProgressMap,
    divergenceThreshold
  );

  generatedAlerts.push(...generateDrawAlerts(project, data.draws || []));

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
