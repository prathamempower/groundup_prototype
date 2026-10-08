// GroundUp AI — GC (Fixed / Milestone Contract) Portal
// Dedicated portal for GCs under lump-sum contracts: milestone claims, completion proof, and change orders

import React from 'react';
import { Project } from '../../shared/types';
import { useGCFixedState } from './gc-fixed/use-gc-fixed-state';
import { GCFixedHeader } from './gc-fixed/components/GCFixedHeader';
import { GCFinancialSummary } from './gc-fixed/components/GCFinancialSummary';
import { GCMilestonesTable } from './gc-fixed/components/GCMilestonesTable';
import { GCChangeOrdersTable } from './gc-fixed/components/GCChangeOrdersTable';
import { GCClaimModal } from './gc-fixed/components/GCClaimModal';
import { GCChangeOrderModal } from './gc-fixed/components/GCChangeOrderModal';

interface GCFixedPortalScreenProps {
  projects: Project[];
  selectedProjectId: string;
}

export function GCFixedPortalScreen({
  projects,
  selectedProjectId,
}: GCFixedPortalScreenProps) {
  const state = useGCFixedState(projects, selectedProjectId);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <GCFixedHeader
        activeProject={state.activeProject}
        onOpenClaimModal={() => state.setIsClaimModalOpen(true)}
      />

      {/* Contract Financial Overview */}
      <GCFinancialSummary
        totalContract={state.totalContract}
        totalApprovedCOAmount={state.totalApprovedCOAmount}
        visibleCOsCount={state.visibleCOs.length}
        adjustedContract={state.adjustedContract}
        totalPaid={state.totalPaid}
        remainingContract={state.remainingContract}
      />

      {/* Milestone Claims Table */}
      <GCMilestonesTable milestones={state.milestones} />

      {/* Approved Change Orders */}
      <GCChangeOrdersTable
        visibleCOs={state.visibleCOs}
        totalApprovedCOAmount={state.totalApprovedCOAmount}
        onOpenGCCOModal={() => state.setIsGCCOModalOpen(true)}
      />

      {/* Submit Milestone Claim Modal */}
      <GCClaimModal
        isOpen={state.isClaimModalOpen}
        onClose={() => state.setIsClaimModalOpen(false)}
        milestones={state.milestones}
        claimMilestoneId={state.claimMilestoneId}
        setClaimMilestoneId={state.setClaimMilestoneId}
        claimAmount={state.claimAmount}
        setClaimAmount={state.setClaimAmount}
        notes={state.notes}
        setNotes={state.setNotes}
        claimSuccess={state.claimSuccess}
        onSubmit={state.handleSubmitClaim}
      />

      {/* GC Change Order Request Modal */}
      <GCChangeOrderModal
        isOpen={state.isGCCOModalOpen}
        onClose={() => state.setIsGCCOModalOpen(false)}
        newGCCOCategory={state.newGCCOCategory}
        setNewGCCOCategory={state.setNewGCCOCategory}
        newGCCOSubSection={state.newGCCOSubSection}
        setNewGCCOSubSection={state.setNewGCCOSubSection}
        newGCCOAmount={state.newGCCOAmount}
        setNewGCCOAmount={state.setNewGCCOAmount}
        newGCCOReason={state.newGCCOReason}
        setNewGCCOReason={state.setNewGCCOReason}
        newGCCODesc={state.newGCCODesc}
        setNewGCCODesc={state.setNewGCCODesc}
        gcCOSuccess={state.gcCOSuccess}
        onSubmit={state.handleGCSubmitCO}
      />
    </div>
  );
}
