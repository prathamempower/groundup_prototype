"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, AlertTriangle, FileCheck, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format";

interface ApproveBaselineModalProps {
  budgetId: string;
  projectId: string;
  projectName: string;
  totalOriginalAmount: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved?: () => void;
}

export function ApproveBaselineModal({
  budgetId,
  projectId: _projectId,
  projectName,
  totalOriginalAmount,
  open,
  onOpenChange,
  onApproved,
}: ApproveBaselineModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approveMutation = useMutation({
    mutationFn: () => api.budget.approveBaseline(budgetId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: ["project-readiness"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      toast({
        title: "Baseline Budget Approved & Locked",
        description: `Construction baseline of ${formatMoney(totalOriginalAmount)} is now immutable.`,
      });
      onApproved?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Baseline Approval Failed",
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
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <ModalTitle className="text-section font-bold text-text-primary">
                Approve Immutable Construction Baseline
              </ModalTitle>
              <ModalDescription className="text-caption text-text-secondary">
                Lock master Schedule of Values (SOV) for {projectName}.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-4 text-body">
          {/* Baseline Summary Card */}
          <div className="bg-subtle/40 p-4 rounded-lg border border-border space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Master Contract Model:</span>
              <span className="font-semibold text-text-primary font-mono">COST-PLUS (GMP CAP)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Total Baseline Commitment:</span>
              <span className="font-bold text-base text-primary font-mono tabular-nums">
                {formatMoney(totalOriginalAmount)}
              </span>
            </div>
          </div>

          {/* Immutability Rules Notice */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3.5 space-y-2 text-xs text-amber-950">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Lock className="h-4 w-4 text-amber-700" />
              Governance & Immutability Rules
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
              <li>
                <strong>Original baseline numbers are permanent:</strong> The original approved amount for each CSI division will never be modified or overwritten.
              </li>
              <li>
                <strong>Change Order Requirement:</strong> Any adjustments to scope or cost ceiling must be documented via formal Change Orders with Owner signoff.
              </li>
              <li>
                <strong>Contingency Reserve:</strong> Hard cost contingency line (20-000) can only be reallocated via verified contingency movements within available limits.
              </li>
            </ul>
          </div>
        </div>

        <ModalFooter className="border-t border-border pt-4 mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => approveMutation.mutate()}
            isLoading={approveMutation.isPending}
          >
            <Lock className="h-4 w-4 mr-1.5" />
            Approve & Lock Baseline
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
