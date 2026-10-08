import React from 'react';

export function LineItemsStep() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <h2 className="text-base font-bold text-slate-900">Schedule of Values Breakdown</h2>
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
            <th className="py-2">Cost Code</th>
            <th>Category</th>
            <th>Scheduled Value</th>
            <th>Previous Drawn</th>
            <th>This Draw</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          <tr>
            <td className="py-2.5 font-mono">06-100</td>
            <td className="font-semibold text-slate-900">Framing & Trusses</td>
            <td>$185,000</td>
            <td>$0</td>
            <td className="font-bold text-slate-900">$54,500</td>
            <td>$130,500</td>
          </tr>
          <tr>
            <td className="py-2.5 font-mono">03-300</td>
            <td className="font-semibold text-slate-900">Foundation & Concrete</td>
            <td>$135,000</td>
            <td>$105,000</td>
            <td className="font-bold text-slate-900">$30,000</td>
            <td>$0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
