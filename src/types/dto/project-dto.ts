import { UserRole } from '../domain';

export interface CreateProjectDTO {
  name: string;
  address: string;
  gc_name?: string;
  lender_name?: string;
  units?: number;
  square_feet?: number;
  target_budget?: number;
  start_date?: string;
  expected_completion?: string;
  acquisition_cost?: number;
  expected_sale_price?: number;
  contingency_initial?: number;
  actor_role?: UserRole;
}

export interface UpdateProjectDTO {
  name?: string;
  address?: string;
  gc_name?: string;
  lender_name?: string;
  units?: number;
  square_feet?: number;
  target_budget?: number;
  start_date?: string;
  expected_completion?: string;
  status?: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  acquisition_cost?: number;
  expected_sale_price?: number;
  contingency_initial?: number;
  contingency_remaining?: number;
}

export interface DeleteProjectResponseDTO {
  success: boolean;
  message?: string;
}

export interface PortfolioSummaryDTO {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalPortfolioBudget: number;
  totalPortfolioSpend: number;
  totalPortfolioFunded: number;
  totalCashExposure: number;
  averageProgressPct: number;
  activeRisksCount: number;
  projects: Array<{
    id: string;
    name: string;
    address: string;
    status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
    budget: number;
    spend: number;
    funded: number;
    cashExposure: number;
    progressPct: number;
    delayDays: number;
    alertsCount: number;
  }>;
}

export interface FinalReportCategoryLine {
  costCode: string;
  category: string;
  budgetedAmount: number;
  incurredSpend: number;
  variance: number;
  status: 'ON_BUDGET' | 'APPROACHING_LIMIT' | 'OVER_BUDGET' | 'UNBUDGETED_EXPENSE';
}

export interface FinalReportInvoiceLine {
  id: string;
  vendor: string;
  category: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  lienWaiverVerified: boolean;
  sourceDocument: string;
}

export interface FinalReportDataDTO {
  reportId: string;
  generatedAt: string;
  sha256Hash: string;
  project: {
    id: string;
    name: string;
    address: string;
    gcName: string;
    lenderName: string;
    status: string;
    units: number;
    squareFeet: number;
  };
  sponsor: {
    name: string;
    company: string;
    role: string;
  };
  fourTruths: {
    masterBudget: number;
    incurredSpend: number;
    lenderDisbursed: number;
    developerCashExposure: number;
    dailyCarryingCost: number;
    interestRatePct: number;
    loanCommitment: number;
  };
  csiCategories: FinalReportCategoryLine[];
  verifiedInvoices: FinalReportInvoiceLine[];
  pipelineTrace: Array<{
    stepNumber: number;
    stepName: string;
    status: 'PENDING' | 'RUNNING' | 'DONE' | 'EXCEPTION_FLAGGED';
    title: string;
    description: string;
    confidence: number;
    timestamp: string;
    details?: Record<string, string | number | boolean>;
  }>;
  metrics: {
    overallConfidence: number;
    totalDocuments: number;
    totalLineItemsExtracted: number;
    totalExcludedAmount: number;
    duplicateCheckResult: string;
    matchingRuleApplied: string;
  };
  complianceStatus: 'VERIFIED_ZERO_HALLUCINATION';
}
