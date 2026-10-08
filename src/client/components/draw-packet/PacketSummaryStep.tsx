import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PacketSummaryStepProps {
  nextDrawNumber: number;
  selectedLinesCount: number;
  netDisbursement: number;
}

export function PacketSummaryStep({
  nextDrawNumber,
  selectedLinesCount,
  netDisbursement,
}: PacketSummaryStepProps) {
  return (
    <div className="space-y-4 text-xs">
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
        <div className="text-emerald-900">
          <strong>Packet Ready for Portal Submission:</strong> All audit conditions validated. Draw #{nextDrawNumber} will be generated with full supporting line items.
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50 font-mono">
        <div className="flex justify-between">
          <span className="text-slate-500">Project:</span>
          <span className="font-bold text-slate-900">73 Broadway, Hoboken</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Lender:</span>
          <span className="font-bold text-slate-900">BCB Community Bank</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Draw Number:</span>
          <span className="font-bold text-slate-900">#{nextDrawNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Categories Included:</span>
          <span className="font-bold text-slate-900">
            {selectedLinesCount} budget lines
          </span>
        </div>
        <div className="flex justify-between text-emerald-700 font-bold pt-2 border-t border-slate-200">
          <span>Net Requested:</span>
          <span>${netDisbursement.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
