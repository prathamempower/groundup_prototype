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
    </div>
  );
};
