import { test, expect } from "@playwright/test";

test.describe("Full Navigation & Workspace Page Audit", () => {
  test.setTimeout(90000);

  test("audit pages, sidebar visibility, and links", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    // 1. Sign in as Owner
    await page.goto("/auth/login");
    await page.getByLabel("Work email").fill("m.vance@vancedev.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    // 2. Expect to land on /projects or workspace
    await expect(page).toHaveURL(/\/(projects|control-center)/, { timeout: 15000 });
    console.log("Logged in successfully, current URL:", page.url());

    // 3. Go to /projects
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Project Portfolio" })).toBeVisible();

    // Verify projects page has no sidebar
    const sidebarOnPortfolio = page.locator("aside");
    await expect(sidebarOnPortfolio).toHaveCount(0);

    // 4. Click into the first project card
    const firstProjectHeading = page.locator("h3").first();
    const projectName = await firstProjectHeading.textContent();
    console.log("Opening project workspace:", projectName);
    await firstProjectHeading.click();

    // Should navigate to /projects/[projectId]/...
    await expect(page).toHaveURL(/\/projects\/[^\/]+/, { timeout: 10000 });
    const workspaceUrl = page.url();
    console.log("Workspace URL:", workspaceUrl);

    // Extract projectId from URL
    const match = workspaceUrl.match(/\/projects\/([^\/]+)/);
    expect(match).toBeTruthy();
    const projectId = match![1];
    console.log("Detected Project ID:", projectId);

    // Sidebar MUST be visible inside workspace!
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    // Workspace pages to test
    const sections = [
      "control-center",
      "documents",
      "budget",
      "reconciliation",
      "draws",
      "timeline",
      "economics",
      "submissions",
      "alerts",
      "investor-updates",
      "settings",
    ];

    for (const section of sections) {
      console.log(`Checking workspace section: ${section}`);
      const navLink = sidebar.locator(`a[href*="/projects/${projectId}/${section}"]`);
      await expect(navLink).toBeVisible();
      await navLink.click();
      await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/${section}`));
      
      // Sidebar must STILL be visible!
      await expect(sidebar).toBeVisible();

      // Check no 404 or access denied for Owner
      await expect(page.getByText("Project Not Found or Access Restricted")).toHaveCount(0);
      await expect(page.getByText("Access Restricted", { exact: true })).toHaveCount(0);
    }

    // 5. Test standalone legacy redirect URLs - now should automatically redirect to /projects/[projectId]/<section>
    const legacyRoutes = [
      ["/control-center", `/projects/${projectId}/control-center`],
      ["/documents", `/projects/${projectId}/documents`],
      ["/budget", `/projects/${projectId}/budget`],
      ["/reconciliation", `/projects/${projectId}/reconciliation`],
      ["/draws", `/projects/${projectId}/draws`],
      ["/timeline", `/projects/${projectId}/timeline`],
      ["/economics", `/projects/${projectId}/economics`],
      ["/submissions", `/projects/${projectId}/submissions`],
      ["/alerts", `/projects/${projectId}/alerts`],
      ["/investor-update", `/projects/${projectId}/investor-updates`],
    ];

    for (const [legacy, expectedTarget] of legacyRoutes) {
      console.log(`Testing navigation to legacy/direct URL: ${legacy}`);
      await page.goto(legacy);
      await expect(page).toHaveURL(new RegExp(expectedTarget), { timeout: 10000 });
      console.log(`Legacy ${legacy} redirected cleanly to:`, page.url());
      // Sidebar should NOT disappear because it was redirected into active workspace!
      await expect(sidebar).toBeVisible();
    }

    // 6. Test project switcher back to portfolio
    await sidebar.getByRole("link", { name: "Switch" }).click();
    await expect(page).toHaveURL(/\/projects/);

    console.log("Total console errors encountered:", consoleErrors.length);
  });
});
