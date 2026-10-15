import {
  UserProfile,
  Project,
  ProjectDashboard,
  DocumentItem,
  ExtractionField,
  BudgetLine,
  ChangeOrder,
  ContingencyMovement,
  DrawItem,
  MilestoneItem,
  MilestoneEvidence,
  ScheduleForecast,
  FinancialAccount,
  StatementPeriod,
  FinancialTransaction,
  SpendRecord,
  ReconciliationMatch,
  InterProjectTransfer,
  InvestorUpdateSnapshot,
  AlertItem,
  DataQualityIssue,
  AuditEvent,
  OnboardingSession,
  OnboardingTask,
  ConfigurationVersion,
  ProjectReadiness,
  ProjectInvitation,
  ImportBatch,
  ProjectEconomics,
  ProFormaLineItem,
  InvestorContribution,
  InvestorDistribution,
  DispositionUnit,
  CloseoutReport,
  PostCloseoutAdjustment,
  GCSubmission,
  NotificationItem,
  TeamMember,
  ReportExportItem,
  UserRole,
} from "@/lib/types";
import {
  SEED_USERS,
  SEED_PROJECTS,
  SEED_DASHBOARDS,
  SEED_DOCUMENTS,
  SEED_EXTRACTIONS,
  SEED_BUDGET_LINES,
  SEED_CHANGE_ORDERS,
  SEED_CONTINGENCY_MOVEMENTS,
  SEED_FINANCIAL_ACCOUNTS,
  SEED_STATEMENT_PERIODS,
  SEED_TRANSACTIONS,
  SEED_RECONCILIATION_MATCHES,
  SEED_INTER_PROJECT_TRANSFERS,
  SEED_DRAWS,
  SEED_MILESTONES,
  SEED_SCHEDULE_FORECASTS,
  SEED_ECONOMICS,
  SEED_DISPOSITION_UNITS,
  SEED_INVESTOR_CONTRIBUTIONS,
  SEED_INVESTOR_DISTRIBUTIONS,
  SEED_CLOSEOUT_REPORTS,
  SEED_ALERTS,
  SEED_DATA_QUALITY_ISSUES,
  SEED_AUDIT_EVENTS,
  SEED_NOTIFICATIONS,
  SEED_TEAM_MEMBERS,
  SEED_ONBOARDING_SESSION,
  SEED_ONBOARDING_TASKS,
  SEED_PROJECT_READINESS,
  SEED_GC_SUBMISSIONS,
  SEED_INVESTOR_UPDATES,
  SEED_EXPORTS,
} from "./seed-data";

interface MockDbState {
  users: UserProfile[];
  currentUserId: string | null;
  projects: Project[];
  activeProjectId: string;
  dashboards: Record<string, ProjectDashboard>;
  documents: DocumentItem[];
  extractions: Record<string, ExtractionField[]>;
  budgetLines: Record<string, BudgetLine[]>;
  changeOrders: Record<string, ChangeOrder[]>;
  contingencyMovements: Record<string, ContingencyMovement[]>;
  financialAccounts: FinancialAccount[];
  statementPeriods: StatementPeriod[];
  transactions: Record<string, FinancialTransaction[]>;
  reconciliationMatches: Record<string, ReconciliationMatch[]>;
  interProjectTransfers: InterProjectTransfer[];
  draws: Record<string, DrawItem[]>;
  milestones: Record<string, MilestoneItem[]>;
  scheduleForecasts: Record<string, ScheduleForecast>;
  economics: Record<string, ProjectEconomics>;
  dispositionUnits: Record<string, DispositionUnit[]>;
  investorContributions: Record<string, InvestorContribution[]>;
  investorDistributions: Record<string, InvestorDistribution[]>;
  closeoutReports: Record<string, CloseoutReport>;
  alerts: Record<string, AlertItem[]>;
  dataQualityIssues: Record<string, DataQualityIssue[]>;
  auditEvents: AuditEvent[];
  notifications: NotificationItem[];
  teamMembers: Record<string, TeamMember[]>;
  onboardingSession: OnboardingSession;
  onboardingTasks: Record<string, OnboardingTask[]>;
  projectReadiness: Record<string, ProjectReadiness>;
  gcSubmissions: Record<string, GCSubmission[]>;
  investorUpdates: Record<string, InvestorUpdateSnapshot[]>;
  exports: Record<string, ReportExportItem[]>;
  invitations: ProjectInvitation[];
  importBatches: Record<string, ImportBatch[]>;
}

const STORAGE_KEY = "groundup_mock_db_v2";

