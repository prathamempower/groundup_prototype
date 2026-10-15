"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

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
      if (pathname === "/auth/sign-up" || pathname === "/auth/signup" || pathname === "/signup") {
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
      <main className="grid min-h-screen place-items-center bg-slate-50 relative" aria-label="Checking your session">
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
      <main className="grid min-h-screen place-items-center bg-slate-50 relative">
        <p className="text-sm font-medium text-slate-500">Opening your workspace…</p>
      </main>
    );
  }

  const isSwitchCardPage = 
    pathname === "/auth/login" || 
    pathname === "/auth/sign-up" || 
    pathname === "/auth/signup" || 
    pathname === "/signup" || 
    pathname === "/login";

  return (
    <div className="min-h-screen bg-slate-50/70 relative flex flex-col justify-between overflow-x-hidden selection:bg-slate-200">
      {/* Subtle blueprint architectural grid for visual depth */}
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,102,238,0.06),rgba(255,255,255,0))]" aria-hidden="true" />

      {/* Top Header with Exit to Home */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          aria-label="Return to GroundUp home page"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5 text-slate-500 group-hover:text-slate-900" />
          <span>Back to Home</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 hover:opacity-85 transition-opacity"
          aria-label="GroundUp AI Home"
        >
          <BrandLogo size="sm" />
        </Link>
      </header>

      {/* Main Form Centerpiece */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
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
          {isSwitchCardPage ? (
            children
          ) : (
            <div className="rounded-xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-overlay">
              {children}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Compliance Trust Bar */}
      <footer className="relative z-20 w-full py-4 px-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
        <ShieldCheck className="size-3.5 text-slate-400" />
        <span>Enterprise Construction Security · CA Civil Code § 8132 to § 8138 · AIA A201 Compliance</span>
      </footer>
    </div>
  );
}
