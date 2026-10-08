import React from 'react';
import { Download, Printer, X } from 'lucide-react';
import { FinalReportData } from '../../../server/services/pipelineService';

interface FinalReportHeaderProps {
  reportData: FinalReportData;
  onExportJSON: () => void;
  onPrint: () => void;
  onClose: () => void;
}

export function FinalReportHeader({
  reportData,
  onExportJSON,
  onPrint,
  onClose,
}: FinalReportHeaderProps) {
  return (
    <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
          G
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase tracking-wider border border-emerald-500/30">
              Certified Final Audit Report
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {reportData.reportId}
            </span>
          </div>
          <h2 className="text-base font-bold text-white mt-0.5">
            {reportData.project.name} — Construction Financial Intelligence Report
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExportJSON}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
