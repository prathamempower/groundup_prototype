"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project } from "@/lib/types";
import {
  Bell,
  ChevronDown,
  Building,
  Check,
  AlertTriangle,
  Info,
  AlertCircle,
  Menu,
  LogOut,
} from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";

interface TopBarProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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
        {/* Left: Mobile Toggle & Project Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-subtle hover:text-text-primary md:hidden"
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Project Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProjectDropdownOpen(!isProjectDropdownOpen);
                setIsUserDropdownOpen(false);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-md border border-border bg-subtle/50 px-3 py-1.5 text-left text-body transition-all hover:bg-subtle hover:border-border-strong focus-visible:outline-primary shadow-xs"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary-subtle text-primary">
                <Building className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-body font-semibold leading-tight text-text-primary">
                  {currentProject?.name || "Select Project"}
                </span>
              </div>
              <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                {currentProject?.lifecycle_stage || "ACTIVE"}
              </span>
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </button>

            {/* Project Switcher Dropdown */}
            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 rounded-md border border-border bg-surface p-1 shadow-overlay z-50">
                <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Switch Project
                </div>
                {projects.map((proj) => {
                  const isSelected = proj.id === currentProjectId;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => switchProjectMutation.mutate(proj.id)}
                      className={`flex w-full items-center justify-between rounded px-2 py-2 text-left text-body transition-colors ${
                        isSelected
                          ? "bg-primary-subtle font-medium text-primary"
                          : "text-text-primary hover:bg-subtle"
                      }`}
                    >
                      <div>
                        <div className="text-body font-medium">{proj.name}</div>
                        <div className="text-caption text-text-muted">{proj.address}</div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications & User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsUserDropdownOpen(false);
                setIsProjectDropdownOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-subtle hover:text-text-primary focus-visible:outline-primary"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white leading-none tabular-nums">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-1 w-88 rounded-lg border border-border bg-surface shadow-overlay z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="border-b border-border px-3.5 py-2.5 flex items-center justify-between bg-subtle/50">
                  <div className="flex items-center gap-2">
                    <span className="text-label font-bold text-text-primary">System Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="rounded bg-danger/10 text-danger text-caption font-bold px-1.5 py-0.2">
                        {unreadNotificationsCount} unread
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-caption font-medium text-primary hover:text-primary-hover"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-caption text-text-muted">
                      No notifications to display.
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
                        className={`flex items-start gap-2.5 p-3 cursor-pointer transition-colors ${
                          notif.read ? "bg-surface hover:bg-subtle/50" : "bg-primary-subtle/20 hover:bg-primary-subtle/30"
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
                            <h5 className={`text-caption ${notif.read ? "font-semibold text-text-primary" : "font-bold text-text-primary"}`}>
                              {notif.title}
                            </h5>
                            {!notif.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-caption text-text-secondary mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-border p-2 bg-subtle/30 text-center">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      router.push("/settings");
                    }}
                    className="text-caption font-semibold text-primary hover:text-primary-hover"
                  >
                    View All in Settings &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

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
