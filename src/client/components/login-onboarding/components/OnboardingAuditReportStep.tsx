import React from 'react';
import { CheckCircle2, Download } from 'lucide-react';

interface OnboardingAuditReportStepProps {
  projectName: string;
  companyName: string;
  totalIncurredSpend: number;
  disbursedFunded: number;
  frontingCashGap: number;
  dailyInterest: number;
  onGenerateFinalReport: () => void;
}

export function OnboardingAuditReportStep({
  projectName,
  companyName,
  totalIncurredSpend,
  disbursedFunded,
  frontingCashGap,
  dailyInterest,
  onGenerateFinalReport,
}: OnboardingAuditReportStepProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Zero-Hallucination Integrity Proof Generated</span>
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed">
          GroundUp AI deterministic engine has reconciled all inputs for <strong>{projectName}</strong> ({companyName}):
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Incurred Spend</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">${totalIncurredSpend.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Disbursed Lender Funds</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">${disbursedFunded.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Fronting Cash Gap</p>
          <p className="text-lg font-bold text-amber-600 mt-0.5">${frontingCashGap.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Daily Carrying Cost</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">${dailyInterest}/day</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-900">Certified Executive Audit Package</p>
          <p className="text-[11px] text-slate-500">Ready for Owner & Lender signoff</p>
        </div>
        <button
          type="button"
          onClick={onGenerateFinalReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-black transition text-xs shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Preview Official Report</span>
        </button>
      </div>
    </div>
  );
}
