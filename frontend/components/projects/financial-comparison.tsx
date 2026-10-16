"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project, ProjectEconomics, UserRole } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import {
  TrendingUp,
  DollarSign,
  ArrowRight,
  Download,
  Building2,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Check,
  Search,
  X,
  Wallet,
  Activity,
  Layers,
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

type MatrixTab = "OVERVIEW" | "PROFITABILITY" | "LOANS" | "HEALTH";

const toNum = (val?: string | number | null): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const parsed = Number(val);
  return isNaN(parsed) ? 0 : parsed;
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
  const [projectSearch, setProjectSearch] = useState("");

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

  // Filtered available projects for search
  const filteredAvailableProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = projectSearch.toLowerCase();
      return (
        projectSearch === "" ||
        p.name.toLowerCase().includes(q) ||
        (p.address || "").toLowerCase().includes(q)
      );
    });
  }, [projects, projectSearch]);

  // Projects actively in comparison
  const comparedProjects = useMemo(() => {
    return projects.filter((p) => selectedIds.includes(p.id));
  }, [projects, selectedIds]);

  const toggleProject = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one
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
    let totalProfit = 0;
    let totalDebtDrawn = 0;
    let totalDebtFacility = 0;
    let rocCount = 0;
    let rocSum = 0;

    comparedProjects.forEach((p) => {
      const econ = economicsMap.get(p.id);
      const gdv = econ?.gross_development_value
        ? toNum(econ.gross_development_value)
        : p.forecast_profit
        ? p.forecast_profit + toNum(p.loan_commitment)
        : 0;
      const cost = econ?.total_cost ? toNum(econ.total_cost) : toNum(p.loan_commitment);
      const profit = econ?.net_profit ? toNum(econ.net_profit) : p.forecast_profit || 0;
      const debtDrawn = toNum(econ?.senior_debt_drawn);
      const debtFacility = toNum(p.loan_commitment) || toNum(econ?.senior_debt_balance);

      totalGDV += gdv;
      totalCost += cost;
      totalProfit += profit;
      totalDebtDrawn += debtDrawn;
      totalDebtFacility += debtFacility;

      if (econ?.return_on_cost_pct !== undefined && econ.return_on_cost_pct > 0) {
        rocSum += econ.return_on_cost_pct;
        rocCount++;
      }
    });

    const portfolioMarginPct = totalGDV > 0 ? (totalProfit / totalGDV) * 100 : 0;
    const avgROC = rocCount > 0 ? rocSum / rocCount : totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const portfolioLeveragePct = totalCost > 0 ? (totalDebtDrawn / totalCost) * 100 : 0;

    return {
      totalGDV,
      totalCost,
      totalProfit,
      totalDebtDrawn,
      totalDebtFacility,
      portfolioMarginPct,
      avgROC,
      portfolioLeveragePct,
    };
  }, [comparedProjects, economicsMap]);

  // Top margin project
  const topMarginProject = useMemo<{ name: string; margin: number } | null>(() => {
    if (comparedProjects.length === 0) return null;
    let best: { name: string; margin: number } | null = null;
    comparedProjects.forEach((p) => {
      const econ = economicsMap.get(p.id);
      const gdv = toNum(econ?.gross_development_value) || 1;
      const profit = toNum(econ?.net_profit) || p.forecast_profit || 0;
      const margin = (profit / gdv) * 100;
      if (!best || margin > best.margin) {
        best = { name: p.name, margin };
      }
    });
    return best;
  }, [comparedProjects, economicsMap]);

  // Data for Chart View
  const chartData = useMemo(() => {
    return comparedProjects.map((p) => {
      const econ = economicsMap.get(p.id);
      const gdvCents = toNum(econ?.gross_development_value);
      const costCents = toNum(econ?.total_cost);
      const profitCents = toNum(econ?.net_profit) || p.forecast_profit || 0;
      const margin = gdvCents > 0 ? (profitCents / gdvCents) * 100 : 0;

      return {
        name: p.name.length > 14 ? `${p.name.substring(0, 12)}...` : p.name,
        fullName: p.name,
        revenue: Math.round(gdvCents / 100),
        cost: Math.round(costCents / 100),
        profit: Math.round(profitCents / 100),
        margin: Number(margin.toFixed(1)),
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
      "Net Profit",
      "Margin (%)",
      "Loan Facility",
      "Loan Drawn",
      "Status",
      "Progress (%)",
    ];

    const rows = comparedProjects.map((p) => {
      const econ = economicsMap.get(p.id);
      const gdv = (toNum(econ?.gross_development_value) / 100).toFixed(2);
      const cost = (toNum(econ?.total_cost) / 100).toFixed(2);
      const profit = ((toNum(econ?.net_profit) || p.forecast_profit || 0) / 100).toFixed(2);
      const margin = gdv && Number(gdv) > 0 ? ((Number(profit) / Number(gdv)) * 100).toFixed(1) : "0";
      const debtDrawn = (toNum(econ?.senior_debt_drawn) / 100).toFixed(2);
      const commitment = (toNum(p.loan_commitment) / 100).toFixed(2);
      const health = p.health_status || "HEALTHY";
      const progress = p.progress_pct ?? 0;

      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.lifecycle_stage}"`,
        gdv,
        cost,
        profit,
        `"${margin}%"`,
        commitment,
        debtDrawn,
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
            {filteredAvailableProjects.map((p) => {
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

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Net Profit
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              {aggregatedStats.portfolioMarginPct.toFixed(1)}% Margin
            </span>
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
            {formatMoney(aggregatedStats.totalProfit)}
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

      {/* 3. Collapsible Minimalist Bar Chart */}
      {showChart && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Revenue, Budget, and Profit
            </h3>
            {topMarginProject && (
              <span className="text-xs text-slate-600">
                Top Margin: <strong className="font-semibold text-slate-900">{topMarginProject.name}</strong> ({topMarginProject.margin.toFixed(1)}%)
              </span>
            )}
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
                <Bar dataKey="profit" name="Net Profit" fill="#059669" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. Condensed Project Matrix (One Row Per Project) */}
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
              onClick={() => setActiveTab("PROFITABILITY")}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                activeTab === "PROFITABILITY"
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Profitability
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
            const roc = econ?.return_on_cost_pct ?? (cost > 0 ? (profit / cost) * 100 : 0);

            const commitment = toNum(p.loan_commitment) || toNum(econ?.senior_debt_balance);
            const debtDrawn = toNum(econ?.senior_debt_drawn);
            const debtDrawnPct = commitment > 0 ? Math.min(100, (debtDrawn / commitment) * 100) : 0;
            const ltc = cost > 0 ? (debtDrawn / cost) * 100 : 0;
            const em = econ?.equity_multiple ?? 1.85;

            const progress = p.progress_pct ?? (p.status === "COMPLETED" ? 100 : 45);
            const health = p.health_status || "HEALTHY";
            const healthBadge = getHealthBadge(health);
            const stageLabel = getStageLabel(p.lifecycle_stage);
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

                  {/* Dynamic Metrics per Tab */}
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
                      <div>
                        <div className="text-slate-400 font-medium">Net Profit</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {formatMoney(profit)} ({margin.toFixed(0)}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-medium">Progress</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {progress}% Complete
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "PROFITABILITY" && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 max-w-2xl text-xs">
                      <div>
                        <div className="text-slate-400 font-medium">Revenue</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {formatMoney(gdv)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-medium">Total Cost</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {formatMoney(cost)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-medium">Net Profit</div>
                        <div className="text-emerald-700 font-semibold mt-0.5 tabular-nums">
                          {formatMoney(profit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-medium">Margin / ROC</div>
                        <div className="text-slate-900 font-semibold mt-0.5 tabular-nums">
                          {margin.toFixed(1)}% / {roc.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}

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
