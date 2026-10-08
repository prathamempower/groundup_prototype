// GroundUp AI — Contingency Movement Modal
// Enables absorbing cost overruns from the 10% Reserve Contingency with audit trail

import React, { useState } from 'react';
import { X, ShieldAlert, ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';

interface ContingencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableContingency: number;
  categories: string[];
  initialCategory?: string;
  onAbsorbContingency: (movement: {
    destination_category: string;
    amount: number;
    reason: string;
  }) => void;
}

export function ContingencyModal({
  isOpen,
  onClose,
  availableContingency,
  categories,
  initialCategory,
  onAbsorbContingency,
}: ContingencyModalProps) {
  const [destinationCategory, setDestinationCategory] = useState(initialCategory || categories[0] || 'Site Work');
  const [amount, setAmount] = useState('4000');
  const [reason, setReason] = useState('UNPLANNED_FOUNDATION_PILES');
  const [notes, setNotes] = useState('Unexpected soft soil encountered requiring extra piles to bear building load.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0 || parsedAmount > availableContingency) return;

    onAbsorbContingency({
      destination_category: destinationCategory,
      amount: parsedAmount,
      reason: notes || reason,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white max-w-lg w-full h-full shadow-2xl border-l border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Contingency Absorption</h3>
              <p className="text-xs text-slate-500">Fund unforeseen overruns from 10% Reserve Contingency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Contingency Balance Banner */}
        <div className="mx-6 mt-5 p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Available Contingency Reserve</span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              ${availableContingency.toLocaleString()}
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
            Lender Approved Reserve
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Category Receiving Funds</label>
            <select
              value={destinationCategory}
              onChange={(e) => setDestinationCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
            >
              {categories.filter(c => !c.toLowerCase().includes('contingency')).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Absorption Amount ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={availableContingency}
                min="100"
                step="any"
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Max available: ${availableContingency.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Justification Reason</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra structural piles required due to water table"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Audit Rule:</span> Contingency absorption rebalances category variances without altering the original baseline contract budget.
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
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Contingency Reallocation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { ContingencyModal as ContingencyDrawer };
