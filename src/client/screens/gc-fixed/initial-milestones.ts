import { GCMilestoneItem, GCChangeOrderItem } from './types';

export const INITIAL_GC_MILESTONES: GCMilestoneItem[] = [
  {
    id: 'm-1',
    name: 'Site Clearance & Excavation',
    contractAmount: 300000,
    claimedAmount: 300000,
    status: 'DISBURSED',
    completionProofCount: 8,
    inspectionPassed: true,
    paidDate: 'May 3, 2026',
  },
  {
    id: 'm-2',
    name: 'Concrete Foundation & Slab',
    contractAmount: 400000,
    claimedAmount: 400000,
    status: 'DISBURSED',
    completionProofCount: 12,
    inspectionPassed: true,
    paidDate: 'Jul 15, 2026',
  },
  {
    id: 'm-3',
    name: 'Structural Framing & Sheathing',
    contractAmount: 400000,
    claimedAmount: 400000,
    status: 'OWNER_APPROVED',
    completionProofCount: 18,
    inspectionPassed: true,
    paidDate: 'Included in Bank Draw #3',
  },
  {
    id: 'm-4',
    name: 'Rough Mechanical, Electrical & Plumbing (MEP)',
    contractAmount: 350000,
    claimedAmount: 0,
    status: 'READY_TO_CLAIM',
    completionProofCount: 4,
    inspectionPassed: true,
    paidDate: 'Pending Claim',
  },
  {
    id: 'm-5',
    name: 'Insulation, Drywall & Finishes',
    contractAmount: 550000,
    claimedAmount: 0,
    status: 'UPCOMING',
    completionProofCount: 0,
    inspectionPassed: false,
    paidDate: 'Upcoming',
  },
];

export const getInitialGCChangeOrders = (selectedProjectId: string): GCChangeOrderItem[] => {
  try {
    const stored = localStorage.getItem(`groundup_change_orders_${selectedProjectId}`);
    if (stored) return JSON.parse(stored);
    const all = localStorage.getItem('groundup_all_change_orders');
    if (all) {
      const parsed = JSON.parse(all);
      const filtered = parsed.filter((c: any) => c.projectId === selectedProjectId || !c.projectId);
      if (filtered.length > 0) return filtered;
    }
  } catch {}
  return [
    {
      id: 'co-1',
      number: 'CO-001',
      category: 'Foundation',
      sub_section: 'Substructure & Pile Reinforcement',
      cost_code: '03-100',
      amount: 40000,
      reason: 'Unforeseen soft soil condition',
      description: 'Engineered grade beams and extra helical piles required by structural engineer.',
      status: 'APPROVED',
      visible_to_gc: true,
      gc_notes: 'Owner approved. GC authorized to proceed with foundation underpinning.',
      date: 'Mar 18, 2026',
      is_other: false,
    },
    {
      id: 'co-other-1',
      number: 'CO-002',
      category: 'Municipal Utility Easement Relocation',
      sub_section: 'Off-Site Civil & Utility Trenching',
      cost_code: '02-310',
      amount: 18500,
      reason: 'Township Utility Conflict',
      description: 'PSE&G mandated emergency lateral line relocation across west boundary easement.',
      status: 'APPROVED',
      visible_to_gc: true,
      gc_notes: 'Approved lateral rework. GC coordinated with municipal inspectors.',
      date: 'Apr 02, 2026',
      is_other: true,
    },
  ];
};
