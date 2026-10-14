import { test, expect } from "@playwright/test";
import { loginAsOwner } from "./helpers";
import path from "path";

test.describe("Control Center Amount Source Origin Provenance", () => {
  const artifactDir = "/home/pratham/.gemini/antigravity/brain/e39a1171-2630-4752-afe7-6e4894b81d36";

  test("can click on amounts in Control Center to inspect exact source origins and document proof", async ({ page }) => {
    // 1. Login and go to control center
    await loginAsOwner(page);
    await page.goto("/control-center");
    await page.waitForLoadState("networkidle");

    // 2. Verify page loaded and main heading is present
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(artifactDir, "control_center_interactive_overview.png"), fullPage: false });

    // 3. Test Approved Budget amount click ($1,471,120)
    const approvedBudgetBtn = page.getByRole("button", { name: "$1,471,120" }).first();
    await expect(approvedBudgetBtn).toBeVisible();
    await approvedBudgetBtn.click();

    // 4. Verify AmountSourceModal opened
    const modalHeading = page.getByRole("heading", { name: /Approved (Project )?Budget/i });
    await expect(modalHeading).toBeVisible({ timeout: 5000 });
    const modal = page.locator("[role='dialog']");
    await expect(modal.getByText("Budget for 73 Broadway (1).pdf", { exact: true })).toBeVisible();
    await expect(modal.getByRole("cell", { name: "Direct Construction / Hard Costs" })).toBeVisible();
    // Verify Share column header does not exist
    await expect(modal.getByRole("columnheader", { name: "Share" })).not.toBeVisible();

    await page.screenshot({ path: path.join(artifactDir, "control_center_approved_budget_origin.png") });

    // 5. Close modal
    const closeBtn = page.getByRole("button", { name: "Close" }).last();
    await closeBtn.click();
    await expect(modalHeading).not.toBeVisible();

    // 6. Test Actual Spend amount click ($936,600)
    const actualSpendBtn = page.getByRole("button", { name: "$936,600" }).first();
    await expect(actualSpendBtn).toBeVisible();
    await actualSpendBtn.click();

    // Verify Actual Spend details
    await expect(page.getByRole("heading", { name: /Actual Spend/i })).toBeVisible();
    await expect(modal.getByText("73 Broadway.xlsx")).toBeVisible();
    await expect(modal.getByRole("cell", { name: "Direct Construction / Hard Costs" })).toBeVisible();

    await page.screenshot({ path: path.join(artifactDir, "control_center_actual_spend_origin.png") });

    // 7. Test "View Document" action from within origin modal
    const viewDocBtn = page.getByRole("button", { name: "View Document" });
    await expect(viewDocBtn).toBeVisible();
    await viewDocBtn.click();

    // Verify document preview modal opens
    await expect(page.getByText("SOURCE DOCUMENT PREVIEW")).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: path.join(artifactDir, "control_center_source_doc_preview.png") });

    // Close preview modal
    await page.getByRole("button", { name: "Close" }).last().click();
    await expect(page.getByText("SOURCE DOCUMENT PREVIEW")).not.toBeVisible({ timeout: 5000 });

    // 9. Test sub-amounts (Liquidity cushion)
    const cushionBtn = page.getByRole("button", { name: /liquidity cushion/i }).first();
    await expect(cushionBtn).toBeVisible();
    await cushionBtn.click();

    await expect(page.getByRole("heading", { name: "Project Liquidity Cushion" })).toBeVisible({ timeout: 5000 });
    await expect(modal.getByRole("cell", { name: "Operating Account Liquid Cash" })).toBeVisible();
    await page.screenshot({ path: path.join(artifactDir, "control_center_liquidity_cushion_origin.png") });

    await page.getByRole("button", { name: "Close" }).last().click();

    // 10. Test Draw status amount ($150,000.00)
    const drawReqBtn = page.getByRole("button", { name: "$150,000.00" }).first();
    await expect(drawReqBtn).toBeVisible();
    await drawReqBtn.click();

    await expect(page.getByRole("heading", { name: /Draw #1 Request/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("AIA Form (1).xlsx", { exact: true })).toBeVisible();
    await page.screenshot({ path: path.join(artifactDir, "control_center_draw_request_origin.png") });
  });
});
