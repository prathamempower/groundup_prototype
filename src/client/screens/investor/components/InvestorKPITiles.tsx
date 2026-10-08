import React from 'react';

interface InvestorKPITilesProps {
  investorEquity: number;
  projectedNetReturn: number;
  targetROI: number;
  forecastROI: number;
}

export function InvestorKPITiles({
  investorEquity,
  projectedNetReturn,
  targetROI,
  forecastROI,
}: InvestorKPITilesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Capital Equity Deployed</span>
        <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
          ${investorEquity.toLocaleString()}
        </div>
        <span className="text-[10px] text-slate-500">Funded at land acquisition</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Projected Investor Profit</span>
        <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
          +${projectedNetReturn.toLocaleString()}
        </div>
        <span className="text-[10px] text-emerald-600">Net after loan payoff</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Forecasted Total Return (ROI)</span>
        <div className="text-xl font-bold font-mono text-purple-700 mt-0.5">
          {forecastROI}%
        </div>
        <span className="text-[10px] text-slate-400">Baseline Target: {targetROI}%</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-400 font-medium">Project Health & Sales</span>
        <div className="text-xl font-bold text-slate-900 mt-0.5">
          2 of 3 Under Contract
        </div>
        <span className="text-[10px] text-emerald-700 font-semibold">67% Pre-Sold (Strong Demand)</span>
      </div>
    </div>
  );
}
