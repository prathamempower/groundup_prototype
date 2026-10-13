import { test, expect } from "@playwright/test";
import { loginAsOwner } from "./helpers";

test.describe("Inbox (Clean & Minimal Redesign) Feature & UI/UX Audit", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
  });

  test("should render clean, simple Inbox page with minimal design", async ({ page }) => {
    await page.goto("/inbox");
    await expect(page).toHaveURL(/\/(inbox|projects\/[^\/]+\/inbox)/, { timeout: 15000 });

    // Verify Left Contacts Sidebar with clean "Inbox" title
    await expect(page.getByRole("heading", { name: "Inbox" })).toBeVisible();
    await expect(page.getByPlaceholder("Search team member name or role...")).toBeVisible();

    // Verify Contacts in list
    await expect(page.getByText("Dave Kowalski").first()).toBeVisible();
    await expect(page.getByText("Alex Rivera")).toBeVisible();
    await expect(page.getByText("Sarah Jenkins")).toBeVisible();
    await expect(page.getByText("Apex Capital")).toBeVisible();

    // Verify Dave Kowalski active header
    await expect(page.getByRole("heading", { name: "Dave Kowalski" })).toBeVisible();
    await expect(page.getByText("General Contractor • 161 Woodlawn Ave Site Manager")).toBeVisible();

    // Verify header actions are removed for clean minimal appearance
    const header = page.locator("main header");
    await expect(header.getByRole("button", { name: "Ask Gemini" })).not.toBeVisible();
    await expect(header.getByRole("button", { name: "Attach Document" })).not.toBeVisible();

    // Verify Clean Date Stamp
    await expect(page.getByText("Today, Oct 13")).toBeVisible();

    // Verify Initial Thread Messages (Dave Kowalski)
    await expect(
      page.getByText("Plumbing rough-in for 161 Woodlawn passed inspection with the city.")
    ).toBeVisible();
    await expect(page.getByText("161_Woodlawn_Draw_04_Inspection.pdf")).toBeVisible();
    await expect(page.getByText("4.2 MB • Attached Document")).toBeVisible();
    await expect(page.getByRole("button", { name: "View", exact: true })).toBeVisible();

    // Verify Outgoing Marcus Vance Message
    await expect(
      page.getByText("Excellent news Dave! Is Sarah in agreement with the $85,000 line item allocation?")
    ).toBeVisible();
    await expect(page.getByText("Read ✓").first()).toBeVisible();

    // Verify Follow-up Message from Dave Kowalski
    await expect(
      page.getByText("Yes, Sarah already verified the budget against our contingency line.")
    ).toBeVisible();

    // Verify Clean Message Input bar
    await expect(page.getByPlaceholder("Message Dave Kowalski...")).toBeVisible();

    // Capture visual screenshot of clean minimal redesign
    await page.screenshot({ path: "screenshots/inbox-clean.png", fullPage: true });
  });

  test("should allow switching contacts and live search filtering in Inbox", async ({ page }) => {
    await page.goto("/inbox");

    // Switch to Alex Rivera (PM)
    await page.getByText("Alex Rivera").click();
    await expect(page.getByRole("heading", { name: "Alex Rivera" })).toBeVisible();
    await expect(page.getByPlaceholder("Message Alex Rivera...")).toBeVisible();
    await expect(page.getByText("Verified plumbing photos on site.")).toBeVisible();

    // Switch to Sarah Jenkins (CFO)
    await page.getByText("Sarah Jenkins").click();
    await expect(page.getByRole("heading", { name: "Sarah Jenkins" })).toBeVisible();
    await expect(page.getByPlaceholder("Message Sarah Jenkins...")).toBeVisible();
    await expect(page.getByText("Draw #4 wire queue authorized.")).toBeVisible();

    // Test Search Filter
    const searchInput = page.getByPlaceholder("Search team member name or role...");
    await searchInput.fill("Apex");
    await expect(page.getByText("Apex Capital")).toBeVisible();
    await expect(page.getByText("Dave Kowalski")).not.toBeVisible();

    // Clear search
    await searchInput.fill("");
    await expect(page.getByText("Dave Kowalski").first()).toBeVisible();
  });

  test("should send messages and trigger realistic stakeholder response in Inbox", async ({ page }) => {
    await page.goto("/inbox");

    // Click Dave Kowalski
    await page.getByText("Dave Kowalski").first().click();

    const input = page.getByPlaceholder("Message Dave Kowalski...");
    await input.fill("Please ensure the framing inspection is booked for next Tuesday.");
    await input.press("Enter");

    // Verify message sent in main thread
    const messageThread = page.getByRole("main", { name: "Direct 1-on-1 Message Thread" });
    await expect(
      messageThread.getByText("Please ensure the framing inspection is booked for next Tuesday.")
    ).toBeVisible();

    // Verify automated realistic stakeholder reply
    await expect(
      messageThread.getByText(/Understood Marcus. Site crew is notified and ready to proceed/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("should open document viewer preview and allow document attachment in Inbox", async ({ page }) => {
    await page.goto("/inbox");

    // Click "View" on Dave Kowalski's inspection document
    const messageThread = page.getByRole("main", { name: "Direct 1-on-1 Message Thread" });
    await messageThread.getByRole("button", { name: "View", exact: true }).first().click();
    await expect(page.getByText("Inspector Verification Note:")).toBeVisible();
    await expect(page.getByText(/Jersey City Dept of Housing & Construction/i)).toBeVisible();

    // Close preview modal by pressing Escape
    await page.keyboard.press("Escape");
    await expect(page.getByText("Inspector Verification Note:")).not.toBeVisible();

    // Open "Attach Document" modal via paperclip button in composer
    await page.getByRole("button", { name: "Attach Document" }).click();
    await expect(page.getByText("Attach Project Document")).toBeVisible();
    await expect(page.getByText("161 Woodlawn Ave.xlsx")).toBeVisible();

    // Attach master workbook
    await page.getByText("161 Woodlawn Ave.xlsx").click();
    await expect(messageThread.getByText("161 Woodlawn Ave.xlsx")).toBeVisible();
  });
});
