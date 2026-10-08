import React from 'react';
import { UserRole } from '../../../../shared/types';
import { useProjectDetailState } from '../use-project-detail-state';
import { OverviewTab } from '../tabs/OverviewTab';
import { BudgetTab } from '../tabs/BudgetTab';
import { DrawsTab } from '../tabs/DrawsTab';
import { TimelineTab } from '../tabs/TimelineTab';
import { DocumentsTab } from '../tabs/DocumentsTab';
import { DispositionTab } from '../tabs/DispositionTab';
import { AlertsTab } from '../tabs/AlertsTab';

interface ProjectDetailTabContentProps {
  state: ReturnType<typeof useProjectDetailState>;
  currentRole: UserRole;
  onInspectProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', category?: string) => void;
  onOpenLenderPackage: () => void;
  onOpenInvoices: () => void;
}

export const ProjectDetailTabContent: React.FC<ProjectDetailTabContentProps> = ({
  state,
  currentRole,
  onInspectProvenance,
  onOpenLenderPackage,
  onOpenInvoices,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {state.activeTab === 'overview' && (
        <OverviewTab
          totalBudget={state.totalBudget}
          totalSpent={state.totalSpent}
          totalFunded={state.totalFunded}
          cashExposure={state.cashExposure}
          currentRole={currentRole}
          onInspectProvenance={onInspectProvenance}
        />
      )}

      {state.activeTab === 'budget' && (
        <BudgetTab
          budgetLines={state.budgetLines}
          contingencyRemaining={state.contingencyRemaining}
          changeOrders={state.changeOrders}
          selectedProjectName={state.selectedProject?.gc_name}
          currentRole={currentRole}
          coFeedbackToast={state.coFeedbackToast}
          setCoFeedbackToast={() => {}}
          showInlineAddOrder={state.showInlineAddOrder}
          setShowInlineAddOrder={state.setShowInlineAddOrder}
          inlineScopeType={state.inlineScopeType}
          setInlineScopeType={state.setInlineScopeType}
          inlineCategory={state.inlineCategory}
          setInlineCategory={state.setInlineCategory}
          inlineCustomCategory={state.inlineCustomCategory}
          setInlineCustomCategory={state.setInlineCustomCategory}
          inlineSubSection={state.inlineSubSection}
          setInlineSubSection={state.setInlineSubSection}
          inlineCostCode={state.inlineCostCode}
          setInlineCostCode={state.setInlineCostCode}
          inlineAmount={state.inlineAmount}
          setInlineAmount={state.setInlineAmount}
          inlineReason={state.inlineReason}
          setInlineReason={state.setInlineReason}
          inlineCustomReason={state.inlineCustomReason}
          setInlineCustomReason={state.setInlineCustomReason}
          inlineDesc={state.inlineDesc}
          setInlineDesc={state.setInlineDesc}
          inlineVisibleToGC={state.inlineVisibleToGC}
          setInlineVisibleToGC={state.setInlineVisibleToGC}
          inlineGcNotes={state.inlineGcNotes}
          setInlineGcNotes={state.setInlineGcNotes}
          onOpenContingencyModal={(cat) => {
            if (cat) state.setContingencyTargetCat(cat);
            state.setIsContingencyModalOpen(true);
          }}
          onOpenChangeOrderModal={() => state.setIsChangeOrderModalOpenLocal(true)}
          onAddChangeOrder={state.handleAddChangeOrder}
          onInspectProvenance={onInspectProvenance}
        />
      )}

      {state.activeTab === 'draws' && (
        <DrawsTab
          draws={state.draws}
          onOpenDrawPacketModal={() => state.setIsDrawPacketModalOpenLocal(true)}
          onOpenLenderPackage={onOpenLenderPackage}
        />
      )}

      {state.activeTab === 'timeline' && (
        <TimelineTab
          milestones={state.milestones}
          onEditMilestone={(m) => state.setSelectedMilestoneForEdit(m)}
        />
      )}

      {state.activeTab === 'documents' && (
        <DocumentsTab
          amexTransactions={state.amexTransactions}
          onConfirmAmexMatch={state.handleConfirmAmexMatch}
          onReviewDoc={(doc) => state.setSelectedDocForReview(doc)}
          onOpenInvoices={onOpenInvoices}
        />
      )}

      {state.activeTab === 'disposition' && (
        <DispositionTab unitSales={state.unitSales} />
      )}

      {state.activeTab === 'alerts' && (
        <AlertsTab
          alerts={state.alerts}
          onResolveAlert={state.handleResolveAlert}
        />
      )}
    </div>
  );
};
