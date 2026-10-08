import { UserRole } from './user-types';

export interface ScheduleActivity {
  id: string;
  project_id: string;
  milestone: string;
  trade: string;
  planned_start: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  verified_progress_pct: number;
  last_verified_source: 'inspection_result' | 'PM_confirmation' | 'lender_inspection';
  last_verified_date: string;
  entered_by_role: UserRole;
}

export interface Inspection {
  id: string;
  project_id: string;
  milestone: string;
  trade: string;
  requested_date: string;
  inspection_date?: string;
  result: 'PASSED' | 'FAILED' | 'PARTIAL_PASS' | 'PENDING';
  inspector_name?: string;
  inspector_agency?: string;
  notes?: string;
}

export interface DailyLogEntry {
  id: string;
  project_id: string;
  date: string;
  gc_name: string;
  weather: string;
  workers_on_site: number;
  trades_active: string[];
  work_completed: string;
  issues_or_delays?: string;
  photos_count: number;
  photo_urls?: string[];
  sub_costs: number;
  gc_markup_pct: number;
  total_billed: number;
}

export interface SitePhotoInspection {
  id: string;
  photo_title: string;
  timestamp: string;
  milestone_tags: Array<{ label: string; status: 'completed' | 'in_progress' | 'not_started' | 'passed' }>;
  image_url: string;
  ai_confidence: number;
  verification_notes?: string;
}

export interface ProjectGanttMilestone {
  id: string;
  name: string;
  day_start: number;
  day_end: number;
  status: 'Done' | 'Active' | 'Upcoming' | 'At risk';
  code: string;
}
