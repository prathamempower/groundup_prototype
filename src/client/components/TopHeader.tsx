// GroundUp AI — Global Top Navigation Header
// Refined Executive Bar: Project Context, Contextual Actions, AI Analyst, and Clean Perspective Switcher

import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  UserCheck, 
  Plus, 
  Sparkles, 
  FileCheck, 
  ShieldCheck, 
  Lock,
  Layers,
  Check
} from 'lucide-react';
import { UserRole, USER_ROLES, Project } from '../../shared/types';
import { hasPermission, ROLE_ACCESS_PROFILES } from '../../shared/rbac/matrix';

interface TopHeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenDrawPacket: () => void;
  onOpenChangeOrder: () => void;
  onOpenAIChat: () => void;
  onSignOut: () => void;
  onNavigateScreen?: (screen: any) => void;
}

export function TopHeader({
  currentRole,
  onChangeRole,
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenDrawPacket,
  onOpenChangeOrder,
  onOpenAIChat,
  onSignOut,
  onNavigateScreen,
}: TopHeaderProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const activeRoleContext = USER_ROLES[currentRole] || USER_ROLES.DEVELOPER_OWNER;
  const roleProfile = ROLE_ACCESS_PROFILES[currentRole] || ROLE_ACCESS_PROFILES.DEVELOPER_OWNER;
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const roleList: UserRole[] = [
    'DEVELOPER_OWNER',
    'CFO',
    'PM',
    'LENDER',
    'GC_FIXED',
    'GC_DAILY',
    'INVESTOR',
  ];

  const canCreateDrawPacket = hasPermission(currentRole, 'draw:create_packet');
  const canCreateChangeOrder = hasPermission(currentRole, 'change_order:create');

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Active Project Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 transition-all cursor-pointer shadow-2xs"
            >
              <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="font-bold">{activeProject ? activeProject.name : 'Select Project'}</span>
              <span className={`w-2 h-2 rounded-full ${activeProject?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProjectMenu && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Project
                </div>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      setShowProjectMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                      p.id === selectedProjectId ? 'bg-slate-100/80 font-bold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{p.address}</div>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeProject?.gc_contract_model && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100/80 text-slate-600 border border-slate-200/80">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>{activeProject.gc_contract_model === 'FIXED_PRICE' ? 'Fixed-Price Contract' : 'Daily Updates T&M'}</span>
            </span>
          )}
        </div>

        {/* Right: Actions, AI Analyst, & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Ask AI Analyst Button */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="Ask AI Construction Finance Analyst (⌘K)"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Ask AI Analyst</span>
            <span className="hidden lg:inline text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1 rounded">⌘K</span>
          </button>

          {/* Quick Actions (Strictly RBAC Gated) */}
          {canCreateChangeOrder && (
            <button
              onClick={onOpenChangeOrder}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Change Order</span>
            </button>
          )}

          {canCreateDrawPacket && (
            <button
              onClick={onOpenDrawPacket}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>+ Draw Packet</span>
            </button>
          )}

          {/* Perspective / Role Switcher */}
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
                {roleList.map((r) => {
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
        </div>
      </div>
    </header>
  );
}
