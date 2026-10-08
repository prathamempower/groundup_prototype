// GroundUp AI — MockPipelineService Implementation
// Simulates the full 10-step AI pipeline deterministically for zero-backend operation

import { IPipelineService } from '../interfaces/IPipelineService';
import {
  PipelineProcessRequestDTO,
  PipelineExecutionResultDTO,
  Project,
} from '../../types';
import { mockStore } from './MockDataStore';
import { delay } from './delay';

export class MockPipelineService implements IPipelineService {
  async executePipeline(payload: PipelineProcessRequestDTO): Promise<PipelineExecutionResultDTO> {
    const startTime = Date.now();
    await delay(600, 1000);

    const projectId = `proj-${Date.now()}`;
    const project: Project = {
      id: projectId,
      name: payload.projectName || 'Underwritten AI Project',
      address: payload.projectAddress || '100 Development Way',
      gc_name: 'Metro Builds LLC',
      gc_contract_model: 'FIXED_PRICE',
      lender_name: 'BCB Community Bank',
      units: payload.units || 4,
      square_feet: payload.squareFeet || 6400,
      target_budget: payload.targetBudget || 1300000,
      start_date: new Date().toISOString().split('T')[0],
      expected_completion: '2027-10-31',
      status: 'ACTIVE',
      created_by_user_id: 'user-dev-1',
      created_at: new Date().toISOString(),
      acquisition_cost: 950000,
      expected_sale_price: 3200000,
      contingency_initial: 70000,
      contingency_remaining: 70000,
    };

    mockStore.projects.unshift(project);

    // Initial SOV Lines
    const defaultLines = [
      { category: 'Pre-construction & Permits', cost_code: '01-100', amount: 65000 },
      { category: 'Site Work & Utilities', cost_code: '02-100', amount: 85000 },
      { category: 'Foundation & Concrete', cost_code: '03-300', amount: 240000 },
      { category: 'Framing & Trusses', cost_code: '06-100', amount: 320000 },
      { category: 'Plumbing', cost_code: '22-000', amount: 165000 },
      { category: 'Electrical', cost_code: '26-000', amount: 140000 },
      { category: 'Drywall & Finishes', cost_code: '09-200', amount: 120000 },
      { category: 'Exterior & Roofing', cost_code: '07-100', amount: 95000 },
      { category: 'Contingency', cost_code: '00-500', amount: 70000 },
    ];

    mockStore.budgetVersions.push({
      id: `bv-${projectId}-v1`,
      project_id: projectId,
      version_number: 1,
      status: 'APPROVED',
      approved_at: new Date().toISOString(),
      notes: 'AI Pipeline Auto-Generated Budget',
      created_at: new Date().toISOString(),
    });

    defaultLines.forEach((l, idx) => {
      mockStore.budgetLines.push({
        id: `bl-${projectId}-${idx + 1}`,
        project_id: projectId,
        version_id: `bv-${projectId}-v1`,
        category: l.category,
        cost_code: l.cost_code,
        original_amount: l.amount,
        source_ref: 'Extracted Master SOV',
      });
    });

    // Invoices extracted from sample pipeline files
    const sampleExpenses = [
      { category: 'Foundation & Concrete', vendor: 'Titan Concrete Systems LLC', amount: 185000, inv: 'INV-2026-9041' },
      { category: 'Framing & Trusses', vendor: 'BMC Building Materials', amount: 148000, inv: 'INV-2026-9042' },
    ];

    sampleExpenses.forEach((exp, idx) => {
      mockStore.expenses.push({
        id: `exp-${projectId}-${idx + 1}`,
        project_id: projectId,
        category: exp.category,
        vendor_id: `ven-${idx + 1}`,
        vendor_name: exp.vendor,
        amount: exp.amount,
        status: 'posted',
        invoice_id: exp.inv,
        source_document_id: 'doc-pipeline',
        source_ref: `Pipeline Verified Invoice #${exp.inv}`,
        cost_scope: 'PROJECT',
        lien_waiver_received: true,
        expense_date: new Date().toISOString().split('T')[0],
        entered_by_role: 'ACCOUNTANT',
        created_at: new Date().toISOString(),
      });
    });

    const summary = mockStore.getProjectFourTruths(projectId);

    return {
      pipelineRunId: `run-${Date.now()}`,
      status: 'COMPLETED',
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      project,
      fourTruthsSummary: summary,
      finalReport: {
        reportId: `REP-${projectId.toUpperCase()}-001`,
        generatedAt: new Date().toISOString(),
        sha256Hash: `hash-${projectId}-verified`,
        project: {
          id: project.id,
          name: project.name,
          address: project.address,
          gcName: project.gc_name,
          lenderName: project.lender_name,
          status: project.status,
          units: project.units,
          squareFeet: project.square_feet || 6400,
        },
        sponsor: {
          name: payload.userContext?.name || 'Harrison Reed',
          company: payload.userContext?.company || 'Acme Builders LLC',
          role: payload.userContext?.role || 'DEVELOPER_OWNER',
        },
        fourTruths: {
          masterBudget: summary.total_current_budget,
          incurredSpend: summary.total_actual_spend,
          lenderDisbursed: summary.total_amount_funded,
          developerCashExposure: summary.developer_cash_exposure,
          dailyCarryingCost: summary.daily_carrying_cost,
          interestRatePct: 8.75,
          loanCommitment: 1000000,
        },
        csiCategories: summary.categories.map((c) => ({
          costCode: '03-300',
          category: c.category,
          budgetedAmount: c.current_budget,
          incurredSpend: c.actual_spend,
          variance: c.budget_variance,
          status: c.is_over_budget ? 'OVER_BUDGET' : 'ON_BUDGET',
        })),
        verifiedInvoices: sampleExpenses.map((e, idx) => ({
          id: `inv-${idx + 1}`,
          vendor: e.vendor,
          category: e.category,
          invoiceNumber: e.inv,
          date: new Date().toISOString().split('T')[0],
          amount: e.amount,
          lienWaiverVerified: true,
          sourceDocument: 'Invoice_Titan_Concrete_Paving.txt',
        })),
        pipelineTrace: [
          { stepNumber: 1, stepName: 'Ingestion', status: 'DONE', title: 'File Ingested', description: 'Validated 3 document payloads', confidence: 1.0, timestamp: '0.1s' },
          { stepNumber: 2, stepName: 'Storage & SHA-256', status: 'DONE', title: 'Content Hash Computed', description: 'Zero duplication verified', confidence: 1.0, timestamp: '0.2s' },
          { stepNumber: 3, stepName: 'Classification', status: 'DONE', title: 'Document Classification', description: 'Identified 1 Master SOV and 2 Invoices', confidence: 0.99, timestamp: '0.3s' },
          { stepNumber: 4, stepName: 'Extraction', status: 'DONE', title: 'Field Parsing', description: 'Extracted 9 SOV line items and 2 invoice totals', confidence: 0.98, timestamp: '0.4s' },
          { stepNumber: 5, stepName: 'Normalization', status: 'DONE', title: 'CSI Division Mapping', description: 'Mapped to MasterFormat 2020 divisions', confidence: 0.97, timestamp: '0.5s' },
          { stepNumber: 6, stepName: 'Confidence Audit', status: 'DONE', title: 'Confidence Gating', description: 'All items scored above 95% threshold', confidence: 0.98, timestamp: '0.6s' },
          { stepNumber: 7, stepName: 'Anti-Double-Count Validation', status: 'DONE', title: 'Filtered Previous Balances', description: 'Filtered $45,000 previous balance', confidence: 1.0, timestamp: '0.7s' },
          { stepNumber: 8, stepName: 'Ledger Matching', status: 'DONE', title: 'Cost Code Matching', description: 'Matched invoices to Foundation and Framing', confidence: 0.99, timestamp: '0.8s' },
          { stepNumber: 9, stepName: 'Human Review & Verification', status: 'DONE', title: 'Lineage Verified', description: 'Audit trails confirmed by zero-hallucination engine', confidence: 1.0, timestamp: '0.9s' },
          { stepNumber: 10, stepName: 'Database Commit', status: 'DONE', title: 'Reconciliation Generated', description: 'Four Truths live dashboard ready', confidence: 1.0, timestamp: '1.0s' },
        ],
        metrics: {
          overallConfidence: 0.98,
          totalDocuments: 3,
          totalLineItemsExtracted: 11,
          totalExcludedAmount: 45000,
          duplicateCheckResult: 'PASSED',
          matchingRuleApplied: 'CSI_MASTERFORMAT_DETERMINISTIC',
        },
        complianceStatus: 'VERIFIED_ZERO_HALLUCINATION',
      },
      stepLogs: [
        { stepNumber: 1, stepName: 'Ingestion', status: 'DONE', title: 'File Ingested', description: 'Validated 3 document payloads', confidence: 1.0, timestamp: '0.1s' },
        { stepNumber: 2, stepName: 'Storage & SHA-256', status: 'DONE', title: 'Content Hash Computed', description: 'Zero duplication verified', confidence: 1.0, timestamp: '0.2s' },
        { stepNumber: 3, stepName: 'Classification', status: 'DONE', title: 'Document Classification', description: 'Identified 1 Master SOV and 2 Invoices', confidence: 0.99, timestamp: '0.3s' },
        { stepNumber: 4, stepName: 'Extraction', status: 'DONE', title: 'Field Parsing', description: 'Extracted 9 SOV line items and 2 invoice totals', confidence: 0.98, timestamp: '0.4s' },
        { stepNumber: 5, stepName: 'Normalization', status: 'DONE', title: 'CSI Division Mapping', description: 'Mapped to MasterFormat 2020 divisions', confidence: 0.97, timestamp: '0.5s' },
        { stepNumber: 6, stepName: 'Confidence Audit', status: 'DONE', title: 'Confidence Gating', description: 'All items scored above 95% threshold', confidence: 0.98, timestamp: '0.6s' },
        { stepNumber: 7, stepName: 'Anti-Double-Count Validation', status: 'DONE', title: 'Filtered Previous Balances', description: 'Filtered $45,000 previous balance', confidence: 1.0, timestamp: '0.7s' },
        { stepNumber: 8, stepName: 'Ledger Matching', status: 'DONE', title: 'Cost Code Matching', description: 'Matched invoices to Foundation and Framing', confidence: 0.99, timestamp: '0.8s' },
        { stepNumber: 9, stepName: 'Human Review & Verification', status: 'DONE', title: 'Lineage Verified', description: 'Audit trails confirmed by zero-hallucination engine', confidence: 1.0, timestamp: '0.9s' },
        { stepNumber: 10, stepName: 'Database Commit', status: 'DONE', title: 'Reconciliation Generated', description: 'Four Truths live dashboard ready', confidence: 1.0, timestamp: '1.0s' },
      ],
    };
  }
}
