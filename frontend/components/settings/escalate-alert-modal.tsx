"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AlertItem } from "@/lib/types";
import { AlertOctagon, X, ArrowUpRight, AlertTriangle } from "lucide-react";

interface EscalateAlertModalProps {
  alert: AlertItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EscalateAlertModal({
  alert,
  isOpen,
  onClose,
  onSuccess,
}: EscalateAlertModalProps) {
  const queryClient = useQueryClient();
  const [escalatedTo, setEscalatedTo] = useState("Marcus Vance (Owner)");
  const [escalationNotes, setEscalationNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const escalateMutation = useMutation({
    mutationFn: () =>
      api.alerts.escalateAlert(alert.id, {
        escalated_to: escalatedTo,
        escalation_notes: escalationNotes.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to escalate alert";
      setErrorMsg(msg);
    },
  });

  if (!isOpen) return null;

  const isValid = escalationNotes.trim().length >= 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-lg border border-danger-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-danger-subtle text-danger">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-danger">
                Escalate Exception to Leadership
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

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text-primary">
              Assign Escalation Recipient
            </label>
            <select
              value={escalatedTo}
              onChange={(e) => setEscalatedTo(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-danger focus:outline-hidden"
            >
              <option value="Marcus Vance (Owner)">Marcus Vance (Managing Principal / Owner)</option>
              <option value="Sarah Lin (CFO)">Sarah Lin (Head of Project Finance / CFO)</option>
              <option value="David Ross (PM)">David Ross (Senior Project Manager)</option>
              <option value="Strategic Advisory Board">Strategic Advisory Board & LP Committee</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text-primary">
              Escalation Memo & Action Required <span className="text-danger">*</span>
            </label>
            <textarea
              rows={3}
              value={escalationNotes}
              onChange={(e) => setEscalationNotes(e.target.value)}
              placeholder="Detail the executive decision required (e.g. 'Requires Owner intervention on electrical subcontractor lien waiver to unblock $60,000 lender release')..."
              className="w-full rounded-md border border-border bg-surface p-3 text-body text-text-primary placeholder:text-text-muted focus:border-danger focus:outline-hidden"
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
            disabled={!isValid || escalateMutation.isPending}
            onClick={() => escalateMutation.mutate()}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-body font-medium text-white transition-all shadow-xs ${
              isValid && !escalateMutation.isPending
                ? "bg-danger hover:bg-danger/90 cursor-pointer"
                : "bg-text-muted/40 cursor-not-allowed opacity-60"
            }`}
          >
            <AlertOctagon className="h-4 w-4" />
            {escalateMutation.isPending ? "Escalating..." : "Dispatch Escalation"}
          </button>
        </div>
      </div>
    </div>
  );
}
