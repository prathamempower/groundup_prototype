import React from 'react';
import { CheckCircle2, Check } from 'lucide-react';

interface ExtractionReviewFormProps {
  vendor: string;
  setVendor: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  categories: string[];
  invoiceNumber: string;
  setInvoiceNumber: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  isResolved: boolean;
  onClose: () => void;
  onPost: () => void;
}

export function ExtractionReviewForm({
  vendor,
  setVendor,
  amount,
  setAmount,
  category,
  setCategory,
  categories,
  invoiceNumber,
  setInvoiceNumber,
  date,
  setDate,
  isResolved,
  onClose,
  onPost,
}: ExtractionReviewFormProps) {
  return (
    <div className="p-6 space-y-4 text-xs">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Normalized Staging Data</span>
        <span className="text-emerald-700">Audit Rule §4</span>
      </div>

      <div className="space-y-3.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700">Vendor Entity</label>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
              98% match
            </span>
          </div>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700">Incurred Amount ($)</label>
            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
              ⚠️ 61% verified
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 font-mono text-sm">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-amber-300 rounded-lg text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            AI initially flagged $24,800 vs $28,400. Confirmed arithmetic sum: $24,800 + $3,600 = $28,400.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700">Target Budget Line</label>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
              94% match
            </span>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Invoice Number</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Invoice Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-[11px] text-emerald-900">
          <strong>Zero-Hallucination Posting:</strong> Clicking "Confirm & Post" canonicalizes this entry into the project's <strong>Spend Truth</strong> with full source document provenance.
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onPost}
          disabled={isResolved}
          className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          {isResolved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Posted to Spend Truth!</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Confirm & Post to Ledger</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
