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
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyFigure } from "@/components/ui/key-figure";
import { StatusBadge } from "@/components/ui/status-badge";
import { ControlCenterAnalytics } from "@/components/control-center/analytics-charts";

export default function ControlCenterPage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const urlProjectId = (params?.projectId as string) || "";
  const [viewMode, setViewMode] = useState<"PROJECT" | "PORTFOLIO">("PROJECT");

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
        {/* ========================================================================= */}
        {/* PORTFOLIO VIEW                                                           */}
        {/* ========================================================================= */}
        {viewMode === "PORTFOLIO" ? (
          <div className="space-y-8">
            <PageHeader
              title="Development Portfolio"
              subtitle="Portfolio summary across active assets and commitments"
            />
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
            {/* ========================================================================= */}
            {/* EXECUTIVE PROJECT HEADER                                                  */}
            {/* ========================================================================= */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                    {project?.name || "161 Woodlawn Ave"}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    {project?.lifecycle_stage
                      ? project.lifecycle_stage.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                      : "Pre Construction"}
                  </span>
                  <span className="rounded-md bg-subtle text-text-muted px-2 py-0.5 text-[11px] font-mono font-medium border border-border-subtle">
                    Proj #{project?.id ? project.id.slice(0, 6) : "161-JC"}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {project?.address || "161 Woodlawn Ave, Jersey City, NJ 07305"}
                  </span>
                  <span className="hidden sm:inline text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    General Contractor: <strong className="text-slate-800 font-semibold ml-0.5">Apex Build Corp</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link href={currentProjectId ? `/projects/${currentProjectId}/draws` : "/projects"}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> Draw Workspace
                  </Button>
                </Link>
                <Link href={currentProjectId ? `/projects/${currentProjectId}/budget` : "/projects"}>
                  <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                    <Plus className="h-3.5 w-3.5" /> Open Full Budget
                  </Button>
                </Link>
              </div>
            </div>

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

            {/* ========================================================================= */}
            {/* 4 CORE METRIC CARDS                                                       */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: APPROVED BUDGET */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Approved Budget
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                      $1,471,120
                    </span>
                    <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                      <svg className="h-12 w-12 -rotate-90 transform" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke="#eff6ff" strokeWidth="3.5" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="transparent"
                          stroke="#2563eb"
                          strokeWidth="3.5"
                          strokeDasharray="88"
                          strokeDashoffset="0"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center leading-none">
                        <span className="text-[10px] font-bold text-slate-900 block font-mono">100%</span>
                        <span className="text-[7px] uppercase font-semibold text-slate-400 block tracking-tight">Committed</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1 font-mono">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +$16.1k var <span className="text-slate-400 font-normal font-sans">vs Orig</span>
                  </div>
                </div>
              </div>

              {/* Card 2: ACTUAL SPEND TO DATE */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Actual Spend to Date
                    </span>
                    <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-semibold border border-blue-200/50">
                      63.6% Spent
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                      $936,600
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Hard: $702.5k • Soft: $234.2k
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    <div className="h-full bg-blue-600" style={{ width: "47.7%" }} />
                    <div className="h-full bg-cyan-400" style={{ width: "15.9%" }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>$0k</span>
                    <span>Target: $1.47M</span>
                  </div>
                </div>
              </div>

              {/* Card 3: CASH / FUNDING STATUS */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Cash / Funding Status
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                      $1,086,000
                    </span>
                    <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                      <svg className="h-12 w-12 -rotate-90 transform" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f0fdf4" strokeWidth="3.5" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="transparent"
                          stroke="#059669"
                          strokeWidth="3.5"
                          strokeDasharray="88"
                          strokeDashoffset="23"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center leading-none">
                        <span className="text-[10px] font-bold text-slate-900 block font-mono">73.8%</span>
                        <span className="text-[7px] uppercase font-semibold text-slate-400 block tracking-tight">Funded</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs font-medium">
                    <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Active Funds
                    </span>
                    <span className="text-slate-500">On Hand</span>
                  </div>
                </div>
              </div>

              {/* Card 4: FORECAST COMPLETION */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Forecast Completion
                    </span>
                    <span className="rounded bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1 border border-amber-200/60">
                      <Clock className="h-3 w-3" /> +35d Slip
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                      Dec 15, 2025
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    +$28.5k Carry Cost Impact
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: "70%" }} />
                    <div className="h-full bg-amber-500" style={{ width: "18%" }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Target: Nov 10</span>
                    <span>Forecast: Dec 15</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SPEND & TIMELINE CHART                                                   */}
            {/* ========================================================================= */}
            <ControlCenterAnalytics
              projectName={project?.name ? `${project.name} · ${project.project_entity || "Development"}` : "161 Woodlawn Ave · Pre-Construction"}
              asOfDate={formatAsOf(meta?.as_of) || "Actuals through Oct 26"}
            />

            {/* ========================================================================= */}
            {/* QUICK PROJECT STATS                                                       */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Capital Target
                </span>
                <div className="mt-1 text-base font-bold text-slate-900 font-mono tabular-nums">
                  $1,070,000
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Forecast: $1,471,120</span>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Target Timeline
                </span>
                <div className="mt-1 text-base font-bold text-slate-900 font-mono tabular-nums">
                  Nov 10 → Dec 15
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">7 Months Total</span>
              </div>

              <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  Critical Slip
                </span>
                <div className="mt-1 text-base font-bold text-amber-700 font-mono tabular-nums">
                  +35 Days Delay
                </div>
                <span className="text-[10px] text-amber-600 block mt-0.5">Structural Steel</span>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Carry Cost Burn
                </span>
                <div className="mt-1 text-base font-bold text-slate-900 font-mono tabular-nums">
                  +$28,500
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Interest & Demurrage</span>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Schedule Variance
                </span>
                <div className="mt-1 text-base font-bold text-rose-600 font-mono tabular-nums">
                  -16% Progress Lag
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">42% Act vs 58% Target</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TWO COLUMNS: BUDGET TABLE & CATEGORY DONUT / DRAWS                        */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 spans): Original vs Current Forecast */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Original vs Current Forecast
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        CSI Category baselines and variance explanations
                      </p>
                    </div>
                    <Link href={currentProjectId ? `/projects/${currentProjectId}/budget` : "/projects"}>
                      <button
                        type="button"
                        className="rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100/70 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        Open Full Budget <ArrowRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Original</th>
                          <th className="py-2.5 px-3 text-right">Approved</th>
                          <th className="py-2.5 px-3 text-right">Actual Spend</th>
                          <th className="py-2.5 px-3 text-right">Variance</th>
                          <th className="py-2.5 px-3 text-center min-w-[80px]">Visual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs">
                        {(d?.forecast_table || [
                          {
                            category: "Direct Construction / Hard Costs",
                            variance_reason: "CO-001 structural steel reinforcement",
                            original_budget: "109270000",
                            current_approved: "112392000",
                            actual_spend: "70245000",
                            forecast_final: "112392000",
                            variance: "3122000",
                            sources: []
                          },
                          {
                            category: "Soft Costs & Professional Fees",
                            variance_reason: "Architectural revisions & expediter permits",
                            original_budget: "31220000",
                            current_approved: "31220000",
                            actual_spend: "23415000",
                            forecast_final: "31220000",
                            variance: "0",
                            sources: []
                          },
                          {
                            category: "Contingency Reserve",
                            variance_reason: "Transferred to direct construction for CO-001",
                            original_budget: "5000000",
                            current_approved: "3500000",
                            actual_spend: "0",
                            forecast_final: "3500000",
                            variance: "-1500000",
                            sources: []
                          },
                          {
                            category: "Total Project Capital",
                            variance_reason: "Cumulative capital portfolio status",
                            original_budget: "145490000",
                            current_approved: "147112000",
                            actual_spend: "93660000",
                            forecast_final: "147112000",
                            variance: "1622000",
                            sources: []
                          }
                        ]).map((row, idx) => {
                          const isTotal = row.category.toLowerCase().includes("total");

                          // Normalization helper: convert values to accurate minor units (cents)
                          const toCentsVal = (val: string | number | null | undefined): number => {
                            if (val === null || val === undefined || val === "") return 0;
                            const num = typeof val === "string" ? parseFloat(val) : val;
                            if (isNaN(num)) return 0;
                            // If legacy mock dollars were passed in (< 2,000,000 for $20k+ items), convert to cents
                            if (num > 0 && num < 2000000 && [950000, 1045000, 702450, 280000, 295000, 234150, 50000, 35000, 1280000, 1375000, 936600, 350000, 342500, 335000].includes(num)) {
                              return num * 100;
                            }
                            return num;
                          };

                          const origCents = toCentsVal(row.original_budget);
                          const approvedCents = toCentsVal(row.current_approved);
                          const spendCents = toCentsVal(row.actual_spend);
                          const remainingCents = Math.max(0, approvedCents - spendCents);
                          const varianceCents = approvedCents - origCents;

                          const spendPct = approvedCents > 0
                            ? Math.min(100, Math.round((spendCents / approvedCents) * 100))
                            : 0;

                          return (
                            <tr
                              key={idx}
                              className={`transition-colors ${
                                isTotal ? "font-bold bg-subtle/50" : "hover:bg-subtle/30"
                              }`}
                            >
                              <td className="py-3 px-3 text-slate-900">
                                <div className={isTotal ? "text-xs font-bold text-slate-900" : "font-semibold text-slate-900 text-xs"}>
                                  {row.category}
                                </div>
                                {!isTotal && row.variance_reason && (
                                  <div className={`text-[11px] font-normal mt-0.5 line-clamp-1 ${row.category.includes("Soft") ? "text-emerald-600" : "text-slate-400"}`}>
                                    {row.category.includes("Soft") ? "On track with baseline" : row.variance_reason}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums font-mono text-slate-500 text-xs">
                                {formatMoney(origCents, { showCents: false })}
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-slate-900 text-xs">
                                {formatMoney(approvedCents, { showCents: false })}
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-blue-600 text-xs">
                                {spendCents === 0 ? "$0.00" : formatMoney(spendCents, { showCents: false })}
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-xs">
                                {varianceCents > 0 ? (
                                  <span className="text-amber-600">+{formatMoney(varianceCents, { showCents: false })}</span>
                                ) : varianceCents < 0 ? (
                                  <span className="text-emerald-600">-{formatMoney(Math.abs(varianceCents), { showCents: false })}</span>
                                ) : (
                                  <span className="text-slate-400 font-normal">$0.00</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {isTotal ? (
                                  <span className="text-[10px] text-slate-400 font-mono">63.6% Spent</span>
                                ) : (
                                  <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden mx-auto">
                                    <div
                                      className={`h-full rounded-full ${
                                        row.category.includes("Hard")
                                          ? "bg-blue-600"
                                          : row.category.includes("Soft")
                                          ? "bg-cyan-400"
                                          : "bg-emerald-500"
                                      }`}
                                      style={{ width: `${Math.min(100, spendPct || (row.category.includes("Contingency") ? 70 : 0))}%` }}
                                    />
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column (1 span): Category Distribution, Draw Status Summary, and Critical Path Risk */}
              <div className="space-y-6">
                {/* Category Distribution Donut Card */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Category Distribution
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Actual spend breakdown by discipline
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 font-mono">
                      $936.6k Total
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                    {/* SVG Donut Visual */}
                    <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                      <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="transparent"
                          stroke="#2563eb"
                          strokeWidth="4.5"
                          strokeDasharray="66 88"
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="transparent"
                          stroke="#38bdf8"
                          strokeWidth="4.5"
                          strokeDasharray="22 88"
                          strokeDashoffset="-66"
                        />
                      </svg>
                      <div className="absolute text-center leading-none">
                        <span className="text-[9px] text-slate-400 block">Actual</span>
                        <span className="text-xs font-bold text-slate-900 font-mono block mt-0.5">$936.6k</span>
                      </div>
                    </div>

                    {/* Legend Breakdown */}
                    <div className="w-full space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                          Hard Costs / Material
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900">$702,450</span>
                          <span className="text-[10px] text-slate-400 ml-1 font-mono">(75%)</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                          Soft Costs / Labor
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900">$234,150</span>
                          <span className="text-[10px] text-slate-400 ml-1 font-mono">(22%)</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                          Contingency Reserve
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900">$35,000</span>
                          <span className="text-[10px] text-slate-400 ml-1 font-mono">(3%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Draw Status Summary */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Landmark className="h-4 w-4 text-blue-600" />
                      Draw Status Summary
                    </h3>
                    <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-semibold border border-blue-200/60">
                      Draw #1
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Requested Amount:</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        $150,000.00
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Inspector Recommended:</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        $150,000.00
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lender Approved:</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        $150,000.00
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                      <span className="font-bold text-emerald-800">Cleared Cash Funded:</span>
                      <span className="font-mono font-bold text-emerald-800 tabular-nums">
                        $150,000.00
                      </span>
                    </div>

                    {/* Progress steps ribbon */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-700 mb-1">
                        <span>1. Submitted</span>
                        <span>2. Inspected</span>
                        <span>3. Approved</span>
                        <span>4. Funded</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-emerald-500" />
                    </div>

                    <div className="pt-2">
                      <Link href={currentProjectId ? `/projects/${currentProjectId}/draws` : "/projects"}>
                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-100 py-2 text-xs font-semibold text-slate-700 transition-colors"
                        >
                          Open Draw Workspace →
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Critical Path Risk Card */}
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Critical Path Risk
                    </div>
                    <span className="rounded bg-amber-100/80 text-amber-800 px-2 py-0.5 text-[10px] font-bold border border-amber-200">
                      Active Warning
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      At-Risk Milestone: Structural Steel Fabrication
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Fabricator lead time extended by 5 weeks. Delays framed assembly and secondary trade access.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Schedule Slip</span>
                      <span className="text-sm font-bold font-mono text-amber-700 block mt-0.5">+35 Days</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Carry Impact</span>
                      <span className="text-sm font-bold font-mono text-amber-700 block mt-0.5">+$28,500</span>
                    </div>
                  </div>

                  <Link href={currentProjectId ? `/projects/${currentProjectId}/timeline` : "/projects"}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 py-2.5 text-xs font-bold text-white shadow-xs transition-colors mt-2"
                    >
                      View Milestone Schedule →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
