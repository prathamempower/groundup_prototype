export interface GCMilestoneItem {
  id: string;
  name: string;
  contractAmount: number;
  claimedAmount: number;
  status: 'DISBURSED' | 'OWNER_APPROVED' | 'CLAIM_SUBMITTED' | 'READY_TO_CLAIM' | 'UPCOMING';
  completionProofCount: number;
  inspectionPassed: boolean;
  paidDate: string;
}

export interface GCChangeOrderItem {
  id: string;
  number: string;
  category: string;
  sub_section?: string;
  cost_code?: string;
  amount: number;
  reason: string;
  description: string;
  status: string;
  visible_to_gc?: boolean;
  gc_notes?: string;
  date: string;
  is_other?: boolean;
  projectId?: string;
}
