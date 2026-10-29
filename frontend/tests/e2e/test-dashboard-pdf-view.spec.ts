import { test, expect } from "@playwright/test";

test.describe("Dashboard PDF Show / Inline Preview", () => {
  test.setTimeout(60000);

  test("shows PDF and document preview directly without forced download on dashboard and documents", async ({ page }) => {
    // 1. Sign in as Owner
    await page.goto("/auth/login");
    await page.waitForSelector("#email");
    await page.fill("#email", "m.vance@vancedev.com");
    await page.fill("#password", "Password123!");
    await page.click('button[type="submit"]');

    // Wait for login redirect
    await expect(page).toHaveURL(/\/(projects|control-center)/, { timeout: 15000 });

    // 2. Go to control-center (dashboard)
    await page.goto("/control-center");
    await expect(page.getByText(/Source Documents & Evidence/i)).toBeVisible({ timeout: 15000 });

    // 3. Take screenshot of Dashboard with Source Documents card
    await page.screenshot({
      path: "/home/pratham/.gemini/antigravity/brain/3f6c08f9-c4d6-46c3-8230-4cf59e188a1d/dashboard_source_documents_panel.png",
      fullPage: false,
    });

    // 4. Click 'Show' on a document in the dashboard
    const showBtns = page.getByRole("button", { name: /^Show$/i });
    await expect(showBtns.first()).toBeVisible({ timeout: 10000 });
    await showBtns.first().click();

    // 5. Verify the Source Document Preview Modal opens up with zero forced download
    await expect(page.getByText("SOURCE DOCUMENT PREVIEW")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: "Open in tab" })).toBeVisible({ timeout: 10000 });

    // Wait a brief moment for viewer rendering
    await page.waitForTimeout(1500);

    // Take screenshot of modal preview
    await page.screenshot({
      path: "/home/pratham/.gemini/antigravity/brain/3f6c08f9-c4d6-46c3-8230-4cf59e188a1d/dashboard_pdf_modal_preview.png",
      fullPage: false,
    });

    // Close preview modal
    await page.keyboard.press("Escape");

    // 6. Test on /documents page too
    await page.goto("/documents");
    await expect(page.getByRole("heading", { name: "Documents & Evidence" })).toBeVisible({ timeout: 15000 });

    // Find a row with .pdf document
    const pdfRow = page.locator("tr", { hasText: ".pdf" }).first();
    await expect(pdfRow).toBeVisible({ timeout: 10000 });
    
    // Click 'Show' on the PDF row
    const pdfShowBtn = pdfRow.getByRole("button", { name: /^Show$/i });
    await expect(pdfShowBtn).toBeVisible({ timeout: 10000 });
    await pdfShowBtn.click();

    // Verify PDF viewer iframe renders
    await expect(page.getByText("SOURCE DOCUMENT PREVIEW")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("iframe")).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(1500);
    await page.screenshot({
      path: "/home/pratham/.gemini/antigravity/brain/3f6c08f9-c4d6-46c3-8230-4cf59e188a1d/documents_pdf_inline_iframe_verified.png",
      fullPage: false,
    });
  });
});
