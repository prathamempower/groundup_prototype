import React from 'react';
import { BudgetLineItem, ChangeOrderItem, DrawItem, MilestoneItem, AlertItem } from './types';
import { ContingencyMovement } from '../../../shared/types';

interface HandlerDeps {
  projectId: string;
  changeOrders: ChangeOrderItem[];
  setChangeOrders: React.Dispatch<React.SetStateAction<ChangeOrderItem[]>>;
  budgetLines: BudgetLineItem[];
  setBudgetLines: React.Dispatch<React.SetStateAction<BudgetLineItem[]>>;
  setContingencyRemaining: React.Dispatch<React.SetStateAction<number>>;
  setContingencyMovements: React.Dispatch<React.SetStateAction<ContingencyMovement[]>>;
  setDraws: React.Dispatch<React.SetStateAction<DrawItem[]>>;
  setMilestones: React.Dispatch<React.SetStateAction<MilestoneItem[]>>;
  setAmexTransactions: React.Dispatch<React.SetStateAction<any[]>>;
  setAlerts: React.Dispatch<React.SetStateAction<AlertItem[]>>;
  selectedProjectName?: string;
  setCoFeedbackToast: (toast: string | null) => void;
}

export function createProjectDetailHandlers(deps: HandlerDeps) {
  const {
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
    selectedProjectName,
    setCoFeedbackToast,
  } = deps;

  const handleAddChangeOrder = (co: any) => {
    const isOther = co.category === '__OTHER__' || !budgetLines.some(b => b.category === co.category) || !!co.is_other;
    const finalCategory = (co.category === '__OTHER__' ? (co.customCategory || 'Other Scope / Custom Order') : co.category) || 'General Scope';
    const amountVal = Number(co.amount) || 0;

    const newOrder: ChangeOrderItem = {
      id: `co-${Date.now()}`,
      number: co.change_order_number || `CO-00${changeOrders.length + 1}`,
      category: finalCategory,
      sub_section: co.sub_section || '',
      cost_code: co.cost_code || '',
      amount: amountVal,
      reason: co.reason || 'Contract Scope Adjustment',
      custom_reason: co.custom_reason || '',
      description: co.description || '',
      status: 'APPROVED',
      visible_to_gc: co.visible_to_gc !== false,
      gc_notes: co.gc_notes || 'Approved by Owner. GC authorized to proceed.',
      date: 'Today',
      is_other: isOther,
      projectId: projectId,
    };

    setChangeOrders(prev => {
      const next = [newOrder, ...prev];
      try {
        localStorage.setItem(`groundup_change_orders_${projectId}`, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setBudgetLines(prev => {
      const exists = prev.some(line => line.category === finalCategory);
      if (exists) {
        return prev.map(line => line.category === finalCategory ? { ...line, budget: line.budget + amountVal } : line);
      }
      return [...prev, { category: finalCategory, budget: amountVal, spent: 0, progress: 0, status: 'upcoming' }];
    });

    setCoFeedbackToast(
      newOrder.visible_to_gc
        ? `Order #${newOrder.number} submitted! Budget updated & showed to ${selectedProjectName || 'General Contractor'}.`
        : `Order #${newOrder.number} submitted & budget updated.`
    );
    setTimeout(() => setCoFeedbackToast(null), 5000);
  };

  const handleAbsorbContingency = (movement: any) => {
    setContingencyRemaining(prev => Math.max(0, prev - movement.amount));
    setContingencyMovements(prev => [
      {
        id: `cm-${Date.now()}`,
        project_id: projectId,
        source_category: 'Contingency Reserve',
        destination_category: movement.destination_category,
        amount: movement.amount,
        reason: movement.reason,
        status: 'APPROVED',
        approved_by: 'Hardik Parikh (Owner)',
        approved_at: 'Today',
      },
      ...prev,
    ]);

    setBudgetLines(prev =>
      prev.map(line =>
        line.category === movement.destination_category
          ? { ...line, budget: line.budget + movement.amount, status: 'ok' }
          : line
      )
    );
  };

  const handleCreateDraw = (drawData: any) => {
    setDraws(prev => [
      {
        id: `draw-${drawData.draw_number}`,
        number: drawData.draw_number,
        revision: 0,
        submitted: 'Today',
        status: 'pending',
        requested: drawData.requested_total,
        approved: null,
        disbursed: null,
        notes: drawData.notes,
        lines: drawData.lines.map((l: any) => ({
          category: l.category,
          requested: l.requested_amount,
          approved: null,
          status: 'pending',
        })),
      },
      ...prev,
    ]);
  };

  const handleUpdateMilestone = (data: any) => {
    setMilestones(prev =>
      prev.map(m =>
        m.name === data.name
          ? {
              ...m,
              progress: data.progress,
              delayDays: data.delayDays,
              status: data.progress === 100 ? 'done' : 'in-progress',
              source: `${data.inspectorName} (${data.inspectionResult})`,
            }
          : m
      )
    );
  };

  const handleConfirmDocPost = (postData: any) => {
    setBudgetLines(prev =>
      prev.map(line =>
        line.category === postData.category ? { ...line, spent: line.spent + postData.amount } : line
      )
    );
  };

  const handleConfirmAmexMatch = (txId: string) => {
    setAmexTransactions(prev => prev.map(tx => (tx.id === txId ? { ...tx, status: 'MATCHED' } : tx)));
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, resolved: true } : a)));
  };

  return {
    handleAddChangeOrder,
    handleAbsorbContingency,
    handleCreateDraw,
    handleUpdateMilestone,
    handleConfirmDocPost,
    handleConfirmAmexMatch,
    handleResolveAlert,
  };
}
