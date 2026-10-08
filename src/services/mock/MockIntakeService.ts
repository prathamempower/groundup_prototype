import { IIntakeService } from '../interfaces/IIntakeService';
import {
  Project,
  Loan,
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
import { mockStore } from './MockDataStore';
import { delay } from './delay';
import {
  saveMockMasterBudgetSOV,
  addMockDirectExpense,
  saveMockScheduleMilestones,
} from './mock-intake-savers';

export class MockIntakeService implements IIntakeService {
  async createProjectWithLoan(
    projectData: CreateProjectDTO,
    loanData?: {
      loan_amount: number;
      interest_rate: number;
      term_months: number;
      holdback_amount: number;
    }
  ): Promise<{ project: Project; loan?: Loan }> {
    await delay();
    const projectId = `proj-${Date.now()}`;
    const project: Project = {
      id: projectId,
      name: projectData.name,
      address: projectData.address,
      gc_name: projectData.gc_name || 'Acme Builders LLC',
      gc_contract_model: 'FIXED_PRICE',
      lender_name: projectData.lender_name || 'Commercial Bank',
      units: projectData.units || 1,
      square_feet: projectData.square_feet || 3200,
      target_budget: projectData.target_budget || 1000000,
      start_date: projectData.start_date || new Date().toISOString().split('T')[0],
      expected_completion: projectData.expected_completion || '2027-01-01',
      status: 'ACTIVE',
      created_by_user_id: 'user-dev-1',
      created_at: new Date().toISOString(),
      acquisition_cost: projectData.acquisition_cost,
      expected_sale_price: projectData.expected_sale_price,
      contingency_initial: projectData.contingency_initial || 50000,
      contingency_remaining: projectData.contingency_initial || 50000,
    };

    mockStore.projects.unshift(project);

    let createdLoan: Loan | undefined;
    if (loanData) {
      createdLoan = {
        id: `loan-${projectId}`,
        project_id: projectId,
        lender_name: project.lender_name,
        loan_amount: loanData.loan_amount,
        interest_rate: loanData.interest_rate,
        term_months: loanData.term_months,
        holdback_amount: loanData.holdback_amount,
        current_balance: 0,
        closing_date: project.start_date,
        entered_by_role: 'CFO',
        interest_payment_method: 'RESERVE',
      };
      mockStore.loans.push(createdLoan);
    }

    return { project, loan: createdLoan };
  }

  async saveMasterBudgetSOV(
    projectId: string,
    lines: BudgetLineInputDTO[],
    actorRole: UserRole = 'CFO'
  ): Promise<SaveMasterBudgetSOVResponseDTO> {
    await delay();
    return saveMockMasterBudgetSOV(projectId, lines, actorRole);
  }

  async addDirectExpense(
    projectId: string,
    expenseData: DirectExpenseInputDTO,
    actorRole: UserRole = 'ACCOUNTANT',
    actorName: string = 'User'
  ): Promise<Expense> {
    await delay();
    return addMockDirectExpense(projectId, expenseData, actorRole, actorName);
  }

  async saveScheduleMilestones(
    projectId: string,
    activities: MilestoneActivityInputDTO[],
    actorRole: UserRole = 'PM'
  ): Promise<SaveScheduleMilestonesResponseDTO> {
    await delay();
    return saveMockScheduleMilestones(projectId, activities, actorRole);
  }

  async createFullUserProjectIntake(
    payload: FullUserProjectIntakeRequestDTO
  ): Promise<FullUserProjectIntakeResponseDTO> {
    await delay(350, 600);

    const { project } = await this.createProjectWithLoan(
      {
        name: payload.projectName,
        address: payload.projectAddress,
        gc_name: payload.gcName || 'Metro Builds LLC',
        lender_name: payload.lenderName || 'BCB Community Bank',
        units: payload.units || 1,
        square_feet: payload.squareFeet || 3200,
        target_budget: payload.targetBudget,
        acquisition_cost: payload.acquisitionCost,
        expected_sale_price: payload.expectedSalePrice,
      },
      payload.loanAmount
        ? {
            loan_amount: payload.loanAmount,
            interest_rate: payload.interestRate || 0.0875,
            term_months: payload.termMonths || 18,
            holdback_amount: Math.round(payload.loanAmount * 0.1),
          }
        : undefined
    );

    if (payload.sovLines && payload.sovLines.length > 0) {
      await this.saveMasterBudgetSOV(project.id, payload.sovLines, payload.actorRole || 'CFO');
    }

    if (payload.invoices && payload.invoices.length > 0) {
      for (const inv of payload.invoices) {
        await this.addDirectExpense(project.id, inv, payload.actorRole || 'ACCOUNTANT', payload.actorName);
      }
    }

    if (payload.activities && payload.activities.length > 0) {
      await this.saveScheduleMilestones(project.id, payload.activities, payload.actorRole || 'PM');
    }

    const summary = mockStore.getProjectFourTruths(project.id);
    return { project, summary };
  }
}
