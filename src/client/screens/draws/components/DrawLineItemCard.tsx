import React from 'react';
import { AlertCircle } from 'lucide-react';
import { DrawLine } from '../../../../shared/types';

interface DrawLineItemCardProps {
  line: DrawLine;
}

export function DrawLineItemCard({ line }: DrawLineItemCardProps) {
  const isRejected = line.status === 'rejected';

  return (
    <div
      className={`p-4 rounded-2xl border ${
        isRejected ? 'bg-rose-950/20 border-rose-500/40' : 'bg-surface-950 border-slate-800'
      } space-y-2`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm text-white">{line.category}</span>
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            line.status === 'disbursed'
              ? 'bg-purple-500/20 text-purple-300'
              : line.status === 'approved'
              ? 'bg-emerald-500/20 text-emerald-300'
              : isRejected
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {line.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Requested</span>
          <span className="text-slate-200 font-bold">${line.requested_amount.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Approved</span>
          <span className="text-emerald-400 font-bold">${line.approved_amount.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Funded</span>
          <span className="text-purple-300 font-bold">${line.funded_amount.toLocaleString()}</span>
        </div>
      </div>

      {line.rejection_reason_code && (
        <div className="pt-2 text-xs text-rose-300 flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>Rejection Code: {line.rejection_reason_code}</strong>
            {line.rejection_notes && <p className="text-[11px] text-slate-400">{line.rejection_notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
