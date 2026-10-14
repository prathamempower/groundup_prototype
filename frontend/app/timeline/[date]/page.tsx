"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Plus,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  ConstructionTask,
  INITIAL_CONSTRUCTION_TASKS,
  getStoredConstructionTasks,
  saveStoredConstructionTasks,
} from "@/lib/data/construction-calendar-data";
import { CreateFieldTaskModal } from "@/components/timeline/create-field-task-modal";

function TimelineDatePageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = (params?.date as string) || "2026-10-14";
  const routeProjectId = (params?.projectId as string) || "";
  const initialTaskId = searchParams.get("taskId");

  // Project Query
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const currentProjectId = routeProjectId || projectsData?.data?.current_project_id || "";
  const currentProject = projectsData?.data?.projects?.find((p) => p.id === currentProjectId);
  const projectName = currentProject?.name || "Horizon Heights Tower A";

  // Construction Tasks state
  const [tasks, setTasks] = useState<ConstructionTask[]>(INITIAL_CONSTRUCTION_TASKS);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(initialTaskId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const loaded = getStoredConstructionTasks(currentProjectId || "default");
    setTasks(loaded);
  }, [currentProjectId]);

  // Tasks on this specific date
  const tasksOnDate = useMemo(() => {
    return tasks.filter((t) => t.date === dateParam);
  }, [tasks, dateParam]);

  // Active task draft
  const activeTask = useMemo(() => {
    if (activeTaskId) {
      const found = tasksOnDate.find((t) => t.id === activeTaskId);
      if (found) return found;
    }
    return tasksOnDate[0] || null;
  }, [tasksOnDate, activeTaskId]);

  const [draft, setDraft] = useState<ConstructionTask | null>(activeTask);

  useEffect(() => {
    setDraft(activeTask ? { ...activeTask } : null);
    setShowDeleteConfirm(false);
  }, [activeTask]);

  // Back link URL
  const calendarBackUrl = currentProjectId
    ? `/projects/${currentProjectId}/timeline`
    : `/timeline`;

  const handleFieldChange = <K extends keyof ConstructionTask>(
    field: K,
    value: ConstructionTask[K]
  ) => {
    if (!draft) return;
    const updated = { ...draft, [field]: value };
    setDraft(updated);

    // Save to all tasks & localStorage
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? updated : t));
      saveStoredConstructionTasks(currentProjectId || "default", next);
      return next;
    });
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
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? updated : t));
      saveStoredConstructionTasks(currentProjectId || "default", next);
      return next;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const nextTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(nextTasks);
    saveStoredConstructionTasks(currentProjectId || "default", nextTasks);

    // Check if other tasks remain on this date
    const remaining = nextTasks.filter((t) => t.date === dateParam);
    if (remaining.length > 0) {
      setActiveTaskId(remaining[0].id);
    } else {
      setActiveTaskId(null);
      setDraft(null);
    }
    setShowDeleteConfirm(false);
    setSaveSuccessMessage("Task removed successfully.");
    setTimeout(() => setSaveSuccessMessage(null), 3000);
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
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? updated : t));
      saveStoredConstructionTasks(currentProjectId || "default", next);
      return next;
    });
    setSaveSuccessMessage("Task marked 100% completed & approved!");
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleSaveDraft = () => {
    if (!draft) return;
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === draft.id ? draft : t));
      saveStoredConstructionTasks(currentProjectId || "default", next);
      return next;
    });
    setSaveSuccessMessage("Draft changes saved successfully.");
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50/40 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/90 px-5 py-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link
              href={calendarBackUrl}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              title="Return to Calendar View"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <BrandLogo size="md" showSubtitle={false} />
            <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 border border-blue-200/70">
              FIELD TIMELINE
            </span>
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <span className="text-[11px] font-medium text-slate-400 block">Project:</span>
              <span className="text-xs font-bold text-slate-900">{projectName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Allocate Task on this Date</span>
            </button>
          </div>
        </div>

        {/* Date Context Header & Action Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/90 px-6 py-4 shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="rounded-xl bg-blue-50 px-3.5 py-1.5 text-sm font-mono font-extrabold text-blue-700 border border-blue-200/80 shadow-2xs">
              {dateParam}
            </span>

            {draft?.is_delayed ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 border border-red-200/80 shadow-2xs">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
                DELAYED ({draft.delay_days} DAYS ACTIVE DELAY)
              </span>
            ) : draft?.status === "COMPLETED" ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200/80 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                WORK COMPLETED
              </span>
            ) : draft?.status === "IN_PROGRESS" ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-200/80 shadow-2xs">
                <Clock className="h-4 w-4 text-blue-600" />
                IN PROGRESS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200/80 shadow-2xs">
                <Calendar className="h-4 w-4 text-amber-600" />
                SCHEDULED
              </span>
            )}
          </div>

          {/* Action Buttons in Context Header */}
          {draft && (
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => handleToggleDelayed(!draft.is_delayed)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  draft.is_delayed
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{draft.is_delayed ? "Clear Delay" : "Mark as Delayed"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Delete this task assigned on this date"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                <span>Delete Task</span>
              </button>

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
          )}
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm && draft && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150 shadow-2xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-900">
                  Delete task &ldquo;{draft.title}&rdquo; assigned on {dateParam}?
                </p>
                <p className="text-xs text-red-700 mt-0.5">
                  This will remove the task and its delay flags from the platform calendar.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTask(draft.id)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Active Schedule Delay Configuration Strip */}
        {draft?.is_delayed && (
          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-600 animate-pulse shrink-0" />
              <div>
                <span className="text-xs font-bold text-red-900 block">
                  Active Schedule Delay ({draft.delay_days} Days) • Red dot active on calendar
                </span>
                <span className="text-[11px] text-red-700 block">
                  This task is flagged as delayed. Calendar view shows a red dot for this date.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-red-900 whitespace-nowrap">
                  Delay Days:
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={draft.delay_days}
                  onChange={(e) => handleFieldChange("delay_days", Number(e.target.value))}
                  className="w-20 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={draft.delay_cause || ""}
                  onChange={(e) => handleFieldChange("delay_cause", e.target.value)}
                  placeholder="Reason for delay..."
                  className="w-48 sm:w-64 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-2xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Success toast banner */}
        {saveSuccessMessage && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2.5 text-xs font-semibold text-emerald-800 animate-in fade-in duration-150 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Multi-Task Selector on this Date */}
        {tasksOnDate.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white px-5 py-3 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Tasks on {dateParam}:
            </span>
            {tasksOnDate.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTaskId(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  t.id === activeTask?.id
                    ? "bg-blue-50 font-bold text-blue-700 shadow-2xs border border-blue-200/80"
                    : "text-slate-600 hover:bg-slate-50 border border-transparent"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    t.is_delayed
                      ? "bg-red-500 animate-pulse"
                      : t.status === "COMPLETED"
                      ? "bg-emerald-500"
                      : "bg-blue-500"
                  }`}
                />
                <span>{t.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Content Area - Clean, Perfectly Aligned Form */}
        {!draft ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-16 text-center shadow-2xs space-y-3">
            <div className="h-14 w-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Calendar className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No Field Tasks Allocated on {dateParam}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no tasks or inspection checkpoints scheduled for this date.
              You can allocate a new field task now.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href={calendarBackUrl}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                Return to Calendar
              </Link>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Allocate Task for this Date</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Task Title (Editable by Owner) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Task Title (Editable by Owner)
                </label>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                  Field Work Item
                </span>
              </div>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="w-full text-xl sm:text-2xl font-bold tracking-tight text-slate-900 border-b border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:outline-none bg-transparent pb-2 transition-colors"
                placeholder="Enter task title"
              />
            </div>

            {/* Daily Field Work Scope */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Daily Field Work Scope & Operations
              </label>
              <textarea
                rows={5}
                value={draft.daily_field_work_scope}
                onChange={(e) => handleFieldChange("daily_field_work_scope", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed focus:border-blue-600 focus:bg-white focus:outline-none shadow-2xs transition-colors"
                placeholder="Describe field operations, trade coordination, and equipment requirements..."
              />
            </div>

            {/* Task Created & Allocated By Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Task Creator & Allocation Record
              </label>

              <div className="rounded-xl border border-blue-200/70 bg-blue-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
                    {draft.created_by.charAt(0) || "D"}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                      Task Created & Allocated By
                    </span>
                    <span className="text-sm font-bold text-slate-900 block truncate">
                      {draft.created_by}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Role: {draft.created_by_role} • Allocated: {new Date(draft.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                  <span className="text-xs text-slate-500 font-medium">Edit Creator:</span>
                  <input
                    type="text"
                    value={draft.created_by}
                    onChange={(e) => handleFieldChange("created_by", e.target.value)}
                    className="text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 bg-white hover:border-blue-400 focus:outline-none focus:border-blue-600 min-w-[200px] shadow-2xs"
                    title="Edit creator of this task"
                    placeholder="Creator Name"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Allocate Field Task Modal */}
      <CreateFieldTaskModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultDate={dateParam}
        projectId={currentProjectId}
        onCreateTask={(newTask) => {
          setTasks((prev) => {
            const next = [newTask, ...prev];
            saveStoredConstructionTasks(currentProjectId || "default", next);
            return next;
          });
          setActiveTaskId(newTask.id);
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}

export default function TimelineDatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50/40 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="text-xs font-semibold text-slate-500">Loading date task details...</span>
          </div>
        </div>
      }
    >
      <TimelineDatePageContent />
    </Suspense>
  );
}

