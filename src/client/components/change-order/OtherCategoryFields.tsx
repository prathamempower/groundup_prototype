import React from 'react';
import { Layers } from 'lucide-react';

interface OtherCategoryFieldsProps {
  customCategory: string;
  setCustomCategory: (val: string) => void;
  subSection: string;
  setSubSection: (val: string) => void;
  costCode: string;
  setCostCode: (val: string) => void;
}

export function OtherCategoryFields({
  customCategory,
  setCustomCategory,
  subSection,
  setSubSection,
  costCode,
  setCostCode,
}: OtherCategoryFieldsProps) {
  return (
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
  );
}
