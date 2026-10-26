"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Search,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
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

  const params = useParams();
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
      : `/timeline/${newTask.date}?taskId=${newTask.id}`;
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
      : `/timeline/${dateStr}`;
    router.push(targetUrl);
  };

  // Click on any task pill opens the new page in the platform with that task focused
  const handleSelectTask = (taskId: string) => {
    setActiveTaskId(taskId);
    const task = constructionTasks.find((t) => t.id === taskId);
    const targetDate = task ? task.date : selectedDate;
    const targetUrl = currentProjectId
      ? `/projects/${currentProjectId}/timeline/${targetDate}?taskId=${taskId}`
      : `/timeline/${targetDate}?taskId=${taskId}`;
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



        {/* Toolbar: Calendar View Badge + Month Nav + Search + View Dropdown (Gantt & Table removed) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/90 px-4 py-2.5 shadow-2xs">
          {/* Left: Calendar View Active Badge */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Calendar View</span>
            </div>
          </div>

          {/* Middle: Date Navigation (Today, < >, October 2026) */}
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

          {/* Right: Search Input & View Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search site work, trades, tasks..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <Select defaultValue="Month">
              <SelectTrigger className="w-[120px] h-8 text-xs font-semibold">
                <SelectValue placeholder="Month View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Month">Month View</SelectItem>
                <SelectItem value="Week">Week View</SelectItem>
                <SelectItem value="Day">Day View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exclusive Calendar View */}
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
    </div>
  );
}
