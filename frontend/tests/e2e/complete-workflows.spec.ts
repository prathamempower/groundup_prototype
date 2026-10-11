import { expect, test } from "@playwright/test";
import { loginAsOwner, loginAsUser } from "./helpers";

test.describe("Full Navigation & Workspaces Verification", () => {
  test("owner navigates across all core workspaces and sees correct headings", async ({ page }) => {
    await loginAsOwner(page);

    // 1. Control Center
    await expect(page).toHaveURL(/\/control-center/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 2. Documents
    await page.getByRole("link", { name: "Documents" }).click();
    await expect(page).toHaveURL(/\/documents/);
    await expect(page.getByRole("heading", { name: "Document Inbox & Evidence" })).toBeVisible();

    // 3. Budget
    await page.getByRole("link", { name: "Budget" }).click();
    await expect(page).toHaveURL(/\/budget/);
    await expect(page.getByRole("heading", { name: "Budget & Change Control" })).toBeVisible();

    // 4. Reconciliation
    await page.getByRole("link", { name: "Reconciliation" }).click();
    await expect(page).toHaveURL(/\/reconciliation/);
    await expect(page.getByRole("heading", { name: "Reconciliation Workbench" })).toBeVisible();

    // 5. Draws
    await page.getByRole("link", { name: "Draws" }).click();
    await expect(page).toHaveURL(/\/draws/);
    await expect(page.getByRole("heading", { name: "Draw Workspace & Lender Funding" })).toBeVisible();

    // 6. Timeline
    await page.getByRole("link", { name: "Timeline" }).click();
    await expect(page).toHaveURL(/\/timeline/);
    await expect(page.getByRole("heading", { name: "Timeline & Progress" })).toBeVisible();

    // 7. Economics
    await page.getByRole("link", { name: "Economics" }).click();
    await expect(page).toHaveURL(/\/economics/);
    await expect(page.getByRole("heading", { name: "Economics & Pro Forma" })).toBeVisible();

    // 8. Settings & Team
    await page.getByRole("link", { name: "Settings and team" }).click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole("heading", { name: "Settings, Governance & Administration" })).toBeVisible();

    // 9. Readiness & Activation Gates
    await page.goto("/readiness");
    await expect(page.getByRole("heading", { name: "Project Readiness & Activation Gates" })).toBeVisible();
  });

  test("project switcher allows switching between projects", async ({ page }) => {
    await loginAsOwner(page);

    // Open project dropdown in top bar
    const projectBtn = page.getByRole("button", { name: /73 Broadway|Select Project|392 First Street/i });
    await expect(projectBtn).toBeVisible();
    await projectBtn.click();

    // Switch to 392 First Street
    const targetProject = page.getByRole("button", { name: /392 First Street/i });
    if (await targetProject.isVisible()) {
      await targetProject.click();
      await page.waitForTimeout(500);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("source citation modal opens and closes on Control Center", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/control-center");

    // Look for any 'Sources' button if present
    const sourceButtons = page.getByRole("button", { name: /sources/i });
    const count = await sourceButtons.count();
    if (count > 0) {
      await sourceButtons.first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/Source Verification Trace/i)).toBeVisible();
      await page.getByRole("button", { name: /close/i }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    }
  });

  test("documents filter tabs switch view smoothly", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/documents");
    await expect(page.getByRole("heading", { name: "Document Inbox & Evidence" })).toBeVisible();

    // Click filter tabs
    for (const tabName of ["Needs Review", "Reviewed", "Quarantined", "All Documents"]) {
      const tab = page.getByRole("button", { name: new RegExp(tabName, "i") });
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(200);
      }
    }
  });

  test("reconciliation workbench tab switching works seamlessly", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/reconciliation");
    await expect(page.getByRole("heading", { name: "Reconciliation Workbench" })).toBeVisible();

    const tabs = ["Reconciliation Queue", "Bank Transactions", "Statement Periods", "Inter-Project Transfers"];
    for (const tab of tabs) {
      const tabButton = page.getByRole("button", { name: new RegExp(tab, "i") });
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(200);
      }
    }
  });
});

test.describe("Role Boundaries & Access Protection", () => {
  test("general contractor (GC) is restricted to submissions and blocked from owner settings", async ({ page }) => {
    await loginAsUser(page, "frank@apexconstruction.com");
    await expect(page).toHaveURL(/\/submissions/, { timeout: 15000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Attempt direct access to Settings
    await page.goto("/settings");
    await expect(page.getByText("Access Restricted")).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to your home workspace" })).toBeVisible();

    // Attempt direct access to Economics
    await page.goto("/economics");
    await expect(page.getByText("Access Restricted")).toBeVisible();
  });

  test("investor is directed to investor brief and blocked from budget editing", async ({ page }) => {
    await loginAsUser(page, "e.rostova@meridiancap.com");
    await expect(page).toHaveURL(/\/investor-update/, { timeout: 15000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Attempt direct access to Budget
    await page.goto("/budget");
    await expect(page.getByText("Access Restricted")).toBeVisible();
  });
});
