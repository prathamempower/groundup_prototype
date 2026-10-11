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
import { normalizeUserProfile } from "./adapters/auth-adapter";

export * from "./errors";
export * from "./adapters/auth-adapter";
export * from "./adapters/upload-adapter";
export * from "./adapters/job-polling-adapter";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

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

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add Idempotency-Key on mutations if not already present
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(options.method?.toUpperCase() || "") &&
    !headers["Idempotency-Key"]
  ) {
    headers["Idempotency-Key"] = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || "include",
  });

  if (!res.ok) {
    let errorJson: ApiErrorResponse;
    try {
      errorJson = await res.json();
    } catch {
      throw new ApiError(res.status, {
        code: "INTERNAL_ERROR",
        message: `HTTP error ${res.status}: ${res.statusText}`,
        request_id: "req_unknown",
      });
    }
    throw new ApiError(res.status, errorJson.error);
  }

  return (await res.json()) as ApiResponse<T>;
}

export const api = {
  identity: {
    getMe: async () => {
      const response = await request<{
        id: string;
        organization_id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: UserProfile["role"];
        is_active: boolean;
        project_memberships: Array<{ project_id: string; role: string }>;
        permissions: string[];
      }>("/me");
      return { ...response, data: normalizeUserProfile(response.data) };
    },
  },

  projects: {
    list: async () => {
      const res = await request<Project[] | { projects: Project[]; current_project_id?: string }>("/projects");
      if (Array.isArray(res.data)) {
        const projects = res.data;
        const current_project_id = typeof window !== "undefined"
          ? (localStorage.getItem("groundup_active_project_id") || projects[0]?.id || "")
          : (projects[0]?.id || "");
        return {
          ...res,
          data: {
            projects,
            current_project_id,
          },
        };
      }
      return res as ApiResponse<{ projects: Project[]; current_project_id: string }>;
    },
    getById: (projectId: string) => request<Project>(`/projects/${projectId}`),
    create: (projectData: Partial<Project>) =>
      request<Project>("/projects", {
        method: "POST",
        body: JSON.stringify(projectData),
      }),
    checkDuplicates: (data: { name: string; address: string; project_entity?: string }) =>
      request<import("@/lib/types").ProjectDuplicateCheckResponse>("/projects/check-duplicates", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    switchProject: async (projectId: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("groundup_active_project_id", projectId);
      }
      return await request<Project>(`/projects/${projectId}`);
    },
    getDashboard: (projectId: string) =>
      request<ProjectDashboard>(`/projects/${projectId}/dashboard`),
  },

  documents: {
    list: (projectId: string) =>
      request<DocumentItem[]>(`/projects/${projectId}/documents`),
    getById: (documentId: string) =>
      request<DocumentItem>(`/documents/${documentId}`),
    getUploadUrl: (filename: string, mime_type: string) =>
      request<{ document_id: string; upload_url: string; key: string; expires_in: number }>(
        "/documents/upload-url",
        {
          method: "POST",
          body: JSON.stringify({ filename, mime_type }),
        }
      ),
    uploadMultipart: async (file: File | Blob, filename: string, projectId?: string) => {
      const formData = new FormData();
      formData.append("file", file, filename);
      if (projectId) {
        formData.append("project_id", projectId);
      }
      const url = `${API_BASE_URL}/documents/upload`;
      const res = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Idempotency-Key": `idem_upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        },
      });
      if (!res.ok) {
        let errorJson: ApiErrorResponse;
        try {
          errorJson = await res.json();
        } catch {
          throw new ApiError(res.status, {
            code: "INTERNAL_ERROR",
            message: `Upload error ${res.status}: ${res.statusText}`,
            request_id: "req_upload",
          });
        }
        throw new ApiError(res.status, errorJson.error);
      }
      return (await res.json()) as ApiResponse<DocumentItem>;
    },
    create: (docData: {
      filename: string;
      mime_type: string;
      project_id: string;
      document_type: DocumentItem["document_type"];
      notes?: string;
    }) =>
      request<DocumentItem>("/documents/create", {
        method: "POST",
        body: JSON.stringify(docData),
      }),
    confirmUpload: (documentId: string) =>
      request<{ id: string; status: string; sha256: string; job_id: string }>(
        `/documents/${documentId}/confirm-upload`,
        { method: "POST" }
      ),
    getExtractions: (documentId: string) =>
      request<ExtractionField[]>(`/documents/${documentId}/extractions`),
    decideExtractionField: (
      fieldId: string,
      decision: "ACCEPT" | "EDIT" | "REJECT",
      normalizedValue?: string,
      rationale?: string
    ) =>
      request<ExtractionField>(`/extraction-fields/${fieldId}/decision`, {
        method: "POST",
        body: JSON.stringify({
          decision,
          normalized_value: normalizedValue,
          rationale,
        }),
      }),
    acceptAllExtractions: (documentId: string) =>
      request<ExtractionField[]>(`/documents/${documentId}/accept-all`, {
        method: "POST",
      }),
    completeReview: (documentId: string) =>
      request<DocumentItem>(`/documents/${documentId}/complete-review`, {
        method: "POST",
      }),
    mark: (
      documentId: string,
      markType: "DUPLICATE" | "MISFILED" | "IRRELEVANT" | "NOT_APPLICABLE",
      rationale?: string,
      duplicateOfDocumentId?: string
    ) =>
      request<DocumentItem>(`/documents/${documentId}/mark`, {
        method: "POST",
        body: JSON.stringify({
          mark_type: markType,
          rationale,
          duplicate_of_document_id: duplicateOfDocumentId,
        }),
      }),
    assignProject: (documentId: string, projectId: string, rationale?: string) =>
      request<DocumentItem>(`/documents/${documentId}/assign-project`, {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          rationale,
        }),
      }),
    manualEntry: (
      documentId: string,
      entryData: {
        document_type: string;
        counterparty: string;
        reference_number?: string;
        amount: string;
        budget_line_id?: string;
        notes?: string;
      }
    ) =>
      request<{ document: DocumentItem; spend_record?: SpendRecord }>(
        `/documents/${documentId}/manual-entry`,
        {
          method: "POST",
          body: JSON.stringify(entryData),
        }
      ),
    getDownloadUrl: (documentId: string) =>
      request<{ document_id: string; download_url: string; expires_in: number }>(
        `/documents/${documentId}/download-url`
      ),
  },

  budget: {
    getCurrent: (projectId: string) =>
      request<{ budget_id: string; status: string; lines: BudgetLine[] }>(
        `/projects/${projectId}/budgets/current`
      ),
    approveBaseline: (budgetId: string) =>
      request<{ id: string; status: string; approved_at: string; message: string }>(
        `/budgets/${budgetId}/approve`,
        { method: "POST" }
      ),
    getChangeOrders: (projectId: string) =>
      request<ChangeOrder[]>(`/projects/${projectId}/change-orders`),
    createChangeOrder: (
      projectId: string,
      data: {
        title: string;
        scope_description: string;
        requested_amount: string;
        target_budget_line_id: string;
        funding_source: ChangeOrder["funding_source"];
      }
    ) =>
      request<ChangeOrder>(`/projects/${projectId}/change-orders`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    approveChangeOrder: (changeOrderId: string, approvedAmount?: string) =>
      request<ChangeOrder>(`/change-orders/${changeOrderId}/approve`, {
        method: "POST",
        body: JSON.stringify({ approved_amount: approvedAmount }),
      }),
    rejectChangeOrder: (changeOrderId: string, reason: string) =>
      request<ChangeOrder>(`/change-orders/${changeOrderId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    moveContingency: (
      projectId: string,
      amount: string,
      destinationLineId: string,
      reason: string
    ) =>
      request<ContingencyMovement>(`/projects/${projectId}/contingency-movements`, {
        method: "POST",
        body: JSON.stringify({
          amount,
          destination_line_id: destinationLineId,
          reason,
        }),
      }),
    linkMilestone: (budgetLineId: string, milestoneId: string | null) =>
      request<BudgetLine>(`/budget-lines/${budgetLineId}/milestone`, {
        method: "PATCH",
        body: JSON.stringify({ milestone_id: milestoneId }),
      }),
  },

  spend: {
    getFinancialAccounts: () =>
      request<FinancialAccount[]>("/financial-accounts"),
    getStatementPeriods: (accountId: string) =>
      request<StatementPeriod[]>(`/financial-accounts/${accountId}/statement-periods`),
    signoffStatementPeriod: (periodId: string, waiverReason?: string) =>
      request<{ id: string; reconciled_status: string; signed_off_at: string; message: string; period: StatementPeriod }>(
        `/statement-periods/${periodId}/signoff`,
        {
          method: "POST",
          body: JSON.stringify({ waiver_reason: waiverReason }),
        }
      ),
    getTransactions: (projectId: string) =>
      request<FinancialTransaction[]>(`/projects/${projectId}/transactions`),
    linkInvoice: (transactionId: string, documentId: string, notes?: string) =>
      request<FinancialTransaction>(`/transactions/${transactionId}/link-invoice`, {
        method: "POST",
        body: JSON.stringify({ document_id: documentId, notes }),
      }),
    classifyCardSettlement: (transactionId: string, notes?: string) =>
      request<FinancialTransaction>(`/transactions/${transactionId}/classify-card-settlement`, {
        method: "POST",
        body: JSON.stringify({ notes }),
      }),
    getReconciliationQueue: (projectId: string) =>
      request<{ matches: ReconciliationMatch[]; total_pending: number }>(
        `/projects/${projectId}/reconciliation/queue`
      ),
    decideMatch: (
      matchId: string,
      decision: "ACCEPT" | "SPLIT" | "REMAP" | "EXCLUDE" | "MARK_TRANSFER",
      payload?: {
        rationale?: string;
        target_budget_line_id?: string;
        to_project_id?: string;
        allocations?: Array<{ budget_line_id: string; budget_line_name?: string; amount: string }>;
      }
    ) =>
      request<ReconciliationMatch>(
        `/reconciliation-matches/${matchId}/decision`,
        {
          method: "POST",
          body: JSON.stringify({
            decision,
            rationale: payload?.rationale,
            target_budget_line_id: payload?.target_budget_line_id,
            to_project_id: payload?.to_project_id,
            allocations: payload?.allocations,
          }),
        }
      ),
    getImportBatches: (projectId: string) =>
      request<ImportBatch[]>(`/projects/${projectId}/import-batches`),
    getImportBatchById: (batchId: string) =>
      request<ImportBatch>(`/import-batches/${batchId}`),
    createImportBatch: (
      projectId: string,
      batchData: {
        adapter: string;
        version: string;
        raw_content: string;
        column_mapping: Record<string, string>;
        financial_account_id?: string;
        control_total?: number;
      }
    ) =>
      request<ImportBatch>(`/projects/${projectId}/import-batches`, {
        method: "POST",
        body: JSON.stringify(batchData),
      }),
    allocateSpend: (
      projectId: string,
      spendRecordId: string,
      allocations: Array<{ budget_line_id: string; amount: string }>
    ) =>
      request<SpendRecord>(`/projects/${projectId}/spend-records/${spendRecordId}/allocations`, {
        method: "POST",
        body: JSON.stringify({ allocations }),
      }),
    getInterProjectTransfers: (projectId: string) =>
      request<InterProjectTransfer[]>(`/projects/${projectId}/inter-project-transfers`),
    createInterProjectTransfer: (
      projectId: string,
      data: {
        to_project_id: string;
        amount: string;
        notes: string;
        transfer_date?: string;
      }
    ) =>
      request<InterProjectTransfer>(`/projects/${projectId}/inter-project-transfers`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    repayInterProjectTransfer: (
      transferId: string,
      repaidAmount: string,
      repaidDate?: string,
      notes?: string
    ) =>
      request<InterProjectTransfer>(`/inter-project-transfers/${transferId}/repay`, {
        method: "POST",
        body: JSON.stringify({
          repaid_amount: repaidAmount,
          repaid_date: repaidDate,
          notes,
        }),
      }),
  },

  draws: {
    list: (projectId: string) =>
      request<DrawItem[]>(`/projects/${projectId}/draws`),
    getById: (drawId: string) => request<DrawItem>(`/draws/${drawId}`),
    create: (
      projectId: string,
      data: {
        draw_number: number;
        period_start: string;
        period_end: string;
        lender_name?: string;
        lines: Array<{ budget_line_id: string; requested_amount: string }>;
      }
    ) =>
      request<DrawItem>(`/projects/${projectId}/draws`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    verifyWork: (drawId: string, notes?: string) =>
      request<{ draw: DrawItem; verified: boolean; verified_by: string; verified_at: string; notes: string }>(
        `/draws/${drawId}/verify-work`,
        {
          method: "POST",
          body: JSON.stringify({ notes }),
        }
      ),
    verifyCost: (drawId: string, notes?: string) =>
      request<{ draw: DrawItem; costs_verified: boolean; prior_payments_verified: boolean; verified_by: string }>(
        `/draws/${drawId}/verify-cost`,
        {
          method: "POST",
          body: JSON.stringify({ notes }),
        }
      ),
    markSubmitted: (drawId: string) =>
      request<DrawItem>(`/draws/${drawId}/mark-submitted`, {
        method: "POST",
      }),
    recordLenderDecision: (
      drawId: string,
      data: {
        recommended_amount: string;
        approved_amount: string;
        lender_notes?: string;
        line_decisions?: Array<{ line_id: string; recommended_amount: string; approved_amount: string; lender_notes?: string }>;
      }
    ) =>
      request<DrawItem>(`/draws/${drawId}/lender-decision`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createRevision: (
      drawId: string,
      data: {
        revision_reason: string;
        requested_amount?: string;
        lines?: Array<{ budget_line_id: string; requested_amount: string }>;
      }
    ) =>
      request<DrawItem>(`/draws/${drawId}/revisions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    resolveCondition: (drawId: string, conditionId: string, notes?: string) =>
      request<DrawItem>(`/draws/${drawId}/conditions/${conditionId}/resolve`, {
        method: "POST",
        body: JSON.stringify({ notes }),
      }),
    getPacket: (drawId: string) =>
      request<{
        draw_id: string;
        checklist: Array<{ id: string; requirement: string; status: string; document_name?: string }>;
        portal_summary: { vendor_count: number; total_requested: string; retainage_withheld: string; net_payable: string; commitment_id?: string };
      }>(`/draws/${drawId}/packet`),
    getUnallocatedFunding: (projectId: string) =>
      request<{
        project_id: string;
        unallocated_deposits: Array<{
          transaction_id: string;
          institution: string;
          amount: string;
          cleared_date: string;
          memo: string;
        }>;
        total_unallocated: string;
      }>(`/projects/${projectId}/funding/unallocated`),
    allocateFunding: (drawId: string, transactionId: string, amount: string) =>
      request<DrawItem>(`/draws/${drawId}/fundings`, {
        method: "POST",
        body: JSON.stringify({
          transaction_id: transactionId,
          amount,
        }),
      }),
  },

  progress: {
    getMilestones: (projectId: string) =>
      request<MilestoneItem[]>(`/projects/${projectId}/milestones`),
    getMilestoneById: (milestoneId: string) =>
      request<MilestoneItem>(`/milestones/${milestoneId}`),
    createMilestone: (projectId: string, data: Partial<MilestoneItem>) =>
      request<MilestoneItem>(`/projects/${projectId}/milestones`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateMilestone: (
      milestoneId: string,
      data: Partial<MilestoneItem> & { update_rationale?: string }
    ) =>
      request<MilestoneItem>(`/milestones/${milestoneId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    attachEvidence: (milestoneId: string, data: Partial<MilestoneEvidence>) =>
      request<MilestoneEvidence>(`/milestones/${milestoneId}/evidence`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    resolveDiscrepancy: (
      milestoneId: string,
      data: {
        action: "ACCEPT_INSPECTION" | "SUBMIT_REBUTTAL" | "OVERRIDE_JOINT";
        resolution_note: string;
        agreed_percent?: number;
      }
    ) =>
      request<MilestoneItem>(`/milestones/${milestoneId}/resolve-discrepancy`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getScheduleForecast: (projectId: string) =>
      request<ScheduleForecast>(`/projects/${projectId}/schedule/forecast`),
  },

  economics: {
    getEconomics: (projectId: string) =>
      request<ProjectEconomics>(`/projects/${projectId}/economics`),
    getProForma: (projectId: string) =>
      request<ProFormaLineItem[]>(`/projects/${projectId}/pro-forma`),
    getInvestorContributions: (projectId: string) =>
      request<InvestorContribution[]>(`/projects/${projectId}/investors/contributions`),
    recordInvestorContribution: (
      projectId: string,
      data: Partial<InvestorContribution>
    ) =>
      request<InvestorContribution>(`/projects/${projectId}/investors/contributions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getInvestorDistributions: (projectId: string) =>
      request<InvestorDistribution[]>(`/projects/${projectId}/investors/distributions`),
    recordInvestorDistribution: (
      projectId: string,
      data: Partial<InvestorDistribution>
    ) =>
      request<InvestorDistribution>(`/projects/${projectId}/investors/distributions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getDispositionUnits: (projectId: string) =>
      request<DispositionUnit[]>(`/projects/${projectId}/disposition/units`),
    recordDispositionSale: (
      projectId: string,
      unitId: string,
      data: Partial<DispositionUnit>
    ) =>
      request<DispositionUnit>(`/projects/${projectId}/disposition/units/${unitId}/sale`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getCloseoutReport: (projectId: string) =>
      request<CloseoutReport>(`/projects/${projectId}/closeout/report`),
    approveCloseout: (
      projectId: string,
      data: { is_exception_override?: boolean; rationale: string }
    ) =>
      request<CloseoutReport>(`/projects/${projectId}/closeout/approve`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    recordPostCloseoutAdjustment: (
      projectId: string,
      data: Partial<PostCloseoutAdjustment>
    ) =>
      request<PostCloseoutAdjustment>(`/projects/${projectId}/post-closeout-adjustments`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  investor: {
    getSharedProjects: () => request<Project[]>("/investor/projects"),
    getUpdateSnapshot: (updateId: string) =>
      request<InvestorUpdateSnapshot>(`/investor/updates/${updateId}`),
    listUpdates: (projectId: string) =>
      request<InvestorUpdateSnapshot[]>(`/projects/${projectId}/investor-updates`),
    generateDraft: (projectId: string) =>
      request<InvestorUpdateSnapshot>(`/projects/${projectId}/investor-updates/generate-draft`, {
        method: "POST",
      }),
    saveDraft: (projectId: string, data: Partial<InvestorUpdateSnapshot>) =>
      request<InvestorUpdateSnapshot>(`/projects/${projectId}/investor-updates/draft`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    publish: (updateId: string, data: PublishInvestorUpdatePayload) =>
      request<InvestorUpdateSnapshot>(`/investor/updates/${updateId}/publish`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    withdraw: (updateId: string, data: WithdrawInvestorUpdatePayload) =>
      request<InvestorUpdateSnapshot>(`/investor/updates/${updateId}/withdraw`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  alerts: {
    list: (projectId: string) =>
      request<AlertItem[]>(`/projects/${projectId}/alerts`),
    resolveAlert: (alertId: string, resolutionNote?: string) =>
      request<AlertItem>(`/alerts/${alertId}/resolve`, {
        method: "POST",
        body: JSON.stringify({ resolution_note: resolutionNote }),
      }),
    waiveAlert: (alertId: string, payload: WaiveAlertPayload) =>
      request<AlertItem>(`/alerts/${alertId}/waive`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    escalateAlert: (alertId: string, payload: EscalateAlertPayload) =>
      request<AlertItem>(`/alerts/${alertId}/escalate`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getDataQualityIssues: (projectId: string) =>
      request<DataQualityIssue[]>(`/projects/${projectId}/data-quality-issues`),
    resolveDataQualityIssue: (dqiId: string, payload?: ResolveDqiPayload) =>
      request<DataQualityIssue>(`/data-quality-issues/${dqiId}/resolve`, {
        method: "POST",
        body: JSON.stringify(payload || {}),
      }),
    waiveDataQualityIssue: (dqiId: string, reason: string) =>
      request<DataQualityIssue>(`/data-quality-issues/${dqiId}/waive`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    getAuditEvents: () => request<AuditEvent[]>("/audit-events"),
  },

  notifications: {
    list: (projectId?: string) => {
      const qs = projectId ? `?project_id=${projectId}` : "";
      return request<NotificationItem[]>(`/notifications${qs}`);
    },
    markRead: (id: string) =>
      request<NotificationItem>(`/notifications/${id}/read`, {
        method: "POST",
      }),
    markAllRead: (projectId?: string) => {
      const qs = projectId ? `?project_id=${projectId}` : "";
      return request<{ success: boolean; count: number }>(`/notifications/read-all${qs}`, {
        method: "POST",
      });
    },
  },

  team: {
    list: (projectId: string) =>
      request<TeamMember[]>(`/projects/${projectId}/team`),
    invite: (_projectId: string, payload: InviteTeamMemberPayload) =>
      request<ProjectInvitation>("/invitations", {
        method: "POST",
        body: JSON.stringify({
          email: payload.email,
          role: payload.role,
          project_id: payload.project_id,
          scope: "PROJECT",
        }),
      }),
    updateRole: (projectId: string, id: string, payload: UpdateTeamMemberRolePayload) =>
      request<{ status: string }>(`/projects/${projectId}/members/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: payload.role }),
      }),
    revoke: (projectId: string, id: string) =>
      request<{ status: string }>(`/projects/${projectId}/members/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: "REMOVE" }),
      }),
  },

  exports: {
    list: (projectId: string) =>
      request<ReportExportItem[]>(`/projects/${projectId}/exports`),
    request: (projectId: string, payload: RequestExportPayload) =>
      request<ReportExportItem>(`/projects/${projectId}/exports/request`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  onboarding: {
    getCurrentSession: (projectId?: string) =>
      request<OnboardingSession>(
        `/onboarding/sessions/current${projectId ? `?project_id=${encodeURIComponent(projectId)}` : ""}`
      ),
    submitAnswer: (
      sessionId: string,
      questionKey: string,
      answerValue: string,
      answerType: SpecialAnswerType = "STANDARD",
      reason?: string,
      questionVersion = "v1.0",
      otherSpecification?: string
    ) =>
      request<import("@/lib/types").OnboardingAnswer>(`/onboarding/sessions/${sessionId}/answers`, {
        method: "POST",
        body: JSON.stringify({
          question_key: questionKey,
          question_version: questionVersion,
          answer_payload:
            answerType === "STANDARD"
              ? {
                  value: answerValue,
                  ...(otherSpecification ? { other_specification: otherSpecification } : {}),
                }
              : { special: answerType, reason },
        }),
      }),
    getTasks: (projectId: string) =>
      request<OnboardingTask[]>(`/projects/${projectId}/onboarding/tasks`),
  },

  readiness: {
    getProjectReadiness: (projectId: string) =>
      request<ProjectReadiness>(`/projects/${projectId}/readiness`),
    approveConfiguration: (versionId: string) =>
      request<ConfigurationVersion>(`/configuration-versions/${versionId}/approve`, {
        method: "POST",
      }),
    rejectConfiguration: (versionId: string, reason: string) =>
      request<ConfigurationVersion>(`/configuration-versions/${versionId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
  },

  invitations: {
    list: () => request<ProjectInvitation[]>("/invitations"),
    getByToken: (token: string) =>
      request<ProjectInvitation>(`/invitations/${token}`),
    accept: (token: string, fullName: string, password?: string) =>
      request<{ user: UserProfile; session: OnboardingSession }>(`/invitations/${token}/accept`, {
        method: "POST",
        body: JSON.stringify({ full_name: fullName, password }),
      }),
    create: (inviteData: {
      email: string;
      role: import("@/lib/types").UserRole;
      project_id?: string;
      scope?: string;
    }) =>
      request<ProjectInvitation>("/invitations", {
        method: "POST",
        body: JSON.stringify(inviteData),
      }),
  },

  submissions: {
    list: (projectId: string, params?: { status?: string; type?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set("status", params.status);
      if (params?.type) query.set("type", params.type);
      const qs = query.toString() ? `?${query.toString()}` : "";
      return request<GCSubmission[]>(`/projects/${projectId}/submissions${qs}`);
    },
    getById: (id: string) => request<GCSubmission>(`/submissions/${id}`),
    create: (projectId: string, payload: CreateGCSubmissionPayload) =>
      request<GCSubmission>(`/projects/${projectId}/submissions`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    review: (id: string, payload: ReviewGCSubmissionPayload) =>
      request<GCSubmission>(`/submissions/${id}/review`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    checkDuplicateInvoice: (projectId: string, payload: { invoice_number: string; amount?: string }) =>
      request<DuplicateInvoiceCheckResult>(`/projects/${projectId}/check-duplicate-invoice`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
};
