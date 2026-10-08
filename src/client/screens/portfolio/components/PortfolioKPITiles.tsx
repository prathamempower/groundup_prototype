import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatShortCurrency } from '../portfolio-helpers';

interface PortfolioKPITilesProps {
  totalBudget: number;
  totalSpent: number;
  totalFunded: number;
  totalCashExposure: number;
  spentPct: number;
  activeCount: number;
}

export const PortfolioKPITiles: React.FC<PortfolioKPITilesProps> = ({
  totalBudget,
  totalSpent,
  totalFunded,
  totalCashExposure,
  spentPct,
  activeCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Total Budget */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Active Budget</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Truth 1</span>
        </div>
        <p className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
          {formatShortCurrency(totalBudget)}
        </p>
        <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
          <span>{activeCount} active projects</span>
          <span className="text-emerald-700 font-medium">100% Pro Forma</span>
        </div>
      </div>

      {/* Total Spent */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Incurred Spend</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Truth 2</span>
        </div>
        <p className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
          {formatShortCurrency(totalSpent)}
        </p>
        <div className="mt-2.5 space-y-1">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(spentPct, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{spentPct.toFixed(1)}% of budget</span>
            <span className="font-semibold text-slate-700">Verified OCR</span>
          </div>
        </div>
      </div>

      {/* Total Funded */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Lender Funded</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Truth 3</span>
        </div>
        <p className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
          {formatShortCurrency(totalFunded)}
        </p>
        <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
          <span>Disbursed by lenders</span>
          <span className="text-emerald-700 font-medium">Wired</span>
        </div>
      </div>

      {/* Cash Exposure */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-900">Developer Cash Exposure</span>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Gap</span>
        </div>
        <p className="text-2xl font-black text-amber-950 font-mono tracking-tight mt-1">
          {formatShortCurrency(totalCashExposure)}
        </p>
        <div className="text-xs text-amber-800 mt-2 flex items-center justify-between font-medium">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Outstanding Draws</span>
          </span>
          <span className="text-[11px] font-bold text-amber-700">Draw #4 pending</span>
        </div>
      </div>
    </div>
  );
};
