import { useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthenticatedUser } from '../screens/AuthScreen';
import { UserRole } from '../../shared/types';
import { ActiveNavScreen } from '../components/Sidebar';
import { OnboardingCompletionPayload } from '../onboarding/types';
import { VALID_ROLES } from './constants';
import { getInitialProject, getInitialRole, getActiveScreenFromPath, screenToPath } from './nav-helpers';
import { getRoleDefaultScreen } from '../../shared/rbac/matrix';
import { createProjectFromDeal, createProjectFromOnboardingData } from './project-factory';
import { useSyncStorage } from './use-sync-storage';
import { useProjectSync } from './use-project-sync';

export function useAppState() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
    try {
      const stored = localStorage.getItem('groundup_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(getInitialRole);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(getInitialProject);

  const { projects, setProjects, summary, fetchProjectSummary } = useProjectSync(currentUser, selectedProjectId);

  const [showAIChat, setShowAIChat] = useState(false);
  const [isDrawPacketModalOpen, setIsDrawPacketModalOpen] = useState(false);
  const [isChangeOrderModalOpen, setIsChangeOrderModalOpen] = useState(false);
  const [provenanceTarget, setProvenanceTarget] = useState<{
    type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay';
    category?: string;
  } | null>(null);

  const currentScreen = useMemo(() => getActiveScreenFromPath(location.pathname), [location.pathname]);

  useSyncStorage({
    selectedProjectId,
    setSelectedProjectId,
    currentRole,
    setCurrentRole,
    currentScreen,
    searchParams,
  });

  const handleAuthenticate = (user: AuthenticatedUser) => {
    setCurrentUser(user);
    try { localStorage.setItem('groundup_user', JSON.stringify(user)); } catch {}

    if (user.role && VALID_ROLES.includes(user.role as UserRole)) {
      const targetRole = user.role as UserRole;
      setCurrentRole(targetRole);
      try { localStorage.setItem('groundup_role', targetRole); } catch {}
      navigate(screenToPath(getRoleDefaultScreen(targetRole), selectedProjectId));
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('groundup_user');
      localStorage.removeItem('groundup_current_screen');
      localStorage.removeItem('groundup_selected_project_id');
      localStorage.removeItem('groundup_role');
    } catch {}
    setCurrentUser(null);
    navigate('/portfolio');
  };

  const handleNavigate = (screen: ActiveNavScreen, projId?: string) => {
    const targetProject = projId || selectedProjectId;
    if (projId) setSelectedProjectId(projId);
    navigate(screenToPath(screen, targetProject));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    fetchProjectSummary(projId);
    if (location.pathname.startsWith('/projects/')) {
      const parts = location.pathname.split('/').filter(Boolean);
      navigate(`/projects/${projId}/${parts[2] || 'overview'}`);
    }
  };

  const handleSaveDealAsProject = (dealData: any) => {
    const newProject = createProjectFromDeal(dealData, currentUser?.id);
    setProjects(prev => {
      const updated = [newProject, ...prev];
      try { localStorage.setItem('groundup_projects', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setSelectedProjectId(newProject.id);
    navigate(`/projects/${newProject.id}/overview`);
  };

  const handleOnboardingComplete = (payloadOrProjectId: any, reportData?: any) => {
    if (payloadOrProjectId && typeof payloadOrProjectId === 'object' && payloadOrProjectId.role) {
      const payload = payloadOrProjectId as OnboardingCompletionPayload;
      let newSelectedProjId = selectedProjectId;

      if (payload.project) {
        newSelectedProjId = payload.project.id;
        setProjects(prev => {
          const updated = [payload.project!, ...prev];
          try { localStorage.setItem('groundup_projects', JSON.stringify(updated)); } catch {}
          return updated;
        });
        setSelectedProjectId(payload.project.id);
      }

      setCurrentRole(payload.role);
      try { localStorage.setItem('groundup_role', payload.role); } catch {}
      if (payload.setupTasks) {
        try { localStorage.setItem('groundup_setup_tasks', JSON.stringify(payload.setupTasks)); } catch {}
      }

      const updatedUser: AuthenticatedUser = {
        ...currentUser!,
        role: payload.role,
        name: payload.userName || currentUser?.name || 'User',
        company: payload.userCompany || currentUser?.company || 'Company',
        isNewUser: false,
      };
      setCurrentUser(updatedUser);
      try { localStorage.setItem('groundup_user', JSON.stringify(updatedUser)); } catch {}
      handleNavigate(payload.targetScreen, newSelectedProjId);
      return;
    }

    const projectId = typeof payloadOrProjectId === 'string' ? payloadOrProjectId : `proj-${Date.now()}`;
    const newProject = createProjectFromOnboardingData(projectId, reportData || {}, currentUser?.id);
    setProjects(prev => {
      const updated = [newProject, ...prev];
      try { localStorage.setItem('groundup_projects', JSON.stringify(updated)); } catch {}
      return updated;
    });

    const updatedUser = { ...currentUser!, isNewUser: false };
    setCurrentUser(updatedUser);
    try { localStorage.setItem('groundup_user', JSON.stringify(updatedUser)); } catch {}
    setSelectedProjectId(projectId);
    navigate(`/projects/${projectId}/overview`);
  };

  return {
    currentUser,
    setCurrentUser,
    currentRole,
    setCurrentRole,
    selectedProjectId,
    setSelectedProjectId,
    projects,
    summary,
    showAIChat,
    setShowAIChat,
    isDrawPacketModalOpen,
    setIsDrawPacketModalOpen,
    isChangeOrderModalOpen,
    setIsChangeOrderModalOpen,
    provenanceTarget,
    setProvenanceTarget,
    currentScreen,
    navigate,
    handleAuthenticate,
    handleSignOut,
    handleNavigate,
    handleSelectProject,
    handleSaveDealAsProject,
    handleOnboardingComplete,
  };
}
