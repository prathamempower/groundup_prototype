"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { NAV_ITEMS, ROUTE_ACCESS_MAP, getDefaultRouteForRole } from "@/lib/navigation";
import { ShieldAlert, ArrowLeft, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    if (pathname.startsWith("/auth/") || isSessionLoading || sessionError || session) return;
    const previouslyAuthenticated =
      typeof window !== "undefined" && window.localStorage.getItem("groundup_session_seen") === "1";
    if (previouslyAuthenticated) {
      router.replace("/auth/session-expired");
      return;
    }
    const returnTo =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname;
    router.replace(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }, [pathname, router, session, sessionError, isSessionLoading]);

  const currentRole = session?.user.role || "OWNER";

  // Check if current route is allowed for the active role
  const matchingRouteKey = Object.keys(ROUTE_ACCESS_MAP).find(
    (route) => route === pathname || (route !== "/control-center" && pathname.startsWith(route))
  );

  const allowedRolesForRoute = matchingRouteKey ? ROUTE_ACCESS_MAP[matchingRouteKey] : undefined;
  const isAccessDenied = allowedRolesForRoute ? !allowedRolesForRoute.includes(currentRole) : false;

  const isAuthRoute = pathname.startsWith("/auth/");
  const isDedicatedFlow = pathname === "/projects/new" || pathname === "/onboarding";

  if (isAuthRoute) {
    return (
      <div className="min-h-screen w-full bg-app text-text-primary">
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-app">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar onToggleSidebar={() => setMobileOpen(!mobileOpen)} />

        {/* Page Content / Route Guard */}
        <main className="flex-1 overflow-y-auto">
          {isAccessDenied ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle text-danger mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h2 className="text-title font-semibold text-text-primary">
                Access Restricted
              </h2>
              <p className="mt-2 max-w-md text-body text-text-secondary">
                Your current role (<strong>{currentRole}</strong>) does not have permission
                to view this workspace. Return to your role home or ask an organization owner to update your access.
              </p>
              <div className="mt-6">
                <Link
                  href={getDefaultRouteForRole(currentRole)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to your home workspace
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
