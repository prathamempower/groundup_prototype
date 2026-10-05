// GroundUp AI — Data Completeness & Readiness Gatekeeper
// Checks that user-provided data fulfills all requirements before live reporting

import { DataChecklistItem, ProjectDataReadiness, UserRole } from '../types';

export function evaluateDataReadiness(
  projectId: string,
  data: {
    loan?: any;
    budgetLines: any[];
    expenses: any[];
    activities: any[];
    draws: any[];
    inspections: any[];
  }
): ProjectDataReadiness {
  const checklist: DataChecklistItem[] = [];

  // 1. Master Budget / Schedule of Values (SOV)
  const hasBudget = (data.budgetLines || []).length > 0;
  checklist.push({
    id: 'check-budget-sov',
    title: 'Master Budget & Schedule of Values (SOV)',
    description: 'Category-level baseline contract allocations',
    required_role: 'CFO',
    is_complete: hasBudget,
    item_count: (data.budgetLines || []).length,
    severity: 'BLOCKING',
    missing_guidance: 'Upload your project budget spreadsheet or key in SOV lines.',
  });

  // 2. Loan Facility & Interest Rate
  const hasLoan = Boolean(data.loan && data.loan.loan_amount > 0 && data.loan.interest_rate > 0);
  checklist.push({
    id: 'check-loan-terms',
    title: 'Construction Loan Facility & APR',
    description: 'Loan amount, interest rate, term, and holdback required for carrying cost math',
    required_role: 'CFO',
    is_complete: hasLoan,
    item_count: hasLoan ? 1 : 0,
    severity: 'BLOCKING',
    missing_guidance: 'Enter loan facility amount and annual interest rate.',
  });

  // 3. Invoices & Expense Ledger
  const hasExpenses = (data.expenses || []).length > 0;
  checklist.push({
    id: 'check-expenses',
    title: 'Invoices & Expense Ledger',
    description: 'Direct contractor invoices with vendor name, amount, date & source reference',
    required_role: 'ACCOUNTANT',
    is_complete: hasExpenses,
    item_count: (data.expenses || []).length,
    severity: 'BLOCKING',
    missing_guidance: 'Upload expense ledger spreadsheet or contractor invoice PDFs.',
  });

  // 4. Project Schedule & Milestone Activities
  const hasSchedule = (data.activities || []).length > 0;
  checklist.push({
    id: 'check-schedule',
    title: 'Project Schedule & Trade Milestones',
    description: 'Planned vs verified physical completion % by trade',
    required_role: 'PM',
    is_complete: hasSchedule,
    item_count: (data.activities || []).length,
    severity: 'BLOCKING',
    missing_guidance: 'Upload schedule spreadsheet or add trade milestone activities.',
  });

  // 5. Draw Package & Lender Disbursement Records
  const hasDraws = (data.draws || []).length > 0;
  checklist.push({
    id: 'check-draws',
    title: 'Draw Package & Lender Responses',
    description: 'Requested vs approved lines and disbursement events for Funding Truth',
    required_role: 'LENDER',
    is_complete: hasDraws,
    item_count: (data.draws || []).length,
    severity: 'OPTIONAL',
    missing_guidance: 'Record initial draw package or historical disbursed draw wires.',
  });

  // Calculate Readiness Score
  const completedCount = checklist.filter((c) => c.is_complete).length;
  const totalCount = checklist.length;
  const readiness_score = Math.round((completedCount / totalCount) * 100);
  const is_ready_for_live_tracking = checklist.filter((c) => c.severity === 'BLOCKING').every((c) => c.is_complete);

  return {
    project_id: projectId,
    readiness_score,
    is_ready_for_live_tracking,
    checklist,
  };
}
