import React from 'react';

interface WireAuthorizationPanelProps {
  totalRequested: number;
  totalApproved: number;
  retainageHoldback: number;
  netWireDisbursement: number;
}

export function WireAuthorizationPanel({
  totalRequested,
  totalApproved,
  retainageHoldback,
  netWireDisbursement,
}: WireAuthorizationPanelProps) {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <span className="text-slate-400">Total Requested by Borrower</span>
        <span className="text-base font-bold">${totalRequested.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-400">Total Approved Line Items</span>
        <span className="text-base font-bold text-white">${totalApproved.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-amber-400">
        <span>Less: 10% Construction Retainage (Held in Escrow)</span>
        <span>- ${retainageHoldback.toLocaleString()}</span>
      </div>
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-lg font-bold text-emerald-400">
        <span>Net Authorized Wire Disbursement</span>
        <span>${netWireDisbursement.toLocaleString()}</span>
      </div>
    </div>
  );
}
