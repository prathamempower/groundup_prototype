import React from 'react';
import { OtherCategoryFields } from './OtherCategoryFields';

interface ChangeOrderFormFieldsProps {
  coNumber: string;
  setCoNumber: (val: string) => void;
  category: string;
  isOtherCategory: boolean;
  onCategorySelect: (val: string) => void;
  categories: string[];
  customCategory: string;
  setCustomCategory: (val: string) => void;
  subSection: string;
  setSubSection: (val: string) => void;
  costCode: string;
  setCostCode: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  reason: string;
  setReason: (val: string) => void;
  customReason: string;
  setCustomReason: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
}

export function ChangeOrderFormFields({
  coNumber,
  setCoNumber,
  category,
  isOtherCategory,
  onCategorySelect,
  categories,
  customCategory,
  setCustomCategory,
  subSection,
  setSubSection,
  costCode,
  setCostCode,
  amount,
  setAmount,
  reason,
  setReason,
  customReason,
  setCustomReason,
  description,
  setDescription,
}: ChangeOrderFormFieldsProps) {
  return (
    <>
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
            onChange={(e) => onCategorySelect(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none font-medium cursor-pointer"
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

      {isOtherCategory ? (
        <OtherCategoryFields
          customCategory={customCategory}
          setCustomCategory={setCustomCategory}
          subSection={subSection}
          setSubSection={setSubSection}
          costCode={costCode}
          setCostCode={setCostCode}
        />
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
          className="w-full px-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
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
    </>
  );
}
