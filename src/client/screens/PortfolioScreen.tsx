import React, { useState } from 'react';
import { Project } from '../../shared/types';
import { PortfolioFilter } from './portfolio/types';
import { usePortfolioMetrics } from './portfolio/use-portfolio-metrics';
import { PortfolioHeader } from './portfolio/components/PortfolioHeader';
import { PortfolioKPITiles } from './portfolio/components/PortfolioKPITiles';
import { PortfolioAlertBanner } from './portfolio/components/PortfolioAlertBanner';
import { PortfolioFilters } from './portfolio/components/PortfolioFilters';
import { PortfolioProjectList } from './portfolio/components/PortfolioProjectList';
import { PortfolioFooterLinks } from './portfolio/components/PortfolioFooterLinks';

interface PortfolioScreenProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onAddProject: () => void;
  onOpenDealLab: () => void;
  onNavigateDraws: () => void;
  selectedProjectId?: string;
}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = ({
  projects,
  onSelectProject,
  onAddProject,
  onOpenDealLab,
  onNavigateDraws,
  selectedProjectId,
}) => {
  const [filter, setFilter] = useState<PortfolioFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    enrichedProjects,
    activeProjects,
    totalBudget,
    totalSpent,
    totalFunded,
    totalCashExposure,
    spentPct,
  } = usePortfolioMetrics(projects);

  const filteredProjects = enrichedProjects.filter((p) => {
    const matchesFilter =
      filter === 'All' ? true :
      filter === 'Active' ? p.status === 'ACTIVE' :
      filter === 'Completed' ? p.status === 'COMPLETED' : true;

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.gc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lender.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const activeProjectId = selectedProjectId || projects[0]?.id || 'proj-73-broadway';

  return (
    <div className="flex flex-col min-h-full bg-slate-50 overflow-y-auto w-full select-none">
      <div className="max-w-7xl mx-auto px-8 py-8 w-full flex-1 flex flex-col gap-6">
        <PortfolioHeader
          activeCount={activeProjects.length}
          onOpenDealLab={onOpenDealLab}
          onAddProject={onAddProject}
        />

        <PortfolioKPITiles
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          totalFunded={totalFunded}
          totalCashExposure={totalCashExposure}
          spentPct={spentPct}
          activeCount={activeProjects.length}
        />

        <PortfolioAlertBanner onNavigateDraws={onNavigateDraws} />

        <div className="space-y-4">
          <PortfolioFilters
            totalCount={filteredProjects.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filter={filter}
            setFilter={setFilter}
          />

          <PortfolioProjectList
            projects={filteredProjects}
            onSelectProject={onSelectProject}
            onAddProject={onAddProject}
          />
        </div>

        <PortfolioFooterLinks
          onNavigateDraws={onNavigateDraws}
          onOpenDealLab={onOpenDealLab}
          onSelectProject={onSelectProject}
          selectedProjectId={activeProjectId}
        />
      </div>
    </div>
  );
};
