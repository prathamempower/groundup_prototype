"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { api } from "@/lib/api";
import { ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import type { DrawItem } from "@/lib/types";

interface VerifyCostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draw: DrawItem | null;
  onSuccess: () => void;
}

export function VerifyCostModal({
  open,
  onOpenChange,
  draw,
  onSuccess,
}: VerifyCostModalProps) {
  const [notes, setNotes] = useState(
    "All trade contractor invoices matched against cleared disbursements. Prior period lien waivers are verified and in hand."
  );
  const [costsVerified, setCostsVerified] = useState(true);
  const [priorPaymentsVerified, setPriorPaymentsVerified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open || !draw) return null;

  const handleSubmit = async () => {
    if (!notes.trim()) {
      setErrorMsg("Please provide financial verification notes.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.draws.verifyCost(draw.id, notes);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to record CFO cost verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-success-subtle p-2 text-success">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <ModalTitle>CFO Cost & Disbursement Verification</ModalTitle>
              <p className="text-caption text-text-muted mt-0.5">
                Draw #{draw.draw_number} • Financial validation of invoices and prior bank clearance
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

          <div className="space-y-2.5">
            <label className="flex items-start gap-3 p-3 rounded-md border border-border bg-surface cursor-pointer hover:bg-subtle/30">
              <input
                type="checkbox"
                checked={costsVerified}
                onChange={(e) => setCostsVerified(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <div className="text-body-sm">
                <span className="font-semibold text-text-primary block">
                  Subcontractor Invoices Reconciled
                </span>
                <span className="text-caption text-text-muted">
                  All claimed costs have supporting reviewed invoice and contract documents linked in the system.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-md border border-border bg-surface cursor-pointer hover:bg-subtle/30">
              <input
                type="checkbox"
                checked={priorPaymentsVerified}
                onChange={(e) => setPriorPaymentsVerified(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <div className="text-body-sm">
                <span className="font-semibold text-text-primary block">
                  Prior Draw Disbursements Cleared
                </span>
                <span className="text-caption text-text-muted">
                  Funds from prior loan advances were properly disbursed to subcontractors, and matching lien waivers have been executed.
                </span>
              </div>
            </label>
          </div>

          <FormField label="Financial Verification Rationale" required>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-border bg-surface p-2.5 text-body focus:border-primary focus:outline-none"
              placeholder="Record financial audit findings and bank statement verification note..."
            />
          </FormField>
        </div>

        <ModalFooter className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!costsVerified || !priorPaymentsVerified || !notes.trim() || isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Certify Financial Accuracy"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
