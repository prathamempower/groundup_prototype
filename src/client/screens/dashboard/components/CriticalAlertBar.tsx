import React from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { AlertRisk } from '../../../../shared/types';

interface CriticalAlertBarProps {
  criticalAlerts: AlertRisk[];
  onNavigateAlerts: () => void;
}

export function CriticalAlertBar({ criticalAlerts, onNavigateAlerts }: CriticalAlertBarProps) {
  if (criticalAlerts.length === 0) return null;

  return (
    <div
      onClick={onNavigateAlerts}
      className="p-4 rounded-3xl bg-gradient-to-r from-rose-950/80 to-slate-900 border border-rose-500/40 flex items-center justify-between cursor-pointer hover:border-rose-400 transition shadow-lg shadow-rose-950/40"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 animate-pulse">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-rose-300 uppercase tracking-wider">
            🔴 {criticalAlerts.length} Action Required Items Detected
          </div>
          <div className="text-sm font-semibold text-white mt-0.5">
            {criticalAlerts[0].title}
          </div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-rose-400" />
    </div>
  );
}
