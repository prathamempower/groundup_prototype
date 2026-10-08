// GroundUp AI — MockProjectService Implementation

import { IProjectService } from '../interfaces/IProjectService';
import {
  Project,
  ProjectFourTruthsSummary,
  CreateProjectDTO,
  UpdateProjectDTO,
  DeleteProjectResponseDTO,
  PortfolioSummaryDTO,
  FinalReportDataDTO,
} from '../../types';
import { mockStore } from './MockDataStore';
import { delay } from './delay';

export class MockProjectService implements IProjectService {
  async getProjects(): Promise<Project[]> {
    await delay();
    return [...mockStore.projects];
  }

  async getProject(projectId: string): Promise<Project> {
    await delay();
    const project = mockStore.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found.`);
    }
    return { ...project };
  }

  async getProjectSummary(projectId: string): Promise<ProjectFourTruthsSummary> {
    await delay();
    return mockStore.getProjectFourTruths(projectId);
  }

  async createProject(data: CreateProjectDTO): Promise<Project> {
    await delay();
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name,
      address: data.address,
      gc_name: data.gc_name || 'Metro Builds LLC',
      gc_contract_model: 'FIXED_PRICE',
      lender_name: data.lender_name || 'BCB Community Bank',
      units: data.units || 1,
      square_feet: data.square_feet || 3000,
      target_budget: data.target_budget || 1000000,
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      expected_completion: data.expected_completion || '2027-01-01',
      status: 'ACTIVE',
      created_by_user_id: 'user-dev-1',
      created_at: new Date().toISOString(),
      acquisition_cost: data.acquisition_cost,
      expected_sale_price: data.expected_sale_price,
      contingency_initial: data.contingency_initial || 50000,
      contingency_remaining: data.contingency_initial || 50000,
    };

    mockStore.projects.unshift(newProject);
    return { ...newProject };
  }

  async updateProject(projectId: string, updates: UpdateProjectDTO): Promise<Project> {
    await delay();
    const index = mockStore.projects.findIndex((p) => p.id === projectId);
    if (index === -1) {
      throw new Error(`Project ${projectId} not found.`);
    }

    mockStore.projects[index] = {
      ...mockStore.projects[index],
      ...updates,
    };

    return { ...mockStore.projects[index] };
  }

  async deleteProject(projectId: string): Promise<DeleteProjectResponseDTO> {
    await delay();
    mockStore.projects = mockStore.projects.filter((p) => p.id !== projectId);
    mockStore.budgetLines = mockStore.budgetLines.filter((bl) => bl.project_id !== projectId);
    mockStore.expenses = mockStore.expenses.filter((e) => e.project_id !== projectId);
    mockStore.draws = mockStore.draws.filter((d) => d.project_id !== projectId);
    mockStore.drawLines = mockStore.drawLines.filter((dl) => dl.project_id !== projectId);
    mockStore.activities = mockStore.activities.filter((a) => a.project_id !== projectId);
    mockStore.loans = mockStore.loans.filter((l) => l.project_id !== projectId);

    return { success: true, message: `Project ${projectId} deleted successfully.` };
  }

  async getPortfolioSummary(): Promise<PortfolioSummaryDTO> {
    await delay();
    return mockStore.getPortfolioSummary();
  }

  async getFinalReport(projectId: string): Promise<FinalReportDataDTO> {
    await delay();
    const project = await this.getProject(projectId);
    const summary = mockStore.getProjectFourTruths(projectId);
    const loan = mockStore.loans.find((l) => l.project_id === projectId);
    const expenses = mockStore.expenses.filter((e) => e.project_id === projectId && e.status === 'posted');

    return {
      reportId: `REP-${projectId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      generatedAt: new Date().toISOString(),
      sha256Hash: `hash-${projectId}-${Date.now()}`,
      project: {
        id: project.id,
        name: project.name,
        address: project.address,
        gcName: project.gc_name,
        lenderName: project.lender_name,
        status: project.status,
        units: project.units,
        squareFeet: project.square_feet || 4000,
      },
      sponsor: {
        name: 'Hardik Parikh',
        company: 'GroundUp Development Partners',
        role: 'DEVELOPER_OWNER',
      },
      fourTruths: {
        masterBudget: summary.total_current_budget,
        incurredSpend: summary.total_actual_spend,
        lenderDisbursed: summary.total_amount_funded,
        developerCashExposure: summary.developer_cash_exposure,
        dailyCarryingCost: summary.daily_carrying_cost,
        interestRatePct: (loan?.interest_rate || 0.0975) * 100,
        loanCommitment: loan?.loan_amount || 1400000,
      },
      csiCategories: summary.categories.map((c) => ({
        costCode: c.category.includes('Concrete') ? '03-300' : c.category.includes('Framing') ? '06-100' : '01-100',
        category: c.category,
        budgetedAmount: c.current_budget,
        incurredSpend: c.actual_spend,
        variance: c.budget_variance,
        status: c.is_over_budget ? 'OVER_BUDGET' : c.actual_spend > 0.85 * c.current_budget ? 'APPROACHING_LIMIT' : 'ON_BUDGET',
      })),
      verifiedInvoices: expenses.map((e) => ({
        id: e.id,
        vendor: e.vendor_name,
        category: e.category,
        invoiceNumber: e.invoice_id || 'INV-EXT',
        date: e.expense_date,
        amount: e.amount,
        lienWaiverVerified: Boolean(e.lien_waiver_received),
        sourceDocument: e.source_ref,
      })),
      pipelineTrace: [
        { stepNumber: 1, stepName: 'Ingestion', status: 'DONE', title: 'File Ingested', description: 'Validated multi-doc package', confidence: 1.0, timestamp: '10:00:01' },
        { stepNumber: 2, stepName: 'Classification', status: 'DONE', title: 'CSI Division Mapping', description: 'Matched MasterFormat standards', confidence: 0.98, timestamp: '10:00:02' },
        { stepNumber: 3, stepName: 'Anti-Double-Count Filter', status: 'DONE', title: 'Filtered Previous Balances', description: 'Applied strict keep/avoid rules', confidence: 1.0, timestamp: '10:00:03' },
        { stepNumber: 4, stepName: 'Four Truths Reconciliation', status: 'DONE', title: 'Calculated Spend vs Funded', description: 'Zero-hallucination mathematical reconciliation', confidence: 1.0, timestamp: '10:00:04' },
      ],
      metrics: {
        overallConfidence: 0.98,
        totalDocuments: 3,
        totalLineItemsExtracted: expenses.length,
        totalExcludedAmount: 45000,
        duplicateCheckResult: 'PASSED_CLEAN',
        matchingRuleApplied: 'CSI_MASTERFORMAT_AUTO_MATCH',
      },
      complianceStatus: 'VERIFIED_ZERO_HALLUCINATION',
    };
  }
}
