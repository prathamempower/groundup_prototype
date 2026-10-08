import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { ExcludedFigure } from '../types';

interface ExcludedFiguresTabProps {
  allExcludedFigures: ExcludedFigure[];
}

export function ExcludedFiguresTab({ allExcludedFigures }: ExcludedFiguresTabProps) {
  return (
    <div className="p-6 space-y-4 overflow-y-auto max-h-[55vh]">
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
        <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-700" /> Anti-Double Counting Guarantee
        </h4>
        <p className="text-amber-800">
          GroundUp AI enforces strict rules to filter out previous statement balances, subtotals, and escrow estimates.
          This prevents inflated budgets and ensures line-item audit compliance.
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
              <th className="py-2.5 px-3 font-semibold">Excluded Reason (Rule)</th>
              <th className="py-2.5 px-3 font-semibold text-right">Excluded Figure ($)</th>
              <th className="py-2.5 px-3 font-semibold">Raw Text in Document</th>
              <th className="py-2.5 px-3 font-semibold">Source Document</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allExcludedFigures.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                  No double-counted figures detected. All numbers cleanly reconciled.
                </td>
              </tr>
            ) : (
              allExcludedFigures.map((item, idx) => (
                <tr key={idx} className="hover:bg-amber-50/30">
                  <td className="py-2.5 px-3 font-bold text-amber-900">
                    {item.reason}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                    ${item.amount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] font-mono">
                    "{item.rawText}"
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {item.sourceDoc || 'Uploaded Document'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
