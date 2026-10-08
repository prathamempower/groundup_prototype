// GroundUp AI — End-to-End Playwright Verification for Role-Based Onboarding Flow
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'tests', 'onboarding-screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runOnboardingE2ETest() {
  console.log('🚀 Starting GroundUp Role-Based Onboarding E2E Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Visit Auth Screen and Sign Up to trigger isNewUser onboarding
    console.log('1️⃣ Navigating to GroundUp AI sign-up...');
    await page.goto('http://127.0.0.1:3001', { waitUntil: 'networkidle' });
    
    // Clear storage for clean test run
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // Click Create Account tab
    await page.click('button:has-text("Create Account")');
    await page.fill('input[placeholder="Jane Doe"]', 'Alexandra Miller');
    await page.fill('input[placeholder="Horizon Development"]', 'Beacon Development Partners');
    await page.fill('input[placeholder="you@company.com"]', 'alexandra@beacondev.com');
    await page.fill('input[type="password"]', 'Password123!');
    
    // Submit registration
    await page.click('button[type="submit"]:has-text("Create Account")');
    await page.waitForTimeout(1000);

    // 2. Question 1: Role Selection
    console.log('2️⃣ Onboarding Screen: Question 1 (Operational Role Selection)...');
    await page.waitForSelector('text=What is your operational role on GroundUp?');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-role-selection.png') });
    console.log('   ✓ Captured 01-role-selection.png');

    // Select Developer / Owner
    await page.click('[data-testid="option-OWNER"]');
    await page.click('[data-testid="continue-btn"]');
    await page.waitForTimeout(500);

    // 3. Question 2: Owner Mode
    console.log('3️⃣ Question 2: Project Setup Mode...');
    await page.waitForSelector('text=How would you like to begin with your projects?');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-owner-mode.png') });
    
    // Select "Set up an active development project"
    await page.click('[data-testid="option-new_project"]');
    await page.click('[data-testid="continue-btn"]');
    await page.waitForTimeout(500);

    // 4. Question 3: Project Metadata
    console.log('4️⃣ Question 3: Project Information...');
    await page.waitForSelector('text=What is the name and location of your primary project?');
    await page.fill('input[placeholder="e.g. 73 Broadway or Parkview Residences"]', 'The Beacon at Hudson');
    await page.fill('input[placeholder="e.g. 73 Broadway, Hoboken, NJ"]', '100 Hudson Street, Jersey City, NJ');
    await page.selectOption('select', 'MULTIFAMILY');
    await page.fill('input[placeholder="e.g. 4"]', '6');
    await page.fill('input[placeholder="e.g. 4800"]', '7200');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-project-info.png') });
    await page.click('[data-testid="continue-btn"]');
    await page.waitForTimeout(500);

    // 5. Question 4: Project Phase
    console.log('5️⃣ Question 4: Project Phase (Context-Aware)...');
    await page.waitForSelector('text=What stage of development is The Beacon at Hudson currently in?');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-project-phase.png') });
    await page.click('[data-testid="option-active_construction"]');
    await page.click('[data-testid="continue-btn"]');
    await page.waitForTimeout(500);

    // 6. Question 5: Budget & Contingency
    console.log('6️⃣ Question 5: Hard Cost Budget & Contingency Reserve...');
    await page.waitForSelector('text=What is the approved hard cost budget and contingency buffer?');
    await page.fill('input[placeholder="e.g. 1,820,000"]', '2400000');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-active-budget.png') });
    await page.click('[data-testid="continue-btn"]');
    await page.waitForTimeout(500);

    // 7. Question 6: Financing Structure
    console.log('7️⃣ Question 6: Financing Structure...');
    await page.waitForSelector('text=How is The Beacon at Hudson being financed?');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-financing-structure.png') });
    await page.click('[data-testid="option-debt_equity"]');
    await page.click('[data-testid="continue-btn"]');
    await page.waitForTimeout(500);

    // 8. Question 7: External Construction Lender
    console.log('8️⃣ Question 7: Construction Lender Details...');
    await page.waitForSelector('text=Which external bank or lender is financing the construction loan?');
    await page.fill('input[placeholder="e.g. BCB Community Bank, Chase, Valley Bank"]', 'Valley National Bank');
    await page.fill('input[placeholder="e.g. 1,400,000"]', '1700000');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-lender-details.png') });
    await page.click('[data-testid="continue-btn"]');
    await page.waitForTimeout(500);

    // 9. Question 8: GC Delivery Method
    console.log('9️⃣ Question 8: GC Contract Delivery Method...');
    await page.waitForSelector('text=What contract model are you using with your General Contractor?');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-gc-model.png') });
    await page.click('[data-testid="option-FIXED_PRICE"]');
    await page.click('[data-testid="continue-btn"]');
    await page.waitForTimeout(500);

    // 10. Question 9: Approval Governance
    console.log('🔟 Question 9: Approval Governance Policy...');
    await page.waitForSelector('text=What approval governance policy should be enforced?');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-governance.png') });
    await page.click('[data-testid="option-solo"]');
    await page.click('[data-testid="continue-btn"]');
    await page.waitForTimeout(500);

    // 11. Final Review & Generated Tasks
    console.log('1️⃣1️⃣ Final Review Screen: Review Configuration & Synthesized Setup Tasks...');
    await page.waitForSelector('text=Review Your GroundUp Workspace Setup');
    await page.waitForSelector('text=Outstanding Setup Tasks');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-review-and-tasks.png') });
    console.log('   ✓ Captured 10-review-and-tasks.png');

    // 12. Complete Setup & Launch Workspace
    console.log('1️⃣2️⃣ Launching Workspace...');
    await page.click('[data-testid="complete-btn"]');
    await page.waitForTimeout(1200);

    // Verify arrival in Owner workspace
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-launched-workspace.png') });
    console.log('   ✓ Captured 11-launched-workspace.png');
    console.log('🎉 E2E Onboarding verification completed successfully with 11 pristine screenshots!');

  } catch (err) {
    console.error('❌ E2E Verification failed:', err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error-failure.png') }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}

runOnboardingE2ETest();
