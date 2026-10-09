import { AlertItem, ChangeOrderItem, BudgetLineItem, DrawItem, MilestoneItem } from './types';
import { ContingencyMovement, UnitSale, AmexCardTransaction } from '../../../shared/types';
import { mockStore } from '../../../services/mock/MockDataStore';

export * from './initial-budget-data';

export const getProjectBudgetLines = (projectId: string): BudgetLineItem[] => {
  mockStore.ensureProjectDataset(projectId);
  const bls = mockStore.budgetLines.filter((bl) => bl.project_id === projectId);
  const exps = mockStore.expenses.filter((e) => e.project_id === projectId);
  const acts = mockStore.activities.filter((a) => a.project_id === projectId);

  return bls.map((bl) => {
    const categoryExpenses = exps.filter(
      (e) => e.category === bl.category || e.cost_scope === bl.category
    );
    const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const matchingActivity = acts.find(
      (a) =>
        a.milestone.toLowerCase().includes(bl.category.toLowerCase().split(' ')[0]) ||
        bl.category.toLowerCase().includes(a.trade.toLowerCase().split(' ')[0])
    );
    let progress = matchingActivity
      ? Math.round(matchingActivity.verified_progress_pct * 100)
      : spent > 0
      ? Math.min(100, Math.round((spent / (bl.original_amount || 1)) * 100))
      : 0;

    if (spent >= bl.original_amount && bl.original_amount > 0) {
      progress = 100;
    }

    let status = 'upcoming';
    if (spent > bl.original_amount && bl.original_amount > 0) {
      status = 'over';
    } else if (progress === 100) {
      status = 'done';
    } else if (spent > 0) {
      status = spent / bl.original_amount > progress / 100 + 0.15 ? 'flag' : 'ok';
    }

    return {
      category: bl.category,
      budget: bl.original_amount,
      spent: spent,
      progress: progress,
      status: status,
    };
  });
};

export const getProjectDraws = (projectId: string): DrawItem[] => {
  mockStore.ensureProjectDataset(projectId);
  const drs = mockStore.draws.filter((d) => d.project_id === projectId);
  const dls = mockStore.drawLines.filter((dl) => dl.project_id === projectId);

  return drs.map((d) => {
    const lines = dls
      .filter((dl) => dl.draw_id === d.id)
      .map((dl) => ({
        category: dl.category,
        requested: dl.requested_amount,
        approved: dl.approved_amount,
        status: dl.status,
      }));

    let status = d.status;
    if (status === 'approved_full') status = 'disbursed';
    if (status === 'submitted') status = 'pending';

    return {
      id: d.id,
      number: d.draw_number,
      revision: d.revision_number,
      submitted: d.submitted_date,
      status: status,
      requested: d.requested_total,
      approved: d.approved_total,
      disbursed: d.disbursed_total,
      notes: d.lender_notes || '',
      lines:
        lines.length > 0
          ? lines
          : [{ category: 'General Draw', requested: d.requested_total, approved: d.approved_total, status }],
    };
  });
};

export const getProjectMilestones = (projectId: string): MilestoneItem[] => {
  mockStore.ensureProjectDataset(projectId);
  const acts = mockStore.activities.filter((a) => a.project_id === projectId);

  return acts.map((a) => {
    const isDone = a.verified_progress_pct === 1.0;
    const isProgress = a.verified_progress_pct > 0 && !isDone;
    return {
      name: a.milestone,
      planned: a.planned_start,
      actual: isDone ? a.last_verified_date : null,
      delayDays: isDone ? 0 : isProgress ? 7 : null,
      status: isDone ? 'done' : isProgress ? 'in-progress' : 'upcoming',
      progress: Math.round(a.verified_progress_pct * 100),
      source: a.last_verified_source || 'GC confirmation',
    };
  });
};

