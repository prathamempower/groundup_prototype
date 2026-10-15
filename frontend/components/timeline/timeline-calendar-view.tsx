"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  User,
  RotateCcw,
} from "lucide-react";
import { ConstructionTask } from "@/lib/data/construction-calendar-data";

interface TimelineCalendarViewProps {
  tasks: ConstructionTask[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectTask: (taskId: string) => void;
  onOpenCreateModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTradeFilter: string;
  onTradeFilterChange: (trade: string) => void;
  activePhaseFilters: Record<string, boolean>;
  onTogglePhaseFilter: (phaseId: string) => void;
  onResetFilters: () => void;
  currentYear?: number;
  currentMonth?: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onToday?: () => void;
}

export function TimelineCalendarView({
  tasks,
  selectedDate,
  onSelectDate,
  onSelectTask,
  onOpenCreateModal,
  searchQuery,
  onSearchChange,
  activeTradeFilter,
  onTradeFilterChange,
  activePhaseFilters,
  onTogglePhaseFilter,
  onResetFilters,
  currentYear: propCurrentYear,
  currentMonth: propCurrentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
}: TimelineCalendarViewProps) {
  // Calendar navigation month/year (Defaults to October 2026 matching reference)
  const [localYear, setLocalYear] = useState(2026);
  const [localMonth, setLocalMonth] = useState(9); // 0-indexed: 9 = October

  const currentYear = propCurrentYear !== undefined ? propCurrentYear : localYear;
  const currentMonth = propCurrentMonth !== undefined ? propCurrentMonth : localMonth;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handlePrevMonth = () => {
    if (onPrevMonth) {
      onPrevMonth();
      return;
    }
    if (localMonth === 0) {
      setLocalMonth(11);
      setLocalYear((y) => y - 1);
    } else {
      setLocalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (onNextMonth) {
      onNextMonth();
      return;
    }
    if (localMonth === 11) {
      setLocalMonth(0);
      setLocalYear((y) => y + 1);
    } else {
      setLocalMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    if (onToday) {
      onToday();
      return;
    }
    setLocalYear(2026);
    setLocalMonth(9);
    onSelectDate("2026-10-14");
  };

  // Filter tasks based on search, trade, and phase filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Phase category filter
      if (activePhaseFilters[t.phase_id] === false) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchTrade = t.trade_subcontractor.toLowerCase().includes(q);
        const matchSuper = t.site_supervisor.toLowerCase().includes(q);
        const matchCreator = t.created_by.toLowerCase().includes(q);
        const matchScope = t.daily_field_work_scope.toLowerCase().includes(q);
        if (!matchTitle && !matchTrade && !matchSuper && !matchCreator && !matchScope) {
          return false;
        }
      }

      // Trade filter
      if (activeTradeFilter.trim()) {
        const q = activeTradeFilter.toLowerCase();
        const matchTrade = t.trade_subcontractor.toLowerCase().includes(q);
        const matchSuper = t.site_supervisor.toLowerCase().includes(q);
        if (!matchTrade && !matchSuper) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, activeTradeFilter, activePhaseFilters]);

  // Group filtered tasks by date "YYYY-MM-DD"
  const tasksByDate = useMemo(() => {
    const map: Record<string, ConstructionTask[]> = {};
    for (const t of filteredTasks) {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    }
    return map;
  }, [filteredTasks]);

  // Generate 35 or 42 grid cells for October 2026 (Starts on Sunday)
  // For October 2026: Oct 1 is Thursday.
  // Previous Sunday is Sep 27. Days before Oct 1: Sep 27 (Sun), 28 (Mon), 29 (Tue), 30 (Wed).
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPrevMonth: boolean;
      isNextMonth: boolean;
    }> = [];

