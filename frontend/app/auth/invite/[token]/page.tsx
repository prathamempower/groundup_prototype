"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, ShieldCheck, UserRoundCheck } from "lucide-react";
import { authAdapter, AuthApiError } from "@/lib/api/adapters/auth-adapter";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = params.token;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const invitation = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => authAdapter.getInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });

  const accept = useMutation({
    mutationFn: () =>
      authAdapter.acceptInvitation(token, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
      }),
    onSuccess: ({ user }) => {
        window.localStorage.setItem("groundup_session_seen", "1");
        queryClient.setQueryData(["auth-session"], { user });
      queryClient.setQueryData(["me"], { data: user });
      router.replace(
        invitation.data?.project_id
          ? `/onboarding?projectId=${encodeURIComponent(invitation.data.project_id)}`
          : "/onboarding"
      );
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");
    if (!firstName.trim() || !lastName.trim()) {
      setValidationError("Enter your first and last name.");
    } else if (password.length < 8) {
      setValidationError("Use at least 8 characters for your password.");
    } else if (password !== confirmPassword) {
      setValidationError("The passwords don’t match.");
    } else {
      accept.mutate();
    }
  }

  if (invitation.isLoading) {
    return (
      <div className="animate-pulse space-y-4" aria-label="Loading invitation">
        <div className="h-8 w-56 rounded bg-subtle" />
        <div className="h-24 rounded-md bg-subtle" />
        <div className="h-52 rounded-md bg-subtle" />
      </div>
    );
  }

  const invite = invitation.data;
  const inviteProblem =
    invite?.status === "EXPIRED" ? "This invitation has expired." :
    invite?.status === "REVOKED" ? "This invitation has been revoked." :
    invite?.status === "ACCEPTED" ? "This invitation has already been accepted." :
    invitation.error instanceof AuthApiError && invitation.error.status === 404
      ? "This invitation link is invalid or no longer available."
      : invitation.error instanceof Error
        ? invitation.error.message
        : "";

  if (!invite || invite.status !== "PENDING") {
    return (
      <div>
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-danger-subtle text-danger">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary">Invitation unavailable</h2>
        <p className="mt-2 text-body text-text-secondary">
          {inviteProblem || "Ask the organization owner to send a new invitation."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/auth/login" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover">Go to sign in</Link>
          <p className="self-center text-caption text-text-secondary">Ask the organization owner to send a new invitation if you still need access.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-primary-subtle text-primary">
          <UserRoundCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">Accept your invitation</h2>
        <p className="mt-2 text-body text-text-secondary">
          Set up your account to join {invite.organization_name}.
        </p>
      </div>
      <section aria-label="Invitation scope" className="mb-6 rounded-md border border-border bg-subtle/60 p-4">
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-text-muted">Organization</dt><dd className="mt-0.5 font-medium text-text-primary">{invite.organization_name}</dd></div>
          <div><dt className="text-text-muted">Role</dt><dd className="mt-0.5 font-medium text-text-primary">{invite.role}</dd></div>
          <div><dt className="text-text-muted">Project scope</dt><dd className="mt-0.5 font-medium text-text-primary">{invite.project_name || "Organization-wide access"}</dd></div>
          <div><dt className="text-text-muted">Access scope</dt><dd className="mt-0.5 font-medium text-text-primary">{invite.scope}</dd></div>
          <div className="sm:col-span-2"><dt className="text-text-muted">Invited email</dt><dd className="mt-0.5 font-medium text-text-primary">{invite.email}</dd></div>
        </dl>
        <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-caption text-text-secondary">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          Your role and project access are set by the organization owner.
        </p>
      </section>
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {(validationError || (accept.error instanceof Error && accept.error.message)) && (
          <div role="alert" className="rounded-md border border-danger bg-danger-subtle px-3 py-2.5 text-body text-danger">
            {validationError || (accept.error as Error).message}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="invite-first-name" className="mb-1.5 block text-label font-medium text-text-primary">First name</label>
            <input id="invite-first-name" autoComplete="given-name" autoFocus required value={firstName} onChange={(event) => setFirstName(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
          </div>
          <div>
            <label htmlFor="invite-last-name" className="mb-1.5 block text-label font-medium text-text-primary">Last name</label>
            <input id="invite-last-name" autoComplete="family-name" required value={lastName} onChange={(event) => setLastName(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
          </div>
        </div>
        <div>
          <label htmlFor="invite-password" className="mb-1.5 block text-label font-medium text-text-primary">Create password</label>
          <div className="relative">
            <input id="invite-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 pr-11 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-text-muted hover:text-text-primary">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-caption text-text-muted">Use at least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="invite-confirm-password" className="mb-1.5 block text-label font-medium text-text-primary">Confirm password</label>
          <input id="invite-confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
        </div>
        <Button type="submit" className="h-11 w-full justify-center" loading={accept.isPending}>Accept invitation and continue</Button>
      </form>
    </div>
  );
}
