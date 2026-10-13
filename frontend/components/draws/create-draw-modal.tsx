"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { MoneyInput } from "@/components/ui/money-input";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatMoney } from "@/lib/format";
import { Landmark, AlertCircle, FileText, CheckCircle2, Sparkles } from "lucide-react";
import type { BudgetLine } from "@/lib/types";
import { EXCEL_DRAW_TASKS } from "@/lib/data/excel-draw-schedule";

interface CreateDrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  nextDrawNumber: number;
  onSuccess: () => void;
}

export function CreateDrawModal({
  open,
  onOpenChange,
  projectId,
  nextDrawNumber,
  onSuccess,
}: CreateDrawModalProps) {
  const [drawNumber, setDrawNumber] = useState(nextDrawNumber);
  const [periodStart, setPeriodStart] = useState("2025-10-01");
  const [periodEnd, setPeriodEnd] = useState("2025-10-31");
  const [lenderName, setLenderName] = useState("Columbia Bank Construction Lending");
  const [selectedLines, setSelectedLines] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: budgetData } = useQuery({
    queryKey: ["budget", projectId],
    queryFn: () => api.budget.getCurrent(projectId),
    enabled: open,
  });

  const eligibleLines: BudgetLine[] = React.useMemo(() => {
    if (budgetData?.data?.lines && budgetData.data.lines.length > 0) {
      return budgetData.data.lines.filter(
        (l) => l.is_draw_eligible !== false && l.category !== "Contingency"
      );
    }
    // Fallback to construction tasks from Excel schedule
    return EXCEL_DRAW_TASKS.map((t) => ({
      id: `b-line-${t.number}`,
      budget_id: "budget-default",
      project_id: projectId,
      code: t.number,
      name: t.description,
      category: t.number.startsWith("1") ? "Consultant & Permits" : t.number.startsWith("4") ? "MEP" : "Site Work & Structure",
      original_amount: String(t.scheduledValueCents),
      current_approved_amount: String(t.scheduledValueCents),
      actual_spend: "0",
      committed_amount: "0",
      is_draw_eligible: true,
      sort_order: parseFloat(t.number) * 100,
    }));
  }, [budgetData, projectId]);

  const handleApplyPreset = React.useCallback(
    (targetNum: number) => {
      const preset: Record<string, string> = {};
      eligibleLines.forEach((line) => {
        const task = EXCEL_DRAW_TASKS.find((t) => t.number === line.code);
        if (task && (task.draws[targetNum] || 0) > 0) {
          preset[line.id] = String(task.draws[targetNum]);
        }
      });
      // For Draw 4, ensure demolition and grading lines are also present if needed
      if (targetNum === 4) {
        eligibleLines.forEach((line) => {
          if (line.code === "2.04" && !preset[line.id]) preset[line.id] = "500000";
          if (line.code === "2.05" && !preset[line.id]) preset[line.id] = "550000";
        });
      }
      setSelectedLines(preset);
    },
    [eligibleLines]
  );

  useEffect(() => {
    if (open) {
      const targetNum = nextDrawNumber || 4;
      setDrawNumber(targetNum);
      setErrorMsg(null);
      handleApplyPreset(targetNum);
    }
  }, [open, nextDrawNumber, handleApplyPreset]);

  const handleLineAmountChange = (lineId: string, cents: string) => {
    setSelectedLines((prev) => ({
      ...prev,
      [lineId]: cents,
    }));
  };

  const totalRequestedCents = Object.values(selectedLines).reduce(
    (acc, val) => acc + (parseInt(val || "0", 10) || 0),
    0
  );
  const retainageCents = Math.round(totalRequestedCents * 0.1);
  const netPayableCents = totalRequestedCents - retainageCents;

  const handleSubmit = async () => {
    const activeLines = Object.entries(selectedLines)
      .filter(([_, cents]) => parseInt(cents, 10) > 0)
      .map(([lineId, cents]) => ({
        budget_line_id: lineId,
        requested_amount: cents,
      }));

    if (activeLines.length === 0) {
      setErrorMsg("Please select at least one budget line with an amount greater than $0.00");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.draws.create(projectId, {
        draw_number: drawNumber,
        period_start: periodStart,
        period_end: periodEnd,
        lender_name: lenderName,
        lines: activeLines,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to create draw application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary-subtle p-2 text-primary">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <ModalTitle>Prepare Draw Application #{drawNumber}</ModalTitle>
              <p className="text-caption text-text-muted mt-0.5">
                Generate AIA G702 / G703 certified draw package for lender submission
              </p>
            </div>
          </div>
        </ModalHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-md border border-critical/30 bg-critical-subtle/50 p-3 text-body-sm text-critical">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Draw Application #" required>
              <input
                type="number"
                min={1}
                value={drawNumber}
                onChange={(e) => setDrawNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body focus:border-primary focus:outline-none"
              />
            </FormField>

            <FormField label="Lender Facility" required>
              <input
                type="text"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body focus:border-primary focus:outline-none"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Billing Period Start" required>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body focus:border-primary focus:outline-none"
              />
            </FormField>

            <FormField label="Billing Period End" required>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body focus:border-primary focus:outline-none"
              />
            </FormField>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                Eligible Budget Lines (Schedule of Values)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset(drawNumber)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Load Draw #{drawNumber} Schedule</span>
                </button>
                <span className="text-caption text-text-muted">
                  • {eligibleLines.length} items
                </span>
              </div>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto border border-border rounded-md p-3 bg-subtle/30">
              {eligibleLines.length === 0 ? (
                <p className="text-caption text-text-muted italic">No eligible budget lines found.</p>
              ) : (
                eligibleLines.map((line) => {
                  const currentVal = selectedLines[line.id] || "0";
                  return (
                    <div
                      key={line.id}
                      className="flex items-center justify-between gap-4 p-2.5 bg-surface rounded border border-border"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-caption font-bold text-text-muted">
                            {line.code}
                          </span>
                          <span className="text-body-sm font-medium text-text-primary truncate">
                            {line.name}
                          </span>
                        </div>
                        <div className="text-caption text-text-muted mt-0.5">
                          Approved: {formatMoney(line.current_approved_amount)} • Spent: {formatMoney(line.actual_spend)}
                        </div>
                      </div>

                      <div className="w-44 shrink-0">
                        <MoneyInput
                          value={currentVal}
                          onChange={(cents) => handleLineAmountChange(line.id, String(cents))}
                          placeholder="$0.00"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-subtle/50 p-4 space-y-2">
            <div className="flex justify-between text-body-sm text-text-secondary">
              <span>Gross Requested:</span>
              <span className="tabular-nums font-semibold text-text-primary">
                {formatMoney(String(totalRequestedCents))}
              </span>
            </div>
            <div className="flex justify-between text-body-sm text-text-secondary">
              <span>Retainage Withheld (10% standard):</span>
              <span className="tabular-nums text-text-muted">
                -{formatMoney(String(retainageCents))}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-body font-bold text-text-primary">
              <span>Net Disbursement Requested:</span>
              <span className="tabular-nums text-primary">
                {formatMoney(String(netPayableCents))}
              </span>
            </div>
          </div>
        </div>

        <ModalFooter className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || totalRequestedCents === 0}
          >
            {isSubmitting ? "Creating Draw..." : "Create Draw Draft"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
