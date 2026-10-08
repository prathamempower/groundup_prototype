import React from 'react';
import { CondoUnitSale } from '../types';

interface CondoWaterfallSectionProps {
  sales: CondoUnitSale[];
}

export function CondoWaterfallSection({ sales }: CondoWaterfallSectionProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Condominium Sales & Capital Return Waterfall</h3>
          <p className="text-xs text-slate-500">
            Unit contract closings fund construction loan retirement before investor equity distribution
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          Total Revenue: $3,250,000
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        {sales.map((u) => (
          <div key={u.unit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{u.unit}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  u.status === 'UNDER CONTRACT'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {u.status}
              </span>
            </div>
            <div className="font-mono text-base font-bold text-slate-900">{u.price}</div>
            <div className="text-[11px] text-slate-500">Expected Closing: {u.closeDate}</div>
            <div className="pt-2 border-t border-slate-200 space-y-1 font-mono text-[11px]">
              <div className="text-slate-600">{u.loanAllocation}</div>
              <div className="text-emerald-700 font-bold">{u.netProceeds}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
