import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { ScannedInvoicePreview } from './extraction-review/ScannedInvoicePreview';
import { ExtractionReviewForm } from './extraction-review/ExtractionReviewForm';

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
  const [confidence] = useState(61);
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
          <ScannedInvoicePreview invoiceNumber={invoiceNumber} />

          <ExtractionReviewForm
            vendor={vendor}
            setVendor={setVendor}
            amount={amount}
            setAmount={setAmount}
            category={category}
            setCategory={setCategory}
            categories={categories}
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            date={date}
            setDate={setDate}
            isResolved={isResolved}
            onClose={onClose}
            onPost={handlePost}
          />
        </div>
      </div>
    </div>
  );
}

export { ExtractionReviewModal as SplitDocReviewer };
