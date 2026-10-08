import { UserRole } from '../types';

export type ActiveNavScreen = 
  | 'portfolio' 
  | 'project-detail' 
  | 'budget' 
  | 'draws' 
  | 'timeline' 
  | 'documents' 
  | 'disposition' 
  | 'deal-lab' 
  | 'alerts' 
  | 'settings' 
  | 'lender-portal' 
  | 'gc-fixed-portal' 
  | 'gc-daily-portal' 
  | 'cfo-recon' 
  | 'investor-portal' 
  | 'document-intake';

export const ROLE_ALLOWED_SCREENS: Record<UserRole, ActiveNavScreen[]> = {
  DEVELOPER_OWNER: [
    'portfolio',
    'project-detail',
    'budget',
    'draws',
    'timeline',
    'documents',
    'disposition',
    'deal-lab',
    'alerts',
    'settings',
    'lender-portal',
    'gc-fixed-portal',
    'gc-daily-portal',
    'cfo-recon',
    'investor-portal',
    'document-intake',
  ],
  CFO: [
    'portfolio',
    'project-detail',
    'budget',
    'draws',
    'timeline',
    'documents',
    'disposition',
    'alerts',
    'settings',
    'cfo-recon',
    'document-intake',
  ],
  PM: [
    'project-detail',
    'timeline',
    'documents',
    'alerts',
    'gc-daily-portal',
  ],
  LENDER: [
    'lender-portal',
    'document-intake',
  ],
  GC_FIXED: [
    'gc-fixed-portal',
    'timeline',
  ],
  GC_DAILY: [
    'gc-daily-portal',
    'timeline',
  ],
  INVESTOR: [
    'investor-portal',
    'disposition',
  ],
  ACCOUNTANT: [
    'cfo-recon',
    'budget',
    'draws',
    'documents',
    'document-intake',
  ],
};

export const ROLE_DEFAULT_SCREEN: Record<UserRole, ActiveNavScreen> = {
  DEVELOPER_OWNER: 'portfolio',
  CFO: 'cfo-recon',
  PM: 'timeline',
  LENDER: 'lender-portal',
  GC_FIXED: 'gc-fixed-portal',
  GC_DAILY: 'gc-daily-portal',
  INVESTOR: 'investor-portal',
  ACCOUNTANT: 'cfo-recon',
};
