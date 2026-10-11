"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BudgetLine, ChangeOrder } from "@/lib/types";
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
import { PlusCircle, FileText, Layers, DollarSign, Building } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format";

interface ChangeOrderModalProps {
  projectId: string;
  budgetLines: BudgetLine[];
  initialBudgetLineId?: string;
  initialAmountCents?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdCO: ChangeOrder) => void;
}

export function ChangeOrderModal({
  projectId,
  budgetLines,
  initialBudgetLineId,
  initialAmountCents,
  open,
  onOpenChange,
  onSuccess,
}: ChangeOrderModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [scopeDescription, setScopeDescription] = useState("");
  const [targetLineId, setTargetLineId] = useState(initialBudgetLineId || budgetLines[0]?.id || "");
  const [amountCents, setAmountCents] = useState<number>(initialAmountCents || 0);
  const [fundingSource, setFundingSource] = useState<ChangeOrder["funding_source"]>("CONTINGENCY");

  React.useEffect(() => {
    if (open) {
      if (initialBudgetLineId) {
        setTargetLineId(initialBudgetLineId);
      } else if (budgetLines.length > 0) {
        setTargetLineId(budgetLines[0].id);
      }
      if (initialAmountCents) {
        setAmountCents(initialAmountCents);
      }
    }
  }, [open, initialBudgetLineId, initialAmountCents, budgetLines]);

  const targetLine = budgetLines.find((l) => l.id === targetLineId);

  const createMutation = useMutation({
    mutationFn: () =>
      api.budget.createChangeOrder(projectId, {
        title,
        scope_description: scopeDescription,
        requested_amount: String(amountCents),
        target_budget_line_id: targetLineId,
        funding_source: fundingSource,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: ["change-orders"] });
      queryClient.invalidateQueries({ queryKey: ["project-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      toast({
        title: `Change Order ${res.data.change_order_number} Created`,
        description: `Successfully submitted for ${formatMoney(res.data.requested_amount)}.`,
      });
      onSuccess?.(res.data);
      onOpenChange(false);
      // Reset form
      setTitle("");
      setScopeDescription("");
      setAmountCents(0);
    },
    onError: (err: Error) => {
      toast({
        title: "Change Order Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader className="border-b border-border pb-4 -m-6 mb-4 p-6 bg-subtle/30">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary-subtle p-2 text-primary">
              <PlusCircle className="h-5 w-5" />
            </span>
            <div>
              <ModalTitle className="text-section font-bold text-text-primary">
                Request Change Order
              </ModalTitle>
              <ModalDescription className="text-caption text-text-secondary">
                Submit formal scope modification and cost ceiling adjustment.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-4 text-body">
          <div>
            <label className="block text-caption font-semibold text-text-primary mb-1">
              Change Order Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Subgrade Basalt Rock Ledge Excavation"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Target CSI Budget Line:
              </label>
              <select
                value={targetLineId}
                onChange={(e) => setTargetLineId(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus-visible:outline-primary"
              >
                {budgetLines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.code} - {line.name}
                  </option>
                ))}
              </select>
              {targetLine && (
                <div className="text-[11px] text-text-muted mt-1">
                  Current Approved: {formatMoney(targetLine.current_approved_amount)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Requested Amount:
              </label>
              <MoneyInput
                value={amountCents}
                onChange={(cents) => setAmountCents(cents)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-caption font-semibold text-text-primary mb-1">
              Funding Source:
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: "CONTINGENCY", label: "Contingency Reserve", desc: "Draw from line 20-000" },
                { id: "SPONSOR_EQUITY", label: "Sponsor Equity", desc: "Additional cash equity" },
                { id: "LOAN_EXPANSION", label: "Loan Expansion", desc: "Lender credit expansion" },
              ].map((src) => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => setFundingSource(src.id as any)}
                  className={`p-2.5 rounded border text-left transition-all ${
                    fundingSource === src.id
                      ? "border-primary bg-primary-subtle/20 ring-1 ring-primary"
                      : "border-border bg-surface hover:bg-subtle/50"
                  }`}
                >
                  <div className="font-semibold text-text-primary">{src.label}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{src.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-caption font-semibold text-text-primary mb-1">
              Scope Description & Technical Justification:
            </label>
            <textarea
              rows={3}
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              placeholder="Detail unforeseen site conditions, field directives, engineering changes, or tenant upgrade requirements..."
              className="w-full rounded-md border border-border bg-surface p-2.5 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-primary"
            />
          </div>
        </div>

        <ModalFooter className="border-t border-border pt-4 mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => createMutation.mutate()}
            isLoading={createMutation.isPending}
            disabled={!title || !scopeDescription || amountCents <= 0}
          >
            Submit Change Order
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
