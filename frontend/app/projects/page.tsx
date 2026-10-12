"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  Sparkles,
} from "lucide-react";

export default function ProjectsPortfolioPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"CARD" | "TABLE">("CARD");
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
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          (p.project_entity && p.project_entity.toLowerCase().includes(query));

        const matchesStage = stageFilter === "ALL" || p.lifecycle_stage === stageFilter;
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
    const membership = (user?.project_memberships || []).find((m) => m.project_id === project.id);
    return (membership?.role as UserRole) || globalRole;
  };

  const handleOpenWorkspace = (project: Project) => {
    const role = getEffectiveRoleOnProject(project);
    const destination = getDefaultWorkspaceRoute(role, project.id);
    router.push(destination);
  };

  const formatStageLabel = (stage: string) => {
    return stage
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getHealthBadge = (health?: string) => {
    switch (health) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/80 px-2.5 py-0.5 text-xs font-medium text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Critical
          </span>
        );
      case "AT_RISK":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            At Risk
          </span>
        );
      case "HEALTHY":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Healthy
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 space-y-6">
        <div className="h-20 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs">
              <Layers className="h-3 w-3 text-blue-600" />
              Portfolio
            </span>
            <span className="text-xs text-slate-500">
              {projects.length} accessible project{projects.length === 1 ? "" : "s"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Project Portfolio
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Select a project to enter its dedicated, isolated financial and operational workspace.
          </p>
        </div>

        {globalRole === "OWNER" && (
          <div className="flex items-center gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 active:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create project</span>
            </Link>
          </div>
        )}
      </div>

      {/* High-Level Overview Metrics (Owners / CFOs with 2+ projects) */}
      {showPortfolioSummary && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-shadow hover:shadow-xs">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Active Projects</span>
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {activeProjectsCount}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                of {projects.length} total
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-shadow hover:shadow-xs">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Total Loan Commitment</span>
              <Landmark className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatMoney(totalCommitted)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-shadow hover:shadow-xs">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Notifications</span>
              <Bell className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold tracking-tight ${
                  totalExceptions > 0 ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {totalExceptions}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                action items across projects
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, address, entity…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs transition-colors hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 cursor-pointer"
          >
            <option value="ALL">All Stages</option>
            <option value="ACQUISITION">Acquisition</option>
            <option value="PRE_CONSTRUCTION">Pre-Construction</option>
            <option value="CONSTRUCTION">Construction</option>
            <option value="COMPLETION">Completion</option>
            <option value="DISPOSITION">Disposition</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="HEALTHY">Healthy</option>
            <option value="AT_RISK">At Risk</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 shadow-2xs self-end sm:self-auto">
          <button
            onClick={() => setViewMode("CARD")}
            aria-label="Card view"
            title="Card view"
            className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all ${
              viewMode === "CARD"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setViewMode("TABLE")}
            aria-label="Table view"
            title="Table view"
            className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all ${
              viewMode === "TABLE"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Projects List / Cards */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-100">
            <Building2 className="h-6 w-6" />
          </div>
          {projects.length === 0 ? (
            globalRole === "OWNER" ? (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">No projects created yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Create your first development project to begin tracking budgets, draws, reconciliation, and construction milestones.
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
        /* Modern Clean SaaS Card Grid */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const effectiveRole = getEffectiveRoleOnProject(project);
            const canSeeProfit =
              ["OWNER", "CFO"].includes(effectiveRole) && project.forecast_profit !== undefined;

            return (
              <div
                key={project.id}
                onClick={() => handleOpenWorkspace(project)}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm cursor-pointer"
              >
                <div>
                  {/* Card Top: Title, Address & Health Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-600 truncate">
                        {project.name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 truncate">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{project.address}</span>
                      </p>
                    </div>
                    {getHealthBadge(project.health_status)}
                  </div>

                  {/* Badges: Stage, Role, Status */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50/70 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {formatStageLabel(project.lifecycle_stage)}
                    </span>
                    <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      Role: <strong className="ml-1 text-slate-800">{effectiveRole}</strong>
                    </span>
                    {project.status === "COMPLETED" && (
                      <span className="inline-flex items-center rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Financial & Operational Metrics */}
                  <div className="mt-4 space-y-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs">
                    {canSeeProfit && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Forecast Profit</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {formatMoney(project.forecast_profit || 0)}
                        </span>
                      </div>
                    )}

                    {project.loan_commitment && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Loan Commitment</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {formatMoney(project.loan_commitment)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Notifications</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          (project.open_exceptions_count || 0) > 0
                            ? "text-amber-600"
                            : "text-slate-500"
                        }`}
                      >
                        {project.open_exceptions_count || 0} {(project.open_exceptions_count || 0) === 1 ? "item" : "items"}
                      </span>
                    </div>

                    {project.next_milestone && (
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-slate-500">Next Milestone</span>
                        <span className="font-medium text-slate-800 truncate max-w-[170px]" title={project.next_milestone}>
                          {project.next_milestone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Last Activity & Open Workspace */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs text-slate-500">
                  <span className="text-[11px]">
                    {project.last_activity
                      ? `Active ${formatDate(project.last_activity)}`
                      : `Created ${formatDate(project.created_at)}`}
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-blue-600 transition-transform group-hover:translate-x-0.5">
                    <span>Open workspace</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clean SaaS Table View */
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-slate-200/80 bg-slate-50/75 font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Your Role</th>
                  <th className="px-4 py-3">Health</th>
                  {canSeeFinancialSummary && <th className="px-4 py-3 text-right">Forecast Profit</th>}
                  <th className="px-4 py-3 text-center">Notifications</th>
                  <th className="px-4 py-3">Next Milestone</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProjects.map((project) => {
                  const effectiveRole = getEffectiveRoleOnProject(project);
                  const canSeeProfit =
                    ["OWNER", "CFO"].includes(effectiveRole) && project.forecast_profit !== undefined;

                  return (
                    <tr
                      key={project.id}
                      onClick={() => handleOpenWorkspace(project)}
                      className="transition-colors hover:bg-slate-50/60 cursor-pointer"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                          {project.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                          {project.address}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-md border border-blue-100 bg-blue-50/70 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                          {formatStageLabel(project.lifecycle_stage)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {effectiveRole}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{getHealthBadge(project.health_status)}</td>
                      {canSeeFinancialSummary && (
                        <td className="px-4 py-3.5 text-right font-medium text-slate-900 tabular-nums">
                          {canSeeProfit ? formatMoney(project.forecast_profit || 0) : "—"}
                        </td>
                      )}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`font-semibold tabular-nums ${
                            (project.open_exceptions_count || 0) > 0 ? "text-amber-600" : "text-slate-400"
                          }`}
                        >
                          {project.open_exceptions_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 truncate max-w-[160px]">
                        {project.next_milestone || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700">
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
