"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { GCSubmission, UserRole } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: GCSubmission | null;
  currentRole: UserRole;
  onSuccess?: () => void;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  submission,
  currentRole,
  onSuccess,
}: ReviewSubmissionModalProps) {
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!submission) return null;

  // Determine reviewer role
  const reviewerRole: "PM" | "CFO" | "OWNER" =
    currentRole === "PM" ? "PM" : currentRole === "CFO" ? "CFO" : "OWNER";

  const roleLabel =
    reviewerRole === "PM"
      ? "Project Manager Physical Verification"
      : reviewerRole === "CFO"
      ? "CFO Cost & Lien Waiver Audit"
      : "Owner / Sponsor Final Signoff";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (decision === "REJECTED" && !comments.trim()) {
      setErrorMsg("Please provide a rejection reason for the general contractor.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await api.submissions.review(submission.id, {
        role: reviewerRole,
        decision,
        comments: comments.trim() || `Certified and approved by ${reviewerRole}`,
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to record review decision.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <ModalTitle>Review GC Submission: {submission.submission_number}</ModalTitle>
          <ModalDescription>{roleLabel}</ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="rounded-md bg-danger-subtle p-3 text-caption text-danger border border-danger/30">
              {errorMsg}
            </div>
          )}

          <div className="rounded-lg border border-border bg-surface p-3 space-y-1.5 text-caption">
            <div className="font-semibold text-text-primary text-body">
              {submission.title}
            </div>
            <div className="text-text-muted">
              Submitted by: <strong>{submission.submitted_by}</strong> ({submission.contractor_name})
            </div>
            <div className="flex items-center gap-4 pt-1 font-mono text-caption">
              <div>Claimed: <strong>{formatMoney(submission.claimed_amount)}</strong></div>
              <div>Retainage: <strong>{formatMoney(submission.retainage_amount)}</strong></div>
              <div className="text-primary font-semibold">Net: <strong>{formatMoney(submission.net_payable_amount)}</strong></div>
            </div>
          </div>

          {/* Decision Toggle */}
          <div className="space-y-2">
            <label className="text-caption font-semibold text-text-primary block">
              Review Gate Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision("APPROVED")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-caption font-medium transition-colors ${
                  decision === "APPROVED"
                    ? "bg-success-subtle border-success text-success font-semibold"
                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve & Certify
              </button>

              <button
                type="button"
                onClick={() => setDecision("REJECTED")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-caption font-medium transition-colors ${
                  decision === "REJECTED"
                    ? "bg-danger-subtle border-danger text-danger font-semibold"
                    : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                }`}
              >
                <XCircle className="h-4 w-4" />
                Reject & Require Revision
              </button>
            </div>
          </div>

          <FormField
            label={decision === "APPROVED" ? "Certification Comments (Optional)" : "Rejection Rationale (Mandatory)"}
            required={decision === "REJECTED"}
          >
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder={
                decision === "APPROVED"
                  ? "e.g. Field inspection completed, trade execution aligns with approved drawings..."
                  : "e.g. Missing unconditional partial lien waiver from steel sub; percentage claimed exceeds certified progress..."
              }
            />
          </FormField>

          <ModalFooter>
            <div className="flex w-full items-center justify-between">
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={decision === "APPROVED" ? "primary" : "destructive"}
                loading={submitting}
              >
                {decision === "APPROVED" ? "Confirm & Approve Gate" : "Reject Submission"}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
