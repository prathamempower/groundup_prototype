"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-surface p-3 shadow-overlay text-xs">
        <p className="font-semibold text-text-primary mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-semibold text-text-primary">
                ${(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function ControlCenterPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"PROJECT" | "PORTFOLIO">("PROJECT");

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const projects = projectsData?.data?.projects || [];
  const currentProjectId = projectsData?.data?.current_project_id || "";
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
      {/* Page Header */}
      <PageHeader
        title={
          viewMode === "PORTFOLIO"
            ? "Development Portfolio Overview"
            : `${project?.name || "Project"} Control Center`
        }
        statusBadge={
          viewMode === "PROJECT"
            ? {
                label: project?.lifecycle_stage || "CONSTRUCTION",
                variant:
                  project?.status === "COMPLETED"
                    ? "success"
                    : project?.status === "SETUP_INCOMPLETE"
                    ? "danger"
                    : "warning",
                icon: <Building className="h-3.5 w-3.5" />,
              }
            : undefined
        }
        asOf={formatAsOf(meta?.as_of)}
        subtitle={
          viewMode === "PORTFOLIO"
            ? "Executive view across all development assets, total debt commitments, and open exceptions."
            : project?.address || "Real Estate Financial Control Workspace"
        }
        breadcrumbs={[
          { label: "Portfolio", href: "/control-center" },
          { label: viewMode === "PORTFOLIO" ? "All Projects" : project?.name || "Project overview" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-md border border-border bg-subtle p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("PROJECT")}
                className={`rounded px-2.5 py-1 transition-all ${
                  viewMode === "PROJECT"
                    ? "bg-surface text-primary shadow-xs font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Project View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("PORTFOLIO")}
                className={`rounded px-2.5 py-1 transition-all ${
                  viewMode === "PORTFOLIO"
                    ? "bg-surface text-primary shadow-xs font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Portfolio View
              </button>
            </div>

            <Link href="/onboarding">
              <Button variant="secondary" size="sm">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Setup & Onboarding
              </Button>
            </Link>

            <Link href="/projects/new">
              <Button variant="primary" size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Project
              </Button>
            </Link>
          </div>
        }
      />

      <div className="px-6 space-y-6 max-w-7xl mx-auto">
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
                            <span className="text-caption text-text-muted">Open Exceptions</span>
                            <span className="font-semibold text-warning text-xs">
                              {p.status === "ACTIVE" ? "Operational" : p.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        {isSelected ? (
                          <div className="flex items-center justify-between text-xs text-primary font-semibold">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" /> Active Workspace
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewMode("PROJECT")}
                              className="text-primary hover:underline font-bold"
                            >
                              Open Dashboard →
                            </button>
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
            {/* Data Quality & Exception Banner */}
            {meta?.warnings && meta.warnings.length > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-subtle/40 p-4 text-warning shadow-xs">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-body font-semibold text-text-primary flex items-center gap-2">
                    <span>Provisional Data Quality Notice</span>
                    <span className="rounded bg-warning px-2 py-0.5 text-[11px] font-bold text-white">
                      PROVISIONAL
                    </span>
                  </div>
                  <p className="text-caption text-text-secondary mt-0.5">
                    Figures reflect unverified evidence or pending loan conditions. Source lineage is logged per record.
                  </p>
                  <ul className="mt-2 list-disc list-inside text-caption space-y-0.5 text-text-secondary">
                    {meta.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
                <Link href="/reconciliation">
                  <Button variant="secondary" size="sm" className="text-xs shrink-0">
                    Review Exceptions
                  </Button>
                </Link>
              </div>
            )}

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
                  <Link href="/onboarding">
                    <Button variant="primary">
                      Open Role Setup & Onboarding
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

            {/* Purposeful Chart: Forecast Profit & Cumulative Spend Progression */}
            {d?.profit_trend && d.profit_trend.length > 0 && (
              <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4 mb-4">
                  <div>
                    <h2 className="text-section font-semibold text-text-primary flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Forecast Profit & Spend Progression
                    </h2>
                    <p className="text-caption text-text-muted">
                      Tracking baseline approved budget ($4.2M), cumulative actual spend, and profit variance trajectory over project lifecycle.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Cumulative Spend
                    </span>
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Forecast Profit
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={d.profit_trend}
                      margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="cumulative_spend"
                        name="Cumulative Spend"
                        fill="rgba(15, 76, 129, 0.12)"
                        stroke="#0f4c81"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast_profit"
                        name="Forecast Profit"
                        stroke="#059669"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#059669" }}
                        activeDot={{ r: 6 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

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
