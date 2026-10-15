const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const outputDir = path.resolve(__dirname, "../public/sample-docs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("Generating fake & dummy spreadsheets in:", outputDir);

// --------------------------------------------------------------------------
// 1. 161 Woodlawn Ave.xlsx
// --------------------------------------------------------------------------
{
  const wb = XLSX.utils.book_new();

  // Sheet: Budget
  // Citations: row 2 -> Project Name "161 Woodlawn Ave"
  // row 23 -> Contingency Rate "10.0%"
  // row 24 -> Total Original Budget "$1,019,220.00"
  const budgetRows = [
    ["161 Woodlawn Ave - Schedule of Values & Baseline Budget", "", "", "", "", ""],
    ["Project Name", "161 Woodlawn Ave", "", "", "", ""], // Row 2
    ["Cost Code", "Category / Description", "Original Budget", "Approved Revisions", "Committed Amount", "Spent to Date"],
    ["01.00", "Plans, Permits & Municipal Closing", 45100, 0, 45100, 45100],
    ["02.00", "Sitework & Foundation Excavation", 135300, 0, 135300, 135300],
    ["03.00", "Building Structure & Structural Steel", 300000, 45000, 345000, 225000],
    ["04.00", "Mechanical, Electrical & Plumbing (MEP)", 180000, 0, 180000, 95000],
    ["05.00", "Interior Finishes, Drywall & Millwork", 220000, 0, 220000, 0],
    ["06.00", "Thermal & Moisture Protection / Roofing", 46900, 0, 46900, 12000],
    ["07.00", "Doors, Windows & Glazing", 35000, 0, 35000, 0],
    ["08.00", "Flooring & Tile Finishes", 28000, 0, 28000, 0],
    ["09.00", "Kitchen Cabinetry & Appliances", 32000, 0, 32000, 0],
    ["10.00", "Plumbing Fixtures & Trim", 22000, 0, 22000, 0],
    ["11.00", "Electrical Fixtures & Low Voltage", 18000, 0, 18000, 0],
    ["12.00", "Exterior Facade & Masonry", 45000, 0, 45000, 0],
    ["13.00", "Hardscaping & Site Utility Tie-in", 24000, 0, 24000, 0],
    ["14.00", "Testing, Inspection & Special Inspections", 16000, 0, 16000, 8000],
    ["15.00", "General Conditions & Site Supervision", 55000, 0, 55000, 32000],
    ["15.01", "Builder Insurance & Performance Bond", 25000, 0, 25000, 25000],
    ["15.02", "Jobsite Security & Temporary Utilities", 12000, 0, 12000, 6000],
    ["15.03", "Waste Management & Dumpsters", 8000, 0, 8000, 4000],
    ["15.04", "Punch List & Closeout Allowance", 10000, 0, 10000, 0],
    ["Contingency Rate", "10.0%", "Contingency Reserve", 91920, "", ""], // Row 23
    ["Total Original Budget", "$1,019,220.00", 1019220, "", "", ""], // Row 24
  ];
  const wsBudget = XLSX.utils.aoa_to_sheet(budgetRows);
  XLSX.utils.book_append_sheet(wb, wsBudget, "Budget");

  // Sheet: Partners
  // Citation: row 6 -> Sponsor Equity Commitment "$475,000.00"
  const partnersRows = [
    ["Partner Equity Schedule", "", "", "", ""],
    ["Partner Entity", "Role", "Equity Stake %", "Committed Capital", "Funded to Date"],
    ["Marcus Vance", "Managing Sponsor", "50.00%", 237500, 237500],
    ["Elena Rostova", "Co-Sponsor", "25.00%", 118750, 118750],
    ["Apex Equity Partners LLC", "Institutional LP", "25.00%", 118750, 118750],
    ["Sponsor Equity Commitment", "$475,000.00", "100.00%", 475000, 475000], // Row 6
    ["", "", "", "", ""],
    ["Preferred Return Rate", "8.00% Annually", "", "", ""],
    ["Promote Structure", "70/30 post-hurdle", "", "", ""],
  ];
  const wsPartners = XLSX.utils.aoa_to_sheet(partnersRows);
  XLSX.utils.book_append_sheet(wb, wsPartners, "Partners");

  // Sheet: Summary
  // Citation: row 4 -> General Contractor "Apex Construction Services LLC"
  const summaryRows = [
    ["Executive Project Summary", "", "", ""],
    ["Asset Identity", "161 Woodlawn Ave Multi-Family Development", "", ""],
    ["Sponsor Holding", "Vance Development Holdings LLC", "", ""],
    ["General Contractor", "Apex Construction Services LLC", "License #GC-98214", ""], // Row 4
    ["Architect of Record", "Studio Architecture & Planning PC", "", ""],
    ["Construction Loan Commitment", "$2,400,000.00", "Metropolitan Commercial Bank", ""],
    ["Project Term", "18 Months", "Maturity Date", "2026-11-15"],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // Sheet: Bank fees
  const bankFeesRows = [
    ["Date", "Description", "Amount", "", "", "Total", 74.4],
    [45432, "Wire Transfer Fee", 30, "", "Total", 191.6],
    [45460, "Account Analysis Fee", 25],
    [45490, "Wire Transfer Fee", 30],
    [45520, "Wire Transfer Fee", 30],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bankFeesRows), "Bank fees");

  // Sheet: Land acquisition
  const landRows = [
    ["Date", "Description", "Amount", "", "Total", 377367.94],
    [45406, "Acquisition Earnest Deposit", 90000],
    [45430, "Title Escrow Settlement Wire", 287367.94],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(landRows), "Land acquisition");

  // Sheet: Municipality Expenses
  const muniRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 6398.25],
    [45467, "Wire", "Department of Buildings Permit Fee", 4229.5],
    [45480, "ACH", "Municipal Water & Sewer Connection", 1250],
    [45510, "ACH", "Zoning Board Review Fee", 918.75],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(muniRows), "Muncipality Expenses");

  // Sheet: Loan Payment
  const loanRows = [
    ["Date", "Description", "Amount", "", "Total", 152379.49],
    [45674, "Commercial Construction Loan Interest #1", 4500],
    [45705, "Commercial Construction Loan Interest #2", 5200],
    [45735, "Commercial Construction Loan Interest #3", 5800],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(loanRows), "Loan Payment");

  // Sheet: Misc.
  const miscRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 2923.95],
    [45665, "Check 1003", "Jobsite Storage Container Rental", 500],
    [45700, "Debit", "Jobsite Safety Signage & Perimeter", 1200],
    [45720, "Debit", "Temporary Site Power Installation", 1223.95],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(miscRows), "Misc.");

  XLSX.writeFile(wb, path.join(outputDir, "161 Woodlawn Ave.xlsx"));
  console.log("-> 161 Woodlawn Ave.xlsx created");
}

