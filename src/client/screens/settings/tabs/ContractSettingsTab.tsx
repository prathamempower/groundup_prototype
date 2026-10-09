import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ContractSettingsTabProps {
  gcModel: 'FIXED_PRICE' | 'DAILY_UPDATES';
  setGcModel: (m: 'FIXED_PRICE' | 'DAILY_UPDATES') => void;
  interestModel: 'RESERVE' | 'MONTHLY';
  setInterestModel: (m: 'RESERVE' | 'MONTHLY') => void;
  contingencyPct: string;
  setContingencyPct: (p: string) => void;
}

export const ContractSettingsTab: React.FC<ContractSettingsTabProps> = ({
  gcModel,
  setGcModel,
  interestModel,
  setInterestModel,
  contingencyPct,
  setContingencyPct,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 text-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">General Contractor Commercial Framework</h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            The owner sets the GC contract model per project to determine the level of invoice visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setGcModel('FIXED_PRICE')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              gcModel === 'FIXED_PRICE'
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">Model 1: Fixed / Milestone Contract</span>
              {gcModel === 'FIXED_PRICE' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Lump-sum contract with agreed milestone payments (e.g. Site Work $300K, Framing $400K). The GC submits milestone claims with completion proof. Subcontractor invoices are hidden.
            </p>
          </div>

          <div
            onClick={() => setGcModel('DAILY_UPDATES')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              gcModel === 'DAILY_UPDATES'
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">Model 2: Daily Updates / Open-Book</span>
              {gcModel === 'DAILY_UPDATES' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Cost-plus or partnership structure. The GC posts daily work logs, receipts, and invoices with an itemized GC markup. Provides detailed line items for financial review and accounting.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">Construction Financing & Carrying Cost Model</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interest Payment Method</label>
              <select
                value={interestModel}
                onChange={(e) => setInterestModel(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              >
                <option value="RESERVE">Model A: Interest Reserve Account (Lender holds & deducts monthly)</option>
                <option value="MONTHLY">Model B: Monthly Out-of-Pocket Interest Payment</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Reserve Contingency (%)</label>
              <input
                type="number"
                value={contingencyPct}
                onChange={(e) => setContingencyPct(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
