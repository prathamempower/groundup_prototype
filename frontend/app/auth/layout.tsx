"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isSessionExpired = pathname === "/auth/session-expired";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["auth-session"],
    queryFn: () => authAdapter.getSession(),
    enabled: !isSessionExpired,
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (data?.user) {
      if (pathname === "/auth/sign-up") {
        const completedSignup = window.sessionStorage.getItem("groundup_signup_completed") === "1";
        if (completedSignup) {
          router.replace(getDefaultRouteForRole(data.user.role));
        }
        return;
      }
      router.replace(getDefaultRouteForRole(data.user.role));
    }
  }, [data, pathname, router]);

  if (!isSessionExpired && isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8fafc]" aria-label="Checking your session">
        <div className="w-full max-w-sm animate-pulse space-y-4 px-6">
          <div className="h-10 w-40 rounded-md bg-slate-200" />
          <div className="h-8 w-56 rounded-md bg-slate-200" />
          <div className="h-48 rounded-lg bg-slate-200" />
        </div>
      </main>
    );
  }

  if (!isSessionExpired && data?.user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8fafc]">
        <p className="text-sm font-medium text-slate-500">Opening your workspace…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[440px]">
        {error && !isSessionExpired && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center justify-between" role="status">
            <span>Session check unavailable. You can continue signing in.</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-amber-900 font-semibold" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Clean, perfectly structured enterprise card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-overlay">
          {children}
        </div>
      </div>
    </main>
  );
}