// --------------------------------------------------------------------------
// 2. 73 Broadway.xlsx
// --------------------------------------------------------------------------
{
  const wb = XLSX.utils.book_new();

  // Sheet: Partnership ration & funding
  const partnerRows = [
    ["Partner Name", "Allocation Ratio", "Capital Commitment"],
    ["Marcus Vance", 0.25, 200000],
    ["Elena Rostova", 0.25, 200000],
    ["Apex Equity Capital", 0.25, 200000],
    ["Horizon Development Partners LLC", 0.25, 200000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(partnerRows), "Partnership ration & funding");

  // Sheet: Inner Bank Transfer
  const innerTransferRows = [
    ["Date", "Amount Total"],
    ["", "Operating Account", "Escrow Reserve", "Capital Sweeps", "Capex Reserve"],
    [45791, 50000, -50000, 0, 0],
    [45798, -50000, 50000, 0, 0],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(innerTransferRows), "Inner Bank Transfer");

  // Sheet: Columbia Bank
  const columbiaBankRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", -400000],
    [43957, "Credit", "Lender Construction Advance #1", -100000],
    [46199, "Credit", "Lender Construction Advance #2", -200000],
    [46254, "Credit", "Lender Construction Advance #3", -100000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(columbiaBankRows), "Columbia Bank");

  // Sheet: Total Expenses
  const totalExpRows = [
    ["SR. NO", "Type", "Amount"],
    [1, "Construction Cost", 656154.06],
    [2, "Bank fees", 581.51],
    [3, "Muncipality", 378],
    [4, "Subcontractor Labor", 73406.5],
    [5, "Accounting & Legal", 1750],
    [6, "Land Acquisition", 725399.82],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(totalExpRows), "Total Expenses");

  // Sheet: Construction Exp
  // Matches control-center-origins:
  // PO-301 -> Apex Structural Steel
  // PO-302 -> Carrier Equipment
  // PO-303 -> Artisan Contract
  // PO-304 -> Peak Engineering
  // Inv #HV-2025-01 / 02 -> Horizon Mechanical
  // Inv #AC-441 / Inv #104 / Inv #109 -> Framing
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
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(constrRows), "Construction Exp");

  // Sheet: Labour Exp
  const labourRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 73406.5],
    [45846, "Check 1275", "Certified Framing Trade Crew", 25000],
    [45950, "Check 1041", "Mechanical Subcontractor Labor", 28406.5],
    [46062, "Check 1054", "Electrical Rough-in Crew", 20000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(labourRows), "Labour Exp");

  // Sheet: Accounting & Legal exp
  const accRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 1750],
    [46092, "Debit", "Institutional Construction Audit CPA", 750],
    [46204, "Debit", "Project Legal & Title Review Counsel", 1000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(accRows), "Accounting & Legal exp");

  // Sheet: Bank Fee
  const bankFeeRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 581.51],
    [45751, "Debit", "Commercial Wire Transfer Fee", 20],
    [45768, "Debit", "Commercial Wire Transfer Fee", 20],
    [45770, "Debit", "Escrow Disbursement Maintenance Fee", 541.51],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bankFeeRows), "Bank Fee");

  // Sheet: Muncipality Exp
  const muniExpRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 378],
    [45841, "Debit", "Municipal Department of Buildings Plan Filing", 126],
    [46071, "Debit", "Municipal Water & Sewer Inspection", 126],
    [46077, "Debit", "Municipal Environmental Sign-off", 126],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(muniExpRows), "Muncipality Exp");

  // Sheet: Misc Exp
  const miscExpRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", -150735.16],
    [46059, "Credit", "Contingency Return Deposit", -150735.16],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(miscExpRows), "Misc Exp");

  // Sheet: Land Acquisition
  const landAcqRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 725399.82],
    [45730, "Debit", "Commercial Land Acquisition Deposit", 90000, "DEPOSIT"],
    [45751, "Debit", "Commercial Escrow Closing Wire", 635399.82],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(landAcqRows), "Land Acquisition");

  XLSX.writeFile(wb, path.join(outputDir, "73 Broadway.xlsx"));
  console.log("-> 73 Broadway.xlsx created");
}

