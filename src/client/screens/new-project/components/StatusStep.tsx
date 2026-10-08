import React from 'react';
import { FileText } from 'lucide-react';
import { ProjectFormData } from '../types';

interface StatusStepProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: string) => void;
}

export function StatusStep({ formData, onChange }: StatusStepProps) {
  const inputClass = "w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all";
  const selectClass = "w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all bg-white";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Current Status</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" /> Project Entity / Owner *
          </label>
          <input
            type="text"
            value={formData.projectEntity || ''}
            onChange={(e) => onChange('projectEntity', e.target.value)}
            placeholder="e.g. 123 Main St LLC"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Project Stage *</label>
          <select
            value={formData.currentStage || ''}
            onChange={(e) => onChange('currentStage', e.target.value)}
            className={selectClass}
          >
            <option value="">Select stage...</option>
            <option value="Pre-development">Pre-development / Feasibility</option>
            <option value="Permitting">Permitting & Approvals</option>
            <option value="Pre-construction">Pre-construction</option>
            <option value="Construction">Active Construction</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Acquisition Status *</label>
          <div className="grid grid-cols-3 gap-3">
            {['Acquired', 'Under Contract', 'Evaluating'].map(status => (
              <button
                key={status}
                type="button"
                onClick={() => onChange('acquisitionStatus', status)}
                className={`p-3 rounded-lg border text-sm font-medium transition text-center cursor-pointer ${
                  formData.acquisitionStatus === status
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {status === 'Acquired' ? 'Already Acquired' : status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
