"use client";

import React, { useMemo, useState } from "react";
import { MilestoneItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MilestoneGanttChartProps {
  milestones: MilestoneItem[];
  onSelectMilestone: (milestone: MilestoneItem) => void;
  selectedMilestoneId?: string | null;
  onUpdateMilestoneDate?: (milestone: MilestoneItem, newForecastEnd: string, reason?: string) => Promise<void>;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onOpenCreateModal?: () => void;
}

export function MilestoneGanttChart({
  milestones,
  onSelectMilestone,
  selectedMilestoneId,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
}: MilestoneGanttChartProps) {
  const [scaleMode, setScaleMode] = useState<"MONTHS" | "QUARTERS" | "YEARS">("MONTHS");
  const [rangeOffsetMonths, setRangeOffsetMonths] = useState(0);

  // Ref to the timeline track element
  const timelineTrackRef = React.useRef<HTMLDivElement | null>(null);

  // Determine dynamic date envelope based on actual milestone data and selected scaleMode
  const { minDate, maxDate, totalDuration, timelineColumns, yearHeaders, todayPositionPct } = useMemo(() => {
    let minTime = Number.MAX_SAFE_INTEGER;
    let maxTime = Number.MIN_SAFE_INTEGER;

    if (milestones.length > 0) {
      for (const m of milestones) {
        const ps = new Date(m.planned_start).getTime();
        const fe = new Date(m.forecast_end || m.planned_end).getTime();
        if (ps < minTime) minTime = ps;
        if (fe > maxTime) maxTime = fe;
      }
    } else {
      minTime = new Date("2025-01-01").getTime();
      maxTime = new Date("2026-12-31").getTime();
    }

    // Align to start of first month minus padding, applying rangeOffsetMonths
    const startDate = new Date(minTime);
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth() - 1 + rangeOffsetMonths);

    // Align to end of final month plus padding, applying rangeOffsetMonths
    const endDate = new Date(maxTime);
    endDate.setDate(28);
    endDate.setMonth(endDate.getMonth() + 2 + rangeOffsetMonths);

    const startTs = startDate.getTime();
    const endTs = endDate.getTime();
    const duration = Math.max(1, endTs - startTs);

    // Build timeline columns based on scaleMode
    let columns: Array<{ label: string; year: string; date: Date; widthPct?: number }> = [];
    const yearsMap: Record<string, number> = {};

    if (scaleMode === "MONTHS") {
      const cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      while (cur <= endDate) {
        const mLabel = cur.toLocaleDateString("en-US", { month: "short" });
        const yLabel = String(cur.getFullYear());
        columns.push({
          label: mLabel,
          year: yLabel,
          date: new Date(cur.getTime()),
        });
        yearsMap[yLabel] = (yearsMap[yLabel] || 0) + 1;
        cur.setMonth(cur.getMonth() + 1);
      }
    } else if (scaleMode === "QUARTERS") {
      // Group by quarters (Q1, Q2, Q3, Q4)
      const curYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      for (let y = curYear; y <= endYear; y++) {
        for (let q = 1; q <= 4; q++) {
          const qMonth = (q - 1) * 3;
          const qDate = new Date(y, qMonth, 1);
          const qEnd = new Date(y, qMonth + 3, 0);
          if (qEnd >= startDate && qDate <= endDate) {
            const yLabel = String(y);
            columns.push({
              label: `Q${q}`,
              year: yLabel,
              date: qDate,
            });
            yearsMap[yLabel] = (yearsMap[yLabel] || 0) + 1;
          }
        }
      }
    } else {
      // YEARS mode: 1 column per year
      const curYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      for (let y = curYear; y <= endYear; y++) {
        const yDate = new Date(y, 0, 1);
        const yLabel = String(y);
        columns.push({
          label: yLabel,
          year: yLabel,
          date: yDate,
        });
        yearsMap[yLabel] = 1;
      }
    }

    if (columns.length === 0) {
      columns.push({
        label: "Current",
        year: String(startDate.getFullYear()),
        date: startDate,
      });
      yearsMap[String(startDate.getFullYear())] = 1;
    }

    // Build year groupings
    const years = Object.keys(yearsMap).map((y) => ({
      year: y,
      count: yearsMap[y],
      widthPct: (yearsMap[y] / columns.length) * 100,
    }));

    // Today indicator (defaults to Oct 15, 2025 or current date)
    const todayTs = new Date("2025-10-15").getTime();
    const todayPct = Math.max(0, Math.min(100, ((todayTs - startTs) / duration) * 100));

    return {
      minDate: startDate,
      maxDate: endDate,
      totalDuration: duration,
      timelineColumns: columns,
      yearHeaders: years,
      todayPositionPct: todayPct,
    };
  }, [milestones, scaleMode, rangeOffsetMonths]);

  const timelineStartTs = minDate.getTime();

  // Convert date string to percent along timeline width
  const getPercentOffset = (dateStr: string, shiftDays = 0) => {
    const d = new Date(dateStr).getTime() + shiftDays * 24 * 60 * 60 * 1000;
    const offset = d - timelineStartTs;
    return Math.max(0, Math.min(100, (offset / totalDuration) * 100));
  };

  // Duration in days
  const getDurationDays = (startStr: string, endStr: string) => {
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
  };

  // Filtered Milestones
  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.budget_line_name && m.budget_line_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.budget_line_code && m.budget_line_code.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "CRITICAL" && m.critical_path) ||
        (statusFilter === "DELAYED" && ((m.delay_days || 0) > 0 || m.status === "AT_RISK")) ||
        (statusFilter === "ON_TRACK" && m.status !== "AT_RISK" && (m.delay_days || 0) === 0) ||
        m.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [milestones, searchQuery, statusFilter]);



  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden select-none">
      {/* Search & Timeline Filter Controls Header */}
      <div className="p-3.5 border-b border-slate-200/80 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-md">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search milestones..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="h-8.5 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Dropdown */}
          <Select value={statusFilter} onValueChange={(val) => onStatusFilterChange(val)}>
            <SelectTrigger aria-label="Filter status" className="h-8.5 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="ON_TRACK">On Track</SelectItem>
              <SelectItem value="AT_RISK">At Risk</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Range & Granularity Controls */}
        <div className="flex items-center gap-2">
          {/* Today button */}
          <button
            type="button"
            onClick={() => setRangeOffsetMonths(0)}
            className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            Today
          </button>

          {/* Stepper buttons (Move view back/forward) */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setRangeOffsetMonths((prev) => prev - (scaleMode === "YEARS" ? 12 : scaleMode === "QUARTERS" ? 3 : 1))}
              className="h-7 w-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
              title="Previous Range"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRangeOffsetMonths((prev) => prev + (scaleMode === "YEARS" ? 12 : scaleMode === "QUARTERS" ? 3 : 1))}
              className="h-7 w-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
              title="Next Range"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Scale Granularity Buttons */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setScaleMode("MONTHS")}
              className={`h-7 px-3 rounded text-xs font-medium transition-all cursor-pointer ${
                scaleMode === "MONTHS"
                  ? "bg-blue-600 text-white shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Months
            </button>
            <button
              type="button"
              onClick={() => setScaleMode("QUARTERS")}
              className={`h-7 px-3 rounded text-xs font-medium transition-all cursor-pointer ${
                scaleMode === "QUARTERS"
                  ? "bg-blue-600 text-white shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Quarters
            </button>
            <button
              type="button"
              onClick={() => setScaleMode("YEARS")}
              className={`h-7 px-3 rounded text-xs font-medium transition-all cursor-pointer ${
                scaleMode === "YEARS"
                  ? "bg-blue-600 text-white shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Years
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Grid Table & Timeline Body */}
      <div className="overflow-x-auto">
        <div className="min-w-fit flex flex-col">
          {/* Header Row */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 select-none">
            {/* Left Fixed Width Table Columns (600px) */}
            <div className="w-[600px] flex items-center py-2.5 px-4 border-r border-slate-200 shrink-0">
              <span className="w-8 text-slate-400">#</span>
              <span className="w-52 text-slate-600 font-medium">Milestone</span>
              <span className="w-20 text-center text-slate-600 font-medium">Status</span>
              <span className="w-24 text-slate-600 font-medium">Start Date</span>
              <span className="w-24 text-slate-600 font-medium">End Date</span>
              <span className="w-14 text-center text-slate-600 font-medium">Days</span>
              <span className="w-14 text-center text-slate-600 font-medium">%</span>
            </div>

            {/* Right Calendar Ruler */}
            <div className="flex-1 flex flex-col justify-end min-w-[720px]">
              {/* Year Group Headers */}
              <div className="flex border-b border-slate-200/60 py-1 text-[11px] font-semibold text-slate-500">
                {yearHeaders.map((yh, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${yh.widthPct}%` }}
                    className="text-center border-r border-slate-200/40 last:border-r-0"
                  >
                    {yh.year}
                  </div>
                ))}
              </div>

              {/* Granular Headers Strip (Months, Quarters, or Years) */}
              <div className="flex w-full">
                {timelineColumns.map((col, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${100 / timelineColumns.length}%` }}
                    className="min-w-[48px] text-center py-1.5 text-[11px] text-slate-600 font-medium border-r border-slate-100 last:border-r-0"
                  >
                    {col.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Milestone Rows */}
          <div className="relative divide-y divide-slate-100">
            {filteredMilestones.map((ms, index) => {
              // Baseline positions
              const plannedLeft = getPercentOffset(ms.planned_start);
              const plannedRight = getPercentOffset(ms.planned_end);
              const plannedWidth = Math.max(1.5, plannedRight - plannedLeft);

              // Forecasted positions
              const effectiveEndDateStr = ms.forecast_end || ms.planned_end;
              const effectiveEndRight = getPercentOffset(effectiveEndDateStr);
              const effectiveBarWidth = Math.max(2, effectiveEndRight - plannedLeft);

              const isCompleted = ms.percent_complete === 100 || ms.status === "COMPLETED";
              const isAtRisk = ms.status === "AT_RISK" || (ms.delay_days || 0) > 0;
              const isSelected = selectedMilestoneId === ms.id;
              const durationDays = getDurationDays(ms.planned_start, effectiveEndDateStr);

              // Status badge
              const statusBadge = ms.critical_path ? (
                <span className="inline-flex items-center justify-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600 border border-rose-200/80 min-w-[58px]">
                  Critical
                </span>
              ) : isAtRisk ? (
                <span className="inline-flex items-center justify-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/80 min-w-[58px]">
                  At Risk
                </span>
              ) : (
                <span className="inline-flex items-center justify-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/80 min-w-[58px]">
                  On Track
                </span>
              );

              return (
                <div
                  key={ms.id}
                  className={`flex text-xs transition-colors group hover:bg-slate-50/70 items-center ${
                    isSelected ? "bg-blue-50/40" : "bg-white"
                  }`}
                >
                  {/* Left Fixed Width Table Columns (600px) - clicking here opens details drawer */}
                  <div
                    onClick={() => onSelectMilestone(ms)}
                    className="w-[600px] flex items-center py-3 px-4 border-r border-slate-200 shrink-0 cursor-pointer"
                  >
                    <span className="w-8 text-slate-400 font-medium tabular-nums">{index + 1}</span>
                    <span className="w-52 font-semibold text-slate-900 truncate pr-2 group-hover:text-blue-600 transition-colors" title={ms.name}>
                      {ms.name}
                    </span>
                    <div className="w-20 text-center">{statusBadge}</div>
                    <span className="w-24 text-slate-600 tabular-nums text-[11px]">
                      {formatDate(ms.planned_start)}
                    </span>
                    <span className="w-24 tabular-nums text-[11px] font-medium text-slate-600">
                      {formatDate(effectiveEndDateStr)}
                    </span>
                    <span className="w-14 text-center text-slate-600 tabular-nums text-[11px]">
                      {durationDays}d
                    </span>
                    {/* Progress Indicator Column */}
                    <div className="w-14 flex flex-col items-center justify-center">
                      <span className="font-bold text-slate-800 text-[11px] tabular-nums leading-tight">
                        {ms.percent_complete}%
                      </span>
                      <div className="w-8 h-1 rounded-full bg-slate-100 overflow-hidden mt-0.5">
                        <div
                          className={`h-full ${
                            isCompleted ? "bg-emerald-500" : isAtRisk ? "bg-amber-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${ms.percent_complete}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Calendar Area */}
                  <div
                    ref={index === 0 ? timelineTrackRef : undefined}
                    className="flex-1 relative h-13 flex items-center shrink-0 min-w-[720px]"
                  >
                    {/* Background Column Subtle Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none opacity-40">
                      {timelineColumns.map((_, i) => (
                        <div
                          key={i}
                          style={{ width: `${100 / timelineColumns.length}%` }}
                          className="min-w-[48px] border-r border-slate-100 h-full"
                        />
                      ))}
                    </div>

                    {/* Timeline Bar Track Area */}
                    <div className="relative w-full h-full flex items-center">
                      {/* Baseline Target Pill */}
                      <div
                        className="absolute h-5 rounded-md bg-blue-100/70 border border-blue-200/70 transition-all opacity-80"
                        style={{
                          left: `${plannedLeft}%`,
                          width: `${plannedWidth}%`,
                        }}
                      />

                      {/* Forecast / Progress Bar (Static view) */}
                      <div
                        onClick={() => onSelectMilestone(ms)}
                        className={`absolute h-6 rounded-md flex items-center justify-between px-2 shadow-xs transition-all z-10 cursor-pointer select-none group/bar ${
                          isCompleted
                            ? "bg-emerald-500 border border-emerald-600 text-white hover:brightness-105"
                            : isAtRisk
                            ? "bg-amber-500 border border-amber-600 text-white hover:brightness-105"
                            : "bg-blue-600 border border-blue-700 text-white hover:brightness-105"
                        }`}
                        title={`${ms.name}: ${ms.percent_complete}% complete (Click to view details)`}
                        style={{
                          left: `${plannedLeft}%`,
                          width: `${effectiveBarWidth}%`,
                        }}
                      >
                        {/* Progress Fill inside bar if partial */}
                        <div
                          className="absolute inset-y-0 left-0 bg-white/20 rounded-l-md pointer-events-none"
                          style={{ width: `${ms.percent_complete}%` }}
                        />

                        {/* Title text on bar if wide enough */}
                        <span className="relative z-10 text-[10px] font-semibold truncate leading-none px-0.5 max-w-[120px] pointer-events-none">
                          {ms.percent_complete}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/90 bg-white px-5 py-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-5">
          {/* Actual Progress */}
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-5 rounded-full bg-blue-600" />
            <span className="text-slate-600 font-medium">Actual Progress</span>
          </div>

          {/* Baseline / Target */}
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-5 rounded-full bg-blue-100 border border-blue-200" />
            <span className="text-slate-600 font-medium">Baseline / Target</span>
          </div>

          {/* Schedule Delay Exposure */}
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-5 rounded-full bg-rose-100 border border-rose-300" />
            <span className="text-slate-600 font-medium">Schedule Delay Exposure</span>
          </div>

          {/* Critical Path Item */}
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-rose-700 font-semibold">Critical Path Item</span>
          </div>
        </div>

        <div className="text-slate-400 text-xs">
          Click a milestone to inspect progress, evidence, and update forecast
        </div>
      </div>
    </div>
  );
}
