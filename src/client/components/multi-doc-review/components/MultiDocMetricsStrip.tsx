import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface MultiDocMetricsStripProps {
  totalBudget: number;
  totalSpend: number;
  totalAvoided: number;
  netCashExposure: number;
  sovCount: number;
  invoiceCount: number;
  excludedCount: number;
  showAvoidDrawer: boolean;
  setShowAvoidDrawer: (show: boolean) => void;
}

export function MultiDocMetricsStrip({
  totalBudget,
  totalSpend,
  totalAvoided,
  netCashExposure,
  sovCount,
  invoiceCount,
  excludedCount,
  showAvoidDrawer,
  setShowAvoidDrawer,
}: MultiDocMetricsStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 border-b border-slate-200 bg-slate-50/70">
      <div className="p-4">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Truth 1: Master Budget (SOV)</p>
        <p className="text-lg font-extrabold text-emerald-800 mt-1">
          ${totalBudget.toLocaleString()}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">{sovCount} Normalized CSI Division(s)</p>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Truth 2: Incurred Spend</p>
        <p className="text-lg font-extrabold text-amber-700 mt-1">
          ${totalSpend.toLocaleString()}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">{invoiceCount} Contractor Invoice Line(s)</p>
      </div>

      <div className="p-4 bg-amber-50/40">
        <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Double Counting Avoided
        </p>
        <p className="text-lg font-extrabold text-amber-900 mt-1">
          ${totalAvoided.toLocaleString()}
        </p>
        <button
          onClick={() => setShowAvoidDrawer(!showAvoidDrawer)}
          className="text-[10px] font-bold text-amber-700 underline hover:text-amber-900 mt-0.5 cursor-pointer block"
        >
          {excludedCount} Figures Filtered (View Details)
        </button>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Cash Exposure</p>
        <p className="text-lg font-extrabold text-slate-900 mt-1">
          ${netCashExposure.toLocaleString()}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">Pending lender draw funding</p>
      </div>
    </div>
  );
}
