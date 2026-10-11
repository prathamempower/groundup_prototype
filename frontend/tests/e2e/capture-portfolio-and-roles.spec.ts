import { test } from "@playwright/test";

test.describe("Visual Regression & Responsive Inspection", () => {
  test("Capture portfolio and workspaces at 1440px and 820px", async ({ page }) => {
    // 1. Portfolio View - Desktop (1440px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/auth/login");
    await page.getByLabel("Work email").fill("m.vance@vancedev.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/projects/);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/portfolio-1440.png" });

    // 2. Portfolio View - Tablet (820px)
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screenshots/portfolio-820.png" });

    // 3. Owner Workspace (Control Center) - Desktop (1440px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("heading", { name: "73 Broadway" }).first().click();
    await page.waitForURL(/\/projects\/[^\/]+\/control-center/);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/workspace-owner-1440.png" });

    // 4. Owner Workspace (Control Center) - Tablet (820px)
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screenshots/workspace-owner-820.png" });

    // 5. PM Workspace (Timeline) - Desktop (1440px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/auth/login");
    await page.getByLabel("Work email").fill("d.ross@vancedev.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/projects/);
    await page.getByRole("heading", { name: "73 Broadway" }).first().click();
    await page.waitForURL(/\/projects\/[^\/]+\/timeline/);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/workspace-pm-1440.png" });

    // 6. GC Workspace (Submissions) - Desktop (1440px)
    await page.goto("/auth/login");
    await page.getByLabel("Work email").fill("frank@apexconstruction.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/projects/);
    await page.getByRole("heading", { name: "73 Broadway" }).first().click();
    await page.waitForURL(/\/projects\/[^\/]+\/submissions/);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/workspace-gc-1440.png" });
  });
});
