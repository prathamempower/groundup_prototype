"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { MoneyInput } from "@/components/ui/money-input";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, CheckCircle, AlertCircle, Building2 } from "lucide-react";
import type { DrawItem } from "@/lib/types";

interface AllocateFundingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draw: DrawItem | null;
  projectId: string;
  onSuccess: () => void;
}

export function AllocateFundingModal({
  open,
  onOpenChange,
  draw,
  projectId,
  onSuccess,
}: AllocateFundingModalProps) {
  const { data: unallocatedData } = useQuery({
    queryKey: ["unallocated-funding", projectId],
    queryFn: () => api.draws.getUnallocatedFunding(projectId),
    enabled: open,
  });

  const deposits = React.useMemo(
    () => unallocatedData?.data?.unallocated_deposits || [],
    [unallocatedData]
  );

  const [selectedTxnId, setSelectedTxnId] = useState<string>(deposits[0]?.transaction_id || "");
  const [allocationAmount, setAllocationAmount] = useState<string>("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open && draw) {
      setErrorMsg(null);
      if (deposits.length > 0) {
        setSelectedTxnId(deposits[0].transaction_id);
        // Default to the draw's remaining unfunded amount or deposit amount
        const needed = Math.max(0, parseInt(draw.approved_amount, 10) - parseInt(draw.funded_amount || "0", 10));
        const depositAmt = parseInt(deposits[0].amount, 10);
        const initial = Math.min(needed > 0 ? needed : depositAmt, depositAmt);
        setAllocationAmount(String(initial));
      }
    }
  }, [open, draw, deposits]);

  if (!open || !draw) return null;

  const selectedDeposit = deposits.find((d) => d.transaction_id === selectedTxnId);

  const handleSubmit = async () => {
    if (!selectedTxnId) {
      setErrorMsg("Please select a cleared wire deposit.");
      return;
    }

    const allocCents = parseInt(allocationAmount, 10);
    if (isNaN(allocCents) || allocCents <= 0) {
      setErrorMsg("Please enter an allocation amount greater than $0.00.");
      return;
    }

    if (selectedDeposit && allocCents > parseInt(selectedDeposit.amount, 10)) {
      setErrorMsg(`Allocation exceeds available cleared deposit amount of ${formatMoney(selectedDeposit.amount)}.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.draws.allocateFunding(draw.id, selectedTxnId, allocationAmount);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to allocate draw funding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-success-subtle p-2 text-success">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <ModalTitle>Allocate Cleared Deposit</ModalTitle>
              <p className="text-caption text-text-muted mt-0.5">
                Draw #{draw.draw_number} • Confirm cash receipt from bank wire deposit
              </p>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-4 px-6 py-4">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-md border border-critical/30 bg-critical-subtle/50 p-3 text-body-sm text-critical">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="rounded-lg border border-border bg-subtle/50 p-3 text-body-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-text-secondary">Lender Approved Amount:</span>
              <span className="tabular-nums font-semibold text-text-primary">
                {formatMoney(draw.approved_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Previously Funded:</span>
              <span className="tabular-nums font-semibold text-success">
                {formatMoney(draw.funded_amount || "0")}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 font-bold">
              <span className="text-text-primary">Remaining Unfunded:</span>
              <span className="tabular-nums text-primary">
                {formatMoney(
                  String(Math.max(0, parseInt(draw.approved_amount, 10) - parseInt(draw.funded_amount || "0", 10)))
                )}
              </span>
            </div>
          </div>

          <FormField label="Cleared Bank Deposit Source" required>
            {deposits.length === 0 ? (
              <div className="p-3 border border-border rounded-md bg-subtle/20 text-body-sm text-text-muted italic">
                No unallocated wire deposits found. Import a bank statement with a cleared wire deposit to allocate cash.
              </div>
            ) : (
              <div className="space-y-2">
                {deposits.map((dep) => (
                  <label
                    key={dep.transaction_id}
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedTxnId === dep.transaction_id
                        ? "border-primary bg-primary-subtle/20"
                        : "border-border bg-surface hover:bg-subtle/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deposit"
                      value={dep.transaction_id}
                      checked={selectedTxnId === dep.transaction_id}
                      onChange={(e) => {
                        setSelectedTxnId(e.target.value);
                        setAllocationAmount(dep.amount);
                      }}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-primary text-body-sm">
                          {dep.institution}
                        </span>
                        <span className="font-bold tabular-nums text-success text-body-sm">
                          {formatMoney(dep.amount)}
                        </span>
                      </div>
                      <p className="text-caption text-text-secondary truncate mt-0.5">{dep.memo}</p>
                      <span className="text-[11px] text-text-muted">Cleared date: {dep.cleared_date}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </FormField>

          <FormField label="Allocation Amount to Apply" required>
            <MoneyInput
              value={allocationAmount}
              onChange={(cents) => setAllocationAmount(String(cents))}
              placeholder="$0.00"
            />
          </FormField>

          <div className="rounded border border-primary/20 bg-primary-subtle/10 p-2.5 text-caption text-text-secondary flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              <strong>Funding Truth Principle:</strong> Draw advances are only recognized in project cash reporting when backed by confirmed cleared bank deposits.
            </span>
          </div>
        </div>

        <ModalFooter className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedTxnId || isSubmitting || deposits.length === 0}
          >
            {isSubmitting ? "Allocating..." : "Confirm Wire Allocation"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
