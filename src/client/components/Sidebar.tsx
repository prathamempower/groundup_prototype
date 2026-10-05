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
  Settings
} from 'lucide-react';

export type ActiveNavScreen = 
  | 'portfolio' 
  | 'project-detail' 
  | 'budget'
  | 'draws' 
  | 'timeline'
  | 'documents' 
  | 'disposition'
  | 'deal-lab' 
  | 'alerts'
  | 'settings';

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
  alertsCount = 0
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
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="flex flex-col w-64 h-screen shrink-0 bg-white border-r border-slate-200">
      {/* Header / Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
          <span className="text-white font-bold text-xl leading-none tracking-tighter">G</span>
        </div>
        <span className="font-bold text-slate-900 text-xl tracking-tight">GroundUp AI</span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="space-y-1 mb-8">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Projects List */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Projects</h3>
            <button 
              onClick={onAddProject}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-colors"
              title="Add Project"
            >
              <Plus className="w-4 h-4" />
            </button>
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

      {/* Footer / User Profile */}
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
              <span className="text-xs text-slate-500 truncate">
                {builderProfile.company}
              </span>
            </div>
          </div>
          {onSignOut && (
            <button 
              onClick={onSignOut}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
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
