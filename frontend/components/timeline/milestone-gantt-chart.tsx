"use client";

import React, { useMemo, useState } from "react";
import { MilestoneItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Link as LinkIcon,
  Flame,
  Scale,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  FileCheck2,
} from "lucide-react";

interface MilestoneGanttChartProps {
  milestones: MilestoneItem[];
  onSelectMilestone: (milestone: MilestoneItem) => void;
  selectedMilestoneId?: string | null;
}

export function MilestoneGanttChart({
  milestones,
  onSelectMilestone,
  selectedMilestoneId,
}: MilestoneGanttChartProps) {
  const [filterMode, setFilterMode] = useState<"ALL" | "CRITICAL" | "DELAYED">("ALL");

  // Determine global date envelope for the timeline axis
  const { minDate, maxDate, totalDays, months } = useMemo(() => {
    if (milestones.length === 0) {
      const now = new Date();
      return {
        minDate: new Date(now.getFullYear(), now.getMonth(), 1),
        maxDate: new Date(now.getFullYear(), now.getMonth() + 6, 1),
        totalDays: 180,
        months: [],
      };
    }

    let min = new Date(milestones[0].planned_start).getTime();
    let max = new Date(milestones[0].forecast_end || milestones[0].planned_end).getTime();

    for (const m of milestones) {
      const ps = new Date(m.planned_start).getTime();
      const fe = new Date(m.forecast_end || m.planned_end).getTime();
      const pe = new Date(m.planned_end).getTime();
      if (ps < min) min = ps;
      if (fe > max) max = fe;
      if (pe > max) max = pe;
    }

    // Pad by 12 days on each side for clean margins
    const startDate = new Date(min - 12 * 24 * 60 * 60 * 1000);
    const endDate = new Date(max + 16 * 24 * 60 * 60 * 1000);
    const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Generate monthly markers with clear spacing
    const mList: Array<{ label: string; offsetPct: number }> = [];
    const cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (cur <= endDate) {
      const offset = (cur.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const pct = (offset / days) * 100;
      if (pct >= 2 && pct <= 98) {
        const prev = mList[mList.length - 1];
        if (!prev || pct - prev.offsetPct >= 6) {
          mList.push({
            label: cur.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
            offsetPct: pct,
          });
        }
      }
      cur.setMonth(cur.getMonth() + 1);
    }

    return {
      minDate: startDate,
      maxDate: endDate,
      totalDays: days,
      months: mList,
    };
  }, [milestones]);

  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      if (filterMode === "CRITICAL") return m.critical_path;
      if (filterMode === "DELAYED") return (m.delay_days || 0) > 0 || m.status === "AT_RISK";
      return true;
    });
  }, [milestones, filterMode]);

  // Helper to convert date to percentage along timeline
  const getPercentOffset = (dateStr: string) => {
    const d = new Date(dateStr).getTime();
    const offset = (d - minDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, (offset / totalDays) * 100));
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Interactive Schedule Gantt
            </h3>
            <p className="text-[11px] text-slate-500">
              Visualizing baseline vs. forecast variance across {milestones.length} milestones
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-0.5 rounded-lg shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filterMode === "ALL"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            All ({milestones.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("CRITICAL")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filterMode === "CRITICAL"
                ? "bg-rose-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-rose-700 hover:bg-rose-50/50"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            Critical Path
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("DELAYED")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filterMode === "DELAYED"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-amber-700 hover:bg-amber-50/50"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Delayed / At Risk
          </button>
        </div>
      </div>

      {/* Axis & Gantt Timeline Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px] p-5 space-y-3">
          {/* Calendar Months Scale Axis */}
          <div className="relative h-7 border-b border-slate-200/90 text-xs text-slate-400 font-medium select-none mb-4">
            {months.map((m, idx) => (
              <div
                key={idx}
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${m.offsetPct}%` }}
              >
                <span className="text-[11px] font-medium text-slate-500 tracking-tight">{m.label}</span>
                <div className="h-2 w-px bg-slate-200 mt-1" />
              </div>
            ))}
          </div>

          {/* Milestone Rows */}
          <div className="space-y-2.5">
            {filteredMilestones.map((ms, index) => {
              const plannedLeft = getPercentOffset(ms.planned_start);
              const plannedRight = getPercentOffset(ms.planned_end);
              const plannedWidth = Math.max(2, plannedRight - plannedLeft);

              const forecastRight = getPercentOffset(ms.forecast_end || ms.planned_end);
              const forecastWidth = Math.max(2, forecastRight - plannedLeft);

              const isDelayed = (ms.delay_days || 0) > 0;
              const isSelected = selectedMilestoneId === ms.id;
              const hasConflict = ms.progress_conflict?.has_conflict && ms.progress_conflict.status === "OPEN";

              return (
                <div
                  key={ms.id}
                  onClick={() => onSelectMilestone(ms)}
                  className={`group rounded-xl border p-3.5 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "border-primary bg-indigo-50/20 ring-1 ring-primary shadow-xs"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/40 hover:shadow-2xs"
                  }`}
                >
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between gap-4 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600 tabular-nums shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                        {ms.name}
                      </span>

                      {ms.budget_line_code && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-600 font-medium">
                          {ms.budget_line_code}
                        </span>
                      )}

                      {ms.critical_path && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-100">
                          <Flame className="h-3 w-3 text-rose-500" /> Critical Path
                        </span>
                      )}

                      {hasConflict && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/80">
                          <Scale className="h-3 w-3 text-amber-600" /> Disputed ({ms.progress_conflict?.discrepancy_percent}%)
                        </span>
                      )}
                    </div>

                    {/* Metadata & Progress metrics */}
                    <div className="flex items-center gap-3.5 shrink-0 tabular-nums text-xs">
                      <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {formatDate(ms.planned_start)} &rarr; {formatDate(ms.forecast_end || ms.planned_end)}
                        </span>
                      </div>

                      {isDelayed ? (
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-100">
                          +{ms.delay_days}d Delay
                        </span>
                      ) : ms.status === "COMPLETED" ? (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                          Complete
                        </span>
                      ) : null}

                      <div className="flex items-center gap-1 font-semibold text-slate-900 min-w-[42px] justify-end">
                        <span>{ms.percent_complete}%</span>
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                  </div>

                  {/* Gantt Bar Visualization Track */}
                  <div className="relative h-6 bg-slate-100/70 rounded-lg overflow-hidden border border-slate-200/50">
                    {/* Baseline Planned Range (dashed outline) */}
                    <div
                      className="absolute top-1 bottom-1 rounded border border-dashed border-slate-400/60 bg-slate-200/30 transition-all"
                      style={{
                        left: `${plannedLeft}%`,
                        width: `${plannedWidth}%`,
                      }}
                      title={`Baseline: ${formatDate(ms.planned_start)} to ${formatDate(ms.planned_end)}`}
                    />

                    {/* Active Forecast Container */}
                    <div
                      className={`absolute top-1 bottom-1 rounded transition-all overflow-hidden ${
                        isDelayed
                          ? "bg-rose-100/70 border border-rose-300"
                          : ms.status === "COMPLETED"
                          ? "bg-emerald-100/70 border border-emerald-300"
                          : "bg-indigo-100/70 border border-indigo-300"
                      }`}
                      style={{
                        left: `${plannedLeft}%`,
                        width: `${forecastWidth}%`,
                      }}
                    >
                      {/* Percent Fill */}
                      <div
                        className={`h-full rounded-l transition-all duration-300 ${
                          ms.status === "COMPLETED"
                            ? "bg-emerald-500"
                            : isDelayed
                            ? "bg-rose-500"
                            : "bg-indigo-600"
                        }`}
                        style={{ width: `${ms.percent_complete}%` }}
                      />
                    </div>

                    {/* Delay Extension Overflow Track */}
                    {isDelayed && (
                      <div
                        className="absolute top-0 bottom-0 bg-rose-500/25 border-l-2 border-rose-600"
                        style={{
                          left: `${plannedRight}%`,
                          width: `${Math.max(1, forecastRight - plannedRight)}%`,
                        }}
                        title={`Delay Overrun: +${ms.delay_days} days`}
                      />
                    )}
                  </div>

                  {/* Predecessors / Responsible Trade Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      {ms.responsible_party && (
                        <span>Trade: <strong className="font-medium text-slate-700">{ms.responsible_party}</strong></span>
                      )}
                      {ms.evidence_count > 0 && (
                        <span className="flex items-center gap-1 text-slate-500">
                          &bull; <FileCheck2 className="h-3 w-3 text-indigo-500" /> {ms.evidence_count} evidence doc{ms.evidence_count > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {ms.dependencies && ms.dependencies.length > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <LinkIcon className="h-3 w-3 text-slate-400" />
                        <span>Predecessors:</span>
                        {ms.dependencies.map((depId) => {
                          const dep = milestones.find((m) => m.id === depId);
                          return (
                            <span
                              key={depId}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 font-medium text-[11px]"
                            >
                              {dep?.name || depId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gantt Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-5 rounded bg-indigo-600" />
            <span className="text-slate-600 font-medium">Physical Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-5 rounded border border-dashed border-slate-400 bg-slate-200/40" />
            <span className="text-slate-600 font-medium">Baseline Schedule Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-5 rounded bg-rose-500/30 border border-rose-500" />
            <span className="text-slate-600 font-medium">Schedule Delay Exposure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-rose-700 font-semibold">Critical Path Item</span>
          </div>
        </div>

        <div className="text-slate-500">
          Monthly Carry: <span className="font-semibold text-slate-800 tabular-nums font-mono">$18,500 / month</span>
        </div>
      </div>
    </div>
  );
}
