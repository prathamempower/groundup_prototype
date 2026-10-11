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
import { DuplicateInvoiceAlert } from "./duplicate-invoice-alert";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Project, DuplicateInvoiceCheckResult } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

interface CreateCostEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  project?: Project;
  onSuccess?: () => void;
}

interface CostLineItem {
  id: string;
  vendor_name: string;
  invoice_number: string;
  csi_code: string;
  csi_category: string;
  amount: string; // cents
  has_lien_waiver: boolean;
  duplicateResult?: DuplicateInvoiceCheckResult | null;
  checking?: boolean;
}

export function CreateCostEvidenceModal({
  isOpen,
  onClose,
  projectId,
  project,
  onSuccess,
}: CreateCostEvidenceModalProps) {
  const [title, setTitle] = useState("Cost Package — Concrete & Subgrade Works");
  const [description, setDescription] = useState("Direct subcontractor billing and material testing receipts for continuous foundation mat pour.");
  const [contractorName, setContractorName] = useState("Apex Construction Services LLC");
  const [gcFeePct, setGcFeePct] = useState(8.5); // 8.5% GC fee markup cap
  const [retainageRatePct, setRetainageRatePct] = useState(10);
  
  const [items, setItems] = useState<CostLineItem[]>([
    {
      id: "line_1",
      vendor_name: "Red Hook Concrete LLC",
      invoice_number: "RH-4492",
      csi_code: "03-200",
      csi_category: "Concrete & Foundation",
      amount: "1840000", // $18,400.00
      has_lien_waiver: true,
    },
    {
      id: "line_2",
      vendor_name: "Empire Geotechnical Engineering",
      invoice_number: "EMP-GEO-108",
      csi_code: "03-200",
      csi_category: "Concrete Core Compressive Testing",
      amount: "320000", // $3,200.00
      has_lien_waiver: true,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheckDuplicate = async (index: number, invNum: string, amount: string) => {
    if (!invNum.trim()) return;

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], checking: true };
      return updated;
    });

    try {
      const res = await api.submissions.checkDuplicateInvoice(projectId, {
        invoice_number: invNum,
        amount,
      });
      setItems((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          checking: false,
          duplicateResult: res.data,
        };
        return updated;
      });
    } catch {
      setItems((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], checking: false };
        return updated;
      });
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `line_${Date.now()}`,
        vendor_name: "",
        invoice_number: "",
        csi_code: "03-200",
        csi_category: "Concrete & Foundation",
        amount: "0",
        has_lien_waiver: false,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CostLineItem, value: unknown) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Computations
  const subtotalCosts = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const gcFeeAmount = Math.round(subtotalCosts * (gcFeePct / 100));
  const grossClaim = subtotalCosts + gcFeeAmount;
  const retainageAmount = Math.round(grossClaim * (retainageRatePct / 100));
  const netPayable = grossClaim - retainageAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a package title.");
      return;
    }
    if (items.length === 0 || subtotalCosts <= 0) {
      setErrorMsg("Please add at least one line item with a valid cost amount.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const evidenceItems = items.map((it) => ({
        filename: `${it.vendor_name.replace(/\s+/g, "_")}_Inv_${it.invoice_number || "Bill"}.pdf`,
        type: "INVOICE" as const,
        file_size_bytes: 1500000,
        invoice_number: it.invoice_number,
        vendor_name: it.vendor_name,
        amount: it.amount,
        notes: `${it.csi_category} (${it.csi_code}) • Lien Waiver: ${it.has_lien_waiver ? "Attached" : "Pending"}`,
      }));

      const invoiceNumbers = items
        .map((it) => it.invoice_number)
        .filter((num) => Boolean(num.trim()));

      await api.submissions.create(projectId, {
        project_id: projectId,
        type: "COST_EVIDENCE",
        title,
        description,
        csi_code: items[0]?.csi_code || "03-200",
        csi_category: items[0]?.csi_category || "Concrete & Foundation",
        claimed_amount: String(grossClaim),
        retainage_rate_pct: retainageRatePct,
        contractor_name: contractorName,
        invoice_numbers: invoiceNumbers,
        evidence_items: evidenceItems,
      });

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to submit cost evidence package.");
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
            Submit Cost Evidence Package (Open Book / Cost Plus)
          </DrawerTitle>
          <DrawerDescription className="text-caption text-text-secondary">
            Submit itemized subcontractor bills, material vouchers, and GC markup calculation for CFO reconciliation.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {errorMsg && (
              <div className="rounded-md bg-danger-subtle p-3 text-caption text-danger border border-danger/30">
                {errorMsg}
              </div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Package Title" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cost Package — Foundation & Subgrade Works"
              />
            </FormField>

            <FormField label="General Contractor / Entity" required>
              <Input
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
              />
            </FormField>
          </div>

          {/* Itemized Invoices Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-caption font-semibold text-text-primary">
                Itemized Subcontractor Bills & Receipts ({items.length})
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddItem}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Vendor Bill
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  className="rounded-lg border border-border bg-surface p-3 space-y-2.5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <div className="md:col-span-4">
                      <label className="text-caption font-medium text-text-secondary block mb-1">
                        Subcontractor / Vendor
                      </label>
                      <Input
                        value={it.vendor_name}
                        onChange={(e) => handleItemChange(idx, "vendor_name", e.target.value)}
                        placeholder="e.g. Red Hook Concrete LLC"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-caption font-medium text-text-secondary block mb-1">
                        Invoice / Bill #
                      </label>
                      <Input
                        value={it.invoice_number}
                        onChange={(e) => handleItemChange(idx, "invoice_number", e.target.value)}
                        onBlur={() => handleCheckDuplicate(idx, it.invoice_number, it.amount)}
                        placeholder="e.g. RH-4492"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-caption font-medium text-text-secondary block mb-1">
                        Bill Amount
                      </label>
                      <MoneyInput
                        value={it.amount}
                        onChange={(cents) => handleItemChange(idx, "amount", String(cents))}
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center justify-end gap-2 pt-5">
                      <label className="flex items-center gap-1.5 text-caption text-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={it.has_lien_waiver}
                          onChange={(e) => handleItemChange(idx, "has_lien_waiver", e.target.checked)}
                          className="rounded border-border text-primary"
                        />
                        <span>Lien Waiver</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-text-muted hover:text-danger p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Duplicate Invoice Warning */}
                  {it.duplicateResult && (
                    <DuplicateInvoiceAlert
                      checking={it.checking}
                      checkResult={it.duplicateResult}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cost Stack Calculation */}
          <div className="rounded-lg border border-border bg-surface-hover/50 p-4 space-y-3">
            <div className="text-caption font-semibold text-text-primary">
              Contract Calculation & Markups (Cost Plus Model)
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-caption">
              <div>
                <div className="text-text-muted">Subcontractor Total</div>
                <div className="font-mono text-body font-medium text-text-primary mt-0.5 tabular-nums">
                  {formatMoney(String(subtotalCosts))}
                </div>
              </div>

              <div>
                <div className="text-text-muted">GC Fee ({gcFeePct}%)</div>
                <div className="font-mono text-body font-medium text-text-primary mt-0.5 tabular-nums">
                  +{formatMoney(String(gcFeeAmount))}
                </div>
              </div>

              <div>
                <div className="text-text-muted">Retainage ({retainageRatePct}%)</div>
                <div className="font-mono text-body font-medium text-warning mt-0.5 tabular-nums">
                  -{formatMoney(String(retainageAmount))}
                </div>
              </div>

              <div>
                <div className="text-text-muted font-semibold text-primary">Net Payable to GC</div>
                <div className="font-mono text-body font-bold text-primary mt-0.5 tabular-nums">
                  {formatMoney(String(netPayable))}
                </div>
              </div>
            </div>
          </div>

          <FormField label="Summary Notes">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </FormField>

          </div>

          <DrawerFooter className="border-t border-border bg-subtle/30 px-6 py-4 flex-shrink-0">
            <div className="flex w-full items-center justify-between">
              <div className="text-caption text-text-muted">
                Includes duplicate checking against master ledger transactions.
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  Submit Cost Package
                </Button>
              </div>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
