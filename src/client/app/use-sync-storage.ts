import { useEffect } from 'react';
import { UserRole } from '../../shared/types';
import { VALID_ROLES } from './constants';

interface UseSyncStorageParams {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentScreen: string;
  searchParams: URLSearchParams;
}

export function useSyncStorage({
  currentRole,
  setCurrentRole,
  currentScreen,
  searchParams,
}: UseSyncStorageParams) {
  useEffect(() => {
    try {
      localStorage.setItem('groundup_role', currentRole);
      localStorage.setItem('groundup_current_screen', currentScreen);
    } catch {}
  }, [currentRole, currentScreen]);

  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole | null;
    if (roleParam && VALID_ROLES.includes(roleParam) && roleParam !== currentRole) {
      setCurrentRole(roleParam);
    }
  }, [searchParams]);
}
