"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project, OnboardingTask } from "@/lib/types";
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
  ArrowRight,
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

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-5">
        {/* Left: Mobile Toggle & Contextual Breadcrumb / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Clean title or breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Workspace
            </span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-[320px]">
              {currentProject?.name || "GroundUp AI"}
            </span>
          </div>
        </div>

        {/* Right: Tasks, Notifications & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tasks Trigger */}
          <button
            onClick={() => {
              setIsTasksOpen(true);
              setIsNotificationsOpen(false);
              setIsUserDropdownOpen(false);
            }}
            className="relative flex h-8 items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="View onboarding and delegated tasks"
          >
            <CheckSquare className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Tasks</span>
            {pendingTasksCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-semibold text-slate-700">
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
                            router.push(`/projects/${currentProjectId}/budget`);
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

          {/* Notifications / Alerts Trigger */}
          <button
            onClick={() => {
              setIsNotificationsOpen(true);
              setIsUserDropdownOpen(false);
              setIsProjectDropdownOpen(false);
              setIsTasksOpen(false);
            }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="View notifications and alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Slide-out Drawer */}
          <Drawer open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DrawerContent width="default" className="flex flex-col h-full bg-surface">
              <DrawerHeader className="border-b border-border bg-surface px-5 py-4 flex-shrink-0">
                <div className="flex items-center justify-between pr-8">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <DrawerTitle className="text-sm font-bold text-slate-900">
                        Notifications
                      </DrawerTitle>
                      {unreadNotificationsCount > 0 ? (
                        <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          {unreadNotificationsCount} unread
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {notifications.length} total
                        </span>
                      )}
                    </div>
                  </div>

                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <DrawerDescription className="sr-only">
                  System and project notifications
                </DrawerDescription>
              </DrawerHeader>

              <DrawerBody className="p-4 space-y-2.5">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-2">
                      <Bell className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900">No notifications yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      You will be notified about project milestones, draws, and alerts here.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isUnread = !notif.read;

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (isUnread) markReadMutation.mutate(notif.id);
                          if (notif.link_url) {
                            setIsNotificationsOpen(false);
                            router.push(notif.link_url);
                          }
                        }}
                        className={`group relative flex items-start gap-3 rounded-xl border p-3.5 transition-all cursor-pointer shadow-2xs ${
                          isUnread
                            ? "border-blue-200 bg-blue-50/40 hover:bg-blue-50/70"
                            : "border-slate-200/80 bg-white hover:bg-slate-50/60"
                        }`}
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                          {notif.severity === "CRITICAL" ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                            </div>
                          ) : notif.severity === "WARNING" ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                          ) : notif.severity === "SUCCESS" ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                              <Check className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                              <Info className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5
                              className={`text-xs font-semibold leading-tight ${
                                isUnread ? "text-slate-900 font-bold" : "text-slate-700"
                              }`}
                            >
                              {notif.title}
                            </h5>
                            {isUnread && (
                              <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>

                          <p className="text-[12px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>

                          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                            <span className="font-medium text-slate-500 uppercase text-[10px] tracking-wider">
                              {notif.type}
                            </span>
                            {notif.created_at && (
                              <>
                                <span>•</span>
                                <span>
                                  {new Date(notif.created_at).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </>
                            )}
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
                    setIsNotificationsOpen(false);
                    router.push("/alerts");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:bg-slate-950 transition-colors cursor-pointer"
                >
                  <span>View All in Alerts Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* User menu */}
          <div className="relative ml-1">
            <button
              onClick={() => {
                setIsUserDropdownOpen(!isUserDropdownOpen);
                setIsProjectDropdownOpen(false);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {currentUser?.avatarInitials || "U"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold leading-none text-slate-800">
                  {currentUser?.name || "User"}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
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
