"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Load ambient structural wireframes purely on the client to avoid SSR hydration shifts
const AmbientStructuralWireframes = dynamic(
  () =>
    import("@/components/ui/AmbientStructuralWireframes").then(
      (m) => m.AmbientStructuralWireframes
    ),
  { ssr: false }
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isSessionExpired = pathname === "/auth/session-expired";

  const { data, error, refetch } = useQuery({
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

  return (
    <div className="min-h-screen bg-slate-50/70 relative flex flex-col items-center justify-center py-6 px-4 sm:px-6 selection:bg-slate-200 overflow-x-hidden">
      {/* Subtle blueprint architectural grid and isometric structural shards */}
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,102,238,0.06),rgba(255,255,255,0))]" aria-hidden="true" />
      <AmbientStructuralWireframes intensity="subtle" />

      {/* Clean Top Escape Hatch */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-20">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-md text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          aria-label="Return to GroundUp home page"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-800" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Form Centerpiece - Optical Center, Auto-Fit, Auto-Height */}
      <main className="relative z-10 w-full max-w-[420px] my-auto flex flex-col items-center">
        {error && !isSessionExpired && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 flex items-center justify-between" role="status">
            <span>Session check unavailable. You can continue signing in.</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-amber-900 font-semibold" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
