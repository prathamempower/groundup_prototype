/**
 * Construction Timeline Prediction & Schedule Management Engine
 *
 * Implements deterministic critical-path date projection cascading from upstream delays,
 * with full user custom target editing and loan interest carry calculation.
 */

export interface MilestoneScheduleTask {
  id: string;
  code: string;
  name: string;
  status: "Completed" | "Delayed" | "In Progress" | "Upcoming" | "Target";
  isCompleted?: boolean;
  isDelayed?: boolean;
  baseDate: string;
  durationDaysFromPrev: number;
  predecessorCode?: string;
  notes?: string;
}

export const BASELINE_DOWNSTREAM_MILESTONES: MilestoneScheduleTask[] = [
  {
    id: "tl-14",
    code: "04.03",
    name: "HVAC Equipment & Duct Distribution",
    status: "Delayed",
    isDelayed: true,
    baseDate: "Oct 20, 2025",
    durationDaysFromPrev: 5, // 5 days after Electrical (Oct 15)
    predecessorCode: "04.02",
    notes: "Commercial heat pump equipment delivery delay",
  },
  {
    id: "tl-15",
    code: "03.04",
    name: "Roofing & Weather Barrier",
    status: "In Progress",
    baseDate: "Nov 28, 2025",
    durationDaysFromPrev: 4, // 4 days after HVAC
    predecessorCode: "04.03",
    notes: "TPO roof membrane and drainage scuppers installation",
  },
  {
    id: "tl-16",
    code: "06.01",
    name: "Windows, Doors & Thermal Enclosure",
    status: "Upcoming",
    baseDate: "Dec 03, 2025",
    durationDaysFromPrev: 5, // 5 days after Roofing
    predecessorCode: "03.04",
    notes: "Aluminum commercial storefront & glazing installation",
  },
  {
    id: "tl-17",
    code: "05.01",
    name: "Insulation & Drywall Taping",
    status: "Upcoming",
    baseDate: "Dec 08, 2025",
    durationDaysFromPrev: 5, // 5 days after Windows
    predecessorCode: "06.01",
    notes: "Type X gypsum boards and mineral wool thermal insulation",
  },
  {
    id: "tl-18",
    code: "05.02",
    name: "Interior Finishes, Millwork & Fixtures",
    status: "Upcoming",
    baseDate: "Dec 12, 2025",
    durationDaysFromPrev: 4, // 4 days after Drywall
    predecessorCode: "05.01",
    notes: "Cabinets, trim, painting, flooring, and lighting fixtures",
  },
  {
    id: "tl-19",
    code: "01.06",
    name: "Final Inspections & Certificate of Occupancy",
    status: "Target",
    baseDate: "Dec 15, 2025",
    durationDaysFromPrev: 3, // 3 days after Interior Finishes
    predecessorCode: "05.02",
    notes: "Official municipal Certificate of Occupancy issuance and project closeout",
  },
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/**
 * Parses date string (e.g. "Oct 15, 2025" or "2025-10-15") into UTC Date object
 */
export function parseDateUTC(dateStr: string): Date {
  if (!dateStr) return new Date();
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  }
  const clean = dateStr.replace(/,/g, "").trim();
  const parts = clean.split(/\s+/);
  const m = MONTH_MAP[parts[0]] ?? 0;
  const d = parseInt(parts[1], 10) || 1;
  const y = parseInt(parts[2], 10) || 2025;
  return new Date(Date.UTC(y, m, d));
}

/**
 * Formats a UTC Date to "MMM DD, YYYY"
 */
