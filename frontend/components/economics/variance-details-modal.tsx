"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface VarianceCategoryDetail {
  category: string;
  originalAmountCents: number;
  currentForecastCents: number;
  varianceCents: number;
  pctChange: number;
  isFavorable: boolean;
  description: string;
  drivers: Array<{
    title: string;
    description: string;
    amountCents: number;
    status?: "APPROVED" | "PENDING" | "ESTIMATED";
    date?: string;
  }>;
  supportingDocuments: Array<{
    name: string;
    type: string;
    size?: string;
    date?: string;
  }>;
}

interface VarianceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: VarianceCategoryDetail | null;
}

export function VarianceDetailsModal({
  open,
  onOpenChange,
  detail,
}: VarianceDetailsModalProps) {
  if (!detail) return null;

  const isCost = detail.category !== "Projected Gross Sales";
  // For costs: if variance > 0 (cost increased), it's unfavorable.
  const isPositiveVariance = detail.varianceCents > 0;
  const isFavorable = detail.isFavorable;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <ModalTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                {detail.category} Variance Analysis
              </ModalTitle>
              <ModalDescription className="text-sm text-slate-500 mt-1">
                Underwriting baseline vs current active forecast breakdown & supporting audit records.
              </ModalDescription>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold",
                isFavorable
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              )}
            >
              {isFavorable ? (
                <>
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  Favorable ({detail.pctChange >= 0 ? `+${detail.pctChange}%` : `${detail.pctChange}%`})
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Unfavorable ({detail.pctChange >= 0 ? `+${detail.pctChange}%` : `${detail.pctChange}%`})
                </>
              )}
            </span>
          </div>
        </ModalHeader>

        <div className="space-y-6 py-4">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Original Plan
              </p>
              <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {formatMoney(detail.originalAmountCents)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Current Forecast
              </p>
              <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {formatMoney(detail.currentForecastCents)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Net Variance
              </p>
              <p
                className={cn(
                  "text-lg font-bold tabular-nums mt-0.5 flex items-center gap-1",
                  isFavorable ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {isPositiveVariance ? "+" : ""}
                {formatMoney(detail.varianceCents)}
              </p>
            </div>
          </div>

          {/* Description / Rationale */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Executive Rationale
            </h4>
            <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
              {detail.description}
            </p>
          </div>

          {/* Drivers & Adjustments */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Cost Drivers & Line Adjustments ({detail.drivers.length})
            </h4>
            <div className="space-y-2">
              {detail.drivers.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No individual adjustments recorded.</p>
              ) : (
                detail.drivers.map((drv, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{drv.title}</span>
                        {drv.status && (
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
                              drv.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : drv.status === "PENDING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {drv.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{drv.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">
                        {formatMoney(drv.amountCents)}
                      </span>
                      {drv.date && (
                        <p className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {drv.date}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Supporting Documents */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Supporting Records & Documents ({detail.supportingDocuments.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {detail.supportingDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="min-w-0 flex-1 truncate">
                    <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                    <p className="text-slate-400 text-[11px]">
                      {doc.type} {doc.date ? `• ${doc.date}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
