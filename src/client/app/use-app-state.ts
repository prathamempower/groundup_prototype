import { useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthenticatedUser } from '../screens/AuthScreen';
import { UserRole } from '../../shared/types';
import { ActiveNavScreen } from '../components/Sidebar';
import { OnboardingCompletionPayload } from '../onboarding/types';
import { VALID_ROLES } from './constants';
import { getInitialRole, getActiveScreenFromPath, screenToPath } from './nav-helpers';
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

  // Single source of truth: Active project ID derived directly from the URL route parameter
  const activeProjectId = useMemo(() => {
    const match = location.pathname.match(/^\/projects\/([^/]+)/);
    if (match && match[1] && match[1] !== 'new') {
      return match[1];
    }
    return null;
  }, [location.pathname]);

  const { projects, setProjects, summary, fetchProjectSummary } = useProjectSync(
    currentUser,
    activeProjectId
  );

  const [showAIChat, setShowAIChat] = useState(false);
  const [isDrawPacketModalOpen, setIsDrawPacketModalOpen] = useState(false);
  const [isChangeOrderModalOpen, setIsChangeOrderModalOpen] = useState(false);
  const [provenanceTarget, setProvenanceTarget] = useState<{
    type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay';
    category?: string;
  } | null>(null);

  const currentScreen = useMemo(
    () => getActiveScreenFromPath(location.pathname),
    [location.pathname]
  );

  useSyncStorage({
    currentRole,
    setCurrentRole,
    currentScreen,
    searchParams,
  });

  const handleAuthenticate = (user: AuthenticatedUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('groundup_user', JSON.stringify(user));
    } catch {}

    if (user.role && VALID_ROLES.includes(user.role as UserRole)) {
      const targetRole = user.role as UserRole;
      setCurrentRole(targetRole);
      try {
        localStorage.setItem('groundup_role', targetRole);
      } catch {}
      navigate(screenToPath(getRoleDefaultScreen(targetRole), activeProjectId || undefined));
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
    navigate('/projects');
  };

  const handleNavigate = (screen: ActiveNavScreen, projId?: string) => {
    const targetProject = projId || activeProjectId || undefined;
    navigate(screenToPath(screen, targetProject));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProject = (projId: string) => {
    navigate(`/projects/${projId}/overview`);
  };

  const handleSaveDealAsProject = (dealData: any) => {
    const newProject = createProjectFromDeal(dealData, currentUser?.id);
    setProjects((prev) => {
      const updated = [newProject, ...prev];
      try {
        localStorage.setItem('groundup_projects', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    navigate(`/projects/${newProject.id}/overview`);
  };

  const handleOnboardingComplete = (payloadOrProjectId: any, reportData?: any) => {
    if (payloadOrProjectId && typeof payloadOrProjectId === 'object' && payloadOrProjectId.role) {
      const payload = payloadOrProjectId as OnboardingCompletionPayload;
      let targetProjId = activeProjectId;

      if (payload.project) {
        targetProjId = payload.project.id;
        setProjects((prev) => {
          const updated = [payload.project!, ...prev];
          try {
            localStorage.setItem('groundup_projects', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }

      setCurrentRole(payload.role);
      try {
        localStorage.setItem('groundup_role', payload.role);
      } catch {}
      if (payload.setupTasks) {
        try {
          localStorage.setItem('groundup_setup_tasks', JSON.stringify(payload.setupTasks));
        } catch {}
      }

      const updatedUser: AuthenticatedUser = {
        ...currentUser!,
        role: payload.role,
        name: payload.userName || currentUser?.name || 'User',
        company: payload.userCompany || currentUser?.company || 'Company',
        isNewUser: false,
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('groundup_user', JSON.stringify(updatedUser));
      } catch {}
      handleNavigate(payload.targetScreen, targetProjId || undefined);
      return;
    }

    const projectId =
      typeof payloadOrProjectId === 'string' ? payloadOrProjectId : `proj-${Date.now()}`;
    const newProject = createProjectFromOnboardingData(projectId, reportData || {}, currentUser?.id);
    setProjects((prev) => {
      const updated = [newProject, ...prev];
      try {
        localStorage.setItem('groundup_projects', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const updatedUser = { ...currentUser!, isNewUser: false };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('groundup_user', JSON.stringify(updatedUser));
    } catch {}
    navigate(`/projects/${projectId}/overview`);
  };

  return {
    currentUser,
    setCurrentUser,
    currentRole,
    setCurrentRole,
    activeProjectId,
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
