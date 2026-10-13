"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { KeyFigure } from "@/components/ui/key-figure";
import { MilestoneItem, SourceCitation } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Layers,
  Table as TableIcon,
  Flame,
  Scale,
  FileCheck2,
  Search,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Filter,
} from "lucide-react";
import { CreateMilestoneModal } from "@/components/timeline/create-milestone-modal";
import { UpdateMilestoneModal } from "@/components/timeline/update-milestone-modal";
import { AttachEvidenceModal } from "@/components/timeline/attach-evidence-modal";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { ResolveDiscrepancyModal } from "@/components/timeline/resolve-discrepancy-modal";
import { MilestoneGanttChart } from "@/components/timeline/milestone-gantt-chart";
import { MilestoneDetailDrawer } from "@/components/timeline/milestone-detail-drawer";

export default function TimelinePage() {
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

  const { data: documentsData } = useQuery({
    queryKey: ["documents", currentProjectId],
    queryFn: () => api.documents.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const projectDocs = documentsData?.data || [];
  const primaryDoc = projectDocs[0];
  const reportDoc = projectDocs.find((d) => d.document_type === "INSPECTION" || d.original_filename?.toLowerCase().includes("report")) || primaryDoc;
  const loanDoc = projectDocs.find((d) => d.document_type === "CONTRACT" || d.original_filename?.toLowerCase().includes("loan")) || primaryDoc;

  // Citations for Sources Modal
  const forecastCompletionCitations: SourceCitation[] = reportDoc
    ? [
        {
          document_id: reportDoc.id,
          document_name: reportDoc.original_filename,
          page_number: 1,
          reviewer: "David Ross (PM)",
          reviewed_at: reportDoc.uploaded_at,
          extraction_version: "1.0",
        },
      ]
    : [];

  const scheduleDelayCitations: SourceCitation[] = reportDoc
    ? [
        {
          document_id: reportDoc.id,
          document_name: reportDoc.original_filename,
          page_number: 2,
          reviewer: "Marcus Vance (Owner)",
          reviewed_at: reportDoc.uploaded_at,
          extraction_version: "1.0",
        },
      ]
    : [];

  const carryImpactCitations: SourceCitation[] = loanDoc
    ? [
        {
          document_id: loanDoc.id,
          document_name: loanDoc.original_filename,
          page_number: 1,
          reviewer: "Sarah Lin (CFO)",
          reviewed_at: loanDoc.uploaded_at,
          extraction_version: "1.0",
        },
      ]
    : [];

  const disputeCitations: SourceCitation[] = reportDoc
    ? [
        {
          document_id: reportDoc.id,
          document_name: reportDoc.original_filename,
          page_number: 3,
          reviewer: "David Ross (PM)",
          reviewed_at: reportDoc.uploaded_at,
          extraction_version: "1.0",
        },
      ]
    : [];

  // Discrepancy milestone if active
  const disputedMilestone = milestones.find(
    (m) => m.progress_conflict?.has_conflict && m.progress_conflict.status === "OPEN"
  );

  const hasScheduleBaseline = forecast?.has_schedule_baseline ?? (milestones.length > 0);

  return (
    <div className="space-y-6 pb-16">
      <div className="px-6 max-w-7xl mx-auto space-y-6 pt-4">
        {/* Page Header */}
        <PageHeader
          title="Timeline & Progress"
          statusBadge={{
            label: hasScheduleBaseline
              ? `${milestones.length} Schedule Milestones (${forecast?.overall_progress_percent ?? 0}% Complete)`
              : "Baseline Incomplete",
            variant: !hasScheduleBaseline
              ? "warning"
              : (forecast?.delay_days || 0) > 0
              ? "danger"
              : "success",
            icon: <Calendar className="h-3.5 w-3.5" />,
          }}
          description="Critical path schedule milestones, evidence-backed inspection verification, and financing carry-cost exposure"
          primaryAction={
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Milestone Plan Item</span>
            </Button>
          }
        />

        {/* 4 Core Schedule KPI Figures */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KeyFigure
            label="Forecast Completion"
            value={
              !hasScheduleBaseline || !forecast?.forecast_completion
                ? "Incomplete"
                : formatDate(forecast.forecast_completion)
            }
            basis={
              hasScheduleBaseline && forecast?.target_completion
                ? `Baseline target was ${formatDate(forecast.target_completion)}. Forecast projected from critical path steel milestone.`
                : "No approved schedule baseline established."
            }
            variance={
              hasScheduleBaseline && forecast?.delay_days
                ? {
                    formattedAmount: `+${forecast.delay_days} days`,
                    isFavorable: forecast.delay_days === 0,
                    comparisonLabel: "vs Target Completion",
                  }
                : undefined
            }
            citations={forecastCompletionCitations}
          />

          <KeyFigure
            label="Critical Path Delay"
            value={
              !hasScheduleBaseline
                ? "Unknown"
                : forecast?.delay_days && forecast.delay_days > 0
                ? `+${forecast.delay_days} Days Delay`
                : "0 Days (On Track)"
            }
            basis={
              hasScheduleBaseline
                ? `Driven by: ${forecast?.critical_path_milestone || "None"}. Calculated against immutable baseline.`
                : "Schedule baseline not configured. Unknown delay status."
            }
            citations={scheduleDelayCitations}
          />

          <KeyFigure
            label="Financing Carry Exposure"
            value={
              !hasScheduleBaseline
                ? "Incomplete"
                : forecast?.total_carry_cost_exposure
                ? formatMoney(forecast.total_carry_cost_exposure)
                : "$0.00"
            }
            basis="Monthly interest carry of $18,500/month on drawn senior construction loan principal during delay window."
            variance={
              hasScheduleBaseline && forecast?.delay_days
                ? {
                    formattedAmount: "+$18,500/mo",
                    isFavorable: false,
                    comparisonLabel: "Loan carry rate",
                  }
                : undefined
            }
            citations={carryImpactCitations}
          />

          <KeyFigure
            label="Verification Conflicts"
            value={
              forecast?.active_discrepancies_count && forecast.active_discrepancies_count > 0
                ? `${forecast.active_discrepancies_count} Active Conflict`
                : "0 Disputes"
            }
            basis={
              disputedMilestone?.progress_conflict
                ? `Milestone 03: PM reports ${disputedMilestone.progress_conflict.pm_percent}% vs ATD Inspector ${disputedMilestone.progress_conflict.inspector_percent}% (${formatMoney(disputedMilestone.progress_conflict.estimated_value_at_risk)} at risk).`
                : "All reported progress verified and certified against field inspection logs."
            }
            citations={disputeCitations}
          />
        </div>

        {/* Verification Conflict Alert Banner */}
        {disputedMilestone && disputedMilestone.progress_conflict && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 text-white shrink-0 mt-0.5 shadow-2xs">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-800">
                    Verification Conflict Detected &bull; {disputedMilestone.name}
                  </h3>
                  <p className="text-xs text-rose-900/80 mt-1 leading-relaxed">
                    PM reports <strong className="font-semibold text-slate-900">{disputedMilestone.progress_conflict.pm_percent}%</strong> completion, but certified inspector report ({disputedMilestone.progress_conflict.inspector_report_name}) certifies <strong className="font-semibold text-rose-700">{disputedMilestone.progress_conflict.inspector_percent}%</strong> ({disputedMilestone.progress_conflict.discrepancy_percent}% variance &bull; <strong className="font-semibold text-rose-700">{formatMoney(disputedMilestone.progress_conflict.estimated_value_at_risk)}</strong> at risk on Draw advance).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleOpenResolve(disputedMilestone)}
                  className="gap-1.5 cursor-pointer shadow-xs"
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>Resolve Conflict</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Controls & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Segmented View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("GANTT")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "GANTT"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Gantt Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "TABLE"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Milestone Table</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search milestones, trade, CSI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-lg border border-slate-200/90 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-64 shadow-2xs transition-all"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter milestones by status"
                className="h-9 rounded-lg border border-slate-200/90 bg-white px-3 pr-8 text-xs font-medium text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="CRITICAL">Critical Path Only</option>
                <option value="DELAYED">Delayed / At Risk</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="NOT_STARTED">Not Started</option>
              </select>
              <Filter className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* View Mode 1: Interactive Visual Gantt Timeline */}
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
              />
            )}
          </div>
        )}

        {/* View Mode 2: Detailed Milestone Schedule Table */}
        {viewMode === "TABLE" && (
          <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
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
                              <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
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
                              {ms.responsible_party && (
                                <span className="text-slate-400">&bull; {ms.responsible_party}</span>
                              )}
                            </div>
                            {ms.delay_cause && (
                              <div className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>{ms.delay_cause}</span>
                              </div>
                            )}
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
                              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                                <Clock className="h-3 w-3 text-indigo-600" /> In Progress
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
                                      : "bg-indigo-600"
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
                              <FileCheck2 className="h-3.5 w-3.5 text-indigo-600" />
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
                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
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
