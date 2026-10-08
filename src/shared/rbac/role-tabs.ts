import { GroundUpRole, ProjectTab, UserRole } from './types';

const baseTabs: Record<GroundUpRole, ProjectTab[]> = {
  OWNER: [
    'overview',
    'acquisition',
    'permits',
    'financing',
    'budget',
    'timeline',
    'draws',
    'disposition',
    'recon',
    'documents',
    'alerts',
  ],
  FINANCE: [
    'overview',
    'acquisition',
    'financing',
    'budget',
    'timeline',
    'draws',
    'disposition',
    'recon',
    'documents',
    'alerts',
  ],
  PROJECT_MANAGER: [
    'overview',
    'acquisition',
    'permits',
    'budget',
    'timeline',
    'documents',
    'alerts',
  ],
  ACCOUNTANT: [
    'overview',
    'budget',
    'draws',
    'recon',
    'documents',
  ],
  INVESTOR: [
    'overview',
    'disposition',
    'documents',
  ],
  VIEWER: [
    'overview',
    'permits',
    'timeline',
    'documents',
  ],
};

const fullTabs: Record<string, ProjectTab[]> = {
  ...baseTabs,
  GENERAL_CONTRACTOR: [
    'overview',
    'timeline',
    'documents',
  ],
  DEVELOPER_OWNER: baseTabs.OWNER,
  CFO: baseTabs.FINANCE,
  PM: baseTabs.PROJECT_MANAGER,
  GC_FIXED: ['overview', 'timeline', 'documents'],
  GC_DAILY: ['overview', 'timeline', 'documents'],
};

const baseDefaultTabs: Record<GroundUpRole, ProjectTab> = {
  OWNER: 'overview',
  FINANCE: 'budget',
  PROJECT_MANAGER: 'timeline',
  ACCOUNTANT: 'budget',
  INVESTOR: 'overview',
  VIEWER: 'overview',
};

const fullDefaultTabs: Record<string, ProjectTab> = {
  ...baseDefaultTabs,
  GENERAL_CONTRACTOR: 'timeline',
  DEVELOPER_OWNER: 'overview',
  CFO: 'budget',
  PM: 'timeline',
  GC_FIXED: 'timeline',
  GC_DAILY: 'timeline',
};

export const ROLE_ALLOWED_TABS: Record<string, ProjectTab[]> = fullTabs;
export const ROLE_DEFAULT_TAB: Record<string, ProjectTab> = fullDefaultTabs;
