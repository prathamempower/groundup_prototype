import React, { useState } from 'react';
import { UserCheck, ChevronDown, Lock, Check } from 'lucide-react';
import { UserRole, USER_ROLES } from '../../../shared/types';
import { ROLE_ACCESS_PROFILES } from '../../../shared/rbac/matrix';

interface RoleSwitcherDropdownProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

const ROLE_LIST: UserRole[] = [
  'DEVELOPER_OWNER',
  'CFO',
  'PM',
  'LENDER',
  'GC_FIXED',
  'GC_DAILY',
  'INVESTOR',
];

export function RoleSwitcherDropdown({
  currentRole,
  onChangeRole,
}: RoleSwitcherDropdownProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const activeRoleContext = USER_ROLES[currentRole] || USER_ROLES.DEVELOPER_OWNER;

  return (
    <div className="relative">
      <button
        onClick={() => setShowRoleMenu(!showRoleMenu)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
      >
        <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>
          Switch Persona: <strong className="font-bold text-white">{activeRoleContext.roleTitle.split(' ')[0]}</strong>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {showRoleMenu && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-1.5 flex items-center justify-between border-b border-slate-100 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Role & Persona Simulator
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-emerald-600" />
              <span>RBAC Enforced</span>
            </span>
          </div>
          {ROLE_LIST.map((r) => {
            const meta = USER_ROLES[r];
            const profile = ROLE_ACCESS_PROFILES[r];
            const isCurrent = r === currentRole;
            return (
              <button
                key={r}
                onClick={() => {
                  onChangeRole(r);
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 transition cursor-pointer flex items-start gap-2.5 ${
                  isCurrent ? 'bg-slate-50 font-bold text-slate-900' : 'text-slate-700'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCurrent ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-900 truncate">{meta.roleTitle}</span>
                    <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                      {profile.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal truncate">{meta.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
