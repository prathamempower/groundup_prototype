import React from 'react';
import { Building2, Plus, SearchX } from 'lucide-react';
import { EnrichedProject } from '../types';
import { ProjectCard } from './ProjectCard';
import { ProjectCardSkeleton } from './ProjectCardSkeleton';

interface ProjectCatalogGridProps {
  projects: EnrichedProject[];
  onSelectProject: (projectId: string) => void;
  onAddProject: () => void;
  isLoading?: boolean;
  onClearFilters?: () => void;
}

export const ProjectCatalogGrid: React.FC<ProjectCatalogGridProps> = ({
  projects,
  onSelectProject,
  onAddProject,
  isLoading = false,
  onClearFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <ProjectCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-white border border-slate-200/80 rounded-2xl shadow-2xs border-dashed text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mb-4 text-slate-400">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1.5">No matching projects found</h3>
        <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
          No projects matched your active filters or search criteria. Try clearing your search or add a new project to your pipeline.
        </p>
        <div className="flex items-center gap-3">
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={onAddProject}
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl transition text-xs font-bold shadow-xs cursor-pointer gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelectProject={onSelectProject}
        />
      ))}
    </div>
  );
};
