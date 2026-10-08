import React from 'react';
import { BudgetLineItem } from '../types';

interface InlineChangeOrderFieldsProps {
  inlineScopeType: 'standard' | 'other';
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
  budgetLines: BudgetLineItem[];
}

export const InlineChangeOrderFields: React.FC<InlineChangeOrderFieldsProps> = ({
  inlineScopeType,
  inlineCategory,
  setInlineCategory,
  inlineCustomCategory,
  setInlineCustomCategory,
  inlineSubSection,
  setInlineSubSection,
  inlineCostCode,
  setInlineCostCode,
  inlineAmount,
  setInlineAmount,
  inlineReason,
  setInlineReason,
  inlineCustomReason,
  setInlineCustomReason,
  inlineDesc,
  setInlineDesc,
  budgetLines,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {inlineScopeType === 'other' ? (
          <div className="md:col-span-1">
            <label className="block font-semibold text-slate-700 mb-1">Other Scope / Order Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={inlineCustomCategory}
              onChange={(e) => setInlineCustomCategory(e.target.value)}
              placeholder="e.g. Utility Lateral Relocation"
              className="w-full px-3 py-2 bg-slate-50 border border-emerald-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>
        ) : (
          <div className="md:col-span-1">
            <label className="block font-semibold text-slate-700 mb-1">Budget Category</label>
            <select
              value={inlineCategory}
              onChange={(e) => setInlineCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
            >
              {budgetLines.map(b => (
                <option key={b.category} value={b.category}>{b.category}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Sub-Section / Trade Phase</label>
          <input
            type="text"
            value={inlineSubSection}
            onChange={(e) => setInlineSubSection(e.target.value)}
            placeholder="e.g. Phase 2 Pier Drillings & Grade Beams"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Cost Code (CSI / Division)</label>
          <input
            type="text"
            value={inlineCostCode}
            onChange={(e) => setInlineCostCode(e.target.value)}
            placeholder="e.g. 02-310 or 03-100"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Order Amount ($) <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">$</span>
            <input
              type="number"
              value={inlineAmount}
              onChange={(e) => setInlineAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm"
              required
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Root Cause / Reason</label>
          <select
            value={inlineReason}
            onChange={(e) => setInlineReason(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
          >
            <option value="UNFORESEEN_SITE_CONDITION">Unforeseen Site Condition (Soil/Rock)</option>
            <option value="MUNICIPAL_CODE_REVISION">Municipal Code / Inspection Mandate</option>
            <option value="ARCHITECTURAL_BULLETIN">Architectural Bulletin / Plan Change</option>
            <option value="OWNER_ELECTED_UPGRADE">Owner Elected Scope Upgrade</option>
            <option value="VALUE_ENGINEERING">Value Engineering Scope Modification</option>
            <option value="OTHER">Other Custom Reason...</option>
          </select>
        </div>
        {inlineReason === 'OTHER' ? (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Specify Other Reason</label>
            <input
              type="text"
              value={inlineCustomReason}
              onChange={(e) => setInlineCustomReason(e.target.value)}
              placeholder="e.g. Utility Company Easement Re-route"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              required
            />
          </div>
        ) : (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Scope Description / Notes</label>
            <input
              type="text"
              value={inlineDesc}
              onChange={(e) => setInlineDesc(e.target.value)}
              placeholder="Details and engineer justification..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        )}
      </div>
    </>
  );
};
