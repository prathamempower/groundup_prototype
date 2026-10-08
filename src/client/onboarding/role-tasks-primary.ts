import { OnboardingState, SetupTask } from './types';

export function getPrimaryRoleTasks(state: OnboardingState): SetupTask[] {
  const tasks: SetupTask[] = [];

  // 1. OWNER TASKS
  if (state.role === 'OWNER') {
    const projName = state.owner_project_info?.projectName || 'Primary Project';

    if (state.owner_financing_type === 'debt_equity') {
      const lender = state.owner_lender_details?.lenderName || 'Construction Bank';
      const retainage = state.owner_lender_details?.retainagePct || '10';
      tasks.push({
        id: 'task-link-lender-loan',
        title: `Upload ${lender} Construction Loan Agreement`,
        description: `Attach the executed credit facility agreement to establish loan draw parameters and lock ${retainage}% retainage terms.`,
        category: 'FINANCIAL',
        priority: 'HIGH',
        targetScreen: 'draws',
        estimatedMinutes: 5,
      });
    }

    if (state.owner_gc_contract_model === 'FIXED_PRICE') {
      tasks.push({
        id: 'task-upload-sov',
        title: `Upload Approved Schedule of Values (SOV) for ${projName}`,
        description: 'Provide line-item hard cost breakdown to enable AI automated trade billing verification against budgeted milestones.',
        category: 'DOCUMENTS',
        priority: 'HIGH',
        targetScreen: 'budget',
        estimatedMinutes: 8,
      });
    } else if (state.owner_gc_contract_model === 'DAILY_UPDATES') {
      tasks.push({
        id: 'task-invite-daily-gc',
        title: 'Invite General Contractor to Daily Logs Portal',
        description: 'Dispatch secure portal access for daily manpower logs, delivery slips, and subcontractor receipts.',
        category: 'ACCESS',
        priority: 'HIGH',
        targetScreen: 'settings',
        estimatedMinutes: 3,
      });
    }

    if (state.owner_approval_governance === 'dual_25k') {
      tasks.push({
        id: 'task-configure-dual-sign',
        title: 'Designate Secondary Financial Signing Officer',
        description: 'Invite your CFO or Controller to activate dual-authorization requirements for wires exceeding $25,000.',
        category: 'ACCESS',
        priority: 'MEDIUM',
        targetScreen: 'settings',
        estimatedMinutes: 4,
      });
    }
  }

  // 2. ADMIN TASKS
  if (state.role === 'ADMIN') {
    if (state.admin_erp_integration === 'quickbooks' || state.admin_erp_integration === 'xero') {
      tasks.push({
        id: 'task-connect-erp-api',
        title: `Authorize ${state.admin_erp_integration === 'quickbooks' ? 'QuickBooks Online' : 'Xero'} API Sync`,
        description: 'Grant OAuth token to synchronize chart of accounts, trade vendors, and paid bills in real time.',
        category: 'INTEGRATION',
        priority: 'HIGH',
        targetScreen: 'settings',
        estimatedMinutes: 4,
      });
    }

    if (state.admin_card_spend === 'amex_feed') {
      tasks.push({
        id: 'task-link-amex-feed',
        title: 'Link American Express Corporate Card Feed',
        description: 'Establish direct bank feed connection for continuous job site expense categorization.',
        category: 'INTEGRATION',
        priority: 'HIGH',
        targetScreen: 'settings',
        estimatedMinutes: 5,
      });
    }

    tasks.push({
      id: 'task-dispatch-team-invites',
      title: 'Review and Dispatch Stakeholder Portal Invites',
      description: 'Confirm email permissions for project managers, external GC, and finance controllers.',
      category: 'ACCESS',
      priority: 'MEDIUM',
      targetScreen: 'settings',
      estimatedMinutes: 3,
    });
  }

  // 3. PROJECT MANAGER TASKS
  if (state.role === 'PROJECT_MANAGER') {
    tasks.push({
      id: 'task-baseline-schedule',
      title: 'Verify Physical Milestone Baseline Schedule',
      description: 'Review critical path milestones (Excavation, Framing, MEP Rough, Final CO) and assign planned dates.',
      category: 'CONSTRUCTION',
      priority: 'HIGH',
      targetScreen: 'timeline',
      estimatedMinutes: 10,
    });

    if (state.pm_municipal_authority) {
      tasks.push({
        id: 'task-link-municipal-permits',
        title: `Upload Issued Building Permits (${state.pm_municipal_authority})`,
        description: 'Index permit numbers so passed inspection sign-offs automatically unlock corresponding draw lines.',
        category: 'DOCUMENTS',
        priority: 'MEDIUM',
        targetScreen: 'documents',
        estimatedMinutes: 5,
      });
    }

    if (state.pm_delay_tracking === 'strict_carrying_cost') {
      tasks.push({
        id: 'task-configure-carrying-costs',
        title: 'Confirm Daily Loan Carrying Cost Benchmark',
        description: 'Calibrate loan interest + site overhead daily carrying cost rate for schedule delay attribution.',
        category: 'CONSTRUCTION',
        priority: 'LOW',
        targetScreen: 'timeline',
        estimatedMinutes: 3,
      });
    }
  }

  // 4. GENERAL CONTRACTOR TASKS
  if (state.role === 'GENERAL_CONTRACTOR') {
    if (state.gc_contract_type === 'FIXED_PRICE') {
      tasks.push({
        id: 'task-gc-verify-sov',
        title: 'Review Initial Approved Schedule of Values (SOV)',
        description: 'Confirm scheduled values for your trade divisions prior to filing Payment Application #1.',
        category: 'CONSTRUCTION',
        priority: 'HIGH',
        targetScreen: 'gc-fixed-portal',
        estimatedMinutes: 7,
      });
    } else {
      tasks.push({
        id: 'task-gc-submit-first-log',
        title: 'Submit Initial Daily Manpower & Field Log',
        description: 'Record today’s on-site trade count, equipment hours, and weather conditions.',
        category: 'CONSTRUCTION',
        priority: 'HIGH',
        targetScreen: 'gc-daily-portal',
        estimatedMinutes: 5,
      });
    }

    tasks.push({
      id: 'task-gc-sub-roster',
      title: 'Upload Subcontractor & Vendor Compliance Roster',
      description: 'Register trade subcontractors to enable automated conditional lien waiver collection.',
      category: 'DOCUMENTS',
      priority: 'HIGH',
      targetScreen: 'documents',
      estimatedMinutes: 8,
    });
  }

  return tasks;
}
