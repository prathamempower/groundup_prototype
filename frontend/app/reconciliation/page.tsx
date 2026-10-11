"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { formatMoney, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banner } from "@/components/ui/banner";
import { SourcesButton } from "@/components/ui/source-panel";
import {
  Scale,
  Check,
  Split,
  ArrowRightLeft,
  ShieldAlert,
  UploadCloud,
  FileSpreadsheet,
  Building2,
  CreditCard,
  Layers,
  Sparkles,
  Link2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Info,
} from "lucide-react";

import { ImportWizardModal } from "@/components/reconciliation/import-wizard-modal";
import { SplitAllocationModal } from "@/components/reconciliation/split-allocation-modal";
import { RemapCategoryModal } from "@/components/reconciliation/remap-category-modal";
import { ExcludeTransactionModal } from "@/components/reconciliation/exclude-transaction-modal";
import { TransferModal } from "@/components/reconciliation/transfer-modal";
import { RepayTransferModal } from "@/components/reconciliation/repay-transfer-modal";
import { StatementPeriodSignoffModal } from "@/components/reconciliation/statement-period-signoff-modal";
import { LinkInvoiceModal } from "@/components/reconciliation/link-invoice-modal";
import { CardSettlementModal } from "@/components/reconciliation/card-settlement-modal";

import {
  ReconciliationMatch,
  FinancialTransaction,
  StatementPeriod,
  InterProjectTransfer,
  ImportBatch,
} from "@/lib/types";

