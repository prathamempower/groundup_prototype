import React from 'react';
import { ProjectFormData } from '../types';

interface ReviewStepProps {
  formData: ProjectFormData;
}

export function ReviewStep({ formData }: ReviewStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h2 className="text-lg font-bold text-slate-900">Review & Confirm</h2>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-100">
          Ready to Create
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-6 gap-x-8">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Project Name</p>
          <p className="font-bold text-slate-900">{formData.projectName || '-'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Address</p>
          <p className="font-bold text-slate-900">{formData.propertyAddress || '-'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type & Strategy</p>
          <p className="font-bold text-slate-900">{formData.projectType} • {formData.developmentStrategy}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Entity</p>
          <p className="font-bold text-slate-900">{formData.projectEntity || '-'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Stage</p>
          <p className="font-bold text-slate-900">{formData.currentStage || '-'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Acquisition</p>
          <p className="font-bold text-slate-900">
            {formData.acquisitionStatus} 
            {formData.acquisitionDate ? ` (${formData.acquisitionDate})` : ''}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Est. Total Cost</p>
          <p className="font-mono font-bold text-slate-900">
            {formData.estimatedTotalCost ? `$${Number(formData.estimatedTotalCost).toLocaleString()}` : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Completion</p>
          <p className="font-bold text-slate-900">{formData.targetCompletionDate || '-'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contract Model</p>
          <p className="font-bold text-slate-900">
            {formData.contractModel === 'OPEN_BOOK' ? 'Open-Book (Cost Plus / T&M)' : 'Fixed-Price (Lump Sum)'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Funding & Lender</p>
          <p className="font-bold text-slate-900">
            {formData.fundingMethod || 'All Cash'}
            {formData.lenderName ? ` (${formData.lenderName})` : ''}
          </p>
        </div>
        {formData.hudDocumentName && (
          <div className="col-span-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Closing HUD Document</p>
            <p className="font-mono text-xs text-slate-800 bg-slate-100 p-2 rounded-lg border border-slate-200">
              {formData.hudDocumentName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
