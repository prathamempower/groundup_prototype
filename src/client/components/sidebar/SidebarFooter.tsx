import React from 'react';
import { Shield, LogOut } from 'lucide-react';

interface SidebarFooterProps {
  builderProfile: { name: string; company: string };
  roleBadge: string;
  onSignOut?: () => void;
}

export function SidebarFooter({
  builderProfile,
  roleBadge,
  onSignOut,
}: SidebarFooterProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-2xs">
            <span className="text-white text-xs font-bold">
              {getInitials(builderProfile.name)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">
              {builderProfile.name}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200/70 text-slate-700 truncate">
                <Shield className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                <span className="truncate">{roleBadge}</span>
              </span>
            </div>
          </div>
        </div>
        {onSignOut && (
          <button
            data-testid="sign-out-btn"
            onClick={onSignOut}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition shrink-0 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
