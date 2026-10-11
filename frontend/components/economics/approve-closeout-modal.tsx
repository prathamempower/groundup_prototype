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
import { CloseoutReport } from "@/lib/types";
import { ShieldCheck, AlertTriangle, Lock, CheckCircle } from "lucide-react";

interface ApproveCloseoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: CloseoutReport | null;
  projectId: string;
}

export function ApproveCloseoutModal({
  open,
  onOpenChange,
  report,
  projectId,
}: ApproveCloseoutModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isExceptionOverride, setIsExceptionOverride] = useState(false);
  const [rationale, setRationale] = useState("");

  if (!report) return null;

  const unsatisfiedItems = report.checklist.filter((c) => !c.is_satisfied);
  const hasBlockers = unsatisfiedItems.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) {
      setError("An explicit owner sign-off rationale is mandatory for project closeout.");
      return;
    }

    if (hasBlockers && !isExceptionOverride) {
      setError("Checklist contains unsatisfied gates. You must enable 'Grant Explicit Closeout Exception' to proceed.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.economics.approveCloseout(projectId, {
        is_exception_override: isExceptionOverride,
        rationale: rationale.trim(),
      });

      await queryClient.invalidateQueries({ queryKey: ["closeoutReport", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["economics", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projectDashboard", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });

      onOpenChange(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to approve project closeout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="lg">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle>Approve Project Closeout & Lock Baseline</ModalTitle>
              <ModalDescription>
                Formal owner signoff closing development operations and finalizing audited returns.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger-subtle p-3 text-caption text-danger flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Checklist Status Summary */}
          <div className="rounded-lg border border-border bg-subtle/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                Closeout Gates Checklist
              </span>
              <span className="text-caption font-bold text-text-primary">
                {report.checklist.length - unsatisfiedItems.length} of {report.checklist.length} Gates Satisfied
              </span>
            </div>

            {hasBlockers ? (
              <div className="space-y-2">
                <div className="rounded-md border border-warning/40 bg-warning-subtle/50 p-3 text-caption text-warning">
                  <strong className="text-text-primary">Active Closeout Blockers:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-1 text-text-secondary">
                    {unsatisfiedItems.map((item) => (
                      <li key={item.id}>
                        <span className="font-medium text-text-primary">{item.title}:</span>{" "}
                        {item.blocker_reason || "Verification required"}
                      </li>
                    ))}
                  </ul>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-warning/50 bg-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isExceptionOverride}
                    onChange={(e) => setIsExceptionOverride(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-semibold text-text-primary text-body">
                      Grant Explicit Closeout Exception Waiver
                    </div>
                    <div className="text-caption text-text-secondary mt-0.5">
                      Authorize project closeout despite unresolved gates. Mandatory owner justification will be recorded in the permanent audit trail.
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="rounded-md border border-success/40 bg-success-subtle/50 p-3 flex items-center gap-2 text-caption text-success font-medium">
                <CheckCircle className="h-4 w-4" />
                <span>All 7 closeout gates are fully verified and satisfied. Ready for unconditional closeout.</span>
              </div>
            )}
          </div>

          {/* Governance Notice */}
          <div className="rounded-lg border border-border bg-subtle/20 p-3.5 flex items-start gap-3">
            <Lock className="h-5 w-5 text-text-secondary flex-shrink-0 mt-0.5" />
            <div className="text-caption text-text-secondary">
              <strong className="text-text-primary">Governance Notice:</strong> Upon owner approval, this project transitions to <code className="font-mono text-text-primary">CLOSED</code> status and becomes read-only for general operations. Any subsequent warranty expenses or tax true-ups must use the labelled post-closeout adjustment workflow.
            </div>
          </div>

          <FormField
            label="Owner Closeout Sign-Off Rationale"
            required
            helperText="Permanent legal record detailing final audit findings and distribution approval"
          >
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              placeholder="e.g. Approved project closeout following 100% unit closings, BofA construction loan discharge, and completion of investor waterfall distributions at 18.4% Net IRR."
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
              disabled={isSubmitting || (hasBlockers && !isExceptionOverride)}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              {isSubmitting ? "Approving..." : "Approve Project Closeout"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
