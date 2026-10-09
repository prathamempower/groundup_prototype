import React from 'react';
import {
  LayoutGrid,
  Building2,
  FileCheck,
  FolderOpen,
  Sparkles,
  BellRing,
  DollarSign,
  Clock,
  Home,
  Settings,
  Landmark,
  Scale,
  MapPin,
  Building,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { UserRole } from '../../shared/types';
import {
  ActiveNavScreen,
  isScreenPermitted,
  hasPermission,
  ROLE_ACCESS_PROFILES,
} from '../../shared/rbac/matrix';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNavGroup } from './sidebar/SidebarNavGroup';
import { SidebarFooter } from './sidebar/SidebarFooter';

export type { ActiveNavScreen };

export interface SidebarProps {
  currentScreen: ActiveNavScreen;
  onNavigate: (screen: ActiveNavScreen, projectId?: string) => void;
  activeProjectId?: string | null;
  activeProjectName?: string;
  activeProjectStatus?: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  onAddProject: () => void;
  onSignOut?: () => void;
  builderProfile: { name: string; company: string };
  pendingDrawsCount?: number;
  alertsCount?: number;
  currentRole?: UserRole;
  projects?: Array<{ id: string; name: string; status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' }>;
  selectedProjectId?: string;
}

export function Sidebar({
  currentScreen,
  onNavigate,
  activeProjectId,
  activeProjectName,
  activeProjectStatus,
  onAddProject,
  onSignOut,
  builderProfile,
  pendingDrawsCount = 0,
  alertsCount = 0,
  currentRole = 'OWNER',
}: SidebarProps) {
  const roleProfile = ROLE_ACCESS_PROFILES[currentRole] || ROLE_ACCESS_PROFILES.OWNER;
  const isSettingsAllowed = isScreenPermitted(currentRole, 'settings');
  const canAddProject = hasPermission(currentRole, 'project:create');

  // If we are inside an active project workspace
  const isProjectActive = Boolean(activeProjectId);

  const projectModulesNav = [
    { id: 'project-detail' as const, label: 'Control Center', icon: Building2 },
    { id: 'acquisition' as const, label: 'Acquisition & Closing', icon: MapPin },
    { id: 'permits' as const, label: 'Planning & Permits', icon: Building },
    { id: 'financing' as const, label: 'Financing & Debt', icon: Landmark },
    { id: 'budget' as const, label: 'Budget & Contingency', icon: DollarSign },
    { id: 'timeline' as const, label: 'Milestones & Delays', icon: Clock },
    { id: 'draws' as const, label: 'Draw Lab', icon: FileCheck, badge: pendingDrawsCount },
    { id: 'documents' as const, label: 'Document Inbox', icon: FolderOpen },
    { id: 'recon' as const, label: 'Financial Recon', icon: Scale },
    { id: 'disposition' as const, label: 'Unit Sales & ROI', icon: Home },
    { id: 'alerts' as const, label: 'Risk Alerts', icon: BellRing, badge: alertsCount },
  ];

  const visibleProjectModules = projectModulesNav.filter((item) =>
    isScreenPermitted(currentRole, item.id)
  );

  const globalWorkspacesNav = [
    { id: 'portfolio' as const, label: 'Projects Catalog', icon: LayoutGrid },
    { id: 'deal-lab' as const, label: 'Deal Lab', icon: Sparkles },
  ].filter((item) => isScreenPermitted(currentRole, item.id));

  return (
    <aside className="flex flex-col w-64 h-screen shrink-0 bg-white border-r border-slate-200/90 select-none">
      {isProjectActive ? (
        /* Project-Scoped Sidebar Header */
        <div className="p-3 border-b border-slate-100 space-y-2">
          <button
            onClick={() => onNavigate('portfolio')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-2.5 py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer w-full group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>All Projects</span>
          </button>

          <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  activeProjectStatus === 'COMPLETED' ? 'bg-blue-500' : 'bg-emerald-500'
                }`}
              />
              <span className="font-bold text-xs text-slate-900 truncate">
                {activeProjectName || 'Active Project'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5 pl-4">
              Project Workspace
            </span>
          </div>
        </div>
      ) : (
        /* Global Organization Header */
        <SidebarHeader />
      )}

      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {isProjectActive ? (
          /* Project Workspace Navigation */
          <SidebarNavGroup
            title="Project Modules"
            items={visibleProjectModules}
            currentScreen={currentScreen}
            onNavigate={(screen) => onNavigate(screen, activeProjectId!)}
          />
        ) : (
          /* Global Workspace Navigation */
          <>
            <SidebarNavGroup
              title="Workspaces"
              items={globalWorkspacesNav}
              currentScreen={currentScreen}
              onNavigate={(screen) => onNavigate(screen)}
            />

            {canAddProject && (
              <div className="pt-1">
                <button
                  onClick={onAddProject}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>New Project</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Global Admin Link */}
        {isSettingsAllowed && (
          <div className="space-y-0.5 pt-2 border-t border-slate-100">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Administration
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
                currentScreen === 'settings'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings & Team</span>
            </button>
          </div>
        )}
      </nav>

      <SidebarFooter
        builderProfile={builderProfile}
        roleBadge={roleProfile.badge}
        onSignOut={onSignOut}
      />
    </aside>
  );
}
