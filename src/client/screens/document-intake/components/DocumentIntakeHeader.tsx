import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function DocumentIntakeHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Developer Control Center · Document Intake
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Project Documents & Canonical Sources</h1>
        <p className="text-xs text-slate-500">
          The 7 foundational project documents provided by the Developer / Owner establishing ground truth
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>7 of 7 Canonical Documents Verified</span>
        </span>
      </div>
    </div>
  );
}