// --------------------------------------------------------------------------
// 3. AIA Form (1).xlsx
// --------------------------------------------------------------------------
{
  const wb = XLSX.utils.book_new();

  const page1Rows = [
    ["APPLICATION AND CERTIFICATION FOR PAYMENT", "", "", "", "", "", "", "", "AIA DOCUMENT G702", "", "", "", "", "Page 1 of 2"],
    ["TO OWNER:", "JC Realty Ventures LLC", "", "", "", "PROJECT:", "73 Broadway Mixed-Use", "", "APPLICATION NO:", 2, "", "Distribution to:"],
    ["", "73 Broadway, Jersey City, NJ", "", "", "", "LOCATION:", "Jersey City, NJ", "", "PERIOD TO:", "May 15, 2025", "", "Owner [X]"],
    ["FROM CONTRACTOR:", "Apex Construction Services LLC", "", "", "", "VIA ARCHITECT:", "Studio Architecture PC", "", "PROJECT NOS:", "PRJ-73-01", "", "Architect [X]"],
    ["CONTRACT FOR:", "General Construction & Building Core", "", "", "", "", "", "", "CONTRACT DATE:", "April 01, 2025", "", "Lender [X]"],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["CONTRACTOR'S APPLICATION FOR PAYMENT", "", "", "", "", "", "", "", "", "", "", ""],
    ["Application is made for payment, as shown below, in connection with the Contract.", "", "", "", "", "", "", "", "", "", "", ""],
    ["1. ORIGINAL CONTRACT SUM ................................................", "$1,019,220.00", "", "", "", "", "", "", "", "", "", ""],
    ["2. Net change by Change Orders ..........................................", "$45,000.00", "", "", "", "", "", "", "", "", "", ""],
    ["3. CONTRACT SUM TO DATE (Line 1 +/- 2) .................................", "$1,064,220.00", "", "", "", "", "", "", "", "", "", ""],
    ["4. TOTAL COMPLETED & STORED TO DATE (Column G on G703) ..................", "$452,300.00", "", "", "", "", "", "", "", "", "", ""],
    ["5. RETAINAGE: a. 10.0% of Completed Work ................................", "$45,230.00", "", "", "", "", "", "", "", "", "", ""],
    ["6. TOTAL EARNED LESS RETAINAGE (Line 4 less Line 5 Total) ..............", "$407,070.00", "", "", "", "", "", "", "", "", "", ""],
    ["7. LESS PREVIOUS CERTIFICATES FOR PAYMENT (Line 6 from prior Certificate)", "$215,000.00", "", "", "", "", "", "", "", "", "", ""],
    ["8. CURRENT PAYMENT DUE ..................................................", "$192,070.00", "", "", "", "", "", "", "", "", "", ""],
    ["9. BALANCE TO FINISH, INCLUDING RETAINAGE (Line 3 less Line 6) .........", "$657,150.00", "", "", "", "", "", "", "", "", "", ""],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(page1Rows), "PAGE 1");

  const page2Rows = [
    ["CONTINUATION SHEET", "", "", "", "", "AIA DOCUMENT G703", "", "", "", "PAGE 2 OF 2 PAGES"],
    ["AIA Document G702, APPLICATION AND CERTIFICATION FOR PAYMENT, containing", "", "", "", "", "", "", "", "APPLICATION NO:", 2],
    ["Contractor's signed certification is attached.", "", "", "", "", "", "", "", "APPLICATION DATE:", "May 15, 2025"],
    ["In tabulations below, amounts are stated to the nearest dollar.", "", "", "", "", "", "", "", "PERIOD TO:", "May 15, 2025"],
    ["Item", "Description of Work", "Scheduled Value", "Work Completed: Previous", "Work Completed: This Period", "Materials Stored", "Total Completed & Stored", "% (G/C)", "Balance To Finish", "Retainage (10%)"],
    ["01.00", "Plans, Permits & Municipal Closing", 45100, 45100, 0, 0, 45100, "100%", 0, 4510],
    ["02.00", "Sitework & Foundation Excavation", 135300, 135300, 0, 0, 135300, "100%", 0, 13530],
    ["03.00", "Building Structure & Structural Steel", 345000, 100000, 125000, 0, 225000, "65.2%", 120000, 22500],
    ["04.00", "Mechanical, Electrical & Plumbing (MEP)", 180000, 15000, 32000, 0, 47000, "26.1%", 133000, 4700],
    ["05.00", "Interior Finishes, Drywall & Millwork", 220000, 0, 0, 0, 0, "0%", 220000, 0],
    ["06.00", "Thermal & Moisture Protection / Roofing", 46900, 0, 0, 0, 0, "0%", 46900, 0],
    ["16.00", "Contingency & General Conditions", 91920, 0, 0, 0, 0, "0%", 91920, 0],
    ["TOTAL", "CERTIFIED SCHEDULE OF VALUES", 1064220, 295400, 157000, 0, 452300, "42.5%", 611920, 45230],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(page2Rows), "PAGE 2");

  XLSX.writeFile(wb, path.join(outputDir, "AIA Form (1).xlsx"));
  console.log("-> AIA Form (1).xlsx created");
}

