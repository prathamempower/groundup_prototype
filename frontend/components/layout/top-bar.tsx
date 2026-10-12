"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project } from "@/lib/types";
import {
  Bell,
  ChevronDown,
  Building,
  Building2,
  Check,
  AlertTriangle,
  Info,
  AlertCircle,
  Menu,
  LogOut,
  CheckSquare,
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

interface TopBarProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const currentUser = meData?.data;
  const projects = projectsData?.data?.projects || [];
  const currentProjectId = projectsData?.data?.current_project_id;
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];
  const signOutMutation = useMutation({
    mutationFn: () => authAdapter.signOut(),
    onSuccess: async () => {
      window.localStorage.removeItem("groundup_session_seen");
      queryClient.clear();
      router.replace("/auth/login");
    },
  });

  const switchProjectMutation = useMutation({
    mutationFn: (projectId: string) => api.projects.switchProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsProjectDropdownOpen(false);
    },
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications", currentProjectId],
    queryFn: () => api.notifications.list(currentProjectId),
  });

  const notifications = notificationsData?.data || [];
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllRead(currentProjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[56px] w-full items-center justify-between border-b border-border bg-surface/90 backdrop-blur-md px-4 shadow-xs">
        {/* Left: Mobile Toggle & Portfolio Navigation Link */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-subtle hover:text-text-primary md:hidden"
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/projects"
            className="flex items-center gap-2 font-semibold text-slate-900 transition-opacity hover:opacity-80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">GroundUp</span>
          </Link>
        </div>

        {/* Right: Tasks, Notifications & User Menu */}
        <div className="flex items-center gap-2">
          {/* Tasks Trigger */}
          {/* Tasks Trigger */}
          <button
            onClick={() => {
              setIsTasksOpen(true);
              setIsNotificationsOpen(false);
              setIsUserDropdownOpen(false);
            }}
            className="relative flex h-9 items-center gap-1.5 px-2.5 rounded-md text-text-secondary hover:bg-subtle hover:text-text-primary focus-visible:outline-primary text-caption font-semibold"
            aria-label="View onboarding and delegated tasks"
          >
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
          </button>

          {/* Tasks Slide-out Drawer */}
          <Drawer open={isTasksOpen} onOpenChange={setIsTasksOpen}>
            <DrawerContent width="default" className="flex flex-col h-full bg-surface">
              <DrawerHeader className="border-b border-border bg-subtle/30 px-5 py-4 flex-shrink-0">
                <div className="flex items-center justify-between pr-6">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    <DrawerTitle className="text-section font-bold text-text-primary">
                      Tasks & Action Items
                    </DrawerTitle>
                  </div>
                  <span className="rounded bg-primary-subtle text-primary text-[11px] font-semibold px-2 py-0.5">
                    {currentProject?.name || "Active Project"}
                  </span>
                </div>
                <DrawerDescription className="text-caption text-text-secondary mt-1">
                  Onboarding milestones, pending approvals, and delegated sponsor duties.
                </DrawerDescription>
              </DrawerHeader>

              <DrawerBody className="p-4 space-y-3">
                <div className="rounded-lg border border-border bg-surface p-3.5 hover:bg-subtle/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary-subtle text-primary text-[10px] font-bold px-1.5 py-0.5">
                          {currentProject?.name || "73 Broadway"}
                        </span>
                        <span className="rounded bg-warning-subtle text-warning text-[10px] font-bold px-1.5 py-0.5 shrink-0">
                          PENDING
                        </span>
                      </div>
                      <h5 className="text-caption font-bold text-text-primary pt-0.5">
                        Approve verified budget baseline
                      </h5>
                      <p className="text-caption text-text-secondary">
                        Confirm line item allowances and assign $350k contingency reserve.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-3.5 hover:bg-subtle/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary-subtle text-primary text-[10px] font-bold px-1.5 py-0.5">
                          {currentProject?.name || "73 Broadway"}
                        </span>
                        <span className="rounded bg-warning-subtle text-warning text-[10px] font-bold px-1.5 py-0.5 shrink-0">
                          PENDING
                        </span>
                      </div>
                      <h5 className="text-caption font-bold text-text-primary pt-0.5">
                        Map dedicated operating bank account
                      </h5>
                      <p className="text-caption text-text-secondary">
                        Link Columbia Bank operating account for automated statement matching.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-3.5 hover:bg-subtle/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary-subtle text-primary text-[10px] font-bold px-1.5 py-0.5">
                          Portfolio Wide
                        </span>
                        <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 shrink-0">
                          UP TO DATE
                        </span>
                      </div>
                      <h5 className="text-caption font-bold text-text-primary pt-0.5">
                        Audit period compliance verification
                      </h5>
                      <p className="text-caption text-text-secondary">
                        All invoices and monthly draw disbursements reconciled with ledger records.
                      </p>
                    </div>
                  </div>
                </div>
              </DrawerBody>

              <DrawerFooter className="border-t border-border p-4 bg-subtle/30 flex items-center justify-between">
                <span className="text-caption text-text-muted">
                  Need to review full setup checklist?
                </span>
                <button
                  onClick={() => {
                    setIsTasksOpen(false);
                    router.push("/onboarding");
                  }}
                  className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover transition-colors"
                >
                  Open Onboarding Checklist &rarr;
                </button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Notifications / Alerts Trigger */}
          <button
            onClick={() => {
              setIsNotificationsOpen(true);
              setIsUserDropdownOpen(false);
              setIsProjectDropdownOpen(false);
              setIsTasksOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-subtle hover:text-text-primary focus-visible:outline-primary"
            aria-label="View notifications and alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white leading-none tabular-nums">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications / Alerts Slide-out Drawer */}
          <Drawer open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DrawerContent width="default" className="flex flex-col h-full bg-surface">
              <DrawerHeader className="border-b border-border bg-subtle/30 px-5 py-4 flex-shrink-0">
                <div className="flex items-center justify-between pr-6">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <DrawerTitle className="text-section font-bold text-text-primary">
                      Alerts & Notifications
                    </DrawerTitle>
                  </div>
                  {unreadNotificationsCount > 0 ? (
                    <span className="rounded bg-danger/10 text-danger text-caption font-bold px-2 py-0.5">
                      {unreadNotificationsCount} unread
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-50 text-emerald-700 text-caption font-medium px-2 py-0.5">
                      All caught up
                    </span>
                  )}
                </div>
                <DrawerDescription className="text-caption text-text-secondary mt-1 flex items-center justify-between">
                  <span>Critical project exceptions, draw milestones, and system notices.</span>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-caption font-semibold text-primary hover:text-primary-hover shrink-0 ml-2"
                    >
                      Mark all read
                    </button>
                  )}
                </DrawerDescription>
              </DrawerHeader>

              <DrawerBody className="p-4 space-y-2.5">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-caption text-text-muted">
                    No active notifications or alerts to display.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.read) markReadMutation.mutate(notif.id);
                        if (notif.link_url) {
                          setIsNotificationsOpen(false);
                          router.push(notif.link_url);
                        }
                      }}
                      className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
                        notif.read
                          ? "border-border/60 bg-surface hover:bg-subtle/50"
                          : "border-primary/20 bg-primary-subtle/15 hover:bg-primary-subtle/25 shadow-2xs"
                      }`}
                    >
                      {notif.severity === "CRITICAL" ? (
                        <AlertCircle className="mt-0.5 h-4 w-4 text-danger flex-shrink-0" />
                      ) : notif.severity === "WARNING" ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-warning flex-shrink-0" />
                      ) : notif.severity === "SUCCESS" ? (
                        <Check className="mt-0.5 h-4 w-4 text-success flex-shrink-0" />
                      ) : (
                        <Info className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5
                            className={`text-caption ${
                              notif.read ? "font-semibold text-text-primary" : "font-bold text-text-primary"
                            }`}
                          >
                            {notif.title}
                          </h5>
                          {!notif.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-caption text-text-secondary mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </DrawerBody>

              <DrawerFooter className="border-t border-border p-4 bg-subtle/30 flex items-center justify-between">
                <span className="text-caption text-text-muted">
                  Manage notification preferences
                </span>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    router.push("/settings");
                  }}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-subtle transition-colors shadow-2xs"
                >
                  View All in Settings &rarr;
                </button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserDropdownOpen(!isUserDropdownOpen);
                setIsProjectDropdownOpen(false);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-md p-1.5 hover:bg-subtle focus-visible:outline-primary"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {currentUser?.avatarInitials || "U"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-body font-medium leading-none text-text-primary">
                  {currentUser?.name || "User"}
                </span>
                <span className="text-[11px] text-text-muted leading-tight mt-0.5">
                  {currentUser?.role}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </button>

            {/* User Dropdown */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 rounded-md border border-border bg-surface p-1 shadow-overlay z-50">
                <div className="border-b border-border px-3 py-2">
                  <div className="text-body font-medium text-text-primary">
                    {currentUser?.name}
                  </div>
                  <div className="text-caption text-text-muted">{currentUser?.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="rounded bg-primary-subtle px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {currentUser?.role}
                    </span>
                    {currentUser?.company && (
                      <span className="text-[11px] text-text-secondary">{currentUser.company}</span>
                    )}
                  </div>
                </div>
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      router.push("/account");
                    }}
                    className="flex w-full items-center rounded px-2 py-2 text-left text-body text-text-primary hover:bg-subtle"
                  >
                    Account settings
                  </button>
                  {currentUser?.role === "OWNER" && (
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        router.push("/settings");
                      }}
                      className="flex w-full items-center rounded px-2 py-2 text-left text-body text-text-primary hover:bg-subtle"
                    >
                      Organization settings and team
                    </button>
                  )}
                {signOutMutation.error instanceof Error && (
                  <p role="alert" className="px-2 py-1 text-caption text-danger">{signOutMutation.error.message}</p>
                )}
                <button
                  onClick={() => signOutMutation.mutate()}
                  disabled={signOutMutation.isPending}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-body text-danger hover:bg-danger-subtle disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  {signOutMutation.isPending ? "Signing out…" : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
