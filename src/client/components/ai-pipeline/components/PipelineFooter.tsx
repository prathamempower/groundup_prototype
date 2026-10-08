import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

interface PipelineFooterProps {
  isProcessing: boolean;
  currentStepIndex: number;
  onClose: () => void;
  onStartPipeline: () => void;
}

export function PipelineFooter({
  isProcessing,
  currentStepIndex,
  onClose,
  onStartPipeline,
}: PipelineFooterProps) {
  return (
    <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
      <span className="text-[11px] text-slate-500">
        Deterministic AI Engine · Filters subtotals & prevents duplicate entries
      </span>

      <div className="flex items-center gap-2">
        <button
          disabled={isProcessing}
          onClick={onClose}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
        >
          Cancel
        </button>

        <button
          disabled={isProcessing}
          onClick={onStartPipeline}
          className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Processing Step {currentStepIndex}/10...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Run AI Processing Pipeline</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
