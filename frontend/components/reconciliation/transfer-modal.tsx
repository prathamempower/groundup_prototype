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
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Banner } from "@/components/ui/banner";
import { formatMoney } from "@/lib/format";
import { ReconciliationMatch, Project } from "@/lib/types";
import { api } from "@/lib/api";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match?: ReconciliationMatch | null;
  projectId: string;
  projects: Project[];
  onSuccess: () => void;
}

export function TransferModal({
  open,
  onOpenChange,
  match,
  projectId,
  projects,
  onSuccess,
}: TransferModalProps) {
  const otherProjects = projects.filter((p) => p.id !== projectId);
  const defaultToProj = otherProjects[0]?.id || "";

  const [toProjectId, setToProjectId] = useState(defaultToProj);
  const [amountCents, setAmountCents] = useState<number>(
    match ? parseInt(match.amount, 10) : 2500000
  );
  const [transferDate, setTransferDate] = useState(
    match ? match.transaction_date : new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState(
    match
      ? `Temporary loan to affiliated entity for zoning deposit`
      : `Temporary cash loan for project deposit`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      if (match) {
        setAmountCents(parseInt(match.amount, 10));
        setTransferDate(match.transaction_date);
        setNotes(`Temporary loan to affiliated entity for zoning deposit`);
      } else {
        setAmountCents(2500000);
        setTransferDate(new Date().toISOString().split("T")[0]);
        setNotes(`Temporary cash loan for project deposit`);
      }
      setErrorMsg(null);
    }
  }, [open, match]);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      setErrorMsg("Transfer purpose notes are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (match) {
        await api.spend.decideMatch(match.id, "MARK_TRANSFER", {
          to_project_id: toProjectId,
          rationale: notes.trim(),
        });
      } else {
        await api.spend.createInterProjectTransfer(projectId, {
          to_project_id: toProjectId,
          amount: String(amountCents),
          transfer_date: transferDate,
          notes: notes.trim(),
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to create inter-project transfer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <ModalTitle>
            {match ? "Classify as Inter-Project Transfer" : "New Inter-Project Transfer"}
          </ModalTitle>
          <ModalDescription>
            Record a temporary inter-company transfer between project entities with repayment tracking.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-5 py-2">
          {/* PRD Integrity Banner */}
          <Banner
            variant="info"
            title="PRD Accounting Integrity Rule"
            message="Inter-project transfers are tracked on the balance sheet transfer ledger and never impact project revenues, budget expense, or net profit until formally converted."
          />

          {errorMsg && (
            <Banner variant="danger" title="Validation Warning" message={errorMsg} />
          )}

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              Destination Project Entity
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
              value={toProjectId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setToProjectId(e.target.value)}
            >
              {otherProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.lifecycle_stage})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
                Transfer Amount
              </label>
              <MoneyInput
                value={amountCents}
                onChange={setAmountCents}
                disabled={Boolean(match)}
              />
            </div>

            <div>
              <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
                Transfer Date
              </label>
              <Input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              Purpose & Repayment Terms (Required)
            </label>
            <Textarea
              placeholder="e.g. Temporary cash loan for architectural zoning deposit; repayment expected from upcoming mezzanine close..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            disabled={!notes.trim() || isSubmitting}
          >
            {isSubmitting
              ? "Recording Transfer..."
              : match
              ? "Confirm as Inter-Project Transfer"
              : "Create Transfer Record"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
