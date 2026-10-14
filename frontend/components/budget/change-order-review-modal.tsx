"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ChangeOrder, BudgetLine } from "@/lib/types";
import {
  Modal,
  ModalContent,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { Check, X, ArrowRight } from "lucide-react";
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
      const initialCents = parseInt(changeOrder.approved_amount || changeOrder.requested_amount || "1850000", 10);
      setApprovedAmountCents(initialCents);
      setRejectionReason("");
      setMode("APPROVE");
    }
  }, [changeOrder]);

  const targetLine = budgetLines.find((l) => l.id === changeOrder?.target_budget_line_id) || {
    id: "06-100",
    code: "06-100",
    name: "Rough Carpentry & Framing",
    original_amount: "22000000",
    current_approved_amount: "22000000",
    actual_spend: "8000000",
  };

  const lineOriginalCents = Number(targetLine?.original_amount || 22000000);
  const requestedCents = changeOrder ? Number(changeOrder.requested_amount || 1850000) : 1850000;
  const newRevisedLineCents = lineOriginalCents + approvedAmountCents;
  const totalContingencyCents = 8247000; // $82,470.00
  const afterContingencyCents = Math.max(0, totalContingencyCents - approvedAmountCents);

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
        description: `Approved for ${formatMoney(String(approvedAmountCents))}.`,
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
      <ModalContent maxWidth="md" className="p-0 overflow-hidden rounded-xl border-slate-200 shadow-overlay">
        {/* Clean Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {changeOrder.change_order_number || "CO-002"}
              </span>
              <span className="text-xs text-slate-500">
                {changeOrder.requested_by || "Frank Miller"}
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-900 leading-snug">
              {changeOrder.title || "Rough Carpentry & Framing"}
            </h2>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block font-mono text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
              +{formatMoney(requestedCents, { showCents: false })}
            </span>
          </div>
        </div>

        {/* Clean Body */}
        <div className="p-6 space-y-5 bg-white">
          {/* Scope Note */}
          <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3.5 border border-slate-100 leading-relaxed">
            <span className="font-semibold text-slate-800">
              {targetLine ? `${targetLine.code} · ${targetLine.name}` : "Rough Carpentry"}:
            </span>{" "}
            {changeOrder.scope_description || "Additional shear wall bracing and moment clips."}
          </div>

          {/* Clean Budget Impact Line */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/60 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Budget Line</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-700 font-medium">
                <span>{formatMoney(lineOriginalCents, { showCents: false })}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="font-semibold text-slate-900">{formatMoney(newRevisedLineCents, { showCents: false })}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Remaining Contingency</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatMoney(afterContingencyCents, { showCents: false })}
              </span>
            </div>
          </div>

          {/* Action Choice Segment */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode("APPROVE")}
              className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                mode === "APPROVE"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => setMode("REJECT")}
              className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                mode === "REJECT"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <X className="h-3.5 w-3.5 text-rose-600" />
              Reject
            </button>
          </div>

          {/* Form input */}
          {mode === "APPROVE" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 block">
                Approved Amount
              </label>
              <MoneyInput
                value={approvedAmountCents}
                onChange={(cents) => setApprovedAmountCents(cents)}
                placeholder="0.00"
                className="text-base font-mono font-semibold py-2 px-3 border-slate-200 focus:border-slate-900 rounded-lg"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 block">
                Reason for Rejection
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
              />
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <ModalFooter className="border-t border-slate-100 bg-white px-6 py-3.5 flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-transparent border-none shadow-none"
          >
            Cancel
          </Button>

          {mode === "APPROVE" ? (
            <Button
              variant="primary"
              onClick={() => approveMutation.mutate()}
              isLoading={approveMutation.isPending}
              disabled={approvedAmountCents <= 0}
              className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg"
            >
              Approve {formatMoney(approvedAmountCents, { showCents: false })}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate()}
              isLoading={rejectMutation.isPending}
              disabled={!rejectionReason.trim()}
              className="text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Reject
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
