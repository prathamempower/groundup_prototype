import React, { useState } from 'react';
import { CheckCircle2, Mail, Scale } from 'lucide-react';
import { UserRole } from '../../../../shared/types';
import { LienWaiverItem } from '../../cfo/types';
import { INITIAL_LIEN_WAIVERS, INITIAL_RECONCILIATION_ROWS } from '../../cfo/mock-data';
import { CFOHeader } from '../../cfo/components/CFOHeader';
import { CFOReconciliationKPITiles } from '../../cfo/components/CFOReconciliationKPITiles';
import { LienWaiversAuditTable } from '../../cfo/components/LienWaiversAuditTable';
import { SpendVsDrawMatrix } from '../../cfo/components/SpendVsDrawMatrix';

interface ReconTabProps {
  currentRole: UserRole;
  projectName?: string;
}

export const ReconTab: React.FC<ReconTabProps> = ({
  currentRole: _currentRole,
  projectName = '73 Broadway, Hoboken',
}) => {
  const [lienWaivers, setLienWaivers] = useState<LienWaiverItem[]>(INITIAL_LIEN_WAIVERS);
  const [reconciliationRows] = useState(INITIAL_RECONCILIATION_ROWS);

  const totalActualSpent = reconciliationRows.reduce((s, r) => s + r.actualSpent, 0);
  const totalDrawnFunded = reconciliationRows.reduce((s, r) => s + r.drawnFunded, 0);
  const totalUnDrawn = reconciliationRows.reduce((s, r) => s + r.unDrawn, 0);
  const totalRetainage = reconciliationRows.reduce((s, r) => s + r.retainage, 0);

  const [exportSuccess, setExportSuccess] = useState(false);
  const [remindToast, setRemindToast] = useState<string | null>(null);

  const handleResolveWaiver = (id: string) => {
    setLienWaivers((prev) =>
      prev.map((lw) => (lw.id === id ? { ...lw, waiverStatus: 'VERIFIED', drawImpact: 'Resolved' } : lw))
    );
  };

  const handleRemindVendor = (vendor: string) => {
    setRemindToast(vendor);
    setTimeout(() => setRemindToast(null), 3000);
  };

  const handleExport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {exportSuccess && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Comprehensive Financial Variance Workbook (Excel) generated & downloaded.</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono uppercase">Exported</span>
        </div>
      )}

      {remindToast && (
        <div className="bg-amber-900 text-white px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-300" />
            <span>Automated unconditional lien waiver request emailed to <strong>{remindToast}</strong>.</span>
          </div>
          <span className="text-[10px] text-amber-300 font-mono uppercase">Dispatched</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
              Financial Reconciliation & Audit
            </span>
            <span className="text-xs text-slate-400 font-mono">{projectName}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Spend vs. Draw Reconciliation Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronizes Spend Truth (invoices paid) against Funding Truth (lender wires) and audits statutory lien waivers.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs shrink-0"
        >
          Export Variance Excel
        </button>
      </div>

      <CFOReconciliationKPITiles
        totalActualSpent={totalActualSpent}
        totalDrawnFunded={totalDrawnFunded}
        totalUnDrawn={totalUnDrawn}
        totalRetainage={totalRetainage}
      />

      <LienWaiversAuditTable
        lienWaivers={lienWaivers}
        onRemindVendor={handleRemindVendor}
        onResolveWaiver={handleResolveWaiver}
      />

      <SpendVsDrawMatrix reconciliationRows={reconciliationRows} />
    </div>
  );
};
