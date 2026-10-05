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
  Lock,
  Shield
} from 'lucide-react';
import { UserRole, USER_ROLES } from '../../shared/types';
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

  const mainNav = [
    { id: 'portfolio' as const, label: 'Portfolio', icon: LayoutGrid },
    { id: 'project-detail' as const, label: 'Control Center', icon: Building2 },
    { id: 'budget' as const, label: 'Budget & Contingency', icon: DollarSign },
    { id: 'draws' as const, label: 'Draw Lab', icon: FileCheck, badge: pendingDrawsCount },
    { id: 'timeline' as const, label: 'Milestones & Delay', icon: Clock },
    { id: 'documents' as const, label: 'Document Inbox', icon: FolderOpen },
    { id: 'disposition' as const, label: 'Unit Sales & ROI', icon: Home },
    { id: 'deal-lab' as const, label: 'Deal Lab', icon: Sparkles },
    { id: 'alerts' as const, label: 'Risk Alerts', icon: BellRing, badge: alertsCount },
  ];

  const roleNav = [
    { id: 'lender-portal' as const, label: 'Lender Draw Queue', icon: Landmark },
    { id: 'gc-fixed-portal' as const, label: 'GC Fixed Claims', icon: Hammer },
    { id: 'gc-daily-portal' as const, label: 'GC Daily Logs', icon: ClipboardList },
    { id: 'cfo-recon' as const, label: 'CFO & Lien Audit', icon: Scale },
    { id: 'investor-portal' as const, label: 'Investor Transparency', icon: TrendingUp },
    { id: 'document-intake' as const, label: 'Document Repository', icon: FolderArchive },
  ];

  const roleProfile = ROLE_ACCESS_PROFILES[currentRole] || ROLE_ACCESS_PROFILES.DEVELOPER_OWNER;
  const visibleMainNav = mainNav.filter(item => isScreenPermitted(currentRole, item.id));
  const visibleRoleNav = roleNav.filter(item => isScreenPermitted(currentRole, item.id));
  const isSettingsAllowed = isScreenPermitted(currentRole, 'settings');
  const canAddProject = hasPermission(currentRole, 'project:create');

  return (
    <aside className="flex flex-col w-64 h-screen shrink-0 bg-white border-r border-slate-200">
      {/* Header / Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-xs">
          <span className="text-white font-bold text-lg leading-none tracking-tight">G</span>
        </div>
        <div>
          <span className="font-bold text-slate-900 text-lg tracking-tight block leading-tight">GroundUp AI</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Construction Finance</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto pb-4">
        {/* Core Lifecycle Nav (Only rendered if user has permitted screens) */}
        {visibleMainNav.length > 0 && (
          <div>
            <div className="px-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Lifecycle & Economics
            </div>
            <div className="space-y-0.5">
              {visibleMainNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold cursor-pointer ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dedicated Role Portals (Only rendered if user has permitted screens) */}
        {visibleRoleNav.length > 0 && (
          <div>
            <div className="px-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Role Workspaces
            </div>
            <div className="space-y-0.5">
              {visibleRoleNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold cursor-pointer ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings Button (Only for authorized roles) */}
        {isSettingsAllowed && (
          <div>
            <button
              onClick={() => onNavigate('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold cursor-pointer ${
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

        {/* Projects List */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Projects</h3>
            {canAddProject && (
              <button 
                onClick={onAddProject}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                title="Add Project"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            {projects.map(project => {
              const isSelected = selectedProjectId === project.id;
              
              return (
                <button
                  key={project.id}
                  onClick={() => onNavigate('project-detail', project.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    isSelected 
                      ? 'bg-emerald-50 text-emerald-900 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(project.status)}`} />
                  <span className="truncate">{project.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer / User Profile & Role Security Badge */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {getInitials(builderProfile.name)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {builderProfile.name}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 truncate">
                  <Shield className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                  <span className="truncate">{roleProfile.badge}</span>
                </span>
              </div>
            </div>
          </div>
          {onSignOut && (
            <button 
              onClick={onSignOut}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
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
