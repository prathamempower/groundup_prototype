import { SovLineInput, MilestoneInput } from './types';

export const INITIAL_SOV_LINES: SovLineInput[] = [
  { category: 'Demolition & Site Prep', sub_category: 'Site clearing', cost_code: '02-100', amount: 350000 },
  { category: 'Concrete & Foundation', sub_category: 'Post-tension slab', cost_code: '03-300', amount: 1450000 },
  { category: 'Framing & Lumber', sub_category: '4-story wood frame', cost_code: '06-100', amount: 2800000 },
  { category: 'Plumbing', sub_category: 'Rough-in & drain stacks', cost_code: '22-100', amount: 950000 },
  { category: 'Electrical', sub_category: 'Panels & transformers', cost_code: '26-100', amount: 1100000 },
];

export const INITIAL_SCHEDULE_MILESTONES: MilestoneInput[] = [
  { milestone: 'Site Grading & Undergrounds', trade: 'Demolition & Site Prep', planned_start: '2026-01-10', planned_end: '2026-01-25', verified_progress_pct: 1.0 },
  { milestone: 'Foundation & Podium Slab', trade: 'Concrete & Foundation', planned_start: '2026-01-26', planned_end: '2026-03-05', verified_progress_pct: 1.0 },
  { milestone: 'Structural Framing', trade: 'Framing & Lumber', planned_start: '2026-02-15', planned_end: '2026-04-15', verified_progress_pct: 0.50 },
  { milestone: 'Plumbing Rough-In & Stacks', trade: 'Plumbing', planned_start: '2026-02-01', planned_end: '2026-03-10', verified_progress_pct: 0.55 },
];
