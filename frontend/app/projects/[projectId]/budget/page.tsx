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
} from "@/lib/types";
import { formatMoney } from "@/lib/format";
import {
  CreditCard,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  TrendingUp,
  Percent,
  Users,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Info,
  Clock,
  ArrowRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  VarianceDetailsModal,
  VarianceCategoryDetail,
} from "@/components/economics/variance-details-modal";
import { EditAssumptionsModal } from "@/components/economics/edit-assumptions-modal";
import {
  AmountMapModal,
  AmountMapDetail,
} from "@/components/economics/amount-map-modal";
import {
  BUDGET_AMOUNT_MAPS,
  getAmountMap,
} from "@/lib/data/budget-amount-maps";
import { Landmark, ShieldCheck, Sparkles, MapPin, ArrowUpRight as ArrowUpRightIcon, Coins } from "lucide-react";

// Micro-component for interactive amounts that open detail modal
function ClickableAmount({
  amountCents,
  onClick,
  className,
  prefix = "",
  suffix = "",
  formattedText,
}: {
  amountCents?: number;
  onClick: () => void;
  className?: string;
  prefix?: string;
  suffix?: string;
  formattedText?: string;
}) {
  const displayVal =
    formattedText || (amountCents !== undefined ? formatMoney(Math.abs(amountCents)) : "");
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex items-center font-semibold tabular-nums hover:text-blue-600 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 rounded",
        className
      )}
      title="Click to view breakdown"
    >
      <span>
        {prefix}
        {displayVal}
        {suffix}
      </span>
    </button>
  );
}

