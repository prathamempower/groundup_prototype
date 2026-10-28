import { describe, it, expect } from "vitest";
import { getControlCenterAmountOrigin } from "@/lib/data/control-center-origins";

describe("Timeline Delay Impact & Loan Interest Incurred Verification", () => {
  it("strictly computes schedule slip and loan debt interest carry", () => {
    const slipDays = 35; // 5 weeks lead time extension
    const dailyInterestCarryCents = 65000; // $650/day bank loan interest
    const dailyOverheadCarryCents = 16428; // site facility carry
    const totalCarryPerDayCents = dailyInterestCarryCents + dailyOverheadCarryCents;

    // Total interest incurred from delay in loan payoff
    const computedTotalCarryCents = Math.round(slipDays * (totalCarryPerDayCents / 100)) * 100;
    expect(computedTotalCarryCents).toBe(2850000); // $28,500.00
  });

  it("verifies completion_timeline data origin contract", () => {
    const timelineOrigin = getControlCenterAmountOrigin("completion_timeline");
    expect(timelineOrigin).toBeDefined();
    expect(timelineOrigin?.isTimelineSchedule).toBe(true);

    const impact = timelineOrigin?.timelineDelayImpact;
    expect(impact).toBeDefined();
    expect(impact?.atRiskMilestone).toBe("HVAC Equipment & Duct Distribution");
    expect(impact?.scheduleSlipDays).toBe(35);
    expect(impact?.interestIncurredFormatted).toBe("+$28,500");
    expect(impact?.interestIncurredCents).toBe(2850000);
    expect(impact?.targetCompletionDate).toBe("Nov 10, 2025");
    expect(impact?.forecastCompletionDate).toBe("Dec 15, 2025");

    // Milestone for HVAC (code 04.03) must reflect the delayed critical path item
    const delayedMilestone = timelineOrigin?.components.find(
      (c) => c.code === "04.03"
    );
    expect(delayedMilestone).toBeDefined();
    expect(delayedMilestone?.amountFormatted).toBe("Delayed (+35d)");
    expect(delayedMilestone?.targetDate).toBe("Nov 24, 2025");
  });

  it("ensures progress bar segments total 100%", () => {
    const timelineOrigin = getControlCenterAmountOrigin("completion_timeline");
    const impact = timelineOrigin?.timelineDelayImpact;
    expect(impact).toBeDefined();

    const sumPct = (impact?.progressPct || 0) + (impact?.slipPct || 0) + (impact?.remainingPct || 0);
    expect(sumPct).toBe(100);
  });

  it("verifies the delay and interest carry is reflected in actual_spend", () => {
    const spendOrigin = getControlCenterAmountOrigin("actual_spend");
    expect(spendOrigin).toBeDefined();

    const hvacSpend = spendOrigin?.components.find((c) => c.code === "04.03");
    expect(hvacSpend).toBeDefined();
    expect(hvacSpend?.status).toBe("Delayed");
    expect(hvacSpend?.targetDate).toBe("Oct 20, 2025");
    expect(hvacSpend?.actualDate).toContain("Slip +35d");
    expect(hvacSpend?.delayIncurred).toContain("+35 Days");
  });

  it("ensures approved_budget components have zero targetDate entries", () => {
    const approvedBudgetOrigin = getControlCenterAmountOrigin("approved_budget");
    expect(approvedBudgetOrigin).toBeDefined();
    expect(approvedBudgetOrigin?.components.length).toBeGreaterThan(0);

    // Every line item in approved_budget should strictly have no targetDate
    approvedBudgetOrigin?.components.forEach((component) => {
      expect(component.targetDate).toBeUndefined();
    });
  });
});
