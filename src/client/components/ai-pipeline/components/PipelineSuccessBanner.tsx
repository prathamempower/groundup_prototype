import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';
import { FinalReportDataDTO as FinalReportData } from '../../../../types';

interface PipelineSuccessBannerProps {
  projectName: string;
  executionResult: { projectId: string; finalReport: FinalReportData };
  onViewFinalReport: (projectId: string) => void;
  onClose: () => void;
}

export function PipelineSuccessBanner({
  projectName,
  executionResult,
  onViewFinalReport,
  onClose,
}: PipelineSuccessBannerProps) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span className="font-bold text-emerald-950 text-sm">
            Data Successfully Processed & Kept on Portfolio Page
          </span>
        </div>
        <p className="text-xs text-emerald-800">
          Project <span className="font-semibold text-emerald-950">{projectName}</span> has been stored in SQLite. Live metrics, budget SOV, invoices, and schedule are now active.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewFinalReport(executionResult.projectId)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition shadow-xs cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Final Report</span>
        </button>
        <button
          onClick={onClose}
          className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
        >
          Return to Portfolio
        </button>
      </div>
    </div>
  );
}
