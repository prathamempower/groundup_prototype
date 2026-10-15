export interface ExcelTaskScheduleItem {
  number: string;
  description: string;
  scheduledValueCents: number;
  changeOrdersCents: number;
  draws: Record<number, number>; // draw number -> cents
}

export const EXCEL_DRAW_TASKS: ExcelTaskScheduleItem[] = [
  // --- Division 01: General Requirements ---
  {
    number: "1.01",
    description: "Architectural & Engineering Design",
    scheduledValueCents: 9500000,
    changeOrdersCents: 0,
    draws: { 1: 5500000, 2: 2500000, 8: 1500000 },
  },
  {
    number: "1.02",
    description: "Permitting & Municipal Plan Check",
    scheduledValueCents: 3500000,
    changeOrdersCents: 0,
    draws: { 1: 3500000 },
  },
  {
    number: "1.03",
    description: "Project Management & Site Supervision",
    scheduledValueCents: 13500000,
    changeOrdersCents: 0,
    draws: {
      1: 1500000,
      2: 1500000,
      3: 1500000,
      4: 1500000,
      5: 1500000,
      6: 1500000,
      7: 1500000,
      8: 1500000,
      9: 1500000,
    },
  },
  {
    number: "1.04",
    description: "Insurance, Bonding & Builder's Risk",
    scheduledValueCents: 4500000,
    changeOrdersCents: 0,
    draws: { 1: 3000000, 9: 1500000 },
  },
  {
    number: "1.05",
    description: "Temporary Utilities & Site Power",
    scheduledValueCents: 2500000,
    changeOrdersCents: 0,
    draws: { 1: 1000000, 9: 1500000 },
  },

  // --- Division 02: Site Work & Civil Utilities ---
  {
    number: "2.01",
    description: "Site Clearing & Tree Removal",
    scheduledValueCents: 3000000,
    changeOrdersCents: 0,
    draws: { 1: 2500000, 2: 500000 },
  },
  {
    number: "2.02",
    description: "Site Demolition & Environmental Remediation",
    scheduledValueCents: 6500000,
    changeOrdersCents: 500000,
    draws: { 2: 4500000, 3: 2500000 },
  },
  {
    number: "2.03",
    description: "Earthwork, Excavation & Mass Grading",
    scheduledValueCents: 11000000,
    changeOrdersCents: 850000,
    draws: { 2: 6000000, 3: 5850000 },
  },
  {
    number: "2.04",
    description: "Soil Retention, Shoring & Deep Foundation",
    scheduledValueCents: 7500000,
    changeOrdersCents: 0,
    draws: { 2: 4500000, 3: 3000000 },
  },
  {
    number: "2.05",
    description: "Stormwater Detention & Site Drainage",
    scheduledValueCents: 8500000,
    changeOrdersCents: 0,
    draws: { 3: 4000000, 9: 4500000 },
  },
  {
    number: "2.06",
    description: "Water, Sanitary Sewer & Gas Utilities",
    scheduledValueCents: 9500000,
    changeOrdersCents: 0,
    draws: { 2: 3500000, 3: 3500000, 9: 2500000 },
  },
  {
    number: "2.07",
    description: "Perimeter Security Fencing & Waste Logistics",
    scheduledValueCents: 3500000,
    changeOrdersCents: 0,
    draws: { 1: 1500000, 2: 1500000, 9: 500000 },
  },

  // --- Division 03: Concrete & Foundation ---
  {
    number: "3.01",
    description: "Concrete Footings & Structural Grade Beams",
    scheduledValueCents: 18500000,
    changeOrdersCents: 1200000,
    draws: { 3: 12500000, 4: 7200000 },
  },
  {
    number: "3.02",
    description: "Concrete Slab-on-Grade & Post-Tension Deck",
    scheduledValueCents: 14500000,
    changeOrdersCents: 0,
    draws: { 4: 9000000, 5: 5500000 },
  },
  {
    number: "3.03",
    description: "Exterior Curbs, Gutters & Site Flatwork",
    scheduledValueCents: 5500000,
    changeOrdersCents: 0,
    draws: { 9: 5500000 },
  },

  // --- Division 04 & 05: Structural Framing & Steel ---
  {
    number: "4.01",
    description: "Structural Steel Columns & Moment Frames",
    scheduledValueCents: 16000000,
    changeOrdersCents: 0,
    draws: { 4: 9500000, 5: 6500000 },
  },
  {
    number: "4.02",
    description: "Metal Decking, Stairs & Misc Metals",
    scheduledValueCents: 12500000,
    changeOrdersCents: 0,
    draws: { 4: 6000000, 5: 6500000 },
  },
  {
    number: "4.03",
    description: "Wood Framing, Roof Trusses & Sheathing",
    scheduledValueCents: 24000000,
    changeOrdersCents: 1500000,
    draws: { 4: 7000000, 5: 10000000, 6: 8500000 },
  },

  // --- Division 07: Thermal & Moisture Protection ---
  {
    number: "5.01",
    description: "Waterproofing, Air Barrier & Foundation Drainage",
    scheduledValueCents: 6500000,
    changeOrdersCents: 0,
    draws: { 5: 4000000, 7: 2500000 },
  },
  {
    number: "5.02",
    description: "Commercial TPO Roofing & Flashing Systems",
    scheduledValueCents: 14000000,
    changeOrdersCents: 0,
    draws: { 5: 8000000, 6: 6000000 },
  },
  {
    number: "5.03",
    description: "Exterior Insulation & Stucco Cladding (EIFS)",
    scheduledValueCents: 15500000,
    changeOrdersCents: 0,
    draws: { 6: 9000000, 7: 6500000 },
  },

  // --- Division 08: Openings ---
  {
    number: "6.01",
    description: "Aluminum Storefront & Glazed Window Units",
    scheduledValueCents: 13500000,
    changeOrdersCents: 0,
    draws: { 6: 8500000, 7: 5000000 },
  },
  {
    number: "6.02",
    description: "Commercial Hollow Metal Doors & Hardware",
    scheduledValueCents: 7500000,
    changeOrdersCents: 0,
    draws: { 7: 3500000, 8: 4000000 },
  },

  // --- Division 09: Finishes ---
  {
    number: "7.01",
    description: "Interior Light-Gauge Framing & Drywall",
    scheduledValueCents: 16500000,
    changeOrdersCents: 0,
    draws: { 7: 9500000, 8: 7000000 },
  },
  {
    number: "7.02",
    description: "Flooring, Ceramic Tile & Acoustic Ceilings",
    scheduledValueCents: 11000000,
    changeOrdersCents: 0,
    draws: { 8: 7000000, 9: 4000000 },
  },
  {
    number: "7.03",
    description: "Interior Prime, Finish Paint & Wallcoverings",
    scheduledValueCents: 6000000,
    changeOrdersCents: 0,
    draws: { 8: 4000000, 9: 2000000 },
  },

  // --- Division 15: Mechanical & Plumbing ---
  {
    number: "8.01",
    description: "Sanitary Plumbing, Domestic Water & Gas Piping",
    scheduledValueCents: 17500000,
    changeOrdersCents: 650000,
    draws: { 5: 2500000, 6: 6500000, 7: 5000000, 8: 4150000 },
  },
  {
    number: "8.02",
    description: "HVAC Ductwork Distribution, RTUs & Controls",
    scheduledValueCents: 19500000,
    changeOrdersCents: 0,
    draws: { 6: 7500000, 7: 6500000, 8: 5500000 },
  },
  {
    number: "8.03",
    description: "Fire Suppression Sprinklers & Standpipe System",
    scheduledValueCents: 8500000,
    changeOrdersCents: 0,
    draws: { 6: 4000000, 8: 4500000 },
  },

  // --- Division 16: Electrical & Systems ---
  {
    number: "9.01",
    description: "Electrical Main Distribution, Feeders & Branch Wiring",
    scheduledValueCents: 19000000,
    changeOrdersCents: 700000,
    draws: { 6: 8000000, 7: 6500000, 8: 5200000 },
  },
  {
    number: "9.02",
    description: "LED Lighting Fixtures, Dimming & Emergency Backup",
    scheduledValueCents: 7000000,
    changeOrdersCents: 0,
    draws: { 8: 5000000, 9: 2000000 },
  },
  {
    number: "9.03",
    description: "Life Safety Fire Alarm & Structured Telecom Cabling",
    scheduledValueCents: 5000000,
    changeOrdersCents: 0,
    draws: { 9: 5000000 },
  },

  // --- Division 10: Exterior & Site Civil ---
  {
    number: "10.01",
    description: "Final Grading, Site Landscaping & Irrigation",
    scheduledValueCents: 6500000,
    changeOrdersCents: 0,
    draws: { 9: 6500000 },
  },
  {
    number: "10.02",
    description: "Site Signage, Pavement Striping & Punchlist Closeout",
    scheduledValueCents: 3500000,
    changeOrdersCents: 0,
    draws: { 9: 3500000 },
  },
];

