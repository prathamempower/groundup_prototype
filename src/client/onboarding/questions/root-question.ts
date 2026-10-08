import { QuestionDefinition } from '../types';

export const ROOT_QUESTIONS: Record<string, QuestionDefinition> = {
  role: {
    id: 'role',
    categoryLabel: 'Identity & Access',
    title: 'What is your operational role on GroundUp?',
    subtitle: 'Your role determines your workspace tools, permission boundaries, and data access shields.',
    type: 'single_select',
    options: [
      {
        value: 'OWNER',
        label: 'Developer / Owner',
        badge: 'Principal Sponsor',
        description: 'Executive sponsor managing project equity, bank loan covenants, change orders, and overall returns.',
        iconName: 'Building2',
      },
      {
        value: 'PROJECT_MANAGER',
        label: 'Project Manager',
        badge: 'Field Operations',
        description: 'Supervises physical job sites, milestone progress %, municipal inspections, and schedule delay attribution.',
        iconName: 'HardHat',
      },
      {
        value: 'GENERAL_CONTRACTOR',
        label: 'General Contractor',
        badge: 'Construction Partner',
        description: 'Submits payment applications against Schedule of Values (SOV) or daily labor/material work logs.',
        iconName: 'Hammer',
      },
      {
        value: 'FINANCE',
        label: 'Finance / CFO',
        badge: 'Capital & Treasury',
        description: 'Directs loan draw packages, contingency absorption, bank wire releases, and cash flow liquidity.',
        iconName: 'DollarSign',
      },
      {
        value: 'ACCOUNTANT',
        label: 'Accountant / Controller',
        badge: 'Ledger & Audit',
        description: 'Codes trade invoices to cost divisions, audits subcontractor lien waivers, and reconciles card feeds.',
        iconName: 'Calculator',
      },
      {
        value: 'INVESTOR',
        label: 'Investor / Capital Partner',
        badge: 'Equity Stakeholder',
        description: 'Monitors deployed equity, loan-to-cost ratios, projected IRR, distribution waterfalls, and progress updates.',
        iconName: 'TrendingUp',
      },
      {
        value: 'VIEWER',
        label: 'Viewer / Advisory',
        badge: 'Read-Only Audit',
        description: 'Audits canonical project documentation, permits, architectural plans, and inspection reports without edit rights.',
        iconName: 'Eye',
      },
    ],
    validate: (state) => ({
      valid: Boolean(state.role),
      error: 'Please select a role to continue.',
    }),
    getNextQuestionId: (state) => {
      switch (state.role) {
        case 'OWNER': return 'owner_mode';
        case 'PROJECT_MANAGER': return 'pm_project_assignment';
        case 'GENERAL_CONTRACTOR': return 'gc_business_profile';
        case 'FINANCE': return 'fin_primary_mandate';
        case 'ACCOUNTANT': return 'acct_focus';
        case 'INVESTOR': return 'investor_profile';
        case 'VIEWER': return 'viewer_affiliation';
        default: return null;
      }
    },
  },
};
