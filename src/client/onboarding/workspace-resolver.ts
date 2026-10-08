import { OnboardingState } from './types';
import { UserRole, ActiveNavScreen } from '../../shared/types';

export function resolveTargetWorkspace(state: OnboardingState): { 
  role: UserRole; 
  targetScreen: ActiveNavScreen;
  roleDisplayName: string;
} {
  switch (state.role) {
    case 'OWNER':
      return {
        role: 'DEVELOPER_OWNER',
        targetScreen: state.owner_mode === 'new_project' ? 'project-detail' : 'portfolio',
        roleDisplayName: 'Developer / Owner',
      };

    case 'ADMIN':
      return {
        role: 'DEVELOPER_OWNER',
        targetScreen: 'settings',
        roleDisplayName: 'Workspace Admin',
      };

    case 'PROJECT_MANAGER':
      return {
        role: 'PM',
        targetScreen: 'timeline',
        roleDisplayName: 'Project Manager',
      };

    case 'GENERAL_CONTRACTOR':
      if (state.gc_contract_type === 'DAILY_UPDATES') {
        return {
          role: 'GC_DAILY',
          targetScreen: 'gc-daily-portal',
          roleDisplayName: 'General Contractor (Daily Logs & Receipts)',
        };
      }
      return {
        role: 'GC_FIXED',
        targetScreen: 'gc-fixed-portal',
        roleDisplayName: 'General Contractor (Fixed Milestones)',
      };

    case 'FINANCE':
      return {
        role: 'CFO',
        targetScreen: 'cfo-recon',
        roleDisplayName: 'Finance / CFO',
      };

    case 'ACCOUNTANT':
      return {
        role: 'ACCOUNTANT',
        targetScreen: state.acct_focus === 'ap_invoicing' ? 'document-intake' : 'cfo-recon',
        roleDisplayName: 'Accountant / Controller',
      };

    case 'INVESTOR':
      return {
        role: 'INVESTOR',
        targetScreen: 'investor-portal',
        roleDisplayName: 'Investor / Capital Partner',
      };

    case 'VIEWER':
      return {
        role: 'INVESTOR',
        targetScreen: state.viewer_scope === 'plans_permits' ? 'documents' : 'portfolio',
        roleDisplayName: 'Viewer / Advisory (Read-Only)',
      };

    default:
      return {
        role: 'DEVELOPER_OWNER',
        targetScreen: 'portfolio',
        roleDisplayName: 'Developer / Owner',
      };
  }
}
