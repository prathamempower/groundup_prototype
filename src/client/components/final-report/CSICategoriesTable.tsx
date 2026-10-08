import React from 'react';
import { FinalReportData } from '../../../server/services/pipelineService';

interface CSICategoriesTableProps {
  csiCategories: FinalReportData['csiCategories'];
}

export function CSICategoriesTable({ csiCategories }: CSICategoriesTableProps) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-2">
        CSI MasterFormat Category Breakdown & Variance
      </h3>
      <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
          <tr>
            <th className="py-2.5 px-3 border-b border-slate-200">Cost Code</th>
            <th className="py-2.5 px-3 border-b border-slate-200">Category</th>
            <th className="py-2.5 px-3 border-b border-slate-200 text-right">Budgeted</th>
            <th className="py-2.5 px-3 border-b border-slate-200 text-right">Incurred Spend</th>
            <th className="py-2.5 px-3 border-b border-slate-200 text-right">Variance</th>
            <th className="py-2.5 px-3 border-b border-slate-200 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          {csiCategories.map((c, i) => (
            <tr key={i} className="hover:bg-slate-50/50">
              <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{c.costCode}</td>
              <td className="py-2 px-3 font-semibold text-slate-800">{c.category}</td>
              <td className="py-2 px-3 text-right text-slate-700">${c.budgetedAmount.toLocaleString()}</td>
              <td className="py-2 px-3 text-right font-semibold text-slate-900">${c.incurredSpend.toLocaleString()}</td>
              <td className="py-2 px-3 text-right font-mono text-[11px] text-slate-600">${c.variance.toLocaleString()}</td>
              <td className="py-2 px-3 text-center">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  c.status === 'ON_BUDGET'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : c.status === 'APPROACHING_LIMIT'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {c.status.replace('_', ' ')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
