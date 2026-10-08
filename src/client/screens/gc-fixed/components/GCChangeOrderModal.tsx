import React from 'react';
import { FileCheck, CheckCircle2 } from 'lucide-react';

interface GCChangeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  newGCCOCategory: string;
  setNewGCCOCategory: (cat: string) => void;
  newGCCOSubSection: string;
  setNewGCCOSubSection: (sub: string) => void;
  newGCCOAmount: string;
  setNewGCCOAmount: (amt: string) => void;
  newGCCOReason: string;
  setNewGCCOReason: (r: string) => void;
  newGCCODesc: string;
  setNewGCCODesc: (d: string) => void;
  gcCOSuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const GCChangeOrderModal: React.FC<GCChangeOrderModalProps> = ({
  isOpen,
  onClose,
  newGCCOCategory,
  setNewGCCOCategory,
  newGCCOSubSection,
  setNewGCCOSubSection,
  newGCCOAmount,
  setNewGCCOAmount,
  newGCCOReason,
  setNewGCCOReason,
  newGCCODesc,
  setNewGCCODesc,
  gcCOSuccess,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-slate-900 text-base">Request Change Order / Extra Scope</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Scope Category Name</label>
            <input
              type="text"
              value={newGCCOCategory}
              onChange={(e) => setNewGCCOCategory(e.target.value)}
              placeholder="e.g. Foundation Additional Tieback Piles"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sub-Section / Trade Phase</label>
            <input
              type="text"
              value={newGCCOSubSection}
              onChange={(e) => setNewGCCOSubSection(e.target.value)}
              placeholder="e.g. Sub-Section: Helical Soil Piles Phase 1B"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Proposed Cost / Amount ($)</label>
            <input
              type="number"
              value={newGCCOAmount}
              onChange={(e) => setNewGCCOAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Root Cause / Justification</label>
            <input
              type="text"
              value={newGCCOReason}
              onChange={(e) => setNewGCCOReason(e.target.value)}
              placeholder="e.g. Subsurface rocky strata requiring pneumatic jackhammering"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Description & Scope Notes</label>
            <textarea
              rows={3}
              value={newGCCODesc}
              onChange={(e) => setNewGCCODesc(e.target.value)}
              placeholder="Describe trade mobilization, materials, and inspector requirements..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {gcCOSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Order Submitted & Authorized!</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Submit Change Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
