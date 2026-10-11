"use client";

import React, { useState, useEffect } from "react";
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
import { DuplicateInvoiceAlert } from "./duplicate-invoice-alert";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { MilestoneItem, Project, DuplicateInvoiceCheckResult } from "@/lib/types";
import { Trash2, Camera, FileCheck } from "lucide-react";

interface CreateClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  project?: Project;
  milestones?: MilestoneItem[];
  onSuccess?: () => void;
}

interface EvidenceDraft {
  filename: string;
  type: "INVOICE" | "PHOTO" | "LIEN_WAIVER" | "PAYROLL" | "CUT_SHEET" | "OTHER";
  file_size_bytes: number;
  invoice_number?: string;
  vendor_name?: string;
  amount?: string;
  notes?: string;
}

export function CreateClaimModal({
  isOpen,
  onClose,
  projectId,
  project,
  milestones = [],
  onSuccess,
}: CreateClaimModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [contractorName, setContractorName] = useState("Apex Construction Services LLC");
  const [claimedAmount, setClaimedAmount] = useState("4500000"); // $45,000.00
  const [retainageRatePct, setRetainageRatePct] = useState(10);
  const [priorClaimedPct, setPriorClaimedPct] = useState(45);
  const [currentClaimedPct, setCurrentClaimedPct] = useState(65);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [evidenceList, setEvidenceList] = useState<EvidenceDraft[]>([
    {
      filename: "Framing_Progress_Photo_Elev_East.jpg",
      type: "PHOTO",
      file_size_bytes: 3200000,
      notes: "East elevation steel connector inspection",
    },
    {
      filename: "Partial_Conditional_Lien_Waiver_Steel.pdf",
      type: "LIEN_WAIVER",
      file_size_bytes: 1400000,
      notes: "Trade contractor partial lien waiver",
    },
  ]);

  const [checkingInvoice, setCheckingInvoice] = useState(false);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<DuplicateInvoiceCheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-fill when milestone is selected
  const handleMilestoneChange = (id: string) => {
    setMilestoneId(id);
    const ms = milestones.find((m) => m.id === id);
    if (ms) {
      setTitle(`Pay Application — ${ms.name}`);
      setDescription(`Progress claim for completion of ${ms.name}.`);
      setPriorClaimedPct(ms.percent_complete || 0);
      setCurrentClaimedPct(Math.min(100, (ms.percent_complete || 0) + 15));
    }
  };

  // Debounced duplicate invoice check
  useEffect(() => {
    if (!invoiceNumber.trim()) {
      setDuplicateCheckResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingInvoice(true);
      try {
        const res = await api.submissions.checkDuplicateInvoice(projectId, {
          invoice_number: invoiceNumber,
          amount: claimedAmount,
        });
        setDuplicateCheckResult(res.data);
      } catch {
        setDuplicateCheckResult(null);
      } finally {
        setCheckingInvoice(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [invoiceNumber, projectId, claimedAmount]);

  const claimedNum = Number(claimedAmount) || 0;
  const retainageAmount = Math.round(claimedNum * (retainageRatePct / 100));
  const netPayable = claimedNum - retainageAmount;
  const incrementalPct = Math.max(0, currentClaimedPct - priorClaimedPct);

  const handleAddPhoto = () => {
    const photoNum = evidenceList.filter((e) => e.type === "PHOTO").length + 1;
    setEvidenceList((prev) => [
      ...prev,
      {
        filename: `Site_Inspection_Photo_${photoNum}.jpg`,
        type: "PHOTO",
        file_size_bytes: 2800000,
        notes: `Field verification photo #${photoNum}`,
      },
    ]);
  };

  const handleRemoveEvidence = (idx: number) => {
    setEvidenceList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a claim title.");
      return;
    }
    if (!claimedAmount || Number(claimedAmount) <= 0) {
      setErrorMsg("Please enter a valid claim amount.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const selectedMilestone = milestones.find((m) => m.id === milestoneId);

    try {
      const evidencePayload = [...evidenceList];
      if (invoiceNumber.trim()) {
        evidencePayload.push({
          filename: `Invoice_${invoiceNumber}.pdf`,
          type: "INVOICE",
          file_size_bytes: 1800000,
          invoice_number: invoiceNumber,
          vendor_name: contractorName,
          amount: claimedAmount,
          notes: `Certified pay application invoice #${invoiceNumber}`,
        });
      }

      await api.submissions.create(projectId, {
        project_id: projectId,
        type: "PROGRESS_CLAIM",
        title,
        description,
        milestone_id: milestoneId || undefined,
        csi_code: selectedMilestone?.budget_line_code || "05-100",
        csi_category: selectedMilestone?.budget_line_name || "Structural Steel & Metal Decking",
        claimed_amount: claimedAmount,
        retainage_rate_pct: retainageRatePct,
        prior_claimed_pct: priorClaimedPct,
        current_claimed_pct: currentClaimedPct,
        contractor_name: contractorName,
        invoice_numbers: invoiceNumber ? [invoiceNumber] : [],
        evidence_items: evidencePayload,
      });

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to submit progress claim.");
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
              GC PORTAL INTAKE
            </span>
          </div>
          <DrawerTitle className="text-section font-bold text-text-primary mt-1">
            Submit Progress Claim (Pay Application)
          </DrawerTitle>
          <DrawerDescription className="text-caption text-text-secondary">
            Submit certified contractor progress claim, milestone completion percentage, and supporting field inspection evidence.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {errorMsg && (
              <div className="rounded-md bg-danger-subtle p-3 text-caption text-danger border border-danger/30">
                {errorMsg}
              </div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Milestone Plan Item" required>
              <select
                value={milestoneId}
                onChange={(e) => handleMilestoneChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-caption text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="">Select associated milestone...</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.percent_complete}% complete)
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="General Contractor / Entity" required>
              <Input
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder="e.g. Apex Construction Services LLC"
              />
            </FormField>
          </div>

          <FormField label="Claim / Pay Application Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pay Application #04 — Framing & Steel Erection"
            />
          </FormField>

          {/* Progress % Controls */}
          <div className="rounded-lg border border-border bg-surface-hover/50 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-caption font-semibold text-text-primary">
                Physical Progress Verification
              </span>
              <span className="rounded bg-primary-subtle px-2 py-0.5 text-caption font-semibold text-primary">
                +{incrementalPct}% Incremental Progress
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Prior Claimed %">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={priorClaimedPct}
                  onChange={(e) => setPriorClaimedPct(Number(e.target.value))}
                />
              </FormField>

              <FormField label="Current Cumulative %">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={currentClaimedPct}
                  onChange={(e) => setCurrentClaimedPct(Number(e.target.value))}
                />
              </FormField>

              <FormField label="Retainage Rate %">
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={retainageRatePct}
                  onChange={(e) => setRetainageRatePct(Number(e.target.value))}
                />
              </FormField>
            </div>
          </div>

          {/* Financial Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg border border-border bg-surface p-3">
            <FormField label="Gross Claim Amount" required>
              <MoneyInput
                value={claimedAmount}
                onChange={(cents) => setClaimedAmount(String(cents))}
              />
            </FormField>

            <div>
              <label className="text-caption font-medium text-text-secondary block mb-1">
                Retainage Withheld ({retainageRatePct}%)
              </label>
              <div className="h-[38px] flex items-center px-3 rounded-md bg-surface-hover border border-border font-mono text-body tabular-nums text-text-secondary">
                {formatMoney(String(retainageAmount))}
              </div>
            </div>

            <div>
              <label className="text-caption font-medium text-text-secondary block mb-1">
                Net Payable to GC
              </label>
              <div className="h-[38px] flex items-center px-3 rounded-md bg-primary-subtle border border-primary/20 font-mono text-body font-semibold tabular-nums text-primary">
                {formatMoney(String(netPayable))}
              </div>
            </div>
          </div>

          {/* Invoice Number & Duplicate Check */}
          <div className="space-y-2">
            <FormField
              label="GC Invoice / Billing Reference #"
              helperText="Enter contractor billing reference to verify against master ledger duplicate records."
            >
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-2025-089 or APEX-PAYAPP-04"
              />
            </FormField>

            <DuplicateInvoiceAlert
              checking={checkingInvoice}
              checkResult={duplicateCheckResult}
            />
          </div>

          <FormField label="Scope of Work & Completion Notes">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe work completed during this billing period, site conditions, inspections passed..."
            />
          </FormField>

          {/* Evidence Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-caption font-semibold text-text-primary">
                Evidence Attachments ({evidenceList.length})
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddPhoto}
                >
                  <Camera className="h-3.5 w-3.5 mr-1" />
                  Add Inspection Photo
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-border bg-surface divide-y divide-border">
              {evidenceList.map((ev, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-caption">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-surface-hover text-text-muted">
                      {ev.type === "PHOTO" ? (
                        <Camera className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <FileCheck className="h-3.5 w-3.5 text-success" />
                      )}
                    </div>
                    <div className="truncate">
                      <span className="font-medium text-text-primary">{ev.filename}</span>
                      {ev.notes && (
                        <span className="text-text-muted ml-2">({ev.notes})</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(idx)}
                    className="text-text-muted hover:text-danger p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-border bg-subtle/30 px-6 py-4 flex-shrink-0">
            <div className="flex w-full items-center justify-between">
              <div className="text-caption text-text-muted">
                Submission will spawn review tasks for PM, CFO, and Owner.
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  Submit Progress Claim
                </Button>
              </div>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
