import React from 'react';
import { Calendar, DollarSign, HardHat } from 'lucide-react';
import { ProjectFormData } from '../types';

interface FinancialsStepProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: string) => void;
}

export function FinancialsStep({ formData, onChange }: FinancialsStepProps) {
  const inputClass = "w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all";
  const selectClass = "w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all bg-white";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Financials & Schedule</h2>
      
      <div className="space-y-4">
        {(formData.acquisitionStatus === 'Acquired' || formData.acquisitionStatus === 'Under Contract') && (
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Acquisition Date
              </label>
              <input
                type="date"
                value={formData.acquisitionDate || ''}
                onChange={(e) => onChange('acquisitionDate', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" /> Acquisition Cost
              </label>
              <input
                type="text"
                value={formData.acquisitionCost || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  onChange('acquisitionCost', val);
                }}
                placeholder="0.00"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" /> Total Project Cost
            </label>
            <input
              type="text"
              value={formData.estimatedTotalCost || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                onChange('estimatedTotalCost', val);
              }}
              placeholder="Include all soft & hard costs"
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Target Completion
            </label>
            <input
              type="date"
              value={formData.targetCompletionDate || ''}
              onChange={(e) => onChange('targetCompletionDate', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Funding Method *</label>
            <select
              value={formData.fundingMethod || ''}
              onChange={(e) => onChange('fundingMethod', e.target.value)}
              className={selectClass}
            >
              <option value="">Select funding...</option>
              <option value="Cash">All Cash</option>
              <option value="Loan">Debt / Loan</option>
              <option value="Combined">Equity & Debt Combined</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-slate-400" /> Project Manager
            </label>
            <input
              type="text"
              value={formData.projectManager || ''}
              onChange={(e) => onChange('projectManager', e.target.value)}
              placeholder="Lead PM Name"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
