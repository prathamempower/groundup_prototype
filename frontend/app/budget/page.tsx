"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BudgetLine, ChangeOrder, MilestoneItem } from "@/lib/types";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ChangeOrderModal } from "@/components/budget/change-order-modal";
import { ChangeOrderReviewModal } from "@/components/budget/change-order-review-modal";
import { MoveContingencyModal } from "@/components/budget/move-contingency-modal";
import { LinkMilestoneModal } from "@/components/budget/link-milestone-modal";
import { BudgetDivisionChart, DivisionChartItem } from "@/components/budget/budget-division-chart";
import { ContingencyBreakdownCard } from "@/components/budget/contingency-breakdown-card";

interface SOVItem {
  id: string;
  code: string;
  name: string;
  originalAmountCents: number;
  approvedCoCents: number;
  hasPositiveCO?: boolean;
  revisedAmountCents: number;
  actualSpentCents: number;
  progressPct: number;
  status: "On Track" | "Pending CO" | "Overrun" | "Complete";
}

// Master SOV Lines matching the exact budget specification
const MASTER_SOV_LINES: SOVItem[] = [
  {
    id: "01-100",
    code: "01-100",
    name: "General Conditions & Requirements",
    originalAmountCents: 8500000, // $85,000.00
    approvedCoCents: 0,
    hasPositiveCO: false,
    revisedAmountCents: 8500000,
    actualSpentCents: 4500000, // $45,000.00
    progressPct: 52.9,
    status: "On Track",
  },
  {
    id: "02-200",
    code: "02-200",
    name: "Site Work & Excavation",
    originalAmountCents: 14200000, // $142,000.00
    approvedCoCents: 0,
    hasPositiveCO: true, // +$0.00 in green highlight
    revisedAmountCents: 14200000,
    actualSpentCents: 11000000, // $110,000.00
    progressPct: 77.4,
    status: "On Track",
  },
  {
    id: "03-300",
    code: "03-300",
    name: "Concrete & Foundation Structure",
    originalAmountCents: 31000000, // $310,000.00
    approvedCoCents: 0,
    hasPositiveCO: false,
    revisedAmountCents: 31000000,
    actualSpentCents: 18545000, // $185,450.00
    progressPct: 59.8,
    status: "On Track",
  },
  {
    id: "06-100",
    code: "06-100",
    name: "Rough Carpentry & Framing",
    originalAmountCents: 22000000, // $220,000.00
    approvedCoCents: 0,
    hasPositiveCO: false,
    revisedAmountCents: 22000000,
    actualSpentCents: 8000000, // $80,000.00
    progressPct: 36.3,
    status: "Pending CO",
  },
  {
    id: "15-100",
    code: "15-100",
    name: "Plumbing & HVAC Systems",
    originalAmountCents: 17500000, // $175,000.00
    approvedCoCents: 0,
    hasPositiveCO: false,
    revisedAmountCents: 17500000,
    actualSpentCents: 0,
    progressPct: 0.0,
    status: "On Track",
  },
  {
    id: "16-100",
    code: "16-100",
    name: "Electrical & Systems",
    originalAmountCents: 8722000, // $87,220.00
    approvedCoCents: 0,
    hasPositiveCO: false,
    revisedAmountCents: 8722000,
    actualSpentCents: 0,
    progressPct: 0.0,
    status: "On Track",
  },
];

