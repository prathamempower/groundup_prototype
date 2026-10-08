import React from 'react';
import { Check } from 'lucide-react';
import { ProjectAlertItem } from '../types';

interface AlertsTabProps {
  alerts: ProjectAlertItem[];
  onResolveAlert: (id: string) => void;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({ alerts, onResolveAlert }) => {
  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Active Alerts & Reconciliation Exceptions</h3>
          <p className="text-xs text-slate-500">Items requiring immediate owner decision to avoid draw or profit disruption</p>
        </div>
        <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-full border border-red-200">
          {unresolvedCount} Action Items
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`p-5 rounded-2xl border transition ${
              a.resolved
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : a.severity === 'critical'
                ? 'bg-red-50/60 border-red-200'
                : 'bg-amber-50/60 border-amber-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      a.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {a.severity}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{a.type.replace('_', ' ')}</span>
                  <span className="text-slate-400 text-xs font-mono">{a.createdAt}</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{a.title}</div>
                <p className="text-xs text-slate-600">{a.description}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {!a.resolved ? (
                  <button
                    onClick={() => onResolveAlert(a.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