export const getProjectAlerts = (projectId: string): AlertItem[] => {
  mockStore.ensureProjectDataset(projectId);
  const summary = mockStore.getProjectFourTruths(projectId);
  if (!summary || !summary.active_alerts) return [];

  return summary.active_alerts.map((al, idx) => ({
    id: al.id || `a-${idx}`,
    severity: al.severity.toLowerCase(),
    type: al.type,
    title: al.title,
    description: al.description,
    details: Object.fromEntries(Object.entries(al.source_values || {}).map(([k, v]) => [k, String(v)])),
    action: 'Inspect Line Item',
    createdAt: 'Recent',
    resolved: al.is_resolved || false,
  }));
};

export const getInitialContingencyMovements = (projectId: string): ContingencyMovement[] => [
  {
    id: `cm-${projectId}-1`,
    project_id: projectId,
    source_category: 'Contingency Reserve',
    destination_category: 'Foundation',
    amount: 35000,
    reason: 'Engineering adjustments for local soil conditions.',
    status: 'APPROVED',
    approved_by: 'Developer Owner',
    approved_at: 'Mar 18, 2026',
  },
];

export const getInitialChangeOrders = (projectId: string): ChangeOrderItem[] => {
  try {
    const stored = localStorage.getItem(`groundup_change_orders_${projectId}`);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    {
      id: `co-${projectId}-1`,
      number: 'CO-001',
      category: 'Foundation',
      sub_section: 'Substructure & Reinforcement',
      cost_code: '03-100',
      amount: 28500,
      reason: 'Unforeseen site conditions',
      description: 'Engineered grade beams and extra reinforcement specified by structural engineer.',
      status: 'APPROVED',
      visible_to_gc: true,
      gc_notes: 'Approved by Owner. GC authorized to proceed.',
      date: 'Mar 18, 2026',
      is_other: false,
    },
  ];
};

export const getInitialUnitSales = (projectId: string): UnitSale[] => {
  const proj = mockStore.projects.find((p) => p.id === projectId);
  const unitsCount = proj?.units || 1;
  const isCompleted = proj?.status === 'COMPLETED';

  if (projectId === 'proj-73-broadway') {
    return [
      {
        id: 'u-73-1',
        project_id: projectId,
        unit_name: 'Unit 1 — Penthouse Duplex (4th Fl)',
        sq_ft: 1800,
        beds_baths: '3 Bed / 2.5 Bath · Private Roof Deck',
        asking_price: 1250000,
        contract_price: 1225000,
        deposit_amount: 122500,
        status: 'UNDER_CONTRACT',
        buyer_name: 'Dr. Robert Chen',
        contract_date: 'Aug 14, 2026',
        closing_date: 'Nov 30, 2026',
        broker_commission_pct: 0.03,
        closing_costs_est: 18000,
        net_proceeds: 1170250,
        loan_payoff_allocation: 650000,
        investor_distribution: 520250,
      },
      {
        id: 'u-73-2',
        project_id: projectId,
        unit_name: 'Unit 2 — Mid-Floor Residence (3rd Fl)',
        sq_ft: 1600,
        beds_baths: '2 Bed / 2 Bath · Balcony',
        asking_price: 1050000,
        status: 'AVAILABLE',
        broker_commission_pct: 0.03,
        closing_costs_est: 15000,
        net_proceeds: 1003500,
        loan_payoff_allocation: 444000,
        investor_distribution: 559500,
      },
      {
        id: 'u-73-3',
        project_id: projectId,
        unit_name: 'Unit 3 — Garden Duplex (1st & 2nd Fl)',
        sq_ft: 1400,
        beds_baths: '2 Bed / 2 Bath · Private Yard',
        asking_price: 980000,
        contract_price: 980000,
        deposit_amount: 98000,
        status: 'UNDER_CONTRACT',
        buyer_name: 'Amanda & Liam Vance',
        contract_date: 'Sep 2, 2026',
        closing_date: 'Dec 15, 2026',
        broker_commission_pct: 0.03,
        closing_costs_est: 14000,
        net_proceeds: 936600,
        loan_payoff_allocation: 0,
        investor_distribution: 936600,
      },
    ];
  }

  if (isCompleted || projectId === 'proj-392-1st') {
    return Array.from({ length: unitsCount }).map((_, i) => ({
      id: `u-${projectId}-${i + 1}`,
      project_id: projectId,
      unit_name: `Unit ${i + 1} — Condominium Residence`,
      sq_ft: Math.round((proj?.square_feet || 4200) / unitsCount),
      beds_baths: '2 Bed / 2 Bath',
      asking_price: Math.round((proj?.expected_sale_price || 2940000) / unitsCount),
      contract_price: Math.round((proj?.expected_sale_price || 2940000) / unitsCount),
      deposit_amount: Math.round((proj?.expected_sale_price || 2940000) / (unitsCount * 10)),
      status: 'CLOSED',
      buyer_name: `Buyer ${i + 1}`,
      contract_date: 'Jan 2026',
      closing_date: 'Mar 2026',
      broker_commission_pct: 0.03,
      closing_costs_est: 15000,
      net_proceeds: Math.round(((proj?.expected_sale_price || 2940000) / unitsCount) * 0.95),
      loan_payoff_allocation: 350000,
      investor_distribution: 550000,
    }));
  }

  return Array.from({ length: unitsCount }).map((_, i) => ({
    id: `u-${projectId}-${i + 1}`,
    project_id: projectId,
    unit_name: `Unit ${i + 1} — ${proj?.name || 'Residence'}`,
    sq_ft: Math.round((proj?.square_feet || 3200) / unitsCount),
    beds_baths: '3 Bed / 2.5 Bath',
    asking_price: Math.round((proj?.expected_sale_price || 1200000) / unitsCount),
    status: i === 0 ? 'UNDER_CONTRACT' : 'AVAILABLE',
    buyer_name: i === 0 ? 'Sample Buyer' : undefined,
    contract_price: i === 0 ? Math.round((proj?.expected_sale_price || 1200000) / unitsCount) : undefined,
    broker_commission_pct: 0.03,
    closing_costs_est: 12000,
    net_proceeds: Math.round(((proj?.expected_sale_price || 1200000) / unitsCount) * 0.95),
    loan_payoff_allocation: 300000,
    investor_distribution: 400000,
  }));
};