export default function BudgetPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchFilter, setSearchFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modal states
  const [isChangeOrderOpen, setIsChangeOrderOpen] = useState(false);
  const [isMoveContingencyOpen, setIsMoveContingencyOpen] = useState(false);
  const [reviewingChangeOrder, setReviewingChangeOrder] = useState<ChangeOrder | null>(null);

  // Load Projects
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const routeProjectId =
    typeof window !== "undefined"
      ? window.location.pathname.match(/^\/projects\/([^\/]+)/)?.[1] || ""
      : "";
  const currentProjectId =
    routeProjectId && routeProjectId !== "new"
      ? routeProjectId
      : projectsData?.data?.current_project_id || "";
  const currentProject = (projectsData?.data?.projects || []).find((p) => p.id === currentProjectId);

  // Load Change Orders from API
  const { data: changeOrdersData } = useQuery({
    queryKey: ["change-orders", currentProjectId],
    queryFn: () => api.budget.getChangeOrders(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const changeOrders = changeOrdersData?.data || [];
  const pendingCO =
    changeOrders.find((c) => c.status === "SUBMITTED" || c.status === "DRAFT") ||
    ({
      id: "co-pending-02",
      project_id: currentProjectId,
      change_order_number: "CO-002",
      title: "Rough Carpentry & Framing Additional Shear Wall Bracing",
      scope_description: "Mandated shear transfer connection details and moment clips per SE inspection memo",
      requested_amount: "1850000",
      status: "SUBMITTED",
      target_budget_line_id: "06-100",
      funding_source: "CONTINGENCY",
      requested_by: "Frank Miller (General Contractor)",
      requested_at: new Date().toISOString(),
    } as ChangeOrder);

  // Master Totals
  const totalOriginalCents = 101922000; // $1,019,220.00
  const totalActualSpentCents = 42045000; // $420,450.00
  const totalRemainingCents = 59877000; // $598,770.00
  const contingencyAvailableCents = 8247000; // $82,470.00
  const hardCostContingencyCents = 5000000; // $50,000.00
  const softCostContingencyCents = 3247000; // $32,470.00

  // Chart items for Recharts
  const chartItems: DivisionChartItem[] = [
    {
      code: "01-100",
      shortName: "Gen Conditions",
      fullName: "General Conditions & Requirements",
      originalBudgetCents: 8500000,
      actualSpentCents: 4500000,
    },
    {
      code: "02-200",
      shortName: "Site Work",
      fullName: "Site Work & Excavation",
      originalBudgetCents: 14200000,
      actualSpentCents: 11000000,
    },
    {
      code: "03-300",
      shortName: "Concrete",
      fullName: "Concrete & Foundation Structure",
      originalBudgetCents: 31000000,
      actualSpentCents: 18545000,
    },
    {
      code: "06-100",
      shortName: "Framing",
      fullName: "Rough Carpentry & Framing",
      originalBudgetCents: 22000000,
      actualSpentCents: 8000000,
    },
    {
      code: "15-100",
      shortName: "Plumbing/HVAC",
      fullName: "Plumbing & HVAC Systems",
      originalBudgetCents: 17500000,
      actualSpentCents: 0,
    },
    {
      code: "16-100",
      shortName: "Electrical",
      fullName: "Electrical & Systems",
      originalBudgetCents: 8722000,
      actualSpentCents: 0,
    },
  ];

  // Filtered SOV Lines
  const displayedLines = useMemo(() => {
    if (!searchFilter.trim()) return MASTER_SOV_LINES;
    const q = searchFilter.toLowerCase();
    return MASTER_SOV_LINES.filter(
      (l) => l.code.toLowerCase().includes(q) || l.name.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      "CODE / ITEM",
      "DIVISION NAME",
      "ORIGINAL BUDGET",
      "APPROVED COS",
      "REVISED BUDGET",
      "ACTUAL SPENT",
      "PROGRESS",
      "STATUS",
    ];

    const rows = MASTER_SOV_LINES.map((l) => [
      `"${l.code}"`,
      `"${l.name}"`,
      `"$${(l.originalAmountCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}"`,
      `"$0.00"`,
      `"$${(l.revisedAmountCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}"`,
      `"$${(l.actualSpentCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}"`,
      `"${l.progressPct}%"`,
      `"${l.status}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Schedule_of_Values_SOV_161_Woodlawn.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Export Complete",
      description: "Schedule of Values has been downloaded.",
      variant: "success",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Budget & Change Control
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Approved Baseline (Locked)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Master contract Schedule of Values (SOV), approved change orders, and contingency balances.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Accept GC Change Order Action Trigger */}
            <button
              type="button"
              onClick={() => setReviewingChangeOrder(pendingCO)}
              className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 px-4 py-2 text-left transition-all hover:border-amber-400 shadow-xs group"
            >
              <div className="rounded-lg bg-amber-200/70 p-2 text-amber-800 group-hover:scale-105 transition-transform">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Review GC Change Order
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-2 py-0.2 text-[10px] font-bold text-amber-900 border border-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                    1 Pending
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  CO-002: Framing Shear Bracing (+$18,500.00) →
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 3 Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: ORIGINAL BUDGET */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Original Contract Budget
              </span>
              <div className="rounded-md bg-slate-50 p-1.5 border border-slate-100" title="Fixed contract baseline">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="my-2.5">
              <div className="font-mono text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatMoney(String(totalOriginalCents), { showCents: false })}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200/60">
                6 Divisions
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Fixed Contract Baseline</span>
            </div>
          </div>

          {/* Card 2: ACTUAL EXPENSES */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Actual Spend to Date
              </span>
              <div className="rounded-md bg-blue-50 p-1.5 border border-blue-100/60">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
            </div>

            <div className="my-2.5">
              <div className="font-mono text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatMoney(String(totalActualSpentCents), { showCents: false })}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: "41.2%" }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-600">
                  41.2% Drawn
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {formatMoney(String(totalRemainingCents), { showCents: false })} Unbilled
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: REMAINING CONTINGENCY */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Available Contingency Reserve
                </span>
                <Info className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="rounded-md bg-emerald-50 p-1.5 border border-emerald-100/60">
                <Clock className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            <div className="my-2.5 flex items-center justify-between">
              <div className="font-mono text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatMoney(String(contingencyAvailableCents), { showCents: false })}
              </div>
              <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-emerald-500 bg-emerald-50 shrink-0" title="100% of contingency funds are uncommitted">
                <span className="text-[11px] font-bold text-emerald-700">100%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Hard: $50,000 · Soft: $32,470</span>
              <span className="text-emerald-700 font-medium">100% Intact</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Chart (65%) & Contingency Breakdown (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <BudgetDivisionChart data={chartItems} divisionCount={6} />
          </div>
          <div className="lg:col-span-4">
            <ContingencyBreakdownCard
              hardCostCents={hardCostContingencyCents}
              softCostCents={softCostContingencyCents}
            />
          </div>
        </div>

        {/* Schedule of Values (SOV) Table Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Schedule of Values (SOV)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                CSI division cost line items, approved change order adjustments, and current completion rates
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors shadow-2xs",
                  isFilterOpen
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                Filter
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Expandable Filter Toolbar */}
          {isFilterOpen && (
            <div className="p-3 bg-slate-50/70 border-b border-slate-200/80 flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code or division..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                  <th className="py-3.5 px-5">Code / Item</th>
                  <th className="py-3.5 px-5">Division Name</th>
                  <th className="py-3.5 px-5 text-right">Original Budget</th>
                  <th className="py-3.5 px-5 text-right">Approved COs</th>
                  <th className="py-3.5 px-5 text-right">Revised Budget</th>
                  <th className="py-3.5 px-5 text-right">Actual Spent</th>
                  <th className="py-3.5 px-5 text-right pr-6">Progress</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedLines.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Code / Item */}
                    <td className="py-4 px-5 font-mono font-semibold text-indigo-600 text-xs">
                      {row.code}
                    </td>

                    {/* Division Name */}
                    <td className="py-4 px-5 font-semibold text-slate-800 text-xs">
                      {row.name}
                    </td>

                    {/* Original Budget */}
                    <td className="py-4 px-5 text-right font-mono tabular-nums text-slate-700 text-xs">
                      {formatMoney(String(row.originalAmountCents))}
                    </td>

                    {/* Approved COs */}
                    <td className="py-4 px-5 text-right font-mono tabular-nums text-xs">
                      {row.hasPositiveCO ? (
                        <span className="font-semibold text-emerald-600">
                          +$0.00
                        </span>
                      ) : (
                        <span className="text-slate-400">$0.00</span>
                      )}
                    </td>

                    {/* Revised Budget */}
                    <td className="py-4 px-5 text-right font-mono tabular-nums font-bold text-slate-900 text-xs">
                      {formatMoney(String(row.revisedAmountCents))}
                    </td>

                    {/* Actual Spent */}
                    <td className="py-4 px-5 text-right font-mono tabular-nums text-slate-800 text-xs">
                      {formatMoney(String(row.actualSpentCents))}
                    </td>

                    {/* Progress */}
                    <td className="py-4 px-5 text-right pr-6">
                      <div className="flex items-center gap-2.5 justify-end">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${Math.min(100, row.progressPct)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs tabular-nums text-slate-600 w-11 text-right">
                          {row.progressPct.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 text-center">
                      {row.status === "Pending CO" ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/80">
                          Pending CO
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/80">
                          On Track
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <ChangeOrderModal
        projectId={currentProjectId}
        budgetLines={MASTER_SOV_LINES.map((l) => ({
          id: l.id,
          budget_id: "b_active",
          code: l.code,
          name: l.name,
          category: "CONSTRUCTION",
          original_amount: String(l.originalAmountCents),
          current_approved_amount: String(l.revisedAmountCents),
          actual_spend: String(l.actualSpentCents),
          committed_amount: String(l.actualSpentCents),
          is_draw_eligible: true,
          sort_order: 1,
        }))}
        open={isChangeOrderOpen}
        onOpenChange={setIsChangeOrderOpen}
      />

      <ChangeOrderReviewModal
        changeOrder={reviewingChangeOrder}
        budgetLines={MASTER_SOV_LINES.map((l) => ({
          id: l.id,
          budget_id: "b_active",
          code: l.code,
          name: l.name,
          category: "CONSTRUCTION",
          original_amount: String(l.originalAmountCents),
          current_approved_amount: String(l.revisedAmountCents),
          actual_spend: String(l.actualSpentCents),
          committed_amount: String(l.actualSpentCents),
          is_draw_eligible: true,
          sort_order: 1,
        }))}
        open={!!reviewingChangeOrder}
        onOpenChange={(open) => {
          if (!open) setReviewingChangeOrder(null);
        }}
      />
    </div>
  );
}
