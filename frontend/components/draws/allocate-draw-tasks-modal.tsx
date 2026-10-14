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
    // For Draw 4, if preset is loaded, add Demolition and Grading to reconcile to $50,000 if user wants standard Draw 4
    if (drawNumber === 4 && Object.keys(preset).length > 0) {
      if (!preset["2.04"]) preset["2.04"] = "5000";
      if (!preset["2.05"]) preset["2.05"] = "5500";
    }
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

  const retainageCents = Math.round(totalRequestedCents * 0.1);
  const netPayableCents = totalRequestedCents - retainageCents;

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
      <ModalContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white border-slate-200 shadow-overlay rounded-xl">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <ModalTitle className="text-sm font-bold text-white">
                Allocate Work Tasks for Draw #{drawNumber}
              </ModalTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Input the dollar amounts requested for each construction task from the Schedule of Values
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyExcelPreset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Load Draw #{drawNumber} Excel Schedule</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks by CSI code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setShowOnlyAllocated(!showOnlyAllocated)}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                showOnlyAllocated
                  ? "bg-blue-50 border-blue-300 text-blue-700 font-bold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Only Show Allocated ({allocatedCount})
            </button>
            <span className="text-slate-500 font-mono text-[11px]">
              {EXCEL_DRAW_TASKS.length} Master Tasks in Schedule
            </span>
          </div>
        </div>

        {/* Task List Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-16">CSI Code</th>
                  <th className="py-2.5 px-3">Task Description / Scope</th>
                  <th className="py-2.5 px-3 text-right">Scheduled Value</th>
                  <th className="py-2.5 px-3 text-right w-48">Draw #{drawNumber} Requested ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                      No matching construction tasks found.
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
                          <span className="font-medium text-slate-900 block">
                            {task.description}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                          {formatMoney(task.scheduledValueCents)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <span className="text-slate-400 font-semibold">$</span>
                            <input
                              type="text"
                              value={currentAmt}
                              onChange={(e) => handleAmountChange(task.number, e.target.value)}
                              placeholder="0.00"
                              className={`w-32 text-right rounded border px-2.5 py-1 text-xs font-bold transition-all focus:outline-none ${
                                hasValue
                                  ? "border-blue-500 bg-white text-blue-900 ring-1 ring-blue-500/20"
                                  : "border-slate-200 bg-slate-50/50 text-slate-600 focus:border-blue-600 focus:bg-white"
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
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Tasks Allocated</span>
              <span className="font-bold text-slate-900 text-sm">
                {allocatedCount} of {EXCEL_DRAW_TASKS.length}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block text-[11px]">Gross Requested</span>
              <span className="font-bold text-slate-900 text-sm tabular-nums">
                {formatMoney(totalRequestedCents)}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block text-[11px]">10% Retainage Withheld</span>
              <span className="font-semibold text-amber-600 text-sm tabular-nums">
                -{formatMoney(retainageCents)}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block text-[11px]">Net Payable</span>
              <span className="font-bold text-emerald-600 text-sm tabular-nums">
                {formatMoney(netPayableCents)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Save & Apply {allocatedCount} Tasks ({formatMoney(totalRequestedCents)})
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
