// GroundUp AI — MockChatService Implementation

import { IChatService } from '../interfaces/IChatService';
import {
  AIChatQueryRequestDTO,
  AIChatResponseDTO,
} from '../../types';
import { mockStore } from './MockDataStore';
import { delay } from './delay';

export class MockChatService implements IChatService {
  async askQuestion(payload: AIChatQueryRequestDTO): Promise<AIChatResponseDTO> {
    await delay(300, 600);

    const summary = mockStore.getProjectFourTruths(payload.projectId);
    const project = mockStore.projects.find((p) => p.id === payload.projectId) || mockStore.projects[0];
    const postedExpenses = mockStore.expenses.filter((e) => e.project_id === payload.projectId && e.status === 'posted');
    const projectDraws = mockStore.draws.filter((d) => d.project_id === payload.projectId);

    const queryLower = payload.message.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (queryLower.includes('cash') || queryLower.includes('exposure')) {
      return {
        id: `bot-msg-${Date.now()}`,
        role: 'assistant',
        timestamp,
        content: `Your current **Developer Cash Exposure is $${summary.developer_cash_exposure.toLocaleString()}** for **${project.name}**.\n\n` +
          `• **Total Spend:** $${summary.total_actual_spend.toLocaleString()} (posted invoices)\n` +
          `• **Total Disbursed:** $${summary.total_amount_funded.toLocaleString()} (bank wires funded)\n` +
          `• **Exposure Gap:** Out-of-pocket fronting capital pending next draw reimbursement.`,
        breakdown: {
          title: 'Developer Cash Exposure Lineage',
          total: summary.developer_cash_exposure,
          items: [
            { label: 'Total Incurred Spend', amount: summary.total_actual_spend, source: 'Posted Invoices Ledger', actor: 'Accounting Verification' },
            { label: 'Total Lender Disbursed', amount: -summary.total_amount_funded, source: 'Bank Wire Confirmations', actor: 'Lender Disbursement' },
          ],
        },
      };
    }

    if (queryLower.includes('budget') || queryLower.includes('over')) {
      const overBudgetLines = summary.categories.filter((c) => c.is_over_budget || c.has_reconciliation_flag);
      return {
        id: `bot-msg-${Date.now()}`,
        role: 'assistant',
        timestamp,
        content: `Found **${overBudgetLines.length} category alerts** on **${project.name}**:\n\n` +
          overBudgetLines.map((c) => `• **${c.category}:** $${c.actual_spend.toLocaleString()} spent vs $${c.current_budget.toLocaleString()} budget (${c.spend_pct * 100}% spent, ${Math.round(c.verified_progress_pct * 100)}% verified progress)`).join('\n'),
        breakdown: {
          title: 'Budget Variance & Discrepancies',
          total: summary.total_budget_variance,
          items: overBudgetLines.map((c) => ({
            label: c.category,
            amount: c.budget_variance,
            source: `Budget: $${c.current_budget.toLocaleString()}`,
            actor: c.has_reconciliation_flag ? 'Reconciliation Exception' : 'Over Budget',
          })),
        },
      };
    }

    if (queryLower.includes('draw') || queryLower.includes('disburs') || queryLower.includes('lender')) {
      return {
        id: `bot-msg-${Date.now()}`,
        role: 'assistant',
        timestamp,
        content: `Here is the current draw status for **${project.name}**:\n\n` +
          `• **Disbursed to Date:** $${summary.total_amount_funded.toLocaleString()}\n` +
          `• **Pending / In-Review Draws:** $${summary.total_requested_draws.toLocaleString()}\n` +
          `• **Active Draw Count:** ${projectDraws.length} draw package(s) on file with verified lien waivers.`,
        breakdown: {
          title: 'Draw Lifecycle',
          total: summary.total_amount_funded,
          items: projectDraws.map((d) => ({
            label: `Draw #${d.draw_number} (Rev ${d.revision_number})`,
            amount: d.requested_total,
            source: `Status: ${d.status.toUpperCase()}`,
            actor: d.lender_notes || 'Lender Review Queue',
          })),
        },
      };
    }

    // Default response
    return {
      id: `bot-msg-${Date.now()}`,
      role: 'assistant',
      timestamp,
      content: `Hello ${payload.userContext?.name || 'User'}, I am your GroundUp AI Financial Analyst for **${project.name}**.\n\n` +
        `• **Current Approved Budget:** $${summary.total_current_budget.toLocaleString()}\n` +
        `• **Reconciled Spend:** $${summary.total_actual_spend.toLocaleString()}\n` +
        `• **Lender Funded:** $${summary.total_amount_funded.toLocaleString()}\n` +
        `• **Cash Exposure:** $${summary.developer_cash_exposure.toLocaleString()}\n\n` +
        `Ask me about your budget lines, draws, lien waivers, schedule delay carrying costs, or provenance lineage.`,
      breakdown: {
        title: 'Project Ledger Summary',
        total: summary.total_current_budget,
        items: [
          { label: 'Budget Truth', amount: summary.total_current_budget, source: 'Master SOV + Approved COs', actor: 'CFO / Owner' },
          { label: 'Spend Truth', amount: summary.total_actual_spend, source: 'Posted Invoices', actor: 'Accounting Ledger' },
          { label: 'Funding Truth', amount: summary.total_amount_funded, source: 'Wire Disbursements', actor: 'Lender Record' },
        ],
      },
    };
  }
}
