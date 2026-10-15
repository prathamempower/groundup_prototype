import {
  ApiResponse,
  ApiErrorResponse,
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
  SpecialAnswerType,
  ImportBatch,
  ProjectEconomics,
  ProFormaLineItem,
  InvestorContribution,
  InvestorDistribution,
  DispositionUnit,
  CloseoutReport,
  PostCloseoutAdjustment,
  GCSubmission,
  DuplicateInvoiceCheckResult,
  CreateGCSubmissionPayload,
  ReviewGCSubmissionPayload,
  PublishInvestorUpdatePayload,
  WithdrawInvestorUpdatePayload,
  WaiveAlertPayload,
  EscalateAlertPayload,
  ResolveDqiPayload,
  NotificationItem,
  TeamMember,
  InviteTeamMemberPayload,
  UpdateTeamMemberRolePayload,
  ReportExportItem,
  RequestExportPayload,
} from "@/lib/types";
import { mockStore } from "@/lib/mock-data/store";
import { normalizeUserProfile, authAdapter } from "./adapters/auth-adapter";

export * from "./errors";
export * from "./adapters/auth-adapter";
export * from "./adapters/upload-adapter";
export * from "./adapters/job-polling-adapter";

export class ApiError extends Error {
  code: string;
  fields?: Array<{ path?: string; issue: string }>;
  requestId?: string;
  status: number;

  constructor(status: number, errorData: ApiErrorResponse["error"]) {
    super(errorData.message);
    this.name = "ApiError";
    this.status = status;
    this.code = errorData.code;
    this.fields = errorData.fields;
    this.requestId = errorData.request_id;
  }
}

function wrap<T>(data: T, warnings?: string[]): ApiResponse<T> {
  return {
    data,
    meta: {
      as_of: new Date().toISOString(),
      data_quality: "VERIFIED",
      warnings,
    },
  };
}

