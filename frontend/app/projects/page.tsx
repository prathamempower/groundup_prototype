"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project, UserRole } from "@/lib/types";
import { getDefaultWorkspaceRoute } from "@/lib/navigation";
import { formatMoney, formatDate } from "@/lib/format";
import {
  Building2,
  Plus,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Landmark,
  Calendar,
  Layers,
  MapPin,
  Briefcase,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { ProjectFinancialComparison } from "@/components/projects/financial-comparison";

export default function ProjectsPortfolioPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"CARD" | "TABLE" | "COMPARE">("CARD");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"ACTIVITY" | "NAME" | "STAGE">("ACTIVITY");

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const user = meData?.data;
  const globalRole = user?.role || "OWNER";
  const projects = useMemo(() => projectsData?.data?.projects || [], [projectsData]);

  // Filter & Search
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          query === "" ||
          p.name.toLowerCase().includes(query);

        const matchesStage =
          stageFilter === "ALL" ||
          (stageFilter === "PRE_CONSTRUCTION" && p.lifecycle_stage === "PRE_CONSTRUCTION") ||
          (stageFilter === "UNDER_CONSTRUCTION" && (p.lifecycle_stage === "UNDER_CONSTRUCTION" || p.lifecycle_stage === "CONSTRUCTION")) ||
          (stageFilter === "POST_CONSTRUCTION" && (p.lifecycle_stage === "POST_CONSTRUCTION" || p.lifecycle_stage === "DISPOSITION")) ||
          (stageFilter === "COMPLETE" && (p.lifecycle_stage === "COMPLETE" || p.lifecycle_stage === "COMPLETION" || p.lifecycle_stage === "CLOSED" || p.status === "COMPLETED"));
        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "HEALTHY" && p.health_status === "HEALTHY") ||
          (statusFilter === "AT_RISK" && p.health_status === "AT_RISK") ||
          (statusFilter === "CRITICAL" && p.health_status === "CRITICAL") ||
          (statusFilter === "ACTIVE" && p.status === "ACTIVE") ||
          (statusFilter === "COMPLETED" && p.status === "COMPLETED");

        return matchesSearch && matchesStage && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "NAME") return a.name.localeCompare(b.name);
        if (sortBy === "STAGE") return a.lifecycle_stage.localeCompare(b.lifecycle_stage);
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      });
  }, [projects, searchQuery, stageFilter, statusFilter, sortBy]);

  const canSeeFinancialSummary = ["OWNER", "CFO"].includes(globalRole);
  const showPortfolioSummary = canSeeFinancialSummary && projects.length >= 2;

  const totalCommitted = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.loan_commitment ? Number(p.loan_commitment) : 0), 0);
  }, [projects]);

  const totalExceptions = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.open_exceptions_count || 0), 0);
  }, [projects]);

  const activeProjectsCount = useMemo(() => {
    return projects.filter((p) => p.status === "ACTIVE").length;
  }, [projects]);

  const getEffectiveRoleOnProject = (project: Project): UserRole => {
    if (project.role_on_project) return project.role_on_project;
    const membership = (user?.project_memberships || []).find((m: any) => m.project_id === project.id);
    return (membership?.role as UserRole) || globalRole;
  };

  const handleOpenWorkspace = (project: Project) => {
    const role = getEffectiveRoleOnProject(project);
    const destination = getDefaultWorkspaceRoute(role, project.id);
    router.push(destination);
  };

  const formatStageLabel = (stage: string) => {
    switch (stage) {
      case "UNDER_CONSTRUCTION":
      case "CONSTRUCTION":
        return "Under Construction";
      case "PRE_CONSTRUCTION":
        return "Pre-Construction";
      case "POST_CONSTRUCTION":
      case "DISPOSITION":
        return "Post-Construction";
      case "COMPLETE":
      case "COMPLETION":
      case "CLOSED":
        return "Complete";
      default:
        return stage
          .toLowerCase()
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
    }
  };

  const getProjectImage = (project: Project) => {
    const nameLower = project.name.toLowerCase();
    const addressLower = (project.address || "").toLowerCase();

    if (nameLower.includes("woodlawn") || addressLower.includes("woodlawn")) {
      return "/projects/woodlawn-new.jpg";
    }
    if (nameLower.includes("first") || addressLower.includes("first")) {
      return "/projects/first-street-new.jpg";
    }
    if (nameLower.includes("broadway") || addressLower.includes("broadway")) {
      return "/projects/broadway-new.jpg";
    }
    return "/projects/broadway-new.jpg";
  };

  const getProjectProgress = (project: Project) => {
    if (project.progress_pct !== undefined) return project.progress_pct;
    if (project.status === "COMPLETED" || project.lifecycle_stage === "CLOSED" || project.lifecycle_stage === "COMPLETE" || project.lifecycle_stage === "COMPLETION") {
      return 100;
    }
    switch (project.lifecycle_stage) {
      case "PRE_CONSTRUCTION":
        return 35;
      case "UNDER_CONSTRUCTION":
      case "CONSTRUCTION":
        return 68;
      case "POST_CONSTRUCTION":
      case "DISPOSITION":
        return 92;
      default:
        return 45;
    }
  };

  const formatCompactProfit = (cents?: number | null) => {
    if (cents === null || cents === undefined) return "—";
    const dollars = cents / 100;
    if (dollars >= 1_000_000) {
      const millions = dollars / 1_000_000;
      return `$${millions.toFixed(2).replace(/\.00$/, "")}M`;
    }
    if (dollars >= 1_000) {
      const thousands = Math.round(dollars / 1_000);
      return `$${thousands}K`;
    }
    return `$${Math.round(dollars)}`;
  };

  const getCardStatusBadge = (project: Project) => {
    if (project.status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </span>
      );
    }
    return null;
  };

  const getTableHealthBadge = (health?: string) => {
    switch (health) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            Critical
          </span>
        );
      case "AT_RISK":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            At Risk
          </span>
        );
      case "HEALTHY":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Healthy
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 min-w-0">
        <div className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-5 sm:py-6 sm:px-6 lg:px-8 space-y-5 sm:space-y-6 min-w-0">
      {/* Clean Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Projects
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {projects.length} active {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>

        {globalRole === "OWNER" && (
          <div className="flex items-center gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create Project</span>
            </Link>
          </div>
        )}
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Stages</option>
            <option value="PRE_CONSTRUCTION">Pre-Construction</option>
            <option value="UNDER_CONSTRUCTION">Under Construction</option>
            <option value="POST_CONSTRUCTION">Post-Construction</option>
            <option value="COMPLETE">Complete</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="HEALTHY">Healthy</option>
            <option value="AT_RISK">At Risk</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {(searchQuery || stageFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStageFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2 py-1 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 self-end sm:self-auto">
          <button
            onClick={() => setViewMode("CARD")}
            aria-label="Card view"
            className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all ${
              viewMode === "CARD"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode("TABLE")}
            aria-label="Table view"
            className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all ${
              viewMode === "TABLE"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
          {canSeeFinancialSummary && (
            <button
              onClick={() => setViewMode("COMPARE")}
              aria-label="Compare financials view"
              className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all ${
                viewMode === "COMPARE"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
              <span>Compare Financials</span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.2 text-[9px] font-bold">
                PRO
              </span>
            </button>
          )}
        </div>
      </div>



      {/* Projects Display */}
      {viewMode === "COMPARE" ? (
        <ProjectFinancialComparison
          projects={filteredProjects.length > 0 ? filteredProjects : projects}
          globalRole={globalRole}
          onOpenWorkspace={handleOpenWorkspace}
        />
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-100">
            <Building2 className="h-6 w-6" />
          </div>
          {projects.length === 0 ? (
            globalRole === "OWNER" ? (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">No projects created yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Create your first development project to begin tracking budgets, draws, reconciliation, and milestones.
                </p>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create project</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-900">No project access yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You haven&apos;t been assigned to any project workspaces yet. Please contact your organization owner to request project membership.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">No matching projects found</h3>
              <p className="text-xs text-slate-500">
                Try adjusting your search query or stage filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStageFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="mt-2 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      ) : viewMode === "CARD" ? (
        /* Clean Professional Architectural Card Grid */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const effectiveRole = getEffectiveRoleOnProject(project);
            const canSeeProfit =
              ["OWNER", "CFO"].includes(effectiveRole) && project.forecast_profit !== undefined;
            const heroImage = getProjectImage(project);
            const progress = getProjectProgress(project);

            return (
              <div
                key={project.id}
                onClick={() => handleOpenWorkspace(project)}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xs cursor-pointer"
              >
                <div>
                  {/* Hero Image Section */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    {heroImage ? (
                      <Image
                        src={heroImage}
                        alt={project.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400">
                        <Building2 className="h-10 w-10 opacity-30" />
                      </div>
                    )}

                    {/* Gradient overlay for clear title readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Top Right Floating Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      {getCardStatusBadge(project)}
                    </div>

                    {/* Bottom Title & Address Overlaid */}
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10">
                      <h3 className="text-base font-bold leading-tight !text-white truncate drop-shadow-md">
                        {project.name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] !text-slate-100 truncate drop-shadow-sm">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-200" />
                        <span className="truncate">{project.address}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3.5">
                    {/* Stage & Role Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {formatStageLabel(project.lifecycle_stage)}
                      </span>
                      <span className="inline-flex items-center rounded border border-blue-100 bg-blue-50/70 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                        Role: {effectiveRole}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                          Progress
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Financial Metrics & Next Milestone */}
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                      <div>
                        <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                          Forecast Profit
                        </div>
                        <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums truncate">
                          {canSeeProfit ? formatCompactProfit(project.forecast_profit) : "—"}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider truncate">
                          Next Milestone
                        </div>
                        <div
                          className="mt-0.5 text-[11px] font-medium text-slate-700 truncate"
                          title={project.next_milestone || "Handover & Final Audit"}
                        >
                          {project.next_milestone || "Handover & Final Audit"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="p-4 pt-0">
                  <div className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 py-2 text-xs font-semibold text-slate-700 transition-colors group-hover:border-slate-300 group-hover:bg-slate-100/80 group-hover:text-slate-900">
                    <span>Open Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-slate-400 group-hover:text-slate-700" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clean SaaS Table View */
        <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-4 py-3.5">Stage</th>
                  <th className="px-4 py-3.5">Your Role</th>
                  <th className="px-4 py-3.5">Health</th>
                  <th className="px-4 py-3.5">Progress</th>
                  {canSeeFinancialSummary && <th className="px-4 py-3.5 text-right">Forecast Profit</th>}
                  <th className="px-4 py-3.5">Next Milestone</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProjects.map((project) => {
                  const effectiveRole = getEffectiveRoleOnProject(project);
                  const canSeeProfit =
                    ["OWNER", "CFO"].includes(effectiveRole) && project.forecast_profit !== undefined;
                  const progress = getProjectProgress(project);

                  return (
                    <tr
                      key={project.id}
                      onClick={() => handleOpenWorkspace(project)}
                      className="transition-colors hover:bg-slate-50/80 cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          {project.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                          {project.address}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {formatStageLabel(project.lifecycle_stage)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-lg border border-blue-100 bg-blue-50/80 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                          {effectiveRole}
                        </span>
                      </td>
                      <td className="px-4 py-4">{getTableHealthBadge(project.health_status)}</td>
                      <td className="px-4 py-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 tabular-nums">
                            {progress}%
                          </span>
                        </div>
                      </td>
                      {canSeeFinancialSummary && (
                        <td className="px-4 py-4 text-right font-extrabold text-slate-900 tabular-nums">
                          {canSeeProfit ? formatMoney(project.forecast_profit || 0) : "—"}
                        </td>
                      )}
                      <td className="px-4 py-4 text-slate-600 truncate max-w-[170px]">
                        {project.next_milestone || "Handover & Final Audit"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700">
                          Open &rarr;
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