// --------------------------------------------------------------------------
// 4. Amhar - Loan Report for Project_ 446.xlsx
// --------------------------------------------------------------------------
{
  const wb = XLSX.utils.book_new();

  const reportRows = [
    ["Commercial Construction Loan Facility Report", "", "", "", "", "", "", "", "", "", "", ""],
    ["Borrower", "", "Vance Development Holdings LLC", "Loan #", "", "", "LN-2025-446", "", "", "Lender", "", "Apex Capital Partners"],
    ["", "", "", "", "", "", "", "", "", "Project Type", "", "COMMERCIAL REHAB"],
    ["", "", "", "Property", "", "", "392 1st Street\nJersey City, New Jersey 07302", "", "", "Loan Amount", "", "$824,450.00"],
    ["", "", "", "", "", "", "", "", "", "% Disbursed", "", "97.1%"],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["Draw #", "Request Date", "Requested Amt", "Inspector Status", "Approved Amt", "Retainage Held", "Disbursed Amt", "Cumulative Disbursed", "Balance Remaining"],
    ["Draw 1", "2024-02-15", 55000, "VERIFIED", 55000, 5500, 49500, 49500, 774950],
    ["Draw 2", "2024-03-20", 68000, "VERIFIED", 68000, 6800, 61200, 110700, 713750],
    ["Draw 3", "2024-04-18", 72000, "VERIFIED", 72000, 7200, 64800, 175500, 648950],
    ["Draw 4", "2024-05-22", 64000, "VERIFIED", 64000, 6400, 57600, 233100, 591350],
    ["Draw 5", "2024-06-19", 80000, "VERIFIED", 80000, 8000, 72000, 305100, 519350],
    ["Draw 6", "2024-07-24", 58000, "VERIFIED", 58000, 5800, 52200, 357300, 467150],
    ["Draw 7", "2024-08-20", 62000, "VERIFIED", 62000, 6200, 55800, 413100, 411350],
    ["Draw 8", "2024-09-18", 45000, "VERIFIED", 45000, 4500, 40500, 453600, 370850],
    ["Draw 9", "2024-10-22", 52000, "VERIFIED", 52000, 5200, 46800, 500400, 324050],
    ["Draw 10", "2024-11-20", 48000, "VERIFIED", 48000, 4800, 43200, 543600, 280850],
    ["Draw 11", "2024-12-18", 65000, "VERIFIED", 65000, 6500, 58500, 602100, 222350],
    ["Draw 12", "2025-01-22", 50000, "VERIFIED", 50000, 5000, 45000, 647100, 177350],
    ["Draw 13", "2025-02-19", 54000, "VERIFIED", 54000, 5400, 48600, 695700, 128750],
    ["Draw 14", "2025-03-25", 85000, "VERIFIED", 85000, 8500, 76500, 772200, 52250],
    ["Draw 15", "2025-09-15", 31650, "VERIFIED", 31650, 3165, 28485, 800685, 23765],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(reportRows), "Project - 446");

  XLSX.writeFile(wb, path.join(outputDir, "Amhar - Loan Report for Project_ 446.xlsx"));
  console.log("-> Amhar - Loan Report for Project_ 446.xlsx created");
}

