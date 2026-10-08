import React from 'react';
import { NormalizedSOVItem, NormalizedInvoiceItem } from '../types';

interface MultiDocFooterProps {
  sovCount: number;
  invoiceCount: number;
  totalBudget: number;
  totalSpend: number;
  mode: 'full' | 'sov_only' | 'invoices_only';
  sovItems: NormalizedSOVItem[];
  invoiceItems: NormalizedInvoiceItem[];
  onApplySOV?: (items: NormalizedSOVItem[]) => void;
  onApplyInvoices?: (items: NormalizedInvoiceItem[]) => void;
  onClose?: () => void;
}

export function MultiDocFooter({
  sovCount,
  invoiceCount,
  totalBudget,
  totalSpend,
  mode,
  sovItems,
  invoiceItems,
  onApplySOV,
  onApplyInvoices,
  onClose,
}: MultiDocFooterProps) {
  return (
    <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="text-slate-500">
        Showing <strong>{sovCount} SOV division(s)</strong> and <strong>{invoiceCount} invoice(s)</strong> with provenance tracking.
      </div>

      <div className="flex items-center gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Close
          </button>
        )}

        {mode !== 'invoices_only' && onApplySOV && sovItems.length > 0 && (
          <button
            type="button"
            onClick={() => onApplySOV(sovItems)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition shadow-xs cursor-pointer"
          >
            Apply Extracted SOV (${totalBudget.toLocaleString()})
          </button>
        )}

        {mode !== 'sov_only' && onApplyInvoices && invoiceItems.length > 0 && (
          <button
            type="button"
            onClick={() => onApplyInvoices(invoiceItems)}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition shadow-xs cursor-pointer"
          >
            Import Extracted Invoices (${totalSpend.toLocaleString()})
          </button>
        )}
      </div>
    </div>
  );
}