export interface DrawColumnMetadata {
  drawNumber: number;
  date: string;
  hasOnsiteInspection: boolean;
}

export const EXCEL_DRAW_COLUMNS: DrawColumnMetadata[] = [
  { drawNumber: 1, date: "08/19/2024", hasOnsiteInspection: false },
  { drawNumber: 2, date: "10/01/2024", hasOnsiteInspection: true },
  { drawNumber: 3, date: "10/30/2024", hasOnsiteInspection: true },
  { drawNumber: 4, date: "11/29/2024", hasOnsiteInspection: true },
  { drawNumber: 5, date: "01/29/2025", hasOnsiteInspection: true },
  { drawNumber: 6, date: "03/06/2025", hasOnsiteInspection: true },
  { drawNumber: 7, date: "03/11/2025", hasOnsiteInspection: true },
  { drawNumber: 8, date: "03/27/2025", hasOnsiteInspection: true },
  { drawNumber: 9, date: "04/29/2025", hasOnsiteInspection: true },
];

/**
 * Returns line items for a given draw number based on the Excel schedule.
 * If targetDrawTotalCents is provided, scales lines proportionally so total matches exactly.
 */
export function getExcelDrawLines(
  drawNumber: number,
  targetDrawTotalCents?: number
) {
  // Direct matching items from the schedule
  const matching = EXCEL_DRAW_TASKS.filter((t) => (t.draws[drawNumber] || 0) > 0);

  if (matching.length === 0) {
    const fallbackTasks = EXCEL_DRAW_TASKS.slice(0, 4);
    return fallbackTasks.map((task, idx) => {
      const cents = targetDrawTotalCents
        ? Math.round(targetDrawTotalCents / fallbackTasks.length)
        : 1500000;
      return {
        id: `line-${drawNumber}-${idx + 1}`,
        draw_id: `draw-fallback-${drawNumber}`,
        budget_line_id: `b-line-${task.number}`,
        budget_line_name: task.description,
        budget_line_code: task.number,
        scheduled_value_cents: task.scheduledValueCents,
        budgeted_amount: String(task.scheduledValueCents),
        requested_amount: String(cents),
        recommended_amount: String(cents),
        approved_amount: String(cents),
        funded_amount: drawNumber <= 3 ? String(cents) : "0",
        evidence_status: (drawNumber <= 3 ? "VERIFIED" : "PENDING_INSPECTION") as "VERIFIED" | "PENDING_INSPECTION",
        lender_notes: `${task.description} work inspected & verified`,
      };
    });
  }

  const rawSum = matching.reduce((sum, t) => sum + (t.draws[drawNumber] || 0), 0);

  // If a specific target total is requested, allocate delta proportionally
  const needAdjustment =
    targetDrawTotalCents && targetDrawTotalCents > 0 && targetDrawTotalCents !== rawSum;

  return matching.map((task, idx) => {
    const originalCents = task.draws[drawNumber] || 0;
    const finalCents = needAdjustment
      ? Math.round((originalCents / rawSum) * targetDrawTotalCents)
      : originalCents;

    return {
      id: `line-${drawNumber}-${idx + 1}`,
      draw_id: `draw-fallback-${drawNumber}`,
      budget_line_id: `b-line-${task.number}`,
      budget_line_name: task.description,
      budget_line_code: task.number,
      scheduled_value_cents: task.scheduledValueCents,
      budgeted_amount: String(task.scheduledValueCents),
      requested_amount: String(finalCents),
      recommended_amount: String(finalCents),
      approved_amount: String(finalCents),
      funded_amount: drawNumber <= 3 ? String(finalCents) : "0",
      evidence_status: (drawNumber <= 3 ? "VERIFIED" : "VERIFIED") as "VERIFIED" | "PENDING_INSPECTION",
      lender_notes: `${task.description} inspection verified`,
    };
  });
}
