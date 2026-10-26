const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const outputDir = path.resolve(__dirname, "../public/sample-docs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function buildReconciledExpenseWorkbook() {
  const wb = XLSX.utils.book_new();

  // --------------------------------------------------------------------------
  // Tab 1: Total Expenses (Master Summary Sheet)
  // --------------------------------------------------------------------------
  const totalExpRows = [
    ["SR. NO", "Expense Sub-Category", "Approved Budget", "Actual Spend", "Variance", "Reconciliation Status", "Line Items & Trades Included"],
    [1, "Soft Costs & Engineering", 343500.00, 343500.00, 0.00, "100% Cleared (Draw #1)", "01.01 Architectural Design, 01.02 Structural & Civil Engineering"],
    [2, "Municipal & Testing", 104500.00, 104500.00, 0.00, "100% Cleared (Draw #1)", "01.03 Municipal Plan Check & Permits, 01.04 Environmental & Site Survey"],
    [3, "Sitework & Foundation", 250300.00, 250300.00, 0.00, "100% Cleared (Draw #2)", "02.01 Site Demolition/Excavation, 02.02 Deep Shoring/Piling, 03.01 Foundation Slabs"],
    [4, "Structural Framing", 185000.00, 185000.00, 0.00, "100% Cleared (Draws #2–#3)", "03.02 Structural Steel Columns, 03.03 Cold-Formed Steel Stud Framing"],
    [5, "MEP Systems", 180000.00, 175000.00, -5000.00, "Active Draw #3 ($5k retainage)", "04.01 Plumbing Rough-In, 04.02 Electrical Service Main, 04.03 HVAC Equipment"],
    [6, "Contingency & Field Adjustments", 3620.00, 8620.00, 5000.00, "Absorbed in Draw #3", "16.01 Contingency Allocation - Field Pipe Adjustments"],
    ["", "Total Reconciled to Bank Statement", 1066920.00, 1066920.00, 0.00, "100% Verified", "13 Tasks Across Draws #1, #2 & Active Draw #3"],
  ];
  const wsTotal = XLSX.utils.aoa_to_sheet(totalExpRows);
  XLSX.utils.book_append_sheet(wb, wsTotal, "Total Expenses");

  // --------------------------------------------------------------------------
  // Tab 2: Soft Costs & Engineering
  // --------------------------------------------------------------------------
  const softCostsRows = [
    ["Line Item", "Task Description", "Vendor / Counterparty", "Payment Reference", "Target Date", "Actual Date", "Approved Budget", "Actual Spend", "Variance", "Payment Status"],
    ["01.01", "Architectural Design & Working Drawings", "Studio M Architecture", "FedWire #W-4401-A", "May 15, 2025", "May 14, 2025", 225000.00, 225000.00, 0.00, "Paid • Draw #1 Wire Cleared"],
    ["01.02", "Structural, MEP & Civil Engineering", "Apex Engineering Consulting", "FedWire #W-4401-B", "Jun 01, 2025", "Jun 03, 2025", 118500.00, 118500.00, 0.00, "Paid • Draw #1 Wire Cleared"],
    ["Subtotal", "Soft Costs & Engineering Total", "", "", "", "", 343500.00, 343500.00, 0.00, "2 Line Items Verified"],
  ];
  const wsSoft = XLSX.utils.aoa_to_sheet(softCostsRows);
  XLSX.utils.book_append_sheet(wb, wsSoft, "Soft Costs");

  // --------------------------------------------------------------------------
  // Tab 3: Municipal & Permits
  // --------------------------------------------------------------------------
  const muniRows = [
    ["Line Item", "Task Description", "Vendor / Counterparty", "Payment Reference", "Target Date", "Actual Date", "Approved Budget", "Actual Spend", "Variance", "Payment Status"],
    ["01.03", "Municipal Plan Check & Permits", "City of Newburgh Building Dept", "Check #1092", "Jun 20, 2025", "Jun 18, 2025", 54500.00, 54500.00, 0.00, "Paid • Certified Check Cleared"],
    ["01.04", "Environmental Testing & Site Survey", "Hudson Environmental Services", "Check #1094", "Jun 25, 2025", "Jun 24, 2025", 50000.00, 50000.00, 0.00, "Paid • Corporate Check Cleared"],
    ["Subtotal", "Municipal & Testing Total", "", "", "", "", 104500.00, 104500.00, 0.00, "2 Line Items Verified"],
  ];
  const wsMuni = XLSX.utils.aoa_to_sheet(muniRows);
  XLSX.utils.book_append_sheet(wb, wsMuni, "Municipal & Permits");

  // --------------------------------------------------------------------------
  // Tab 4: Sitework & Foundation
  // --------------------------------------------------------------------------
  const siteworkRows = [
    ["Line Item", "Task Description", "Vendor / Counterparty", "Payment Reference", "Target Date", "Actual Date", "Approved Budget", "Actual Spend", "Variance", "Payment Status"],
    ["02.01", "Site Demolition & Earthwork Excavation", "Hudson Valley Earthworks LLC", "FedWire #W-4402-A", "Jul 10, 2025", "Jul 12, 2025", 85300.00, 85300.00, 0.00, "Paid • Draw #2 Wire Cleared"],
    ["02.02", "Deep Foundation, Shoring & Soil Retention", "Tri-State Piling & Shoring", "FedWire #W-4402-B", "Jul 25, 2025", "Jul 28, 2025", 50000.00, 50000.00, 0.00, "Paid • Draw #2 Wire Cleared"],
    ["03.01", "Reinforced Concrete Core & Foundation Slabs", "Apex Concrete Formwork", "FedWire #W-4402-C", "Aug 15, 2025", "Aug 18, 2025", 115000.00, 115000.00, 0.00, "Paid • Draw #2 Wire Cleared"],
    ["Subtotal", "Sitework & Foundation Total", "", "", "", "", 250300.00, 250300.00, 0.00, "3 Line Items Verified"],
  ];
  const wsSitework = XLSX.utils.aoa_to_sheet(siteworkRows);
  XLSX.utils.book_append_sheet(wb, wsSitework, "Sitework & Foundation");

  // --------------------------------------------------------------------------
  // Tab 5: Structural Framing
  // --------------------------------------------------------------------------
  const framingRows = [
    ["Line Item", "Task Description", "Vendor / Counterparty", "Payment Reference", "Target Date", "Actual Date", "Approved Budget", "Actual Spend", "Variance", "Payment Status"],
    ["03.02", "Structural Steel Columns & Moment Connections", "Broadway Structural Framing", "FedWire #W-4402-D", "Sep 01, 2025", "Sep 25, 2025", 69700.00, 69700.00, 0.00, "Paid • Draw #2 Wire Cleared"],
    ["03.03", "Cold-Formed Light Gauge Steel Stud Framing", "Empire Framing Contractors", "FedWire #W-4403-A", "Sep 20, 2025", "Oct 05, 2025", 115300.00, 115300.00, 0.00, "Paid • Draw #3 Wire Cleared"],
    ["Subtotal", "Structural Framing Total", "", "", "", "", 185000.00, 185000.00, 0.00, "2 Line Items Verified"],
  ];
  const wsFraming = XLSX.utils.aoa_to_sheet(framingRows);
  XLSX.utils.book_append_sheet(wb, wsFraming, "Structural Framing");

  // --------------------------------------------------------------------------
  // Tab 6: MEP Systems
  // --------------------------------------------------------------------------
  const mepRows = [
    ["Line Item", "Task Description", "Vendor / Counterparty", "Payment Reference", "Target Date", "Actual Date", "Approved Budget", "Actual Spend", "Variance", "Payment Status"],
    ["04.01", "Plumbing Waste, Vent & Water Distribution", "Metropolitan Mechanical & Plumbing", "FedWire #W-4403-B", "Oct 01, 2025", "Oct 10, 2025", 65000.00, 65000.00, 0.00, "Paid • Draw #3 Wire Cleared"],
    ["04.02", "Electrical Service Main & Conduit Rough-Ins", "Apex Power & Electrical LLC", "FedWire #W-4403-C", "Oct 15, 2025", "Oct 18, 2025", 75000.00, 75000.00, 0.00, "Paid • Draw #3 Wire Cleared"],
    ["04.03", "HVAC Equipment & Duct Distribution", "Carrier Climate Systems", "FedWire #W-4403-D", "Oct 20, 2025", "Oct 24, 2025", 40000.00, 35000.00, -5000.00, "Active Spend • $5k Retainage Held"],
    ["Subtotal", "MEP Systems Total", "", "", "", "", 180000.00, 175000.00, -5000.00, "3 Line Items Verified"],
  ];
  const wsMep = XLSX.utils.aoa_to_sheet(mepRows);
  XLSX.utils.book_append_sheet(wb, wsMep, "MEP Systems");

  // --------------------------------------------------------------------------
  // Tab 7: Contingency & Field Adjustments
  // --------------------------------------------------------------------------
  const contingencyRows = [
    ["Line Item", "Task Description", "Vendor / Counterparty", "Payment Reference", "Target Date", "Actual Date", "Approved Budget", "Actual Spend", "Variance", "Payment Status"],
    ["16.01", "Contingency Allocation - Field Pipe Adjustments", "Trade Contractors Allocation", "Debit #D-8821", "Oct 22, 2025", "Oct 25, 2025", 3620.00, 8620.00, 5000.00, "Paid • Contingency Absorbed"],
    ["Subtotal", "Contingency Total", "", "", "", "", 3620.00, 8620.00, 5000.00, "1 Line Item Verified"],
  ];
  const wsContingency = XLSX.utils.aoa_to_sheet(contingencyRows);
  XLSX.utils.book_append_sheet(wb, wsContingency, "Contingency & Field");

  return wb;
}

// 1. Write 73 Broadway - Expense Tracker.xlsx
const wb1 = buildReconciledExpenseWorkbook();
const filePath1 = path.join(outputDir, "73 Broadway - Expense Tracker.xlsx");
XLSX.writeFile(wb1, filePath1);
console.log("-> Generated:", filePath1);

// 2. Also write 73 Broadway.xlsx so any viewer referencing either file gets the exact reconciled data
const wb2 = buildReconciledExpenseWorkbook();
const filePath2 = path.join(outputDir, "73 Broadway.xlsx");
XLSX.writeFile(wb2, filePath2);
console.log("-> Synchronized:", filePath2);
