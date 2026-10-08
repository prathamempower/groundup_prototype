import { AlertRisk, Project } from '../types';

export function generateReconciliationAlert(
  project: Project,
  cat: string,
  divergence: number,
  progressPct: number,
  spendPct: number,
  actualSpend: number,
  currentBudget: number,
  fundedAmount: number,
  budgetVariance: number
): AlertRisk {
  return {
    id: `alert-recon-${project.id}-${cat.toLowerCase().replace(/\s+/g, '-')}`,
    project_id: project.id,
    project_name: project.name,
    type: 'RECONCILIATION_EXCEPTION',
    severity: divergence >= 0.25 ? 'CRITICAL' : 'HIGH',
    title: `Reconciliation Discrepancy: ${cat}`,
    description: `${cat} is ${Math.round(progressPct * 100)}% verified on site but ${Math.round(
      spendPct * 100
    )}% spent ($${actualSpend.toLocaleString()} spent vs $${currentBudget.toLocaleString()} budget). Divergence: +${Math.round(
      divergence * 100
    )}%.`,
    category: cat,
    source_values: {
      budget: currentBudget,
      spend: actualSpend,
      funded: fundedAmount,
      progress_pct: Math.round(progressPct * 100),
      spend_pct: Math.round(spendPct * 100),
      variance_dollars: budgetVariance,
    },
    is_resolved: false,
    created_at: new Date().toISOString(),
  };
}

export function generateOverBudgetAlert(
  project: Project,
  cat: string,
  actualSpend: number,
  currentBudget: number,
  budgetVariance: number
): AlertRisk {
  return {
    id: `alert-overbudget-${project.id}-${cat.toLowerCase().replace(/\s+/g, '-')}`,
    project_id: project.id,
    project_name: project.name,
    type: 'OVER_BUDGET',
    severity: 'HIGH',
    title: `Over Budget Alert: ${cat}`,
    description: `Actual posted spend of $${actualSpend.toLocaleString()} exceeds approved budget of $${currentBudget.toLocaleString()} by $${budgetVariance.toLocaleString()}.`,
    category: cat,
    source_values: {
      budget: currentBudget,
      spend: actualSpend,
      variance_dollars: budgetVariance,
    },
    is_resolved: false,
    created_at: new Date().toISOString(),
  };
}

export function generateDrawAlerts(project: Project, draws: any[]): AlertRisk[] {
  const alerts: AlertRisk[] = [];
  for (const draw of draws || []) {
    if (draw.status === 'approved_partial' || draw.status === 'rejected') {
      alerts.push({
        id: `alert-draw-${draw.id}`,
        project_id: project.id,
        project_name: project.name,
        type: 'DRAW_REJECTED',
        severity: 'CRITICAL',
        title: `Lender Partial/Rejected Draw #${draw.draw_number} (Rev ${draw.revision_number})`,
        description: `Lender rejected $${(draw.requested_total - draw.approved_total).toLocaleString()} of Draw #${
          draw.draw_number
        }. Developer Cash Exposure increased. Corrective docs required.`,
        source_values: {
          funded: draw.disbursed_total,
          variance_dollars: draw.requested_total - draw.approved_total,
        },
        is_resolved: false,
        created_at: new Date().toISOString(),
      });
    }
  }
  return alerts;
}
