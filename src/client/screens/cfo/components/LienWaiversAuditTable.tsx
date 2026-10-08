import React from 'react';
import { ShieldCheck, Mail, Check } from 'lucide-react';
import { LienWaiverItem } from '../types';

interface LienWaiversAuditTableProps {
  lienWaivers: LienWaiverItem[];
  onRemindVendor: (vendor: string) => void;
  onResolveWaiver: (id: string) => void;
}

export function LienWaiversAuditTable({
  lienWaivers,
  onRemindVendor,
  onResolveWaiver,
}: LienWaiversAuditTableProps) {
  const missingCount = lienWaivers.filter((lw) => lw.waiverStatus === 'MISSING').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">Missing Lien Waiver Audit Queue</h3>
            <p className="text-xs text-slate-500">
              Banks reject draw line items if paid subcontractors lack executed unconditional lien waivers
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          {missingCount} Waivers Needed
        </span>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3 text-left">Subcontractor Entity</th>
              <th className="px-4 py-3 text-left">Trade</th>
              <th className="px-4 py-3 text-left">Invoice Ref</th>
              <th className="px-4 py-3 text-right">Paid Amount</th>
              <th className="px-4 py-3 text-center">Waiver Status</th>
              <th className="px-4 py-3 text-right">Audit Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lienWaivers.map((lw) => (
              <tr key={lw.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-bold text-slate-900">{lw.vendor}</td>
                <td className="px-4 py-3 text-slate-600">{lw.trade}</td>
                <td className="px-4 py-3 font-mono text-slate-500">{lw.invoiceNo}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                  ${lw.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  {lw.waiverStatus === 'VERIFIED' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Waiver Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                      Missing Waiver
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {lw.waiverStatus === 'MISSING' ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onRemindVendor(lw.vendor)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" /> Remind
                      </button>
                      <button
                        onClick={() => onResolveWaiver(lw.id)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold cursor-pointer transition"
                      >
                        Upload & Verify
                      </button>
                    </div>
                  ) : (
                    <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-end gap-1">
                      <Check className="w-3.5 h-3.5" /> Clean Audit
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
