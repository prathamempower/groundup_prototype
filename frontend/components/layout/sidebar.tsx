"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getProjectNavItems } from "@/lib/navigation";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
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

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-surface transition-all duration-150 md:static ${
          collapsed ? "w-[64px]" : "w-[232px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand & Project Workspace Header */}
        <div className="border-b border-border p-3">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-caption text-text-muted hover:text-primary transition-colors mb-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {!collapsed && <span>Back to all projects</span>}
          </Link>

          {!collapsed ? (
            <div className="space-y-1">
              <div className="text-body font-bold text-text-primary truncate">
                {activeProject?.name || "Project Workspace"}
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {activeProject?.lifecycle_stage || "ACTIVE"}
                </span>
                <span className="text-[11px] text-text-muted font-medium">
                  {effectiveRole}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
                {activeProject?.name?.[0] || "P"}
              </div>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3" aria-label="Project Workspace Navigation">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-body transition-all duration-150 relative ${
                  isActive
                    ? "bg-gradient-to-r from-primary-subtle to-primary-subtle/50 text-primary font-semibold shadow-xs"
                    : "text-text-secondary hover:bg-subtle hover:text-text-primary"
                }`}
              >
                {/* 3px active bar on the left */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3.5px] rounded-r-full bg-primary" />
                )}

                <Icon className={`h-4 w-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${isActive ? "text-primary" : "text-text-secondary"}`} />

                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="ml-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-warning px-1.5 text-[10px] font-bold text-white shadow-xs">
                        {badgeCount}
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsed view indicator dot */}
                {collapsed && badgeCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-warning" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer: Collapse button */}
        <div className="border-t border-border p-2 hidden md:block">
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-md py-1.5 text-caption text-text-muted hover:bg-subtle hover:text-text-primary focus-visible:outline-primary"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
