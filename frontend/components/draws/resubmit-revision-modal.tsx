"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { MoneyInput } from "@/components/ui/money-input";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { GitBranch, AlertCircle, CheckCircle2 } from "lucide-react";
import type { DrawItem } from "@/lib/types";

interface ResubmitRevisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draw: DrawItem | null;
  onSuccess: () => void;
}

export function ResubmitRevisionModal({
  open,
  onOpenChange,
  draw,
  onSuccess,
}: ResubmitRevisionModalProps) {
  const [revisionReason, setRevisionReason] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open && draw) {
      const shortfall = draw.shortfall_amount && draw.shortfall_amount !== "0"
        ? draw.shortfall_amount
        : draw.requested_amount;
      setRequestedAmount(shortfall);
      setRevisionReason(
        draw.shortfall_amount && draw.shortfall_amount !== "0"
          ? `Resubmission to cure lender withholding of ${formatMoney(draw.shortfall_amount)} following mechanical inspection certification.`
          : `Resubmission revision for Draw #${draw.draw_number} following updated contractor certifications.`
      );
      setErrorMsg(null);
    }
  }, [open, draw]);

  if (!open || !draw) return null;

  const handleSubmit = async () => {
    if (!revisionReason.trim()) {
      setErrorMsg("Please provide an auditable revision reason.");
      return;
    }

    if (parseInt(requestedAmount, 10) <= 0) {
      setErrorMsg("Requested amount must be greater than $0.00.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.draws.createRevision(draw.id, {
        revision_reason: revisionReason,
        requested_amount: requestedAmount,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to create draw revision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary-subtle p-2 text-primary">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <ModalTitle>Create Draw Resubmission Revision</ModalTitle>
              <p className="text-caption text-text-muted mt-0.5">
                Draw #{draw.draw_number} • Creates child revision with traceable lineage
              </p>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-4 px-6 py-4">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-md border border-critical/30 bg-critical-subtle/50 p-3 text-body-sm text-critical">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="rounded-lg border border-border bg-subtle/50 p-3.5 space-y-2 text-body-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Parent Draw:</span>
              <span className="font-semibold text-text-primary">
                Draw #{draw.draw_number} ({draw.status})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Original Requested:</span>
              <span className="tabular-nums text-text-secondary">
                {formatMoney(draw.requested_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Original Approved:</span>
              <span className="tabular-nums font-semibold text-primary">
                {formatMoney(draw.approved_amount)}
              </span>
            </div>
            {draw.shortfall_amount && draw.shortfall_amount !== "0" && (
              <div className="flex justify-between border-t border-border pt-1.5 text-warning font-semibold">
                <span>Withheld Shortfall:</span>
                <span className="tabular-nums">
                  {formatMoney(draw.shortfall_amount)}
                </span>
              </div>
            )}
          </div>

          <FormField label="Requested Amount for Revision" required>
            <MoneyInput
              value={requestedAmount}
              onChange={(cents) => setRequestedAmount(String(cents))}
              placeholder="$0.00"
            />
          </FormField>

          <FormField label="Resubmission Audit Rationale & Scope" required>
            <textarea
              rows={3}
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              className="w-full rounded-md border border-border bg-surface p-2.5 text-body focus:border-primary focus:outline-none"
              placeholder="Detail reasons for child revision resubmission and remediated items..."
            />
          </FormField>

          <div className="rounded border border-primary/20 bg-primary-subtle/10 p-3 text-caption text-text-secondary">
            <strong>Lineage Preservation:</strong> Original draw records and decisions remain permanently immutable in the audit ledger. The new child revision (e.g. Draw #{draw.draw_number}-R1) will be tracked as a new submission ready for dual verification.
          </div>
        </div>

        <ModalFooter className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!revisionReason.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating Revision..." : "Create Child Revision"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
