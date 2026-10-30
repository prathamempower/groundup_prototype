"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project, OnboardingTask, AlertItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronDown,
  Check,
  AlertTriangle,
  Info,
  AlertCircle,
  Menu,
  LogOut,
  CheckSquare,
  ArrowRight,
  X,
  ArrowLeft,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useSignOut } from "@/lib/hooks/use-sign-out";

const DEFAULT_WORKSPACE_ALERTS: AlertItem[] = [
  {
    id: "alt-work-01",
    project_id: "default",
    title: "Framing completion delayed",
    description: "Inspection report indicates framing milestone is 12 days behind schedule.",
    severity: "DANGER",
    owner: "David Ross",
    status: "OPEN",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "alt-work-02",
    project_id: "default",
    title: "Upcoming cash shortfall ($325,000)",
    description: "Available cash is insufficient for upcoming contractor payment obligations.",
    severity: "DANGER",
    owner: "Sarah Lin",
    status: "OPEN",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "alt-work-03",
    project_id: "default",
    title: "Construction costs exceeding budget (18%)",
    description: "Actual costs on electrical and plumbing line items exceed approved budget.",
    severity: "WARNING",
    owner: "Sarah Lin",
    status: "OPEN",
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "alt-work-04",
    project_id: "default",
    title: "3 construction invoices missing lien waivers",
    description: "Recent draw disbursements require missing subcontractor unconditional lien waivers.",
    severity: "INFO",
    owner: "Marcus Vance",
    status: "OPEN",
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
];

interface TopBarProps {
  onToggleSidebar: () => void;
  hasSidebar?: boolean;
  isSidebarCollapsed?: boolean;
}

export function TopBar({
  onToggleSidebar,
  hasSidebar,
  isSidebarCollapsed = false,
}: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alertsFilter, setAlertsFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [localResolvedAlertIds, setLocalResolvedAlertIds] = useState<string[]>([]);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserDropdownOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserDropdownOpen]);

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const currentUser = meData?.data;
  const projects = React.useMemo(() => projectsData?.data?.projects || [], [projectsData?.data?.projects]);

  // Match /projects/[projectId] strictly from current route if active inside workspace
  const projectRouteMatch = pathname.match(/^\/projects\/([^\/]+)/);
  const routeProjectId = projectRouteMatch && projectRouteMatch[1] !== "new" ? projectRouteMatch[1] : null;

  // STRICT PROJECT ISOLATION: When outside a specific project workspace route (e.g. on /projects portfolio),
  // do not latch onto a random project or leak project-specific tasks/alerts.
  const currentProject = React.useMemo(() => {
    if (!routeProjectId) return null;
    const exact = projects.find((p) => p.id === routeProjectId);
    if (exact) return exact;
    const cleanQuery = routeProjectId.toLowerCase().replace(/^(proj-|project-)/, "").replace(/[-_]/g, " ").trim();
    if (!cleanQuery) return null;
    return projects.find((p) => {
      const pName = (p.name || "").toLowerCase();
      const pAddr = (p.address || "").toLowerCase();
      return pName === cleanQuery || pName.includes(cleanQuery) || cleanQuery.includes(pName) || pAddr.includes(cleanQuery);
    }) || null;
  }, [projects, routeProjectId]);

  const currentProjectId = currentProject?.id || routeProjectId || null;
  const { signOut, isSigningOut } = useSignOut();

  // Adaptive logo display:
  // - On mobile (< md): Sidebar is off-canvas, so TopBar must always show the logo.
  // - On desktop (>= md):
  //   * If sidebar is mounted and expanded: Sidebar already displays the GroundUp logo, so hide it in TopBar to prevent duplicate logos.
  //   * If sidebar is collapsed or not mounted: TopBar displays the GroundUp logo.
  const effectiveHasSidebar = hasSidebar ?? Boolean(routeProjectId);
  const showLogoOnDesktop = !effectiveHasSidebar || isSidebarCollapsed;

  const switchProjectMutation = useMutation({
    mutationFn: (projectId: string) => api.projects.switchProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsProjectDropdownOpen(false);
    },
  });

  const { data: alertsData } = useQuery({
    queryKey: ["alerts", currentProjectId],
    queryFn: () =>
      currentProjectId
        ? api.alerts.list(currentProjectId)
        : Promise.resolve({ data: [] as AlertItem[] }),
    enabled: Boolean(currentProjectId),
  });

  const rawAlerts: AlertItem[] =
    alertsData?.data && alertsData.data.length > 0
      ? alertsData.data
      : currentProjectId
      ? DEFAULT_WORKSPACE_ALERTS
      : [];

  const alerts: AlertItem[] = rawAlerts.map((a) =>
    localResolvedAlertIds.includes(a.id) ? { ...a, status: "RESOLVED" } : a
  );

  const openAlertsCount = alerts.filter((a) => a.status === "OPEN").length;
  const resolvedAlertsCount = alerts.filter((a) => a.status === "RESOLVED").length;

  const filteredAlerts = alerts.filter((a) => {
    if (alertsFilter === "OPEN") return a.status === "OPEN";
    if (alertsFilter === "RESOLVED") return a.status === "RESOLVED";
    return true;
  });

  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: string) =>
      api.alerts.resolveAlert(alertId, "Resolved via alerts drawer"),
    onSuccess: (_, alertId) => {
      setLocalResolvedAlertIds((prev) => [...prev, alertId]);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const { data: onboardingTasksData } = useQuery({
    queryKey: ["onboarding-tasks", currentProjectId],
    queryFn: () =>
      currentProjectId
        ? api.onboarding.getTasks(currentProjectId)
        : Promise.resolve({ data: [] as OnboardingTask[] }),
    enabled: Boolean(currentProjectId),
  });

  const serverTasks: OnboardingTask[] = onboardingTasksData?.data || [];
  const defaultTasks = [
    {
      id: "task-1",
      title: "Approve verified budget baseline",
      project: currentProject?.name || "Active Project",
      status: "PENDING" as const,
      category: "Baseline review",
    },
    {
      id: "task-2",
      title: "Map dedicated operating bank account",
      project: currentProject?.name || "Active Project",
      status: "PENDING" as const,
      category: "Account mapping",
    },
    {
      id: "task-3",
      title: "Audit period compliance verification",
      project: "Portfolio Wide",
      status: "RESOLVED" as const,
      category: "Compliance",
    },
  ];

  const tasks =
    serverTasks.length > 0
      ? serverTasks.map((t: OnboardingTask) => ({
          id: t.id,
          title: t.title,
          project: currentProject?.name || "Active Project",
          status: t.status === "RESOLVED" ? ("RESOLVED" as const) : ("PENDING" as const),
          category: t.task_type.replace(/_/g, " ").toLowerCase(),
        }))
      : defaultTasks;

  const pendingTasksCount = tasks.filter((t) => t.status !== "RESOLVED").length;

  const { data: documentsData } = useQuery({
    queryKey: ["documents", currentProjectId],
    queryFn: () => api.documents.list(currentProjectId!),
    enabled: Boolean(currentProjectId),
  });

  const projectDocuments = documentsData?.data || [];
  const documentsCount = projectDocuments.length;
  const isDocumentsActive = pathname.includes("/documents");

  return (
    <div className="sticky top-0 z-30 w-full flex flex-col">
      <header className="flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white px-3 sm:px-5">
        {/* Left: Mobile Toggle, Visible Back Arrow, and GroundUp Logo with Text */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {Boolean(routeProjectId) && (
            <button
              onClick={onToggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden cursor-pointer shrink-0"
              aria-label="Toggle navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Clean Back Arrow - Accessible and visible when inside any project workspace or subpage */}
          {routeProjectId ? (
            <>
              {/* Mobile Back Arrow Icon */}
              <Link
                href="/projects"
                className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg bg-slate-100/90 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
                title="Back to All Projects"
                aria-label="Back to All Projects"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              {/* Desktop Back to Projects Button */}
              <Link
                href="/projects"
                className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-slate-100/90 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all shadow-2xs group shrink-0 cursor-pointer"
                title="Back to All Projects"
                aria-label="Back to All Projects"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>All Projects</span>
              </Link>
            </>
          ) : pathname === "/projects/new" ? (
            <Link
              href="/projects"
              className="flex h-8 w-8 md:w-auto md:px-2.5 md:h-8 items-center justify-center gap-1.5 rounded-lg bg-slate-100/90 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all shadow-2xs group shrink-0 cursor-pointer"
              title="Back to All Projects"
              aria-label="Back to All Projects"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden md:inline">All Projects</span>
            </Link>
          ) : null}

          {/* GroundUp Logo: Adaptive display to prevent duplicate logos when desktop sidebar is expanded */}
          <div
            className={`items-center shrink-0 ${
              showLogoOnDesktop ? "flex" : "flex md:hidden"
            }`}
          >
            <BrandLogo
              size="sm"
              href="/projects"
              showWordmark={true}
              iconOnly={false}
              showSubtitle={false}
            />
          </div>

          {/* Project Breadcrumb on desktop when sidebar is active */}
          {routeProjectId && currentProject?.name && (
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-700 truncate max-w-[240px]">
              <span className="text-slate-300 font-normal">/</span>
              <span className="truncate">{currentProject.name}</span>
            </div>
          )}
        </div>

        {/* Right: Documents, Tasks, Notifications & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Documents Workspace Navigation */}
          {currentProjectId ? (
            <Link
              href={`/projects/${currentProjectId}/documents`}
              className={`relative flex h-8 items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isDocumentsActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200/80"
              }`}
              aria-current={isDocumentsActive ? "page" : undefined}
              title="Documents"
            >
              <FileText className={`h-3.5 w-3.5 ${isDocumentsActive ? "text-blue-600" : "text-slate-400"}`} />
              <span className="hidden sm:inline">Documents</span>
              {documentsCount > 0 && (
                <span
                  className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
                    isDocumentsActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700 border border-slate-200/70"
                  }`}
                >
                  {documentsCount}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/documents"
              className={`relative flex h-8 items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isDocumentsActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200/80"
              }`}
              aria-current={isDocumentsActive ? "page" : undefined}
              title="Documents"
            >
              <FileText className={`h-3.5 w-3.5 ${isDocumentsActive ? "text-blue-600" : "text-slate-400"}`} />
              <span className="hidden sm:inline">Documents</span>
            </Link>
          )}

          {/* Tasks Trigger */}
          <button
            onClick={() => {
              setIsTasksOpen(true);
              setIsAlertsOpen(false);
              setIsUserDropdownOpen(false);
            }}
            className="relative flex h-8 items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200/80 transition-all cursor-pointer"
            aria-label="View onboarding and delegated tasks"
          >
            <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Tasks</span>
            {pendingTasksCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-100 text-slate-700 border border-slate-200/70 px-1 text-[10px] font-bold tabular-nums">
                {pendingTasksCount}
              </span>
            )}
          </button>

          {/* Tasks Slide-out Drawer */}
          <Drawer open={isTasksOpen} onOpenChange={setIsTasksOpen}>
            <DrawerContent width="default" className="flex flex-col h-full bg-surface">
              <DrawerHeader className="border-b border-border bg-surface px-5 py-4 flex-shrink-0">
                <div className="flex items-center justify-between pr-8">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <DrawerTitle className="text-sm font-bold text-slate-900">
                        Tasks
                      </DrawerTitle>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {pendingTasksCount} pending
                      </span>
                    </div>
                  </div>
                  {currentProject?.name && (
                    <span className="text-xs font-medium text-slate-500 truncate max-w-[140px]">
                      {currentProject.name}
                    </span>
                  )}
                </div>
                <DrawerDescription className="sr-only">
                  Project tasks and action items
                </DrawerDescription>
              </DrawerHeader>

              <DrawerBody className="p-4 space-y-2.5">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2">
                      <Check className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900">All caught up</p>
                    <p className="text-xs text-slate-500 mt-0.5">No pending tasks or action items</p>
                  </div>
                ) : (
                  tasks.map((task) => {
                    const isDone = task.status === "RESOLVED";

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setIsTasksOpen(false);
                          if (currentProjectId) {
                            router.push(`/projects/${currentProjectId}/control-center`);
                          } else {
                            router.push("/projects");
                          }
                        }}
                        className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 hover:border-slate-300 hover:bg-slate-50/60 transition-all cursor-pointer shadow-xs"
                      >
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                          {isDone ? (
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-slate-300 group-hover:border-slate-400 transition-colors" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5
                              className={`text-xs font-semibold leading-tight truncate ${
                                isDone
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900 group-hover:text-blue-600 transition-colors"
                              }`}
                            >
                              {task.title}
                            </h5>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                                isDone
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
                              }`}
                            >
                              {isDone ? "Done" : "Pending"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                            <span className="font-medium text-slate-600 truncate">{task.project}</span>
                            <span>•</span>
                            <span className="text-slate-400 capitalize truncate">{task.category}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </DrawerBody>

              <DrawerFooter className="border-t border-border p-4 bg-surface">
                <button
                  onClick={() => {
                    setIsTasksOpen(false);
                    if (currentProjectId) {
                      router.push(`/projects/${currentProjectId}/control-center`);
                    } else {
                      router.push("/projects");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:bg-slate-950 transition-colors cursor-pointer"
                >
                  <span>Go to Project Control Center</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Alerts Trigger (formerly Notifications) */}
          <button
            onClick={() => {
              setIsAlertsOpen(true);
              setIsUserDropdownOpen(false);
              setIsProjectDropdownOpen(false);
              setIsTasksOpen(false);
            }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200/80 transition-all cursor-pointer"
            aria-label="View project alerts"
            title="Project Alerts"
          >
            <Bell className="h-4 w-4 text-slate-500" />
            {openAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-2xs">
                {openAlertsCount}
              </span>
            )}
          </button>

          {/* Alerts Slide-out Drawer */}
          <Drawer open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
            <DrawerContent width="default" className="flex flex-col h-full bg-surface tracking-normal">
              <DrawerHeader className="border-b border-border bg-surface px-5 py-4 flex-shrink-0">
                <div className="flex items-center justify-between pr-8">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <DrawerTitle className="text-sm font-bold text-slate-900">
                        Alerts
                      </DrawerTitle>
                      {openAlertsCount > 0 ? (
                        <span className="rounded-full bg-rose-50 border border-rose-200/80 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          {openAlertsCount} open
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          All resolved
                        </span>
                      )}
                    </div>
                  </div>
                  {currentProject?.name && (
                    <span className="text-xs font-medium text-slate-500 truncate max-w-[140px]">
                      {currentProject.name}
                    </span>
                  )}
                </div>
                <DrawerDescription className="sr-only">
                  Project alerts, risks, and discrepancies
                </DrawerDescription>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setAlertsFilter("ALL")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                      alertsFilter === "ALL"
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    All ({alerts.length})
                  </button>
                  <button
                    onClick={() => setAlertsFilter("OPEN")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                      alertsFilter === "OPEN"
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    Open ({openAlertsCount})
                  </button>
                  <button
                    onClick={() => setAlertsFilter("RESOLVED")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                      alertsFilter === "RESOLVED"
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    Resolved ({resolvedAlertsCount})
                  </button>
                </div>
              </DrawerHeader>

              <DrawerBody className="p-4 space-y-2.5">
                {filteredAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900">
                      {alertsFilter === "OPEN"
                        ? "No open alerts"
                        : alertsFilter === "RESOLVED"
                        ? "No resolved alerts yet"
                        : "No alerts"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {alertsFilter === "OPEN"
                        ? "All project risks and discrepancies are currently addressed."
                        : "Project alerts will appear here as they are generated."}
                    </p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const isOpen = alert.status === "OPEN";
                    const isDanger = alert.severity === "DANGER";
                    const isWarning = alert.severity === "WARNING";

                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          "group relative flex flex-col gap-2 rounded-xl border p-3.5 transition-all shadow-2xs",
                          isOpen
                            ? isDanger
                              ? "border-rose-200/90 bg-rose-50/20 hover:border-rose-300"
                              : "border-amber-200/80 bg-amber-50/15 hover:border-amber-300"
                            : "border-slate-200/80 bg-white hover:border-slate-300 opacity-80"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase",
                                isDanger
                                  ? "bg-rose-100 text-rose-700 border border-rose-200/60"
                                  : isWarning
                                  ? "bg-amber-100 text-amber-700 border border-amber-200/60"
                                  : "bg-blue-100 text-blue-700 border border-blue-200/60"
                              )}
                            >
                              {alert.severity}
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold",
                                isOpen
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-emerald-100 text-emerald-800"
                              )}
                            >
                              {isOpen ? "Open" : "Resolved"}
                            </span>
                          </div>

                          {isOpen ? (
                            <button
                              onClick={() => resolveAlertMutation.mutate(alert.id)}
                              disabled={resolveAlertMutation.isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                              title="Mark this alert as resolved"
                            >
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Resolve</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Resolved</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h5 className="text-xs font-semibold text-slate-900 leading-snug tracking-normal">
                            {alert.title}
                          </h5>
                          <p className="text-[12px] text-slate-600 leading-relaxed mt-1 tracking-normal">
                            {alert.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-100">
                          <span className="inline-flex items-center gap-1">
                            <span>Owner:</span>
                            <strong className="text-slate-600 font-medium">
                              {alert.owner || "Team"}
                            </strong>
                          </span>
                          {alert.created_at && (
                            <span>
                              {new Date(alert.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </DrawerBody>

              <DrawerFooter className="border-t border-border p-4 bg-surface">
                <button
                  onClick={() => {
                    setIsAlertsOpen(false);
                    if (currentProjectId) {
                      router.push(`/projects/${currentProjectId}/alerts`);
                    } else {
                      router.push("/projects");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:bg-slate-950 transition-colors cursor-pointer"
                >
                  <span>Open Full Alerts Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* User menu */}
          <div ref={userMenuRef} className="relative ml-1 shrink-0">
            <button
              onClick={() => {
                setIsUserDropdownOpen(!isUserDropdownOpen);
                setIsProjectDropdownOpen(false);
                setIsAlertsOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-lg py-1 px-1.5 hover:bg-slate-100/80 border border-transparent hover:border-slate-200/80 transition-all shrink-0 cursor-pointer group"
              aria-expanded={isUserDropdownOpen}
              aria-haspopup="menu"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white tracking-wider shrink-0 ring-2 ring-slate-100 shadow-2xs group-hover:bg-slate-800 transition-colors">
                {currentUser?.avatarInitials || "MV"}
              </div>
              <div className="hidden sm:flex flex-col text-left shrink-0">
                <span className="text-xs font-semibold leading-tight text-slate-900 whitespace-nowrap">
                  {currentUser?.name || "Marcus Vance"}
                </span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-normal whitespace-nowrap leading-tight mt-0.5">
                  {currentUser?.role || "OWNER"}
                </span>
              </div>
              <ChevronDown className={`h-3 w-3 text-slate-400 hidden sm:block transition-transform duration-150 ${isUserDropdownOpen ? "rotate-180 text-slate-700" : ""}`} />
            </button>

            {/* Professional Enterprise User Popover */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-900/5 z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100 ease-out select-none">
                {/* 1. Identity Header: User & Role */}
                <div className="p-3 bg-slate-50/60">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white tracking-normal shrink-0 ring-2 ring-white shadow-2xs">
                      {currentUser?.avatarInitials || "MV"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 tracking-tight truncate">
                          {currentUser?.name || "Marcus Vance"}
                        </span>
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 bg-white border border-slate-200/80 uppercase tracking-tight shrink-0 shadow-2xs">
                          {currentUser?.role || "OWNER"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                        {currentUser?.email || "m.vance@vancedev.com"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Session Actions */}
                <div className="p-1">
                  <button
                    onClick={() => signOut()}
                    disabled={isSigningOut}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50/80 transition-colors disabled:opacity-50 cursor-pointer group"
                  >
                    <LogOut className="h-4 w-4 text-rose-500 group-hover:text-rose-600 transition-colors shrink-0" />
                    <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

