"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BudgetLine, ContingencyMovement } from "@/lib/types";
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
import { ArrowRightLeft, ShieldAlert, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format";

interface MoveContingencyModalProps {
  projectId: string;
  budgetLines: BudgetLine[];
  initialDestinationLineId?: string;
  initialAmountCents?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (movement: ContingencyMovement) => void;
}

export function MoveContingencyModal({
  projectId,
  budgetLines,
  initialDestinationLineId,
  initialAmountCents,
  open,
  onOpenChange,
  onSuccess,
}: MoveContingencyModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const contingencyLine = budgetLines.find(
    (l) => l.code === "20-000" || l.category === "Contingency"
  );
  const eligibleDestinationLines = budgetLines.filter(
    (l) => l.code !== "20-000" && l.category !== "Contingency"
  );

  const availableContingencyCents = parseInt(contingencyLine?.current_approved_amount || "0", 10);

  const [destinationLineId, setDestinationLineId] = useState(
    initialDestinationLineId || eligibleDestinationLines[0]?.id || ""
  );
  const [amountCents, setAmountCents] = useState<number>(initialAmountCents || 0);
  const [reason, setReason] = useState("");

  React.useEffect(() => {
    if (open) {
      if (initialDestinationLineId) {
        setDestinationLineId(initialDestinationLineId);
      } else if (eligibleDestinationLines.length > 0) {
        setDestinationLineId(eligibleDestinationLines[0].id);
      }
      if (initialAmountCents) {
        setAmountCents(initialAmountCents);
      }
    }
  }, [open, initialDestinationLineId, initialAmountCents, eligibleDestinationLines]);

  const targetLine = budgetLines.find((l) => l.id === destinationLineId);
  const isExceeded = amountCents > availableContingencyCents;

  const moveMutation = useMutation({
    mutationFn: () =>
      api.budget.moveContingency(
        projectId,
        String(amountCents),
        destinationLineId,
        reason
      ),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: ["project-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      toast({
        title: "Contingency Reallocated",
        description: `Successfully moved ${formatMoney(res.data.amount)} from reserve to ${targetLine?.name}.`,
      });
      onSuccess?.(res.data);
      onOpenChange(false);
      setAmountCents(0);
      setReason("");
    },
    onError: (err: Error) => {
      toast({
        title: "Contingency Movement Failed",
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
              <ArrowRightLeft className="h-5 w-5" />
            </span>
            <div>
              <ModalTitle className="text-section font-bold text-text-primary">
                Move Contingency Reserve
              </ModalTitle>
              <ModalDescription className="text-caption text-text-secondary">
                Reallocate hard cost contingency to cover verified scope overruns.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-4 text-body">
          {/* Contingency Reserve Status Banner */}
          <div className="bg-subtle/40 p-4 rounded-lg border border-border flex items-center justify-between">
            <div>
              <span className="text-caption text-text-muted block">Source Budget Reserve</span>
              <span className="font-bold text-text-primary text-sm">
                20-000 Hard Cost Contingency
              </span>
            </div>
            <div className="text-right">
              <span className="text-caption text-text-muted block">Available Reserve</span>
              <span className="font-mono font-bold text-base text-primary tabular-nums">
                {formatMoney(String(availableContingencyCents))}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Destination Budget Line:
              </label>
              <select
                value={destinationLineId}
                onChange={(e) => setDestinationLineId(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus-visible:outline-primary"
              >
                {eligibleDestinationLines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.code} - {line.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Movement Amount:
              </label>
              <MoneyInput
                value={amountCents}
                onChange={(cents) => setAmountCents(cents)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Exceeded Error Warning */}
          {isExceeded && (
            <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-xs text-rose-900 flex items-start gap-2 animate-in fade-in-50">
              <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Contingency Limit Exceeded:</span> Requested transfer of{" "}
                {formatMoney(String(amountCents))} exceeds the available reserve of{" "}
                {formatMoney(String(availableContingencyCents))}. Reduce the transfer amount or fund via Sponsor Equity.
              </div>
            </div>
          )}

          <div>
            <label className="block text-caption font-semibold text-text-primary mb-1">
              Contingency Transfer Rationale / Engineering Basis:
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Fund structural steel surcharge and expedited fabrication delivery as approved in CO-02..."
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
            onClick={() => moveMutation.mutate()}
            isLoading={moveMutation.isPending}
            disabled={amountCents <= 0 || isExceeded || !reason}
          >
            Confirm Contingency Transfer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
