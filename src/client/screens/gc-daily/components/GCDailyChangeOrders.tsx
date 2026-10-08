import React from 'react';
import { FileCheck, CheckCircle2 } from 'lucide-react';
import { GCDailyChangeOrderItem } from '../types';

interface GCDailyChangeOrdersProps {
  visibleCOs: GCDailyChangeOrderItem[];
}

export const GCDailyChangeOrders: React.FC<GCDailyChangeOrdersProps> = ({ visibleCOs }) => {
  const totalAuthorized = visibleCOs.reduce((sum, co) => sum + (Number(co.amount) || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              Approved Supplemental Scope & Change Orders (Showed to GC)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
              {visibleCOs.length} Orders Authorized
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Owner-approved scope modifications and trade orders broadcasted directly to field contractor operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
            +${totalAuthorized.toLocaleString()} Total Authorized
          </span>
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
                <th className="px-5 py-3 text-left">Trade Category & Sub-Section</th>
                <th className="px-5 py-3 text-right">Authorized Amount</th>
                <th className="px-5 py-3 text-left">Root Cause / Scope Description</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-left">Owner Authorization Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleCOs.map((co) => (
                <tr key={co.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-teal-600" />
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
                  <td className="px-5 py-4 text-right font-mono font-bold text-teal-800 text-sm">
                    +${(Number(co.amount) || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-xs">
                    <div className="font-semibold text-slate-800">{co.reason?.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{co.description}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      <CheckCircle2 className="w-3 h-3 text-teal-600" />
                      <span>Showed to GC · Authorized</span>
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{co.date}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-700 max-w-xs">
                    <div className="p-2 bg-teal-50/50 rounded-lg border border-teal-100 text-[11px] text-teal-950 font-medium">
                      {co.gc_notes || 'Owner approved. GC authorized to proceed with trade work.'}
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
