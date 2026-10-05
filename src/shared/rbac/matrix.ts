// GroundUp AI — Role Permission Matrix & Screen Authorization
// Implements the Principle of Least Privilege across all 8 user roles

import { UserRole } from '../types';
import { Permission } from './permissions';

export type ActiveNavScreen = 
  | 'portfolio' 
  | 'project-detail' 
  | 'budget' 
  | 'draws' 
  | 'timeline' 
  | 'documents' 
  | 'disposition' 
  | 'deal-lab' 
  | 'alerts' 
  | 'settings' 
  | 'lender-portal' 
  | 'gc-fixed-portal' 
  | 'gc-daily-portal' 
  | 'cfo-recon' 
  | 'investor-portal' 
  | 'document-intake';

// ── Complete Role-Permission Mapping ──────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // 1. Developer / Owner (Executive Authority)
  DEVELOPER_OWNER: [
    'portfolio:view',
    'project:create',
    'project:delete',
    'project:view_overview',
    'project:view_financials',
    'project:settings',
    'deal_lab:access',
    'deal_lab:save_project',
    'budget:view',
    'budget:edit',
    'change_order:create',
    'change_order:approve',
    'contingency:view',
    'contingency:manage',
    'draw:view',
    'draw:create_packet',
    'draw:review_queue',
    'draw:approve_lines',
    'draw:disburse_wire',
    'milestone:view',
    'milestone:log_progress',
    'delay:attribute',
    'field_log:create',
    'milestone_claim:submit',
    'accounting:recon_matrix',
    'waiver:audit_view',
    'waiver:audit_manage',
    'document:view',
    'document:upload',
    'amex_feed:match',
    'unit_sales:view',
    'unit_sales:edit',
    'investor:view_waterfall',
    'investor:download_report',
    'ai_analyst:query',
  ],

  // 2. CFO / Accounting Director
  CFO: [
    'portfolio:view',
    'project:view_overview',
    'project:view_financials',
    'budget:view',
    'budget:edit',
    'change_order:create',
    'change_order:approve',
    'contingency:view',
    'contingency:manage',
    'draw:view',
    'draw:create_packet',
    'milestone:view',
    'accounting:recon_matrix',
    'waiver:audit_view',
    'waiver:audit_manage',
    'document:view',
    'document:upload',
    'amex_feed:match',
    'unit_sales:view',
    'investor:view_waterfall',
    'investor:download_report',
    'ai_analyst:query',
  ],

  // 3. Project Manager (Field / Schedule Operations)
  PM: [
    'project:view_overview',
    'budget:view',
    'milestone:view',
    'milestone:log_progress',
    'delay:attribute',
    'document:view',
    'ai_analyst:query',
  ],

  // 4. Construction Lender (BCB Bank / Loan Officer)
  LENDER: [
    'draw:review_queue',
    'draw:approve_lines',
    'draw:disburse_wire',
    'document:view',
    'waiver:audit_view',
    'ai_analyst:query',
  ],

  // 5. General Contractor — Fixed Lump-Sum Contract
  GC_FIXED: [
    'milestone:view',
    'milestone_claim:submit',
    'change_order:create',
    'ai_analyst:query',
  ],

  // 6. General Contractor — Open-Book / Cost-Plus Contract
  GC_DAILY: [
    'milestone:view',
    'field_log:create',
    'ai_analyst:query',
  ],

  // 7. Equity Investor / Limited Partner
  INVESTOR: [
    'unit_sales:view',
    'investor:view_waterfall',
    'investor:download_report',
    'ai_analyst:query',
  ],

  // 8. Project Accountant
  ACCOUNTANT: [
    'budget:view',
    'draw:view',
    'accounting:recon_matrix',
    'waiver:audit_view',
    'waiver:audit_manage',
    'document:view',
    'amex_feed:match',
    'ai_analyst:query',
  ],
};

// ── Screen Authorization Mapping ──────────────────────────────────────────────
export const ROLE_ALLOWED_SCREENS: Record<UserRole, ActiveNavScreen[]> = {
  DEVELOPER_OWNER: [
    'portfolio',
    'project-detail',
    'budget',
    'draws',
    'timeline',
    'documents',
    'disposition',
    'deal-lab',
    'alerts',
    'settings',
    'lender-portal',
    'gc-fixed-portal',
    'gc-daily-portal',
    'cfo-recon',
    'investor-portal',
    'document-intake',
  ],

  CFO: [
    'portfolio',
    'project-detail',
    'budget',
    'draws',
    'timeline',
    'documents',
    'disposition',
    'alerts',
    'settings',
    'cfo-recon',
    'document-intake',
  ],

  PM: [
    'project-detail',
    'timeline',
    'documents',
    'alerts',
    'gc-daily-portal',
  ],

  LENDER: [
    'lender-portal',
    'document-intake',
  ],

  GC_FIXED: [
    'gc-fixed-portal',
    'timeline',
  ],

  GC_DAILY: [
    'gc-daily-portal',
    'timeline',
  ],

  INVESTOR: [
    'investor-portal',
    'disposition',
  ],

  ACCOUNTANT: [
    'cfo-recon',
    'budget',
    'draws',
    'documents',
    'document-intake',
  ],
};

// ── Role Default Landing Screen ───────────────────────────────────────────────
export const ROLE_DEFAULT_SCREEN: Record<UserRole, ActiveNavScreen> = {
  DEVELOPER_OWNER: 'portfolio',
  CFO: 'cfo-recon',
  PM: 'timeline',
  LENDER: 'lender-portal',
  GC_FIXED: 'gc-fixed-portal',
  GC_DAILY: 'gc-daily-portal',
  INVESTOR: 'investor-portal',
  ACCOUNTANT: 'cfo-recon',
};

// ── Security Summary & Data Shielding Details ─────────────────────────────────
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

// ── Helper Evaluation Functions ───────────────────────────────────────────────
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function isScreenPermitted(role: UserRole, screen: ActiveNavScreen): boolean {
  const allowed = ROLE_ALLOWED_SCREENS[role];
  if (!allowed) return false;
  return allowed.includes(screen);
}

export function getPermittedScreens(role: UserRole): ActiveNavScreen[] {
  return ROLE_ALLOWED_SCREENS[role] || [];
}

export function getRoleDefaultScreen(role: UserRole): ActiveNavScreen {
  return ROLE_DEFAULT_SCREEN[role] || 'portfolio';
}
