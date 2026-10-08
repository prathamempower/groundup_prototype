import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { EnrichedProject } from '../types';
import { ProjectCardItem } from './ProjectCardItem';

interface PortfolioProjectListProps {
  projects: EnrichedProject[];
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
}

export const PortfolioProjectList: React.FC<PortfolioProjectListProps> = ({
  projects,
  onSelectProject,
  onAddProject,
}) => {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-2xl shadow-2xs border-dashed text-center">
        <div className="p-4 bg-slate-50 rounded-2xl mb-3">
          <Building2 className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">No matching projects found</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          Try adjusting your search criteria or underwrite a new deal to add to the portfolio.
        </p>
        <button
          onClick={onAddProject}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition text-xs font-bold shadow-xs cursor-pointer gap-1.5"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Project</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-3.5">
      {projects.map((project) => (
        <ProjectCardItem
          key={project.id}
          project={project}
          onSelectProject={onSelectProject}
        />
      ))}
    </div>
  );
};
