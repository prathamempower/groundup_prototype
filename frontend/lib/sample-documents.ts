export interface PreExistingDocDef {
  id: string;
  filename: string;
  label: string;
  category: "BUDGET_SOV" | "DRAW_PACKET" | "LOAN_AGREEMENT" | "CLOSING_STATEMENT" | "REPORT";
  badge: string;
  sizeText: string;
  description: string;
  recommendedProjectName?: string;
}

export const PRE_EXISTING_DOCUMENTS: PreExistingDocDef[] = [
  {
    id: "woodlawn-budget-xlsx",
    filename: "161 Woodlawn Ave.xlsx",
    label: "161 Woodlawn Ave.xlsx",
    category: "BUDGET_SOV",
    badge: "Budget / SOV",
    sizeText: "116 KB",
    description: "Partner Ratios & Soft Cost Baseline multi-tab financial model",
    recommendedProjectName: "161 Woodlawn Ave",
  },
  {
    id: "broadway-report-pdf",
    filename: "73 Broadway - Report #2.pdf",
    label: "73 Broadway - Report #2.pdf",
    category: "REPORT",
    badge: "Field Inspection",
    sizeText: "2.4 MB",
    description: "Certified field inspection report with retainage & milestone certification",
    recommendedProjectName: "73 Broadway",
  },
  {
    id: "broadway-sov-xlsx",
    filename: "73 Broadway.xlsx",
    label: "73 Broadway.xlsx",
    category: "BUDGET_SOV",
    badge: "Detailed SOV",
    sizeText: "116 KB",
    description: "Multi-tab contractor schedule of values & trades breakdown",
    recommendedProjectName: "73 Broadway",
  },
  {
    id: "aia-form-xlsx",
    filename: "AIA Form (1).xlsx",
    label: "AIA Form (1).xlsx",
    category: "DRAW_PACKET",
    badge: "AIA G702 / G703",
    sizeText: "21 KB",
    description: "Certified contractor application for payment with retainage ledger",
    recommendedProjectName: "161 Woodlawn Ave",
  },
  {
    id: "broadway-loan-pdf",
    filename: "73 Construction Loan.pdf",
    label: "73 Construction Loan.pdf",
    category: "LOAN_AGREEMENT",
    badge: "Loan Facility",
    sizeText: "252 KB",
    description: "Construction facility commitment agreement and reserve terms",
    recommendedProjectName: "73 Broadway",
  },
  {
    id: "broadway-closing-pdf",
    filename: "73 Land Aquisition Cash Deal.pdf",
    label: "73 Land Aquisition Cash Deal.pdf",
    category: "CLOSING_STATEMENT",
    badge: "Closing Statement",
    sizeText: "122 KB",
    description: "Acquisition cash settlement statement & escrow disbursement",
    recommendedProjectName: "73 Broadway",
  },
  {
    id: "amhar-loan-xlsx",
    filename: "Amhar - Loan Report for Project_ 446.xlsx",
    label: "Amhar - Loan Report Project 446.xlsx",
    category: "DRAW_PACKET",
    badge: "Draw Ledger",
    sizeText: "11 KB",
    description: "15-draw detailed disbursement ledger & lender audit reconciliation",
    recommendedProjectName: "Project 446",
  },
  {
    id: "broadway-budget-pdf",
    filename: "Budget for 73 Broadway (1).pdf",
    label: "Budget for 73 Broadway.pdf",
    category: "BUDGET_SOV",
    badge: "Budget Summary",
    sizeText: "65 KB",
    description: "Architectural line item baseline budget & contingency reserve",
    recommendedProjectName: "73 Broadway",
  },
];
