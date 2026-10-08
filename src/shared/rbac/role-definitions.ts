import { GroundUpRole } from './types';

export interface UserRoleDefinition {
  id: string;
  name: string;
  role: string;
  roleTitle: string;
  roleDescription: string;
  badgeColor: string;
  accessLevel: string;
  dataShields: string[];
}

export const GROUNDUP_ROLES: Record<string, UserRoleDefinition> = {
  OWNER: {
    id: 'user-owner-1',
    name: 'Hardik Parikh',
    role: 'OWNER',
    roleTitle: 'Project Owner / Developer',
    roleDescription: 'Full control over pro forma economics, draw packets, change orders, and portfolio performance.',
    badgeColor: 'bg-slate-900 text-white',
    accessLevel: 'Full Administrative Authority',
    dataShields: [],
  },
  PROJECT_MANAGER: {
    id: 'user-pm-1',
    name: 'Marcus Vance',
    role: 'PROJECT_MANAGER',
    roleTitle: 'Project Manager',
    roleDescription: 'Field & Schedule operations: milestone progress, inspections, delay attribution, and carrying costs.',
    badgeColor: 'bg-blue-800 text-white',
    accessLevel: 'Field Operations & Milestones',
    dataShields: [
      'Pro Forma Developer Net Margin & Private ROI masked',
      'Bank interest reserve and loan covenants hidden',
      'Equity investor waterfall and private unit pricing hidden',
    ],
  },
  GENERAL_CONTRACTOR: {
    id: 'user-gc-1',
    name: 'Kunal Shah',
    role: 'GENERAL_CONTRACTOR',
    roleTitle: 'General Contractor',
    roleDescription: 'Submits milestone claims with photo proof, logs daily work reports, and submits change order requests.',
    badgeColor: 'bg-teal-800 text-white',
    accessLevel: 'Contractor Claims & Field Logs',
    dataShields: [
      'Developer pro forma profits and private returns shielded',
      'Construction loan facilities and lender covenants hidden',
      'Equity waterfall and other trade subcontractor rates hidden',
    ],
  },
  FINANCE: {
    id: 'user-fin-1',
    name: 'Sarah Jenkins',
    role: 'FINANCE',
    roleTitle: 'Finance Director / CFO',
    roleDescription: 'Financial ledger authority: budget SOV lines, Four Truths reconciliation, contingency, and draw audits.',
    badgeColor: 'bg-emerald-800 text-white',
    accessLevel: 'Financial Controller',
    dataShields: ['Direct contractor field log writing restricted'],
  },
  ACCOUNTANT: {
    id: 'user-acct-1',
    name: 'Elena Rostova',
    role: 'ACCOUNTANT',
    roleTitle: 'Project Accountant',
    roleDescription: 'Invoice ledger management, lien waiver audits, expense recording, and accounting reconciliation.',
    badgeColor: 'bg-cyan-800 text-white',
    accessLevel: 'Accounting Ledger & Audit',
    dataShields: [
      'Project deletion and deal lab underwriting restricted',
      'Contingency reserve reallocation and wire releases restricted',
    ],
  },
  INVESTOR: {
    id: 'user-investor-1',
    name: 'Krutarth Shah',
    role: 'INVESTOR',
    roleTitle: 'Equity Investor / Partner',
    roleDescription: 'Read-only transparency: capital distributions, waterfall returns, unit disposition pipeline, and executive reports.',
    badgeColor: 'bg-purple-800 text-white',
    accessLevel: 'Read-Only Investor Transparency',
    dataShields: [
      'Raw subcontractor invoices and billing disputes shielded',
      'Draw packet preparation and line approvals hidden',
      'Operational field editing strictly prohibited',
    ],
  },
  VIEWER: {
    id: 'user-viewer-1',
    name: 'Morgan Blake',
    role: 'VIEWER',
    roleTitle: 'Read-Only Viewer',
    roleDescription: 'Observer access: project overview dashboard, physical progress timeline, and shared public documents.',
    badgeColor: 'bg-slate-700 text-white',
    accessLevel: 'Read-Only Observer',
    dataShields: [
      'All financial mutations and approvals blocked',
      'Private underwriting and contract editing hidden',
    ],
  },
};
