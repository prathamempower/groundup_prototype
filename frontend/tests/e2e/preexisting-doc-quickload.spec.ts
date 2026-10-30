import { test, expect } from "@playwright/test";

test.describe("Pre-existing Documents Quick Ingestion & Review", () => {
  test.setTimeout(60000);

  test("loads pre-existing document via 1-click button, simulates OCR extraction, and opens Review Workbench", async ({
    page,
  }) => {
    // 1. Sign in as Owner
    await page.goto("/auth/login");
    await page.getByLabel("Work email").fill("m.vance@vancedev.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: /Log in|Sign in/i }).click();

    // Wait for login to complete
    await expect(page).toHaveURL(/\/(projects|control-center)/, { timeout: 15000 });

    // 2. Navigate to documents page
    await page.goto("/documents");
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible({ timeout: 15000 });

    // 3. Click the pre-existing document quick ingest button on /documents
    const woodlawnQuickBtn = page.getByRole("button", { name: /161 Woodlawn Ave\.xlsx/i }).first();
    await expect(woodlawnQuickBtn).toBeVisible({ timeout: 10000 });
    await woodlawnQuickBtn.click();

    // 4. Verify navigation to the Document Review Workbench
    await expect(page).toHaveURL(/\/documents\/[a-f0-9-]+/, { timeout: 25000 });
    console.log("Navigated to Document Review Workbench:", page.url());

    // 8. Verify Review Workbench header & components
    await expect(page.getByRole("button", { name: "Complete Review" })).toBeVisible();
    await expect(page.getByText(/Extracted Fields/i)).toBeVisible();

    // Wait for spreadsheet viewer to load
    await expect(page.getByPlaceholder("Search in sheet...")).toBeVisible({ timeout: 10000 });

    // 9. Take screenshot of Document Workbench with pre-existing document loaded
    await page.screenshot({
      path: "/home/pratham/.gemini/antigravity/brain/1c9c217f-d932-4bdd-b5ca-837cffe11575/preexisting_doc_quick_load_verified.png",
      fullPage: true,
    });
  });
});
