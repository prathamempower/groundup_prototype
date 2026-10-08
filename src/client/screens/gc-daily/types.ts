export interface GCDailyChangeOrderItem {
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
