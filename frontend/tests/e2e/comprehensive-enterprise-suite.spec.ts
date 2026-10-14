import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { loginAsOwner } from "./helpers";

test.describe("Enterprise UI/UX Audit and Screenshot Verification", () => {
  const screenshotsDir = path.join(process.cwd(), "test-results", "enterprise-audit");

  test.beforeEach(({}, testInfo) => {
    testInfo.setTimeout(120000);
  });

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  const viewports = [
    { name: "desktop-1440", width: 1440, height: 900 },
    { name: "tablet-820", width: 820, height: 1024 },
    { name: "mobile-390", width: 390, height: 844 },
  ];

  test("1. Portfolio & Workspace Navigation across viewports", async ({ page }) => {
    await loginAsOwner(page);

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/control-center");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `02-control-center-${vp.name}.png`), fullPage: false });

      // Check projects portfolio
      await page.goto("/projects");
      await page.waitForLoadState("networkidle");
      // Wait until session verification loader disappears if present
      await expect(page.getByLabel("Verifying your session")).toBeHidden({ timeout: 20000 });
      // Allow for either workspace overview or portfolio
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible({ timeout: 20000 });
      await page.screenshot({ path: path.join(screenshotsDir, `01-projects-${vp.name}.png`), fullPage: false });
    }
  });

  test("2. Financial Core Pages: Budget, Draws, Reconciliation across viewports", async ({ page }) => {
    await loginAsOwner(page);

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Budget
      await page.goto("/budget");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `03-budget-${vp.name}.png`), fullPage: false });

      // Draws
      await page.goto("/draws");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `04-draws-${vp.name}.png`), fullPage: false });

      // Builds packet dedicated page
      const currentUrl = page.url();
      const projMatch = currentUrl.match(/\/projects\/([^\/]+)/);
      const testProjId = projMatch ? projMatch[1] : "7a2ae0d8-92ee-4992-8148-8c7107654c7b";
      await page.goto(`/projects/${testProjId}/draws/build-packet?draw=4`);
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `04b-build-packet-${vp.name}.png`), fullPage: false });

      // Draw Application Detail dedicated page (replacing drawer/modal)
      await page.goto(`/projects/${testProjId}/draws/4`);
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `04c-draw-detail-${vp.name}.png`), fullPage: false });

      // Reconciliation
      await page.goto("/reconciliation");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `05-reconciliation-${vp.name}.png`), fullPage: false });
    }
  });

  test("3. Documents Vault, Submissions, Alerts, and Timeline across viewports", async ({ page }) => {
    await loginAsOwner(page);

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Documents Vault
      await page.goto("/documents");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `06-documents-${vp.name}.png`), fullPage: false });

      // Alerts
      await page.goto("/alerts");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `08-alerts-${vp.name}.png`), fullPage: false });

      // Timeline / Schedule
      await page.goto("/timeline");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `09-timeline-${vp.name}.png`), fullPage: false });
    }
  });

  test("4. Governance & Executive Update: Partners, Investor Update, Settings", async ({ page }) => {
    await loginAsOwner(page);

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Partners
      await page.goto("/partners");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `10-partners-${vp.name}.png`), fullPage: false });

      // Investor Update
      await page.goto("/investor-update");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `11-investor-update-${vp.name}.png`), fullPage: false });

      // Settings
      await page.goto("/settings");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(screenshotsDir, `12-settings-${vp.name}.png`), fullPage: false });
    }
  });
});
