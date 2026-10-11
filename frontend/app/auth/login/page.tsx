"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Building2,
  HardHat,
  BarChart3,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

interface DemoAccount {
  id: string;
  role: string;
  name: string;
  email: string;
  icon: typeof Building2;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "owner",
    role: "Owner",
    name: "Marcus Vance",
    email: "m.vance@vancedev.com",
    icon: Building2,
  },
  {
    id: "cfo",
    role: "CFO",
    name: "Sarah Lin",
    email: "s.lin@vancedev.com",
    icon: BarChart3,
  },
  {
    id: "pm",
    role: "PM",
    name: "David Ross",
    email: "d.ross@vancedev.com",
    icon: Briefcase,
  },
  {
    id: "gc",
    role: "GC",
    name: "Frank Miller",
    email: "frank@apexconstruction.com",
    icon: HardHat,
  },
  {
    id: "investor",
    role: "Investor",
    name: "Elena Rostova",
    email: "e.rostova@meridiancap.com",
    icon: TrendingUp,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("m.vance@vancedev.com");
  const [password, setPassword] = useState("Password123!");
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
      setValidationError("Please enter a valid work email address.");
      return;
    }
    if (!password) {
      setValidationError("Please enter your password.");
      return;
    }
    setActiveDemoId(null);
    signIn.mutate({});
  };

  const handleDemoSelect = (demo: DemoAccount) => {
    setValidationError("");
    setEmail(demo.email);
    const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "Password123!";
    setPassword(demoPassword);
    setActiveDemoId(demo.id);
    signIn.mutate({ emailToUse: demo.email, passwordToUse: demoPassword });
  };

  const errorMessage =
    validationError || (signIn.error instanceof Error ? signIn.error.message : "");

  return (
    <div className="w-full space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm mb-1">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500">
          Sign in to your GroundUp workspace
        </p>
      </div>

      {/* DEMO_ACCOUNTS Role Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Quick demo sign-in
          </span>
          <span className="text-[11px] text-slate-400">Click to switch</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {DEMO_ACCOUNTS.map((demo) => {
            const Icon = demo.icon;
            const isSelected = email === demo.email;
            const isPendingThis = signIn.isPending && activeDemoId === demo.id;

            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleDemoSelect(demo)}
                disabled={signIn.isPending}
                title={`${demo.role}: ${demo.name} (${demo.email})`}
                className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition-all focus:outline-none ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs ring-1 ring-blue-600/30"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                } ${isPendingThis ? "animate-pulse" : ""}`}
              >
                <Icon className={`h-4 w-4 mb-1 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
                <span className="text-[11px] font-bold leading-tight truncate w-full">
                  {demo.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Or credentials
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700"
          >
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
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/15"
            placeholder="name@company.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
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
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 pr-10 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/15"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
            />
            <span>Keep me signed in</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={signIn.isPending}
          className="h-10 w-full rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60 flex items-center justify-center cursor-pointer"
        >
          {signIn.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* Footer */}
      <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/sign-up"
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Create organization
        </Link>
      </div>
    </div>
  );
}
