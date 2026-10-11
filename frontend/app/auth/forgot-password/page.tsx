"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, MailCheck } from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");
  const requestReset = useMutation({
    mutationFn: () => authAdapter.requestPasswordReset(email.trim()),
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError("Enter the email address for your GroundUp account.");
      return;
    }
    requestReset.mutate();
  }

  return (
    <div>
      <div className="mb-7">
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-primary-subtle text-primary">
          <MailCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
          {submitted ? "Check your inbox" : "Reset your password"}
        </h2>
        <p className="mt-2 text-body text-text-secondary">
          {submitted
            ? "If an account matches that address, password reset instructions are on their way."
            : "Enter the email address associated with your account. We’ll send a secure reset link if it matches."}
        </p>
      </div>
      {!submitted ? (
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          {(validationError || (requestReset.error instanceof Error && requestReset.error.message)) && (
            <div role="alert" className="rounded-md border border-danger bg-danger-subtle px-3 py-2.5 text-body text-danger">
              {validationError || (requestReset.error as Error).message}
            </div>
          )}
          <div>
            <label htmlFor="reset-email" className="mb-1.5 block text-label font-medium text-text-primary">Work email</label>
            <input id="reset-email" type="email" autoComplete="email" autoFocus required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/20" />
          </div>
          <Button type="submit" className="h-11 w-full justify-center" loading={requestReset.isPending}>Send reset link</Button>
        </form>
      ) : (
        <div className="rounded-md border border-info bg-info-subtle p-4 text-body text-text-primary" role="status">
          Check your email and follow the link to set a new password. The link expires for your security.
        </div>
      )}
      <Link href="/auth/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </div>
  );
}
