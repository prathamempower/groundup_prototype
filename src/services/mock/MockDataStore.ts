// GroundUp AI — In-Memory Mock Data Repository & State Store
// Encapsulates deterministic calculations, multi-table joins, and CRUD state for zero-backend execution

import {
  Project,
  Loan,
  BudgetVersion,
  BudgetLine,
  Expense,
  Draw,
  DrawLine,
  ScheduleActivity,
  Inspection,
  AlertRisk,
  Document,
  AuditEvent,
  DealLabOpportunity,
  ProjectFourTruthsSummary,
  UserRole,
  USER_ROLES,
  PortfolioSummaryDTO,
} from '../../types';
import {
  INITIAL_PROJECTS,
  INITIAL_LOANS,
  INITIAL_BUDGET_VERSIONS,
  INITIAL_BUDGET_LINES,
  INITIAL_EXPENSES,
  INITIAL_DRAWS,
  INITIAL_DRAW_LINES,
  INITIAL_ACTIVITIES,
  INITIAL_INSPECTIONS,
  INITIAL_DEAL_OPPORTUNITIES,
} from '../../mocks/data';
import { computeProjectFourTruths } from '../../shared/engine/reconciliation';

export class MockDataStore {
  private static instance: MockDataStore;

  public projects: Project[] = [];
  public loans: Loan[] = [];
  public budgetVersions: BudgetVersion[] = [];
  public budgetLines: BudgetLine[] = [];
  public expenses: Expense[] = [];
  public draws: Draw[] = [];
  public drawLines: DrawLine[] = [];
  public activities: ScheduleActivity[] = [];
  public inspections: Inspection[] = [];
  public alerts: AlertRisk[] = [];
  public documents: Document[] = [];
  public auditEvents: AuditEvent[] = [];
  public dealOpportunities: DealLabOpportunity[] = [];

  private constructor() {
    this.resetToFixtures();
  }

  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  public resetToFixtures(): void {
    this.projects = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
    this.loans = JSON.parse(JSON.stringify(INITIAL_LOANS));
    this.budgetVersions = JSON.parse(JSON.stringify(INITIAL_BUDGET_VERSIONS));
    this.budgetLines = JSON.parse(JSON.stringify(INITIAL_BUDGET_LINES));
    this.expenses = JSON.parse(JSON.stringify(INITIAL_EXPENSES));
    this.draws = JSON.parse(JSON.stringify(INITIAL_DRAWS));
    this.drawLines = JSON.parse(JSON.stringify(INITIAL_DRAW_LINES));
    this.activities = JSON.parse(JSON.stringify(INITIAL_ACTIVITIES));
    this.inspections = JSON.parse(JSON.stringify(INITIAL_INSPECTIONS));
    this.dealOpportunities = JSON.parse(JSON.stringify(INITIAL_DEAL_OPPORTUNITIES));
    this.alerts = [];
    this.documents = [];
    this.auditEvents = [];
  }

  public recordAuditEvent(
    actorRole: UserRole | string,
    actorName: string,
    entity: string,
    entityId: string,
    field: string,
    oldVal: string,
    newVal: string,
    source: string
  ): void {
    const event: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actor_role: actorRole,
      actor_name: actorName,
      entity,
      entity_id: entityId,
      field,
      old_value: oldVal,
      new_value: newVal,
      source,
      timestamp: new Date().toISOString(),
    };
    this.auditEvents.unshift(event);
  }

  public getProjectFourTruths(projectId: string): ProjectFourTruthsSummary {
    let project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      // Fallback template for dynamically created project ids
      project = this.projects[0] || {
        id: projectId,
        name: 'Project ' + projectId,
        address: '100 Construction Way',
        gc_name: 'General Contractor LLC',
        lender_name: 'Commercial Bank',
        units: 1,
        target_budget: 1000000,
        start_date: '2026-01-01',
        expected_completion: '2026-12-31',
        status: 'ACTIVE',
        created_by_user_id: 'user-dev-1',
        created_at: new Date().toISOString(),
      };
    }

    const bvs = this.budgetVersions.filter((bv) => bv.project_id === projectId);
    const bls = this.budgetLines.filter((bl) => bl.project_id === projectId);
    const exps = this.expenses.filter((e) => e.project_id === projectId);
    const drs = this.draws.filter((d) => d.project_id === projectId);
    const dls = this.drawLines.filter((dl) => dl.project_id === projectId);
    const acts = this.activities.filter((a) => a.project_id === projectId);
    const insps = this.inspections.filter((i) => i.project_id === projectId);
    const ln = this.loans.find((l) => l.project_id === projectId);

    const summary = computeProjectFourTruths(project, {
      budgetVersions: bvs,
      budgetLines: bls,
      changeOrders: [],
      expenses: exps,
      draws: drs,
      drawLines: dls,
      activities: acts,
      inspections: insps,
      loan: ln,
    });

    return summary;
  }

  public getPortfolioSummary(): PortfolioSummaryDTO {
    const projectSummaries = this.projects.map((p) => {
      const truth = this.getProjectFourTruths(p.id);
      return {
        id: p.id,
        name: p.name,
        address: p.address,
        status: p.status,
        budget: truth.total_current_budget,
        spend: truth.total_actual_spend,
        funded: truth.total_amount_funded,
        cashExposure: truth.developer_cash_exposure,
        progressPct: Math.round(truth.overall_progress_pct * 100),
        delayDays: truth.schedule_delay_days,
        alertsCount: truth.active_alerts.length,
      };
    });

    const totalPortfolioBudget = projectSummaries.reduce((sum, p) => sum + p.budget, 0);
    const totalPortfolioSpend = projectSummaries.reduce((sum, p) => sum + p.spend, 0);
    const totalPortfolioFunded = projectSummaries.reduce((sum, p) => sum + p.funded, 0);
    const totalCashExposure = projectSummaries.reduce((sum, p) => sum + p.cashExposure, 0);
    const activeProjects = projectSummaries.filter((p) => p.status === 'ACTIVE').length;
    const completedProjects = projectSummaries.filter((p) => p.status === 'COMPLETED').length;
    const avgProgress = projectSummaries.length > 0
      ? Math.round(projectSummaries.reduce((sum, p) => sum + p.progressPct, 0) / projectSummaries.length)
      : 0;
    const totalAlerts = projectSummaries.reduce((sum, p) => sum + p.alertsCount, 0);

    return {
      totalProjects: this.projects.length,
      activeProjects,
      completedProjects,
      totalPortfolioBudget,
      totalPortfolioSpend,
      totalPortfolioFunded,
      totalCashExposure,
      averageProgressPct: avgProgress,
      activeRisksCount: totalAlerts,
      projects: projectSummaries,
    };
  }
}

export const mockStore = MockDataStore.getInstance();
