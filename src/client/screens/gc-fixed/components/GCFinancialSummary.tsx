import React from 'react';

interface GCFinancialSummaryProps {
  totalContract: number;
  totalApprovedCOAmount: number;
  visibleCOsCount: number;
  adjustedContract: number;
  totalPaid: number;
  remainingContract: number;
}

export const GCFinancialSummary: React.FC<GCFinancialSummaryProps> = ({
  totalContract,
  totalApprovedCOAmount,
  visibleCOsCount,
  adjustedContract,
  totalPaid,
  remainingContract,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <span className="text-xs text-slate-500 font-medium">Base Lump-Sum Contract</span>
        <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
          ${totalContract.toLocaleString()}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Agreed Schedule of Values</p>
      </div>
      <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xs bg-indigo-50/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-indigo-950 font-semibold">Approved Change Orders</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
            {visibleCOsCount} Approved
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">
          +${totalApprovedCOAmount.toLocaleString()}
        </div>
        <p className="text-[11px] text-indigo-600 font-medium mt-1">Showed to GC & Authorized</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <span className="text-xs text-slate-500 font-medium">Adjusted Total Contract</span>
        <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
          ${adjustedContract.toLocaleString()}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Base Contract + Approved Orders</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <span className="text-xs text-slate-500 font-medium">Total Paid / Remaining</span>
        <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
          ${totalPaid.toLocaleString()}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          ${remainingContract.toLocaleString()} balance remaining
        </p>
      </div>
    </div>
  );
};
