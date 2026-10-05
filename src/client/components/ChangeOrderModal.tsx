// GroundUp AI — Change Order Modal
// Interactive modal to draft, review, and approve construction change orders

import React, { useState } from 'react';
import { X, Plus, AlertTriangle, CheckCircle2, DollarSign, FileText } from 'lucide-react';

interface ChangeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSubmitChangeOrder: (co: {
    change_order_number: string;
    category: string;
    amount: number;
    description: string;
    budget_impact: boolean;
    reason: string;
  }) => void;
}

export function ChangeOrderModal({
  isOpen,
  onClose,
  categories,
  onSubmitChangeOrder,
}: ChangeOrderModalProps) {
  const [coNumber, setCoNumber] = useState(`CO-00${Math.floor(Math.random() * 900) + 100}`);
  const [category, setCategory] = useState(categories[0] || 'Framing');
  const [amount, setAmount] = useState('25000');
  const [reason, setReason] = useState('UNFORESEEN_SITE_CONDITION');
  const [description, setDescription] = useState('Additional structural reinforcement required due to township inspection notes.');
  const [budgetImpact, setBudgetImpact] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) return;

    onSubmitChangeOrder({
      change_order_number: coNumber,
      category,
      amount: parsedAmount,
      description,
      budget_impact: budgetImpact,
      reason,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              Δ
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Create Change Order</h3>
              <p className="text-xs text-slate-500">Route to Owner for formal approval & budget adjustment</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CO Number</label>
              <input
                type="text"
                value={coNumber}
                onChange={(e) => setCoNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Amount ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25000"
                min="100"
                step="any"
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Root Cause / Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
            >
              <option value="UNFORESEEN_SITE_CONDITION">Unforeseen Site Condition (Soil/Rock/Water)</option>
              <option value="ARCHITECT_DESIGN_REVISION">Architect / Design Revision</option>
              <option value="TOWNSHIP_CODE_REQUIREMENT">Township / Municipal Code Requirement</option>
              <option value="OWNER_UPGRADE">Owner / Developer Upgrade Scope</option>
              <option value="VALUE_ENGINEERING">Value Engineering Substitution</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scope Description & Justification</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="Explain the detailed scope of work..."
              required
            />
          </div>

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
