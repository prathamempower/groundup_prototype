export type IntakeTab = 'budget' | 'invoice' | 'schedule' | 'ai_parse';

export interface SovLineInput {
  category: string;
  sub_category?: string;
  cost_code?: string;
  amount: number;
}

export interface MilestoneInput {
  milestone: string;
  trade: string;
  planned_start?: string;
  planned_end: string;
  verified_progress_pct: number;
}
