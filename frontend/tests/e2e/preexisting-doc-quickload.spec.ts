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
    await page.getByRole("button", { name: "Sign in" }).click();

    // Wait for login to complete
    await expect(page).toHaveURL(/\/(projects|control-center)/, { timeout: 15000 });

    // 2. Navigate to documents page
    await page.goto("/documents");
    await expect(page.getByRole("heading", { name: "Document Inbox & Evidence" })).toBeVisible({ timeout: 15000 });

    // 3. Verify Pre-existing Project Documents action bar is visible
    const preExistingSection = page.getByText("Pre-existing Project Documents");
    await expect(preExistingSection.first()).toBeVisible();

    // 4. Click the pre-existing document button for "161 Woodlawn Ave.xlsx"
    const woodlawnBtn = page.getByRole("button", { name: /161 Woodlawn Ave\.xlsx/i });
    await expect(woodlawnBtn).toBeVisible();
    await woodlawnBtn.click();

    // 5. It should automatically navigate to the Document Review Workbench
    await expect(page).toHaveURL(/\/documents\/[a-f0-9-]+/, { timeout: 20000 });
    console.log("Navigated to Document Review Workbench:", page.url());

    // 6. Verify Review Workbench header & components
    await expect(page.getByText("OCR REVIEW WORKBENCH")).toBeVisible();
    await expect(page.getByText(/Extraction Queue/i)).toBeVisible();

    // Wait for spreadsheet viewer to load
    await expect(page.getByPlaceholder("Search in sheet...")).toBeVisible({ timeout: 10000 });

    // 7. Take screenshot of Document Workbench with pre-existing document loaded
    await page.screenshot({
      path: "/home/pratham/.gemini/antigravity/brain/3f6c08f9-c4d6-46c3-8230-4cf59e188a1d/preexisting_doc_quick_load_verified.png",
      fullPage: true,
    });
  });
});
