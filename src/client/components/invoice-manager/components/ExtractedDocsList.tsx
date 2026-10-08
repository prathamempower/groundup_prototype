import React from 'react';
import { Sparkles, CheckCircle2, Trash2 } from 'lucide-react';
import { UploadedDocumentItem } from '../types';

interface ExtractedDocsListProps {
  uploadedDocs: UploadedDocumentItem[];
  totalExtractedSpend: number;
  onImportAll: () => void;
  onRemoveDoc: (id: string) => void;
}

export function ExtractedDocsList({
  uploadedDocs,
  totalExtractedSpend,
  onImportAll,
  onRemoveDoc,
}: ExtractedDocsListProps) {
  if (uploadedDocs.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-900">
            Extracted Line Items ({uploadedDocs.length}) · Total: ${totalExtractedSpend.toLocaleString()}
          </h4>
        </div>

        <button
          onClick={onImportAll}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Import All into Live Ledger</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
        {uploadedDocs.map((doc) => (
          <div key={doc.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                {doc.type}
              </div>
              <div>
                <p className="font-bold text-slate-900">{doc.name}</p>
                <p className="text-[11px] text-slate-500">
                  Vendor: <strong>{doc.vendor}</strong> · Category: {doc.category} · {doc.size}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900 text-sm">${doc.amount.toLocaleString()}</span>
              <button
                onClick={() => onRemoveDoc(doc.id)}
                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
