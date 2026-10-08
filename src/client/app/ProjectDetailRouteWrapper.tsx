import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDetailScreen, ProjectTab } from '../screens/ProjectDetailScreen';
import { Project, ProjectFourTruthsSummary, UserRole } from '../../shared/types';

interface ProjectDetailRouteWrapperProps {
  projects: Project[];
  summary: ProjectFourTruthsSummary | null;
  currentRole: UserRole;
  isDrawPacketModalOpen: boolean;
  setIsDrawPacketModalOpen: (open: boolean) => void;
  isChangeOrderModalOpen: boolean;
  setIsChangeOrderModalOpen: (open: boolean) => void;
  setShowAIChat: (open: boolean) => void;
  setProvenanceTarget: (target: { type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay'; category?: string } | null) => void;
  onSelectProject: (id: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
}

const VALID_TABS: ProjectTab[] = ['overview', 'budget', 'draws', 'timeline', 'documents', 'disposition', 'alerts'];

export function ProjectDetailRouteWrapper({
  projects,
  summary,
  currentRole,
  isDrawPacketModalOpen,
  setIsDrawPacketModalOpen,
  isChangeOrderModalOpen,
  setIsChangeOrderModalOpen,
  setShowAIChat,
  setProvenanceTarget,
  onSelectProject,
  selectedProjectId,
  setSelectedProjectId,
}: ProjectDetailRouteWrapperProps) {
  const { projectId, tab } = useParams<{ projectId?: string; tab?: string }>();
  const navigate = useNavigate();

  const activeProjectId = projectId || selectedProjectId || projects[0]?.id || 'proj-73-broadway';

  useEffect(() => {
    if (projectId && projectId !== selectedProjectId) {
      setSelectedProjectId(projectId);
      onSelectProject(projectId);
    }
  }, [projectId]);

  const activeTab: ProjectTab = (tab && VALID_TABS.includes(tab as ProjectTab)) ? (tab as ProjectTab) : 'overview';

  return (
    <ProjectDetailScreen
      projectId={activeProjectId}
      projects={projects}
      onSelectProject={(id) => {
        setSelectedProjectId(id);
        onSelectProject(id);
        navigate(`/projects/${id}/${activeTab}`);
      }}
      summary={summary}
      onBack={() => navigate('/portfolio')}
      onSubmitDraw={() => setIsDrawPacketModalOpen(true)}
      onOpenLenderPackage={() => {}}
      onOpenInvoices={() => {}}
      onOpenAIChat={() => setShowAIChat(true)}
      onInspectProvenance={(type, category) => setProvenanceTarget({ type, category })}
      initialTab={activeTab}
      onTabChange={(newTab) => {
        navigate(`/projects/${activeProjectId}/${newTab}`);
      }}
      currentRole={currentRole}
      isDrawPacketModalOpen={isDrawPacketModalOpen}
      onCloseDrawPacketModal={() => setIsDrawPacketModalOpen(false)}
      isChangeOrderModalOpen={isChangeOrderModalOpen}
      onCloseChangeOrderModal={() => setIsChangeOrderModalOpen(false)}
    />
  );
}
