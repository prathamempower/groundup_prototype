"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Building2,
  Calendar,
  Save,
  Trash2,
  Plus,
  Camera,
  FileCheck2,
  ShieldCheck,
  Check,
  Flame,
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
  onCreateTaskOnDate,
}: TaskDetailDrawerProps) {
  // Current active task or first task on that date
  const activeTask =
    tasksOnDate.find((t) => t.id === activeTaskId) ||
    tasksOnDate[0] ||
    null;

  // Local editable draft state
  const [draft, setDraft] = useState<ConstructionTask | null>(activeTask);
  const [isApproved, setIsApproved] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    setDraft(activeTask ? { ...activeTask } : null);
    setIsApproved(activeTask?.status === "COMPLETED");
  }, [activeTask]);

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
    const updated: ConstructionTask = {
      ...draft,
      is_delayed: delayed,
      status: delayed ? "DELAYED" : draft.completion_stage_percent === 100 ? "COMPLETED" : "IN_PROGRESS",
      delay_days: delayed ? (draft.delay_days > 0 ? draft.delay_days : 2) : 0,
      phase_id: delayed ? "critical" : draft.phase_id,
      quality_verification: delayed
        ? `Delayed (${draft.delay_days || 2} Days) - Critical Path`
        : "Passed Inspection",
    };
    setDraft(updated);
    onUpdateTask(updated);
  };

  const handleToggleChecklist = (itemIndex: number) => {
    if (!draft) return;
    const updatedChecklist = draft.checklist.map((item, idx) =>
      idx === itemIndex ? { ...item, checked: !item.checked } : item
    );
    handleFieldChange("checklist", updatedChecklist);
  };

  const handleAddChecklist = () => {
    if (!draft || !newChecklistText.trim()) return;
    const newItem = {
      id: `check-${Date.now()}`,
      label: newChecklistText.trim(),
      checked: false,
    };
    handleFieldChange("checklist", [...draft.checklist, newItem]);
    setNewChecklistText("");
  };

  const handleApproveWorkLog = () => {
    if (!draft) return;
    const updated: ConstructionTask = {
      ...draft,
      status: "COMPLETED",
      completion_stage_percent: 100,
      is_delayed: false,
      delay_days: 0,
      quality_verification: "Passed Inspection & Owner Verified",
    };
    setDraft(updated);
    setIsApproved(true);
    onUpdateTask(updated);
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
        className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[580px] flex-col bg-white shadow-2xl border-l border-slate-200/90 duration-200 ease-out animate-in slide-in-from-right sm:max-w-[620px]"
        aria-label="Task inspector and field work log drawer"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-mono font-bold text-blue-700 border border-blue-200/70">
              {draft?.date || selectedDate || "2026-10-14"}
            </span>

            {draft?.is_delayed ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200/80">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                DELAYED ({draft.delay_days}d)
              </span>
            ) : draft?.status === "COMPLETED" ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/80">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                COMPLETED
              </span>
            ) : draft?.status === "IN_PROGRESS" ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200/80">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                IN PROGRESS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200/80">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                SCHEDULED
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close task inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Multi-Task Selector on this Date */}
        {tasksOnDate.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50/60 px-6 py-2 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
              Tasks on this date:
            </span>
            {tasksOnDate.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => onSelectTask(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  t.id === activeTask?.id
                    ? "bg-white font-bold text-blue-700 shadow-2xs border border-slate-200"
                    : "text-slate-600 hover:bg-white/80"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    t.is_delayed ? "bg-red-500" : t.status === "COMPLETED" ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                />
                <span className="truncate max-w-[140px]">{t.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
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
              {/* Task Title (Editable by Owner) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Task Title (Editable)
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full text-xl font-bold tracking-tight text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none bg-transparent py-1 transition-colors"
                  placeholder="Task title"
                />
              </div>

              {/* Phase Milestone & Completion Bar */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Phase Milestone</span>
                  <select
                    value={draft.phase_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const phaseId = name.includes("Excavation")
                        ? "excavation"
                        : name.includes("Foundation")
                        ? "foundation"
                        : name.includes("Framing")
                        ? "framing"
                        : name.includes("MEP")
                        ? "mep"
                        : "critical";
                      handleFieldChange("phase_name", name);
                      handleFieldChange("phase_id", phaseId as any);
                    }}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Site Excavation & Grading">Site Excavation & Grading</option>
                    <option value="Foundation & Concrete Pour">Foundation & Concrete Pour</option>
                    <option value="Superstructure Framing">Superstructure Framing</option>
                    <option value="MEP Rough-Ins & Utilities">MEP Rough-Ins & Utilities</option>
                    <option value="Critical Path & Delays">Critical Path & Delays</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
                    <span>Completion Stage</span>
                    <span className="font-bold text-slate-900">{draft.completion_stage_percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        draft.is_delayed ? "bg-red-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${draft.completion_stage_percent}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={draft.completion_stage_percent}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleFieldChange("completion_stage_percent", val);
                        if (val === 100) {
                          handleFieldChange("status", "COMPLETED");
                        } else if (val > 0 && draft.status === "SCHEDULED") {
                          handleFieldChange("status", "IN_PROGRESS");
                        }
                      }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Detail Boxes Matching Target Layout */}
              <div className="grid grid-cols-2 gap-3">
                {/* Box 1: Trade Subcontractor */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Trade Subcontractor
                  </span>
                  <input
                    type="text"
                    value={draft.trade_subcontractor}
                    onChange={(e) => handleFieldChange("trade_subcontractor", e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none"
                    placeholder="Subcontractor"
                  />
                </div>

                {/* Box 2: Assigned Time Shift */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Assigned Time Shift
                  </span>
                  <input
                    type="text"
                    value={draft.assigned_time_shift}
                    onChange={(e) => {
                      handleFieldChange("assigned_time_shift", e.target.value);
                      handleFieldChange("time", e.target.value);
                    }}
                    className="w-full text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 02:30 PM"
                  />
                </div>

                {/* Box 3: Site Supervisor / Who put that task */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Site Supervisor
                  </span>
                  <input
                    type="text"
                    value={draft.site_supervisor}
                    onChange={(e) => handleFieldChange("site_supervisor", e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none"
                    placeholder="Supervisor"
                  />
                </div>

                {/* Box 4: Quality Verification */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Quality Verification
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {draft.is_delayed ? (
                      <span className="text-red-600 flex items-center gap-1 font-bold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Delayed
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1 font-bold">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Passed
                      </span>
                    )}
                    <input
                      type="text"
                      value={draft.quality_verification}
                      onChange={(e) => handleFieldChange("quality_verification", e.target.value)}
                      className="flex-1 text-[11px] font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none"
                      placeholder="Inspection notes"
                    />
                  </div>
                </div>
              </div>

              {/* Creator Card: "he should be able to see who put that task" */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {draft.created_by.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                      Task Created & Allocated By
                    </span>
                    <span className="text-xs font-bold text-slate-900 block">
                      {draft.created_by}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Role: {draft.created_by_role} • {new Date(draft.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <input
                    type="text"
                    value={draft.created_by}
                    onChange={(e) => handleFieldChange("created_by", e.target.value)}
                    className="text-xs font-semibold text-slate-700 border border-slate-200 rounded px-2 py-0.5 bg-white text-right w-44 hover:border-blue-400 focus:outline-none focus:border-blue-600"
                    title="Edit creator of this task"
                  />
                </div>
              </div>

              {/* Delays & Red Dot Control */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  draft.is_delayed
                    ? "border-red-300 bg-red-50/40"
                    : "border-slate-200/80 bg-slate-50/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        draft.is_delayed ? "bg-red-600 animate-pulse ring-4 ring-red-200" : "bg-slate-300"
                      }`}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Schedule Delay Status
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {draft.is_delayed
                          ? "Calendar shows a RED DOT for this task"
                          : "Task is on track with zero active delay"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDelayed(!draft.is_delayed)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      draft.is_delayed
                        ? "bg-red-600 text-white shadow-xs hover:bg-red-700"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {draft.is_delayed ? "Delayed Active (Red Dot)" : "Mark as Delayed"}
                  </button>
                </div>

                {draft.is_delayed && (
                  <div className="mt-3.5 pt-3 border-t border-red-200/60 space-y-3">
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
                        Will be marked with red dot on calendar
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
                        placeholder="e.g. Concrete pump breakdown, late delivery, structural engineering revision..."
                        className="w-full rounded-lg border border-red-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Field Work Scope */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Daily Field Work Scope
                </label>
                <textarea
                  rows={3}
                  value={draft.daily_field_work_scope}
                  onChange={(e) => handleFieldChange("daily_field_work_scope", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
                  placeholder="Describe field operations, concrete batches, trades active on site..."
                />
              </div>

              {/* Site Quality & Safety Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Site Quality & Safety Checklist
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {draft.checklist.filter((c) => c.checked).length} of {draft.checklist.length} verified
                  </span>
                </div>

                <div className="space-y-1.5">
                  {draft.checklist.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(idx)}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors cursor-pointer ${
                        item.checked
                          ? "border-emerald-200/90 bg-emerald-50/40 text-slate-900"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                          item.checked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {item.checked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className={`text-xs ${item.checked ? "font-semibold" : ""}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Checklist Item */}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddChecklist()}
                    placeholder="Add verification item..."
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklist}
                    className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* On-Site Photo Evidence */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    On-Site Photo Evidence
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    {draft.photo_logs.length} attached
                  </span>
                </div>

                {draft.photo_logs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                    <p className="text-xs text-slate-400 italic">No photo logs attached.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {draft.photo_logs.map((log, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex items-center gap-2 text-xs font-medium text-slate-700"
                      >
                        <Camera className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="truncate">{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Footer Matching Target UI */}
        {draft && (
          <div className="border-t border-slate-200/80 p-4 bg-white flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => onDeleteTask(draft.id)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              title="Delete this task"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                type="button"
                onClick={() => handleFieldChange("date", draft.date)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
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
