import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const screenshotsDirectory = join(process.cwd(), "..", "qa", "screenshots", "auth");

test("owner creates an account and launches a first project", async ({ page }) => {
  const email = `owner-${Date.now()}@example.com`;
  const password = "GroundUp!secure2026";

  await page.goto("/auth/sign-up");
  await page.getByLabel("Organization name").fill(`Workspace ${Date.now()}`);
  await page.getByLabel("First name").fill("Taylor");
  await page.getByLabel("Last name").fill("Owner");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account and organization" }).click();
  await expect(page).toHaveURL(/\/projects\/new\?firstRun=1/);

  await page.getByPlaceholder("e.g. 161 Woodlawn Avenue").fill(`First Project ${Date.now()}`);
  await page.getByPlaceholder("e.g. 161 Woodlawn Ave, Jersey City, NJ").fill("100 Main Street, Boston, MA");
  await page.getByRole("button", { name: "Next: Project Setup" }).click();
  await page.getByRole("button", { name: "Next: Review Project" }).click();
  await page.getByRole("button", { name: "Create Project & Launch Readiness Checklist" }).click();
  await expect(page).toHaveURL(/\/readiness/);
  await expect(page.getByRole("heading", { name: "Project Readiness & Activation Gates" })).toBeVisible();
  await expect(page.getByText(/73 Broadway|Marcus Vance/)).toHaveCount(0);

  await page.getByRole("button", { name: /Taylor Owner/ }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/auth\/login/);
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/control-center/);
});

test("sign-in return path and protected route guard", async ({ page }) => {
  await page.goto("/control-center");
  await expect(page).toHaveURL(/\/auth\/login\?returnTo=%2Fcontrol-center/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("password reset request confirms recovery instructions", async ({ page }) => {
  await page.goto("/auth/forgot-password");
  await page.getByLabel("Work email").fill(`reset-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
});

test("an expired session recovers to the session-expired page", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("groundup_session_seen", "1");
  });
  await page.goto("/control-center");
  await expect(page).toHaveURL(/\/auth\/session-expired/);
  await expect(page.getByRole("heading", { name: "Your session has ended" })).toBeVisible();
});

test("captures auth screens at desktop and tablet widths", async ({ page }) => {
  mkdirSync(screenshotsDirectory, { recursive: true });
  const pages = [
    ["sign-in", "/auth/login"],
    ["sign-up", "/auth/sign-up"],
    ["forgot-password", "/auth/forgot-password"],
    ["reset-password", "/auth/reset-password?token=screenshot-token"],
    ["verify-email", "/auth/verify-email"],
    ["session-expired", "/auth/session-expired"],
    ["invite-unavailable", "/auth/invite/invalid-screenshot-token"],
  ] as const;

  for (const [name, path] of pages) {
    for (const width of [1440, 820]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(path);
      if (name === "invite-unavailable") {
        await expect(page.getByRole("heading", { name: "Invitation unavailable" })).toBeVisible();
      } else {
        await expect(page.getByRole("main")).toBeVisible();
      }
      await page.screenshot({
        path: join(screenshotsDirectory, `${name}-${width}.png`),
        fullPage: true,
      });
    }
  }
});
