import { db } from '../../db/schema';
import { Project, Loan, UserRole, USER_ROLES } from '../../../shared/types';
import { broadcastEvent } from '../../index';
import { recordAuditEvent } from './intake-audit-logger';

export function createProjectWithLoan(
  projectData: {
    name: string;
    address: string;
    gc_name: string;
    lender_name: string;
    units: number;
    square_feet?: number;
    target_budget: number;
    start_date: string;
    expected_completion: string;
    actor_role?: UserRole;
  },
  loanData?: {
    loan_amount: number;
    interest_rate: number;
    term_months: number;
    holdback_amount: number;
  }
): { project: Project; loan?: Loan } {
  const projectId = `proj-${Date.now()}`;
  const actorRole = projectData.actor_role || 'DEVELOPER_OWNER';
  const actor = USER_ROLES[actorRole];

  const project: Project = {
    id: projectId,
    name: projectData.name,
    address: projectData.address,
    gc_name: projectData.gc_name,
    lender_name: projectData.lender_name,
    units: projectData.units,
    square_feet: projectData.square_feet,
    target_budget: projectData.target_budget,
    start_date: projectData.start_date,
    expected_completion: projectData.expected_completion,
    status: 'ACTIVE',
    created_by_user_id: actor.id,
    created_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO projects (id, name, address, gc_name, lender_name, units, square_feet, target_budget, start_date, expected_completion, status, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `).run(
    project.id,
    project.name,
    project.address,
    project.gc_name,
    project.lender_name,
    project.units,
    project.square_feet || null,
    project.target_budget,
    project.start_date,
    project.expected_completion,
    project.created_by_user_id
  );

  let loanObj: Loan | undefined;
  if (loanData && loanData.loan_amount > 0) {
    loanObj = {
      id: `loan-${projectId}`,
      project_id: projectId,
      lender_name: project.lender_name,
      loan_amount: loanData.loan_amount,
      interest_rate: loanData.interest_rate,
      term_months: loanData.term_months,
      holdback_amount: loanData.holdback_amount,
      current_balance: 0,
      closing_date: project.start_date,
      entered_by_role: actorRole,
    };

    db.prepare(`
      INSERT INTO loans (id, project_id, lender_name, loan_amount, interest_rate, term_months, holdback_amount, current_balance, closing_date, entered_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      loanObj.id,
      loanObj.project_id,
      loanObj.lender_name,
      loanObj.loan_amount,
      loanObj.interest_rate,
      loanObj.term_months,
      loanObj.holdback_amount,
      loanObj.current_balance,
      loanObj.closing_date,
      loanObj.entered_by_role
    );
  }

  recordAuditEvent(actorRole, actor.name, 'Project', projectId, 'status', 'NONE', 'ACTIVE', 'Initial Project Creation');
  broadcastEvent({ type: 'PROJECT_CREATED', project_id: projectId });

  return { project, loan: loanObj };
}
