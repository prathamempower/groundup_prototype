"use client";

import React, { useState } from "react";
import { formatMoney } from "@/lib/format";
import {
  EXCEL_DRAW_TASKS,
  EXCEL_DRAW_COLUMNS,
  ExcelTaskScheduleItem,
} from "@/lib/data/excel-draw-schedule";
import {
  FileSpreadsheet,
  Search,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExcelSovMatrixProps {
  onSelectDraw?: (drawNumber: number) => void;
}

export function ExcelSovMatrix({ onSelectDraw }: ExcelSovMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Local editable amounts: taskNumber -> drawNumber -> cents
  const [taskDrawAmounts, setTaskDrawAmounts] = useState<Record<string, Record<number, number>>>(() => {
    const init: Record<string, Record<number, number>> = {};
    EXCEL_DRAW_TASKS.forEach((t) => {
      init[t.number] = { ...t.draws };
    });
    return init;
  });

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
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      {/* Header Banner */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Contractor Schedule of Values Matrix (Excel View)
            </h3>
            <p className="text-[11px] text-slate-500">
              Itemized construction tasks and draw amounts across all billing periods (Draws 1 through 9)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-emerald-600 w-full sm:w-48"
            />
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md shrink-0">
            {EXCEL_DRAW_TASKS.length} Tasks • 9 Draws Scheduled
          </span>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="overflow-x-auto max-h-[650px] relative">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-20 border-b border-slate-300">
            {/* Row 1: Headers */}
            <tr>
              <th className="py-2.5 px-3 border-r border-slate-200 sticky left-0 z-30 bg-slate-100 min-w-[70px]">
                Number
              </th>
              <th className="py-2.5 px-3 border-r border-slate-200 sticky left-[70px] z-30 bg-slate-100 min-w-[260px]">
                Description
              </th>
              <th className="py-2.5 px-3 text-right border-r border-slate-200 min-w-[120px]">
                Scheduled Value
              </th>
              <th className="py-2.5 px-3 text-right border-r border-slate-200 min-w-[100px]">
                Change Orders
              </th>
              {EXCEL_DRAW_COLUMNS.map((col) => (
                <th
                  key={col.drawNumber}
                  className={`py-2 px-3 text-right border-r border-slate-200 min-w-[110px] ${
                    col.drawNumber === 4
                      ? "bg-blue-100/80 text-blue-900 font-extrabold"
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
                        className="text-slate-400 hover:text-blue-600 transition-colors"
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

            {/* Row 2: On-Site Inspection Sub-header (Matches Image 3) */}
            <tr className="bg-slate-50 text-[11px] border-b border-slate-200 font-semibold text-slate-600">
              <td className="py-1.5 px-3 border-r border-slate-200 sticky left-0 z-30 bg-slate-50 font-medium italic">
                -
              </td>
              <td className="py-1.5 px-3 border-r border-slate-200 sticky left-[70px] z-30 bg-slate-50 font-bold text-slate-900">
                On-Site Inspection?
              </td>
              <td className="py-1.5 px-3 text-right border-r border-slate-200 text-slate-400">
                -
              </td>
              <td className="py-1.5 px-3 text-right border-r border-slate-200 text-slate-400">
                -
              </td>
              {EXCEL_DRAW_COLUMNS.map((col) => (
                <td
                  key={`insp-${col.drawNumber}`}
                  className={`py-1.5 px-3 text-right border-r border-slate-200 font-bold ${
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
              return (
                <tr
                  key={task.number}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}
                >
                  {/* Number */}
                  <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200 sticky left-0 z-10 bg-inherit">
                    {task.number}
                  </td>

                  {/* Description */}
                  <td className="py-2 px-3 font-medium text-slate-900 border-r border-slate-200 sticky left-[70px] z-10 bg-inherit truncate max-w-[280px]">
                    {task.description}
                  </td>

                  {/* Scheduled Value */}
                  <td className="py-2 px-3 text-right font-medium tabular-nums text-slate-700 border-r border-slate-200">
                    {formatMoney(task.scheduledValueCents)}
                  </td>

                  {/* Change Orders */}
                  <td className={`py-2 px-3 text-right tabular-nums border-r border-slate-200 ${
                    task.changeOrdersCents > 0 ? "text-amber-800 font-semibold" : "text-slate-400"
                  }`}>
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
                          isDraw4 ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <input
                          type="text"
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
                          className={`w-full text-right bg-transparent px-1 py-0.5 rounded text-xs transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${
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
          <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900 sticky bottom-0 z-20">
            <tr>
              <td className="py-3 px-3 border-r border-slate-300 sticky left-0 z-30 bg-slate-100 font-mono">
                TOTALS
              </td>
              <td className="py-3 px-3 border-r border-slate-300 sticky left-[70px] z-30 bg-slate-100">
                Total Budget & Draw Allocations
              </td>
              <td className="py-3 px-3 text-right tabular-nums border-r border-slate-300 font-bold">
                {formatMoney(totalScheduledValueCents)}
              </td>
              <td className="py-3 px-3 text-right tabular-nums border-r border-slate-300 font-bold text-amber-800">
                {formatMoney(totalChangeOrdersCents)}
              </td>
              {EXCEL_DRAW_COLUMNS.map((col) => {
                const colTotal = getDrawTotalCents(col.drawNumber);
                const isDraw4 = col.drawNumber === 4;
                return (
                  <td
                    key={`total-${col.drawNumber}`}
                    className={`py-3 px-3 text-right tabular-nums border-r border-slate-300 font-extrabold ${
                      isDraw4 ? "bg-blue-100 text-blue-950" : "text-slate-900"
                    }`}
                  >
                    <div className="flex flex-col items-end">
                      <span>{formatMoney(colTotal)}</span>
                      {onSelectDraw && colTotal > 0 && (
                        <button
                          type="button"
                          onClick={() => onSelectDraw(col.drawNumber)}
                          className="text-[10px] font-semibold text-blue-600 hover:underline mt-0.5 inline-flex items-center gap-0.5"
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
