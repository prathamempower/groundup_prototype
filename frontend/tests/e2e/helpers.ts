import { Page, expect } from "@playwright/test";

export async function loginAsOwner(page: Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Work email").fill("m.vance@vancedev.com");
  await page.getByLabel("Password", { exact: true }).fill("Password123!");
  await page.getByRole("button", { name: /Log in|Sign in/i }).click();
  await expect(page).toHaveURL(/\/(projects|control-center)/, { timeout: 15000 });

  if (page.url().includes("/projects") && !page.url().includes("/control-center")) {
    const projectLink = page.getByRole("heading", { name: /73 Broadway|161 Woodlawn/i }).first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
    } else {
      await page.goto("/control-center");
    }
  }
  await expect(page).toHaveURL(/\/control-center/, { timeout: 15000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15000 });
}

export async function loginAsUser(page: Page, email: string, password = "Password123!") {
  await page.goto("/auth/login");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /Log in|Sign in/i }).click();
}
