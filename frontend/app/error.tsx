"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle text-danger mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="text-title font-semibold text-text-primary">System Error</h2>
      <p className="mt-2 max-w-md text-body text-text-secondary">
        {error.message || "An unexpected error occurred while processing the request."}
      </p>
      {error.digest && (
        <span className="mt-2 text-caption font-mono text-text-muted">
          Digest ID: {error.digest}
        </span>
      )}
      <div className="mt-6">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Request
        </button>
      </div>
    </div>
  );
}
