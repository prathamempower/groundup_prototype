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
import { formatMoney } from "@/lib/format";
import { ReconciliationMatch, FinancialTransaction } from "@/lib/types";
import { api } from "@/lib/api";

interface CardSettlementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match?: ReconciliationMatch | null;
  transaction?: FinancialTransaction | null;
  onSuccess: () => void;
}

export function CardSettlementModal({
  open,
  onOpenChange,
  match,
  transaction,
  onSuccess,
}: CardSettlementModalProps) {
  const targetTxnId = match?.transaction_id || transaction?.id || "";
  const counterparty = match?.counterparty || transaction?.counterparty || "Card Issuer";
  const amount = match?.amount || transaction?.amount || "0";

  const [notes, setNotes] = useState(
    "Corporate credit card autopay statement settlement. Clears balance sheet card liability."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setNotes("Corporate credit card autopay statement settlement. Clears balance sheet card liability.");
      setErrorMsg(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!targetTxnId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.spend.classifyCardSettlement(targetTxnId, notes);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to classify card settlement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <ModalTitle>Classify as Credit Card Liability Settlement</ModalTitle>
          <ModalDescription>
            Record bank debit as a corporate card liability payment rather than a direct project CSI expense.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-5 py-2">
          <Banner
            variant="info"
            title="PRD Liability Accounting Rule"
            message="Classifying this payment as a Credit Card Liability Settlement ensures underlying itemized receipts (e.g. materials, site supplies) can be categorized without double-counting the payment."
          />

          <div className="rounded-lg border border-border bg-subtle p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-body font-semibold text-text-primary">
                {counterparty}
              </span>
              <span className="text-section font-bold text-text-primary tabular-nums">
                {formatMoney(amount)}
              </span>
            </div>
            <p className="text-caption text-text-secondary">
              Transaction ID: {targetTxnId}
            </p>
          </div>

          {errorMsg && (
            <Banner variant="danger" title="Classification Error" message={errorMsg} />
          )}

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              Classification Notes
            </label>
            <Textarea
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Classifying..." : "Confirm Liability Settlement"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
