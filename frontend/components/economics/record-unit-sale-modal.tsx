"use client";

import React, { useState, useEffect } from "react";
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
import { DispositionUnit } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { Home, FileCheck, CheckCircle2 } from "lucide-react";

interface RecordUnitSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: DispositionUnit | null;
  projectId: string;
}

export function RecordUnitSaleModal({
  open,
  onOpenChange,
  unit,
  projectId,
}: RecordUnitSaleModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<DispositionUnit["status"]>("UNDER_CONTRACT");
  const [contractSalePrice, setContractSalePrice] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [contractDate, setContractDate] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [hudSettlementId, setHudSettlementId] = useState("");
  const [settlementDocName, setSettlementDocName] = useState("");

  useEffect(() => {
    if (unit) {
      setStatus(unit.status);
      setContractSalePrice(unit.contract_sale_price || unit.original_list_price);
      setBuyerName(unit.buyer_name || "");
      setContractDate(unit.contract_date || new Date().toISOString().split("T")[0]);
      setClosingDate(unit.closing_date || "");
      setHudSettlementId(unit.hud_settlement_id || `HUD-${unit.unit_identifier.replace(/\s+/g, "")}`);
      setSettlementDocName(unit.settlement_document_name || `HUD1_Settlement_${unit.unit_identifier.replace(/\s+/g, "_")}.pdf`);
      setError(null);
    }
  }, [unit, open]);

  if (!unit) return null;

  const priceNum = Number(contractSalePrice || 0);
  const estimatedCommission = Math.round(priceNum * 0.04);
  const estimatedTransferTax = Math.round(priceNum * 0.0215);
  const estimatedNet = priceNum - estimatedCommission - estimatedTransferTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractSalePrice || Number(contractSalePrice) <= 0) {
      setError("Valid contract sale price is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.economics.recordDispositionSale(projectId, unit.id, {
        status,
        contract_sale_price: contractSalePrice,
        buyer_name: buyerName.trim() || undefined,
        contract_date: contractDate || undefined,
        closing_date: closingDate || undefined,
        hud_settlement_id: status === "CLOSED" ? hudSettlementId : undefined,
        settlement_document_name: status === "CLOSED" ? settlementDocName : undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ["economics", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["dispositionUnits", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projectDashboard", projectId] });

      onOpenChange(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to update unit disposition record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="lg">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle>Update Disposition Sale &bull; {unit.unit_identifier}</ModalTitle>
              <ModalDescription>
                {unit.unit_type} &bull; {unit.sqft} SQFT &bull; Original List: {formatMoney(unit.original_list_price)}
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
            <div>
              <FormField label="Disposition Status" required>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DispositionUnit["status"])}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="AVAILABLE">Active Listing (Available)</option>
                  <option value="UNDER_CONTRACT">Under Executed Purchase Contract</option>
                  <option value="CLOSED">Closed & Funded (Deed Recorded)</option>
                </select>
              </FormField>
            </div>

            <div>
              <FormField label="Contract Sale Price ($)" required>
                <MoneyInput
                  value={contractSalePrice}
                  onChange={(cents) => setContractSalePrice(String(cents))}
                  placeholder="0.00"
                />
              </FormField>
            </div>

            <div>
              <FormField label="Buyer Name / Entity">
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Jonathan & Claire Sterling"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            <div>
              <FormField label="Purchase Contract Date">
                <input
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            {status === "CLOSED" && (
              <>
                <div>
                  <FormField label="Title Closing / Settlement Date" required>
                    <input
                      type="date"
                      value={closingDate}
                      onChange={(e) => setClosingDate(e.target.value)}
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="HUD-1 / Closing Settlement Number">
                    <input
                      type="text"
                      value={hudSettlementId}
                      onChange={(e) => setHudSettlementId(e.target.value)}
                      placeholder="e.g. HUD-73-1A-2025"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Executed Settlement Document Name">
                    <input
                      type="text"
                      value={settlementDocName}
                      onChange={(e) => setSettlementDocName(e.target.value)}
                      placeholder="e.g. Executed_HUD1_Settlement_Unit_1A.pdf"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </FormField>
                </div>
              </>
            )}
          </div>

          {/* Proceeds Breakdown Card */}
          <div className="rounded-lg border border-border bg-subtle/40 p-4 space-y-2">
            <div className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
              Net Disposition Proceeds Calculation
            </div>
            <div className="grid grid-cols-3 gap-3 text-caption pt-1 border-t border-border/50">
              <div>
                <span className="text-text-muted">Broker Commission (4%):</span>
                <div className="font-semibold text-text-primary tabular-nums mt-0.5">
                  {formatMoney(estimatedCommission)}
                </div>
              </div>
              <div>
                <span className="text-text-muted">Transfer Tax & Title (2.15%):</span>
                <div className="font-semibold text-text-primary tabular-nums mt-0.5">
                  {formatMoney(estimatedTransferTax)}
                </div>
              </div>
              <div>
                <span className="text-text-muted">Estimated Net Proceeds:</span>
                <div className="font-bold text-success tabular-nums mt-0.5">
                  {formatMoney(estimatedNet)}
                </div>
              </div>
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
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Disposition Update"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
