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
import { FormField } from "@/components/ui/form-field";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MilestoneItem } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { AlertTriangle, CheckCircle, FileText, Scale } from "lucide-react";

interface ResolveDiscrepancyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: MilestoneItem | null;
  projectId: string;
}

export function ResolveDiscrepancyModal({
  open,
  onOpenChange,
  milestone,
  projectId,
}: ResolveDiscrepancyModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [action, setAction] = useState<"ACCEPT_INSPECTION" | "SUBMIT_REBUTTAL" | "OVERRIDE_JOINT">(
    "ACCEPT_INSPECTION"
  );
  const [agreedPercent, setAgreedPercent] = useState<number>(60);
  const [resolutionNote, setResolutionNote] = useState("");

  if (!milestone || !milestone.progress_conflict) return null;

  const conflict = milestone.progress_conflict;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNote.trim()) {
      setError("An audit resolution note is mandatory to resolve this discrepancy.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.progress.resolveDiscrepancy(milestone.id, {
        action,
        resolution_note: resolutionNote.trim(),
        agreed_percent: action === "OVERRIDE_JOINT" ? agreedPercent : undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["milestone", milestone.id] });
      await queryClient.invalidateQueries({ queryKey: ["scheduleForecast", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projectDashboard", projectId] });

      onOpenChange(false);
      setResolutionNote("");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to resolve progress dispute");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="lg">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-subtle text-danger">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle>Resolve Progress Verification Dispute</ModalTitle>
              <ModalDescription>
                Conflict between PM self-reported progress and third-party certified inspection report on{" "}
                <span className="font-semibold text-text-primary">{milestone.name}</span>.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger-subtle p-3 text-caption text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Dispute Comparison Card */}
          <div className="rounded-lg border border-danger/30 bg-danger-subtle/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-caption font-semibold uppercase tracking-wider text-danger">
                Discrepancy Comparison
              </span>
              <span className="text-caption font-bold text-danger">
                Value at Risk: {formatMoney(conflict.estimated_value_at_risk)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border border-border bg-surface p-3">
                <div className="text-[11px] font-semibold text-text-muted">PM Self-Reported Progress</div>
                <div className="text-section font-bold text-text-primary tabular-nums mt-0.5">
                  {conflict.pm_percent}% Complete
                </div>
                <div className="text-caption text-text-secondary mt-1">
                  Claimed by Project Manager in monthly draw application
                </div>
              </div>

              <div className="rounded-md border border-danger/40 bg-surface p-3">
                <div className="text-[11px] font-semibold text-danger">Certified Inspector Progress</div>
                <div className="text-section font-bold text-danger tabular-nums mt-0.5">
                  {conflict.inspector_percent}% Complete
                </div>
                <div className="text-caption text-text-secondary mt-1 flex items-center gap-1">
                  <FileText className="h-3 w-3 text-danger flex-shrink-0" />
                  <span className="truncate">{conflict.inspector_report_name}</span>
                </div>
              </div>
            </div>

            <div className="text-caption text-text-secondary border-t border-border/50 pt-2">
              <span className="font-semibold text-danger">Variance:</span> {conflict.discrepancy_percent}% variance. Lender draw advance requires resolution before releasing remaining structural steel funding.
            </div>
          </div>

          {/* Resolution Options */}
          <div className="space-y-2">
            <label className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
              Select Dispute Resolution Pathway:
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  action === "ACCEPT_INSPECTION"
                    ? "border-primary bg-primary-subtle/30"
                    : "border-border bg-surface hover:bg-subtle"
                }`}
              >
                <input
                  type="radio"
                  name="resolutionPathway"
                  value="ACCEPT_INSPECTION"
                  checked={action === "ACCEPT_INSPECTION"}
                  onChange={() => setAction("ACCEPT_INSPECTION")}
                  className="h-4 w-4 mt-0.5 text-primary border-border focus:ring-primary"
                />
                <div>
                  <div className="font-semibold text-text-primary text-body">
                    Accept Lender Certified Inspection ({conflict.inspector_percent}%)
                  </div>
                  <div className="text-caption text-text-secondary mt-0.5">
                    Adjust current milestone completion to {conflict.inspector_percent}%. Aligns project books with lender field inspection certificate and satisfies draw advance prerequisites.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  action === "SUBMIT_REBUTTAL"
                    ? "border-primary bg-primary-subtle/30"
                    : "border-border bg-surface hover:bg-subtle"
                }`}
              >
                <input
                  type="radio"
                  name="resolutionPathway"
                  value="SUBMIT_REBUTTAL"
                  checked={action === "SUBMIT_REBUTTAL"}
                  onChange={() => setAction("SUBMIT_REBUTTAL")}
                  className="h-4 w-4 mt-0.5 text-primary border-border focus:ring-primary"
                />
                <div>
                  <div className="font-semibold text-text-primary text-body">
                    Submit Contractor Rebuttal & Request Expedited Re-Inspection
                  </div>
                  <div className="text-caption text-text-secondary mt-0.5">
                    Maintain PM valuation ({conflict.pm_percent}%) while submitting photo logs and contractor affidavits for an expedited field re-survey.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  action === "OVERRIDE_JOINT"
                    ? "border-primary bg-primary-subtle/30"
                    : "border-border bg-surface hover:bg-subtle"
                }`}
              >
                <input
                  type="radio"
                  name="resolutionPathway"
                  value="OVERRIDE_JOINT"
                  checked={action === "OVERRIDE_JOINT"}
                  onChange={() => setAction("OVERRIDE_JOINT")}
                  className="h-4 w-4 mt-0.5 text-primary border-border focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="font-semibold text-text-primary text-body">
                    Log Agreed Joint Valuation Override
                  </div>
                  <div className="text-caption text-text-secondary mt-0.5">
                    Specify a mutually agreed compromise completion percentage following owner-inspector joint walkthrough.
                  </div>

                  {action === "OVERRIDE_JOINT" && (
                    <div className="mt-3 flex items-center gap-3 bg-surface p-2.5 rounded border border-border">
                      <span className="text-caption font-semibold text-text-primary">Agreed Percent:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={agreedPercent}
                        onChange={(e) => setAgreedPercent(Number(e.target.value))}
                        className="w-20 rounded border border-border bg-surface px-2 py-1 text-body text-text-primary tabular-nums"
                      />
                      <span className="text-caption font-bold text-primary">%</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <FormField
            label="Audit Resolution Rationale"
            required
            helperText="Permanent log entry detailing resolution terms and participating signoffs"
          >
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={3}
              placeholder="e.g. Reviewed Level 4 deck welding test logs with ATD inspector; agreed to adjust valuation to 55% pending next week's shear stud certification."
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </FormField>

          <ModalFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-md border border-border px-4 py-2 text-body font-medium text-text-secondary hover:bg-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {isSubmitting ? "Submitting Resolution..." : "Confirm & Resolve Dispute"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
