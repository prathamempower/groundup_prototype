import {
  Project,
  Loan,
  BudgetLine,
  UserRole,
  CostScope,
  ExpenseStatus,
  ProjectFourTruthsSummary,
} from '../domain';
import { CreateProjectDTO } from './project-dto';

export interface CreateProjectWithLoanRequestDTO {
  projectData: CreateProjectDTO;
  loanData?: {
    loan_amount: number;
    interest_rate: number;
    term_months: number;
    holdback_amount: number;
  };
}

export interface CreateProjectWithLoanResponseDTO {
  project: Project;
  loan?: Loan;
}

export interface BudgetLineInputDTO {
  category: string;
  cost_code?: string;
  amount: number;
  sub_category?: string;
}

export interface SaveMasterBudgetSOVRequestDTO {
  projectId: string;
  lines: BudgetLineInputDTO[];
  actorRole?: UserRole;
}

export interface SaveMasterBudgetSOVResponseDTO {
  success: boolean;
  lines: BudgetLine[];
  totalBudget: number;
}

export interface DirectExpenseInputDTO {
  category: string;
  vendor_name: string;
  amount: number;
  expense_date: string;
  description?: string;
  lien_waiver_received?: boolean;
  invoice_id?: string;
  source_ref?: string;
  cost_scope?: CostScope;
  status?: ExpenseStatus;
}

export interface AddDirectExpenseRequestDTO {
  projectId: string;
  expenseData: DirectExpenseInputDTO;
  actorRole?: UserRole;
  actorName?: string;
}

export interface MilestoneActivityInputDTO {
  milestone: string;
  trade: string;
  planned_start?: string;
  planned_end: string;
  verified_progress_pct?: number;
}

export interface SaveScheduleMilestonesRequestDTO {
  projectId: string;
  activities: MilestoneActivityInputDTO[];
  actorRole?: UserRole;
}

export interface SaveScheduleMilestonesResponseDTO {
  success: boolean;
  count: number;
}

export interface FullUserProjectIntakeRequestDTO {
  projectName: string;
  projectAddress: string;
  gcName?: string;
  lenderName?: string;
  units?: number;
  squareFeet?: number;
  targetBudget: number;
  acquisitionCost?: number;
  expectedSalePrice?: number;
  loanAmount?: number;
  interestRate?: number;
  termMonths?: number;
  sovLines?: BudgetLineInputDTO[];
  invoices?: DirectExpenseInputDTO[];
  activities?: MilestoneActivityInputDTO[];
  actorRole?: UserRole;
  actorName?: string;
}

export interface FullUserProjectIntakeResponseDTO {
  project: Project;
  summary: ProjectFourTruthsSummary;
}
