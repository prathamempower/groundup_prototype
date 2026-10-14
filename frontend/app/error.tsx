"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    // Log unexpected errors cleanly
    console.error("Application boundary caught error:", error);
  }, [error]);

  const handleCopyDebug = () => {
    const debugInfo = [
      `Error: ${error.message || "Unknown Application Error"}`,
      `Digest: ${error.digest || "None"}`,
      `Time: ${new Date().toISOString()}`,
      `URL: ${typeof window !== "undefined" ? window.location.href : "SSR"}`,
      `Stack: ${error.stack || "Not available"}`,
    ].join("\n");

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(debugInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-xl text-center">
        {/* Visual Badge / Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-rose-200 bg-rose-50/80 shadow-xs">
          <AlertTriangle className="h-8 w-8 text-rose-600" />
        </div>

        {/* Status Pill */}
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
          <span>Application Notice</span>
          <span>•</span>
          <span>Temporary Disruption</span>
        </div>

        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Something unexpected happened
        </h1>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          We encountered a problem loading this screen. Your workspace data is safe and has not been affected.
        </p>

        {/* Action Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </button>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4 text-slate-500" />
            Return to Projects
          </Link>
        </div>

        {/* Technical Details Card */}
        <div className="mt-8 rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Diagnostic Information
              </span>
              {error.digest && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                  ID: {error.digest.slice(0, 10)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyDebug}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Info</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition"
              >
                <span>{showTechnicalDetails ? "Hide" : "Details"}</span>
                {showTechnicalDetails ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-600 font-mono bg-slate-50 rounded-lg p-2.5 border border-slate-100 break-words">
            {error.message || "An unexpected system error was encountered."}
          </div>

          {showTechnicalDetails && error.stack && (
            <div className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-[11px] font-mono text-slate-300 max-h-48">
              <pre className="whitespace-pre-wrap">{error.stack}</pre>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-6 text-xs text-slate-400">
          If this issue persists, please share the diagnostic ID with your technical administrator.
        </p>
      </div>
    </div>
  );
}
