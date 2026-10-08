import React from 'react';
import { Check, Send } from 'lucide-react';

interface WireExecutionFormProps {
  wireRef: string;
  setWireRef: (ref: string) => void;
  drawStatus: 'pending' | 'approved' | 'disbursed';
  totalApproved: number;
  netWireDisbursement: number;
  onConfirmDisbursement: () => void;
}

export function WireExecutionForm({
  wireRef,
  setWireRef,
  drawStatus,
  totalApproved,
  netWireDisbursement,
  onConfirmDisbursement,
}: WireExecutionFormProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
      <h4 className="font-bold text-slate-900 text-sm">Disbursement Authorization & Wire Release</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-600 mb-1 font-semibold">Fedwire Reference Number</label>
          <input
            type="text"
            value={wireRef}
            onChange={(e) => setWireRef(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
          />
        </div>
        <div>
          <label className="block text-slate-600 mb-1 font-semibold">Borrower Operating Account</label>
          <input
            type="text"
            defaultValue="BCB Checking Ending ···4891"
            disabled
            className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-slate-500">
          Executing wire releases funds and updates the project's Funding Truth ledger in real-time.
        </span>
        <button
          onClick={onConfirmDisbursement}
          disabled={drawStatus === 'disbursed' || totalApproved <= 0}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition shadow-xs disabled:opacity-40 cursor-pointer flex items-center gap-2"
        >
          {drawStatus === 'disbursed' ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Wire Confirmed & Disbursed</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Execute Wire Disbursement (${netWireDisbursement.toLocaleString()})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
