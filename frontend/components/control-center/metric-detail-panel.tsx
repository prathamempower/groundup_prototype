"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileSpreadsheet,
  Eye,
  X,
  AlertTriangle,
  Clock,
  Sliders,
} from "lucide-react";
import { AmountSourceOrigin } from "@/lib/data/control-center-origins";
import { cn } from "@/lib/utils";
import { TimelineScheduleEditorModal } from "./timeline-schedule-editor-modal";
import {
  predictTimelineSchedule,
  ComputedMilestoneSchedule,
} from "@/lib/utils/timeline-prediction";

interface MetricDetailPanelProps {
  origin: AmountSourceOrigin;
  onClose?: () => void;
  onInspectDocument?: (fileName: string) => void;
  className?: string;
}

export function MetricDetailPanel({
  origin,
  onClose,
  onInspectDocument,
  className,
}: MetricDetailPanelProps) {
  const isXlsx =
    origin.sourceDocument.fileType === "xlsx" ||
    origin.sourceDocument.fileName.toLowerCase().endsWith(".xlsx");

  // Clean, short title
  const cleanTitle = origin.title
    .replace(" Scope", "")
    .replace(" Total", "")
    .replace(" KPI", "")
    .trim();

  // Location string (e.g. "Page 1" or "Sheet 'Monthly Spend'")
  const locationText = origin.sourceDocument.sectionOrPage || origin.sourceDocument.section || "";
  const shortLocation = locationText.split("•")[0]?.trim() || locationText;

  // Timeline schedule editor state and localStorage persistence
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false);
  const [scheduleDelayDays, setScheduleDelayDays] = useState<number>(35);
  const [scheduleOverrides, setScheduleOverrides] = useState<Record<string, string>>({});

  // Read persisted schedule from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("groundup_timeline_schedule_completion_timeline");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.delayDays === "number") {
            setScheduleDelayDays(parsed.delayDays);
          }
          if (parsed.userOverrides && typeof parsed.userOverrides === "object") {
            setScheduleOverrides(parsed.userOverrides);
          }
        }
      } catch {
        // Ignore localStorage parse errors
      }
    }
  }, []);

  // Compute live prediction cascading from current delay and overrides
  const predictedTimeline = useMemo(() => {
    return predictTimelineSchedule(scheduleDelayDays, scheduleOverrides);
  }, [scheduleDelayDays, scheduleOverrides]);

  const handleSaveSchedule = (data: {
    delayDays: number;
    userOverrides: Record<string, string>;
    computedMilestones: ComputedMilestoneSchedule[];
    finalCoDate: string;
    interestCarryFormatted: string;
  }) => {
    setScheduleDelayDays(data.delayDays);
    setScheduleOverrides(data.userOverrides);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "groundup_timeline_schedule_completion_timeline",
          JSON.stringify({
            delayDays: data.delayDays,
            userOverrides: data.userOverrides,
          })
        );
      } catch {
        // Ignore localStorage quota errors
      }
    }
  };

  // Synchronized components with live predicted / overridden dates
  const displayComponents = useMemo(() => {
    if (!origin.components) return [];

    // If Actual Spend comparison table, keep HVAC line item in sync
    if (origin.isComparisonTable) {
      return origin.components.map((c) => {
        if (c.code === "04.03") {
          return {
            ...c,
            targetDate: "Oct 20, 2025",
            actualDate: `${predictedTimeline.hvacTargetDate} (Slip +${scheduleDelayDays}d)`,
            delayIncurred: `+${scheduleDelayDays} Days (${predictedTimeline.interestCarry.formatted} Interest Carry)`,
            notes: `Currently delayed (+${scheduleDelayDays}d from Oct 20 to ${predictedTimeline.hvacTargetDate}): $35,000.00 spent to date; $5,000 retainage held pending unit delivery. Critical delay incurs ${predictedTimeline.interestCarry.formatted} loan interest carry.`,
          };
        }
        return c;
      });
    }

    if (!origin.isTimelineSchedule) {
      return origin.components;
    }

    const milestoneMap = new Map(
      predictedTimeline.milestones.map((m) => [m.id, m])
    );

    return origin.components.map((c) => {
      const computed = milestoneMap.get(c.id);
      if (!computed) return c;

      return {
        ...c,
        targetDate: computed.targetDate,
        amountFormatted:
          computed.status === "Delayed"
            ? `Delayed (+${scheduleDelayDays}d)`
            : c.amountFormatted,
        notes: computed.notes || c.notes,
      };
    });
  }, [
    origin.components,
    origin.isComparisonTable,
    origin.isTimelineSchedule,
    predictedTimeline,
    scheduleDelayDays,
  ]);

  // Dynamic header amount
  const headerAmount = origin.isTimelineSchedule
    ? predictedTimeline.finalCoDate
    : origin.amountFormatted;

  // Has target dates or actual/funded dates in standard table
  const hasTargetDates = origin.id !== "approved_budget" && displayComponents?.some((c) => Boolean(c.targetDate));
  const hasActualDates = displayComponents?.some((c) => Boolean(c.actualDate));

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all duration-200 w-full max-w-full min-w-0",
        className
      )}
    >
      {/* Header */}
      <div className="px-3.5 sm:px-5 pt-3.5 pb-2.5 sm:pt-4 sm:pb-3 border-b border-slate-100 flex items-start sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
            {cleanTitle}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Source document
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right">
            <span
              className={cn(
                "text-base sm:text-xl font-bold font-mono tabular-nums tracking-tight block leading-tight",
                origin.isNegative ? "text-rose-600" : "text-slate-900"
              )}
            >
              {headerAmount}
            </span>
            {origin.isTimelineSchedule && (
              <span className="text-[10px] text-slate-500 font-mono block -mt-0.5">
                Target: Nov 10, 2025
              </span>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close details"
              className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 text-xs">
        {/* Source Document Row */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
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
                <p className="text-[11px] text-slate-500 font-mono truncate">
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
              className="h-7 px-2.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-slate-200 shrink-0 gap-1 ml-auto sm:ml-0 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>View Document</span>
            </Button>
          )}
        </div>

        {/* CASE A: COMPARISON TABLE (Actual Spend vs Approved Budget) */}
        {origin.isComparisonTable && displayComponents && displayComponents.length > 0 && (
          <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex flex-col bg-white">
            <div className="max-h-[340px] overflow-y-auto overflow-x-auto touch-pan-x touch-pan-y">
              <table className="w-full text-xs min-w-[620px]">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 font-semibold text-[11px]">
                    <th className="py-2.5 px-3 text-left">Task / Line Item</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap">Start Date</th>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap">Completion Date</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Approved Budget</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Actual Spend</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {displayComponents.map((c) => {
                    const isItemDelayed = c.code === "04.03" || c.status === "Delayed" || c.delayIncurred?.includes("+");

                    return (
                      <tr
                        key={c.id}
                        className={cn(
                          "transition-colors",
                          isItemDelayed
                            ? "bg-amber-50/70 hover:bg-amber-100/60 border-l-2 border-l-amber-500 font-medium"
                            : "hover:bg-slate-50/80"
                        )}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap items-center gap-1.5 font-medium text-slate-900">
                            {c.code && (
                              <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.5 rounded border border-slate-200/60 shrink-0">
                                {c.code}
                              </span>
                            )}
                            <span className="truncate max-w-[200px] sm:max-w-none">{c.name}</span>
                            {isItemDelayed && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Delayed (+{scheduleDelayDays}d)
                              </span>
                            )}
                          </div>
                          {c.transactionRef && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-xs sm:max-w-md">
                              {c.transactionRef}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono whitespace-nowrap text-[11px]">
                          {c.targetDate || "-"}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium whitespace-nowrap text-[11px]">
                          {isItemDelayed ? (
                            <span className="text-amber-900 font-bold">{c.actualDate}</span>
                          ) : (
                            <span className="text-slate-800">{c.actualDate || "-"}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-600 tabular-nums whitespace-nowrap">
                          {c.approvedAmountFormatted || c.amountFormatted}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {c.actualSpendFormatted || c.amountFormatted}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap">
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Docked Total Bar - Stable & 100% Responsive */}
            <div className="bg-slate-50/95 border-t border-slate-200 px-3.5 py-2.5 shrink-0">
              <div className="hidden sm:flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Total Reconciled to Bank Statement (13 Tasks)</span>
                <div className="flex items-center gap-5 font-mono">
                  <span className="text-slate-600 font-medium">
                    Approved: {origin.summaryStats?.approvedTotal || origin.amountFormatted}
                  </span>
                  <span className="text-slate-900 font-bold">
                    Actual: {origin.summaryStats?.actualTotal || origin.amountFormatted}
                  </span>
                  <span className="text-emerald-600 font-bold">
                    Variance: {origin.summaryStats?.varianceTotal || "$0.00"}
                  </span>
                </div>
              </div>
              <div className="sm:hidden space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="truncate mr-2">Total Reconciled</span>
                  <span className="font-mono tabular-nums shrink-0">
                    {origin.summaryStats?.actualTotal || origin.amountFormatted}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200/60">
                  <span>Approved: <strong className="text-slate-700">{origin.summaryStats?.approvedTotal || origin.amountFormatted}</strong></span>
                  <span>Variance: <strong className="text-emerald-600 font-bold">{origin.summaryStats?.varianceTotal || "$0.00"}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE B: TIMELINE SCHEDULE TABLE */}
        {origin.isTimelineSchedule && displayComponents && displayComponents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-end gap-2 px-0.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsScheduleEditorOpen(true)}
                className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-slate-300 text-blue-700 bg-white hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 transition-colors cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>Edit Timeline</span>
              </Button>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex flex-col bg-white">
              <div className="max-h-[340px] overflow-y-auto overflow-x-auto touch-pan-x touch-pan-y">
                <table className="w-full text-xs min-w-[500px]">
                  <thead className="sticky top-0 z-10 bg-[#1e3a5f] text-white">
                    <tr className="font-semibold text-[11px]">
                      <th className="py-2.5 px-3.5 text-left">Construction Activity</th>
                      <th className="py-2.5 px-3 text-left">Line Item</th>
                      <th className="py-2.5 px-3 text-left">Status</th>
                      <th className="py-2.5 px-3.5 text-left whitespace-nowrap">Target Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {displayComponents.map((c) => {
                      const isCompleted = c.amountFormatted === "Completed";
                      const isInProgress = c.amountFormatted === "In Progress";
                      const isTarget = c.amountFormatted === "Target";
                      const isDelayed = c.amountFormatted.includes("Delayed") || c.code === "04.03";
                      const isOverridden = Boolean(scheduleOverrides[c.id]);
                      const isDownstream = ["tl-15", "tl-16", "tl-17", "tl-18", "tl-19"].includes(c.id);

                      return (
                        <tr
                          key={c.id}
                          className={cn(
                            "transition-colors",
                            isDelayed
                              ? "bg-amber-50/70 hover:bg-amber-100/60 border-l-2 border-l-amber-500 font-medium"
                              : "hover:bg-slate-50/80"
                          )}
                        >
                          <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              {isDelayed && (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                              )}
                              <span>{c.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                            {c.code || "-"}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isDelayed
                                  ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold"
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
                          <td className="py-2.5 px-3.5 font-medium text-slate-700 whitespace-nowrap font-mono text-[11px]">
                            {isDelayed ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-amber-950 font-bold">{c.targetDate}</span>
                                  {isOverridden ? (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-950 border border-amber-300">
                                      Custom
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-amber-100 text-amber-900 border border-amber-200">
                                      Auto (+{scheduleDelayDays}d)
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-amber-700 block font-normal">
                                  Delayed +{scheduleDelayDays}d · Given: {predictedTimeline.timeGivenDays}d (to {c.targetDate})
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span>{c.targetDate || "-"}</span>
                                {isOverridden && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    Custom
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Docked Total Bar - Stable & 100% Responsive */}
              <div className="bg-slate-50/95 border-t border-slate-200 px-3.5 py-2.5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-bold text-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700">Total Activities: {displayComponents.length} Tasks</span>
                  <span className="text-slate-300 hidden sm:inline">·</span>
                  <span className="text-amber-700 font-mono text-[11px] font-semibold">Critical Delay: +{scheduleDelayDays} Days</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] sm:text-xs">
                  <span className="text-slate-500 font-normal">Target: Nov 10</span>
                  <span className="text-slate-300">→</span>
                  <span className="text-slate-900 font-bold">Forecast: {predictedTimeline.finalCoDate}</span>
                  <span className="text-amber-700 font-bold ml-1">({predictedTimeline.interestCarry.formatted} Interest Carry)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE C: STANDARD LINE ITEMS TABLE (e.g. Approved Project Budget, Draw Received) */}
        {!origin.isComparisonTable && !origin.isTimelineSchedule && displayComponents && displayComponents.length > 0 && (
          <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex flex-col bg-white">
            <div className="max-h-[340px] overflow-y-auto overflow-x-auto touch-pan-x touch-pan-y">
              <table className="w-full text-xs min-w-[480px]">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 font-medium text-[11px]">
                    <th className="py-2.5 px-3.5 text-left">Item</th>
                    {hasTargetDates && (
                      <th className="py-2.5 px-3 text-left whitespace-nowrap">Target Date</th>
                    )}
                    {hasActualDates && (
                      <th className="py-2.5 px-3 text-left whitespace-nowrap">Funded Date</th>
                    )}
                    <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {displayComponents.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3.5 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          {c.code && (
                            <span className="font-mono text-slate-500 text-[11px] font-semibold bg-slate-100 px-1 py-0.5 rounded border border-slate-200/60 shrink-0">
                              {c.code}
                            </span>
                          )}
                          <span className="break-words">{c.name}</span>
                        </div>
                      </td>
                      {hasTargetDates && (
                        <td className="py-2.5 px-3 text-slate-600 font-mono whitespace-nowrap text-[11px]">
                          {c.targetDate || "-"}
                        </td>
                      )}
                      {hasActualDates && (
                        <td className="py-2.5 px-3 text-slate-700 font-mono font-medium whitespace-nowrap text-[11px]">
                          {c.actualDate || "-"}
                        </td>
                      )}
                      <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                        {c.amountFormatted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Docked Total Bar - Stable & 100% Responsive */}
            <div className="bg-slate-50/95 border-t border-slate-200 px-3.5 py-2.5 shrink-0 flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="text-slate-700">Total</span>
              <span className="text-slate-900 font-mono tabular-nums text-sm sm:text-xs">
                {origin.amountFormatted}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Timeline Schedule Editor Modal */}
      <TimelineScheduleEditorModal
        isOpen={isScheduleEditorOpen}
        onClose={() => setIsScheduleEditorOpen(false)}
        initialDelayDays={scheduleDelayDays}
        initialOverrides={scheduleOverrides}
        onSaveSchedule={handleSaveSchedule}
      />
    </div>
  );
}
