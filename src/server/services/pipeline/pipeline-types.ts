export interface PipelineFile {
  fileName: string;
  content?: string;
  bufferBase64?: string;
  documentType?: string;
}

export interface PipelineStepLog {
  stepNumber: number;
  stepName: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'EXCEPTION_FLAGGED';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  details?: Record<string, any>;
}

export interface FinalReportData {
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
  csiCategories: Array<{
    costCode: string;
    category: string;
    budgetedAmount: number;
    incurredSpend: number;
    variance: number;
    status: 'ON_BUDGET' | 'APPROACHING_LIMIT' | 'OVER_BUDGET' | 'UNBUDGETED_EXPENSE';
  }>;
  verifiedInvoices: Array<{
    id: string;
    vendor: string;
    category: string;
    invoiceNumber: string;
    date: string;
    amount: number;
    lienWaiverVerified: boolean;
    sourceDocument: string;
  }>;
  pipelineTrace: PipelineStepLog[];
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

export interface PortfolioSummaryData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalCommittedBudget: number;
  totalActualSpend: number;
  totalFunded: number;
  developerCashExposure: number;
  drawsPending: number;
  averageOnTimeRate: number;
  aiAuditStatus: string;
  overallConfidence: number;
  briefItems: Array<{
    id: string;
    name: string;
    status: string;
    message: string;
    cashFronting: number;
    progressPct: number;
    budget: number;
  }>;
  projects: any[];
}
