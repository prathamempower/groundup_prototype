const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUT_DIR = '/home/pratham/.gemini/antigravity/brain/49155637-9faa-4a59-910e-e21031fc6988/screenshots';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  console.log('Authenticating Marcus Vance (OWNER)...');
  const res = await fetch('http://localhost:3000/api/v1/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'm.vance@vancedev.com', password: 'Password123!' })
  });
  const cookiesHeader = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];

  const cookies = [];
  for (const c of cookiesHeader) {
    if (!c) continue;
    const parts = c.split(';')[0].split('=');
    cookies.push({
      name: parts[0].trim(),
      value: parts.slice(1).join('=').trim(),
      domain: 'localhost',
      path: '/'
    });
  }

  // Fetch projects list to get IDs
  const projRes = await fetch('http://localhost:3000/api/v1/projects', {
    headers: {
      'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; ')
    }
  });
  const projData = await projRes.json();
  const projects = Array.isArray(projData.data) ? projData.data : (projData?.data?.projects || []);
  console.log('Discovered Projects:', projects.map(p => `${p.name} (${p.id})`));

  const p73 = projects.find(p => p.name.includes('73 Broadway'))?.id || projects[0].id;
  const p392 = projects.find(p => p.name.includes('392 First Street'))?.id || projects[1].id;
  const p161 = projects.find(p => p.name.includes('161 Woodlawn'))?.id || projects[2].id;

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setCookie(...cookies);

  // Helper
  const shot = async (name, url, waitMs = 1500) => {
    console.log(`📸 Capturing ${name}: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, waitMs));
    await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage: false });
  };

  // 1. Projects Portfolio
  await shot('01_projects_portfolio', 'http://localhost:3000/projects');
  await page.evaluate(() => localStorage.setItem('groundup_session_seen', '1'));

  // 2. Control Center
  await shot('02_control_center', `http://localhost:3000/projects/${p73}/control-center`);

  // 3. Budget
  await shot('03_budget', `http://localhost:3000/projects/${p73}/budget`);

  // 4. Draws Register
  await shot('04_draws', `http://localhost:3000/projects/${p73}/draws`);

  // 5. Draw Detail Drawer (Interactive Inspection)
  try {
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Inspect Packet')) {
        await b.click();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(OUT_DIR, '05_draw_drawer.png') });
        console.log('📸 Capturing 05_draw_drawer');
        break;
      }
    }
  } catch (e) {
    console.error('Drawer error:', e);
  }

  // 6. Reconciliation Queue
  await shot('06_reconciliation', `http://localhost:3000/projects/${p73}/reconciliation`);

  // 7. Document Inbox & Evidence
  await shot('07_documents', `http://localhost:3000/projects/${p73}/documents`);

  // 8. Timeline & Critical Path Schedule
  await shot('08_timeline', `http://localhost:3000/projects/${p73}/timeline`);

  // 9. Economics & Pro Forma (73 Broadway)
  await shot('09_economics_proforma', `http://localhost:3000/projects/${p73}/economics`);

  // 10. Economics & Unit Sales (392 First Street Condo units)
  console.log(`📸 Capturing 10_economics_units: http://localhost:3000/projects/${p392}/economics`);
  await page.goto(`http://localhost:3000/projects/${p392}/economics`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  try {
    const tabs = await page.$$('button');
    for (const t of tabs) {
      const text = await page.evaluate(el => el.textContent, t);
      if (text && text.includes('Disposition & Unit Sales')) {
        await t.click();
        await new Promise(r => setTimeout(r, 1000));
        break;
      }
    }
  } catch (e) {}
  await page.screenshot({ path: path.join(OUT_DIR, '10_economics_units.png') });

  // 11. General Contractor Submissions
  await shot('11_submissions', `http://localhost:3000/projects/${p73}/submissions`);

  // 12. Alerts & Material Exceptions
  await shot('12_alerts', `http://localhost:3000/projects/${p73}/alerts`);

  // 13. Project Governance & Settings
  await shot('13_settings', `http://localhost:3000/projects/${p73}/settings`);

  // 14. User Profile & Account Settings
  await shot('14_account', 'http://localhost:3000/account');

  // 15. New Project Bootstrap Flow
  await shot('15_new_project', 'http://localhost:3000/projects/new');

  // 16. Guided Project Onboarding Wizard
  await shot('16_onboarding', 'http://localhost:3000/onboarding');

  await browser.close();
  console.log('🎉 All 16 views successfully captured in', OUT_DIR);
})();
