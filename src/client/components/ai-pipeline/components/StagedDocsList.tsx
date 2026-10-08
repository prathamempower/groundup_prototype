import React from 'react';
import { CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { StagedDoc } from '../types';

interface StagedDocsListProps {
  uploadedFiles: StagedDoc[];
}

export function StagedDocsList({ uploadedFiles }: StagedDocsListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Staged Source Documents ({uploadedFiles.length})
        </label>
        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Ready for AI Extraction
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {uploadedFiles.map((f, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg"
          >
            <div className="flex items-center gap-2 truncate">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{f.name}</p>
                <p className="text-[10px] text-slate-400">{f.size} · {f.type}</p>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
              SHA256
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
