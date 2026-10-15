"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Building2,
} from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

import { FloatingDemoButton, DemoAccount } from "@/components/auth/floating-demo-button";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("m.vance@vancedev.com");
  const [password, setPassword] = useState("Password123!");
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
        true
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
    <>
      <div className="w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" showSubtitle={true} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to your GroundUp workspace
          </p>
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

          {/* Fixed Credentials Helper */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2.5 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-700">Fixed Login:</span>{" "}
              <code className="text-slate-900 bg-slate-200/70 px-1 py-0.5 rounded text-[11px]">m.vance@vancedev.com</code>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Pass:</span>{" "}
              <code className="text-slate-900 bg-slate-200/70 px-1 py-0.5 rounded text-[11px]">Password123!</code>
            </div>
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
            className="font-semibold text-slate-900 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Moveable Floating Demo Button */}
      <FloatingDemoButton
        onSelectDemo={handleDemoSelect}
        isPending={signIn.isPending}
        activeDemoId={activeDemoId}
        currentEmail={email}
      />
    </>
  );
}
