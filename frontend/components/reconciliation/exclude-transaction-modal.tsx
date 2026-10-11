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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Banner } from "@/components/ui/banner";
import { formatMoney } from "@/lib/format";
import { ReconciliationMatch } from "@/lib/types";
import { api } from "@/lib/api";

interface ExcludeTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: ReconciliationMatch | null;
  onSuccess: () => void;
}

export function ExcludeTransactionModal({
  open,
  onOpenChange,
  match,
  onSuccess,
}: ExcludeTransactionModalProps) {
  const [category, setCategory] = useState("NON_PROJECT_EXPENSE");
  const [rationale, setRationale] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setRationale("");
      setErrorMsg(null);
    }
  }, [open]);

  if (!match) return null;

  const handleSubmit = async () => {
    if (!rationale.trim()) {
      setErrorMsg("An exclusion reason is required for financial audit tracking.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.spend.decideMatch(match.id, "EXCLUDE", {
        rationale: `[${category}] ${rationale.trim()}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to exclude transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <ModalTitle>Exclude Transaction from Project</ModalTitle>
          <ModalDescription>
            Mark this transaction as non-project spend (e.g. personal draw, separate entity charge, or disallowed expense).
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-5 py-2">
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-body font-semibold text-text-primary">
                {match.counterparty}
              </span>
              <span className="text-section font-bold text-red-900 tabular-nums">
                {formatMoney(match.amount)}
              </span>
            </div>
            <p className="text-caption text-text-secondary">
              Excluded items are removed from project actual spend and will not draw on construction loan commitments.
            </p>
          </div>

          {errorMsg && (
            <Banner variant="danger" title="Validation Warning" message={errorMsg} />
          )}

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              Exclusion Reason Category
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
              value={category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
            >
              <option value="NON_PROJECT_EXPENSE">Non-Project / Separate Entity Charge</option>
              <option value="SPONSOR_PERSONAL_DRAW">Sponsor Equity Distribution / Personal Draw</option>
              <option value="DUPLICATE_SETTLEMENT">Duplicate Card / Bank Transaction</option>
              <option value="DISALLOWED_OVERHEAD">Disallowed Contractor Overhead</option>
              <option value="BANK_FEES_REVERSAL">Bank Fee Reversal / Refund</option>
            </select>
          </div>

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              Detailed Audit Justification (Required)
            </label>
            <Textarea
              placeholder="Document the exact circumstances and verification reason for excluding this transaction..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <ModalFooter className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!rationale.trim() || isSubmitting}
          >
            {isSubmitting ? "Excluding..." : "Confirm Exclusion"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
