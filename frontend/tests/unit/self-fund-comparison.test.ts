import { describe, it, expect } from "vitest";
import { getControlCenterAmountOrigin } from "@/lib/data/control-center-origins";

describe("Self Fund vs Additional Cost Comparison Entity", () => {
  it("provides an independent self_fund origin with comparison metadata", () => {
    const origin = getControlCenterAmountOrigin("self_fund");

    expect(origin).toBeDefined();
    expect(origin.id).toBe("self_fund");
    expect(origin.isSelfFundComparison).toBe(true);
    expect(origin.amountFormatted).toBe("$40,000.00");
    expect(origin.selfFundSummary).toBeDefined();
    expect(origin.selfFundSummary?.totalSelfFundFormatted).toBe("$50,000.00");
    expect(origin.selfFundSummary?.totalAdditionalCostFormatted).toBe("$10,000.00");
    expect(origin.selfFundSummary?.currentSelfFundLeftFormatted).toBe("$40,000.00");
  });

  it("contains initial self fund allocation and legal fees additional cost with correct amounts and difference", () => {
    const origin = getControlCenterAmountOrigin("self_fund");
    expect(origin.components).toHaveLength(2);

    const [selfFundItem, additionalCostItem] = origin.components;

    // Item 1: Initial Self Fund
    expect(selfFundItem.name).toContain("Self Fund Allocation");
    expect(selfFundItem.selfFundFormatted).toBe("$50,000.00");
    expect(selfFundItem.differenceFormatted).toBe("$50,000.00");
    expect(selfFundItem.isAdditionalCost).toBe(false);
    expect(selfFundItem.status).toBe("Allocated");

    // Item 2: Legal Fees Additional Cost
    expect(additionalCostItem.name).toContain("Legal Fees");
    expect(additionalCostItem.additionalCostFormatted).toBe("$10,000.00");
    expect(additionalCostItem.differenceFormatted).toBe("$40,000.00");
    expect(additionalCostItem.isAdditionalCost).toBe(true);
    expect(additionalCostItem.status).toBe("Incurred");
  });

  it("does not mutate or affect the loan approved budget table entity", () => {
    const approvedBudget = getControlCenterAmountOrigin("approved_budget");

    expect(approvedBudget).toBeDefined();
    expect(approvedBudget.id).toBe("approved_budget");
    expect(approvedBudget.amountFormatted).toBe("$1,471,120.00");
    expect(approvedBudget.isSelfFundComparison).toBeFalsy();
    expect(approvedBudget.components.length).toBeGreaterThan(5);
    expect(approvedBudget.components[0].name).toContain("Architect");
  });
});

