import { useEffect } from 'react';
import { UserRole } from '../../shared/types';
import { VALID_ROLES } from './constants';

interface UseSyncStorageParams {
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentScreen: string;
  searchParams: URLSearchParams;
}

export function useSyncStorage({
  selectedProjectId,
  setSelectedProjectId,
  currentRole,
  setCurrentRole,
  currentScreen,
  searchParams,
}: UseSyncStorageParams) {
  useEffect(() => {
    try {
      localStorage.setItem('groundup_selected_project_id', selectedProjectId);
      localStorage.setItem('groundup_role', currentRole);
      localStorage.setItem('groundup_current_screen', currentScreen);
    } catch {}
  }, [selectedProjectId, currentRole, currentScreen]);

  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole | null;
    if (roleParam && VALID_ROLES.includes(roleParam) && roleParam !== currentRole) {
      setCurrentRole(roleParam);
    }
    const projectParam = searchParams.get('project');
    if (projectParam && projectParam !== selectedProjectId) {
      setSelectedProjectId(projectParam);
    }
  }, [searchParams]);
}
