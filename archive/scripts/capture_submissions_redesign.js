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

  // Fetch projects list
  const projRes = await fetch('http://localhost:3000/api/v1/projects', {
    headers: {
      'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; ')
    }
  });
  const projData = await projRes.json();
  const projects = Array.isArray(projData.data) ? projData.data : (projData?.data?.projects || []);
  const p73 = projects.find(p => p.name.includes('73 Broadway'))?.id || projects[0]?.id;

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });
  await page.setCookie(...cookies);

  // 1. Control Center to verify Owner sidebar
  console.log(`📸 Capturing Owner Control Center & Sidebar: http://localhost:3000/projects/${p73}/control-center`);
  await page.goto(`http://localhost:3000/projects/${p73}/control-center`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, 'owner_sidebar_control_center.png'), fullPage: false });

  // 2. Submissions main page
  console.log(`📸 Capturing submissions main table: http://localhost:3000/projects/${p73}/submissions`);
  await page.goto(`http://localhost:3000/projects/${p73}/submissions`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '11_submissions.png'), fullPage: false });

  // 3. Open first submission drawer
  console.log('📸 Opening first submission drawer...');
  const firstRow = await page.$('tbody tr:first-child');
  if (firstRow) {
    await firstRow.click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUT_DIR, '11_submissions_drawer.png'), fullPage: false });
  }

  console.log('Done!');
  await browser.close();
})();