export const getInitialAmexTransactions = (projectId: string): AmexCardTransaction[] => {
  const proj = mockStore.projects.find((p) => p.id === projectId);
  const name = proj?.name || 'Project';

  return [
    {
      id: `tx-${projectId}-1`,
      project_id: projectId,
      card_last4: '8421',
      card_label: `Amex Project Card · ${name}`,
      date: 'Oct 3, 2026',
      vendor: 'Home Depot Supply',
      amount: 3482,
      ai_suggested_category: 'Flooring & Finishes',
      ai_confidence: 82,
      status: 'NEEDS_REVIEW',
      memo: 'Material supplies & trim hardware',
      evidence_strength: 'CARD_TRANSACTION',
    },
    {
      id: `tx-${projectId}-2`,
      project_id: projectId,
      card_last4: '8421',
      card_label: `Amex Project Card · ${name}`,
      date: 'Sep 29, 2026',
      vendor: `${proj?.gc_name || 'General Contractor'} Concrete Services`,
      amount: 14200,
      ai_suggested_category: 'Foundation',
      ai_confidence: 98,
      status: 'MATCHED',
      memo: 'Concrete pour batch delivery',
      evidence_strength: 'BANK_TRANSACTION',
    },
    {
      id: `tx-${projectId}-3`,
      project_id: projectId,
      card_last4: '8421',
      card_label: `Amex Project Card · ${name}`,
      date: 'Sep 24, 2026',
      vendor: 'Commercial Building Supply',
      amount: 8750,
      ai_suggested_category: 'Framing',
      ai_confidence: 96,
      status: 'MATCHED',
      memo: 'Framing lumber package',
      evidence_strength: 'VERIFIED_INVOICE',
    },
  ];
};
