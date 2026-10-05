// GroundUp AI — RBAC React Hook
// Provides context-aware permission and screen authorization queries

import { useMemo } from 'react';
import { UserRole } from '../../shared/types';
import { Permission } from '../../shared/rbac/permissions';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  isScreenPermitted, 
  getPermittedScreens, 
  getRoleDefaultScreen, 
  ROLE_ACCESS_PROFILES,
  ActiveNavScreen
} from '../../shared/rbac/matrix';

export function useRBAC(currentRole: UserRole) {
  const profile = useMemo(() => ROLE_ACCESS_PROFILES[currentRole], [currentRole]);
  const permittedScreens = useMemo(() => getPermittedScreens(currentRole), [currentRole]);
  const defaultScreen = useMemo(() => getRoleDefaultScreen(currentRole), [currentRole]);

  return {
    role: currentRole,
    profile,
    permittedScreens,
    defaultScreen,
    can: (permission: Permission) => hasPermission(currentRole, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(currentRole, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(currentRole, permissions),
    isScreenAllowed: (screen: ActiveNavScreen) => isScreenPermitted(currentRole, screen),
  };
}
