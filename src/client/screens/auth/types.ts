export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  isNewUser?: boolean;
  avatarUrl?: string;
  authProvider: 'google' | 'email' | 'demo';
}

export interface DemoPersona {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  roleTitle: string;
  roleBadge: string;
  badgeClass: string;
}
