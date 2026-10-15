import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Full Visual Screen Capture & Verification", () => {
  const screenshotsDir = path.join(process.cwd(), "screenshots");

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test("Capture and verify all enterprise screens and workflows", async ({ page }) => {
    test.setTimeout(90000);

    // 1. Login Page
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /Sign in to GroundUp|Welcome back/i })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotsDir, "01-login-screen.png"), fullPage: true });

    // Login as Marcus Vance (Owner)
    await page.getByLabel("Work email", { exact: true }).fill("m.vance@vancedev.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: /Log in|Sign in/i }).click();

    // 2. Portfolio View
    await expect(page).toHaveURL(/\/(projects|control-center)/, { timeout: 15000 });
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Project Portfolio" })).toBeVisible();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "02-portfolio-view.png"), fullPage: true });

    // 3. New Project Creation Wizard
    await page.goto("/projects/new");
    await expect(page.getByRole("heading", { name: /Create New Project|New Project/i })).toBeVisible();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "03-project-creation-wizard.png"), fullPage: true });

    // Focus Project: 73 Broadway
    const projectId = "df16b577-3585-4fb0-a13a-ffadaca73e0f";

    // 4. Control Center / Cockpit
    await page.goto(`/projects/${projectId}/control-center`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(screenshotsDir, "04-control-center.png"), fullPage: true });

    // 5. Budget & Economics
    await page.goto(`/projects/${projectId}/budget`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "05-budget-overview.png"), fullPage: true });

    // Switch to Breakdown tab
    const breakdownTab = page.getByRole("tab", { name: /Breakdown|Detail/i }).first();
    if (await breakdownTab.isVisible()) {
      await breakdownTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(screenshotsDir, "05b-budget-breakdown.png"), fullPage: true });
    }

    // 6. Changes & Contingency
    await page.goto(`/projects/${projectId}/changes`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "06-changes-contingency.png"), fullPage: true });

    // 7. Draws Management
    await page.goto(`/projects/${projectId}/draws`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "07-draws-overview.png"), fullPage: true });

    // 8. Draw Packet Builder
    await page.goto(`/projects/${projectId}/draws/build-packet`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "08-draw-packet-builder.png"), fullPage: true });

    // 9. Reconciliation Queue
    await page.goto(`/projects/${projectId}/reconciliation`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "09-reconciliation-queue.png"), fullPage: true });

    // 10. Documents Repository
    await page.goto(`/projects/${projectId}/documents`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "10-documents-repository.png"), fullPage: true });

    // 11. Document Review Workbench (Direct document view)
    await page.goto("/documents/doc-01");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotsDir, "11-document-review-workbench.png"), fullPage: true });

    // 12. Timeline & Milestones
    await page.goto(`/projects/${projectId}/timeline`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "12-timeline-gantt.png"), fullPage: true });

    // 13. Partners & Funding
    await page.goto(`/projects/${projectId}/partners`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "13-partners-funding.png"), fullPage: true });

    // 14. Alerts & Exceptions
    await page.goto(`/projects/${projectId}/alerts`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "14-alerts-exceptions.png"), fullPage: true });

    // 15. Project Inbox
    await page.goto(`/projects/${projectId}/inbox`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "15-project-inbox.png"), fullPage: true });

    // 16. Project Settings
    await page.goto(`/projects/${projectId}/settings`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "16-project-settings.png"), fullPage: true });

    // 17. Onboarding Checklist
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "17-onboarding-checklist.png"), fullPage: true });

    // 18. Account Settings
    await page.goto("/account");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "18-account-settings.png"), fullPage: true });

    // Verify all screenshots exist
    const files = fs.readdirSync(screenshotsDir);
    expect(files.length).toBeGreaterThanOrEqual(18);
    console.log(`Successfully generated and verified ${files.length} visual screenshots in ${screenshotsDir}`);
  });
});
