const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const outputDir = path.resolve(__dirname, "../public/sample-docs");
const tempHtmlDir = path.resolve(__dirname, "../temp_html_docs");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(tempHtmlDir)) fs.mkdirSync(tempHtmlDir, { recursive: true });

function getBrowserCmd() {
  if (process.platform === "win32") {
    if (fs.existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")) {
      return '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
    }
    if (fs.existsSync("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe")) {
      return '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"';
    }
  }
  return "google-chrome";
}

function renderPdf(htmlContent, outputFilename) {
  // Sanitize temp filename to avoid '#' being treated as URL hash fragment
  const safeBaseName = path.basename(outputFilename, ".pdf").replace(/[^a-zA-Z0-9_-]/g, "_");
  const tempHtmlPath = path.join(tempHtmlDir, `${safeBaseName}.html`);
  const outPdfPath = path.join(outputDir, outputFilename);
  fs.writeFileSync(tempHtmlPath, htmlContent, "utf8");

  const browser = getBrowserCmd();
  const fileUrl = tempHtmlPath.replace(/\\/g, "/");
  const cmd = `${browser} --headless --disable-gpu --no-sandbox --print-to-pdf="${outPdfPath}" --no-pdf-header-footer "file://${fileUrl}"`;
  execSync(cmd);
  console.log(`-> Generated PDF: ${outputFilename} (${fs.statSync(outPdfPath).size} bytes)`);
}

const baseStyles = `
  <style>
    @page { size: letter; margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .subbrand {
      font-size: 9pt;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-meta {
      text-align: right;
      font-size: 9pt;
      color: #475569;
    }
    .title-block {
      margin-bottom: 20px;
    }
    h1 {
      font-size: 14pt;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: #0f172a;
    }
    .subtitle {
      font-size: 10pt;
      color: #64748b;
      margin: 0;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
    }
    .card-label {
      font-size: 8pt;
      text-transform: uppercase;
      font-weight: 600;
      color: #64748b;
    }
    .card-value {
      font-size: 13pt;
      font-weight: 700;
      color: #0f172a;
      font-family: monospace;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 9.5pt;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 600;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .text-right { text-align: right; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 600;
      background: #dbeafe;
      color: #1e40af;
    }
    .badge-success {
      background: #dcfce7;
      color: #166534;
    }
    .footer {
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #94a3b8;
    }
    .stamp-box {
      border: 2px dashed #94a3b8;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
      width: 220px;
      margin-left: auto;
      margin-top: 20px;
      color: #475569;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
`;

