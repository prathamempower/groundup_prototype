export type SettingsTab = 'team' | 'contract' | 'integrations' | 'profile';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  access: string;
  status: string;
}

export interface IntegrationsState {
  bcbBank: boolean;
  amexCard: boolean;
  inboundEmail: boolean;
  quickbooks: boolean;
}
