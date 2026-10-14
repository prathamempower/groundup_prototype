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
} from "lucide-react";
import { UserRole, Project } from "@/lib/types";

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

  // Extract projectId if in /projects/[projectId]/... workspace route
  const projectRouteMatch = pathname.match(/^\/projects\/([^\/]+)/);
  const workspaceProjectId = projectRouteMatch && projectRouteMatch[1] !== "new" ? projectRouteMatch[1] : "";

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

  // Calculate material badges
  const openAlertsCount = (alertsData?.data || []).filter(
    (a) => a.status === "OPEN"
  ).length;

  const badgeCounts: Record<string, number> = {
    documents: 0,
    draws: 0,
    reconciliation: recData?.data?.total_pending || 0,
    timeline: 0,
    alerts: openAlertsCount,
    inbox: 4,
  };

  const visibleNavItems = workspaceProjectId
    ? getProjectNavItems(workspaceProjectId, effectiveRole)
    : [];

  // Business-minded enterprise categorization:
  // 1. Executive & Overview (Command/Summary & Communication)
  // 2. Financial Management (Capital & Cost Control)
  // 3. Project Execution (Field, Timeline & Assets)
  // 4. Governance & Risk (Exceptions, Compliance & Capital Partners)
  const executiveItemIds = ["control-center", "inbox"];
  const financialItemIds = ["budget", "draws", "reconciliation"];
  const executionItemIds = ["timeline", "documents"];
  const governanceItemIds = ["alerts", "partners"];

  const executiveNavItems = visibleNavItems.filter((i) => executiveItemIds.includes(i.id));
  const financialNavItems = visibleNavItems.filter((i) => financialItemIds.includes(i.id));
  const executionNavItems = visibleNavItems.filter((i) => executionItemIds.includes(i.id));
  const governanceNavItems = visibleNavItems.filter((i) => governanceItemIds.includes(i.id));
  const bottomNavItems = visibleNavItems.filter((i) => i.id === "settings");

  const getProjectThumbnail = (proj?: Project | null) => {
    if (!proj) return "/projects/woodlawn-card.jpg";
    const nameLower = (proj.name || "").toLowerCase();
    const addressLower = (proj.address || "").toLowerCase();

    if (nameLower.includes("woodlawn") || addressLower.includes("woodlawn")) {
      return "/projects/woodlawn-card.jpg";
    }
    if (nameLower.includes("first") || addressLower.includes("first")) {
      return "/projects/first-street-new.jpg";
    }
    if (nameLower.includes("broadway") || addressLower.includes("broadway")) {
      return "/projects/broadway-new.jpg";
    }
    return "/projects/woodlawn-card.jpg";
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
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-200/70 bg-white">
          {!collapsed ? (
            <>
              <Link
                href="/projects"
                className="flex items-center gap-2 group transition-opacity"
                title="GroundUp — Project Portfolio"
              >
                <Image
                  src="/logo.png"
                  alt="GroundUp"
                  width={132}
                  height={32}
                  className="h-6.5 w-auto object-contain"
                  priority
                />
              </Link>
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Focused Active Project Card */}
        <div className="p-3 border-b border-slate-200/70 bg-white">
          {!collapsed ? (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 transition-colors">
              <div className="flex items-center gap-3">
                {/* Building Thumbnail */}
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-2xs">
                  <Image
                    src={getProjectThumbnail(activeProject)}
                    alt={activeProject?.name || "Project"}
                    fill
                    className="object-cover"
                    sizes="44px"
                    priority
                  />
                </div>

                {/* Project Metadata */}
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 truncate block leading-tight">
                    {activeProject?.name || "161 Woodlawn Ave"}
                  </span>

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
                className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-200 shadow-2xs"
                title={activeProject?.name || "161 Woodlawn Ave"}
              >
                <Image
                  src={getProjectThumbnail(activeProject)}
                  alt={activeProject?.name || "Project"}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
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
          {/* Helper Section Renderer for consistent enterprise navigation */}
          {[
            {
              title: "Executive & Overview",
              items: executiveNavItems,
            },
            {
              title: "Financial Management",
              items: financialNavItems,
            },
            {
              title: "Project Execution",
              items: executionNavItems,
            },
            {
              title: "Governance & Risk",
              items: governanceNavItems,
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

        {/* Sidebar Footer: Settings & Portfolio Link */}
        <div className="p-3 border-t border-slate-200/70 bg-white space-y-0.5">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-sm bg-blue-600" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-blue-600 stroke-[2.25]" : "text-slate-400 group-hover:text-slate-600 stroke-[1.75]"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

          {/* Clean link to Portfolio */}
          {!collapsed && (
            <Link
              href="/projects"
              onClick={onCloseMobile}
              className="flex items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors group"
            >
              <span>Projects Portfolio</span>
              <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
