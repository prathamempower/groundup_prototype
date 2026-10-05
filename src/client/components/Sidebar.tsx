import React from 'react';
import { 
  LayoutGrid, 
  Building2, 
  FileCheck, 
  FolderOpen, 
  Sparkles, 
  BellRing, 
  Plus, 
  LogOut, 
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
  Shield 
} from 'lucide-react';
import { UserRole } from '../../shared/types';
import { 
  ActiveNavScreen, 
  isScreenPermitted, 
  hasPermission, 
  ROLE_ACCESS_PROFILES 
} from '../../shared/rbac/matrix';

export type { ActiveNavScreen };

export interface SidebarProps {
  currentScreen: ActiveNavScreen;
  onNavigate: (screen: ActiveNavScreen, projectId?: string) => void;
  projects: Array<{id: string; name: string; status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'}>;
  selectedProjectId: string;
  onAddProject: () => void;
  onSignOut?: () => void;
  builderProfile: { name: string; company: string; };
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
  currentRole = 'DEVELOPER_OWNER'
}: SidebarProps) {
  
  const getStatusColor = (status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED') => {
    switch(status) {
      case 'ACTIVE': return 'bg-emerald-500';
      case 'ON_HOLD': return 'bg-amber-500';
      case 'COMPLETED': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // 1. Core Primary Workspaces
  const coreNav = [
    { id: 'portfolio' as const, label: 'Portfolio', icon: LayoutGrid },
    { id: 'project-detail' as const, label: 'Control Center', icon: Building2 },
    { id: 'deal-lab' as const, label: 'Deal Lab', icon: Sparkles },
  ];

  // 2. Project Control Modules (Tabs of the active project)
  const projectModulesNav = [
    { id: 'budget' as const, label: 'Budget & Contingency', icon: DollarSign },
    { id: 'draws' as const, label: 'Draw Lab', icon: FileCheck, badge: pendingDrawsCount },
    { id: 'timeline' as const, label: 'Milestones & Delay', icon: Clock },
    { id: 'documents' as const, label: 'Document Inbox', icon: FolderOpen },
    { id: 'disposition' as const, label: 'Unit Sales & ROI', icon: Home },
    { id: 'alerts' as const, label: 'Risk Alerts', icon: BellRing, badge: alertsCount },
  ];

  // 3. Dedicated Role Portals & Audit Repositories
  const rolePortalsNav = [
    { id: 'lender-portal' as const, label: 'Lender Draw Queue', icon: Landmark },
    { id: 'gc-fixed-portal' as const, label: 'GC Fixed Claims', icon: Hammer },
    { id: 'gc-daily-portal' as const, label: 'GC Daily Logs', icon: ClipboardList },
    { id: 'cfo-recon' as const, label: 'CFO & Lien Audit', icon: Scale },
    { id: 'investor-portal' as const, label: 'Investor Transparency', icon: TrendingUp },
    { id: 'document-intake' as const, label: 'Document Repository', icon: FolderArchive },
  ];

  const roleProfile = ROLE_ACCESS_PROFILES[currentRole] || ROLE_ACCESS_PROFILES.DEVELOPER_OWNER;
  const visibleCoreNav = coreNav.filter(item => isScreenPermitted(currentRole, item.id));
  const visibleProjectModules = projectModulesNav.filter(item => isScreenPermitted(currentRole, item.id));
  const visibleRolePortals = rolePortalsNav.filter(item => isScreenPermitted(currentRole, item.id));
  const isSettingsAllowed = isScreenPermitted(currentRole, 'settings');
  const canAddProject = hasPermission(currentRole, 'project:create');

  return (
    <aside className="flex flex-col w-64 h-screen shrink-0 bg-white border-r border-slate-200/90 select-none">
      {/* Header / Brand Logo */}
      <div className="p-4 px-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-xs">
            <span className="text-emerald-400 font-black text-base tracking-tighter">G</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-[15px] tracking-tight leading-none">GroundUp AI</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Finance Intelligence</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* Core Primary Workspaces */}
        {visibleCoreNav.length > 0 && (
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Core Workspaces
            </div>
            {visibleCoreNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Project Control Modules */}
        {visibleProjectModules.length > 0 && (
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Project Modules
            </div>
            {visibleProjectModules.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {/* Role Workspaces & Stakeholder Portals */}
        {visibleRolePortals.length > 0 && (
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              External Portals
            </div>
            {visibleRolePortals.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Settings & Team (Authorized Roles) */}
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

        {/* My Projects */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 mb-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Projects</h3>
            {canAddProject && (
              <button 
                onClick={onAddProject}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition cursor-pointer"
                title="Add Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <div className="space-y-0.5">
            {projects.map(project => {
              const isSelected = selectedProjectId === project.id;
              
              return (
                <button
                  key={project.id}
                  onClick={() => onNavigate('project-detail', project.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition text-xs cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/60' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(project.status)}`} />
                    <span className="truncate">{project.name}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1 rounded uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer / User Profile & Role Security Badge */}
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
                  <span className="truncate">{roleProfile.badge}</span>
                </span>
              </div>
            </div>
          </div>
          {onSignOut && (
            <button 
              onClick={onSignOut}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
