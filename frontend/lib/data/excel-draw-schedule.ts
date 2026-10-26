export interface ExcelTaskScheduleItem {
  number: string;
  description: string;
  scheduledValueCents: number;
  changeOrdersCents: number;
  draws: Record<number, number>; // draw number -> cents
}

export interface ExcelDrawColumn {
  drawNumber: number;
  date: string;
  hasOnsiteInspection: boolean;
  notes?: string;
}

export const EXCEL_DRAW_COLUMNS: ExcelDrawColumn[] = [
  { drawNumber: 1, date: "01/12/26", hasOnsiteInspection: true, notes: "Site Mobilization & Engineering Stamped Plans" },
  { drawNumber: 2, date: "03/04/26", hasOnsiteInspection: true, notes: "Foundation Footings & Structural Steel Core" },
  { drawNumber: 3, date: "05/19/26", hasOnsiteInspection: true, notes: "Rough MEP Utilities & Framing Progress" },
  { drawNumber: 4, date: "10/18/26", hasOnsiteInspection: true, notes: "Drywall, Glazing & Enclosure Closeout" },
];

export const EXCEL_DRAW_TASKS: ExcelTaskScheduleItem[] = [
  // --- Draw 1: Pre-Development & Soft Costs (Tasks 1 to 4) = $448,000.00 ---
  {
    number: "01.01",
    description: "Architectural Design & Working Drawings",
    scheduledValueCents: 22500000,
    changeOrdersCents: 0,
    draws: { 1: 22500000 },
  },
  {
    number: "01.02",
    description: "Structural, MEP & Civil Engineering",
    scheduledValueCents: 11850000,
    changeOrdersCents: 0,
    draws: { 1: 11850000 },
  },
  {
    number: "01.03",
    description: "Municipal Plan Check, Zoning & Building Permits",
    scheduledValueCents: 5450000,
    changeOrdersCents: 0,
    draws: { 1: 5450000 },
  },
  {
    number: "01.04",
    description: "Environmental Testing, Civil Survey & Site Closing Admin",
    scheduledValueCents: 5000000,
    changeOrdersCents: 0,
    draws: { 1: 5000000 },
  },

  // --- Draw 2: Sitework, Core & Structural Steel (Tasks 5 to 8) = $320,000.00 ---
  {
    number: "02.01",
    description: "Site Demolition, Clearing & Earthwork Excavation",
    scheduledValueCents: 8530000,
    changeOrdersCents: 0,
    draws: { 2: 8530000 },
  },
  {
    number: "02.02",
    description: "Deep Foundation, Shoring & Soil Retention",
    scheduledValueCents: 5000000,
    changeOrdersCents: 0,
    draws: { 2: 5000000 },
  },
  {
    number: "03.01",
    description: "Reinforced Concrete Core, Grade Beams & Foundation Slabs",
    scheduledValueCents: 11500000,
    changeOrdersCents: 0,
    draws: { 2: 11500000 },
  },
  {
    number: "03.02",
    description: "Structural Steel Columns, Beams & Moment Connections",
    scheduledValueCents: 6970000,
    changeOrdersCents: 0,
    draws: { 2: 6970000 },
  },

  // --- Draw 3: Framing & Mechanical / Electrical / Plumbing Rough-Ins (Tasks 9 to 13) = $318,000.00 ---
  {
    number: "03.03",
    description: "Cold-Formed Light Gauge Steel Stud Framing & Lateral Bracing",
    scheduledValueCents: 11530000,
    changeOrdersCents: 0,
    draws: { 3: 11530000 },
  },
  {
    number: "04.01",
    description: "Plumbing Waste, Vent & Domestic Water Distribution Rough-Ins",
    scheduledValueCents: 6500000,
    changeOrdersCents: 0,
    draws: { 3: 6500000 },
  },
  {
    number: "04.02",
    description: "Electrical Service Main, Conduit & Branch Circuit Rough-Ins",
    scheduledValueCents: 7500000,
    changeOrdersCents: 0,
    draws: { 3: 7500000 },
  },
  {
    number: "04.03",
    description: "HVAC Equipment, Refrigerant Lines & Duct Distribution",
    scheduledValueCents: 4000000,
    changeOrdersCents: 0,
    draws: { 3: 4000000 },
  },
  {
    number: "16.01",
    description: "Contingency Draw Allocation (Trade Field Adjustments)",
    scheduledValueCents: 2270000,
    changeOrdersCents: 0,
    draws: { 3: 2270000 },
  },

  // --- Draw 4: Finishes, Thermal Enclosure & Closeout (Tasks 14 to 18) = $385,120.00 ---
  {
    number: "05.01",
    description: "Gypsum Board Drywall, Acoustical Batt & Taping",
    scheduledValueCents: 12000000,
    changeOrdersCents: 0,
    draws: { 4: 12000000 },
  },
  {
    number: "05.02",
    description: "Millwork, Interior Doors, Trim & Custom Cabinetry",
    scheduledValueCents: 10000000,
    changeOrdersCents: 0,
    draws: { 4: 10000000 },
  },
  {
    number: "06.01",
    description: "Commercial Storefront Windows, Exterior Glazing & Weather Barrier",
    scheduledValueCents: 4690000,
    changeOrdersCents: 0,
    draws: { 4: 4690000 },
  },
  {
    number: "01.05",
    description: "Construction Administration & Project Management Closeout",
    scheduledValueCents: 390000,
    changeOrdersCents: 0,
    draws: { 4: 390000 },
  },
  {
    number: "16.02",
    description: "Remaining Contingency Reserve for Final Punchlist",
    scheduledValueCents: 11432000,
    changeOrdersCents: 0,
    draws: { 4: 11432000 },
  },
];

export function getExcelDrawLines(drawNumber: number, _targetDrawTotalCents?: number) {
  const matching = EXCEL_DRAW_TASKS.filter((t) => (t.draws[drawNumber] || 0) > 0);

  if (matching.length === 0) {
    return [];
  }

  return matching.map((task, idx) => {
    const amountCents = task.draws[drawNumber] || 0;
    const isFunded = drawNumber <= 3;

    return {
      id: `dl-73-${String(drawNumber).padStart(2, "0")}-${idx + 1}`,
      draw_id: `draw-73-${String(drawNumber).padStart(2, "0")}`,
      budget_line_id: `bl-${task.number.replace(".", "-")}`,
      budget_line_name: task.description,
      budget_line_code: task.number,
      scheduled_value_cents: task.scheduledValueCents,
      budgeted_amount: String(task.scheduledValueCents),
      requested_amount: String(amountCents),
      recommended_amount: String(amountCents),
      approved_amount: isFunded ? String(amountCents) : (drawNumber === 4 ? String(amountCents) : "0"),
      funded_amount: isFunded ? String(amountCents) : "0",
      evidence_status: (isFunded ? "VERIFIED" : "PENDING_INSPECTION") as "VERIFIED" | "PENDING_INSPECTION",
      lender_notes: `${task.description} - ${isFunded ? "AIA progress inspection certified & funded" : "Scheduled draw allocation"}`,
    };
  });
}
