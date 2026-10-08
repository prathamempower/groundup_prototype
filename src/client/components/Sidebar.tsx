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
  Hammer,
  ClipboardList,
  Scale,
  TrendingUp,
  FolderArchive,
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
import { SidebarProjectList } from './sidebar/SidebarProjectList';
import { SidebarFooter } from './sidebar/SidebarFooter';

export type { ActiveNavScreen };

export interface SidebarProps {
  currentScreen: ActiveNavScreen;
  onNavigate: (screen: ActiveNavScreen, projectId?: string) => void;
  projects: Array<{ id: string; name: string; status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' }>;
  selectedProjectId: string;
  onAddProject: () => void;
  onSignOut?: () => void;
  builderProfile: { name: string; company: string };
  pendingDrawsCount?: number;
  alertsCount?: number;
  currentRole?: UserRole;
}

export function Sidebar({
  currentScreen,
  onNavigate,
  projects,
  selectedProjectId,
  onAddProject,
  onSignOut,
  builderProfile,
  pendingDrawsCount = 0,
  alertsCount = 0,
  currentRole = 'OWNER',
}: SidebarProps) {
  const coreNav = [
    { id: 'portfolio' as const, label: 'Portfolio', icon: LayoutGrid },
    { id: 'deal-lab' as const, label: 'Deal Lab', icon: Sparkles },
    { id: 'documents' as const, label: 'Document Inbox', icon: FolderOpen },
    { id: 'reports' as const, label: 'Reports & Audits', icon: FileCheck },
  ];

  const projectModulesNav = [
    { id: 'project-detail' as const, label: 'Control Center', icon: Building2 },
    { id: 'budget' as const, label: 'Budget & Contingency', icon: DollarSign },
    { id: 'draws' as const, label: 'Draw Lab', icon: FileCheck, badge: pendingDrawsCount },
    { id: 'timeline' as const, label: 'Milestones & Delays', icon: Clock },
    { id: 'recon' as const, label: 'Financial Recon', icon: Scale },
    { id: 'disposition' as const, label: 'Unit Sales & ROI', icon: Home },
    { id: 'alerts' as const, label: 'Risk Alerts', icon: BellRing, badge: alertsCount },
  ];

  const roleProfile = ROLE_ACCESS_PROFILES[currentRole] || ROLE_ACCESS_PROFILES.OWNER;
  const visibleCoreNav = coreNav.filter((item) => isScreenPermitted(currentRole, item.id));
  const visibleProjectModules = projectModulesNav.filter((item) => isScreenPermitted(currentRole, item.id));
  const isSettingsAllowed = isScreenPermitted(currentRole, 'settings');
  const canAddProject = hasPermission(currentRole, 'project:create');

  return (
    <aside className="flex flex-col w-64 h-screen shrink-0 bg-white border-r border-slate-200/90 select-none">
      <SidebarHeader />

      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        <SidebarNavGroup
          title="Core Workspaces"
          items={visibleCoreNav}
          currentScreen={currentScreen}
          onNavigate={onNavigate}
        />

        <SidebarNavGroup
          title="Project Modules"
          items={visibleProjectModules}
          currentScreen={currentScreen}
          onNavigate={onNavigate}
        />

        {isSettingsAllowed && (
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Admin
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

        <SidebarProjectList
          projects={projects}
          selectedProjectId={selectedProjectId}
          canAddProject={canAddProject}
          onAddProject={onAddProject}
          onNavigate={onNavigate}
        />
      </nav>

      <SidebarFooter
        builderProfile={builderProfile}
        roleBadge={roleProfile.badge}
        onSignOut={onSignOut}
      />
    </aside>
  );
}
