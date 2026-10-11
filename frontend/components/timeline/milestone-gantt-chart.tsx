"use client";

import React, { useMemo, useState } from "react";
import { MilestoneItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Link as LinkIcon,
  Flame,
  Scale,
  Calendar,
  Layers,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

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

    // Pad by 15 days on each side
    const startDate = new Date(min - 15 * 24 * 60 * 60 * 1000);
    const endDate = new Date(max + 20 * 24 * 60 * 60 * 1000);
    const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Generate monthly markers with non-overlapping spacing
    const mList: Array<{ label: string; offsetPct: number }> = [];
    const cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (cur <= endDate) {
      const offset = (cur.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const pct = (offset / days) * 100;
      if (pct >= 2 && pct <= 98) {
        const prev = mList[mList.length - 1];
        if (!prev || pct - prev.offsetPct >= 5) {
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
    <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
      {/* Gantt Filter Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-subtle/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-text-secondary" />
          <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
            Visual Schedule & Critical Path
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-surface border border-border p-1 rounded-md">
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`px-2.5 py-1 rounded text-caption font-medium transition-colors ${
              filterMode === "ALL"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            All ({milestones.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("CRITICAL")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-caption font-medium transition-colors ${
              filterMode === "CRITICAL"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Flame className="h-3 w-3 text-danger" />
            Critical Path Only
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("DELAYED")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-caption font-medium transition-colors ${
              filterMode === "DELAYED"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <AlertTriangle className="h-3 w-3 text-warning" />
            Delayed / At Risk
          </button>
        </div>
      </div>

      {/* Gantt Axis & Chart Area */}
      <div className="overflow-x-auto">
        <div className="min-w-[850px] p-4 space-y-4">
          {/* Timeline Months Axis */}
          <div className="relative h-6 border-b border-border text-[11px] text-text-muted font-medium select-none">
            {months.map((m, idx) => (
              <div
                key={idx}
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${m.offsetPct}%` }}
              >
                <span>{m.label}</span>
                <div className="h-1.5 w-px bg-border mt-0.5" />
              </div>
            ))}
          </div>

          {/* Milestone Bars */}
          <div className="space-y-3 relative">
            {filteredMilestones.map((ms, index) => {
              const plannedLeft = getPercentOffset(ms.planned_start);
              const plannedRight = getPercentOffset(ms.planned_end);
              const plannedWidth = Math.max(1.5, plannedRight - plannedLeft);

              const forecastRight = getPercentOffset(ms.forecast_end || ms.planned_end);
              const forecastWidth = Math.max(1.5, forecastRight - plannedLeft);

              const isDelayed = (ms.delay_days || 0) > 0;
              const isSelected = selectedMilestoneId === ms.id;
              const hasConflict = ms.progress_conflict?.has_conflict && ms.progress_conflict.status === "OPEN";

              return (
                <div
                  key={ms.id}
                  onClick={() => onSelectMilestone(ms)}
                  className={`group rounded-lg border p-3 cursor-pointer transition-all hover:border-primary/50 hover:bg-subtle/30 ${
                    isSelected
                      ? "border-primary bg-primary-subtle/10 ring-1 ring-primary shadow-xs"
                      : "border-border bg-surface"
                  }`}
                >
                  {/* Top row: Label, Badges, Dates */}
                  <div className="flex items-center justify-between gap-4 text-caption mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-bold text-text-secondary text-[11px] tabular-nums">
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-text-primary text-body truncate">
                        {ms.name}
                      </span>

                      {ms.budget_line_code && (
                        <span className="rounded bg-subtle px-1.5 py-0.5 text-[10px] font-mono text-text-secondary">
                          {ms.budget_line_code}
                        </span>
                      )}

                      {ms.critical_path && (
                        <span className="inline-flex items-center gap-1 rounded bg-danger-subtle px-1.5 py-0.5 text-[10px] font-bold text-danger">
                          <Flame className="h-3 w-3" /> Critical Path
                        </span>
                      )}

                      {hasConflict && (
                        <span className="inline-flex items-center gap-1 rounded bg-danger-subtle px-1.5 py-0.5 text-[10px] font-bold text-danger">
                          <Scale className="h-3 w-3" /> Progress Conflict ({ms.progress_conflict?.discrepancy_percent}%)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 tabular-nums">
                      <div className="flex items-center gap-1 text-text-secondary">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDate(ms.planned_start)} &rarr; {formatDate(ms.forecast_end || ms.planned_end)}
                        </span>
                      </div>

                      {isDelayed && (
                        <span className="rounded bg-danger-subtle px-2 py-0.5 text-[11px] font-bold text-danger">
                          +{ms.delay_days}d Delay
                        </span>
                      )}

                      <span className="text-caption font-bold text-text-primary">
                        {ms.percent_complete}%
                      </span>
                    </div>
                  </div>

                  {/* Gantt Bar Visualization Track */}
                  <div className="relative h-6 bg-subtle/50 rounded-md overflow-hidden border border-border/40">
                    {/* Baseline Planned Bar (dotted/faint) */}
                    <div
                      className="absolute top-0.5 bottom-0.5 rounded border border-dashed border-text-muted/60 bg-text-muted/10"
                      style={{
                        left: `${plannedLeft}%`,
                        width: `${plannedWidth}%`,
                      }}
                      title={`Baseline Planned: ${formatDate(ms.planned_start)} to ${formatDate(ms.planned_end)}`}
                    />

                    {/* Active Forecast Bar */}
                    <div
                      className={`absolute top-1 bottom-1 rounded transition-all ${
                        isDelayed
                          ? "bg-danger/20 border border-danger/60"
                          : ms.status === "COMPLETED"
                          ? "bg-success/20 border border-success/60"
                          : "bg-primary/20 border border-primary/60"
                      }`}
                      style={{
                        left: `${plannedLeft}%`,
                        width: `${forecastWidth}%`,
                      }}
                    >
                      {/* Percent Complete Fill */}
                      <div
                        className={`h-full rounded-l transition-all ${
                          ms.status === "COMPLETED"
                            ? "bg-success"
                            : isDelayed
                            ? "bg-danger"
                            : "bg-primary"
                        }`}
                        style={{ width: `${ms.percent_complete}%` }}
                      />
                    </div>

                    {/* Delay overflow marker */}
                    {isDelayed && (
                      <div
                        className="absolute top-0 bottom-0 bg-danger/30 border-l border-danger"
                        style={{
                          left: `${plannedRight}%`,
                          width: `${Math.max(1, forecastRight - plannedRight)}%`,
                        }}
                        title={`Schedule Extension: +${ms.delay_days} days`}
                      />
                    )}
                  </div>

                  {/* Dependencies footer if present */}
                  {ms.dependencies && ms.dependencies.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-text-muted">
                      <LinkIcon className="h-3 w-3 text-text-muted" />
                      <span>Predecessors:</span>
                      {ms.dependencies.map((depId) => {
                        const depMilestone = milestones.find((m) => m.id === depId);
                        return (
                          <span
                            key={depId}
                            className="rounded bg-subtle px-1.5 py-0.5 text-text-secondary font-medium"
                          >
                            {depMilestone?.name || depId}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-subtle/30 px-4 py-2.5 text-[11px] text-text-secondary">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-6 rounded bg-primary" />
            <span>Completed Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-6 rounded border border-dashed border-text-muted bg-text-muted/10" />
            <span>Baseline Planned Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-6 rounded bg-danger/30 border border-danger" />
            <span>Schedule Delay Exposure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-danger" />
            <span className="font-semibold text-danger">Critical Path</span>
          </div>
        </div>

        <div className="text-text-muted">
          Financing Carry: <span className="font-semibold text-text-primary">$18,500 / month</span>
        </div>
      </div>
    </div>
  );
}
