"use client";

import React, { useState } from "react";
import { SourceCitation } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { FileText, ExternalLink, X, ShieldCheck } from "lucide-react";

interface SourcesModalProps {
  figureLabel: string;
  amountOrValue: string;
  basis: string;
  citations?: SourceCitation[];
  isOpen: boolean;
  onClose: () => void;
}

export function SourcesModal({
  figureLabel,
  amountOrValue,
  basis,
  citations = [],
  isOpen,
  onClose,
}: SourcesModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sources-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-overlay">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wider text-text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Source Verification Trace
            </div>
            <h2 id="sources-modal-title" className="text-section font-semibold text-text-primary mt-1">
              {figureLabel}
            </h2>
            <div className="text-title font-bold text-text-primary tabular-nums mt-0.5">
              {amountOrValue}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted hover:bg-subtle hover:text-text-primary focus-visible:outline-primary"
            aria-label="Close sources modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Basis note */}
        <div className="mt-4 rounded-md border border-border bg-subtle/60 p-3">
          <div className="text-caption font-medium uppercase text-text-secondary">Calculation Basis</div>
          <p className="mt-0.5 text-body text-text-primary">{basis || "Incomplete: Basis not documented"}</p>
        </div>

        {/* Citations List */}
        <div className="mt-4">
          <div className="text-label font-semibold text-text-primary mb-2">
            Contributing Evidence ({citations.length})
          </div>

          {citations.length === 0 ? (
            <div className="rounded border border-dashed border-border p-4 text-center text-caption text-text-muted">
              No direct document citations attached to this figure. Basis is provisional.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {citations.map((cite, index) => (
                <div
                  key={index}
                  className="rounded-md border border-border bg-surface p-3 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-body font-medium text-text-primary truncate">
                        {cite.document_name}
                      </span>
                    </div>
                    <span className="rounded bg-primary-subtle px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {cite.extraction_version}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-caption text-text-secondary">
                    <div>
                      <span className="text-text-muted">Location: </span>
                      {cite.sheet_name
                        ? `${cite.sheet_name} (Row ${cite.row_number})`
                        : cite.page_number
                        ? `Page ${cite.page_number}`
                        : "Full Document"}
                    </div>
                    <div>
                      <span className="text-text-muted">Reviewer: </span>
                      {cite.reviewer}
                    </div>
                  </div>

                  <div className="mt-1 text-caption text-text-muted">
                    Reviewed: {formatDateTime(cite.reviewed_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-subtle px-4 py-1.5 text-body font-medium text-text-primary hover:bg-subtle/80 focus-visible:outline-primary"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
}

export function SourcesButton({
  figureLabel,
  amountOrValue,
  basis,
  citations,
}: {
  figureLabel: string;
  amountOrValue: string;
  basis: string;
  citations?: SourceCitation[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-caption font-medium text-primary hover:underline hover:text-primary-hover focus-visible:outline-primary"
      >
        <span>Sources</span>
      </button>

      <SourcesModal
        figureLabel={figureLabel}
        amountOrValue={amountOrValue}
        basis={basis}
        citations={citations}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
