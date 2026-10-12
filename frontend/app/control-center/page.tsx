"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { SourcesButton } from "@/components/ui/source-panel";
import { formatMoney, formatDate, formatAsOf } from "@/lib/format";
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Landmark,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Building,
  Building2,
  Layers,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Plus,
  BarChart3,
  Calendar,
  DollarSign,
  Briefcase,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyFigure } from "@/components/ui/key-figure";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

interface TrajectoryDataPoint {
  month: string;
  planned_baseline?: number;
  actual_spend?: number | null;
  forecast_spend?: number | null;
  planned_progress_pct?: number;
  actual_progress_pct?: number | null;
  forecast_progress_pct?: number | null;
  is_current?: boolean;
  is_delay_period?: boolean;
  note?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload: TrajectoryDataPoint;
  }>;
  label?: string;
}

const ProgressTrajectoryTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0]?.payload;
    return (
      <div className="rounded-lg border border-border bg-surface p-3.5 shadow-overlay text-xs max-w-xs space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-1.5 gap-2">
          <p className="font-bold text-text-primary">{label}</p>
          {dataPoint?.is_current && (
            <span className="rounded bg-primary-subtle px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              Current As-Of
            </span>
          )}
          {dataPoint?.is_delay_period && (
            <span className="rounded bg-warning-subtle px-1.5 py-0.5 text-[10px] font-semibold text-warning">
              Delay Window (+35d)
            </span>
          )}
        </div>

        {dataPoint?.note && (
          <p className="text-[11px] text-text-muted italic bg-subtle/60 rounded p-1.5">
            {dataPoint.note}
          </p>
        )}

        <div className="space-y-1.5 pt-0.5">
          {dataPoint?.planned_baseline !== undefined && (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                Planned Target:
              </span>
              <span className="font-mono font-semibold text-text-primary">
                ${dataPoint.planned_baseline.toLocaleString()} ({dataPoint.planned_progress_pct}%)
              </span>
            </div>
          )}

          {dataPoint?.actual_spend !== null && dataPoint?.actual_spend !== undefined && (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Actual Spend:
              </span>
              <span className="font-mono font-semibold text-primary">
                ${dataPoint.actual_spend.toLocaleString()} ({dataPoint.actual_progress_pct}%)
              </span>
            </div>
          )}

          {dataPoint?.forecast_spend !== null && dataPoint?.forecast_spend !== undefined && (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-amber-600" />
                Forecast Spend:
              </span>
              <span className="font-mono font-semibold text-amber-700">
                ${dataPoint.forecast_spend.toLocaleString()} ({dataPoint.forecast_progress_pct || dataPoint.actual_progress_pct}%)
              </span>
            </div>
          )}
        </div>

        {dataPoint?.is_delay_period && (
          <div className="border-t border-border pt-1.5 text-[11px] text-danger font-medium flex items-center justify-between">
            <span>Carry Cost Impact:</span>
            <span className="font-mono font-bold">+$28,500</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function ControlCenterPage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const urlProjectId = (params?.projectId as string) || "";
  const [viewMode, setViewMode] = useState<"PROJECT" | "PORTFOLIO">("PROJECT");
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [isAlertsCollapsed, setIsAlertsCollapsed] = useState(false);

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const projects = projectsData?.data?.projects || [];
  const currentProjectId = urlProjectId || projectsData?.data?.current_project_id || "";
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["dashboard", currentProjectId],
    queryFn: () => api.projects.getDashboard(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const switchProjectMutation = useMutation({
    mutationFn: (pid: string) => api.projects.switchProject(pid),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const isLoading = isProjectsLoading || isDashboardLoading;

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-24 bg-subtle animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-subtle animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-80 bg-subtle animate-pulse rounded-lg" />
      </div>
    );
  }

  const d = dashboardData?.data;
  const meta = dashboardData?.meta;
  const kpis = d?.kpis;
  const project = d?.project || currentProject;
  const isSetupIncomplete = project?.status === "SETUP_INCOMPLETE" || !kpis?.forecast_profit?.amount;

  return (
    <div className="space-y-6 pb-16">
      <div className="px-6 space-y-6 max-w-7xl mx-auto pt-4">
        {/* Page Header */}
        <PageHeader
          title={
            viewMode === "PORTFOLIO"
              ? "Development Portfolio"
              : project?.name || "Project Overview"
          }
          statusBadge={
            viewMode === "PROJECT" && project?.lifecycle_stage
              ? {
                  label: project.lifecycle_stage.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
                  variant:
                    project?.status === "COMPLETED"
                      ? "success"
                      : project?.status === "SETUP_INCOMPLETE"
                      ? "danger"
                      : "neutral",
                }
              : undefined
          }
          subtitle={
            viewMode === "PORTFOLIO"
              ? "Portfolio summary across active assets and commitments"
              : project?.address || ""
          }
        />
        {/* ========================================================================= */}
        {/* PORTFOLIO VIEW                                                           */}
        {/* ========================================================================= */}
        {viewMode === "PORTFOLIO" ? (
          <div className="space-y-8">
            {/* Portfolio Key Summary Band */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                <span className="text-caption font-medium text-text-secondary">
                  Total Development Portfolio
                </span>
                <div className="mt-2 text-kpi font-semibold text-text-primary">
                  {projects.length} Projects
                </div>
                <div className="mt-2 text-caption text-text-muted">
                  1 Active Construction • 1 Closed • {projects.length > 2 ? `${projects.length - 2} In Setup` : "0 In Setup"}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                <span className="text-caption font-medium text-text-secondary">
                  Total Senior Loan Commitments
                </span>
                <div className="mt-2 text-kpi font-semibold text-text-primary font-mono tabular-nums">
                  $8,050,000
                </div>
                <div className="mt-2 text-caption text-text-muted">
                  Columbia Bank & BCB Community Bank
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                <span className="text-caption font-medium text-text-secondary">
                  Total Net Forecast Profit
                </span>
                <div className="mt-2 text-kpi font-semibold text-success font-mono tabular-nums">
                  $2,342,250
                </div>
                <div className="mt-2 text-caption text-text-muted">
                  Weighted portfolio IRR: 19.4%
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                <span className="text-caption font-medium text-text-secondary">
                  Open Material Exceptions
                </span>
                <div className="mt-2 text-kpi font-semibold text-warning">
                  4 Items
                </div>
                <div className="mt-2 text-caption text-text-muted">
                  1 draw shortfall • 1 missing receipt • 1 steel slip
                </div>
              </div>
            </div>

            {/* Project Portfolio Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Development Assets
                </h2>
                <span className="text-caption text-text-muted">
                  Select a project to switch executive workspace
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((p) => {
                  const isSelected = p.id === currentProjectId;
                  const isClosed = p.lifecycle_stage === "CLOSED" || p.status === "COMPLETED";

                  return (
                    <div
                      key={p.id}
                      className={`rounded-lg border bg-surface p-6 shadow-sm transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-border-subtle hover:shadow-md"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="text-caption font-semibold text-text-muted uppercase tracking-wider block">
                              {p.project_entity}
                            </span>
                            <h3 className="text-lg font-bold text-text-primary mt-0.5">
                              {p.name}
                            </h3>
                          </div>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-bold ${
                              isClosed
                                ? "bg-success-subtle text-success"
                                : p.status === "SETUP_INCOMPLETE"
                                ? "bg-danger-subtle text-danger"
                                : "bg-primary-subtle text-primary"
                            }`}
                          >
                            {p.lifecycle_stage}
                          </span>
                        </div>

                        <p className="text-caption text-text-secondary mb-4">
                          {p.address}
                        </p>

                        <div className="rounded-md border border-border-subtle bg-subtle p-3.5 space-y-2 text-sm mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-caption text-text-muted">Contract Model</span>
                            <span className="font-semibold text-text-primary text-xs">
                              {p.contract_model}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-caption text-text-muted">Loan Commitment</span>
                            <span className="font-mono font-semibold text-text-primary text-xs">
                              {formatMoney(p.loan_commitment)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-caption text-text-muted">Forecast Profit</span>
                            <span className="font-mono font-bold text-success text-xs">
                              {"Incomplete"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-border-subtle pt-1.5">
                            <span className="text-caption text-text-muted">Notifications</span>
                            <span className="font-semibold text-warning text-xs">
                              {p.status === "ACTIVE" ? "Operational" : p.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        {isSelected ? (
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 text-primary font-semibold">
                              <CheckCircle2 className="h-4 w-4" /> Active Workspace
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs font-semibold text-primary"
                              onClick={() => setViewMode("PROJECT")}
                            >
                              Open Dashboard →
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full justify-center text-xs"
                            onClick={() => {
                              switchProjectMutation.mutate(p.id);
                              setViewMode("PROJECT");
                            }}
                          >
                            Switch to this Project
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* PROJECT CONTROL CENTER VIEW                                              */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Separate Actionable Project Alerts Grid */}
            {(() => {
              const defaultAlerts = [
                {
                  id: "draw-shortfall",
                  badge: "Draw Shortfall",
                  badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
                  cardClass: "border-l-4 border-l-rose-500 hover:border-slate-300",
                  icon: <AlertCircle className="h-3.5 w-3.5 text-rose-600" />,
                  title: "Draw #3 Short-Funded",
                  description: "Approved $460k of $520k ($60k shortfall pending mechanical inspection).",
                  actionLabel: "Resolve in Draws",
                  actionHref: "/draws",
                },
                {
                  id: "budget-overrun",
                  badge: "Budget Overrun",
                  badgeClass: "bg-red-50 text-red-700 border-red-200",
                  cardClass: "border-l-4 border-l-red-500 hover:border-slate-300",
                  icon: <AlertTriangle className="h-3.5 w-3.5 text-red-600" />,
                  title: "Framing & Structural Steel",
                  description: "CO-001 reinforcement exceeded baseline by $20,000. Contingency transfer required.",
                  actionLabel: "Review Budget",
                  actionHref: "/budget",
                },
                {
                  id: "milestone-delay",
                  badge: "Schedule Slip",
                  badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
                  cardClass: "border-l-4 border-l-amber-500 hover:border-slate-300",
                  icon: <Clock className="h-3.5 w-3.5 text-amber-600" />,
                  title: "Structural Steel Delayed",
                  description: "Critical path delivery slip pushes finish to Dec 15 (+$28,500 carry cost impact).",
                  actionLabel: "View Timeline",
                  actionHref: "/timeline",
                },
                {
                  id: "unallocated-cash",
                  badge: "Unallocated Cash",
                  badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
                  cardClass: "border-l-4 border-l-blue-500 hover:border-slate-300",
                  icon: <DollarSign className="h-3.5 w-3.5 text-blue-600" />,
                  title: "Unallocated Wire Cleared",
                  description: "$150,000 wire received in Columbia Bank operating account awaiting sub-ledger match.",
                  actionLabel: "Reconcile Cash",
                  actionHref: "/reconciliation",
                },
              ];

              const visibleAlerts = defaultAlerts.filter((a) => !dismissedAlerts.includes(a.id));

              if (visibleAlerts.length === 0 && dismissedAlerts.length > 0) {
                return (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>All operational notifications have been acknowledged for this session.</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-blue-600 font-semibold h-6 px-2"
                      onClick={() => setDismissedAlerts([])}
                    >
                      Reset View
                    </Button>
                  </div>
                );
              }

              if (visibleAlerts.length === 0) return null;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Active Notifications
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {visibleAlerts.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-500 hover:text-slate-900 h-7 px-2"
                        onClick={() => setIsAlertsCollapsed(!isAlertsCollapsed)}
                      >
                        {isAlertsCollapsed ? (
                          <span className="flex items-center gap-1">
                            Show ({visibleAlerts.length}) <ChevronDown className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            Collapse <ChevronUp className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </Button>
                      <Link href="/alerts">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 h-7 px-2"
                        >
                          Notifications Workspace →
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {!isAlertsCollapsed ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {visibleAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:shadow-xs transition-all ${alert.cardClass}`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${alert.badgeClass}`}
                              >
                                {alert.icon}
                                {alert.badge}
                              </span>
                              <button
                                type="button"
                                aria-label={`Dismiss ${alert.title}`}
                                onClick={() => setDismissedAlerts((prev) => [...prev, alert.id])}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                                title="Dismiss notification"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {alert.title}
                            </h4>
                            <p className="text-[12px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {alert.description}
                            </p>
                          </div>

                          <div className="pt-3 mt-2 border-t border-slate-100">
                            <Link
                              href={alert.actionHref}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <span>{alert.actionLabel}</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs">
                      <span className="flex items-center gap-2 text-slate-600">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span>
                          {visibleAlerts.length} operational notifications requiring review.
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-blue-600 h-6 px-2"
                        onClick={() => setIsAlertsCollapsed(false)}
                      >
                        Expand Notifications
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}

            {isSetupIncomplete && (
              <div className="rounded-lg border border-danger-subtle bg-danger-subtle/30 p-6 text-center">
                <ShieldAlert className="mx-auto h-8 w-8 text-danger mb-2" />
                <h3 className="text-title font-semibold text-text-primary">
                  Project Setup Incomplete
                </h3>
                <p className="mt-1 text-body text-text-secondary max-w-md mx-auto">
                  A verified financial baseline and mapped bank account have not yet been approved for {project?.name}.
                  Financial KPIs are withheld until baseline sign-off.
                </p>
                <div className="mt-4">
                  <Link href={`/projects/${project?.id || ""}/budget`}>
                    <Button variant="primary">
                      Review Budget Baseline
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* 4 Key Figures KPI Band */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Forecast Profit */}
              <KeyFigure
                label="Forecast Profit"
                value={formatMoney(kpis?.forecast_profit?.amount)}
                basis={kpis?.forecast_profit?.basis || "Approved budget + approved change orders + carry delay estimate"}
                variance={
                  kpis?.forecast_profit?.variance_from_original
                    ? {
                        formattedAmount: formatMoney(kpis.forecast_profit.variance_from_original),
                        percentage: kpis.forecast_profit.variance_pct,
                        isFavorable: Number(kpis.forecast_profit.variance_from_original) >= 0,
                        comparisonLabel: "vs original baseline",
                      }
                    : undefined
                }
                citations={kpis?.forecast_profit?.sources}
              />

              {/* 2. Cash Gap */}
              <KeyFigure
                label="Cash / Funding Gap"
                value={formatMoney(kpis?.cash_gap?.amount)}
                basis={kpis?.cash_gap?.basis || "Actual disbursed cash exceeds cleared draws & equity"}
                variance={{
                  formattedAmount: Number(kpis?.cash_gap?.amount || 0) > 0 ? "Active Deficit" : "Balanced",
                  isFavorable: Number(kpis?.cash_gap?.amount || 0) <= 0,
                  comparisonLabel: "reconciled funding",
                }}
                citations={kpis?.cash_gap?.sources}
              />

              {/* 3. Contingency Remaining */}
              <KeyFigure
                label="Contingency Remaining"
                value={formatMoney(kpis?.contingency_left?.amount)}
                basis={kpis?.contingency_left?.basis || "Original baseline minus allocated change orders"}
                progress={{
                  current: Number(kpis?.contingency_left?.amount || 0),
                  max: Number(kpis?.contingency_left?.total_contingency || 35000000),
                  label: "Remaining Reserve",
                }}
                citations={kpis?.contingency_left?.sources}
              />

              {/* 4. Forecast Completion */}
              <KeyFigure
                label="Forecast Completion"
                value={formatDate(kpis?.forecast_completion?.date)}
                basis={kpis?.forecast_completion?.basis || "Critical path milestones and supplier lead times"}
                variance={
                  kpis?.forecast_completion?.delay_days
                    ? {
                        formattedAmount: `+${kpis.forecast_completion.delay_days} days`,
                        isFavorable: false,
                        comparisonLabel: "schedule variance",
                      }
                    : undefined
                }
                citations={kpis?.forecast_completion?.sources}
              />
            </div>

            {/* Integrated Finance, Time, Delay, Impact & Progress Trajectory Line Graph */}
            {(() => {
              const trajectoryData: TrajectoryDataPoint[] = (d?.progress_trajectory && d.progress_trajectory.length > 0)
                ? d.progress_trajectory
                : [
                    { month: "May '25", planned_baseline: 80000, actual_spend: 75000, planned_progress_pct: 7, actual_progress_pct: 7, note: "Groundwork & Excavation" },
                    { month: "Jun '25", planned_baseline: 180000, actual_spend: 170000, planned_progress_pct: 17, actual_progress_pct: 16, note: "Foundation & Footings poured" },
                    { month: "Jul '25", planned_baseline: 310000, actual_spend: 260000, planned_progress_pct: 29, actual_progress_pct: 24, note: "Steel procurement order placed" },
                    { month: "Aug '25", planned_baseline: 460000, actual_spend: 340000, planned_progress_pct: 43, actual_progress_pct: 32, note: "Structural steel delivery slipped" },
                    { month: "Sep '25", planned_baseline: 620000, actual_spend: 420000, planned_progress_pct: 58, actual_progress_pct: 39, note: "Framing delay impacts MEP rough-in" },
                    { month: "Oct '25", planned_baseline: 780000, actual_spend: 420000, forecast_spend: 420000, planned_progress_pct: 73, actual_progress_pct: 42, is_current: true, note: "Current As-Of (16% Execution Lag)" },
                    { month: "Nov '25", planned_baseline: 1070000, forecast_spend: 780000, planned_progress_pct: 100, forecast_progress_pct: 71, note: "Original baseline deadline (Nov 10)" },
                    { month: "Dec '25", forecast_spend: 1020000, forecast_progress_pct: 93, is_delay_period: true, note: "Schedule Slip Window (+35 days)" },
                    { month: "Jan '26", forecast_spend: 1098500, forecast_progress_pct: 100, is_delay_period: true, note: "Final Closeout (+$28.5k carry cost impact)" },
                  ];

              return (
                <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-2xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-base font-semibold text-slate-900">
                          Capital & Schedule Trajectory
                        </h2>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          EVM
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Correlating baseline capital curve against actual verified spend and critical path milestones
                      </p>
                    </div>

                    {/* Executive Metric Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1 text-xs font-semibold text-rose-700">
                        <Clock className="h-3.5 w-3.5" />
                        <span>+35d Delay Window</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>+$28.5k Carry Impact</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                        <span>42% Progress (-16% Lag)</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Legend Bar */}
                  <div className="flex flex-wrap items-center gap-5 text-xs font-medium pb-4 border-b border-slate-100 mb-4 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-3 rounded-xs bg-slate-300" /> Planned Baseline ($1.07M)
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-primary">
                      <span className="h-2.5 w-3 rounded-xs bg-primary" /> Actual Spend ($420k)
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-800">
                      <span className="h-2 w-3 border-b-2 border-dashed border-amber-500" /> Forecast with Delay ($1.098M)
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-700">
                      <span className="h-2.5 w-3 rounded-xs bg-amber-200/80 border border-amber-300" /> Delay Window Zone
                    </span>
                  </div>

                  {/* Line Chart Canvas */}
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={trajectoryData}
                        margin={{ top: 15, right: 30, left: 15, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />

                        {/* Left Y-Axis: Capital & Spend in Dollars */}
                        <YAxis
                          yAxisId="left"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                          domain={[0, 1200000]}
                        />

                        {/* Right Y-Axis: Earned Progress % */}
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `${val}%`}
                          domain={[0, 100]}
                        />

                        <Tooltip content={<ProgressTrajectoryTooltip />} />

                        {/* Visual Highlight: Delay Window Zone (+35 Days) */}
                        <ReferenceArea
                          yAxisId="left"
                          x1="Nov '25"
                          x2="Jan '26"
                          fill="#fef3c7"
                          fillOpacity={0.45}
                          stroke="#f59e0b"
                          strokeDasharray="3 3"
                        />

                        {/* As-Of Current Date Marker */}
                        <ReferenceLine
                          yAxisId="left"
                          x="Oct '25"
                          stroke="#0f4c81"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          label={{
                            value: "Today (Oct '25)",
                            position: "top",
                            fill: "#0f4c81",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        />

                        {/* 1. Target Baseline Progress Curve (Planned Budget) */}
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="planned_baseline"
                          name="Planned Target"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          dot={{ r: 3, fill: "#94a3b8" }}
                          activeDot={{ r: 5 }}
                        />

                        {/* 2. Actual Verified Spend & Earned Progress */}
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="actual_spend"
                          name="Actual Spend"
                          fill="rgba(15, 76, 129, 0.12)"
                          stroke="#0f4c81"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: "#0f4c81" }}
                          activeDot={{ r: 6 }}
                        />

                        {/* 3. Forecast Trajectory with Critical Path Delay Impact */}
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="forecast_spend"
                          name="Forecast Trajectory"
                          stroke="#d97706"
                          strokeWidth={2.5}
                          strokeDasharray="5 5"
                          dot={{ r: 4, fill: "#d97706" }}
                          activeDot={{ r: 6 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 5 Core Pillars Analytical Summary Ribbon */}
                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Capital Target
                      </span>
                      <div className="mt-1 font-mono font-bold text-slate-900 text-sm">
                        $1,070,000
                      </div>
                      <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                        Forecast: $1,098,500
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Target Timeline
                      </span>
                      <div className="mt-1 font-semibold text-slate-900 text-sm">
                        Nov 10 → Dec 15
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        7 Months Total
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Critical Slip
                      </span>
                      <div className="mt-1 font-bold text-rose-600 text-sm">
                        +35 Days Delay
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Structural Steel
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Carry Cost Burn
                      </span>
                      <div className="mt-1 font-bold text-amber-700 font-mono text-sm">
                        +$28,500
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Interest & Demurrage
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Schedule Variance
                      </span>
                      <div className="mt-1 font-bold text-rose-600 text-sm">
                        -16% Progress Lag
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        42% Act. vs 58% Target
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Two Columns: Forecast Table & Draw Strip / Exceptions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 spans): Original vs Current Forecast Table */}
              <div className="lg:col-span-2 rounded-lg border border-border bg-surface p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="text-section font-semibold text-text-primary">
                      Original vs Current Forecast
                    </h2>
                    <p className="text-caption text-text-muted">
                      CSI Category baselines and variance explanations
                    </p>
                  </div>
                  <Link href="/budget">
                    <Button variant="tertiary" size="sm">
                      Open Full Budget <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-body">
                    <thead>
                      <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Original</th>
                        <th className="py-2.5 px-3 text-right">Approved</th>
                        <th className="py-2.5 px-3 text-right">Actual Spend</th>
                        <th className="py-2.5 px-3 text-right">Variance</th>
                        <th className="py-2.5 px-3 text-center">Sources</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {d?.forecast_table?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-subtle/30 transition-colors">
                          <td className="py-3 px-3 font-medium text-text-primary">
                            <div>{row.category}</div>
                            <div className="text-caption text-text-muted font-normal mt-0.5">
                              {row.variance_reason}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums font-mono text-text-secondary">
                            {formatMoney(row.original_budget)}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums font-mono font-medium text-text-primary">
                            {formatMoney(row.current_approved)}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums font-mono text-text-secondary">
                            {formatMoney(row.actual_spend)}
                          </td>
                          <td className={`py-3 px-3 text-right tabular-nums font-mono font-semibold ${
                            Number(row.variance) < 0
                              ? "text-danger"
                              : Number(row.variance) > 0
                              ? "text-success"
                              : "text-text-muted"
                          }`}>
                            {formatMoney(row.variance)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <SourcesButton
                              figureLabel={row.category}
                              amountOrValue={formatMoney(row.current_approved)}
                              basis={row.variance_reason}
                              citations={row.sources}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column (1 span): Draw Workspace Status, Schedule Risk & Open Exceptions */}
              <div className="space-y-6">
                {/* Draw Truth Strip */}
                <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-section font-semibold text-text-primary flex items-center gap-1.5">
                      <Landmark className="h-4 w-4 text-primary" />
                      Draw Status Summary
                    </h3>
                    <span className="rounded bg-primary-subtle px-2 py-0.5 text-caption font-semibold text-primary">
                      Draw #{d?.draw_summary?.latest_draw_number}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-body">
                      <span className="text-text-secondary text-sm">Requested Amount</span>
                      <span className="font-mono font-medium text-text-primary tabular-nums">
                        {formatMoney(d?.draw_summary?.requested)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-body">
                      <span className="text-text-secondary text-sm">Inspector Recommended</span>
                      <span className="font-mono font-medium text-text-primary tabular-nums">
                        {formatMoney(d?.draw_summary?.recommended)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-body">
                      <span className="text-text-secondary text-sm">Lender Approved</span>
                      <span className="font-mono font-medium text-text-primary tabular-nums">
                        {formatMoney(d?.draw_summary?.approved)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-body border-t border-border pt-2">
                      <span className="font-semibold text-success text-sm">Cleared Cash Funded</span>
                      <span className="font-mono font-bold text-success tabular-nums">
                        {formatMoney(d?.draw_summary?.cleared_funded)}
                      </span>
                    </div>

                    {Number(d?.draw_summary?.shortfall || 0) > 0 && (
                      <div className="rounded-md border border-danger/30 bg-danger-subtle/50 p-2.5 text-caption font-medium text-danger flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Lender Shortfall: {formatMoney(d?.draw_summary?.shortfall)} pending mechanical condition.</span>
                      </div>
                    )}

                    {Number(d?.draw_summary?.unallocated_deposit || 0) > 0 && (
                      <div className="rounded-md border border-info/30 bg-info-subtle/50 p-2.5 text-caption font-medium text-info flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Unallocated Wire: {formatMoney(d?.draw_summary?.unallocated_deposit)} cleared in account.</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link href="/draws">
                        <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                          Open Draw Workspace <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Schedule Risk Card */}
                <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-section font-semibold text-text-primary flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-warning" />
                      Critical Path Risk
                    </h3>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <span className="text-caption text-text-muted block">At-Risk Milestone</span>
                      <span className="font-semibold text-text-primary">
                        {d?.schedule_risk?.at_risk_milestone}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-caption text-text-muted block">Schedule Slip</span>
                        <span className="font-bold text-danger">
                          +{d?.schedule_risk?.delay_days} days
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-text-muted block">Carry Impact</span>
                        <span className="font-semibold text-text-primary">
                          {d?.schedule_risk?.carry_cost_impact}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href="/timeline">
                        <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                          View Milestone Schedule <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Top Exceptions Card */}
                <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-section font-semibold text-text-primary">
                      Top Exceptions ({d?.open_exceptions?.length || 0})
                    </h3>
                    <Link href="/reconciliation" className="text-caption text-primary hover:underline font-semibold">
                      View all
                    </Link>
                  </div>

                  <div className="mt-3 divide-y divide-border-subtle">
                    {d?.open_exceptions?.map((exc) => (
                      <div key={exc.id} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-2">
                          <AlertCircle
                            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                              exc.severity === "danger"
                                ? "text-danger"
                                : exc.severity === "warning"
                                ? "text-warning"
                                : "text-info"
                            }`}
                          />
                          <div>
                            <p className="text-caption font-semibold text-text-primary">
                              {exc.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                              <span className="rounded bg-subtle px-1.5 py-0.2 text-[10px] font-medium text-text-secondary">
                                {exc.category}
                              </span>
                              <span>Owner: {exc.owner}</span>
                              <span>•</span>
                              <span>{exc.age_days}d open</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
