import React from 'react';

interface LoanFacilityMetricsProps {
  totalRequested: number;
}

export function LoanFacilityMetrics({ totalRequested }: LoanFacilityMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Total Facility Commitment</span>
        <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">$1,200,000</div>
        <span className="text-[10px] text-slate-500">BCB Loan #BCB-2025-982</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Total Funded to Date</span>
        <div className="text-xl font-bold font-mono text-purple-700 mt-0.5">$909,000</div>
        <span className="text-[10px] text-purple-600">Disbursed via Draw #1 & #2</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Interest Reserve Balance</span>
        <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">$32,500</div>
        <span className="text-[10px] text-emerald-600">Auto-drawn monthly interest</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Pending Draw Request</span>
        <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">${totalRequested.toLocaleString()}</div>
        <span className="text-[10px] text-amber-700 font-semibold">Draw #3 (4 line items)</span>
      </div>
    </div>
  );
}
