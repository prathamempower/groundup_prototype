import React from 'react';
import { Plus, FileCheck, CheckCircle2 } from 'lucide-react';
import { GCChangeOrderItem } from '../types';

interface GCChangeOrdersTableProps {
  visibleCOs: GCChangeOrderItem[];
  totalApprovedCOAmount: number;
  onOpenGCCOModal: () => void;
}

export const GCChangeOrdersTable: React.FC<GCChangeOrdersTableProps> = ({
  visibleCOs,
  totalApprovedCOAmount,
  onOpenGCCOModal,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              Approved Contract Change Orders & Supplemental Orders (Showed to GC)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
              {visibleCOs.length} Orders Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            These owner-approved change orders and supplemental trade scopes are formally broadcast to your contractor contract ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            +${totalApprovedCOAmount.toLocaleString()} Total Scope Added
          </span>
          <button
            onClick={onOpenGCCOModal}
            className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Request New Scope / Order</span>
          </button>
        </div>
      </div>

      {visibleCOs.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No change orders currently assigned or showed to GC for this project.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3 text-left">Order #</th>
                <th className="px-5 py-3 text-left">Scope Category & Sub-Section</th>
                <th className="px-5 py-3 text-right">Approved Amount</th>
                <th className="px-5 py-3 text-left">Justification & Scope Notes</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-left">Owner Authorization Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleCOs.map((co) => (
                <tr key={co.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{co.number}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{co.category}</span>
                      {co.is_other && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Other Scope
                        </span>
                      )}
                    </div>
                    {co.sub_section && (
                      <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                        Sub-Section: {co.sub_section}
                      </div>
                    )}
                    {co.cost_code && (
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Cost Code: {co.cost_code}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-bold text-emerald-700 text-sm">
                    +${(Number(co.amount) || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-xs">
                    <div className="font-semibold text-slate-800">{co.reason?.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{co.description}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Showed to GC · Authorized</span>
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{co.date}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-700 max-w-xs">
                    <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 text-[11px] text-indigo-950 font-medium">
                      {co.gc_notes || 'Owner approved. GC authorized to proceed with execution.'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
