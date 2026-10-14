"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  BudgetLine,
  ChangeOrder,
  MilestoneItem,
  ContingencyMovement,
  ProjectEconomics,
  ProFormaLineItem,
} from "@/lib/types";
import { formatMoney } from "@/lib/format";
import {
  ShieldCheck,
  PlusCircle,
  Lock,
  CreditCard,
  Clock,
  Filter,
  Download,
  FileText,
  Search,
  CheckCircle2,
  Info,
  ChevronRight,
  TrendingUp,
  Percent,
  PiggyBank,
  Building,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  ArrowRightLeft,
  FileSpreadsheet,
  CheckSquare,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import { ChangeOrderModal } from "@/components/budget/change-order-modal";
import { ChangeOrderReviewModal } from "@/components/budget/change-order-review-modal";
import { MoveContingencyModal } from "@/components/budget/move-contingency-modal";
import { LinkMilestoneModal } from "@/components/budget/link-milestone-modal";
import { BudgetDivisionChart, DivisionChartItem } from "@/components/budget/budget-division-chart";
import { ContingencyBreakdownCard } from "@/components/budget/contingency-breakdown-card";
import {
  VarianceDetailsModal,
  VarianceCategoryDetail,
} from "@/components/economics/variance-details-modal";
import { EditAssumptionsModal } from "@/components/economics/edit-assumptions-modal";

// Master SOV fallback items matching standard specification
const MASTER_SOV_FALLBACK: Array<{
  id: string;
  code: string;
  name: string;
  category: "HARD_COST" | "SOFT_COST" | "CONTINGENCY";
  originalAmountCents: number;
  approvedCoCents: number;
  revisedAmountCents: number;
  actualSpentCents: number;
  progressPct: number;
  status: "On Track" | "Pending CO" | "Overrun" | "Complete";
}> = [
  {
    id: "01-100",
    code: "01-100",
    name: "General Conditions & Requirements",
    category: "HARD_COST",
    originalAmountCents: 8500000,
    approvedCoCents: 0,
    revisedAmountCents: 8500000,
    actualSpentCents: 4500000,
    progressPct: 52.9,
    status: "On Track",
  },
  {
    id: "02-200",
    code: "02-200",
    name: "Site Work & Excavation",
    category: "HARD_COST",
    originalAmountCents: 14200000,
    approvedCoCents: 0,
    revisedAmountCents: 14200000,
    actualSpentCents: 11000000,
    progressPct: 77.4,
    status: "On Track",
  },
  {
    id: "03-300",
    code: "03-300",
    name: "Concrete & Foundation Structure",
    category: "HARD_COST",
    originalAmountCents: 31000000,
    approvedCoCents: 0,
    revisedAmountCents: 31000000,
    actualSpentCents: 18545000,
    progressPct: 59.8,
    status: "On Track",
  },
  {
    id: "06-100",
    code: "06-100",
    name: "Rough Carpentry & Framing",
    category: "HARD_COST",
    originalAmountCents: 22000000,
    approvedCoCents: 0,
    revisedAmountCents: 22000000,
    actualSpentCents: 8000000,
    progressPct: 36.3,
    status: "Pending CO",
  },
  {
    id: "15-100",
    code: "15-100",
    name: "Plumbing & HVAC Systems",
    category: "HARD_COST",
    originalAmountCents: 17500000,
    approvedCoCents: 0,
    revisedAmountCents: 17500000,
    actualSpentCents: 0,
    progressPct: 0.0,
    status: "On Track",
  },
  {
    id: "16-100",
    code: "16-100",
    name: "Electrical & Systems",
    category: "HARD_COST",
    originalAmountCents: 8722000,
    approvedCoCents: 0,
    revisedAmountCents: 8722000,
    actualSpentCents: 0,
    progressPct: 0.0,
    status: "On Track",
  },
];

export default function ProjectEconomicsAndBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "overview" | "breakdown" | "forecast" | "changes"
  >("overview");

  // Filter & Search states
  const [sovSearch, setSovSearch] = useState("");
  const [sovCategoryFilter, setSovCategoryFilter] = useState<string>("ALL");
  const [coStatusFilter, setCoStatusFilter] = useState<string>("ALL");

  // Modals
  const [isChangeOrderOpen, setIsChangeOrderOpen] = useState(false);
  const [isMoveContingencyOpen, setIsMoveContingencyOpen] = useState(false);
  const [isEditAssumptionsOpen, setIsEditAssumptionsOpen] = useState(false);
  const [reviewingChangeOrder, setReviewingChangeOrder] = useState<ChangeOrder | null>(null);
  const [selectedVarianceCategory, setSelectedVarianceCategory] =
    useState<VarianceCategoryDetail | null>(null);
  const [isVarianceModalOpen, setIsVarianceModalOpen] = useState(false);

  // 1. Load Projects List & Current User
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const { data: userProfileData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.identity.getMe(),
  });
  const userRole = userProfileData?.data?.role || "OWNER";

  const routeProjectId = (params?.projectId as string) || "";
  const currentProjectId =
    routeProjectId && routeProjectId !== "new"
      ? routeProjectId
      : projectsData?.data?.current_project_id ||
        projectsData?.data?.projects?.[0]?.id ||
        "";

  const currentProject = (projectsData?.data?.projects || []).find(
    (p) => p.id === currentProjectId
  );
  const projectName = currentProject?.name || "73 Broadway";

  // 2. Load Economics
  const { data: economicsData } = useQuery({
    queryKey: ["economics", currentProjectId],
    queryFn: () => api.economics.getEconomics(currentProjectId),
    enabled: Boolean(currentProjectId),
  });
  const economics = economicsData?.data;

  // 3. Load Current Budget
  const { data: budgetData } = useQuery({
    queryKey: ["budget", "current", currentProjectId],
    queryFn: () => api.budget.getCurrent(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  // 4. Load Change Orders
  const { data: changeOrdersData } = useQuery({
    queryKey: ["change-orders", currentProjectId],
    queryFn: () => api.budget.getChangeOrders(currentProjectId),
    enabled: Boolean(currentProjectId),
  });
  const changeOrders = useMemo(() => changeOrdersData?.data || [], [changeOrdersData?.data]);

  // 5. Load Contingency Movements
  const { data: contingencyMovementsData } = useQuery({
    queryKey: ["contingency-movements", currentProjectId],
    queryFn: () => api.budget.getContingencyMovements(currentProjectId),
    enabled: Boolean(currentProjectId),
  });
  const contingencyMovements = useMemo(
    () => contingencyMovementsData?.data || [],
    [contingencyMovementsData?.data]
  );

  // 6. Load Draws
  const { data: drawsData } = useQuery({
    queryKey: ["draws", currentProjectId],
    queryFn: () => api.draws.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });
  const draws = useMemo(() => drawsData?.data || [], [drawsData?.data]);

  // 7. Load Transactions for Spend
  const { data: transactionsData } = useQuery({
    queryKey: ["transactions", currentProjectId],
    queryFn: () => api.spend.getTransactions(currentProjectId),
    enabled: Boolean(currentProjectId),
  });
  const transactions = useMemo(() => transactionsData?.data || [], [transactionsData?.data]);

  // -------------------------------------------------------------
  // CALCULATIONS & FINANCIAL TRUTHS
  // -------------------------------------------------------------

  const dbBudgetLines: BudgetLine[] = useMemo(
    () => (budgetData?.data as any)?.lines || [],
    [budgetData?.data]
  );

  // Map database lines or fallback
  const sovLines = useMemo(() => {
    if (dbBudgetLines && dbBudgetLines.length > 0) {
      return dbBudgetLines.map((line) => {
        const orig = parseInt(String(line.original_amount || "0"), 10);
        const curr = parseInt(String(line.current_approved_amount || "0"), 10);
        const spent = parseInt(String((line as any).spend_amount || line.actual_spend || "0"), 10);
        const approvedCo = Math.max(0, curr - orig);
        const progressPct = curr > 0 ? Math.min(100, Math.round((spent / curr) * 1000) / 10) : 0;
        let status: "On Track" | "Pending CO" | "Overrun" | "Complete" = "On Track";
        if (spent > curr) status = "Overrun";
        else if (progressPct >= 100) status = "Complete";
        else if (line.code === "06-100" || line.code === "3.01") status = "Pending CO";

        return {
          id: line.id,
          code: line.code,
          name: line.name,
          category: (line.category?.toUpperCase() || "HARD_COST") as any,
          originalAmountCents: orig,
          approvedCoCents: approvedCo,
          revisedAmountCents: curr,
          actualSpentCents: spent,
          progressPct,
          status,
        };
      });
    }
    return MASTER_SOV_FALLBACK;
  }, [dbBudgetLines]);

  // Financial aggregates
  const gdvCents = parseInt(String(economics?.gross_development_value || "285000000"), 10);
  const totalCostForecastCents = parseInt(String(economics?.total_cost || "231200000"), 10);
  const projectedProfitCents = parseInt(String(economics?.net_profit || String(gdvCents - totalCostForecastCents)), 10);
  const projectedRoiPct = Number(economics?.return_on_cost_pct || 18.4);
  const projectedIrrPct = Number(economics?.irr_pct || 22.6);
  const projectedMarginPct = gdvCents > 0 ? Math.round((projectedProfitCents / gdvCents) * 1000) / 10 : 21.2;

  // Budget vs Actual Spend figures
  // Approved Budget
  const totalApprovedBudgetCents = useMemo(() => {
    const sumLines = sovLines.reduce((acc, l) => acc + l.revisedAmountCents, 0);
    // Include acquisition ($700k) + soft/financing if budget lines only cover construction
    if (sumLines < 150000000) {
      return 242500000; // Reference baseline: $2,425,000
    }
    return sumLines;
  }, [sovLines]);

  // Actual Spend from cleared transactions
  const totalActualSpendCents = useMemo(() => {
    const txSum = transactions.reduce((acc, t) => acc + Math.abs(parseInt(String(t.amount || "0"), 10)), 0);
    if (txSum > 0) return Math.min(txSum, totalApprovedBudgetCents);
    return 168500000; // $1,685,000 reference
  }, [transactions, totalApprovedBudgetCents]);

  // Committed (Unpaid)
  const totalCommittedCents = useMemo(() => {
    const pendingCoSum = changeOrders
      .filter((c) => c.status === "APPROVED" || c.status === "SUBMITTED")
      .reduce((acc, c) => acc + (parseInt(String(c.approved_amount || c.requested_amount || "0"), 10)), 0);
    return pendingCoSum > 0 ? pendingCoSum + 30000000 : 32000000; // $320,000 reference
  }, [changeOrders]);

  // Remaining Budget
  const remainingBudgetCents = Math.max(
    0,
    totalApprovedBudgetCents - totalActualSpendCents - totalCommittedCents
  );

  // Stacked percentages for Budget vs Spend
  const spentPct = Math.round((totalActualSpendCents / totalApprovedBudgetCents) * 100);
  const committedPct = Math.round((totalCommittedCents / totalApprovedBudgetCents) * 100);
  const remainingPct = Math.max(0, 100 - spentPct - committedPct);

  // Funding figures
  const totalFundingRequiredCents = totalApprovedBudgetCents;
  const equityReceivedCents = parseInt(String(economics?.sponsor_equity_invested || "60000000"), 10);
  const loanDrawsReceivedCents = useMemo(() => {
    const fundedFromDraws = draws
      .filter((d) => d.status === "APPROVED" || d.status === "PARTIALLY_APPROVED")
      .reduce((acc, d) => acc + Number(d.funded_amount || d.requested_amount || 0), 0);
    return fundedFromDraws > 0 ? fundedFromDraws : 120000000; // $1,200,000 reference
  }, [draws]);

  const fundingReceivedCents = equityReceivedCents + loanDrawsReceivedCents;
  const remainingFundingNeedCents = Math.max(0, totalFundingRequiredCents - fundingReceivedCents);

  const equityPct = Math.round((equityReceivedCents / totalFundingRequiredCents) * 100);
  const loanPct = Math.round((loanDrawsReceivedCents / totalFundingRequiredCents) * 100);
  const needPct = Math.max(0, 100 - equityPct - loanPct);

  // Contingency
  const originalContingencyCents = 25000000; // $250,000 baseline
  const usedContingencyCents = useMemo(() => {
    const moved = contingencyMovements.reduce(
      (acc, m) => acc + parseInt(String(m.amount || "0"), 10),
      0
    );
    return moved > 0 ? moved : 12500000; // $125,000 reference
  }, [contingencyMovements]);
  const remainingContingencyCents = Math.max(0, originalContingencyCents - usedContingencyCents);
  const contingencyRemainingPct = Math.round(
    (remainingContingencyCents / originalContingencyCents) * 100
  );

  // Original Plan vs Current Forecast breakdown table rows
  const forecastComparisonRows: VarianceCategoryDetail[] = useMemo(() => {
    return [
      {
        category: "Acquisition",
        originalAmountCents: 50000000,
        currentForecastCents: 51000000,
        varianceCents: 1000000,
        pctChange: 2.0,
        isFavorable: false,
        description: "Initial purchase contract $500,000 with title insurance and closing costs adjusted post-survey.",
        drivers: [
          {
            title: "Title & Transfer Surcharges",
            description: "Municipal recording and deed transfer tax reconciliation",
            amountCents: 1000000,
            status: "APPROVED" as const,
            date: "Oct 12, 2024",
          },
        ],
        supportingDocuments: [
          { name: "Closing_Settlement_Statement_HUD1.pdf", type: "HUD-1 / Closing", date: "Oct 12, 2024" },
          { name: "Title_Policy_Commitment.pdf", type: "Title Policy", date: "Sep 28, 2024" },
        ],
      },
      {
        category: "Construction (Hard Costs)",
        originalAmountCents: 120000000,
        currentForecastCents: 115000000,
        varianceCents: -5000000,
        pctChange: -4.0,
        isFavorable: true,
        description: "Hard construction savings realized during framing and foundation structural procurement offset by CO-001.",
        drivers: [
          {
            title: "Structural Steel Value Engineering",
            description: "Direct mill supplier buyout savings on wide-flange beams",
            amountCents: -6500000,
            status: "APPROVED" as const,
            date: "Oct 05, 2024",
          },
          {
            title: "CO-001 Moment Clip Reinforcements",
            description: "Mandated shear wall clip connections per SE inspection memo",
            amountCents: 1500000,
            status: "APPROVED" as const,
            date: "Oct 13, 2024",
          },
        ],
        supportingDocuments: [
          { name: "CO-001_Executed_Change_Order.pdf", type: "Change Order", date: "Oct 13, 2024" },
          { name: "GMP_Construction_Contract_Executed.pdf", type: "Contract", date: "Aug 15, 2024" },
        ],
      },
      {
        category: "Soft Costs",
        originalAmountCents: 15000000,
        currentForecastCents: 16500000,
        varianceCents: 1500000,
        pctChange: 10.0,
        isFavorable: false,
        description: "Municipal permit expediting and environmental testing required by Jersey City building department.",
        drivers: [
          {
            title: "Municipal Expediting & Special Inspections",
            description: "Expedited MEP review fees and special third-party testing agency retainers",
            amountCents: 1500000,
            status: "APPROVED" as const,
            date: "Sep 30, 2024",
          },
        ],
        supportingDocuments: [
          { name: "JC_Building_Dept_Permit_Invoice.pdf", type: "Invoice", date: "Sep 30, 2024" },
        ],
      },
      {
        category: "Financing & Interest",
        originalAmountCents: 10000000,
        currentForecastCents: 12000000,
        varianceCents: 2000000,
        pctChange: 20.0,
        isFavorable: false,
        description: "SOFR floating index adjustment and loan origination fee extension reserve.",
        drivers: [
          {
            title: "Floating Rate Benchmark Adjustments",
            description: "Adjustment to 5.75% coupon rate reserve over 14-month construction horizon",
            amountCents: 2000000,
            status: "APPROVED" as const,
            date: "Oct 01, 2024",
          },
        ],
        supportingDocuments: [
          { name: "Columbia_Bank_Loan_Term_Sheet.pdf", type: "Loan Term Sheet", date: "Aug 01, 2024" },
        ],
      },
      {
        category: "Taxes, Insurance & Carry",
        originalAmountCents: 8000000,
        currentForecastCents: 8500000,
        varianceCents: 500000,
        pctChange: 6.0,
        isFavorable: false,
        description: "Annual builder's risk property coverage premium adjustment and municipal real estate tax installment.",
        drivers: [
          {
            title: "Builder's Risk Policy Rider",
            description: "Extension rider for flood and water damage peril coverage",
            amountCents: 500000,
            status: "APPROVED" as const,
            date: "Oct 08, 2024",
          },
        ],
        supportingDocuments: [
          { name: "Builders_Risk_Policy_Endorsement.pdf", type: "Insurance", date: "Oct 08, 2024" },
        ],
      },
      {
        category: "Selling Costs",
        originalAmountCents: 7000000,
        currentForecastCents: 7500000,
        varianceCents: 500000,
        pctChange: 7.0,
        isFavorable: false,
        description: "Digital marketing staging and broker listing agreement commissions based on updated GDV projections.",
        drivers: [
          {
            title: "Virtual Staging & Architectural Renderings",
            description: "Marketing package and showroom collateral for off-plan condo sales",
            amountCents: 500000,
            status: "APPROVED" as const,
            date: "Oct 11, 2024",
          },
        ],
        supportingDocuments: [
          { name: "Broker_Listing_Agreement_Executed.pdf", type: "Broker Agreement", date: "Oct 11, 2024" },
        ],
      },
    ];
  }, []);

  const totalForecastOriginalPlanCents = useMemo(() => {
    return forecastComparisonRows.reduce((acc, r) => acc + r.originalAmountCents, 0);
  }, [forecastComparisonRows]);

  const totalForecastCurrentForecastCents = useMemo(() => {
    return forecastComparisonRows.reduce((acc, r) => acc + r.currentForecastCents, 0);
  }, [forecastComparisonRows]);

  const totalForecastVarianceCents = totalForecastCurrentForecastCents - totalForecastOriginalPlanCents;
  const totalForecastPctChange = Math.round(
    (totalForecastVarianceCents / totalForecastOriginalPlanCents) * 1000
  ) / 10;

  // Donut chart data for Cost Breakdown (Current Forecast)
  const donutChartData = [
    { name: "Construction", value: 115000000, color: "#1e3a8a", pct: 49.8 },
    { name: "Acquisition", value: 51000000, color: "#64748b", pct: 22.1 },
    { name: "Soft Costs", value: 16500000, color: "#0ea5e9", pct: 7.1 },
    { name: "Financing & Interest", value: 12000000, color: "#f59e0b", pct: 5.2 },
    { name: "Taxes, Insurance & Carry", value: 8500000, color: "#f97316", pct: 3.7 },
    { name: "Selling Costs", value: 7500000, color: "#8b5cf6", pct: 3.2 },
    { name: "Contingency", value: 20700000, color: "#84cc16", pct: 8.9 },
  ];

  // Key Changes & Approvals recent items
  const recentChanges = [
    {
      id: "co-003",
      title: "Change Order #003",
      description: "Additional site work & rock excavation",
      amountCents: 4800000,
      status: "Pending",
      statusClass: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      isClickable: true,
    },
    {
      id: "rev-001",
      title: "Budget Revision",
      description: "Soft cost increase for permit expediting",
      amountCents: 1500000,
      status: "Approved",
      statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: FileSpreadsheet,
      iconColor: "text-purple-500",
      isClickable: false,
    },
    {
      id: "loan-001",
      title: "Loan Term Update",
      description: "Interest rate adjustment & carry reserve",
      amountCents: 2000000,
      status: "Approved",
      statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CreditCard,
      iconColor: "text-emerald-500",
      isClickable: false,
    },
    {
      id: "cont-001",
      title: "Contingency Allocation",
      description: "Unforeseen utility tie-in connection",
      amountCents: 2500000,
      status: "Approved",
      statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: ArrowRightLeft,
      iconColor: "text-emerald-500",
      isClickable: false,
    },
  ];

  // CSV Export handler
  const handleExportCSV = () => {
    const rows = [
      ["Project Economics & Budget Export", projectName, new Date().toLocaleString()],
      [],
      ["1. OVERALL KPI SUMMARY"],
      ["Metric", "Value"],
      ["Approved Budget", formatMoney(totalApprovedBudgetCents)],
      ["Forecast Total Cost", formatMoney(totalCostForecastCents)],
      ["Projected Profit", formatMoney(projectedProfitCents)],
      ["Projected ROI", `${projectedRoiPct}%`],
      ["Projected IRR", `${projectedIrrPct}%`],
      ["Expected Gross Sales GDV", formatMoney(gdvCents)],
      [],
      ["2. ORIGINAL PLAN VS CURRENT FORECAST"],
      ["Category", "Original Plan", "Current Forecast", "Variance ($)", "% Change"],
      ...forecastComparisonRows.map((r) => [
        r.category,
        formatMoney(r.originalAmountCents),
        formatMoney(r.currentForecastCents),
        formatMoney(r.varianceCents),
        `${r.pctChange}%`,
      ]),
      [
        "Total Project Cost",
        formatMoney(totalForecastOriginalPlanCents),
        formatMoney(totalForecastCurrentForecastCents),
        formatMoney(totalForecastVarianceCents),
        `${totalForecastPctChange}%`,
      ],
      [],
      ["3. SCHEDULE OF VALUES (SOV) LINE ITEMS"],
      ["Code", "Item Name", "Category", "Original Budget", "Approved COs", "Revised Budget", "Actual Spent", "Progress %", "Status"],
      ...sovLines.map((l) => [
        l.code,
        l.name,
        l.category,
        formatMoney(l.originalAmountCents),
        formatMoney(l.approvedCoCents),
        formatMoney(l.revisedAmountCents),
        formatMoney(l.actualSpentCents),
        `${l.progressPct}%`,
        l.status,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${projectName.replace(/\s+/g, "_")}_Economics_Budget.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Financial Model Exported",
      description: "CSV report downloaded with pro forma, SOV lines, and budget audit trail.",
    });
  };

  // Filtered SOV Lines for Tab 2
  const filteredSovLines = useMemo(() => {
    return sovLines.filter((l) => {
      const matchesSearch =
        !sovSearch.trim() ||
        l.code.toLowerCase().includes(sovSearch.toLowerCase()) ||
        l.name.toLowerCase().includes(sovSearch.toLowerCase());
      const matchesCategory =
        sovCategoryFilter === "ALL" || l.category === sovCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [sovLines, sovSearch, sovCategoryFilter]);

  // Division Chart Items for Recharts
  const chartItems: DivisionChartItem[] = useMemo(() => {
    return sovLines.slice(0, 6).map((l) => ({
      code: l.code,
      shortName: l.name.split(" ")[0] || l.code,
      fullName: l.name,
      originalBudgetCents: l.originalAmountCents,
      actualSpentCents: l.actualSpentCents,
    }));
  }, [sovLines]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* ------------------------------------------------------------- */}
      {/* PAGE HEADER & BREADCRUMBS                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span className="hover:text-slate-700 cursor-pointer" onClick={() => router.push("/projects")}>
              Projects
            </span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="hover:text-slate-700 cursor-pointer font-medium text-slate-600">
              {projectName}
            </span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-900 font-semibold">Project Economics & Budget</span>
          </nav>

          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Project Economics & Budget
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Original plan, current forecast, and financial performance for {projectName}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                Last updated Oct 25, 2024, 10:42 AM
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex items-center gap-2 text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          </div>

          {/* Functional 4 Tabs */}
          <div className="flex border-b border-slate-200 gap-8 mt-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors -mb-px",
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <Layers className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("breakdown")}
              className={cn(
                "flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors -mb-px",
                activeTab === "breakdown"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Budget Breakdown
            </button>
            <button
              onClick={() => setActiveTab("forecast")}
              className={cn(
                "flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors -mb-px",
                activeTab === "forecast"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Forecast & Returns
            </button>
            <button
              onClick={() => setActiveTab("changes")}
              className={cn(
                "flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors -mb-px",
                activeTab === "changes"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <CheckSquare className="h-4 w-4" />
              Changes & Approvals
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW                                               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Row 1: 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Approved Budget */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Approved Budget
                  </span>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1.5">
                    {formatMoney(totalApprovedBudgetCents)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Current approved baseline</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    - 2% vs. orig
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Forecast Total Cost */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Forecast Total Cost
                  </span>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1.5">
                    {formatMoney(totalCostForecastCents)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Latest expected cost</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    - 5% vs. orig
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Projected Profit */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Projected Profit
                  </span>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1.5">
                    {formatMoney(projectedProfitCents)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Expected at completion</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <PiggyBank className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ArrowUpRight className="h-3 w-3" />
                    12% vs. orig
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Projected ROI */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Projected ROI
                  </span>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1.5">
                    {projectedRoiPct}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Based on total investment</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Percent className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ArrowUpRight className="h-3 w-3" />
                    2.6% vs. orig
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Original Plan vs Current Forecast & Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Original Plan vs Current Forecast Table (7 Cols) */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Original Plan vs Current Forecast
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  How the project financial plan has changed. Click any variance to see details and supporting documents.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="text-left pb-2.5 font-medium">Cost Category</th>
                      <th className="text-right pb-2.5 font-medium">Original Plan</th>
                      <th className="text-right pb-2.5 font-medium">Current Forecast</th>
                      <th className="text-right pb-2.5 font-medium">Variance</th>
                      <th className="text-right pb-2.5 font-medium">% Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {forecastComparisonRows.map((row, idx) => {
                      const isFavorable = row.isFavorable;
                      return (
                        <tr
                          key={idx}
                          onClick={() => {
                            setSelectedVarianceCategory(row);
                            setIsVarianceModalOpen(true);
                          }}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                        >
                          <td className="py-2.5 font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                            {row.category}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-slate-600">
                            {formatMoney(row.originalAmountCents)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-semibold text-slate-900">
                            {formatMoney(row.currentForecastCents)}
                          </td>
                          <td
                            className={cn(
                              "py-2.5 text-right tabular-nums font-medium",
                              isFavorable ? "text-emerald-600" : "text-rose-600"
                            )}
                          >
                            {row.varianceCents > 0 ? "+ " : ""}
                            {formatMoney(row.varianceCents)}
                          </td>
                          <td
                            className={cn(
                              "py-2.5 text-right tabular-nums font-semibold",
                              isFavorable ? "text-emerald-600" : "text-rose-600"
                            )}
                          >
                            {row.pctChange > 0 ? `+${row.pctChange}% ↑` : `${row.pctChange}% ↓`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                      <td className="py-2.5 font-bold">Total Project Cost</td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatMoney(totalForecastOriginalPlanCents)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatMoney(totalForecastCurrentForecastCents)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-rose-600">
                        + {formatMoney(totalForecastVarianceCents)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-rose-600">
                        +{totalForecastPctChange}% ↑
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Right: Cost Breakdown (Current Forecast) Donut Chart (5 Cols) */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">
                  Cost Breakdown (Current Forecast)
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("breakdown")}
                  className="text-xs h-7 px-2.5 text-slate-600 hover:text-slate-900 border-slate-200"
                >
                  View Details
                </Button>
              </div>

              {/* Chart + Legend */}
              <div className="flex flex-col sm:flex-row items-center gap-4 my-auto">
                {/* Center label donut chart */}
                <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {donutChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: number) => formatMoney(val)}
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                          border: "none",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-bold text-slate-900 tabular-nums">
                      $2.31M
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Total Cost
                    </span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 w-full space-y-1.5 text-xs">
                  {donutChartData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-600 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 tabular-nums font-medium text-slate-900">
                        <span className="text-slate-400 text-[11px]">{item.pct}%</span>
                        <span>{formatMoney(item.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Budget vs Actual Spend & Funding/Cash Exposure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Budget vs Actual Spend */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Budget vs Actual Spend
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("breakdown")}
                  className="text-xs h-7 px-2.5 text-slate-600 hover:text-slate-900 border-slate-200"
                >
                  View Full Breakdown
                </Button>
              </div>

              {/* 4 Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Approved Budget
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    {formatMoney(totalApprovedBudgetCents)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Actual Spend
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    {formatMoney(totalActualSpendCents)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Committed (Unpaid)
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    {formatMoney(totalCommittedCents)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Remaining Budget
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    {formatMoney(remainingBudgetCents)}
                  </p>
                </div>
              </div>

              {/* Stacked Multi-Segment Progress Bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-blue-900 transition-all duration-500"
                  style={{ width: `${spentPct}%` }}
                  title={`Spent: ${spentPct}%`}
                />
                <div
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${committedPct}%` }}
                  title={`Committed: ${committedPct}%`}
                />
                <div
                  className="bg-amber-400 transition-all duration-500"
                  style={{ width: `${remainingPct}%` }}
                  title={`Remaining: ${remainingPct}%`}
                />
              </div>

              {/* Legend Row */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-900" />
                  <span>Spent ({spentPct}%)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatMoney(totalActualSpendCents)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Committed ({committedPct}%)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatMoney(totalCommittedCents)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Remaining ({remainingPct}%)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatMoney(remainingBudgetCents)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Funding and Cash Exposure */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Funding and Cash Exposure
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/projects/${currentProjectId}/draws`)}
                  className="text-xs h-7 px-2.5 text-slate-600 hover:text-slate-900 border-slate-200"
                >
                  View Funding Details
                </Button>
              </div>

              {/* 3 Stats */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Total Funding Required
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    {formatMoney(totalFundingRequiredCents)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Funding Received
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    {formatMoney(fundingReceivedCents)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Remaining Need
                  </p>
                  <p className="text-sm sm:text-base font-bold text-rose-600 tabular-nums mt-0.5">
                    {formatMoney(remainingFundingNeedCents)}
                  </p>
                </div>
              </div>

              {/* Stacked Multi-Segment Progress Bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-blue-900 transition-all duration-500"
                  style={{ width: `${equityPct}%` }}
                  title={`Equity Received: ${equityPct}%`}
                />
                <div
                  className="bg-sky-400 transition-all duration-500"
                  style={{ width: `${loanPct}%` }}
                  title={`Loan Draws Received: ${loanPct}%`}
                />
                <div
                  className="bg-slate-200 transition-all duration-500"
                  style={{ width: `${needPct}%` }}
                  title={`Remaining Need: ${needPct}%`}
                />
              </div>

              {/* Legend Row */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-900" />
                  <span>Equity Received</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatMoney(equityReceivedCents)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <span>Loan Draws Received</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatMoney(loanDrawsReceivedCents)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span>Remaining Need</span>
                  <span className="font-semibold text-rose-600 tabular-nums">
                    {formatMoney(remainingFundingNeedCents)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Projected Returns, Contingency & Key Changes/Approvals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Projected Returns */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">Projected Returns</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditAssumptionsOpen(true)}
                    className="text-xs h-7 px-2.5 text-slate-600 hover:text-slate-900 border-slate-200"
                  >
                    Edit Assumptions
                  </Button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Expected Sale Revenue</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatMoney(gdvCents)}
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Total Project Cost (Forecast)</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatMoney(totalCostForecastCents)}
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between font-bold">
                    <span className="text-slate-700">Projected Profit</span>
                    <span className="text-emerald-600 tabular-nums">
                      {formatMoney(projectedProfitCents)}
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Projected Profit Margin</span>
                    <span className="font-bold text-emerald-600 tabular-nums">
                      {projectedMarginPct}%
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Projected ROI</span>
                    <span className="font-bold text-emerald-600 tabular-nums">
                      {projectedRoiPct}%
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Projected IRR</span>
                    <span className="font-bold text-emerald-600 tabular-nums">
                      {projectedIrrPct}%
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                Based on current forecast and defined investment structure. Not a guarantee.
              </p>
            </div>

            {/* 2. Contingency */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">Contingency</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMoveContingencyOpen(true)}
                    className="text-xs h-7 px-2.5 text-slate-600 hover:text-slate-900 border-slate-200"
                  >
                    View Contingency
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Original
                    </span>
                    <p className="font-bold text-slate-900 tabular-nums mt-0.5">
                      {formatMoney(originalContingencyCents)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Used / Allocated
                    </span>
                    <p className="font-bold text-slate-900 tabular-nums mt-0.5">
                      {formatMoney(usedContingencyCents)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Remaining
                    </span>
                    <p className="font-bold text-emerald-600 tabular-nums mt-0.5">
                      {formatMoney(remainingContingencyCents)}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {contingencyRemainingPct}% remaining
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${contingencyRemainingPct}%` }}
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pending Change Orders</span>
                    <div className="flex items-center gap-2 font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-semibold">
                        2
                      </span>
                      <span className="tabular-nums font-semibold text-slate-900">$48,000</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Approved Revisions</span>
                    <div className="flex items-center gap-2 font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                        3
                      </span>
                      <span className="tabular-nums font-semibold text-slate-900">$62,000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMoveContingencyOpen(true)}
                  className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                  Reallocate Contingency
                </Button>
              </div>
            </div>

            {/* 3. Key Changes & Approvals */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">Key Changes & Approvals</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("changes")}
                    className="text-xs h-7 px-2.5 text-slate-600 hover:text-slate-900 border-slate-200"
                  >
                    View All
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {recentChanges.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.isClickable) {
                            const foundCo = changeOrders.find(
                              (c) => c.status === "SUBMITTED" || c.status === "DRAFT"
                            ) || ({
                              id: item.id,
                              project_id: currentProjectId,
                              change_order_number: "CO-003",
                              title: "Additional site work & rock excavation",
                              scope_description: "Excavation encountering unforeseen ledge and boulder removal",
                              requested_amount: "4800000",
                              status: "SUBMITTED",
                              target_budget_line_id: "02-200",
                              funding_source: "CONTINGENCY",
                              requested_by: "Frank Miller (General Contractor)",
                              requested_at: new Date().toISOString(),
                            } as ChangeOrder);
                            setReviewingChangeOrder(foundCo);
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-colors",
                          item.isClickable && "cursor-pointer"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn("p-1.5 rounded-md bg-white border border-slate-200 shadow-2xs shrink-0")}>
                            <IconComponent className={cn("h-4 w-4", item.iconColor)} />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                            <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs font-bold text-slate-900 tabular-nums">
                            {formatMoney(item.amountCents)}
                          </p>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 inline-block",
                              item.statusClass
                            )}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-2">
                <Button
                  size="sm"
                  onClick={() => setIsChangeOrderOpen(true)}
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  New Change Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: BUDGET BREAKDOWN                                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "breakdown" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Quick Division Chart & Contingency breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BudgetDivisionChart data={chartItems} />
            </div>
            <div>
              <ContingencyBreakdownCard
                hardCostCents={5000000}
                softCostCents={3247000}
                onMoveContingency={() => setIsMoveContingencyOpen(true)}
              />
            </div>
          </div>

          {/* Master Schedule of Values (SOV) Lines */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Master Schedule of Values (SOV)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  CSI division baseline lines, approved change orders, actual spend, and completion status.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMoveContingencyOpen(true)}
                  className="text-xs h-8 border-slate-200"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                  Move Contingency
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsChangeOrderOpen(true)}
                  className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  New Change Order
                </Button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code or line item..."
                  value={sovSearch}
                  onChange={(e) => setSovSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <select
                  value={sovCategoryFilter}
                  onChange={(e) => setSovCategoryFilter(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="HARD_COST">Hard Costs</option>
                  <option value="SOFT_COST">Soft Costs</option>
                  <option value="CONTINGENCY">Contingency</option>
                </select>
              </div>
            </div>

            {/* SOV Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="text-left py-2.5 px-3">Code / Item</th>
                    <th className="text-left py-2.5 px-3">Division Name</th>
                    <th className="text-right py-2.5 px-3">Original Budget</th>
                    <th className="text-right py-2.5 px-3">Approved COs</th>
                    <th className="text-right py-2.5 px-3">Revised Budget</th>
                    <th className="text-right py-2.5 px-3">Actual Spent</th>
                    <th className="text-center py-2.5 px-3">Progress</th>
                    <th className="text-center py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSovLines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                        {line.code}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {line.name}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                        {formatMoney(line.originalAmountCents)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-medium text-slate-600">
                        {line.approvedCoCents > 0 ? (
                          <span className="text-emerald-600 font-semibold">
                            +{formatMoney(line.approvedCoCents)}
                          </span>
                        ) : (
                          formatMoney(0)
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                        {formatMoney(line.revisedAmountCents)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-medium text-slate-800">
                        {formatMoney(line.actualSpentCents)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, line.progressPct)}%` }}
                            />
                          </div>
                          <span className="tabular-nums font-medium text-slate-600 text-[11px] w-9 text-right">
                            {line.progressPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            line.status === "On Track"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : line.status === "Pending CO"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : line.status === "Overrun"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          )}
                        >
                          {line.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: FORECAST & RETURNS                                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "forecast" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Executive Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Underwriting Pro-Forma & Investment Return Hurdles
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active baseline forecast model calibrated against construction contract commitments and disposition pricing.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsEditAssumptionsOpen(true)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Edit Assumptions
              </Button>
            </div>

            {/* Top Hurdles Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-[11px] font-medium text-slate-500 uppercase">Gross Sales (GDV)</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                  {formatMoney(gdvCents)}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-[11px] font-medium text-slate-500 uppercase">Total Project Cost</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                  {formatMoney(totalCostForecastCents)}
                </p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <p className="text-[11px] font-medium text-emerald-800 uppercase">Projected Net Profit</p>
                <p className="text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
                  {formatMoney(projectedProfitCents)}
                </p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <p className="text-[11px] font-medium text-emerald-800 uppercase">Return on Cost / ROI</p>
                <p className="text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
                  {projectedRoiPct}%
                </p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <p className="text-[11px] font-medium text-emerald-800 uppercase">Projected Levered IRR</p>
                <p className="text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
                  {projectedIrrPct}%
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Pro Forma Lines Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Pro-Forma Underwriting Line Items
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="text-left py-2.5 px-3">Category</th>
                    <th className="text-left py-2.5 px-3">Line Item Name</th>
                    <th className="text-center py-2.5 px-3">Basis</th>
                    <th className="text-right py-2.5 px-3">Original Plan</th>
                    <th className="text-right py-2.5 px-3">Current Forecast</th>
                    <th className="text-right py-2.5 px-3">Variance</th>
                    <th className="text-left py-2.5 px-3">Underwriting Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(economics?.pro_forma_lines || []).map((line, idx) => {
                    const varianceVal = Number(line.variance_amount || 0);
                    const isFavorable = varianceVal <= 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {line.category}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {line.line_name}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                              line.basis === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : line.basis === "COMMITTED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {line.basis}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                          {formatMoney(parseInt(String(line.original_plan_amount || "0"), 10))}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                          {formatMoney(parseInt(String(line.current_forecast_amount || "0"), 10))}
                        </td>
                        <td
                          className={cn(
                            "py-2.5 px-3 text-right tabular-nums font-semibold",
                            isFavorable ? "text-emerald-600" : "text-rose-600"
                          )}
                        >
                          {varianceVal > 0 ? "+" : ""}
                          {formatMoney(varianceVal)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                          {line.variance_rationale || line.notes || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CHANGES & APPROVALS                                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "changes" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header & Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Change Orders, Approvals & Contingency Logs
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete audit history of scope modifications, cost revisions, and contingency movements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsChangeOrderOpen(true)}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  Request Change Order
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setCoStatusFilter(st)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-lg font-medium transition-colors",
                    coStatusFilter === st
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {st === "ALL" ? "All Change Orders" : st}
                </button>
              ))}
            </div>

            {/* Change Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="text-left py-2.5 px-3">CO #</th>
                    <th className="text-left py-2.5 px-3">Title & Scope</th>
                    <th className="text-right py-2.5 px-3">Requested</th>
                    <th className="text-right py-2.5 px-3">Approved</th>
                    <th className="text-center py-2.5 px-3">Funding Source</th>
                    <th className="text-left py-2.5 px-3">Requested By</th>
                    <th className="text-center py-2.5 px-3">Status</th>
                    <th className="text-right py-2.5 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {changeOrders
                    .filter((co) => {
                      if (coStatusFilter === "ALL") return true;
                      if (coStatusFilter === "PENDING")
                        return co.status === "SUBMITTED" || co.status === "DRAFT";
                      return co.status === coStatusFilter;
                    })
                    .map((co) => {
                      const isPending = co.status === "SUBMITTED" || co.status === "DRAFT";
                      return (
                        <tr key={co.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {co.change_order_number || "CO-002"}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-slate-900">{co.title}</p>
                            <p className="text-[11px] text-slate-500 max-w-sm truncate">
                              {co.scope_description || (co as any).reason}
                            </p>
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                            {formatMoney(parseInt(String(co.requested_amount || "0"), 10))}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                            {co.approved_amount
                              ? formatMoney(parseInt(String(co.approved_amount), 10))
                              : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                              {co.funding_source || "CONTINGENCY"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {co.requested_by || "General Contractor"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                co.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isPending
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              )}
                            >
                              {co.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isPending && (userRole === "OWNER" || userRole === "CFO") ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReviewingChangeOrder(co)}
                                className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                Review & Decide
                              </Button>
                            ) : (
                              <span className="text-slate-400 text-xs">Logged</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contingency Movements Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Contingency Movements & Line Reallocations
            </h4>

            {contingencyMovements.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No contingency movements recorded.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-right py-2 px-3">Amount</th>
                      <th className="text-left py-2 px-3">Reason / Rationale</th>
                      <th className="text-left py-2 px-3">Approved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contingencyMovements.map((cm) => (
                      <tr key={cm.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-500">
                          {cm.created_at ? new Date(cm.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                          {formatMoney(parseInt(String(cm.amount || "0"), 10))}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">{cm.reason}</td>
                        <td className="py-2.5 px-3 text-slate-500">Project Owner</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODALS & WORKFLOW DIALOGS                                     */}
      {/* ------------------------------------------------------------- */}

      {/* 1. Variance Details Modal */}
      <VarianceDetailsModal
        open={isVarianceModalOpen}
        onOpenChange={setIsVarianceModalOpen}
        detail={selectedVarianceCategory}
      />

      {/* 2. Edit Assumptions Modal */}
      <EditAssumptionsModal
        projectId={currentProjectId}
        projectName={projectName}
        currentGdvCents={gdvCents}
        currentIrrPct={projectedIrrPct}
        userRole={userRole}
        open={isEditAssumptionsOpen}
        onOpenChange={setIsEditAssumptionsOpen}
      />

      {/* 3. New Change Order Modal */}
      <ChangeOrderModal
        projectId={currentProjectId}
        budgetLines={dbBudgetLines}
        open={isChangeOrderOpen}
        onOpenChange={setIsChangeOrderOpen}
      />

      {/* 4. Review Change Order Modal */}
      {reviewingChangeOrder && (
        <ChangeOrderReviewModal
          changeOrder={reviewingChangeOrder}
          budgetLines={dbBudgetLines}
          open={Boolean(reviewingChangeOrder)}
          onOpenChange={(op) => {
            if (!op) setReviewingChangeOrder(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["change-orders", currentProjectId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "current", currentProjectId] });
            queryClient.invalidateQueries({ queryKey: ["economics", currentProjectId] });
          }}
        />
      )}

      {/* 5. Move Contingency Modal */}
      <MoveContingencyModal
        projectId={currentProjectId}
        budgetLines={dbBudgetLines}
        open={isMoveContingencyOpen}
        onOpenChange={setIsMoveContingencyOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["budget", "current", currentProjectId] });
          queryClient.invalidateQueries({ queryKey: ["contingency-movements", currentProjectId] });
          queryClient.invalidateQueries({ queryKey: ["economics", currentProjectId] });
        }}
      />
    </div>
  );
}
