import React, { useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ProjectDetailScreen, ProjectTab } from '../screens/ProjectDetailScreen';
import { Project, ProjectFourTruthsSummary, UserRole } from '../../shared/types';
import { isProjectTabPermitted, getRoleDefaultTab } from '../../shared/rbac';

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
}

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
}: ProjectDetailRouteWrapperProps) {
  const { projectId, tab } = useParams<{ projectId: string; tab?: string }>();
  const navigate = useNavigate();

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  const activeProject = projects.find((p) => p.id === projectId);

  // If projects are loaded and projectId does not exist, show clear project not found
  if (!activeProject && projects.length > 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-500 font-mono text-sm font-bold">
            404
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900">Project Not Found</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              No project found with ID <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">{projectId}</code>. It may have been archived or deleted.
            </p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Return to Projects Catalog
          </button>
        </div>
      </div>
    );
  }

  const activeTab: ProjectTab = (tab && isProjectTabPermitted(currentRole, tab as ProjectTab))
    ? (tab as ProjectTab)
    : getRoleDefaultTab(currentRole);

  useEffect(() => {
    if (tab && !isProjectTabPermitted(currentRole, tab as ProjectTab)) {
      const defaultTab = getRoleDefaultTab(currentRole);
      navigate(`/projects/${projectId}/${defaultTab}`, { replace: true });
    }
  }, [tab, currentRole, projectId, navigate]);

  return (
    <ProjectDetailScreen
      projectId={projectId}
      projects={projects}
      summary={summary}
      onBack={() => navigate('/projects')}
      onSubmitDraw={() => setIsDrawPacketModalOpen(true)}
      onOpenLenderPackage={() => navigate(`/projects/${projectId}/draws/new`)}
      onOpenInvoices={() => navigate(`/projects/${projectId}/invoices`)}
      onOpenAIChat={() => setShowAIChat(true)}
      onInspectProvenance={(type, category) => setProvenanceTarget({ type, category })}
      initialTab={activeTab}
      onTabChange={(newTab) => {
        navigate(`/projects/${projectId}/${newTab}`);
      }}
      currentRole={currentRole}
      isDrawPacketModalOpen={isDrawPacketModalOpen}
      onCloseDrawPacketModal={() => setIsDrawPacketModalOpen(false)}
      isChangeOrderModalOpen={isChangeOrderModalOpen}
      onCloseChangeOrderModal={() => setIsChangeOrderModalOpen(false)}
    />
  );
}
