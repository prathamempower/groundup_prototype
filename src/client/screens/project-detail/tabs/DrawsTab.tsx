import React from 'react';
import { Plus } from 'lucide-react';
import { UserRole } from '../../../../shared/types';
import { hasPermission } from '../../../../shared/rbac/matrix';
import { DrawItem } from '../types';

interface DrawsTabProps {
  draws: DrawItem[];
  currentRole?: UserRole;
  onOpenDrawPacketModal: () => void;
  onOpenLenderPackage?: () => void;
}

const fmt = (n: number) => '$' + n.toLocaleString();

export const DrawsTab: React.FC<DrawsTabProps> = ({
  draws,
  currentRole = 'OWNER',
  onOpenDrawPacketModal,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Construction Draws & Lender Disbursements</h3>
          <p className="text-xs text-slate-500">Track requested vs approved vs wire disbursed funding</p>
        </div>
        {hasPermission(currentRole, 'draw:create_packet') && (
          <button
            onClick={onOpenDrawPacketModal}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Build Draw #{draws.length + 1} Packet</span>
          </button>
        )}
      </div>

      {/* Retainage Ledger & Statutory Waivers Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statutory Retainage Ledger</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">$90,367.00</div>
          <div className="text-[11px] text-slate-500 mt-0.5">10% withheld across all approved draws</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lien Waivers Compliance</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">100% Verified</div>
          <div className="text-[11px] text-slate-500 mt-0.5">AIA G706 / G706A release forms in place</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lender Disbursement Mode</div>
          <div className="text-base font-bold text-slate-900 mt-1.5">Direct Fedwire</div>
          <div className="text-[11px] text-slate-500 mt-0.5">BCB Bank title escrow settlement</div>
        </div>
      </div>

      <div className="space-y-3">
        {draws.map((d) => (
          <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                  #{d.number}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Draw #{d.number} {d.revision > 0 ? `(Revision ${d.revision})` : ''}
                  </div>
                  <div className="text-xs text-slate-500">Submitted: {d.submitted}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 uppercase">Requested</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">{fmt(d.requested)}</div>
                </div>
                {d.disbursed !== null && (
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 uppercase">Disbursed</div>
                    <div className="font-mono font-bold text-emerald-700 text-sm">{fmt(d.disbursed)}</div>
                  </div>
                )}
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  d.status === 'disbursed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {d.status}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-50">
                  {d.lines.map((l, i) => (
                    <tr key={i} className="text-slate-600">
                      <td className="py-1.5">{l.category}</td>
                      <td className="py-1.5 text-right font-mono font-semibold text-slate-900">
                        {fmt(l.requested)}
                      </td>
                      <td className="py-1.5 text-right font-semibold">
                        <span className={l.status === 'disbursed' ? 'text-emerald-700' : 'text-amber-600'}>
                          {l.status === 'disbursed' ? '✓ Disbursed' : '⏳ Pending Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {d.notes && (
              <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Memo: {d.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
