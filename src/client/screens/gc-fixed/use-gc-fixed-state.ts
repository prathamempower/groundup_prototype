import React, { useState, useEffect } from 'react';
import { Project } from '../../../shared/types';
import { GCMilestoneItem, GCChangeOrderItem } from './types';
import { INITIAL_GC_MILESTONES, getInitialGCChangeOrders } from './initial-milestones';

export function useGCFixedState(projects: Project[], selectedProjectId: string) {
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [milestones, setMilestones] = useState<GCMilestoneItem[]>(INITIAL_GC_MILESTONES);
  const [changeOrders, setChangeOrders] = useState<GCChangeOrderItem[]>(() =>
    getInitialGCChangeOrders(selectedProjectId)
  );

  const [isGCCOModalOpen, setIsGCCOModalOpen] = useState(false);
  const [newGCCOCategory, setNewGCCOCategory] = useState('Other / Supplemental Trade Scope');
  const [newGCCOSubSection, setNewGCCOSubSection] = useState('');
  const [newGCCOAmount, setNewGCCOAmount] = useState('15000');
  const [newGCCOReason, setNewGCCOReason] = useState('Field Condition Revision');
  const [newGCCODesc, setNewGCCODesc] = useState('');
  const [gcCOSuccess, setGcCOSuccess] = useState(false);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimMilestoneId, setClaimMilestoneId] = useState('m-4');
  const [claimAmount, setClaimAmount] = useState('350000');
  const [notes, setNotes] = useState('Rough MEP passed township inspection test. Green stickers posted.');
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(`groundup_change_orders_${selectedProjectId}`);
        if (stored) {
          setChangeOrders(JSON.parse(stored));
        } else {
          const all = localStorage.getItem('groundup_all_change_orders');
          if (all) {
            const parsed = JSON.parse(all);
            const filtered = parsed.filter((c: any) => c.projectId === selectedProjectId || !c.projectId);
            if (filtered.length > 0) setChangeOrders(filtered);
          }
        }
      } catch {}
    };

    window.addEventListener('groundup_co_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('groundup_co_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [selectedProjectId]);

  const visibleCOs = changeOrders.filter(co => co.visible_to_gc !== false);
  const totalApprovedCOAmount = visibleCOs.reduce((sum, co) => sum + (Number(co.amount) || 0), 0);

  const totalContract = milestones.reduce((s, m) => s + m.contractAmount, 0);
  const adjustedContract = totalContract + totalApprovedCOAmount;
  const totalPaid = milestones
    .filter(m => m.status === 'DISBURSED')
    .reduce((s, m) => s + m.contractAmount, 0);
  const remainingContract = adjustedContract - totalPaid;

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setMilestones(prev =>
      prev.map(m =>
        m.id === claimMilestoneId
          ? { ...m, status: 'CLAIM_SUBMITTED', claimedAmount: parseFloat(claimAmount) || m.contractAmount }
          : m
      )
    );
    setClaimSuccess(true);
    setTimeout(() => {
      setIsClaimModalOpen(false);
      setClaimSuccess(false);
    }, 900);
  };

  const handleGCSubmitCO = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newGCCOAmount) || 0;
    if (amountVal <= 0) return;

    const newOrder: GCChangeOrderItem = {
      id: `co-gc-${Date.now()}`,
      number: `CO-00${changeOrders.length + 1}`,
      category: newGCCOCategory.trim() || 'Supplemental Trade Scope',
      sub_section: newGCCOSubSection.trim() || 'Field Execution Phase',
      cost_code: '01-900',
      amount: amountVal,
      reason: newGCCOReason,
      description: newGCCODesc.trim() || 'Submitted by GC for owner approval.',
      status: 'APPROVED',
      visible_to_gc: true,
      gc_notes: 'Submitted directly by General Contractor. Authorized for work.',
      date: 'Today',
      is_other: true,
      projectId: selectedProjectId,
    };

    const next = [newOrder, ...changeOrders];
    setChangeOrders(next);
    try {
      localStorage.setItem(`groundup_change_orders_${selectedProjectId}`, JSON.stringify(next));
      const allCOs = JSON.parse(localStorage.getItem('groundup_all_change_orders') || '[]');
      localStorage.setItem('groundup_all_change_orders', JSON.stringify([newOrder, ...allCOs.filter((x: any) => x.id !== newOrder.id)]));
      window.dispatchEvent(new Event('groundup_co_updated'));
    } catch {}

    setGcCOSuccess(true);
    setTimeout(() => {
      setIsGCCOModalOpen(false);
      setGcCOSuccess(false);
      setNewGCCOSubSection('');
      setNewGCCODesc('');
    }, 900);
  };

  return {
    activeProject,
    milestones,
    visibleCOs,
    totalApprovedCOAmount,
    totalContract,
    adjustedContract,
    totalPaid,
    remainingContract,
    isClaimModalOpen, setIsClaimModalOpen,
    claimMilestoneId, setClaimMilestoneId,
    claimAmount, setClaimAmount,
    notes, setNotes,
    claimSuccess,
    handleSubmitClaim,
    isGCCOModalOpen, setIsGCCOModalOpen,
    newGCCOCategory, setNewGCCOCategory,
    newGCCOSubSection, setNewGCCOSubSection,
    newGCCOAmount, setNewGCCOAmount,
    newGCCOReason, setNewGCCOReason,
    newGCCODesc, setNewGCCODesc,
    gcCOSuccess,
    handleGCSubmitCO,
  };
}
