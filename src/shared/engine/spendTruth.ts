// GroundUp AI — Spend Truth Calculation Engine
// Rule 3: AI proposes, deterministic code calculates.
// Formula: ActualSpend(category) = sum(PostedExpenses(category)) where expense.status = 'posted'
// BudgetVariance(category) = ActualSpend(category) - CurrentBudget(category)

import { Expense } from '../types';

export interface CategorySpendResult {
  category: string;
  actual_spend: number;
  pending_spend: number;
  posted_expense_count: number;
  pending_expense_count: number;
  total_spend_including_pending: number;
}

export interface SpendVarianceResult extends CategorySpendResult {
  current_budget: number;
  budget_variance: number;
  budget_variance_pct: number;
  is_over_budget: boolean;
  over_budget_amount: number;
}

export function calculateSpendTruth(
  expenses: Expense[],
  currentBudgetMap: Record<string, number> = {}
): {
  categories: Record<string, SpendVarianceResult>;
  total_actual_spend: number;
  total_pending_spend: number;
  total_budget_variance: number;
  total_budget_variance_pct: number;
  over_budget_categories: SpendVarianceResult[];
} {
  const categorySpend: Record<string, CategorySpendResult> = {};

  for (const cat of Object.keys(currentBudgetMap)) {
    categorySpend[cat] = {
      category: cat,
      actual_spend: 0,
      pending_spend: 0,
      posted_expense_count: 0,
      pending_expense_count: 0,
      total_spend_including_pending: 0,
    };
  }

  for (const exp of expenses) {
    if (!categorySpend[exp.category]) {
      categorySpend[exp.category] = {
        category: exp.category,
        actual_spend: 0,
        pending_spend: 0,
        posted_expense_count: 0,
        pending_expense_count: 0,
        total_spend_including_pending: 0,
      };
    }

    if (exp.status === 'posted') {
      categorySpend[exp.category].actual_spend = round(categorySpend[exp.category].actual_spend + exp.amount);
      categorySpend[exp.category].posted_expense_count += 1;
    } else if (exp.status === 'pending') {
      categorySpend[exp.category].pending_spend = round(categorySpend[exp.category].pending_spend + exp.amount);
      categorySpend[exp.category].pending_expense_count += 1;
    }

    categorySpend[exp.category].total_spend_including_pending = round(
      categorySpend[exp.category].actual_spend + categorySpend[exp.category].pending_spend
    );
  }

  const categories: Record<string, SpendVarianceResult> = {};
  const over_budget_categories: SpendVarianceResult[] = [];
  let total_actual_spend = 0;
  let total_pending_spend = 0;
  let total_budget = 0;

  for (const [catName, spend] of Object.entries(categorySpend)) {
    const budget = currentBudgetMap[catName] || 0;
    const variance = round(spend.actual_spend - budget);
    const variancePct = budget > 0 ? round((spend.actual_spend / budget) * 100) / 100 : spend.actual_spend > 0 ? 1 : 0;
    const isOverBudget = spend.actual_spend > budget && budget > 0;
    const overBudgetAmount = isOverBudget ? round(spend.actual_spend - budget) : 0;

    const result: SpendVarianceResult = {
      ...spend,
      current_budget: budget,
      budget_variance: variance,
      budget_variance_pct: variancePct,
      is_over_budget: isOverBudget,
      over_budget_amount: overBudgetAmount,
    };

    categories[catName] = result;
    if (isOverBudget) {
      over_budget_categories.push(result);
    }

    total_actual_spend = round(total_actual_spend + spend.actual_spend);
    total_pending_spend = round(total_pending_spend + spend.pending_spend);
    total_budget = round(total_budget + budget);
  }

  const total_budget_variance = round(total_actual_spend - total_budget);
  const total_budget_variance_pct = total_budget > 0 ? round((total_actual_spend / total_budget) * 100) / 100 : 0;

  return {
    categories,
    total_actual_spend,
    total_pending_spend,
    total_budget_variance,
    total_budget_variance_pct,
    over_budget_categories,
  };
}

function round(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}
