import { UserRole } from '../../shared/types';
import { ActiveNavScreen } from '../components/Sidebar';
import { VALID_ROLES } from './constants';

export function getInitialProject(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const projectFromUrl = params.get('project');
    if (projectFromUrl) return projectFromUrl;

    const projectFromStorage = localStorage.getItem('groundup_selected_project_id');
    if (projectFromStorage) return projectFromStorage;
  } catch {}
  return 'proj-73-broadway';
}

export function getInitialRole(): UserRole {
  try {
    const params = new URLSearchParams(window.location.search);
    const roleFromUrl = params.get('role') as UserRole | null;
    if (roleFromUrl && VALID_ROLES.includes(roleFromUrl)) return roleFromUrl;

    const roleFromStorage = localStorage.getItem('groundup_role') as UserRole | null;
    if (roleFromStorage && VALID_ROLES.includes(roleFromStorage)) return roleFromStorage;
  } catch {}
  return 'DEVELOPER_OWNER';
}

export function getActiveScreenFromPath(pathname: string): ActiveNavScreen {
  if (pathname === '/' || pathname.startsWith('/portfolio')) return 'portfolio';
  if (pathname.startsWith('/deal-lab')) return 'deal-lab';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/lender-portal')) return 'lender-portal';
  if (pathname.startsWith('/gc-fixed-portal')) return 'gc-fixed-portal';
  if (pathname.startsWith('/gc-daily-portal')) return 'gc-daily-portal';
  if (pathname.startsWith('/cfo-recon')) return 'cfo-recon';
  if (pathname.startsWith('/investor-portal')) return 'investor-portal';
  if (pathname.startsWith('/document-intake')) return 'document-intake';
  
  if (pathname.startsWith('/projects/')) {
    const parts = pathname.split('/').filter(Boolean);
    const tab = parts[2];
    if (tab && ['budget', 'draws', 'timeline', 'documents', 'disposition', 'alerts'].includes(tab)) {
      return tab as ActiveNavScreen;
    }
    return 'project-detail';
  }

  if (pathname === '/budget') return 'budget';
  if (pathname === '/draws') return 'draws';
  if (pathname === '/timeline') return 'timeline';
  if (pathname === '/documents') return 'documents';
  if (pathname === '/disposition') return 'disposition';
  if (pathname === '/alerts') return 'alerts';

  return 'portfolio';
}

export function screenToPath(screen: ActiveNavScreen, projectId: string): string {
  switch (screen) {
    case 'portfolio':
      return '/portfolio';
    case 'deal-lab':
      return '/deal-lab';
    case 'settings':
      return '/settings';
    case 'lender-portal':
      return '/lender-portal';
    case 'gc-fixed-portal':
      return '/gc-fixed-portal';
    case 'gc-daily-portal':
      return '/gc-daily-portal';
    case 'cfo-recon':
      return '/cfo-recon';
    case 'investor-portal':
      return '/investor-portal';
    case 'document-intake':
      return '/document-intake';
    case 'project-detail':
      return `/projects/${projectId}/overview`;
    case 'budget':
    case 'draws':
    case 'timeline':
    case 'documents':
    case 'disposition':
    case 'alerts':
      return `/projects/${projectId}/${screen}`;
    default:
      return '/portfolio';
  }
}
