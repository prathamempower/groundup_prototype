"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getProjectNavItems } from "@/lib/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft,
  ChevronsUpDown,
  LogOut,
} from "lucide-react";
import { UserRole, Project } from "@/lib/types";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useSignOut } from "@/lib/hooks/use-sign-out";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const [thumbnailError, setThumbnailError] = React.useState(false);

  // Extract projectId if in /projects/[projectId]/... workspace route
  const projectRouteMatch = pathname.match(/^\/projects\/([^\/]+)/);
  const workspaceProjectId = projectRouteMatch && projectRouteMatch[1] !== "new" ? projectRouteMatch[1] : "";

  React.useEffect(() => {
    setThumbnailError(false);
  }, [workspaceProjectId]);

  const { signOut, isSigningOut, SignOutOverlay } = useSignOut();

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const { data: activeProjectData } = useQuery({
    queryKey: ["project", workspaceProjectId],
    queryFn: () => api.projects.getById(workspaceProjectId),
    enabled: Boolean(workspaceProjectId),
  });

  const allProjects: Project[] = projectsData?.data?.projects || [];
  const activeProject = activeProjectData?.data || (allProjects.find(p => p.id === workspaceProjectId));

  // Derive effective role on this active project
  const userMemberships = meData?.data?.project_memberships || [];
  const projectMembership = userMemberships.find((m: any) => m.project_id === workspaceProjectId);
  const effectiveRole: UserRole = (projectMembership?.role as UserRole) || meData?.data?.role || "OWNER";

  const { data: alertsData } = useQuery({
    queryKey: ["alerts", workspaceProjectId],
    queryFn: () => api.alerts.list(workspaceProjectId),
    enabled: Boolean(workspaceProjectId && ["OWNER", "CFO", "PM"].includes(effectiveRole)),
  });

  const { data: recData } = useQuery({
    queryKey: ["reconciliation-queue", workspaceProjectId],
    queryFn: () => api.spend.getReconciliationQueue(workspaceProjectId),
    enabled: Boolean(workspaceProjectId && ["OWNER", "CFO"].includes(effectiveRole)),
  });

  const { data: changeOrdersData } = useQuery({
    queryKey: ["change-orders", workspaceProjectId],
    queryFn: () => api.budget.getChangeOrders(workspaceProjectId),
    enabled: Boolean(workspaceProjectId && ["OWNER", "CFO", "PM"].includes(effectiveRole)),
  });

  // Calculate material badges
  const openAlertsCount = (alertsData?.data || []).filter(
    (a) => a.status === "OPEN"
  ).length;

  const pendingChangeOrdersCount = (changeOrdersData?.data || []).filter(
    (co: any) => co.status === "SUBMITTED" || co.status === "DRAFT"
  ).length;

  const badgeCounts: Record<string, number> = {
    documents: 0,
    draws: 0,
    reconciliation: recData?.data?.total_pending || 0,
    timeline: 0,
    alerts: openAlertsCount,
    changes: pendingChangeOrdersCount,
    inbox: 4,
  };

  const visibleNavItems = workspaceProjectId
    ? getProjectNavItems(workspaceProjectId, effectiveRole)
    : [];

  // Visible workspace items: Control Center, Reconciliation, Draws, Documents, Alerts
  const mainWorkspaceItemIds = ["control-center", "reconciliation", "draws", "documents", "alerts"];

  const mainNavItems = mainWorkspaceItemIds
    .map((id) => visibleNavItems.find((i) => i.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));


  const getProjectThumbnail = (proj?: Project | null) => {
    if (!proj) return "/projects/woodlawn-new.jpg";
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

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-50/60 border-r border-slate-200/80 transition-all duration-200 ease-in-out md:static ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0 shadow-overlay" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Top Header: Brand Logo & Collapse Toggle */}
        <div className="flex h-14 items-center justify-between px-3.5 border-b border-slate-200/70 bg-white">
          {!collapsed ? (
            <>
              <BrandLogo href="/projects" onClick={onCloseMobile} />
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/60 shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={onToggleCollapse}
                className="h-8 w-8 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-1.5 hover:border-blue-500 hover:text-blue-600 hover:shadow-xs transition-all cursor-pointer group"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          )}
        </div>

        {/* Focused Active Project Card */}
        <div className="p-3 border-b border-slate-200/70 bg-white">
          {!collapsed ? (
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-2.5 transition-all shadow-2xs hover:border-slate-300">
              <div className="flex items-center gap-3">
                {/* Building Thumbnail */}
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 shadow-2xs flex items-center justify-center">
                  {!thumbnailError ? (
                    <Image
                      src={getProjectThumbnail(activeProject)}
                      alt={activeProject?.name || "Project"}
                      fill
                      className="object-cover"
                      sizes="44px"
                      priority
                      onError={() => setThumbnailError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Project Metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate block leading-tight">
                      {activeProject?.name || "161 Woodlawn Ave"}
                    </span>
                  </div>

                  <span className="mt-0.5 text-[11px] text-slate-500 truncate block leading-snug">
                    {activeProject?.address || "Jersey City, NJ"}
                  </span>

                  <div className="mt-1 flex items-center text-[10px] text-slate-400 font-medium">
                    <span className="font-semibold text-slate-600 capitalize">
                      {effectiveRole.toLowerCase()}
                    </span>
                    <span className="mx-1 text-slate-300">•</span>
                    <span className="truncate text-slate-500">
                      {meData?.data?.name || "Marcus Vance"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div
                className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center bg-slate-100"
                title={activeProject?.name || "161 Woodlawn Ave"}
              >
                {!thumbnailError ? (
                  <Image
                    src={getProjectThumbnail(activeProject)}
                    alt={activeProject?.name || "Project"}
                    fill
                    className="object-cover"
                    sizes="40px"
                    onError={() => setThumbnailError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav
          className={`flex-1 overflow-y-auto py-3 space-y-4 ${
            collapsed ? "px-2" : "px-3"
          }`}
          aria-label="Project Workspace Navigation"
        >
          {/* Workspace Navigation Items */}
          {[
            {
              title: "Navigation",
              items: mainNavItems,
            },
          ].map((section) => {
            if (section.items.length === 0) return null;
            return (
              <div key={section.title}>
                {!collapsed && (
                  <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
                    const isAlert = item.id === "alerts" && badgeCount > 0;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        className={`group relative flex items-center rounded-lg text-xs transition-all duration-150 ${
                          collapsed
                            ? "h-9 w-9 mx-auto justify-center"
                            : "gap-2.5 px-3 py-2"
                        } ${
                          isActive
                            ? "bg-white text-blue-600 font-bold shadow-2xs border border-slate-200/80"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium"
                        }`}
                      >
                        {/* Active Indicator Accent Bar */}
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-sm bg-blue-600" />
                        )}

                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-blue-600 stroke-[2.25]"
                              : "text-slate-400 group-hover:text-slate-600 stroke-[1.75]"
                          }`}
                        />

                        {!collapsed && (
                          <div className="flex flex-1 items-center justify-between overflow-hidden">
                            <span className="truncate">{item.label}</span>
                            {badgeCount > 0 && (
                              <span
                                className={`ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
                                  isAlert
                                    ? "bg-rose-500 text-white"
                                    : "bg-slate-200/80 text-slate-700"
                                }`}
                              >
                                {badgeCount}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Collapsed view indicator dot */}
                        {collapsed && badgeCount > 0 && (
                          <span
                            className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full ring-2 ring-white ${
                              isAlert ? "bg-rose-500" : "bg-blue-600"
                            }`}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer: Sign Out */}
        <div className="p-2.5 border-t border-slate-200/70 bg-white">
          <button
            onClick={() => signOut()}
            disabled={isSigningOut}
            className={`w-full flex items-center rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all p-2 ${
              collapsed ? "justify-center" : "gap-2.5 px-3"
            } disabled:opacity-50 cursor-pointer group`}
            title="Sign out of GroundUp"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 shrink-0 text-rose-500 group-hover:text-rose-600 transition-colors" />
            {!collapsed && <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>}
          </button>
        </div>
      </aside>

      <SignOutOverlay />
    </>
  );
}

