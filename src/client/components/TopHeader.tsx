// GroundUp AI — Global Top Navigation Header
// Includes Project Switcher, Role Persona Switcher, Quick Actions, and Active Role Context Pill

import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  UserCheck, 
  Plus, 
  Sparkles, 
  FileCheck, 
  ShieldAlert, 
  LogOut,
  Eye,
  CheckCircle2,
  Lock,
  Layers
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner Context for Active Role */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-6 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Active Persona: <strong className="text-white">{activeRoleContext.roleTitle}</strong> ({activeRoleContext.name})
          </span>
          <span className="text-slate-500 hidden md:inline">·</span>
          <span className="text-emerald-400 font-semibold hidden md:inline">{roleProfile.accessLevel}</span>
          <span className="text-slate-500 hidden md:inline">·</span>
          <span className="text-slate-400 hidden md:inline">{activeRoleContext.roleDescription}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-emerald-400" />
            <span>RBAC Enforced</span>
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Project Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 transition cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>{activeProject ? activeProject.name : 'Select Project'}</span>
              <span className={`w-2 h-2 rounded-full ${activeProject?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProjectMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-40">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Projects
                </div>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      setShowProjectMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                      p.id === selectedProjectId ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{p.address}</div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeProject?.gc_contract_model && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Layers className="w-3 h-3 text-slate-500" />
              <span>{activeProject.gc_contract_model === 'FIXED_PRICE' ? 'Fixed Contract GC' : 'Daily Updates GC'}</span>
            </span>
          )}
        </div>

        {/* Center/Right: Role Switcher & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch Persona: <strong>{activeRoleContext.roleTitle.split(' ')[0]}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-40">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select User Perspective
                </div>
                {roleList.map((r) => {
                  const meta = USER_ROLES[r];
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
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-slate-900" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{meta.roleTitle}</span>
                          {isCurrent && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal">{meta.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions (strictly gated by RBAC capabilities) */}
          {canCreateChangeOrder && (
            <button
              onClick={onOpenChangeOrder}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Change Order</span>
            </button>
          )}

          {canCreateDrawPacket && (
            <button
              onClick={onOpenDrawPacket}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>+ Draw Packet</span>
            </button>
          )}

          {/* AI Chat Drawer Button */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Ask AI Analyst</span>
          </button>
        </div>
      </div>
    </header>
  );
}
