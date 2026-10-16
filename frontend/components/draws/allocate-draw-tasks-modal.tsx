"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import {
  EXCEL_DRAW_TASKS,
  ExcelTaskScheduleItem,
} from "@/lib/data/excel-draw-schedule";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  DollarSign,
  Layers,
} from "lucide-react";
import type { DrawLine } from "@/lib/types";

interface AllocateDrawTasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawNumber: number;
  initialLines?: DrawLine[];
  onSave: (lines: DrawLine[], totalRequestedCents: number) => void;
}

export function AllocateDrawTasksModal({
  open,
  onOpenChange,
  drawNumber,
  initialLines = [],
  onSave,
}: AllocateDrawTasksModalProps) {
  // Map of task number -> requested dollars string
  const [taskAmounts, setTaskAmounts] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyAllocated, setShowOnlyAllocated] = useState(false);

  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {};
      if (initialLines && initialLines.length > 0) {
        initialLines.forEach((l) => {
          const dollars = (parseInt(l.requested_amount || "0", 10) / 100).toString();
          initial[l.budget_line_code] = dollars;
        });
      } else {
        // Pre-fill from Excel schedule for this draw
        EXCEL_DRAW_TASKS.forEach((t) => {
          const cents = t.draws[drawNumber] || 0;
          if (cents > 0) {
            initial[t.number] = (cents / 100).toString();
          }
        });
      }
      setTaskAmounts(initial);
      setSearchQuery("");
      setShowOnlyAllocated(false);
    }
  }, [open, drawNumber, initialLines]);

  const handleAmountChange = (taskNumber: string, value: string) => {
    // Clean string to digits and decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");
    setTaskAmounts((prev) => ({
      ...prev,
      [taskNumber]: cleaned,
    }));
  };

  const handleApplyExcelPreset = () => {
    const preset: Record<string, string> = {};
    EXCEL_DRAW_TASKS.forEach((t) => {
      const cents = t.draws[drawNumber] || 0;
      if (cents > 0) {
        preset[t.number] = (cents / 100).toString();
      }
    });
    setTaskAmounts(preset);
  };

  const handleClearAll = () => {
    setTaskAmounts({});
  };

  const filteredTasks = EXCEL_DRAW_TASKS.filter((task) => {
    const matchesSearch =
      task.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const val = parseFloat(taskAmounts[task.number] || "0");
    if (showOnlyAllocated) {
      return matchesSearch && val > 0;
    }
    return matchesSearch;
  });

  const totalRequestedCents = Object.entries(taskAmounts).reduce((sum, [_, amtStr]) => {
    const dollars = parseFloat(amtStr) || 0;
    return sum + Math.round(dollars * 100);
  }, 0);

  const allocatedCount = Object.values(taskAmounts).filter(
    (amt) => (parseFloat(amt) || 0) > 0
  ).length;

  const handleSave = () => {
    const newLines: DrawLine[] = Object.entries(taskAmounts)
      .filter(([_, amtStr]) => (parseFloat(amtStr) || 0) > 0)
      .map(([taskNum, amtStr], idx) => {
        const dollars = parseFloat(amtStr) || 0;
        const cents = Math.round(dollars * 100);
        const taskDef = EXCEL_DRAW_TASKS.find((t) => t.number === taskNum);
        const desc = taskDef ? taskDef.description : `Task ${taskNum}`;

        return {
          id: `line-${drawNumber}-${taskNum.replace(".", "-")}-${Date.now() + idx}`,
          draw_id: `draw-fallback-${drawNumber}`,
          budget_line_id: `b-line-${taskNum}`,
          budget_line_name: desc,
          budget_line_code: taskNum,
          requested_amount: String(cents),
          recommended_amount: String(cents),
          approved_amount: String(cents),
          funded_amount: drawNumber <= 3 ? String(cents) : "0",
          evidence_status: (drawNumber <= 3 ? "VERIFIED" : "VERIFIED") as "VERIFIED" | "PENDING_INSPECTION",
          lender_notes: `${desc} task inspection verified`,
        };
      });

    onSave(newLines, totalRequestedCents);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        maxWidth="xl"
        closeButtonClassName="text-slate-400 hover:text-white hover:bg-slate-800 top-3 sm:top-3.5 right-3 sm:right-4"
        className="max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white border-slate-200 shadow-overlay rounded-xl w-[95vw] sm:w-full"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-12 sm:pr-14">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <ModalTitle className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                Allocate Schedule of Values — Draw #{drawNumber}
              </ModalTitle>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">
                Enter billing amounts for each Schedule of Values item in this period
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0">
            <button
              type="button"
              onClick={handleApplyExcelPreset}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span>Load Draw #{drawNumber} Schedule</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by CSI code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowOnlyAllocated(!showOnlyAllocated)}
              className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                showOnlyAllocated
                  ? "bg-blue-50 border-blue-300 text-blue-700 font-semibold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
              }`}
            >
              Show Allocated Only ({allocatedCount})
            </button>
            <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">
              {EXCEL_DRAW_TASKS.length} SOV Items
            </span>
          </div>
        </div>

        {/* Task List Table */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="rounded-xl border border-slate-200 overflow-x-auto custom-scrollbar bg-white shadow-2xs">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10 backdrop-blur-xs">
                <tr>
                  <th className="py-2.5 px-3 w-20">CSI Code</th>
                  <th className="py-2.5 px-3">Description & Scope</th>
                  <th className="py-2.5 px-3 text-right">Scheduled Value</th>
                  <th className="py-2.5 px-3 text-right w-48">Draw #{drawNumber} Requested ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                      No matching Schedule of Values items found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const currentAmt = taskAmounts[task.number] || "";
                    const hasValue = (parseFloat(currentAmt) || 0) > 0;
                    return (
                      <tr
                        key={task.number}
                        className={`transition-colors ${
                          hasValue ? "bg-blue-50/40 hover:bg-blue-50/70" : "hover:bg-slate-50/70"
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {task.number}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-900 block leading-tight">
                            {task.description}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-500 font-mono">
                          {formatMoney(task.scheduledValueCents)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <span className="text-slate-400 font-semibold">$</span>
                            <input
                              type="text"
                              value={currentAmt}
                              onChange={(e) => handleAmountChange(task.number, e.target.value)}
                              placeholder="0.00"
                              className={`w-28 sm:w-32 text-right rounded border px-2.5 py-1 text-xs font-mono font-semibold transition-all focus:outline-none ${
                                hasValue
                                  ? "border-blue-500 bg-white text-blue-900 ring-1 ring-blue-500/20"
                                  : "border-slate-200 bg-slate-50/50 text-slate-700 focus:border-blue-600 focus:bg-white"
                              }`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Summary Banner */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Items Allocated:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {allocatedCount} <span className="text-slate-400 font-normal text-xs">of {EXCEL_DRAW_TASKS.length}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs flex-1 sm:flex-none justify-center"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold flex-1 sm:flex-none justify-center shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>Save & Apply ({formatMoney(totalRequestedCents)})</span>
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
