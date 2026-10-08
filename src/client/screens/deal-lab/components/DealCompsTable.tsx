import React from 'react';
import { CompItem } from '../types';

interface DealCompsTableProps {
  comps?: CompItem[];
}

const DEFAULT_COMPS: CompItem[] = [
  { address: '42 Oak Street (Next door)', price: 3250000, sqFt: 4100, daysAgo: 45, match: 'Strong' },
  { address: '118 Elm Ave (0.2 mi)', price: 3400000, sqFt: 4500, daysAgo: 120, match: 'Strong' },
  { address: '9 Walnut Lane (0.4 mi)', price: 2900000, sqFt: 3800, daysAgo: 18, match: 'Moderate' },
  { address: '88 Prospect St (0.5 mi)', price: 2950000, sqFt: 4000, daysAgo: 160, match: 'Moderate' },
];

export function DealCompsTable({ comps = DEFAULT_COMPS }: DealCompsTableProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold mb-4">Comparable Sales</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-medium">
              <th className="pb-3 px-4 font-medium">Address</th>
              <th className="pb-3 px-4 font-medium">Sold Price</th>
              <th className="pb-3 px-4 font-medium">Sq Ft</th>
              <th className="pb-3 px-4 font-medium">Days Ago</th>
              <th className="pb-3 px-4 font-medium text-right">Match</th>
            </tr>
          </thead>
          <tbody>
            {comps.map((comp, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-900 font-medium">{comp.address}</td>
                <td className="py-3 px-4 font-mono text-slate-700">{formatCurrency(comp.price)}</td>
                <td className="py-3 px-4 font-mono text-slate-500">{comp.sqFt.toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-500">{comp.daysAgo}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    comp.match === 'Strong' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {comp.match}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="bg-slate-50 text-slate-900 font-semibold border-t-2 border-slate-200">
              <td className="py-3 px-4">Average Comp</td>
              <td className="py-3 px-4 font-mono">{formatCurrency(3120000)}</td>
              <td className="py-3 px-4 font-mono">4,100</td>
              <td className="py-3 px-4 text-slate-500 font-normal">85 avg</td>
              <td className="py-3 px-4"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
