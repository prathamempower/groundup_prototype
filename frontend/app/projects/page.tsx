"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Trash2,
  Loader2,
} from "lucide-react";

const DEFAULT_GLOBAL_ROLE: UserRole = "OWNER";

export default function ProjectsPortfolioPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"CARD" | "TABLE">("CARD");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"ACTIVITY" | "NAME" | "STAGE">("ACTIVITY");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => api.projects.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setProjectToDelete(null);
      setDeleteConfirmationInput("");
    },
  });

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const user = meData?.data;
  const globalRole: UserRole = "OWNER";
  const projects = useMemo(() => {
    const list = projectsData?.data?.projects || [];
    const seen = new Set<string>();
    return list.filter((p: Project) => {
      const key = (p.name || "").trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      // Filter out stale generic onboarding draft leftovers
      if (
        (key === "new development project" || key === "first development asset") &&
        !p.is_user_created
      ) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [projectsData]);

  const formatStageLabel = (stage?: string, phase?: string): string => {
    const raw = (phase || stage || "").toLowerCase();
    if (!raw) return "Active Project Construction";
    if (raw.includes("pre_acq") || raw.includes("pre-acq") || raw.includes("preacq") || raw.includes("pre acq")) {
      return "Pre Acquisition";
    }
    if (raw.includes("acquisition") || (raw.includes("acq") && !raw.includes("pre"))) {
      return "Acquisition";
    }
    if (raw.includes("permit") || raw.includes("conception") || raw.includes("design") || raw.includes("planning") || raw.includes("pre_con") || raw.includes("pre-con") || raw.includes("pre_construction")) {
      return "Permitting";
    }
    if (raw.includes("post") || raw.includes("disposition") || raw.includes("complete") || raw.includes("closed") || raw.includes("completion")) {
      return "Post construction";
    }
    if (raw.includes("under_con") || raw.includes("active_con") || raw.includes("construction") || raw === "active") {
      return "Active Project Construction";
    }
    return raw
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Filter & Search
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          query === "" ||
          p.name.toLowerCase().includes(query);

        const projectStage = formatStageLabel(p.lifecycle_stage, p.phase);

        const matchesStage =
          stageFilter === "ALL" ||
          (stageFilter === "PRE_ACQUISITION" && projectStage === "Pre Acquisition") ||
          (stageFilter === "ACQUISITION" && projectStage === "Acquisition") ||
          (stageFilter === "PERMITTING" && projectStage === "Permitting") ||
          (stageFilter === "ACTIVE_CONSTRUCTION" && projectStage === "Active Project Construction") ||
          (stageFilter === "POST_CONSTRUCTION" && projectStage === "Post construction");

        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "HEALTHY" && p.health_status === "HEALTHY") ||
          (statusFilter === "AT_RISK" && p.health_status === "AT_RISK") ||
          (statusFilter === "ACTIVE" && p.status === "ACTIVE") ||
          (statusFilter === "COMPLETED" && p.status === "COMPLETED");

        return matchesSearch && matchesStage && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "NAME") return a.name.localeCompare(b.name);
        if (sortBy === "STAGE") return (a.lifecycle_stage || "").localeCompare(b.lifecycle_stage || "");
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      });
  }, [projects, searchQuery, stageFilter, statusFilter, sortBy]);

  const canSeeFinancialSummary = globalRole === "OWNER";
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

  const getEffectiveRoleOnProject = (_project: Project): UserRole => {
    return "OWNER";
  };

  const handleOpenWorkspace = (project: Project) => {
    const role = getEffectiveRoleOnProject(project);
    const destination = getDefaultWorkspaceRoute(role, project.id);
    router.push(destination);
  };



  const getProjectImage = (project: Project) => {
    if (project.hero_image) {
      return project.hero_image;
    }

    const nameLower = project.name.toLowerCase();
    const addressLower = (project.address || "").toLowerCase();

    if (nameLower.includes("woodlawn") || addressLower.includes("woodlawn")) {
      return "/projects/woodlawn-new.jpg";
    }
    if (nameLower.includes("first") || addressLower.includes("first") || nameLower.includes("392")) {
      return "/projects/first-street-new.jpg";
    }
    if (nameLower.includes("broadway") || addressLower.includes("broadway") || nameLower.includes("73")) {
      return "/projects/broadway-new.jpg";
    }

    // Deterministic backup hero image pool for user-created projects
    const backupPool = [
      "/projects/fallingwater.jpg",
      "/projects/farnsworth.jpg",
      "/projects/gable-residence.jpg",
      "/landing/hero-building.jpg",
      "/projects/ref-card.jpg",
    ];
    let hash = 0;
    const seed = (project.id || "") + (project.name || "");
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return backupPool[Math.abs(hash) % backupPool.length];
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
      {/* Clean Page Header: Balanced side-by-side structure on mobile and desktop */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Projects
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 truncate">
            {projects.length} active {projects.length === 1 ? "development" : "developments"}
          </p>
        </div>

        {globalRole === "OWNER" && (
          <div className="flex items-center shrink-0">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-slate-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            >
              <Plus className="h-4 w-4" />
              <span>Add Project</span>
            </Link>
          </div>
        )}
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-3 sm:p-2.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row flex-1 sm:items-center gap-2.5 w-full">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-sm sm:min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 sm:h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Stage & Status Filters: 2-column grid on mobile, inline on desktop */}
          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">
            {/* Stage Filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="h-10 sm:h-9 w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              <option value="PRE_ACQUISITION">Pre Acquisition</option>
              <option value="ACQUISITION">Acquisition</option>
              <option value="PERMITTING">Permitting</option>
              <option value="ACTIVE_CONSTRUCTION">Active Project Construction</option>
              <option value="POST_CONSTRUCTION">Post construction</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 sm:h-9 w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="HEALTHY">Healthy</option>
              <option value="AT_RISK">At Risk</option>
            </select>
          </div>
        </div>

        {/* View Switcher: full-width 2-column pill on mobile, inline on desktop */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 sm:p-0.5">
          <button
            onClick={() => setViewMode("CARD")}
            aria-label="Card view"
            className={`flex h-9 sm:h-7 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all ${viewMode === "CARD"
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
            className={`flex h-9 sm:h-7 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all ${viewMode === "TABLE"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-900"
              }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>



      {/* Projects Display */}
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
                  Create your first development project to begin tracking budgets, draws, reconciliation, and milestones.
                </p>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Project</span>
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
                    {/* Stage Badge & Delete Action */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {formatStageLabel(project.lifecycle_stage, project.phase)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                        }}
                        className="p-1.5 -my-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete project workspace"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
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
          <div className="overflow-x-auto relative">
            <table className="w-full min-w-[780px] border-separate border-spacing-0 text-left text-xs">
              <thead className="bg-slate-50/90 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 sm:px-5 py-3.5 border-b border-slate-200 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] w-48 min-w-[190px] max-w-[190px]">
                    Project
                  </th>
                  <th className="px-4 py-3.5 border-b border-slate-200 min-w-[130px]">Stage</th>
                  <th className="px-4 py-3.5 border-b border-slate-200 min-w-[90px]">Health</th>
                  <th className="px-4 py-3.5 border-b border-slate-200 min-w-[130px]">Progress</th>
                  <th className="px-4 py-3.5 border-b border-slate-200 min-w-[150px]">Next Milestone</th>
                  <th className="px-5 py-3.5 text-right border-b border-slate-200 min-w-[90px]">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {filteredProjects.map((project) => {
                  const progress = getProjectProgress(project);

                  return (
                    <tr
                      key={project.id}
                      onClick={() => handleOpenWorkspace(project)}
                      className="group transition-colors hover:bg-slate-50/80 cursor-pointer"
                    >
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-4 sm:px-5 py-3.5 border-b border-slate-100 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] w-48 min-w-[190px] max-w-[190px] align-middle">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {project.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {project.address}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 border-b border-slate-100 align-middle">
                        <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                          {formatStageLabel(project.lifecycle_stage, project.phase)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-b border-slate-100 align-middle whitespace-nowrap">
                        {getTableHealthBadge(project.health_status)}
                      </td>
                      <td className="px-4 py-3.5 border-b border-slate-100 min-w-[130px] align-middle">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 tabular-nums">
                            {progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 truncate max-w-[160px] border-b border-slate-100 align-middle">
                        {project.next_milestone || "Handover & Final Audit"}
                      </td>
                      <td className="px-5 py-3.5 text-right border-b border-slate-100 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-blue-600 group-hover:text-blue-700">
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

      {/* Clean Delete Confirmation Modal */}
      {projectToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => {
            setProjectToDelete(null);
            setDeleteConfirmationInput("");
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Project</h3>
                <p className="text-xs text-slate-500">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs text-slate-600">
                Type <span className="font-semibold text-slate-900 select-all">{projectToDelete.name}</span> to confirm:
              </label>
              <input
                type="text"
                autoFocus
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder={projectToDelete.name}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    deleteConfirmationInput.trim() === projectToDelete.name.trim() &&
                    !deleteProjectMutation.isPending
                  ) {
                    deleteProjectMutation.mutate(projectToDelete.id);
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setProjectToDelete(null);
                  setDeleteConfirmationInput("");
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  deleteProjectMutation.isPending ||
                  deleteConfirmationInput.trim() !== projectToDelete.name.trim()
                }
                onClick={() => deleteProjectMutation.mutate(projectToDelete.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
              >
                {deleteProjectMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
