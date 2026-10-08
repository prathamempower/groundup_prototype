import React from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

interface LenderPackageStepProps {
  onSubmit: () => void;
}

export function LenderPackageStep({ onSubmit }: LenderPackageStepProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Heritage Bank Draw Submission Package</h2>
          <p className="text-xs text-slate-500">Loan #L-22841 · AIA G702 / G703 format</p>
        </div>
        <button
          onClick={onSubmit}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Submit to Heritage Bank</span>
        </button>
      </div>

      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Inspection photos verified by AI vision (80%+ framing threshold met)</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Unconditional lien waivers attached for all previous disbursements</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>SOV line items verified against Master Budget V1</span>
        </div>
      </div>
    </div>
  );
}
