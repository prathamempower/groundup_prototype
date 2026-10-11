"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const signIn = useMutation({
    mutationFn: () => authAdapter.signIn(email.trim(), password, rememberMe),
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
    signIn.mutate();
  };

  const errorMessage =
    validationError || (signIn.error instanceof Error ? signIn.error.message : "");

  return (
    <div>
      <div className="mb-7">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-subtle text-primary">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">Welcome back</h2>
        <p className="mt-2 text-body text-text-secondary">
          Sign in to continue to your project workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {errorMessage && (
          <div role="alert" className="rounded-md border border-danger bg-danger-subtle px-3 py-2.5 text-body text-danger">
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
            autoFocus
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(validationError && !email)}
            className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body text-text-primary shadow-xs placeholder:text-text-muted focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-label font-medium text-text-primary">Password</label>
            <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
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
              className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 pr-11 text-body text-text-primary shadow-xs placeholder:text-text-muted focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-text-muted hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex min-h-10 items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-border-strong accent-primary"
          />
          Keep me signed in on this device
        </label>
        <Button type="submit" className="h-11 w-full justify-center" loading={signIn.isPending}>
          Sign in
        </Button>
        <p className="text-center text-sm text-text-secondary">
          New to GroundUp?{" "}
          <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
