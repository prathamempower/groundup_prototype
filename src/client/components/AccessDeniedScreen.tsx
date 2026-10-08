import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, CheckCircle2, UserCheck } from 'lucide-react';
import { UserRole, USER_ROLES } from '../../shared/types';
import { ActiveNavScreen, ROLE_ACCESS_PROFILES, getRoleDefaultScreen, getPermittedScreens } from '../../shared/rbac';

interface AccessDeniedScreenProps {
  requestedScreen: ActiveNavScreen;
  currentRole: UserRole;
  onNavigate: (screen: ActiveNavScreen) => void;
  onSwitchRole?: (role: UserRole) => void;
}

export function AccessDeniedScreen({
  requestedScreen,
  currentRole,
  onNavigate,
  onSwitchRole,
}: AccessDeniedScreenProps) {
  const roleMeta = USER_ROLES[currentRole] || USER_ROLES.OWNER;
  const profile = ROLE_ACCESS_PROFILES[currentRole] || ROLE_ACCESS_PROFILES.OWNER;
  const defaultScreen = getRoleDefaultScreen(currentRole);
  const permittedScreens = getPermittedScreens(currentRole);

  const formatScreenName = (screen: string) => {
    return screen
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 mb-2">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>403 Access Restricted · Least Privilege Policy</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Restricted Module: {formatScreenName(requestedScreen)}
          </h2>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Your current persona <strong className="text-slate-900 font-bold">{roleMeta.roleTitle}</strong> ({roleMeta.name}) does not have permission to access this financial module.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Role Isolation & Confidentiality Shields</span>
            <span className="text-[10px] text-amber-700 font-semibold">{profile.badge}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {profile.description}
          </p>

          {profile.dataShields.length > 0 && (
            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Enforced Privacy Boundaries:</span>
              {profile.dataShields.map((shield, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{shield}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-left space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Authorized Workspaces for {roleMeta.roleTitle}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {permittedScreens.map((s) => (
              <button
                key={s}
                onClick={() => onNavigate(s)}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{formatScreenName(s)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate(defaultScreen)}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {formatScreenName(defaultScreen)}</span>
          </button>

          {onSwitchRole && currentRole !== 'OWNER' && (
            <button
              onClick={() => onSwitchRole('OWNER')}
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Switch to Project Owner</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
