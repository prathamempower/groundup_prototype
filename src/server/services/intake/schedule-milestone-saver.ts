import { db } from '../../db/schema';
import { ScheduleActivity, UserRole, USER_ROLES } from '../../../shared/types';
import { broadcastEvent } from '../../index';
import { recordAuditEvent } from './intake-audit-logger';

export function saveScheduleMilestones(
  projectId: string,
  activities: {
    milestone: string;
    trade: string;
    planned_start: string;
    planned_end: string;
    verified_progress_pct?: number;
    last_verified_source?: 'inspection_result' | 'PM_confirmation' | 'lender_inspection';
  }[],
  actorRole: UserRole = 'PM'
) {
  const actor = USER_ROLES[actorRole];
  db.prepare('DELETE FROM schedule_activities WHERE project_id = ?').run(projectId);

  const createdActs: ScheduleActivity[] = [];
  for (let i = 0; i < activities.length; i++) {
    const a = activities[i];
    const actId = `act-${projectId}-${i + 1}`;
    const act: ScheduleActivity = {
      id: actId,
      project_id: projectId,
      milestone: a.milestone,
      trade: a.trade,
      planned_start: a.planned_start,
      planned_end: a.planned_end,
      verified_progress_pct: a.verified_progress_pct || 0,
      last_verified_source: a.last_verified_source || 'PM_confirmation',
      last_verified_date: new Date().toISOString().split('T')[0],
      entered_by_role: actorRole,
    };

    db.prepare(`
      INSERT INTO schedule_activities (id, project_id, milestone, trade, planned_start, planned_end, verified_progress_pct, last_verified_source, last_verified_date, entered_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      act.id,
      act.project_id,
      act.milestone,
      act.trade,
      act.planned_start,
      act.planned_end,
      act.verified_progress_pct,
      act.last_verified_source,
      act.last_verified_date,
      act.entered_by_role
    );

    createdActs.push(act);
  }

  recordAuditEvent(actorRole, actor.name, 'ScheduleActivity', projectId, 'count', '0', String(activities.length), 'Schedule Intake Submission');
  broadcastEvent({ type: 'SCHEDULE_UPDATED', project_id: projectId });

  return createdActs;
}
