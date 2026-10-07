// GroundUp AI — Change Order Modal
// Interactive modal to draft, review, and approve construction change orders with Other category/sub-section support and GC sync

import React, { useState } from 'react';
import { X, Plus, AlertTriangle, CheckCircle2, DollarSign, FileText, Layers, ShieldCheck, Eye } from 'lucide-react';

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
  const [budgetImpact, setBudgetImpact] = useState(true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CO Number</label>
              <input
                type="text"
                value={coNumber}
                onChange={(e) => setCoNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget Category</label>
              <select
                value={isOtherCategory ? '__OTHER__' : category}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none font-medium"
              >
                <optgroup label="Standard SOV Categories">
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
                <optgroup label="Other & Custom Orders">
                  <option value="__OTHER__">+ Other / New Category Scope...</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* OTHER SECTION & SUB-SECTION INPUTS */}
          {isOtherCategory ? (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Other Category & Sub-Section Configuration</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Custom Category Name *</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Specialty Equipment / Elevator"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Sub-Section / Trade Phase</label>
                  <input
                    type="text"
                    value={subSection}
                    onChange={(e) => setSubSection(e.target.value)}
                    placeholder="e.g. Sub-section 04: Pit Waterproofing"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cost Code / CSI Division (Optional)</label>
                <input
                  type="text"
                  value={costCode}
                  onChange={(e) => setCostCode(e.target.value)}
                  placeholder="e.g. CSI 14 20 00 - Elevators"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sub-Section / Specific Work Phase <span className="text-slate-400 font-normal">(Optional sub-category)</span>
              </label>
              <input
                type="text"
                value={subSection}
                onChange={(e) => setSubSection(e.target.value)}
                placeholder="e.g. Sub-section: 3rd Floor Roof Deck Headers"
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          )}

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
                className="w-full pl-8 pr-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Root Cause / Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
            >
              <option value="UNFORESEEN_SITE_CONDITION">Unforeseen Site Condition (Soil/Rock/Water)</option>
              <option value="ARCHITECT_DESIGN_REVISION">Architect / Design Revision</option>
              <option value="TOWNSHIP_CODE_REQUIREMENT">Township / Municipal Code Requirement</option>
              <option value="OWNER_UPGRADE">Owner / Developer Upgrade Scope</option>
              <option value="VALUE_ENGINEERING">Value Engineering Substitution</option>
              <option value="OTHER">Other / Custom Justification...</option>
            </select>
          </div>

          {reason === 'OTHER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specify Other Reason *</label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g. Utility easement relocation mandated by power company"
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scope Description & Justification</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="Explain the detailed scope of work and trade requirements..."
              required
            />
          </div>

          {/* GC SUBMISSION & VISIBILITY SECTION */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleToGC}
                  onChange={(e) => setVisibleToGC(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Show & Submit to General Contractor ({gcName})</span>
                </span>
              </label>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                GC Portal Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
              When approved, this change order will automatically be submitted and displayed in the GC Contractor Portal, updating the GC contract baseline and authorizing trade billing.
            </p>
            {visibleToGC && (
              <div className="pl-6 pt-1">
                <input
                  type="text"
                  value={gcNotes}
                  onChange={(e) => setGcNotes(e.target.value)}
                  placeholder="Notes / instructions to GC..."
                  className="w-full px-2.5 py-1.5 bg-white text-slate-800 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
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
