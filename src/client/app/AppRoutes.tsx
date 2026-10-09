import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { NewProjectScreen } from '../screens/new-project/NewProjectScreen';
import { ProjectDetailRouteWrapper } from './ProjectDetailRouteWrapper';
import { DealLabScreen } from '../screens/DealLabScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DrawBuilderScreen } from '../screens/draw-builder/DrawBuilderScreen';
import { DocumentReviewScreen } from '../screens/document-review/DocumentReviewScreen';
import { InvoicesScreen } from '../screens/invoices/InvoicesScreen';
import { NotFoundScreen } from '../components/NotFoundScreen';
import { Project, ProjectFourTruthsSummary, UserRole } from '../../shared/types';
import { ActiveNavScreen } from '../components/Sidebar';
import { AuthenticatedUser } from '../screens/AuthScreen';
import { renderPortalRoutes } from './PortalRoutes';
import { isScreenPermitted, hasPermission } from '../../shared/rbac';

interface AppRoutesProps {
  projects: Project[];
  summary: ProjectFourTruthsSummary | null;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  currentRole: UserRole;
  defaultRolePath: string;
  isDrawPacketModalOpen: boolean;
  setIsDrawPacketModalOpen: (open: boolean) => void;
  isChangeOrderModalOpen: boolean;
  setIsChangeOrderModalOpen: (open: boolean) => void;
  setShowAIChat: (open: boolean) => void;
  setProvenanceTarget: (target: any) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthenticatedUser | null>>;
  onNavigate: (screen: ActiveNavScreen, projId?: string) => void;
  onSelectProject: (id: string) => void;
  onSaveDealAsProject: (deal: any) => void;
}

