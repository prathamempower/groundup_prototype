"use client";

import React, { useMemo, useState } from "react";
import { MilestoneItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  onUpdateMilestoneDate,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
}: MilestoneGanttChartProps) {
  const [scaleMode, setScaleMode] = useState<"MONTHS" | "QUARTERS" | "YEARS">("MONTHS");
  const [activeShiftMap, setActiveShiftMap] = useState<Record<string, number>>({});
  const [rangeOffsetMonths, setRangeOffsetMonths] = useState(0);
  const [isApplyingShift, setIsApplyingShift] = useState(false);

  // Drag-and-drop bar movement state
  const [draggingMilestoneId, setDraggingMilestoneId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragCurrentShiftDays, setDragCurrentShiftDays] = useState<number>(0);

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

  // Nudge adjustment
  const handleNudge = async (ms: MilestoneItem, delta: number) => {
    const currentShift = activeShiftMap[ms.id] || 0;
    const newShift = currentShift + delta;
    setActiveShiftMap((prev) => ({ ...prev, [ms.id]: newShift }));

    if (onUpdateMilestoneDate) {
      setIsApplyingShift(true);
      try {
        const base = new Date(ms.forecast_end || ms.planned_end);
        const adjusted = new Date(base.getTime() + newShift * 24 * 60 * 60 * 1000);
        await onUpdateMilestoneDate(
          ms,
          adjusted.toISOString().split("T")[0],
          delta > 0 ? `Shifted +${delta}d via interactive timeline bar` : `Adjusted ${delta}d via interactive timeline bar`
        );
      } finally {
        setIsApplyingShift(false);
      }
    }
  };

  // Direct Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent, ms: MilestoneItem) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingMilestoneId(ms.id);
    setDragStartX(e.clientX);
    setDragCurrentShiftDays(activeShiftMap[ms.id] || 0);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - e.clientX;
      // Convert pixel delta to approximate day shift
      // Track width is approx 700px for totalDuration days
      const daysPerPixel = (totalDuration / (1000 * 60 * 60 * 24)) / 700;
      const dayShift = Math.round(deltaX * daysPerPixel);
      setDragCurrentShiftDays((activeShiftMap[ms.id] || 0) + dayShift);
    };

    const onMouseUp = async (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      const deltaX = upEvent.clientX - e.clientX;
      const daysPerPixel = (totalDuration / (1000 * 60 * 60 * 24)) / 700;
      const finalShift = (activeShiftMap[ms.id] || 0) + Math.round(deltaX * daysPerPixel);

      setDraggingMilestoneId(null);

      if (finalShift !== (activeShiftMap[ms.id] || 0)) {
        setActiveShiftMap((prev) => ({ ...prev, [ms.id]: finalShift }));
        if (onUpdateMilestoneDate) {
          setIsApplyingShift(true);
          try {
            const base = new Date(ms.forecast_end || ms.planned_end);
            const adjusted = new Date(base.getTime() + finalShift * 24 * 60 * 60 * 1000);
            await onUpdateMilestoneDate(
              ms,
              adjusted.toISOString().split("T")[0],
              `Adjusted ${finalShift >= 0 ? "+" : ""}${finalShift}d via drag-and-drop reschedule`
            );
          } finally {
            setIsApplyingShift(false);
          }
        }
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

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
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              aria-label="Filter status"
              className="h-8.5 rounded-lg border border-slate-200 bg-white px-3 pr-7 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical</option>
              <option value="ON_TRACK">On Track</option>
              <option value="AT_RISK">At Risk</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-3 h-3 w-3 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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
        <div className="min-w-[1280px]">
          {/* Header Row */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 select-none">
            {/* Left Fixed Width Table Columns (580px) */}
            <div className="w-[580px] flex items-center py-2.5 px-4 border-r border-slate-200 shrink-0">
              <span className="w-8 text-slate-400">#</span>
              <span className="w-48 text-slate-600 font-medium">Milestone</span>
              <span className="w-20 text-center text-slate-600 font-medium">Status</span>
              <span className="w-24 text-slate-600 font-medium">Start Date</span>
              <span className="w-24 text-slate-600 font-medium">End Date</span>
              <span className="w-16 text-center text-slate-600 font-medium">Duration</span>
              <span className="w-16 text-center text-slate-600 font-medium">%</span>
            </div>

            {/* Right Calendar Ruler (Flex 1) */}
            <div className="flex-1 flex flex-col justify-end min-w-0">
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
                    className="text-center py-1.5 text-[10px] text-slate-500 font-medium border-r border-slate-100 last:border-r-0 truncate"
                  >
                    {col.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Milestone Rows */}
          <div className="relative divide-y divide-slate-100">
            {/* Vertical Blue Guideline for "Today" */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-20 flex flex-col items-center"
              style={{ left: `calc(580px + (calc(100% - 580px) * ${todayPositionPct / 100}))` }}
            >
              <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs -mt-2.5">
                Today
              </div>
              <div className="w-px h-full border-l border-dashed border-blue-500" />
            </div>

            {filteredMilestones.map((ms, index) => {
              const activeShift = draggingMilestoneId === ms.id ? dragCurrentShiftDays : (activeShiftMap[ms.id] || 0);
              const plannedLeft = getPercentOffset(ms.planned_start);
              const plannedRight = getPercentOffset(ms.planned_end);
              const plannedWidth = Math.max(2, plannedRight - plannedLeft);

              const forecastRight = getPercentOffset(ms.forecast_end || ms.planned_end, activeShift);
              const forecastWidth = Math.max(2, forecastRight - plannedLeft);

              const isCompleted = ms.percent_complete === 100 || ms.status === "COMPLETED";
              const isAtRisk = ms.status === "AT_RISK" || (ms.delay_days || 0) > 0;
              const isSelected = selectedMilestoneId === ms.id;
              const durationDays = getDurationDays(ms.planned_start, ms.forecast_end || ms.planned_end);

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
                  onClick={() => onSelectMilestone(ms)}
                  className={`flex text-xs transition-colors cursor-pointer group hover:bg-slate-50/70 items-center ${
                    isSelected ? "bg-blue-50/40" : "bg-white"
                  }`}
                >
                  {/* Left Fixed Width Table Columns (580px) */}
                  <div className="w-[580px] flex items-center py-3.5 px-4 border-r border-slate-200 shrink-0">
                    <span className="w-8 text-slate-400 font-medium tabular-nums">{index + 1}</span>
                    <span className="w-48 font-semibold text-slate-900 truncate pr-2 group-hover:text-blue-600 transition-colors">
                      {ms.name}
                    </span>
                    <div className="w-20 text-center">{statusBadge}</div>
                    <span className="w-24 text-slate-500 tabular-nums text-[11px]">
                      {formatDate(ms.planned_start)}
                    </span>
                    <span className="w-24 text-slate-500 tabular-nums text-[11px]">
                      {formatDate(ms.forecast_end || ms.planned_end)}
                    </span>
                    <span className="w-16 text-center text-slate-500 tabular-nums text-[11px]">
                      {durationDays}d
                    </span>
                    {/* Progress Indicator Column */}
                    <div className="w-16 flex flex-col items-center justify-center">
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

                  {/* Right Calendar Area (Flex 1) */}
                  <div className="flex-1 relative h-13 flex items-center shrink-0 min-w-0">
                    {/* Background Column Subtle Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none opacity-40">
                      {timelineColumns.map((_, i) => (
                        <div
                          key={i}
                          style={{ width: `${100 / timelineColumns.length}%` }}
                          className="border-r border-slate-100 h-full"
                        />
                      ))}
                    </div>

                    {/* Timeline Bar Track Area (100% matched with calendar ruler) */}
                    <div className="relative w-full h-full flex items-center">
                      {/* Baseline Target Pill */}
                      <div
                        className="absolute h-5 rounded-full bg-blue-100/70 border border-blue-200/60 transition-all cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-400"
                        onMouseDown={(e) => handleMouseDown(e, ms)}
                        title="Click and drag to reschedule milestone"
                        style={{
                          left: `${plannedLeft}%`,
                          width: `${plannedWidth}%`,
                        }}
                      />

                      {/* Actual Progress Pill */}
                      {ms.percent_complete > 0 && (
                        <div
                          className={`absolute h-5 rounded-full flex items-center justify-end px-1 shadow-2xs transition-all z-10 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-500 ${
                            isCompleted
                              ? "bg-emerald-500 border border-emerald-600"
                              : "bg-blue-600 border border-blue-700"
                          }`}
                          onMouseDown={(e) => handleMouseDown(e, ms)}
                          title="Click and drag to reschedule milestone"
                          style={{
                            left: `${plannedLeft}%`,
                            width: `${Math.max(2.5, forecastWidth * (ms.percent_complete / 100))}%`,
                          }}
                        >
                          {/* Round circular handle dot */}
                          <div className="h-3 w-3 rounded-full bg-white shadow-xs border border-slate-300 shrink-0" />
                        </div>
                      )}

                      {/* Live Dragging Tooltip & Date Indicator */}
                      {draggingMilestoneId === ms.id && (
                        <div
                          className="absolute -top-7 z-30 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-semibold shadow-md whitespace-nowrap pointer-events-none transform -translate-x-1/2 flex items-center gap-1.5"
                          style={{
                            left: `${Math.max(5, Math.min(95, forecastRight))}%`,
                          }}
                        >
                          <span>{formatDate(new Date(new Date(ms.forecast_end || ms.planned_end).getTime() + activeShift * 24 * 60 * 60 * 1000).toISOString().split("T")[0])}</span>
                          <span className={`px-1 rounded text-[9px] ${activeShift >= 0 ? "bg-amber-500/80" : "bg-emerald-500/80"}`}>
                            {activeShift >= 0 ? `+${activeShift}d` : `${activeShift}d`}
                          </span>
                        </div>
                      )}

                      {/* Interactive date nudge controls (hoverable on right) */}
                      <div
                        className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-slate-200 rounded-md shadow-xs p-0.5 z-20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleNudge(ms, -7)}
                          title="Move 7 days earlier"
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer active:scale-95"
                        >
                          -7d
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudge(ms, 7)}
                          title="Move 7 days later"
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer active:scale-95"
                        >
                          +7d
                        </button>
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
          Drag dates to adjust schedule &bull; Click a milestone to edit
        </div>
      </div>
    </div>
  );
}
