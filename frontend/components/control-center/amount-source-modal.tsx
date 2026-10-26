"use client";

import React from "react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileSpreadsheet,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AmountSourceOrigin } from "@/lib/data/control-center-origins";
import { cn } from "@/lib/utils";

interface AmountSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  origin: AmountSourceOrigin | null;
  onInspectDocument?: (fileName: string) => void;
}

export function AmountSourceModal({
  open,
  onOpenChange,
  origin,
  onInspectDocument,
}: AmountSourceModalProps) {
  if (!origin) return null;

  const isXlsx =
    origin.sourceDocument.fileType === "xlsx" ||
    origin.sourceDocument.fileName.toLowerCase().endsWith(".xlsx");

  const isWide = Boolean(origin.isComparisonTable || origin.isTimelineSchedule);

  // Clean, short title
  const cleanTitle = origin.title
    .replace(" Scope", "")
    .replace(" Total", "")
    .replace(" KPI", "")
    .trim();

  // Location string (e.g. "Page 1" or "Sheet 'Monthly Spend'")
  const locationText = origin.sourceDocument.sectionOrPage || origin.sourceDocument.section || "";
  const shortLocation = locationText.split("•")[0]?.trim() || locationText;

  // Has target dates in standard table
  const hasTargetDates = origin.components?.some((c) => Boolean(c.targetDate));

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={cn(
          "overflow-hidden flex flex-col p-0 rounded-xl bg-white border border-slate-200 shadow-xl transition-all",
          isWide ? "max-w-4xl lg:max-w-5xl" : "max-w-lg"
        )}
      >
        {/* Header - Clean & Simple */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {cleanTitle}
              </h2>
              {origin.statusBadge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                    origin.statusBadge.variant === "reconciled"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : origin.statusBadge.variant === "variance"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                >
                  {origin.statusBadge.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {origin.subtitle || "Source document & audited line items"}
            </p>
          </div>

          <div className="text-right pr-7">
            <span
              className={cn(
                "text-xl font-bold font-mono tabular-nums tracking-tight",
                origin.isNegative ? "text-rose-600" : "text-slate-900"
              )}
            >
              {origin.amountFormatted}
            </span>
          </div>
        </div>

        {/* Body - Clean, Essential items */}
        <div className="p-5 space-y-4 text-xs">
          {/* Source Document Row */}
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "h-7 w-7 rounded-md flex items-center justify-center shrink-0 border",
                  isXlsx
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                )}
              >
                {isXlsx ? (
                  <FileSpreadsheet className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate text-xs">
                  {origin.sourceDocument.fileName}
                </p>
                {shortLocation && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    {shortLocation}
                  </p>
                )}
              </div>
            </div>

            {onInspectDocument && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInspectDocument(origin.sourceDocument.fileName)}
                className="h-7 px-2.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-slate-200 shrink-0 gap-1"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View Document</span>
              </Button>
            )}
          </div>

          {/* Summary Stats Strip (for Comparison Table / Timeline) */}
          {origin.summaryStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/70 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {origin.isTimelineSchedule ? "Baseline Target" : "Approved Budget"}
                </span>
                <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                  {origin.summaryStats.approvedTotal}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {origin.isTimelineSchedule ? "Forecast Completion" : "Actual Spend"}
                </span>
                <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                  {origin.summaryStats.actualTotal}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {origin.isTimelineSchedule ? "Delay Variance" : "Net Variance"}
                </span>
                <span
                  className={cn(
                    "font-mono font-bold text-xs sm:text-sm",
                    origin.summaryStats.varianceTotal?.startsWith("+") ||
                      origin.summaryStats.varianceTotal?.includes("Slip")
                      ? "text-amber-600"
                      : "text-emerald-600"
                  )}
                >
                  {origin.summaryStats.varianceTotal}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Scope Covered
                </span>
                <span className="font-medium text-slate-700 text-xs truncate block" title={origin.summaryStats.drawsIncluded}>
                  {origin.summaryStats.drawsIncluded}
                </span>
              </div>
            </div>
          )}

          {/* CASE A: COMPARISON TABLE (Actual Spend vs Approved Budget) */}
          {origin.isComparisonTable && origin.components && origin.components.length > 0 && (
            <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
              <div className="max-h-[380px] overflow-y-auto overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-500 font-semibold text-[11px]">
                      <th className="py-2 px-3 text-left">Task / Line Item</th>
                      <th className="py-2 px-3 text-left whitespace-nowrap">Target Date</th>
                      <th className="py-2 px-3 text-left whitespace-nowrap">Bank Statement Date</th>
                      <th className="py-2 px-3 text-right whitespace-nowrap">Approved Budget</th>
                      <th className="py-2 px-3 text-right whitespace-nowrap">Actual Spend</th>
                      <th className="py-2 px-3 text-right whitespace-nowrap">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {origin.components.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5 font-medium text-slate-900">
                            {c.code && (
                              <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.5 rounded border border-slate-200/60">
                                {c.code}
                              </span>
                            )}
                            <span>{c.name}</span>
                          </div>
                          {c.transactionRef && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-xs sm:max-w-md">
                              {c.transactionRef}
                            </p>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono whitespace-nowrap text-[11px]">
                          {c.targetDate || "—"}
                        </td>
                        <td className="py-2 px-3 text-slate-800 font-mono font-medium whitespace-nowrap text-[11px]">
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {c.actualDate || "—"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-slate-600 tabular-nums whitespace-nowrap">
                          {c.approvedAmountFormatted || c.amountFormatted}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {c.actualSpendFormatted || c.amountFormatted}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-block px-1.5 py-0.5 rounded text-[11px]",
                              c.varianceFormatted?.startsWith("+")
                                ? "text-amber-700 bg-amber-50"
                                : c.varianceFormatted?.startsWith("-")
                                ? "text-blue-700 bg-blue-50"
                                : "text-slate-500 bg-slate-50"
                            )}
                          >
                            {c.varianceFormatted || "$0.00"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="sticky bottom-0 z-10 bg-slate-50/95 backdrop-blur-xs border-t-2 border-slate-200">
                    <tr className="font-bold text-slate-900">
                      <td colSpan={3} className="py-2.5 px-3">
                        Total Reconciled to Bank Statement (13 Tasks)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap text-slate-600">
                        {origin.summaryStats?.approvedTotal || origin.amountFormatted}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap text-slate-900">
                        {origin.summaryStats?.actualTotal || origin.amountFormatted}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap text-emerald-600 font-bold">
                        {origin.summaryStats?.varianceTotal || "$0.00"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* CASE B: TIMELINE SCHEDULE TABLE (Matching Image 3) */}
          {origin.isTimelineSchedule && origin.components && origin.components.length > 0 && (
            <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
              <div className="max-h-[380px] overflow-y-auto overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-900 text-white">
                    <tr className="font-semibold text-[11px]">
                      <th className="py-2 px-3 text-left">Construction Activity</th>
                      <th className="py-2 px-3 text-left">Line Item</th>
                      <th className="py-2 px-3 text-left">Status</th>
                      <th className="py-2 px-3 text-left whitespace-nowrap">Target</th>
                      <th className="py-2 px-3 text-left whitespace-nowrap">Actual / Forecast</th>
                      <th className="py-2 px-3 text-left whitespace-nowrap">Delay Incurred</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {origin.components.map((c) => {
                      const isCompleted = c.amountFormatted === "Completed";
                      const isInProgress = c.amountFormatted === "In Progress";
                      const isTarget = c.amountFormatted === "Target";
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {c.name}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                            {c.code || "—"}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isInProgress
                                  ? "bg-amber-100 text-amber-800"
                                  : isTarget
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-slate-100 text-slate-700"
                              )}
                            >
                              {c.amountFormatted}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-700 whitespace-nowrap">
                            {c.targetDate || "—"}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-900 whitespace-nowrap text-[11px]">
                            {c.actualDate || "—"}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold font-mono",
                                c.delayIncurred?.includes("slip") || c.delayIncurred?.includes("+")
                                  ? "text-amber-700 bg-amber-50"
                                  : c.delayIncurred === "On Schedule"
                                  ? "text-emerald-700 bg-emerald-50"
                                  : "text-slate-600 bg-slate-50"
                              )}
                            >
                              {c.delayIncurred || "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="sticky bottom-0 z-10 bg-slate-50/95 backdrop-blur-xs border-t-2 border-slate-200">
                    <tr className="font-bold text-slate-900 text-xs">
                      <td colSpan={3} className="py-2.5 px-3">
                        Total Activities: {origin.components.length} Tasks
                      </td>
                      <td className="py-2.5 px-3">Baseline: Nov 10, 2025</td>
                      <td className="py-2.5 px-3 font-mono text-slate-900">Current: Dec 15, 2025</td>
                      <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">+35 Days Critical Slip</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* CASE C: STANDARD LINE ITEMS TABLE (e.g. Approved Project Budget) */}
          {!origin.isComparisonTable && !origin.isTimelineSchedule && origin.components && origin.components.length > 0 && (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="max-h-[340px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="border-b border-slate-200 text-slate-500 font-medium">
                      <th className="py-2.5 px-3.5 text-left">Item</th>
                      {hasTargetDates && (
                        <th className="py-2.5 px-3 text-left whitespace-nowrap">Target Date</th>
                      )}
                      <th className="py-2.5 px-3.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {origin.components.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3.5 font-medium text-slate-900">
                          {c.code && (
                            <span className="font-mono text-slate-500 mr-2 text-[11px] font-semibold">
                              {c.code}
                            </span>
                          )}
                          <span>{c.name}</span>
                        </td>
                        {hasTargetDates && (
                          <td className="py-2.5 px-3 text-slate-600 font-mono whitespace-nowrap text-[11px]">
                            {c.targetDate || "—"}
                          </td>
                        )}
                        <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                          {c.amountFormatted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="sticky bottom-0 z-10 bg-slate-50/95 backdrop-blur-xs">
                    <tr className="border-t border-slate-200 font-bold text-slate-900">
                      <td colSpan={hasTargetDates ? 2 : 1} className="py-2.5 px-3.5">
                        Total
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums whitespace-nowrap">
                        {origin.amountFormatted}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {origin.isComparisonTable
              ? "All amounts reconciled against cleared bank debits & invoices"
              : origin.isTimelineSchedule
              ? "Milestone schedule synced with general contractor weekly field reports"
              : "Amounts extracted from certified Schedule of Values & executed change orders"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7 px-3 text-xs bg-white text-slate-700 hover:bg-slate-50 border-slate-200 rounded-md font-medium"
          >
            Close
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}

