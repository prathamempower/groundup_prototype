import React from 'react';
import { Download, Upload } from 'lucide-react';
import { IntakeDocument } from '../types';

interface DocumentCardItemProps {
  doc: IntakeDocument;
  uploadSuccess: string | null;
  onDownload: (fileName: string) => void;
  onUpload: (docId: string) => void;
}

export function DocumentCardItem({
  doc,
  uploadSuccess,
  onDownload,
  onUpload,
}: DocumentCardItemProps) {
  const Icon = doc.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-slate-700" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-slate-900 text-sm">{doc.title}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✓ AI Verified
            </span>
          </div>
          <div className="text-xs font-mono text-slate-600">
            File: <strong className="text-slate-900">{doc.fileName}</strong> ({doc.fileSize}) · Uploaded {doc.uploadedAt}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            {doc.extractedSummary}
          </p>
          <div className="text-[10px] text-slate-400 font-mono">
            SHA256: {doc.shaHash} · Verified Immutable Source
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <button
          onClick={() => onDownload(doc.fileName)}
          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
        <button
          onClick={() => onUpload(doc.id)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{uploadSuccess === doc.id ? 'Replaced & Re-indexed!' : 'Replace File'}</span>
        </button>
      </div>
    </div>
  );
}
