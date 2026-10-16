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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
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

const getHealthInfo = (health?: string) => {
  switch (health) {
    case "HEALTHY":
      return {
        label: "On Track",
        dotColor: "bg-emerald-500",
        badgeClass: "bg-emerald-50/80 text-emerald-800 border-emerald-200/60",
      };
    case "AT_RISK":
      return {
        label: "At Risk",
        dotColor: "bg-amber-500",
        badgeClass: "bg-amber-50/80 text-amber-800 border-amber-200/60",
      };
    case "CRITICAL":
    default:
      return {
        label: "Critical",
        dotColor: "bg-rose-500",
        badgeClass: "bg-rose-50/80 text-rose-800 border-rose-200/60",
      };
  }
};

const getStageLabel = (stage?: string) => {
  if (!stage) return "Planning";
  const s = stage.toLowerCase();
  if (s.includes("conception") || s.includes("design")) return "Design & Planning";
  if (s.includes("pre_con") || s.includes("pre_construction")) return "Pre-Construction";
  if (s.includes("construction") || s.includes("active")) return "Active Construction";
  if (s.includes("completion") || s.includes("closeout")) return "Closeout & TCO";
  if (s.includes("acquisition")) return "Acquisition Diligence";
  return stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

  const [activeTab, setActiveTab] = useState<TabDimension>("ALL");
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    PROFITABILITY: true,
    CAPITAL: true,
    HEALTH: true,
  });
  const [showChart, setShowChart] = useState(true);
  const [projectSearch, setProjectSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [activeMobileProjectIndex, setActiveMobileProjectIndex] = useState(0);
  const [compareViewMode, setCompareViewMode] = useState<"SCORECARDS" | "MATRIX">("SCORECARDS");

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

  // Proportional benchmarking maximums for sparkline bars
  const maxProfit = useMemo(() => {
    return Math.max(
      ...comparedProjects.map((p) => {
        const econ = economicsMap.get(p.id);
        return toNum(econ?.net_profit) || p.forecast_profit || 0;
      }),
      1
    );
  }, [comparedProjects, economicsMap]);

  const maxMargin = useMemo(() => {
    return Math.max(
      ...comparedProjects.map((p) => {
        const econ = economicsMap.get(p.id);
        const gdv =
          toNum(econ?.gross_development_value) ||
          (p.forecast_profit ? p.forecast_profit + toNum(p.loan_commitment) : 1);
        const profit = toNum(econ?.net_profit) || p.forecast_profit || 0;
        return gdv > 0 ? (profit / gdv) * 100 : 0;
      }),
      1
    );
  }, [comparedProjects, economicsMap]);

  const maxDebtDrawn = useMemo(() => {
    return Math.max(
      ...comparedProjects.map((p) => {
        const econ = economicsMap.get(p.id);
        return toNum(econ?.senior_debt_drawn) || 1;
      }),
      1
    );
  }, [comparedProjects, economicsMap]);

  const healthStats = useMemo(() => {
    let healthy = 0;
    let atRisk = 0;
    let critical = 0;
    let progressSum = 0;

    comparedProjects.forEach((p) => {
      const h = p.health_status || "HEALTHY";
      if (h === "HEALTHY") healthy++;
      else if (h === "AT_RISK") atRisk++;
      else critical++;

      progressSum += p.progress_pct ?? (p.status === "COMPLETED" ? 100 : 45);
    });

    const avgProgress =
      comparedProjects.length > 0
        ? Math.round(progressSum / comparedProjects.length)
        : 0;
    return { healthy, atRisk, critical, avgProgress };
  }, [comparedProjects]);

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

  // CSV Export - Safe Blob download without triggering router navigation
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
    link.setAttribute("download", `GroundUp_Financial_Comparison_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.display = "none";
    link.addEventListener("click", (e) => e.stopPropagation());
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
                type="button"
                onClick={selectTop4}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                title="Select first 4 projects for clean standard comparison"
              >
                Top 4
              </button>
            )}
            {selectedIds.length < projects.length ? (
              <button
                type="button"
                onClick={selectAll}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Select All ({projects.length})
              </button>
            ) : (
              <button
                type="button"
                onClick={clearNonFirst}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Reset
              </button>
            )}
            <button
              type="button"
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
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleExportCSV();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
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
      {/* 4. Interactive Comparative Ledger (Apple-Inspired Executive Multi-Project Deck) */}
      <div className="space-y-4">
        {/* Ledger Control Center Header */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Executive Comparative Ledger
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[11px] font-bold border border-slate-200">
                  {comparedProjects.length} Projects Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Synchronized cross-project benchmarking across profit returns, capital debt facilities, and physical milestone execution.
              </p>
            </div>

            {/* Segmented Dimension Filter Tabs */}
            <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold border border-slate-200/70 overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("ALL");
                  setExpandedGroups({ PROFITABILITY: true, CAPITAL: true, HEALTH: true });
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "ALL"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>All Metrics</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("PROFITABILITY");
                  setExpandedGroups((prev) => ({ ...prev, PROFITABILITY: true }));
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "PROFITABILITY"
                    ? "bg-white text-emerald-800 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                <span>Profitability &amp; Returns</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("CAPITAL");
                  setExpandedGroups((prev) => ({ ...prev, CAPITAL: true }));
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "CAPITAL"
                    ? "bg-white text-amber-800 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Wallet className="h-3.5 w-3.5 text-amber-600" />
                <span>Capital Stack &amp; Loans</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("HEALTH");
                  setExpandedGroups((prev) => ({ ...prev, HEALTH: true }));
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "HEALTH"
                    ? "bg-white text-blue-800 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Activity className="h-3.5 w-3.5 text-blue-600" />
                <span>Project Health &amp; Progress</span>
              </button>
            </div>
          </div>

          {/* Synchronized Project Quick Legend */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Hover to focus:
              </span>
              {comparedProjects.map((p) => {
                const isHovered = hoveredProjectId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onMouseEnter={() => setHoveredProjectId(p.id)}
                    onMouseLeave={() => setHoveredProjectId(null)}
                    onClick={() => onOpenWorkspace(p)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isHovered
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                    }`}
                  >
                    <span className="truncate max-w-[130px]">{p.name}</span>
                    <ArrowRight className={`h-3 w-3 ${isHovered ? "text-white" : "text-slate-400"}`} />
                  </button>
                );
              })}
            </div>

            {activeTab === "ALL" && (
              <button
                type="button"
                onClick={() => {
                  const allExpanded = Object.values(expandedGroups).every(Boolean);
                  setExpandedGroups({
                    PROFITABILITY: !allExpanded,
                    CAPITAL: !allExpanded,
                    HEALTH: !allExpanded,
                  });
                }}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                {Object.values(expandedGroups).every(Boolean) ? "Collapse All Groups" : "Expand All Groups"}
              </button>
            )}
          </div>
        </div>

        {/* Dimension 1: Profitability & Returns Ledger */}
        {(activeTab === "ALL" || activeTab === "PROFITABILITY") && (
          <div className="rounded-2xl border border-emerald-200/80 bg-white shadow-2xs overflow-hidden transition-all">
            {/* Dimension Card Header */}
            <div
              onClick={() =>
                setExpandedGroups((prev) => ({
                  ...prev,
                  PROFITABILITY: !prev.PROFITABILITY,
                }))
              }
              className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/70 via-white to-white border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-emerald-50/90 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-2xs shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      Profitability &amp; Returns
                    </h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                      <Sparkles className="h-3 w-3 text-emerald-700" />
                      Yield Benchmark
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Net profit forecast, gross development value (GDV) margins, and return on invested development capital.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="hidden md:flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800 tabular-nums">
                    Combined Margin: {aggregatedStats.portfolioMarginPct.toFixed(1)}%
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 tabular-nums">
                    Combined Profit: {formatMoney(aggregatedStats.totalProfit)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 tabular-nums">
                    Avg ROC: {aggregatedStats.avgROC.toFixed(1)}%
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label={expandedGroups.PROFITABILITY ? "Collapse group" : "Expand group"}
                >
                  {expandedGroups.PROFITABILITY ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Dimension Rows */}
            {expandedGroups.PROFITABILITY && (
              <div className="p-4 sm:p-5 space-y-3">
                {comparedProjects.map((p) => {
                  const econ = economicsMap.get(p.id);
                  const gdv =
                    toNum(econ?.gross_development_value) ||
                    (p.forecast_profit ? p.forecast_profit + toNum(p.loan_commitment) : 0);
                  const cost = toNum(econ?.total_cost) || toNum(p.loan_commitment);
                  const profit = toNum(econ?.net_profit) || p.forecast_profit || 0;
                  const margin = gdv > 0 ? (profit / gdv) * 100 : 0;
                  const roc =
                    econ?.return_on_cost_pct ?? (cost > 0 ? (profit / cost) * 100 : 0);
                  const isLeader = insights?.bestMarginProj?.project.id === p.id;
                  const isHovered = hoveredProjectId === p.id;
                  const deltaMargin = margin - aggregatedStats.portfolioMarginPct;
                  const profitBarWidth = Math.max(10, Math.round((profit / maxProfit) * 100));

                  const stageLabel = p.lifecycle_stage.toLowerCase().includes("conception")
                    ? "Design & Planning"
                    : p.lifecycle_stage.replace(/_/g, " ");

                  return (
                    <div
                      key={p.id}
                      onMouseEnter={() => setHoveredProjectId(p.id)}
                      onMouseLeave={() => setHoveredProjectId(null)}
                      onClick={() => onOpenWorkspace(p)}
                      className={`group p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                        isHovered
                          ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/30 shadow-xs"
                          : hoveredProjectId
                          ? "opacity-75 border-slate-200/70 bg-white"
                          : "border-slate-200/80 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Project Identity */}
                        <div className="flex items-center gap-3 min-w-[220px] max-w-sm">
                          <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={getProjectThumbnail(p)}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-900 transition-colors">
                                {p.name}
                              </h5>
                              {isLeader && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold shrink-0">
                                  <Award className="h-2.5 w-2.5" />
                                  Top Margin
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                              <span className="capitalize text-slate-600 font-medium">
                                {stageLabel}
                              </span>
                              <span>•</span>
                              <span className="truncate">{p.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Proportional Benchmark Sparkline Bar */}
                        <div className="flex-1 max-w-md w-full py-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span className="text-slate-500">Profit Distribution</span>
                            <span className="tabular-nums font-bold text-slate-800">
                              {formatMoney(profit)}
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                              style={{ width: `${profitBarWidth}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span>Cost: {formatMoney(cost)}</span>
                            <span>GDV: {formatMoney(gdv)}</span>
                          </div>
                        </div>

                        {/* Key Metrics Chips & Action */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-bold text-emerald-800 tabular-nums">
                              {margin.toFixed(1)}% Margin
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                              {deltaMargin >= 0 ? `+${deltaMargin.toFixed(1)}%` : `${deltaMargin.toFixed(1)}%`} vs avg
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 tabular-nums">
                              {roc.toFixed(1)}% ROC
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Return on Cost
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenWorkspace(p);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 group-hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors shrink-0 cursor-pointer"
                          >
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Dimension 2: Capital Stack & Debt Facilities Ledger */}
        {(activeTab === "ALL" || activeTab === "CAPITAL") && (
          <div className="rounded-2xl border border-amber-200/80 bg-white shadow-2xs overflow-hidden transition-all">
            {/* Dimension Card Header */}
            <div
              onClick={() =>
                setExpandedGroups((prev) => ({
                  ...prev,
                  CAPITAL: !prev.CAPITAL,
                }))
              }
              className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/70 via-white to-white border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-amber-50/90 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-2xs shrink-0">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      Capital Stack &amp; Loans
                    </h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                      <Sparkles className="h-3 w-3 text-amber-700" />
                      Senior Debt Facility
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Senior debt draws, facility commitments, loan-to-cost (LTC) leverage, and forecast equity multiples.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="hidden md:flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800 tabular-nums">
                    Total Drawn: {formatMoney(aggregatedStats.totalDebtDrawn)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 tabular-nums">
                    Total Facility: {formatMoney(aggregatedStats.totalDebtFacility)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 tabular-nums">
                    Funded: {aggregatedStats.portfolioLeveragePct.toFixed(1)}% of Cost
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label={expandedGroups.CAPITAL ? "Collapse group" : "Expand group"}
                >
                  {expandedGroups.CAPITAL ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Dimension Rows */}
            {expandedGroups.CAPITAL && (
              <div className="p-4 sm:p-5 space-y-3">
                {comparedProjects.map((p) => {
                  const econ = economicsMap.get(p.id);
                  const cost = toNum(econ?.total_cost) || toNum(p.loan_commitment);
                  const commitment =
                    toNum(p.loan_commitment) || toNum(econ?.senior_debt_balance);
                  const debtDrawn = toNum(econ?.senior_debt_drawn);
                  const ltc = cost > 0 ? (debtDrawn / cost) * 100 : 0;
                  const debtDrawnPct =
                    commitment > 0 ? Math.min(100, (debtDrawn / commitment) * 100) : 0;
                  const em = econ?.equity_multiple ?? 1.85;
                  const isHovered = hoveredProjectId === p.id;
                  const drawnBarWidth = Math.max(8, Math.round(debtDrawnPct));

                  const stageLabel = p.lifecycle_stage.toLowerCase().includes("conception")
                    ? "Design & Planning"
                    : p.lifecycle_stage.replace(/_/g, " ");

                  return (
                    <div
                      key={p.id}
                      onMouseEnter={() => setHoveredProjectId(p.id)}
                      onMouseLeave={() => setHoveredProjectId(null)}
                      onClick={() => onOpenWorkspace(p)}
                      className={`group p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                        isHovered
                          ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30 shadow-xs"
                          : hoveredProjectId
                          ? "opacity-75 border-slate-200/70 bg-white"
                          : "border-slate-200/80 bg-white hover:border-amber-200 hover:bg-amber-50/30"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Project Identity */}
                        <div className="flex items-center gap-3 min-w-[220px] max-w-sm">
                          <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={getProjectThumbnail(p)}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-900 transition-colors">
                              {p.name}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                              <span className="capitalize text-slate-600 font-medium">
                                {stageLabel}
                              </span>
                              <span>•</span>
                              <span className="truncate">Facility: {formatMoney(commitment)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Proportional Draw Sparkline Bar */}
                        <div className="flex-1 max-w-md w-full py-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span className="text-slate-500">Facility Draw Status</span>
                            <span className="tabular-nums font-bold text-amber-900">
                              {formatMoney(debtDrawn)} ({debtDrawnPct.toFixed(0)}% Drawn)
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                              style={{ width: `${drawnBarWidth}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span>Available: {formatMoney(Math.max(0, commitment - debtDrawn))}</span>
                            <span>Total Facility: {formatMoney(commitment)}</span>
                          </div>
                        </div>

                        {/* Key Metrics Chips & Action */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-bold text-amber-800 tabular-nums">
                              {ltc.toFixed(1)}% LTC
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Loan-to-Cost
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 tabular-nums">
                              {em.toFixed(2)}x EM
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Target Multiple
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenWorkspace(p);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 group-hover:bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors shrink-0 cursor-pointer"
                          >
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Dimension 3: Project Health & Milestones Ledger */}
        {(activeTab === "ALL" || activeTab === "HEALTH") && (
          <div className="rounded-2xl border border-blue-200/80 bg-white shadow-2xs overflow-hidden transition-all">
            {/* Dimension Card Header */}
            <div
              onClick={() =>
                setExpandedGroups((prev) => ({
                  ...prev,
                  HEALTH: !prev.HEALTH,
                }))
              }
              className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/70 via-white to-white border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-blue-50/90 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-2xs shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      Project Health &amp; Progress
                    </h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                      <Sparkles className="h-3 w-3 text-blue-700" />
                      Physical Site Milestones
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Municipal inspections, architectural physical completion, and jurisdictional milestone clearance.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="hidden md:flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800 tabular-nums">
                    Healthy: {healthStats.healthy}
                  </span>
                  {healthStats.atRisk > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800 tabular-nums">
                      At Risk: {healthStats.atRisk}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 tabular-nums">
                    Avg Completion: {healthStats.avgProgress}%
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label={expandedGroups.HEALTH ? "Collapse group" : "Expand group"}
                >
                  {expandedGroups.HEALTH ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Dimension Rows */}
            {expandedGroups.HEALTH && (
              <div className="p-4 sm:p-5 space-y-3">
                {comparedProjects.map((p) => {
                  const progress = p.progress_pct ?? (p.status === "COMPLETED" ? 100 : 45);
                  const health = p.health_status || "HEALTHY";
                  const isHovered = hoveredProjectId === p.id;
                  const progressBarWidth = Math.max(6, Math.min(100, progress));

                  const stageLabel = p.lifecycle_stage.toLowerCase().includes("conception")
                    ? "Design & Planning"
                    : p.lifecycle_stage.replace(/_/g, " ");

                  const nextMilestone =
                    p.status === "COMPLETED"
                      ? "Handover & Investor Waterfall"
                      : p.lifecycle_stage === "PRE_CONSTRUCTION"
                      ? "Site Clearing & Soil Permitting"
                      : "Structural Steel & Framing";

                  return (
                    <div
                      key={p.id}
                      onMouseEnter={() => setHoveredProjectId(p.id)}
                      onMouseLeave={() => setHoveredProjectId(null)}
                      onClick={() => onOpenWorkspace(p)}
                      className={`group p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                        isHovered
                          ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/30 shadow-xs"
                          : hoveredProjectId
                          ? "opacity-75 border-slate-200/70 bg-white"
                          : "border-slate-200/80 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Project Identity */}
                        <div className="flex items-center gap-3 min-w-[220px] max-w-sm">
                          <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={getProjectThumbnail(p)}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-900 transition-colors">
                                {p.name}
                              </h5>
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
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                              <span className="capitalize text-slate-600 font-medium">
                                {stageLabel}
                              </span>
                              <span>•</span>
                              <span className="truncate">{p.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Proportional Completion Progress Bar */}
                        <div className="flex-1 max-w-md w-full py-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span className="text-slate-500">Physical Site Progress</span>
                            <span className="tabular-nums font-bold text-blue-900">
                              {progress}% Complete
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                              style={{ width: `${progressBarWidth}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span className="truncate">Active Milestone: {nextMilestone}</span>
                          </div>
                        </div>

                        {/* Key Metrics Chips & Action */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200/80 px-2.5 py-1 text-xs font-bold text-blue-800 tabular-nums">
                              {progress}% Physical
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Certified Completion
                            </div>
                          </div>

                          <div className="text-right max-w-[160px]">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 truncate">
                              {nextMilestone}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Next Milestone
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenWorkspace(p);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 group-hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors shrink-0 cursor-pointer"
                          >
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
