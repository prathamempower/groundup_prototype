import React from 'react';
import { UploadCloud } from 'lucide-react';

interface InvoiceMethodTabsProps {
  activeTab: 'manual' | 'file_upload';
  setActiveTab: (tab: 'manual' | 'file_upload') => void;
  invoicesCount: number;
  uploadedDocsCount: number;
  totalPostedSpend: number;
}

export function InvoiceMethodTabs({
  activeTab,
  setActiveTab,
  invoicesCount,
  uploadedDocsCount,
  totalPostedSpend,
}: InvoiceMethodTabsProps) {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Method 1: Live Invoice Ledger ({invoicesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('file_upload')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'file_upload'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
          <span>Method 2: Upload Documents (PDF / DOC / ZIP / Excel / AIA)</span>
          {uploadedDocsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
              {uploadedDocsCount}
            </span>
          )}
        </button>
      </div>

      <div className="text-right">
        <span className="text-[11px] text-slate-500">Total Posted Spend:</span>
        <span className="ml-1.5 text-xs font-extrabold text-slate-900">${totalPostedSpend.toLocaleString()}</span>
      </div>
    </div>
  );
}
