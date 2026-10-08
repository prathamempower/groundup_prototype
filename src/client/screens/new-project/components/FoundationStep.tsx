import React from 'react';
import { Building, MapPin } from 'lucide-react';
import { ProjectFormData } from '../types';

interface FoundationStepProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: string) => void;
}

export function FoundationStep({ formData, onChange }: FoundationStepProps) {
  const inputClass = "w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all";
  const selectClass = "w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all bg-white";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Project Foundation</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400" /> Project Name *
          </label>
          <input
            type="text"
            value={formData.projectName || ''}
            onChange={(e) => onChange('projectName', e.target.value)}
            placeholder="e.g. 73 Broadway"
            className={inputClass}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" /> Property Address *
          </label>
          <input
            type="text"
            value={formData.propertyAddress || ''}
            onChange={(e) => onChange('propertyAddress', e.target.value)}
            placeholder="Full street address"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Type *</label>
            <select
              value={formData.projectType || ''}
              onChange={(e) => onChange('projectType', e.target.value)}
              className={selectClass}
            >
              <option value="">Select type...</option>
              <option value="Ground-up">Ground-up Development</option>
              <option value="Value-add">Value-add Rehab</option>
              <option value="Renovation">Heavy Renovation</option>
              <option value="Adaptive Reuse">Adaptive Reuse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Strategy *</label>
            <select
              value={formData.developmentStrategy || ''}
              onChange={(e) => onChange('developmentStrategy', e.target.value)}
              className={selectClass}
            >
              <option value="">Select strategy...</option>
              <option value="Build to Rent">Build to Rent</option>
              <option value="Build to Sell">Build to Sell</option>
              <option value="Hold">Long-term Hold</option>
              <option value="Fix and Flip">Fix and Flip</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
