// GroundUp AI — Budget Truth Calculation Engine
// Rule 3: AI proposes, deterministic code calculates.
// Formula: CurrentBudget(category) = LatestApprovedBudgetVersion(category) + sum(ApprovedChangeOrders(category))

import { BudgetLine, BudgetVersion, ChangeOrder } from '../types';

export interface CategoryBudgetResult {
  category: string;
  original_amount: number;
  approved_change_orders: number;
  current_budget: number;
  budget_version_id: string;
  version_number: number;
  approved_change_order_count: number;
}

export function calculateBudgetTruth(
  budgetVersions: BudgetVersion[],
  budgetLines: BudgetLine[],
  changeOrders: ChangeOrder[],
  targetCategory?: string
): {
  categories: Record<string, CategoryBudgetResult>;
  total_original_budget: number;
  total_approved_change_orders: number;
  total_current_budget: number;
  active_version?: BudgetVersion;
} {
  const approvedVersions = budgetVersions
    .filter((v) => v.status === 'APPROVED')
    .sort((a, b) => b.version_number - a.version_number);

  const activeVersion = approvedVersions[0];

  if (!activeVersion) {
    return {
      categories: {},
      total_original_budget: 0,
      total_approved_change_orders: 0,
      total_current_budget: 0,
    };
  }

  const activeLines = budgetLines.filter(
    (line) => line.version_id === activeVersion.id && (!targetCategory || line.category === targetCategory)
  );

  const approvedCOs = changeOrders.filter(
    (co) => co.approval_status === 'APPROVED' && co.budget_impact && (!targetCategory || co.category === targetCategory)
  );

  const categoryMap: Record<string, CategoryBudgetResult> = {};

  for (const line of activeLines) {
    categoryMap[line.category] = {
      category: line.category,
      original_amount: line.original_amount,
      approved_change_orders: 0,
      current_budget: line.original_amount,
      budget_version_id: activeVersion.id,
      version_number: activeVersion.version_number,
      approved_change_order_count: 0,
    };
  }

  for (const co of approvedCOs) {
    if (!categoryMap[co.category]) {
      categoryMap[co.category] = {
        category: co.category,
        original_amount: 0,
        approved_change_orders: 0,
        current_budget: 0,
        budget_version_id: activeVersion.id,
        version_number: activeVersion.version_number,
        approved_change_order_count: 0,
      };
    }
    categoryMap[co.category].approved_change_orders = round(
      categoryMap[co.category].approved_change_orders + co.amount
    );
    categoryMap[co.category].approved_change_order_count += 1;
    categoryMap[co.category].current_budget = round(
      categoryMap[co.category].original_amount + categoryMap[co.category].approved_change_orders
    );
  }

  let total_original_budget = 0;
  let total_approved_change_orders = 0;
  let total_current_budget = 0;

  for (const cat of Object.values(categoryMap)) {
    total_original_budget = round(total_original_budget + cat.original_amount);
    total_approved_change_orders = round(total_approved_change_orders + cat.approved_change_orders);
    total_current_budget = round(total_current_budget + cat.current_budget);
  }

  return {
    categories: categoryMap,
    total_original_budget,
    total_approved_change_orders,
    total_current_budget,
    active_version: activeVersion,
  };
}

function round(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}
