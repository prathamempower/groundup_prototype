import React from 'react';
import { Plus, Sparkles, FileCheck, Layers } from 'lucide-react';
import { UserRole, Project } from '../../shared/types';
import { hasPermission } from '../../shared/rbac/matrix';
import { ProjectSelectorDropdown } from './header/ProjectSelectorDropdown';
import { RoleSwitcherDropdown } from './header/RoleSwitcherDropdown';

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
}: TopHeaderProps) {
  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const canCreateDrawPacket = hasPermission(currentRole, 'draw:create_packet');
  const canCreateChangeOrder = hasPermission(currentRole, 'change_order:create');

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Active Project Selector */}
        <div className="flex items-center gap-3">
          <ProjectSelectorDropdown
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={onSelectProject}
          />

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

          <RoleSwitcherDropdown
            currentRole={currentRole}
            onChangeRole={onChangeRole}
          />
        </div>
      </div>
    </header>
  );
}
