import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div>
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-info-subtle text-info">
        <MailCheck className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-text-primary">Check your email</h2>
      <p className="mt-2 text-body text-text-secondary">
        If your organization requires email verification, use the verification link sent to your work address. If you have already verified your email, continue to sign in.
      </p>
      <Link href="/auth/login" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover">
        Continue to sign in
      </Link>
    </div>
  );
}
