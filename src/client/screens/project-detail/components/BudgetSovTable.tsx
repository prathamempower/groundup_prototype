import React from 'react';
import { TrendingUp, Shield } from 'lucide-react';
import { BudgetLineItem } from '../types';
import { UserRole } from '../../../../shared/types';
import { hasPermission } from '../../../../shared/rbac/matrix';

interface BudgetSovTableProps {
  budgetLines: BudgetLineItem[];
  currentRole: UserRole;
  onOpenContingencyModal: (cat?: string) => void;
  onInspectProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', category?: string) => void;
}

const fmt = (n: number) => '$' + n.toLocaleString();

export const BudgetSovTable: React.FC<BudgetSovTableProps> = ({
  budgetLines,
  currentRole,
  onOpenContingencyModal,
  onInspectProvenance,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
        <span>Master Schedule of Values (SOV) — Budget Truth vs. Spend Truth</span>
        <span className="font-mono text-slate-500">{budgetLines.length} Categories</span>
      </div>
      <table className="w-full text-xs">
        <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-right">Budget</th>
            <th className="px-4 py-3 text-right">Spent</th>
            <th className="px-4 py-3 text-right">Variance</th>
            <th className="px-4 py-3 text-center">Progress %</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {budgetLines.map((line) => {
            const variance = line.spent - line.budget;
            const isOver = variance > 0;
            return (
              <tr key={line.category} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                  {isOver ? <TrendingUp className="w-3.5 h-3.5 text-red-500 shrink-0" /> : null}
                  <span>{line.category}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">{fmt(line.budget)}</td>
                <td
                  onClick={() => onInspectProvenance('spend', line.category)}
                  className="px-4 py-3 text-right font-mono font-bold text-slate-900 hover:text-emerald-700 cursor-pointer underline decoration-dotted"
                  title="Click to view spend provenance"
                >
                  {fmt(line.spent)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold">
                  {isOver ? (
                    <span className="text-red-700">+{fmt(variance)}</span>
                  ) : (
                    <span className="text-emerald-700">-{fmt(Math.abs(variance))}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          line.progress === 100
                            ? 'bg-emerald-500'
                            : line.status === 'flag'
                            ? 'bg-amber-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${line.progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-slate-600 w-8">{line.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {isOver && hasPermission(currentRole, 'contingency:manage') && (
                    <button
                      onClick={() => onOpenContingencyModal(line.category)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold cursor-pointer transition flex items-center gap-1 ml-auto"
                    >
                      <Shield className="w-3 h-3" />
                      <span>Absorb</span>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