    // Leading days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const monthStr = String(prevMonthIdx + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      cells.push({
        dateString: `${prevYear}-${monthStr}-${dayStr}`,
        dayNumber: d,
        isCurrentMonth: false,
        isPrevMonth: true,
        isNextMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      cells.push({
        dateString: `${currentYear}-${monthStr}-${dayStr}`,
        dayNumber: d,
        isCurrentMonth: true,
        isPrevMonth: false,
        isNextMonth: false,
      });
    }

    // Trailing days from next month
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const monthStr = String(nextMonthIdx + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      cells.push({
        dateString: `${nextYear}-${monthStr}-${dayStr}`,
        dayNumber: d,
        isCurrentMonth: false,
        isPrevMonth: false,
        isNextMonth: true,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Mini-calendar days calculation
  const miniCalendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: number[] = [];
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentYear, currentMonth]);

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start min-h-[750px]">
      {/* Left Sidebar Controls matching target layout */}
      <aside className="w-full lg:w-[260px] shrink-0 space-y-4">
        {/* + Create Task / Field Log Button */}
        <button
          onClick={onOpenCreateModal}
          className="w-full flex items-center gap-3 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 p-3.5 shadow-2xs hover:shadow-xs transition-all text-left cursor-pointer group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              Create Task / Field Log
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Allocate work to date
            </span>
          </div>
        </button>

        {/* Mini Calendar Widget */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <CalendarIcon className="h-3.5 w-3.5 text-blue-600" />
              <span>{monthNames[currentMonth]} {currentYear}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="h-6 w-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="h-6 w-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {miniCalendarDays.map((d) => {
              const monthStr = String(currentMonth + 1).padStart(2, "0");
              const dayStr = String(d).padStart(2, "0");
              const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;
              const isSelected = selectedDate === fullDateStr;
              const hasTasks = tasksByDate[fullDateStr] && tasksByDate[fullDateStr].length > 0;
              const hasDelayed = hasTasks && tasksByDate[fullDateStr].some((t) => t.is_delayed);

              return (
                <button
                  key={d}
                  onClick={() => onSelectDate(fullDateStr)}
                  className={`h-7 w-7 mx-auto rounded-full flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "hover:bg-slate-100 text-slate-700 font-medium"
                  }`}
                >
                  <span>{d}</span>
                  {hasTasks && !isSelected && (
                    <span
                      className={`h-1 w-1 rounded-full absolute bottom-0.5 ${
                        hasDelayed ? "bg-red-500" : "bg-blue-600"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* MEET / SEARCH TRADE Search Box */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Meet / Search Trade
          </label>
          <div className="relative">
            <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={activeTradeFilter}
              onChange={(e) => onTradeFilterChange(e.target.value)}
              placeholder="Search supervisor or trade..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* MY CALENDARS / FILTERS with Reset All */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              My Calendars / Filters
            </span>
            <button
              onClick={onResetFilters}
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              Reset All
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            {[
              {
                id: "excavation",
                label: "Site Excavation & Grading",
                color: "bg-emerald-500",
              },
              {
                id: "foundation",
                label: "Foundation & Concrete Pour",
                color: "bg-blue-500",
              },
              {
                id: "framing",
                label: "Superstructure Framing",
                color: "bg-indigo-500",
              },
              {
                id: "mep",
                label: "MEP Rough-Ins & Utilities",
                color: "bg-amber-500",
              },
              {
                id: "critical",
                label: "Critical Path & Delays",
                color: "bg-red-500",
              },
            ].map((cat) => {
              const isChecked = activePhaseFilters[cat.id] !== false;
              return (
                <label
                  key={cat.id}
                  className="flex items-center gap-2.5 cursor-pointer py-1 px-1 rounded hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onTogglePhaseFilter(cat.id)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`h-2 w-2 rounded-full ${cat.color} shrink-0`} />
                  <span className="text-slate-700 text-xs font-medium truncate">
                    {cat.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* WORK PROGRESS STATUS Legend */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Work Progress Status
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-800">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-100 px-2 py-1 text-[11px] font-semibold text-red-800">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>Critical / Delay</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Calendar Grid Area */}
      <div className="flex-1 w-full min-w-0 flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[680px] md:min-w-0 flex flex-col">
            {/* Calendar Day Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center py-2.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 auto-rows-[minmax(115px,1fr)] divide-x divide-y divide-slate-100">
          {calendarGrid.map((cell) => {
            const isSelected = selectedDate === cell.dateString;
            const tasksOnThisDay = tasksByDate[cell.dateString] || [];
            const hasDelayedTask = tasksOnThisDay.some((t) => t.is_delayed);

            return (
              <div
                key={cell.dateString}
                onClick={() => onSelectDate(cell.dateString)}
                className={`p-1.5 sm:p-2 min-h-[110px] flex flex-col justify-between transition-all cursor-pointer relative group ${
                  isSelected
                    ? "bg-blue-50/25 ring-2 ring-blue-500 ring-inset z-10"
                    : cell.isCurrentMonth
                    ? "bg-white hover:bg-slate-50/60"
                    : "bg-slate-50/40 text-slate-400"
                }`}
              >
                {/* Date Number Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-bold rounded-full transition-colors ${
                      isSelected
                        ? "h-6 w-6 bg-blue-600 text-white shadow-xs"
                        : cell.isCurrentMonth
                        ? "h-5 w-5 text-slate-700"
                        : "h-5 w-5 text-slate-400"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Red dot badge if date contains delayed tasks */}
                  {hasDelayedTask && (
                    <span
                      className="h-2 w-2 rounded-full bg-red-600 ring-2 ring-red-200"
                      title="Delayed work on this date"
                    />
                  )}
                </div>

                {/* Tasks & Banners allocated to this date */}
                <div className="flex-1 space-y-1 overflow-hidden">
                  {tasksOnThisDay.map((task) => {
                    // Check if it's a solid banner event (e.g. Columbus Day or Halloween)
                    if (task.is_banner_event) {
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDate(cell.dateString);
                            onSelectTask(task.id);
                          }}
                          className="w-full rounded-md bg-emerald-800 text-white px-2 py-1 text-[10px] font-bold truncate shadow-2xs hover:bg-emerald-900 transition-colors"
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      );
                    }

                    // Standard task pill with dot
                    // If task is delayed: RED DOT as explicitly required!
                    const dotColor = task.is_delayed
                      ? "bg-red-600 ring-2 ring-red-300"
                      : task.status === "COMPLETED"
                      ? "bg-emerald-500"
                      : task.status === "IN_PROGRESS"
                      ? "bg-blue-500"
                      : "bg-amber-500";

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate(cell.dateString);
                          onSelectTask(task.id);
                        }}
                        className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-all hover:scale-[1.02] cursor-pointer ${
                          task.is_delayed
                            ? "bg-red-50 text-red-900 border border-red-200/80 font-bold"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                        title={`${task.time} ${task.title}${task.is_delayed ? ` (DELAYED ${task.delay_days}d)` : ""}`}
                      >
                        {/* Dot indicator (Red if delayed!) */}
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColor} shrink-0`} />
                        <span className="text-slate-400 font-mono text-[9px] shrink-0">
                          {task.time.split(" ")[0]}
                        </span>
                        <span className="truncate">{task.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Subdued hover prompt */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-right">
                  <span className="text-[9px] text-blue-600 font-bold">+ View</span>
                </div>
              </div>
            );
          })}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
