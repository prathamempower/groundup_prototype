import React from 'react';

interface CFOReconciliationKPITilesProps {
  totalActualSpent: number;
  totalDrawnFunded: number;
  totalUnDrawn: number;
  totalRetainage: number;
}

export function CFOReconciliationKPITiles({
  totalActualSpent,
  totalDrawnFunded,
  totalUnDrawn,
  totalRetainage,
}: CFOReconciliationKPITilesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Total Incurred Actual Spend</span>
        <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
          ${totalActualSpent.toLocaleString()}
        </div>
        <span className="text-[10px] text-slate-500">Posted expense records</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Lender Funded to Date</span>
        <div className="text-xl font-bold font-mono text-purple-700 mt-0.5">
          ${totalDrawnFunded.toLocaleString()}
        </div>
        <span className="text-[10px] text-purple-600">Disbursed by BCB Bank</span>
      </div>
      <div className="bg-white border border-amber-200 bg-amber-50/50 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-amber-800 font-medium">Un-Drawn Actual Spend</span>
        <div className="text-xl font-bold font-mono text-amber-900 mt-0.5">
          ${totalUnDrawn.toLocaleString()}
        </div>
        <span className="text-[10px] text-amber-700 font-semibold">Fronted cash awaiting draw</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Retainage Holdback in Escrow</span>
        <div className="text-xl font-bold font-mono text-slate-700 mt-0.5">
          ${totalRetainage.toLocaleString()}
        </div>
        <span className="text-[10px] text-slate-400">10% released at Certificate of Occupancy</span>
      </div>
    </div>
  );
}
