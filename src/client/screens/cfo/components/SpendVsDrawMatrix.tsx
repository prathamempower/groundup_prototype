import React from 'react';
import { ReconciliationRow } from '../types';

interface SpendVsDrawMatrixProps {
  reconciliationRows: ReconciliationRow[];
}

export function SpendVsDrawMatrix({ reconciliationRows }: SpendVsDrawMatrixProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
        <span>Draw Reconciliation Matrix — Spend Truth vs. Funding Truth</span>
        <span className="text-slate-500 font-normal">Identifies cash gap per category</span>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-right">Actual Spend Incurred</th>
            <th className="px-4 py-3 text-right">Lender Disbursed</th>
            <th className="px-4 py-3 text-right">Un-Drawn Spend</th>
            <th className="px-4 py-3 text-right">10% Retainage Held</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reconciliationRows.map((r) => (
            <tr key={r.category} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-900">{r.category}</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                ${r.actualSpent.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right font-mono text-purple-700 font-bold">
                ${r.drawnFunded.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-amber-700">
                ${r.unDrawn.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-500">
                ${r.retainage.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
