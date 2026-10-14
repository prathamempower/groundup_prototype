"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MilestoneItem } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Table as TableIcon,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  DollarSign,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Menu,
  Search,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { CreateMilestoneModal } from "@/components/timeline/create-milestone-modal";
import { UpdateMilestoneModal } from "@/components/timeline/update-milestone-modal";
import { AttachEvidenceModal } from "@/components/timeline/attach-evidence-modal";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { ResolveDiscrepancyModal } from "@/components/timeline/resolve-discrepancy-modal";
import { MilestoneGanttChart } from "@/components/timeline/milestone-gantt-chart";
import { MilestoneDetailDrawer } from "@/components/timeline/milestone-detail-drawer";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  ConstructionTask,
  INITIAL_CONSTRUCTION_TASKS,
  getStoredConstructionTasks,
  saveStoredConstructionTasks,
} from "@/lib/data/construction-calendar-data";
import { TimelineCalendarView } from "@/components/timeline/timeline-calendar-view";
import { TaskDetailDrawer } from "@/components/timeline/task-detail-drawer";
import { CreateFieldTaskModal } from "@/components/timeline/create-field-task-modal";

export default function TimelinePage() {
  const queryClient = useQueryClient();

  // Primary view mode matching target UI: CALENDAR is active by default
  const [viewMode, setViewMode] = useState<"CALENDAR" | "GANTT" | "TABLE">("CALENDAR");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeTradeFilter, setActiveTradeFilter] = useState("");
  const [activePhaseFilters, setActivePhaseFilters] = useState<Record<string, boolean>>({
    excavation: true,
    foundation: true,
    framing: true,
    mep: true,
    critical: true,
  });

  // Construction Calendar Tasks State
  const [constructionTasks, setConstructionTasks] = useState<ConstructionTask[]>(INITIAL_CONSTRUCTION_TASKS);
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-14");
  const [activeTaskId, setActiveTaskId] = useState<string | null>("task-oct-14-2");
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // Milestone Modals & Drawer State (for Gantt / Table views)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // Active Project Query
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const routeProjectId = typeof window !== "undefined"
    ? (window.location.pathname.match(/^\/projects\/([^\/]+)/)?.[1] || "")
    : "";
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
    setIsTaskDrawerOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setConstructionTasks((prev) => {
      const next = prev.filter((t) => t.id !== taskId);
      saveStoredConstructionTasks(currentProjectId || "default", next);
      return next;
    });
    setIsTaskDrawerOpen(false);
  };

  // Click on any date opens the task allocated on that date
  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const tasksForDate = constructionTasks.filter((t) => t.date === dateStr);
    if (tasksForDate.length > 0) {
      setActiveTaskId(tasksForDate[0].id);
    } else {
      setActiveTaskId(null);
    }
    setIsTaskDrawerOpen(true);
  };

  const handleSelectTask = (taskId: string) => {
    setActiveTaskId(taskId);
    const task = constructionTasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedDate(task.date);
    }
    setIsTaskDrawerOpen(true);
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

  // Milestones Query (for Gantt and KPI cards)
  const { data: milestonesData, isLoading: isMilestonesLoading } = useQuery({
    queryKey: ["milestones", currentProjectId],
    queryFn: () => api.progress.getMilestones(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const milestones = milestonesData?.data || [];

  // Schedule Forecast & Carry Impact Query
  const { data: forecastData } = useQuery({
    queryKey: ["scheduleForecast", currentProjectId],
    queryFn: () => api.progress.getScheduleForecast(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const forecast = forecastData?.data;

  // Direct Date Adjustment Handler for Gantt
  const handleUpdateMilestoneDate = async (
    ms: MilestoneItem,
    newForecastEnd: string,
    reason?: string
  ) => {
    await api.progress.updateMilestone(ms.id, {
      forecast_end: newForecastEnd,
      update_rationale: reason || "Date adjusted via interactive schedule controls",
    });

    await queryClient.invalidateQueries({ queryKey: ["milestones", currentProjectId] });
    await queryClient.invalidateQueries({ queryKey: ["scheduleForecast", currentProjectId] });
    await queryClient.invalidateQueries({ queryKey: ["projectDashboard", currentProjectId] });
  };

  const tasksOnSelectedDate = constructionTasks.filter((t) => t.date === selectedDate);

  // Count active delayed tasks to reflect on KPI cards
  const delayedTasksCount = constructionTasks.filter((t) => t.is_delayed).length;

  return (
    <div className="space-y-5 pb-16 min-h-screen bg-slate-50/30">
      <div className="px-4 sm:px-6 max-w-[1600px] mx-auto space-y-4 pt-3">
        {/* Top Header matching Screenshot 1: Brand Logo + Project + 4 KPI Cards + Client View + User Profile */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
          {/* Brand & Project Info */}
          <div className="flex items-center gap-3 shrink-0">
            <BrandLogo size="md" showSubtitle={false} />
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 border border-blue-200/70">
              CONSTRUCTION APP
            </span>
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <span className="text-[11px] font-medium text-slate-400 block">Project:</span>
              <span className="text-xs font-bold text-slate-900 truncate block max-w-[200px]">
                {projectName}
              </span>
            </div>
          </div>

          {/* 4 Clean Metric Cards Matching Screenshot 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 flex-1 max-w-4xl">
            {/* Card 1: Forecast Completion */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <CalendarIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  Forecast Completion
                </span>
                <span className="text-xs font-extrabold text-slate-900 block truncate">
                  {forecast?.forecast_completion ? formatDate(forecast.forecast_completion) : "Mar 31, 2026"}
                </span>
              </div>
            </div>

            {/* Card 2: Critical Path Delay */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  Critical Path Delay
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-extrabold text-slate-900">
                    {delayedTasksCount > 0 ? `+${delayedTasksCount * 2} Days` : "0 Days"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.25 text-[9px] font-bold ${
                      delayedTasksCount > 0
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {delayedTasksCount > 0 ? "At Risk" : "On Track"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Financing Carry Exposure */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  Carry Exposure
                </span>
                <span className="text-xs font-extrabold text-slate-900 block truncate font-mono">
                  {forecast?.total_carry_cost_exposure
                    ? formatMoney(forecast.total_carry_cost_exposure)
                    : "$0.00"}
                </span>
              </div>
            </div>

            {/* Card 4: Verification Conflicts */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  Verification Conflicts
                </span>
                <span className="text-xs font-extrabold text-slate-900 block truncate">
                  {forecast?.active_discrepancies_count && forecast.active_discrepancies_count > 0
                    ? `${forecast.active_discrepancies_count} Disputes`
                    : "0 Disputes"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Client Live View + User Profile Badge */}
          <div className="flex items-center gap-3 shrink-0 justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Client Live View</span>
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
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

        {/* Toolbar matching Screenshot 1: Hamburger + View Tabs + Date Nav + Search + View Dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/90 px-4 py-2.5 shadow-2xs">
          {/* Left: Hamburger & View Mode Switcher Tabs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("GANTT")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "GANTT"
                    ? "bg-white text-blue-600 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Gantt Schedule</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "TABLE"
                    ? "bg-white text-blue-600 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span>Milestone Table</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("CALENDAR")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "CALENDAR"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Calendar View</span>
              </button>
            </div>
          </div>

          {/* Middle: Date Navigation (Today, < >, October 2026) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedDate("2026-10-14");
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              October 2026
            </h2>
          </div>

          {/* Right: Search Input & View Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative w-56 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search site work, trades, tasks..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <select
              defaultValue="Month"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="Month">Month</option>
              <option value="Week">Week</option>
              <option value="Day">Day</option>
            </select>
          </div>
        </div>

        {/* Main View Area */}
        {viewMode === "CALENDAR" && (
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
          />
        )}

        {/* Gantt Schedule Component */}
        {viewMode === "GANTT" && (
          <div>
            {isMilestonesLoading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-7 w-28 rounded-md" />
                </div>
                <div className="space-y-3 pt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-36" />
                      <div className="flex-1">
                        <Skeleton className="h-6 rounded-md" style={{ width: `${30 + i * 12}%`, marginLeft: `${i * 8}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : milestones.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <CalendarIcon className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-800">
                  No milestones found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Create milestone plan items to generate the schedule Gantt chart.
                </p>
              </div>
            ) : (
              <MilestoneGanttChart
                milestones={milestones}
                onSelectMilestone={(m) => {
                  setSelectedMilestone(m);
                  setIsDetailDrawerOpen(true);
                }}
                selectedMilestoneId={selectedMilestone?.id}
                onUpdateMilestoneDate={handleUpdateMilestoneDate}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* Milestone Schedule Table */}
        {viewMode === "TABLE" && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            {isMilestonesLoading ? (
              <div className="p-4">
                <SkeletonTable rows={5} columns={6} />
              </div>
            ) : milestones.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarIcon className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-800">
                  No matching milestones
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search query or filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-5">Milestone & Scope</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Progress</th>
                      <th className="py-3 px-4">Forecast End</th>
                      <th className="py-3 px-4">Responsible Party</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {milestones.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900">
                          {m.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              m.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700"
                                : m.status === "DELAYED"
                                ? "bg-red-50 text-red-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {m.percent_complete}%
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          {formatDate(m.forecast_end)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {m.responsible_party || "Site Team"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedMilestone(m);
                              setIsDetailDrawerOpen(true);
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Slide-Over Inspector Drawer matching Screenshot 2 */}
      <TaskDetailDrawer
        open={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        selectedDate={selectedDate}
        tasksOnDate={tasksOnSelectedDate}
        activeTaskId={activeTaskId}
        onSelectTask={(id) => setActiveTaskId(id)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
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

      {/* Milestone Modals for Gantt/Table compatibility */}
      {isCreateModalOpen && (
        <CreateMilestoneModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          projectId={currentProjectId}
          existingMilestones={milestones}
        />
      )}

      {selectedMilestone && (
        <>
          <MilestoneDetailDrawer
            open={isDetailDrawerOpen}
            onOpenChange={setIsDetailDrawerOpen}
            milestone={selectedMilestone}
            allMilestones={milestones}
            onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
            onOpenAttachEvidenceModal={() => setIsAttachModalOpen(true)}
            onOpenResolveDiscrepancyModal={() => setIsResolveModalOpen(true)}
            onSelectMilestone={(ms) => setSelectedMilestone(ms)}
          />

          <UpdateMilestoneModal
            open={isUpdateModalOpen}
            onOpenChange={setIsUpdateModalOpen}
            milestone={selectedMilestone}
            projectId={currentProjectId}
          />

          <AttachEvidenceModal
            open={isAttachModalOpen}
            onOpenChange={setIsAttachModalOpen}
            milestone={selectedMilestone}
            projectId={currentProjectId}
          />

          <ResolveDiscrepancyModal
            open={isResolveModalOpen}
            onOpenChange={setIsResolveModalOpen}
            milestone={selectedMilestone}
            projectId={currentProjectId}
          />
        </>
      )}
    </div>
  );
}
