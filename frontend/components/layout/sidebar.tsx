"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getProjectNavItems } from "@/lib/navigation";
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import { UserRole } from "@/lib/types";

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

  const { data: activeProjectData } = useQuery({
    queryKey: ["project", workspaceProjectId],
    queryFn: () => api.projects.getById(workspaceProjectId),
    enabled: Boolean(workspaceProjectId),
  });

  const activeProject = activeProjectData?.data;

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
  };

  const visibleNavItems = workspaceProjectId
    ? getProjectNavItems(workspaceProjectId, effectiveRole)
    : [];

  // Split into main workspace items and secondary management items (Settings)
  const mainNavItems = visibleNavItems.filter((i) => i.id !== "settings");
  const bottomNavItems = visibleNavItems.filter((i) => i.id === "settings");

  const formatStageLabel = (stage?: string) => {
    if (!stage) return "Active";
    return stage
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-50/50 border-r border-slate-200/80 transition-all duration-200 ease-in-out md:static ${
          collapsed ? "w-[68px]" : "w-[240px]"
        } ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand & Project Workspace Header */}
        <div className={`pt-4 pb-3 ${collapsed ? "px-2.5 flex flex-col items-center" : "px-4"}`}>
          {/* Logo / Brand & Toggle */}
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <Link
                href="/projects"
                className="flex items-center gap-2 group py-0.5"
                title="Return to Projects"
              >
                <Image
                  src="/logo.png"
                  alt="GroundUp"
                  width={140}
                  height={36}
                  className="h-8 w-auto object-contain group-hover:opacity-90 transition-opacity"
                  priority
                />
              </Link>

              {/* Collapse toggle (desktop only) */}
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <Link
                href="/projects"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1 border border-slate-200/80 shadow-xs hover:scale-105 transition-transform"
                title="GroundUp — Back to Projects"
              >
                <Image
                  src="/icon.png"
                  alt="GroundUp"
                  width={28}
                  height={28}
                  className="h-6 w-6 object-contain"
                  priority
                />
              </Link>

              <button
                onClick={onToggleCollapse}
                className="hidden md:flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Active Project Switcher Pill */}
          {!collapsed ? (
            <div className="mt-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
              <div className="mb-1.5">
                <span className="text-xs font-bold text-slate-900 block truncate" title={activeProject?.name}>
                  {activeProject?.name || "161 Woodlawn Ave"}
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5" title={activeProject?.address}>
                  {activeProject?.address ? activeProject.address.split(",").slice(0, 2).join(",") : "161 Woodlawn Ave, Jersey City"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200/80">
                  {formatStageLabel(activeProject?.lifecycle_stage)}
                </span>
                <Link
                  href="/projects"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors text-[11px]"
                >
                  Switch
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-2 w-full pt-2 border-t border-slate-200/60 flex justify-center">
              <Link
                href="/projects"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200/80 text-slate-800 text-xs font-bold shadow-2xs hover:border-slate-300 hover:text-primary transition-all"
                title={`${activeProject?.name || "Project Workspace"} (${formatStageLabel(activeProject?.lifecycle_stage)}) - Click to switch`}
              >
                {activeProject?.name?.[0] || "P"}
              </Link>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav
          className={`flex-1 overflow-y-auto space-y-1 py-2 ${
            collapsed ? "px-2" : "px-3"
          }`}
          aria-label="Project Workspace Navigation"
        >
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center rounded-xl text-xs font-medium transition-all duration-150 relative ${
                  collapsed
                    ? "h-10 w-10 mx-auto justify-center"
                    : "gap-3 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-white text-slate-900 font-semibold shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-700"
                  }`}
                />

                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-2xs">
                        {badgeCount}
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsed view indicator dot */}
                {collapsed && badgeCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </Link>
            );
          })}

          {/* Secondary / Settings Items */}
          {bottomNavItems.length > 0 && (
            <div className="pt-2 mt-2 border-t border-slate-200/60">
              {bottomNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center rounded-xl text-xs font-medium transition-all duration-150 ${
                      collapsed
                        ? "h-10 w-10 mx-auto justify-center"
                        : "gap-3 px-3 py-2.5"
                    } ${
                      isActive
                        ? "bg-white text-slate-900 font-semibold shadow-xs border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-700" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
