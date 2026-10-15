"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import {
  NAV_ITEMS,
  ROUTE_ACCESS_MAP,
  WORKSPACE_ROUTE_PERMISSIONS,
  getDefaultRouteForRole,
  getDefaultWorkspaceRoute,
} from "@/lib/navigation";
import { ShieldAlert, ArrowLeft, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: React.ReactNode;
}

const LEGACY_WORKSPACE_SECTIONS = [
  "control-center",
  "documents",
  "budget",
  "reconciliation",
  "draws",
  "timeline",
  "alerts",
  "partners",
  "inbox",
  "directs",
];

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = pathname === "/" || pathname === "/onboarding" || pathname.startsWith("/onboarding");

  const {
    data: session,
    isLoading: isSessionLoading,
    error: sessionError,
    refetch: retrySession,
  } = useQuery({
    queryKey: ["auth-session"],
    queryFn: () => authAdapter.getSession(),
    retry: false,
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (isPublicRoute || pathname.startsWith("/auth/") || isSessionLoading || sessionError || session) return;
    const previouslyAuthenticated =
      typeof window !== "undefined" && window.localStorage.getItem("groundup_session_seen") === "1";
    if (previouslyAuthenticated) {
      window.localStorage.removeItem("groundup_session_seen");
      const returnTo =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname;
      router.replace(`/auth/session-expired?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    const returnTo =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname;
    router.replace(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }, [pathname, router, session, sessionError, isSessionLoading, isPublicRoute]);

  const currentRole = session?.user.role || "OWNER";

  // Check if inside a workspace /projects/[projectId]/... route
  const workspaceMatch = pathname.match(/^\/projects\/([^\/]+)(?:\/([^\/]+))?/);
  const rawProjectId = workspaceMatch && workspaceMatch[1] !== "new" ? workspaceMatch[1] : null;
  const workspaceSection = workspaceMatch ? workspaceMatch[2] || "control-center" : null;

  // Verify project membership for workspace routes
  const memberships = React.useMemo(() => session?.user.project_memberships || [], [session?.user.project_memberships]);
  
  // Track last visited workspace project in localStorage
  React.useEffect(() => {
    if (rawProjectId && typeof window !== "undefined") {
      window.localStorage.setItem("groundup_last_project_id", rawProjectId);
    }
  }, [rawProjectId]);

  const lastProjectId = typeof window !== "undefined" ? window.localStorage.getItem("groundup_last_project_id") : null;
  const sessionUser = session?.user as any;
  const activeProjectId = rawProjectId || lastProjectId || sessionUser?.current_project_id || (memberships[0]?.project_id as string) || null;

  // Legacy route redirect: if user navigates to standalone /budget, /draws, etc., redirect them into the project workspace
  const standaloneMatch = pathname.match(/^\/([^\/]+)$/);
  const standaloneSection = standaloneMatch ? standaloneMatch[1] : null;
  React.useEffect(() => {
    if (!session) return;
    const resolvedProjectId =
      rawProjectId ||
      (typeof window !== "undefined" ? window.localStorage.getItem("groundup_last_project_id") : null) ||
      sessionUser?.current_project_id ||
      (memberships[0]?.project_id as string) ||
      null;

    if (!resolvedProjectId) return;

    if (standaloneSection === "directs") {
      router.replace(`/projects/${resolvedProjectId}/inbox`);
    } else if (standaloneSection === "timeline" || pathname.includes("/timeline")) {
      router.replace(`/projects/${resolvedProjectId}/control-center`);
    } else if (standaloneSection && LEGACY_WORKSPACE_SECTIONS.includes(standaloneSection)) {
      router.replace(`/projects/${resolvedProjectId}/${standaloneSection}`);
    } else if (pathname === "/investor-update" || pathname.includes("/investor-updates")) {
      router.replace(`/projects/${resolvedProjectId}/control-center`);
    }
  }, [pathname, session, rawProjectId, sessionUser, memberships, standaloneSection, router]);

  const workspaceProjectId = rawProjectId;
  const projectMembership = workspaceProjectId
    ? memberships.find((m: any) => m.project_id === workspaceProjectId)
    : null;
  const isUnauthorizedProject = Boolean(workspaceProjectId && !projectMembership);

  // Check if current route is allowed for the active role
  const effectiveRole = (projectMembership?.role as import("@/lib/types").UserRole) || currentRole;
  const sectionAllowedRoles = workspaceSection ? WORKSPACE_ROUTE_PERMISSIONS[workspaceSection] : null;
  const isSectionForbidden = Boolean(sectionAllowedRoles && !sectionAllowedRoles.includes(effectiveRole));

  const matchingRouteKey = Object.keys(ROUTE_ACCESS_MAP).find(
    (route) => route === pathname || (route !== "/control-center" && pathname.startsWith(route))
  );
  const allowedRolesForRoute = matchingRouteKey ? ROUTE_ACCESS_MAP[matchingRouteKey] : undefined;
  const isGlobalAccessDenied = allowedRolesForRoute ? !allowedRolesForRoute.includes(currentRole) : false;

  const isAccessDenied = isGlobalAccessDenied || isSectionForbidden;

  const isAuthRoute = pathname.startsWith("/auth/");
  const isDedicatedFlow = pathname === "/projects/new" || pathname === "/onboarding";

  if (isAuthRoute) {
    return (
      <div className="min-h-screen w-full bg-app text-text-primary">
        {children}
      </div>
    );
  }

  if (isPublicRoute) {
    return (
      <div className="min-h-screen w-full overflow-y-auto bg-app text-text-primary">
        {children}
      </div>
    );
  }

  if (sessionError) {
    return (
      <main className="grid min-h-screen place-items-center bg-app p-6">
        <section className="max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-xs">
          <WifiOff className="mx-auto h-8 w-8 text-warning" aria-hidden="true" />
          <h1 className="mt-4 text-title font-semibold text-text-primary">Can’t verify your session</h1>
          <p className="mt-2 text-body text-text-secondary">
            Check your network connection and retry. Your account data has not been changed.
          </p>
          <Button className="mt-5" onClick={() => void retrySession()} loading={isSessionLoading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </section>
      </main>
    );
  }

  if (isSessionLoading || !session) {
    return (
      <main className="grid min-h-screen place-items-center bg-app" aria-label="Verifying your session">
        <div className="w-full max-w-md animate-pulse space-y-4 px-6">
          <div className="h-8 w-48 rounded-md bg-subtle" />
          <div className="h-40 rounded-lg bg-subtle" />
        </div>
      </main>
    );
  }

  // Standalone dedicated pages (e.g. Onboarding or initial Project Bootstrap) without sidebar or dashboard top-bar
  if (isDedicatedFlow) {
    return (
      <div className="min-h-screen w-full overflow-y-auto bg-app text-text-primary">
        {children}
      </div>
    );
  }

  const isInsideWorkspace = Boolean(workspaceProjectId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-app">
      {/* Sidebar - rendered inside project workspace */}
      {isInsideWorkspace && (
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      )}

      {/* Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <TopBar onToggleSidebar={() => setMobileOpen(!mobileOpen)} />

        {/* Page Content / Route Guard */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full">
          {isUnauthorizedProject ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle text-danger mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h2 className="text-title font-semibold text-text-primary">
                Project Not Found or Access Restricted
              </h2>
              <p className="mt-2 max-w-md text-body text-text-secondary">
                This project does not exist or you have not been granted membership in this project workspace.
              </p>
              <div className="mt-6">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Project Portfolio
                </Link>
              </div>
            </div>
          ) : isAccessDenied ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle text-danger mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h2 className="text-title font-semibold text-text-primary">
                Access Restricted
              </h2>
              <p className="mt-2 max-w-md text-body text-text-secondary">
                Your current role on this project (<strong>{effectiveRole}</strong>) does not have permission
                to view this section. Return to your workspace home or ask a project owner to update your access.
              </p>
              <div className="mt-6">
                <Link
                  href={workspaceProjectId ? getDefaultWorkspaceRoute(effectiveRole as any, workspaceProjectId) : getDefaultRouteForRole(currentRole)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to workspace home
                </Link>
              </div>
            </div>
          ) : (
            <div key={pathname} className="page-enter min-h-full">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
