import { Page, expect } from "@playwright/test";

export async function loginAsOwner(page: Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Work email").fill("m.vance@vancedev.com");
  await page.getByLabel("Password", { exact: true }).fill("Password123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/control-center/, { timeout: 15000 });
}

export async function loginAsUser(page: Page, email: string, password = "Password123!") {
  await page.goto("/auth/login");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}
