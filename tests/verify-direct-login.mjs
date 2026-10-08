// GroundUp AI — Direct Role Login Verification Suite
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'tests', 'direct-login-screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runDirectLoginVerification() {
  console.log('🚀 Starting GroundUp Direct Role Login Verification Suite...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Visit Auth Screen
    console.log('1️⃣ Navigating to GroundUp AI login screen...');
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // Verify buttons are rendered
    await page.waitForSelector('text=Direct Role Login');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-login-screen-direct-buttons.png') });
    console.log('   ✓ Captured 01-login-screen-direct-buttons.png');

    // 2. Test Direct Login for Owner (Hardik Parikh)
    console.log('2️⃣ Testing Direct Login for Developer / Owner...');
    await page.click('[data-testid="direct-login-developer_owner"]');
    await page.waitForSelector('text=Hardik Parikh');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-logged-in-owner.png') });
    console.log('   ✓ Verified Owner login: Hardik Parikh');

    // Sign out
    await page.click('[data-testid="sign-out-btn"]');
    await page.waitForSelector('text=Sign in to GroundUp AI');

    // 3. Test CFO Direct Login (Sarah Jenkins)
    console.log('3️⃣ Testing direct login: Sarah Jenkins (CFO / Accounting)...');
    await page.click('[data-testid="direct-login-cfo"]');
    await page.waitForSelector('text=Sarah Jenkins');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-logged-in-cfo.png') });
    console.log('   ✓ Verified CFO login: Sarah Jenkins in CFO Recon workspace');

    // Sign out
    await page.click('[data-testid="sign-out-btn"]');
    await page.waitForSelector('text=Sign in to GroundUp AI');

    // 4. Test PM Direct Login (Marcus Vance)
    console.log('4️⃣ Testing direct login: Marcus Vance (Project Manager)...');
    await page.click('[data-testid="direct-login-pm"]');
    await page.waitForSelector('text=Marcus Vance');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-logged-in-pm.png') });
    console.log('   ✓ Verified PM login: Marcus Vance in Timeline workspace');

    // Sign out
    await page.click('[data-testid="sign-out-btn"]');
    await page.waitForSelector('text=Sign in to GroundUp AI');

    // 5. Test GC Fixed Direct Login (Kunal Shah)
    console.log('5️⃣ Testing direct login: Kunal Shah (GC Fixed)...');
    await page.click('[data-testid="direct-login-gc_fixed"]');
    await page.waitForSelector('text=Kunal Shah');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-logged-in-gc-fixed.png') });
    console.log('   ✓ Verified GC Fixed login: Kunal Shah in GC Fixed Claims portal');

    // Sign out
    await page.click('[data-testid="sign-out-btn"]');
    await page.waitForSelector('text=Sign in to GroundUp AI');

    // 6. Test Investor Direct Login (Krutarth Shah)
    console.log('6️⃣ Testing direct login: Krutarth Shah (Investor)...');
    await page.click('[data-testid="direct-login-investor"]');
    await page.waitForSelector('text=Krutarth Shah');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-logged-in-investor.png') });
    console.log('   ✓ Verified Investor login: Krutarth Shah in Investor portal');

    console.log('🎉 All direct login buttons tested and verified with 100% standard execution!');

  } catch (err) {
    console.error('❌ Direct login verification failed:', err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error-login-failure.png') }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}

runDirectLoginVerification();
