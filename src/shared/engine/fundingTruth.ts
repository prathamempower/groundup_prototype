// GroundUp AI — Funding Truth & Developer Cash Exposure Engine
// Formula: AmountFunded(project) = sum(DrawLine.funded_amount) where draw_line.status = 'disbursed'
// DeveloperCashExposure(project) = TotalActualSpend(project) - AmountFunded(project)

import { Draw, DrawLine } from '../types';

export interface CategoryFundingResult {
  category: string;
  requested_amount: number;
  approved_amount: number;
  funded_amount: number;
  rejected_amount: number;
  draw_line_count: number;
}

export interface ProjectFundingSummary {
  categories: Record<string, CategoryFundingResult>;
  total_requested_draws: number;
  total_approved_draws: number;
  total_amount_funded: number;
  total_rejected_draws: number;
  developer_cash_exposure: number;
  active_draws_count: number;
  disbursed_draws_count: number;
}

export function calculateFundingTruth(
  draws: Draw[],
  drawLines: DrawLine[],
  totalActualSpend: number
): ProjectFundingSummary {
  const categoryFunding: Record<string, CategoryFundingResult> = {};

  let total_requested_draws = 0;
  let total_approved_draws = 0;
  let total_amount_funded = 0;
  let total_rejected_draws = 0;

  for (const line of drawLines) {
    if (!categoryFunding[line.category]) {
      categoryFunding[line.category] = {
        category: line.category,
        requested_amount: 0,
        approved_amount: 0,
        funded_amount: 0,
        rejected_amount: 0,
        draw_line_count: 0,
      };
    }

    const cat = categoryFunding[line.category];
    cat.requested_amount = round(cat.requested_amount + (line.requested_amount || 0));
    cat.approved_amount = round(cat.approved_amount + (line.approved_amount || 0));
    cat.draw_line_count += 1;

    if (line.status === 'disbursed') {
      cat.funded_amount = round(cat.funded_amount + (line.funded_amount || 0));
      total_amount_funded = round(total_amount_funded + (line.funded_amount || 0));
    }

    if (line.status === 'rejected') {
      const rejectedVal = (line.requested_amount || 0) - (line.approved_amount || 0);
      cat.rejected_amount = round(cat.rejected_amount + (rejectedVal > 0 ? rejectedVal : line.requested_amount));
      total_rejected_draws = round(total_rejected_draws + cat.rejected_amount);
    }

    total_requested_draws = round(total_requested_draws + (line.requested_amount || 0));
    total_approved_draws = round(total_approved_draws + (line.approved_amount || 0));
  }

  const developer_cash_exposure = round(totalActualSpend - total_amount_funded);
  const active_draws_count = draws.filter((d) => d.status !== 'approved_full' && d.status !== 'rejected').length;
  const disbursed_draws_count = draws.filter((d) => (d.disbursed_total || 0) > 0).length;

  return {
    categories: categoryFunding,
    total_requested_draws,
    total_approved_draws,
    total_amount_funded,
    total_rejected_draws,
    developer_cash_exposure,
    active_draws_count,
    disbursed_draws_count,
  };
}

function round(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}
