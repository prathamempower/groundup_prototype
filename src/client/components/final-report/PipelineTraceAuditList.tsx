import React from 'react';
import { Clock } from 'lucide-react';
import { FinalReportData } from '../../../server/services/pipelineService';

interface PipelineTraceAuditListProps {
  pipelineTrace: FinalReportData['pipelineTrace'];
}

export function PipelineTraceAuditList({ pipelineTrace }: PipelineTraceAuditListProps) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
        <Clock className="w-4 h-4 text-emerald-600" />
        <span>10-Step AI Processing Pipeline Audit Trail</span>
      </h3>
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
        {pipelineTrace.map((step) => (
          <div key={step.stepNumber} className="p-2.5 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <p className="font-bold text-slate-900">{step.title}</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{step.description}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {(step.confidence * 100).toFixed(0)}% Conf
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">{step.timestamp.split('T')[1]?.substring(0, 8) || 'Verified'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
