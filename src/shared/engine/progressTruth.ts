// GroundUp AI — Progress Truth & Carrying Cost Calculation Engine
// Formula: ScheduleDelayDays(milestone) = ActualDate - PlannedDate
// DailyCarryingCost = LoanBalance * (AnnualInterestRate / 365)
// EstimatedDelayCost = ScheduleDelayDays * DailyCarryingCost

import { Inspection, Loan, ScheduleActivity } from '../types';

export interface MilestoneProgressResult {
  milestone: string;
  trade: string;
  planned_start: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  verified_progress_pct: number;
  last_verified_source: string;
  last_verified_date: string;
  delay_days: number;
  is_delayed: boolean;
  estimated_delay_cost: number;
  latest_inspection?: Inspection;
}

export function calculateProgressTruth(
  activities: ScheduleActivity[],
  inspections: Inspection[],
  loan?: Loan,
  currentDateStr: string = new Date().toISOString().split('T')[0]
): {
  milestones: MilestoneProgressResult[];
  overall_progress_pct: number;
  total_delay_days: number;
  daily_carrying_cost: number;
  total_estimated_delay_cost: number;
  loan_balance: number;
  interest_rate: number;
} {
  const loanBalance = loan?.current_balance || loan?.loan_amount || 0;
  const interestRate = loan?.interest_rate || 0;

  const daily_carrying_cost = round(loanBalance * (interestRate / 365));

  let total_delay_days = 0;
  let total_estimated_delay_cost = 0;
  let progress_sum = 0;

  const milestones: MilestoneProgressResult[] = [];

  for (const act of activities) {
    const matchingInspections = inspections
      .filter((i) => i.milestone.toLowerCase() === act.milestone.toLowerCase())
      .sort((a, b) => new Date(b.requested_date).getTime() - new Date(a.requested_date).getTime());

    const latestInsp = matchingInspections[0];

    let delayDays = 0;
    const plannedEndMs = new Date(act.planned_end).getTime();

    if (act.actual_end) {
      const actualEndMs = new Date(act.actual_end).getTime();
      const diffTime = actualEndMs - plannedEndMs;
      delayDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } else if (act.verified_progress_pct < 1.0) {
      const nowMs = new Date(currentDateStr).getTime();
      if (nowMs > plannedEndMs) {
        const diffTime = nowMs - plannedEndMs;
        delayDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
    }

    const isDelayed = delayDays > 0;
    const milestoneDelayCost = round(delayDays * daily_carrying_cost);

    milestones.push({
      milestone: act.milestone,
      trade: act.trade,
      planned_start: act.planned_start,
      planned_end: act.planned_end,
      actual_start: act.actual_start,
      actual_end: act.actual_end,
      verified_progress_pct: act.verified_progress_pct,
      last_verified_source: act.last_verified_source,
      last_verified_date: act.last_verified_date,
      delay_days: delayDays,
      is_delayed: isDelayed,
      estimated_delay_cost: milestoneDelayCost,
      latest_inspection: latestInsp,
    });

    total_delay_days = Math.max(total_delay_days, delayDays);
    total_estimated_delay_cost = round(total_estimated_delay_cost + milestoneDelayCost);
    progress_sum += act.verified_progress_pct;
  }

  const overall_progress_pct =
    activities.length > 0 ? round((progress_sum / activities.length) * 100) / 100 : 0;

  return {
    milestones,
    overall_progress_pct,
    total_delay_days,
    daily_carrying_cost,
    total_estimated_delay_cost,
    loan_balance: loanBalance,
    interest_rate: interestRate,
  };
}

function round(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}
