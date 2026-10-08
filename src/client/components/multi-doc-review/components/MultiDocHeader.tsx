import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { MultiDocumentBatchResult } from '../types';

interface MultiDocHeaderProps {
  batchResult: MultiDocumentBatchResult;
  onClose?: () => void;
}

export function MultiDocHeader({ batchResult, onClose }: MultiDocHeaderProps) {
  return (
    <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Zero-Hallucination Pipeline
          </span>
          <span className="text-xs text-slate-400">Batch ID: {batchResult.batchId}</span>
        </div>
        <h2 className="text-base font-bold mt-1 text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" /> Multi-Document Extraction & Normalization
        </h2>
        <p className="text-xs text-slate-300 mt-0.5">
          Analyzed {batchResult.documents.length} document(s) · {batchResult.summary.lineItemCount} raw rows parsed · Strict KEEP vs AVOID filter active
        </p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer self-start sm:self-auto"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
