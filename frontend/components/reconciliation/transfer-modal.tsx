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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      setErrorMsg("Please enter a purpose for this transfer.");
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
      setErrorMsg((err as Error).message || "Failed to create project transfer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <ModalTitle>
            {match ? "Transfer Money to Another Project" : "New Project Transfer"}
          </ModalTitle>
          <ModalDescription>
            Record a short-term transfer from this project to another, tracked until repaid.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-5 py-2">
          {/* PRD Integrity Banner */}
          <Banner
            variant="info"
            title="Transfer tracking"
            message="Project transfers are tracked as balances between projects and do not count as project construction costs."
          />

          {errorMsg && (
            <Banner variant="danger" title="Validation Warning" message={errorMsg} />
          )}

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              Destination Project Entity
            </label>
            <Select value={toProjectId} onValueChange={(val) => setToProjectId(val)}>
              <SelectTrigger className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary">
                <SelectValue placeholder="Select destination project" />
              </SelectTrigger>
              <SelectContent>
                {otherProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.lifecycle_stage})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Purpose & Repayment Notes (Required)
            </label>
            <Textarea
              placeholder="e.g. Short-term funds for zoning deposit; to be repaid next month..."
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
              ? "Saving..."
              : match
              ? "Confirm Project Transfer"
              : "Save Transfer"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
