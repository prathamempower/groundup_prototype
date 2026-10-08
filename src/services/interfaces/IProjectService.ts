// GroundUp AI — IProjectService Interface Contract

import {
  Project,
  ProjectFourTruthsSummary,
  CreateProjectDTO,
  UpdateProjectDTO,
  DeleteProjectResponseDTO,
  PortfolioSummaryDTO,
  FinalReportDataDTO,
} from '../../types';

export interface IProjectService {
  /**
   * Fetch all projects in the portfolio.
   */
  getProjects(): Promise<Project[]>;

  /**
   * Fetch a single project by ID.
   */
  getProject(projectId: string): Promise<Project>;

  /**
   * Fetch live Four Truths reconciliation summary for a project.
   */
  getProjectSummary(projectId: string): Promise<ProjectFourTruthsSummary>;

  /**
   * Create a new project.
   */
  createProject(data: CreateProjectDTO): Promise<Project>;

  /**
   * Update an existing project.
   */
  updateProject(projectId: string, updates: UpdateProjectDTO): Promise<Project>;

  /**
   * Delete a project and its associated ledger data.
   */
  deleteProject(projectId: string): Promise<DeleteProjectResponseDTO>;

  /**
   * Fetch portfolio-wide aggregated economic summary.
   */
  getPortfolioSummary(): Promise<PortfolioSummaryDTO>;

  /**
   * Generate or fetch certified Final Audit & Reconciliation Report.
   */
  getFinalReport(projectId: string): Promise<FinalReportDataDTO>;
}
