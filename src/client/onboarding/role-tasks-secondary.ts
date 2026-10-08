import { OnboardingState, SetupTask } from './types';

export function getSecondaryRoleTasks(state: OnboardingState): SetupTask[] {
  const tasks: SetupTask[] = [];

  // 5. FINANCE TASKS
  if (state.role === 'FINANCE') {
    tasks.push({
      id: 'task-fin-draw-template',
      title: 'Initialize Canonical Draw Packet #1 Framework',
      description: 'Configure standard AIA G702/G703 format and confirm bank wire wiring instructions.',
      category: 'FINANCIAL',
      priority: 'HIGH',
      targetScreen: 'cfo-recon',
      estimatedMinutes: 6,
    });

    tasks.push({
      id: 'task-fin-reconciliation-baseline',
      title: 'Verify Spend Truth vs Funding Truth Reconciliation Matrix',
      description: 'Audit initial balance between equity disbursements, unpaid contractor invoices, and lender commitments.',
      category: 'FINANCIAL',
      priority: 'MEDIUM',
      targetScreen: 'cfo-recon',
      estimatedMinutes: 8,
    });
  }

  // 6. ACCOUNTANT TASKS
  if (state.role === 'ACCOUNTANT') {
    tasks.push({
      id: 'task-acct-cost-codes',
      title: `Confirm Cost Code Taxonomy (${state.acct_cost_code_format === 'csi_16' ? 'CSI 16-Division' : 'MasterFormat'})`,
      description: 'Ensure budget line mappings match incoming invoices for automated zero-hallucination allocation.',
      category: 'INTEGRATION',
      priority: 'HIGH',
      targetScreen: 'document-intake',
      estimatedMinutes: 5,
    });

    tasks.push({
      id: 'task-acct-waiver-register',
      title: 'Initialize Subcontractor Lien Waiver Audit Register',
      description: 'Activate strict tracking of conditional and unconditional progress waivers per trade.',
      category: 'DOCUMENTS',
      priority: 'HIGH',
      targetScreen: 'cfo-recon',
      estimatedMinutes: 6,
    });
  }

  // 7. INVESTOR TASKS
  if (state.role === 'INVESTOR') {
    tasks.push({
      id: 'task-investor-verify-commitment',
      title: 'Verify Initial Equity Capital Commitment & Wire Receipt',
      description: 'Review your logged capital account balance and preferred return benchmark.',
      category: 'FINANCIAL',
      priority: 'HIGH',
      targetScreen: 'investor-portal',
      estimatedMinutes: 3,
    });

    tasks.push({
      id: 'task-investor-reporting-cadence',
      title: 'Confirm Monthly Certified Executive Report Subscription',
      description: 'Ensure delivery preferences are active for end-of-month construction progress packages.',
      category: 'ACCESS',
      priority: 'LOW',
      targetScreen: 'investor-portal',
      estimatedMinutes: 2,
    });
  }

  // 8. VIEWER TASKS
  if (state.role === 'VIEWER') {
    tasks.push({
      id: 'task-viewer-access-plans',
      title: 'Access Canonical Project Document Archive',
      description: 'Inspect approved architectural plan sheets, municipal resolutions, and certified draw filings.',
      category: 'DOCUMENTS',
      priority: 'LOW',
      targetScreen: 'documents',
      estimatedMinutes: 3,
    });
  }

  return tasks;
}
