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

const timelineHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>73 Broadway - Master Construction Schedule & Milestones</title>
  <style>
    @page { 
      size: letter portrait; 
      margin: 15mm 18mm; 
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 0;
      font-size: 10pt;
      line-height: 1.45;
      background: #ffffff;
    }
    .header {
      border-bottom: 2px solid #1e3a5f;
      padding-bottom: 12px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }
    .subbrand {
      font-size: 8.5pt;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .doc-meta {
      text-align: right;
      font-size: 8.5pt;
      color: #475569;
      line-height: 1.4;
    }
    .title-block {
      margin-bottom: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      font-size: 13pt;
      font-weight: 800;
      margin: 0 0 2px 0;
      color: #0f172a;
      letter-spacing: -0.2px;
    }
    .subtitle {
      font-size: 9pt;
      color: #64748b;
      margin: 0;
    }
    .target-badge-box {
      text-align: right;
    }
    .target-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .target-value {
      font-size: 11pt;
      font-weight: 800;
      color: #1e3a5f;
      font-family: monospace;
    }

    /* Table Matching Image 3 */
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #1e3a5f;
      margin-bottom: 16px;
      font-size: 9pt;
    }
    thead th {
      background: #1e3a5f;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 8px 12px;
      font-size: 9pt;
      letter-spacing: 0.2px;
      border: 1px solid #1e3a5f;
    }
    thead th.center {
      text-align: center;
    }
    tbody td {
      padding: 6.5px 12px;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }
    tbody tr:nth-child(even) td {
      background: #fbfbf7;
    }
    tbody tr:nth-child(odd) td {
      background: #ffffff;
    }
    .activity-name {
      font-weight: 600;
      color: #0f172a;
    }
    .activity-code {
      font-family: monospace;
      color: #64748b;
      font-size: 8.5pt;
    }
    .status-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .status-completed {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }
    .status-in-progress {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .status-upcoming {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }
    .status-target {
      background: #e0e7ff;
      color: #4338ca;
      border: 1px solid #c7d2fe;
    }
    .target-date {
      font-weight: 600;
      color: #1e293b;
    }

    /* Footer & Signoffs */
    .signoff-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 16px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    .signoff-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 8pt;
    }
    .signoff-role {
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      font-size: 7.5pt;
      margin-bottom: 4px;
    }
    .signoff-name {
      font-weight: 600;
      color: #0f172a;
    }
    .signoff-date {
      color: #64748b;
      font-size: 7.5pt;
      margin-top: 2px;
    }
    .footer-bar {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">APEX BUILD CORP & HUDSON PEAK</div>
      <div class="subbrand">General Contractor Master Construction Milestone Schedule</div>
    </div>
    <div class="doc-meta">
      <div>Project: <strong>73 Broadway Mixed-Use</strong></div>
      <div>Location: <strong>Jersey City, NJ 07306</strong></div>
      <div>Schedule Version: <strong>Oct 2025 Re-baseline</strong></div>
    </div>
  </div>

  <div class="title-block">
    <div>
      <h1>Construction Milestone Activity Schedule</h1>
      <p class="subtitle">Complete 19-activity critical path and sequence of work schedule</p>
    </div>
    <div class="target-badge-box">
      <div class="target-label">Certificate of Occupancy Target</div>
      <div class="target-value">Dec 15, 2025</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 48%;">Construction Activity</th>
        <th style="width: 14%; text-align: center;">Line Item</th>
        <th style="width: 18%; text-align: center;">Status</th>
        <th style="width: 20%;">Target Date</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="activity-name">Permits & Approvals</td>
        <td style="text-align: center;" class="activity-code">01.03</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Jun 20, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Site Preparation & Environmental</td>
        <td style="text-align: center;" class="activity-code">01.04</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Jun 25, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Demolition & Excavation</td>
        <td style="text-align: center;" class="activity-code">02.01</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Jul 10, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Footings & Deep Foundation</td>
        <td style="text-align: center;" class="activity-code">02.02</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Jul 25, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Foundation Walls</td>
        <td style="text-align: center;" class="activity-code">02.03</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Aug 15, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Waterproofing / Foundation Drainage</td>
        <td style="text-align: center;" class="activity-code">02.04</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Aug 20, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Backfill & Soil Retention</td>
        <td style="text-align: center;" class="activity-code">02.05</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Aug 25, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Under Slab Plumbing</td>
        <td style="text-align: center;" class="activity-code">04.01a</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Aug 22, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Concrete Slab on Grade</td>
        <td style="text-align: center;" class="activity-code">03.01</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Aug 25, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Structural Steel Framing & Columns</td>
        <td style="text-align: center;" class="activity-code">03.02</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Sep 01, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Light Gauge Steel Stud Framing</td>
        <td style="text-align: center;" class="activity-code">03.03</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Sep 20, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Plumbing Waste, Vent & Water Rough-in</td>
        <td style="text-align: center;" class="activity-code">04.01b</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Oct 01, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Electrical Service Main & Rough-ins</td>
        <td style="text-align: center;" class="activity-code">04.02</td>
        <td style="text-align: center;"><span class="status-pill status-completed">Completed</span></td>
        <td class="target-date">Oct 15, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">HVAC Equipment & Duct Distribution</td>
        <td style="text-align: center;" class="activity-code">04.03</td>
        <td style="text-align: center;"><span class="status-pill status-in-progress">In Progress</span></td>
        <td class="target-date">Oct 20, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Roofing & Weather Barrier</td>
        <td style="text-align: center;" class="activity-code">03.04</td>
        <td style="text-align: center;"><span class="status-pill status-in-progress">In Progress</span></td>
        <td class="target-date">Late Oct 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Windows, Doors & Thermal Enclosure</td>
        <td style="text-align: center;" class="activity-code">06.01</td>
        <td style="text-align: center;"><span class="status-pill status-upcoming">Upcoming</span></td>
        <td class="target-date">Nov 01 – Nov 15, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Insulation & Drywall Taping</td>
        <td style="text-align: center;" class="activity-code">05.01</td>
        <td style="text-align: center;"><span class="status-pill status-upcoming">Upcoming</span></td>
        <td class="target-date">Nov 10 – Nov 25, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Interior Finishes, Millwork & Fixtures</td>
        <td style="text-align: center;" class="activity-code">05.02</td>
        <td style="text-align: center;"><span class="status-pill status-upcoming">Upcoming</span></td>
        <td class="target-date">Nov 25 – Dec 05, 2025</td>
      </tr>
      <tr>
        <td class="activity-name">Final Inspections & Certificate of Occupancy</td>
        <td style="text-align: center;" class="activity-code">01.06</td>
        <td style="text-align: center;"><span class="status-pill status-target">Target</span></td>
        <td class="target-date" style="font-weight: 800; color: #1e3a5f;">Dec 15, 2025</td>
      </tr>
    </tbody>
  </table>

  <div class="signoff-grid">
    <div class="signoff-box">
      <div class="signoff-role">General Contractor Sign-off</div>
      <div class="signoff-name">Apex Build Corp — Site Superintendent</div>
      <div class="signoff-date">Certified Date: October 20, 2025</div>
    </div>
    <div class="signoff-box">
      <div class="signoff-role">Architect of Record</div>
      <div class="signoff-name">Studio M Architecture — Project Principal</div>
      <div class="signoff-date">Concurrence Date: October 22, 2025</div>
    </div>
    <div class="signoff-box">
      <div class="signoff-role">Lender Representative</div>
      <div class="signoff-name">First National Bank — Loan Officer</div>
      <div class="signoff-date">Recorded Date: October 25, 2025</div>
    </div>
  </div>

  <div class="footer-bar">
    <div>73 Broadway Mixed-Use Development • Official Master Construction Schedule Exhibit A</div>
    <div>Page 1 of 1</div>
  </div>
</body>
</html>
`;

function renderPdf(html, filename) {
  const safeName = filename.replace(/[^a-zA-Z0-9_-]/g, "_");
  const tempHtml = path.join(tempHtmlDir, `${safeName}.html`);
  const outPdf = path.join(outputDir, filename);

  fs.writeFileSync(tempHtml, html, "utf8");
  const browser = getBrowserCmd();
  const fileUrl = tempHtml.replace(/\\/g, "/");
  const cmd = `${browser} --headless --disable-gpu --no-sandbox --print-to-pdf="${outPdf}" --no-pdf-header-footer "file://${fileUrl}"`;
  execSync(cmd);
  console.log(`-> Generated PDF: ${filename} (${fs.statSync(outPdf).size} bytes)`);
}

// 1. Generate the dedicated Master Schedule PDF
renderPdf(timelineHtml, "73 Broadway - Master Construction Schedule.pdf");

// 2. Also overwrite "73 Broadway - Report #2.pdf" so that if the user views that name, it displays this timeline sheet!
renderPdf(timelineHtml, "73 Broadway - Report #2.pdf");

console.log("All timeline documents generated successfully!");
