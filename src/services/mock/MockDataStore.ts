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

  public ensureProjectDataset(projectId: string): void {
    if (!this.projects.some((p) => p.id === projectId)) {
      const dynamicProject: Project = {
        id: projectId,
        name: `Project ${projectId.replace(/^proj-/, '').replace(/-/g, ' ')}`,
        address: '100 Construction Way',
        gc_name: 'General Contractor LLC',
        lender_name: 'Commercial Bank',
        units: 2,
        target_budget: 1200000,
        start_date: '2026-01-01',
        expected_completion: '2026-12-31',
        status: 'ACTIVE',
        created_by_user_id: 'user-dev-1',
        created_at: new Date().toISOString(),
      };
      this.projects.push(dynamicProject);
    }

    const proj = this.projects.find((p) => p.id === projectId)!;
    const budget = proj.target_budget || 1000000;

    if (!this.budgetVersions.some((bv) => bv.project_id === projectId)) {
      const versionId = `bv-${projectId}-v1`;
      this.budgetVersions.push({
        id: versionId,
        project_id: projectId,
        version_number: 1,
        status: 'APPROVED',
        approved_at: proj.created_at,
        approved_by_user_id: 'user-cfo-1',
        notes: `GMP Master Budget ${proj.lender_name || 'Bank'}`,
        created_at: proj.created_at,
      });

      const categories = [
        { name: 'Pre-construction & Permits', code: '01-100', pct: 0.05 },
        { name: 'Site Work & Demolition', code: '02-100', pct: 0.07 },
        { name: 'Foundation & Concrete', code: '03-300', pct: 0.18 },
        { name: 'Framing & Trusses', code: '06-100', pct: 0.26 },
        { name: 'Plumbing & MEP', code: '22-000', pct: 0.12 },
        { name: 'Electrical Systems', code: '26-000', pct: 0.10 },
        { name: 'Exterior & Roofing', code: '07-100', pct: 0.10 },
        { name: 'Interior Finishes', code: '09-600', pct: 0.07 },
        { name: 'Contingency', code: '00-500', pct: 0.05 },
      ];

      categories.forEach((cat, idx) => {
        this.budgetLines.push({
          id: `bl-${projectId}-${idx + 1}`,
          project_id: projectId,
          version_id: versionId,
          category: cat.name,
          cost_code: cat.code,
          original_amount: Math.round(budget * cat.pct),
        });
      });
    }

    if (!this.loans.some((l) => l.project_id === projectId)) {
      this.loans.push({
        id: `loan-${projectId}`,
        project_id: projectId,
        lender_name: proj.lender_name || 'Commercial Bank',
        loan_amount: Math.round(budget * 0.75),
        interest_rate: 0.0875,
        term_months: 18,
        holdback_amount: Math.round(budget * 0.05),
        current_balance: Math.round(budget * 0.40),
        closing_date: proj.start_date,
        entered_by_role: 'CFO',
      });
    }

    if (!this.activities.some((a) => a.project_id === projectId)) {
      this.activities.push(
        { id: `sa-${projectId}-1`, project_id: projectId, milestone: 'Plans & Permits', trade: 'Architecture / Permits', planned_start: '2026-01-01', planned_end: '2026-02-01', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-02-01', entered_by_role: 'PM' },
        { id: `sa-${projectId}-2`, project_id: projectId, milestone: 'Foundation & Earthwork', trade: 'Concrete', planned_start: '2026-02-01', planned_end: '2026-03-15', verified_progress_pct: 1.0, last_verified_source: 'inspection_result', last_verified_date: '2026-03-15', entered_by_role: 'PM' },
        { id: `sa-${projectId}-3`, project_id: projectId, milestone: 'Structural Framing', trade: 'Carpentry', planned_start: '2026-03-15', planned_end: '2026-05-30', verified_progress_pct: 0.50, last_verified_source: 'PM_confirmation', last_verified_date: '2026-04-15', entered_by_role: 'PM' },
      );
    }
  }

  public getProjectFourTruths(projectId: string): ProjectFourTruthsSummary {
    this.ensureProjectDataset(projectId);
    const project = this.projects.find((p) => p.id === projectId)!;

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
