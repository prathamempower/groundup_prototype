"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Save,
  Trash2,
  Plus,
} from "lucide-react";
import { ConstructionTask } from "@/lib/data/construction-calendar-data";

interface TaskDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedDate: string | null;
  tasksOnDate: ConstructionTask[];
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onUpdateTask: (updatedTask: ConstructionTask) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteAllTasksOnDate?: (date: string) => void;
  onCreateTaskOnDate: (date: string) => void;
}

export function TaskDetailDrawer({
  open,
  onClose,
  selectedDate,
  tasksOnDate,
  activeTaskId,
  onSelectTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteAllTasksOnDate,
  onCreateTaskOnDate,
}: TaskDetailDrawerProps) {
  // Current active task or first task on that date
  const activeTask =
    tasksOnDate.find((t) => t.id === activeTaskId) ||
    tasksOnDate[0] ||
    null;

  // Local editable draft state
  const [draft, setDraft] = useState<ConstructionTask | null>(activeTask);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraft(activeTask ? { ...activeTask } : null);
    setShowDeleteConfirm(false);
    setSaveSuccessMessage(null);
  }, [activeTask, open]);

  if (!open) return null;

  const handleFieldChange = <K extends keyof ConstructionTask>(
    field: K,
    value: ConstructionTask[K]
  ) => {
    if (!draft) return;
    const updated = { ...draft, [field]: value };
    setDraft(updated);
    onUpdateTask(updated);
  };

  const handleToggleDelayed = (delayed: boolean) => {
    if (!draft) return;
    const delayDays = delayed ? (draft.delay_days > 0 ? draft.delay_days : 3) : 0;
    const updated: ConstructionTask = {
      ...draft,
      is_delayed: delayed,
      status: delayed ? "DELAYED" : draft.completion_stage_percent === 100 ? "COMPLETED" : "IN_PROGRESS",
      delay_days: delayDays,
      phase_id: delayed ? "critical" : draft.phase_id,
      quality_verification: delayed
        ? `Delayed (${delayDays} Days) - Critical Path`
        : "Passed Verification",
    };
    setDraft(updated);
    onUpdateTask(updated);
  };

  const handleApproveWorkLog = () => {
    if (!draft) return;
    const updated: ConstructionTask = {
      ...draft,
      status: "COMPLETED",
      completion_stage_percent: 100,
      is_delayed: false,
      delay_days: 0,
      quality_verification: "Passed Verification & Owner Approved",
    };
    setDraft(updated);
    onUpdateTask(updated);
    setSaveSuccessMessage("Task marked 100% completed & approved!");
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleSaveDraft = () => {
    if (!draft) return;
    onUpdateTask(draft);
    setSaveSuccessMessage("All changes saved successfully.");
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[620px] flex-col bg-white shadow-2xl border-l border-slate-200/90 duration-200 ease-out animate-in slide-in-from-right"
        aria-label="Task inspector and field work log drawer"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-white shrink-0 gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-mono font-bold text-blue-700 border border-blue-200/80 shadow-2xs">
              {draft?.date || selectedDate || "2026-10-14"}
            </span>

            {draft?.is_delayed && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200/80 shadow-2xs">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                DELAYED ({draft.delay_days}d)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Prominent Header "Delete Task" Button as requested */}
            {draft && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/80 hover:bg-red-100 text-red-700 px-3 py-1.5 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                title="Delete the task assigned on this date"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                <span>Delete Task</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close task inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Inline Delete Confirmation Alert */}
        {showDeleteConfirm && draft && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-900">
                  Delete task &ldquo;{draft.title}&rdquo; assigned on {draft.date}?
                </p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  This task and its calendar status will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteTask(draft.id);
                }}
                className="px-3 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Success toast banner */}
        {saveSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in duration-150">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {!draft ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No Tasks Allocated on {selectedDate}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                You can allocate a new construction task, inspection check, or milestone verification to this date.
              </p>
              <button
                onClick={() => selectedDate && onCreateTaskOnDate(selectedDate)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Allocate Task for this Date</span>
              </button>
            </div>
          ) : (
            <>
              {/* Task Title (Editable by Owner) - Prominently at Top */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Task Title (Editable by Owner)
                  </label>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    Field Work Item
                  </span>
                </div>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full text-lg font-bold tracking-tight text-slate-900 border-b border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:outline-none bg-transparent py-1 transition-colors"
                  placeholder="Enter task title"
                />
              </div>

              {/* Task Title (Editable by Owner) */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Task Title (Editable by Owner)
                  </label>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    Field Work Item
                  </span>
                </div>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full text-lg font-bold tracking-tight text-slate-900 border-b border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:outline-none bg-transparent py-1 transition-colors"
                  placeholder="Enter task title"
                />
              </div>

              {/* Daily Field Work Scope */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Daily Field Work Scope & Operations
                </label>
                <textarea
                  rows={4}
                  value={draft.daily_field_work_scope}
                  onChange={(e) => handleFieldChange("daily_field_work_scope", e.target.value)}
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none shadow-2xs transition-colors"
                  placeholder="Describe field operations, trade coordination, and equipment requirements..."
                />
              </div>

              {/* Creator Card: "TASK CREATED & ALLOCATED BY" */}
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
                    {draft.created_by.charAt(0) || "D"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                      Task Created & Allocated By
                    </span>
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {draft.created_by}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Role: {draft.created_by_role} • {new Date(draft.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <span className="text-[10px] text-slate-400 font-medium">Edit:</span>
                  <input
                    type="text"
                    value={draft.created_by}
                    onChange={(e) => handleFieldChange("created_by", e.target.value)}
                    className="text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1 bg-white hover:border-blue-400 focus:outline-none focus:border-blue-600 min-w-[180px] max-w-[240px] shadow-2xs"
                    title="Edit creator of this task"
                    placeholder="Creator Name"
                  />
                </div>
              </div>

              {/* Schedule Delay Status */}
              <div
                className={`rounded-xl border p-4 transition-all shadow-2xs ${
                  draft.is_delayed
                    ? "border-red-300 bg-red-50/40"
                    : "border-slate-200/90 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`h-3 w-3 rounded-full shrink-0 ${
                        draft.is_delayed
                          ? "bg-red-600 ring-4 ring-red-200"
                          : "bg-slate-300"
                      }`}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Schedule Delay Status
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {draft.is_delayed
                          ? `Delayed by ${draft.delay_days} days • Red dot active on calendar`
                          : "Task is on track with zero active delay"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDelayed(!draft.is_delayed)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      draft.is_delayed
                        ? "bg-red-600 text-white shadow-xs hover:bg-red-700"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    {draft.is_delayed ? "Clear Delay" : "Mark as Delayed"}
                  </button>
                </div>

                {draft.is_delayed && (
                  <div className="mt-3.5 pt-3 border-t border-red-200/70 space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                        Delay Days:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={draft.delay_days}
                        onChange={(e) => handleFieldChange("delay_days", Number(e.target.value))}
                        className="w-20 rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-bold text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                      <span className="text-xs text-red-600 font-medium">
                        Shows red dot indicator on calendar
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-red-700 block mb-1">
                        Delay Cause & Site Rationale:
                      </label>
                      <textarea
                        rows={2}
                        value={draft.delay_cause || ""}
                        onChange={(e) => handleFieldChange("delay_cause", e.target.value)}
                        placeholder="e.g. Pump truck hydraulic hose failure during pour..."
                        className="w-full text-xs text-slate-800 rounded-lg border border-red-200 bg-white p-2.5 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Footer */}
        {draft && (
          <div className="border-t border-slate-200/80 p-4 bg-white flex items-center justify-between gap-3 shrink-0">
            {/* Prominent Footer "Delete Task" Button */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3.5 py-2 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
              title="Delete this task"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
              <span>Delete Task</span>
            </button>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handleApproveWorkLog}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve Work Log</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
