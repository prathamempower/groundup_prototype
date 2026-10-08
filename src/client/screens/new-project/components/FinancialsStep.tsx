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
              <option value="Cash">All Cash (Equity Only)</option>
              <option value="Loan">Senior Construction Loan</option>
              <option value="Combined">Equity & Senior Debt Combined</option>
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

        {/* GC Contract Model */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            General Contractor Contract Model *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange('contractModel', 'FIXED_PRICE')}
              className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                formData.contractModel === 'FIXED_PRICE' || !formData.contractModel
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs mb-1">Fixed-Price (Lump Sum)</div>
              <div className="text-[11px] opacity-80 leading-relaxed">
                AIA G702/G703 milestone progress claims with statutory retainage.
              </div>
            </button>
            <button
              type="button"
              onClick={() => onChange('contractModel', 'OPEN_BOOK')}
              className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                formData.contractModel === 'OPEN_BOOK'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs mb-1">Open-Book (Cost Plus / T&M)</div>
              <div className="text-[11px] opacity-80 leading-relaxed">
                Daily worker headcounts, receipt audits, subcontractor invoices & GC fee markup.
              </div>
            </button>
          </div>
        </div>

        {/* Debt / Lender Terms */}
        {(formData.fundingMethod === 'Loan' || formData.fundingMethod === 'Combined') && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Senior Construction Loan Parameters
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">External Lender / Bank</label>
                <input
                  type="text"
                  value={formData.lenderName || ''}
                  onChange={(e) => onChange('lenderName', e.target.value)}
                  placeholder="e.g. BCB Community Bank"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Interest Rate (%)</label>
                <input
                  type="text"
                  value={formData.interestRate || ''}
                  onChange={(e) => onChange('interestRate', e.target.value)}
                  placeholder="e.g. 7.5%"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Interest Carry Method</label>
                <select
                  value={formData.interestPaymentMethod || 'RESERVE'}
                  onChange={(e) => onChange('interestPaymentMethod', e.target.value as any)}
                  className={selectClass}
                >
                  <option value="RESERVE">Drawn from Loan Reserve</option>
                  <option value="MONTHLY_OUT_OF_POCKET">Monthly Out of Pocket</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Pro Forma Baseline */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Pro Forma Cost Baseline
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hard Construction Costs ($)</label>
              <input
                type="text"
                value={formData.hardCosts || ''}
                onChange={(e) => onChange('hardCosts', e.target.value)}
                placeholder="e.g. 2,100,000"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Soft Costs & Fees ($)</label>
              <input
                type="text"
                value={formData.softCosts || ''}
                onChange={(e) => onChange('softCosts', e.target.value)}
                placeholder="e.g. 450,000"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contingency Reserve (%)</label>
              <input
                type="text"
                value={formData.contingencyPct || '10'}
                onChange={(e) => onChange('contingencyPct', e.target.value)}
                placeholder="10"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
