"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DocumentItem } from "@/lib/types";
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
  FileEdit,
  DollarSign,
  Building,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ManualEntryModalProps {
  document: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ManualEntryModal({
  document,
  open,
  onOpenChange,
  onSuccess,
}: ManualEntryModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [counterparty, setCounterparty] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [amountCents, setAmountCents] = useState<number>(0);
  const [budgetLineId, setBudgetLineId] = useState("");
  const [notes, setNotes] = useState("");

  const projectId = document?.project_id || "";

  const { data: budgetData } = useQuery({
    queryKey: ["budget-current", projectId],
    queryFn: () => api.budget.getCurrent(projectId),
    enabled: open && !!projectId,
  });

  const budgetLines = React.useMemo(() => budgetData?.data?.lines || [], [budgetData?.data?.lines]);

  React.useEffect(() => {
    if (document) {
      setCounterparty("");
      setReferenceNumber("");
      setAmountCents(0);
      setNotes("");
      if (budgetLines.length > 0) {
        setBudgetLineId(budgetLines[0].id);
      }
    }
  }, [document, budgetLines]);

  const manualEntryMutation = useMutation({
    mutationFn: () =>
      document
        ? api.documents.manualEntry(document.id, {
            document_type: document.document_type,
            counterparty,
            reference_number: referenceNumber,
            amount: String(amountCents),
            budget_line_id: budgetLineId || undefined,
            notes,
          })
        : Promise.reject(new Error("No document selected")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["spend-records"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      toast({
        title: "Manual Record Created",
        description: `Successfully created source-linked ledger record for $${(amountCents / 100).toLocaleString()}.`,
      });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Manual Entry Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (!document) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader className="border-b border-border pb-4 -m-6 mb-4 p-6 bg-subtle/30">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary-subtle p-2 text-primary">
              <FileEdit className="h-5 w-5" />
            </span>
            <div>
              <ModalTitle className="text-section font-bold text-text-primary">
                Manual Source Entry Fallback
              </ModalTitle>
              <ModalDescription className="text-caption text-text-secondary">
                Record verified invoice or inspection figures directly linked to {document.original_filename}.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-4 text-body">
          {/* Linked Document Card */}
          <div className="bg-subtle/40 p-3 rounded border border-border text-xs flex items-center justify-between">
            <div>
              <span className="text-text-muted block text-[10px]">Source Attachment</span>
              <span className="font-semibold text-text-primary font-mono">{document.original_filename}</span>
            </div>
            <span className="rounded bg-subtle px-2 py-0.5 font-mono text-[11px] text-text-secondary">
              {document.document_type}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Vendor / Counterparty:
              </label>
              <input
                type="text"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                placeholder="e.g. Apex Construction Services"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus-visible:outline-primary"
              />
            </div>

            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Invoice / Reference Number:
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. INV-2025-089"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body font-mono text-text-primary focus-visible:outline-primary"
              />
            </div>

            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Verified Amount:
              </label>
              <MoneyInput
                value={amountCents}
                onChange={(cents) => setAmountCents(cents)}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                CSI Budget Line Allocation:
              </label>
              <select
                value={budgetLineId}
                onChange={(e) => setBudgetLineId(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus-visible:outline-primary"
              >
                {budgetLines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.code} - {line.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Auditor Rationale & Item Description:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail verification basis and cite specific page/row numbers..."
                className="w-full rounded-md border border-border bg-surface p-2 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-primary"
              />
            </div>
          </div>
        </div>

        <ModalFooter className="border-t border-border pt-4 mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => manualEntryMutation.mutate()}
            isLoading={manualEntryMutation.isPending}
            disabled={!counterparty || amountCents <= 0}
          >
            Save Record & Mark Reviewed
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
