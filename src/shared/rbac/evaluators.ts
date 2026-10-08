import { ActiveNavScreen, Permission, ProjectTab, UserRole } from './types';
import { ROLE_PERMISSIONS } from './role-permissions';
import { ROLE_ALLOWED_SCREENS, ROLE_DEFAULT_SCREEN } from './role-screens';
import { ROLE_ALLOWED_TABS, ROLE_DEFAULT_TAB } from './role-tabs';

const ROLE_ALIASES: Record<string, UserRole> = {
  DEVELOPER_OWNER: 'OWNER',
  CFO: 'FINANCE',
  PM: 'PROJECT_MANAGER',
  GC_FIXED: 'GENERAL_CONTRACTOR',
  GC_DAILY: 'GENERAL_CONTRACTOR',
};

export function normalizeRole(role: string): UserRole {
  if (ROLE_ALIASES[role]) return ROLE_ALIASES[role];
  return (role as UserRole) || 'OWNER';
}

export function hasPermission(role: string, permission: Permission): boolean {
  if (ROLE_PERMISSIONS[role]) {
    return ROLE_PERMISSIONS[role].includes(permission);
  }
  const canonical = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[canonical];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function isScreenPermitted(role: string, screen: ActiveNavScreen): boolean {
  if (ROLE_ALLOWED_SCREENS[role]) {
    return ROLE_ALLOWED_SCREENS[role].includes(screen);
  }
  const canonical = normalizeRole(role);
  const allowed = ROLE_ALLOWED_SCREENS[canonical];
  if (!allowed) return false;
  return allowed.includes(screen);
}

export function getPermittedScreens(role: string): ActiveNavScreen[] {
  if (ROLE_ALLOWED_SCREENS[role]) return ROLE_ALLOWED_SCREENS[role];
  const canonical = normalizeRole(role);
  return ROLE_ALLOWED_SCREENS[canonical] || [];
}

export function getRoleDefaultScreen(role: string): ActiveNavScreen {
  if (ROLE_DEFAULT_SCREEN[role]) return ROLE_DEFAULT_SCREEN[role];
  const canonical = normalizeRole(role);
  return ROLE_DEFAULT_SCREEN[canonical] || 'portfolio';
}

export function isProjectTabPermitted(role: string, tab: ProjectTab): boolean {
  if (ROLE_ALLOWED_TABS[role]) {
    return ROLE_ALLOWED_TABS[role].includes(tab);
  }
  const canonical = normalizeRole(role);
  const allowed = ROLE_ALLOWED_TABS[canonical];
  if (!allowed) return false;
  return allowed.includes(tab);
}

export function getPermittedProjectTabs(role: string): ProjectTab[] {
  if (ROLE_ALLOWED_TABS[role]) return ROLE_ALLOWED_TABS[role];
  const canonical = normalizeRole(role);
  return ROLE_ALLOWED_TABS[canonical] || [];
}

export function getRoleDefaultTab(role: string): ProjectTab {
  if (ROLE_DEFAULT_TAB[role]) return ROLE_DEFAULT_TAB[role];
  const canonical = normalizeRole(role);
  return ROLE_DEFAULT_TAB[canonical] || 'overview';
}
