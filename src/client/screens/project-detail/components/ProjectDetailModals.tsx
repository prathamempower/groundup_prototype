import React from 'react';
import { ChangeOrderModal } from '../../../components/ChangeOrderModal';
import { ContingencyModal } from '../../../components/ContingencyModal';
import { DrawPacketModal } from '../../../components/DrawPacketModal';
import { MilestoneUpdateModal } from '../../../components/MilestoneUpdateModal';
import { ExtractionReviewModal } from '../../../components/ExtractionReviewModal';
import { useProjectDetailState } from '../use-project-detail-state';

interface ProjectDetailModalsProps {
  state: ReturnType<typeof useProjectDetailState>;
  onCloseChangeOrderModal?: () => void;
  onCloseDrawPacketModal?: () => void;
}

export const ProjectDetailModals: React.FC<ProjectDetailModalsProps> = ({
  state,
  onCloseChangeOrderModal,
  onCloseDrawPacketModal,
}) => {
  return (
    <>
      <ChangeOrderModal
        isOpen={state.showCOModal}
        onClose={() => {
          state.setIsChangeOrderModalOpenLocal(false);
          if (onCloseChangeOrderModal) onCloseChangeOrderModal();
        }}
        categories={state.budgetLines.map(b => b.category)}
        gcName={state.selectedProject?.gc_name || 'K&P Construction'}
        onSubmitChangeOrder={state.handleAddChangeOrder}
      />

      <ContingencyModal
        isOpen={state.isContingencyModalOpen}
        onClose={() => state.setIsContingencyModalOpen(false)}
        availableContingency={state.contingencyRemaining}
        categories={state.budgetLines.map(b => b.category)}
        initialCategory={state.contingencyTargetCat}
        onAbsorbContingency={state.handleAbsorbContingency}
      />

      <DrawPacketModal
        isOpen={state.showDrawModal}
        onClose={() => {
          state.setIsDrawPacketModalOpenLocal(false);
          if (onCloseDrawPacketModal) onCloseDrawPacketModal();
        }}
        nextDrawNumber={state.draws.length + 1}
        availableLines={state.budgetLines.map(b => ({
          category: b.category,
          budget: b.budget,
          spent: b.spent,
          available: Math.max(0, b.budget - b.spent),
        }))}
        onSubmitDraw={state.handleCreateDraw}
      />

      {state.selectedMilestoneForEdit && (
        <MilestoneUpdateModal
          isOpen={!!state.selectedMilestoneForEdit}
          onClose={() => state.setSelectedMilestoneForEdit(null)}
          milestone={state.selectedMilestoneForEdit}
          onUpdateMilestone={state.handleUpdateMilestone}
        />
      )}

      {state.selectedDocForReview && (
        <ExtractionReviewModal
          isOpen={!!state.selectedDocForReview}
          onClose={() => state.setSelectedDocForReview(null)}
          document={state.selectedDocForReview}
          categories={state.budgetLines.map(b => b.category)}
          onConfirmPost={state.handleConfirmDocPost}
        />
      )}
    </>
  );
};
