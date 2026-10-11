import Link from "next/link";
import { Clock3, LogIn } from "lucide-react";

export default function SessionExpiredPage() {
  return (
    <div>
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-warning-subtle text-warning">
        <Clock3 className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-text-primary">Your session has ended</h2>
      <p className="mt-2 text-body text-text-secondary">
        Sign in again to continue. Your work is available after your account is verified.
      </p>
      <Link href="/auth/login" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover">
        <LogIn className="h-4 w-4" /> Sign in again
      </Link>
    </div>
  );
}
