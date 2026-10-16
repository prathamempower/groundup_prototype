"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project, ProjectEconomics, UserRole } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import {
  Download,
  BarChart3,
  Check,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface ProjectFinancialComparisonProps {
  projects: Project[];
  globalRole: UserRole;
  onOpenWorkspace: (project: Project) => void;
}

type MatrixTab = "OVERVIEW" | "LOANS" | "HEALTH";

const toNum = (val?: string | number | null): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const parsed = Number(val);
  return isNaN(parsed) ? 0 : parsed;
};

const isProjectCompleted = (p: Project): boolean => {
  return (
    p.status === "COMPLETED" ||
    p.lifecycle_stage === "COMPLETE" ||
    p.lifecycle_stage === "COMPLETION" ||
    p.lifecycle_stage === "CLOSED" ||
    p.lifecycle_stage === "DISPOSITION" ||
    (p.progress_pct !== undefined && p.progress_pct >= 100)
  );
};

const getProjectThumbnail = (proj: Project) => {
  const nameLower = (proj.name || "").toLowerCase();
  const addressLower = (proj.address || "").toLowerCase();

  if (nameLower.includes("woodlawn") || addressLower.includes("woodlawn")) {
    return "/projects/woodlawn-new.jpg";
  }
  if (nameLower.includes("first") || addressLower.includes("first")) {
    return "/projects/first-street-new.jpg";
  }
  if (nameLower.includes("broadway") || addressLower.includes("broadway")) {
    return "/projects/broadway-new.jpg";
  }
  if (nameLower.includes("gable") || addressLower.includes("gable")) {
    return "/projects/gable-residence.jpg";
  }
  return "/projects/woodlawn-new.jpg";
};

