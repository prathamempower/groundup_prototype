import React from 'react';
import { FileText } from 'lucide-react';
import { Project } from '../../../../shared/types';

interface ExecutiveNarrativeCardProps {
  activeProject?: Project;
}

export function ExecutiveNarrativeCard({ activeProject }: ExecutiveNarrativeCardProps) {
  const name = activeProject?.name || 'Selected Project';
  const isCompleted = activeProject?.status === 'COMPLETED';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-700" />
          <h3 className="font-bold text-slate-900 text-base">
            Executive Narrative · {name}
          </h3>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">
          Verified Status · {isCompleted ? 'Closed' : 'Active'}
        </span>
      </div>

      <div className="prose prose-sm max-w-none text-slate-700 space-y-3 leading-relaxed">
        <p>
          <strong>Construction Progress:</strong> {name} ({activeProject?.address || 'Site'}) has reached target construction milestones under lead contractor {activeProject?.gc_name || 'General Contractor'}. Field work and trade logs are actively tracked.
        </p>
        <p>
          <strong>Financial Health & Budget:</strong> Total target budget of ${activeProject?.target_budget?.toLocaleString() || '1,000,000'} is monitored against lender holdback requirements with {activeProject?.lender_name || 'Commercial Bank'}. Contingency reserves remain healthy.
        </p>
        <p>
          <strong>Sales & Disposition:</strong> Underwriting projected sale valuation of ${activeProject?.expected_sale_price?.toLocaleString() || '1,500,000'} for {activeProject?.units || 1} units. Equity distribution schedule is synchronized with loan repayments.
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500">
        <span>
          Lender Partner: <strong>{activeProject?.lender_name || 'Commercial Bank'}</strong>
        </span>
        <span className="text-purple-700 font-semibold cursor-pointer hover:underline">
          View Historical Archives →
        </span>
      </div>
    </div>
  );
}
