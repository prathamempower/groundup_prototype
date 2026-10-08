import React from 'react';
import { Cpu, X } from 'lucide-react';

interface AIPipelineHeaderProps {
  onClose: () => void;
}

export function AIPipelineHeader({ onClose }: AIPipelineHeaderProps) {
  return (
    <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase tracking-wider border border-emerald-500/30">
              10-Step Deterministic Pipeline
            </span>
            <span className="text-xs text-slate-400">Zero-Hallucination Ingestion</span>
          </div>
          <h2 className="text-base font-bold text-white mt-0.5">
            AI Construction Data Processing Engine
          </h2>
        </div>
      </div>

      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
