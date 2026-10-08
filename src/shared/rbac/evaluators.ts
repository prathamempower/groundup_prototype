import { UserRole } from '../types';
import { Permission } from './permissions';
import { ROLE_PERMISSIONS } from './role-permissions';
import { ActiveNavScreen, ROLE_ALLOWED_SCREENS, ROLE_DEFAULT_SCREEN } from './role-screens';

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
