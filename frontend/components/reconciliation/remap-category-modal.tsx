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
import { ReconciliationMatch, BudgetLine } from "@/lib/types";
import { api } from "@/lib/api";

interface RemapCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: ReconciliationMatch | null;
  budgetLines: BudgetLine[];
  onSuccess: () => void;
}

export function RemapCategoryModal({
  open,
  onOpenChange,
  match,
  budgetLines,
  onSuccess,
}: RemapCategoryModalProps) {
  const [selectedLineId, setSelectedLineId] = useState(
    match?.proposed_budget_line_id || budgetLines[0]?.id || ""
  );
  const [rationale, setRationale] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open && match) {
      setSelectedLineId(match.proposed_budget_line_id || budgetLines[0]?.id || "");
      setRationale("");
      setErrorMsg(null);
    }
  }, [open, match, budgetLines]);

  if (!match) return null;

  const handleSubmit = async () => {
    if (!rationale.trim()) {
      setErrorMsg("A rationale note is required when remapping budget codes.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.spend.decideMatch(match.id, "REMAP", {
        target_budget_line_id: selectedLineId,
        rationale: rationale.trim(),
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to remap transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <ModalTitle>Remap Budget Category</ModalTitle>
          <ModalDescription>
            Reassign this vendor transaction to a different Schedule of Values (SOV) line code.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-5 py-2">
          <div className="rounded-lg border border-border bg-subtle p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-body font-semibold text-text-primary">
                {match.counterparty}
              </span>
              <span className="text-section font-bold text-text-primary tabular-nums">
                {formatMoney(match.amount)}
              </span>
            </div>
            <p className="text-caption text-text-secondary">
              Current proposed code: <span className="font-medium text-text-primary">{match.proposed_budget_line_name}</span>
            </p>
          </div>

          {errorMsg && (
            <Banner variant="danger" title="Validation Warning" message={errorMsg} />
          )}

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              New Target Budget Line
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
              value={selectedLineId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedLineId(e.target.value)}
            >
              {budgetLines.map((bl) => (
                <option key={bl.id} value={bl.id}>
                  {bl.code} — {bl.name} ({bl.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              Remapping Rationale (Required)
            </label>
            <Textarea
              placeholder="Explain why this expense belongs to the selected budget code instead of the proposed code..."
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
            variant="primary"
            onClick={handleSubmit}
            disabled={!rationale.trim() || isSubmitting}
          >
            {isSubmitting ? "Remapping..." : "Confirm Category Remap"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
