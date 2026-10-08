import React from 'react';
import { MultiDocumentBatchResult } from '../types';

interface ReconciliationTabProps {
  reconciliations: NonNullable<MultiDocumentBatchResult['crossDocumentReconciliation']>;
}

export function ReconciliationTab({ reconciliations }: ReconciliationTabProps) {
  return (
    <div className="p-6 space-y-4 overflow-y-auto max-h-[55vh]">
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Cross-Document Trade Reconciliation
        </h3>
        <p className="text-xs text-slate-500">
          Validates extracted contractor invoices directly against the Master Budget allocations.
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
              <th className="py-2.5 px-3 font-semibold">CSI Division & Category</th>
              <th className="py-2.5 px-3 font-semibold text-right">Budgeted ($)</th>
              <th className="py-2.5 px-3 font-semibold text-right">Incurred Spend ($)</th>
              <th className="py-2.5 px-3 font-semibold text-right">Remaining Variance ($)</th>
              <th className="py-2.5 px-3 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reconciliations.map((rec, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80">
                <td className="py-2 px-3">
                  <span className="font-mono text-slate-500 mr-2">{rec.costCode}</span>
                  <strong className="text-slate-900">{rec.category}</strong>
                </td>
                <td className="py-2 px-3 text-right font-medium text-slate-700">
                  ${rec.budgetedAmount.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right font-bold text-slate-900">
                  ${rec.incurredSpend.toLocaleString()}
                </td>
                <td className={`py-2 px-3 text-right font-bold ${rec.variance < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  ${rec.variance.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.status === 'ON_BUDGET'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.status === 'APPROACHING_LIMIT'
                        ? 'bg-amber-100 text-amber-800'
                        : rec.status === 'OVER_BUDGET'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {rec.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
