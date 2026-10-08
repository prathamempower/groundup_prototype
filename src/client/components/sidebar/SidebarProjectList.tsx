import React from 'react';
import { Plus } from 'lucide-react';
import { ActiveNavScreen } from '../../../shared/rbac/matrix';

interface SidebarProjectListProps {
  projects: Array<{ id: string; name: string; status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' }>;
  selectedProjectId: string;
  canAddProject: boolean;
  onAddProject: () => void;
  onNavigate: (screen: ActiveNavScreen, projectId?: string) => void;
}

export function SidebarProjectList({
  projects,
  selectedProjectId,
  canAddProject,
  onAddProject,
  onNavigate,
}: SidebarProjectListProps) {
  const getStatusColor = (status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED') => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500';
      case 'ON_HOLD':
        return 'bg-amber-500';
      case 'COMPLETED':
        return 'bg-blue-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
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
        {projects.map((project) => {
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
  );
}
