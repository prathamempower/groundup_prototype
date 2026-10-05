// GroundUp AI — Side-by-Side Document Extraction Review Modal
// Human-in-the-loop review for low-confidence or flagged AI extractions (CFO / Accounting)

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Check, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  Building,
  RotateCcw
} from 'lucide-react';

interface ExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    type: string;
    confidence: number;
    flaggedItems: number;
  };
  categories: string[];
  onConfirmPost: (postedData: {
    docId: string;
    vendor: string;
    amount: number;
    category: string;
    invoiceNumber: string;
    date: string;
  }) => void;
}

export function ExtractionReviewModal({
  isOpen,
  onClose,
  document,
  categories,
  onConfirmPost,
}: ExtractionReviewModalProps) {
  const [vendor, setVendor] = useState('NJ Pipe Services LLC');
  const [amount, setAmount] = useState('28400');
  const [category, setCategory] = useState('Rough Plumbing');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0982');
  const [date, setDate] = useState('2026-09-28');
  const [confidence, setConfidence] = useState(61);
  const [isResolved, setIsResolved] = useState(false);

  if (!isOpen) return null;

  const handlePost = () => {
    onConfirmPost({
      docId: document.id,
      vendor,
      amount: parseFloat(amount) || 0,
      category,
      invoiceNumber,
      date,
    });
    setIsResolved(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{document.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  ⚠️ {confidence}% AI Confidence
                </span>
              </div>
              <p className="text-xs text-slate-500">Human-in-the-Loop Review: Verify extraction before posting to Spend Truth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-Side Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left: Document Optical Simulation */}
          <div className="p-6 bg-slate-100/70 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Original Scanned Document</span>
              <span>Page 1 of 1</span>
            </div>

            {/* Simulated Scanned Invoice Box */}
            <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4 text-xs font-serif text-slate-800 relative">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm tracking-wide text-slate-900">NJ PIPE SERVICES LLC</div>
                  <div className="text-[11px] text-slate-500">Commercial Plumbing & Heating Contractor</div>
                  <div className="text-[11px] text-slate-500">412 River Road, North Bergen, NJ</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 font-mono">INVOICE</div>
                  <div className="font-mono text-slate-600">{invoiceNumber}</div>
                  <div className="text-slate-500">Date: Sep 28, 2026</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500">BILLED TO:</div>
                <div className="font-bold text-slate-900">GroundUp Partners LLC · 73 Broadway Project</div>
              </div>

              {/* Line items in invoice */}
              <table className="w-full text-[11px] border border-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200 text-left">
                  <tr>
                    <th className="p-1.5">Description</th>
                    <th className="p-1.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-1.5">Rough-in DWV PVC and copper riser installation for 3 units</td>
                    <td className="p-1.5 text-right font-mono font-semibold">$24,800.00</td>
                  </tr>
                  <tr>
                    <td className="p-1.5">Township inspection test and air gauge hookups</td>
                    <td className="p-1.5 text-right font-mono font-semibold">$3,600.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Total Box with highlighted bounding area */}
              <div className="p-2.5 rounded-lg border-2 border-amber-400 bg-amber-50/50 flex justify-between items-center relative">
                <span className="font-bold text-slate-900">INVOICE TOTAL DUE:</span>
                <span className="font-mono font-bold text-base text-slate-900">$28,400.00</span>
                <span className="absolute -top-2.5 right-3 bg-amber-500 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                  OCR Uncertain · 61%
                </span>
              </div>

              <div className="text-[10px] text-slate-400 italic pt-2">
                Memo: Payment due upon receipt. Inspection passed green tag posted on first floor.
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SHA256: 4f8b91a27e3... verified source document</span>
            </div>
          </div>

          {/* Right: AI Proposed Values & Human Confirmation */}
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 outline-none"
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
                onClick={handlePost}
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
        </div>
      </div>
    </div>
  );
}
