import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { ProjectFourTruthsSummary } from '../../../../shared/types';

interface DeveloperExposureCardProps {
  summary: ProjectFourTruthsSummary;
  onOpenProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', cat?: string) => void;
}

export function DeveloperExposureCard({
  summary,
  onOpenProvenance,
}: DeveloperExposureCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-800 via-surface-900 to-slate-950 border border-brand-500/30 p-6 sm:p-8 shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Hero Metric • Developer Cash Exposure
        </span>
        <button
          onClick={() => onOpenProvenance('exposure')}
          className="text-xs text-slate-400 hover:text-brand-300 flex items-center gap-1 bg-surface-950/80 px-3 py-1.5 rounded-xl border border-slate-700/60 transition cursor-pointer"
        >
          Audit Lineage <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-3 mb-2">
        <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
          ${summary.developer_cash_exposure.toLocaleString()}
        </div>
      </div>

      <div className="text-sm text-slate-300 flex flex-wrap items-center gap-2">
        <span>Total Actual Spend:</span>
        <strong className="text-white font-mono">${summary.total_actual_spend.toLocaleString()}</strong>
        <span className="text-slate-500">−</span>
        <span>Lender Disbursed:</span>
        <strong className="text-purple-300 font-mono">${summary.total_amount_funded.toLocaleString()}</strong>
      </div>

      <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-800/80 leading-relaxed max-w-3xl">
        Out-of-pocket developer equity incurred awaiting lender draw disbursement. Calculated purely from confirmed ledger rows without estimation.
      </p>
    </div>
  );
}
