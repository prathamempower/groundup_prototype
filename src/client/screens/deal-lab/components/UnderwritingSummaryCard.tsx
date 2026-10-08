import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface UnderwritingSummaryCardProps {
  acquisitionCost: number;
  hardCosts: number;
  softCosts: number;
  sellingCosts: number;
  totalCost: number;
  arv: number;
  grossProfit: number;
  netMargin: number;
  irr: number;
  cashOnCash: number;
}

export function UnderwritingSummaryCard({
  acquisitionCost,
  hardCosts,
  softCosts,
  sellingCosts,
  totalCost,
  arv,
  grossProfit,
  netMargin,
  irr,
  cashOnCash,
}: UnderwritingSummaryCardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  let verdictLabel = 'DEAL VIABLE';
  let verdictColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let verdictIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;

  if (netMargin < 10) {
    verdictLabel = 'HIGH RISK';
    verdictColor = 'bg-red-50 text-red-700 border-red-200';
    verdictIcon = <AlertTriangle className="w-5 h-5 text-red-600" />;
  } else if (netMargin < 15) {
    verdictLabel = 'MARGINAL';
    verdictColor = 'bg-amber-50 text-amber-700 border-amber-200';
    verdictIcon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden relative">
      <div className="flex justify-between items-start mb-8">
        <h2 className="text-xl font-bold">Underwriting Summary</h2>
        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${verdictColor}`}>
          {verdictIcon}
          <span className="font-bold text-sm tracking-wide">{verdictLabel}</span>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center text-slate-600">
            <span>Acquisition</span>
            <span className="font-mono text-slate-900">{formatCurrency(acquisitionCost)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Hard Costs</span>
            <span className="font-mono text-slate-900">{formatCurrency(hardCosts)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Soft Costs</span>
            <span className="font-mono text-slate-900">{formatCurrency(softCosts)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Selling Costs (4%)</span>
            <span className="font-mono text-slate-900">{formatCurrency(sellingCosts)}</span>
          </div>

          <div className="h-px bg-slate-300 my-4"></div>

          <div className="flex justify-between items-center font-semibold text-slate-900 text-base">
            <span>TOTAL COST</span>
            <span className="font-mono">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-700 mt-2">
            <span>Expected Revenue (ARV)</span>
            <span className="font-mono font-semibold">{formatCurrency(arv)}</span>
          </div>

          <div className="h-0.5 bg-slate-900 my-4"></div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-slate-900">GROSS PROFIT</span>
            <span className="text-2xl font-mono font-bold text-emerald-600">
              {formatCurrency(grossProfit)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-lg p-4 text-center bg-white">
          <p className="text-sm text-slate-500 font-medium mb-1">Net Margin</p>
          <p className={`text-xl font-mono font-bold ${netMargin >= 15 ? 'text-emerald-600' : 'text-slate-900'}`}>
            {netMargin.toFixed(1)}%
          </p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4 text-center bg-white">
          <p className="text-sm text-slate-500 font-medium mb-1">IRR (18mo)</p>
          <p className="text-xl font-mono font-bold text-slate-900">
            {irr}%
          </p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4 text-center bg-white">
          <p className="text-sm text-slate-500 font-medium mb-1">Cash on Cash</p>
          <p className="text-xl font-mono font-bold text-slate-900">
            {cashOnCash}%
          </p>
        </div>
      </div>
    </div>
  );
}
