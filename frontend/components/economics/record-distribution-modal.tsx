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
import { InvestorDistribution } from "@/lib/types";
import { DollarSign, ArrowUpRight, Plus } from "lucide-react";

interface RecordDistributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function RecordDistributionModal({
  open,
  onOpenChange,
  projectId,
}: RecordDistributionModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [investorName, setInvestorName] = useState("Meridian Capital Real Estate Fund III");
  const [investorType, setInvestorType] = useState<InvestorDistribution["investor_type"]>("LP_INVESTOR");
  const [distributionType, setDistributionType] = useState<InvestorDistribution["distribution_type"]>("RETURN_OF_CAPITAL");
  const [amountCents, setAmountCents] = useState("25000000"); // $250,000.00
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [wireReference, setWireReference] = useState(`DIST-MC-${Date.now().toString().slice(-4)}`);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorName.trim()) {
      setError("Recipient entity name is required.");
      return;
    }
    if (!amountCents || Number(amountCents) <= 0) {
      setError("Please enter a valid positive distribution amount.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.economics.recordInvestorDistribution(projectId, {
        investor_name: investorName.trim(),
        investor_type: investorType,
        distribution_type: distributionType,
        amount: amountCents,
        effective_date: effectiveDate,
        status: "CLEARED",
        wire_reference: wireReference.trim(),
        notes: notes.trim(),
      });

      await queryClient.invalidateQueries({ queryKey: ["economics", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["distributions", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projectDashboard", projectId] });

      onOpenChange(false);
      setNotes("");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to record distribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-subtle text-success">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle>Record Capital Distribution</ModalTitle>
              <ModalDescription>
                Record return of capital, preferred return, or profit split wire to project partners.
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
              <FormField label="Recipient Partner Entity Name" required>
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
              <FormField label="Partner Class" required>
                <select
                  value={investorType}
                  onChange={(e) =>
                    setInvestorType(e.target.value as InvestorDistribution["investor_type"])
                  }
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="LP_INVESTOR">Limited Partner (LP Equity)</option>
                  <option value="SPONSOR">General Partner (Sponsor Equity)</option>
                </select>
              </FormField>
            </div>

            <div>
              <FormField label="Waterfall Distribution Tier" required>
                <select
                  value={distributionType}
                  onChange={(e) =>
                    setDistributionType(e.target.value as InvestorDistribution["distribution_type"])
                  }
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="RETURN_OF_CAPITAL">Return of Principal Capital</option>
                  <option value="PREFERRED_RETURN">8.0% Preferred Return</option>
                  <option value="PROFIT_SPLIT">Residual Profit Split (Hurdle)</option>
                </select>
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Distribution Amount ($)" required>
                <MoneyInput
                  value={amountCents}
                  onChange={(cents) => setAmountCents(String(cents))}
                  placeholder="0.00"
                />
              </FormField>
            </div>

            <div>
              <FormField label="Disbursement Date" required>
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
              <FormField label="Outgoing Wire Reference">
                <input
                  type="text"
                  value={wireReference}
                  onChange={(e) => setWireReference(e.target.value)}
                  placeholder="e.g. DIST-WIRE-2025"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Waterfall Memo & Terms">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Cleared disbursement from sales escrow proceeds per LPA waterfall Section 4.2."
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
              className="flex items-center gap-2 rounded-md bg-success px-4 py-2 text-body font-medium text-white hover:bg-success/90 focus-visible:outline-success disabled:opacity-50"
            >
              <ArrowUpRight className="h-4 w-4" />
              {isSubmitting ? "Recording..." : "Record Distribution"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
