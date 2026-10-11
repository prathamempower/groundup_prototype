"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { InvestorUpdateSnapshot } from "@/lib/types";
import {
  AlertTriangle,
  CheckSquare,
  Square,
  ShieldCheck,
  X,
  Calendar,
  Users,
  Lock,
} from "lucide-react";

interface PublishSnapshotModalProps {
  snapshot: InvestorUpdateSnapshot;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (published: InvestorUpdateSnapshot) => void;
}

export function PublishSnapshotModal({
  snapshot,
  isOpen,
  onClose,
  onSuccess,
}: PublishSnapshotModalProps) {
  const queryClient = useQueryClient();

  const [checkBaseline, setCheckBaseline] = useState(false);
  const [checkDisclosures, setCheckDisclosures] = useState(false);
  const [checkRedaction, setCheckRedaction] = useState(false);
  const [recipients, setRecipients] = useState<string[]>(
    snapshot.recipients && snapshot.recipients.length > 0
      ? snapshot.recipients
      : ["Meridian Capital Group (All LP Investors)"]
  );
  const [recipientInput, setRecipientInput] = useState("");
  const [expiryDate, setExpiryDate] = useState(snapshot.expiry_date || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allAcknowledged = checkBaseline && checkDisclosures && checkRedaction;

  const publishMutation = useMutation({
    mutationFn: () =>
      api.investor.publish(snapshot.id, {
        material_warnings_acknowledged: true,
        recipients,
        expiry_date: expiryDate || undefined,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["investor-updates"] });
      queryClient.invalidateQueries({ queryKey: ["investor-update", snapshot.id] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      if (onSuccess) onSuccess(res.data);
      onClose();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to publish investor update";
      setErrorMsg(message);
    },
  });

  if (!isOpen) return null;

  const handleAddRecipient = () => {
    if (recipientInput.trim() && !recipients.includes(recipientInput.trim())) {
      setRecipients([...recipients, recipientInput.trim()]);
      setRecipientInput("");
    }
  };

  const handleRemoveRecipient = (idx: number) => {
    setRecipients(recipients.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-lg border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-success-subtle text-success">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-text-primary">
                Publish Immutable Investor Update
              </h3>
              <p className="text-caption text-text-secondary">
                {snapshot.title} &bull; As of {snapshot.as_of_date}
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

        {/* Immutability Notice */}
        <div className="rounded-md border border-primary/20 bg-primary-subtle/50 p-3.5 text-caption text-text-primary flex items-start gap-2.5">
          <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-text-primary">Immutability Guarantee:</span>
            <p className="mt-0.5 text-text-secondary">
              Once published, this financial snapshot is permanently frozen. Any subsequent live project changes
              or budget reallocations will not alter this published record.
            </p>
          </div>
        </div>

        {/* Material Warning Checklist */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wider text-text-muted">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            <span>Required Material Disclosures & Verification Checklist</span>
          </div>

          <div className="space-y-2.5 rounded-md border border-border bg-subtle/40 p-3.5">
            {/* Check 1 */}
            <label
              className="flex items-start gap-2.5 cursor-pointer text-body text-text-primary select-none"
              onClick={() => setCheckBaseline(!checkBaseline)}
            >
              {checkBaseline ? (
                <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
              )}
              <div className="text-caption leading-relaxed">
                <strong className="text-text-primary">Verified Financial Data:</strong> I confirm GDV, loan balances,
                and equity figures reflect approved baselines and reconciled draw records.
              </div>
            </label>

            {/* Check 2 */}
            <label
              className="flex items-start gap-2.5 cursor-pointer text-body text-text-primary select-none"
              onClick={() => setCheckDisclosures(!checkDisclosures)}
            >
              {checkDisclosures ? (
                <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
              )}
              <div className="text-caption leading-relaxed">
                <strong className="text-text-primary">Schedule & Variance Disclosures:</strong> Material milestone
                delays (e.g., steel mill lead times) and absorbed carrying costs are disclosed in narrative.
              </div>
            </label>

            {/* Check 3 */}
            <label
              className="flex items-start gap-2.5 cursor-pointer text-body text-text-primary select-none"
              onClick={() => setCheckRedaction(!checkRedaction)}
            >
              {checkRedaction ? (
                <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
              )}
              <div className="text-caption leading-relaxed">
                <strong className="text-text-primary">Redaction & Confidentiality:</strong> Raw vendor invoices, bank account
                routing, and internal audit notes have been excluded.
              </div>
            </label>
          </div>
        </div>

        {/* Recipients and Expiry Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-caption font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-text-muted" />
              <span>Target LP Investor Groups / Recipients</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRecipient();
                  }
                }}
                placeholder="Add recipient or LP syndicate..."
                className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddRecipient}
                className="rounded-md border border-border bg-subtle px-3 py-1.5 text-caption font-medium text-text-primary hover:bg-subtle/80"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {recipients.map((r, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-md bg-subtle border border-border px-2 py-0.5 text-caption font-medium text-text-primary"
                >
                  {r}
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(idx)}
                    className="text-text-muted hover:text-danger"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-caption font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-text-muted" />
              <span>Access Expiry Date (Optional)</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
            />
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
            disabled={!allAcknowledged || publishMutation.isPending}
            onClick={() => publishMutation.mutate()}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-body font-medium text-white transition-all shadow-xs ${
              allAcknowledged && !publishMutation.isPending
                ? "bg-success hover:bg-success/90 cursor-pointer"
                : "bg-text-muted/40 cursor-not-allowed opacity-60"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            {publishMutation.isPending ? "Publishing..." : "Acknowledge & Publish Snapshot"}
          </button>
        </div>
      </div>
    </div>
  );
}
