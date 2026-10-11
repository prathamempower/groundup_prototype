"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { api } from "@/lib/api";
import { ClipboardCheck, CheckCircle2, AlertCircle } from "lucide-react";
import type { DrawItem } from "@/lib/types";

interface VerifyWorkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draw: DrawItem | null;
  onSuccess: () => void;
}

export function VerifyWorkModal({
  open,
  onOpenChange,
  draw,
  onSuccess,
}: VerifyWorkModalProps) {
  const [notes, setNotes] = useState(
    draw?.pm_verification?.notes ||
      "On-site work progress certified. Structural and MEP rough-in matches AIA G702 percentage of completion."
  );
  const [passedInspection, setPassedInspection] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open || !draw) return null;

  const handleSubmit = async () => {
    if (!notes.trim()) {
      setErrorMsg("Please provide verification notes detailing on-site inspection findings.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.draws.verifyWork(draw.id, notes);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to record PM work verification.");
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
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <ModalTitle>PM Work Verification</ModalTitle>
              <p className="text-caption text-text-muted mt-0.5">
                Draw #{draw.draw_number} • Certification of physical construction progress
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

          <div className="rounded-lg border border-border bg-subtle/50 p-3 space-y-1.5 text-body-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Draw Period:</span>
              <span className="font-medium text-text-primary">
                {draw.period_start} to {draw.period_end}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Lender Facility:</span>
              <span className="font-medium text-text-primary">{draw.lender_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Line Items Included:</span>
              <span className="font-medium text-text-primary">
                {draw.lines?.length || 0} budget lines
              </span>
            </div>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-md border border-border bg-surface cursor-pointer hover:bg-subtle/30">
            <input
              type="checkbox"
              checked={passedInspection}
              onChange={(e) => setPassedInspection(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <div className="text-body-sm">
              <span className="font-semibold text-text-primary block">
                Independent Field Inspection Verified
              </span>
              <span className="text-caption text-text-muted">
                I certify that all work claimed in this pay application has been inspected on site and conforms to construction plans and specifications.
              </span>
            </div>
          </label>

          <FormField label="Field Verification Notes & Findings" required>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-border bg-surface p-2.5 text-body focus:border-primary focus:outline-none"
              placeholder="Detail on-site verification findings and inspection report reference..."
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
            disabled={!passedInspection || !notes.trim() || isSubmitting}
          >
            {isSubmitting ? "Certifying..." : "Certify Work Progress"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
