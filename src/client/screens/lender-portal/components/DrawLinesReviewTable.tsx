import React from 'react';
import { RejectionReasonCode } from '../../../../shared/types';
import { LenderDrawLine } from '../types';

interface DrawLinesReviewTableProps {
  drawLines: LenderDrawLine[];
  onUpdateLineStatus: (
    lineId: string,
    status: 'APPROVED' | 'PARTIAL' | 'REJECTED',
    reason?: RejectionReasonCode
  ) => void;
}

export function DrawLinesReviewTable({
  drawLines,
  onUpdateLineStatus,
}: DrawLinesReviewTableProps) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
        <span>Schedule of Values Category Breakdown</span>
        <span className="text-slate-500 font-normal">Audit each line item below</span>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-right">Requested</th>
            <th className="px-4 py-3 text-center">Lien Waiver</th>
            <th className="px-4 py-3 text-center">Inspection</th>
            <th className="px-4 py-3 text-right">Approved Amount</th>
            <th className="px-4 py-3 text-right">Decision</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {drawLines.map((line) => (
            <tr key={line.id} className="hover:bg-slate-50 transition">
              <td className="px-4 py-3">
                <div className="font-bold text-slate-900">{line.category}</div>
                {line.rejectionReason && (
                  <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                    ⚠️ Reason: {line.rejectionReason.replace(/_/g, ' ')}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                ${line.requested.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-center">
                {line.lienWaiverPresent ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                    Missing Waiver
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ Passed
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                ${line.approved.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onUpdateLineStatus(line.id, 'APPROVED')}
                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                      line.status === 'APPROVED'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onUpdateLineStatus(line.id, 'REJECTED', 'MISSING_LIEN_WAIVER')}
                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                      line.status === 'REJECTED'
                        ? 'bg-red-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