export function AppRoutes({
  projects,
  summary,
  selectedProjectId,
  setSelectedProjectId,
  currentRole,
  defaultRolePath,
  isDrawPacketModalOpen,
  setIsDrawPacketModalOpen,
  isChangeOrderModalOpen,
  setIsChangeOrderModalOpen,
  setShowAIChat,
  setProvenanceTarget,
  setCurrentUser,
  onNavigate,
  onSelectProject,
  onSaveDealAsProject,
}: AppRoutesProps) {
  const navigate = useNavigate();
  const safeProjectId = selectedProjectId || projects[0]?.id || 'proj-73-broadway';

  const handleBackToSafeScreen = () => {
    if (isScreenPermitted(currentRole, 'portfolio')) {
      navigate('/portfolio');
    } else {
      navigate(defaultRolePath, { replace: true });
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRolePath} replace />} />

      <Route
        path="/portfolio"
        element={
          isScreenPermitted(currentRole, 'portfolio') ? (
            <PortfolioScreen
              projects={projects}
              onSelectProject={(id) => {
                onSelectProject(id);
                navigate(`/projects/${id}/overview`);
              }}
              onAddProject={() => navigate('/new-project')}
              onOpenDealLab={() => onNavigate('deal-lab')}
              onNavigateDraws={() => navigate(`/projects/${safeProjectId}/draws/new`)}
              selectedProjectId={safeProjectId}
            />
          ) : (
            <Navigate to={defaultRolePath} replace />
          )
        }
      />

      <Route
        path="/new-project"
        element={
          hasPermission(currentRole, 'project:create') ? (
            <NewProjectScreen
              onComplete={(data) => {
                if (data && (data.projectName || data.propertyAddress)) {
                  onSaveDealAsProject({
                    address: data.propertyAddress || data.projectName,
                    hardCosts: Number(data.hardCosts) || Number(data.estimatedTotalCost) || 1500000,
                    acquisitionCost: Number(data.acquisitionCost) || 950000,
                    units: 4,
                    sqFt: 4500,
                    arv: Number(data.estimatedTotalCost) ? Number(data.estimatedTotalCost) * 1.3 : 3200000,
                  });
                }
                handleBackToSafeScreen();
              }}
              onCancel={handleBackToSafeScreen}
            />
          ) : (
            <Navigate to={defaultRolePath} replace />
          )
        }
      />

      <Route
        path="/projects/:projectId/draws/new"
        element={
          <DrawBuilderScreen
            projects={projects}
            summary={summary}
            currentRole={currentRole}
          />
        }
      />

      <Route
        path="/projects/:projectId/documents/:docId/review"
        element={
          <DocumentReviewScreen
            projects={projects}
            summary={summary}
            currentRole={currentRole}
          />
        }
      />

      <Route
        path="/projects/:projectId/invoices"
        element={
          <InvoicesScreen
            projects={projects}
            summary={summary}
            currentRole={currentRole}
          />
        }
      />

      <Route
        path="/projects/:projectId"
        element={
          <ProjectDetailRouteWrapper
            projects={projects}
            summary={summary}
            currentRole={currentRole}
            isDrawPacketModalOpen={isDrawPacketModalOpen}
            setIsDrawPacketModalOpen={setIsDrawPacketModalOpen}
            isChangeOrderModalOpen={isChangeOrderModalOpen}
            setIsChangeOrderModalOpen={setIsChangeOrderModalOpen}
            setShowAIChat={setShowAIChat}
            setProvenanceTarget={setProvenanceTarget}
            onSelectProject={onSelectProject}
            selectedProjectId={safeProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
        }
      />

      <Route
        path="/projects/:projectId/:tab"
        element={
          <ProjectDetailRouteWrapper
            projects={projects}
            summary={summary}
            currentRole={currentRole}
            isDrawPacketModalOpen={isDrawPacketModalOpen}
            setIsDrawPacketModalOpen={setIsDrawPacketModalOpen}
            isChangeOrderModalOpen={isChangeOrderModalOpen}
            setIsChangeOrderModalOpen={setIsChangeOrderModalOpen}
            setShowAIChat={setShowAIChat}
            setProvenanceTarget={setProvenanceTarget}
            onSelectProject={onSelectProject}
            selectedProjectId={safeProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
        }
      />

      <Route path="/overview" element={<Navigate to={`/projects/${safeProjectId}/overview`} replace />} />
      <Route path="/acquisition" element={<Navigate to={`/projects/${safeProjectId}/acquisition`} replace />} />
      <Route path="/permits" element={<Navigate to={`/projects/${safeProjectId}/permits`} replace />} />
      <Route path="/financing" element={<Navigate to={`/projects/${safeProjectId}/financing`} replace />} />
      <Route path="/budget" element={<Navigate to={`/projects/${safeProjectId}/budget`} replace />} />
      <Route path="/draws" element={<Navigate to={`/projects/${safeProjectId}/draws`} replace />} />
      <Route path="/timeline" element={<Navigate to={`/projects/${safeProjectId}/timeline`} replace />} />
      <Route path="/recon" element={<Navigate to={`/projects/${safeProjectId}/recon`} replace />} />
      <Route path="/documents" element={<Navigate to={`/projects/${safeProjectId}/documents`} replace />} />
      <Route path="/disposition" element={<Navigate to={`/projects/${safeProjectId}/disposition`} replace />} />
      <Route path="/alerts" element={<Navigate to={`/projects/${safeProjectId}/alerts`} replace />} />
      <Route path="/reports" element={<Navigate to={`/projects/${safeProjectId}/overview`} replace />} />

      {renderPortalRoutes({ projects, selectedProjectId: safeProjectId, onSelectProject })}

      <Route
        path="/deal-lab"
        element={
          isScreenPermitted(currentRole, 'deal-lab') ? (
            <DealLabScreen
              onBack={handleBackToSafeScreen}
              onSaveAsProject={onSaveDealAsProject}
            />
          ) : (
            <Navigate to={defaultRolePath} replace />
          )
        }
      />

      <Route
        path="/settings"
        element={
          isScreenPermitted(currentRole, 'settings') ? (
            <SettingsScreen 
              onBack={handleBackToSafeScreen} 
              onRestartOnboarding={() => setCurrentUser(prev => prev ? { ...prev, isNewUser: true } : null)}
            />
          ) : (
            <Navigate to={defaultRolePath} replace />
          )
        }
      />

      <Route
        path="*"
        element={
          <NotFoundScreen
            defaultRolePath={defaultRolePath}
            onNavigateHome={() => navigate(defaultRolePath, { replace: true })}
          />
        }
      />
    </Routes>
  );
}

