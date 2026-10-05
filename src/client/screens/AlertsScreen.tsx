// GroundUp AI — Reconciliation Exceptions & Alerts Center
// Side-by-side comparison of conflicting truths (e.g. Plumbing 55% verified vs 82% spent)

import React from 'react';
import { AlertRisk, UserRole } from '../../shared/types';
import { Bell, AlertTriangle, AlertCircle, ShieldCheck, ArrowUpRight, ChevronRight } from 'lucide-react';

interface AlertsScreenProps {
  alerts: AlertRisk[];
  onOpenProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', cat?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  onOpenProvenance,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-rose-400" /> Alerts & Reconciliation Center
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Automatic exception detection across Budget Truth, Spend Truth, Funding Truth & Progress Truth.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">All Truths in Harmonic Balance</h3>
          <p className="text-xs text-slate-400">No reconciliation discrepancies or unapproved lines active.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isRecon = alert.type === 'RECONCILIATION_EXCEPTION';

            return (
              <div
                key={alert.id}
                className={`p-6 rounded-3xl bg-surface-900 border ${
                  isCritical ? 'border-rose-500/50 shadow-xl shadow-rose-950/20' : 'border-amber-500/40'
                } space-y-4`}
              >
                {/* Alert Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${isCritical ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {isCritical ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {alert.severity} • {alert.type.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-sm text-white mt-1 leading-snug">{alert.title}</h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                {/* Side-by-Side Conflicting Truths Comparison (Section 3.5) */}
                {isRecon && alert.source_values && (
                  <div className="p-4 rounded-2xl bg-surface-950 border border-slate-800 grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Spend Truth</span>
                      <span className="font-mono font-bold text-emerald-400 text-base block">
                        {alert.source_values.spend_pct}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ${(alert.source_values.spend || 0).toLocaleString()} Posted
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Progress Truth</span>
                      <span className="font-mono font-bold text-amber-300 text-base block">
                        {alert.source_values.progress_pct}%
                      </span>
                      <span className="text-[11px] text-slate-400">City Inspection Verified</span>
                    </div>
                  </div>
                )}

                {/* Provenance Link */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {alert.category ? (
                    <button
                      onClick={() => onOpenProvenance('spend', alert.category)}
                      className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1"
                    >
                      Audit {alert.category} Lineage <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateTab('draws')}
                      className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1"
                    >
                      Review in Draws <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-[10px] text-slate-500">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
