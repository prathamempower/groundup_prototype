// GroundUp AI — Data Completeness & Readiness Scorecard

import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, ChevronRight, Sparkles, Upload } from 'lucide-react';
import { ProjectDataReadiness } from '../../shared/types';

interface DataReadinessBannerProps {
  readiness?: ProjectDataReadiness;
  onOpenIntake: () => void;
}

export const DataReadinessBanner: React.FC<DataReadinessBannerProps> = ({
  readiness,
  onOpenIntake,
}) => {
  if (!readiness) return null;

  const isReady = readiness.is_ready_for_live_tracking;
  const score = readiness.readiness_score;

  return (
    <div className="p-4 rounded-3xl bg-surface-900 border border-slate-800 shadow-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl ${
              isReady
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            }`}
          >
            {isReady ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Project Data Completeness & Verification</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  score === 100
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {score}% Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isReady
                ? 'All mandatory financial & schedule inputs provided. Live reporting active.'
                : 'Some foundational data is pending before calculations can achieve 100% accuracy.'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenIntake}
          className="px-4 py-2 rounded-xl bg-surface-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition shrink-0"
        >
          <Upload className="w-3.5 h-3.5 text-brand-400" /> Intake Center
        </button>
      </div>

      {/* Checklist items strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80 text-xs">
        {readiness.checklist.map((item) => (
          <div
            key={item.id}
            className={`p-2.5 rounded-2xl border ${
              item.is_complete
                ? 'bg-surface-950/60 border-slate-800 text-slate-300'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase">{item.required_role}</span>
              {item.is_complete ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <div className="font-semibold text-xs leading-snug truncate">{item.title}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {item.is_complete ? `${item.item_count} items loaded` : 'Required'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
