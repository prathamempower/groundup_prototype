import React from 'react';

interface RetainageMathStepProps {
  grossRequested: number;
  retainageAmount: number;
  netDisbursement: number;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function RetainageMathStep({
  grossRequested,
  retainageAmount,
  netDisbursement,
  notes,
  onNotesChange,
}: RetainageMathStepProps) {
  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Gross Claimed Total</span>
          <span>${grossRequested.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-amber-400">
          <span>Less: 10% Retainage / Lender Holdback</span>
          <span>- ${retainageAmount.toLocaleString()}</span>
        </div>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-base font-bold text-emerald-400">
          <span>Net Expected Wire Disbursement</span>
          <span>${netDisbursement.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Submission Memo / Notes to Bank Loan Officer
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
        />
      </div>
    </div>
  );
}
