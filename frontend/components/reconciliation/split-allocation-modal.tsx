"use client";

import React, { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Banner } from "@/components/ui/banner";
import { formatMoney, formatDate } from "@/lib/format";
import { ReconciliationMatch, BudgetLine } from "@/lib/types";
import { api } from "@/lib/api";
import { Plus, Trash2, CheckCircle2, AlertCircle, Scale } from "lucide-react";

interface SplitAllocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: ReconciliationMatch | null;
  budgetLines: BudgetLine[];
  projectId: string;
  onSuccess: () => void;
}

interface AllocationRow {
  id: string;
  budget_line_id: string;
  amount: number; // cents
  notes: string;
}

export function SplitAllocationModal({
  open,
  onOpenChange,
  match,
  budgetLines,
  projectId,
  onSuccess,
}: SplitAllocationModalProps) {
  const totalSourceCents = match ? parseInt(match.amount, 10) : 0;

  const half1 = Math.floor(totalSourceCents / 2);
  const half2 = totalSourceCents - half1;

  const [rows, setRows] = useState<AllocationRow[]>([
    {
      id: "row_1",
      budget_line_id: match?.proposed_budget_line_id || budgetLines[0]?.id || "",
      amount: half1,
      notes: "Main trade scope",
    },
    {
      id: "row_2",
      budget_line_id: budgetLines[1]?.id || budgetLines[0]?.id || "",
      amount: half2,
      notes: "Materials or extra work",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open && match) {
      const tot = parseInt(match.amount, 10);
      const h1 = Math.floor(tot / 2);
      const h2 = tot - h1;
      setRows([
        {
          id: "row_1",
          budget_line_id: match.proposed_budget_line_id || budgetLines[0]?.id || "",
          amount: h1,
          notes: "Main trade scope",
        },
        {
          id: "row_2",
          budget_line_id: budgetLines[1]?.id || budgetLines[0]?.id || "",
          amount: h2,
          notes: "Materials or extra work",
        },
      ]);
      setErrorMsg(null);
    }
  }, [open, match, budgetLines]);

  if (!match) return null;

  const totalAllocatedCents = rows.reduce(
    (sum, r) => sum + (r.amount || 0),
    0
  );
  const remainingCents = totalSourceCents - totalAllocatedCents;
  const isBalanced = remainingCents === 0;

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}`,
        budget_line_id: budgetLines[0]?.id || "",
        amount: remainingCents > 0 ? remainingCents : 0,
        notes: "",
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof AllocationRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = async () => {
    if (!isBalanced) {
      setErrorMsg(
        `Allocations must equal source transaction amount ($${formatMoney(
          match.amount
        )}) exactly. Remaining balance: $${formatMoney(String(remainingCents))}`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payloadAllocations = rows.map((r) => {
        const bl = budgetLines.find((l) => l.id === r.budget_line_id);
        return {
          budget_line_id: r.budget_line_id,
          budget_line_name: bl ? `${bl.code} - ${bl.name}` : "Budget Line",
          amount: String(r.amount),
        };
      });

      await api.spend.decideMatch(match.id, "SPLIT", {
        rationale: `Split across ${rows.length} budget lines`,
        allocations: payloadAllocations,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to submit split allocation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="xl">
        <ModalHeader>
          <ModalTitle>Split Transaction Across Budget Lines</ModalTitle>
          <ModalDescription>
            Divide a single transaction across multiple budget lines (such as when one payment covers materials and labor).
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-6 py-2">
          {/* Source Transaction Details Card */}
          <div className="rounded-lg border border-border bg-subtle p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-caption font-semibold text-text-secondary uppercase">
                  Source Transaction
                </span>
                <p className="text-section font-semibold text-text-primary">
                  {match.counterparty}
                </p>
                <p className="text-caption text-text-secondary">
                  Date: {formatDate(match.transaction_date)} • Ref: {match.transaction_id}
                </p>
              </div>
              <div className="text-right">
                <span className="text-caption font-semibold text-text-secondary uppercase block">
                  Source Amount
                </span>
                <span className="text-title font-bold text-text-primary tabular-nums">
                  {formatMoney(match.amount)}
                </span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <Banner variant="danger" title="Allocation Error" message={errorMsg} />
          )}

          {/* Live Balance Summary Strip */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
              isBalanced
                ? "bg-emerald-50/70 border-emerald-300 text-emerald-900"
                : "bg-red-50/70 border-red-300 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isBalanced ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              )}
              <div>
                <span className="text-body font-semibold">
                  {isBalanced
                    ? "Allocations balanced ($0 remaining)"
                    : `Remaining to allocate: ${formatMoney(String(Math.abs(remainingCents)))}`}
                </span>
                <p className="text-caption opacity-85">
                  Total Allocated: {formatMoney(String(totalAllocatedCents))} of {formatMoney(match.amount)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-caption font-semibold uppercase block opacity-75">
                Unallocated
              </span>
              <span className="text-section font-bold tabular-nums">
                {formatMoney(String(Math.abs(remainingCents)))}
              </span>
            </div>
          </div>

          {/* Allocation Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Budget Lines ({rows.length})
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="text-caption"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Line
              </Button>
            </div>

            <div className="space-y-2.5">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 rounded-lg border border-border bg-surface hover:bg-subtle transition-colors"
                >
                  <div className="md:col-span-5">
                    <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
                      Line #{index + 1} CSI Budget Code
                    </label>
                    <Select
                      value={row.budget_line_id}
                      onValueChange={(val) =>
                        handleUpdateRow(row.id, "budget_line_id", val)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select budget line" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetLines.map((bl) => (
                          <SelectItem key={bl.id} value={bl.id}>
                            {bl.code}: {bl.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
                      Allocated Amount
                    </label>
                    <MoneyInput
                      value={row.amount}
                      onChange={(cents) => handleUpdateRow(row.id, "amount", cents)}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-caption font-semibold text-text-secondary uppercase mb-1 block">
                      Scope / Memo
                    </label>
                    <Input
                      placeholder="e.g. 50% framing pour"
                      value={row.notes}
                      onChange={(e) => handleUpdateRow(row.id, "notes", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-end pb-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRow(row.id)}
                      disabled={rows.length <= 2}
                      className="text-text-muted hover:text-red-600 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <ModalFooter className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isBalanced || isSubmitting}
          >
            {isSubmitting
              ? "Splitting..."
              : isBalanced
              ? "Split Transaction"
              : "Must balance to $0"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
