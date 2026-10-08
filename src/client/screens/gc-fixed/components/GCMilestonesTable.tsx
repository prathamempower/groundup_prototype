import React from 'react';
import { Camera } from 'lucide-react';
import { GCMilestoneItem } from '../types';

interface GCMilestonesTableProps {
  milestones: GCMilestoneItem[];
}

export const GCMilestonesTable: React.FC<GCMilestonesTableProps> = ({ milestones }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
        <span>Contract Milestones & Claim Status</span>
        <span className="text-slate-500 font-normal">Payment released upon verified completion proof</span>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-5 py-3 text-left">Milestone Description</th>
            <th className="px-5 py-3 text-right">Agreed Contract Price</th>
            <th className="px-5 py-3 text-center">Completion Proof</th>
            <th className="px-5 py-3 text-center">Township Inspection</th>
            <th className="px-5 py-3 text-right">Payment Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {milestones.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50 transition">
              <td className="px-5 py-4 font-bold text-slate-900">{m.name}</td>
              <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">
                ${m.contractAmount.toLocaleString()}
              </td>
              <td className="px-5 py-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 text-slate-700 font-medium">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>{m.completionProofCount} Photos</span>
                </span>
              </td>
              <td className="px-5 py-4 text-center">
                {m.inspectionPassed ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Passed
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">Pending inspection</span>
                )}
              </td>
              <td className="px-5 py-4 text-right">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    m.status === 'DISBURSED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : m.status === 'OWNER_APPROVED'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : m.status === 'CLAIM_SUBMITTED'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {m.status.replace(/_/g, ' ')}
                </span>
                <div className="text-[10px] text-slate-400 mt-0.5">{m.paidDate}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
