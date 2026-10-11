import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-text-muted mb-4">
        <FileQuestion className="h-6 w-6" />
      </div>
      <h2 className="text-title font-semibold text-text-primary">Page Not Found</h2>
      <p className="mt-2 max-w-md text-body text-text-secondary">
        The record, document, or workspace view you requested does not exist or may have been archived.
      </p>
      <div className="mt-6">
        <Link
          href="/control-center"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Control Center
        </Link>
      </div>
    </div>
  );
}
