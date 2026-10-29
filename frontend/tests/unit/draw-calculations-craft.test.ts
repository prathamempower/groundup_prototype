import { describe, it, expect } from "vitest";
import {
  DRAW_1_TASKS,
  DRAW_2_TASKS,
  DRAW_3_TASKS,
  DRAW_4_TASKS,
  getDrawTasksByNumber,
} from "@/lib/data/draw-request-form-items";
import { EXCEL_DRAW_TASKS } from "@/lib/data/excel-draw-schedule";

describe("Draw Schedule & SOV Mathematical Coherence", () => {
  it("verifies Draw 1 math matches $448,000.00 funded", () => {
    const lines = getDrawTasksByNumber(1);
    expect(lines).toEqual(DRAW_1_TASKS);
    expect(lines.length).toBe(4);

    const requestedSum = lines.reduce((acc, l) => acc + parseInt(l.requested_amount, 10), 0);
    const approvedSum = lines.reduce((acc, l) => acc + parseInt(l.approved_amount, 10), 0);
    const fundedSum = lines.reduce((acc, l) => acc + parseInt(l.funded_amount, 10), 0);
    const budgetSum = lines.reduce((acc, l) => acc + parseInt(l.budgeted_amount || "0", 10), 0);

    expect(requestedSum).toBe(44800000); // $448,000.00
    expect(approvedSum).toBe(44800000);
    expect(fundedSum).toBe(44800000);
    expect(budgetSum).toBe(44800000);
  });

  it("verifies Draw 2 math matches $320,000.00 funded", () => {
    const lines = getDrawTasksByNumber(2);
    expect(lines).toEqual(DRAW_2_TASKS);
    expect(lines.length).toBe(4);

    const requestedSum = lines.reduce((acc, l) => acc + parseInt(l.requested_amount, 10), 0);
    const approvedSum = lines.reduce((acc, l) => acc + parseInt(l.approved_amount, 10), 0);
    const fundedSum = lines.reduce((acc, l) => acc + parseInt(l.funded_amount, 10), 0);

    expect(requestedSum).toBe(32000000); // $320,000.00
    expect(approvedSum).toBe(32000000);
    expect(fundedSum).toBe(32000000);
  });

  it("verifies Draw 3 math reflects partial funding ($298,920.00 funded of $318,000.00 requested)", () => {
    const lines = getDrawTasksByNumber(3);
    expect(lines).toEqual(DRAW_3_TASKS);
    expect(lines.length).toBe(5);

    const requestedSum = lines.reduce((acc, l) => acc + parseInt(l.requested_amount, 10), 0);
    const approvedSum = lines.reduce((acc, l) => acc + parseInt(l.approved_amount, 10), 0);
    const fundedSum = lines.reduce((acc, l) => acc + parseInt(l.funded_amount, 10), 0);

    expect(requestedSum).toBe(31800000); // $318,000.00 requested
    expect(approvedSum).toBe(29892000);  // $298,920.00 approved (94.0%)
    expect(fundedSum).toBe(29892000);    // $298,920.00 funded
    const shortfall = requestedSum - approvedSum;
    expect(shortfall).toBe(1908000);     // Exactly $19,080.00 held back in Draw #3 Revision
  });

  it("verifies Draw 4 tasks sum exactly to $385,120.00 matching register and excel schedule", () => {
    const lines = getDrawTasksByNumber(4);
    expect(lines).toEqual(DRAW_4_TASKS);
    expect(lines.length).toBe(5);

    const requestedSum = lines.reduce((acc, l) => acc + parseInt(l.requested_amount, 10), 0);
    expect(requestedSum).toBe(38512000); // $385,120.00

    const prevSum = lines.reduce((acc, l) => acc + parseInt(l.previously_drawn || "0", 10), 0);
    const budgetSum = lines.reduce((acc, l) => acc + parseInt(l.budgeted_amount || "0", 10), 0);
    expect(prevSum).toBe(19988000); // $199,880.00
    expect(budgetSum).toBe(58500000); // $585,000.00
    expect(prevSum + requestedSum).toBe(budgetSum);

    // Compare with EXCEL_DRAW_TASKS for Draw 4
    const excelMatching = EXCEL_DRAW_TASKS.filter((t) => (t.draws[4] || 0) > 0);
    const excelSum = excelMatching.reduce((acc, t) => acc + (t.draws[4] || 0), 0);
    expect(excelSum).toBe(38512000);
    expect(excelSum).toBe(requestedSum);
  });

  it("verifies zero em dashes in lender notes and tasks", () => {
    const allDrawTasks = [
      ...DRAW_1_TASKS,
      ...DRAW_2_TASKS,
      ...DRAW_3_TASKS,
      ...DRAW_4_TASKS,
    ];

    allDrawTasks.forEach((line) => {
      expect(line.lender_notes || "").not.toContain("—");
      expect(line.budget_line_name).not.toContain("—");
    });
  });
});
