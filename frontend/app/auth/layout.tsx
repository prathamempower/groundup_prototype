"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, CircleCheck, FileCheck2, ShieldCheck } from "lucide-react";
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
      const completedSignup =
        pathname === "/auth/sign-up" &&
        window.sessionStorage.getItem("groundup_signup_completed") === "1";
      router.replace(
        completedSignup
          ? "/projects/new?firstRun=1"
          : getDefaultRouteForRole(data.user.role)
      );
    }
  }, [data, pathname, router]);

  if (!isSessionExpired && isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-app" aria-label="Checking your session">
        <div className="w-full max-w-sm animate-pulse space-y-4 px-6">
          <div className="h-10 w-40 rounded-md bg-subtle" />
          <div className="h-8 w-56 rounded-md bg-subtle" />
          <div className="h-48 rounded-lg bg-subtle" />
        </div>
      </main>
    );
  }

  if (!isSessionExpired && data?.user) {
    return (
      <main className="grid min-h-screen place-items-center bg-app">
        <p className="text-body text-text-secondary">Opening your workspace…</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen bg-app lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-16">
        <Link href="/auth/login" className="inline-flex w-fit items-center gap-3 rounded-md text-text-primary">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-white">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">GroundUp</span>
        </Link>
        {error && !isSessionExpired && (
          <div className="mx-auto mt-6 w-full max-w-md rounded-md border border-warning bg-warning-subtle p-3 text-body text-text-primary" role="status">
            We couldn’t verify your existing session. You can retry or continue with sign in.
            <Button variant="tertiary" className="ml-2" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        )}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="text-center text-caption text-text-muted">
          Secure project and capital management
        </p>
      </section>

      <aside className="hidden min-h-screen flex-col justify-between bg-primary px-12 py-14 text-white lg:flex xl:px-20">
        <div>
          <p className="text-sm font-medium text-blue-100">GroundUp for real estate development</p>
          <h1 className="mt-10 max-w-lg text-4xl font-semibold leading-tight tracking-tight">
            Keep every project decision grounded in its source.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-blue-100">
            Bring budgets, spend, funding, and field progress into one clear operating view—so your team can act with confidence.
          </p>
        </div>
        <div className="space-y-5 border-t border-white/20 pt-8">
          <p className="text-sm font-semibold">A clearer path from plan to closeout</p>
          <ul className="space-y-4 text-sm text-blue-100">
            <li className="flex items-start gap-3"><FileCheck2 className="mt-0.5 h-4 w-4 shrink-0" />Evidence linked to the numbers your team reviews.</li>
            <li className="flex items-start gap-3"><CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />Approvals and decisions tracked without changing the original baseline.</li>
            <li className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Project access scoped to each person’s role and assignment.</li>
          </ul>
        </div>
      </aside>
    </main>
  );
}
