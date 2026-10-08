import { GroundUpRole, UserRole } from './types';

export interface RoleAccessProfile {
  accessLevel: string;
  badge: string;
  description: string;
  dataShields: string[];
}

const baseProfiles: Record<GroundUpRole, RoleAccessProfile> = {
  OWNER: {
    accessLevel: 'Full Administrative Authority',
    badge: 'Owner / Developer',
    description: 'Full unconstrained access to underwriting, portfolio economics, pro forma ROI, loan covenants, and team settings.',
    dataShields: [],
  },
  PROJECT_MANAGER: {
    accessLevel: 'Field & Schedule Operations',
    badge: 'Field Operations',
    description: 'Operational schedule tracking, physical milestone inspections, and delay carrying cost attribution.',
    dataShields: [
      'Pro Forma Developer Net Margin & ROI masked',
      'Loan terms & interest reserve balance hidden',
      'Equity investor waterfall and unit pricing hidden',
    ],
  },
  FINANCE: {
    accessLevel: 'Financial & Ledger Authority',
    badge: 'Financial Controller',
    description: 'Full financial write access, draw preparation, contingency reallocation, and lien waiver audits.',
    dataShields: ['Direct contractor field log writing restricted'],
  },
  ACCOUNTANT: {
    accessLevel: 'Accounting Ledger & Audit',
    badge: 'Project Accountant',
    description: 'Invoice ledger management, lien waiver audits, expense recording, and accounting reconciliation.',
    dataShields: [
      'Project deletion and deal lab underwriting restricted',
      'Contingency reserve reallocation and wire releases restricted',
    ],
  },
  INVESTOR: {
    accessLevel: 'Read-Only Equity Transparency',
    badge: 'Limited Partner',
    description: 'High-level financial health, capital distribution schedule, and monthly certified executive updates.',
    dataShields: [
      'Operational editing strictly barred',
      'Raw subcontractor invoices and billing disputes shielded',
      'Draw packet preparation and line approvals restricted',
    ],
  },
  VIEWER: {
    accessLevel: 'Read-Only Observer',
    badge: 'Viewer',
    description: 'Observer access: project overview dashboard, physical progress timeline, and shared public documents.',
    dataShields: [
      'All financial mutations and approvals blocked',
      'Private underwriting and contract editing hidden',
    ],
  },
};

const gcProfile: RoleAccessProfile = {
  accessLevel: 'Contractor Claims & Field Logs',
  badge: 'General Contractor',
  description: 'Submits milestone claims with photo proof, logs daily work reports, and submits change order requests.',
  dataShields: [
    'Total project pro forma profit and ROI masked',
    'Unit sale pricing and buyer deposits hidden',
    'Lender financing terms and bank covenants hidden',
    'Other subcontractor invoices and rates shielded',
  ],
};

const fullProfiles: Record<string, RoleAccessProfile> = {
  ...baseProfiles,
  GENERAL_CONTRACTOR: gcProfile,
  DEVELOPER_OWNER: baseProfiles.OWNER,
  CFO: baseProfiles.FINANCE,
  PM: baseProfiles.PROJECT_MANAGER,
  GC_FIXED: gcProfile,
  GC_DAILY: gcProfile,
};

export const ROLE_ACCESS_PROFILES: Record<string, RoleAccessProfile> = fullProfiles;
