import React from 'react';
import { FileText, X } from 'lucide-react';

interface InvoiceManagerHeaderProps {
  projectName: string;
  onClose: () => void;
}

export function InvoiceManagerHeader({ projectName, onClose }: InvoiceManagerHeaderProps) {
  return (
    <div className="p-5 px-6 border-b border-slate-200 flex items-center justify-between bg-white z-10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
          <FileText className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Invoices & Direct Expenses Ledger</h2>
          <p className="text-xs text-slate-500">
            Project: <strong>{projectName}</strong> · Incurred Spend updates live
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
