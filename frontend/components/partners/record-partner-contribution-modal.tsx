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
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { DollarSign, Landmark, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecordPartnerContributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partners: Array<{ name: string; role: string }>;
  onRecord: (contribution: {
    partnerName: string;
    amount: number;
    source: string;
    sourceType: "Partner Equity" | "Partner Loans" | "Unclassified";
    date: string;
    reference: string;
    notes?: string;
  }) => void;
}

export function RecordPartnerContributionModal({
  open,
  onOpenChange,
  partners,
  onRecord,
}: RecordPartnerContributionModalProps) {
  const [partnerName, setPartnerName] = useState(partners[0]?.name || "Marcus Vance");
  const [amountDollars, setAmountDollars] = useState("50000");
  const [sourceType, setSourceType] = useState<"Partner Equity" | "Partner Loans" | "Unclassified">("Partner Equity");
  const [sourceName, setSourceName] = useState("Bank transfer");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState(`TX-${Date.now().toString().slice(-4)}`);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountDollars);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid contribution amount greater than $0.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      onRecord({
        partnerName,
        amount: parsedAmount,
        source: sourceName,
        sourceType,
        date: effectiveDate,
        reference,
        notes,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to record contribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Landmark className="h-4.5 w-4.5" />
            </div>
            <div>
              <ModalTitle>Record Partner Contribution</ModalTitle>
              <ModalDescription>
                Record cleared partner equity, capital top-up, or partner loan funding into project operating accounts.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField label="Contributing Partner" required>
              <Select value={partnerName} onValueChange={(val) => setPartnerName(val)}>
                <SelectTrigger className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800">
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((p) => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.name} ({p.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Funding Classification" required>
              <Select
                value={sourceType}
                onValueChange={(val: "Partner Equity" | "Partner Loans" | "Unclassified") => {
                  setSourceType(val);
                  if (val === "Partner Equity") setSourceName("Bank transfer");
                  else if (val === "Partner Loans") setSourceName("Direct wire loan");
                  else setSourceName("Oak Tree (unclassified)");
                }}
              >
                <SelectTrigger className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800">
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Partner Equity">Partner Equity (Classified)</SelectItem>
                  <SelectItem value="Partner Loans">Partner Loan</SelectItem>
                  <SelectItem value="Unclassified">Unclassified / Sponsor Advance</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField label="Amount ($ USD)" required>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="number"
                  step="100"
                  min="1"
                  required
                  value={amountDollars}
                  onChange={(e) => setAmountDollars(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  placeholder="50000"
                />
              </div>
            </FormField>

            <FormField label="Funding Channel / Method" required>
              <input
                type="text"
                required
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                placeholder="Bank transfer / Wire transfer"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField label="Date Cleared" required>
              <input
                type="date"
                required
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </FormField>

            <FormField label="Wire / Reference ID" required>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
                placeholder="WIRE-10293"
              />
            </FormField>
          </div>

          <FormField label="Internal Memo & Purpose">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
              placeholder="e.g. Initial mobilization deposit, foundation concrete tranche..."
            />
          </FormField>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Record Contribution</span>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
