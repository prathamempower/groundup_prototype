"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AlertItem } from "@/lib/types";
import { CheckCircle2, X, AlertTriangle } from "lucide-react";

interface ResolveAlertModalProps {
  alert: AlertItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResolveAlertModal({
  alert,
  isOpen,
  onClose,
  onSuccess,
}: ResolveAlertModalProps) {
  const queryClient = useQueryClient();
  const [resolutionNote, setResolutionNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resolveMutation = useMutation({
    mutationFn: () =>
      api.alerts.resolveAlert(alert.id, resolutionNote.trim() || "Resolved by operator review."),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to resolve alert";
      setErrorMsg(msg);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-success-subtle text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-text-primary">
                Mark Alert as Resolved
              </h3>
              <p className="text-caption text-text-secondary line-clamp-1">
                {alert.title}
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

        <div className="rounded-md border border-border bg-subtle/40 p-3.5 space-y-1 text-caption">
          <div className="font-semibold text-text-primary">{alert.title}</div>
          <p className="text-text-secondary leading-relaxed">{alert.description}</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-caption font-semibold text-text-primary">
            Resolution Note / Audit Explanation
          </label>
          <textarea
            rows={3}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Explain how this alert was remediated (e.g. 'Satisfied mechanical signoff condition on Draw #3' or 'Reconciled wire deposit to draw application')..."
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
            className="flex items-center gap-2 rounded-md bg-success px-4 py-2 text-body font-medium text-white hover:bg-success/90 shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            {resolveMutation.isPending ? "Resolving..." : "Confirm Resolution"}
          </button>
        </div>
      </div>
    </div>
  );
}
