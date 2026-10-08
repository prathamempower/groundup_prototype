import { BudgetLineItem, DrawItem, MilestoneItem, AlertItem } from './types';

export const INITIAL_BUDGET_LINES: BudgetLineItem[] = [
  { category: 'Plans & Permits', budget: 45000, spent: 44500, progress: 100, status: 'done' },
  { category: 'Site Work', budget: 78000, spent: 82000, progress: 95, status: 'over' },
  { category: 'Foundation', budget: 95000, spent: 95000, progress: 100, status: 'done' },
  { category: 'Framing', budget: 145000, spent: 142000, progress: 95, status: 'done' },
  { category: 'Rough Plumbing', budget: 68000, spent: 55760, progress: 55, status: 'flag' },
  { category: 'Rough Electrical', budget: 72000, spent: 68400, progress: 80, status: 'ok' },
  { category: 'HVAC', budget: 45000, spent: 12000, progress: 25, status: 'ok' },
  { category: 'Insulation & Drywall', budget: 38000, spent: 0, progress: 0, status: 'upcoming' },
  { category: 'Flooring & Finishes', budget: 125000, spent: 0, progress: 0, status: 'upcoming' },
  { category: 'Exterior & Roofing', budget: 88000, spent: 88000, progress: 100, status: 'done' },
  { category: 'Windows & Doors', budget: 62000, spent: 58000, progress: 100, status: 'done' },
  { category: 'Landscaping', budget: 18000, spent: 0, progress: 0, status: 'upcoming' },
];

export const INITIAL_DRAWS: DrawItem[] = [
  {
    id: 'draw-3', number: 3, revision: 1,
    submitted: 'Oct 1, 2026', status: 'pending',
    requested: 185000, approved: null, disbursed: null,
    notes: 'Draw #3 submitted pending BCB Bank review.',
    lines: [
      { category: 'Rough Electrical', requested: 68400, approved: null, status: 'pending' },
      { category: 'HVAC (partial)', requested: 12000, approved: null, status: 'pending' },
      { category: 'Windows & Doors', requested: 58000, approved: null, status: 'pending' },
      { category: 'Exterior Roofing', requested: 46600, approved: null, status: 'pending' },
    ],
  },
  {
    id: 'draw-2', number: 2, revision: 0,
    submitted: 'Jul 15, 2026', status: 'disbursed',
    requested: 304000, approved: 304000, disbursed: 304000,
    notes: 'Fully approved and disbursed by BCB Community Bank.',
    lines: [
      { category: 'Foundation', requested: 95000, approved: 95000, status: 'disbursed' },
      { category: 'Framing', requested: 142000, approved: 142000, status: 'disbursed' },
      { category: 'Site Work', requested: 67000, approved: 67000, status: 'disbursed' },
    ],
  },
  {
    id: 'draw-1', number: 1, revision: 0,
    submitted: 'May 3, 2026', status: 'disbursed',
    requested: 605000, approved: 605000, disbursed: 605000,
    notes: 'Initial draw — land acquisition + plans.',
    lines: [
      { category: 'Plans & Permits', requested: 44500, approved: 44500, status: 'disbursed' },
      { category: 'Acquisition', requested: 560500, approved: 560500, status: 'disbursed' },
    ],
  },
];

export const INITIAL_MILESTONES: MilestoneItem[] = [
  { name: 'Plans & Permits', planned: 'Sep 1, 2025', actual: 'Sep 15, 2025', delayDays: 14, status: 'done', progress: 100, source: 'Municipal approval' },
  { name: 'Site Clearance', planned: 'Oct 1, 2025', actual: 'Oct 12, 2025', delayDays: 11, status: 'done', progress: 100, source: 'GC confirmation' },
  { name: 'Foundation', planned: 'Nov 1, 2025', actual: 'Nov 3, 2025', delayDays: 2, status: 'done', progress: 100, source: 'Lender inspection' },
  { name: 'Framing', planned: 'Dec 1, 2025', actual: 'Dec 8, 2025', delayDays: 7, status: 'done', progress: 100, source: 'PM confirmation' },
  { name: 'Exterior & Roofing', planned: 'Jan 10, 2026', actual: 'Jan 18, 2026', delayDays: 8, status: 'done', progress: 100, source: 'Lender inspection' },
  { name: 'Windows & Doors', planned: 'Feb 1, 2026', actual: 'Feb 14, 2026', delayDays: 13, status: 'done', progress: 100, source: 'GC confirmation' },
  { name: 'Rough Plumbing', planned: 'Mar 1, 2026', actual: 'Mar 28, 2026', delayDays: 27, status: 'done', progress: 55, source: 'Inspection passed' },
  { name: 'Rough Electrical', planned: 'Mar 15, 2026', actual: null, delayDays: 17, status: 'in-progress', progress: 80, source: 'In progress' },
  { name: 'HVAC Rough-in', planned: 'Apr 1, 2026', actual: null, delayDays: null, status: 'upcoming', progress: 25, source: '—' },
  { name: 'Insulation & Drywall', planned: 'May 1, 2026', actual: null, delayDays: null, status: 'upcoming', progress: 0, source: '—' },
  { name: 'Finishes & Flooring', planned: 'May 20, 2026', actual: null, delayDays: null, status: 'upcoming', progress: 0, source: '—' },
  { name: 'Certificate of Occupancy', planned: 'Jun 15, 2026', actual: null, delayDays: null, status: 'upcoming', progress: 0, source: '—' },
];