// --------------------------------------------------------------------------
// 5. Builders Capital.xlsx
// --------------------------------------------------------------------------
{
  const wb = XLSX.utils.book_new();

  // Partner Ratios and Funding
  const partnerRows = [
    [800000],
    ["Partner Name", "Allocation Ratio", "Capital Commitment", "Funded Amount", "Return Hurdle"],
    ["Marcus Vance", 0.4, 320000, 320000, "8.0%"],
    ["Elena Rostova", 0.3, 240000, 240000, "8.0%"],
    ["Apex Capital Partners", 0.3, 240000, 240000, "8.0%"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(partnerRows), "Partner Ratios and Funding");

  // Unit Sold
  const unitRows = [
    ["Unit #", "Sell Price", "Closing Cost", "Loan Pay off", "Deposit", "Net Distribution"],
    [1, 856012.37, 61466, 0, 0, 794546.37],
    [2, 800947.05, 49317.15, 0, 79900, 831529.9],
    [3, 1502251.08, 132315.75, 1357084.84, 0, 12850.49],
    [4, 825000, 55000, 0, 82500, 852500],
    [5, 840000, 56000, 0, 84000, 868000],
    [6, 890000, 60000, 0, 89000, 919000],
    [7, 910000, 62000, 0, 91000, 939000],
    [8, 925000, 63000, 0, 92500, 954500],
    [9, 940000, 64000, 0, 94000, 970000],
    [10, 960000, 65000, 0, 96000, 991000],
    [11, 980000, 66000, 0, 98000, 1012000],
    [12, 1150000, 75000, 0, 115000, 1190000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(unitRows), "Unit Sold");

  // Inner Bank Transfer
  const transferRows = [
    ["Date", "Operating Account", "Escrow Account", "Construction Reserve"],
    [45390, 50000, -50000, 0],
    [45393, -25000, 0, 25000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(transferRows), "Inner Bank Transfer");

  // Total Expenses
  const totalExpRows = [
    ["SR. NO", "Type", "Amount", "", 4, "Land Acquisition", 624823.01],
    ["", "Land Cost", 1100000],
    [1, "Construction Cost + Labor", 1228905.28],
    [2, "Bank fees", 890],
    [3, "Municipal Permits", 27538.5],
    [4, "Legal & Accounting", 3500],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(totalExpRows), "Total Expenses");

  // Expense CC
  const ccRows = [
    ["Date", "Receipt", "Description", "Card Member", "Account #", "Amount"],
    [45494, "REC-101", "Commercial Hardware & Fasteners Supply", "OPERATIONS DESK", "-1038", 233.2],
    [45491, "REC-102", "Jobsite Safety Gear & PPE Equipment", "OPERATIONS DESK", "-1038", 140],
    [45488, "REC-103", "Commercial Fuel & Generator Operation", "OPERATIONS DESK", "-1038", 120],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ccRows), "Expense CC");

  // Construction 
  const constrRows = [
    ["Date", "Description", "Mode", "Amount", "Reference", "Total", 1010251.1],
    [45274, "Apex Architectural Design & Engineering Wire", "Debit", 12500],
    [45301, "Commercial Site Prep & Excavation", "Debit", 85000],
    [45310, "Structural Steel Supply Contract", "Debit", 195000],
    [45340, "Concrete Foundation Pour & Inspection", "Debit", 145000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(constrRows), "Construction ");

  // Labour
  const labourRows = [
    ["Date", "Mode", "Description", "Amount", "", "Total", 218654.18],
    [45390, "Check 2004", "Certified Framing Trade Union", 45000],
    [45390, "Check 2006", "Licensed Electrical Apprentices", 38000],
    [45390, "Check 2005", "Master Plumbing Subcontractor", 42000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(labourRows), "Labour");

  // Bank fees
  const feeRows = [
    ["Date", "Description", "Amount", "", "", "Total", 890],
    [45274, "Commercial Wire Transfer Fee", 20],
    [45638, "Commercial Wire Transfer Fee", 20],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(feeRows), "Bank fees");

  // Muncipality Expenses
  const muniRows = [
    ["Date", "Description", "Amount", "", "Total", 27538.5],
    [45362, "Municipal Building Department Inspection Fee", 1125],
    [45379, "Municipal Utility Connection Fee", 5406.84],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(muniRows), "Muncipality Expenses");

  // Land acquisition
  const landRows = [
    ["Date", "Description", "Amount", "", "Total", 624823.01],
    [45237, "Commercial Property Closing Deposit", 110000],
    [45261, "Title & Escrow Settlement Closing Wire", 514823.01],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(landRows), "Land acquisition");

  // Loan Payment
  const loanPaymentRows = [
    ["Date", "Description", "Amount", "", "Total", 200850.02],
    [45372, "Commercial Construction Facility Interest", 6524.97],
    [45378, "Commercial Construction Facility Interest", 5931.79],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(loanPaymentRows), "Loan Payment");

  // Misc.
  const miscRows = [
    ["Date", "Description", "MODE", "Amount", "", "Total", 65.77],
    [45244, "Jobsite Commercial Supplies & Signage", "Debit", 65.77],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(miscRows), "Misc.");

  // Personal Loan
  const personalLoanRows = [
    ["Date", "Mode", "Description", "Amount"],
    [45565, "Credit", "Sponsor Working Capital Contribution", 525000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(personalLoanRows), "Personal Loan");

  // Accounting &legal fee
  const accRows = [
    ["Date", "Description", "Mode", "Amount", "", "TOTAL", 3500],
    [45349, "Institutional Construction Audit CPA", "Debit", 2500],
    [45660, "Project Legal Review Counsel", "Debit", 1000],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(accRows), "Accounting &legal fee");

  XLSX.writeFile(wb, path.join(outputDir, "Builders Capital.xlsx"));
  console.log("-> Builders Capital.xlsx created");
}

console.log("All 5 Excel spreadsheets successfully generated with dummy data!");
