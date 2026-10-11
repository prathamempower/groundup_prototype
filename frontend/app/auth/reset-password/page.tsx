"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [completed, setCompleted] = useState(false);
  const reset = useMutation({
    mutationFn: () => {
      const token = new URLSearchParams(window.location.search).get("token") || "";
      return authAdapter.resetPassword(token, password);
    },
    onSuccess: () => setCompleted(true),
  });
  const token = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("token")
    : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");
    if (!token) {
      setValidationError("This reset link is incomplete. Request a new one to continue.");
      return;
    }
    if (password.length < 8) {
      setValidationError("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("The passwords don’t match.");
      return;
    }
    reset.mutate();
  }

  return (
    <div>
      <div className="mb-7">
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-primary-subtle text-primary">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
          {completed ? "Password updated" : "Choose a new password"}
        </h2>
        <p className="mt-2 text-body text-text-secondary">
          {completed
            ? "Your password has been changed. Sign in with your new password."
            : "Create a new password with at least 8 characters."}
        </p>
      </div>
      {completed ? (
        <Button className="h-11 w-full justify-center" onClick={() => router.replace("/auth/login")}>Continue to sign in</Button>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          {(validationError || (reset.error instanceof Error && reset.error.message)) && (
            <div role="alert" className="rounded-md border border-danger bg-danger-subtle px-3 py-2.5 text-body text-danger">
              {validationError || (reset.error as Error).message}
            </div>
          )}
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-label font-medium text-text-primary">New password</label>
            <div className="relative">
              <input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" autoFocus required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 pr-11 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-text-muted hover:text-text-primary">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-label font-medium text-text-primary">Confirm new password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
          </div>
          <Button type="submit" className="h-11 w-full justify-center" loading={reset.isPending}>Update password</Button>
          <p className="text-center text-sm text-text-secondary">
            Reset link expired? <Link href="/auth/forgot-password" className="font-semibold text-primary hover:underline">Request another</Link>
          </p>
        </form>
      )}
    </div>
  );
}
