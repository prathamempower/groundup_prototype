import { useState, useEffect } from 'react';
import { Project, ContingencyMovement, UnitSale, AmexCardTransaction } from '../../../shared/types';
import { ProjectTab, BudgetLineItem, DrawItem, MilestoneItem, AlertItem, ChangeOrderItem } from './types';
import {
  getProjectBudgetLines,
  getProjectDraws,
  getProjectMilestones,
  getProjectAlerts,
  getInitialContingencyMovements,
  getInitialChangeOrders,
  getInitialUnitSales,
  getInitialAmexTransactions,
} from './initial-state';
import { createProjectDetailHandlers } from './use-project-detail-handlers';

export function useProjectDetailState(
  projectId: string,
  projects: Project[] = [],
  initialTab: ProjectTab = 'overview',
  isDrawPacketModalOpen = false,
  isChangeOrderModalOpen = false
) {
  const [activeTab, setActiveTab] = useState<ProjectTab>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const selectedProject = projects.find(p => p.id === projectId) || projects[0];

  const [budgetLines, setBudgetLines] = useState<BudgetLineItem[]>(() => getProjectBudgetLines(projectId));
  const [contingencyRemaining, setContingencyRemaining] = useState(selectedProject?.contingency_remaining ?? 42000);
  const [contingencyMovements, setContingencyMovements] = useState<ContingencyMovement[]>(() =>
    getInitialContingencyMovements(projectId)
  );
  const [changeOrders, setChangeOrders] = useState<ChangeOrderItem[]>(() => getInitialChangeOrders(projectId));
  const [draws, setDraws] = useState<DrawItem[]>(() => getProjectDraws(projectId));
  const [milestones, setMilestones] = useState<MilestoneItem[]>(() => getProjectMilestones(projectId));
  const [unitSales, setUnitSales] = useState<UnitSale[]>(() => getInitialUnitSales(projectId));
  const [amexTransactions, setAmexTransactions] = useState<AmexCardTransaction[]>(() =>
    getInitialAmexTransactions(projectId)
  );
  const [alerts, setAlerts] = useState<AlertItem[]>(() => getProjectAlerts(projectId));

  useEffect(() => {
    setBudgetLines(getProjectBudgetLines(projectId));
    setDraws(getProjectDraws(projectId));
    setMilestones(getProjectMilestones(projectId));
    setAlerts(getProjectAlerts(projectId));
    setUnitSales(getInitialUnitSales(projectId));
    setAmexTransactions(getInitialAmexTransactions(projectId));
    setChangeOrders(getInitialChangeOrders(projectId));
    setContingencyMovements(getInitialContingencyMovements(projectId));
    if (selectedProject) {
      setContingencyRemaining(selectedProject.contingency_remaining ?? 42000);
    }
  }, [projectId, selectedProject]);

  // Modal & Edit States
  const [isChangeOrderModalOpenLocal, setIsChangeOrderModalOpenLocal] = useState(false);
  const [isContingencyModalOpen, setIsContingencyModalOpen] = useState(false);
  const [isDrawPacketModalOpenLocal, setIsDrawPacketModalOpenLocal] = useState(false);
  const [selectedMilestoneForEdit, setSelectedMilestoneForEdit] = useState<any>(null);
  const [selectedDocForReview, setSelectedDocForReview] = useState<any>(null);
  const [contingencyTargetCat, setContingencyTargetCat] = useState<string>('Site Work');

  // Inline Change Order Form State
  const [showInlineAddOrder, setShowInlineAddOrder] = useState(false);
  const [inlineScopeType, setInlineScopeType] = useState<'standard' | 'other'>('other');
  const [inlineCategory, setInlineCategory] = useState('Framing');
  const [inlineCustomCategory, setInlineCustomCategory] = useState('');
  const [inlineSubSection, setInlineSubSection] = useState('');
  const [inlineCostCode, setInlineCostCode] = useState('');
  const [inlineAmount, setInlineAmount] = useState('18500');
  const [inlineReason, setInlineReason] = useState('UNFORESEEN_SITE_CONDITION');
  const [inlineCustomReason, setInlineCustomReason] = useState('');
  const [inlineDesc, setInlineDesc] = useState('');
  const [inlineVisibleToGC, setInlineVisibleToGC] = useState(true);
  const [inlineGcNotes, setInlineGcNotes] = useState('Approved by Owner. GC authorized to proceed with trade work.');
  const [coFeedbackToast, setCoFeedbackToast] = useState<string | null>(null);

  const showCOModal = isChangeOrderModalOpen || isChangeOrderModalOpenLocal;
  const showDrawModal = isDrawPacketModalOpen || isDrawPacketModalOpenLocal;

  const handlers = createProjectDetailHandlers({
    projectId,
    changeOrders,
    setChangeOrders,
    budgetLines,
    setBudgetLines,
    setContingencyRemaining,
    setContingencyMovements,
    setDraws,
    setMilestones,
    setAmexTransactions,
    setAlerts,
    selectedProjectName: selectedProject?.gc_name,
    setCoFeedbackToast,
  });

  // Economics
  const totalBudget = budgetLines.reduce((s, l) => s + l.budget, 0);
  const totalSpent = budgetLines.reduce((s, l) => s + l.spent, 0);
  const totalFunded = draws.filter(d => d.status === 'disbursed').reduce((s, d) => s + (d.disbursed || 0), 0);
  const cashExposure = totalSpent - totalFunded;

  return {
    activeTab, setActiveTab,
    selectedProject,
    budgetLines, setBudgetLines,
    contingencyRemaining,
    contingencyMovements,
    changeOrders,
    draws,
    milestones,
    unitSales,
    amexTransactions,
    alerts,
    isChangeOrderModalOpenLocal, setIsChangeOrderModalOpenLocal,
    isContingencyModalOpen, setIsContingencyModalOpen,
    isDrawPacketModalOpenLocal, setIsDrawPacketModalOpenLocal,
    selectedMilestoneForEdit, setSelectedMilestoneForEdit,
    selectedDocForReview, setSelectedDocForReview,
    contingencyTargetCat, setContingencyTargetCat,
    showCOModal, showDrawModal,
    showInlineAddOrder, setShowInlineAddOrder,
    inlineScopeType, setInlineScopeType,
    inlineCategory, setInlineCategory,
    inlineCustomCategory, setInlineCustomCategory,
    inlineSubSection, setInlineSubSection,
    inlineCostCode, setInlineCostCode,
    inlineAmount, setInlineAmount,
    inlineReason, setInlineReason,
    inlineCustomReason, setInlineCustomReason,
    inlineDesc, setInlineDesc,
    inlineVisibleToGC, setInlineVisibleToGC,
    inlineGcNotes, setInlineGcNotes,
    coFeedbackToast,
    ...handlers,
    totalBudget,
    totalSpent,
    totalFunded,
    cashExposure,
    originalProfit: 650000,
    currentProfit: 455000,
    profitDrift: -195000,
    originalRoi: 27.7,
    currentRoi: 17.9,
  };
}