export default function ProjectEconomicsAndBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"overview" | "breakdown" | "forecast">("overview");

  // Modals
  const [isEditAssumptionsOpen, setIsEditAssumptionsOpen] = useState(false);
  const [selectedVarianceCategory, setSelectedVarianceCategory] =
    useState<VarianceCategoryDetail | null>(null);
  const [isVarianceModalOpen, setIsVarianceModalOpen] = useState(false);

  // Amount Map Modal State
  const [selectedAmountMap, setSelectedAmountMap] = useState<AmountMapDetail | null>(null);
  const [isAmountMapOpen, setIsAmountMapOpen] = useState(false);

  const handleOpenAmountMap = (
    key: string,
    categoryName?: string,
    amountCents?: number
  ) => {
    const mapDetail = getAmountMap(key, categoryName, amountCents);
    setSelectedAmountMap(mapDetail);
    setIsAmountMapOpen(true);
  };

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

  // 4. Load Draws
  const { data: drawsData } = useQuery({
    queryKey: ["draws", currentProjectId],
    queryFn: () => api.draws.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  // 5. Load Spend Transactions
  const { data: transactionsData } = useQuery({
    queryKey: ["transactions", currentProjectId],
    queryFn: () => api.spend.getTransactions(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  // -------------------------------------------------------------
  // ACCURATE 73 BROADWAY PROJECT FIGURES & BUSINESS CONSTANTS
  // -------------------------------------------------------------
  const constructionBudgetPdfCents = 101922000; // $1,019,220.00
  const pdfProjectCostsCents = 82470000;        // $824,700.00
  const pdfGcFeeCents = 11205000;               // $112,050.00
  const pdfContingencyCents = 8247000;          // $82,470.00

  const totalWorkbookCostsCents = 130693473;    // $1,306,934.73
  const workbookLandAcquisitionCents = 72539982; // $725,399.82
  const workbookConstructionCents = 65615406;   // $656,154.06
  const workbookOtherCostsCents = -7461915;     // -$74,619.15

  const scopeDifferenceCents = 28771473;        // $287,714.73

  const investorFundingRecordedCents = 60000000; // $600,000.00
  const netCashPositionCents = -70693473;       // -$706,934.73
  const remainingNeedCents = 70693473;          // $706,934.73
  const committedUnpaidCents = 12500000;        // $125,000.00

  // Senior Debt Facility & Capital Stack figures
  const loanFacilityTotalCents = 82445000;      // $824,450.00
  const loanDisbursedCents = 20220000;          // $202,200.00 (Draws 1-3)
  const loanRemainingCents = 62225000;          // $622,250.00 (Draws 4-5)
  const totalCapitalStackCents = 142445000;     // $1,424,450.00 ($600k Equity + $824,450 Loan)
  const solvencyBufferCents = 11751527;         // +$117,515.27 ($1,424,450 - $1,306,934.73)

  // -------------------------------------------------------------
  // TAB 1: OVERVIEW DATA & MODAL DRIVERS
  // -------------------------------------------------------------

  const overviewComparisonRows: VarianceCategoryDetail[] = useMemo(() => [
    {
      category: "Sitework",
      originalAmountCents: 13530000,
      currentForecastCents: 14250000,
      varianceCents: 720000,
      pctChange: 5.0,
      isFavorable: false,
      description: "Utility connections and additional rock excavation beyond initial geotechnical allowance.",
      drivers: [
        {
          title: "Rock Excavation & Trenching",
          description: "Bedrock excavation along south boundary footing",
          amountCents: 720000,
          status: "APPROVED" as const,
          date: "Sep 22, 2025",
        },
      ],
      supportingDocuments: [
        { name: "Budget for 73 Broadway (1).pdf", type: "Budget PDF", date: "Apr 01, 2025" },
        { name: "73 Broadway.xlsx", type: "Ledger Workbook", date: "Oct 25, 2024" },
      ],
    },
    {
      category: "Building",
      originalAmountCents: 30000000,
      currentForecastCents: 31240000,
      varianceCents: 1240000,
      pctChange: 4.0,
      isFavorable: false,
      description: "Framing lumber price adjustments and foundation structural reinforcement clips.",
      drivers: [
        {
          title: "Framing & Lumber Surcharge",
          description: "Mill surcharge on joists and structural shear wall fasteners",
          amountCents: 1240000,
          status: "APPROVED" as const,
          date: "Oct 15, 2025",
        },
      ],
      supportingDocuments: [
        { name: "Budget for 73 Broadway (1).pdf", type: "Budget PDF", date: "Apr 01, 2025" },
        { name: "73 Broadway.xlsx", type: "Ledger Workbook", date: "Oct 25, 2024" },
      ],
    },
    {
      category: "Mechanical",
      originalAmountCents: 11610000,
      currentForecastCents: 12875000,
      varianceCents: 1265000,
      pctChange: 11.0,
      isFavorable: false,
      description: "MEP ductwork reconfiguration and condenser line relocation required by city inspector.",
      drivers: [
        {
          title: "Condenser Relocation & Chase Routing",
          description: "Rooftop condenser vibration isolator and fire-rated chase upgrade",
          amountCents: 1265000,
          status: "APPROVED" as const,
          date: "Nov 04, 2025",
        },
      ],
      supportingDocuments: [
        { name: "Budget for 73 Broadway (1).pdf", type: "Budget PDF", date: "Apr 01, 2025" },
        { name: "73 Broadway.xlsx", type: "Ledger Workbook", date: "Oct 25, 2024" },
      ],
    },
    {
      category: "Interior",
      originalAmountCents: 22820000,
      currentForecastCents: 26850000,
      varianceCents: 4030000,
      pctChange: 18.0,
      isFavorable: false,
      description: "Cabinetry package upgrade and drywall finishing labor for higher grade units.",
      drivers: [
        {
          title: "Kitchen Cabinets & Millwork",
          description: "Solid plywood cabinet boxes and quartz countertops upgrade",
          amountCents: 2300000,
          status: "APPROVED" as const,
          date: "Nov 20, 2025",
        },
        {
          title: "Drywall & Level 5 Plaster Finish",
          description: "Extra skim coat labor and sound attenuation batting",
          amountCents: 1730000,
          status: "APPROVED" as const,
          date: "Dec 16, 2025",
        },
      ],
      supportingDocuments: [
        { name: "Budget for 73 Broadway (1).pdf", type: "Budget PDF", date: "Apr 01, 2025" },
        { name: "73 Broadway.xlsx", type: "Ledger Workbook", date: "Oct 25, 2024" },
      ],
    },
    {
      category: "GC Fee (15%)",
      originalAmountCents: 11205000,
      currentForecastCents: 11205000,
      varianceCents: 0,
      pctChange: 0.0,
      isFavorable: true,
      description: "Contracted builder management fee per approved baseline agreement.",
      drivers: [],
      supportingDocuments: [
        { name: "Budget for 73 Broadway (1).pdf", type: "Budget PDF", date: "Apr 01, 2025" },
      ],
    },
    {
      category: "Contingency (10%)",
      originalAmountCents: 8247000,
      currentForecastCents: 0,
      varianceCents: 0,
      pctChange: 0.0,
      isFavorable: true,
      description: "Owner contingency reserve held in project baseline.",
      drivers: [],
      supportingDocuments: [
        { name: "Budget for 73 Broadway (1).pdf", type: "Budget PDF", date: "Apr 01, 2025" },
      ],
    },
  ], []);

  // Workbook Donut Chart Data
  const workbookCostDonutData = useMemo(() => [
    { name: "Land Acquisition", value: 725399.82, color: "#1d4ed8", pct: 55.5 },
    { name: "Construction", value: 656154.06, color: "#38bdf8", pct: 50.2 },
    { name: "Labour", value: -53291.91, color: "#ea580c", pct: -4.1 },
    { name: "Legal & Accounting", value: 23274.93, color: "#eab308", pct: 1.8 },
    { name: "Bank Fees", value: 809.03, color: "#9333ea", pct: 0.1 },
    { name: "Municipality Expenses", value: 787.96, color: "#64748b", pct: 0.1 },
    { name: "Miscellaneous", value: -150735.16, color: "#ef4444", pct: -11.5 },
  ], []);

  // -------------------------------------------------------------
  // TAB 2: BUDGET BREAKDOWN DATA
  // -------------------------------------------------------------
  const budgetBreakdownCategories = useMemo(() => [
    {
      id: "1",
      name: "Plans, Permits & Closing",
      pdfAmountCents: 4510000,
      pctOfTotal: 4.4,
      actualSpeedCents: 4200000,
      committedCents: 250000,
      remainingCents: 60000,
      varianceCents: -310000,
    },
    {
      id: "2",
      name: "Sitework",
      pdfAmountCents: 13530000,
      pctOfTotal: 13.3,
      actualSpeedCents: 14250000,
      committedCents: 1500000,
      remainingCents: 0,
      varianceCents: 720000,
    },
    {
      id: "3",
      name: "Building",
      pdfAmountCents: 30000000,
      pctOfTotal: 29.4,
      actualSpeedCents: 31240000,
      committedCents: 5000000,
      remainingCents: 0,
      varianceCents: 1240000,
    },
    {
      id: "4",
      name: "Mechanical",
      pdfAmountCents: 11610000,
      pctOfTotal: 11.4,
      actualSpeedCents: 12875000,
      committedCents: 3800000,
      remainingCents: 0,
      varianceCents: 1265000,
    },
    {
      id: "5",
      name: "Interior",
      pdfAmountCents: 22820000,
      pctOfTotal: 22.4,
      actualSpeedCents: 26850000,
      committedCents: 2150000,
      remainingCents: 0,
      varianceCents: 4030000,
    },
    {
      id: "6",
      name: "Contractor Fees",
      pdfAmountCents: 19452000,
      pctOfTotal: 19.1,
      actualSpeedCents: 11205000,
      committedCents: 0,
      remainingCents: 8247000,
      varianceCents: 0,
    },
  ], []);

  const interiorLineItemDetails = useMemo(() => [
    {
      code: "5.01",
      description: "Insulation",
      budgetAmountCents: 1600000,
      actualSpendCents: 1420000,
      committedCents: 100000,
      remainingCents: 0,
      varianceCents: -180000,
    },
    {
      code: "5.02",
      description: "Interior Walls and Ceilings",
      budgetAmountCents: 2600000,
      actualSpendCents: 2850000,
      committedCents: 400000,
      remainingCents: 0,
      varianceCents: 250000,
    },
    {
      code: "5.04",
      description: "Kitchen Cabinets",
      budgetAmountCents: 4000000,
      actualSpendCents: 4230000,
      committedCents: 800000,
      remainingCents: 0,
      varianceCents: 230000,
    },
  ], []);

  // -------------------------------------------------------------
  // TAB 3: FORECAST & RETURNS DATA
  // -------------------------------------------------------------
  const illustrativeReturnChartData = [
    { name: "Total Cost", value: 1.31, color: "#1d4ed8" },
    { name: "Sale Revenue", value: 2.50, color: "#22c55e" },
    { name: "Loan Payoff", value: 0.85, color: "#93c5fd" },
    { name: "Selling Costs", value: 0.15, color: "#facc15" },
    { name: "Projected Profit", value: 1.19, color: "#e0e7ff", isDotted: true },
  ];

  const fundingImpactOnReturns = [
    { mapKey: "investor_funding_recorded", partner: "Partner 1 (Equity)", amountCents: 20000000, pct: "14.0%", status: "Recorded", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { mapKey: "investor_funding_recorded", partner: "Partner 2 (Equity)", amountCents: 20000000, pct: "14.0%", status: "Recorded", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { mapKey: "investor_funding_recorded", partner: "Partner 3 (Equity)", amountCents: 20000000, pct: "14.0%", status: "Recorded", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { mapKey: "bank_loan_facility", partner: "Senior Bank Construction Loan (First National Bank)", amountCents: 82445000, pct: "58.0%", status: "Approved ($202.2k Drawn)", statusColor: "text-teal-700 bg-teal-50 border-teal-200" },
  ];

  // CSV Export handler
  const handleExportCSV = () => {
    const rows = [
      ["Project Economics & Budget Export", projectName, new Date().toLocaleString()],
      [],
      ["1. CONSTRUCTION BUDGET (FROM PDF) VS TOTAL PROJECT COSTS (FROM WORKBOOK)"],
      ["Construction Budget (from PDF)", "$1,019,220.00"],
      ["Total Project Costs (from Workbook)", "$1,306,934.73"],
      ["Difference (Not Confirmed)", "$287,714.73"],
      ["Investor Funding Recorded", "$600,000.00"],
      ["Projected Profit", "Not available (Requires verified budget, funding and sale assumptions)"],
      [],
      ["2. ORIGINAL PLAN VS CURRENT COSTS"],
      ["Category", "Budget (PDF)", "Actual Costs (Workbook)", "Variance", "% Change"],
      ...overviewComparisonRows.map((r) => [
        r.category,
        formatMoney(r.originalAmountCents),
        formatMoney(r.currentForecastCents),
        formatMoney(r.varianceCents),
        r.pctChange > 0 ? `+${r.pctChange}%` : `${r.pctChange}%`,
      ]),
      ["Construction Total", "$1,019,220.00", "$1,306,934.73", "+$287,714.73", "+28%"],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Project_Economics_${projectName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Project economics and budget data exported to CSV.",
    });
  };

  return (
    <div className="min-h-full w-full bg-[#F8FAFC] pb-16 min-w-0">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER & TITLE AREA                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="border-b border-slate-200/90 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0 min-w-0">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <span
              onClick={() => router.push("/projects")}
              className="hover:text-slate-900 cursor-pointer font-medium"
            >
              Projects
            </span>
            <span>/</span>
            <span
              onClick={() => router.push(`/projects/${currentProjectId}/control-center`)}
              className="hover:text-slate-900 cursor-pointer font-medium"
            >
              {projectName}
            </span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">
              Project Economics & Budget
            </span>
          </nav>

          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Project Economics & Budget
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
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
                className="flex items-center gap-2 text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm rounded-lg"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          </div>

          {/* Functional 3 Tabs: Overview, Budget Breakdown, Forecast & Returns */}
          <div className="flex border-b border-slate-200 gap-8 mt-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors -mb-px cursor-pointer",
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
                "flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors -mb-px cursor-pointer",
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
                "flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors -mb-px cursor-pointer",
                activeTab === "forecast"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Forecast & Returns
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW                                               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 min-w-0">
          {/* Row 1: 5 Specialized KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Construction Budget */}
            <div
              onClick={() => handleOpenAmountMap("pdf_construction_budget")}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      Construction Budget
                    </span>
                  </div>
                  <ArrowUpRightIcon className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-xl font-bold text-slate-900 tabular-nums">
                  <ClickableAmount
                    amountCents={101922000}
                    onClick={() => handleOpenAmountMap("pdf_construction_budget")}
                    className="text-xl font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Total Incurred Costs */}
            <div
              onClick={() => handleOpenAmountMap("workbook_total_costs")}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      Total Incurred Costs
                    </span>
                  </div>
                  <ArrowUpRightIcon className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-xl font-bold text-slate-900 tabular-nums">
                  <ClickableAmount
                    amountCents={130693473}
                    onClick={() => handleOpenAmountMap("workbook_total_costs")}
                    className="text-xl font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Scope Difference */}
            <div
              onClick={() => handleOpenAmountMap("scope_difference")}
              className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      Scope Variance
                    </span>
                  </div>
                  <ArrowUpRightIcon className="h-3.5 w-3.5 text-amber-300 group-hover:text-amber-700 transition-colors" />
                </div>
                <div className="text-xl font-bold text-rose-600 tabular-nums">
                  <ClickableAmount
                    amountCents={28771473}
                    onClick={() => handleOpenAmountMap("scope_difference")}
                    className="text-xl font-bold text-rose-600"
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Investor Equity */}
            <div
              onClick={() => handleOpenAmountMap("investor_funding_recorded")}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      Investor Equity
                    </span>
                  </div>
                  <ArrowUpRightIcon className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-xl font-bold text-slate-900 tabular-nums">
                  <ClickableAmount
                    amountCents={60000000}
                    onClick={() => handleOpenAmountMap("investor_funding_recorded")}
                    className="text-xl font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Card 5: Total Capital Stack */}
            <div
              onClick={() => handleOpenAmountMap("capital_stack_total")}
              className="rounded-xl border border-indigo-200/70 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0">
                      <Landmark className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      Total Capital Stack
                    </span>
                  </div>
                  <ArrowUpRightIcon className="h-3.5 w-3.5 text-indigo-300 group-hover:text-indigo-700 transition-colors" />
                </div>
                <div className="text-xl font-bold text-indigo-900 tabular-nums">
                  <ClickableAmount
                    amountCents={142445000}
                    onClick={() => handleOpenAmountMap("capital_stack_total")}
                    className="text-xl font-bold text-indigo-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Original Plan vs Current Costs & Actual Project Costs (Workbook) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Original Plan vs Current Costs Table (7 Cols) */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Original Plan vs Current Costs
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                      <th className="text-left py-2 px-3 font-semibold">Category</th>
                      <th className="text-right py-2 px-3 font-semibold">Approved Budget</th>
                      <th className="text-right py-2 px-3 font-semibold">Actual Costs</th>
                      <th className="text-right py-2 px-3 font-semibold">Variance</th>
                      <th className="text-right py-2 px-3 font-semibold">% Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overviewComparisonRows.map((row, idx) => {
                      const isZeroOrDash = row.varianceCents === 0;
                      const catKey = row.category.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-blue-50/40 transition-colors group"
                        >
                          <td
                            onClick={() => {
                              setSelectedVarianceCategory(row);
                              setIsVarianceModalOpen(true);
                            }}
                            className="py-2.5 px-3 font-medium text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {row.category}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                            <ClickableAmount
                              amountCents={row.originalAmountCents}
                              onClick={() =>
                                handleOpenAmountMap(catKey, `${row.category} (PDF Baseline)`, row.originalAmountCents)
                              }
                              className="text-slate-600 font-medium"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                            {row.currentForecastCents > 0 ? (
                              <ClickableAmount
                                amountCents={row.currentForecastCents}
                                onClick={() =>
                                  handleOpenAmountMap(catKey, `${row.category} (Actual Spend)`, row.currentForecastCents)
                                }
                                className="text-slate-900 font-bold"
                              />
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-rose-600">
                            {isZeroOrDash ? (
                              row.category.includes("Contingency") ? "—" : "$0"
                            ) : (
                              <ClickableAmount
                                amountCents={row.varianceCents}
                                prefix="+"
                                onClick={() => {
                                  setSelectedVarianceCategory(row);
                                  setIsVarianceModalOpen(true);
                                }}
                                className="text-rose-600 font-semibold"
                              />
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-rose-600">
                            {row.category.includes("Contingency")
                              ? "—"
                              : row.pctChange > 0
                              ? `+${row.pctChange}%`
                              : "0%"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 font-bold text-slate-900 bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold">Construction Total</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <ClickableAmount
                          amountCents={101922000}
                          onClick={() => handleOpenAmountMap("pdf_construction_budget")}
                          className="font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <ClickableAmount
                          amountCents={130693473}
                          onClick={() => handleOpenAmountMap("workbook_total_costs")}
                          className="font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-rose-600">
                        <ClickableAmount
                          amountCents={28771473}
                          prefix="+"
                          onClick={() => handleOpenAmountMap("scope_difference")}
                          className="font-bold text-rose-600"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-rose-600">
                        +28%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Right: Actual Project Costs (Workbook) Donut Chart (5 Cols) */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">
                  Project Cost Breakdown
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/projects/${currentProjectId}/reconciliation`)}
                  className="text-xs h-7 px-2.5 text-slate-600 hover:text-slate-900 border-slate-200 rounded-lg"
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
                        data={workbookCostDonutData.filter((d) => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {workbookCostDonutData
                          .filter((d) => d.value > 0)
                          .map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white/95 backdrop-blur-xs px-3 py-2 shadow-lg text-xs pointer-events-none min-w-[160px]">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="h-2.5 w-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: data.color }}
                                />
                                <span className="font-semibold text-slate-900 truncate">
                                  {data.name}
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between gap-3 pt-0.5 border-t border-slate-100 text-[11px]">
                                <span className="text-slate-500 font-medium">Share of Total</span>
                                <span className="font-bold text-slate-700 font-mono">{data.pct}%</span>
                              </div>
                              <div className="flex items-baseline justify-between gap-3 text-[11px]">
                                <span className="text-slate-500 font-medium">Cost</span>
                                <span className="font-bold text-blue-700 font-mono tabular-nums">
                                  {formatMoney(Math.round(data.value * 100))}
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-bold text-slate-900 tabular-nums">
                      $1.31M
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Total Costs
                    </span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 w-full space-y-1.5 text-xs">
                  {workbookCostDonutData.map((item, idx) => (
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
                        <span className={item.value < 0 ? "text-rose-600" : ""}>
                          {item.value < 0 ? `-${formatMoney(Math.round(Math.abs(item.value) * 100))}` : formatMoney(Math.round(item.value * 100))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Budget vs Actual Spend & Funding and Cash Exposure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Budget vs Actual Spend (Construction Only) */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Construction Budget vs Spend
                </h3>
              </div>

              {/* 4 Key Figures */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Approved Budget
                  </p>
                  <div className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    <ClickableAmount
                      amountCents={101922000}
                      onClick={() => handleOpenAmountMap("pdf_construction_budget")}
                      className="text-sm sm:text-base font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Actual Spend
                  </p>
                  <div className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    <ClickableAmount
                      amountCents={130693473}
                      onClick={() => handleOpenAmountMap("workbook_total_costs")}
                      className="text-sm sm:text-base font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Committed
                  </p>
                  <div className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    <ClickableAmount
                      amountCents={12500000}
                      onClick={() => handleOpenAmountMap("committed_unpaid")}
                      className="text-sm sm:text-base font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Remaining
                  </p>
                  <p className="text-sm sm:text-base font-bold text-rose-600 tabular-nums mt-0.5">
                    $0
                  </p>
                  <span className="text-[10px] text-rose-600 font-semibold block">
                    Over by{" "}
                    <ClickableAmount
                      amountCents={28771473}
                      onClick={() => handleOpenAmountMap("scope_difference")}
                      className="text-[10px] font-semibold text-rose-600 p-0"
                    />
                  </span>
                </div>
              </div>

              {/* Stacked Multi-Segment Progress Bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-blue-600 transition-all duration-500"
                  style={{ width: "91%" }}
                  title="Spent: 99%"
                />
                <div
                  className="bg-amber-400 transition-all duration-500"
                  style={{ width: "9%" }}
                  title="Committed: 9%"
                />
              </div>

              {/* Legend Row */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span className="text-slate-500">Spent:</span>
                  <ClickableAmount
                    amountCents={130693473}
                    onClick={() => handleOpenAmountMap("workbook_total_costs")}
                    className="font-semibold text-slate-900"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-slate-500">Committed:</span>
                  <ClickableAmount
                    amountCents={12500000}
                    onClick={() => handleOpenAmountMap("committed_unpaid")}
                    className="font-semibold text-slate-900"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="text-slate-500">Remaining:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">$0</span>
                </div>
              </div>
            </div>

            {/* Right: Capital Stack & Project Funding */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0">
                    <Landmark className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Capital Stack & Funding
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    +{formatMoney(solvencyBufferCents)} Cushion
                  </span>
                </div>
              </div>

              {/* 4 Key Figures */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Total Capital Stack
                  </p>
                  <div className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    <ClickableAmount
                      amountCents={totalCapitalStackCents}
                      onClick={() => handleOpenAmountMap("capital_stack_total")}
                      className="text-sm sm:text-base font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Total Costs Incurred
                  </p>
                  <div className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    <ClickableAmount
                      amountCents={totalWorkbookCostsCents}
                      onClick={() => handleOpenAmountMap("workbook_total_costs")}
                      className="text-sm sm:text-base font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Bank Loan Disbursed
                  </p>
                  <div className="text-sm sm:text-base font-bold text-teal-700 tabular-nums mt-0.5">
                    <ClickableAmount
                      amountCents={loanDisbursedCents}
                      onClick={() => handleOpenAmountMap("bank_loan_facility")}
                      className="text-sm sm:text-base font-bold text-teal-700"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Available Cushion
                  </p>
                  <div className="text-sm sm:text-base font-bold text-emerald-700 tabular-nums mt-0.5">
                    <ClickableAmount
                      amountCents={solvencyBufferCents}
                      prefix="+"
                      onClick={() => handleOpenAmountMap("capital_stack_total")}
                      className="text-sm sm:text-base font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Stacked Multi-Segment Progress Bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-blue-800 transition-all duration-500"
                  style={{ width: "42.1%" }}
                  title="Partner Equity: $600,000 (42.1%)"
                />
                <div
                  className="bg-teal-500 transition-all duration-500"
                  style={{ width: "14.2%" }}
                  title="Bank Loan Disbursed: $202,200 (14.2%)"
                />
                <div
                  className="bg-indigo-300 transition-all duration-500"
                  style={{ width: "43.7%" }}
                  title="Available Bank Loan to Draw: $622,250 (43.7%)"
                />
              </div>

              {/* Two Detailed Structured Sub-Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Sub-Card 1: Partner Equity Contributions */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      Partner Equity
                    </span>
                    <ClickableAmount
                      amountCents={investorFundingRecordedCents}
                      onClick={() => handleOpenAmountMap("investor_funding_recorded")}
                      className="text-xs font-bold text-blue-700"
                    />
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Partner 1 (25%)</span>
                      <ClickableAmount
                        amountCents={20000000}
                        onClick={() => handleOpenAmountMap("investor_funding_recorded")}
                        className="font-medium text-slate-800 text-[11px]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Partner 2 (25%)</span>
                      <ClickableAmount
                        amountCents={20000000}
                        onClick={() => handleOpenAmountMap("investor_funding_recorded")}
                        className="font-medium text-slate-800 text-[11px]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Partner 3 (25%)</span>
                      <ClickableAmount
                        amountCents={20000000}
                        onClick={() => handleOpenAmountMap("investor_funding_recorded")}
                        className="font-medium text-slate-800 text-[11px]"
                      />
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      3/3 Wires Reconciled
                    </span>
                    <button
                      onClick={() => handleOpenAmountMap("investor_funding_recorded")}
                      className="text-blue-600 hover:underline cursor-pointer font-medium"
                    >
                      View wires →
                    </button>
                  </div>
                </div>

                {/* Sub-Card 2: Senior Construction Loan Facility */}
                <div className="rounded-lg border border-teal-200/80 bg-teal-50/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Landmark className="h-3.5 w-3.5 text-teal-600" />
                      Bank Senior Loan
                    </span>
                    <ClickableAmount
                      amountCents={loanFacilityTotalCents}
                      onClick={() => handleOpenAmountMap("bank_loan_facility")}
                      className="text-xs font-bold text-teal-800"
                    />
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Disbursed to Date</span>
                      <ClickableAmount
                        amountCents={loanDisbursedCents}
                        onClick={() => handleOpenAmountMap("bank_loan_facility")}
                        className="font-semibold text-teal-700 text-[11px]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Available to Draw</span>
                      <ClickableAmount
                        amountCents={loanRemainingCents}
                        onClick={() => handleOpenAmountMap("bank_loan_facility")}
                        className="font-medium text-slate-800 text-[11px]"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-teal-800 font-medium pt-0.5">
                      <span>Active Cadence</span>
                      <span className="bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold">
                        Draw #3 Active (94% Spent)
                      </span>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-teal-200/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="text-slate-500">First National Bank</span>
                    <button
                      onClick={() => router.push(`/projects/${currentProjectId}/draws`)}
                      className="text-teal-700 hover:underline cursor-pointer font-semibold flex items-center gap-0.5"
                    >
                      <span>Manage Draws</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: BUDGET BREAKDOWN                                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "breakdown" && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Construction Budget Summary */}
            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Approved Baseline Budget
              </h3>
              <div className="pt-2 border-b border-slate-100 pb-3 flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Total</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  $1,019,220
                </span>
              </div>

              {/* 6 High-level Categories */}
              <div className="divide-y divide-slate-100 text-xs">
                {budgetBreakdownCategories.map((cat, idx) => {
                  const catKey = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
                  return (
                    <div key={cat.id} className="py-2.5 flex items-center justify-between group hover:bg-slate-50/80 px-1 rounded transition-colors">
                      <button
                        onClick={() => handleOpenAmountMap(catKey, cat.name, cat.pdfAmountCents)}
                        className="text-slate-700 font-medium hover:text-blue-600 cursor-pointer text-left"
                      >
                        {idx + 1}. {cat.name}
                      </button>
                      <div className="flex items-center gap-2">
                        <ClickableAmount
                          amountCents={cat.pdfAmountCents}
                          onClick={() => handleOpenAmountMap(catKey, cat.name, cat.pdfAmountCents)}
                          className="font-semibold text-slate-900"
                        />
                        <span className="text-[11px] text-slate-400 font-medium w-9 text-right">
                          {cat.pctOfTotal}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Card: Budget vs Actual by Category */}
            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Budget vs Actual by Category
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/projects/${currentProjectId}/documents`)}
                  className="text-xs h-7 px-2.5 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
                >
                  View Source PDF
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                      <th className="text-left py-2 px-3 font-semibold">Category</th>
                      <th className="text-right py-2 px-3 font-semibold">Approved Budget</th>
                      <th className="text-right py-2 px-3 font-semibold">Actual Spend</th>
                      <th className="text-right py-2 px-3 font-semibold">Committed</th>
                      <th className="text-right py-2 px-3 font-semibold">Remaining</th>
                      <th className="text-right py-2 px-3 font-semibold">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {budgetBreakdownCategories.map((row, idx) => {
                      const isFavorable = row.varianceCents < 0;
                      const isZero = row.varianceCents === 0;
                      const catKey = row.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td
                            onClick={() => handleOpenAmountMap(catKey, row.name, row.pdfAmountCents)}
                            className="py-2.5 px-3 font-medium text-slate-800 hover:text-blue-600 cursor-pointer"
                          >
                            {idx + 1}. {row.name}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                            <ClickableAmount
                              amountCents={row.pdfAmountCents}
                              onClick={() => handleOpenAmountMap(catKey, `${row.name} (Budget)`, row.pdfAmountCents)}
                              className="text-slate-600 font-medium"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                            <ClickableAmount
                              amountCents={row.actualSpeedCents}
                              onClick={() => handleOpenAmountMap(catKey, `${row.name} (Actual Spend)`, row.actualSpeedCents)}
                              className="text-slate-900 font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                            <ClickableAmount
                              amountCents={row.committedCents}
                              onClick={() => handleOpenAmountMap("committed_unpaid")}
                              className="text-slate-600 font-medium"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                            {formatMoney(row.remainingCents)}
                          </td>
                          <td
                            className={cn(
                              "py-2.5 px-3 text-right tabular-nums font-semibold",
                              isZero ? "text-slate-500" : isFavorable ? "text-emerald-600" : "text-rose-600"
                            )}
                          >
                            {isZero ? (
                              "$0"
                            ) : (
                              <ClickableAmount
                                amountCents={row.varianceCents}
                                prefix={isFavorable ? "-" : "+"}
                                onClick={() => handleOpenAmountMap(catKey, `${row.name} Variance`, row.varianceCents)}
                                className={cn(
                                  "font-semibold",
                                  isFavorable ? "text-emerald-600" : "text-rose-600"
                                )}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 font-bold text-slate-900 bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold">Construction Total</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <ClickableAmount
                          amountCents={101922000}
                          onClick={() => handleOpenAmountMap("pdf_construction_budget")}
                          className="font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <ClickableAmount
                          amountCents={130693473}
                          onClick={() => handleOpenAmountMap("workbook_total_costs")}
                          className="font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <ClickableAmount
                          amountCents={12500000}
                          onClick={() => handleOpenAmountMap("committed_unpaid")}
                          className="font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        $0
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-rose-600">
                        <ClickableAmount
                          amountCents={28771473}
                          prefix="+"
                          onClick={() => handleOpenAmountMap("scope_difference")}
                          className="font-bold text-rose-600"
                        />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom Card: Line Item Detail (Example: Interior) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Detailed Trade Line Items - Interior
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/projects/${currentProjectId}/documents`)}
                className="text-xs h-7 px-2.5 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
              >
                View All Line Items
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="text-left py-2 px-3 font-semibold">Code</th>
                    <th className="text-left py-2 px-3 font-semibold">Description</th>
                    <th className="text-right py-2 px-3 font-semibold">Budget Amount</th>
                    <th className="text-right py-2 px-3 font-semibold">Actual Spend</th>
                    <th className="text-right py-2 px-3 font-semibold">Committed</th>
                    <th className="text-right py-2 px-3 font-semibold">Remaining</th>
                    <th className="text-right py-2 px-3 font-semibold">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {interiorLineItemDetails.map((item) => {
                    const isFavorable = item.varianceCents < 0;
                    const itemKey = item.description.toLowerCase().replace(/[^a-z0-9]/g, "_");
                    return (
                      <tr key={item.code} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                          {item.code}
                        </td>
                        <td
                          onClick={() => handleOpenAmountMap(itemKey, `${item.code} ${item.description}`, item.budgetAmountCents)}
                          className="py-2.5 px-3 font-medium text-slate-800 hover:text-blue-600 cursor-pointer"
                        >
                          {item.description}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                          <ClickableAmount
                            amountCents={item.budgetAmountCents}
                            onClick={() => handleOpenAmountMap(itemKey, `${item.code} ${item.description} (Budget)`, item.budgetAmountCents)}
                            className="text-slate-600 font-medium"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                          <ClickableAmount
                            amountCents={item.actualSpendCents}
                            onClick={() => handleOpenAmountMap(itemKey, `${item.code} ${item.description} (Actual Spend)`, item.actualSpendCents)}
                            className="text-slate-900 font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                          <ClickableAmount
                            amountCents={item.committedCents}
                            onClick={() => handleOpenAmountMap("committed_unpaid")}
                            className="text-slate-600 font-medium"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                          {formatMoney(item.remainingCents)}
                        </td>
                        <td
                          className={cn(
                            "py-2.5 px-3 text-right tabular-nums font-semibold",
                            isFavorable ? "text-emerald-600" : "text-rose-600"
                          )}
                        >
                          <ClickableAmount
                            amountCents={item.varianceCents}
                            prefix={isFavorable ? "-" : "+"}
                            onClick={() => handleOpenAmountMap(itemKey, `${item.code} ${item.description} Variance`, item.varianceCents)}
                            className={cn(
                              "font-semibold",
                              isFavorable ? "text-emerald-600" : "text-rose-600"
                            )}
                          />
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
      {/* TAB 3: FORECAST & RETURNS                                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "forecast" && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 min-w-0">
          {/* Top 3 Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Card 1: Project Return Summary (4 Cols) */}
            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Project Return Summary
                </h3>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Expected Sale Revenue</span>
                    <ClickableAmount
                      amountCents={250000000}
                      onClick={() => handleOpenAmountMap("capital_stack_total", "Expected Sale Revenue", 250000000)}
                      className="font-bold text-slate-900"
                    />
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Total Project Cost (Forecast)</span>
                    <ClickableAmount
                      amountCents={totalWorkbookCostsCents}
                      onClick={() => handleOpenAmountMap("workbook_total_costs")}
                      className="font-bold text-slate-900"
                    />
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Projected Profit</span>
                    <span className="text-slate-400 font-mono">—</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Projected Profit Margin</span>
                    <span className="text-slate-400 font-mono">—</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Projected ROI</span>
                    <span className="text-slate-400 font-mono">—</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Projected IRR</span>
                    <span className="text-slate-400 font-mono">—</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                Requires verified sales price, closing costs, and funding assumptions.
              </p>
            </div>

            {/* Card 2: Key Assumptions (4 Cols) */}
            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Key Assumptions
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditAssumptionsOpen(true)}
                    className="text-xs h-7 px-2.5 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
                  >
                    Edit Assumptions
                  </Button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Forecast Completion Date</span>
                    <span className="text-slate-400 font-mono">—</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Estimated Sale Price</span>
                    <span className="text-slate-400 font-mono">—</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Selling Costs (% or amount)</span>
                    <span className="text-slate-400 font-mono">—</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Loan Payoff (if any)</span>
                    <span className="text-slate-400 font-mono">—</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Carrying Costs (monthly)</span>
                    <span className="text-slate-400 font-mono">—</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Exit Timing</span>
                    <span className="text-slate-400 font-mono">—</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Return Components (Illustrative Bar Chart) (4 Cols) */}
            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Return Components (Illustrative)
                </h3>

                <div className="h-44 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={illustrativeReturnChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 14 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        axisLine={false}
                        tickLine={false}
                        tick={(props: { x?: number; y?: number; payload?: { value?: string } }) => {
                          const { x = 0, y = 0, payload } = props;
                          const words = String(payload?.value || "").split(" ");
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <text x={0} y={0} dy={10} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight={500}>
                                {words.map((w: string, i: number) => (
                                  <tspan x={0} dy={i === 0 ? 0 : 11} key={i}>
                                    {w}
                                  </tspan>
                                ))}
                              </text>
                            </g>
                          );
                        }}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: "#94a3b8" }}
                        tickFormatter={(val) => `$${val}M`}
                        domain={[0, 3]}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(val: number) => [`$${val.toFixed(2)}M`, "Amount"]}
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "11px",
                          border: "none",
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {illustrativeReturnChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={entry.isDotted ? "#6366f1" : undefined}
                            strokeDasharray={entry.isDotted ? "3 3" : undefined}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 2 Cards Grid: Funding Impact on Returns & Scenario Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Funding Impact on Returns (5 Cols) */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Funding Impact on Returns
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAmountMap("capital_stack_total")}
                  className="h-7 text-xs px-2 text-slate-700 hover:bg-slate-50 border-slate-200 rounded-lg flex items-center gap-1"
                >
                  <Coins className="h-3 w-3 text-indigo-600" />
                  <span>Capital Stack</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                      <th className="text-left py-2 px-3 font-semibold">Source</th>
                      <th className="text-right py-2 px-3 font-semibold">Amount</th>
                      <th className="text-right py-2 px-3 font-semibold">% of Total</th>
                      <th className="text-center py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fundingImpactOnReturns.map((f, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors group">
                        <td
                          onClick={() => handleOpenAmountMap(f.mapKey, f.partner, f.amountCents)}
                          className="py-2.5 px-3 font-medium text-slate-800 hover:text-blue-600 cursor-pointer"
                        >
                          {f.partner}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 font-semibold">
                          <ClickableAmount
                            amountCents={f.amountCents}
                            onClick={() => handleOpenAmountMap(f.mapKey, f.partner, f.amountCents)}
                            className="font-semibold text-slate-800"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                          {f.pct}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                              f.statusColor
                            )}
                          >
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 font-bold text-slate-900 bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold">Total Capital Stack</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <ClickableAmount
                          amountCents={totalCapitalStackCents}
                          onClick={() => handleOpenAmountMap("capital_stack_total")}
                          className="font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">100%</td>
                      <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold text-[11px]">
                        Fully Funded
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Right: Scenario Analysis (7 Cols) */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Scenario Analysis
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                        <th className="text-left py-2 px-3 font-semibold">Scenario</th>
                        <th className="text-right py-2 px-3 font-semibold">Sale Price</th>
                        <th className="text-right py-2 px-3 font-semibold">Total Cost</th>
                        <th className="text-right py-2 px-3 font-semibold">Projected Profit</th>
                        <th className="text-right py-2 px-3 font-semibold">ROI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: "Base Case" },
                        { name: "Downside (-10%)" },
                        { name: "Upside (+10%)" },
                      ].map((sc, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {sc.name}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono">—</td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono">—</td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono">—</td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                Scenario analysis requires completed financial inputs and assumptions.
              </p>
            </div>
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
        currentGdvCents={250000000}
        currentIrrPct={0}
        userRole={userRole}
        open={isEditAssumptionsOpen}
        onOpenChange={setIsEditAssumptionsOpen}
      />

      {/* 3. Amount Detail Map Modal */}
      <AmountMapModal
        open={isAmountMapOpen}
        onOpenChange={setIsAmountMapOpen}
        detail={selectedAmountMap}
      />
    </div>
  );
}
