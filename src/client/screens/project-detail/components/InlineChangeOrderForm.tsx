import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BudgetLineItem } from '../types';
import { InlineChangeOrderFields } from './InlineChangeOrderFields';
import { InlineChangeOrderGCSync } from './InlineChangeOrderGCSync';

interface InlineChangeOrderFormProps {
  inlineScopeType: 'standard' | 'other';
  setInlineScopeType: (scope: 'standard' | 'other') => void;
  inlineCategory: string;
  setInlineCategory: (cat: string) => void;
  inlineCustomCategory: string;
  setInlineCustomCategory: (cat: string) => void;
  inlineSubSection: string;
  setInlineSubSection: (sub: string) => void;
  inlineCostCode: string;
  setInlineCostCode: (code: string) => void;
  inlineAmount: string;
  setInlineAmount: (amt: string) => void;
  inlineReason: string;
  setInlineReason: (r: string) => void;
  inlineCustomReason: string;
  setInlineCustomReason: (r: string) => void;
  inlineDesc: string;
  setInlineDesc: (d: string) => void;
  inlineVisibleToGC: boolean;
  setInlineVisibleToGC: (v: boolean) => void;
  inlineGcNotes: string;
  setInlineGcNotes: (notes: string) => void;
  budgetLines: BudgetLineItem[];
  selectedProjectName?: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const InlineChangeOrderForm: React.FC<InlineChangeOrderFormProps> = (props) => {
  const {
    inlineScopeType,
    setInlineScopeType,
    inlineVisibleToGC,
    setInlineVisibleToGC,
    inlineGcNotes,
    setInlineGcNotes,
    selectedProjectName,
    onSubmit,
    onCancel,
  } = props;

  return (
    <div className="p-6 bg-slate-50/70 border-b border-slate-200 animate-in fade-in duration-150">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">+</div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sub-Section: Add New Contract Order</h4>
              <p className="text-[11px] text-slate-500">Configure category, trade phase sub-section, cost code, and broadcast directly to GC.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setInlineScopeType('other')}
              className={`px-3 py-1 rounded-lg font-bold transition ${inlineScopeType === 'other' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Other / New Order Scope
            </button>
            <button
              type="button"
              onClick={() => setInlineScopeType('standard')}
              className={`px-3 py-1 rounded-lg font-bold transition ${inlineScopeType === 'standard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Standard Category Order
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <InlineChangeOrderFields {...props} />

          <InlineChangeOrderGCSync
            inlineVisibleToGC={inlineVisibleToGC}
            setInlineVisibleToGC={setInlineVisibleToGC}
            inlineGcNotes={inlineGcNotes}
            setInlineGcNotes={setInlineGcNotes}
            selectedProjectName={selectedProjectName}
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Submit & Show Order to GC</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
