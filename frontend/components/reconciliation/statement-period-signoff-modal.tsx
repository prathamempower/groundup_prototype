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
      setErrorMsg("Please provide a reason to close this statement while transactions remain unresolved.");
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
          <ModalTitle>Close Monthly Statement</ModalTitle>
          <ModalDescription>
            Check that all transactions match your bank statement before closing the month.
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
                customLabel={allControlsPassed ? "Balanced" : "Discrepancy found"}
              />
            </div>
          </div>

          {errorMsg && (
            <Banner variant="danger" title="Sign-Off Error" message={errorMsg} />
          )}

          {/* Balance Controls Card */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <label className="text-caption font-semibold text-text-secondary uppercase tracking-wider block">
              Statement Balance Check
            </label>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded bg-subtle border border-border">
                <span className="text-caption text-text-secondary block">Opening Balance</span>
                <span className="font-semibold text-text-primary tabular-nums">
                  {formatMoney(period.opening_balance)}
                </span>
              </div>
              <div className="p-2.5 rounded bg-subtle border border-border">
                <span className="text-caption text-text-secondary block">+ Deposits received</span>
                <span className="font-semibold text-emerald-700 tabular-nums">
                  +{formatMoney(period.total_credits)}
                </span>
              </div>
              <div className="p-2.5 rounded bg-subtle border border-border">
                <span className="text-caption text-text-secondary block">- Payments & withdrawals</span>
                <span className="font-semibold text-text-primary tabular-nums">
                  -{formatMoney(period.total_debits)}
                </span>
              </div>
              <div className="p-2.5 rounded bg-subtle border border-border">
                <span className="text-caption text-text-secondary block">= Calculated ending balance</span>
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
                  Bank statement ending balance: {formatMoney(period.closing_balance)}
                </span>
              </div>
              <span
                className={`text-caption font-semibold px-2 py-0.5 rounded ${
                  isMathBalanced
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isMathBalanced ? "Balanced ($0 discrepancy)" : `Discrepancy: ${formatMoney(String(Math.abs(closeAmt - computedClose)))}`}
              </span>
            </div>
          </div>

          {/* Coverage Control Card */}
          <div className="rounded-lg border border-border p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-caption font-semibold text-text-secondary uppercase tracking-wider block">
                Statement Date Range
              </label>
              <p className="text-body text-text-secondary">
                Full calendar month covered with no missing dates.
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
                title="Reason required for open items"
                message="A documented note is required when closing a monthly statement that has an open balance difference or missing dates."
              />
              <div>
                <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
                  Reason for closing with open items (required)
                </label>
                <Textarea
                  placeholder="Explain the difference or why this month is closing with open items..."
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <Banner
              variant="info"
              title="Statement is balanced"
              message="The numbers match your bank statement and all dates are covered."
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
              ? "Closing statement..."
              : "Close Statement"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