// --------------------------------------------------------------------------
// 1. 161 Woodlawn Ave.xlsx.pdf
// --------------------------------------------------------------------------
renderPdf(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">${baseStyles}</head>
<body>
  <div class="header">
    <div>
      <div class="brand">VANCE DEVELOPMENT HOLDINGS</div>
      <div class="subbrand">Capital Structure & Underwriting Pro Forma</div>
    </div>
    <div class="doc-meta">
      <div>Project: <strong>161 Woodlawn Ave</strong></div>
      <div>Date: <strong>April 24, 2024</strong></div>
      <div>Status: <span class="badge badge-success">Approved Underwriting</span></div>
    </div>
  </div>

  <div class="title-block">
    <h1>161 Woodlawn Avenue - Financial Model & Partner Equity Ratios</h1>
    <p class="subtitle">Multi-family residential development baseline budget and equity funding schedule</p>
  </div>

  <div class="card-grid">
    <div class="card">
      <div class="card-label">Baseline Budget</div>
      <div class="card-value">$1,019,220</div>
    </div>
    <div class="card">
      <div class="card-label">Sponsor Equity</div>
      <div class="card-value">$475,000</div>
    </div>
    <div class="card">
      <div class="card-label">Loan Facility</div>
      <div class="card-value">$2,400,000</div>
    </div>
    <div class="card">
      <div class="card-label">Contingency</div>
      <div class="card-value">10.0%</div>
    </div>
  </div>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 15px 0 8px;">Partner Equity Allocations</h2>
  <table>
    <thead>
      <tr>
        <th>Partner Entity</th>
        <th>Role</th>
        <th>Equity %</th>
        <th class="text-right">Commitment</th>
        <th class="text-right">Funded Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Marcus Vance</strong></td>
        <td>Managing Sponsor</td>
        <td>50.00%</td>
        <td class="text-right font-mono">$237,500.00</td>
        <td class="text-right font-mono">$237,500.00</td>
      </tr>
      <tr>
        <td><strong>Elena Rostova</strong></td>
        <td>Co-Sponsor</td>
        <td>25.00%</td>
        <td class="text-right font-mono">$118,750.00</td>
        <td class="text-right font-mono">$118,750.00</td>
      </tr>
      <tr>
        <td><strong>Apex Equity Partners LLC</strong></td>
        <td>Institutional LP</td>
        <td>25.00%</td>
        <td class="text-right font-mono">$118,750.00</td>
        <td class="text-right font-mono">$118,750.00</td>
      </tr>
      <tr style="font-weight: 700; background: #f8fafc;">
        <td colspan="2">Total Sponsor Equity Commitment</td>
        <td>100.00%</td>
        <td class="text-right font-mono">$475,000.00</td>
        <td class="text-right font-mono">$475,000.00</td>
      </tr>
    </tbody>
  </table>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 15px 0 8px;">Construction Schedule of Values Baseline</h2>
  <table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Category Description</th>
        <th class="text-right">Original Budget</th>
        <th class="text-right">Contractor Baseline</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-mono">01.00</td>
        <td>Plans, Permits & Municipal Closing</td>
        <td class="text-right font-mono">$45,100.00</td>
        <td class="text-right font-mono">100% Funded</td>
      </tr>
      <tr>
        <td class="font-mono">02.00</td>
        <td>Sitework & Foundation Excavation</td>
        <td class="text-right font-mono">$135,300.00</td>
        <td class="text-right font-mono">Underwritten</td>
      </tr>
      <tr>
        <td class="font-mono">03.00</td>
        <td>Building Structure & Structural Steel</td>
        <td class="text-right font-mono">$300,000.00</td>
        <td class="text-right font-mono">Contract Awarded</td>
      </tr>
      <tr>
        <td class="font-mono">04.00</td>
        <td>Mechanical, Electrical & Plumbing (MEP)</td>
        <td class="text-right font-mono">$180,000.00</td>
        <td class="text-right font-mono">Design Phase</td>
      </tr>
      <tr>
        <td class="font-mono">05.00</td>
        <td>Interior Finishes, Drywall & Millwork</td>
        <td class="text-right font-mono">$220,000.00</td>
        <td class="text-right font-mono">Scheduled</td>
      </tr>
      <tr>
        <td class="font-mono">16.00</td>
        <td>Contingency Reserve (10.0%)</td>
        <td class="text-right font-mono">$91,920.00</td>
        <td class="text-right font-mono">Held in Reserve</td>
      </tr>
      <tr style="font-weight: 700; background: #f8fafc;">
        <td colspan="2">Total Original Budget</td>
        <td class="text-right font-mono" colspan="2">$1,019,220.00</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>GroundUp AI Institutional Repository · Verified Financial Model</div>
    <div>Page 1 of 1 · SHA-256 Ledger Verified</div>
  </div>
</body>
</html>
`, "161 Woodlawn Ave.xlsx.pdf");

// --------------------------------------------------------------------------
// 2. 73 Broadway - Report #2.pdf
// --------------------------------------------------------------------------
renderPdf(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">${baseStyles}</head>
<body>
  <div class="header">
    <div>
      <div class="brand">APEX ENGINEERING &amp; INSPECTION GROUP</div>
      <div class="subbrand">Independent Construction Observation &amp; Lender Advisory Services</div>
    </div>
    <div class="doc-meta">
      <div>Report #: <strong>ATD #2 (Draw #3)</strong></div>
      <div>Date: <strong>August 14, 2025</strong></div>
      <div>Inspection Date: <strong>August 11, 2025</strong></div>
    </div>
  </div>

  <div class="title-block">
    <h1>Certified Field Progress Inspection Report</h1>
    <p class="subtitle">Project: 73 Broadway Mixed-Use Development, Jersey City, New Jersey 07306</p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; font-size: 9.5pt;">
    <p style="margin: 0 0 6px 0;"><strong>To:</strong> Metropolitan Commercial Bank — Construction Loan Administration</p>
    <p style="margin: 0 0 6px 0;"><strong>Borrower / Developer:</strong> JC Realty Ventures LLC</p>
    <p style="margin: 0;"><strong>General Contractor:</strong> Apex Construction Services LLC</p>
  </div>

  <p style="font-size: 10pt; line-height: 1.6;">
    In accordance with your authorization, an on-site physical observation was performed at 73 Broadway on August 11, 2025 by David Ross, PE. Based on our trade audit, certified materials verification, and physical walkthrough, Apex Engineering recommends that <strong>$98,203.00</strong> for Application #3 (Draw #3) be released for funding at this time.
  </p>

  <div class="card-grid" style="grid-template-columns: repeat(3, 1fr); margin-top: 15px;">
    <div class="card">
      <div class="card-label">Contractor Requested</div>
      <div class="card-value">$125,000</div>
    </div>
    <div class="card">
      <div class="card-label">Inspector Approved</div>
      <div class="card-value" style="color: #2563eb;">$109,114</div>
    </div>
    <div class="card">
      <div class="card-label">Recommended Net Funding</div>
      <div class="card-value" style="color: #16a34a;">$98,203</div>
    </div>
  </div>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 20px 0 8px;">Milestone Progress Certification &amp; Retainage Schedule</h2>
  <table>
    <thead>
      <tr>
        <th>Division / Trade Description</th>
        <th class="text-right">Scheduled Value</th>
        <th class="text-right">% Completed</th>
        <th class="text-right">Certified Value</th>
        <th class="text-right">Retainage (10%)</th>
        <th class="text-right">Net Payable</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>01.00 Plans &amp; Permits</td>
        <td class="text-right font-mono">$45,100.00</td>
        <td class="text-right">100.0%</td>
        <td class="text-right font-mono">$45,100.00</td>
        <td class="text-right font-mono">$4,510.00</td>
        <td class="text-right font-mono">$40,590.00</td>
      </tr>
      <tr>
        <td>02.00 Sitework &amp; Foundation</td>
        <td class="text-right font-mono">$135,300.00</td>
        <td class="text-right">100.0%</td>
        <td class="text-right font-mono">$135,300.00</td>
        <td class="text-right font-mono">$13,530.00</td>
        <td class="text-right font-mono">$121,770.00</td>
      </tr>
      <tr>
        <td>03.00 Building Structure &amp; Steel</td>
        <td class="text-right font-mono">$345,000.00</td>
        <td class="text-right">68.0%</td>
        <td class="text-right font-mono">$234,600.00</td>
        <td class="text-right font-mono">$23,460.00</td>
        <td class="text-right font-mono">$211,140.00</td>
      </tr>
      <tr>
        <td>04.00 Mechanical, Electrical &amp; Plumbing</td>
        <td class="text-right font-mono">$180,000.00</td>
        <td class="text-right">25.0%</td>
        <td class="text-right font-mono">$45,000.00</td>
        <td class="text-right font-mono">$4,500.00</td>
        <td class="text-right font-mono">$40,500.00</td>
      </tr>
      <tr style="font-weight: 700; background: #f8fafc;">
        <td>Application #3 Period Disbursed</td>
        <td class="text-right font-mono">—</td>
        <td class="text-right">—</td>
        <td class="text-right font-mono">$109,114.44</td>
        <td class="text-right font-mono">$10,911.44</td>
        <td class="text-right font-mono" style="color: #16a34a;">$98,203.00</td>
      </tr>
    </tbody>
  </table>

  <div class="stamp-box">
    <div style="font-size: 8pt; font-weight: 700; letter-spacing: 1px; color: #1e40af;">CERTIFIED LICENSED ENGINEER</div>
    <div style="font-size: 11pt; font-weight: 800; margin: 4px 0;">DAVID ROSS, PE</div>
    <div style="font-size: 8pt; color: #64748b;">License #PE-048291 · State of New Jersey</div>
    <div style="font-size: 8pt; color: #16a34a; font-weight: 600; margin-top: 4px;">✔ SIGNED &amp; SEALED</div>
  </div>

  <div class="footer">
    <div>Apex Engineering &amp; Inspection Group LLC · Certified Lender Observation Report</div>
    <div>Document Ref: ATD-73B-DRAW3-CERT · Page 1 of 1</div>
  </div>
</body>
</html>
`, "73 Broadway - Report #2.pdf");

