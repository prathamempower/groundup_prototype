const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const outputDir = path.resolve(__dirname, "../public/sample-docs");
const tempHtmlDir = "/tmp/dummy_html_docs";

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(tempHtmlDir)) fs.mkdirSync(tempHtmlDir, { recursive: true });

function renderPdf(htmlContent, outputFilename) {
  // Sanitize temp filename to avoid '#' being treated as URL hash fragment
  const safeBaseName = path.basename(outputFilename, ".pdf").replace(/[^a-zA-Z0-9_-]/g, "_");
  const tempHtmlPath = path.join(tempHtmlDir, `${safeBaseName}.html`);
  const outPdfPath = path.join(outputDir, outputFilename);
  fs.writeFileSync(tempHtmlPath, htmlContent, "utf8");

  const cmd = `google-chrome --headless --disable-gpu --no-sandbox --print-to-pdf="${outPdfPath}" --no-pdf-header-footer "file://${tempHtmlPath}"`;
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
      <div class="brand">METROPOLITAN COMMERCIAL BANK</div>
      <div class="subbrand">Commercial Real Estate Lending Division</div>
    </div>
    <div class="doc-meta">
      <div>Facility Commitment: <strong>$1,200,000.00</strong></div>
      <div>Commitment ID: <strong>COL-2025-73B</strong></div>
      <div>Date: <strong>March 25, 2025</strong></div>
    </div>
  </div>

  <div class="title-block">
    <h1>Commercial Real Estate Construction Loan Agreement</h1>
    <p class="subtitle">Borrower: JC Realty Ventures LLC · Project: 73 Broadway, Jersey City, NJ 07306</p>
  </div>

  <div class="card-grid">
    <div class="card">
      <div class="card-label">Loan Facility</div>
      <div class="card-value">$1,200,000</div>
    </div>
    <div class="card">
      <div class="card-label">Initial Advance</div>
      <div class="card-value">$400,000</div>
    </div>
    <div class="card">
      <div class="card-label">Interest Rate</div>
      <div class="card-value">Prime + 1.25%</div>
    </div>
    <div class="card">
      <div class="card-label">Maturity Date</div>
      <div class="card-value" style="font-size: 11pt;">Nov 15, 2026</div>
    </div>
  </div>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 15px 0 8px;">Facility Terms &amp; Reserve Allocations</h2>
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
        <td><strong>Initial Closing Advance</strong></td>
        <td>Disbursed at loan closing for verified soft costs &amp; site mobilization</td>
        <td class="text-right font-mono">$400,000.00</td>
      </tr>
      <tr>
        <td><strong>Construction Progress Holdback Reserve</strong></td>
        <td>Subject to architect inspection &amp; certified AIA G702/G703 payment application</td>
        <td class="text-right font-mono">$650,000.00</td>
      </tr>
      <tr>
        <td><strong>Capitalized Interest Reserve</strong></td>
        <td>Auto-drawn to service monthly construction facility debt payments</td>
        <td class="text-right font-mono">$95,000.00</td>
      </tr>
      <tr>
        <td><strong>Lender Contingency Reserve</strong></td>
        <td>Released only upon certified change order review &amp; lender approval</td>
        <td class="text-right font-mono">$55,000.00</td>
      </tr>
      <tr style="font-weight: 700; background: #f8fafc;">
        <td colspan="2">Total Construction Loan Facility Commitment</td>
        <td class="text-right font-mono">$1,200,000.00</td>
      </tr>
    </tbody>
  </table>

  <h2 style="font-size: 11pt; font-weight: 700; margin: 15px 0 8px;">HUD-1A Settlement Disbursement Summary</h2>
  <table>
    <thead>
      <tr>
        <th>Settlement Charge Description</th>
        <th>Disbursement Recipient</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Loan Origination &amp; Commitment Fee (1.0%)</td>
        <td>Metropolitan Commercial Bank</td>
        <td class="text-right font-mono">$12,000.00</td>
      </tr>
      <tr>
        <td>Lender Legal &amp; Document Review Fee</td>
        <td>First Capital Legal Counsel LLP</td>
        <td class="text-right font-mono">$4,500.00</td>
      </tr>
      <tr>
        <td>Independent Environmental &amp; Appraisal Audit</td>
        <td>Apex Engineering Group LLC</td>
        <td class="text-right font-mono">$3,800.00</td>
      </tr>
      <tr>
        <td>Commercial Title Policy &amp; Escrow Closing</td>
        <td>First American Commercial Title</td>
        <td class="text-right font-mono">$5,400.00</td>
      </tr>
      <tr style="font-weight: 700; background: #f8fafc;">
        <td colspan="2">Total Settlement Charges Deducted from Closing Advance</td>
        <td class="text-right font-mono">$25,700.00</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>Metropolitan Commercial Bank · Commercial Lending Division · Loan #LN-2025-73B</div>
    <div>Page 1 of 1 · Certified Closing Document</div>
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
      <div class="card-label">Total Baseline</div>
      <div class="card-value">$1,019,220</div>
    </div>
    <div class="card">
      <div class="card-label">Sitework</div>
      <div class="card-value">$135,300</div>
    </div>
    <div class="card">
      <div class="card-label">Framing &amp; Steel</div>
      <div class="card-value">$300,000</div>
    </div>
    <div class="card">
      <div class="card-label">Contingency</div>
      <div class="card-value">10.0%</div>
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
        <td class="font-mono">01.00</td>
        <td><strong>PLANS - PERMITS - CLOSING</strong></td>
        <td class="text-right font-mono"><strong>$45,100.00</strong></td>
        <td class="text-right">4.4%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 20px;">01.01</td>
        <td>Consultant Fees: Architect (Invoices Required)</td>
        <td class="text-right font-mono">$22,500.00</td>
        <td class="text-right">2.2%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 20px;">01.02</td>
        <td>Consultant Fees: Structural Engineer</td>
        <td class="text-right font-mono">$12,600.00</td>
        <td class="text-right">1.2%</td>
      </tr>
      <tr>
        <td class="font-mono" style="padding-left: 20px;">01.03</td>
        <td>Municipal Permits &amp; Expediting Fees</td>
        <td class="text-right font-mono">$10,000.00</td>
        <td class="text-right">1.0%</td>
      </tr>
      <tr>
        <td class="font-mono">02.00</td>
        <td><strong>Excavation &amp; Sitework</strong></td>
        <td class="text-right font-mono"><strong>$135,300.00</strong></td>
        <td class="text-right">13.3%</td>
      </tr>
      <tr>
        <td class="font-mono">03.00</td>
        <td><strong>Framing &amp; Structure / Structural Steel</strong></td>
        <td class="text-right font-mono"><strong>$300,000.00</strong></td>
        <td class="text-right">29.4%</td>
      </tr>
      <tr>
        <td class="font-mono">04.00</td>
        <td><strong>Mechanical, Electrical &amp; Plumbing (MEP)</strong></td>
        <td class="text-right font-mono"><strong>$180,000.00</strong></td>
        <td class="text-right">17.7%</td>
      </tr>
      <tr>
        <td class="font-mono">05.00</td>
        <td><strong>Interior Finishes, Drywall &amp; Millwork</strong></td>
        <td class="text-right font-mono"><strong>$220,000.00</strong></td>
        <td class="text-right">21.6%</td>
      </tr>
      <tr>
        <td class="font-mono">06.00</td>
        <td><strong>Windows, Doors &amp; Thermal Enclosure</strong></td>
        <td class="text-right font-mono"><strong>$46,900.00</strong></td>
        <td class="text-right">4.6%</td>
      </tr>
      <tr>
        <td class="font-mono">16.00</td>
        <td><strong>Owner Contingency Reserve (10.0%)</strong></td>
        <td class="text-right font-mono"><strong>$91,920.00</strong></td>
        <td class="text-right">9.0%</td>
      </tr>
      <tr style="font-weight: 700; background: #e0f2fe; color: #0369a1; font-size: 11pt;">
        <td colspan="2">Total Construction Baseline Budget</td>
        <td class="text-right font-mono" colspan="2">$1,019,220.00</td>
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

