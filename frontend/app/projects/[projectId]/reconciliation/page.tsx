"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { formatMoney, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Link2,
  FileText,
  FileQuestion,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Info,
  DollarSign,
  MoreHorizontal,
  LayoutList,
  Table as TableIcon,
} from "lucide-react";

import { ImportWizardModal } from "@/components/reconciliation/import-wizard-modal";
import { SplitAllocationModal } from "@/components/reconciliation/split-allocation-modal";
import { RemapCategoryModal } from "@/components/reconciliation/remap-category-modal";
import { ExcludeTransactionModal } from "@/components/reconciliation/exclude-transaction-modal";
import { TransferModal } from "@/components/reconciliation/transfer-modal";
import { RepayTransferModal } from "@/components/reconciliation/repay-transfer-modal";
import { StatementPeriodSignoffModal } from "@/components/reconciliation/statement-period-signoff-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkInvoiceModal } from "@/components/reconciliation/link-invoice-modal";
import { CardSettlementModal } from "@/components/reconciliation/card-settlement-modal";
import {
  OwnerResolutionModal,
  ReviewItemData,
  ResolutionActionType,
} from "@/components/reconciliation/owner-resolution-modal";
import { getIssueInfo } from "@/components/reconciliation/reconciliation-helpers";

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
  // Filters and search for Review Queue
  const [searchQuery, setSearchQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [evidenceFilter, setEvidenceFilter] = useState("ALL");
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

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
  const [resolutionModalItem, setResolutionModalItem] = useState<ReviewItemData | null>(null);

  // Data Queries
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const projects = projectsData?.data?.projects || [];
  const params = useParams();
  const routeProjectId = (params?.projectId as string) || (typeof window !== "undefined"
    ? (window.location.pathname.match(/^\/projects\/([^\/]+)/)?.[1] || "")
    : "");
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

  // Dynamic realistic dates relative to the active business day
  const getRealDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Review Queue Items (Rich data matching Screenshot 1)
  const defaultReviewItems = [
    {
      id: "rq-1",
      date: getRealDate(0),
      account: "Columbia Bank · 4821",
      description: "Nilson Mocalos",
      sourceFileName: "operating_statement_oct2026.pdf",
      type: "Bank transaction",
      direction: "out",
      amount: "-$155.00",
      matchedDocument: "Nilson Mocalos · Inv #INV-104",
      matchedAmount: "$155.00",
      variance: "$0.00",
      auditIssue: "Missing Receipt",
      auditDetail: "Card slip needed",
      amountAtRisk: "$155.00 missing",
      proposedLink: "Concrete & foundation",
      whyMatches: "Vendor alias and amount match",
      evidence: "Strong",
      status: "Pending review",
    },
    {
      id: "rq-2",
      date: getRealDate(1),
      account: "Columbia Bank · 4821",
      description: "Nilson Mocalos",
      sourceFileName: "operating_statement_oct2026.pdf",
      type: "Bank transaction",
      direction: "out",
      amount: "-$1,280.00",
      matchedDocument: "",
      matchedAmount: "$0.00",
      variance: "-$1,280.00",
      auditIssue: "Missing Invoice",
      auditDetail: "No document on file",
      amountAtRisk: "$1,280.00 missing",
      proposedLink: "Concrete & foundation",
      whyMatches: "Vendor alias and amount match",
      evidence: "Missing",
      status: "Pending review",
    },
    {
      id: "rq-3",
      date: getRealDate(2),
      account: "Columbia Bank · 4821",
      description: "Jersey City Permit Office",
      sourceFileName: "operating_statement_oct2026.pdf",
      type: "Bank transaction",
      direction: "out",
      amount: "-$640.00",
      matchedDocument: "Permit Receipt #JC-4410",
      matchedAmount: "$600.00",
      variance: "$40.00",
      auditIssue: "Amount Mismatch",
      auditDetail: "Receipt is $600.00 (+$40 difference)",
      amountAtRisk: "$40.00 difference",
      proposedLink: "Permits and fees",
      whyMatches: "Payee and memo match permit budget",
      evidence: "Strong",
      status: "Pending review",
    },
    {
      id: "rq-4",
      date: getRealDate(3),
      account: "Columbia Bank · 4821",
      description: "Architectural Studio LLC",
      sourceFileName: "operating_statement_oct2026.pdf",
      type: "Bank transaction",
      direction: "out",
      amount: "-$2,450.00",
      matchedDocument: "Arch Studio · Inv #AS-89",
      matchedAmount: "$2,000.00",
      variance: "$450.00",
      auditIssue: "Amount Mismatch",
      auditDetail: "Invoice is $2,000.00 (+$450 difference)",
      amountAtRisk: "$450.00 difference",
      proposedLink: "Professional services",
      whyMatches: "Description resembles architect invoice",
      evidence: "Partial",
      status: "Pending review",
    },
    {
      id: "rq-5",
      date: getRealDate(4),
      account: "Columbia Bank · 4821",
      description: "Investor funding deposit",
      sourceFileName: "wire_transfer_equity_w05.pdf",
      type: "Bank transaction",
      direction: "in",
      amount: "+$25,000.00",
      matchedDocument: "Investor Equity Wire #W-05",
      matchedAmount: "$25,000.00",
      variance: "$0.00",
      auditIssue: "Unlinked Deposit",
      auditDetail: "Deposit needs loan draw link",
      amountAtRisk: "$25,000.00 unlinked",
      proposedLink: "Unallocated funding",
      whyMatches: "Deposit cleared; no draw linked yet",
      evidence: "Strong",
      status: "Pending review",
    },
    {
      id: "rq-6",
      date: getRealDate(5),
      account: "Bank of America · 1108",
      description: "Credit card payment",
      sourceFileName: "business_card_stmt_oct2026.pdf",
      type: "Bank transaction",
      direction: "out",
      amount: "-$1,850.00",
      matchedDocument: "Card Statement Settlement",
      matchedAmount: "$1,850.00",
      variance: "$0.00",
      auditIssue: "Card Payment",
      auditDetail: "Card payoff (avoid double count)",
      amountAtRisk: "$1,850.00 transfer",
      proposedLink: "Credit card payment",
      whyMatches: "Credit card payoff. Exclude to avoid counting card purchases twice.",
      evidence: "Partial",
      status: "Pending review",
    },
    {
      id: "rq-7",
      date: getRealDate(7),
      account: "Columbia Bank · 4821",
      description: "Jersey City Lumber Co.",
      sourceFileName: "operating_statement_oct2026.pdf",
      type: "Bank transaction",
      direction: "out",
      amount: "-$5,000.00",
      matchedDocument: "Lumber PO #LUM-332",
      matchedAmount: "$5,000.00",
      variance: "$0.00",
      auditIssue: "Possible Duplicate",
      auditDetail: "Same $5,000.00 charge found",
      amountAtRisk: "$5,000.00 duplicate",
      proposedLink: "Rough carpentry framing",
      whyMatches: "Vendor and memo match framing lumber package",
      evidence: "Partial",
      status: "Pending review",
    },
    {
      id: "rq-8",
      date: getRealDate(9),
      account: "Columbia Bank · 4821",
      description: "Construction loan draw",
      sourceFileName: "lender_draw_03_notice.pdf",
      type: "Bank transaction",
      direction: "in",
      amount: "+$40,000.00",
      matchedDocument: "Lender Draw #03 Approval",
      matchedAmount: "$40,000.00",
      variance: "$0.00",
      auditIssue: "Unlinked Deposit",
      auditDetail: "Loan wire needs budget draw link",
      amountAtRisk: "$40,000.00 unlinked",
      proposedLink: "Construction loan draw 03",
      whyMatches: "Deposit reference resembles lender draw notice",
      evidence: "Strong",
      status: "Pending review",
    },
  ];

  // Stateful review items list with owner resolution support
  const [reviewItems, setReviewItems] = useState<ReviewItemData[]>(defaultReviewItems);
  const [activeMoreMenuId, setActiveMoreMenuId] = useState<string | null>(null);

  // Dynamic metrics derived from reviewItems state
  const unresolvedItems = reviewItems.filter((item) => item.status !== "Resolved");
  const resolvedItems = reviewItems.filter((item) => item.status === "Resolved");
  const unresolvedCount = unresolvedItems.length;

  const totalUnresolvedDollars = unresolvedItems.reduce((acc, item) => {
    const raw = item.amount.replace(/[^0-9.]/g, "");
    return acc + (parseFloat(raw) || 0);
  }, 0);

  const missingEvidenceItems = unresolvedItems.filter((item) => item.evidence === "Missing");
  const missingEvidenceCount = missingEvidenceItems.length;
  const missingEvidenceDollars = missingEvidenceItems.reduce((acc, item) => {
    const raw = item.amount.replace(/[^0-9.]/g, "");
    return acc + (parseFloat(raw) || 0);
  }, 0);

  // Filtered Review Items
  const filteredReviewItems = reviewItems.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.description.toLowerCase().includes(q) ||
        item.account.toLowerCase().includes(q) ||
        item.amount.toLowerCase().includes(q) ||
        Boolean(item.sourceFileName && item.sourceFileName.toLowerCase().includes(q)) ||
        Boolean(item.auditIssue && item.auditIssue.toLowerCase().includes(q)) ||
        Boolean(item.auditDetail && item.auditDetail.toLowerCase().includes(q)) ||
        Boolean(item.amountAtRisk && item.amountAtRisk.toLowerCase().includes(q)) ||
        Boolean(item.resolutionNote && item.resolutionNote.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    if (accountFilter !== "ALL") {
      if (accountFilter === "OPERATING" && !item.account.includes("4821")) return false;
      if (accountFilter === "CARD" && !item.account.includes("1108")) return false;
    }

    if (statusFilter !== "ALL") {
      if (statusFilter === "PENDING" && item.status === "Resolved") return false;
      if (statusFilter === "RESOLVED" && item.status !== "Resolved") return false;
    }

    if (evidenceFilter !== "ALL") {
      if (evidenceFilter === "MISSING" && !item.auditIssue?.toLowerCase().includes("missing")) return false;
      if (evidenceFilter === "VARIANCE" && !item.auditIssue?.toLowerCase().includes("variance") && !item.auditIssue?.toLowerCase().includes("mismatch")) return false;
      if (evidenceFilter === "UNLINKED" && !item.auditIssue?.toLowerCase().includes("unlinked") && !item.auditIssue?.toLowerCase().includes("unallocated")) return false;
      if (evidenceFilter === "CARD_PAYMENT" && !item.auditIssue?.toLowerCase().includes("card") && !item.auditIssue?.toLowerCase().includes("transfer")) return false;
      if (evidenceFilter === "DUPLICATE" && !item.auditIssue?.toLowerCase().includes("duplicate")) return false;
    }

    return true;
  });

  // Helper to convert review item to ReconciliationMatch object for existing modals
  const getMatchFromRow = (row: ReviewItemData): ReconciliationMatch => {
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
      transaction_date: new Date().toISOString(),
      proposed_budget_line_name: row.proposedLink || "Unassigned",
      proposed_budget_line_id: budgetLines[0]?.id || "bl-1",
      confidence: row.evidence === "Strong" ? 0.94 : 0.75,
      confidence_reasons: [row.whyMatches || "Transaction match candidate"],
      evidence_strength: row.evidence === "Strong" ? "VERIFIED_INVOICE" : "BANK_TRANSACTION",
      status: row.status === "Resolved" ? "ACCEPTED" : "PENDING_REVIEW",
    };
  };

  const handleResolveItem = (
    itemId: string,
    actionType: ResolutionActionType,
    reason: string,
    uploadedFiles?: string[]
  ) => {
    const isLive = matches.some((m) => m.id === itemId);
    if (isLive) {
      acceptMatchMutation.mutate(itemId);
    }
    setReviewItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: "Resolved",
              resolutionType: actionType,
              resolutionNote: reason,
              uploadedFiles: uploadedFiles || item.uploadedFiles,
            }
          : item
      )
    );
    setResolutionModalItem(null);
    setActiveMoreMenuId(null);
  };

  const getResolutionBadge = (type?: string, uploadedFiles?: string[]) => {
    const fileCount = uploadedFiles?.length || 0;
    if (type === "UPLOAD_PROOF" || fileCount > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-2.5 w-2.5" /> Resolved
          {fileCount > 0 && (
            <span className="text-emerald-600 font-normal">
              ({fileCount} {fileCount === 1 ? "doc" : "docs"})
            </span>
          )}
        </span>
      );
    }

    switch (type) {
      case "REQUEST_INVOICE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
            <FileText className="h-2.5 w-2.5" /> Invoice Requested
          </span>
        );
      case "ASSIGN_TRADE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            <DollarSign className="h-2.5 w-2.5" /> Budget Assigned
          </span>
        );
      case "CONFIRM_DRAW":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            <Building2 className="h-2.5 w-2.5" /> Draw Linked
          </span>
        );
      case "SETTLE_LIABILITY":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
            <CreditCard className="h-2.5 w-2.5" /> Credit Card Payment
          </span>
        );
      case "EXCLUDE_NON_PROJECT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
            <Ban className="h-2.5 w-2.5" /> Excluded
          </span>
        );
      case "OTHER":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">
            <MoreHorizontal className="h-2.5 w-2.5" /> Other
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-2.5 w-2.5" /> Resolved
          </span>
        );
    }
  };

  const handleOpenSplit = (row: ReviewItemData) => {
    setSplitMatch(getMatchFromRow(row));
    setActiveMoreMenuId(null);
  };

  const handleOpenRemap = (row: ReviewItemData) => {
    setRemapMatch(getMatchFromRow(row));
    setActiveMoreMenuId(null);
  };

  const handleOpenTransfer = (row: ReviewItemData) => {
    setTransferMatch(getMatchFromRow(row));
    setActiveMoreMenuId(null);
  };

  const handleOpenExclude = (row: ReviewItemData) => {
    setExcludeMatch(getMatchFromRow(row));
    setActiveMoreMenuId(null);
  };

  const handleOpenLinkInvoice = (row: ReviewItemData) => {
    setLinkInvoiceTarget({ match: getMatchFromRow(row) });
    setActiveMoreMenuId(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMatchIds(filteredReviewItems.map((item) => item.id));
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
      <div className="px-4 sm:px-6 max-w-7xl mx-auto space-y-6 pt-2">
        {/* Page Subtitle Breadcrumb & Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reconciliation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Match bank transactions with budget lines and receipts.
            </p>
          </div>
        </div>
        {/* Review Queue */}
        <div className="space-y-3.5">
            {/* Header description with responsive view toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Review queue</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specify owner resolution actions and audit reasons to clear transactions.
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <span className="text-xs text-slate-500 font-medium">
                  {unresolvedCount} items need review
                </span>
                <div className="flex items-center rounded-lg border border-slate-200/90 bg-slate-100/80 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewMode === "table"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Table view"
                  >
                    <TableIcon className="h-3.5 w-3.5" />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      viewMode === "cards"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Cards view"
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    <span>Cards</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter controls bar */}
            <div className="flex flex-col md:flex-row md:items-center gap-2.5">
              <div className="relative flex-1 min-w-0 w-full">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200/90 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 shadow-2xs transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:flex md:items-center md:flex-nowrap gap-2 w-full md:w-auto shrink-0">
                <Select
                  value={accountFilter}
                  onValueChange={(val) => setAccountFilter(val)}
                >
                  <SelectTrigger className="w-full md:w-auto min-w-[150px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All accounts</SelectItem>
                    <SelectItem value="OPERATING">Columbia Bank · 4821</SelectItem>
                    <SelectItem value="CARD">Bank of America · 1108</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(val) => setStatusFilter(val)}
                >
                  <SelectTrigger className="w-full md:w-auto min-w-[130px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="PENDING">Pending action</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={evidenceFilter}
                  onValueChange={(val) => setEvidenceFilter(val)}
                >
                  <SelectTrigger className="w-full md:w-auto min-w-[130px] h-9 text-xs font-medium">
                    <SelectValue placeholder="All issues" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All issues</SelectItem>
                    <SelectItem value="MISSING">Missing documents</SelectItem>
                    <SelectItem value="VARIANCE">Amount mismatch</SelectItem>
                    <SelectItem value="UNLINKED">Unlinked deposits</SelectItem>
                    <SelectItem value="CARD_PAYMENT">Card payments</SelectItem>
                    <SelectItem value="DUPLICATE">Possible duplicates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Review Queue Content: Table View or Cards View */}
            {viewMode === "table" ? (
              <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
                {/* Mobile scroll hint */}
                <div className="sm:hidden flex items-center justify-between px-3.5 py-2 bg-slate-50/90 border-b border-slate-200/80 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" />
                    Swipe horizontally if needed
                  </span>
                  <span className="font-mono text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                    5 columns
                  </span>
                </div>

                <div className="overflow-x-auto touch-pan-x scrollbar-thin scrollbar-thumb-slate-300">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-3.5 py-2.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedMatchIds.length === filteredReviewItems.length &&
                              filteredReviewItems.length > 0
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-0"
                          />
                        </th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">Date</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">Transaction</th>
                        <th className="px-3.5 py-2.5">Issue</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">Amount</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {isQueueLoading ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={`queue-skel-${idx}`} className="animate-pulse">
                            <td className="px-3.5 py-3 text-center">
                              <Skeleton className="h-4 w-4 rounded mx-auto" />
                            </td>
                            <td className="px-3.5 py-3">
                              <Skeleton className="h-3.5 w-24" />
                              <Skeleton className="h-2.5 w-20 mt-1" />
                            </td>
                            <td className="px-3.5 py-3">
                              <Skeleton className="h-3.5 w-32" />
                              <Skeleton className="h-2.5 w-24 mt-1" />
                            </td>
                            <td className="px-3.5 py-3">
                              <Skeleton className="h-3.5 w-40" />
                              <Skeleton className="h-2.5 w-28 mt-1" />
                            </td>
                            <td className="px-3.5 py-3">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-2.5 w-16 mt-1" />
                            </td>
                            <td className="px-3.5 py-3 text-right">
                              <Skeleton className="h-7 w-18 ml-auto rounded-md" />
                            </td>
                          </tr>
                        ))
                      ) : filteredReviewItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-10 text-center text-xs text-slate-400"
                          >
                            No transactions found.
                          </td>
                        </tr>
                      ) : (
                        filteredReviewItems.map((row) => {
                          const isSelected = selectedMatchIds.includes(row.id);
                          const isResolved = row.status === "Resolved";
                          const issue = getIssueInfo(row);

                          return (
                            <tr
                              key={row.id}
                              className={`hover:bg-slate-50/60 transition-colors ${
                                isSelected ? "bg-blue-50/20" : ""
                              }`}
                            >
                              <td className="px-3.5 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelect(row.id)}
                                  className="rounded border-slate-300 text-slate-900 focus:ring-0"
                                />
                              </td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                <div className="font-mono text-xs font-semibold text-slate-900">
                                  {row.date}
                                </div>
                                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                                  {row.account}
                                </div>
                              </td>
                              <td className="px-3.5 py-3">
                                <div className="font-semibold text-xs text-slate-900 leading-tight">
                                  {row.description}
                                </div>
                              </td>
                              <td className="px-3.5 py-3">
                                <div className="flex items-center gap-1.5 font-semibold text-xs">
                                  {issue.type === "missing" ? (
                                    <FileQuestion className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                                  ) : issue.type === "variance" ? (
                                    <Scale className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  ) : issue.type === "duplicate" ? (
                                    <Copy className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  ) : issue.type === "transfer" ? (
                                    <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  ) : (
                                    <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  )}
                                  <span
                                    className={
                                      issue.type === "missing"
                                        ? "text-rose-600 font-semibold"
                                        : "text-slate-900 font-semibold"
                                    }
                                  >
                                    {issue.label}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 font-normal">
                                  {issue.detail}
                                </div>
                              </td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                <div
                                  className={`font-mono text-xs font-semibold ${
                                    issue.type === "missing"
                                      ? "text-rose-600"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {row.amount}
                                </div>
                              </td>
                              <td className="px-3.5 py-3 whitespace-nowrap text-right">
                                {isResolved ? (
                                  <div className="flex items-center justify-end gap-2">
                                    {getResolutionBadge(row.resolutionType, row.uploadedFiles)}
                                    <button
                                      type="button"
                                      onClick={() => setResolutionModalItem(row)}
                                      className="rounded border border-slate-200 bg-white text-slate-700 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setResolutionModalItem(row)}
                                    className="rounded bg-slate-900 text-white px-3 py-1 text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
                                  >
                                    Resolve
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Pagination Strip */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-white text-xs text-slate-500">
                  <span>Showing {filteredReviewItems.length} items</span>
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
            ) : (
              /* Mobile & Compact Card View */
              <div className="space-y-3">
                {/* Select all header for card view */}
                <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border border-slate-200/90 rounded-lg text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={
                        selectedMatchIds.length === filteredReviewItems.length &&
                        filteredReviewItems.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0"
                    />
                    <span>Select all ({filteredReviewItems.length})</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {selectedMatchIds.length} selected
                  </span>
                </div>

                {isQueueLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={`card-skel-${idx}`} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 animate-pulse">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-16 rounded-full" />
                        </div>
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-full rounded" />
                      </div>
                    ))}
                  </div>
                ) : filteredReviewItems.length === 0 ? (
                  <div className="rounded-xl border border-slate-200/90 bg-white p-8 text-center text-xs text-slate-400">
                    No transactions found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReviewItems.map((row) => {
                      const isSelected = selectedMatchIds.includes(row.id);
                      const isResolved = row.status === "Resolved";
                      const issue = getIssueInfo(row);

                      return (
                        <div
                          key={row.id}
                          className={`flex flex-col justify-between p-4 bg-white border rounded-xl space-y-3 shadow-2xs transition-colors ${
                            isSelected
                              ? "border-blue-400/80 bg-blue-50/20"
                              : "border-slate-200/90 hover:border-slate-300"
                          }`}
                        >
                        {/* Top: Checkbox, Date & Account, Status */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(row.id)}
                              className="rounded border-slate-300 text-slate-900 focus:ring-0"
                            />
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-semibold text-slate-800 font-mono">
                                {row.date}
                              </span>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <span className="text-xs text-slate-500 truncate">
                                {row.account}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {isResolved ? (
                              getResolutionBadge(row.resolutionType, row.uploadedFiles)
                            ) : (
                              <span className="rounded-full bg-amber-50 text-amber-800 px-2 py-0.5 text-[10px] font-semibold border border-amber-200">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Transaction & Flagged Reason Container */}
                        <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">
                                {row.description}
                              </h4>
                            </div>
                            <div className="text-right shrink-0">
                              <div
                                className={`font-mono text-xs font-semibold ${
                                  issue.type === "missing"
                                    ? "text-rose-600"
                                    : "text-slate-900"
                                }`}
                              >
                                {row.amount}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-medium">
                            {issue.type === "missing" ? (
                              <FileQuestion className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                            ) : issue.type === "variance" ? (
                              <Scale className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            ) : issue.type === "duplicate" ? (
                              <Copy className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            ) : issue.type === "transfer" ? (
                              <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            )}
                            <span
                              className={
                                issue.type === "missing"
                                  ? "text-rose-600 font-semibold"
                                  : "text-slate-900 font-semibold"
                              }
                            >
                              {issue.label}:
                            </span>
                            <span className="text-slate-600 text-[11px] truncate">
                              {issue.detail}
                            </span>
                          </div>
                        </div>

                        {/* Footer: Action button */}
                        <div className="flex items-center justify-end pt-1">
                          {isResolved ? (
                            <button
                              type="button"
                              onClick={() => setResolutionModalItem(row)}
                              className="rounded border border-slate-200 bg-white text-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                              Edit resolution
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setResolutionModalItem(row)}
                              className="rounded bg-slate-900 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

                {/* Card view pagination strip */}
                <div className="flex items-center justify-between px-3.5 py-2.5 border border-slate-200/90 rounded-xl bg-white text-xs text-slate-500">
                  <span>Showing {filteredReviewItems.length} items</span>
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
            )}
          </div>
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

      <OwnerResolutionModal
        open={Boolean(resolutionModalItem)}
        onOpenChange={(open) => {
          if (!open) setResolutionModalItem(null);
        }}
        item={resolutionModalItem}
        onResolve={handleResolveItem}
      />
    </div>
  );
}
