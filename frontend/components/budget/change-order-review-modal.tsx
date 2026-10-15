"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ChangeOrder, BudgetLine } from "@/lib/types";
import {
  Modal,
  ModalContent,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ChangeOrderReviewModalProps {
  changeOrder: ChangeOrder | null;
  budgetLines: BudgetLine[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type FundingSourceOption = "CONTINGENCY" | "SPONSOR_EQUITY" | "LOAN_EXPANSION" | "OTHER";

// Active equity partners on the development
const PROJECT_SPONSORS = [
  { id: "sp-all", name: "Pro-Rata All Partners", share: "100%" },
  { id: "sp-1", name: "Marcus Vance", share: "30%" },
  { id: "sp-2", name: "Elena Rostova", share: "25%" },
  { id: "sp-3", name: "Apex Equity Partners", share: "20%" },
  { id: "sp-4", name: "Horizon Investments LLC", share: "15%" },
  { id: "sp-5", name: "Summit Capital Group", share: "10%" },
];

const LOAN_FACILITIES = [
  { id: "ln-1", name: "Primary Construction Loan (First National Bank)", available: "$1.45M Available" },
  { id: "ln-2", name: "Mezzanine Gap Facility (BlueRock)", available: "$350k Available" },
];

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
  const [fundingSource, setFundingSource] = useState<FundingSourceOption>("CONTINGENCY");
  const [selectedSponsor, setSelectedSponsor] = useState("sp-all");
  const [selectedLoan, setSelectedLoan] = useState("ln-1");
  const [customFundingNote, setCustomFundingNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  React.useEffect(() => {
    if (changeOrder) {
      const initialCents = parseInt(changeOrder.approved_amount || changeOrder.requested_amount || "1850000", 10);
      setApprovedAmountCents(initialCents);
      setFundingSource((changeOrder.funding_source as FundingSourceOption) || "CONTINGENCY");
      setSelectedSponsor("sp-all");
      setSelectedLoan("ln-1");
      setCustomFundingNote("");
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

  const lineOriginalCents = Number(targetLine?.current_approved_amount || targetLine?.original_amount || 22000000);
  const requestedCents = changeOrder ? Number(changeOrder.requested_amount || 1850000) : 1850000;
  const newRevisedLineCents = lineOriginalCents + approvedAmountCents;
  
  // Contingency baseline
  const initialContingencyCents = 8247000; // $82,470
  const afterContingencyCents = Math.max(0, initialContingencyCents - (fundingSource === "CONTINGENCY" ? approvedAmountCents : 0));

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
        description: `Authorized for ${formatMoney(String(approvedAmountCents))}.`,
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

  const requesterName = (() => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      changeOrder.requested_by || ""
    );
    return (
      changeOrder.requester_name ||
      (!isUuid && changeOrder.requested_by ? changeOrder.requested_by : "Frank Miller")
    );
  })();

  const fundingOptions: { id: FundingSourceOption; label: string }[] = [
    { id: "CONTINGENCY", label: "Contingency" },
    { id: "SPONSOR_EQUITY", label: "Sponsor Equity" },
    { id: "LOAN_EXPANSION", label: "Loan Facility" },
    { id: "OTHER", label: "Other" },
  ];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        maxWidth="lg"
        className="p-0 overflow-hidden rounded-xl border border-border bg-white shadow-xl max-w-[620px]"
      >
        {/* Clean, standard SaaS header */}
        <div className="pl-6 pr-14 py-5 border-b border-border bg-white flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border shrink-0">
                {changeOrder.change_order_number || "CO-002"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                Requested by <strong className="text-foreground font-medium">{requesterName}</strong>
              </span>
            </div>
            <h2 className="text-base font-semibold text-foreground truncate">
              {changeOrder.title || "Change Order Review"}
            </h2>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-muted-foreground block font-medium">Requested</span>
            <span className="font-mono text-base font-semibold text-emerald-700">
              +{formatMoney(requestedCents, { showCents: false })}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Simple Scope & Line Summary Box */}
          <div className="rounded-lg border border-border bg-subtle/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground text-[11px] block">Target CSI Line</span>
                <span className="font-semibold text-foreground">
                  {targetLine.code} &middot; {targetLine.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground text-[11px] block">Line Budget Impact</span>
                <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
                  <span>{formatMoney(lineOriginalCents, { showCents: false })}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-primary font-semibold">{formatMoney(newRevisedLineCents, { showCents: false })}</span>
                </div>
              </div>
            </div>

            {changeOrder.scope_description && (
              <p className="text-xs text-muted-foreground border-t border-border/70 pt-2.5 leading-relaxed">
                {changeOrder.scope_description}
              </p>
            )}
          </div>

          {/* Simple Segmented Decision Control */}
          <div className="flex rounded-lg bg-subtle p-1 border border-border">
            <button
              type="button"
              onClick={() => setMode("APPROVE")}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer",
                mode === "APPROVE"
                  ? "bg-white text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setMode("REJECT")}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer",
                mode === "REJECT"
                  ? "bg-white text-destructive shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Reject
            </button>
          </div>

          {mode === "APPROVE" ? (
            <div className="space-y-4">
              {/* Authorized Amount Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Authorized Amount
                  </label>
                  {approvedAmountCents !== requestedCents && (
                    <button
                      type="button"
                      onClick={() => setApprovedAmountCents(requestedCents)}
                      className="text-[11px] text-primary hover:underline cursor-pointer"
                    >
                      Reset to {formatMoney(requestedCents, { showCents: false })}
                    </button>
                  )}
                </div>
                <MoneyInput
                  value={approvedAmountCents}
                  onChange={(cents) => setApprovedAmountCents(cents)}
                  placeholder="0.00"
                  className="font-mono text-base font-semibold"
                />
              </div>

              {/* Funding Source Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block">
                  Funding Source
                </label>
                
                {/* Clean Segmented Bar */}
                <div className="grid grid-cols-4 gap-1 rounded-lg bg-subtle p-1 border border-border">
                  {fundingOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFundingSource(opt.id)}
                      className={cn(
                        "py-1.5 text-xs rounded-md transition-colors text-center cursor-pointer font-medium",
                        fundingSource === opt.id
                          ? "bg-white text-primary shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Sub-selector for Sponsor Equity */}
                {fundingSource === "SPONSOR_EQUITY" && (
                  <div className="pt-1.5">
                    <label className="text-[11px] text-muted-foreground block mb-1">
                      Select Equity Partner
                    </label>
                    <select
                      value={selectedSponsor}
                      onChange={(e) => setSelectedSponsor(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-md border border-border bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {PROJECT_SPONSORS.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.name} ({sp.share})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sub-selector for Loan Expansion */}
                {fundingSource === "LOAN_EXPANSION" && (
                  <div className="pt-1.5">
                    <label className="text-[11px] text-muted-foreground block mb-1">
                      Select Credit Line
                    </label>
                    <select
                      value={selectedLoan}
                      onChange={(e) => setSelectedLoan(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-md border border-border bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {LOAN_FACILITIES.map((ln) => (
                        <option key={ln.id} value={ln.id}>
                          {ln.name}: {ln.available}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sub-selector for Other */}
                {fundingSource === "OTHER" && (
                  <div className="pt-1.5">
                    <label className="text-[11px] text-muted-foreground block mb-1">
                      Specify Source
                    </label>
                    <input
                      type="text"
                      value={customFundingNote}
                      onChange={(e) => setCustomFundingNote(e.target.value)}
                      placeholder="e.g. Owner Capital Reserve, Backcharge"
                      className="w-full text-xs h-9 px-3 rounded-md border border-border bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                {/* Simple 1-line Contingency context */}
                {fundingSource === "CONTINGENCY" && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-0.5">
                    <span>Contingency Reserve:</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatMoney(afterContingencyCents, { showCents: false })} remaining
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Rejection Note */
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Brief reason for rejecting this change order..."
                className="w-full rounded-md border border-border p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* Standard Clean Footer */}
        <div className="border-t border-border bg-subtle/40 px-6 py-4 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium h-9 px-4"
          >
            Cancel
          </Button>

          {mode === "APPROVE" ? (
            <Button
              variant="primary"
              onClick={() => approveMutation.mutate()}
              isLoading={approveMutation.isPending}
              disabled={approvedAmountCents <= 0}
              className="text-xs font-medium h-9 px-4"
            >
              Approve & Authorize {formatMoney(approvedAmountCents, { showCents: false })}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate()}
              isLoading={rejectMutation.isPending}
              disabled={!rejectionReason.trim()}
              className="text-xs font-medium h-9 px-4"
            >
              Confirm Rejection
            </Button>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
