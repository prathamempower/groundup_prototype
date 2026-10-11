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
import { FormField } from "@/components/ui/form-field";
import { MoneyInput } from "@/components/ui/money-input";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PostCloseoutAdjustment } from "@/lib/types";
import { Wrench, Plus, AlertCircle } from "lucide-react";

interface PostCloseoutAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function PostCloseoutAdjustmentModal({
  open,
  onOpenChange,
  projectId,
}: PostCloseoutAdjustmentModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState("Post-Sale Warranty & Commissioning");
  const [direction, setDirection] = useState<PostCloseoutAdjustment["direction"]>("DEBIT");
  const [amountCents, setAmountCents] = useState("420000"); // $4,200.00
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [documentName, setDocumentName] = useState("Warranty_Service_Ticket_Final.pdf");
  const [rationale, setRationale] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) {
      setError("An explicit adjustment rationale is mandatory for post-closeout entries.");
      return;
    }
    if (!amountCents || Number(amountCents) <= 0) {
      setError("Please enter a valid positive adjustment amount.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.economics.recordPostCloseoutAdjustment(projectId, {
        category: category.trim(),
        direction,
        amount: amountCents,
        effective_date: effectiveDate,
        rationale: rationale.trim(),
        document_name: documentName.trim() || undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ["closeoutReport", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["economics", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projectDashboard", projectId] });

      onOpenChange(false);
      setRationale("");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to record post-closeout adjustment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-subtle text-warning">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle>Record Post-Closeout Adjustment</ModalTitle>
              <ModalDescription>
                Record post-closing warranty service, tax true-ups, or escrow adjustments with explicit audit labelling.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger-subtle p-3 text-caption text-danger flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField label="Adjustment Category" required>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Post-Sale Warranty"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </FormField>
            </div>

            <div>
              <FormField label="Adjustment Direction" required>
                <select
                  value={direction}
                  onChange={(e) =>
                    setDirection(e.target.value as PostCloseoutAdjustment["direction"])
                  }
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="DEBIT">Debit Expense (Additional Cost)</option>
                  <option value="CREDIT">Credit Recovery (Refund / Escrow Release)</option>
                </select>
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Adjustment Amount ($)" required>
                <MoneyInput
                  value={amountCents}
                  onChange={(cents) => setAmountCents(String(cents))}
                  placeholder="0.00"
                />
              </FormField>
            </div>

            <div>
              <FormField label="Effective Date" required>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </FormField>
            </div>

            <div>
              <FormField label="Supporting Document / Invoice">
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g. Invoice_441.pdf"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField
                label="Adjustment Audit Rationale"
                required
                helperText="Permanent log entry explaining why this cost is recognized post-closeout"
              >
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  rows={3}
                  placeholder="e.g. Post-closing HVAC rooftop compressor warranty tuning for Unit 302 performed under 1-year developer builder warranty."
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </FormField>
            </div>
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-md border border-border px-4 py-2 text-body font-medium text-text-secondary hover:bg-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Recording..." : "Record Labelled Adjustment"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
