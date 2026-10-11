"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project, UserRole } from "@/lib/types";
import { getDefaultWorkspaceRoute } from "@/lib/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { formatMoney, formatDate } from "@/lib/format";
import {
  Building2,
  Plus,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Landmark,
  CalendarDays,
  ExternalLink,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProjectsPortfolioPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"CARD" | "TABLE">("CARD");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"NAME" | "STAGE" | "ACTIVITY">("ACTIVITY");

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
  const projects = projectsData?.data?.projects || [];

  // Filter & Search
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.project_entity && p.project_entity.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStage = stageFilter === "ALL" || p.lifecycle_stage === stageFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "HEALTHY" && p.health_status === "HEALTHY") ||
        (statusFilter === "AT_RISK" && p.health_status === "AT_RISK") ||
        (statusFilter === "CRITICAL" && p.health_status === "CRITICAL") ||
        (statusFilter === "ACTIVE" && p.status === "ACTIVE") ||
        (statusFilter === "COMPLETED" && p.status === "COMPLETED");

      return matchesSearch && matchesStage && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === "NAME") return a.name.localeCompare(b.name);
      if (sortBy === "STAGE") return a.lifecycle_stage.localeCompare(b.lifecycle_stage);
      // Default to activity / created date
      return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
    });
  }, [projects, searchQuery, stageFilter, statusFilter, sortBy]);

  // Portfolio summary calculation for Owners/CFOs with 2+ projects
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

  const getHealthBadge = (health?: string) => {
    switch (health) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-danger-subtle px-2 py-0.5 text-[11px] font-semibold text-danger">
            <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
            Critical
          </span>
        );
      case "AT_RISK":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2 py-0.5 text-[11px] font-semibold text-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            At Risk
          </span>
        );
      case "HEALTHY":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 text-[11px] font-semibold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Healthy
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-24 bg-subtle animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-subtle animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Portfolio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-primary-subtle px-2 py-0.5 text-caption font-semibold text-primary">
              Multi-Project Portfolio
            </span>
            <span className="text-caption text-text-muted">
              {projects.length} accessible project{projects.length === 1 ? "" : "s"}
            </span>
          </div>
          <h1 className="text-display font-bold tracking-tight text-text-primary">
            Project Portfolio
          </h1>
          <p className="text-body text-text-secondary mt-0.5">
            Select a project to enter its dedicated, isolated workspace.
          </p>
        </div>

        {globalRole === "OWNER" && (
          <div className="flex items-center gap-3">
            <Link href="/projects/new">
                  <Button variant="primary" size="default">
                <Plus className="mr-1.5 h-4 w-4" />
                Create project
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Owner/CFO Portfolio Summary Row (when 2+ projects) */}
      {showPortfolioSummary && (
        <div className="rounded-lg border border-border bg-surface p-4 shadow-xs">
          <div className="text-caption font-semibold uppercase tracking-wider text-text-muted mb-3">
            Portfolio Overview
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="px-2">
              <span className="text-caption text-text-muted">Active Projects</span>
              <div className="text-title font-bold text-text-primary mt-0.5">
                {activeProjectsCount}{" "}
                <span className="text-caption font-normal text-text-muted">
                  of {projects.length} total
                </span>
              </div>
            </div>
            <div className="px-2 sm:pl-4">
              <span className="text-caption text-text-muted">Total Loan Commitment</span>
              <div className="text-title font-bold text-text-primary mt-0.5">
                {formatMoney(totalCommitted)}
              </div>
            </div>
            <div className="px-2 sm:pl-4">
              <span className="text-caption text-text-muted">Open Exceptions Across Projects</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-title font-bold ${totalExceptions > 0 ? "text-warning" : "text-success"}`}>
                  {totalExceptions}
                </span>
                <span className="text-caption text-text-muted">action items pending</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input
              type="text"
              placeholder="Search projects by name, address, entity…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-surface px-3 py-1 text-body text-text-primary focus:outline-primary"
          >
            <option value="ALL">All Stages</option>
            <option value="ACQUISITION">Acquisition</option>
            <option value="PRE_CONSTRUCTION">Pre-Construction</option>
            <option value="CONSTRUCTION">Construction</option>
            <option value="COMPLETION">Completion</option>
            <option value="DISPOSITION">Disposition</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-surface px-3 py-1 text-body text-text-primary focus:outline-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="HEALTHY">Healthy</option>
            <option value="AT_RISK">At Risk</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 self-end md:self-auto">
          <button
            onClick={() => setViewMode("CARD")}
            className={`p-1.5 rounded-md border transition-colors ${
              viewMode === "CARD"
                ? "bg-primary text-white border-primary"
                : "bg-surface text-text-secondary border-border hover:bg-subtle"
            }`}
            aria-label="Card view"
            title="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("TABLE")}
            className={`p-1.5 rounded-md border transition-colors ${
              viewMode === "TABLE"
                ? "bg-primary text-white border-primary"
                : "bg-surface text-text-secondary border-border hover:bg-subtle"
            }`}
            aria-label="Table view"
            title="Table view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Projects Presentation */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-text-muted mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          {projects.length === 0 ? (
            globalRole === "OWNER" ? (
              <div className="space-y-3">
                <h3 className="text-title font-semibold text-text-primary">No projects created yet</h3>
                <p className="text-body text-text-secondary max-w-md mx-auto">
                  Create your first development project to begin tracking budgets, draws, reconciliation, and construction milestones.
                </p>
                <Link href="/projects/new">
                      <Button variant="primary" size="default">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-title font-semibold text-text-primary">No project access yet</h3>
                <p className="text-body text-text-secondary max-w-md mx-auto">
                  You haven&apos;t been assigned to any project workspaces yet. Please contact your organization owner to request project membership.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-2">
              <h3 className="text-title font-semibold text-text-primary">No matching projects found</h3>
              <p className="text-body text-text-secondary">
                Try adjusting your search criteria or stage filters.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStageFilter("ALL");
                  setStatusFilter("ALL");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      ) : viewMode === "CARD" ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const effectiveRole = getEffectiveRoleOnProject(project);
            const canSeeProfit = ["OWNER", "CFO"].includes(effectiveRole) && project.forecast_profit !== undefined;

            return (
              <div
                key={project.id}
                onClick={() => handleOpenWorkspace(project)}
                className="group relative flex flex-col justify-between rounded-lg border border-border bg-surface p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-title font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="text-caption text-text-muted truncate mt-0.5">
                        {project.address}
                      </p>
                    </div>
                    {getHealthBadge(project.health_status)}
                  </div>

                  {/* Badges: Stage & Role */}
                  <div className="flex flex-wrap items-center gap-1.5 my-3">
                    <span className="rounded bg-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {project.lifecycle_stage.replace("_", " ")}
                    </span>
                    <span className="rounded bg-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                      Your role: <strong className="text-text-primary">{effectiveRole}</strong>
                    </span>
                    {project.status === "COMPLETED" && (
                      <span className="rounded bg-success-subtle px-2 py-0.5 text-[11px] font-semibold text-success">
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Metrics Section */}
                  <div className="space-y-2 border-t border-border pt-3 text-body">
                    {canSeeProfit && (
                      <div className="flex items-center justify-between">
                        <span className="text-caption text-text-muted">Forecast Profit:</span>
                        <span className="font-semibold text-text-primary">
                          {formatMoney(project.forecast_profit || 0)}
                        </span>
                      </div>
                    )}

                    {project.loan_commitment && (
                      <div className="flex items-center justify-between">
                        <span className="text-caption text-text-muted">Loan Commitment:</span>
                        <span className="font-semibold text-text-primary">
                          {formatMoney(project.loan_commitment)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-caption text-text-muted">Open Exceptions:</span>
                      <span
                        className={`text-caption font-semibold ${
                          (project.open_exceptions_count || 0) > 0 ? "text-warning" : "text-text-muted"
                        }`}
                      >
                        {project.open_exceptions_count || 0} items
                      </span>
                    </div>

                    {project.next_milestone && (
                      <div className="flex items-center justify-between text-caption">
                        <span className="text-text-muted">Next Milestone:</span>
                        <span className="font-medium text-text-primary truncate max-w-[150px]">
                          {project.next_milestone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer / CTA */}
                <div className="mt-4 border-t border-border pt-3 flex items-center justify-between text-caption text-text-muted">
                  <span>
                    Last activity:{" "}
                    {project.last_activity
                      ? formatDate(project.last_activity)
                      : formatDate(project.created_at)}
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>Open workspace</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-body">
              <thead className="border-b border-border bg-subtle/50 text-caption font-semibold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-4 py-3">Project Name & Address</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Your Role</th>
                  <th className="px-4 py-3">Health</th>
                  {canSeeFinancialSummary && <th className="px-4 py-3 text-right">Forecast Profit</th>}
                  <th className="px-4 py-3 text-center">Open Exceptions</th>
                  <th className="px-4 py-3">Next Milestone</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.map((project) => {
                  const effectiveRole = getEffectiveRoleOnProject(project);
                  const canSeeProfit = ["OWNER", "CFO"].includes(effectiveRole) && project.forecast_profit !== undefined;

                  return (
                    <tr
                      key={project.id}
                      onClick={() => handleOpenWorkspace(project)}
                      className="hover:bg-subtle/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-text-primary hover:text-primary transition-colors">
                          {project.name}
                        </div>
                        <div className="text-caption text-text-muted truncate max-w-xs">
                          {project.address}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {project.lifecycle_stage.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-subtle px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                          {effectiveRole}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getHealthBadge(project.health_status)}</td>
                      {canSeeFinancialSummary && (
                        <td className="px-4 py-3 text-right font-medium text-text-primary">
                          {canSeeProfit ? formatMoney(project.forecast_profit || 0) : "—"}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-semibold text-caption ${
                            (project.open_exceptions_count || 0) > 0 ? "text-warning" : "text-text-muted"
                          }`}
                        >
                          {project.open_exceptions_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-caption text-text-secondary truncate max-w-[160px]">
                        {project.next_milestone || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenWorkspace(project);
                          }}
                        >
                          Open &rarr;
                        </Button>
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
