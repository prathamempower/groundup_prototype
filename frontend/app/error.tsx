"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
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
      <div className="w-full max-w-lg text-center">
        {/* Minimal, dignified icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/90 bg-slate-50 text-slate-700 shadow-2xs">
          <AlertCircle className="h-6 w-6 stroke-[1.75]" />
        </div>

        {/* Heading & Reassurance */}
        <h1 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
          An unexpected error occurred while loading this view. Your project records and workspace data remain safe.
        </p>

        {/* Primary & Secondary Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs transition hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </button>

          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            Return to Projects
          </Link>
        </div>

        {/* Sleek Diagnostic Information Card */}
        <div className="mt-8 rounded-xl border border-slate-200/90 bg-white p-4 text-left shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Diagnostic Details
              </span>
              {error.digest && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 truncate">
                  ID: {error.digest.slice(0, 10)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyDebug}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Info</span>
                  </>
                )}
              </button>

              {error.stack && (
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  <span>{showTechnicalDetails ? "Hide Stack" : "Stack"}</span>
                  {showTechnicalDetails ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-2.5 text-xs text-slate-700 font-mono bg-slate-50 rounded-lg p-2.5 border border-slate-200/70 break-all select-all">
            {error.message || "An unexpected application error was encountered."}
          </div>

          {showTechnicalDetails && error.stack && (
            <div className="mt-2.5 overflow-x-auto rounded-lg bg-slate-950 p-3 text-[11px] font-mono text-slate-300 max-h-44 border border-slate-800">
              <pre className="whitespace-pre-wrap">{error.stack}</pre>
            </div>
          )}
        </div>

        {/* Discreet Subtext */}
        <p className="mt-5 text-xs text-slate-400">
          If this issue persists after reloading, please notify your project administrator.
        </p>
      </div>
    </div>
  );
}
