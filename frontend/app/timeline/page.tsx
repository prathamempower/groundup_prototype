"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { KeyFigure } from "@/components/ui/key-figure";
import { MilestoneItem, SourceCitation } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Layers,
  Table as TableIcon,
  Flame,
  Scale,
  FileCheck,
  Search,
  ArrowRight,
  FileText,
  Camera,
  ExternalLink,
} from "lucide-react";
import { CreateMilestoneModal } from "@/components/timeline/create-milestone-modal";
import { UpdateMilestoneModal } from "@/components/timeline/update-milestone-modal";
import { AttachEvidenceModal } from "@/components/timeline/attach-evidence-modal";
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

  const currentProjectId =
    projectsData?.data?.current_project_id || "";
  const currentProject = projectsData?.data?.projects?.find(
    (p) => p.id === currentProjectId
  );

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
  const filteredMilestones = milestones.filter((m) => {
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

  // Citations for Sources Modal
  const forecastCompletionCitations: SourceCitation[] = [
    {
      document_id: "doc_73_sched_01",
      document_name: "73_Broadway_Master_CPM_Schedule_Revision_3.pdf",
      page_number: 4,
      reviewer: "David Ross (PM)",
      reviewed_at: "2025-09-18T16:00:00Z",
      extraction_version: "v2.1",
    },
    {
      document_id: "doc_73_steel_memo",
      document_name: "Atlantic_Iron_Works_Fabrication_Delay_Notice.pdf",
      page_number: 1,
      reviewer: "Frank Miller (GC)",
      reviewed_at: "2025-09-10T11:30:00Z",
      extraction_version: "v1.0",
    },
  ];

  const scheduleDelayCitations: SourceCitation[] = [
    {
      document_id: "doc_73_cpm_baseline",
      document_name: "Initial_Approved_Milestone_Baseline.pdf",
      page_number: 2,
      reviewer: "Marcus Vance (Owner)",
      reviewed_at: "2025-03-25T14:00:00Z",
      extraction_version: "v1.0",
    },
  ];

  const carryImpactCitations: SourceCitation[] = [
    {
      document_id: "doc_73_loan_columbia",
      document_name: "Columbia_Bank_Construction_Loan_Agreement.pdf",
      page_number: 12,
      reviewer: "Sarah Lin (CFO)",
      reviewed_at: "2025-04-02T10:00:00Z",
      extraction_version: "v1.0",
    },
  ];

  const disputeCitations: SourceCitation[] = [
    {
      document_id: "doc_73_insp_03",
      document_name: "73_Broadway_Draw_3_Lender_Inspection_Report.pdf",
      page_number: 3,
      reviewer: "ATD Certified Inspector",
      reviewed_at: "2025-09-15T09:30:00Z",
      extraction_version: "v1.2",
    },
  ];

  // Discrepancy milestone if active
  const disputedMilestone = milestones.find(
    (m) => m.progress_conflict?.has_conflict && m.progress_conflict.status === "OPEN"
  );

  const hasScheduleBaseline = forecast?.has_schedule_baseline ?? (milestones.length > 0);

  return (
    <div className="space-y-6 pb-16">
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
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Create Milestone Plan Item
          </button>
        }
      />

      <div className="px-6 max-w-7xl mx-auto space-y-6">
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
            label="Critical Path Schedule Delay"
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
            basis="Monthly interest carry of $18,500/month on drawn senior construction loan principal during 45-day delay window."
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

        {/* Progress Dispute Conflict Banner */}
        {disputedMilestone && disputedMilestone.progress_conflict && (
          <div className="rounded-lg border border-danger/40 bg-danger-subtle/60 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-danger text-white flex-shrink-0 mt-0.5">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-danger">
                    Progress Verification Conflict Detected: {disputedMilestone.name}
                  </h3>
                  <p className="text-caption text-text-secondary mt-0.5">
                    PM reports <strong className="text-text-primary">{disputedMilestone.progress_conflict.pm_percent}%</strong> completion, but third-party certified inspector report ({disputedMilestone.progress_conflict.inspector_report_name}) certifies <strong className="text-danger">{disputedMilestone.progress_conflict.inspector_percent}%</strong> ({disputedMilestone.progress_conflict.discrepancy_percent}% variance &bull; <strong className="text-danger">{formatMoney(disputedMilestone.progress_conflict.estimated_value_at_risk)}</strong> at risk on Draw #3 advance).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenResolve(disputedMilestone)}
                  className="flex items-center gap-1.5 rounded-md bg-danger px-4 py-2 text-caption font-semibold text-white hover:bg-danger/90 shadow-xs"
                >
                  <Scale className="h-4 w-4" />
                  Resolve Verification Dispute
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unknown Schedule Warning (if project has no baseline) */}
        {!hasScheduleBaseline && (
          <div className="rounded-lg border border-warning/40 bg-warning-subtle/50 p-6 text-center space-y-3">
            <Calendar className="mx-auto h-8 w-8 text-warning" />
            <div>
              <h3 className="text-section font-semibold text-text-primary">
                Schedule Baseline Incomplete
              </h3>
              <p className="text-body text-text-secondary max-w-lg mx-auto mt-1">
                This project does not yet have an approved milestone schedule baseline. Create milestone items to track physical completion, critical path delays, and financing carry exposure.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Initialize Milestone Plan
            </button>
          </div>
        )}

        {/* View Controls & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-subtle p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setViewMode("GANTT")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-caption font-medium transition-colors ${
                viewMode === "GANTT"
                  ? "bg-surface text-text-primary shadow-xs font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Layers className="h-4 w-4" />
              Visual Timeline (Gantt)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-caption font-medium transition-colors ${
                viewMode === "TABLE"
                  ? "bg-surface text-text-primary shadow-xs font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <TableIcon className="h-4 w-4" />
              Milestone Schedule Table
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search milestones, CSI code, trade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-md border border-border bg-surface pl-9 pr-3 py-1.5 text-body text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical Path Only</option>
              <option value="DELAYED">Delayed / At Risk</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>
          </div>
        </div>

        {/* View Mode 1: Interactive Visual Gantt Timeline */}
        {viewMode === "GANTT" && (
          <div>
            {isMilestonesLoading ? (
              <div className="rounded-lg border border-border bg-surface p-12 text-center text-body text-text-muted">
                Loading visual timeline...
              </div>
            ) : milestones.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface p-12 text-center">
                <Calendar className="mx-auto h-8 w-8 text-text-muted" />
                <h3 className="mt-2 text-section font-semibold text-text-primary">
                  No milestones found
                </h3>
                <p className="mt-1 text-body text-text-secondary">
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
          <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
            {isMilestonesLoading ? (
              <div className="p-8 text-center text-body text-text-muted">
                Loading milestone schedule...
              </div>
            ) : filteredMilestones.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto h-8 w-8 text-text-muted" />
                <h3 className="mt-2 text-section font-semibold text-text-primary">
                  No matching milestones
                </h3>
                <p className="mt-1 text-body text-text-secondary">
                  Try adjusting your search query or filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body">
                  <thead>
                    <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
                      <th className="py-3 px-4">Milestone & Scope</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Progress %</th>
                      <th className="py-3 px-4">Planned Baseline</th>
                      <th className="py-3 px-4">Forecast Finish</th>
                      <th className="py-3 px-4">Evidence</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMilestones.map((ms) => {
                      const isDelayed = (ms.delay_days || 0) > 0;
                      const hasConflict =
                        ms.progress_conflict?.has_conflict &&
                        ms.progress_conflict.status === "OPEN";

                      return (
                        <tr
                          key={ms.id}
                          className="hover:bg-subtle/30 transition-colors group cursor-pointer"
                          onClick={() => handleOpenMilestoneDrawer(ms)}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-text-primary">
                                {ms.name}
                              </span>
                              {ms.critical_path && (
                                <span className="inline-flex items-center gap-1 rounded bg-danger-subtle px-1.5 py-0.5 text-[10px] font-bold text-danger">
                                  <Flame className="h-3 w-3" /> Critical
                                </span>
                              )}
                              {hasConflict && (
                                <span className="inline-flex items-center gap-1 rounded bg-danger-subtle px-1.5 py-0.5 text-[10px] font-bold text-danger">
                                  <Scale className="h-3 w-3" /> Disputed
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-caption text-text-secondary">
                              {ms.budget_line_code && (
                                <span className="font-mono">{ms.budget_line_code}</span>
                              )}
                              {ms.budget_line_name && (
                                <span>&bull; {ms.budget_line_name}</span>
                              )}
                              {ms.responsible_party && (
                                <span className="text-text-muted">&bull; {ms.responsible_party}</span>
                              )}
                            </div>
                            {ms.delay_cause && (
                              <div className="text-caption text-danger flex items-center gap-1 mt-1 font-medium">
                                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{ms.delay_cause}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {ms.status === "COMPLETED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-[11px] font-semibold text-success">
                                <CheckCircle className="h-3 w-3" /> Completed
                              </span>
                            )}
                            {ms.status === "AT_RISK" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-danger-subtle px-2.5 py-0.5 text-[11px] font-semibold text-danger">
                                <AlertTriangle className="h-3 w-3" /> At Risk
                              </span>
                            )}
                            {ms.status === "IN_PROGRESS" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                                <Clock className="h-3 w-3" /> In Progress
                              </span>
                            )}
                            {ms.status === "NOT_STARTED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-0.5 text-[11px] font-semibold text-text-muted">
                                Not Started
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-subtle rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    ms.status === "COMPLETED"
                                      ? "bg-success"
                                      : isDelayed
                                      ? "bg-danger"
                                      : "bg-primary"
                                  }`}
                                  style={{ width: `${ms.percent_complete}%` }}
                                />
                              </div>
                              <span className="text-caption tabular-nums font-bold text-text-primary">
                                {ms.percent_complete}%
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 tabular-nums text-text-secondary text-caption">
                            <div>{formatDate(ms.planned_start)}</div>
                            <div className="text-text-muted">to {formatDate(ms.planned_end)}</div>
                          </td>

                          <td className="py-3.5 px-4 tabular-nums">
                            <div
                              className={`font-semibold ${
                                isDelayed ? "text-danger" : "text-text-primary"
                              }`}
                            >
                              {formatDate(ms.forecast_end || ms.planned_end)}
                            </div>
                            {isDelayed && (
                              <div className="text-[11px] font-bold text-danger">
                                +{ms.delay_days}d delay
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAttach(ms);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-subtle px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-subtle/80 hover:text-text-primary"
                            >
                              <FileCheck className="h-3 w-3 text-primary" />
                              <span>{ms.evidence_count || 0} Files</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleOpenUpdate(ms)}
                                className="rounded px-2.5 py-1 text-caption font-medium text-primary hover:bg-primary-subtle transition-colors"
                              >
                                Update
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenMilestoneDrawer(ms)}
                                className="rounded p-1 text-text-muted hover:text-text-primary hover:bg-subtle"
                                title="View Milestone Details"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </button>
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
