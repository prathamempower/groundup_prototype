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
  Building2,
  ArrowLeft,
  Briefcase,
  Layers,
  Sliders,
} from "lucide-react";
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

  // Categorize navigation items cleanly into Operations, Finance & Control, Partners & Funding, and Settings
  const coreItemIds = ["control-center", "documents", "timeline", "submissions"];
  const financeItemIds = ["budget", "reconciliation", "draws"];
  const partnerItemIds = ["partners"];
  const alertsItemIds = ["alerts"];

  const coreNavItems = visibleNavItems.filter((i) => coreItemIds.includes(i.id));
  const financeNavItems = visibleNavItems.filter((i) => financeItemIds.includes(i.id));
  const partnerNavItems = visibleNavItems.filter((i) => partnerItemIds.includes(i.id));
  const alertsNavItems = visibleNavItems.filter((i) => alertsItemIds.includes(i.id));
  const bottomNavItems = visibleNavItems.filter((i) => i.id === "settings");

  const formatStageLabel = (stage?: string) => {
    if (!stage) return "In Progress";
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
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200/90 transition-all duration-200 ease-in-out md:static ${
          collapsed ? "w-[70px]" : "w-[256px]"
        } ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Top Header: Brand Logo & Collapse Toggle */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
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
                  className="h-7 w-auto object-contain"
                  priority
                />
              </Link>
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Project Card & Back to Portfolio Navigation */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          {!collapsed ? (
            <div className="space-y-2.5">
              {/* Back to Projects breadcrumb-style link */}
              <Link
                href="/projects"
                aria-label="Switch"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-primary transition-colors group"
                title="Return to all projects"
              >
                <ArrowLeft className="h-3 w-3 text-slate-400 group-hover:text-primary transition-transform group-hover:-translate-x-0.5" />
                <span>Back to all projects</span>
              </Link>

              {/* Active Project Card */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-slate-900 block truncate" title={activeProject?.name}>
                      {activeProject?.name || "Workspace"}
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {effectiveRole}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {formatStageLabel(activeProject?.lifecycle_stage)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/projects"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs hover:border-primary hover:text-primary transition-all"
                title={`${activeProject?.name || "Projects"} — Back to all projects`}
              >
                <Building2 className="h-4 w-4" />
              </Link>
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
          {/* Section: Core Navigation */}
          {coreNavItems.length > 0 && (
            <div>
              {!collapsed && (
                <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Operations
                </div>
              )}
              <div className="space-y-0.5">
                {coreNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center rounded-lg text-xs font-medium transition-all duration-150 ${
                        collapsed
                          ? "h-9 w-9 mx-auto justify-center"
                          : "gap-3 px-3 py-2"
                      } ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
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

                      {/* Collapsed view indicator badge dot */}
                      {collapsed && badgeCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Financials & Tracking */}
          {financeNavItems.length > 0 && (
            <div>
              {!collapsed && (
                <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Finance & Control
                </div>
              )}
              <div className="space-y-0.5">
                {financeNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center rounded-lg text-xs font-medium transition-all duration-150 ${
                        collapsed
                          ? "h-9 w-9 mx-auto justify-center"
                          : "gap-3 px-3 py-2"
                      } ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
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

                      {/* Collapsed view indicator badge dot */}
                      {collapsed && badgeCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Partners & Funding */}
          {partnerNavItems.length > 0 && (
            <div>
              {!collapsed && (
                <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Partners & Funding
                </div>
              )}
              <div className="space-y-0.5">
                {partnerNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center rounded-lg text-xs font-medium transition-all duration-150 ${
                        collapsed
                          ? "h-9 w-9 mx-auto justify-center"
                          : "gap-3 px-3 py-2"
                      } ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />

                      {!collapsed && (
                        <div className="flex flex-1 items-center justify-between overflow-hidden">
                          <span className="truncate">{item.label}</span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Alerts & Exceptions */}
          {alertsNavItems.length > 0 && (
            <div>
              <div className="space-y-0.5">
                {alertsNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center rounded-lg text-xs font-medium transition-all duration-150 ${
                        collapsed
                          ? "h-9 w-9 mx-auto justify-center"
                          : "gap-3 px-3 py-2"
                      } ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
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

                      {/* Collapsed view indicator badge dot */}
                      {collapsed && badgeCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer: Settings & Workspace Configuration */}
        {bottomNavItems.length > 0 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/30">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center rounded-lg text-xs font-medium transition-all duration-150 ${
                    collapsed
                      ? "h-9 w-9 mx-auto justify-center"
                      : "gap-3 px-3 py-2"
                  } ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
}
