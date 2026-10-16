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
  Award,
  SlidersHorizontal,
  Search,
  X,
  LayoutGrid,
  Table as TableIcon,
  Wallet,
  Activity,
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

type TabDimension = "ALL" | "PROFITABILITY" | "CAPITAL" | "HEALTH";
type CompareViewMode = "SCORECARDS" | "MATRIX";

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

export function ProjectFinancialComparison({
  projects,
  globalRole = "OWNER",
  onOpenWorkspace,
}: ProjectFinancialComparisonProps) {
  // If user has many projects, start with top 4 by default for peak legibility and speed, or all if <= 4
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    projects.slice(0, 4).map((p) => p.id)
  );

  const [compareViewMode, setCompareViewMode] = useState<CompareViewMode>("SCORECARDS");
  const [activeTab, setActiveTab] = useState<TabDimension>("ALL");
  const [showChart, setShowChart] = useState(true);
  const [projectSearch, setProjectSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");

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

  // Filter project selector list based on user search or stage filter
  const filteredAvailableProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        projectSearch === "" ||
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        (p.address || "").toLowerCase().includes(projectSearch.toLowerCase());
      const matchesStage =
        stageFilter === "ALL" ||
        (stageFilter === "PRE_CONSTRUCTION" && p.lifecycle_stage === "PRE_CONSTRUCTION") ||
        (stageFilter === "UNDER_CONSTRUCTION" && (p.lifecycle_stage === "UNDER_CONSTRUCTION" || p.lifecycle_stage === "CONSTRUCTION")) ||
        (stageFilter === "POST_CONSTRUCTION" && (p.lifecycle_stage === "POST_CONSTRUCTION" || p.lifecycle_stage === "DISPOSITION")) ||
        (stageFilter === "COMPLETE" && (p.lifecycle_stage === "COMPLETE" || p.lifecycle_stage === "COMPLETION" || p.lifecycle_stage === "CLOSED" || p.status === "COMPLETED"));
      return matchesSearch && matchesStage;
    });
  }, [projects, projectSearch, stageFilter]);

  // Projects actively in comparison
  const comparedProjects = useMemo(() => {
    return projects.filter((p) => selectedIds.includes(p.id));
  }, [projects, selectedIds]);

  const toggleProject = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((pId) => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectTop4 = () => {
    setSelectedIds(projects.slice(0, 4).map((p) => p.id));
  };

  const selectAll = () => {
    setSelectedIds(projects.map((p) => p.id));
  };

  const clearNonFirst = () => {
    if (projects.length > 0) {
      setSelectedIds([projects[0].id]);
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

  // Compute benchmarks (Top Performer and Key Insights)
  const insights: {
    bestMarginProj: { project: Project; margin: number } | null;
    highestProfitProj: { project: Project; profit: number } | null;
  } | null = useMemo(() => {
    if (comparedProjects.length === 0) return null;

    let bestMarginProj: { project: Project; margin: number } | null = null;
    let highestProfitProj: { project: Project; profit: number } | null = null;

    comparedProjects.forEach((p) => {
      const econ = economicsMap.get(p.id);
      const gdv = toNum(econ?.gross_development_value) || 1;
      const profit = toNum(econ?.net_profit) || p.forecast_profit || 0;
      const margin = (profit / gdv) * 100;

      if (!bestMarginProj || margin > bestMarginProj.margin) {
        bestMarginProj = { project: p, margin };
      }
      if (!highestProfitProj || profit > highestProfitProj.profit) {
        highestProfitProj = { project: p, profit };
      }
    });

    return { bestMarginProj, highestProfitProj };
  }, [comparedProjects, economicsMap]);

  // Data for Chart View
  const chartData = useMemo(() => {
    return comparedProjects.map((p) => {
      const econ = economicsMap.get(p.id);
      const gdvCents = toNum(econ?.gross_development_value);
      const costCents = toNum(econ?.total_cost);
      const profitCents = toNum(econ?.net_profit) || p.forecast_profit || 0;
      const debtDrawnCents = toNum(econ?.senior_debt_drawn);
      const facilityCents = toNum(p.loan_commitment) || toNum(econ?.senior_debt_balance);
      const margin = gdvCents > 0 ? (profitCents / gdvCents) * 100 : 0;

      return {
        name: p.name.length > 14 ? `${p.name.substring(0, 12)}…` : p.name,
        fullName: p.name,
        revenue: Math.round(gdvCents / 100),
        cost: Math.round(costCents / 100),
        profit: Math.round(profitCents / 100),
        debtDrawn: Math.round(debtDrawnCents / 100),
        debtFacility: Math.round(facilityCents / 100),
        margin: Number(margin.toFixed(1)),
      };
    });
  }, [comparedProjects, economicsMap]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Project Name",
      "Stage",
      "Gross Revenue (GDV)",
      "Projected Cost",
      "Net Profit",
      "Profit Margin (%)",
      "Loan Commitment",
      "Debt Drawn",
      "Health Status",
      "Completion (%)",
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
        `"${p.name}"`,
        p.lifecycle_stage,
        gdv,
        cost,
        profit,
        `${margin}%`,
        commitment,
        debtDrawn,
        health,
        `${progress}%`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GroundUp_Financial_Comparison_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar with Smart Large-List Management */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <BarChart3 className="h-4 w-4 stroke-[2.25]" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Financial Performance Comparison
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                {comparedProjects.length} of {projects.length} Compared
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Side-by-side revenue, development cost, and profit margins across your active projects.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {projects.length > 4 && (
              <button
                onClick={selectTop4}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                title="Select first 4 projects for clean standard comparison"
              >
                Top 4
              </button>
            )}
            {selectedIds.length < projects.length ? (
              <button
                onClick={selectAll}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Select All ({projects.length})
              </button>
            ) : (
              <button
                onClick={clearNonFirst}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => setShowChart(!showChart)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                showChart
                  ? "border-blue-200 bg-blue-50/70 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{showChart ? "Hide Chart" : "Show Chart"}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Smart Search & Filter bar if project count is substantial */}
        {projects.length > 5 && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter project list..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
              />
              {projectSearch && (
                <button
                  onClick={() => setProjectSearch("")}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Stages</option>
              <option value="PRE_CONSTRUCTION">Pre-Construction</option>
              <option value="UNDER_CONSTRUCTION">Under Construction</option>
              <option value="POST_CONSTRUCTION">Post-Construction</option>
              <option value="COMPLETE">Complete</option>
            </select>
          </div>
        )}

        {/* Scrollable Project Selection Chips with Smart Responsive Wrap */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" />
              Active in Comparison ({selectedIds.length}):
            </span>
            {projects.length > 8 && (
              <span className="text-[11px] text-slate-400 italic">
                Scroll or search to toggle additional projects
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 max-h-36 overflow-y-auto pr-1">
            {filteredAvailableProjects.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProject(p.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white font-semibold shadow-2xs"
                      : "border border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-xs text-[9px] ${
                      isSelected ? "bg-white/20 text-white" : "border border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </span>
                  <span className="truncate max-w-[150px]">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Executive Combined Summary Cards (Compact 2x2 Mobile Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Gross Revenue (GDV)</span>
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-base sm:text-xl font-extrabold text-slate-900 tabular-nums">
            {formatMoney(aggregatedStats.totalGDV)}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">
            Combined project sales value
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Budgeted Cost</span>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-base sm:text-xl font-extrabold text-slate-900 tabular-nums">
            {formatMoney(aggregatedStats.totalCost)}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">
            Hard, soft &amp; contingency costs
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800 truncate">Forecast Net Profit</span>
            <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-base sm:text-xl font-extrabold text-emerald-700 tabular-nums">
            {formatMoney(aggregatedStats.totalProfit)}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs font-semibold text-emerald-800 truncate">
            {aggregatedStats.portfolioMarginPct.toFixed(1)}% Combined Net Margin
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Debt Drawn</span>
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-base sm:text-xl font-extrabold text-slate-900 tabular-nums">
            {formatMoney(aggregatedStats.totalDebtDrawn)}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">
            <span className="font-semibold text-slate-700">{aggregatedStats.portfolioLeveragePct.toFixed(1)}%</span> cost funded
          </div>
        </div>
      </div>

      {/* 3. Visual Performance Chart (With Smart Horizontal Scroll when comparing many projects) */}
      {showChart && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Revenue, Cost, and Profit Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Side-by-side distribution across {comparedProjects.length} active developments (in thousands).
              </p>
            </div>
            {insights?.bestMarginProj && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-1 text-xs text-emerald-800 font-medium self-start sm:self-auto">
                <Award className="h-3.5 w-3.5 text-emerald-600" />
                <span>Top Margin: <strong className="font-bold">{insights.bestMarginProj.project.name}</strong> ({insights.bestMarginProj.margin.toFixed(1)}%)</span>
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto pt-2 pb-1">
            <div style={{ minWidth: comparedProjects.length > 5 ? `${comparedProjects.length * 110}px` : "100%", height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} stroke="#CBD5E1" />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#475569" }}
                    stroke="#CBD5E1"
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
                  <Bar dataKey="revenue" name="Revenue (GDV)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Project Cost" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Net Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      {/* 4. Multi-Project Comparison Section (Scorecards & Matrix Views) */}
      <div className="space-y-4">
        {/* Section Header with View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Project Performance Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified financial returns, capital stack, and physical site milestones across {comparedProjects.length} projects.
            </p>
          </div>

          <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-auto border border-slate-200/60">
            <button
              onClick={() => setCompareViewMode("SCORECARDS")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                compareViewMode === "SCORECARDS"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Project Scorecards</span>
            </button>
            <button
              onClick={() => setCompareViewMode("MATRIX")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                compareViewMode === "MATRIX"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Matrix Table</span>
            </button>
          </div>
        </div>

        {/* View 1: Low-Cognitive Project Scorecards (All-in-One at a Glance) */}
        {compareViewMode === "SCORECARDS" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {comparedProjects.map((p) => {
              const econ = economicsMap.get(p.id);
              const gdv = toNum(econ?.gross_development_value) || (p.forecast_profit ? p.forecast_profit + toNum(p.loan_commitment) : 0);
              const cost = toNum(econ?.total_cost) || toNum(p.loan_commitment);
              const profit = toNum(econ?.net_profit) || p.forecast_profit || 0;
              const margin = gdv > 0 ? (profit / gdv) * 100 : 0;
              const roc = econ?.return_on_cost_pct ?? (cost > 0 ? (profit / cost) * 100 : 0);
              const commitment = toNum(p.loan_commitment) || toNum(econ?.senior_debt_balance);
              const debtDrawn = toNum(econ?.senior_debt_drawn);
              const ltc = cost > 0 ? (debtDrawn / cost) * 100 : 0;
              const debtDrawnPct = commitment > 0 ? Math.min(100, (debtDrawn / commitment) * 100) : 0;
              const em = econ?.equity_multiple ?? 1.85;
              const progress = p.progress_pct ?? (p.status === "COMPLETED" ? 100 : 45);
              const health = p.health_status || "HEALTHY";
              const isLeader = insights?.bestMarginProj?.project.id === p.id;
              const costPct = gdv > 0 ? Math.min(100, Math.round((cost / gdv) * 100)) : 60;
              const profitPct = Math.max(0, 100 - costPct);

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  {/* Project Top Identity Banner */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-start gap-3">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <Image
                          src={getProjectThumbnail(p)}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{p.name}</h4>
                          {isLeader && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                              <Award className="h-2.5 w-2.5" />
                              Top Margin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{p.address}</p>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 capitalize">
                            {p.lifecycle_stage.toLowerCase().includes("conception") ? "Design & Planning" : p.lifecycle_stage.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              health === "HEALTHY"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : health === "AT_RISK"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                health === "HEALTHY"
                                  ? "bg-emerald-600"
                                  : health === "AT_RISK"
                                  ? "bg-amber-600"
                                  : "bg-rose-600"
                              }`}
                            />
                            {health}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Unified Information Blocks (Zero Tab Switching) */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    {/* Dimension 1: Profitability & Returns */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 sm:p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-800">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                          Returns &amp; Margin
                        </span>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          {margin.toFixed(1)}% Net Margin
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xs text-slate-600 font-medium">Forecast Net Profit</span>
                        <span className="text-base font-extrabold text-emerald-700 tabular-nums">
                          {formatMoney(profit)}
                        </span>
                      </div>

                      {/* Mini Visual Split Bar (Cost vs Profit) */}
                      <div>
                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                          <div
                            className="h-full bg-slate-400 transition-all"
                            style={{ width: `${costPct}%` }}
                            title={`Cost: ${costPct}% of GDV`}
                          />
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${profitPct}%` }}
                            title={`Net Profit: ${profitPct}% of GDV`}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>Cost: <strong className="font-semibold text-slate-700">{formatMoney(cost)}</strong></span>
                          <span>GDV: <strong className="font-semibold text-slate-700">{formatMoney(gdv)}</strong></span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[11px] pt-1.5 border-t border-emerald-100/70">
                        <span className="text-slate-500">Return on Cost (ROC)</span>
                        <span className="font-bold text-slate-900 tabular-nums">{roc !== undefined ? `${roc.toFixed(1)}%` : "-"}</span>
                      </div>
                    </div>

                    {/* Dimension 2: Capital Stack & Debt */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-600">
                          <Wallet className="h-3.5 w-3.5 text-slate-500" />
                          Capital Stack &amp; Loans
                        </span>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                          {ltc.toFixed(1)}% LTC
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xs text-slate-600 font-medium">Debt Drawn to Date</span>
                        <span className="text-sm font-bold text-amber-700 tabular-nums">
                          {formatMoney(debtDrawn)}
                        </span>
                      </div>

                      {/* Debt Drawn Progress Bar */}
                      <div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${debtDrawnPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>Facility: <strong className="font-semibold text-slate-700">{commitment > 0 ? formatMoney(commitment) : "-"}</strong></span>
                          <span>{debtDrawnPct.toFixed(0)}% Drawn</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-200/70">
                        <span className="text-slate-500">Target Equity Multiple</span>
                        <span className="font-bold text-slate-900 tabular-nums">{em.toFixed(2)}x</span>
                      </div>
                    </div>

                    {/* Dimension 3: Physical Site Progress */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                          Physical Completion
                        </span>
                        <span className="font-extrabold text-blue-600 tabular-nums">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500">Next Milestone</span>
                        <span className="font-medium text-slate-800 truncate max-w-[170px]">
                          {p.next_milestone || "Handover & Final Audit"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Direct Action */}
                  <div className="p-4 sm:p-5 pt-0">
                    <button
                      onClick={() => onOpenWorkspace(p)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white py-2.5 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <span>Open Project Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View 2: Multi-Dimension Matrix Table with All Dimensions View */
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            {/* Dimension Switcher Filter Strip */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 sm:px-5 pt-2.5 gap-2 sm:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeTab === "ALL"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setActiveTab("PROFITABILITY")}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeTab === "PROFITABILITY"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Profitability &amp; Returns
              </button>
              <button
                onClick={() => setActiveTab("CAPITAL")}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeTab === "CAPITAL"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Capital Stack &amp; Loans
              </button>
              <button
                onClick={() => setActiveTab("HEALTH")}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeTab === "HEALTH"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Project Health &amp; Progress
              </button>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto relative">
              <table className="w-full min-w-[760px] text-left text-xs border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 bg-slate-50 px-4 sm:px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-200 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                      Metric
                    </th>
                    {comparedProjects.map((p) => (
                      <th key={p.id} className="px-4 sm:px-5 py-3.5 text-right min-w-[180px] border-b border-slate-200 bg-slate-50/60">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative h-6 w-6 rounded-md overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={getProjectThumbnail(p)}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="24px"
                            />
                          </div>
                          <div className="font-bold text-slate-900 text-xs truncate max-w-[140px]">{p.name}</div>
                        </div>
                      </th>
                    ))}
                    <th className="px-4 sm:px-5 py-3.5 text-right font-bold uppercase tracking-wider text-[11px] text-slate-700 bg-slate-100/80 min-w-[150px] border-b border-slate-200">
                      Total / Avg
                    </th>
                  </tr>
                </thead>

                <tbody className="text-slate-700">
                  {/* Category 1: Returns & Profitability */}
                  {(activeTab === "ALL" || activeTab === "PROFITABILITY") && (
                    <>
                      {activeTab === "ALL" && (
                        <tr>
                          <td
                            colSpan={comparedProjects.length + 2}
                            className="bg-emerald-50/60 px-4 sm:px-5 py-2 font-bold text-emerald-900 text-[10px] uppercase tracking-wider border-b border-emerald-100"
                          >
                            Returns &amp; Profitability
                          </td>
                        </tr>
                      )}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Gross Development Value (GDV)</div>
                          <div className="text-[10px] text-slate-400 font-normal">Projected sales value</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const econ = economicsMap.get(p.id);
                          const gdv = toNum(econ?.gross_development_value);
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right font-bold text-slate-900 tabular-nums border-b border-slate-100 align-middle">
                              {formatMoney(gdv)}
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right font-extrabold text-slate-900 bg-slate-50/50 tabular-nums border-b border-slate-100 align-middle">
                          {formatMoney(aggregatedStats.totalGDV)}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Budgeted Cost</div>
                          <div className="text-[10px] text-slate-400 font-normal">Hard, soft, and contingency</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const econ = economicsMap.get(p.id);
                          const cost = toNum(econ?.total_cost);
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right font-medium text-slate-700 tabular-nums border-b border-slate-100 align-middle">
                              {formatMoney(cost)}
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right font-bold text-slate-800 bg-slate-50/50 tabular-nums border-b border-slate-100 align-middle">
                          {formatMoney(aggregatedStats.totalCost)}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/60 transition-colors bg-emerald-50/20">
                        <td className="sticky left-0 z-10 bg-emerald-50 px-4 sm:px-5 py-3.5 font-bold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-emerald-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Forecast Net Profit</div>
                          <div className="text-[10px] text-emerald-700 font-normal">Revenue minus budgeted cost</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const econ = economicsMap.get(p.id);
                          const profit = toNum(econ?.net_profit) || p.forecast_profit || 0;
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right font-extrabold text-emerald-600 tabular-nums text-sm border-b border-emerald-100 bg-emerald-50/20 align-middle">
                              {formatMoney(profit)}
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right font-extrabold text-emerald-700 bg-emerald-100/40 tabular-nums text-sm border-b border-emerald-100 align-middle">
                          {formatMoney(aggregatedStats.totalProfit)}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Net Margin %</div>
                          <div className="text-[10px] text-slate-400 font-normal">Profit divided by GDV</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const econ = economicsMap.get(p.id);
                          const gdv = toNum(econ?.gross_development_value) || 1;
                          const profit = toNum(econ?.net_profit) || p.forecast_profit || 0;
                          const margin = (profit / gdv) * 100;
                          const isLeader = insights?.bestMarginProj?.project.id === p.id;
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right font-bold tabular-nums border-b border-slate-100 align-middle">
                              <span className={`inline-flex items-center gap-1.5 ${margin >= 20 ? "text-emerald-600" : "text-slate-800"}`}>
                                {margin.toFixed(1)}%
                                {isLeader && (
                                  <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[9px] font-bold">
                                    Top
                                  </span>
                                )}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right font-bold text-slate-900 bg-slate-50/50 tabular-nums border-b border-slate-100 align-middle">
                          {aggregatedStats.portfolioMarginPct.toFixed(1)}%
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Return on Cost (ROC)</div>
                          <div className="text-[10px] text-slate-400 font-normal">Profit divided by total cost</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const econ = economicsMap.get(p.id);
                          const roc = econ?.return_on_cost_pct;
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right font-bold text-blue-600 tabular-nums border-b border-slate-100 align-middle">
                              {roc !== undefined ? `${roc.toFixed(1)}%` : "-"}
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right font-bold text-blue-700 bg-slate-50/50 tabular-nums border-b border-slate-100 align-middle">
                          {aggregatedStats.avgROC.toFixed(1)}%
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Category 2: Capital Stack & Financing */}
                  {(activeTab === "ALL" || activeTab === "CAPITAL") && (
                    <>
                      {activeTab === "ALL" && (
                        <tr>
                          <td
                            colSpan={comparedProjects.length + 2}
                            className="bg-amber-50/60 px-4 sm:px-5 py-2 font-bold text-amber-900 text-[10px] uppercase tracking-wider border-b border-amber-100"
                          >
                            Capital Stack &amp; Loans
                          </td>
                        </tr>
                      )}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Construction Loan Facility</div>
                          <div className="text-[10px] text-slate-400 font-normal">Approved lender loan commitment</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const commitment = toNum(p.loan_commitment);
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right font-medium text-slate-800 tabular-nums border-b border-slate-100 align-middle">
                              {commitment > 0 ? formatMoney(commitment) : "-"}
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right font-bold text-slate-900 bg-slate-50/50 tabular-nums border-b border-slate-100 align-middle">
                          {formatMoney(aggregatedStats.totalDebtFacility)}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Debt Drawn</div>
                          <div className="text-[10px] text-slate-400 font-normal">Loan balance disbursed to date</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const econ = economicsMap.get(p.id);
                          const drawn = toNum(econ?.senior_debt_drawn);
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right font-bold text-amber-600 tabular-nums border-b border-slate-100 align-middle">
                              {formatMoney(drawn)}
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right font-bold text-amber-700 bg-slate-50/50 tabular-nums border-b border-slate-100 align-middle">
                          {formatMoney(aggregatedStats.totalDebtDrawn)}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Loan-to-Cost (LTC)</div>
                          <div className="text-[10px] text-slate-400 font-normal">Drawn debt divided by total cost</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const econ = economicsMap.get(p.id);
                          const cost = toNum(econ?.total_cost) || 1;
                          const debt = toNum(econ?.senior_debt_drawn);
                          const ltc = (debt / cost) * 100;
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right font-bold tabular-nums border-b border-slate-100 align-middle">
                              <span className={ltc > 65 ? "text-amber-600" : "text-slate-800"}>
                                {ltc.toFixed(1)}%
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right font-bold text-slate-900 bg-slate-50/50 tabular-nums border-b border-slate-100 align-middle">
                          {aggregatedStats.portfolioLeveragePct.toFixed(1)}%
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Target Equity Multiple</div>
                          <div className="text-[10px] text-slate-400 font-normal">Projected return on invested equity</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const econ = economicsMap.get(p.id);
                          const em = econ?.equity_multiple;
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right font-semibold text-slate-800 tabular-nums border-b border-slate-100 align-middle">
                              {em !== undefined ? `${em.toFixed(2)}x` : "1.85x"}
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right font-semibold text-slate-600 bg-slate-50/50 tabular-nums border-b border-slate-100 align-middle">
                          Target &gt; 1.8x
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Category 3: Project Health & Progress */}
                  {(activeTab === "ALL" || activeTab === "HEALTH") && (
                    <>
                      {activeTab === "ALL" && (
                        <tr>
                          <td
                            colSpan={comparedProjects.length + 2}
                            className="bg-blue-50/60 px-4 sm:px-5 py-2 font-bold text-blue-900 text-[10px] uppercase tracking-wider border-b border-blue-100"
                          >
                            Project Health &amp; Execution
                          </td>
                        </tr>
                      )}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Project Health</div>
                          <div className="text-[10px] text-slate-400 font-normal">Current risk status</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const health = p.health_status || "HEALTHY";
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right border-b border-slate-100 align-middle">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                  health === "HEALTHY"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : health === "AT_RISK"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    health === "HEALTHY"
                                      ? "bg-emerald-600"
                                      : health === "AT_RISK"
                                      ? "bg-amber-600"
                                      : "bg-rose-600"
                                  }`}
                                />
                                {health}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right text-slate-400 bg-slate-50/50 border-b border-slate-100 align-middle">-</td>
                      </tr>

                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Physical Completion</div>
                          <div className="text-[10px] text-slate-400 font-normal">Verified progress percentage</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const pct = p.progress_pct ?? (p.status === "COMPLETED" ? 100 : 45);
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right font-bold text-slate-800 tabular-nums border-b border-slate-100 align-middle">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span>{pct}%</span>
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right font-semibold text-slate-700 bg-slate-50/50 border-b border-slate-100 align-middle">
                          Avg:{" "}
                          {(
                            comparedProjects.reduce(
                              (acc, p) => acc + (p.progress_pct ?? (p.status === "COMPLETED" ? 100 : 45)),
                              0
                            ) / comparedProjects.length
                          ).toFixed(0)}
                          %
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3.5 font-semibold text-slate-900 w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] align-middle">
                          <div>Lifecycle Stage</div>
                          <div className="text-[10px] text-slate-400 font-normal">Current development phase</div>
                        </td>
                        {comparedProjects.map((p) => {
                          const stageLabel = p.lifecycle_stage
                            .toLowerCase()
                            .includes("conception")
                            ? "Design & Planning"
                            : p.lifecycle_stage.replace(/_/g, " ");
                          return (
                            <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right border-b border-slate-100 align-middle">
                              <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                                {stageLabel}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 sm:px-5 py-3.5 text-right text-slate-400 bg-slate-50/50 border-b border-slate-100 align-middle">-</td>
                      </tr>
                    </>
                  )}
                </tbody>

                {/* Direct Action Footer */}
                <tfoot>
                  <tr>
                    <td className="sticky left-0 z-10 bg-slate-50 px-4 sm:px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-52 min-w-[210px] max-w-[210px] sm:w-60 sm:min-w-[240px] sm:max-w-[240px] border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] border-t border-slate-200 align-middle">
                      Action
                    </td>
                    {comparedProjects.map((p) => (
                      <td key={p.id} className="px-4 sm:px-5 py-3.5 text-right border-t border-slate-200 bg-slate-50/40 align-middle">
                        <button
                          onClick={() => onOpenWorkspace(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <span>Open Project</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    ))}
                    <td className="px-4 sm:px-5 py-3.5 bg-slate-50/60 border-t border-slate-200 align-middle"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
