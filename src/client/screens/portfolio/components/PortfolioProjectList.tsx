import React from 'react';
import { EnrichedProject } from '../types';
import { ProjectCatalogGrid } from './ProjectCatalogGrid';

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
  return (
    <ProjectCatalogGrid
      projects={projects}
      onSelectProject={onSelectProject}
      onAddProject={onAddProject}
    />
  );
};
