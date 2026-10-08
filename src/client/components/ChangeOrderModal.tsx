import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ChangeOrderFormFields } from './change-order/ChangeOrderFormFields';
import { GCSyncSection } from './change-order/GCSyncSection';

interface ChangeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  gcName?: string;
  onSubmitChangeOrder: (co: {
    change_order_number: string;
    category: string;
    sub_section?: string;
    cost_code?: string;
    amount: number;
    description: string;
    budget_impact: boolean;
    reason: string;
    custom_reason?: string;
    visible_to_gc: boolean;
    gc_notes?: string;
  }) => void;
}

export function ChangeOrderModal({
  isOpen,
  onClose,
  categories,
  gcName = 'General Contractor (K&P Construction)',
  onSubmitChangeOrder,
}: ChangeOrderModalProps) {
  const [coNumber, setCoNumber] = useState(`CO-00${Math.floor(Math.random() * 900) + 100}`);
  const [category, setCategory] = useState(categories[0] || 'Framing');
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [subSection, setSubSection] = useState('');
  const [costCode, setCostCode] = useState('');
  const [amount, setAmount] = useState('25000');
  const [reason, setReason] = useState('UNFORESEEN_SITE_CONDITION');
  const [customReason, setCustomReason] = useState('');
  const [description, setDescription] = useState('Additional structural reinforcement required due to township inspection notes.');
  const [budgetImpact] = useState(true);
  const [visibleToGC, setVisibleToGC] = useState(true);
  const [gcNotes, setGcNotes] = useState('Approved by Owner. GC authorized to proceed with trade work.');

  if (!isOpen) return null;

  const handleCategorySelect = (val: string) => {
    if (val === '__OTHER__') {
      setIsOtherCategory(true);
      setCategory('__OTHER__');
    } else {
      setIsOtherCategory(false);
      setCategory(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) return;

    const finalCategory = isOtherCategory 
      ? (customCategory.trim() || 'Other Scope / Custom Order')
      : category;

    onSubmitChangeOrder({
      change_order_number: coNumber,
      category: finalCategory,
      sub_section: subSection.trim() || undefined,
      cost_code: costCode.trim() || undefined,
      amount: parsedAmount,
      description,
      budget_impact: budgetImpact,
      reason: reason === 'OTHER' ? (customReason.trim() || 'Other Scope') : reason,
      custom_reason: customReason,
      visible_to_gc: visibleToGC,
      gc_notes: gcNotes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white max-w-xl w-full h-full shadow-2xl border-l border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              Δ
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Create Change Order</h3>
              <p className="text-xs text-slate-500">Route to Owner for formal approval & broadcast directly to GC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <ChangeOrderFormFields
            coNumber={coNumber}
            setCoNumber={setCoNumber}
            category={category}
            isOtherCategory={isOtherCategory}
            onCategorySelect={handleCategorySelect}
            categories={categories}
            customCategory={customCategory}
            setCustomCategory={setCustomCategory}
            subSection={subSection}
            setSubSection={setSubSection}
            costCode={costCode}
            setCostCode={setCostCode}
            amount={amount}
            setAmount={setAmount}
            reason={reason}
            setReason={setReason}
            customReason={customReason}
            setCustomReason={setCustomReason}
            description={description}
            setDescription={setDescription}
          />

          <GCSyncSection
            visibleToGC={visibleToGC}
            setVisibleToGC={setVisibleToGC}
            gcName={gcName}
            gcNotes={gcNotes}
            setGcNotes={setGcNotes}
          />

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <span className="font-semibold">Budget Impact Notice:</span> Approving this change order will automatically update the <strong>Current Budget Truth</strong> and create an audit log.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Submit & Approve Change Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { ChangeOrderModal as ChangeOrderDrawer };
