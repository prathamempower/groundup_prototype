// GroundUp AI — IIntakeService Interface Contract

import {
  Project,
  Loan,
  BudgetLine,
  Expense,
  UserRole,
  CreateProjectDTO,
  BudgetLineInputDTO,
  DirectExpenseInputDTO,
  MilestoneActivityInputDTO,
  FullUserProjectIntakeRequestDTO,
  FullUserProjectIntakeResponseDTO,
  SaveMasterBudgetSOVResponseDTO,
  SaveScheduleMilestonesResponseDTO,
} from '../../types';

export interface IIntakeService {
  /**
   * Create a project along with initial construction loan parameters.
   */
  createProjectWithLoan(
    projectData: CreateProjectDTO,
    loanData?: {
      loan_amount: number;
      interest_rate: number;
      term_months: number;
      holdback_amount: number;
    }
  ): Promise<{ project: Project; loan?: Loan }>;

  /**
   * Save Master Budget & Schedule of Values (SOV) lines.
   */
  saveMasterBudgetSOV(
    projectId: string,
    lines: BudgetLineInputDTO[],
    actorRole?: UserRole
  ): Promise<SaveMasterBudgetSOVResponseDTO>;

  /**
   * Record a direct invoice/expense to Spend Truth.
   */
  addDirectExpense(
    projectId: string,
    expenseData: DirectExpenseInputDTO,
    actorRole?: UserRole,
    actorName?: string
  ): Promise<Expense>;

  /**
   * Save schedule milestones and physical progress percentages.
   */
  saveScheduleMilestones(
    projectId: string,
    activities: MilestoneActivityInputDTO[],
    actorRole?: UserRole
  ): Promise<SaveScheduleMilestonesResponseDTO>;

  /**
   * Complete full user onboarding intake in a single atomic operation.
   */
  createFullUserProjectIntake(
    payload: FullUserProjectIntakeRequestDTO
  ): Promise<FullUserProjectIntakeResponseDTO>;
}
