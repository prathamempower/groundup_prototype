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

  // Active Tab matching Screenshot tabs:
  // 1: Review queue (8)
  // 2: Statement coverage (2)
  // 3: Evidence and exceptions (2)
  // 4: Transfers
  // 5: Imports
  const [activeTab, setActiveTab] = useState<
    "queue" | "statement-coverage" | "exceptions" | "transfers" | "imports"
  >("queue");

  // Filters and search for Review Queue
  const [searchQuery, setSearchQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [evidenceFilter, setEvidenceFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);

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
  const routeProjectId = typeof window !== "undefined"
    ? (window.location.pathname.match(/^\/projects\/([^\/]+)/)?.[1] || "")
    : "";
  const currentProjectId = (routeProjectId && routeProjectId !== "new")
    ? routeProjectId
    : projectsData?.data?.current_project_id || "";
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

  const activeAccountId = selectedAccountId || accounts[0]?.id || "";
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

  const documents = docsData?.data || [];
  const primaryDoc = documents[0];
  const stmtDoc = documents.find((d) => d.document_type === "BANK_STATEMENT" || d.original_filename?.toLowerCase().includes("statement") || d.original_filename?.toLowerCase().includes("bcb")) || primaryDoc;
  const drawDoc = documents.find((d) => d.document_type === "BUDGET_SOV" || d.original_filename?.toLowerCase().includes("draw") || d.original_filename?.toLowerCase().includes("report")) || primaryDoc;
  const transferDoc = documents.find((d) => d.document_type === "CONTRACT" || d.original_filename?.toLowerCase().includes("loan") || d.original_filename?.toLowerCase().includes("agreement")) || primaryDoc;

  const matches = recQueueData?.data?.matches || [];
  const pendingMatches = matches.filter((m) => m.status === "PENDING_REVIEW");
  const transactions = txnsData?.data || [];
  const periods = periodsData?.data || [];
  const transfers = transfersData?.data || [];
  const importBatches = importBatchesData?.data || [];
  const budgetLines = budgetData?.data?.lines || [];

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

  // Review Queue Items (Rich data matching Screenshot 1)
  const defaultReviewItems = [
    {
      id: "rq-1",
      date: "Sep 29, 2026",
      account: "Operating · 4821",
      description: "Nilson Mocalos",
      type: "Bank transaction",
      direction: "out",
      amount: "-$155.00",
      proposedLink: "Concrete & foundation st...",
      whyMatches: "Vendor alias and amount match",
      evidence: "Strong",
      status: "Pending review",
    },
    {
      id: "rq-2",
      date: "Sep 28, 2026",
      account: "Operating · 4821",
      description: "Nilson Mocalos",
      type: "Bank transaction",
      direction: "out",
      amount: "-$1,280.00",
      proposedLink: "Concrete & foundation st...",
      whyMatches: "Vendor alias and amount match",
      evidence: "Missing",
      status: "Pending review",
    },
    {
      id: "rq-3",
      date: "Sep 27, 2026",
      account: "Operating · 4821",
      description: "Jersey City Permit Office",
      type: "Bank transaction",
      direction: "out",
      amount: "-$640.00",
      proposedLink: "Permits and fees",
      whyMatches: "Payee and memo match permit budget",
      evidence: "Strong",
      status: "Pending review",
    },
    {
      id: "rq-4",
      date: "Sep 26, 2026",
      account: "Operating · 4821",
      description: "Architectural Studio LLC",
      type: "Bank transaction",
      direction: "out",
      amount: "-$2,450.00",
      proposedLink: "Professional services",
      whyMatches: "Description resembles architect invoice",
      evidence: "Partial",
      status: "Pending review",
    },
    {
      id: "rq-5",
      date: "Sep 25, 2026",
      account: "Operating · 4821",
      description: "Investor funding deposit",
      type: "Bank transaction",
      direction: "in",
      amount: "+$25,000.00",
      proposedLink: "Unallocated funding",
      whyMatches: "Deposit cleared; no draw linked yet",
      evidence: "Strong",
      status: "Pending review",
    },
    {
      id: "rq-6",
      date: "Sep 24, 2026",
      account: "Business card · 1108",
      description: "Card payment — statement settlement",
      type: "Bank transaction",
      direction: "out",
      amount: "-$1,850.00",
      proposedLink: "Card liability settlement",
      whyMatches: "Likely card settlement; do not classify as project spend",
      evidence: "Partial",
      status: "Pending review",
    },
    {
      id: "rq-7",
      date: "Sep 22, 2026",
      account: "Operating · 4821",
      description: "Transfer to 73 Broadway",
      type: "Bank transaction",
      direction: "out",
      amount: "-$5,000.00",
      proposedLink: "Inter-project transfer",
      whyMatches: "Memo suggests movement between project accounts",
      evidence: "Partial",
      status: "Pending review",
    },
    {
      id: "rq-8",
      date: "Sep 20, 2026",
      account: "Operating · 4821",
      description: "Construction loan draw",
      type: "Bank transaction",
      direction: "in",
      amount: "+$40,000.00",
      proposedLink: "Construction loan draw 03",
      whyMatches: "Deposit reference resembles lender draw notice",
      evidence: "Strong",
      status: "Pending review",
    },
  ];

  // Evidence and Exceptions items (Screenshot 3)
  const exceptionsList = [
    {
      id: "ex-1",
      title: "Missing invoice or receipt",
      subtitle: "Required evidence not attached",
      relatedTxn: "Nilson Mocalos · $155.00",
      severity: "High",
      owner: "CFO",
      age: "4 days",
      status: "Open",
    },
    {
      id: "ex-2",
      title: "Possible duplicate",
      subtitle: "Same vendor, date, and amount",
      relatedTxn: "Nilson Mocalos · $1,280.00",
      severity: "Medium",
      owner: "CFO",
      age: "2 days",
      status: "Open",
    },
  ];

  // Import History items (Screenshot 5)
  const importHistoryList = [
    {
      id: "imp-1",
      file: "operating-september.csv",
      subtitle: "Statement · Sep 2026",
      sourceType: "CSV",
      rowsImported: 42,
      duplicatesSkipped: 1,
      checkStatus: "Passed · $0.00 diff",
      checkVariant: "passed",
      importedBy: "CFO",
      importedWhen: "Oct 2, 2026, 10:14 AM",
    },
    {
      id: "imp-2",
      file: "card-september.xlsx",
      subtitle: "Card activity · Sep 2026",
      sourceType: "XLSX",
      rowsImported: 28,
      duplicatesSkipped: 2,
      checkStatus: "Passed · $0.00 diff",
      checkVariant: "passed",
      importedBy: "CFO",
      importedWhen: "Oct 3, 2026, 9:22 AM",
    },
    {
      id: "imp-3",
      file: "draw-notice-03.pdf",
      subtitle: "Funding support · Sep 2026",
      sourceType: "PDF",
      rowsImported: 1,
      duplicatesSkipped: 0,
      checkStatus: "Manual review",
      checkVariant: "manual",
      importedBy: "Owner",
      importedWhen: "Oct 4, 2026, 2:06 PM",
    },
    {
      id: "imp-4",
      file: "operating-august.csv",
      subtitle: "Statement · Aug 2026",
      sourceType: "CSV",
      rowsImported: 37,
      duplicatesSkipped: 0,
      checkStatus: "Passed · $0.00 diff",
      checkVariant: "passed",
      importedBy: "CFO",
      importedWhen: "Sep 2, 2026, 11:05 AM",
    },
  ];

  // Stateful review items list so Accept, Split, etc. dynamically update the view
  const [reviewItems, setReviewItems] = useState(defaultReviewItems);
  const [activeMoreMenuId, setActiveMoreMenuId] = useState<string | null>(null);

  // Helper to convert review item to ReconciliationMatch object for existing modals
  const getMatchFromRow = (row: typeof defaultReviewItems[0]): ReconciliationMatch => {
    // Check if there is an existing live match with this id
    const liveMatch = matches.find((m) => m.id === row.id);
    if (liveMatch) return liveMatch;

    const numericAmount = row.amount.replace(/[^0-9]/g, "") + "00"; // convert to cents
    return {
      id: row.id,
      transaction_id: `tx_${row.id}`,
      project_id: currentProjectId || "p1",
      amount: numericAmount,
      counterparty: row.description,
      transaction_date: "2026-09-29T00:00:00Z",
      proposed_budget_line_name: row.proposedLink,
      proposed_budget_line_id: budgetLines[0]?.id || "bl-1",
      confidence: row.evidence === "Strong" ? 0.94 : 0.75,
      confidence_reasons: [row.whyMatches],
      evidence_strength: row.evidence === "Strong" ? "VERIFIED_INVOICE" : "BANK_TRANSACTION",
      status: row.status === "Accepted" ? "ACCEPTED" : "PENDING_REVIEW",
    };
  };

  const handleAcceptItem = (id: string) => {
    // If it's a real backend match, trigger mutation
    const isLive = matches.some((m) => m.id === id);
    if (isLive) {
      acceptMatchMutation.mutate(id);
    }
    // Update local state to mark accepted
    setReviewItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Accepted" } : item
      )
    );
    setActiveMoreMenuId(null);
  };

  const handleOpenSplit = (row: typeof defaultReviewItems[0]) => {
    setSplitMatch(getMatchFromRow(row));
    setActiveMoreMenuId(null);
  };

  const handleOpenRemap = (row: typeof defaultReviewItems[0]) => {
    setRemapMatch(getMatchFromRow(row));
    setActiveMoreMenuId(null);
  };

  const handleOpenTransfer = (row: typeof defaultReviewItems[0]) => {
    setTransferMatch(getMatchFromRow(row));
    setActiveMoreMenuId(null);
  };

  const handleOpenExclude = (row: typeof defaultReviewItems[0]) => {
    setExcludeMatch(getMatchFromRow(row));
    setActiveMoreMenuId(null);
  };

  const handleOpenLinkInvoice = (row: typeof defaultReviewItems[0]) => {
    setLinkInvoiceTarget({ match: getMatchFromRow(row) });
    setActiveMoreMenuId(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMatchIds(reviewItems.map((item) => item.id));
    } else {
      setSelectedMatchIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedMatchIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="px-6 max-w-7xl mx-auto space-y-6 pt-2">
        {/* Page Subtitle Breadcrumb & Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              FINANCE / CONTROLS
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reconciliation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Make sure every bank transaction is explained and supported.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                In progress
              </span>
              <span className="text-[11px] text-slate-400">
                As of Oct 12, 2026, 6:00 PM IST
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsImportOpen(true)}
            className="text-xs font-semibold shadow-xs bg-slate-900 text-white hover:bg-slate-800 self-start"
          >
            + Import data
          </Button>
        </div>

        {/* 5 KPI Metric Cards Strip matching exact screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Unmatched transactions */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Unmatched transactions
            </span>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
              $76,375.00
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              <strong className="text-slate-700 font-semibold">8 items</strong> awaiting review
            </p>
          </div>

          {/* Card 2: Missing evidence */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Missing evidence
            </span>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
              $1,435.00
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              <strong className="text-slate-700 font-semibold">2 items</strong> need invoice or receipt
            </p>
          </div>

          {/* Card 3: Unallocated funding */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Unallocated funding
            </span>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
              $25,000.00
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Cleared deposits not linked to a draw
            </p>
          </div>

          {/* Card 4: Outstanding transfers */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Outstanding transfers
            </span>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
              $5,000.00
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Temporary project-to-project balance
            </p>
          </div>

          {/* Card 5: Periods signed off */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Periods signed off
            </span>
            <div className="mt-2 text-xl font-bold text-slate-900 tabular-nums">
              0 of 2
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Statement periods completed
            </p>
          </div>
        </div>

        {/* Segmented Underline Navigation Tabs matching Screenshots */}
        <div className="border-b border-slate-200">
          <nav className="flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("queue")}
              className={`flex items-center gap-1.5 pb-2.5 transition-colors border-b-2 -mb-px ${
                activeTab === "queue"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Review queue</span>
              <span className="text-[10px] text-slate-400 font-mono">8</span>
            </button>

            <button
              onClick={() => setActiveTab("statement-coverage")}
              className={`flex items-center gap-1.5 pb-2.5 transition-colors border-b-2 -mb-px ${
                activeTab === "statement-coverage"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Statement coverage</span>
              <span className="text-[10px] text-slate-400 font-mono">2</span>
            </button>

            <button
              onClick={() => setActiveTab("exceptions")}
              className={`flex items-center gap-1.5 pb-2.5 transition-colors border-b-2 -mb-px ${
                activeTab === "exceptions"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Evidence and exceptions</span>
              <span className="text-[10px] text-slate-400 font-mono">2</span>
            </button>

            <button
              onClick={() => setActiveTab("transfers")}
              className={`flex items-center gap-1.5 pb-2.5 transition-colors border-b-2 -mb-px ${
                activeTab === "transfers"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Transfers</span>
            </button>

            <button
              onClick={() => setActiveTab("imports")}
              className={`flex items-center gap-1.5 pb-2.5 transition-colors border-b-2 -mb-px ${
                activeTab === "imports"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Imports</span>
            </button>
          </nav>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: REVIEW QUEUE (Screenshot 1)                                       */}
        {/* ========================================================================= */}
        {activeTab === "queue" && (
          <div className="space-y-3.5">
            {/* Header description */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Review queue</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unresolved transactions only. Confirm a link or correct the proposed allocation.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                8 items need review
              </span>
            </div>

            {/* Filter controls bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search description, vendor, account..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200/90 bg-white pl-8 pr-3 py-1.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                  className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All accounts</option>
                  <option value="OPERATING">Operating · 4821</option>
                  <option value="CARD">Business card · 1108</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="ALL">Pending review</option>
                  <option value="ACCEPTED">Accepted</option>
                </select>

                <select
                  value={evidenceFilter}
                  onChange={(e) => setEvidenceFilter(e.target.value)}
                  className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All evidence</option>
                  <option value="STRONG">Strong</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="MISSING">Missing</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="NEWEST">Newest first</option>
                  <option value="OLDEST">Oldest first</option>
                </select>
              </div>
            </div>

            {/* Exact Table Component */}
            <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3.5 py-2.5 w-8">
                        <input
                          type="checkbox"
                          checked={selectedMatchIds.length === defaultReviewItems.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-0"
                        />
                      </th>
                      <th className="px-3.5 py-2.5">Date</th>
                      <th className="px-3.5 py-2.5">Account</th>
                      <th className="px-3.5 py-2.5">Description</th>
                      <th className="px-3.5 py-2.5">Amount</th>
                      <th className="px-3.5 py-2.5">Proposed Link</th>
                      <th className="px-3.5 py-2.5">Why It Matches</th>
                      <th className="px-3.5 py-2.5">Evidence</th>
                      <th className="px-3.5 py-2.5">Status</th>
                      <th className="px-3.5 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {reviewItems.map((row) => {
                      const isSelected = selectedMatchIds.includes(row.id);
                      const isAccepted = row.status === "Accepted";
                      const isMenuOpen = activeMoreMenuId === row.id;

                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-slate-50/60 transition-colors ${
                            isSelected ? "bg-blue-50/20" : ""
                          }`}
                        >
                          <td className="px-3.5 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(row.id)}
                              className="rounded border-slate-300 text-slate-900 focus:ring-0"
                            />
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap text-slate-600">
                            {row.date}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap text-slate-600">
                            {row.account}
                          </td>
                          <td className="px-3.5 py-3">
                            <div className="font-bold text-slate-900">{row.description}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{row.type}</div>
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span
                              className={`font-mono font-bold ${
                                row.direction === "in" ? "text-emerald-700" : "text-slate-900"
                              }`}
                            >
                              {row.amount}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                              {row.direction === "in" ? "Money in" : "Money out"}
                            </span>
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="inline-block rounded-md bg-slate-100/90 text-slate-700 px-2 py-0.5 text-[11px] border border-slate-200">
                              {row.proposedLink}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-slate-600 max-w-xs text-[11px]">
                            {row.whyMatches}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            {row.evidence === "Strong" && (
                              <span className="rounded bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                                Strong
                              </span>
                            )}
                            {row.evidence === "Partial" && (
                              <span className="rounded bg-amber-50 text-amber-800 px-2 py-0.5 text-[10px] font-bold border border-amber-200">
                                Partial
                              </span>
                            )}
                            {row.evidence === "Missing" && (
                              <span className="rounded bg-rose-50 text-rose-800 px-2 py-0.5 text-[10px] font-bold border border-rose-200">
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            {isAccepted ? (
                              <span className="rounded bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[10px] font-semibold border border-emerald-200 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="h-3 w-3" /> Reconciled
                              </span>
                            ) : (
                              <span className="rounded bg-amber-50 text-amber-800 px-2 py-0.5 text-[10px] font-semibold border border-amber-200">
                                Pending review
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap text-right relative">
                            <div className="flex items-center justify-end gap-1">
                              {isAccepted ? (
                                <span className="text-[11px] text-slate-400 font-medium">Logged</span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptItem(row.id)}
                                    className="rounded bg-slate-900 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSplit(row)}
                                    className="rounded border border-slate-200 text-slate-700 px-2 py-1 text-[11px] font-medium hover:bg-slate-50 transition-colors"
                                  >
                                    Split
                                  </button>
                                </>
                              )}

                              <div className="relative inline-block text-left">
                                <button
                                  type="button"
                                  onClick={() => setActiveMoreMenuId(isMenuOpen ? null : row.id)}
                                  className="text-slate-400 hover:text-slate-700 px-1.5 py-1 text-[11px] font-medium rounded hover:bg-slate-100 transition-colors"
                                >
                                  More
                                </button>

                                {isMenuOpen && (
                                  <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-20 text-left">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRemap(row)}
                                      className="flex w-full items-center px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                                    >
                                      Remap Category
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenTransfer(row)}
                                      className="flex w-full items-center px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                                    >
                                      Transfer to Project
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenLinkInvoice(row)}
                                      className="flex w-full items-center px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                                    >
                                      Link Document
                                    </button>
                                    <div className="my-1 border-t border-slate-100" />
                                    <button
                                      type="button"
                                      onClick={() => handleOpenExclude(row)}
                                      className="flex w-full items-center px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                                    >
                                      Exclude Transaction
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Pagination Strip */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-white text-xs text-slate-500">
                <span>Showing 8 items</span>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <button className="h-6 w-6 rounded border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center">
                    ‹
                  </button>
                  <button className="h-6 w-6 rounded bg-slate-100 text-slate-900 font-bold flex items-center justify-center">
                    1
                  </button>
                  <button className="h-6 w-6 rounded border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center">
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STATEMENT COVERAGE (Screenshot 2)                                  */}
        {/* ========================================================================= */}
        {activeTab === "statement-coverage" && (
          <div className="space-y-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Statement coverage</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Reconcile opening and closing balances before signing off each period.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-2.5">Account / Period</th>
                    <th className="px-4 py-2.5">Opening Balance</th>
                    <th className="px-4 py-2.5">Closing Balance</th>
                    <th className="px-4 py-2.5">Calculated Closing</th>
                    <th className="px-4 py-2.5">Difference</th>
                    <th className="px-4 py-2.5">Coverage</th>
                    <th className="px-4 py-2.5 text-right">Sign Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">Operating · 4821</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Sep 1–30, 2026</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-900 font-semibold">8,420.00</td>
                    <td className="px-4 py-3.5 font-mono text-slate-900 font-semibold">4,155.00</td>
                    <td className="px-4 py-3.5 font-mono text-slate-900 font-semibold">4,155.00</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600 font-medium">bash.00</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                        Complete
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        disabled
                        className="rounded border border-slate-200 bg-slate-50 text-slate-400 px-2.5 py-1 text-[11px] font-medium cursor-not-allowed"
                      >
                        Sign off
                      </button>
                      <div className="text-[10px] text-slate-400 mt-1">3 items need review</div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">Operating · 4821</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Oct 1–31, 2026</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-900 font-semibold">4,155.00</td>
                    <td className="px-4 py-3.5 text-slate-400">—</td>
                    <td className="px-4 py-3.5 text-slate-400">—</td>
                    <td className="px-4 py-3.5 text-slate-400">—</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold border border-slate-200">
                        Missing!
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setIsImportOpen(true)}
                        className="rounded border border-slate-200 bg-white text-slate-800 px-2.5 py-1 text-[11px] font-semibold hover:bg-slate-50 shadow-2xs"
                      >
                        Add statement
                      </button>
                      <div className="text-[10px] text-slate-400 mt-1">Statement not imported</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EVIDENCE AND EXCEPTIONS (Screenshot 3)                            */}
        {/* ========================================================================= */}
        {activeTab === "exceptions" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Evidence and exceptions</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Resolve missing support and data-quality issues before sign-off.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">2 open exceptions</span>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-2.5">Exception</th>
                    <th className="px-4 py-2.5">Related Transaction</th>
                    <th className="px-4 py-2.5">Severity</th>
                    <th className="px-4 py-2.5">Owner</th>
                    <th className="px-4 py-2.5">Age</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exceptionsList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {item.relatedTxn}
                      </td>
                      <td className="px-4 py-3.5">
                        {item.severity === "High" ? (
                          <span className="rounded bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-bold border border-rose-200">
                            High
                          </span>
                        ) : (
                          <span className="rounded bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-bold border border-amber-200">
                            Medium
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">{item.owner}</td>
                      <td className="px-4 py-3.5 text-slate-500">{item.age}</td>
                      <td className="px-4 py-3.5">
                        <span className="rounded bg-amber-50 text-amber-800 px-2 py-0.5 text-[10px] font-semibold border border-amber-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            className="rounded border border-slate-200 bg-white text-slate-700 px-2.5 py-1 text-[11px] font-medium hover:bg-slate-50"
                          >
                            Resolve
                          </button>
                          <button
                            type="button"
                            className="text-slate-500 hover:text-slate-800 px-1.5 py-1 text-[11px]"
                          >
                            Waive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TRANSFERS (Screenshot 4)                                           */}
        {/* ========================================================================= */}
        {activeTab === "transfers" && (
          <div className="space-y-4">
            {/* Callout Notice */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
              <div className="flex items-start gap-2.5 text-xs text-amber-900">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block">Transfers don't affect revenue, cost, or profit.</span>
                  <span className="text-amber-800 text-[11px] mt-0.5 block">
                    Record both sides of the movement and track repayment separately.
                  </span>
                </div>
              </div>
            </div>

            {/* Header + Record Transfer action */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Project transfers</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Temporary balances between projects, tracked independently from spend.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsTransferModalOpen(true)}
                className="text-xs font-semibold bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
              >
                + Record transfer
              </Button>
            </div>

            {/* Empty State matching Screenshot 4 */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-16 text-center shadow-xs flex flex-col items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 mb-3">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No outstanding transfers</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Transfers will appear here when a movement between projects is recorded.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: IMPORTS (Screenshot 5)                                             */}
        {/* ========================================================================= */}
        {activeTab === "imports" && (
          <div className="space-y-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Import history</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every import includes row counts and a control-total check.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-2.5">File</th>
                    <th className="px-4 py-2.5">Source Type</th>
                    <th className="px-4 py-2.5">Rows Imported</th>
                    <th className="px-4 py-2.5">Duplicates Skipped</th>
                    <th className="px-4 py-2.5">Control-Total Check</th>
                    <th className="px-4 py-2.5 text-right">Imported By / When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importHistoryList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{item.file}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-slate-600 font-semibold">{item.sourceType}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-800 font-semibold">
                        {item.rowsImported}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {item.duplicatesSkipped}
                      </td>
                      <td className="px-4 py-3.5">
                        {item.checkVariant === "passed" ? (
                          <span className="rounded bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                            {item.checkStatus}
                          </span>
                        ) : (
                          <span className="rounded bg-amber-50 text-amber-800 px-2 py-0.5 text-[10px] font-bold border border-amber-200">
                            {item.checkStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="font-semibold text-slate-900">{item.importedBy}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.importedWhen}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
