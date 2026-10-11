"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Building2,
  HardHat,
  BarChart3,
  Briefcase,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

interface DemoAccount {
  id: string;
  label: string;
  roleTitle: string;
  roleBadge: string;
  name: string;
  email: string;
  icon: typeof Building2;
  colorClass: string;
  badgeBg: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "owner",
    label: "Login as Owner",
    roleTitle: "Developer & Owner",
    roleBadge: "OWNER",
    name: "Marcus Vance",
    email: "m.vance@vancedev.com",
    icon: Building2,
    colorClass: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  },
  {
    id: "cfo",
    label: "Login as CFO",
    roleTitle: "Finance & Treasury",
    roleBadge: "CFO",
    name: "Sarah Lin",
    email: "s.lin@vancedev.com",
    icon: BarChart3,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  },
  {
    id: "pm",
    label: "Login as Project Manager",
    roleTitle: "Field Lead & PM",
    roleBadge: "PM",
    name: "David Ross",
    email: "d.ross@vancedev.com",
    icon: Briefcase,
    colorClass: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  },
  {
    id: "gc",
    label: "Login as General Contractor",
    roleTitle: "Submissions & Trades",
    roleBadge: "GC",
    name: "Frank Miller",
    email: "frank@apexconstruction.com",
    icon: HardHat,
    colorClass: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
  {
    id: "investor",
    label: "Login as Investor",
    roleTitle: "Capital Partner / LP",
    roleBadge: "INVESTOR",
    name: "Elena Rostova",
    email: "e.rostova@meridiancap.com",
    icon: TrendingUp,
    colorClass: "text-indigo-600 dark:text-indigo-400",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);

  const signIn = useMutation({
    mutationFn: ({
      emailToUse,
      passwordToUse,
    }: {
      emailToUse?: string;
      passwordToUse?: string;
    } = {}) =>
      authAdapter.signIn(
        (emailToUse || email).trim(),
        passwordToUse || password,
        rememberMe
      ),
    onSuccess: ({ user }) => {
      window.localStorage.setItem("groundup_session_seen", "1");
      queryClient.setQueryData(["auth-session"], { user });
      queryClient.setQueryData(["me"], { data: user });
      const requestedPath = new URLSearchParams(window.location.search).get("returnTo");
      const target =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : getDefaultRouteForRole(user.role);
      router.replace(target);
    },
    onError: () => {
      setActiveDemoId(null);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError("Enter a valid work email address.");
      return;
    }
    if (!password) {
      setValidationError("Enter your password.");
      return;
    }
    setActiveDemoId(null);
    signIn.mutate({});
  };

  const handleDemoLogin = (demo: DemoAccount) => {
    setValidationError("");
    setEmail(demo.email);
    const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "";
    setPassword(demoPassword);
    setActiveDemoId(demo.id);
    signIn.mutate({ emailToUse: demo.email, passwordToUse: demoPassword });
  };

  const errorMessage =
    validationError || (signIn.error instanceof Error ? signIn.error.message : "");

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-subtle text-primary">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">Welcome back</h2>
        <p className="mt-1 text-body text-text-secondary">
          Sign in to access your project workspace.
        </p>
      </div>

      {/* One-Click Project Roles Demo Section */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Project Roles — Instant Login</span>
          </div>
          <span className="text-[11px] text-text-muted">Pre-seeded demo accounts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((demo, idx) => {
            const Icon = demo.icon;
            const isThisLoading = signIn.isPending && activeDemoId === demo.id;
            const isLastOdd = idx === DEMO_ACCOUNTS.length - 1 && DEMO_ACCOUNTS.length % 2 !== 0;
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleDemoLogin(demo)}
                disabled={signIn.isPending}
                className={`group flex flex-col items-start justify-between rounded-lg border border-border bg-surface p-2.5 text-left transition-all hover:border-primary hover:bg-subtle/80 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${
                  isLastOdd ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-4 w-4 ${demo.colorClass}`} />
                    <span className="text-xs font-semibold text-text-primary group-hover:text-primary">
                      {demo.label}
                    </span>
                  </div>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${demo.badgeBg}`}>
                    {demo.roleBadge}
                  </span>
                </div>
                <div className="mt-1 flex w-full items-center justify-between text-[11px] text-text-muted">
                  <span className="truncate">{demo.name}</span>
                  <span className="text-[10px] text-text-muted/80">{demo.roleTitle}</span>
                </div>
                {isThisLoading && (
                  <span className="mt-1 text-[10px] font-medium text-primary animate-pulse">
                    Authenticating…
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-border" />
        <span className="absolute bg-app px-2 text-xs uppercase tracking-wider text-text-muted">
          Or sign in manually
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-md border border-danger bg-danger-subtle px-3 py-2.5 text-body text-danger"
          >
            {errorMessage}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-label font-medium text-text-primary">
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(validationError && !email)}
            className="h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-body text-text-primary shadow-xs placeholder:text-text-muted focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-label font-medium text-text-primary">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(validationError && !password)}
              className="h-10 w-full rounded-md border border-border-strong bg-surface px-3 pr-10 text-body text-text-primary shadow-xs placeholder:text-text-muted focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-border-strong accent-primary"
            />
            Keep me signed in
          </label>
        </div>

        <Button
          type="submit"
          className="h-10 w-full justify-center"
          loading={signIn.isPending && activeDemoId === null}
        >
          Sign in
        </Button>

        <p className="text-center text-xs text-text-secondary pt-2">
          New to GroundUp?{" "}
          <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
