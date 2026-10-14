import type { DrawLine } from "@/lib/types";

export const DRAW_REQUEST_FORM_ITEMS: DrawLine[] = [
  {
    id: "draw-req-1",
    draw_id: "draw-current",
    budget_line_id: "line-mech-wh",
    budget_line_name: "MECHANICAL - Water Heater(s)",
    budget_line_code: "4.04",
    budgeted_amount: "400000",   // $4,000.00
    requested_amount: "400000",  // $4,000.00
    recommended_amount: "400000",
    approved_amount: "400000",   // $4,000.00
    funded_amount: "400000",
    evidence_status: "VERIFIED",
    lender_notes: "Water heaters installation & pressure testing certified",
  },
  {
    id: "draw-req-2",
    draw_id: "draw-current",
    budget_line_id: "line-int-app",
    budget_line_name: "INTERIOR - Appliances",
    budget_line_code: "5.02",
    budgeted_amount: "1500000",  // $15,000.00
    requested_amount: "1500000", // $15,000.00
    recommended_amount: "1500000",
    approved_amount: "1500000",  // $15,000.00
    funded_amount: "1500000",
    evidence_status: "VERIFIED",
    lender_notes: "Kitchen & utility appliance package delivered and installed",
  },
  {
    id: "draw-req-3",
    draw_id: "draw-current",
    budget_line_id: "line-int-bv",
    budget_line_name: "INTERIOR - Bath Vanities",
    budget_line_code: "5.06",
    budgeted_amount: "300000",   // $3,000.00
    requested_amount: "150000",  // $1,500.00
    recommended_amount: "150000",
    approved_amount: "150000",   // $1,500.00
    funded_amount: "150000",
    evidence_status: "VERIFIED",
    lender_notes: "Primary & guest bath vanities 50% progress draw",
  },
  {
    id: "draw-req-4",
    draw_id: "draw-current",
    budget_line_id: "line-int-hm",
    budget_line_name: "INTERIOR - Hardware and Mirrors",
    budget_line_code: "5.09",
    budgeted_amount: "50000",    // $500.00
    requested_amount: "50000",   // $500.00
    recommended_amount: "50000",
    approved_amount: "50000",    // $500.00
    funded_amount: "50000",
    evidence_status: "VERIFIED",
    lender_notes: "Cabinet pulls, towel bars, and vanity mirrors installed",
  },
  {
    id: "draw-req-5",
    draw_id: "draw-current",
    budget_line_id: "line-int-wt",
    budget_line_name: "INTERIOR - Wall Tile/Shower Surround",
    budget_line_code: "5.11",
    budgeted_amount: "600000",   // $6,000.00
    requested_amount: "75000",   // $750.00
    recommended_amount: "75000",
    approved_amount: "75000",    // $750.00
    funded_amount: "75000",
    evidence_status: "VERIFIED",
    lender_notes: "Shower surround tile setting and grouting verified",
  },
  {
    id: "draw-req-6",
    draw_id: "draw-current",
    budget_line_id: "line-int-sd",
    budget_line_name: "INTERIOR - Shower Doors",
    budget_line_code: "5.14",
    budgeted_amount: "750000",   // $7,500.00
    requested_amount: "200000",  // $2,000.00
    recommended_amount: "200000",
    approved_amount: "200000",   // $2,000.00
    funded_amount: "200000",
    evidence_status: "VERIFIED",
    lender_notes: "Frameless glass shower door hardware and panel installation",
  },
  {
    id: "draw-req-7",
    draw_id: "draw-current",
    budget_line_id: "line-int-fc",
    budget_line_name: "INTERIOR - Final Clean-up",
    budget_line_code: "5.18",
    budgeted_amount: "250000",   // $2,500.00
    requested_amount: "250000",  // $2,500.00
    recommended_amount: "0",
    approved_amount: "0",        // $0.00
    funded_amount: "0",
    evidence_status: "PENDING_INSPECTION",
    lender_notes: "Holdback pending certificate of occupancy and final walk inspection",
  },
];

export const DRAW_REQUEST_TOTALS = {
  budgetedCents: 3850000,   // $38,500.00
  requestedCents: 2625000,  // $26,250.00
  recommendedCents: 2625000,// $26,250.00
  approvedCents: 2375000,   // $23,750.00
  fundedCents: 2375000,     // $23,750.00
};
