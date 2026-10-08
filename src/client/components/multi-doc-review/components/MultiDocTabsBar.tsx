import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { MultiDocTab, NormalizedSOVItem, NormalizedInvoiceItem, MultiDocumentBatchResult } from '../types';

interface MultiDocTabsBarProps {
  activeTab: MultiDocTab;
  setActiveTab: (tab: MultiDocTab) => void;
  batchResult: MultiDocumentBatchResult;
  sovItems: NormalizedSOVItem[];
  invoiceItems: NormalizedInvoiceItem[];
  excludedCount: number;
  mode: 'full' | 'sov_only' | 'invoices_only';
  onApplySOV?: (items: NormalizedSOVItem[]) => void;
  onApplyInvoices?: (items: NormalizedInvoiceItem[]) => void;
  totalBudget: number;
  totalSpend: number;
}

export function MultiDocTabsBar({
  activeTab,
  setActiveTab,
  batchResult,
  sovItems,
  invoiceItems,
  excludedCount,
  mode,
  onApplySOV,
  onApplyInvoices,
  totalBudget,
  totalSpend,
}: MultiDocTabsBarProps) {
  const hasReconciliation = batchResult.crossDocumentReconciliation && batchResult.crossDocumentReconciliation.length > 0;

  return (
    <div className="px-6 pt-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('normalized')}
          className={`px-3.5 py-2 rounded-t-xl text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'normalized'
              ? 'border-slate-900 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Normalized Line Items ({sovItems.length + invoiceItems.length})
        </button>

        {hasReconciliation && (
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'reconciliation'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Budget vs Spend Variance ({batchResult.crossDocumentReconciliation.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('avoid_rules')}
          className={`px-3.5 py-2 rounded-t-xl text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'avoid_rules'
              ? 'border-amber-600 text-amber-800 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Excluded Figures ({excludedCount})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-2 rounded-t-xl text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'documents'
              ? 'border-slate-900 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Document Provenance ({batchResult.documents.length})
        </button>
      </div>

      <div className="flex items-center gap-2 pb-2">
        {mode !== 'invoices_only' && onApplySOV && sovItems.length > 0 && (
          <button
            type="button"
            onClick={() => onApplySOV(sovItems)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apply to Master SOV (${totalBudget.toLocaleString()})</span>
          </button>
        )}

        {mode !== 'sov_only' && onApplyInvoices && invoiceItems.length > 0 && (
          <button
            type="button"
            onClick={() => onApplyInvoices(invoiceItems)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Import {invoiceItems.length} Invoices (${totalSpend.toLocaleString()})</span>
          </button>
        )}
      </div>
    </div>
  );
}