export default function ReconciliationPage() {
  const queryClient = useQueryClient();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "queue" | "transactions" | "statement-periods" | "transfers" | "import-batches"
  >("queue");

  // Filters for Transactions tab
  const [txnFilter, setTxnFilter] = useState<"ALL" | "CLEARED" | "PENDING" | "TRANSFERS" | "LIABILITY">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [splitMatch, setSplitMatch] = useState<ReconciliationMatch | null>(null);
  const [remapMatch, setRemapMatch] = useState<ReconciliationMatch | null>(null);
  const [excludeMatch, setExcludeMatch] = useState<ReconciliationMatch | null>(null);
  const [transferMatch, setTransferMatch] = useState<ReconciliationMatch | null>(null);
  const [linkInvoiceTarget, setLinkInvoiceTarget] = useState<{
    match?: ReconciliationMatch;
    transaction?: FinancialTransaction;
  } | null>(null);
  const [cardSettlementTarget, setCardSettlementTarget] = useState<{
    match?: ReconciliationMatch;
    transaction?: FinancialTransaction;
  } | null>(null);
  const [signoffPeriod, setSignoffPeriod] = useState<StatementPeriod | null>(null);
  const [repayTransfer, setRepayTransfer] = useState<InterProjectTransfer | null>(null);

  // Data Queries
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const projects = projectsData?.data?.projects || [];
  const currentProjectId = projectsData?.data?.current_project_id || "";
  const currentProject = projects.find((p) => p.id === currentProjectId);

  const { data: recQueueData, isLoading: isQueueLoading } = useQuery({
    queryKey: ["reconciliation-queue", currentProjectId],
    queryFn: () => api.spend.getReconciliationQueue(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const { data: txnsData, isLoading: isTxnsLoading } = useQuery({
    queryKey: ["transactions", currentProjectId],
    queryFn: () => api.spend.getTransactions(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const { data: accountsData } = useQuery({
    queryKey: ["financial-accounts"],
    queryFn: () => api.spend.getFinancialAccounts(),
  });

  const accounts = accountsData?.data || [];
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const activeAccountId = selectedAccountId || accounts[0]?.id || "acc_bcb_73";
  const selectedAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  const { data: periodsData } = useQuery({
    queryKey: ["statement-periods", activeAccountId],
    queryFn: () => api.spend.getStatementPeriods(activeAccountId),
    enabled: Boolean(activeAccountId),
  });

  const { data: transfersData } = useQuery({
    queryKey: ["inter-project-transfers", currentProjectId],
    queryFn: () => api.spend.getInterProjectTransfers(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const { data: importBatchesData } = useQuery({
    queryKey: ["import-batches", currentProjectId],
    queryFn: () => api.spend.getImportBatches(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const { data: budgetData } = useQuery({
    queryKey: ["budget-current", currentProjectId],
    queryFn: () => api.budget.getCurrent(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const { data: docsData } = useQuery({
    queryKey: ["documents", currentProjectId],
    queryFn: () => api.documents.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const matches = recQueueData?.data?.matches || [];
  const pendingMatches = matches.filter((m) => m.status === "PENDING_REVIEW");
  const transactions = txnsData?.data || [];
  const periods = periodsData?.data || [];
  const transfers = transfersData?.data || [];
  const importBatches = importBatchesData?.data || [];
  const budgetLines = budgetData?.data?.lines || [];
  const documents = docsData?.data || [];

  // Mutations
  const acceptMatchMutation = useMutation({
    mutationFn: (matchId: string) => api.spend.decideMatch(matchId, "ACCEPT"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reconciliation-queue", currentProjectId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", currentProjectId] });
      queryClient.invalidateQueries({ queryKey: ["budget-current", currentProjectId] });
    },
  });

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["reconciliation-queue", currentProjectId] });
    queryClient.invalidateQueries({ queryKey: ["transactions", currentProjectId] });
    queryClient.invalidateQueries({ queryKey: ["statement-periods", activeAccountId] });
    queryClient.invalidateQueries({ queryKey: ["inter-project-transfers", currentProjectId] });
    queryClient.invalidateQueries({ queryKey: ["import-batches", currentProjectId] });
    queryClient.invalidateQueries({ queryKey: ["data-quality-issues", currentProjectId] });
  };

  // KPI Calculations
  const pendingDollars = pendingMatches.reduce(
    (sum, m) => sum + parseInt(m.amount, 10),
    0
  );
  const unclearedTxns = transactions.filter((t) => t.cleared_status === "PENDING");
  const unclearedDollars = unclearedTxns.reduce(
    (sum, t) => sum + parseInt(t.amount, 10),
    0
  );
  const activeTransfersTotal = transfers
    .filter((t) => t.status === "ACTIVE_TEMPORARY")
    .reduce(
      (sum, t) => sum + (parseInt(t.amount, 10) - parseInt(t.repaid_amount || "0", 10)),
      0
    );

  const reconciledPeriodsCount = periods.filter((p) => p.reconciled_status === "RECONCILED").length;
  const coveragePct = periods.length > 0 ? Math.round((reconciledPeriodsCount / periods.length) * 100) : 100;

  // Filtered Transactions
  const filteredTransactions = transactions.filter((txn) => {
    if (txnFilter === "CLEARED" && txn.cleared_status !== "CLEARED") return false;
    if (txnFilter === "PENDING" && txn.cleared_status !== "PENDING") return false;
    if (txnFilter === "TRANSFERS" && !txn.is_transfer) return false;
    if (txnFilter === "LIABILITY" && !txn.is_liability_settlement) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        txn.counterparty.toLowerCase().includes(q) ||
        txn.memo.toLowerCase().includes(q) ||
        txn.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <PageHeader
        title="Reconciliation Workbench"
        statusBadge={{
          label: `${pendingMatches.length} Pending AI Matches`,
          variant: pendingMatches.length > 0 ? "warning" : "success",
          icon: <Scale className="h-3.5 w-3.5" />,
        }}
        description="Verify bank statement lines against Schedule of Values (SOV) budget codes, enforce balanced allocations, and govern statement sign-offs."
        primaryAction={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setIsTransferModalOpen(true)}
              className="bg-surface"
            >
              <ArrowRightLeft className="h-4 w-4 mr-1.5 text-text-secondary" />
              New Transfer
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsImportOpen(true)}
            >
              <UploadCloud className="h-4 w-4 mr-1.5" />
              Import Statement (CSV / XLSX)
            </Button>
          </div>
        }
      />

      <div className="px-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-xs relative">
            <div className="flex items-start justify-between">
              <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                Reconciliation Queue
              </span>
              <SourcesButton
                figureLabel="Reconciliation Queue Volume"
                amountOrValue={formatMoney(String(pendingDollars))}
                basis="Sum of AI proposed budget matches awaiting CFO confirmation"
                citations={[
                  {
                    document_id: "doc_bcb_sept",
                    document_name: "BCB_Operating_Sept2025.csv",
                    sheet_name: "Transactions",
                    row_number: 14,
                    reviewer: "Sarah Lin",
                    reviewed_at: "2025-10-01T08:30:00Z",
                    extraction_version: "v1.0",
                  },
                ]}
              />
            </div>
            <div className="mt-2 text-title font-bold text-text-primary tabular-nums">
              {formatMoney(String(pendingDollars))}
            </div>
            <p className="mt-1 text-caption text-text-secondary flex items-center gap-1.5">
              <span className="font-semibold text-amber-700">{pendingMatches.length} proposals</span> awaiting human review
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 shadow-xs relative">
            <div className="flex items-start justify-between">
              <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                Uncleared Cash
              </span>
              <SourcesButton
                figureLabel="Uncleared Transactions"
                amountOrValue={formatMoney(String(unclearedDollars))}
                basis="In-flight checks and pending wire disbursements awaiting cleared bank posting"
                citations={[
                  {
                    document_id: "doc_columbia_draw3",
                    document_name: "Columbia_Bank_Draw_3_Ledger.pdf",
                    page_number: 2,
                    reviewer: "Sarah Lin",
                    reviewed_at: "2025-09-29T11:00:00Z",
                    extraction_version: "v1.0",
                  },
                ]}
              />
            </div>
            <div className="mt-2 text-title font-bold text-text-primary tabular-nums">
              {formatMoney(String(unclearedDollars))}
            </div>
            <p className="mt-1 text-caption text-text-secondary">
              {unclearedTxns.length} in-flight bank disbursements
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 shadow-xs relative">
            <div className="flex items-start justify-between">
              <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                Statement Coverage
              </span>
              <SourcesButton
                figureLabel="Statement Coverage Ratio"
                amountOrValue={`${coveragePct}%`}
                basis="Percentage of active statement periods signed off with verified opening and closing balance controls"
                citations={[
                  {
                    document_id: "doc_bcb_statements",
                    document_name: "BCB_Community_Bank_Operating_Statements_2025.pdf",
                    page_number: 8,
                    reviewer: "Sarah Lin",
                    reviewed_at: "2025-09-30T16:00:00Z",
                    extraction_version: "v1.2",
                  },
                ]}
              />
            </div>
            <div className="mt-2 text-title font-bold text-text-primary tabular-nums">
              {coveragePct}%
            </div>
            <p className="mt-1 text-caption text-text-secondary">
              {reconciledPeriodsCount} of {periods.length || 2} periods verified & signed off
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 shadow-xs relative">
            <div className="flex items-start justify-between">
              <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                Active Transfers
              </span>
              <SourcesButton
                figureLabel="Active Inter-Project Transfers"
                amountOrValue={formatMoney(String(activeTransfersTotal))}
                basis="Temporary inter-project loans tracked on balance sheet. Does not impact project budget or profit."
                citations={[
                  {
                    document_id: "doc_woodlawn_agreement",
                    document_name: "Inter_Company_Loan_Agreement_Woodlawn.pdf",
                    page_number: 1,
                    reviewer: "Sarah Lin",
                    reviewed_at: "2025-08-20T14:00:00Z",
                    extraction_version: "v1.0",
                  },
                ]}
              />
            </div>
            <div className="mt-2 text-title font-bold text-amber-700 tabular-nums">
              {formatMoney(String(activeTransfersTotal))}
            </div>
            <p className="mt-1 text-caption text-text-secondary">
              Zero P&L impact • Repayment tracked
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab("queue")}
              className={`flex items-center gap-2 py-3 border-b-2 text-body font-medium transition-colors ${
                activeTab === "queue"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Reconciliation Queue
              {pendingMatches.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-caption font-semibold text-amber-800">
                  {pendingMatches.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-2 py-3 border-b-2 text-body font-medium transition-colors ${
                activeTab === "transactions"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Layers className="h-4 w-4" />
              Transactions Register
              <span className="ml-1 text-caption text-text-muted">({transactions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("statement-periods")}
              className={`flex items-center gap-2 py-3 border-b-2 text-body font-medium transition-colors ${
                activeTab === "statement-periods"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Statement Periods & Sign-Off
            </button>

            <button
              onClick={() => setActiveTab("transfers")}
              className={`flex items-center gap-2 py-3 border-b-2 text-body font-medium transition-colors ${
                activeTab === "transfers"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Inter-Project Transfers
              {transfers.length > 0 && (
                <span className="ml-1 text-caption text-text-muted">({transfers.length})</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("import-batches")}
              className={`flex items-center gap-2 py-3 border-b-2 text-body font-medium transition-colors ${
                activeTab === "import-batches"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Import Batches
            </button>
          </nav>
        </div>

        {/* TAB 1: RECONCILIATION QUEUE */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-section font-semibold text-text-primary">
                  Proposed Matches Pending Human Review
                </h3>
                <p className="text-body text-text-secondary">
                  AI suggestions are proposals only. Confirm, split, remap, or transfer transactions to maintain accounting integrity.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportOpen(true)}
              >
                <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
                Import More Statements
              </Button>
            </div>

            {isQueueLoading ? (
              <div className="p-12 text-center text-body text-text-muted bg-surface rounded-lg border border-border">
                Loading reconciliation queue...
              </div>
            ) : matches.length === 0 ? (
              <div className="p-12 text-center bg-surface rounded-lg border border-border">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h3 className="mt-2 text-section font-semibold text-text-primary">
                  All Transactions Reconciled
                </h3>
                <p className="mt-1 text-body text-text-secondary">
                  No unallocated disbursements or pending review proposals in queue.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((item) => {
                  const isPending = item.status === "PENDING_REVIEW";
                  const isAccepted = item.status === "ACCEPTED";
                  const isSplit = item.status === "SPLIT";
                  const isExcluded = item.status === "EXCLUDED";
                  const isTransfer = item.status === "TRANSFER";
                  const isMissingInvoice = item.invoice_reference === "MISSING_INVOICE";

                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border bg-surface p-5 transition-all shadow-xs ${
                        isPending
                          ? "border-border hover:border-border-strong"
                          : "border-border/60 opacity-80 bg-subtle/50"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Transaction & Match Details */}
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-section font-bold text-text-primary">
                              {item.counterparty}
                            </span>

                            <StatusBadge
                              status={
                                isAccepted || isSplit
                                  ? "verified"
                                  : isExcluded
                                  ? "blocked"
                                  : isTransfer
                                  ? "proposed"
                                  : "provisional"
                              }
                              customLabel={item.status.replace("_", " ")}
                            />

                            {/* Confidence Score Badge */}
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-caption font-semibold text-primary">
                              <Sparkles className="h-3 w-3" />
                              {Math.round(item.confidence * 100)}% Confidence
                            </div>

                            {/* Evidence Strength Badge */}
                            <StatusBadge
                              status={
                                item.evidence_strength === "VERIFIED_INVOICE"
                                  ? "verified"
                                  : item.evidence_strength === "GC_CONFIRMATION"
                                  ? "proposed"
                                  : "provisional"
                              }
                              customLabel={item.evidence_strength.replace("_", " ")}
                            />

                            {/* Missing Invoice Warning */}
                            {isMissingInvoice && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-caption font-semibold text-amber-800">
                                <AlertTriangle className="h-3 w-3" />
                                Missing Invoice Evidence
                              </span>
                            )}
                          </div>

                          {/* Proposed Budget Line */}
                          <div className="flex items-center gap-2 text-body">
                            <span className="text-text-secondary">Proposed Target:</span>
                            <span className="font-semibold text-text-primary bg-subtle px-2 py-0.5 rounded border border-border">
                              {item.proposed_budget_line_name}
                            </span>
                            {item.is_liability_settlement && (
                              <span className="text-caption text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                Card Settlement (Liability)
                              </span>
                            )}
                          </div>

                          {/* Matching Reasons */}
                          {item.confidence_reasons && item.confidence_reasons.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-caption font-semibold uppercase tracking-wider text-text-muted block">
                                Matching Factors
                              </span>
                              <ul className="text-caption text-text-secondary space-y-0.5">
                                {item.confidence_reasons.map((r, i) => (
                                  <li key={i} className="flex items-center gap-1.5">
                                    <Check className="h-3 w-3 text-primary shrink-0" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Meta line */}
                          <div className="text-caption text-text-muted">
                            Date: {formatDate(item.transaction_date)} • Ref: {item.transaction_id}
                            {item.remap_rationale && ` • Remap Rationale: ${item.remap_rationale}`}
                            {item.exclusion_rationale && ` • Exclusion Note: ${item.exclusion_rationale}`}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-caption text-text-secondary block">Transaction Amount</span>
                            <span className="text-title font-bold text-text-primary tabular-nums">
                              {formatMoney(item.amount)}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          {isPending ? (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => acceptMatchMutation.mutate(item.id)}
                                disabled={acceptMatchMutation.isPending}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Accept
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSplitMatch(item)}
                              >
                                <Split className="h-3.5 w-3.5 mr-1" /> Split
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRemapMatch(item)}
                              >
                                Remap
                              </Button>

                              {isMissingInvoice && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setLinkInvoiceTarget({ match: item })}
                                  className="text-amber-800 border-amber-300 bg-amber-50/50 hover:bg-amber-100/60"
                                >
                                  <Link2 className="h-3.5 w-3.5 mr-1" /> Link Invoice
                                </Button>
                              )}

                              {item.is_liability_settlement ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCardSettlementTarget({ match: item })}
                                  className="text-blue-800 border-blue-300 bg-blue-50/50"
                                >
                                  <CreditCard className="h-3.5 w-3.5 mr-1" /> Classify Settlement
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setTransferMatch(item)}
                                >
                                  Transfer
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExcludeMatch(item)}
                                className="text-text-muted hover:text-red-700"
                              >
                                Exclude
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-caption font-medium text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> Reconciled & Logged
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRANSACTIONS REGISTER */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["ALL", "CLEARED", "PENDING", "TRANSFERS", "LIABILITY"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTxnFilter(tab)}
                    className={`px-3 py-1.5 rounded-md text-caption font-semibold transition-all ${
                      txnFilter === tab
                        ? "bg-primary text-white"
                        : "bg-subtle text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {tab === "ALL" && `All Transactions (${transactions.length})`}
                    {tab === "CLEARED" && "Cleared Only"}
                    {tab === "PENDING" && `Pending (${unclearedTxns.length})`}
                    {tab === "TRANSFERS" && "Inter-Project Transfers"}
                    {tab === "LIABILITY" && "Card Settlements"}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search payee or memo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface pl-9 pr-3 py-1.5 text-body placeholder:text-text-muted focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-subtle text-caption font-semibold uppercase tracking-wider text-text-secondary">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Payee / Description</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Direction</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Evidence Link</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTransactions.slice(0, 30).map((txn) => {
                      const isCredit = txn.direction === "CREDIT";
                      return (
                        <tr key={txn.id} className="hover:bg-subtle/70 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-text-secondary text-caption font-medium">
                            {formatDate(txn.transaction_date)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-text-primary">{txn.counterparty}</div>
                            <div className="text-caption text-text-muted truncate max-w-xs">{txn.memo}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-caption text-text-secondary">
                            {txn.account_ref}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-caption font-semibold px-2 py-0.5 rounded ${
                                isCredit
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-subtle text-text-secondary"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="h-3 w-3 text-emerald-700" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3 text-text-muted" />
                              )}
                              {txn.direction}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right font-semibold tabular-nums">
                            <span className={isCredit ? "text-emerald-700" : "text-text-primary"}>
                              {isCredit ? "+" : "-"}{formatMoney(txn.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge
                              status={
                                txn.cleared_status === "CLEARED"
                                  ? "verified"
                                  : txn.cleared_status === "PENDING"
                                  ? "provisional"
                                  : "under_review"
                              }
                              customLabel={txn.cleared_status}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-caption">
                            {txn.document_id ? (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <Link2 className="h-3.5 w-3.5" />
                                {txn.invoice_reference || "Verified Invoice"}
                              </span>
                            ) : (
                              <span className="text-text-muted">Unlinked</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!txn.document_id && (
                                <button
                                  onClick={() => setLinkInvoiceTarget({ transaction: txn })}
                                  className="text-caption font-medium text-primary hover:underline"
                                >
                                  Link Doc
                                </button>
                              )}
                              {!txn.is_liability_settlement && txn.counterparty.toLowerCase().includes("card") && (
                                <button
                                  onClick={() => setCardSettlementTarget({ transaction: txn })}
                                  className="text-caption font-medium text-blue-700 hover:underline ml-2"
                                >
                                  Classify Card
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredTransactions.length > 30 && (
                <div className="p-3 bg-subtle text-center text-caption text-text-secondary border-t border-border">
                  Showing 30 of {filteredTransactions.length} transactions
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STATEMENT PERIODS & SIGN-OFF */}
        {activeTab === "statement-periods" && (
          <div className="space-y-5">
            {/* Account Selector Strip */}
            <div className="flex items-center justify-between bg-surface p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-caption font-semibold text-text-secondary uppercase">
                    Financial Institution & Account
                  </span>
                  <p className="text-section font-bold text-text-primary">
                    {selectedAccount?.institution} ({selectedAccount?.masked_identifier})
                  </p>
                </div>
              </div>

              <div className="w-72">
                <select
                  className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
                  value={activeAccountId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.institution} ({a.masked_identifier})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Statement Periods Cards / Table */}
            <div className="space-y-4">
              {periods.map((period) => {
                const openAmt = parseInt(period.opening_balance, 10);
                const debitsAmt = parseInt(period.total_debits, 10);
                const creditsAmt = parseInt(period.total_credits, 10);
                const closeAmt = parseInt(period.closing_balance, 10);
                const computedClose = openAmt + creditsAmt - debitsAmt;
                const isBalanced = computedClose === closeAmt;
                const isReconciled = period.reconciled_status === "RECONCILED";

                return (
                  <div
                    key={period.id}
                    className="rounded-lg border border-border bg-surface p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-section font-bold text-text-primary">
                            Statement Period: {formatDate(period.period_start)} – {formatDate(period.period_end)}
                          </h4>
                          <StatusBadge
                            status={isReconciled ? "verified" : "provisional"}
                            customLabel={period.reconciled_status.replace("_", " ")}
                          />
                          <StatusBadge
                            status={period.coverage_status === "COMPLETE" ? "verified" : "provisional"}
                            customLabel={`Coverage: ${period.coverage_status}`}
                          />
                        </div>
                        {isReconciled && (
                          <p className="text-caption text-text-secondary mt-1">
                            Reconciled by <strong className="text-text-primary">{period.reconciled_by || "Sarah Lin"}</strong> on {formatDate(period.reconciled_at || "2025-09-30")}
                          </p>
                        )}
                      </div>

                      {!isReconciled && (
                        <Button
                          variant="primary"
                          onClick={() => setSignoffPeriod(period)}
                        >
                          <ShieldAlert className="h-4 w-4 mr-1.5" />
                          Review & Sign Off Period
                        </Button>
                      )}
                    </div>

                    {/* Balance Controls Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      <div className="p-3 bg-subtle rounded-md border border-border">
                        <span className="text-caption text-text-secondary block">Opening Balance</span>
                        <span className="text-body font-bold text-text-primary tabular-nums">
                          {formatMoney(period.opening_balance)}
                        </span>
                      </div>
                      <div className="p-3 bg-subtle rounded-md border border-border">
                        <span className="text-caption text-text-secondary block">+ Total Credits</span>
                        <span className="text-body font-bold text-emerald-700 tabular-nums">
                          +{formatMoney(period.total_credits)}
                        </span>
                      </div>
                      <div className="p-3 bg-subtle rounded-md border border-border">
                        <span className="text-caption text-text-secondary block">- Total Debits</span>
                        <span className="text-body font-bold text-text-primary tabular-nums">
                          -{formatMoney(period.total_debits)}
                        </span>
                      </div>
                      <div className="p-3 bg-subtle rounded-md border border-border">
                        <span className="text-caption text-text-secondary block">= Computed Close</span>
                        <span className="text-body font-bold text-text-primary tabular-nums">
                          {formatMoney(String(computedClose))}
                        </span>
                      </div>
                      <div className={`p-3 rounded-md border ${
                        isBalanced ? "bg-emerald-50/80 border-emerald-300" : "bg-red-50/80 border-red-300"
                      }`}>
                        <span className="text-caption text-text-secondary block">Statement Close</span>
                        <span className={`text-body font-bold tabular-nums ${isBalanced ? "text-emerald-900" : "text-red-900"}`}>
                          {formatMoney(period.closing_balance)}
                        </span>
                      </div>
                    </div>

                    {/* Balance Status Footer */}
                    <div className="flex items-center justify-between text-caption text-text-secondary pt-1">
                      <div className="flex items-center gap-1.5">
                        {isBalanced ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span>
                          {isBalanced
                            ? "Opening and closing cash controls verified with zero unallocated discrepancy."
                            : `Discrepancy of ${formatMoney(String(Math.abs(closeAmt - computedClose)))} detected between formula and transactions.`}
                        </span>
                      </div>
                      <span className="font-semibold">
                        {isBalanced ? "Math Control: PASS" : "Math Control: WAIVER REQUIRED"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: INTER-PROJECT TRANSFERS */}
        {activeTab === "transfers" && (
          <div className="space-y-4">
            {/* PRD Rule Banner */}
            <Banner
              variant="info"
              title="PRD Section 3.4: Inter-Project Transfer Integrity"
              message="Inter-project temporary cash advances are recorded strictly on the balance sheet transfer ledger. They never post to project expenses, revenues, or forecast net profit until formally converted to equity."
            />

            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="text-section font-semibold text-text-primary">
                  Inter-Project Transfers & Repayments Ledger
                </h3>
                <p className="text-body text-text-secondary">
                  Track cross-entity cash loans, security deposits, and settlement status.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsTransferModalOpen(true)}
              >
                <ArrowRightLeft className="h-4 w-4 mr-1.5" />
                Record New Transfer
              </Button>
            </div>

            {/* Transfers Table */}
            <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
              <table className="w-full text-left text-body border-collapse">
                <thead>
                  <tr className="border-b border-border bg-subtle text-caption font-semibold uppercase tracking-wider text-text-secondary">
                    <th className="px-4 py-3">Transfer Date</th>
                    <th className="px-4 py-3">From Entity</th>
                    <th className="px-4 py-3">To Entity</th>
                    <th className="px-4 py-3 text-right">Loan Amount</th>
                    <th className="px-4 py-3 text-right">Repaid Amount</th>
                    <th className="px-4 py-3 text-right">Outstanding</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Notes / Terms</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-text-muted">
                        No inter-project transfers recorded.
                      </td>
                    </tr>
                  ) : (
                    transfers.map((t) => {
                      const totalAmt = parseInt(t.amount, 10);
                      const repaid = parseInt(t.repaid_amount || "0", 10);
                      const outstanding = Math.max(0, totalAmt - repaid);
                      const isRepaid = t.status === "REPAID" || outstanding === 0;

                      return (
                        <tr key={t.id} className="hover:bg-subtle/60">
                          <td className="px-4 py-3 text-caption font-medium text-text-secondary whitespace-nowrap">
                            {formatDate(t.transfer_date)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-text-primary">
                            {t.from_project_name}
                          </td>
                          <td className="px-4 py-3 font-semibold text-text-primary">
                            {t.to_project_name}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-text-primary tabular-nums">
                            {formatMoney(t.amount)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-text-secondary tabular-nums">
                            {formatMoney(t.repaid_amount || "0")}
                          </td>
                          <td className="px-4 py-3 text-right font-bold tabular-nums">
                            <span className={outstanding > 0 ? "text-amber-700" : "text-emerald-700"}>
                              {formatMoney(String(outstanding))}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge
                              status={isRepaid ? "verified" : "provisional"}
                              customLabel={t.status.replace("_", " ")}
                            />
                          </td>
                          <td className="px-4 py-3 text-caption text-text-secondary max-w-xs truncate">
                            {t.notes}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {!isRepaid && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRepayTransfer(t)}
                              >
                                Record Repayment
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: IMPORT BATCHES */}
        {activeTab === "import-batches" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-section font-semibold text-text-primary">
                  Statement & SOV Import Batches History
                </h3>
                <p className="text-body text-text-secondary">
                  Immutable audit records of every ingested CSV, OFX, and Excel workbook.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsImportOpen(true)}
              >
                <UploadCloud className="h-4 w-4 mr-1.5" />
                New Import Batch
              </Button>
            </div>

            <div className="space-y-3">
              {importBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="space-y-3 rounded-lg border border-border bg-surface p-5 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-6 w-6 text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-section font-bold text-text-primary">
                            CSV import {batch.id.slice(0, 8)}
                          </h4>
                          <StatusBadge
                            status={batch.rejected_rows === 0 ? "verified" : "blocked"}
                            customLabel={batch.status.replace("_", " ")}
                          />
                          <span className="text-caption text-text-muted">
                            {batch.adapter} {batch.version}
                          </span>
                        </div>
                        <p className="text-caption text-text-secondary">
                          Imported by {batch.uploaded_by} on {formatDate(batch.created_at)} • {batch.total_rows} rows
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-caption text-text-secondary block">Row outcomes</span>
                      <span className="text-sm font-semibold text-text-primary tabular-nums">
                        {batch.accepted_rows} accepted · {batch.rejected_rows} rejected · {batch.duplicate_rows} duplicates
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {importBatches.length === 0 && (
                <div className="rounded-md border border-dashed border-border p-8 text-center">
                  <p className="text-sm font-medium text-text-primary">No statements have been imported</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Import a CSV statement to create transactions for reconciliation review.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <ImportWizardModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        projectId={currentProjectId}
        onSuccess={handleRefreshAll}
      />

      <SplitAllocationModal
        open={Boolean(splitMatch)}
        onOpenChange={(open) => {
          if (!open) setSplitMatch(null);
        }}
        match={splitMatch}
        budgetLines={budgetLines}
        projectId={currentProjectId}
        onSuccess={handleRefreshAll}
      />

      <RemapCategoryModal
        open={Boolean(remapMatch)}
        onOpenChange={(open) => {
          if (!open) setRemapMatch(null);
        }}
        match={remapMatch}
        budgetLines={budgetLines}
        onSuccess={handleRefreshAll}
      />

      <ExcludeTransactionModal
        open={Boolean(excludeMatch)}
        onOpenChange={(open) => {
          if (!open) setExcludeMatch(null);
        }}
        match={excludeMatch}
        onSuccess={handleRefreshAll}
      />

      <TransferModal
        open={isTransferModalOpen || Boolean(transferMatch)}
        onOpenChange={(open) => {
          if (!open) {
            setIsTransferModalOpen(false);
            setTransferMatch(null);
          }
        }}
        match={transferMatch}
        projectId={currentProjectId}
        projects={projects}
        onSuccess={handleRefreshAll}
      />

      <RepayTransferModal
        open={Boolean(repayTransfer)}
        onOpenChange={(open) => {
          if (!open) setRepayTransfer(null);
        }}
        transfer={repayTransfer}
        onSuccess={handleRefreshAll}
      />

      <StatementPeriodSignoffModal
        open={Boolean(signoffPeriod)}
        onOpenChange={(open) => {
          if (!open) setSignoffPeriod(null);
        }}
        period={signoffPeriod}
        account={selectedAccount}
        onSuccess={handleRefreshAll}
      />

      <LinkInvoiceModal
        open={Boolean(linkInvoiceTarget)}
        onOpenChange={(open) => {
          if (!open) setLinkInvoiceTarget(null);
        }}
        match={linkInvoiceTarget?.match}
        transaction={linkInvoiceTarget?.transaction}
        documents={documents}
        onSuccess={handleRefreshAll}
      />

      <CardSettlementModal
        open={Boolean(cardSettlementTarget)}
        onOpenChange={(open) => {
          if (!open) setCardSettlementTarget(null);
        }}
        match={cardSettlementTarget?.match}
        transaction={cardSettlementTarget?.transaction}
        onSuccess={handleRefreshAll}
      />
    </div>
  );
}
