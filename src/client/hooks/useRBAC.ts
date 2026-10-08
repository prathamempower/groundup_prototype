import { useMemo } from 'react';
import { UserRole } from '../../shared/types';
import {
  Permission,
  ActiveNavScreen,
  ProjectTab,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isScreenPermitted,
  getPermittedScreens,
  getRoleDefaultScreen,
  isProjectTabPermitted,
  getPermittedProjectTabs,
  getRoleDefaultTab,
  ROLE_ACCESS_PROFILES,
  GROUNDUP_ROLES,
  normalizeRole,
} from '../../shared/rbac';

export function useRBAC(currentRole: UserRole | string = 'OWNER') {
  const canonicalRole = useMemo(() => normalizeRole(currentRole), [currentRole]);
  const roleDefinition = useMemo(() => GROUNDUP_ROLES[canonicalRole], [canonicalRole]);
  const profile = useMemo(() => ROLE_ACCESS_PROFILES[currentRole] || ROLE_ACCESS_PROFILES[canonicalRole], [currentRole, canonicalRole]);
  const permittedScreens = useMemo(() => getPermittedScreens(currentRole), [currentRole]);
  const defaultScreen = useMemo(() => getRoleDefaultScreen(currentRole), [currentRole]);
  const permittedTabs = useMemo(() => getPermittedProjectTabs(currentRole), [currentRole]);
  const defaultTab = useMemo(() => getRoleDefaultTab(currentRole), [currentRole]);

  return {
    role: currentRole,
    canonicalRole,
    roleDefinition,
    profile,
    permittedScreens,
    defaultScreen,
    permittedTabs,
    defaultTab,
    can: (permission: Permission) => hasPermission(currentRole, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(currentRole, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(currentRole, permissions),
    isScreenAllowed: (screen: ActiveNavScreen) => isScreenPermitted(currentRole, screen),
    isTabAllowed: (tab: ProjectTab) => isProjectTabPermitted(currentRole, tab),
  };
}