// --------------------------------------------------------------------------
// 3. 73 Construction Loan.pdf
// --------------------------------------------------------------------------
renderPdf(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">${baseStyles}</head>
<body>
  <div class="header">
    <div>
      <div class="brand">FIRST NATIONAL BANK</div>
      <div class="subbrand">Commercial Real Estate Lending Division · Fed Wire Disbursement Operations</div>
    </div>
    <div class="doc-meta">
      <div>Total Facility Commitment: <strong>$1,471,120.00</strong></div>
      <div>Commitment ID: <strong>COL-2025-73B</strong></div>
      <div>Date: <strong>April 01, 2025 · Reconciled October 20, 2025</strong></div>
    </div>
  </div>

  <div class="title-block">
    <h1>Senior Construction Loan Facility &amp; Wire Disbursement Schedule</h1>
    <p class="subtitle">Borrower: JC Realty Ventures LLC · Project: 73 Broadway, Jersey City, NJ 07306 · Loan #LN-2025-73B</p>
  </div>

  <div class="card-grid">
    <div class="card">
      <div class="card-label">Loan Facility Commitment</div>
      <div class="card-value">$1,471,120</div>
    </div>
    <div class="card">
      <div class="card-label">Draws Disbursed to Date</div>
      <div class="card-value" style="color: #16a34a;">$1,086,000</div>
    </div>
    <div class="card">
      <div class="card-label">Available Facility Balance</div>
      <div class="card-value" style="color: #2563eb;">$385,120</div>
    </div>
    <div class="card">
      <div class="card-label">Facility Funded Status</div>
      <div class="card-value" style="font-size: 11pt; color: #16a34a;">73.8% Cleared</div>
    </div>
  </div>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 14px 0 8px;">Section 2.01 • Facility Commitment &amp; Loan Facility Cap</h2>
  <table>
    <thead>
      <tr>
        <th>Facility Allocation Account</th>
        <th>Disbursement Condition</th>
        <th class="text-right">Committed Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Base Building Construction Loan Commitment</strong></td>
        <td>Underwritten base loan facility agreement executed April 01, 2025</td>
        <td class="text-right font-mono">$1,455,000.00</td>
      </tr>
      <tr>
        <td><strong>Approved Facility Modification Addendum (CO-001)</strong></td>
        <td>Approved structural steel reinforcement modification addendum executed August 14, 2025</td>
        <td class="text-right font-mono">$16,120.00</td>
      </tr>
      <tr style="font-weight: 700; background: #f8fafc;">
        <td colspan="2">Total Senior Loan Facility Cap</td>
        <td class="text-right font-mono" style="color: #0f172a; font-size: 10.5pt;">$1,471,120.00</td>
      </tr>
    </tbody>
  </table>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 14px 0 8px;">Section 3.02 • First National Bank Wire Confirmations (Draws #1–#3)</h2>
  <table>
    <thead>
      <tr>
        <th>Draw #</th>
        <th>Scope Description</th>
        <th>Cleared Date</th>
        <th>Federal Wire Confirmation Ref</th>
        <th class="text-right">Disbursed Amount</th>
        <th class="text-right">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Draw #1</strong></td>
        <td>Site Mobilization &amp; Foundation Footings</td>
        <td>May 26, 2025</td>
        <td class="font-mono" style="font-size: 8.5pt;">FED-2025-0526-448</td>
        <td class="text-right font-mono">$448,000.00</td>
        <td class="text-right" style="color: #16a34a; font-weight: 600;">Cleared (100%)</td>
      </tr>
      <tr>
        <td><strong>Draw #2</strong></td>
        <td>Concrete Core &amp; Structural Steel Framing</td>
        <td>Jul 26, 2025</td>
        <td class="font-mono" style="font-size: 8.5pt;">FED-2025-0726-320</td>
        <td class="text-right font-mono">$320,000.00</td>
        <td class="text-right" style="color: #16a34a; font-weight: 600;">Cleared (100%)</td>
      </tr>
      <tr>
        <td><strong>Draw #3</strong></td>
        <td>Rough MEP &amp; Utility Rough-Ins</td>
        <td>Oct 20, 2025</td>
        <td class="font-mono" style="font-size: 8.5pt;">FED-2025-1020-318</td>
        <td class="text-right font-mono">$318,000.00</td>
        <td class="text-right" style="color: #0d9488; font-weight: 600;">Cleared (94% Active)</td>
      </tr>
      <tr style="font-weight: 700; background: #f0fdf4; border-top: 2px solid #bbf7d0;">
        <td colspan="4">Total Construction Loan Draws Disbursed to Date (Draws #1–#3)</td>
        <td class="text-right font-mono" style="color: #15803d; font-size: 11pt;">$1,086,000.00</td>
        <td class="text-right" style="color: #15803d; font-weight: 700;">73.8% Funded</td>
      </tr>
      <tr style="font-weight: 600; background: #f8fafc; color: #475569;">
        <td>Draw #4</td>
        <td>Exterior Enclosure &amp; Roofing (Ready to Request)</td>
        <td>Scheduled Oct 2025</td>
        <td class="font-mono" style="font-size: 8.5pt;">PENDING SUBMISSION</td>
        <td class="text-right font-mono">$385,120.00</td>
        <td class="text-right" style="color: #d97706;">Available Balance</td>
      </tr>
    </tbody>
  </table>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center;">
    <div style="font-size: 8.5pt; color: #475569; line-height: 1.4;">
      <strong>First National Bank Wire Operations Certification:</strong> All funds for Draws #1 ($448k), #2 ($320k), and #3 ($318k) have cleared through Federal Reserve FedWire and credited to project operating account #982103440. Total cleared: <strong>$1,086,000.00</strong>. Available facility credit remaining: <strong>$385,120.00</strong>.
    </div>
    <div class="stamp-box" style="margin: 0 0 0 16px; width: 175px; padding: 6px 10px; shrink: 0;">
      <div style="font-size: 8pt; font-weight: 700; color: #16a34a;">FNB WIRE DISBURSEMENT</div>
      <div style="font-size: 9pt; font-weight: 800;">$1,086,000.00 CLEARED</div>
    </div>
  </div>

  <div class="footer">
    <div>First National Bank · Commercial Real Estate Lending Division · Loan #LN-2025-73B</div>
    <div>Page 1 of 1 · Certified Federal Wire Settlement Schedule</div>
  </div>
</body>
</html>
`, "73 Construction Loan.pdf");

// --------------------------------------------------------------------------
// 4. 73 Land Aquisition Cash Deal.pdf
// --------------------------------------------------------------------------
renderPdf(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">${baseStyles}</head>
<body>
  <div class="header">
    <div>
      <div class="brand">FIRST AMERICAN COMMERCIAL TITLE</div>
      <div class="subbrand">Commercial Real Estate Escrow &amp; Settlement Services</div>
    </div>
    <div class="doc-meta">
      <div>Order Number: <strong>CT-78848</strong></div>
      <div>Settlement Date: <strong>April 04, 2025</strong></div>
      <div>Disbursement: <strong>Cash Settlement</strong></div>
    </div>
  </div>

  <div class="title-block">
    <h1>ALTA / HUD-1 Commercial Settlement Statement</h1>
    <p class="subtitle">Property: 73 Broadway, Jersey City, New Jersey 07306</p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; font-size: 9pt; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
    <div>
      <p style="margin: 0;"><strong>Purchaser:</strong> JC Realty Ventures LLC</p>
      <p style="margin: 3px 0 0;"><strong>Address:</strong> 73 Broadway, Jersey City, NJ 07306</p>
    </div>
    <div>
      <p style="margin: 0;"><strong>Seller:</strong> Broadway Heritage Properties LLC</p>
      <p style="margin: 3px 0 0;"><strong>Escrow Officer:</strong> First American Escrow Desk</p>
    </div>
  </div>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 15px 0 8px;">Settlement Financial Summary (Buyer Ledger)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 50px;">Line</th>
        <th>Description of Transaction Item</th>
        <th class="text-right">Debit to Buyer</th>
        <th class="text-right">Credit to Buyer</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-mono">101</td>
        <td>Contract Sales Purchase Price</td>
        <td class="text-right font-mono">$700,000.00</td>
        <td class="text-right font-mono">—</td>
      </tr>
      <tr>
        <td class="font-mono">103</td>
        <td>Commercial Title Policy &amp; Settlement Escrow</td>
        <td class="text-right font-mono">$12,450.00</td>
        <td class="text-right font-mono">—</td>
      </tr>
      <tr>
        <td class="font-mono">106</td>
        <td>City Real Estate Tax Proration (Q2 2025)</td>
        <td class="text-right font-mono">$1,850.00</td>
        <td class="text-right font-mono">—</td>
      </tr>
      <tr>
        <td class="font-mono">107</td>
        <td>State Transfer Tax &amp; County Deed Recording</td>
        <td class="text-right font-mono">$11,099.82</td>
        <td class="text-right font-mono">—</td>
      </tr>
      <tr style="background: #f1f5f9; font-weight: 600;">
        <td class="font-mono">120</td>
        <td>Gross Amount Due From Purchaser</td>
        <td class="text-right font-mono">$725,399.82</td>
        <td class="text-right font-mono">—</td>
      </tr>
      <tr>
        <td class="font-mono">201</td>
        <td>Earnest Money Deposit Held in Escrow</td>
        <td class="text-right font-mono">—</td>
        <td class="text-right font-mono">$90,000.00</td>
      </tr>
      <tr style="font-weight: 700; background: #e0f2fe; color: #0369a1;">
        <td class="font-mono">303</td>
        <td>Cash Due From Borrower at Settlement Closing</td>
        <td class="text-right font-mono">—</td>
        <td class="text-right font-mono" style="font-size: 11pt;">$635,399.82</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>First American Commercial Title Services · HUD-1 Certified Statement</div>
    <div>Page 1 of 1 · Verified Escrow Ledger</div>
  </div>
</body>
</html>
`, "73 Land Aquisition Cash Deal.pdf");

// --------------------------------------------------------------------------
// 5. Budget for 73 Broadway (1).pdf
// --------------------------------------------------------------------------
renderPdf(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">${baseStyles}</head>
<body>
  <div class="header">
    <div>
      <div class="brand">STUDIO ARCHITECTURE &amp; PLANNING PC</div>
      <div class="subbrand">Architectural Master Planning &amp; Cost Estimation</div>
    </div>
    <div class="doc-meta">
      <div>Project: <strong>73 Broadway Mixed-Use</strong></div>
      <div>Date: <strong>April 01, 2025</strong></div>
      <div>Baseline ID: <strong>BASE-73-01</strong></div>
    </div>
  </div>

  <div class="title-block">
    <h1>Schedule of Values &amp; Architectural Baseline Budget</h1>
    <p class="subtitle">Underwritten Line Item Baseline for 73 Broadway, Jersey City, NJ 07306</p>
  </div>

  <div class="card-grid">
    <div class="card">
      <div class="card-label">Total Approved Budget</div>
      <div class="card-value">$1,471,120</div>
    </div>
    <div class="card">
      <div class="card-label">Construction Hard Costs</div>
      <div class="card-value">$1,019,220</div>
    </div>
    <div class="card">
      <div class="card-label">Consultants &amp; Permits</div>
      <div class="card-value">$451,900</div>
    </div>
    <div class="card">
      <div class="card-label">Contingency</div>
      <div class="card-value">9.3%</div>
    </div>
  </div>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 15px 0 8px;">Divisions 01 - 16 Master Construction Baseline</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 70px;">Division</th>
        <th>Trade / Specification Description</th>
        <th class="text-right">Baseline Amount</th>
        <th class="text-right">% Budget</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-mono"><strong>01.00</strong></td>
        <td><strong>PLANS, PERMITS, CONSULTANTS &amp; CLOSING</strong></td>
        <td class="text-right font-mono"><strong>$451,900.00</strong></td>
        <td class="text-right">30.7%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">01.01</td>
        <td style="color: #475569;">Architectural Design &amp; Working Drawings (Draw #1)</td>
        <td class="text-right font-mono">$225,000.00</td>
        <td class="text-right text-muted">15.3%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">01.02</td>
        <td style="color: #475569;">Structural, MEP &amp; Civil Engineering (Draw #1)</td>
        <td class="text-right font-mono">$118,500.00</td>
        <td class="text-right text-muted">8.1%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">01.03</td>
        <td style="color: #475569;">Municipal Plan Check, Zoning &amp; Building Permits (Draw #1)</td>
        <td class="text-right font-mono">$54,500.00</td>
        <td class="text-right text-muted">3.7%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">01.04</td>
        <td style="color: #475569;">Environmental Testing, Civil Survey &amp; Site Closing Admin (Draw #1)</td>
        <td class="text-right font-mono">$50,000.00</td>
        <td class="text-right text-muted">3.4%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">01.05</td>
        <td style="color: #475569;">Construction Administration &amp; Project Management Closeout (Draw #4)</td>
        <td class="text-right font-mono">$3,900.00</td>
        <td class="text-right text-muted">0.3%</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>02.00</strong></td>
        <td><strong>EXCAVATION &amp; SITEWORK</strong></td>
        <td class="text-right font-mono"><strong>$135,300.00</strong></td>
        <td class="text-right">9.2%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">02.01</td>
        <td style="color: #475569;">Site Demolition, Clearing &amp; Earthwork Excavation (Draw #2)</td>
        <td class="text-right font-mono">$85,300.00</td>
        <td class="text-right text-muted">5.8%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">02.02</td>
        <td style="color: #475569;">Deep Foundation, Shoring &amp; Soil Retention (Draw #2)</td>
        <td class="text-right font-mono">$50,000.00</td>
        <td class="text-right text-muted">3.4%</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>03.00</strong></td>
        <td><strong>FRAMING &amp; STRUCTURE / STRUCTURAL STEEL</strong></td>
        <td class="text-right font-mono"><strong>$300,000.00</strong></td>
        <td class="text-right">20.4%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">03.01</td>
        <td style="color: #475569;">Reinforced Concrete Core, Grade Beams &amp; Foundation Slabs (Draw #2)</td>
        <td class="text-right font-mono">$115,000.00</td>
        <td class="text-right text-muted">7.8%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">03.02</td>
        <td style="color: #475569;">Structural Steel Columns, Beams &amp; Moment Connections (Draw #2)</td>
        <td class="text-right font-mono">$69,700.00</td>
        <td class="text-right text-muted">4.7%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">03.03</td>
        <td style="color: #475569;">Cold-Formed Light Gauge Steel Stud Framing &amp; Lateral Bracing (Draw #3)</td>
        <td class="text-right font-mono">$115,300.00</td>
        <td class="text-right text-muted">7.8%</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>04.00</strong></td>
        <td><strong>MECHANICAL, ELECTRICAL &amp; PLUMBING (MEP)</strong></td>
        <td class="text-right font-mono"><strong>$180,000.00</strong></td>
        <td class="text-right">12.2%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">04.01</td>
        <td style="color: #475569;">Plumbing Waste, Vent &amp; Domestic Water Distribution Rough-Ins (Draw #3)</td>
        <td class="text-right font-mono">$65,000.00</td>
        <td class="text-right text-muted">4.4%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">04.02</td>
        <td style="color: #475569;">Electrical Service Main, Conduit &amp; Branch Circuit Rough-Ins (Draw #3)</td>
        <td class="text-right font-mono">$75,000.00</td>
        <td class="text-right text-muted">5.1%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">04.03</td>
        <td style="color: #475569;">HVAC Equipment, Refrigerant Lines &amp; Duct Distribution (Draw #3)</td>
        <td class="text-right font-mono">$40,000.00</td>
        <td class="text-right text-muted">2.7%</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>05.00</strong></td>
        <td><strong>INTERIOR FINISHES, DRYWALL &amp; MILLWORK</strong></td>
        <td class="text-right font-mono"><strong>$220,000.00</strong></td>
        <td class="text-right">15.0%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">05.01</td>
        <td style="color: #475569;">Gypsum Board Drywall, Acoustical Batt &amp; Taping (Draw #4)</td>
        <td class="text-right font-mono">$120,000.00</td>
        <td class="text-right text-muted">8.2%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">05.02</td>
        <td style="color: #475569;">Millwork, Interior Doors, Trim &amp; Custom Cabinetry (Draw #4)</td>
        <td class="text-right font-mono">$100,000.00</td>
        <td class="text-right text-muted">6.8%</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>06.00</strong></td>
        <td><strong>WINDOWS, DOORS &amp; THERMAL ENCLOSURE</strong></td>
        <td class="text-right font-mono"><strong>$46,900.00</strong></td>
        <td class="text-right">3.2%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">06.01</td>
        <td style="color: #475569;">Commercial Storefront Windows, Exterior Glazing &amp; Weather Barrier (Draw #4)</td>
        <td class="text-right font-mono">$46,900.00</td>
        <td class="text-right text-muted">3.2%</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>16.00</strong></td>
        <td><strong>OWNER CONTINGENCY RESERVE (10.0%)</strong></td>
        <td class="text-right font-mono"><strong>$137,020.00</strong></td>
        <td class="text-right">9.3%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">16.01</td>
        <td style="color: #475569;">Contingency Draw Allocation - Trade Field Adjustments (Draw #3)</td>
        <td class="text-right font-mono">$22,700.00</td>
        <td class="text-right text-muted">1.5%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 18px; color: #64748b;">16.02</td>
        <td style="color: #475569;">Remaining Contingency Reserve for Final Punchlist (Draw #4)</td>
        <td class="text-right font-mono">$114,320.00</td>
        <td class="text-right text-muted">7.8%</td>
      </tr>
      <tr style="font-weight: 600; background: #f8fafc; color: #475569; font-size: 10pt;">
        <td colspan="2">Subtotal Construction Hard Costs (Divisions 02–16)</td>
        <td class="text-right font-mono" colspan="2">$1,019,220.00</td>
      </tr>
      <tr style="font-weight: 600; background: #f8fafc; color: #475569; font-size: 10pt;">
        <td colspan="2">Subtotal Consultant Fees &amp; Municipal Permits (Division 01)</td>
        <td class="text-right font-mono" colspan="2">$451,900.00</td>
      </tr>
      <tr style="font-weight: 700; background: #e0f2fe; color: #0369a1; font-size: 11pt;">
        <td colspan="2">Total Approved Project Budget</td>
        <td class="text-right font-mono" colspan="2">$1,471,120.00</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>Studio Architecture &amp; Planning PC · Certified Underwritten Budget Baseline</div>
    <div>Page 1 of 1 · GroundUp Evidence Ingestion Format</div>
  </div>
</body>
</html>
`, "Budget for 73 Broadway (1).pdf");

// --------------------------------------------------------------------------
// 6. combined_draw_project446_draw4301.pdf
// --------------------------------------------------------------------------
renderPdf(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">${baseStyles}</head>
<body>
  <div class="header">
    <div>
      <div class="brand">APEX CAPITAL PARTNERS</div>
      <div class="subbrand">Construction Draw Administration &amp; Disbursement Vault</div>
    </div>
    <div class="doc-meta">
      <div>Loan Number: <strong>LN-2025-446</strong></div>
      <div>Draw Number: <strong>15 (Final Draw)</strong></div>
      <div>Date: <strong>October 21, 2025</strong></div>
    </div>
  </div>

  <div class="title-block">
    <h1>Construction Draw Request Form &amp; Final Closeout Package</h1>
    <p class="subtitle">Borrower: Vance Development Holdings LLC · Property: 392 1st Street, Jersey City, NJ 07302</p>
  </div>

  <div class="card-grid">
    <div class="card">
      <div class="card-label">Draw Number</div>
      <div class="card-value">#15</div>
    </div>
    <div class="card">
      <div class="card-label">Requested Total</div>
      <div class="card-value">$23,750</div>
    </div>
    <div class="card">
      <div class="card-label">Approved Total</div>
      <div class="card-value" style="color: #16a34a;">$23,750</div>
    </div>
    <div class="card">
      <div class="card-label">Borrower Equity</div>
      <div class="card-value">$0.00</div>
    </div>
  </div>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 15px 0 8px;">Final Draw Line Item Verification Schedule</h2>
  <table>
    <thead>
      <tr>
        <th>Item #</th>
        <th>Scope Description</th>
        <th class="text-right">Scheduled Value</th>
        <th class="text-right">Previously Drawn</th>
        <th class="text-right">Draw #15 Net Due</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>15.01</td>
        <td>Final Interior Punch List &amp; Paint Touch-up</td>
        <td class="text-right font-mono">$10,000.00</td>
        <td class="text-right font-mono">$0.00</td>
        <td class="text-right font-mono">$10,000.00</td>
      </tr>
      <tr>
        <td>15.02</td>
        <td>Municipal Certificate of Occupancy Final Sign-off</td>
        <td class="text-right font-mono">$8,750.00</td>
        <td class="text-right font-mono">$0.00</td>
        <td class="text-right font-mono">$8,750.00</td>
      </tr>
      <tr>
        <td>15.03</td>
        <td>Final General Contractor Retainage Release</td>
        <td class="text-right font-mono">$5,000.00</td>
        <td class="text-right font-mono">$0.00</td>
        <td class="text-right font-mono">$5,000.00</td>
      </tr>
      <tr style="font-weight: 700; background: #f8fafc;">
        <td colspan="4">Total Approved Final Disbursement</td>
        <td class="text-right font-mono" style="color: #16a34a; font-size: 11pt;">$23,750.00</td>
      </tr>
    </tbody>
  </table>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 15px 0 8px;">Certification &amp; Final Lien Waiver Release</h2>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 9pt; line-height: 1.6;">
    <p style="margin: 0 0 6px 0;">
      The undersigned General Contractor certifies that all labor, materials, equipment, and services provided for the construction of 392 1st Street have been paid in full or will be immediately paid from the proceeds of Draw #15. Unconditional Final Lien Waivers from all principal subcontractors are attached hereto.
    </p>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px;">
      <div>
        <strong>Apex Construction Services LLC</strong><br>
        <span style="color: #64748b;">General Contractor Authorization</span>
      </div>
      <div class="stamp-box" style="margin: 0; width: 180px; padding: 8px;">
        <div style="font-size: 8pt; font-weight: 700; color: #16a34a;">LENDER AUDIT APPROVED</div>
        <div style="font-size: 9pt; font-weight: 700;">OCTOBER 21, 2025</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>Apex Capital Partners · Loan Administration · Draw Disbursement Package 4301</div>
    <div>Page 1 of 1 · Certified Final Draw Record</div>
  </div>
</body>
</html>
`, "combined_draw_project446_draw4301.pdf");

fs.copyFileSync(
  path.join(outputDir, "161 Woodlawn Ave.xlsx.pdf"),
  path.join(outputDir, "161 Woodlawn Ave - Underwriting Summary.pdf")
);
fs.copyFileSync(
  path.join(outputDir, "combined_draw_project446_draw4301.pdf"),
  path.join(outputDir, "392 1st Street - Final Draw Package #15.pdf")
);

console.log("All PDF documents (including project-scoped Underwriting & Draw packages) successfully generated!");

