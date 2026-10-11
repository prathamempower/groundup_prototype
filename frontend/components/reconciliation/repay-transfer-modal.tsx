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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Banner } from "@/components/ui/banner";
import { formatMoney, formatDate } from "@/lib/format";
import { InterProjectTransfer } from "@/lib/types";
import { api } from "@/lib/api";

interface RepayTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: InterProjectTransfer | null;
  onSuccess: () => void;
}

export function RepayTransferModal({
  open,
  onOpenChange,
  transfer,
  onSuccess,
}: RepayTransferModalProps) {
  const totalAmt = transfer ? parseInt(transfer.amount, 10) : 0;
  const currentRepaid = transfer ? parseInt(transfer.repaid_amount || "0", 10) : 0;
  const outstanding = Math.max(0, totalAmt - currentRepaid);

  const [repaidCents, setRepaidCents] = useState<number>(outstanding);
  const [repaidDate, setRepaidDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("Repayment received via bank wire");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open && transfer) {
      const tot = parseInt(transfer.amount, 10);
      const rep = parseInt(transfer.repaid_amount || "0", 10);
      const out = Math.max(0, tot - rep);
      setRepaidCents(out);
      setRepaidDate(new Date().toISOString().split("T")[0]);
      setNotes("Repayment received via bank wire");
      setErrorMsg(null);
    }
  }, [open, transfer]);

  if (!transfer) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.spend.repayInterProjectTransfer(
        transfer.id,
        String(repaidCents),
        repaidDate,
        notes
      );

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to record repayment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <ModalTitle>Record Transfer Repayment</ModalTitle>
          <ModalDescription>
            Record incoming repayment cash against an active inter-project temporary loan.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-5 py-2">
          <div className="rounded-lg border border-border bg-subtle p-3.5 space-y-2">
            <div className="flex items-center justify-between text-body">
              <span className="text-text-secondary">From: <strong className="text-text-primary">{transfer.from_project_name}</strong></span>
              <span className="text-text-secondary">To: <strong className="text-text-primary">{transfer.to_project_name}</strong></span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/60">
              <div>
                <span className="text-caption text-text-secondary block">Original Loan</span>
                <span className="font-semibold text-text-primary tabular-nums">
                  {formatMoney(transfer.amount)}
                </span>
              </div>
              <div>
                <span className="text-caption text-text-secondary block">Prior Repaid</span>
                <span className="font-semibold text-text-secondary tabular-nums">
                  {formatMoney(transfer.repaid_amount || "0")}
                </span>
              </div>
              <div>
                <span className="text-caption text-text-secondary block">Outstanding</span>
                <span className="font-bold text-amber-700 tabular-nums">
                  {formatMoney(String(outstanding))}
                </span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <Banner variant="danger" title="Validation Warning" message={errorMsg} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
                Repayment Amount
              </label>
              <MoneyInput
                value={repaidCents}
                onChange={setRepaidCents}
              />
            </div>

            <div>
              <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
                Repayment Date
              </label>
              <Input
                type="date"
                value={repaidDate}
                onChange={(e) => setRepaidDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              Repayment Reference / Notes
            </label>
            <Textarea
              placeholder="e.g. Cleared via BCB wire reference #BCB-WIRE-9921..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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
            disabled={repaidCents <= 0 || isSubmitting}
          >
            {isSubmitting ? "Recording Repayment..." : "Confirm Repayment"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
