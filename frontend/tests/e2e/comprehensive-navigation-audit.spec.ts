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
    await page.getByRole("button", { name: /Log in|Sign in/i }).click();

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
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();

    // Workspace pages to test
    const sections = [
      "control-center",
      "documents",
      "budget",
      "reconciliation",
      "draws",
      "timeline",
      "partners",
      "alerts",
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

    // 5. Test canonical server redirects & un-scoped route boundary
    await page.goto("/login");
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.goto(`/projects/${projectId}/economics`);
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/budget`));

    await page.goto(`/projects/${projectId}/directs`);
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/inbox`));

    await page.goto(`/projects/${projectId}/investor-update`);
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/investor-updates`));

    // Standalone un-scoped route should return 404
    const response = await page.goto("/control-center");
    expect(response?.status()).toBe(404);

    // 6. Test project switcher back to portfolio
    await sidebar.getByRole("link", { name: "Switch" }).click();
    await expect(page).toHaveURL(/\/projects/);

    console.log("Total console errors encountered:", consoleErrors.length);
  });
});
