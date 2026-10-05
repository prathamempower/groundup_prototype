// GroundUp AI — Budget vs. Actual Matrix Screen
// Interactive category grid with click-to-source provenance on every number

import React from 'react';
import { ProjectFourTruthsSummary } from '../../shared/types';
import { FileSpreadsheet, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface BudgetMatrixScreenProps {
  summary: ProjectFourTruthsSummary | null;
  onOpenProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', cat?: string) => void;
}

export const BudgetMatrixScreen: React.FC<BudgetMatrixScreenProps> = ({
  summary,
  onOpenProvenance,
}) => {
  if (!summary) return null;

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-brand-400" /> Budget vs. Actual Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any cell to view the exact source document, sheet name, and user author.
          </p>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-surface-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Trade Category</th>
                <th className="py-3.5 px-4 text-right">Budget Truth (Approved)</th>
                <th className="py-3.5 px-4 text-right">Spend Truth (Posted)</th>
                <th className="py-3.5 px-4 text-right">Funding Truth (Disbursed)</th>
                <th className="py-3.5 px-4 text-right">Progress Truth (%)</th>
                <th className="py-3.5 px-4 text-right">Variance ($)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {summary.categories.map((cat) => {
                const isOverBudget = cat.is_over_budget;
                const hasReconFlag = cat.has_reconciliation_flag;

                return (
                  <tr key={cat.category} className="hover:bg-surface-800/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{cat.category}</div>
                      {cat.approved_change_orders > 0 && (
                        <div className="text-[10px] text-brand-400 font-normal mt-0.5">
                          +${cat.approved_change_orders.toLocaleString()} Approved COs
                        </div>
                      )}
                    </td>

                    {/* Budget Truth Figure */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenProvenance('budget', cat.category)}
                        className="font-mono font-bold text-white hover:text-blue-300 transition inline-flex items-center gap-1 group"
                      >
                        ${cat.current_budget.toLocaleString()}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-400" />
                      </button>
                    </td>

                    {/* Spend Truth Figure */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenProvenance('spend', cat.category)}
                        className="font-mono font-bold text-emerald-400 hover:text-emerald-300 transition inline-flex items-center gap-1 group"
                      >
                        ${cat.actual_spend.toLocaleString()}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-400" />
                      </button>
                    </td>

                    {/* Funding Truth Figure */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenProvenance('funded', cat.category)}
                        className="font-mono font-bold text-purple-300 hover:text-purple-200 transition inline-flex items-center gap-1 group"
                      >
                        ${cat.amount_funded.toLocaleString()}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-purple-400" />
                      </button>
                    </td>

                    {/* Progress Truth */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-amber-300">
                        {Math.round(cat.verified_progress_pct * 100)}%
                      </div>
                      <div className="text-[10px] text-slate-400">{cat.progress_source}</div>
                    </td>

                    {/* Variance */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={cat.budget_variance > 0 ? 'text-rose-400' : 'text-slate-300'}>
                        {cat.budget_variance > 0 ? `+$${cat.budget_variance.toLocaleString()}` : `$${cat.budget_variance.toLocaleString()}`}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {hasReconFlag ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/30 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Recon (+{cat.reconciliation_delta_pct}%)
                        </span>
                      ) : isOverBudget ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                          Over Budget
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          On Track
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
