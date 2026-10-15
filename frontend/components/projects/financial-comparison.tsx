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
  Sparkles,
  SlidersHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
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

type TabDimension = "PROFITABILITY" | "CAPITAL" | "HEALTH";

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

  const [activeTab, setActiveTab] = useState<TabDimension>("PROFITABILITY");
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
              High-clarity benchmark matrix of capital allocation, net margins, and debt exposure.
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

      {/* 2. Executive Combined Summary Cards (Clean & High-Impact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total GDV Value</span>
            <Building2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 tabular-nums">
            {formatMoney(aggregatedStats.totalGDV)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Combined portfolio revenue target
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Projected Cost</span>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 tabular-nums">
            {formatMoney(aggregatedStats.totalCost)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Budgeted development expenditure
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Portfolio Net Profit</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-emerald-700 tabular-nums">
            {formatMoney(aggregatedStats.totalProfit)}
          </div>
          <div className="mt-1 text-xs font-semibold text-emerald-800">
            {aggregatedStats.portfolioMarginPct.toFixed(1)}% Combined Profit Margin
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lender Debt Drawn</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 tabular-nums">
            {formatMoney(aggregatedStats.totalDebtDrawn)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{aggregatedStats.portfolioLeveragePct.toFixed(1)}%</span> of total cost funded
          </div>
        </div>
      </div>

      {/* 3. Visual Performance Chart (With Smart Horizontal Scroll when comparing many projects) */}
      {showChart && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Revenue vs. Cost vs. Net Profit Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Side-by-side financial metric distribution across {comparedProjects.length} active developments (Thousands USD).
              </p>
            </div>
            {insights?.bestMarginProj && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-1 text-xs text-emerald-800 font-medium self-start sm:self-auto">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Leader: <strong className="font-bold">{insights.bestMarginProj.project.name}</strong> ({insights.bestMarginProj.margin.toFixed(1)}% margin)</span>
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

      {/* 4. Side-by-Side Comparison Matrix Table with Fixed Freeze Metric Column & Responsive Horizontal Scroll */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        {/* Dimension Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-5 pt-3 gap-6">
          <button
            onClick={() => setActiveTab("PROFITABILITY")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "PROFITABILITY"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Profitability &amp; Returns
          </button>
          <button
            onClick={() => setActiveTab("CAPITAL")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "CAPITAL"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Capital Stack &amp; Loans
          </button>
          <button
            onClick={() => setActiveTab("HEALTH")}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "HEALTH"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Project Health &amp; Progress
          </button>
        </div>

        {/* Matrix Table with sticky Metric header & horizontal scroll for infinite projects */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="sticky left-0 z-20 bg-slate-50 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-64 min-w-[210px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                  Metric
                </th>
                {comparedProjects.map((p) => (
                  <th key={p.id} className="px-5 py-3.5 text-right min-w-[190px]">
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
                      <div className="font-bold text-slate-900 text-xs truncate max-w-[150px]">{p.name}</div>
                    </div>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right font-bold uppercase tracking-wider text-[11px] text-slate-700 bg-slate-100/70 min-w-[160px]">
                  Total / Avg
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activeTab === "PROFITABILITY" && (
                <>
                  {/* Gross Revenue */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Gross Development Value (GDV)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Projected top-line proceeds</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const econ = economicsMap.get(p.id);
                      const gdv = toNum(econ?.gross_development_value);
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right font-bold text-slate-900 tabular-nums">
                          {formatMoney(gdv)}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-extrabold text-slate-900 bg-slate-50/50 tabular-nums">
                      {formatMoney(aggregatedStats.totalGDV)}
                    </td>
                  </tr>

                  {/* Total Cost */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Total Budgeted Cost</div>
                      <div className="text-[10px] text-slate-400 font-normal">Hard, soft &amp; contingency</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const econ = economicsMap.get(p.id);
                      const cost = toNum(econ?.total_cost);
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right font-medium text-slate-700 tabular-nums">
                          {formatMoney(cost)}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-bold text-slate-800 bg-slate-50/50 tabular-nums">
                      {formatMoney(aggregatedStats.totalCost)}
                    </td>
                  </tr>

                  {/* Net Profit */}
                  <tr className="hover:bg-slate-50/60 transition-colors bg-emerald-50/20">
                    <td className="sticky left-0 z-10 bg-emerald-50/40 px-5 py-3.5 font-bold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-emerald-100">
                      <div>Forecast Net Profit</div>
                      <div className="text-[10px] text-emerald-700 font-normal">Projected return surplus</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const econ = economicsMap.get(p.id);
                      const profit = toNum(econ?.net_profit) || p.forecast_profit || 0;
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right font-extrabold text-emerald-600 tabular-nums text-sm">
                          {formatMoney(profit)}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-extrabold text-emerald-700 bg-emerald-50/40 tabular-nums text-sm">
                      {formatMoney(aggregatedStats.totalProfit)}
                    </td>
                  </tr>

                  {/* Profit Margin */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Profit Margin %</div>
                      <div className="text-[10px] text-slate-400 font-normal">Net Profit &divide; GDV</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const econ = economicsMap.get(p.id);
                      const gdv = toNum(econ?.gross_development_value) || 1;
                      const profit = toNum(econ?.net_profit) || p.forecast_profit || 0;
                      const margin = (profit / gdv) * 100;
                      const isLeader = insights?.bestMarginProj?.project.id === p.id;
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right font-bold tabular-nums">
                          <span className={`inline-flex items-center gap-1.5 ${margin >= 20 ? "text-emerald-600" : "text-slate-800"}`}>
                            {margin.toFixed(1)}%
                            {isLeader && (
                              <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] font-bold">
                                Top
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 bg-slate-50/50 tabular-nums">
                      {aggregatedStats.portfolioMarginPct.toFixed(1)}%
                    </td>
                  </tr>

                  {/* Return on Cost (ROC) */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Return on Cost (ROC)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Profit yield over construction cost</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const econ = economicsMap.get(p.id);
                      const roc = econ?.return_on_cost_pct;
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right font-bold text-blue-600 tabular-nums">
                          {roc !== undefined ? `${roc.toFixed(1)}%` : "—"}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-bold text-blue-700 bg-slate-50/50 tabular-nums">
                      {aggregatedStats.avgROC.toFixed(1)}%
                    </td>
                  </tr>
                </>
              )}

              {activeTab === "CAPITAL" && (
                <>
                  {/* Loan Facility */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Construction Loan Facility</div>
                      <div className="text-[10px] text-slate-400 font-normal">Total approved lender commitment</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const commitment = toNum(p.loan_commitment);
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right font-medium text-slate-800 tabular-nums">
                          {commitment > 0 ? formatMoney(commitment) : "—"}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 bg-slate-50/50 tabular-nums">
                      {formatMoney(aggregatedStats.totalDebtFacility)}
                    </td>
                  </tr>

                  {/* Senior Debt Drawn */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Senior Debt Drawn</div>
                      <div className="text-[10px] text-slate-400 font-normal">Disbursed loan balance to date</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const econ = economicsMap.get(p.id);
                      const drawn = toNum(econ?.senior_debt_drawn);
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right font-bold text-amber-600 tabular-nums">
                          {formatMoney(drawn)}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-bold text-amber-700 bg-slate-50/50 tabular-nums">
                      {formatMoney(aggregatedStats.totalDebtDrawn)}
                    </td>
                  </tr>

                  {/* LTC Leverage */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Current Loan-to-Cost (LTC)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Drawn Debt &divide; Total Budgeted Cost</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const econ = economicsMap.get(p.id);
                      const cost = toNum(econ?.total_cost) || 1;
                      const debt = toNum(econ?.senior_debt_drawn);
                      const ltc = (debt / cost) * 100;
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right font-bold tabular-nums">
                          <span className={ltc > 65 ? "text-amber-600" : "text-slate-800"}>
                            {ltc.toFixed(1)}%
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 bg-slate-50/50 tabular-nums">
                      {aggregatedStats.portfolioLeveragePct.toFixed(1)}%
                    </td>
                  </tr>

                  {/* Equity Multiple */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Target Equity Multiple</div>
                      <div className="text-[10px] text-slate-400 font-normal">Expected return multiple on invested capital</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const econ = economicsMap.get(p.id);
                      const em = econ?.equity_multiple;
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right font-semibold text-slate-800 tabular-nums">
                          {em !== undefined ? `${em.toFixed(2)}x` : "1.85x"}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-600 bg-slate-50/50 tabular-nums">
                      Target &gt; 1.8x
                    </td>
                  </tr>
                </>
              )}

              {activeTab === "HEALTH" && (
                <>
                  {/* Status & Health */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Health Status</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const health = p.health_status || "HEALTHY";
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right">
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
                    <td className="px-5 py-3.5 text-right text-slate-400 bg-slate-50/50">—</td>
                  </tr>

                  {/* Completion % */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Physical Completion %</div>
                    </td>
                    {comparedProjects.map((p) => {
                      const pct = p.progress_pct ?? (p.status === "COMPLETED" ? 100 : 45);
                      return (
                        <td key={p.id} className="px-5 py-3.5 text-right font-bold text-slate-800 tabular-nums">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span>{pct}%</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-700 bg-slate-50/50">
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

                  {/* Active Lifecycle Stage */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-5 py-3.5 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      <div>Lifecycle Stage</div>
                    </td>
                    {comparedProjects.map((p) => (
                      <td key={p.id} className="px-5 py-3.5 text-right">
                        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                          {p.lifecycle_stage.replace("_", " ")}
                        </span>
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-right text-slate-400 bg-slate-50/50">—</td>
                  </tr>
                </>
              )}
            </tbody>

            {/* Direct Open Project Action Footer */}
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50/60">
                <td className="sticky left-0 z-10 bg-slate-50 px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                  Direct Action
                </td>
                {comparedProjects.map((p) => (
                  <td key={p.id} className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => onOpenWorkspace(p)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span>Open Project</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                ))}
                <td className="px-5 py-3.5 bg-slate-50/60"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
