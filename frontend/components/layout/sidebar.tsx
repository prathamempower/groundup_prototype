"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { NAV_ITEMS } from "@/lib/navigation";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

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

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const currentRole = meData?.data?.role || "OWNER";
  const currentProjectId = projectsData?.data?.current_project_id || "";

  const { data: alertsData } = useQuery({
    queryKey: ["alerts", currentProjectId],
    queryFn: () => api.alerts.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const { data: recData } = useQuery({
    queryKey: ["reconciliation-queue", currentProjectId],
    queryFn: () => api.spend.getReconciliationQueue(currentProjectId),
    enabled: ["OWNER", "CFO"].includes(currentRole),
  });

  // Calculate material badges
  const badgeCounts: Record<string, number> = {
    documents: 0,
    draws: 0,
    reconciliation: recData?.data?.total_pending || 0,
    timeline: 0,
  };

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(currentRole)
  );

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
        {/* Brand Header */}
        <div className="flex h-[56px] items-center justify-between border-b border-border px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 overflow-hidden font-semibold focus-visible:outline-primary"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
            {!collapsed && (
              <span className="text-section font-bold tracking-tight text-text-primary">
                GroundUp <span className="text-primary-accent font-extrabold">AI</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3" aria-label="Main Navigation">
          {visibleNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/control-center" && pathname.startsWith(item.href));
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
