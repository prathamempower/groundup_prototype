"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { Button } from "@/components/ui/button";

function passwordStrength(password: string): number {
  return [
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

export default function SignUpPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [organization, setOrganization] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const strength = useMemo(() => passwordStrength(password), [password]);

  const signUp = useMutation({
    mutationFn: () =>
      authAdapter.signUp({
        organization_name: organization.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
      }),
    onSuccess: ({ user }) => {
        window.localStorage.setItem("groundup_session_seen", "1");
        window.sessionStorage.setItem("groundup_signup_completed", "1");
        queryClient.setQueryData(["auth-session"], { user });
        queryClient.setQueryData(["me"], { data: user });
        router.replace("/projects/new?firstRun=1");
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (!organization.trim() || !firstName.trim() || !lastName.trim()) {
      setErrorMessage("Enter your organization name and full name to continue.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Enter a valid work email address.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Use at least 8 characters for your password.");
      return;
    }
    signUp.mutate();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">Create your account</h2>
        <p className="mt-2 text-body text-text-secondary">
          Set up your owner account and organization to start a project workspace.
        </p>
      </div>
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {(errorMessage || (signUp.error instanceof Error && signUp.error.message)) && (
          <div role="alert" className="rounded-md border border-danger bg-danger-subtle px-3 py-2.5 text-body text-danger">
            {errorMessage || (signUp.error as Error).message}
          </div>
        )}
        <div>
          <label htmlFor="organization" className="mb-1.5 block text-label font-medium text-text-primary">Organization name</label>
          <input id="organization" autoComplete="organization" required value={organization} onChange={(event) => setOrganization(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="mb-1.5 block text-label font-medium text-text-primary">First name</label>
            <input id="first-name" autoComplete="given-name" required value={firstName} onChange={(event) => setFirstName(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
          </div>
          <div>
            <label htmlFor="last-name" className="mb-1.5 block text-label font-medium text-text-primary">Last name</label>
            <input id="last-name" autoComplete="family-name" required value={lastName} onChange={(event) => setLastName(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
          </div>
        </div>
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-label font-medium text-text-primary">Work email</label>
          <input id="signup-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="signup-password" className="mb-1.5 block text-label font-medium text-text-primary">Password</label>
          <div className="relative">
            <input id="signup-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 pr-11 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-text-muted hover:text-text-primary">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-caption text-text-secondary">Use 8 or more characters. A longer passphrase is harder to guess.</p>
          {password && (
            <div className="mt-2" aria-label={`Password strength ${strength} of 4`}>
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((segment) => (
                  <span key={segment} className={`h-1.5 flex-1 rounded-sm ${strength >= segment ? "bg-success" : "bg-muted"}`} />
                ))}
              </div>
              <span className="mt-1 block text-caption text-text-muted">
                {strength < 2 ? "Add variety for a stronger password." : strength < 4 ? "Good start. A longer passphrase is even better." : "Strong password"}
              </span>
            </div>
          )}
        </div>
        <Button type="submit" className="h-11 w-full justify-center" loading={signUp.isPending}>
          Create account and organization
        </Button>
        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
