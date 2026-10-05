// GroundUp AI — PermissionGate Component
// Conditionally renders UI actions and sections based on role capability

import React from 'react';
import { UserRole } from '../../shared/types';
import { Permission } from '../../shared/rbac/permissions';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../../shared/rbac/matrix';
import { Lock } from 'lucide-react';

interface PermissionGateProps {
  role: UserRole;
  permission?: Permission;
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLockedPlaceholder?: boolean;
  lockedMessage?: string;
}

export function PermissionGate({
  role,
  permission,
  anyPermissions,
  allPermissions,
  children,
  fallback = null,
  showLockedPlaceholder = false,
  lockedMessage = 'Restricted by Role-Based Access Control',
}: PermissionGateProps) {
  let isAllowed = true;

  if (permission) {
    isAllowed = hasPermission(role, permission);
  } else if (anyPermissions && anyPermissions.length > 0) {
    isAllowed = hasAnyPermission(role, anyPermissions);
  } else if (allPermissions && allPermissions.length > 0) {
    isAllowed = hasAllPermissions(role, allPermissions);
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  if (showLockedPlaceholder) {
    return (
      <div className="flex items-center gap-2 p-3 bg-slate-100/80 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 font-medium">
        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{lockedMessage}</span>
      </div>
    );
  }

  return <>{fallback}</>;
}
