// GroundUp AI — Settings & Team Organization Screen
// Stakeholder management, GC contract model configuration, and banking integrations

import React from 'react';
import { useSettingsState } from './settings/use-settings-state';
import { SettingsNav } from './settings/components/SettingsNav';
import { TeamSettingsTab } from './settings/tabs/TeamSettingsTab';
import { ContractSettingsTab } from './settings/tabs/ContractSettingsTab';
import { IntegrationsSettingsTab } from './settings/tabs/IntegrationsSettingsTab';
import { ProfileSettingsTab } from './settings/tabs/ProfileSettingsTab';

interface SettingsScreenProps {
  onBack: () => void;
  onRestartOnboarding?: () => void;
}

export function SettingsScreen({ onRestartOnboarding }: SettingsScreenProps) {
  const state = useSettingsState();

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organization Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your project team, commercial GC contracting rules, and banking feeds
        </p>
      </div>

      <SettingsNav activeTab={state.activeTab} setActiveTab={state.setActiveTab} />

      {state.activeTab === 'team' && (
        <TeamSettingsTab
          teamMembers={state.teamMembers}
          inviteName={state.inviteName}
          setInviteName={state.setInviteName}
          inviteEmail={state.inviteEmail}
          setInviteEmail={state.setInviteEmail}
          inviteRole={state.inviteRole}
          setInviteRole={state.setInviteRole}
          inviteSuccessMsg={state.inviteSuccessMsg}
          setInviteSuccessMsg={state.setInviteSuccessMsg}
          onAddMember={state.handleAddMember}
          onResendInvite={state.handleResendInvite}
        />
      )}

      {state.activeTab === 'contract' && (
        <ContractSettingsTab
          gcModel={state.gcModel}
          setGcModel={state.setGcModel}
          interestModel={state.interestModel}
          setInterestModel={state.setInterestModel}
          contingencyPct={state.contingencyPct}
          setContingencyPct={state.setContingencyPct}
        />
      )}

      {state.activeTab === 'integrations' && (
        <IntegrationsSettingsTab
          integrations={state.integrations}
          setIntegrations={state.setIntegrations}
        />
      )}

      {state.activeTab === 'profile' && (
        <ProfileSettingsTab onRestartOnboarding={onRestartOnboarding} />
      )}
    </div>
  );
}
