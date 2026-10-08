// GroundUp AI — Multi-Document Extraction & Normalization Review Component
// Displays batch extraction status, normalized line items, strict KEEP vs AVOID figures, and live roll-up tallies

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  MultiDocExtractionReviewProps,
  MultiDocTab,
  NormalizedSOVItem,
  NormalizedInvoiceItem,
  ExcludedFigure
} from './multi-doc-review/types';
import { MultiDocHeader } from './multi-doc-review/components/MultiDocHeader';
import { MultiDocMetricsStrip } from './multi-doc-review/components/MultiDocMetricsStrip';
import { MultiDocTabsBar } from './multi-doc-review/components/MultiDocTabsBar';
import { NormalizedLinesTab } from './multi-doc-review/components/NormalizedLinesTab';
import { ReconciliationTab } from './multi-doc-review/components/ReconciliationTab';
import { ExcludedFiguresTab } from './multi-doc-review/components/ExcludedFiguresTab';
import { DocumentProvenanceTab } from './multi-doc-review/components/DocumentProvenanceTab';
import { MultiDocFooter } from './multi-doc-review/components/MultiDocFooter';

export function MultiDocExtractionReview({
  batchResult,
  onApplySOV,
  onApplyInvoices,
  onClose,
  mode = 'full',
}: MultiDocExtractionReviewProps) {
  const [activeTab, setActiveTab] = useState<MultiDocTab>('normalized');
  const [sovItems, setSovItems] = useState<NormalizedSOVItem[]>(batchResult.normalizedSOV || []);
  const [invoiceItems, setInvoiceItems] = useState<NormalizedInvoiceItem[]>(batchResult.normalizedInvoices || []);
  const [showAvoidDrawer, setShowAvoidDrawer] = useState(false);

  const allExcludedFigures: ExcludedFigure[] = batchResult.documents.flatMap((d) => d.excludedFigures || []);

  const totalBudget = sovItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalSpend = invoiceItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalAvoided = allExcludedFigures.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const netCashExposure = totalSpend;

  const handleUpdateSOVAmount = (index: number, val: number) => {
    const updated = [...sovItems];
    updated[index].amount = isNaN(val) ? 0 : val;
    setSovItems(updated);
  };

  const handleUpdateInvoiceAmount = (index: number, val: number) => {
    const updated = [...invoiceItems];
    updated[index].amount = isNaN(val) ? 0 : val;
    setInvoiceItems(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col text-slate-900 animate-in fade-in duration-200">
      <MultiDocHeader batchResult={batchResult} onClose={onClose} />

      <MultiDocMetricsStrip
        totalBudget={totalBudget}
        totalSpend={totalSpend}
        totalAvoided={totalAvoided}
        netCashExposure={netCashExposure}
        sovCount={sovItems.length}
        invoiceCount={invoiceItems.length}
        excludedCount={allExcludedFigures.length}
        showAvoidDrawer={showAvoidDrawer}
        setShowAvoidDrawer={setShowAvoidDrawer}
      />

      {batchResult.summary.duplicateWarnings && batchResult.summary.duplicateWarnings.length > 0 && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <strong>Cross-Document Warning:</strong> {batchResult.summary.duplicateWarnings.join(' · ')}
          </div>
        </div>
      )}

      <MultiDocTabsBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        batchResult={batchResult}
        sovItems={sovItems}
        invoiceItems={invoiceItems}
        excludedCount={allExcludedFigures.length}
        mode={mode}
        onApplySOV={onApplySOV}
        onApplyInvoices={onApplyInvoices}
        totalBudget={totalBudget}
        totalSpend={totalSpend}
      />

      {activeTab === 'normalized' && (
        <NormalizedLinesTab
          mode={mode}
          sovItems={sovItems}
          invoiceItems={invoiceItems}
          totalBudget={totalBudget}
          totalSpend={totalSpend}
          onUpdateSOVAmount={handleUpdateSOVAmount}
          onUpdateInvoiceAmount={handleUpdateInvoiceAmount}
          onDeleteSOV={(idx) => setSovItems(sovItems.filter((_, i) => i !== idx))}
          onDeleteInvoice={(idx) => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))}
        />
      )}

      {activeTab === 'reconciliation' && batchResult.crossDocumentReconciliation && (
        <ReconciliationTab reconciliations={batchResult.crossDocumentReconciliation} />
      )}

      {activeTab === 'avoid_rules' && (
        <ExcludedFiguresTab allExcludedFigures={allExcludedFigures} />
      )}

      {activeTab === 'documents' && (
        <DocumentProvenanceTab documents={batchResult.documents} />
      )}

      <MultiDocFooter
        sovCount={sovItems.length}
        invoiceCount={invoiceItems.length}
        totalBudget={totalBudget}
        totalSpend={totalSpend}
        mode={mode}
        sovItems={sovItems}
        invoiceItems={invoiceItems}
        onApplySOV={onApplySOV}
        onApplyInvoices={onApplyInvoices}
        onClose={onClose}
      />
    </div>
  );
}
