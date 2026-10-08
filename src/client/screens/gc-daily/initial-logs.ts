import { DailyLogEntry } from '../../../shared/types';
import { GCDailyChangeOrderItem } from './types';

export const getInitialDailyLogs = (selectedProjectId: string): DailyLogEntry[] => [
  {
    id: 'log-1',
    project_id: selectedProjectId,
    date: 'Oct 5, 2026 (Today)',
    gc_name: 'Sylvia Concrete & Framing',
    weather: 'Clear · 64°F',
    workers_on_site: 14,
    trades_active: ['Framing', 'Plumbing Rough', 'Electrical'],
    work_completed: 'Completed 3rd floor subfloor installation and plumbing vent stack penetrations through roof deck.',
    issues_or_delays: 'Lumber delivery delayed by 2 hours due to bridge traffic; made up time in afternoon.',
    photos_count: 6,
    sub_costs: 8450,
    gc_markup_pct: 0.12,
    total_billed: 9464,
  },
  {
    id: 'log-2',
    project_id: selectedProjectId,
    date: 'Oct 4, 2026',
    gc_name: 'Sylvia Concrete & Framing',
    weather: 'Partly Cloudy · 60°F',
    workers_on_site: 12,
    trades_active: ['Rough Plumbing', 'Framing'],
    work_completed: 'Set cast iron waste lines and rough-in brackets for master bathroom showers.',
    issues_or_delays: 'None',
    photos_count: 4,
    sub_costs: 6200,
    gc_markup_pct: 0.12,
    total_billed: 6944,
  },
];

export const getInitialGCDailyChangeOrders = (selectedProjectId: string): GCDailyChangeOrderItem[] => {
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
