"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { InvestorUpdateSnapshot } from "@/lib/types";
import { AlertOctagon, X, AlertTriangle } from "lucide-react";

interface WithdrawSnapshotModalProps {
  snapshot: InvestorUpdateSnapshot;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (withdrawn: InvestorUpdateSnapshot) => void;
}

export function WithdrawSnapshotModal({
  snapshot,
  isOpen,
  onClose,
  onSuccess,
}: WithdrawSnapshotModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const withdrawMutation = useMutation({
    mutationFn: () =>
      api.investor.withdraw(snapshot.id, {
        reason: reason.trim(),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["investor-updates"] });
      queryClient.invalidateQueries({ queryKey: ["investor-update", snapshot.id] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      if (onSuccess) onSuccess(res.data);
      onClose();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to withdraw investor update";
      setErrorMsg(message);
    },
  });

  if (!isOpen) return null;

  const isValid = reason.trim().length >= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-lg border border-danger-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-danger-subtle text-danger">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-danger">
                Withdraw Published Snapshot
              </h3>
              <p className="text-caption text-text-secondary">
                {snapshot.title}
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

        {/* Warning Explanation */}
        <div className="rounded-md border border-danger-border/40 bg-danger-subtle/30 p-3.5 text-caption text-text-primary space-y-1.5">
          <span className="font-semibold text-danger">Important Notice:</span>
          <p className="text-text-secondary leading-relaxed">
            Withdrawing will mark this update as <strong className="text-danger">WITHDRAWN</strong> across all LP investor
            portals and display your required withdrawal rationale. This action is recorded permanently in the audit trail.
          </p>
        </div>

        {/* Required Rationale */}
        <div className="space-y-1.5">
          <label className="block text-caption font-semibold text-text-primary">
            Withdrawal Rationale / Correction Notice <span className="text-danger">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="State the reason for withdrawing this snapshot (e.g. 'Superseded by revised structural engineering audit report due to crane mobilization adjustment')..."
            className="w-full rounded-md border border-border bg-surface p-3 text-body text-text-primary placeholder:text-text-muted focus:border-danger focus:outline-hidden"
          />
          <div className="flex justify-between text-caption text-text-muted">
            <span>Minimum 10 characters required</span>
            <span className="tabular-nums">{reason.trim().length} chars</span>
          </div>
        </div>

        {/* Modal Actions */}
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
            disabled={!isValid || withdrawMutation.isPending}
            onClick={() => withdrawMutation.mutate()}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-body font-medium text-white transition-all shadow-xs ${
              isValid && !withdrawMutation.isPending
                ? "bg-danger hover:bg-danger/90 cursor-pointer"
                : "bg-text-muted/40 cursor-not-allowed opacity-60"
            }`}
          >
            <AlertOctagon className="h-4 w-4" />
            {withdrawMutation.isPending ? "Withdrawing..." : "Confirm Rescission"}
          </button>
        </div>
      </div>
    </div>
  );
}