const getHealthBadge = (health?: string) => {
  switch (health) {
    case "HEALTHY":
      return {
        label: "On Track",
        dotColor: "bg-emerald-500",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    case "AT_RISK":
      return {
        label: "At Risk",
        dotColor: "bg-amber-500",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "CRITICAL":
    default:
      return {
        label: "Critical",
        dotColor: "bg-rose-500",
        badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
      };
  }
};

const getStageLabel = (stage?: string) => {
  if (!stage) return "Planning";
  const s = stage.toLowerCase();
  if (s.includes("conception") || s.includes("design") || s.includes("planning")) return "Design & Planning";
  if (s.includes("pre_con") || s.includes("pre_construction")) return "Pre-Construction";
  if (s.includes("under_con") || s.includes("construction") || s.includes("active")) return "Active Construction";
  if (s.includes("completion") || s.includes("closeout") || s.includes("closed") || s.includes("disposition")) return "Closeout & TCO";
  if (s.includes("acquisition")) return "Acquisition";
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export function ProjectFinancialComparison({
  projects,
  globalRole = "OWNER",
  onOpenWorkspace,
}: ProjectFinancialComparisonProps) {
  // Select all or top 4 projects by default
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    projects.slice(0, 4).map((p) => p.id)
  );

  const [activeTab, setActiveTab] = useState<MatrixTab>("OVERVIEW");
  const [showChart, setShowChart] = useState(true);

  // Fetch economics in parallel for all projects
  const economicsQueries = useQueries({
    queries: projects.map((p) => ({
      queryKey: ["project-economics", p.id],
      queryFn: async () => {
        try {
          const res = await api.economics.getEconomics(p.id);
          return res.data;
        } catch {
          return null;
        }
      },
      staleTime: 60_000,
    })),
  });

  // Map of project economics by project ID
  const economicsMap = useMemo(() => {
    const map = new Map<string, ProjectEconomics | null>();
    projects.forEach((p, idx) => {
      map.set(p.id, economicsQueries[idx]?.data || null);
    });
    return map;
  }, [projects, economicsQueries]);

  // Projects actively in comparison
  const comparedProjects = useMemo(() => {
    return projects.filter((p) => selectedIds.includes(p.id));
  }, [projects, selectedIds]);

  const toggleProject = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((pId) => pId !== id);
      }
      return [...prev, id];
    });
  };

  const selectAll = () => {
    setSelectedIds(projects.map((p) => p.id));
  };

  const resetSelection = () => {
    if (projects.length > 0) {
      setSelectedIds(projects.slice(0, Math.min(3, projects.length)).map((p) => p.id));
    }
  };

  // Compute aggregated comparative metrics for selected projects
  const aggregatedStats = useMemo(() => {
    let totalGDV = 0;
    let totalCost = 0;
    let totalDebtDrawn = 0;
    let totalDebtFacility = 0;

    let realizedProfit = 0;
    let realizedGDV = 0;
    let completedCount = 0;

    comparedProjects.forEach((p) => {
      const econ = economicsMap.get(p.id);
      const gdv = econ?.gross_development_value
        ? toNum(econ.gross_development_value)
        : p.forecast_profit
        ? p.forecast_profit + toNum(p.loan_commitment)
        : 0;
      const cost = econ?.total_cost ? toNum(econ.total_cost) : toNum(p.loan_commitment);
      const debtDrawn = toNum(econ?.senior_debt_drawn);
      const debtFacility = toNum(p.loan_commitment) || toNum(econ?.senior_debt_balance);

      totalGDV += gdv;
      totalCost += cost;
      totalDebtDrawn += debtDrawn;
      totalDebtFacility += debtFacility;

      if (isProjectCompleted(p)) {
        completedCount++;
        const profit = econ?.net_profit ? toNum(econ.net_profit) : p.forecast_profit || 0;
        realizedProfit += profit;
        realizedGDV += gdv;
      }
    });

    const realizedMarginPct = realizedGDV > 0 ? (realizedProfit / realizedGDV) * 100 : 0;
    const portfolioLeveragePct = totalCost > 0 ? (totalDebtDrawn / totalCost) * 100 : 0;

    return {
      totalGDV,
      totalCost,
      totalDebtDrawn,
      totalDebtFacility,
      portfolioLeveragePct,
      realizedProfit,
      realizedMarginPct,
      completedCount,
    };
  }, [comparedProjects, economicsMap]);

  // Data for Chart View: Comparing Revenue, Budget, and Loan Drawn (the true active capital stack metrics)
  const chartData = useMemo(() => {
    return comparedProjects.map((p) => {
      const econ = economicsMap.get(p.id);
      const gdvCents = toNum(econ?.gross_development_value);
      const costCents = toNum(econ?.total_cost);
      const debtDrawnCents = toNum(econ?.senior_debt_drawn);

      return {
        name: p.name.length > 14 ? `${p.name.substring(0, 12)}...` : p.name,
        fullName: p.name,
        revenue: Math.round(gdvCents / 100),
        cost: Math.round(costCents / 100),
        loanDrawn: Math.round(debtDrawnCents / 100),
      };
    });
  }, [comparedProjects, economicsMap]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Project Name",
      "Stage",
      "Revenue",
      "Budget",
      "Loan Drawn",
      "Realized Profit",
      "Margin (%)",
      "Status",
      "Progress (%)",
    ];

    const rows = comparedProjects.map((p) => {
      const econ = economicsMap.get(p.id);
      const gdv = (toNum(econ?.gross_development_value) / 100).toFixed(2);
      const cost = (toNum(econ?.total_cost) / 100).toFixed(2);
      const debtDrawn = (toNum(econ?.senior_debt_drawn) / 100).toFixed(2);
      const isComplete = isProjectCompleted(p);
      const profitVal = isComplete
        ? ((toNum(econ?.net_profit) || p.forecast_profit || 0) / 100).toFixed(2)
        : "In Progress";
      const marginVal = isComplete && gdv && Number(gdv) > 0
        ? `${(((toNum(econ?.net_profit) || p.forecast_profit || 0) / toNum(econ?.gross_development_value)) * 100).toFixed(1)}%`
        : "-";
      const health = p.health_status || "HEALTHY";
      const progress = p.progress_pct ?? 0;

      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.lifecycle_stage}"`,
        gdv,
        cost,
        debtDrawn,
        `"${profitVal}"`,
        `"${marginVal}"`,
        `"${health}"`,
        `"${progress}%"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `GroundUp_Project_Comparison_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 200);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Project Comparison
            </h2>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {comparedProjects.length} of {projects.length} Selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedIds.length < projects.length ? (
              <button
                type="button"
                onClick={selectAll}
                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Select All
              </button>
            ) : (
              <button
                type="button"
                onClick={resetSelection}
                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowChart(!showChart)}
              className="h-8 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
              <span>{showChart ? "Hide Chart" : "Show Chart"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="h-8 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Project Selection Chips */}
        {projects.length > 1 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            {projects.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProject(p.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "border border-slate-900 bg-slate-900 text-white font-medium"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-xs text-[9px] ${
                      isSelected ? "bg-white/20 text-white" : "border border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </span>
                  <span className="truncate max-w-[160px]">{p.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Revenue
          </span>
          <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
            {formatMoney(aggregatedStats.totalGDV)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Budget
          </span>
          <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
            {formatMoney(aggregatedStats.totalCost)}
          </div>
        </div>

        {/* Logical Realized Profit or Loss Card (Only from Completed Projects) */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {aggregatedStats.completedCount === 0
                ? "Realized Profit"
                : aggregatedStats.realizedProfit >= 0
                ? "Realized Profit"
                : "Realized Loss"}
            </span>
            {aggregatedStats.completedCount > 0 && (
              <span
                className={`text-xs font-semibold ${
                  aggregatedStats.realizedProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {aggregatedStats.realizedMarginPct.toFixed(1)}% Margin
              </span>
            )}
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
            {aggregatedStats.completedCount > 0
              ? formatMoney(aggregatedStats.realizedProfit)
              : "$0.00"}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            {aggregatedStats.completedCount > 0
              ? `${aggregatedStats.completedCount} completed ${
                  aggregatedStats.completedCount === 1 ? "project" : "projects"
                }`
              : "Pending closeout & disposition"}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Loan Drawn
            </span>
            <span className="text-xs font-medium text-slate-500">
              {aggregatedStats.portfolioLeveragePct.toFixed(0)}% of Budget
            </span>
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
            {formatMoney(aggregatedStats.totalDebtDrawn)}
          </div>
        </div>
      </div>

      {/* 3. Collapsible Minimalist Bar Chart: Revenue, Budget, and Loan Drawn */}
      {showChart && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Revenue, Budget, and Loan Drawn
            </h3>
            <span className="text-xs text-slate-500">
              Active Capital Stack Comparison
            </span>
          </div>

          <div className="w-full h-56 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#E2E8F0" />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  stroke="#E2E8F0"
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, ""]}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#1E293B",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#F8FAFC" }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#1E293B" radius={[3, 3, 0, 0]} />
                <Bar dataKey="cost" name="Budget" fill="#94A3B8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="loanDrawn" name="Loan Drawn" fill="#2563EB" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. Condensed Project Matrix (Streamlined 3-Tab Architecture) */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Dimension Filter Tabs */}
        <div className="p-3 bg-slate-50/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("OVERVIEW")}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                activeTab === "OVERVIEW"
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("LOANS")}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                activeTab === "LOANS"
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Loans &amp; Debt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("HEALTH")}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                activeTab === "HEALTH"
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Site Health
            </button>
          </div>

          <span className="text-xs text-slate-500">
            {comparedProjects.length} active {comparedProjects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        {/* Matrix Project Rows */}
        <div className="divide-y divide-slate-100">
          {comparedProjects.map((p) => {
            const econ = economicsMap.get(p.id);
            const gdv =
              toNum(econ?.gross_development_value) ||
              (p.forecast_profit ? p.forecast_profit + toNum(p.loan_commitment) : 0);
            const cost = toNum(econ?.total_cost) || toNum(p.loan_commitment);
            const profit = toNum(econ?.net_profit) || p.forecast_profit || 0;
            const margin = gdv > 0 ? (profit / gdv) * 100 : 0;

            const commitment = toNum(p.loan_commitment) || toNum(econ?.senior_debt_balance);
            const debtDrawn = toNum(econ?.senior_debt_drawn);
            const debtDrawnPct = commitment > 0 ? Math.min(100, (debtDrawn / commitment) * 100) : 0;
            const ltc = cost > 0 ? (debtDrawn / cost) * 100 : 0;
            const em = econ?.equity_multiple ?? 1.85;

            const progress = p.progress_pct ?? (p.status === "COMPLETED" ? 100 : 45);
            const health = p.health_status || "HEALTHY";
            const healthBadge = getHealthBadge(health);
            const stageLabel = getStageLabel(p.lifecycle_stage);
            const isCompleted = isProjectCompleted(p);

            const nextMilestone =
              p.status === "COMPLETED"
                ? "Handover & Investor Waterfall"
                : p.lifecycle_stage === "PRE_CONSTRUCTION"
                ? "Site Clearing & Permitting"
                : "Structural Steel & Framing";

            return (
              <div
                key={p.id}
                onClick={() => onOpenWorkspace(p)}
                className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Project Info */}
                  <div className="flex items-center gap-3 min-w-[200px] max-w-sm">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                      <Image
                        src={getProjectThumbnail(p)}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${healthBadge.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${healthBadge.dotColor}`} />
                          {healthBadge.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        <span>{stageLabel}</span>
                        {p.address && <span className="text-slate-400"> • {p.address}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Overview Tab: Logical handling between Completed vs In-Flight Projects */}
                  {activeTab === "OVERVIEW" && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 max-w-2xl text-xs">
                      <div>
                        <div className="text-slate-400 font-medium">Revenue</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {formatMoney(gdv)}
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 font-medium">Budget</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {formatMoney(cost)}
                        </div>
                      </div>

                      {/* Completed projects show Realized Profit / Loss; In-flight projects show Loan Drawn */}
                      {isCompleted ? (
                        <div>
                          <div className="text-slate-400 font-medium">
                            {profit >= 0 ? "Realized Profit" : "Realized Loss"}
                          </div>
                          <div
                            className={`font-semibold mt-0.5 tabular-nums ${
                              profit >= 0 ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {formatMoney(profit)} ({margin.toFixed(0)}%)
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-slate-400 font-medium">Loan Drawn</div>
                          <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                            {formatMoney(debtDrawn)} ({debtDrawnPct.toFixed(0)}%)
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-slate-400 font-medium">Progress</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {progress}% Complete
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loans Tab: Facility, Loan Drawn, LTC, Target Multiple */}
                  {activeTab === "LOANS" && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 max-w-2xl text-xs">
                      <div>
                        <div className="text-slate-400 font-medium">Facility</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {formatMoney(commitment)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-medium">Loan Drawn</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {formatMoney(debtDrawn)} ({debtDrawnPct.toFixed(0)}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-medium">Loan-to-Cost</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {ltc.toFixed(1)}% LTC
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-medium">Target Return</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {em.toFixed(2)}x EM
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Health Tab: Physical Site Progress & Active Milestone */}
                  {activeTab === "HEALTH" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 max-w-2xl text-xs">
                      <div>
                        <div className="text-slate-400 font-medium">Site Progress</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {progress}% Physical
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-slate-400 font-medium">Next Milestone</div>
                        <div className="text-slate-800 font-medium mt-0.5 truncate">
                          {nextMilestone}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Standardized Action Button */}
                  <div className="flex items-center justify-end shrink-0 pt-2 lg:pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWorkspace(p);
                      }}
                      className="h-8 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 text-xs font-medium text-slate-700 shadow-2xs transition-colors"
                    >
                      <span>Open</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
