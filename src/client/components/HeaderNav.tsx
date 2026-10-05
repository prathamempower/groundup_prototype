// GroundUp AI — Responsive Header & User Persona Role Switcher

import React from 'react';
import { Building2, RefreshCw, UserCheck, Shield, ChevronDown, CheckCircle2, Sparkles } from 'lucide-react';
import { Project, UserRole, USER_ROLES } from '../../shared/types';

interface HeaderNavProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isConnected: boolean;
  onResetSeed: () => void;
  isResetting: boolean;
  onOpenIntake: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  activeRole,
  onChangeRole,
  isConnected,
  onResetSeed,
  isResetting,
  onOpenIntake,
}) => {
  const currentActor = USER_ROLES[activeRole];

  return (
    <header className="sticky top-0 z-40 bg-surface-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Project Selector */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-0.5 shadow-md shadow-brand-500/20">
              <div className="w-full h-full bg-surface-950 rounded-[10px] flex items-center justify-center">
                <span className="font-heading font-extrabold text-sm text-brand-400">GU</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-sm text-white tracking-tight">
                  GroundUp AI
                </span>
                <span className="text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/30 px-1.5 py-0.2 rounded font-mono">
                  V1 Intake First
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isConnected ? 'Live WebSocket Active' : 'Connecting...'}</span>
              </div>
            </div>
          </div>

          {/* Project Switcher */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              className="appearance-none bg-surface-800 text-xs font-semibold text-slate-200 pl-3 pr-8 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:border-brand-500 cursor-pointer shadow-sm"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* User Persona / Role Switcher & Action Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          {/* Persona Role Pill */}
          <div className="flex items-center gap-2 bg-surface-950 px-3 py-1.5 rounded-2xl border border-slate-800">
            <UserCheck className="w-4 h-4 text-brand-400 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block leading-tight">Current User Persona:</span>
              <select
                value={activeRole}
                onChange={(e) => onChangeRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="DEVELOPER_OWNER">Developer / Sponsor</option>
                <option value="CFO">CFO (Finance)</option>
                <option value="PM">Project Manager (GC)</option>
                <option value="ACCOUNTANT">Accountant (Invoices)</option>
                <option value="LENDER">Construction Lender</option>
              </select>
            </div>
          </div>

          {/* New Intake Button */}
          <button
            onClick={onOpenIntake}
            className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> Data Intake Center
          </button>

          {/* Seed Reset Button */}
          <button
            onClick={onResetSeed}
            disabled={isResetting}
            title="Reset to baseline data"
            className="p-2 rounded-xl bg-surface-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
