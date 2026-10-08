import { useState } from 'react';
import { SettingsTab, TeamMember, IntegrationsState } from './types';

const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Hardik Parikh', email: 'hardik@empowerbpo.com', role: 'Developer / Owner', access: 'Full Control', status: 'Active' },
  { id: 'm2', name: 'Sarah Jenkins', email: 'sarah.jenkins@groundup.ai', role: 'CFO / Accounting', access: 'Financial Modules', status: 'Active' },
  { id: 'm3', name: 'Marcus Vance', email: 'marcus@vancepm.com', role: 'Project Manager', access: 'Timeline & Evidence', status: 'Active' },
  { id: 'm4', name: 'Kunal Shah', email: 'kunalshah0323@gmail.com', role: 'GC (Fixed Contract)', access: 'Milestone Claims', status: 'Active' },
  { id: 'm5', name: 'Sylvia Concrete', email: 'sylvia@concretepros.com', role: 'GC (Daily Updates)', access: 'Daily Logs & Receipts', status: 'Active' },
  { id: 'm6', name: 'Krutarth Shah', email: 'skrutarth08@gmail.com', role: 'Investor / Partner', access: 'Read-Only Portal', status: 'Active' },
];

export function useSettingsState() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('team');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Investor / Partner');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  const [gcModel, setGcModel] = useState<'FIXED_PRICE' | 'DAILY_UPDATES'>('DAILY_UPDATES');
  const [interestModel, setInterestModel] = useState<'RESERVE' | 'MONTHLY'>('RESERVE');
  const [contingencyPct, setContingencyPct] = useState('10');

  const [integrations, setIntegrations] = useState<IntegrationsState>({
    bcbBank: true,
    amexCard: true,
    inboundEmail: true,
    quickbooks: false,
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const newMemberEmail = inviteEmail;
    const newMemberRole = inviteRole;

    setTeamMembers(prev => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: inviteName,
        email: newMemberEmail,
        role: newMemberRole,
        access: newMemberRole.includes('Investor')
          ? 'Read-Only Portal'
          : newMemberRole.includes('Lender')
          ? 'Lender Facility Review'
          : 'Custom Scoped',
        status: 'Invited (Mail Dispatched)',
      }
    ]);
    setInviteName('');
    setInviteEmail('');
    setInviteSuccessMsg(`Invitation email successfully sent to ${newMemberEmail} with login link for "${newMemberRole}" portal access.`);
    setTimeout(() => {
      setInviteSuccessMsg(null);
    }, 7000);
  };

  const handleResendInvite = (name: string, email: string, role: string) => {
    setInviteSuccessMsg(`Invitation email resent to ${email} with credentials for ${role} portal.`);
    setTimeout(() => {
      setInviteSuccessMsg(null);
    }, 5000);
  };

  return {
    activeTab, setActiveTab,
    teamMembers,
    inviteName, setInviteName,
    inviteEmail, setInviteEmail,
    inviteRole, setInviteRole,
    inviteSuccessMsg, setInviteSuccessMsg,
    handleAddMember,
    handleResendInvite,
    gcModel, setGcModel,
    interestModel, setInterestModel,
    contingencyPct, setContingencyPct,
    integrations, setIntegrations,
  };
}
