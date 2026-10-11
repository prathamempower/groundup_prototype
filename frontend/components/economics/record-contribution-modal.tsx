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
import { InvestorContribution } from "@/lib/types";
import { DollarSign, Landmark, Plus } from "lucide-react";

interface RecordContributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function RecordContributionModal({
  open,
  onOpenChange,
  projectId,
}: RecordContributionModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [investorName, setInvestorName] = useState("Meridian Capital Real Estate Fund III");
  const [investorType, setInvestorType] = useState<InvestorContribution["investor_type"]>("LP_INVESTOR");
  const [callNumber, setCallNumber] = useState("Capital Call #2 (Drywall & Mechanical)");
  const [amountCents, setAmountCents] = useState("50000000"); // $500,000.00
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [wireReference, setWireReference] = useState(`WIRE-MC-${Date.now().toString().slice(-4)}`);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorName.trim()) {
      setError("Investor / Partner entity name is required.");
      return;
    }
    if (!amountCents || Number(amountCents) <= 0) {
      setError("Please enter a valid positive contribution amount.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.economics.recordInvestorContribution(projectId, {
        investor_name: investorName.trim(),
        investor_type: investorType,
        call_number: callNumber.trim(),
        amount: amountCents,
        effective_date: effectiveDate,
        wire_reference: wireReference.trim(),
        notes: notes.trim(),
      });

      await queryClient.invalidateQueries({ queryKey: ["economics", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["contributions", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projectDashboard", projectId] });

      onOpenChange(false);
      setNotes("");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to record investor contribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle>Record Investor Equity Contribution</ModalTitle>
              <ModalDescription>
                Record cleared equity capital call deposit into project operating accounts.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger-subtle p-3 text-caption text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField label="Investor / Partner Entity Name" required>
                <input
                  type="text"
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                  placeholder="e.g. Meridian Capital Real Estate Fund III"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </FormField>
            </div>

            <div>
              <FormField label="Investor Partner Type" required>
                <select
                  value={investorType}
                  onChange={(e) =>
                    setInvestorType(e.target.value as InvestorContribution["investor_type"])
                  }
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="LP_INVESTOR">Limited Partner (LP Equity)</option>
                  <option value="SPONSOR">General Partner (Sponsor Equity)</option>
                </select>
              </FormField>
            </div>

            <div>
              <FormField label="Capital Call Tranche Reference">
                <input
                  type="text"
                  value={callNumber}
                  onChange={(e) => setCallNumber(e.target.value)}
                  placeholder="e.g. Capital Call #2"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Cleared Contribution Amount ($)" required>
                <MoneyInput
                  value={amountCents}
                  onChange={(cents) => setAmountCents(String(cents))}
                  placeholder="0.00"
                />
              </FormField>
            </div>

            <div>
              <FormField label="Cleared Wire Date" required>
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
              <FormField label="Bank Wire Reference">
                <input
                  type="text"
                  value={wireReference}
                  onChange={(e) => setWireReference(e.target.value)}
                  placeholder="e.g. WIRE-MC-2025"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Memo & Allocation Notes">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Cleared into BCB Operating Account #4182 for Division 09 subcontract advance."
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              {isSubmitting ? "Recording..." : "Record Equity Deposit"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
