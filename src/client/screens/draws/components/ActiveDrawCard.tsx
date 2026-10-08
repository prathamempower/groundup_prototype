import React from 'react';
import { ShieldAlert, FileUp, ArrowDownCircle } from 'lucide-react';
import { Draw, DrawLine } from '../../../../shared/types';
import { DrawLineItemCard } from './DrawLineItemCard';

interface ActiveDrawCardProps {
  activeDraw: Draw;
  activeLines: DrawLine[];
  resubmitting: boolean;
  disbursing: boolean;
  onResubmit: () => void;
  onDisburse: () => void;
}

export function ActiveDrawCard({
  activeDraw,
  activeLines,
  resubmitting,
  disbursing,
  onResubmit,
  onDisburse,
}: ActiveDrawCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-surface-900 border border-slate-800 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-400">
            Draw #{activeDraw.draw_number} Details {activeDraw.revision_number > 0 ? `(Revision ${activeDraw.revision_number})` : ''}
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            ${activeDraw.requested_total.toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">Requested</span>
          </div>
        </div>

        <span
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border self-start ${
            activeDraw.status === 'approved_full'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : activeDraw.status === 'approved_partial' || activeDraw.status === 'rejected'
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
          }`}
        >
          {activeDraw.status.replace('_', ' ')}
        </span>
      </div>

      {activeDraw.lender_notes && (
        <div className="p-4 rounded-2xl bg-surface-950 border border-slate-800 text-xs space-y-1">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Construction Lender Response:
          </span>
          <p className="text-slate-300 leading-relaxed">{activeDraw.lender_notes}</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Line Items ({activeLines.length})
        </div>

        <div className="space-y-2">
          {activeLines.map((line) => (
            <DrawLineItemCard key={line.id} line={line} />
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
        {(activeDraw.status === 'rejected' || activeDraw.status === 'approved_partial') && (
          <button
            onClick={onResubmit}
            disabled={resubmitting}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <FileUp className="w-4 h-4" />
            {resubmitting ? 'Creating Revision...' : `Upload Corrective Docs & Resubmit (Rev ${activeDraw.revision_number + 1})`}
          </button>
        )}

        {activeDraw.status === 'approved_partial' && activeDraw.disbursed_total === 0 && (
          <button
            onClick={onDisburse}
            disabled={disbursing}
            className="py-3 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <ArrowDownCircle className="w-4 h-4" />
            {disbursing ? 'Recording Wire...' : `Record Wire Disbursement ($${activeDraw.approved_total.toLocaleString()})`}
          </button>
        )}
      </div>
    </div>
  );
}
