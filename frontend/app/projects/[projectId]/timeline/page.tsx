"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Search,
  ListChecks,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  ConstructionTask,
  INITIAL_CONSTRUCTION_TASKS,
  getStoredConstructionTasks,
  saveStoredConstructionTasks,
} from "@/lib/data/construction-calendar-data";
import { CONTROL_CENTER_AMOUNT_ORIGINS } from "@/lib/data/control-center-origins";
import { TimelineCalendarView } from "@/components/timeline/timeline-calendar-view";
import { TaskDetailDrawer } from "@/components/timeline/task-detail-drawer";
import { CreateFieldTaskModal } from "@/components/timeline/create-field-task-modal";
import { DocumentQuickPreviewModal } from "@/components/documents/document-quick-preview-modal";
import { DocumentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProjectTimelinePage() {
  const router = useRouter();
  const params = useParams();
  const [activeView, setActiveView] = useState<"calendar" | "table">("calendar");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTradeFilter, setActiveTradeFilter] = useState("");
  const [activePhaseFilters, setActivePhaseFilters] = useState<Record<string, boolean>>({
    excavation: true,
    foundation: true,
    framing: true,
    mep: true,
    critical: true,
  });

  // Demo Document preview state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Construction Calendar Tasks State
  const [constructionTasks, setConstructionTasks] = useState<ConstructionTask[]>(INITIAL_CONSTRUCTION_TASKS);
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-14");
  const [activeTaskId, setActiveTaskId] = useState<string | null>("task-oct-14-2");
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // Synchronized month navigation
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9);
    setSelectedDate("2026-10-14");
    const tasksForDate = constructionTasks.filter((t) => t.date === "2026-10-14");
    if (tasksForDate.length > 0) {
      setActiveTaskId(tasksForDate[0].id);
    } else {
      setActiveTaskId(null);
    }
  };

  // Active Project Query
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const routeProjectId = (params?.projectId as string) || (typeof window !== "undefined"
    ? (window.location.pathname.match(/^\/projects\/([^\/]+)/)?.[1] || "")
    : "");
  const currentProjectId = (routeProjectId && routeProjectId !== "new")
    ? routeProjectId
    : projectsData?.data?.current_project_id || "";

  const currentProject = projectsData?.data?.projects?.find((p) => p.id === currentProjectId);
  const projectName = currentProject?.name || "Horizon Heights Tower A";

  // Load project-scoped tasks from localStorage on mount / project change
  useEffect(() => {
    const loaded = getStoredConstructionTasks(currentProjectId || "default");
    setConstructionTasks(loaded);
  }, [currentProjectId]);

  // Save tasks when updated
  const handleUpdateTask = (updatedTask: ConstructionTask) => {
    setConstructionTasks((prev) => {
      const next = prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      saveStoredConstructionTasks(currentProjectId || "default", next);
      return next;
    });
  };

  const handleCreateTask = (newTask: ConstructionTask) => {
    setConstructionTasks((prev) => {
      const next = [newTask, ...prev];
      saveStoredConstructionTasks(currentProjectId || "default", next);
      return next;
    });
    setSelectedDate(newTask.date);
    setActiveTaskId(newTask.id);
    const targetUrl = currentProjectId
      ? `/projects/${currentProjectId}/timeline/${newTask.date}?taskId=${newTask.id}`
      : `/projects/${currentProjectId || "default"}/timeline/${newTask.date}?taskId=${newTask.id}`;
    router.push(targetUrl);
  };

  const handleDeleteTask = (taskId: string) => {
    setConstructionTasks((prev) => {
      const next = prev.filter((t) => t.id !== taskId);
      saveStoredConstructionTasks(currentProjectId || "default", next);
      return next;
    });
    // Check if other tasks exist on that date
    const remainingOnDate = constructionTasks.filter(
      (t) => t.date === selectedDate && t.id !== taskId
    );
    if (remainingOnDate.length > 0) {
      setActiveTaskId(remainingOnDate[0].id);
    } else {
      setActiveTaskId(null);
      setIsTaskDrawerOpen(false);
    }
  };

  const handleDeleteAllTasksOnDate = (dateStr: string) => {
    setConstructionTasks((prev) => {
      const next = prev.filter((t) => t.date !== dateStr);
      saveStoredConstructionTasks(currentProjectId || "default", next);
      return next;
    });
    setActiveTaskId(null);
    setIsTaskDrawerOpen(false);
  };

  // Click on any date opens a new page in the platform
  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const tasksForDate = constructionTasks.filter((t) => t.date === dateStr);
    if (tasksForDate.length > 0) {
      setActiveTaskId(tasksForDate[0].id);
    } else {
      setActiveTaskId(null);
    }
    const targetUrl = currentProjectId
      ? `/projects/${currentProjectId}/timeline/${dateStr}`
      : `/projects/${currentProjectId || "default"}/timeline/${dateStr}`;
    router.push(targetUrl);
  };

  // Click on any task pill opens the new page in the platform with that task focused
  const handleSelectTask = (taskId: string) => {
    setActiveTaskId(taskId);
    const task = constructionTasks.find((t) => t.id === taskId);
    const targetDate = task ? task.date : selectedDate;
    const targetUrl = currentProjectId
      ? `/projects/${currentProjectId}/timeline/${targetDate}?taskId=${taskId}`
      : `/projects/${currentProjectId || "default"}/timeline/${targetDate}?taskId=${taskId}`;
    router.push(targetUrl);
  };

  // Phase filter toggles
  const handleTogglePhaseFilter = (phaseId: string) => {
    setActivePhaseFilters((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const handleResetFilters = () => {
    setActivePhaseFilters({
      excavation: true,
      foundation: true,
      framing: true,
      mep: true,
      critical: true,
    });
    setActiveTradeFilter("");
    setSearchQuery("");
  };

  const tasksOnSelectedDate = constructionTasks.filter((t) => t.date === selectedDate);

  const handleOpenScheduleDoc = async () => {
    try {
      const res = await api.documents.list(currentProjectId || "df16b577-3585-4fb0-a13a-ffadaca73e0f");
      const found = res.data?.find(
        (d) =>
          d.id === "doc-broadway-schedule" ||
          d.original_filename.toLowerCase().includes("schedule") ||
          d.original_filename.toLowerCase().includes("master construction")
      );
      if (found) {
        setPreviewDoc(found);
      } else {
        setPreviewDoc({
          id: "doc-broadway-schedule",
          organization_id: "org-vance-dev",
          project_id: currentProjectId || "df16b577-3585-4fb0-a13a-ffadaca73e0f",
          original_filename: "73 Broadway - Master Construction Schedule.pdf",
          mime_type: "application/pdf",
          document_type: "INSPECTION",
          document_date: "2025-10-25",
          ingestion_status: "REVIEWED",
          uploaded_by: "system",
          uploaded_at: new Date().toISOString(),
          pages_count: 1,
          notes: "Official 19-activity construction milestone schedule and sequence of work",
        });
      }
    } catch {
      setPreviewDoc({
        id: "doc-broadway-schedule",
        organization_id: "org-vance-dev",
        project_id: currentProjectId || "df16b577-3585-4fb0-a13a-ffadaca73e0f",
        original_filename: "73 Broadway - Master Construction Schedule.pdf",
        mime_type: "application/pdf",
        document_type: "INSPECTION",
        document_date: "2025-10-25",
        ingestion_status: "REVIEWED",
        uploaded_by: "system",
        uploaded_at: new Date().toISOString(),
        pages_count: 1,
        notes: "Official 19-activity construction milestone schedule and sequence of work",
      });
    }
    setIsDocModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-16 min-h-screen bg-slate-50/30">
      <div className="px-4 sm:px-6 max-w-[1600px] mx-auto space-y-4 pt-3">
        {/* Top Header: Brand Logo + Project + Client Live View + User Profile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/90 px-5 py-3 shadow-2xs">
          {/* Brand & Project Info */}
          <div className="flex items-center gap-3">
            <BrandLogo size="md" showSubtitle={false} />
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              Timeline & Progress
            </h1>
            <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 border border-blue-200/70">
              CONSTRUCTION APP
            </span>
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <span className="text-[11px] font-medium text-slate-400 block">Project:</span>
              <span className="text-xs font-bold text-slate-900">
                {projectName}
              </span>
            </div>
          </div>

          {/* Right: Client Live View + User Profile Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Client Live View</span>
            </button>

            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                DR
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Divyanshu Rai
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-none">
                  Project Owner
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: View Switcher (Calendar vs Milestone Table) + Nav/Filters + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/90 px-4 py-2.5 shadow-2xs">
          {/* Left: View Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView("calendar")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeView === "calendar"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Calendar View</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("table")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeView === "table"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
              )}
            >
              <ListChecks className="h-3.5 w-3.5" />
              <span>Milestone Schedule & Delays Table</span>
            </button>
          </div>

          {/* Middle: Date Navigation (visible in Calendar mode) or Quick Stats (in Table mode) */}
          {activeView === "calendar" ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleToday}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                Today
              </button>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight min-w-[120px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </h2>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                4 Completed
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70 font-semibold">
                <Clock className="h-3 w-3 text-amber-600" />
                1 In Progress
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                14 Upcoming / Target
              </span>
            </div>
          )}

          {/* Right: Search Input & View Schedule Document Button */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleOpenScheduleDoc}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 hover:border-blue-300 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Open Official Master Construction Schedule PDF"
            >
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <span>View Schedule Document</span>
            </button>

            <div className="relative flex-1 md:w-56 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeView === "table"
                    ? "Filter activities, codes, or status..."
                    : "Search site work, trades, tasks..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* View Selection: Calendar View OR Milestone Schedule Table */}
        {activeView === "calendar" ? (
          <TimelineCalendarView
            tasks={constructionTasks}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onSelectTask={handleSelectTask}
            onOpenCreateModal={() => setIsCreateTaskModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTradeFilter={activeTradeFilter}
            onTradeFilterChange={setActiveTradeFilter}
            activePhaseFilters={activePhaseFilters}
            onTogglePhaseFilter={handleTogglePhaseFilter}
            onResetFilters={handleResetFilters}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
          />
        ) : (
          /* Milestone Schedule Table */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Table Header Banner */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Master Construction Activity Schedule</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    19 Activities
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audited against Schedule of Values and General Contractor weekly inspection reports
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span>Final Target: <strong className="text-slate-800 font-bold">May – June 2027</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenScheduleDoc}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>View Schedule PDF</span>
                </button>
              </div>
            </div>

            {/* The 19 Construction Activities Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#1e3a5f] text-white font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Construction Activity</th>
                    <th className="py-3 px-3">Line Item</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 whitespace-nowrap">Target</th>
                    <th className="py-3 px-4">Notes & Inspection Signoff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {(CONTROL_CENTER_AMOUNT_ORIGINS.completion_timeline?.components || [])
                    .filter((item) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        item.name.toLowerCase().includes(q) ||
                        item.code?.toLowerCase().includes(q) ||
                        item.amountFormatted.toLowerCase().includes(q)
                      );
                    })
                    .map((item, idx) => {
                      const isCompleted = item.amountFormatted === "Completed";
                      const isInProgress = item.amountFormatted === "In Progress";
                      const isTarget = item.amountFormatted === "Target";

                      return (
                        <tr
                          key={item.id}
                          className={cn(
                            "hover:bg-slate-50/80 transition-colors",
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          )}
                        >
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {item.name}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                            {item.code ? (
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 font-semibold">
                                {item.code}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isInProgress
                                  ? "bg-amber-100 text-amber-800"
                                  : isTarget
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-slate-100 text-slate-700"
                              )}
                            >
                              {item.amountFormatted}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                            {item.targetDate || "Completed"}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {item.notes || "—"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900 text-xs">
                  <tr>
                    <td colSpan={3} className="py-3 px-4">
                      Total: 19 Milestone Activities
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">Target: May – June 2027</td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 font-normal">
                      All activities tracked against General Contractor master milestone schedule
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Slide-Over Inspector Drawer */}
      <TaskDetailDrawer
        open={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        selectedDate={selectedDate}
        tasksOnDate={tasksOnSelectedDate}
        activeTaskId={activeTaskId}
        onSelectTask={(id) => setActiveTaskId(id)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onDeleteAllTasksOnDate={handleDeleteAllTasksOnDate}
        onCreateTaskOnDate={(date) => {
          setSelectedDate(date);
          setIsCreateTaskModalOpen(true);
        }}
      />

      {/* Create Field Task Modal */}
      <CreateFieldTaskModal
        open={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        defaultDate={selectedDate}
        projectId={currentProjectId}
        onCreateTask={handleCreateTask}
      />

      {/* Direct Interactive Document Preview Modal for Master Schedule */}
      <DocumentQuickPreviewModal
        document={previewDoc}
        open={isDocModalOpen}
        onOpenChange={setIsDocModalOpen}
        currentProjectId={currentProjectId}
      />
    </div>
  );
}
