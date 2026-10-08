import React from 'react';
import { Landmark } from 'lucide-react';
import { ProjectFourTruthsSummary } from '../../../../shared/types';

interface LoanCarryingCostCardProps {
  summary: ProjectFourTruthsSummary;
}

export function LoanCarryingCostCard({ summary }: LoanCarryingCostCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-surface-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Landmark className="w-5 h-5 text-brand-400" />
          <span>Loan Facility & Real-Time Interest Carrying Cost</span>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800/40">
          {(summary.interest_rate * 100).toFixed(2)}% APR Facility
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface-950 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">Outstanding Drawn Balance</div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            ${summary.loan_balance.toLocaleString()}
          </div>
        </div>

        <div className="bg-surface-950 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">Daily Carrying Cost</div>
          <div className="text-lg font-bold text-amber-400 font-mono mt-1">
            ${summary.daily_carrying_cost.toLocaleString()} / day
          </div>
        </div>

        <div className="bg-surface-950 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">Estimated Schedule Delay Cost</div>
          <div className="text-lg font-bold text-rose-400 font-mono mt-1">
            ${summary.estimated_delay_cost.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
