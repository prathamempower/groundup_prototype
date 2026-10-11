"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AlertItem } from "@/lib/types";
import { AlertTriangle, X, ShieldAlert, Calendar } from "lucide-react";

interface WaiveAlertModalProps {
  alert: AlertItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function WaiveAlertModal({
  alert,
  isOpen,
  onClose,
  onSuccess,
}: WaiveAlertModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [waivedUntil, setWaivedUntil] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const waiveMutation = useMutation({
    mutationFn: () =>
      api.alerts.waiveAlert(alert.id, {
        reason: reason.trim(),
        waived_until: waivedUntil,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to waive alert";
      setErrorMsg(msg);
    },
  });

  if (!isOpen) return null;

  const isValid = reason.trim().length >= 8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-lg border border-warning-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-warning-subtle text-warning">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-text-primary">
                Waive Operational Alert
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

        <div className="rounded-md border border-warning-border/40 bg-warning-subtle/30 p-3.5 text-caption text-text-primary space-y-1">
          <span className="font-semibold text-warning">Waiver Governance Policy:</span>
          <p className="text-text-secondary leading-relaxed">
            Waiving this exception suppresses operational warning banners until the specified expiry date.
            An explicit justification is required and permanently logged.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text-primary">
              Waiver Rationale / Business Justification <span className="text-danger">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the commercial or operational rationale for waiving this alert (e.g. 'Carrying cost absorbed by existing interest reserves through Q4 2026')..."
              className="w-full rounded-md border border-border bg-surface p-3 text-body text-text-primary placeholder:text-text-muted focus:border-warning focus:outline-hidden"
            />
            <div className="text-caption text-text-muted">Minimum 8 characters required</div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text-primary flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-text-muted" />
              <span>Waiver Expiry Date</span>
            </label>
            <input
              type="date"
              value={waivedUntil}
              onChange={(e) => setWaivedUntil(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-warning focus:outline-hidden"
            />
          </div>
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
            disabled={!isValid || waiveMutation.isPending}
            onClick={() => waiveMutation.mutate()}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-body font-medium text-white transition-all shadow-xs ${
              isValid && !waiveMutation.isPending
                ? "bg-warning text-white hover:bg-warning/90 cursor-pointer"
                : "bg-text-muted/40 cursor-not-allowed opacity-60"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            {waiveMutation.isPending ? "Waiving..." : "Confirm Temporary Waiver"}
          </button>
        </div>
      </div>
    </div>
  );
}
