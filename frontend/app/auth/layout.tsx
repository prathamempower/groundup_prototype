"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isSessionExpired = pathname === "/auth/session-expired";

  const { data } = useQuery({
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
    <div className="relative flex min-h-dvh h-dvh max-h-dvh overflow-hidden w-full flex-col bg-[#FAF9F6] text-slate-900 antialiased">
      {/* ── NATURAL MOVING AMBIENT GRADIENT MESH ───────────────────────────── */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-[46rem] h-[46rem] rounded-full bg-blue-300/25 blur-[130px] animate-ambient-1"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-[48rem] h-[48rem] rounded-full bg-amber-200/30 blur-[140px] animate-ambient-2"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 left-1/4 w-[38rem] h-[38rem] rounded-full bg-indigo-200/20 blur-[120px] animate-ambient-3"
        aria-hidden="true"
      />

      {/* Blueprint Grid Watermark */}
      <div className="blueprint-grid absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true" />

      {/* ── TOP HEADER (RESPONSIVE FULL-WIDTH HORIZONTAL PADDING) ──────────── */}
      <header className="mx-auto flex w-full items-center justify-between px-4 py-1.5 sm:px-6 sm:py-2 lg:px-8 shrink-0 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center hover:opacity-85 transition-opacity"
          aria-label="GroundUp Home"
        >
          <BrandLogo size="md" theme="light" showWordmark={true} />
        </Link>

        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-750 hover:text-slate-950 hover:border-slate-400 transition-all cursor-pointer"
          aria-label="Return to GroundUp home page"
        >
          <ArrowLeft className="size-4 text-slate-400 group-hover:text-slate-800 transition-transform group-hover:-translate-x-0.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* ── EYE-LEVEL GOLDEN RATIO CONSOLE (MAX-W-2XL, ZERO SCROLL) ─────────── */}
      <main className="flex w-full flex-1 flex-col justify-start items-center pt-1 sm:pt-2 lg:pt-3 pb-1 sm:pb-2 px-4 sm:px-6 lg:px-8 relative z-10 min-h-0">
        <div className="w-full max-w-2xl min-w-0">
          {children}
        </div>
      </main>

      {/* ── RESPONSIVE FOOTER ──────────────────────────────────────────────── */}
      <footer className="mt-auto w-full border-t border-slate-200/70 px-4 py-1.5 sm:px-6 sm:py-2 text-center text-xs text-slate-500 lg:px-8 relative z-10 shrink-0">
        © {new Date().getFullYear()} GroundUp
      </footer>
    </div>
  );
}
