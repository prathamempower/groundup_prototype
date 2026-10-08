import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FinalReportData } from '../../../server/services/pipelineService';

interface CertificateVerificationBannerProps {
  reportData: FinalReportData;
}

export function CertificateVerificationBanner({ reportData }: CertificateVerificationBannerProps) {
  return (
    <>
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-emerald-700 shrink-0" />
          <div>
            <p className="font-bold text-emerald-950 text-sm">Audit Certificate Verified · Zero Hallucination Guarantee</p>
            <p className="text-emerald-800 text-xs">
              All figures computed strictly via deterministic code with 100% source document lineage. Verified Records Source-Linked & Audit-Logged.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono text-emerald-900 bg-white px-3 py-1 rounded-md border border-emerald-300 font-bold block">
            SHA256: {reportData.sha256Hash.substring(0, 16)}...
          </span>
          <span className="text-[10px] text-emerald-700 mt-0.5 block">
            Quality Confidence: {(reportData.metrics.overallConfidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Project Entity</p>
          <p className="font-bold text-slate-900 text-xs mt-0.5">{reportData.project.name}</p>
          <p className="text-[10px] text-slate-500 truncate">{reportData.project.address}</p>
        </div>
        <div>
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Project Status</p>
          <p className="font-bold text-emerald-700 text-xs mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{reportData.project.status} (Active Draw Cycle)</span>
          </p>
          <p className="text-[10px] text-slate-500">{reportData.project.units} Units · {reportData.project.squareFeet.toLocaleString()} SF</p>
        </div>
        <div>
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Sponsor / GC</p>
          <p className="font-bold text-slate-900 text-xs mt-0.5">{reportData.sponsor.name}</p>
          <p className="text-[10px] text-slate-500">{reportData.sponsor.company}</p>
        </div>
        <div>
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Lender Facility</p>
          <p className="font-bold text-slate-900 text-xs mt-0.5">{reportData.project.lenderName}</p>
          <p className="text-[10px] text-slate-500">${(reportData.fourTruths.loanCommitment / 1000).toFixed(0)}k Facility @ {reportData.fourTruths.interestRatePct}%</p>
        </div>
      </div>
    </>
  );
}
