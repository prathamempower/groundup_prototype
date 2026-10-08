export type UserRole = 
  | 'DEVELOPER_OWNER' 
  | 'CFO' 
  | 'PM' 
  | 'GC_FIXED' 
  | 'GC_DAILY' 
  | 'INVESTOR' 
  | 'ACCOUNTANT' 
  | 'LENDER';

export interface UserContext {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  roleDescription: string;
  badgeColor: string;
}

export const USER_ROLES: Record<UserRole, UserContext> = {
  DEVELOPER_OWNER: {
    id: 'user-dev-1',
    name: 'Hardik Parikh',
    role: 'DEVELOPER_OWNER',
    roleTitle: 'Developer / Owner',
    roleDescription: 'Full control: portfolio economics, pro forma ROI, cash gap, change order approvals, draw packets.',
    badgeColor: 'bg-slate-900 text-white',
  },
  CFO: {
    id: 'user-cfo-1',
    name: 'Sarah Jenkins',
    role: 'CFO',
    roleTitle: 'CFO / Accounting',
    roleDescription: 'Financial ledger: matches expenses to budget lines, Amex card feeds, contingency absorption, draw reconciliation.',
    badgeColor: 'bg-emerald-800 text-white',
  },
  PM: {
    id: 'user-pm-1',
    name: 'Marcus Vance',
    role: 'PM',
    roleTitle: 'Project Manager',
    roleDescription: 'Field & Schedule: milestone progress %, municipal inspections, root-cause delay attribution & carrying costs.',
    badgeColor: 'bg-blue-800 text-white',
  },
  GC_FIXED: {
    id: 'user-gc-fixed',
    name: 'Kunal Shah',
    role: 'GC_FIXED',
    roleTitle: 'GC (Fixed / Milestone)',
    roleDescription: 'Submits milestone claims upon completion with photo proof & inspection reports; submits change orders.',
    badgeColor: 'bg-indigo-700 text-white',
  },
  GC_DAILY: {
    id: 'user-gc-daily',
    name: 'Sylvia Concrete & Framing',
    role: 'GC_DAILY',
    roleTitle: 'GC (Daily Updates)',
    roleDescription: 'Open-book / cost-plus: daily work logs, material & subcontractor receipts with GC markup, daily progress photos.',
    badgeColor: 'bg-teal-700 text-white',
  },
  INVESTOR: {
    id: 'user-investor-1',
    name: 'Krutarth Shah',
    role: 'INVESTOR',
    roleTitle: 'Investor / Partner',
    roleDescription: 'Read-only transparency: capital deployed, projected ROI vs baseline, next funding events, narrative monthly updates.',
    badgeColor: 'bg-purple-800 text-white',
  },
  ACCOUNTANT: {
    id: 'user-acct-1',
    name: 'Elena Rostova',
    role: 'ACCOUNTANT',
    roleTitle: 'Project Accountant',
    roleDescription: 'Expense ledger, invoice tracking, lien waiver audits, and financial reporting.',
    badgeColor: 'bg-cyan-800 text-white',
  },
  LENDER: {
    id: 'user-lender-1',
    name: 'David Sterling',
    role: 'LENDER',
    roleTitle: 'Construction Lender (BCB Bank)',
    roleDescription: 'Draw packet review, inspection verification, line-item approvals/rejections, wire disbursement.',
    badgeColor: 'bg-amber-800 text-white',
  },
};

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  isNewUser?: boolean;
  avatarUrl?: string;
  authProvider: 'google' | 'email' | 'demo';
}

export interface UserBuilderProfile {
  id: string;
  name: string;
  company_name: string;
  email: string;
  role: string;
}
