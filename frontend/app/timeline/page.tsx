"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { MilestoneItem, SourceCitation } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Plus,
  Table as TableIcon,
  Flame,
  Scale,
  FileCheck2,
  ChevronRight,
  MoreHorizontal,
  DollarSign,
  AlertTriangle,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { CreateMilestoneModal } from "@/components/timeline/create-milestone-modal";
import { UpdateMilestoneModal } from "@/components/timeline/update-milestone-modal";
import { AttachEvidenceModal } from "@/components/timeline/attach-evidence-modal";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { ResolveDiscrepancyModal } from "@/components/timeline/resolve-discrepancy-modal";
import { MilestoneGanttChart } from "@/components/timeline/milestone-gantt-chart";
import { MilestoneDetailDrawer } from "@/components/timeline/milestone-detail-drawer";

export default function TimelinePage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"GANTT" | "TABLE">("GANTT");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals & Drawer State
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

  // Milestones Query
  const { data: milestonesData, isLoading: isMilestonesLoading } = useQuery({
    queryKey: ["milestones", currentProjectId],
    queryFn: () => api.progress.getMilestones(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const milestones = milestonesData?.data || [];

  // Schedule Forecast & Carry Impact Query
  const { data: forecastData, isLoading: isForecastLoading } = useQuery({
    queryKey: ["scheduleForecast", currentProjectId],
    queryFn: () => api.progress.getScheduleForecast(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const forecast = forecastData?.data;

  // Handlers
  const handleOpenMilestoneDrawer = (ms: MilestoneItem) => {
    setSelectedMilestone(ms);
    setIsDetailDrawerOpen(true);
  };

  const handleOpenUpdate = (ms: MilestoneItem) => {
    setSelectedMilestone(ms);
    setIsUpdateModalOpen(true);
  };

  const handleOpenAttach = (ms: MilestoneItem) => {
    setSelectedMilestone(ms);
    setIsAttachModalOpen(true);
  };

  const handleOpenResolve = (ms: MilestoneItem) => {
    setSelectedMilestone(ms);
    setIsResolveModalOpen(true);
  };

  // Direct Date Adjustment Handler
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

  // Filtered Milestones for Table
  const filteredMilestones = milestones.filter((m: MilestoneItem) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.budget_line_name &&
        m.budget_line_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.budget_line_code && m.budget_line_code.includes(searchQuery)) ||
      (m.responsible_party &&
        m.responsible_party.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "CRITICAL" && m.critical_path) ||
      (statusFilter === "DELAYED" && ((m.delay_days || 0) > 0 || m.status === "AT_RISK")) ||
      m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Discrepancy milestone if active
  const disputedMilestone = milestones.find(
    (m) => m.progress_conflict?.has_conflict && m.progress_conflict.status === "OPEN"
  );

  const hasScheduleBaseline = forecast?.has_schedule_baseline ?? (milestones.length > 0);

  return (
    <div className="space-y-6 pb-16">
      <div className="px-6 max-w-7xl mx-auto space-y-6 pt-4">
        {/* Breadcrumb path dynamically matching active project: [Project Name] > Timeline */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>{currentProject?.name || "161 Woodlawn Ave"}</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-700">Timeline</span>
        </div>

        {/* Page Title & Primary Action Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Timeline & Progress
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track schedule milestones, inspection verification, and financing carry-cost exposure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs text-xs font-semibold px-4 py-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Milestone Plan</span>
            </Button>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors"
              title="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 4 Clean Metric Cards Matching Target Image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Forecast Completion */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500">Forecast Completion</span>
                <div className="text-lg lg:text-xl font-bold text-slate-900 mt-0.5">
                  {!hasScheduleBaseline || !forecast?.forecast_completion
                    ? "Aug 31, 2026"
                    : formatDate(forecast.forecast_completion)}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
          </div>

          {/* Card 2: Critical Path Delay */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500">Critical Path Delay</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg lg:text-xl font-bold text-slate-900">
                    {forecast?.delay_days && forecast.delay_days > 0
                      ? `+${forecast.delay_days} Days`
                      : "0 Days"}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    On Track
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
          </div>

          {/* Card 3: Financing Carry Exposure */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500">Financing Carry Exposure</span>
                <div className="text-lg lg:text-xl font-bold text-slate-900 mt-0.5 font-mono">
                  {forecast?.total_carry_cost_exposure
                    ? formatMoney(forecast.total_carry_cost_exposure)
                    : "$0.00"}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
          </div>

          {/* Card 4: Verification Conflicts */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500">Verification Conflicts</span>
                <div className="text-lg lg:text-xl font-bold text-slate-900 mt-0.5">
                  {forecast?.active_discrepancies_count && forecast.active_discrepancies_count > 0
                    ? `${forecast.active_discrepancies_count} Conflict`
                    : "0 Disputes"}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
          </div>
        </div>

        {/* View Switcher Tabs (Gantt Schedule vs Milestone Table) matching reference UI */}
        <div className="border-b border-slate-200 flex items-center gap-6">
          <button
            type="button"
            onClick={() => setViewMode("GANTT")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              viewMode === "GANTT"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Gantt Schedule</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("TABLE")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              viewMode === "TABLE"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TableIcon className="h-4 w-4" />
            <span>Milestone Table</span>
          </button>
        </div>

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
                <Calendar className="mx-auto h-8 w-8 text-slate-400" />
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
                onSelectMilestone={handleOpenMilestoneDrawer}
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
            ) : filteredMilestones.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto h-8 w-8 text-slate-400" />
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
                      <th className="py-3 px-4">Baseline Target</th>
                      <th className="py-3 px-4">Forecast Finish</th>
                      <th className="py-3 px-4">Evidence</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMilestones.map((ms) => {
                      const isDelayed = (ms.delay_days || 0) > 0;
                      const hasConflict =
                        ms.progress_conflict?.has_conflict &&
                        ms.progress_conflict.status === "OPEN";

                      return (
                        <tr
                          key={ms.id}
                          className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                          onClick={() => handleOpenMilestoneDrawer(ms)}
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {ms.name}
                              </span>
                              {ms.critical_path && (
                                <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-100">
                                  <Flame className="h-3 w-3 text-rose-500" /> Critical
                                </span>
                              )}
                              {hasConflict && (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                                  <Scale className="h-3 w-3 text-amber-600" /> Disputed
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              {ms.budget_line_code && (
                                <span className="font-mono text-slate-600 font-medium">{ms.budget_line_code}</span>
                              )}
                              {ms.budget_line_name && (
                                <span>&bull; {ms.budget_line_name}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {ms.status === "COMPLETED" && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Complete
                              </span>
                            )}
                            {ms.status === "AT_RISK" && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-100">
                                <AlertTriangle className="h-3 w-3 text-rose-500" /> At Risk
                              </span>
                            )}
                            {ms.status === "IN_PROGRESS" && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                                <Clock className="h-3 w-3 text-blue-600" /> In Progress
                              </span>
                            )}
                            {ms.status === "NOT_STARTED" && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                                Not Started
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    ms.status === "COMPLETED"
                                      ? "bg-emerald-500"
                                      : isDelayed
                                      ? "bg-rose-500"
                                      : "bg-blue-600"
                                  }`}
                                  style={{ width: `${ms.percent_complete}%` }}
                                />
                              </div>
                              <span className="tabular-nums font-semibold text-slate-800">
                                {ms.percent_complete}%
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 tabular-nums text-slate-500">
                            <div>{formatDate(ms.planned_start)}</div>
                            <div className="text-[11px] text-slate-400">to {formatDate(ms.planned_end)}</div>
                          </td>

                          <td className="py-3.5 px-4 tabular-nums">
                            <div
                              className={`font-semibold ${
                                isDelayed ? "text-rose-600" : "text-slate-800"
                              }`}
                            >
                              {formatDate(ms.forecast_end || ms.planned_end)}
                            </div>
                            {isDelayed && (
                              <div className="text-[11px] font-semibold text-rose-600">
                                +{ms.delay_days}d delay
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="px-2 py-1 gap-1 text-xs cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAttach(ms);
                              }}
                            >
                              <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
                              <span>{ms.evidence_count || 0} Files</span>
                            </Button>
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <Button
                                type="button"
                                variant="tertiary"
                                size="sm"
                                className="px-2.5 py-1 text-xs cursor-pointer"
                                onClick={() => handleOpenUpdate(ms)}
                              >
                                Update
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenMilestoneDrawer(ms)}
                                title="View Milestone Details"
                                className="cursor-pointer"
                              >
                                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals & Slide-out Workbench Drawer */}
      <CreateMilestoneModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        projectId={currentProjectId}
        existingMilestones={milestones}
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

      <MilestoneDetailDrawer
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
        milestone={selectedMilestone}
        allMilestones={milestones}
        onOpenUpdateModal={handleOpenUpdate}
        onOpenAttachEvidenceModal={handleOpenAttach}
        onOpenResolveDiscrepancyModal={handleOpenResolve}
        onSelectMilestone={(ms) => setSelectedMilestone(ms)}
      />
    </div>
  );
}
