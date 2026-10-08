import React, { RefObject } from 'react';
import { UploadCloud } from 'lucide-react';

interface DocumentUploadDropzoneProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  isProcessingDoc: boolean;
  onFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DocumentUploadDropzone({
  fileInputRef,
  isProcessingDoc,
  onFilesSelected,
}: DocumentUploadDropzoneProps) {
  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/70 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3"
    >
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
        <UploadCloud className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900">
          {isProcessingDoc ? 'Processing & Extracting Documents...' : 'Click or Drag Documents Here to Auto-Extract'}
        </h3>
        <p className="text-xs text-slate-500">
          Supports <strong>.pdf</strong>, <strong>.doc</strong>, <strong>.zip</strong>, <strong>.xlsx / .csv</strong>, <strong>.aiag702</strong> & <strong>.aiag703</strong>
        </p>
      </div>

      <input
        ref={fileInputRef as any}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.zip,.xlsx,.xls,.csv,.aiag702,.aiag703"
        onChange={onFilesSelected}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 text-[10px] font-semibold text-slate-600">
        <span className="px-2 py-0.5 rounded bg-white border border-slate-200">PDF Invoices</span>
        <span className="px-2 py-0.5 rounded bg-white border border-slate-200">AIA G702 / G703</span>
        <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Excel SOV / Ledgers</span>
        <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Word Contracts</span>
        <span className="px-2 py-0.5 rounded bg-white border border-slate-200">ZIP Draw Packets</span>
      </div>
    </div>
  );
}
