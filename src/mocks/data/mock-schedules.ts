import { ScheduleActivity, Inspection } from '../../types';

export const INITIAL_ACTIVITIES: ScheduleActivity[] = [
  // 73 Broadway Milestones
  { id: 'sa-73-1', project_id: 'proj-73-broadway', milestone: 'Plans & Permits', trade: 'Architecture / Permits', planned_start: '2025-09-01', planned_end: '2025-10-01', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2025-10-01', entered_by_role: 'PM' },
  { id: 'sa-73-2', project_id: 'proj-73-broadway', milestone: 'Foundation & Earthwork', trade: 'Concrete & Masonry', planned_start: '2025-10-01', planned_end: '2025-11-20', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2025-11-20', entered_by_role: 'PM' },
  { id: 'sa-73-3', project_id: 'proj-73-broadway', milestone: 'Framing & Roof Sheathing', trade: 'Carpentry & Framing', planned_start: '2025-11-20', planned_end: '2026-01-30', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-01-30', entered_by_role: 'PM' },
  { id: 'sa-73-4', project_id: 'proj-73-broadway', milestone: 'Plumbing Rough-In', trade: 'Plumbing', planned_start: '2026-02-01', planned_end: '2026-03-15', verified_progress_pct: 0.55, last_verified_source: 'inspection_result', last_verified_date: '2026-03-28', entered_by_role: 'PM' },
  { id: 'sa-73-5', project_id: 'proj-73-broadway', milestone: 'Electrical Rough-In', trade: 'Electrical', planned_start: '2026-02-15', planned_end: '2026-03-30', verified_progress_pct: 0.70, last_verified_source: 'inspection_result', last_verified_date: '2026-04-02', entered_by_role: 'PM' },
  { id: 'sa-73-6', project_id: 'proj-73-broadway', milestone: 'Exterior Envelope & Roofing', trade: 'Exterior', planned_start: '2026-03-01', planned_end: '2026-04-15', verified_progress_pct: 0.85, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-05', entered_by_role: 'PM' },

  // 212 Maple Ave Milestones
  { id: 'sa-212-1', project_id: 'proj-212-maple', milestone: 'Pre-construction', trade: 'Architecture / Permits', planned_start: '2026-02-14', planned_end: '2026-02-22', verified_progress_pct: 1.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-212-2', project_id: 'proj-212-maple', milestone: 'Foundation', trade: 'Concrete & Masonry', planned_start: '2026-02-22', planned_end: '2026-03-06', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-212-3', project_id: 'proj-212-maple', milestone: 'Framing', trade: 'Carpentry & Framing', planned_start: '2026-03-06', planned_end: '2026-03-24', verified_progress_pct: 0.80, last_verified_source: 'inspection_result', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-212-4', project_id: 'proj-212-maple', milestone: 'MEP rough-in', trade: 'Plumbing, Electrical, HVAC', planned_start: '2026-03-24', planned_end: '2026-04-03', verified_progress_pct: 0.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-212-5', project_id: 'proj-212-maple', milestone: 'Drywall + finish', trade: 'Drywall & Painting', planned_start: '2026-04-03', planned_end: '2026-04-13', verified_progress_pct: 0.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-212-6', project_id: 'proj-212-maple', milestone: 'Final + CO', trade: 'General / City Inspection', planned_start: '2026-04-13', planned_end: '2026-04-20', verified_progress_pct: 0.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
];

export const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-73-1',
    project_id: 'proj-73-broadway',
    milestone: 'Foundation & Earthwork',
    trade: 'Concrete',
    requested_date: '2025-11-18',
    inspection_date: '2025-11-20',
    result: 'PASSED',
    inspector_name: 'John Miller',
    inspector_agency: 'City of Hoboken Code Compliance',
    notes: 'Footings and reinforcement certified to plan specifications',
  },
  {
    id: 'insp-73-2',
    project_id: 'proj-73-broadway',
    milestone: 'Framing & Roof Sheathing',
    trade: 'Carpentry',
    requested_date: '2026-01-28',
    inspection_date: '2026-01-30',
    result: 'PASSED',
    inspector_name: 'Sarah Henderson',
    inspector_agency: 'BCB Bank Inspector',
    notes: 'Framing milestone complete and verified at 100%',
  },
  {
    id: 'insp-212-1',
    project_id: 'proj-212-maple',
    milestone: 'Foundation',
    trade: 'Concrete',
    requested_date: '2026-03-04',
    inspection_date: '2026-03-05',
    result: 'PASSED',
    inspector_name: 'Robert Martinez',
    inspector_agency: 'City of Austin Inspections',
    notes: 'Post-tension foundation passed pre-pour inspection',
  },
  {
    id: 'insp-212-2',
    project_id: 'proj-212-maple',
    milestone: 'Framing',
    trade: 'Carpentry',
    requested_date: '2026-04-24',
    inspection_date: '2026-04-25',
    result: 'PASSED',
    inspector_name: 'Sarah Henderson',
    inspector_agency: 'Heritage Bank Inspector',
    notes: 'Framing milestone confirmed at 80%+. Roof trusses set, sheathing complete.',
  },
];
