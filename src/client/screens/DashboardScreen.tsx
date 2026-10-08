import React from 'react';
import { ProjectFourTruthsSummary, UserRole } from '../../shared/types';
import { RoleContextBanner } from './dashboard/components/RoleContextBanner';
import { CriticalAlertBar } from './dashboard/components/CriticalAlertBar';
import { DeveloperExposureCard } from './dashboard/components/DeveloperExposureCard';
import { FourTruthsGrid } from './dashboard/components/FourTruthsGrid';
import { LoanCarryingCostCard } from './dashboard/components/LoanCarryingCostCard';

interface DashboardScreenProps {
  summary: ProjectFourTruthsSummary | null;
  activeRole: UserRole;
  onOpenProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', cat?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  summary,
  activeRole,
  onOpenProvenance,
  onNavigateTab,
}) => {
  if (!summary) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Calculating Four Truths from user-entered records...</p>
      </div>
    );
  }

  const criticalAlerts = summary.active_alerts;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <RoleContextBanner activeRole={activeRole} />

      <CriticalAlertBar
        criticalAlerts={criticalAlerts}
        onNavigateAlerts={() => onNavigateTab('alerts')}
      />

      <DeveloperExposureCard
        summary={summary}
        onOpenProvenance={onOpenProvenance}
      />

      <FourTruthsGrid
        summary={summary}
        onOpenProvenance={onOpenProvenance}
        onNavigateTab={onNavigateTab}
      />

      <LoanCarryingCostCard summary={summary} />
    </div>
  );
};
