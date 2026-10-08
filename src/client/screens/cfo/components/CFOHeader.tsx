import React from 'react';
import { Download } from 'lucide-react';

interface CFOHeaderProps {
  onExport: () => void;
}

export function CFOHeader({ onExport }: CFOHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            CFO / Accounting Center · Financial Truth Reconciler
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Draw Reconciliation & Lien Waiver Audit</h1>
        <p className="text-xs text-slate-500">
          Reconciles actual contractor spend against bank disbursements, audits un-drawn funds, and flags missing waivers
        </p>
      </div>

      <button
        onClick={onExport}
        className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
      >
        <Download className="w-4 h-4" />
        <span>Export Reconciliation Audit (Excel)</span>
      </button>
    </div>
  );
}
