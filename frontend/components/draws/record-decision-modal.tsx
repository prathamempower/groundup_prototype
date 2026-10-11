"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { MoneyInput } from "@/components/ui/money-input";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Building2, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import type { DrawItem } from "@/lib/types";

interface RecordDecisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draw: DrawItem | null;
  onSuccess: () => void;
}

export function RecordDecisionModal({
  open,
  onOpenChange,
  draw,
  onSuccess,
}: RecordDecisionModalProps) {
  const [recommendedAmount, setRecommendedAmount] = useState("0");
  const [approvedAmount, setApprovedAmount] = useState("0");
  const [lenderNotes, setLenderNotes] = useState("");
  const [lineAmounts, setLineAmounts] = useState<Record<string, { recommended: string; approved: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open && draw) {
      setRecommendedAmount(draw.recommended_amount && draw.recommended_amount !== "0" ? draw.recommended_amount : draw.requested_amount);
      setApprovedAmount(draw.approved_amount && draw.approved_amount !== "0" ? draw.approved_amount : draw.requested_amount);
      setLenderNotes(draw.lender_decision_notes || "");
      setErrorMsg(null);

      const initialLines: Record<string, { recommended: string; approved: string }> = {};
      (draw.lines || []).forEach((line) => {
        initialLines[line.id] = {
          recommended: line.recommended_amount && line.recommended_amount !== "0" ? line.recommended_amount : line.requested_amount,
          approved: line.approved_amount && line.approved_amount !== "0" ? line.approved_amount : line.requested_amount,
        };
      });
      setLineAmounts(initialLines);
    }
  }, [open, draw]);

  if (!open || !draw) return null;

  const reqCents = parseInt(draw.requested_amount, 10);
  const appCents = parseInt(approvedAmount || "0", 10);
  const shortfallCents = Math.max(0, reqCents - appCents);
  const isShortFunded = shortfallCents > 0;

  const handleSubmit = async () => {
    if (parseInt(approvedAmount, 10) <= 0) {
      setErrorMsg("Approved amount must be greater than $0.00.");
      return;
    }

    if (isShortFunded && !lenderNotes.trim()) {
      setErrorMsg("A shortfall exists. Please record the lender's condition or reason for withholding.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const lineDecisions = (draw.lines || []).map((l) => ({
      line_id: l.id,
      recommended_amount: lineAmounts[l.id]?.recommended || recommendedAmount,
      approved_amount: lineAmounts[l.id]?.approved || approvedAmount,
      lender_notes: isShortFunded ? lenderNotes : undefined,
    }));

    try {
      await api.draws.recordLenderDecision(draw.id, {
        recommended_amount: recommendedAmount,
        approved_amount: approvedAmount,
        lender_notes: lenderNotes,
        line_decisions: lineDecisions,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to record lender decision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary-subtle p-2 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <ModalTitle>Record Lender Credit Decision</ModalTitle>
              <p className="text-caption text-text-muted mt-0.5">
                Draw #{draw.draw_number} • {draw.lender_name}
              </p>
            </div>
          </div>
        </ModalHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-md border border-critical/30 bg-critical-subtle/50 p-3 text-body-sm text-critical">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-subtle/40 text-center">
            <div>
              <span className="text-caption text-text-muted uppercase tracking-wider block">
                Requested
              </span>
              <span className="text-section font-bold tabular-nums text-text-primary">
                {formatMoney(draw.requested_amount)}
              </span>
            </div>
            <div>
              <span className="text-caption text-text-muted uppercase tracking-wider block">
                Inspector Recommended
              </span>
              <span className="text-section font-bold tabular-nums text-text-secondary">
                {formatMoney(recommendedAmount)}
              </span>
            </div>
            <div>
              <span className="text-caption text-text-muted uppercase tracking-wider block">
                Approved by Lender
              </span>
              <span className="text-section font-bold tabular-nums text-primary">
                {formatMoney(approvedAmount)}
              </span>
            </div>
          </div>

          {isShortFunded && (
            <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-subtle/50 p-3.5 text-warning">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-body-sm">
                <span className="font-semibold block text-text-primary">
                  Partial Approval Detected: Shortfall of {formatMoney(String(shortfallCents))}
                </span>
                <span className="text-text-secondary">
                  The application will be classified as <strong>PARTIALLY_APPROVED</strong>. This will generate condition remediation tasks and allow preparing a child resubmission revision without altering actual project spend.
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Inspector Recommended Amount" required>
              <MoneyInput
                value={recommendedAmount}
                onChange={(cents) => setRecommendedAmount(String(cents))}
                placeholder="$0.00"
              />
            </FormField>

            <FormField label="Lender Formal Approved Amount" required>
              <MoneyInput
                value={approvedAmount}
                onChange={(cents) => setApprovedAmount(String(cents))}
                placeholder="$0.00"
              />
            </FormField>
          </div>

          <FormField
            label="Lender Decision Notes & Withholding Conditions"
            helperText={isShortFunded ? "Mandatory when approved amount is less than requested" : "Optional"}
            required={isShortFunded}
          >
            <textarea
              rows={3}
              value={lenderNotes}
              onChange={(e) => setLenderNotes(e.target.value)}
              className="w-full rounded-md border border-border bg-surface p-2.5 text-body focus:border-primary focus:outline-none"
              placeholder="e.g. $60,000 withheld on line 05-100 pending submission of certified mechanical engineering certificate..."
            />
          </FormField>

          {draw.lines && draw.lines.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-caption font-semibold uppercase tracking-wider text-text-secondary block">
                Line Item Decision Breakdown
              </label>
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-left text-body-sm">
                  <thead className="bg-subtle/60 text-caption font-semibold text-text-secondary border-b border-border">
                    <tr>
                      <th className="p-2.5">Code & Category</th>
                      <th className="p-2.5 text-right">Requested</th>
                      <th className="p-2.5 text-right w-36">Approved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-border bg-surface">
                    {draw.lines.map((line) => {
                      const cur = lineAmounts[line.id]?.approved || approvedAmount;
                      return (
                        <tr key={line.id}>
                          <td className="p-2.5">
                            <span className="font-mono text-caption text-text-muted mr-1.5">
                              {line.budget_line_code}
                            </span>
                            <span className="font-medium text-text-primary">
                              {line.budget_line_name}
                            </span>
                          </td>
                          <td className="p-2.5 text-right tabular-nums text-text-secondary">
                            {formatMoney(line.requested_amount)}
                          </td>
                          <td className="p-2 text-right">
                            <MoneyInput
                              value={cur}
                              onChange={(val) =>
                                setLineAmounts((prev) => ({
                                  ...prev,
                                  [line.id]: {
                                    recommended: prev[line.id]?.recommended || String(val),
                                    approved: String(val),
                                  },
                                }))
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <ModalFooter className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Recording..." : "Record Lender Decision"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
