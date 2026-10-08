import React from 'react';
import { Calculator, Info, TrendingUp } from 'lucide-react';

interface CostAssumptionsSectionProps {
  acquisitionCost: number;
  setAcquisitionCost: (c: number) => void;
  hardCosts: number;
  setHardCosts: (c: number) => void;
  softCosts: number;
  setSoftCosts: (c: number) => void;
  arv: number;
  setArv: (a: number) => void;
  loanTermMonths: number;
  setLoanTermMonths: (m: number) => void;
  interestRate: number;
  setInterestRate: (r: number) => void;
}

export const CostAssumptionsSection: React.FC<CostAssumptionsSectionProps> = ({
  acquisitionCost,
  setAcquisitionCost,
  hardCosts,
  setHardCosts,
  softCosts,
  setSoftCosts,
  arv,
  setArv,
  loanTermMonths,
  setLoanTermMonths,
  interestRate,
  setInterestRate,
}) => {
  return (
    <>
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-slate-400" />
        Cost Assumptions
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Acquisition Cost</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500 font-medium">$</span>
            <input
              type="number"
              value={acquisitionCost}
              onChange={(e) => setAcquisitionCost(Number(e.target.value))}
              className="pl-8 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hard Costs (Construction)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500 font-medium">$</span>
            <input
              type="number"
              value={hardCosts}
              onChange={(e) => setHardCosts(Number(e.target.value))}
              className="pl-8 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Soft Costs (Permits, Design, Carrying)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500 font-medium">$</span>
            <input
              type="number"
              value={softCosts}
              onChange={(e) => setSoftCosts(Number(e.target.value))}
              className="pl-8 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
            />
          </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg flex items-start gap-2 border border-slate-200 mt-2">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600">
            Selling costs are auto-calculated at 4% of expected ARV (3% broker, 1% legal/fees).
          </p>
        </div>
      </div>

      <div className="my-8 h-px bg-slate-200" />

      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-slate-400" />
        Revenue Assumptions
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expected Sale Price (ARV)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500 font-medium">$</span>
            <input
              type="number"
              value={arv}
              onChange={(e) => setArv(Number(e.target.value))}
              className="pl-8 w-full border border-emerald-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all font-mono bg-emerald-50/50"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loan Term (Months)</label>
            <input
              type="number"
              value={loanTermMonths}
              onChange={(e) => setLoanTermMonths(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
            />
          </div>
        </div>
      </div>
    </>
  );
};