export const api = {
  identity: {
    getMe: async () => {
      const session = await authAdapter.getSession();
      if (!session?.user) {
        throw new ApiError(401, {
          code: "UNAUTHORIZED",
          message: "No active user session",
          request_id: "req_auth_none",
        });
      }
      return wrap(session.user);
    },
  },

  projects: {
    list: async () => {
      const projects = mockStore.getProjects();
      const current_project_id = mockStore.getActiveProjectId();
      return wrap({
        projects,
        current_project_id,
      });
    },
    getById: async (projectId: string) => {
      const p = mockStore.getProjectById(projectId);
      if (!p) {
        throw new ApiError(404, {
          code: "NOT_FOUND",
          message: `Project ${projectId} not found or access restricted`,
          request_id: "req_not_found",
        });
      }
      return wrap(p);
    },
    create: async (projectData: Partial<Project>) => {
      const project = mockStore.createProject(projectData);
      return wrap(project);
    },
    checkDuplicates: async (data: { name: string; address: string; project_entity?: string }) => {
      return wrap(mockStore.checkDuplicates(data));
    },
    switchProject: async (projectId: string) => {
      const p = mockStore.switchProject(projectId);
      if (!p) {
        throw new ApiError(404, {
          code: "NOT_FOUND",
          message: `Project ${projectId} not found`,
          request_id: "req_not_found",
        });
      }
      return wrap(p);
    },
    getDashboard: async (projectId: string) => {
      const dashboard = mockStore.getDashboard(projectId);
      return wrap(dashboard);
    },
  },

  documents: {
    list: async (projectId: string) => {
      return wrap(mockStore.getDocuments(projectId));
    },
    getById: async (documentId: string) => {
      const doc = mockStore.getDocumentById(documentId);
      if (!doc) {
        throw new ApiError(404, {
          code: "NOT_FOUND",
          message: `Document ${documentId} not found`,
          request_id: "req_doc_not_found",
        });
      }
      return wrap(doc);
    },
    getUploadUrl: async (filename: string, _mime_type: string) => {
      return wrap({
        document_id: `doc-${Date.now()}`,
        upload_url: `/sample-docs/${encodeURIComponent(filename)}`,
        key: filename,
        expires_in: 3600,
      });
    },
    uploadMultipart: async (file: File | Blob, filename: string, projectId?: string) => {
      const doc = mockStore.createDocument({
        filename,
        mime_type: file.type || "application/pdf",
        project_id: projectId || mockStore.getActiveProjectId(),
        document_type: filename.toLowerCase().includes("invoice")
          ? "INVOICE"
          : filename.toLowerCase().includes("report")
          ? "INSPECTION"
          : "BUDGET_SOV",
      });
      return wrap(doc);
    },
    create: async (docData: {
      filename: string;
      mime_type: string;
      project_id: string;
      document_type: DocumentItem["document_type"];
      notes?: string;
    }) => {
      const doc = mockStore.createDocument(docData);
      return wrap(doc);
    },
    confirmUpload: async (documentId: string) => {
      return wrap({
        id: documentId,
        status: "READY_FOR_REVIEW",
        sha256: "mock_sha256_verified",
        job_id: `job_${Date.now()}`,
      });
    },
    getExtractions: async (documentId: string) => {
      return wrap(mockStore.getExtractions(documentId));
    },
    decideExtractionField: async (
      fieldId: string,
      decision: "ACCEPT" | "EDIT" | "REJECT",
      normalizedValue?: string,
      rationale?: string
    ) => {
      const field = mockStore.decideExtractionField(fieldId, decision, normalizedValue, rationale);
      return wrap(field);
    },
    addManualField: async (
      _documentId: string,
      _fieldName: string,
      _value: string,
      _notes?: string,
      _rationale?: string
    ) => {
      return wrap({
        status: "SUCCESS",
        source_record_id: `rec-${Date.now()}`,
      });
    },
    acceptAllExtractions: async (documentId: string) => {
      const list = mockStore.getExtractions(documentId).map((e) => ({
        ...e,
        status: "ACCEPTED" as const,
      }));
      return wrap(list);
    },
    completeReview: async (documentId: string) => {
      const doc = mockStore.completeReview(documentId);
      return wrap(doc);
    },
    mark: async (
      documentId: string,
      markType: "DUPLICATE" | "MISFILED" | "IRRELEVANT" | "NOT_APPLICABLE",
      rationale?: string,
      duplicateOfDocumentId?: string
    ) => {
      const doc = mockStore.markDocument(documentId, markType, rationale, duplicateOfDocumentId);
      return wrap(doc);
    },
    assignProject: async (documentId: string, projectId: string, rationale?: string) => {
      const doc = mockStore.assignDocumentProject(documentId, projectId, rationale);
      return wrap(doc);
    },
    manualEntry: async (
      documentId: string,
      _entryData: {
        document_type: string;
        counterparty: string;
        reference_number?: string;
        amount: string;
        budget_line_id?: string;
        notes?: string;
      }
    ) => {
      const doc = mockStore.getDocumentById(documentId) || mockStore.getDocuments()[0];
      return wrap({
        document: doc,
      });
    },
    getDownloadUrl: async (documentId: string) => {
      const doc = mockStore.getDocumentById(documentId);
      const filename = doc?.original_filename || "document.pdf";
      return wrap({
        document_id: documentId,
        download_url: `/sample-docs/${encodeURIComponent(filename)}`,
        expires_in: 3600,
      });
    },
  },

  budget: {
    getCurrent: async (projectId: string) => {
      const lines = mockStore.getBudgetLines(projectId);
      return wrap({
        budget_id: `budget-${projectId}`,
        status: "APPROVED",
        lines,
      });
    },
    approveBaseline: async (budgetId: string) => {
      return wrap({
        id: budgetId,
        status: "APPROVED",
        approved_at: new Date().toISOString(),
        message: "Baseline construction schedule and contingency reserve approved",
      });
    },
    getChangeOrders: async (projectId: string) => {
      return wrap(mockStore.getChangeOrders(projectId));
    },
    createChangeOrder: async (
      projectId: string,
      data: {
        title: string;
        scope_description: string;
        requested_amount: string;
        target_budget_line_id: string;
        funding_source: ChangeOrder["funding_source"];
      }
    ) => {
      return wrap(mockStore.createChangeOrder(projectId, data));
    },
    approveChangeOrder: async (changeOrderId: string, approvedAmount?: string) => {
      return wrap(mockStore.approveChangeOrder(changeOrderId, approvedAmount));
    },
    rejectChangeOrder: async (changeOrderId: string, reason: string) => {
      return wrap(mockStore.rejectChangeOrder(changeOrderId, reason));
    },
    moveContingency: async (
      projectId: string,
      amount: string,
      destinationLineId: string,
      reason: string
    ) => {
      return wrap(mockStore.moveContingency(projectId, amount, destinationLineId, reason));
    },
    getContingencyMovements: async (projectId: string) => {
      return wrap(mockStore.getContingencyMovements(projectId));
    },
    linkMilestone: async (budgetLineId: string, milestoneId: string | null) => {
      return wrap(mockStore.linkMilestoneToBudgetLine(budgetLineId, milestoneId));
    },
  },

  spend: {
    getFinancialAccounts: async () => {
      return wrap(mockStore.getFinancialAccounts());
    },
    getStatementPeriods: async (accountId: string) => {
      return wrap(mockStore.getStatementPeriods(accountId));
    },
    signoffStatementPeriod: async (periodId: string, waiverReason?: string) => {
      const sp = mockStore.signoffStatementPeriod(periodId, waiverReason);
      return wrap({
        id: periodId,
        reconciled_status: sp.reconciled_status,
        signed_off_at: sp.reconciled_at || new Date().toISOString(),
        message: "Statement period sign-off confirmed",
        period: sp,
      });
    },
    getTransactions: async (projectId: string) => {
      return wrap(mockStore.getTransactions(projectId));
    },
    linkInvoice: async (transactionId: string, documentId: string, notes?: string) => {
      return wrap(mockStore.linkInvoice(transactionId, documentId, notes));
    },
    classifyCardSettlement: async (transactionId: string, notes?: string) => {
      return wrap(mockStore.classifyCardSettlement(transactionId, notes));
    },
    getReconciliationQueue: async (projectId: string) => {
      return wrap(mockStore.getReconciliationQueue(projectId));
    },
    decideMatch: async (
      matchId: string,
      decision: "ACCEPT" | "SPLIT" | "REMAP" | "EXCLUDE" | "MARK_TRANSFER",
      payload?: {
        rationale?: string;
        target_budget_line_id?: string;
        to_project_id?: string;
        allocations?: Array<{ budget_line_id: string; budget_line_name?: string; amount: string }>;
      }
    ) => {
      return wrap(mockStore.decideMatch(matchId, decision, payload));
    },
    getImportBatches: async (_projectId: string) => {
      return wrap([]);
    },
    getImportBatchById: async (batchId: string) => {
      return wrap({
        id: batchId,
        organization_id: "org-vance-dev",
        project_id: mockStore.getActiveProjectId(),
        adapter: "CSV",
        version: "1.0",
        status: "COMPLETED",
        total_rows: 50,
        accepted_rows: 50,
        rejected_rows: 0,
        duplicate_rows: 0,
        uploaded_by: "Sarah Lin",
        created_at: new Date().toISOString(),
      });
    },
    createImportBatch: async (
      projectId: string,
      batchData: {
        adapter: string;
        version: string;
        raw_content: string;
        column_mapping: Record<string, string>;
        financial_account_id?: string;
        control_total?: number;
      }
    ) => {
      return wrap({
        id: `batch-${Date.now()}`,
        organization_id: "org-vance-dev",
        project_id: projectId,
        adapter: batchData.adapter,
        version: batchData.version,
        status: "COMPLETED",
        total_rows: 25,
        accepted_rows: 25,
        rejected_rows: 0,
        duplicate_rows: 0,
        uploaded_by: "Sarah Lin",
        created_at: new Date().toISOString(),
      });
    },
    allocateSpend: async (
      projectId: string,
      spendRecordId: string,
      allocations: Array<{ budget_line_id: string; amount: string }>
    ) => {
      return wrap({
        id: spendRecordId,
        project_id: projectId,
        vendor_name: "Vendor Allocation",
        amount: String(allocations.reduce((s, a) => s + Number(a.amount), 0)),
        transaction_date: new Date().toISOString().split("T")[0],
        description: "Allocated spend record",
        status: "REVIEWED" as const,
        evidence_strength: "VERIFIED_INVOICE" as const,
        budget_line_id: allocations[0]?.budget_line_id || "bl-01",
        budget_line_name: "Sitework & Excavation",
        allocations,
      });
    },
    getInterProjectTransfers: async (projectId: string) => {
      return wrap(mockStore.getInterProjectTransfers(projectId));
    },
    createInterProjectTransfer: async (
      projectId: string,
      data: {
        to_project_id: string;
        amount: string;
        notes: string;
        transfer_date?: string;
      }
    ) => {
      return wrap(mockStore.createInterProjectTransfer(projectId, data));
    },
    repayInterProjectTransfer: async (
      transferId: string,
      repaidAmount: string,
      repaidDate?: string,
      notes?: string
    ) => {
      return wrap(mockStore.repayInterProjectTransfer(transferId, repaidAmount, repaidDate, notes));
    },
  },

  draws: {
    list: async (projectId: string) => {
      return wrap(mockStore.getDraws(projectId));
    },
    getById: async (drawId: string) => {
      const d = mockStore.getDrawById(drawId);
      if (!d) {
        throw new ApiError(404, {
          code: "NOT_FOUND",
          message: `Draw ${drawId} not found`,
          request_id: "req_draw_not_found",
        });
      }
      return wrap(d);
    },
    create: async (
      projectId: string,
      data: {
        draw_number: number;
        period_start: string;
        period_end: string;
        lender_name?: string;
        lines: Array<{ budget_line_id: string; requested_amount: string }>;
      }
    ) => {
      return wrap(mockStore.createDraw(projectId, data));
    },
    verifyWork: async (drawId: string, notes?: string) => {
      return wrap(mockStore.verifyWork(drawId, notes));
    },
    verifyCost: async (drawId: string, notes?: string) => {
      return wrap(mockStore.verifyCost(drawId, notes));
    },
    markSubmitted: async (drawId: string) => {
      return wrap(mockStore.markDrawSubmitted(drawId));
    },
    recordLenderDecision: async (
      drawId: string,
      data: {
        recommended_amount: string;
        approved_amount: string;
        lender_notes?: string;
        line_decisions?: Array<{ line_id: string; recommended_amount: string; approved_amount: string; lender_notes?: string }>;
      }
    ) => {
      return wrap(mockStore.recordLenderDecision(drawId, data));
    },
    createRevision: async (
      drawId: string,
      data: {
        revision_reason: string;
        requested_amount?: string;
        lines?: Array<{ budget_line_id: string; requested_amount: string }>;
      }
    ) => {
      return wrap(mockStore.createRevision(drawId, data));
    },
    resolveCondition: async (drawId: string, conditionId: string, notes?: string) => {
      return wrap(mockStore.resolveCondition(drawId, conditionId, notes));
    },
    getPacket: async (drawId: string) => {
      return wrap(mockStore.getPacket(drawId));
    },
    getUnallocatedFunding: async (projectId: string) => {
      return wrap(mockStore.getUnallocatedFunding(projectId));
    },
    allocateFunding: async (drawId: string, transactionId: string, amount: string) => {
      return wrap(mockStore.allocateFunding(drawId, transactionId, amount));
    },
  },

  progress: {
    getMilestones: async (projectId: string) => {
      return wrap(mockStore.getMilestones(projectId));
    },
    getMilestoneById: async (milestoneId: string) => {
      const m = mockStore.getMilestoneById(milestoneId);
      if (!m) {
        throw new ApiError(404, {
          code: "NOT_FOUND",
          message: `Milestone ${milestoneId} not found`,
          request_id: "req_ms_not_found",
        });
      }
      return wrap(m);
    },
    createMilestone: async (projectId: string, data: Partial<MilestoneItem>) => {
      return wrap(mockStore.createMilestone(projectId, data));
    },
    updateMilestone: async (milestoneId: string, data: any) => {
      return wrap(mockStore.updateMilestone(milestoneId, data));
    },
    attachEvidence: async (milestoneId: string, data: Partial<MilestoneEvidence>) => {
      return wrap(mockStore.attachEvidence(milestoneId, data));
    },
    resolveDiscrepancy: async (
      milestoneId: string,
      data: {
        action: "ACCEPT_INSPECTION" | "SUBMIT_REBUTTAL" | "OVERRIDE_JOINT";
        resolution_note: string;
        agreed_percent?: number;
      }
    ) => {
      return wrap(mockStore.resolveDiscrepancy(milestoneId, data));
    },
    getScheduleForecast: async (projectId: string) => {
      return wrap(mockStore.getScheduleForecast(projectId));
    },
  },

  economics: {
    getEconomics: async (projectId: string) => {
      return wrap(mockStore.getEconomics(projectId));
    },
    getProForma: async (projectId: string) => {
      return wrap(mockStore.getProForma(projectId));
    },
    createFinancialPlan: async (_projectId: string, _data: any) => {
      return wrap({ success: true });
    },
    getInvestorContributions: async (projectId: string) => {
      return wrap(mockStore.getInvestorContributions(projectId));
    },
    recordInvestorContribution: async (projectId: string, data: Partial<InvestorContribution>) => {
      return wrap(mockStore.recordInvestorContribution(projectId, data));
    },
    getInvestorDistributions: async (projectId: string) => {
      return wrap(mockStore.getInvestorDistributions(projectId));
    },
    recordInvestorDistribution: async (projectId: string, data: Partial<InvestorDistribution>) => {
      return wrap(mockStore.recordInvestorDistribution(projectId, data));
    },
    getDispositionUnits: async (projectId: string) => {
      return wrap(mockStore.getDispositionUnits(projectId));
    },
    recordDispositionSale: async (projectId: string, unitId: string, data: Partial<DispositionUnit>) => {
      return wrap(mockStore.recordDispositionSale(projectId, unitId, data));
    },
    getCloseoutReport: async (projectId: string) => {
      return wrap(mockStore.getCloseoutReport(projectId));
    },
    approveCloseout: async (projectId: string, data: { is_exception_override?: boolean; rationale: string }) => {
      return wrap(mockStore.approveCloseout(projectId, data));
    },
    recordPostCloseoutAdjustment: async (projectId: string, data: Partial<PostCloseoutAdjustment>) => {
      return wrap(mockStore.recordPostCloseoutAdjustment(projectId, data));
    },
  },

  investor: {
    getSharedProjects: async () => {
      return wrap(mockStore.getProjects());
    },
    getUpdateSnapshot: async (updateId: string) => {
      const u = mockStore.getUpdateSnapshot(updateId);
      if (!u) {
        throw new ApiError(404, {
          code: "NOT_FOUND",
          message: `Investor update ${updateId} not found`,
          request_id: "req_upd_not_found",
        });
      }
      return wrap(u);
    },
    listUpdates: async (projectId: string) => {
      return wrap(mockStore.getInvestorUpdates(projectId));
    },
    generateDraft: async (projectId: string) => {
      return wrap(mockStore.generateDraft(projectId));
    },
    saveDraft: async (projectId: string, data: Partial<InvestorUpdateSnapshot>) => {
      return wrap(mockStore.saveDraft(projectId, data));
    },
    publish: async (updateId: string, data: PublishInvestorUpdatePayload) => {
      return wrap(mockStore.publishUpdate(updateId, data));
    },
    withdraw: async (updateId: string, data: WithdrawInvestorUpdatePayload) => {
      return wrap(mockStore.withdrawUpdate(updateId, data.reason));
    },
  },

  alerts: {
    list: async (projectId: string) => {
      return wrap(mockStore.getAlerts(projectId));
    },
    resolveAlert: async (alertId: string, resolutionNote?: string) => {
      return wrap(mockStore.resolveAlert(alertId, resolutionNote));
    },
    waiveAlert: async (alertId: string, payload: WaiveAlertPayload) => {
      return wrap(mockStore.waiveAlert(alertId, payload));
    },
    escalateAlert: async (alertId: string, payload: EscalateAlertPayload) => {
      return wrap(mockStore.escalateAlert(alertId, payload));
    },
    getDataQualityIssues: async (projectId: string) => {
      return wrap(mockStore.getDataQualityIssues(projectId));
    },
    resolveDataQualityIssue: async (dqiId: string, payload?: ResolveDqiPayload) => {
      return wrap(mockStore.resolveDqi(dqiId, payload));
    },
    waiveDataQualityIssue: async (dqiId: string, reason: string) => {
      return wrap(mockStore.waiveDqi(dqiId, reason));
    },
    getAuditEvents: async () => {
      return wrap(mockStore.getAuditEvents());
    },
  },

  notifications: {
    list: async (projectId?: string) => {
      return wrap(mockStore.getNotifications(projectId));
    },
    markRead: async (id: string) => {
      return wrap(mockStore.markNotificationRead(id));
    },
    markAllRead: async (projectId?: string) => {
      return wrap(mockStore.markAllNotificationsRead(projectId));
    },
  },

  team: {
    list: async (projectId: string) => {
      return wrap(mockStore.getTeamMembers(projectId));
    },
    invite: async (projectId: string, payload: InviteTeamMemberPayload) => {
      return wrap(mockStore.inviteTeamMember(projectId, payload));
    },
    updateRole: async (projectId: string, id: string, payload: UpdateTeamMemberRolePayload) => {
      return wrap(mockStore.updateTeamMemberRole(projectId, id, payload.role));
    },
    revoke: async (projectId: string, id: string) => {
      return wrap(mockStore.updateTeamMemberRole(projectId, id, "REMOVE" as any));
    },
  },

  exports: {
    list: async (projectId: string) => {
      return wrap(mockStore.getExports(projectId));
    },
    request: async (projectId: string, payload: RequestExportPayload) => {
      return wrap(mockStore.requestExport(projectId, payload));
    },
  },

  onboarding: {
    getCurrentSession: async (projectId?: string) => {
      return wrap(mockStore.getOnboardingSession(projectId));
    },
    submitAnswer: async (
      sessionId: string,
      questionKey: string,
      answerValue: string,
      _answerType: SpecialAnswerType = "STANDARD",
      _reason?: string,
      _questionVersion = "v1.0",
      _otherSpecification?: string
    ) => {
      return wrap(mockStore.submitOnboardingAnswer(sessionId, questionKey, answerValue));
    },
    getTasks: async (projectId: string) => {
      return wrap(mockStore.getOnboardingTasks(projectId));
    },
    complete: async (payload: any) => {
      try {
        const res = await fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.project) {
            mockStore.createProject(json.project);
          }
          return wrap(json);
        }
      } catch (err) {
        console.warn("Falling back to local mockStore project creation:", err);
      }
      const p = payload as { answers?: { projectName?: string; projectEntity?: string; projectAddress?: string; projectStage?: string; contractModel?: any; targetBudget?: number } } | undefined;
      const answers = p?.answers || {};
      const newProject = mockStore.createProject({
        name: answers.projectName || "73 Broadway",
        project_entity: answers.projectEntity || `${answers.projectName || "73 Broadway"} LLC`,
        address: answers.projectAddress || "73 Broadway, Brooklyn, NY 11249",
        lifecycle_stage: (answers.projectStage as Project["lifecycle_stage"]) || "CONSTRUCTION",
        contract_model: answers.contractModel || "COST_PLUS",
        loan_commitment: typeof answers.targetBudget === "number" ? String(answers.targetBudget) : "4200000",
      });
      return wrap({
        success: true,
        projectId: newProject.id,
        project: newProject,
        message: "Workspace provisioned successfully",
      });
    },
  },

  readiness: {
    getProjectReadiness: async (projectId: string) => {
      return wrap(mockStore.getProjectReadiness(projectId));
    },
    approveConfiguration: async (versionId: string) => {
      return wrap({
        id: versionId,
        project_id: mockStore.getActiveProjectId(),
        configuration_type: "BUDGET_BASELINE" as const,
        title: "Budget Baseline",
        summary: "Approved baseline configuration",
        proposed_value: "101922000",
        status: "APPROVED" as const,
        proposed_by: "Sarah Lin",
        proposed_at: new Date().toISOString(),
        approved_by: mockStore.getCurrentUser().name,
        approved_at: new Date().toISOString(),
      });
    },
    rejectConfiguration: async (versionId: string, reason: string) => {
      return wrap({
        id: versionId,
        project_id: mockStore.getActiveProjectId(),
        configuration_type: "BUDGET_BASELINE" as const,
        title: "Budget Baseline",
        summary: "Rejected baseline configuration",
        proposed_value: "101922000",
        status: "REJECTED" as const,
        proposed_by: "Sarah Lin",
        proposed_at: new Date().toISOString(),
        rejection_reason: reason,
      });
    },
  },

  invitations: {
    list: async () => {
      return wrap(mockStore.getInvitations());
    },
    getByToken: async (token: string) => {
      return wrap(mockStore.getInvitationByToken(token));
    },
    accept: async (_token: string, fullName: string, _password?: string) => {
      const user = mockStore.createUser({ name: fullName });
      return wrap({
        user,
        session: mockStore.getOnboardingSession(),
      });
    },
    create: async (inviteData: {
      email: string;
      role: import("@/lib/types").UserRole;
      project_id?: string;
      scope?: string;
    }) => {
      return wrap(
        mockStore.inviteTeamMember(inviteData.project_id || mockStore.getActiveProjectId(), inviteData)
      );
    },
  },

  submissions: {
    list: async (projectId: string, params?: { status?: string; type?: string }) => {
      return wrap(mockStore.getGCSubmissions(projectId, params));
    },
    getById: async (id: string) => {
      const s = mockStore.getGCSubmissionById(id);
      if (!s) {
        throw new ApiError(404, {
          code: "NOT_FOUND",
          message: `GC Submission ${id} not found`,
          request_id: "req_sub_not_found",
        });
      }
      return wrap(s);
    },
    create: async (projectId: string, payload: CreateGCSubmissionPayload) => {
      return wrap(mockStore.createGCSubmission(projectId, payload));
    },
    review: async (id: string, payload: ReviewGCSubmissionPayload) => {
      return wrap(mockStore.reviewGCSubmission(id, payload));
    },
    checkDuplicateInvoice: async (projectId: string, payload: { invoice_number: string; amount?: string }) => {
      return wrap(mockStore.checkDuplicateInvoice(projectId, payload));
    },
  },
};
