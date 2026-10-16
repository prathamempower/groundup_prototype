"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { formatMoney } from "@/lib/format";
import {
  EXCEL_DRAW_TASKS,
  EXCEL_DRAW_COLUMNS,
} from "@/lib/data/excel-draw-schedule";
import {
  FileSpreadsheet,
  Search,
  ExternalLink,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

interface ExcelSovMatrixProps {
  onSelectDraw?: (drawNumber: number) => void;
}

export function ExcelSovMatrix({ onSelectDraw }: ExcelSovMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Local editable amounts: taskNumber -> drawNumber -> cents
  const [taskDrawAmounts, setTaskDrawAmounts] = useState<Record<string, Record<number, number>>>(() => {
    const init: Record<string, Record<number, number>> = {};
    EXCEL_DRAW_TASKS.forEach((t) => {
      init[t.number] = { ...t.draws };
    });
    return init;
  });

  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener("scroll", checkScrollState, { passive: true });
    window.addEventListener("resize", checkScrollState);
    return () => {
      el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [checkScrollState]);

  // Support Shift+Wheel for horizontal mouse wheel scrolling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 0) return; // Native horizontal trackpad gesture
      if (e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handleScrollBy = (amount: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleScrollToDraw = (drawNumber: number) => {
    if (!scrollContainerRef.current) return;
    if (drawNumber === 0) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    // Number (~48px) + Description (~160px) + Scheduled Value (~95px) + Change Orders (~85px) = ~388px base
    const baseOffset = 388;
    const drawColWidth = 100;
    const targetOffset = baseOffset + (drawNumber - 1) * drawColWidth - 60;
    scrollContainerRef.current.scrollTo({ left: Math.max(0, targetOffset), behavior: "smooth" });
  };

  // Drag-to-scroll handlers (allows dragging with mouse on desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest("input")
    ) {
      return;
    }
    const el = scrollContainerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  const filteredTasks = EXCEL_DRAW_TASKS.filter(
    (t) =>
      t.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Column totals
  const totalScheduledValueCents = EXCEL_DRAW_TASKS.reduce(
    (sum, t) => sum + t.scheduledValueCents,
    0
  );

  const totalChangeOrdersCents = EXCEL_DRAW_TASKS.reduce(
    (sum, t) => sum + t.changeOrdersCents,
    0
  );

  const getDrawTotalCents = (drawNumber: number) => {
    return Object.values(taskDrawAmounts).reduce(
      (sum, drawMap) => sum + (drawMap[drawNumber] || 0),
      0
    );
  };

  const handleCellChange = (taskNumber: string, drawNumber: number, valueStr: string) => {
    const dollars = parseFloat(valueStr.replace(/[^0-9.]/g, "")) || 0;
    const cents = Math.round(dollars * 100);
    setTaskDrawAmounts((prev) => ({
      ...prev,
      [taskNumber]: {
        ...(prev[taskNumber] || {}),
        [drawNumber]: cents,
      },
    }));
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* Header Banner */}
      <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3.5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs shrink-0">
            <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              Contractor Schedule of Values Matrix
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden xs:block sm:block">
              Itemized construction tasks and draw amounts (Draws 1–9)
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-emerald-600 w-full"
          />
        </div>
      </div>

      {/* Interactive Horizontal Navigation Bar */}
      <div className="px-3 sm:px-5 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
        {/* Left Side: Jump to Draw Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 shrink-0">Jump:</span>
          <button
            type="button"
            onClick={() => handleScrollToDraw(0)}
            className="px-2 py-0.5 sm:py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-[10px] sm:text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer shrink-0 active:scale-95"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => handleScrollToDraw(1)}
            className="px-2 py-0.5 sm:py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-[10px] sm:text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer shrink-0 active:scale-95"
          >
            Draws 1–3
          </button>
          <button
            type="button"
            onClick={() => handleScrollToDraw(4)}
            className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[10px] sm:text-[11px] font-bold text-blue-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
          >
            <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
            <span>Draw 4 (Active)</span>
          </button>
          <button
            type="button"
            onClick={() => handleScrollToDraw(7)}
            className="px-2 py-0.5 sm:py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-[10px] sm:text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer shrink-0 active:scale-95"
          >
            Draws 5–9
          </button>
        </div>

        {/* Right Side: Step Scroll Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => handleScrollBy(-260)}
            disabled={!canScrollLeft}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs transition-all cursor-pointer active:scale-95"
            aria-label="Scroll table left"
            title="Scroll left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Left</span>
          </button>
          <button
            type="button"
            onClick={() => handleScrollBy(260)}
            disabled={!canScrollRight}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs transition-all cursor-pointer active:scale-95"
            aria-label="Scroll table right"
            title="Scroll right"
          >
            <span className="hidden sm:inline">Right</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid Container with Responsive Height & Smooth Horizontal Scroll */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`overflow-x-auto overflow-y-auto max-h-[500px] sm:max-h-[650px] relative custom-scrollbar overscroll-x-contain touch-pan-x ${
          isDragging ? "cursor-grabbing select-none" : ""
        }`}
        tabIndex={0}
        aria-label="Budget Lines Schedule of Values Spreadsheet"
      >
        <table className="min-w-[1340px] sm:min-w-[1460px] w-full text-left text-xs border-collapse font-sans">
          <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-20 border-b border-slate-300">
            {/* Row 1: Headers */}
            <tr>
              <th className="py-2 sm:py-2.5 px-2 sm:px-3 border-r border-slate-200 min-w-[48px] w-[48px] sm:min-w-[64px] sm:w-[64px] bg-slate-100">
                Number
              </th>
              <th className="py-2 sm:py-2.5 px-2.5 sm:px-3 border-r border-slate-200 min-w-[160px] sm:min-w-[240px] bg-slate-100">
                Description
              </th>
              <th className="py-2 sm:py-2.5 px-2.5 sm:px-3 text-right border-r border-slate-200 min-w-[95px] sm:min-w-[120px] bg-slate-100">
                Scheduled Value
              </th>
              <th className="py-2 sm:py-2.5 px-2.5 sm:px-3 text-right border-r border-slate-200 min-w-[85px] sm:min-w-[100px] bg-slate-100">
                Change Orders
              </th>
              {EXCEL_DRAW_COLUMNS.map((col) => (
                <th
                  key={col.drawNumber}
                  className={`py-1.5 sm:py-2 px-2 sm:px-3 text-right border-r border-slate-200 min-w-[95px] sm:min-w-[105px] ${
                    col.drawNumber === 4
                      ? "bg-blue-100/90 text-blue-900 font-extrabold"
                      : "bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Draw {col.drawNumber}</span>
                    {onSelectDraw && (
                      <button
                        type="button"
                        onClick={() => onSelectDraw(col.drawNumber)}
                        title={`Inspect Draw #${col.drawNumber} in Workbench`}
                        className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono font-normal">
                    {col.date}
                  </div>
                </th>
              ))}
            </tr>

            {/* Row 2: On-Site Inspection Sub-header */}
            <tr className="bg-slate-50 text-[11px] border-b border-slate-200 font-semibold text-slate-600">
              <td className="py-1.5 px-2 sm:px-3 border-r border-slate-200 font-medium italic bg-slate-50">
                -
              </td>
              <td className="py-1.5 px-2.5 sm:px-3 border-r border-slate-200 font-bold text-slate-900 bg-slate-50">
                On-Site Inspection?
              </td>
              <td className="py-1.5 px-2.5 sm:px-3 text-right border-r border-slate-200 text-slate-400 bg-slate-50">
                -
              </td>
              <td className="py-1.5 px-2.5 sm:px-3 text-right border-r border-slate-200 text-slate-400 bg-slate-50">
                -
              </td>
              {EXCEL_DRAW_COLUMNS.map((col) => (
                <td
                  key={`insp-${col.drawNumber}`}
                  className={`py-1.5 px-2 sm:px-3 text-right border-r border-slate-200 font-bold ${
                    col.drawNumber === 4 ? "bg-blue-50/80 text-blue-900" : ""
                  }`}
                >
                  <span
                    className={
                      col.hasOnsiteInspection
                        ? "text-emerald-700 font-bold"
                        : "text-slate-400 font-normal"
                    }
                  >
                    {col.hasOnsiteInspection ? "Yes" : "No"}
                  </span>
                </td>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-800">
            {filteredTasks.map((task, rowIdx) => {
              const rowDraws = taskDrawAmounts[task.number] || {};
              const isEven = rowIdx % 2 === 0;

              return (
                <tr
                  key={task.number}
                  className={`group transition-colors ${
                    isEven ? "bg-white hover:bg-slate-50" : "bg-slate-50/60 hover:bg-slate-100/70"
                  }`}
                >
                  {/* Number */}
                  <td className="py-2 px-2 sm:px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                    {task.number}
                  </td>

                  {/* Description */}
                  <td className="py-2 px-2.5 sm:px-3 font-medium text-slate-900 border-r border-slate-200 truncate max-w-[180px] sm:max-w-[280px]">
                    {task.description}
                  </td>

                  {/* Scheduled Value */}
                  <td className="py-2 px-2.5 sm:px-3 text-right font-medium tabular-nums text-slate-700 border-r border-slate-200">
                    {formatMoney(task.scheduledValueCents)}
                  </td>

                  {/* Change Orders */}
                  <td
                    className={`py-2 px-2.5 sm:px-3 text-right tabular-nums border-r border-slate-200 ${
                      task.changeOrdersCents > 0 ? "text-amber-800 font-semibold" : "text-slate-400"
                    }`}
                  >
                    {formatMoney(task.changeOrdersCents)}
                  </td>

                  {/* Draws 1-9 */}
                  {EXCEL_DRAW_COLUMNS.map((col) => {
                    const amountCents = rowDraws[col.drawNumber] || 0;
                    const isDraw4 = col.drawNumber === 4;
                    const hasAmount = amountCents > 0;
                    return (
                      <td
                        key={`${task.number}-${col.drawNumber}`}
                        className={`py-1.5 px-2 text-right tabular-nums border-r border-slate-200 ${
                          isDraw4 ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <input
                          type="text"
                          inputMode="decimal"
                          value={
                            hasAmount
                              ? `$${(amountCents / 100).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : "$0.00"
                          }
                          onChange={(e) =>
                            handleCellChange(task.number, col.drawNumber, e.target.value)
                          }
                          className={`w-full text-right bg-transparent px-1 py-0.5 rounded text-[11px] sm:text-xs transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            hasAmount
                              ? isDraw4
                                ? "font-bold text-blue-900"
                                : "font-semibold text-slate-900"
                              : "text-slate-400 font-normal hover:text-slate-600"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Grand Totals Footer */}
          <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
            <tr>
              <td className="py-3 px-2 sm:px-3 border-r border-slate-300 font-mono bg-slate-100">
                TOTALS
              </td>
              <td className="py-3 px-2.5 sm:px-3 border-r border-slate-300 bg-slate-100">
                Total Budget & Draw Allocations
              </td>
              <td className="py-3 px-2.5 sm:px-3 text-right tabular-nums border-r border-slate-300 font-bold bg-slate-100">
                {formatMoney(totalScheduledValueCents)}
              </td>
              <td className="py-3 px-2.5 sm:px-3 text-right tabular-nums border-r border-slate-300 font-bold text-amber-800 bg-slate-100">
                {formatMoney(totalChangeOrdersCents)}
              </td>
              {EXCEL_DRAW_COLUMNS.map((col) => {
                const colTotal = getDrawTotalCents(col.drawNumber);
                const isDraw4 = col.drawNumber === 4;
                return (
                  <td
                    key={`total-${col.drawNumber}`}
                    className={`py-3 px-2 sm:px-3 text-right tabular-nums border-r border-slate-300 font-extrabold ${
                      isDraw4 ? "bg-blue-100 text-blue-950" : "text-slate-900 bg-slate-100"
                    }`}
                  >
                    <div className="flex flex-col items-end">
                      <span>{formatMoney(colTotal)}</span>
                      {onSelectDraw && colTotal > 0 && (
                        <button
                          type="button"
                          onClick={() => onSelectDraw(col.drawNumber)}
                          className="text-[10px] font-semibold text-blue-600 hover:underline mt-0.5 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Open</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
