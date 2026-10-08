import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ProjectFourTruthsSummary } from '../../../../shared/types';

interface FourTruthsGridProps {
  summary: ProjectFourTruthsSummary;
  onOpenProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', cat?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export function FourTruthsGrid({
  summary,
  onOpenProvenance,
  onNavigateTab,
}: FourTruthsGridProps) {
  const spentPct = summary.total_current_budget > 0
    ? Math.round((summary.total_actual_spend / summary.total_current_budget) * 100)
    : 0;

  return (
    <div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
        The Four Domain Truths (Separated & Non-Conflicting)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Budget Truth */}
        <div
          onClick={() => onOpenProvenance('budget')}
          className="p-5 rounded-3xl bg-surface-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> 1. Budget Truth
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ${summary.total_current_budget.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Baseline + Approved COs</span>
            <span className="text-blue-400 font-semibold">GMP Approved</span>
          </div>
        </div>

        {/* 2. Spend Truth */}
        <div
          onClick={() => onOpenProvenance('spend')}
          className="p-5 rounded-3xl bg-surface-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 2. Spend Truth
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            ${summary.total_actual_spend.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>{spentPct}% Spent</span>
            <span className="text-emerald-400 font-semibold">Posted Rows Only</span>
          </div>
        </div>

        {/* 3. Funding Truth */}
        <div
          onClick={() => onOpenProvenance('funded')}
          className="p-5 rounded-3xl bg-surface-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> 3. Funding Truth
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">
            ${summary.total_amount_funded.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Draws Approved: ${summary.total_approved_draws.toLocaleString()}</span>
            <span className="text-purple-400 font-semibold">Disbursed</span>
          </div>
        </div>

        {/* 4. Progress Truth */}
        <div
          onClick={() => onNavigateTab('budget')}
          className="p-5 rounded-3xl bg-surface-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 4. Progress Truth
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {Math.round(summary.overall_progress_pct * 100)}% Verified
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>GC & Municipal Inspections</span>
            <span className="text-amber-400 font-semibold">Non-Inferred</span>
          </div>
        </div>
      </div>
    </div>
  );
}
