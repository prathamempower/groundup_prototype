// GroundUp AI — Multi-Document Extraction & Normalization Review Component
// Displays batch extraction status, normalized line items, strict KEEP vs AVOID figures, and live roll-up tallies

import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Receipt,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Building,
  Info,
  SlidersHorizontal,
  X,
  Plus
} from 'lucide-react';
import { MultiDocumentBatchResult, NormalizedSOVItem, NormalizedInvoiceItem, ExcludedFigure } from '../../server/services/documentParsingService';

interface MultiDocExtractionReviewProps {
  batchResult: MultiDocumentBatchResult;
  onApplySOV?: (items: NormalizedSOVItem[]) => void;
  onApplyInvoices?: (items: NormalizedInvoiceItem[]) => void;
  onClose?: () => void;
  mode?: 'full' | 'sov_only' | 'invoices_only';
}

export function MultiDocExtractionReview({
  batchResult,
  onApplySOV,
  onApplyInvoices,
  onClose,
  mode = 'full',
}: MultiDocExtractionReviewProps) {
  const [activeTab, setActiveTab] = useState<'normalized' | 'reconciliation' | 'avoid_rules' | 'documents'>('normalized');
  const [sovItems, setSovItems] = useState<NormalizedSOVItem[]>(batchResult.normalizedSOV || []);
  const [invoiceItems, setInvoiceItems] = useState<NormalizedInvoiceItem[]>(batchResult.normalizedInvoices || []);
  const [showAvoidDrawer, setShowAvoidDrawer] = useState(false);

  // Collect all excluded figures across documents
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

  const handleDeleteSOV = (index: number) => {
    setSovItems(sovItems.filter((_, i) => i !== index));
  };

  const handleDeleteInvoice = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col text-slate-900 animate-in fade-in duration-200">
      {/* Header Bar */}
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

      {/* Financial Metrics Live Roll-up Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 border-b border-slate-200 bg-slate-50/70">
        <div className="p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Truth 1: Master Budget (SOV)</p>
          <p className="text-lg font-extrabold text-emerald-800 mt-1">
            ${totalBudget.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">{sovItems.length} Normalized CSI Division(s)</p>
        </div>

        <div className="p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Truth 2: Incurred Spend</p>
          <p className="text-lg font-extrabold text-amber-700 mt-1">
            ${totalSpend.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">{invoiceItems.length} Contractor Invoice Line(s)</p>
        </div>

        <div className="p-4 bg-amber-50/40">
          <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Double Counting Avoided
          </p>
          <p className="text-lg font-extrabold text-amber-900 mt-1">
            ${totalAvoided.toLocaleString()}
          </p>
          <button
            onClick={() => setShowAvoidDrawer(!showAvoidDrawer)}
            className="text-[10px] font-bold text-amber-700 underline hover:text-amber-900 mt-0.5 cursor-pointer block"
          >
            {allExcludedFigures.length} Figures Filtered (View Details)
          </button>
        </div>

        <div className="p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Cash Exposure</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1">
            ${netCashExposure.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Pending lender draw funding</p>
        </div>
      </div>

      {/* Duplicate Warning Alert if detected */}
      {batchResult.summary.duplicateWarnings && batchResult.summary.duplicateWarnings.length > 0 && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <strong>Cross-Document Warning:</strong> {batchResult.summary.duplicateWarnings.join(' · ')}
          </div>
        </div>
      )}

      {/* Tabs */}
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

          {batchResult.crossDocumentReconciliation && batchResult.crossDocumentReconciliation.length > 0 && (
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
            Excluded Figures ({allExcludedFigures.length})
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

        {/* Action Buttons */}
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

      {/* Tab 1: Normalized Line Items Table */}
      {activeTab === 'normalized' && (
        <div className="p-6 space-y-6 overflow-y-auto max-h-[55vh]">
          {/* Master Budget Section */}
          {mode !== 'invoices_only' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Normalized Master Budget SOV Lines ({sovItems.length})
                </h3>
                <span className="text-xs font-bold text-emerald-800">
                  Subtotal: ${totalBudget.toLocaleString()}
                </span>
              </div>

              {sovItems.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  No SOV budget items extracted. Upload an Excel (.xlsx), CSV, or budget PDF to populate.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                        <th className="py-2.5 px-3 font-semibold">CSI Division</th>
                        <th className="py-2.5 px-3 font-semibold">Normalized Category</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Extracted Budget ($)</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Confidence</th>
                        <th className="py-2.5 px-3 font-semibold">Source Documents</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sovItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono font-bold text-slate-700">
                            {item.costCode}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900">
                            {item.category}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="inline-flex items-center border border-slate-200 rounded-lg px-2 py-1 bg-white">
                              <span className="text-slate-400 mr-1">$</span>
                              <input
                                type="number"
                                value={item.amount}
                                onChange={(e) => handleUpdateSOVAmount(idx, Number(e.target.value))}
                                className="w-24 text-right font-bold text-xs outline-none"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {(item.confidence * 100).toFixed(0)}% Verified
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px] truncate max-w-xs">
                            {item.sourceDocuments.join(', ')}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteSOV(idx)}
                              className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Contractor Invoices Section */}
          {mode !== 'sov_only' && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-600" /> Normalized Contractor Invoices & Spend ({invoiceItems.length})
                </h3>
                <span className="text-xs font-bold text-amber-800">
                  Subtotal: ${totalSpend.toLocaleString()}
                </span>
              </div>

              {invoiceItems.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  No contractor invoice lines extracted. Upload trade invoices or pay applications to populate.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                        <th className="py-2.5 px-3 font-semibold">Vendor / Trade Partner</th>
                        <th className="py-2.5 px-3 font-semibold">Invoice #</th>
                        <th className="py-2.5 px-3 font-semibold">Normalized Category</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Net Amount Due ($)</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Confidence</th>
                        <th className="py-2.5 px-3 font-semibold">Source File</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoiceItems.map((inv, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {inv.vendor}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium">
                              {inv.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="inline-flex items-center border border-slate-200 rounded-lg px-2 py-1 bg-white">
                              <span className="text-slate-400 mr-1">$</span>
                              <input
                                type="number"
                                value={inv.amount}
                                onChange={(e) => handleUpdateInvoiceAmount(idx, Number(e.target.value))}
                                className="w-24 text-right font-bold text-xs outline-none"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {(inv.confidence * 100).toFixed(0)}% Verified
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px] truncate max-w-xs">
                            {inv.sourceDocument}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteInvoice(idx)}
                              className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Cross-Document Reconciliation (Budget vs Invoiced) */}
      {activeTab === 'reconciliation' && (
        <div className="p-6 space-y-4 overflow-y-auto max-h-[55vh]">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Cross-Document Trade Reconciliation
            </h3>
            <p className="text-xs text-slate-500">
              Validates extracted contractor invoices directly against the Master Budget allocations.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                  <th className="py-2.5 px-3 font-semibold">CSI Division & Category</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Budgeted ($)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Incurred Spend ($)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Remaining Variance ($)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batchResult.crossDocumentReconciliation.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3">
                      <span className="font-mono text-slate-500 mr-2">{rec.costCode}</span>
                      <strong className="text-slate-900">{rec.category}</strong>
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-700">
                      ${rec.budgetedAmount.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      ${rec.incurredSpend.toLocaleString()}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${rec.variance < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                      ${rec.variance.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'ON_BUDGET'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'APPROACHING_LIMIT'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.status === 'OVER_BUDGET'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Strict KEEP vs AVOID Excluded Figures */}
      {activeTab === 'avoid_rules' && (
        <div className="p-6 space-y-4 overflow-y-auto max-h-[55vh]">
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" /> Anti-Double Counting Guarantee
            </h4>
            <p className="text-amber-800">
              GroundUp AI enforces strict rules to filter out previous statement balances, subtotals, and escrow estimates.
              This prevents inflated budgets and ensures line-item audit compliance.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                  <th className="py-2.5 px-3 font-semibold">Excluded Reason (Rule)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Excluded Figure ($)</th>
                  <th className="py-2.5 px-3 font-semibold">Raw Text in Document</th>
                  <th className="py-2.5 px-3 font-semibold">Source Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allExcludedFigures.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                      No double-counted figures detected. All numbers cleanly reconciled.
                    </td>
                  </tr>
                ) : (
                  allExcludedFigures.map((item, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/30">
                      <td className="py-2.5 px-3 font-bold text-amber-900">
                        {item.reason}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                        ${item.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] font-mono">
                        "{item.rawText}"
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {item.sourceDoc || 'Uploaded Document'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Document Provenance */}
      {activeTab === 'documents' && (
        <div className="p-6 space-y-4 overflow-y-auto max-h-[55vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batchResult.documents.map((doc, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                    {doc.documentType}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {(doc.overallConfidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</h4>
                <div className="text-[11px] text-slate-600 space-y-1">
                  {doc.loanFacility ? (
                    <div className="p-2 bg-blue-50/70 border border-blue-200/80 rounded-lg text-blue-950 space-y-0.5">
                      <p className="font-bold text-blue-900">🏦 Construction Loan Facility</p>
                      <p>Lender: <strong>{doc.loanFacility.lenderName}</strong></p>
                      <p>Loan Amount: <strong>${doc.loanFacility.loanAmount.toLocaleString()}</strong> @ <strong>{doc.loanFacility.interestRate}% APR</strong></p>
                      <p>Initial Advance: <strong>${doc.loanFacility.disbursedFunded.toLocaleString()}</strong> · Term: <strong>{doc.loanFacility.loanTermMonths} Mo</strong></p>
                      <p className="text-emerald-700 font-semibold">Approved Budget Exhibit: <strong>{doc.lineItems.length} Trade Lines (${doc.totalAmount.toLocaleString()})</strong></p>
                    </div>
                  ) : (
                    <>
                      <p>Vendor: <strong>{doc.vendorName}</strong></p>
                      <p>Invoice / Ref: <strong>{doc.invoiceNumber}</strong></p>
                      <p>Valid Lines: <strong>{doc.lineItems.length}</strong> · Amount: <strong>${doc.totalAmount.toLocaleString()}</strong></p>
                    </>
                  )}
                  <p className="text-amber-700">Excluded Figures: <strong>{doc.excludedFigures.length}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-500">
          Showing <strong>{sovItems.length} SOV division(s)</strong> and <strong>{invoiceItems.length} invoice(s)</strong> with provenance tracking.
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
    </div>
  );
}
