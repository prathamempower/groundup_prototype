const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const outputDir = path.resolve(__dirname, "../public/sample-docs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function buildExpenseWorkbook() {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Total Expenses
  const totalExpRows = [
    ["SR. NO", "Type", "Amount"],
    [1, "Construction Exp", 656154.06],
    [2, "Labour Exp", 73406.50],
    [3, "Accounting & Legal fee", 1750.00],
    [4, "Bank Fee", 581.51],
    [5, "Municipal Exp", 378.00],
    [6, "Misc Exp", 334649.93],
  ];
  const wsTotal = XLSX.utils.aoa_to_sheet(totalExpRows);
  XLSX.utils.book_append_sheet(wb, wsTotal, "Total Expenses");

  // 2. Sheet: Construction Exp
  const constrRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 656154.06],
    [45845, "PO-301", "Apex Structural Steel Supply & Erect", 185000],
    [45859, "PO-302", "Carrier Mechanical & HVAC Equipment", 95000],
    [45890, "PO-303", "Artisan Architectural Woodwork & Millwork", 45000],
    [45910, "PO-304", "Peak Engineering & Structural Testing", 25000],
    [45930, "Inv #HV-2025-01", "Horizon HVAC Rough Installation", 55000],
    [45960, "Inv #HV-2025-02", "Horizon Electrical Conduit & Panels", 65000],
    [45990, "Inv #AC-441", "Apex Framing Supply & Lumbers", 78000],
    [46010, "Inv #104", "Broadway Framing Package Labor Phase 1", 54000],
    [46030, "Inv #109", "Broadway Framing Package Labor Phase 2", 54154.06],
  ];
  const wsConstr = XLSX.utils.aoa_to_sheet(constrRows);
  XLSX.utils.book_append_sheet(wb, wsConstr, "Construction Exp");

  // 3. Sheet: Labour Exp
  const labourRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 73406.50],
    [45846, "Check 1275", "Certified Framing Trade Crew", 25000],
    [45950, "Check 1041", "Mechanical Subcontractor Labor", 28406.50],
    [46062, "Check 1054", "Electrical Rough-in Crew", 20000],
  ];
  const wsLabour = XLSX.utils.aoa_to_sheet(labourRows);
  XLSX.utils.book_append_sheet(wb, wsLabour, "Labour Exp");

  // 4. Sheet: Accounting & Legal fee
  const accRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 1750.00],
    [46092, "Debit", "Institutional Construction Audit CPA", 750],
    [46204, "Debit", "Project Legal & Title Review Counsel", 1000],
  ];
  const wsAcc = XLSX.utils.aoa_to_sheet(accRows);
  XLSX.utils.book_append_sheet(wb, wsAcc, "Accounting & Legal fee");

  // 5. Sheet: Bank Fee
  const bankFeeRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 581.51],
    [45751, "Debit", "Commercial Wire Transfer Fee", 20],
    [45768, "Debit", "Commercial Wire Transfer Fee", 20],
    [45770, "Debit", "Escrow Disbursement Maintenance Fee", 541.51],
  ];
  const wsBankFee = XLSX.utils.aoa_to_sheet(bankFeeRows);
  XLSX.utils.book_append_sheet(wb, wsBankFee, "Bank Fee");

  // 6. Sheet: Municipal Exp
  const muniExpRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 378.00],
    [45841, "Debit", "Municipal Department of Buildings Plan Filing", 126],
    [46071, "Debit", "Municipal Water & Sewer Inspection", 126],
    [46077, "Debit", "Municipal Environmental Sign-off", 126],
  ];
  const wsMuni = XLSX.utils.aoa_to_sheet(muniExpRows);
  XLSX.utils.book_append_sheet(wb, wsMuni, "Municipal Exp");

  // 7. Sheet: Misc Exp
  const miscExpRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 334649.93],
    [45820, "Check 1001", "Jobsite Facilities, Office Trailer & Security", 114649.93],
    [45900, "Debit", "Temporary Site Utilities & Power Hookups", 120000.00],
    [46000, "Wire", "Field Superintendent & General Conditions Carry", 100000.00],
  ];
  const wsMisc = XLSX.utils.aoa_to_sheet(miscExpRows);
  XLSX.utils.book_append_sheet(wb, wsMisc, "Misc Exp");

  return wb;
}

// Generate 73 Broadway - Expense Tracker.xlsx
const wb1 = buildExpenseWorkbook();
const filePath1 = path.join(outputDir, "73 Broadway - Expense Tracker.xlsx");
XLSX.writeFile(wb1, filePath1);
console.log("-> Created:", filePath1);

// Also overwrite 73 Broadway.xlsx so existing links show the exact cleaned sheets
const wb2 = buildExpenseWorkbook();
const filePath2 = path.join(outputDir, "73 Broadway.xlsx");
XLSX.writeFile(wb2, filePath2);
console.log("-> Updated:", filePath2);
