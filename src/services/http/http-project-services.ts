import {
  IProjectService,
  IIntakeService,
} from '../interfaces';
import {
  Project,
  Loan,
  Expense,
  UserRole,
  ProjectFourTruthsSummary,
  CreateProjectDTO,
  UpdateProjectDTO,
  DeleteProjectResponseDTO,
  PortfolioSummaryDTO,
  FinalReportDataDTO,
  BudgetLineInputDTO,
  DirectExpenseInputDTO,
  MilestoneActivityInputDTO,
  FullUserProjectIntakeRequestDTO,
  FullUserProjectIntakeResponseDTO,
  SaveMasterBudgetSOVResponseDTO,
  SaveScheduleMilestonesResponseDTO,
} from '../../types';
import { http } from './http-client';

export class HttpProjectService implements IProjectService {
  getProjects(): Promise<Project[]> {
    return http<Project[]>('/api/projects');
  }

  getProject(projectId: string): Promise<Project> {
    return http<Project>(`/api/projects/${projectId}`);
  }

  getProjectSummary(projectId: string): Promise<ProjectFourTruthsSummary> {
    return http<ProjectFourTruthsSummary>(`/api/projects/${projectId}`);
  }

  createProject(data: CreateProjectDTO): Promise<Project> {
    return http<Project>('/api/intake/project', {
      method: 'POST',
      body: JSON.stringify({ projectData: data }),
    });
  }

  updateProject(projectId: string, data: UpdateProjectDTO): Promise<Project> {
    return http<Project>(`/api/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deleteProject(projectId: string): Promise<DeleteProjectResponseDTO> {
    return http<DeleteProjectResponseDTO>(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  getPortfolioSummary(): Promise<PortfolioSummaryDTO> {
    return http<PortfolioSummaryDTO>('/api/projects/portfolio/summary');
  }

  getFinalReport(projectId: string): Promise<FinalReportDataDTO> {
    return http<FinalReportDataDTO>(`/api/projects/${projectId}/final-report`);
  }

  generateFinalAuditReport(projectId: string): Promise<FinalReportDataDTO> {
    return this.getFinalReport(projectId);
  }
}

export class HttpIntakeService implements IIntakeService {
  createProjectWithLoan(
    projectData: CreateProjectDTO,
    loanData?: {
      loan_amount: number;
      interest_rate: number;
      term_months: number;
      holdback_amount: number;
    }
  ): Promise<{ project: Project; loan?: Loan }> {
    return http<{ project: Project; loan?: Loan }>('/api/intake/project', {
      method: 'POST',
      body: JSON.stringify({ projectData, loanData }),
    });
  }

  saveMasterBudgetSOV(
    projectId: string,
    lines: BudgetLineInputDTO[],
    actorRole?: UserRole
  ): Promise<SaveMasterBudgetSOVResponseDTO> {
    return http<SaveMasterBudgetSOVResponseDTO>('/api/intake/budget-sov', {
      method: 'POST',
      body: JSON.stringify({ projectId, lines, actorRole }),
    });
  }

  addDirectExpense(
    projectId: string,
    expenseData: DirectExpenseInputDTO,
    actorRole?: UserRole,
    actorName?: string
  ): Promise<Expense> {
    return http<Expense>('/api/intake/expense', {
      method: 'POST',
      body: JSON.stringify({ projectId, expenseData, actorRole, actorName }),
    });
  }

  saveScheduleMilestones(
    projectId: string,
    activities: MilestoneActivityInputDTO[],
    actorRole?: UserRole
  ): Promise<SaveScheduleMilestonesResponseDTO> {
    return http<SaveScheduleMilestonesResponseDTO>('/api/intake/schedule-milestones', {
      method: 'POST',
      body: JSON.stringify({ projectId, activities, actorRole }),
    });
  }

  createFullUserProjectIntake(
    payload: FullUserProjectIntakeRequestDTO
  ): Promise<FullUserProjectIntakeResponseDTO> {
    return http<FullUserProjectIntakeResponseDTO>('/api/intake/full-user-project', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
