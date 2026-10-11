"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { api } from "@/lib/api";
import { Project } from "@/lib/types";
import { AlertCircle, ShieldAlert } from "lucide-react";

interface CreateCorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  project?: Project;
  onSuccess?: () => void;
}

const COR_REASONS = [
  { value: "UNFORESEEN_CONDITION", label: "Unforeseen Subsurface / Field Condition" },
  { value: "ARCHITECTURAL_REVISION", label: "Architectural / Engineering Revision (RFI/Bulletins)" },
  { value: "OWNER_SCOPE_CHANGE", label: "Owner-Requested Scope Enhancement" },
  { value: "MUNICIPAL_CODE", label: "Municipal DOB / Energy Code Compliance" },
  { value: "MATERIAL_ESCALATION", label: "Material Escalation / Tariff Surcharge" },
];

const CSI_OPTIONS = [
  { code: "02-100", category: "Demolition & Excavation" },
  { code: "03-200", category: "Concrete & Foundation Works" },
  { code: "04-100", category: "Masonry & Exterior Brick" },
  { code: "05-100", category: "Structural Steel & Metal Decking" },
  { code: "08-100", category: "Doors, Windows & Glazing" },
  { code: "15-300", category: "MEP Systems (HVAC & Electrical)" },
  { code: "16-000", category: "Electrical & Low Voltage" },
];

export function CreateCorModal({
  isOpen,
  onClose,
  projectId,
  project,
  onSuccess,
}: CreateCorModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reasonCategory, setReasonCategory] = useState("UNFORESEEN_CONDITION");
  const [csiCode, setCsiCode] = useState("15-300");
  const [requestedAmount, setRequestedAmount] = useState("3500000"); // $35,000.00
  const [scheduleDelayDays, setScheduleDelayDays] = useState(14);
  const [quoteNumber, setQuoteNumber] = useState("");
  const [contractorName, setContractorName] = useState("Apex Construction Services LLC");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a change order title.");
      return;
    }
    if (!requestedAmount || Number(requestedAmount) <= 0) {
      setErrorMsg("Please enter a valid requested amount.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const selectedCSI = CSI_OPTIONS.find((c) => c.code === csiCode);

    try {
      await api.submissions.create(projectId, {
        project_id: projectId,
        type: "CHANGE_ORDER_REQUEST",
        title,
        description: `[${reasonCategory}] ${description}`,
        csi_code: csiCode,
        csi_category: selectedCSI?.category || "MEP Systems",
        claimed_amount: requestedAmount,
        schedule_delay_days: scheduleDelayDays,
        contractor_name: contractorName,
        invoice_numbers: quoteNumber ? [quoteNumber] : [],
        evidence_items: [
          {
            filename: `Subcontractor_Quote_${quoteNumber || "Estimate"}.pdf`,
            type: "CUT_SHEET",
            file_size_bytes: 2100000,
            notes: `Trade quote and engineering cut-sheets for ${title}`,
            amount: requestedAmount,
          },
        ],
      });

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to submit change order request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent width="full-height-sheet" className="flex flex-col h-full bg-surface">
        <DrawerHeader className="border-b border-border bg-subtle/30 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary-subtle text-primary font-mono px-2 py-0.5 text-caption font-semibold">
              GC CHANGE CONTROL
            </span>
          </div>
          <DrawerTitle className="text-section font-bold text-text-primary mt-1">
            Request Change Order (GC Change Order Proposal)
          </DrawerTitle>
          <DrawerDescription className="text-caption text-text-secondary">
            Submit a formal Change Order Request for unforeseen field conditions, design revisions, or scope additions.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {errorMsg && (
              <div className="rounded-md bg-danger-subtle p-3 text-caption text-danger border border-danger/30">
                {errorMsg}
              </div>
            )}

          <FormField label="Change Order Proposal Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Additional Subgrade Underpinning & Water Barrier"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Cause & Justification Category" required>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-caption text-text-primary focus:border-primary focus:outline-none"
              >
                {COR_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Target CSI Budget Division" required>
              <select
                value={csiCode}
                onChange={(e) => setCsiCode(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-caption text-text-primary focus:border-primary focus:outline-none"
              >
                {CSI_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.category}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Requested Cost Adjustment ($)" required>
              <MoneyInput
                value={requestedAmount}
                onChange={(cents) => setRequestedAmount(String(cents))}
              />
            </FormField>

            <FormField
              label="Critical Path Schedule Impact"
              helperText="Estimated calendar day extension to project baseline"
            >
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="365"
                  value={scheduleDelayDays}
                  onChange={(e) => setScheduleDelayDays(Number(e.target.value))}
                />
                <span className="absolute right-3 top-2 text-caption text-text-muted">
                  calendar days
                </span>
              </div>
            </FormField>
          </div>

          <FormField label="Subcontractor Quote / Bid Reference #">
            <Input
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              placeholder="e.g. APEX-BID-2025-04 or SUB-QUOTE-88"
            />
          </FormField>

          <FormField label="Scope Explanation & Technical Rationale" required>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Explain the field conditions encountered, architectural directives, labor/material requirements, and why this scope is outside base contract..."
            />
          </FormField>

            <div className="rounded-lg bg-surface-hover p-3 text-caption text-text-secondary border border-border flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Sponsor Review Flow:</strong> Once submitted, this Change Order Request will create an operational review task for the Project Manager (technical merit), CFO (contingency fund availability), and Owner (final financial authorization).
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t border-border bg-subtle/30 px-6 py-4 flex-shrink-0">
            <div className="flex w-full items-center justify-between">
              <div className="text-caption text-text-muted flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-warning" />
                <span>Only Sponsor/Owner authorization can approve budget baseline adjustments.</span>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  Submit Change Order Request
                </Button>
              </div>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
