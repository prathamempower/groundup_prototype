import React from 'react';
import { Project } from '../../shared/types';
import { useLenderPortalState } from './lender-portal/use-lender-portal-state';
import { LenderPortalHeader } from './lender-portal/components/LenderPortalHeader';
import { LoanFacilityMetrics } from './lender-portal/components/LoanFacilityMetrics';
import { DrawLinesReviewTable } from './lender-portal/components/DrawLinesReviewTable';
import { WireAuthorizationPanel } from './lender-portal/components/WireAuthorizationPanel';
import { WireExecutionForm } from './lender-portal/components/WireExecutionForm';

interface LenderPortalScreenProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onDisburseFunds?: (drawId: string, amount: number) => void;
}

export function LenderPortalScreen({
  projects,
  selectedProjectId,
  onSelectProject,
  onDisburseFunds,
}: LenderPortalScreenProps) {
  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const {
    drawStatus,
    wireRef,
    setWireRef,
    drawLines,
    totalRequested,
    totalApproved,
    retainageHoldback,
    netWireDisbursement,
    handleUpdateLineStatus,
    handleConfirmDisbursement,
  } = useLenderPortalState(onDisburseFunds);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <LenderPortalHeader
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={onSelectProject}
      />

      <LoanFacilityMetrics totalRequested={totalRequested} />

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white font-mono">
                Draw #3
              </span>
              <h3 className="font-bold text-slate-900 text-base">AIA G702 / G703 Application for Payment</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Borrower: GroundUp Partners LLC · Project: {activeProject.name} · Submitted: Oct 1, 2026
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                drawStatus === 'disbursed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {drawStatus === 'disbursed' ? '✓ Funds Disbursed' : '⏳ Pending Review'}
            </span>
          </div>
        </div>

        <DrawLinesReviewTable
          drawLines={drawLines}
          onUpdateLineStatus={handleUpdateLineStatus}
        />

        <WireAuthorizationPanel
          totalRequested={totalRequested}
          totalApproved={totalApproved}
          retainageHoldback={retainageHoldback}
          netWireDisbursement={netWireDisbursement}
        />

        <WireExecutionForm
          wireRef={wireRef}
          setWireRef={setWireRef}
          drawStatus={drawStatus}
          totalApproved={totalApproved}
          netWireDisbursement={netWireDisbursement}
          onConfirmDisbursement={handleConfirmDisbursement}
        />
      </div>
    </div>
  );
}
