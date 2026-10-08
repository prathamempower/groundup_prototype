import { UserRole as CanonicalUserRole, UserRoleDefinition, GROUNDUP_ROLES } from '../../shared/rbac';

export type UserRole = CanonicalUserRole;

export interface UserContext {
  id: string;
  name: string;
  role: string;
  roleTitle: string;
  roleDescription: string;
  badgeColor: string;
}

const baseUserRoles: Record<string, UserContext> = {
  OWNER: {
    id: GROUNDUP_ROLES.OWNER.id,
    name: GROUNDUP_ROLES.OWNER.name,
    role: 'OWNER',
    roleTitle: GROUNDUP_ROLES.OWNER.roleTitle,
    roleDescription: GROUNDUP_ROLES.OWNER.roleDescription,
    badgeColor: GROUNDUP_ROLES.OWNER.badgeColor,
  },
  PROJECT_MANAGER: {
    id: GROUNDUP_ROLES.PROJECT_MANAGER.id,
    name: GROUNDUP_ROLES.PROJECT_MANAGER.name,
    role: 'PROJECT_MANAGER',
    roleTitle: GROUNDUP_ROLES.PROJECT_MANAGER.roleTitle,
    roleDescription: GROUNDUP_ROLES.PROJECT_MANAGER.roleDescription,
    badgeColor: GROUNDUP_ROLES.PROJECT_MANAGER.badgeColor,
  },
  GENERAL_CONTRACTOR: {
    id: GROUNDUP_ROLES.GENERAL_CONTRACTOR.id,
    name: GROUNDUP_ROLES.GENERAL_CONTRACTOR.name,
    role: 'GENERAL_CONTRACTOR',
    roleTitle: GROUNDUP_ROLES.GENERAL_CONTRACTOR.roleTitle,
    roleDescription: GROUNDUP_ROLES.GENERAL_CONTRACTOR.roleDescription,
    badgeColor: GROUNDUP_ROLES.GENERAL_CONTRACTOR.badgeColor,
  },
  FINANCE: {
    id: GROUNDUP_ROLES.FINANCE.id,
    name: GROUNDUP_ROLES.FINANCE.name,
    role: 'FINANCE',
    roleTitle: GROUNDUP_ROLES.FINANCE.roleTitle,
    roleDescription: GROUNDUP_ROLES.FINANCE.roleDescription,
    badgeColor: GROUNDUP_ROLES.FINANCE.badgeColor,
  },
  ACCOUNTANT: {
    id: GROUNDUP_ROLES.ACCOUNTANT.id,
    name: GROUNDUP_ROLES.ACCOUNTANT.name,
    role: 'ACCOUNTANT',
    roleTitle: GROUNDUP_ROLES.ACCOUNTANT.roleTitle,
    roleDescription: GROUNDUP_ROLES.ACCOUNTANT.roleDescription,
    badgeColor: GROUNDUP_ROLES.ACCOUNTANT.badgeColor,
  },
  INVESTOR: {
    id: GROUNDUP_ROLES.INVESTOR.id,
    name: GROUNDUP_ROLES.INVESTOR.name,
    role: 'INVESTOR',
    roleTitle: GROUNDUP_ROLES.INVESTOR.roleTitle,
    roleDescription: GROUNDUP_ROLES.INVESTOR.roleDescription,
    badgeColor: GROUNDUP_ROLES.INVESTOR.badgeColor,
  },
  VIEWER: {
    id: GROUNDUP_ROLES.VIEWER.id,
    name: GROUNDUP_ROLES.VIEWER.name,
    role: 'VIEWER',
    roleTitle: GROUNDUP_ROLES.VIEWER.roleTitle,
    roleDescription: GROUNDUP_ROLES.VIEWER.roleDescription,
    badgeColor: GROUNDUP_ROLES.VIEWER.badgeColor,
  },
};

// Aliases for legacy role strings and external counterparty stubs
baseUserRoles.DEVELOPER_OWNER = { ...baseUserRoles.OWNER, role: 'DEVELOPER_OWNER' };
baseUserRoles.CFO = { ...baseUserRoles.FINANCE, role: 'CFO' };
baseUserRoles.PM = { ...baseUserRoles.PROJECT_MANAGER, role: 'PM' };
baseUserRoles.GC_FIXED = { ...baseUserRoles.GENERAL_CONTRACTOR, role: 'GC_FIXED' };
baseUserRoles.GC_DAILY = { ...baseUserRoles.GENERAL_CONTRACTOR, role: 'GC_DAILY' };

export const USER_ROLES: Record<string, UserContext> = baseUserRoles;

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
