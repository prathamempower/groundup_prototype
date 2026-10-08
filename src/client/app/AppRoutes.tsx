import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { NewProjectScreen } from '../screens/new-project/NewProjectScreen';
import { ProjectDetailRouteWrapper } from './ProjectDetailRouteWrapper';
import { DealLabScreen } from '../screens/DealLabScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
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
              onNavigateDraws={() => onNavigate('draws')}
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
                navigate('/portfolio');
              }}
              onCancel={() => navigate('/portfolio')}
            />
          ) : (
            <Navigate to={defaultRolePath} replace />
          )
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
            selectedProjectId={selectedProjectId}
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
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
        }
      />

      <Route path="/overview" element={<Navigate to={`/projects/${selectedProjectId}/overview`} replace />} />
      <Route path="/acquisition" element={<Navigate to={`/projects/${selectedProjectId}/acquisition`} replace />} />
      <Route path="/permits" element={<Navigate to={`/projects/${selectedProjectId}/permits`} replace />} />
      <Route path="/financing" element={<Navigate to={`/projects/${selectedProjectId}/financing`} replace />} />
      <Route path="/budget" element={<Navigate to={`/projects/${selectedProjectId}/budget`} replace />} />
      <Route path="/draws" element={<Navigate to={`/projects/${selectedProjectId}/draws`} replace />} />
      <Route path="/timeline" element={<Navigate to={`/projects/${selectedProjectId}/timeline`} replace />} />
      <Route path="/recon" element={<Navigate to={`/projects/${selectedProjectId}/recon`} replace />} />
      <Route path="/documents" element={<Navigate to={`/projects/${selectedProjectId}/documents`} replace />} />
      <Route path="/disposition" element={<Navigate to={`/projects/${selectedProjectId}/disposition`} replace />} />
      <Route path="/alerts" element={<Navigate to={`/projects/${selectedProjectId}/alerts`} replace />} />
      <Route path="/reports" element={<Navigate to={`/projects/${selectedProjectId}/overview`} replace />} />

      {renderPortalRoutes({ projects, selectedProjectId, onSelectProject })}

      <Route
        path="/deal-lab"
        element={
          isScreenPermitted(currentRole, 'deal-lab') ? (
            <DealLabScreen
              onBack={() => navigate('/portfolio')}
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
              onBack={() => navigate('/portfolio')} 
              onRestartOnboarding={() => setCurrentUser(prev => prev ? { ...prev, isNewUser: true } : null)}
            />
          ) : (
            <Navigate to={defaultRolePath} replace />
          )
        }
      />

      <Route path="*" element={<Navigate to={defaultRolePath} replace />} />
    </Routes>
  );
}
