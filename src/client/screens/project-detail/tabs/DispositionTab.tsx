import React from 'react';
import { UnitSale } from '../../../../shared/types';

interface DispositionTabProps {
  unitSales: UnitSale[];
}

const fmt = (n: number) => '$' + n.toLocaleString();

export const DispositionTab: React.FC<DispositionTabProps> = ({
  unitSales,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Disposition, Unit Sales & Investor Distributions</h3>
          <p className="text-xs text-slate-500">Track condominium unit closings, realtor commissions, loan payoffs, and net return</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Total Projected Revenue:</span>
          <span className="ml-2 font-mono font-bold text-emerald-700 text-sm">$3,250,000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {unitSales.map((unit) => (
          <div key={unit.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{unit.unit_name.split(' — ')[0]}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                unit.status === 'CLOSED'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : unit.status === 'UNDER_CONTRACT'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {unit.status.replace('_', ' ')}
              </span>
            </div>

            <div className="text-slate-500 text-[11px]">{unit.beds_baths} · {unit.sq_ft} sf</div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Asking Price:</span>
                <span className="font-semibold text-slate-700">{fmt(unit.asking_price)}</span>
              </div>
              {unit.contract_price && (
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Contract Price:</span>
                  <span>{fmt(unit.contract_price)}</span>
                </div>
              )}
              {unit.deposit_amount && (
                <div className="flex justify-between text-emerald-700">
                  <span>Escrow Deposit:</span>
                  <span>{fmt(unit.deposit_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                <span>Broker Comm. (3%):</span>
                <span>-${fmt(Math.round((unit.contract_price || unit.asking_price) * unit.broker_commission_pct))}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-200">
                <span>Est. Net Proceeds:</span>
                <span>{fmt(unit.net_proceeds)}</span>
              </div>
            </div>

            {unit.buyer_name && (
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                Buyer: <strong>{unit.buyer_name}</strong>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Senior Loan Payoff & Capital Return Waterfall */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Senior Construction Loan Payoff Waterfall</h4>
            <p className="text-xs text-slate-500">
              Unit closing proceeds automatically clear senior lender liens in priority order before equity release.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
            Priority-Ranked Waterfall
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Priority 1 · Senior Debt Payoff</div>
            <div className="text-xl font-bold text-purple-900">$2,000,000</div>
            <div className="text-[11px] text-slate-600 font-sans">
              BCB Community Bank senior construction mortgage retired 100% at escrow closing.
            </div>
            <div className="text-[10px] text-purple-700 font-bold font-sans">✓ First Lien Released</div>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Priority 2 · Equity Capital Return</div>
            <div className="text-xl font-bold text-emerald-900">$1,000,000</div>
            <div className="text-[11px] text-slate-600 font-sans">
              100% of fronted developer & equity partner principal basis returned dollar-for-dollar.
            </div>
            <div className="text-[10px] text-emerald-700 font-bold font-sans">✓ Capital Basis Preserved</div>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Priority 3 · Net Profit Distribution</div>
            <div className="text-xl font-bold text-blue-900">$250,000</div>
            <div className="text-[11px] text-slate-600 font-sans">
              Net proceeds distributed across general & limited partners per operating agreement.
            </div>
            <div className="text-[10px] text-blue-700 font-bold font-sans">✓ Final ROI Realized</div>
          </div>
        </div>
      </div>
    </div>
  );
};
