import { UserRole } from '../types';

export interface RoleAccessProfile {
  accessLevel: string;
  badge: string;
  description: string;
  dataShields: string[];
}

export const ROLE_ACCESS_PROFILES: Record<UserRole, RoleAccessProfile> = {
  DEVELOPER_OWNER: {
    accessLevel: 'Full Administrative Authority',
    badge: 'Owner / Root Access',
    description: 'Full unconstrained access to underwriting, portfolio economics, pro forma ROI, loan covenants, and team settings.',
    dataShields: [],
  },
  CFO: {
    accessLevel: 'Financial & Ledger Authority',
    badge: 'Financial Controller',
    description: 'Full financial write access, draw preparation, contingency reallocation, and lien waiver audits.',
    dataShields: ['Deal Lab pre-acquisition underwriting restricted'],
  },
  PM: {
    accessLevel: 'Field & Schedule Operations',
    badge: 'Field Operations',
    description: 'Operational schedule tracking, physical milestone inspections, and delay carrying cost attribution.',
    dataShields: [
      'Pro Forma Developer Net Margin & ROI masked',
      'Loan terms & interest reserve balance hidden',
      'Equity investor waterfall and unit pricing hidden',
    ],
  },
  LENDER: {
    accessLevel: 'Credit & Disbursement Authority',
    badge: 'Bank Loan Officer',
    description: 'Audits draw packages, verifies lien waivers, approves/rejects line items, and authorizes wire releases.',
    dataShields: [
      'Internal developer equity and profit margins hidden',
      'Internal contractor disputes and unapproved change orders hidden',
      'Deal Lab underwriting calculator restricted',
    ],
  },
  GC_FIXED: {
    accessLevel: 'Contractor Milestone Claims',
    badge: 'General Contractor',
    description: 'Submits milestone claims with photo proof and municipal inspection stickers under lump-sum contract.',
    dataShields: [
      'Total project pro forma profit and ROI masked',
      'Unit sale pricing and buyer deposits hidden',
      'Lender financing terms and bank covenants hidden',
      'Other subcontractor invoices and rates shielded',
    ],
  },
  GC_DAILY: {
    accessLevel: 'Cost-Plus Field Reporting',
    badge: 'Open-Book Contractor',
    description: 'Submits daily site logs, worker counts, active trades, and material receipts with contracted 12% markup.',
    dataShields: [
      'Developer pro forma margins and investor waterfall shielded',
      'Land acquisition costs and settlement statements hidden',
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
  ACCOUNTANT: {
    accessLevel: 'Accounting Ledger & Audit',
    badge: 'Project Accountant',
    description: 'Expense ledger maintenance, credit card reconciliation, and lien waiver verification.',
    dataShields: [
      'Project creation, equity waterfall, and lender disbursement restricted',
    ],
  },
};
