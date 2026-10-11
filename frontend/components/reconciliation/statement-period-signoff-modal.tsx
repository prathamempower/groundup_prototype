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
import { Banner } from "@/components/ui/banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney, formatDate } from "@/lib/format";
import { StatementPeriod, FinancialAccount } from "@/lib/types";
import { api } from "@/lib/api";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface StatementPeriodSignoffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: StatementPeriod | null;
  account: FinancialAccount | undefined;
  onSuccess: () => void;
}

export function StatementPeriodSignoffModal({
  open,
  onOpenChange,
  period,
  account,
  onSuccess,
}: StatementPeriodSignoffModalProps) {
  const [waiverReason, setWaiverReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setWaiverReason("");
      setErrorMsg(null);
    }
  }, [open]);

  if (!period) return null;

  const openAmt = parseInt(period.opening_balance, 10);
  const debitsAmt = parseInt(period.total_debits, 10);
  const creditsAmt = parseInt(period.total_credits, 10);
  const closeAmt = parseInt(period.closing_balance, 10);
  const computedClose = openAmt + creditsAmt - debitsAmt;

  const isMathBalanced = computedClose === closeAmt;
  const isCoverageComplete = period.coverage_status === "COMPLETE";
  const allControlsPassed = isMathBalanced && isCoverageComplete;

  const handleSubmit = async () => {
    if (!allControlsPassed && !waiverReason.trim()) {
      setErrorMsg("A CFO waiver reason is strictly required when signing off a period with open control exceptions.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.spend.signoffStatementPeriod(
        period.id,
        allControlsPassed ? undefined : waiverReason.trim()
      );

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to sign off statement period.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="lg">
        <ModalHeader>
          <ModalTitle>CFO Statement Period Reconciliation Sign-Off</ModalTitle>
          <ModalDescription>
            Verify coverage controls and mathematical balance before locking monthly statement records.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-5 py-2">
          {/* Account & Period Header */}
          <div className="rounded-lg border border-border bg-subtle p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-caption font-semibold text-text-secondary uppercase">
                  Account & Period
                </span>
                <p className="text-section font-semibold text-text-primary">
                  {account?.institution} ({account?.masked_identifier})
                </p>
                <p className="text-caption text-text-secondary">
                  Period: {formatDate(period.period_start)} to {formatDate(period.period_end)}
                </p>
              </div>
              <StatusBadge
                status={allControlsPassed ? "verified" : "provisional"}
                customLabel={allControlsPassed ? "Controls Passed" : "Exceptions Present"}
              />
            </div>
          </div>

          {errorMsg && (
            <Banner variant="danger" title="Sign-Off Error" message={errorMsg} />
          )}

          {/* Balance Controls Card */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <label className="text-caption font-semibold text-text-secondary uppercase tracking-wider block">
              Mathematical Balance Control
            </label>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded bg-subtle border border-border">
                <span className="text-caption text-text-secondary block">Opening Balance</span>
                <span className="font-semibold text-text-primary tabular-nums">
                  {formatMoney(period.opening_balance)}
                </span>
              </div>
              <div className="p-2.5 rounded bg-subtle border border-border">
                <span className="text-caption text-text-secondary block">+ Credits (Inflows)</span>
                <span className="font-semibold text-emerald-700 tabular-nums">
                  +{formatMoney(period.total_credits)}
                </span>
              </div>
              <div className="p-2.5 rounded bg-subtle border border-border">
                <span className="text-caption text-text-secondary block">- Debits (Outflows)</span>
                <span className="font-semibold text-text-primary tabular-nums">
                  -{formatMoney(period.total_debits)}
                </span>
              </div>
              <div className="p-2.5 rounded bg-subtle border border-border">
                <span className="text-caption text-text-secondary block">= Computed Closing</span>
                <span className="font-semibold text-text-primary tabular-nums">
                  {formatMoney(String(computedClose))}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                {isMathBalanced ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-body font-medium text-text-primary">
                  Reported Statement Closing: {formatMoney(period.closing_balance)}
                </span>
              </div>
              <span
                className={`text-caption font-semibold px-2 py-0.5 rounded ${
                  isMathBalanced
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isMathBalanced ? "Zero Discrepancy" : `Discrepancy: ${formatMoney(String(Math.abs(closeAmt - computedClose)))}`}
              </span>
            </div>
          </div>

          {/* Coverage Control Card */}
          <div className="rounded-lg border border-border p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-caption font-semibold text-text-secondary uppercase tracking-wider block">
                Statement Coverage Integrity
              </label>
              <p className="text-body text-text-secondary">
                Contiguous daily statement records with no unmapped gaps.
              </p>
            </div>
            <StatusBadge
              status={period.coverage_status === "COMPLETE" ? "verified" : "provisional"}
              customLabel={`Coverage: ${period.coverage_status}`}
            />
          </div>

          {/* Waiver Input if controls failed */}
          {!allControlsPassed ? (
            <div className="space-y-2">
              <Banner
                variant="warning"
                title="Waiver Required for Incomplete Controls"
                message="PRD Section 3.4 requires an explicit documented reason and sign-off justification when reconciling a period with balance or coverage exceptions."
              />
              <div>
                <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
                  CFO Waiver Rationale (Required)
                </label>
                <Textarea
                  placeholder="Explain the variance or why statement gap is permitted (e.g. pending month-end interest posting adjustment)..."
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <Banner
              variant="info"
              title="Ready for Sign-Off"
              message="All balance controls and coverage prerequisites have been independently verified."
            />
          )}
        </div>

        {/* Footer Actions */}
        <ModalFooter className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={(!allControlsPassed && !waiverReason.trim()) || isSubmitting}
          >
            {isSubmitting
              ? "Recording Sign-Off..."
              : allControlsPassed
              ? "Sign Off Statement Period"
              : "Sign Off with CFO Waiver"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
