import { test, expect } from "@playwright/test";
import { loginAsOwner } from "./helpers";
import path from "path";

test.describe("Project Economics & Budget Page", () => {
  test("renders complete enterprise Project Economics page, handles tabs, drilldowns and responsive viewports", async ({
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

    // Verify 4 tabs
    await expect(page.getByRole("button", { name: /Overview/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Budget Breakdown/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Forecast & Returns/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Changes & Approvals/i })).toBeVisible();

    // Verify 4 Top KPI Cards
    await expect(page.getByText("Approved Budget", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Forecast Total Cost", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Projected Profit", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Projected ROI", { exact: true }).first()).toBeVisible();

    // Verify Original Plan vs Current Forecast section & table
    await expect(page.getByRole("heading", { name: "Original Plan vs Current Forecast" })).toBeVisible();
    await expect(page.getByText("Cost Category")).toBeVisible();
    await expect(page.getByText("Acquisition", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Construction (Hard Costs)", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Soft Costs", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Financing & Interest", { exact: true }).first()).toBeVisible();

    // Verify Cost Breakdown donut chart card
    await expect(page.getByRole("heading", { name: /Cost Breakdown \(Current Forecast\)/i })).toBeVisible();
    await expect(page.getByText("Total Cost").first()).toBeVisible();

    // Verify Budget vs Actual Spend card
    await expect(page.getByRole("heading", { name: "Budget vs Actual Spend" })).toBeVisible();
    await expect(page.getByText("Remaining Budget").first()).toBeVisible();

    // Verify Funding and Cash Exposure card
    await expect(page.getByRole("heading", { name: "Funding and Cash Exposure" })).toBeVisible();
    await expect(page.getByText("Remaining Need").first()).toBeVisible();

    // Verify Projected Returns card
    await expect(page.getByRole("heading", { name: "Projected Returns" })).toBeVisible();
    await expect(page.getByText("Expected Sale Revenue").first()).toBeVisible();
    await expect(page.getByText("Projected IRR").first()).toBeVisible();

    // Verify Contingency card
    await expect(page.getByRole("heading", { name: "Contingency" })).toBeVisible();
    await expect(page.getByText("Pending Change Orders").first()).toBeVisible();

    // Verify Key Changes & Approvals card
    await expect(page.getByRole("heading", { name: "Key Changes & Approvals" })).toBeVisible();

    // Capture Desktop Overview Top
    const brainDir = "/home/pratham/.gemini/antigravity/brain/e39a1171-2630-4752-afe7-6e4894b81d36";
    await page.screenshot({ path: path.join(brainDir, "project_economics_desktop_top.png") });

    // Scroll to bottom of main container and capture rows 3 & 4
    await page.locator("main").evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(brainDir, "project_economics_desktop_bottom.png") });

    // Scroll main back up
    await page.locator("main").evaluate((el) => el.scrollTo(0, 0));
    await page.waitForTimeout(200);

    // 3. Test Drilldown Modal by clicking Construction (Hard Costs)
    await page.getByText("Construction (Hard Costs)").first().click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Construction (Hard Costs) Variance Analysis")).toBeVisible();
    await expect(page.getByText("Cost Drivers & Line Adjustments")).toBeVisible();
    await page.screenshot({ path: path.join(brainDir, "project_economics_variance_modal.png") });
    await page.getByRole("button", { name: "Close" }).first().click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // 4. Test Tab Switching: Budget Breakdown
    const breakdownTabBtn = page.getByRole("button", { name: /Budget Breakdown/i });
    await breakdownTabBtn.click();
    await expect(breakdownTabBtn).toHaveClass(/border-blue-600/);
    await expect(page.getByRole("heading", { name: "Master Schedule of Values (SOV)" })).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(brainDir, "project_economics_tab_breakdown.png") });

    // 5. Test Tab Switching: Forecast & Returns
    const forecastTabBtn = page.getByRole("button", { name: /Forecast & Returns/i });
    await forecastTabBtn.click();
    await expect(forecastTabBtn).toHaveClass(/border-blue-600/);
    await expect(page.getByRole("heading", { name: /Underwriting Pro-Forma/i })).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(brainDir, "project_economics_tab_forecast.png") });

    // 6. Test Tab Switching: Changes & Approvals
    const changesTabBtn = page.getByRole("button", { name: /Changes & Approvals/i });
    await changesTabBtn.click();
    await expect(changesTabBtn).toHaveClass(/border-blue-600/);
    await expect(page.getByRole("heading", { name: /Change Orders, Approvals/i })).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(brainDir, "project_economics_tab_changes.png") });

    // 7. Test Mobile Responsiveness
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole("button", { name: /Overview/i }).click();
    await expect(page.getByRole("heading", { name: "Project Economics & Budget" })).toBeVisible();
    await page.screenshot({ path: path.join(brainDir, "project_economics_mobile.png") });
  });
});
