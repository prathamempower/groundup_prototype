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
  Camera,
  X,
  Check,
  Building2,
  User,
  ShieldCheck,
  ChevronRight,
  Sparkles,
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
  const [newChecklistText, setNewChecklistText] = useState("");
  const [newPhotoText, setNewPhotoText] = useState("");
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

  const handleToggleChecklist = (itemIndex: number) => {
    if (!draft) return;
    const updatedChecklist = draft.checklist.map((item, idx) =>
      idx === itemIndex ? { ...item, checked: !item.checked } : item
    );
    handleFieldChange("checklist", updatedChecklist);
  };

  const handleRemoveChecklistItem = (itemIndex: number) => {
    if (!draft) return;
    const updatedChecklist = draft.checklist.filter((_, idx) => idx !== itemIndex);
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

  const handleAddPhotoLog = () => {
    if (!draft || !newPhotoText.trim()) return;
    handleFieldChange("photo_logs", [...draft.photo_logs, newPhotoText.trim()]);
    setNewPhotoText("");
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

  const cleanQualityText = (text: string) => {
    return text.replace(/^Passed\s+Passed\s*/i, "Passed ").replace(/^Passed\s+/i, "");
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
            <Link
              href={calendarBackUrl}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>Back to Calendar</span>
            </Link>

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

        {/* Date Context Header */}
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
            <div className="flex items-center gap-2.5 shrink-0">
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
                  This will remove the task, trade shift, and its delay flags from the platform calendar.
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

        {/* Main Content Area */}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Columns: Main Task Details & Scope */}
            <div className="lg:col-span-2 space-y-4">
              {/* Task Title (Editable by Owner) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
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
                  className="w-full text-xl sm:text-2xl font-bold tracking-tight text-slate-900 border-b border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:outline-none bg-transparent py-1.5 transition-colors"
                  placeholder="Enter task title"
                />
              </div>

              {/* Phase Milestone & Completion Slider */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold gap-3">
                  <span className="text-slate-500 font-medium">Phase Milestone</span>
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
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Site Excavation & Grading">Site Excavation & Grading</option>
                    <option value="Foundation & Concrete Pour">Foundation & Concrete Pour</option>
                    <option value="Superstructure Framing">Superstructure Framing</option>
                    <option value="MEP Rough-Ins & Utilities">MEP Rough-Ins & Utilities</option>
                    <option value="Critical Path & Delays">Critical Path & Delays</option>
                  </select>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
                    <span className="font-semibold text-slate-700">Completion Stage</span>
                    <span className="font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-full text-xs">
                      {draft.completion_stage_percent}%
                    </span>
                  </div>

                  <div className="px-1">
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
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-2 px-1">
                    <span>0% (Scheduled)</span>
                    <span>50% (In Progress)</span>
                    <span>100% (Completed)</span>
                  </div>
                </div>
              </div>

              {/* 4 Detail Boxes: Subcontractor, Shift, Supervisor, Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trade Subcontractor */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Trade Subcontractor
                  </span>
                  <input
                    type="text"
                    value={draft.trade_subcontractor}
                    onChange={(e) => handleFieldChange("trade_subcontractor", e.target.value)}
                    className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none py-0.5"
                    placeholder="e.g. Tri-State Formwork Co"
                  />
                </div>

                {/* Assigned Time Shift */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Assigned Time Shift
                  </span>
                  <input
                    type="text"
                    value={draft.assigned_time_shift}
                    onChange={(e) => {
                      handleFieldChange("assigned_time_shift", e.target.value);
                      handleFieldChange("time", e.target.value);
                    }}
                    className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none py-0.5"
                    placeholder="e.g. 10:30 AM"
                  />
                </div>

                {/* Site Supervisor */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Site Supervisor
                  </span>
                  <input
                    type="text"
                    value={draft.site_supervisor}
                    onChange={(e) => handleFieldChange("site_supervisor", e.target.value)}
                    className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none py-0.5"
                    placeholder="e.g. Foreman Carlo Vega"
                  />
                </div>

                {/* Quality Verification */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Quality Verification
                  </span>
                  <div className="flex items-center gap-2">
                    {draft.is_delayed ? (
                      <span className="text-red-600 flex items-center gap-1 font-bold text-xs shrink-0">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Delayed
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1 font-bold text-xs shrink-0">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Passed
                      </span>
                    )}
                    <input
                      type="text"
                      value={cleanQualityText(draft.quality_verification)}
                      onChange={(e) => handleFieldChange("quality_verification", e.target.value)}
                      className="flex-1 min-w-0 text-xs font-semibold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none py-0.5 truncate"
                      placeholder="Inspection verification notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Task Created & Allocated By Card */}
              <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
                    {draft.created_by.charAt(0) || "D"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                      Task Created & Allocated By
                    </span>
                    <span className="text-sm font-bold text-slate-900 block truncate">
                      {draft.created_by}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Role: {draft.created_by_role} • {new Date(draft.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <span className="text-xs text-slate-500 font-medium">Edit:</span>
                  <input
                    type="text"
                    value={draft.created_by}
                    onChange={(e) => handleFieldChange("created_by", e.target.value)}
                    className="text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 bg-white hover:border-blue-400 focus:outline-none focus:border-blue-600 min-w-[200px] max-w-[260px] shadow-2xs"
                    title="Edit creator of this task"
                    placeholder="Creator Name"
                  />
                </div>
              </div>

              {/* Daily Field Work Scope */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Daily Field Work Scope
                </label>
                <textarea
                  rows={4}
                  value={draft.daily_field_work_scope}
                  onChange={(e) => handleFieldChange("daily_field_work_scope", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none shadow-2xs transition-colors"
                  placeholder="Describe field operations, trade coordination, and equipment requirements..."
                />
              </div>
            </div>

            {/* Right Column: Delay Controls, Checklist & Photos */}
            <div className="space-y-4">
              {/* Schedule Delay Status Card */}
              <div
                className={`rounded-2xl border p-5 transition-all shadow-2xs ${
                  draft.is_delayed
                    ? "border-red-300 bg-red-50/40"
                    : "border-slate-200/90 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-3.5 w-3.5 rounded-full shrink-0 ${
                        draft.is_delayed
                          ? "bg-red-600 animate-pulse ring-4 ring-red-200"
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
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      draft.is_delayed
                        ? "bg-red-600 text-white shadow-xs hover:bg-red-700"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    {draft.is_delayed ? "Clear Delay (On Track)" : "Mark as Delayed"}
                  </button>
                </div>

                {draft.is_delayed && (
                  <div className="mt-4 pt-3.5 border-t border-red-200/70 space-y-3">
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
                        className="w-20 rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-bold text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
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

              {/* Site Quality & Safety Checklist */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Site Quality & Safety Checklist
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    {draft.checklist.filter((c) => c.checked).length} of {draft.checklist.length} verified
                  </span>
                </div>

                <div className="space-y-1.5">
                  {draft.checklist.map((item, idx) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between gap-2.5 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleChecklist(idx)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <span
                          className={`text-xs ${
                            item.checked
                              ? "line-through text-slate-400"
                              : "text-slate-800 font-medium"
                          } truncate`}
                        >
                          {item.label}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(idx)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-0.5"
                        title="Remove checklist item"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Checklist Item */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                    <input
                      type="text"
                      placeholder="Add compliance check item..."
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddChecklist();
                        }
                      }}
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
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
              </div>

              {/* On-Site Photo Evidence */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
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
                  <div className="space-y-2">
                    {draft.photo_logs.map((log, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex items-center gap-2.5 text-xs font-medium text-slate-700"
                      >
                        <Camera className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="truncate">{log}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Photo Log Row */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Attach photo tag / file name..."
                    value={newPhotoText}
                    onChange={(e) => setNewPhotoText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPhotoLog();
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoLog}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Attach</span>
                  </button>
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

