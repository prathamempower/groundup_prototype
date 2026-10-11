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
import { ReconciliationMatch, FinancialTransaction, DocumentItem } from "@/lib/types";
import { api } from "@/lib/api";

interface LinkInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match?: ReconciliationMatch | null;
  transaction?: FinancialTransaction | null;
  documents: DocumentItem[];
  onSuccess: () => void;
}

export function LinkInvoiceModal({
  open,
  onOpenChange,
  match,
  transaction,
  documents,
  onSuccess,
}: LinkInvoiceModalProps) {
  const targetTxnId = match?.transaction_id || transaction?.id || "";
  const counterparty = match?.counterparty || transaction?.counterparty || "Vendor";
  const amount = match?.amount || transaction?.amount || "0";

  const invoiceDocs = documents.filter(
    (d) => d.document_type === "INVOICE" || d.document_type === "BUDGET_SOV" || d.document_type === "CONTRACT"
  );

  const [selectedDocId, setSelectedDocId] = useState(
    invoiceDocs[0]?.id || documents[0]?.id || ""
  );
  const [notes, setNotes] = useState("Verified invoice attached from supplier billing record");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSelectedDocId(invoiceDocs[0]?.id || documents[0]?.id || "");
      setNotes("Verified invoice attached from supplier billing record");
      setErrorMsg(null);
    }
  }, [open, documents, invoiceDocs]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!targetTxnId || !selectedDocId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.spend.linkInvoice(targetTxnId, selectedDocId, notes);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to link invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <ModalTitle>Link Invoice Evidence to Payment</ModalTitle>
          <ModalDescription>
            Attach an ingested source invoice to satisfy audit requirements and upgrade evidence strength.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-5 py-2">
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
            <Banner variant="danger" title="Linking Error" message={errorMsg} />
          )}

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              Select Supporting Source Document
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
              value={selectedDocId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDocId(e.target.value)}
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_filename} ({d.document_type}, {d.ingestion_status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
              Evidence Verification Notes
            </label>
            <Textarea
              placeholder="e.g. Subcontractor invoice #INV-4991 matches check amount and milestone period..."
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
            disabled={!selectedDocId || isSubmitting}
          >
            {isSubmitting ? "Linking Evidence..." : "Link Invoice Evidence"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
