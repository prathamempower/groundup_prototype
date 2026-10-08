import React from 'react';
import {
  LayoutDashboard,
  DollarSign,
  FileCheck,
  Clock,
  FolderOpen,
  Home,
  BellRing,
} from 'lucide-react';
import { ProjectTab } from '../types';

export interface ProjectDetailNavProps {
  activeTab: ProjectTab;
  onTabChange?: (tab: ProjectTab) => void;
  onTabSelect?: (tab: ProjectTab) => void;
  pendingDrawsCount: number;
  unresolvedAlertsCount: number;
}

export const ProjectDetailNav: React.FC<ProjectDetailNavProps> = ({
  activeTab,
  onTabChange,
  onTabSelect,
  pendingDrawsCount,
  unresolvedAlertsCount,
}) => {
  const handleSelect = (tab: ProjectTab) => {
    onTabChange?.(tab);
    onTabSelect?.(tab);
  };
  const tabs: Array<{ id: ProjectTab; label: string; icon: any; badge?: number }> = [
    { id: 'overview', label: 'Control Center', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget & Contingency', icon: DollarSign },
    { id: 'draws', label: 'Draw Lab', icon: FileCheck, badge: pendingDrawsCount },
    { id: 'timeline', label: 'Milestones & Delay', icon: Clock },
    { id: 'documents', label: 'Document Inbox & Amex', icon: FolderOpen },
    { id: 'disposition', label: 'Unit Sales & ROI', icon: Home },
    { id: 'alerts', label: 'Risk Alerts', icon: BellRing, badge: unresolvedAlertsCount },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 -mb-px pt-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer -mb-px shrink-0 ${
              isActive
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge && tab.badge > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