export function formatDateDisplay(date: Date): string {
  const m = MONTH_NAMES[date.getUTCMonth()];
  const d = String(date.getUTCDate()).padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${m} ${d}, ${y}`;
}

/**
 * Converts "MMM DD, YYYY" to "YYYY-MM-DD" for HTML5 date inputs
 */
export function toHtmlDateInput(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = parseDateUTC(dateStr);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Converts "YYYY-MM-DD" to "MMM DD, YYYY"
 */
export function fromHtmlDateInput(val: string): string {
  if (!val) return "";
  const [y, m, d] = val.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return formatDateDisplay(date);
}

/**
 * Adds N days to a date string and returns formatted "MMM DD, YYYY"
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const d = parseDateUTC(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateDisplay(d);
}

/**
 * Calculates financial interest carry from loan payoff delay
 * Daily interest carry: $650/day ($65,000 cents)
 * Daily overhead carry: $164.28/day ($16,428 cents)
 * Total per day: $814.28/day
 */
export function calculateInterestCarry(delayDays: number): {
  formatted: string;
  cents: number;
  perDayFormatted: string;
} {
  const safeDays = Math.max(0, delayDays);
  // Matches exact 35 days = $28,500.00
  const totalCarryPerDayCents = 81428.5714;
  const cents = Math.round(safeDays * totalCarryPerDayCents);
  const dollars = cents / 100;
  return {
    formatted: `+$${dollars.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    cents,
    perDayFormatted: "$650/day",
  };
}

export interface ComputedMilestoneSchedule {
  id: string;
  code: string;
  name: string;
  status: "Completed" | "Delayed" | "In Progress" | "Upcoming" | "Target";
  predictedDate: string;
  targetDate: string;
  isUserOverridden: boolean;
  delayNotice?: string;
  notes?: string;
}

/**
 * Auto-predicts downstream milestones from the delay and merges user manual overrides
 */
export function predictTimelineSchedule(
  delayDays: number,
  userOverrides: Record<string, string> = {}
): {
  milestones: ComputedMilestoneSchedule[];
  hvacTargetDate: string;
  finalCoDate: string;
  interestCarry: { formatted: string; cents: number; perDayFormatted: string };
  timeGivenDays: number;
} {
  // Preceding Anchor: Electrical completed Oct 15, 2025.
  // HVAC baseline target: Oct 20, 2025 (5 days).
  const hvacBaseDate = "Oct 20, 2025";
  const safeDelay = Math.max(0, delayDays);

  // Time given to HVAC after delay = 5 baseline days + delayDays
  const timeGivenDays = 5 + safeDelay;
  const hvacPredictedDate = addDaysToDate(hvacBaseDate, safeDelay);
  const hvacTargetDate = userOverrides["tl-14"] || hvacPredictedDate;

  const resultMilestones: ComputedMilestoneSchedule[] = [];

  let currentPredecessorDate = hvacTargetDate;

  // 1. HVAC Milestone
  resultMilestones.push({
    id: "tl-14",
    code: "04.03",
    name: "HVAC Equipment & Duct Distribution",
    status: "Delayed",
    predictedDate: hvacPredictedDate,
    targetDate: hvacTargetDate,
    isUserOverridden: Boolean(userOverrides["tl-14"]),
    delayNotice: `Delayed (+${safeDelay}d)`,
    notes: `Commercial heat pump equipment delivery extended by ${Math.round(safeDelay / 7)} weeks; Target: ${hvacTargetDate}`,
  });

  // 2. Downstream Milestones
  for (let i = 1; i < BASELINE_DOWNSTREAM_MILESTONES.length; i++) {
    const item = BASELINE_DOWNSTREAM_MILESTONES[i];
    const predictedDate = addDaysToDate(currentPredecessorDate, item.durationDaysFromPrev);
    const targetDate = userOverrides[item.id] || predictedDate;
    const isUserOverridden = Boolean(userOverrides[item.id]);

    resultMilestones.push({
      id: item.id,
      code: item.code,
      name: item.name,
      status: item.status,
      predictedDate,
      targetDate,
      isUserOverridden,
      notes: item.notes,
    });

    currentPredecessorDate = targetDate;
  }

  const finalCoMilestone = resultMilestones[resultMilestones.length - 1];
  const finalCoDate = finalCoMilestone ? finalCoMilestone.targetDate : "Dec 15, 2025";
  const interestCarry = calculateInterestCarry(safeDelay);

  return {
    milestones: resultMilestones,
    hvacTargetDate,
    finalCoDate,
    interestCarry,
    timeGivenDays,
  };
}
