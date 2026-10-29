"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { GitBranch, AlertCircle, Info } from "lucide-react";
import type { DrawItem } from "@/lib/types";

interface ResubmitRevisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draw: DrawItem | null;
  onSuccess: () => void;
}

export function ResubmitRevisionModal({
  open,
  onOpenChange,
  draw,
  onSuccess,
}: ResubmitRevisionModalProps) {
  const [revisionReason, setRevisionReason] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open && draw) {
      const shortfall = draw.shortfall_amount && draw.shortfall_amount !== "0"
        ? draw.shortfall_amount
        : draw.requested_amount;
      setRequestedAmount(shortfall);
      setRevisionReason(
        draw.shortfall_amount && draw.shortfall_amount !== "0"
          ? `Updated claim to resolve withholding of ${formatMoney(draw.shortfall_amount)} following completed inspections.`
          : `Revised claim for Draw #${draw.draw_number} with updated contractor certifications.`
      );
      setErrorMsg(null);
    }
  }, [open, draw]);

  if (!open || !draw) return null;

  const handleSubmit = async () => {
    if (!revisionReason.trim()) {
      setErrorMsg("Please provide a reason for this revision.");
      return;
    }

    if (parseInt(requestedAmount, 10) <= 0) {
      setErrorMsg("Revision amount must be greater than $0.00.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.draws.createRevision(draw.id, {
        revision_reason: revisionReason.trim(),
        requested_amount: requestedAmount,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to create draw revision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextRevisionLabel = `Draw #${draw.draw_number}-R1`;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md p-6 space-y-4">
        {/* Header */}
        <ModalHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800 shrink-0">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <ModalTitle className="text-base font-bold text-slate-900">
                Create Draw Revision
              </ModalTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Draw #{draw.draw_number} · Resubmit as {nextRevisionLabel}
              </p>
            </div>
          </div>
        </ModalHeader>

        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-slate-500 block">Original Draw #{draw.draw_number}</span>
            <span className="text-base font-bold font-mono text-slate-900 block tabular-nums">
              {formatMoney(draw.requested_amount)}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Approved: {formatMoney(draw.approved_amount)}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-1 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-700 block">Revised {nextRevisionLabel}</span>
            <span className="text-base font-bold font-mono text-emerald-600 block tabular-nums">
              {formatMoney(requestedAmount)}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Ready for submission
            </span>
          </div>
        </div>

        {/* Revision Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Revision Claim Amount
          </label>
          <MoneyInput
            value={requestedAmount}
            onChange={(cents) => setRequestedAmount(String(cents))}
            className="text-left font-mono font-semibold text-slate-900 h-10 px-3 pl-7"
            placeholder="0.00"
          />
        </div>

        {/* Reason for Revision */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Reason for Revision
          </label>
          <textarea
            rows={2}
            value={revisionReason}
            onChange={(e) => setRevisionReason(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs leading-relaxed"
            placeholder="Describe what changed or which contractor certifications were updated..."
          />
        </div>

        {/* Footer Actions with Subtitle Audit Note */}
        <ModalFooter className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium">
            Original Draw #{draw.draw_number} record preserved
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs font-semibold border-slate-300 text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={!revisionReason.trim() || isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 cursor-pointer shadow-xs"
            >
              {isSubmitting ? "Creating Revision..." : "Create Revision"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
