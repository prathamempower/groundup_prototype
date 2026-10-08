import React from 'react';

export function ReceiptsMatchingStep() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <h2 className="text-base font-bold text-slate-900">Receipts & Vendor Matching (22 of 24 auto-matched)</h2>
      <p className="text-xs text-slate-500">
        All posted contractor invoices verified with lien waivers on file. Total requested: $84,500.
      </p>

      <div className="space-y-2 mt-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <p className="font-bold text-slate-900">BMC Building Materials — Framing & Trusses</p>
            <p className="text-slate-500 font-mono text-[11px]">Inv #5512 · Verified Lien Waiver</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">$54,500.00</p>
            <span className="text-emerald-700 font-semibold text-[11px]">Matched 100%</span>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <p className="font-bold text-slate-900">Titan Concrete Systems — Retainage Release</p>
            <p className="text-slate-500 font-mono text-[11px]">Inv #1092-B · City Passed Pre-pour</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">$30,000.00</p>
            <span className="text-emerald-700 font-semibold text-[11px]">Matched 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
