import { test, expect } from "@playwright/test";
import { loginAsUser } from "./helpers";

test.describe("Multi-Project Portfolio & Strict Isolation", () => {
  test("User with distinct roles per project sees scoped workspace navigation and project isolation", async ({
    page,
  }) => {
    // 1. Sign in as Kunal Shah (OWNER on 73 Broadway, CFO on 392 First St, NO ACCESS to 161 Woodlawn)
    await page.goto("/auth/login");
    await page.getByLabel("Work email").fill("kunal@builderscapital.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    // 2. Confirms arrival on /projects portfolio
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Project Portfolio" })).toBeVisible();

    // 3. Confirm 73 Broadway and 392 First Street are displayed, but NOT 161 Woodlawn Ave
    await expect(page.getByRole("heading", { name: "73 Broadway" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "392 First Street" })).toBeVisible();
    await expect(page.getByText("161 Woodlawn Ave")).not.toBeVisible();

    // 4. Open 73 Broadway workspace (Role is OWNER)
    await page.getByText("73 Broadway").first().click();
    await expect(page).toHaveURL(/\/projects\/[^\/]+\/control-center/, { timeout: 15000 });

    // Confirm sidebar shows 73 Broadway, OWNER role, and Owner items (e.g. Project settings)
    const sidebar = page.locator("aside").first();
    await expect(sidebar.getByText("73 Broadway", { exact: true })).toBeVisible();
    await expect(sidebar.getByText(/owner/i)).toBeVisible();
    await expect(sidebar.getByText("Project Settings")).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Switch" })).toBeVisible();

    // Confirm top bar switcher does NOT exist
    await expect(page.locator("header").getByRole("combobox")).not.toBeVisible();

    // 5. Return to Portfolio
    await sidebar.getByRole("link", { name: "Switch" }).click();
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });

    // 6. Open 392 First Street workspace (Role is CFO)
    await page.getByText("392 First Street").first().click();
    await expect(page).toHaveURL(/\/projects\/[^\/]+\/control-center/, { timeout: 15000 });

    // Confirm sidebar shows 392 First Street, CFO role, and Project settings is HIDDEN for CFO
    await expect(sidebar.getByText("392 First Street", { exact: true })).toBeVisible();
    await expect(sidebar.getByText(/cfo/i)).toBeVisible();
    await expect(sidebar.getByText("Project Settings")).not.toBeVisible();

    // 7. Verify unauthorized project access returns 404 (Attempting 161 Woodlawn Ave ID: 4dbc506e-d18d-4ac2-ba8b-10c4274fec5a)
    await page.goto("/projects/4dbc506e-d18d-4ac2-ba8b-10c4274fec5a/control-center");
    // Should show access restricted or page not found / 404
    await expect(page.getByText(/Access Restricted|Page Not Found|Not Found/i)).toBeVisible({ timeout: 10000 });
  });
});
