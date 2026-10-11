"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ChangeOrder, BudgetLine } from "@/lib/types";
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
import { CheckCircle2, XCircle, FileText, AlertCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format";

interface ChangeOrderReviewModalProps {
  changeOrder: ChangeOrder | null;
  budgetLines: BudgetLine[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ChangeOrderReviewModal({
  changeOrder,
  budgetLines,
  open,
  onOpenChange,
  onSuccess,
}: ChangeOrderReviewModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [mode, setMode] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [approvedAmountCents, setApprovedAmountCents] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState("");

  React.useEffect(() => {
    if (changeOrder) {
      setApprovedAmountCents(parseInt(changeOrder.approved_amount || changeOrder.requested_amount, 10));
      setRejectionReason("");
      setMode("APPROVE");
    }
  }, [changeOrder]);

  const targetLine = budgetLines.find((l) => l.id === changeOrder?.target_budget_line_id);

  const approveMutation = useMutation({
    mutationFn: () =>
      changeOrder
        ? api.budget.approveChangeOrder(changeOrder.id, String(approvedAmountCents))
        : Promise.reject(new Error("No change order")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: ["change-orders"] });
      queryClient.invalidateQueries({ queryKey: ["project-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      toast({
        title: `Change Order ${changeOrder?.change_order_number} Approved`,
        description: `Approved for ${formatMoney(String(approvedAmountCents))} and added to ${targetLine?.name}.`,
      });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Approval Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      changeOrder
        ? api.budget.rejectChangeOrder(changeOrder.id, rejectionReason)
        : Promise.reject(new Error("No change order")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["change-orders"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      toast({
        title: `Change Order ${changeOrder?.change_order_number} Rejected`,
        description: "Rejection recorded with audit justification.",
      });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Rejection Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (!changeOrder) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader className="border-b border-border pb-4 -m-6 mb-4 p-6 bg-subtle/30">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary-subtle p-2 text-primary font-mono font-bold text-sm">
              {changeOrder.change_order_number}
            </span>
            <div>
              <ModalTitle className="text-section font-bold text-text-primary">
                Review Change Order: {changeOrder.title}
              </ModalTitle>
              <ModalDescription className="text-caption text-text-secondary">
                Submitted by {changeOrder.requested_by} • Funding: {changeOrder.funding_source}
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-4 text-body">
          {/* Scope details */}
          <div className="bg-subtle/40 p-3.5 rounded-lg border border-border text-xs space-y-2">
            <div className="font-semibold text-text-primary">Scope Description:</div>
            <p className="text-text-secondary leading-relaxed">{changeOrder.scope_description}</p>
            <div className="border-t border-border/60 pt-2 flex justify-between items-center text-caption">
              <span className="text-text-muted">Target Budget Line:</span>
              <span className="font-semibold text-text-primary">
                {targetLine ? `${targetLine.code} - ${targetLine.name}` : "General Requirements"}
              </span>
            </div>
          </div>

          {/* Mode switch */}
          <div className="flex rounded-md bg-subtle p-1 border border-border text-xs">
            <button
              type="button"
              onClick={() => setMode("APPROVE")}
              className={`flex-1 py-1.5 px-3 rounded text-center font-medium transition-all ${
                mode === "APPROVE"
                  ? "bg-surface text-text-primary shadow-xs font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Approve Change Order
            </button>
            <button
              type="button"
              onClick={() => setMode("REJECT")}
              className={`flex-1 py-1.5 px-3 rounded text-center font-medium transition-all ${
                mode === "REJECT"
                  ? "bg-surface text-rose-700 shadow-xs font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Reject Change Order
            </button>
          </div>

          {mode === "APPROVE" ? (
            <div className="space-y-3">
              <div>
                <label className="block text-caption font-semibold text-text-primary mb-1">
                  Approved Amount:
                </label>
                <MoneyInput
                  value={approvedAmountCents}
                  onChange={(cents) => setApprovedAmountCents(cents)}
                  placeholder="0.00"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Original requested: {formatMoney(changeOrder.requested_amount)}. Approving will immediately increase the budget line ceiling.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-caption font-semibold text-rose-900 mb-1">
                  Reason for Rejection:
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this change order was rejected..."
                  className="w-full rounded-md border border-rose-200 bg-rose-50/40 p-2.5 text-body text-rose-950 placeholder:text-rose-400 focus-visible:outline-rose-500"
                />
              </div>
            </div>
          )}
        </div>

        <ModalFooter className="border-t border-border pt-4 mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {mode === "APPROVE" ? (
            <Button
              variant="primary"
              onClick={() => approveMutation.mutate()}
              isLoading={approveMutation.isPending}
              disabled={approvedAmountCents <= 0}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Confirm Approval
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate()}
              isLoading={rejectMutation.isPending}
              disabled={!rejectionReason}
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Confirm Rejection
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
