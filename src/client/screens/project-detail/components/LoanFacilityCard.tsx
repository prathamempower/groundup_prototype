import React from 'react';
import { Landmark } from 'lucide-react';

export const LoanFacilityCard: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Landmark className="w-4 h-4 text-slate-600" />
          <span>BCB Community Bank — Construction Facility & Interest Reserve</span>
        </div>
        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          9.75% APR Interest-Only Facility
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="text-slate-500">Total Loan Amount</div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">$1,200,000</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Drawn Balance: $1,094,000</div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="text-slate-500">Daily Carrying Cost</div>
          <div className="text-base font-bold font-mono text-amber-600 mt-1">$324 / day</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Based on drawn balance × 9.75% ÷ 365</div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="text-slate-500">Interest Reserve Runway</div>
          <div className="text-base font-bold font-mono text-purple-700 mt-1">$32,500 remaining</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Approx. 3.2 months of interest remaining</div>
        </div>
      </div>
    </div>
  );
};
