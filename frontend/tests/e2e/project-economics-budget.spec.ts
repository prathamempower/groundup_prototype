import { test, expect } from "@playwright/test";
import { loginAsOwner } from "./helpers";
import path from "path";

test.describe("Project Economics & Budget Page", () => {
  test("renders complete enterprise Project Economics page matching reference, with 3 tabs and verified data", async ({
    page,
  }) => {
    // 1. Login as Owner
    await loginAsOwner(page);

    // 2. Navigate to Project Economics & Budget page for 73 Broadway
    await page.goto("/projects/df16b577-3585-4fb0-a13a-ffadaca73e0f/budget");

    // Wait for the page title
    await expect(page.getByRole("heading", { name: "Project Economics & Budget" })).toBeVisible({
      timeout: 15000,
    });

    // Verify Breadcrumbs
    await expect(page.getByText("Projects", { exact: true })).toBeVisible();
    await expect(page.getByText("73 Broadway").first()).toBeVisible();

    // Verify exactly 3 tabs (Changes & Approvals is dedicated page)
    await expect(page.getByRole("button", { name: /Overview/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Budget Breakdown/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Forecast & Returns/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Changes & Approvals/i })).not.toBeVisible();

    // Verify 5 Top KPI Cards
    await expect(page.getByText("Construction Budget").first()).toBeVisible();
    await expect(page.getByText(/Total Incurred Costs|Total Project Costs/i).first()).toBeVisible();
    await expect(page.getByText(/Scope Variance|Difference/i).first()).toBeVisible();
    await expect(page.getByText(/Investor Equity|Investor Funding/i).first()).toBeVisible();
    await expect(page.getByText(/Total Capital Stack|Projected Profit/i).first()).toBeVisible();

    // Verify Tab 1: Original Plan vs Current Costs section
    await expect(page.getByRole("heading", { name: "Original Plan vs Current Costs" })).toBeVisible();
    await expect(page.getByText("Sitework", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Building", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Mechanical", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Interior", { exact: true }).first()).toBeVisible();

    // Verify Cost Breakdown donut chart card
    await expect(page.getByRole("heading", { name: /Project Cost Breakdown|Actual Project Costs/i })).toBeVisible();
    await expect(page.getByText("$1.31M").first()).toBeVisible();



    // Capture Desktop Overview Top
    const brainDir = "/home/pratham/.gemini/antigravity/brain/e39a1171-2630-4752-afe7-6e4894b81d36";
    await page.screenshot({ path: path.join(brainDir, "project_economics_desktop_top.png") });

    // 3. Test Drilldown Modal by clicking Sitework
    await page.getByText("Sitework").first().click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Sitework Variance Analysis")).toBeVisible();
    await page.screenshot({ path: path.join(brainDir, "project_economics_variance_modal.png") });
    await page.getByRole("button", { name: "Close" }).first().click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // 4. Test Tab Switching: Budget Breakdown
    const breakdownTabBtn = page.getByRole("button", { name: /Budget Breakdown/i });
    await breakdownTabBtn.click();
    await expect(breakdownTabBtn).toHaveClass(/border-blue-600/);
    await expect(page.getByRole("heading", { name: "Budget vs Actual by Category" })).toBeVisible();
    await expect(page.getByText(/Detailed Trade Line Items|Line Item Detail/i)).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(brainDir, "project_economics_tab_breakdown.png") });

    // 5. Test Tab Switching: Forecast & Returns
    const forecastTabBtn = page.getByRole("button", { name: /Forecast & Returns/i });
    await forecastTabBtn.click();
    await expect(forecastTabBtn).toHaveClass(/border-blue-600/);
    await expect(page.getByRole("heading", { name: "Project Return Summary" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Funding Impact on Returns" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Scenario Analysis" })).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(brainDir, "project_economics_tab_forecast.png") });

    // 6. Test Mobile Responsiveness
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole("button", { name: /Overview/i }).click();
    await expect(page.getByRole("heading", { name: "Project Economics & Budget" })).toBeVisible();
    await page.screenshot({ path: path.join(brainDir, "project_economics_mobile.png") });
  });
});
