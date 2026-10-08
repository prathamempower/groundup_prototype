import React from 'react';
import { UserRole, USER_ROLES } from '../../../../shared/types';

interface RoleContextBannerProps {
  activeRole: UserRole;
}

export function RoleContextBanner({ activeRole }: RoleContextBannerProps) {
  const roleMeta = USER_ROLES[activeRole];

  return (
    <div className="p-3.5 rounded-2xl bg-surface-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-400" />
        <span>
          Viewing as <strong className="text-white">{roleMeta.roleTitle}</strong> ({roleMeta.name}):{' '}
          <span className="text-slate-400 hidden sm:inline">{roleMeta.roleDescription}</span>
        </span>
      </div>
      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
        Tenant Scoped
      </span>
    </div>
  );
}
