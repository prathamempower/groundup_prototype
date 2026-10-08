import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ActiveNavScreen } from '../../../shared/rbac/matrix';

interface NavItem {
  id: ActiveNavScreen;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarNavGroupProps {
  title: string;
  items: NavItem[];
  currentScreen: ActiveNavScreen;
  onNavigate: (screen: ActiveNavScreen) => void;
}

export function SidebarNavGroup({
  title,
  items,
  currentScreen,
  onNavigate,
}: SidebarNavGroupProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-0.5">
      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
              isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </div>
            {item.badge && item.badge > 0 ? (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
