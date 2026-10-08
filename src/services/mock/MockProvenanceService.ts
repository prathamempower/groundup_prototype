// GroundUp AI — MockProvenanceService Implementation

import { IProvenanceService } from '../interfaces/IProvenanceService';
import {
  ProvenanceDrillDown,
  FigureProvenanceRequestDTO,
  ProvenanceNode,
} from '../../types';
import { mockStore } from './MockDataStore';
import { delay } from './delay';

export class MockProvenanceService implements IProvenanceService {
  async getFigureProvenance(payload: FigureProvenanceRequestDTO): Promise<ProvenanceDrillDown> {
    await delay();

    const summary = mockStore.getProjectFourTruths(payload.projectId);
    const project = mockStore.projects.find((p) => p.id === payload.projectId) || mockStore.projects[0];
    const category = payload.category;

    if (category) {
      const expenses = mockStore.expenses.filter(
        (e) => e.project_id === payload.projectId && e.category.toLowerCase() === category.toLowerCase() && e.status === 'posted'
      );
      const catSummary = summary.categories.find((c) => c.category.toLowerCase() === category.toLowerCase());

      const nodes: ProvenanceNode[] = expenses.map((e) => ({
        id: e.id,
        title: `${e.vendor_name} — ${e.description || 'Posted Invoice'}`,
        amount: e.amount,
        date: e.expense_date,
        vendor: e.vendor_name,
        actor_role: e.entered_by_role,
        status: e.status,
        source_document_name: 'Vendor_Invoice.pdf',
        source_document_id: e.source_document_id,
        source_ref: e.source_ref,
        extraction_confidence: 0.99,
      }));

      return {
        figure_name: `Spend Truth — ${category}`,
        amount: catSummary?.actual_spend || 0,
        category,
        project_name: project.name,
        truth_domain: 'Spend',
        formula_applied: `ActualSpend(${category}) = Σ PostedExpenses in "${category}"`,
        provenance_nodes: nodes,
      };
    }

    switch (payload.figureType) {
      case 'spend': {
        const postedExpenses = mockStore.expenses.filter(
          (e) => e.project_id === payload.projectId && e.status === 'posted'
        );
        return {
          figure_name: 'Spend Truth — All Categories',
          amount: summary.total_actual_spend,
          project_name: project.name,
          truth_domain: 'Spend',
          formula_applied: 'ActualSpend = Σ PostedExpenses where expense.status = "posted"',
          provenance_nodes: postedExpenses.map((e) => ({
            id: e.id,
            title: `${e.vendor_name} (${e.category})`,
            amount: e.amount,
            date: e.expense_date,
            vendor: e.vendor_name,
            actor_role: e.entered_by_role,
            status: e.status,
            source_document_name: 'Invoice_Attachment.pdf',
            source_document_id: e.source_document_id,
            source_ref: e.source_ref,
            extraction_confidence: 0.98,
          })),
        };
      }

      case 'budget': {
        const lines = mockStore.budgetLines.filter((bl) => bl.project_id === payload.projectId);
        return {
          figure_name: 'Budget Truth — Current Approved Budget',
          amount: summary.total_current_budget,
          project_name: project.name,
          truth_domain: 'Budget',
          formula_applied: 'CurrentBudget = MasterBudgetSOV + Σ ApprovedChangeOrders',
          provenance_nodes: lines.map((l) => ({
            id: l.id,
            title: `${l.category} (${l.cost_code || 'General'})`,
            amount: l.original_amount,
            status: 'APPROVED',
            source_document_name: 'Master_Budget_SOV.xlsx',
            source_document_id: 'doc-sov',
            source_ref: l.source_ref || 'SOV Approved Schedule',
            extraction_confidence: 1.0,
          })),
        };
      }

      case 'funded': {
        const draws = mockStore.draws.filter(
          (d) => d.project_id === payload.projectId && d.disbursed_total > 0
        );
        return {
          figure_name: 'Funding Truth — Total Disbursed',
          amount: summary.total_amount_funded,
          project_name: project.name,
          truth_domain: 'Funding',
          formula_applied: 'AmountFunded = Σ DrawLine.funded_amount where status = "disbursed"',
          provenance_nodes: draws.map((d) => ({
            id: d.id,
            title: `Draw #${d.draw_number} Wire Disbursement`,
            amount: d.disbursed_total,
            date: d.disbursed_date || d.submitted_date,
            actor_role: 'LENDER',
            status: 'disbursed',
            source_document_name: 'Bank_Wire_Confirmation.pdf',
            source_document_id: 'doc-wire',
            source_ref: `Disbursement Ref: ${d.lender_notes || 'Wire desk'}`,
            extraction_confidence: 1.0,
          })),
        };
      }

      case 'delay': {
        return {
          figure_name: 'Schedule Delay Cost',
          amount: summary.estimated_delay_cost,
          project_name: project.name,
          truth_domain: 'Progress',
          formula_applied: 'DelayCost = ScheduleDelayDays × DailyCarryingCost',
          provenance_nodes: [
            {
              id: 'node-delay-1',
              title: `Cumulative Milestone Delay (${summary.schedule_delay_days} days)`,
              amount: summary.estimated_delay_cost,
              status: 'confirmed',
              source_document_name: 'Schedule_Gantt_Milestones.xlsx',
              source_document_id: 'doc-schedule',
              source_ref: 'PM Field Inspections',
              extraction_confidence: 1.0,
            },
          ],
        };
      }

      case 'exposure':
      default: {
        return {
          figure_name: 'Developer Cash Exposure',
          amount: summary.developer_cash_exposure,
          project_name: project.name,
          truth_domain: 'Funding',
          formula_applied: 'DeveloperCashExposure = TotalActualSpend − AmountFunded',
          provenance_nodes: [
            {
              id: 'node-exp-1',
              title: 'Total Incurred Spend (Posted Invoices)',
              amount: summary.total_actual_spend,
              status: 'confirmed',
              source_document_name: 'Spend Truth Ledger',
              source_document_id: 'doc-spend',
              source_ref: 'Accounting Ledger',
              extraction_confidence: 1.0,
            },
            {
              id: 'node-exp-2',
              title: 'Total Lender Disbursed (Wires)',
              amount: -summary.total_amount_funded,
              status: 'confirmed',
              source_document_name: 'Funding Truth Ledger',
              source_document_id: 'doc-funded',
              source_ref: 'Lender Wire Logs',
              extraction_confidence: 1.0,
            },
          ],
        };
      }
    }
  }
}