export function deduplicateProjects(projects: Project[]): Project[] {
  if (!Array.isArray(projects)) return [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const result: Project[] = [];

  for (const p of projects) {
    if (!p || !p.id) continue;
    const normName = (p.name || "").trim().toLowerCase();
    const normAddr = (p.address || "").trim().toLowerCase();
    const nameKey = `${normName}::${normAddr}`;

    if (seenIds.has(p.id)) continue;
    if (normName && seenNames.has(nameKey)) continue;

    seenIds.add(p.id);
    if (normName) seenNames.add(nameKey);
    result.push(p);
  }

  return result;
}

class MockStore {
  private state: MockDbState;

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): MockDbState {
    const isBrowser = typeof window !== "undefined";
    if (isBrowser) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
            parsed.projects = deduplicateProjects(parsed.projects);
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            } catch {}
            return parsed;
          }
        }
      } catch {
        // Fallback to fresh state
      }
    }

    return {
      users: JSON.parse(JSON.stringify(SEED_USERS)),
      currentUserId: "user-marcus",
      projects: JSON.parse(JSON.stringify(SEED_PROJECTS)),
      activeProjectId: "df16b577-3585-4fb0-a13a-ffadaca73e0f",
      dashboards: JSON.parse(JSON.stringify(SEED_DASHBOARDS)),
      documents: JSON.parse(JSON.stringify(SEED_DOCUMENTS)),
      extractions: JSON.parse(JSON.stringify(SEED_EXTRACTIONS)),
      budgetLines: JSON.parse(JSON.stringify(SEED_BUDGET_LINES)),
      changeOrders: JSON.parse(JSON.stringify(SEED_CHANGE_ORDERS)),
      contingencyMovements: JSON.parse(JSON.stringify(SEED_CONTINGENCY_MOVEMENTS)),
      financialAccounts: JSON.parse(JSON.stringify(SEED_FINANCIAL_ACCOUNTS)),
      statementPeriods: JSON.parse(JSON.stringify(SEED_STATEMENT_PERIODS)),
      transactions: JSON.parse(JSON.stringify(SEED_TRANSACTIONS)),
      reconciliationMatches: JSON.parse(JSON.stringify(SEED_RECONCILIATION_MATCHES)),
      interProjectTransfers: JSON.parse(JSON.stringify(SEED_INTER_PROJECT_TRANSFERS)),
      draws: JSON.parse(JSON.stringify(SEED_DRAWS)),
      milestones: JSON.parse(JSON.stringify(SEED_MILESTONES)),
      scheduleForecasts: JSON.parse(JSON.stringify(SEED_SCHEDULE_FORECASTS)),
      economics: JSON.parse(JSON.stringify(SEED_ECONOMICS)),
      dispositionUnits: JSON.parse(JSON.stringify(SEED_DISPOSITION_UNITS)),
      investorContributions: JSON.parse(JSON.stringify(SEED_INVESTOR_CONTRIBUTIONS)),
      investorDistributions: JSON.parse(JSON.stringify(SEED_INVESTOR_DISTRIBUTIONS)),
      closeoutReports: JSON.parse(JSON.stringify(SEED_CLOSEOUT_REPORTS)),
      alerts: JSON.parse(JSON.stringify(SEED_ALERTS)),
      dataQualityIssues: JSON.parse(JSON.stringify(SEED_DATA_QUALITY_ISSUES)),
      auditEvents: JSON.parse(JSON.stringify(SEED_AUDIT_EVENTS)),
      notifications: JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)),
      teamMembers: JSON.parse(JSON.stringify(SEED_TEAM_MEMBERS)),
      onboardingSession: JSON.parse(JSON.stringify(SEED_ONBOARDING_SESSION)),
      onboardingTasks: JSON.parse(JSON.stringify(SEED_ONBOARDING_TASKS)),
      projectReadiness: JSON.parse(JSON.stringify(SEED_PROJECT_READINESS)),
      gcSubmissions: JSON.parse(JSON.stringify(SEED_GC_SUBMISSIONS)),
      investorUpdates: JSON.parse(JSON.stringify(SEED_INVESTOR_UPDATES)),
      exports: JSON.parse(JSON.stringify(SEED_EXPORTS)),
      invitations: [
        {
          id: "inv-01",
          organization_id: "org-vance-dev",
          project_id: "df16b577-3585-4fb0-a13a-ffadaca73e0f",
          project_name: "73 Broadway",
          organization_name: "Vance Development LLC",
          email: "estimator@apexconstruction.com",
          role: "GC",
          scope: "PROJECT",
          invited_by: "Marcus Vance",
          expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
          status: "PENDING",
        },
      ],
      importBatches: {},
    };
  }

  private save(): void {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // quota exceeded or private mode, state remains in memory
      }
    }
  }

  // -------------------------------------------------------------
  // Users & Auth
  // -------------------------------------------------------------
  getCurrentUser(): UserProfile {
    const user = this.state.users.find((u) => u.id === this.state.currentUserId);
    return user || this.state.users[0];
  }

  setCurrentUser(userId: string | null): void {
    this.state.currentUserId = userId;
    this.save();
  }

  getUserByEmail(email: string): UserProfile | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Partial<UserProfile>): UserProfile {
    const id = `user-${Date.now()}`;
    const name = userData.name || `${(userData as any).first_name || ""} ${(userData as any).last_name || ""}`.trim() || "GroundUp User";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "GU";

    const newUser: UserProfile = {
      id,
      organization_id: userData.organization_id || "org-vance-dev",
      name,
      email: userData.email || `user-${Date.now()}@example.com`,
      role: userData.role || "OWNER",
      title: userData.title || "Principal",
      company: userData.company || "Development Firm",
      avatarInitials: initials,
      is_active: true,
      project_memberships: userData.project_memberships || this.state.projects.map((p) => ({
        project_id: p.id,
        role: userData.role || "OWNER",
      })),
      permissions: ["all"],
    };

    this.state.users.push(newUser);
    this.state.currentUserId = id;
    this.save();
    return newUser;
  }

  // -------------------------------------------------------------
  // Projects
  // -------------------------------------------------------------
  getProjects(): Project[] {
    const currentUser = this.getCurrentUser();
    let rawList: Project[] = [];

    // If user is Kunal, strict project isolation applies!
    if (currentUser?.email === "kunal@builderscapital.com") {
      const allowedIds = currentUser.project_memberships.map((m) => m.project_id);
      rawList = this.state.projects
        .filter((p) => allowedIds.includes(p.id))
        .map((p) => {
          const mem = currentUser.project_memberships.find((m) => m.project_id === p.id);
          return {
            ...p,
            role_on_project: (mem?.role as UserRole) || p.role_on_project,
          };
        });
    } else {
      rawList = this.state.projects.map((p) => {
        const mem = currentUser?.project_memberships?.find((m) => m.project_id === p.id);
        return {
          ...p,
          role_on_project: (mem?.role as UserRole) || p.role_on_project || currentUser?.role || "OWNER",
        };
      });
    }

    return deduplicateProjects(rawList);
  }

  getProjectById(projectId: string): Project | undefined {
    return this.getProjects().find((p) => p.id === projectId);
  }

  createProject(projectData: Partial<Project>): Project {
    const normName = (projectData.name || "").trim().toLowerCase();
    const existing = this.state.projects.find(
      (p) => (p.name || "").trim().toLowerCase() === normName
    );

    if (existing) {
      Object.assign(existing, projectData, {
        updated_at: new Date().toISOString(),
      });
      this.state.activeProjectId = existing.id;
      this.save();
      return existing;
    }

    const id = projectData.id || `proj-${Date.now()}`;
    const newProject: Project = {
      id,
      organization_id: projectData.organization_id || "org-vance-dev",
      name: projectData.name || "New Development Project",
      project_entity: projectData.project_entity || `${projectData.name || "New"} LLC`,
      address: projectData.address || "100 Construction Way",
      lifecycle_stage: projectData.lifecycle_stage || "PRE_CONSTRUCTION",
      contract_model: projectData.contract_model || "COST_PLUS",
      status: "ACTIVE",
      currency: "USD",
      loan_commitment: projectData.loan_commitment || "100000000",
      started_at: new Date().toISOString(),
      target_completion_at: new Date(Date.now() + 365 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
      role_on_project: "OWNER",
      health_status: "HEALTHY",
      forecast_profit: 50000000,
      open_exceptions_count: 0,
      progress_pct: 10,
    };

    this.state.projects.unshift(newProject);
    this.state.activeProjectId = id;

    const cur = this.getCurrentUser() || this.state.users[0] || {
      name: "Alex Morgan",
      email: "alex@vancedev.com",
      role: "OWNER",
      title: "Principal Developer",
      company: "Vance Development",
      avatarInitials: "AM",
    };

    // Add membership to all registered users (Owner gets full access)
    this.state.users.forEach((u) => {
      u.project_memberships = u.project_memberships || [];
      if (!u.project_memberships.some((m) => m.project_id === id)) {
        u.project_memberships.push({ project_id: id, role: u.role || "OWNER" });
      }
    });

    // Initialize mock structures for new project
    this.state.dashboards[id] = {
      project: newProject,
      kpis: {
        forecast_profit: { amount: "50000000", currency: "USD", basis: "Initial underwriting", status: "success" },
        cash_gap: { amount: "0", currency: "USD", basis: "Zero variance", status: "success" },
        contingency_left: { amount: "10000000", total_contingency: "10000000", currency: "USD", basis: "Contingency intact", status: "success" },
        forecast_completion: { date: newProject.target_completion_at, basis: "Underwritten target", delay_days: 0 },
      },
      forecast_table: [],
      draw_summary: {
        latest_draw_number: 1,
        status: "DRAFT",
        requested: "0",
        recommended: "0",
        approved: "0",
        cleared_funded: "0",
        shortfall: "0",
        unallocated_deposit: "0",
      },
      open_exceptions: [],
      schedule_risk: { at_risk_milestone: "Mobilization", delay_days: 0, carry_cost_impact: "$0" },
    };

    this.state.budgetLines[id] = [
      {
        id: `bl-${id}-1`,
        budget_id: `b-${id}`,
        code: "01.00",
        name: "General Conditions & Plans",
        category: "Soft Costs",
        original_amount: "5000000",
        current_approved_amount: "5000000",
        actual_spend: "0",
        committed_amount: "5000000",
        is_draw_eligible: true,
        sort_order: 1,
      },
      {
        id: `bl-${id}-2`,
        budget_id: `b-${id}`,
        code: "02.00",
        name: "Excavation & Sitework",
        category: "Hard Costs",
        original_amount: "15000000",
        current_approved_amount: "15000000",
        actual_spend: "0",
        committed_amount: "15000000",
        is_draw_eligible: true,
        sort_order: 2,
      },
      {
        id: `bl-${id}-3`,
        budget_id: `b-${id}`,
        code: "07.00",
        name: "Contingency Reserve",
        category: "Contingency",
        original_amount: "10000000",
        current_approved_amount: "10000000",
        actual_spend: "0",
        committed_amount: "0",
        is_draw_eligible: false,
        sort_order: 3,
      },
    ];

    this.state.changeOrders[id] = [];
    this.state.contingencyMovements[id] = [];
    this.state.transactions[id] = [];
    this.state.reconciliationMatches[id] = [];
    this.state.draws[id] = [];
    this.state.milestones[id] = [
      {
        id: `ms-${id}-1`,
        project_id: id,
        name: "Permits & Architectural Approval",
        code: "M-01",
        planned_start: new Date().toISOString(),
        planned_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        forecast_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        percent_complete: 20,
        status: "IN_PROGRESS",
        critical_path: true,
        dependencies: [],
        evidence_count: 1,
      } as any,
    ];
    this.state.alerts[id] = [];
    this.state.dataQualityIssues[id] = [];
    this.state.teamMembers[id] = [
      {
        id: `tm-${id}-1`,
        project_id: id,
        name: cur.name,
        email: cur.email,
        role: cur.role,
        title: cur.title,
        company: cur.company,
        avatarInitials: cur.avatarInitials,
        status: "ACTIVE",
        added_at: new Date().toISOString(),
      },
    ];

    this.save();
    return newProject;
  }

  checkDuplicates(data: { name: string; address: string; project_entity?: string }) {
    const normName = data.name.trim().toLowerCase();
    const normAddr = data.address.trim().toLowerCase();
    const matches = this.state.projects.filter(
      (p) =>
        p.name.toLowerCase().includes(normName) ||
        normName.includes(p.name.toLowerCase()) ||
        p.address.toLowerCase().includes(normAddr) ||
        normAddr.includes(p.address.toLowerCase())
    );

    return {
      has_matches: matches.length > 0,
      matches: matches.map((m) => ({
        id: m.id,
        name: m.name,
        address: m.address,
        project_entity: m.project_entity,
        lifecycle_stage: m.lifecycle_stage,
        similarity_reason: "Matching street address or project entity",
      })),
    };
  }

  switchProject(projectId: string): Project | undefined {
    this.state.activeProjectId = projectId;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("groundup_active_project_id", projectId);
      window.localStorage.setItem("groundup_last_project_id", projectId);
    }
    this.save();
    return this.getProjectById(projectId);
  }

  getActiveProjectId(): string {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("groundup_active_project_id") || window.localStorage.getItem("groundup_last_project_id");
      if (stored && this.state.projects.some((p) => p.id === stored)) {
        return stored;
      }
    }
    return this.state.activeProjectId || this.state.projects[0]?.id || "df16b577-3585-4fb0-a13a-ffadaca73e0f";
  }

  getDashboard(projectId: string): ProjectDashboard {
    const dashboard = this.state.dashboards[projectId];
    if (dashboard) return dashboard;

    const project = this.getProjectById(projectId) || this.state.projects[0];
    return {
      project,
      kpis: {
        forecast_profit: { amount: "48500000", currency: "USD", basis: "Underwriting forecast", status: "success" },
        cash_gap: { amount: "0", currency: "USD", basis: "No cash gap", status: "success" },
        contingency_left: { amount: "5500000", total_contingency: "10000000", currency: "USD", basis: "Contingency available", status: "warning" },
        forecast_completion: { date: project.target_completion_at, basis: "Schedule target", delay_days: 0 },
      },
      forecast_table: [],
      draw_summary: {
        latest_draw_number: 1,
        status: "ACTIVE",
        requested: "0",
        recommended: "0",
        approved: "0",
        cleared_funded: "0",
        shortfall: "0",
        unallocated_deposit: "0",
      },
      open_exceptions: [],
      schedule_risk: { at_risk_milestone: "None", delay_days: 0, carry_cost_impact: "$0" },
    };
  }

  // -------------------------------------------------------------
  // Documents
  // -------------------------------------------------------------
  getDocuments(projectId?: string): DocumentItem[] {
    if (projectId) {
      return this.state.documents.filter((d) => d.project_id === projectId);
    }
    return this.state.documents;
  }

  getDocumentById(documentId: string): DocumentItem | undefined {
    return this.state.documents.find((d) => d.id === documentId);
  }

  createDocument(docData: {
    filename: string;
    mime_type: string;
    project_id: string;
    document_type: DocumentItem["document_type"];
    notes?: string;
  }): DocumentItem {
    const id = `doc-${Date.now()}`;
    const user = this.getCurrentUser();
    const newDoc: DocumentItem = {
      id,
      organization_id: "org-vance-dev",
      project_id: docData.project_id,
      original_filename: docData.filename,
      mime_type: docData.mime_type,
      document_type: docData.document_type,
      document_date: new Date().toISOString().split("T")[0],
      ingestion_status: "READY_FOR_REVIEW",
      uploaded_by: user.id,
      uploader_name: user.name,
      uploaded_at: new Date().toISOString(),
      pages_count: 1,
      notes: docData.notes,
    };

    this.state.documents.unshift(newDoc);

    // Provide default extractions
    this.state.extractions[id] = [
      {
        id: `ext-${Date.now()}-1`,
        document_id: id,
        field_name: "Document Name",
        raw_value: docData.filename,
        normalized_value: docData.filename,
        confidence: 0.99,
        citation: { page_number: 1 },
        status: "ACCEPTED",
      },
      {
        id: `ext-${Date.now()}-2`,
        document_id: id,
        field_name: "Document Type",
        raw_value: docData.document_type,
        normalized_value: docData.document_type,
        confidence: 0.95,
        citation: { page_number: 1 },
        status: "ACCEPTED",
      },
    ];

    this.save();
    return newDoc;
  }

  getExtractions(documentId: string): ExtractionField[] {
    return this.state.extractions[documentId] || [
      {
        id: `ext-${documentId}-1`,
        document_id: documentId,
        field_name: "Project Name",
        raw_value: "73 Broadway",
        normalized_value: "73 Broadway",
        confidence: 0.98,
        citation: { page_number: 1 },
        status: "ACCEPTED",
      },
      {
        id: `ext-${documentId}-2`,
        document_id: documentId,
        field_name: "Invoice Total",
        raw_value: "$34,250.00",
        normalized_value: "$34,250.00",
        confidence: 0.96,
        citation: { page_number: 1 },
        status: "PROPOSED",
      },
    ];
  }

  decideExtractionField(
    fieldId: string,
    decision: "ACCEPT" | "EDIT" | "REJECT",
    normalizedValue?: string,
    rationale?: string
  ): ExtractionField {
    for (const docId of Object.keys(this.state.extractions)) {
      const field = this.state.extractions[docId].find((f) => f.id === fieldId);
      if (field) {
        field.status = decision === "ACCEPT" ? "ACCEPTED" : decision === "EDIT" ? "EDITED" : "REJECTED";
        if (normalizedValue !== undefined) field.normalized_value = normalizedValue;
        if (rationale !== undefined) field.decision_rationale = rationale;
        this.save();
        return field;
      }
    }
    return {
      id: fieldId,
      document_id: "doc-unknown",
      field_name: "Field",
      raw_value: normalizedValue || "",
      normalized_value: normalizedValue || "",
      confidence: 1,
      citation: { page_number: 1 },
      status: decision === "ACCEPT" ? "ACCEPTED" : "EDITED",
      decision_rationale: rationale,
    };
  }

  completeReview(documentId: string): DocumentItem {
    const doc = this.getDocumentById(documentId);
    if (doc) {
      doc.ingestion_status = "REVIEWED";
      this.save();
      return doc;
    }
    throw new Error("Document not found");
  }

  markDocument(
    documentId: string,
    markType: "DUPLICATE" | "MISFILED" | "IRRELEVANT" | "NOT_APPLICABLE",
    rationale?: string,
    duplicateOfDocumentId?: string
  ): DocumentItem {
    const doc = this.getDocumentById(documentId);
    if (doc) {
      if (markType === "DUPLICATE") {
        doc.ingestion_status = "QUARANTINED";
        doc.duplicate_of_document_id = duplicateOfDocumentId;
      } else if (markType === "MISFILED") {
        doc.ingestion_status = "QUARANTINED";
      }
      if (rationale) doc.notes = rationale;
      this.save();
      return doc;
    }
    throw new Error("Document not found");
  }

  assignDocumentProject(documentId: string, projectId: string, rationale?: string): DocumentItem {
    const doc = this.getDocumentById(documentId);
    if (doc) {
      doc.project_id = projectId;
      doc.ingestion_status = "READY_FOR_REVIEW";
      if (rationale) doc.notes = rationale;
      this.save();
      return doc;
    }
    throw new Error("Document not found");
  }

  // -------------------------------------------------------------
  // Budget & Change Orders
  // -------------------------------------------------------------
  getBudgetLines(projectId: string): BudgetLine[] {
    return this.state.budgetLines[projectId] || [];
  }

  getChangeOrders(projectId: string): ChangeOrder[] {
    return this.state.changeOrders[projectId] || [];
  }

  createChangeOrder(
    projectId: string,
    data: {
      title: string;
      scope_description: string;
      requested_amount: string;
      target_budget_line_id: string;
      funding_source: ChangeOrder["funding_source"];
    }
  ): ChangeOrder {
    const orders = this.state.changeOrders[projectId] || [];
    const coNum = `CO-${String(orders.length + 1).padStart(3, "0")}`;
    const user = this.getCurrentUser();
    const newCO: ChangeOrder = {
      id: `co-${Date.now()}`,
      project_id: projectId,
      change_order_number: coNum,
      title: data.title,
      scope_description: data.scope_description,
      requested_amount: data.requested_amount,
      status: "SUBMITTED",
      target_budget_line_id: data.target_budget_line_id,
      funding_source: data.funding_source,
      requested_by: user.id,
      requester_name: user.name,
      requester_role: user.role,
      requested_at: new Date().toISOString(),
    };

    orders.unshift(newCO);
    this.state.changeOrders[projectId] = orders;
    this.save();
    return newCO;
  }

  approveChangeOrder(changeOrderId: string, approvedAmount?: string): ChangeOrder {
    for (const projectId of Object.keys(this.state.changeOrders)) {
      const co = this.state.changeOrders[projectId].find((c) => c.id === changeOrderId);
      if (co) {
        co.status = "APPROVED";
        co.approved_amount = approvedAmount || co.requested_amount;
        co.approved_at = new Date().toISOString();
        co.approved_by = this.getCurrentUser().name;

        // If funded from contingency, adjust target budget line and contingency
        const lines = this.state.budgetLines[projectId] || [];
        const targetLine = lines.find((l) => l.id === co.target_budget_line_id);
        const contLine = lines.find((l) => l.code === "07.00" || l.category.toLowerCase().includes("contingency"));
        const amt = Number(co.approved_amount);

        if (targetLine) {
          targetLine.current_approved_amount = String(Number(targetLine.current_approved_amount) + amt);
          targetLine.committed_amount = String(Number(targetLine.committed_amount) + amt);
        }
        if (contLine && co.funding_source === "CONTINGENCY") {
          contLine.current_approved_amount = String(Math.max(0, Number(contLine.current_approved_amount) - amt));
        }

        // Record movement
        this.state.contingencyMovements[projectId] = this.state.contingencyMovements[projectId] || [];
        this.state.contingencyMovements[projectId].unshift({
          id: `cm-${Date.now()}`,
          project_id: projectId,
          amount: co.approved_amount,
          source_line_id: contLine?.id,
          destination_line_id: co.target_budget_line_id,
          reason: `${co.change_order_number}: ${co.title}`,
          change_order_id: co.id,
          approved_by: this.getCurrentUser().name,
          approved_at: new Date().toISOString(),
        });

        this.save();
        return co;
      }
    }
    throw new Error("Change order not found");
  }

  rejectChangeOrder(changeOrderId: string, reason: string): ChangeOrder {
    for (const projectId of Object.keys(this.state.changeOrders)) {
      const co = this.state.changeOrders[projectId].find((c) => c.id === changeOrderId);
      if (co) {
        co.status = "REJECTED";
        co.rejection_reason = reason;
        this.save();
        return co;
      }
    }
    throw new Error("Change order not found");
  }

  moveContingency(
    projectId: string,
    amount: string,
    destinationLineId: string,
    reason: string
  ): ContingencyMovement {
    const lines = this.state.budgetLines[projectId] || [];
    const dest = lines.find((l) => l.id === destinationLineId);
    const cont = lines.find((l) => l.code === "07.00" || l.category.toLowerCase().includes("contingency"));
    const numAmt = Number(amount);

    if (dest) dest.current_approved_amount = String(Number(dest.current_approved_amount) + numAmt);
    if (cont) cont.current_approved_amount = String(Math.max(0, Number(cont.current_approved_amount) - numAmt));

    const mov: ContingencyMovement = {
      id: `cm-${Date.now()}`,
      project_id: projectId,
      amount,
      source_line_id: cont?.id,
      destination_line_id: destinationLineId,
      reason,
      approved_by: this.getCurrentUser().name,
      approved_at: new Date().toISOString(),
    };

    this.state.contingencyMovements[projectId] = this.state.contingencyMovements[projectId] || [];
    this.state.contingencyMovements[projectId].unshift(mov);
    this.save();
    return mov;
  }

  getContingencyMovements(projectId: string): ContingencyMovement[] {
    return this.state.contingencyMovements[projectId] || [];
  }

  linkMilestoneToBudgetLine(budgetLineId: string, milestoneId: string | null): BudgetLine {
    for (const projectId of Object.keys(this.state.budgetLines)) {
      const line = this.state.budgetLines[projectId].find((l) => l.id === budgetLineId);
      if (line) {
        line.milestone_id = milestoneId;
        this.save();
        return line;
      }
    }
    throw new Error("Budget line not found");
  }

  // -------------------------------------------------------------
  // Spend & Reconciliation
  // -------------------------------------------------------------
  getFinancialAccounts(): FinancialAccount[] {
    return this.state.financialAccounts;
  }

  getStatementPeriods(accountId?: string): StatementPeriod[] {
    if (accountId) {
      return this.state.statementPeriods.filter((sp) => sp.financial_account_id === accountId);
    }
    return this.state.statementPeriods;
  }

  signoffStatementPeriod(periodId: string, waiverReason?: string): StatementPeriod {
    const sp = this.state.statementPeriods.find((p) => p.id === periodId);
    if (sp) {
      sp.reconciled_status = "RECONCILED";
      sp.reconciled_by = this.getCurrentUser().name;
      sp.reconciled_at = new Date().toISOString();
      if (waiverReason) sp.coverage_status = "WAIVED";
      this.save();
      return sp;
    }
    throw new Error("Statement period not found");
  }

  getTransactions(projectId: string): FinancialTransaction[] {
    return this.state.transactions[projectId] || [];
  }

  linkInvoice(transactionId: string, documentId: string, notes?: string): FinancialTransaction {
    for (const projectId of Object.keys(this.state.transactions)) {
      const tx = this.state.transactions[projectId].find((t) => t.id === transactionId);
      if (tx) {
        tx.document_id = documentId;
        tx.cleared_status = "CLEARED";
        if (notes) tx.memo = `${tx.memo} [${notes}]`;
        this.save();
        return tx;
      }
    }
    throw new Error("Transaction not found");
  }

  classifyCardSettlement(transactionId: string, notes?: string): FinancialTransaction {
    for (const projectId of Object.keys(this.state.transactions)) {
      const tx = this.state.transactions[projectId].find((t) => t.id === transactionId);
      if (tx) {
        tx.is_liability_settlement = true;
        tx.cleared_status = "CLEARED";
        if (notes) tx.memo = `${tx.memo} [Settlement: ${notes}]`;
        this.save();
        return tx;
      }
    }
    throw new Error("Transaction not found");
  }

  getReconciliationQueue(projectId: string): { matches: ReconciliationMatch[]; total_pending: number } {
    const matches = this.state.reconciliationMatches[projectId] || [];
    return {
      matches,
      total_pending: matches.filter((m) => m.status === "PENDING_REVIEW").length,
    };
  }

  decideMatch(
    matchId: string,
    decision: "ACCEPT" | "SPLIT" | "REMAP" | "EXCLUDE" | "MARK_TRANSFER",
    payload?: {
      rationale?: string;
      target_budget_line_id?: string;
      to_project_id?: string;
      allocations?: Array<{ budget_line_id: string; budget_line_name?: string; amount: string }>;
    }
  ): ReconciliationMatch {
    for (const projectId of Object.keys(this.state.reconciliationMatches)) {
      const match = this.state.reconciliationMatches[projectId].find((m) => m.id === matchId);
      if (match) {
        if (decision === "ACCEPT") match.status = "ACCEPTED";
        if (decision === "SPLIT") {
          match.status = "SPLIT";
          match.allocations = payload?.allocations;
        }
        if (decision === "REMAP") {
          match.status = "REMAP";
          match.remap_budget_line_id = payload?.target_budget_line_id;
          match.remap_rationale = payload?.rationale;
        }
        if (decision === "EXCLUDE") {
          match.status = "EXCLUDED";
          match.exclusion_rationale = payload?.rationale;
        }
        if (decision === "MARK_TRANSFER") {
          match.status = "TRANSFER";
        }
        this.save();
        return match;
      }
    }
    throw new Error("Reconciliation match not found");
  }

  getInterProjectTransfers(projectId?: string): InterProjectTransfer[] {
    if (projectId) {
      return this.state.interProjectTransfers.filter(
        (t) => t.from_project_id === projectId || t.to_project_id === projectId
      );
    }
    return this.state.interProjectTransfers;
  }

  createInterProjectTransfer(
    projectId: string,
    data: { to_project_id: string; amount: string; notes: string; transfer_date?: string }
  ): InterProjectTransfer {
    const fromProject = this.getProjectById(projectId);
    const toProject = this.getProjectById(data.to_project_id);
    const ipt: InterProjectTransfer = {
      id: `ipt-${Date.now()}`,
      from_project_id: projectId,
      from_project_name: fromProject?.name || "73 Broadway",
      to_project_id: data.to_project_id,
      to_project_name: toProject?.name || "161 Woodlawn Ave",
      transaction_id: `tx-ipt-${Date.now()}`,
      amount: data.amount,
      transfer_date: data.transfer_date || new Date().toISOString().split("T")[0],
      status: "ACTIVE_TEMPORARY",
      reviewed_by: this.getCurrentUser().name,
      notes: data.notes,
    };
    this.state.interProjectTransfers.unshift(ipt);
    this.save();
    return ipt;
  }

  repayInterProjectTransfer(
    transferId: string,
    repaidAmount: string,
    repaidDate?: string,
    notes?: string
  ): InterProjectTransfer {
    const ipt = this.state.interProjectTransfers.find((t) => t.id === transferId);
    if (ipt) {
      ipt.status = "REPAID";
      ipt.repaid_amount = repaidAmount;
      ipt.repaid_date = repaidDate || new Date().toISOString().split("T")[0];
      if (notes) ipt.notes = `${ipt.notes} [Repaid: ${notes}]`;
      this.save();
      return ipt;
    }
    throw new Error("Transfer not found");
  }

  // -------------------------------------------------------------
  // Draws
  // -------------------------------------------------------------
  getDraws(projectId: string): DrawItem[] {
    return this.state.draws[projectId] || [];
  }

  getDrawById(drawId: string): DrawItem | undefined {
    for (const projectId of Object.keys(this.state.draws)) {
      const d = this.state.draws[projectId].find((item) => item.id === drawId || String(item.draw_number) === drawId);
      if (d) return d;
    }
    return undefined;
  }

  createDraw(
    projectId: string,
    data: {
      draw_number: number;
      period_start: string;
      period_end: string;
      lender_name?: string;
      lines: Array<{ budget_line_id: string; requested_amount: string }>;
    }
  ): DrawItem {
    const draws = this.state.draws[projectId] || [];
    const budgetLines = this.state.budgetLines[projectId] || [];
    const totalReq = data.lines.reduce((s, l) => s + Number(l.requested_amount), 0);

    const newDraw: DrawItem = {
      id: `draw-${Date.now()}`,
      project_id: projectId,
      loan_id: "loan-default",
      draw_number: data.draw_number,
      status: "DRAFT",
      period_start: data.period_start,
      period_end: data.period_end,
      lender_name: data.lender_name || "Columbia Bank Construction Lending",
      requested_amount: String(totalReq),
      recommended_amount: String(totalReq),
      approved_amount: "0",
      funded_amount: "0",
      shortfall_amount: "0",
      lines: data.lines.map((l, idx) => {
        const bl = budgetLines.find((b) => b.id === l.budget_line_id);
        return {
          id: `dl-${Date.now()}-${idx}`,
          draw_id: `draw-${Date.now()}`,
          budget_line_id: l.budget_line_id,
          budget_line_name: bl?.name || "Construction Work Item",
          budget_line_code: bl?.code || "01.00",
          requested_amount: l.requested_amount,
          recommended_amount: l.requested_amount,
          approved_amount: "0",
          funded_amount: "0",
          evidence_status: "VERIFIED",
        };
      }),
      packet_checklist: [
        { id: "c1", requirement: "AIA G702 / G703 Application for Payment", status: "COMPLETE" },
        { id: "c2", requirement: "Lien Waivers for Previous Draw Trades", status: "COMPLETE" },
        { id: "c3", requirement: "Bank Inspector Field Progress Certification", status: "COMPLETE" },
      ],
      portal_summary: {
        vendor_count: data.lines.length,
        total_requested: String(totalReq),
        retainage_withheld: String(Math.round(totalReq * 0.1)),
        net_payable: String(Math.round(totalReq * 0.9)),
      },
    };

    draws.unshift(newDraw);
    this.state.draws[projectId] = draws;
    this.save();
    return newDraw;
  }

  verifyWork(drawId: string, notes?: string): { draw: DrawItem; verified: boolean; verified_by: string; verified_at: string; notes: string } {
    const draw = this.getDrawById(drawId);
    if (draw) {
      draw.pm_verification = {
        verified_by: this.getCurrentUser().name,
        verified_at: new Date().toISOString(),
        inspection_passed: true,
        notes: notes || "Work verified on site walkthrough.",
      };
      this.save();
      return {
        draw,
        verified: true,
        verified_by: draw.pm_verification.verified_by,
        verified_at: draw.pm_verification.verified_at,
        notes: draw.pm_verification.notes,
      };
    }
    throw new Error("Draw not found");
  }

  verifyCost(drawId: string, notes?: string): { draw: DrawItem; costs_verified: boolean; prior_payments_verified: boolean; verified_by: string } {
    const draw = this.getDrawById(drawId);
    if (draw) {
      draw.cfo_verification = {
        verified_by: this.getCurrentUser().name,
        verified_at: new Date().toISOString(),
        costs_verified: true,
        prior_payments_verified: true,
      };
      this.save();
      return {
        draw,
        costs_verified: true,
        prior_payments_verified: true,
        verified_by: draw.cfo_verification.verified_by,
      };
    }
    throw new Error("Draw not found");
  }

  markDrawSubmitted(drawId: string): DrawItem {
    const draw = this.getDrawById(drawId);
    if (draw) {
      draw.status = "SUBMITTED";
      draw.submitted_at = new Date().toISOString();
      this.save();
      return draw;
    }
    throw new Error("Draw not found");
  }

  recordLenderDecision(
    drawId: string,
    data: {
      recommended_amount: string;
      approved_amount: string;
      lender_notes?: string;
      line_decisions?: Array<{ line_id: string; recommended_amount: string; approved_amount: string; lender_notes?: string }>;
    }
  ): DrawItem {
    const draw = this.getDrawById(drawId);
    if (draw) {
      draw.status = Number(data.approved_amount) < Number(draw.requested_amount) ? "PARTIALLY_APPROVED" : "APPROVED";
      draw.approved_amount = data.approved_amount;
      draw.recommended_amount = data.recommended_amount;
      draw.shortfall_amount = String(Math.max(0, Number(draw.requested_amount) - Number(data.approved_amount)));
      draw.lender_decision_notes = data.lender_notes;
      draw.approved_at = new Date().toISOString();
      this.save();
      return draw;
    }
    throw new Error("Draw not found");
  }

  createRevision(drawId: string, data: { revision_reason: string; requested_amount?: string; lines?: any[] }): DrawItem {
    const draw = this.getDrawById(drawId);
    if (draw) {
      draw.revision_label = `Rev ${(draw.revision_label ? Number(draw.revision_label.replace(/\D/g, "")) + 1 : 1)}`;
      draw.status = "DRAFT";
      if (data.requested_amount) draw.requested_amount = data.requested_amount;
      this.save();
      return draw;
    }
    throw new Error("Draw not found");
  }

  resolveCondition(drawId: string, conditionId: string, notes?: string): DrawItem {
    const draw = this.getDrawById(drawId);
    if (draw && draw.conditions) {
      const cond = draw.conditions.find((c) => c.id === conditionId);
      if (cond) {
        cond.status = "SATISFIED";
        if (notes) cond.notes = notes;
        this.save();
      }
      return draw;
    }
    throw new Error("Draw or condition not found");
  }

  getPacket(drawId: string) {
    const draw = this.getDrawById(drawId) || this.state.draws["df16b577-3585-4fb0-a13a-ffadaca73e0f"]?.[2];
    return {
      draw_id: draw?.id || drawId,
      checklist: draw?.packet_checklist || [
        { id: "p-1", requirement: "AIA G702 / G703 Application for Payment", status: "COMPLETE", document_name: "AIA Form (1).xlsx" },
        { id: "p-2", requirement: "Lien Waivers for Previous Draw Trades", status: "COMPLETE", document_name: "Lien_Waivers_Draw_02.pdf" },
        { id: "p-3", requirement: "Bank Inspector Field Progress Certification", status: "COMPLETE", document_name: "73 Broadway - Report #2.pdf" },
      ],
      portal_summary: draw?.portal_summary || {
        vendor_count: 8,
        total_requested: "31500000",
        retainage_withheld: "3150000",
        net_payable: "28350000",
        commitment_id: "COL-2025-73B",
      },
    };
  }

  getUnallocatedFunding(projectId: string) {
    return {
      project_id: projectId,
      unallocated_deposits: [
        {
          transaction_id: "tx-73-03",
          institution: "Columbia Bank Construction Lending",
          amount: "3850000",
          cleared_date: "2025-09-02",
          memo: "Unallocated deposit reserve credit",
        },
      ],
      total_unallocated: "3850000",
    };
  }

  allocateFunding(drawId: string, transactionId: string, amount: string): DrawItem {
    const draw = this.getDrawById(drawId);
    if (draw) {
      draw.funded_amount = String(Number(draw.funded_amount) + Number(amount));
      draw.status = "FUNDED";
      this.save();
      return draw;
    }
    throw new Error("Draw not found");
  }

  // -------------------------------------------------------------
  // Milestones & Schedule
  // -------------------------------------------------------------
  getMilestones(projectId: string): MilestoneItem[] {
    return this.state.milestones[projectId] || [];
  }

  getMilestoneById(milestoneId: string): MilestoneItem | undefined {
    for (const projectId of Object.keys(this.state.milestones)) {
      const ms = this.state.milestones[projectId].find((m) => m.id === milestoneId);
      if (ms) return ms;
    }
    return undefined;
  }

  createMilestone(projectId: string, data: Partial<MilestoneItem>): MilestoneItem {
    const list = this.state.milestones[projectId] || [];
    const newMs: MilestoneItem = {
      id: `ms-${Date.now()}`,
      project_id: projectId,
      name: data.name || "New Milestone",
      planned_start: data.planned_start || new Date().toISOString(),
      planned_end: data.planned_end || new Date(Date.now() + 30 * 86400000).toISOString(),
      forecast_end: data.forecast_end || data.planned_end || new Date(Date.now() + 30 * 86400000).toISOString(),
      percent_complete: data.percent_complete || 0,
      status: data.status || "NOT_STARTED",
      critical_path: Boolean(data.critical_path),
      dependencies: data.dependencies || [],
      evidence_count: 0,
      ...data,
    };
    list.push(newMs);
    this.state.milestones[projectId] = list;
    this.save();
    return newMs;
  }

  updateMilestone(milestoneId: string, data: any): MilestoneItem {
    for (const projectId of Object.keys(this.state.milestones)) {
      const ms = this.state.milestones[projectId].find((m) => m.id === milestoneId);
      if (ms) {
        Object.assign(ms, data);
        if (data.forecast_end) ms.forecast_end = data.forecast_end;
        if (typeof data.percent_complete === "number") ms.percent_complete = data.percent_complete;
        ms.last_updated_by = this.getCurrentUser().name;
        ms.last_updated_at = new Date().toISOString();
        this.save();
        return ms;
      }
    }
    throw new Error("Milestone not found");
  }

  attachEvidence(milestoneId: string, data: Partial<MilestoneEvidence>): MilestoneEvidence {
    const ms = this.getMilestoneById(milestoneId);
    const evidence: MilestoneEvidence = {
      id: `evi-${Date.now()}`,
      milestone_id: milestoneId,
      filename: data.filename || "site_inspection_photo.jpg",
      type: data.type || "PHOTO",
      uploaded_at: new Date().toISOString(),
      uploaded_by: this.getCurrentUser().name,
      verification_status: "VERIFIED",
      ...data,
    };
    if (ms) {
      ms.evidence_attachments = ms.evidence_attachments || [];
      ms.evidence_attachments.push(evidence);
      ms.evidence_count = ms.evidence_attachments.length;
      this.save();
    }
    return evidence;
  }

  resolveDiscrepancy(
    milestoneId: string,
    data: { action: "ACCEPT_INSPECTION" | "SUBMIT_REBUTTAL" | "OVERRIDE_JOINT"; resolution_note: string; agreed_percent?: number }
  ): MilestoneItem {
    const ms = this.getMilestoneById(milestoneId);
    if (ms) {
      if (data.agreed_percent !== undefined) {
        ms.percent_complete = data.agreed_percent;
      } else if (data.action === "ACCEPT_INSPECTION" && ms.inspector_percent_complete !== undefined) {
        ms.percent_complete = ms.inspector_percent_complete;
      }
      if (ms.progress_conflict) {
        ms.progress_conflict.status = "RESOLVED";
        ms.progress_conflict.resolution_note = data.resolution_note;
        ms.progress_conflict.resolved_at = new Date().toISOString();
        ms.progress_conflict.resolved_by = this.getCurrentUser().name;
      }
      ms.status = "IN_PROGRESS";
      this.save();
      return ms;
    }
    throw new Error("Milestone not found");
  }

  getScheduleForecast(projectId: string): ScheduleForecast {
    return this.state.scheduleForecasts[projectId] || {
      project_id: projectId,
      has_schedule_baseline: true,
      target_completion: new Date(Date.now() + 300 * 86400000).toISOString(),
      forecast_completion: new Date(Date.now() + 300 * 86400000).toISOString(),
      delay_days: 0,
      is_delayed: false,
      critical_path_milestone: "Mobilization",
      carry_impact_monthly: "$0",
      total_carry_cost_exposure: "0",
      active_discrepancies_count: 0,
      total_milestones: 6,
      completed_milestones: 1,
      overall_progress_percent: 25,
    };
  }

  // -------------------------------------------------------------
  // Economics & Dispositions
  // -------------------------------------------------------------
  getEconomics(projectId: string): ProjectEconomics {
    return this.state.economics[projectId] || {
      project_id: projectId,
      lifecycle_stage: "CONSTRUCTION",
      gross_development_value: "385000000",
      net_sales_proceeds: "365000000",
      total_hard_costs: "101922000",
      total_soft_costs: "35000000",
      carrying_financing_cost: "52000000",
      total_cost: "212122000",
      net_profit: "152878000",
      return_on_cost_pct: 23.8,
      equity_multiple: 1.84,
      irr_pct: 19.2,
      irr_status: "VERIFIED",
      irr_status_explanation: "Underwritten pro forma projection",
      sponsor_equity_invested: "45000000",
      lp_equity_invested: "47122000",
      senior_debt_drawn: "120000000",
      senior_debt_repaid: "0",
      senior_debt_balance: "120000000",
      total_distributions: "0",
      pro_forma_lines: [],
    };
  }

  getProForma(projectId: string): ProFormaLineItem[] {
    const econ = this.getEconomics(projectId);
    return econ.pro_forma_lines || [];
  }

  getInvestorContributions(projectId: string): InvestorContribution[] {
    return this.state.investorContributions[projectId] || [];
  }

  recordInvestorContribution(projectId: string, data: Partial<InvestorContribution>): InvestorContribution {
    const list = this.state.investorContributions[projectId] || [];
    const contrib: InvestorContribution = {
      id: `ic-${Date.now()}`,
      project_id: projectId,
      investor_name: data.investor_name || "Marcus Vance",
      investor_type: data.investor_type || "SPONSOR",
      call_number: data.call_number || "Capital Call",
      amount: data.amount || "10000000",
      effective_date: data.effective_date || new Date().toISOString().split("T")[0],
      wire_reference: data.wire_reference || `WIRE-${Date.now()}`,
      notes: data.notes,
    };
    list.unshift(contrib);
    this.state.investorContributions[projectId] = list;
    this.save();
    return contrib;
  }

  getInvestorDistributions(projectId: string): InvestorDistribution[] {
    return this.state.investorDistributions[projectId] || [];
  }

  recordInvestorDistribution(projectId: string, data: Partial<InvestorDistribution>): InvestorDistribution {
    const list = this.state.investorDistributions[projectId] || [];
    const dist: InvestorDistribution = {
      id: `id-${Date.now()}`,
      project_id: projectId,
      investor_name: data.investor_name || "Meridian Capital Fund III",
      investor_type: data.investor_type || "LP_INVESTOR",
      distribution_type: data.distribution_type || "PROFIT_SPLIT",
      amount: data.amount || "10000000",
      effective_date: data.effective_date || new Date().toISOString().split("T")[0],
      status: "CLEARED",
      wire_reference: data.wire_reference || `WIRE-${Date.now()}`,
    };
    list.unshift(dist);
    this.state.investorDistributions[projectId] = list;
    this.save();
    return dist;
  }

  getDispositionUnits(projectId: string): DispositionUnit[] {
    return this.state.dispositionUnits[projectId] || [];
  }

  recordDispositionSale(projectId: string, unitId: string, data: Partial<DispositionUnit>): DispositionUnit {
    const units = this.state.dispositionUnits[projectId] || [];
    const unit = units.find((u) => u.id === unitId);
    if (unit) {
      Object.assign(unit, data);
      unit.status = "CLOSED";
      unit.closing_date = data.closing_date || new Date().toISOString().split("T")[0];
      this.save();
      return unit;
    }
    throw new Error("Disposition unit not found");
  }

  getCloseoutReport(projectId: string): CloseoutReport {
    return this.state.closeoutReports[projectId] || {
      project_id: projectId,
      lifecycle_stage: "CONSTRUCTION",
      status: "BLOCKED",
      completion_percent: 68,
      checklist: [
        { id: "c1", title: "Certificate of Occupancy on File", category: "MUNICIPAL", is_satisfied: false, blocker_reason: "Construction in progress" },
        { id: "c2", title: "Senior Construction Loan Extinguishment", category: "FINANCING", is_satisfied: false },
        { id: "c3", title: "Final Contractor Lien Release", category: "CONTRACTOR", is_satisfied: false },
      ],
      post_closeout_adjustments: [],
    };
  }

  approveCloseout(projectId: string, data: { is_exception_override?: boolean; rationale: string }): CloseoutReport {
    const report = this.getCloseoutReport(projectId);
    report.status = "CLOSED";
    report.approved_closeout_record = {
      approved_at: new Date().toISOString(),
      approved_by: this.getCurrentUser().name,
      closeout_certificate_id: `CERT-CLOSEOUT-${Date.now()}`,
      rationale: data.rationale,
      is_exception_override: data.is_exception_override,
    };
    this.state.closeoutReports[projectId] = report;
    this.save();
    return report;
  }

  recordPostCloseoutAdjustment(projectId: string, data: Partial<PostCloseoutAdjustment>): PostCloseoutAdjustment {
    const report = this.getCloseoutReport(projectId);
    const adj: PostCloseoutAdjustment = {
      id: `adj-${Date.now()}`,
      project_id: projectId,
      category: data.category || "Tax Adjustment",
      amount: data.amount || "100000",
      direction: data.direction || "CREDIT",
      effective_date: data.effective_date || new Date().toISOString().split("T")[0],
      recorded_by: this.getCurrentUser().name,
      recorded_at: new Date().toISOString(),
      rationale: data.rationale || "Final municipal adjustment",
    };
    report.post_closeout_adjustments.unshift(adj);
    this.save();
    return adj;
  }

  // -------------------------------------------------------------
  // Investor Updates
  // -------------------------------------------------------------
  getInvestorUpdates(projectId: string): InvestorUpdateSnapshot[] {
    return this.state.investorUpdates[projectId] || [];
  }

  getUpdateSnapshot(updateId: string): InvestorUpdateSnapshot | undefined {
    for (const projectId of Object.keys(this.state.investorUpdates)) {
      const u = this.state.investorUpdates[projectId].find((upd) => upd.id === updateId);
      if (u) return u;
    }
    return undefined;
  }

  generateDraft(projectId: string): InvestorUpdateSnapshot {
    const list = this.state.investorUpdates[projectId] || [];
    const draft: InvestorUpdateSnapshot = {
      id: `upd-${Date.now()}`,
      project_id: projectId,
      title: `Quarterly Update - ${new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
      as_of_date: new Date().toISOString().split("T")[0],
      status: "DRAFT",
      gross_development_value: "385000000",
      current_forecast_profit: "152878000",
      senior_debt_drawn: "120000000",
      equity_funded: "92122000",
      progress_summary: "Automated quarterly draft initialized from real-time field milestones and cleared bank disbursements.",
      material_disclosures: ["All underwritten contingency parameters remain satisfied."],
    };
    list.unshift(draft);
    this.state.investorUpdates[projectId] = list;
    this.save();
    return draft;
  }

  saveDraft(projectId: string, data: Partial<InvestorUpdateSnapshot>): InvestorUpdateSnapshot {
    const list = this.state.investorUpdates[projectId] || [];
    let draft = list.find((u) => u.id === data.id);
    if (!draft) {
      draft = this.generateDraft(projectId);
    }
    Object.assign(draft, data);
    this.save();
    return draft;
  }

  publishUpdate(updateId: string, payload: { recipients: string[]; expiry_date?: string }): InvestorUpdateSnapshot {
    const update = this.getUpdateSnapshot(updateId);
    if (update) {
      update.status = "PUBLISHED";
      update.published_at = new Date().toISOString();
      update.published_by = this.getCurrentUser().name;
      update.recipients = payload.recipients;
      update.expiry_date = payload.expiry_date;
      this.save();
      return update;
    }
    throw new Error("Update not found");
  }

  withdrawUpdate(updateId: string, reason: string): InvestorUpdateSnapshot {
    const update = this.getUpdateSnapshot(updateId);
    if (update) {
      update.status = "WITHDRAWN";
      update.withdrawn_at = new Date().toISOString();
      update.withdrawn_by = this.getCurrentUser().name;
      update.withdrawal_reason = reason;
      this.save();
      return update;
    }
    throw new Error("Update not found");
  }

  // -------------------------------------------------------------
  // Alerts & DQI & Audit
  // -------------------------------------------------------------
  getAlerts(projectId: string): AlertItem[] {
    return this.state.alerts[projectId] || [];
  }

  resolveAlert(alertId: string, resolutionNote?: string): AlertItem {
    for (const projectId of Object.keys(this.state.alerts)) {
      const alert = this.state.alerts[projectId].find((a) => a.id === alertId);
      if (alert) {
        alert.status = "RESOLVED";
        alert.resolved_at = new Date().toISOString();
        alert.resolved_by = this.getCurrentUser().name;
        alert.resolution_note = resolutionNote;
        this.save();
        return alert;
      }
    }
    throw new Error("Alert not found");
  }

  waiveAlert(alertId: string, payload: { reason: string; waived_until?: string }): AlertItem {
    for (const projectId of Object.keys(this.state.alerts)) {
      const alert = this.state.alerts[projectId].find((a) => a.id === alertId);
      if (alert) {
        alert.status = "WAIVED";
        alert.waived_reason = payload.reason;
        alert.waived_until = payload.waived_until;
        alert.waived_by = this.getCurrentUser().name;
        this.save();
        return alert;
      }
    }
    throw new Error("Alert not found");
  }

  escalateAlert(alertId: string, payload: { escalated_to: string; escalation_notes: string }): AlertItem {
    for (const projectId of Object.keys(this.state.alerts)) {
      const alert = this.state.alerts[projectId].find((a) => a.id === alertId);
      if (alert) {
        alert.escalated_to = payload.escalated_to;
        alert.escalation_notes = payload.escalation_notes;
        alert.escalated_at = new Date().toISOString();
        this.save();
        return alert;
      }
    }
    throw new Error("Alert not found");
  }

  getDataQualityIssues(projectId: string): DataQualityIssue[] {
    return this.state.dataQualityIssues[projectId] || [];
  }

  resolveDqi(dqiId: string, payload?: { resolution_note?: string; waived?: boolean; waiver_reason?: string }): DataQualityIssue {
    for (const projectId of Object.keys(this.state.dataQualityIssues)) {
      const dqi = this.state.dataQualityIssues[projectId].find((d) => d.id === dqiId);
      if (dqi) {
        if (payload?.waived) {
          dqi.status = "WAIVED";
          dqi.waived_reason = payload.waiver_reason;
        } else {
          dqi.status = "RESOLVED";
          dqi.resolved_at = new Date().toISOString();
          dqi.resolution_note = payload?.resolution_note;
        }
        this.save();
        return dqi;
      }
    }
    throw new Error("DQI not found");
  }

  waiveDqi(dqiId: string, reason: string): DataQualityIssue {
    return this.resolveDqi(dqiId, { waived: true, waiver_reason: reason });
  }

  getAuditEvents(): AuditEvent[] {
    return this.state.auditEvents;
  }

  // -------------------------------------------------------------
  // Notifications & Team & Exports
  // -------------------------------------------------------------
  getNotifications(projectId?: string): NotificationItem[] {
    if (projectId) {
      return this.state.notifications.filter((n) => n.project_id === projectId);
    }
    return this.state.notifications;
  }

  markNotificationRead(id: string): NotificationItem {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      return notif;
    }
    throw new Error("Notification not found");
  }

  markAllNotificationsRead(projectId?: string): { success: boolean; count: number } {
    let count = 0;
    this.state.notifications.forEach((n) => {
      if (!projectId || n.project_id === projectId) {
        if (!n.read) count++;
        n.read = true;
      }
    });
    this.save();
    return { success: true, count };
  }

  getTeamMembers(projectId: string): TeamMember[] {
    return this.state.teamMembers[projectId] || [];
  }

  inviteTeamMember(projectId: string, payload: { email: string; role: UserRole; name?: string }): ProjectInvitation {
    const inv: ProjectInvitation = {
      id: `inv-${Date.now()}`,
      organization_id: "org-vance-dev",
      project_id: projectId,
      project_name: this.getProjectById(projectId)?.name || "Project",
      organization_name: "Vance Development LLC",
      email: payload.email,
      role: payload.role,
      scope: "PROJECT",
      invited_by: this.getCurrentUser().name,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: "PENDING",
    };
    this.state.invitations.push(inv);

    // Also add to team members
    const tmList = this.state.teamMembers[projectId] || [];
    tmList.push({
      id: `tm-${Date.now()}`,
      project_id: projectId,
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      role: payload.role,
      title: `${payload.role} Contributor`,
      company: "Invited Partner",
      avatarInitials: payload.email[0].toUpperCase(),
      status: "INVITED",
      added_at: new Date().toISOString(),
    });
    this.state.teamMembers[projectId] = tmList;
    this.save();
    return inv;
  }

  updateTeamMemberRole(projectId: string, memberId: string, role: UserRole): { status: string } {
    const tmList = this.state.teamMembers[projectId] || [];
    const tm = tmList.find((m) => m.id === memberId);
    if (tm) {
      if (role === ("REMOVE" as any)) {
        tm.status = "REVOKED";
      } else {
        tm.role = role;
      }
      this.save();
      return { status: "success" };
    }
    return { status: "not_found" };
  }

  getExports(projectId: string): ReportExportItem[] {
    return this.state.exports[projectId] || [];
  }

  requestExport(projectId: string, payload: any): ReportExportItem {
    const list = this.state.exports[projectId] || [];
    const exp: ReportExportItem = {
      id: `exp-${Date.now()}`,
      project_id: projectId,
      report_type: payload.report_type,
      title: `${payload.report_type.replace(/_/g, " ")} Export`,
      format: payload.format || "PDF",
      status: "READY",
      requested_by: this.getCurrentUser().name,
      requested_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      file_size: "1.2 MB",
      download_url: "/sample-docs/73%20Broadway%20-%20Report%20%232.pdf",
    };
    list.unshift(exp);
    this.state.exports[projectId] = list;
    this.save();
    return exp;
  }

  // -------------------------------------------------------------
  // Onboarding & Readiness
  // -------------------------------------------------------------
  getOnboardingSession(projectId?: string): OnboardingSession {
    const sess = this.state.onboardingSession;
    if (projectId) sess.project_id = projectId;
    return sess;
  }

  submitOnboardingAnswer(
    sessionId: string,
    questionKey: string,
    answerValue: string
  ): any {
    const sess = this.state.onboardingSession;
    const answer = {
      id: `ans-${Date.now()}`,
      session_id: sessionId,
      question_key: questionKey,
      question_version: "v1.0",
      answer_type: "STANDARD" as const,
      answer_value: answerValue,
      answered_by: this.getCurrentUser().id,
      answered_at: new Date().toISOString(),
    };

    // Cycle through a realistic question graph
    if (questionKey === "contract_model") {
      sess.next_question = {
        question_key: "retainage_rate",
        question_version: "v1.0",
        prompt: "What standard retainage percentage applies to trade contractor invoices?",
        role_scope: "OWNER",
        input_type: "SELECT",
        options: [
          { label: "10% Retainage (Standard Commercial)", value: "10.0" },
          { label: "5% Retainage (Reduced Rate)", value: "5.0" },
          { label: "Zero Retainage", value: "0.0" },
        ],
        is_high_risk: false,
        allow_special_answers: true,
      };
    } else {
      sess.state = "ACTIVE";
      sess.next_question = null;
    }
    this.save();
    return answer;
  }

  getOnboardingTasks(projectId: string): OnboardingTask[] {
    return this.state.onboardingTasks[projectId] || [
      {
        id: "task-1",
        project_id: projectId,
        title: "Approve verified budget baseline",
        description: "Review and approve the underwritten construction baseline schedule.",
        task_type: "BASELINE_REVIEW",
        assigned_to_role: "OWNER",
        assigned_to_name: "Marcus Vance",
        status: "OPEN",
        blocking_gate: "VERIFIED_DASHBOARD",
        created_at: new Date().toISOString(),
      },
    ];
  }

  getProjectReadiness(projectId: string): ProjectReadiness {
    return this.state.projectReadiness[projectId] || {
      project_id: projectId,
      overall_readiness_pct: 90,
      gates: [
        {
          id: "g1",
          name: "Verified Dashboard & Analytics",
          description: "All core financial models verified.",
          is_unlocked: true,
          prerequisites: [{ label: "Baseline Approved", is_met: true }],
        },
      ],
      open_tasks: this.getOnboardingTasks(projectId),
      pending_approvals: [],
    };
  }

  // -------------------------------------------------------------
  // Invitations
  // -------------------------------------------------------------
  getInvitations(): ProjectInvitation[] {
    return this.state.invitations;
  }

  getInvitationByToken(token: string): ProjectInvitation | undefined {
    return this.state.invitations.find((i) => i.id === token || i.email.includes(token));
  }

  // -------------------------------------------------------------
  // GC Submissions
  // -------------------------------------------------------------
  getGCSubmissions(projectId: string, params?: { status?: string; type?: string }): GCSubmission[] {
    let list = this.state.gcSubmissions[projectId] || [];
    if (params?.status) list = list.filter((s) => s.status === params.status);
    if (params?.type) list = list.filter((s) => s.type === params.type);
    return list;
  }

  getGCSubmissionById(id: string): GCSubmission | undefined {
    for (const projectId of Object.keys(this.state.gcSubmissions)) {
      const sub = this.state.gcSubmissions[projectId].find((s) => s.id === id);
      if (sub) return sub;
    }
    return undefined;
  }

  createGCSubmission(projectId: string, payload: any): GCSubmission {
    const list = this.state.gcSubmissions[projectId] || [];
    const subNum = `GC-${payload.type === "CHANGE_ORDER_REQUEST" ? "COR" : "CLAIM"}-${String(list.length + 1).padStart(3, "0")}`;
    const newSub: GCSubmission = {
      id: `sub-${Date.now()}`,
      project_id: projectId,
      submission_number: subNum,
      type: payload.type,
      title: payload.title,
      description: payload.description || "",
      contract_model: "COST_PLUS",
      status: "SUBMITTED",
      submitted_at: new Date().toISOString(),
      submitted_by: this.getCurrentUser().name,
      contractor_name: payload.contractor_name || "Apex Construction Services LLC",
      claimed_amount: payload.claimed_amount,
      retainage_rate_pct: payload.retainage_rate_pct || 10,
      retainage_amount: String(Math.round(Number(payload.claimed_amount) * 0.1)),
      net_payable_amount: String(Math.round(Number(payload.claimed_amount) * 0.9)),
      evidence_items: payload.evidence_items || [],
      invoice_numbers: payload.invoice_numbers || [],
      reviews: [],
      created_task_ids: [],
    };
    list.unshift(newSub);
    this.state.gcSubmissions[projectId] = list;
    this.save();
    return newSub;
  }

  reviewGCSubmission(id: string, payload: { role: "PM" | "CFO" | "OWNER"; decision: "APPROVED" | "REJECTED"; comments?: string }): GCSubmission {
    const sub = this.getGCSubmissionById(id);
    if (sub) {
      sub.status = payload.decision === "APPROVED" ? "APPROVED" : "REJECTED";
      sub.reviews.push({
        role: payload.role,
        reviewer_name: this.getCurrentUser().name,
        status: payload.decision,
        reviewed_at: new Date().toISOString(),
        comments: payload.comments,
      });
      this.save();
      return sub;
    }
    throw new Error("Submission not found");
  }

  checkDuplicateInvoice(projectId: string, payload: { invoice_number: string; amount?: string }) {
    const norm = payload.invoice_number.trim().toLowerCase();
    const subs = this.state.gcSubmissions[projectId] || [];
    for (const sub of subs) {
      if (sub.invoice_numbers.some((num) => num.toLowerCase() === norm)) {
        return {
          is_duplicate: true,
          invoice_number: payload.invoice_number,
          existing_record: {
            source: "GC Submission",
            amount: sub.claimed_amount,
            date: sub.submitted_at,
            vendor: sub.contractor_name,
            submission_number: sub.submission_number,
          },
        };
      }
    }
    return {
      is_duplicate: false,
      invoice_number: payload.invoice_number,
    };
  }
}

export const mockStore = new MockStore();
