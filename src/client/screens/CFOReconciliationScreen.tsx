import React, { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { Project } from '../../shared/types';
import { LienWaiverItem } from './cfo/types';
import { INITIAL_LIEN_WAIVERS, INITIAL_RECONCILIATION_ROWS } from './cfo/mock-data';
import { CFOHeader } from './cfo/components/CFOHeader';
import { CFOReconciliationKPITiles } from './cfo/components/CFOReconciliationKPITiles';
import { LienWaiversAuditTable } from './cfo/components/LienWaiversAuditTable';
import { SpendVsDrawMatrix } from './cfo/components/SpendVsDrawMatrix';

interface CFOReconciliationScreenProps {
  projects: Project[];
  selectedProjectId: string;
}

export function CFOReconciliationScreen({
  projects: _projects,
  selectedProjectId: _selectedProjectId,
}: CFOReconciliationScreenProps) {
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
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
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

      <CFOHeader onExport={handleExport} />

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
}
