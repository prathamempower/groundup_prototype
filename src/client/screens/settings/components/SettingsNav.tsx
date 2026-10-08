import React from 'react';
import { Users, Layers, Zap, Building2 } from 'lucide-react';
import { SettingsTab } from '../types';

interface SettingsNavProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

export const SettingsNav: React.FC<SettingsNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'team' as const, label: 'Team & Stakeholders', icon: Users },
    { id: 'contract' as const, label: 'Commercial Contract Models', icon: Layers },
    { id: 'integrations' as const, label: 'Connected Integrations', icon: Zap },
    { id: 'profile' as const, label: 'Development Entity Profile', icon: Building2 },
  ];

  return (
    <div className="flex gap-2 border-b border-slate-200">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer -mb-px ${
              isActive
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
