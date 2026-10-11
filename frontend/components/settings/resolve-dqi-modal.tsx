"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataQualityIssue } from "@/lib/types";
import { CheckCircle2, X, AlertTriangle, ShieldCheck } from "lucide-react";

interface ResolveDqiModalProps {
  issue: DataQualityIssue;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResolveDqiModal({
  issue,
  isOpen,
  onClose,
  onSuccess,
}: ResolveDqiModalProps) {
  const queryClient = useQueryClient();
  const [actionType, setActionType] = useState<"RESOLVE" | "WAIVE">("RESOLVE");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resolveMutation = useMutation({
    mutationFn: () => {
      if (actionType === "RESOLVE") {
        return api.alerts.resolveDataQualityIssue(issue.id, {
          resolution_note: note.trim() || "Resolved via verified source document linking.",
        });
      } else {
        return api.alerts.waiveDataQualityIssue(issue.id, note.trim() || "Waived by CFO policy.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-quality-issues"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update data quality issue";
      setErrorMsg(msg);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-text-primary">
                Remediate Data Quality Issue
              </h3>
              <p className="text-caption text-text-secondary">
                Type: {issue.issue_type.replace(/_/g, " ")} &bull; ID: {issue.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted hover:bg-subtle hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-md border border-danger-border bg-danger-subtle p-3 text-caption font-medium text-danger flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="rounded-md border border-border bg-subtle/40 p-3.5 space-y-1.5 text-caption">
          <div className="font-semibold text-text-primary">Issue Description:</div>
          <p className="text-text-secondary leading-relaxed">{issue.description}</p>
          <div className="text-caption text-text-muted border-t border-border/50 pt-1 mt-1 flex items-center justify-between">
            <span>Entity: {issue.affected_entity_type} ({issue.affected_entity_id})</span>
            <span>Owner: {issue.owner}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-caption font-semibold text-text-primary">
            Remediation Decision
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActionType("RESOLVE")}
              className={`rounded-md border p-3 text-left transition-all ${
                actionType === "RESOLVE"
                  ? "border-primary bg-primary-subtle/30 ring-1 ring-primary"
                  : "border-border bg-surface hover:bg-subtle"
              }`}
            >
              <div className="text-body font-semibold text-text-primary">Mark Resolved</div>
              <p className="text-caption text-text-secondary mt-0.5">
                Evidence verified or entity remapped successfully.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActionType("WAIVE")}
              className={`rounded-md border p-3 text-left transition-all ${
                actionType === "WAIVE"
                  ? "border-warning bg-warning-subtle/30 ring-1 ring-warning"
                  : "border-border bg-surface hover:bg-subtle"
              }`}
            >
              <div className="text-body font-semibold text-text-primary">Waive Issue</div>
              <p className="text-caption text-text-secondary mt-0.5">
                Record explicit waiver without blocking gates.
              </p>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-caption font-semibold text-text-primary">
            Remediation Notes / Citation Proof
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain remediation steps taken or cite linked source evidence..."
            className="w-full rounded-md border border-border bg-surface p-3 text-body text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-hidden"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-surface px-4 py-2 text-body font-medium text-text-secondary hover:bg-subtle"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={resolveMutation.isPending}
            onClick={() => resolveMutation.mutate()}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            {resolveMutation.isPending ? "Updating..." : "Save Remediation Record"}
          </button>
        </div>
      </div>
    </div>
  );
}
