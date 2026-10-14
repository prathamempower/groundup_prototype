"use client";

import React, { useState } from "react";
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
import { MoneyInput } from "@/components/ui/money-input";
import { useToast } from "@/components/ui/toast";
import { Calculator, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

interface EditAssumptionsModalProps {
  projectId: string;
  projectName: string;
  currentGdvCents: number;
  currentIrrPct: number;
  currentEquityMultiple?: number;
  userRole?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditAssumptionsModal({
  projectId,
  projectName,
  currentGdvCents,
  currentIrrPct,
  currentEquityMultiple = 1.85,
  userRole = "OWNER",
  open,
  onOpenChange,
  onSuccess,
}: EditAssumptionsModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isAuthorized = userRole === "OWNER" || userRole === "CFO";

  const [projectedRevenueCents, setProjectedRevenueCents] = useState<number>(currentGdvCents);
  const [targetIrr, setTargetIrr] = useState<number>(currentIrrPct);
  const [targetEquityMultiple, setTargetEquityMultiple] = useState<number>(currentEquityMultiple);
  const [notes, setNotes] = useState<string>("");

  React.useEffect(() => {
    if (open) {
      setProjectedRevenueCents(currentGdvCents);
      setTargetIrr(currentIrrPct);
      setTargetEquityMultiple(currentEquityMultiple);
      setNotes("");
    }
  }, [open, currentGdvCents, currentIrrPct, currentEquityMultiple]);

  const mutation = useMutation({
    mutationFn: async () => {
      return api.economics.createFinancialPlan(projectId, {
        plan_type: "PRO_FORMA",
        projected_revenue: projectedRevenueCents,
        projected_cost: 0, // Calculated dynamically by backend
        target_irr: targetIrr,
        target_equity_multiple: targetEquityMultiple,
      });
    },
    onSuccess: () => {
      toast({
        title: "Underwriting Assumptions Updated",
        description: "New financial plan baseline saved and active forecast updated.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["economics", projectId] });
      queryClient.invalidateQueries({ queryKey: ["pro-forma", projectId] });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: "Failed to Update Assumptions",
        description: err?.message || "An unexpected error occurred while saving.",
        variant: "destructive",
      });
    },
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Edit Underwriting Assumptions
          </ModalTitle>
          <ModalDescription className="text-xs text-slate-500">
            Adjust projected gross sales revenue and investment hurdle targets for {projectName}.
          </ModalDescription>
        </ModalHeader>

        {!isAuthorized ? (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5 my-3">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">Role-Based Permission Notice</p>
              <p className="mt-0.5">
                Only Owners and CFOs can update underwriting financial plans. You have view-only permissions.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-4 py-2"
          >
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Projected Gross Sales / Exit Proceeds ($)
              </label>
              <MoneyInput
                value={projectedRevenueCents}
                onChange={(cents) => setProjectedRevenueCents(cents)}
                className="w-full text-base font-semibold text-slate-900"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Gross Development Value (GDV) expected at completion or disposition.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Target IRR (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={targetIrr}
                    onChange={(e) => setTargetIrr(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Target Equity Multiple
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={targetEquityMultiple}
                    onChange={(e) => setTargetEquityMultiple(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">x</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Revision Notes & Rationale
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Updated market comps and adjusted exit valuation..."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <ModalFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save Assumptions"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
