import { ScheduleActivity, Inspection } from '../../types';

export const INITIAL_ACTIVITIES: ScheduleActivity[] = [
  // 1. 73 Broadway Milestones
  { id: 'sa-73-1', project_id: 'proj-73-broadway', milestone: 'Plans & Permits', trade: 'Architecture / Permits', planned_start: '2025-09-01', planned_end: '2025-10-01', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2025-10-01', entered_by_role: 'PM' },
  { id: 'sa-73-2', project_id: 'proj-73-broadway', milestone: 'Foundation & Earthwork', trade: 'Concrete & Masonry', planned_start: '2025-10-01', planned_end: '2025-11-20', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2025-11-20', entered_by_role: 'PM' },
  { id: 'sa-73-3', project_id: 'proj-73-broadway', milestone: 'Framing & Roof Sheathing', trade: 'Carpentry & Framing', planned_start: '2025-11-20', planned_end: '2026-01-30', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-01-30', entered_by_role: 'PM' },
  { id: 'sa-73-4', project_id: 'proj-73-broadway', milestone: 'Plumbing Rough-In', trade: 'Plumbing', planned_start: '2026-02-01', planned_end: '2026-03-15', verified_progress_pct: 0.55, last_verified_source: 'inspection_result', last_verified_date: '2026-03-28', entered_by_role: 'PM' },
  { id: 'sa-73-5', project_id: 'proj-73-broadway', milestone: 'Electrical Rough-In', trade: 'Electrical', planned_start: '2026-02-15', planned_end: '2026-03-30', verified_progress_pct: 0.70, last_verified_source: 'inspection_result', last_verified_date: '2026-04-02', entered_by_role: 'PM' },
  { id: 'sa-73-6', project_id: 'proj-73-broadway', milestone: 'Exterior Envelope & Roofing', trade: 'Exterior', planned_start: '2026-03-01', planned_end: '2026-04-15', verified_progress_pct: 0.85, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-05', entered_by_role: 'PM' },

  // 2. 212 Maple Ave Milestones
  { id: 'sa-212-1', project_id: 'proj-212-maple', milestone: 'Pre-construction', trade: 'Architecture / Permits', planned_start: '2026-02-14', planned_end: '2026-02-22', verified_progress_pct: 1.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-212-2', project_id: 'proj-212-maple', milestone: 'Foundation', trade: 'Concrete & Masonry', planned_start: '2026-02-22', planned_end: '2026-03-06', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-212-3', project_id: 'proj-212-maple', milestone: 'Framing', trade: 'Carpentry & Framing', planned_start: '2026-03-06', planned_end: '2026-03-24', verified_progress_pct: 0.80, last_verified_source: 'inspection_result', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-212-4', project_id: 'proj-212-maple', milestone: 'MEP rough-in', trade: 'Plumbing, Electrical, HVAC', planned_start: '2026-03-24', planned_end: '2026-04-03', verified_progress_pct: 0.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-212-5', project_id: 'proj-212-maple', milestone: 'Drywall + finish', trade: 'Drywall & Painting', planned_start: '2026-04-03', planned_end: '2026-04-13', verified_progress_pct: 0.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-212-6', project_id: 'proj-212-maple', milestone: 'Final + CO', trade: 'General / City Inspection', planned_start: '2026-04-13', planned_end: '2026-04-20', verified_progress_pct: 0.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-25', entered_by_role: 'PM' },

  // 3. 161 Woodlawn Ave Milestones
  { id: 'sa-161-1', project_id: 'proj-161-woodlawn', milestone: 'Zoning & Engineering', trade: 'Permits & Planning', planned_start: '2026-01-15', planned_end: '2026-02-01', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-02-01', entered_by_role: 'PM' },
  { id: 'sa-161-2', project_id: 'proj-161-woodlawn', milestone: 'Site Prep & Excavation', trade: 'Earthwork & Demo', planned_start: '2026-02-01', planned_end: '2026-02-20', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-02-20', entered_by_role: 'PM' },
  { id: 'sa-161-3', project_id: 'proj-161-woodlawn', milestone: 'Foundation & Slab Pour', trade: 'Concrete', planned_start: '2026-02-20', planned_end: '2026-03-15', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-03-15', entered_by_role: 'PM' },
  { id: 'sa-161-4', project_id: 'proj-161-woodlawn', milestone: 'Timber & Steel Framing', trade: 'Carpentry', planned_start: '2026-03-15', planned_end: '2026-05-30', verified_progress_pct: 0.65, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-10', entered_by_role: 'PM' },
  { id: 'sa-161-5', project_id: 'proj-161-woodlawn', milestone: 'MEP Rough-in', trade: 'Mechanical & Plumbing', planned_start: '2026-06-01', planned_end: '2026-08-15', verified_progress_pct: 0.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-10', entered_by_role: 'PM' },

  // 4. Oakridge Duplex Milestones
  { id: 'sa-oak-1', project_id: 'proj-oakridge', milestone: 'Land Survey & Civil Permits', trade: 'Planning & Civil', planned_start: '2026-01-05', planned_end: '2026-01-20', verified_progress_pct: 1.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-01-20', entered_by_role: 'PM' },
  { id: 'sa-oak-2', project_id: 'proj-oakridge', milestone: 'Post-Tension Slab', trade: 'Concrete', planned_start: '2026-01-20', planned_end: '2026-02-20', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-02-20', entered_by_role: 'PM' },
  { id: 'sa-oak-3', project_id: 'proj-oakridge', milestone: 'Duplex Framing & Roof', trade: 'Carpentry', planned_start: '2026-02-20', planned_end: '2026-03-25', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-03-25', entered_by_role: 'PM' },
  { id: 'sa-oak-4', project_id: 'proj-oakridge', milestone: 'Exterior Masonry & Siding', trade: 'Exterior', planned_start: '2026-03-25', planned_end: '2026-04-30', verified_progress_pct: 0.75, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-15', entered_by_role: 'PM' },
  { id: 'sa-oak-5', project_id: 'proj-oakridge', milestone: 'Plumbing & Electrical Rough-in', trade: 'Plumbing & Electrical', planned_start: '2026-04-01', planned_end: '2026-05-15', verified_progress_pct: 0.50, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-20', entered_by_role: 'PM' },

  // 5. Elm St 4-Plex Milestones
  { id: 'sa-elm-1', project_id: 'proj-elm-st', milestone: 'Civil Engineering & Permits', trade: 'Civil & Architectural', planned_start: '2026-03-01', planned_end: '2026-03-15', verified_progress_pct: 1.0, last_verified_source: 'PM_confirmation', last_verified_date: '2026-03-15', entered_by_role: 'PM' },
  { id: 'sa-elm-2', project_id: 'proj-elm-st', milestone: 'Commercial Slab & Retaining Wall', trade: 'Concrete', planned_start: '2026-03-15', planned_end: '2026-03-30', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-03-30', entered_by_role: 'PM' },
  { id: 'sa-elm-3', project_id: 'proj-elm-st', milestone: '4-Plex Heavy Framing', trade: 'Structural Framing', planned_start: '2026-03-30', planned_end: '2026-04-20', verified_progress_pct: 0.88, last_verified_source: 'inspection_result', last_verified_date: '2026-04-20', entered_by_role: 'PM' },
  { id: 'sa-elm-4', project_id: 'proj-elm-st', milestone: 'Exterior Envelope & Roofing', trade: 'Roofing & Facade', planned_start: '2026-04-10', planned_end: '2026-05-15', verified_progress_pct: 0.70, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-25', entered_by_role: 'PM' },
  { id: 'sa-elm-5', project_id: 'proj-elm-st', milestone: 'Plumbing & Sprinkler Rough-in', trade: 'Fire Protection & Plumbing', planned_start: '2026-04-20', planned_end: '2026-06-01', verified_progress_pct: 0.25, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-26', entered_by_role: 'PM' },

  // 6. 392 1st Street Milestones (COMPLETED)
  { id: 'sa-392-1', project_id: 'proj-392-1st', milestone: 'Pre-construction & Permits', trade: 'Zoning & Permits', planned_start: '2025-02-01', planned_end: '2025-03-01', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2025-03-01', entered_by_role: 'PM' },
  { id: 'sa-392-2', project_id: 'proj-392-1st', milestone: 'Demolition & Foundation', trade: 'Concrete & Earthwork', planned_start: '2025-03-01', planned_end: '2025-05-15', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2025-05-15', entered_by_role: 'PM' },
  { id: 'sa-392-3', project_id: 'proj-392-1st', milestone: 'Structural Framing & Brick Work', trade: 'Masonry & Steel', planned_start: '2025-05-15', planned_end: '2025-08-30', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2025-08-30', entered_by_role: 'PM' },
  { id: 'sa-392-4', project_id: 'proj-392-1st', milestone: 'MEP Rough-in & Heating', trade: 'Plumbing & Electrical', planned_start: '2025-09-01', planned_end: '2025-11-30', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2025-11-30', entered_by_role: 'PM' },
  { id: 'sa-392-5', project_id: 'proj-392-1st', milestone: 'Luxury Finishes & Millwork', trade: 'Interior Finishes', planned_start: '2025-12-01', planned_end: '2026-02-01', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-02-01', entered_by_role: 'PM' },
  { id: 'sa-392-6', project_id: 'proj-392-1st', milestone: 'Final Inspection & CO', trade: 'General / Municipal', planned_start: '2026-02-01', planned_end: '2026-03-01', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-03-01', entered_by_role: 'PM' },
];

export const INITIAL_INSPECTIONS: Inspection[] = [
  // 1. 73 Broadway Inspections
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

  // 2. 212 Maple Ave Inspections
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
    requested_date: '2026-04-20',
    inspection_date: '2026-04-22',
    result: 'PASSED',
    inspector_name: 'David Vance',
    inspector_agency: 'Heritage Bank Field Inspector',
    notes: 'Wall framing and roof trusses 80% complete, verified for Draw #2',
  },

  // 3. 161 Woodlawn Ave Inspections
  {
    id: 'insp-161-1',
    project_id: 'proj-161-woodlawn',
    milestone: 'Foundation & Slab Pour',
    trade: 'Concrete',
    requested_date: '2026-03-12',
    inspection_date: '2026-03-14',
    result: 'PASSED',
    inspector_name: 'Thomas Wright',
    inspector_agency: 'Village of Ridgewood Construction Code Dept',
    notes: 'Foundation walls and basement slab poured per plan #RWD-2026',
  },
  {
    id: 'insp-161-2',
    project_id: 'proj-161-woodlawn',
    milestone: 'Timber & Steel Framing',
    trade: 'Carpentry',
    requested_date: '2026-04-01',
    inspection_date: '2026-04-03',
    result: 'PASSED',
    inspector_name: 'Michael Chang',
    inspector_agency: 'First Republic Bank Inspection Services',
    notes: 'Structural steel I-beams and floor joist installation verified at 65%',
  },

  // 4. Oakridge Duplex Inspections
  {
    id: 'insp-oak-1',
    project_id: 'proj-oakridge',
    milestone: 'Post-Tension Slab',
    trade: 'Concrete',
    requested_date: '2026-02-16',
    inspection_date: '2026-02-18',
    result: 'PASSED',
    inspector_name: 'Carlos Ruiz',
    inspector_agency: 'City of Round Rock Code Enforcement',
    notes: 'Post-tension cable tensioning passed certification test',
  },
  {
    id: 'insp-oak-2',
    project_id: 'proj-oakridge',
    milestone: 'Duplex Framing & Roof',
    trade: 'Carpentry',
    requested_date: '2026-03-20',
    inspection_date: '2026-03-22',
    result: 'PASSED',
    inspector_name: 'Angela Davis',
    inspector_agency: 'Texas Heritage Credit Union Inspector',
    notes: 'Units A & B framing and windstorm tie-downs fully verified',
  },

  // 5. Elm St 4-Plex Inspections
  {
    id: 'insp-elm-1',
    project_id: 'proj-elm-st',
    milestone: 'Commercial Slab & Retaining Wall',
    trade: 'Concrete',
    requested_date: '2026-03-26',
    inspection_date: '2026-03-28',
    result: 'PASSED',
    inspector_name: 'Fernando Gomez',
    inspector_agency: 'City of San Antonio Development Services',
    notes: 'Commercial 4-plex slab passed structural load inspection',
  },
  {
    id: 'insp-elm-2',
    project_id: 'proj-elm-st',
    milestone: '4-Plex Heavy Framing',
    trade: 'Structural Framing',
    requested_date: '2026-04-16',
    inspection_date: '2026-04-18',
    result: 'PASSED',
    inspector_name: 'Rachel Adams',
    inspector_agency: 'Lone Star Commercial Bank Representative',
    notes: 'Quadplex 2-story framing verified at 88% complete',
  },

  // 6. 392 1st Street Inspections (COMPLETED)
  {
    id: 'insp-392-1',
    project_id: 'proj-392-1st',
    milestone: 'Luxury Finishes & Millwork',
    trade: 'Interior Finishes',
    requested_date: '2026-01-28',
    inspection_date: '2026-01-30',
    result: 'PASSED',
    inspector_name: 'Victor Santos',
    inspector_agency: 'BCB Community Bank Inspector',
    notes: 'All 3 condo units finished to high-end specification',
  },
  {
    id: 'insp-392-2',
    project_id: 'proj-392-1st',
    milestone: 'Final Inspection & CO',
    trade: 'General',
    requested_date: '2026-02-25',
    inspection_date: '2026-02-28',
    result: 'PASSED',
    inspector_name: 'Josephine Kowalski',
    inspector_agency: 'City of Jersey City Building Dept',
    notes: 'Final Certificate of Occupancy (CO) official certificate issued',
  },
];
