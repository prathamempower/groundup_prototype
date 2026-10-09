// GroundUp AI — Project Detail & Control Center Screen
// Full Lifecycle: Acquisition → Construction & Draws → Disposition & Unit Sales → Investor ROI
// Role-Tailored for Owner, CFO, PM, GC (Fixed/Daily), and Investor

import React from 'react';
import { Project, ProjectFourTruthsSummary, UserRole } from '../../shared/types';
import { ProjectTab } from './project-detail/types';
import { useProjectDetailState } from './project-detail/use-project-detail-state';
import { ProjectDetailHeader } from './project-detail/components/ProjectDetailHeader';
import { ProjectDetailTabContent } from './project-detail/components/ProjectDetailTabContent';
import { ProjectDetailModals } from './project-detail/components/ProjectDetailModals';

export type { ProjectTab };

export interface ProjectDetailScreenProps {
  projectId: string;
  projects?: Project[];
  onSelectProject?: (projectId: string) => void;
  summary: ProjectFourTruthsSummary | null;
  onBack: () => void;
  onSubmitDraw: () => void;
  onOpenLenderPackage: () => void;
  onOpenInvoices: () => void;
  onOpenAIChat: () => void;
  onInspectProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', category?: string) => void;
  initialTab?: ProjectTab;
  onTabChange?: (tab: ProjectTab) => void;
  currentRole?: UserRole;
  isDrawPacketModalOpen?: boolean;
  onCloseDrawPacketModal?: () => void;
  isChangeOrderModalOpen?: boolean;
  onCloseChangeOrderModal?: () => void;
}

export function ProjectDetailScreen(props: ProjectDetailScreenProps) {
  const {
    projectId,
    projects = [],
    summary,
    onBack,
    onOpenLenderPackage,
    onOpenInvoices,
    onInspectProvenance,
    initialTab = 'overview',
    onTabChange,
    currentRole = 'OWNER',
    isDrawPacketModalOpen = false,
    onCloseDrawPacketModal,
    isChangeOrderModalOpen = false,
    onCloseChangeOrderModal,
  } = props;

  const state = useProjectDetailState(
    projectId,
    projects,
    initialTab,
    isDrawPacketModalOpen,
    isChangeOrderModalOpen
  );

  const projectName = state.selectedProject?.name || summary?.project_name || '73 Broadway, Hoboken';

  const handleTabSelect = (tab: ProjectTab) => {
    state.setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto space-y-3">
          <ProjectDetailHeader
            projectName={projectName}
            selectedProject={state.selectedProject}
            currentRole={currentRole}
            onBack={onBack}
            onOpenClaimModal={() => state.setIsDrawPacketModalOpenLocal(true)}
            onOpenDailyLog={() => handleTabSelect('timeline')}
            onOpenChangeOrderModal={() => state.setIsChangeOrderModalOpenLocal(true)}
            onOpenDrawPacketModal={() => state.setIsDrawPacketModalOpenLocal(true)}
          />
        </div>
      </div>

      <ProjectDetailTabContent
        state={state}
        currentRole={currentRole}
        onInspectProvenance={onInspectProvenance}
        onOpenLenderPackage={onOpenLenderPackage}
        onOpenInvoices={onOpenInvoices}
      />

      <ProjectDetailModals
        state={state}
        onCloseChangeOrderModal={onCloseChangeOrderModal}
        onCloseDrawPacketModal={onCloseDrawPacketModal}
      />
    </div>
  );
}
