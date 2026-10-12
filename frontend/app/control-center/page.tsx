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
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                    {project?.name || "161 Woodlawn Ave"}
                  </h1>
                  <span className="rounded-full bg-primary-subtle text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-semibold">
                    {project?.lifecycle_stage
                      ? project.lifecycle_stage.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                      : "Pre Construction"}
                  </span>
                  <span className="rounded-md bg-subtle text-text-muted px-2 py-0.5 text-[11px] font-mono font-medium">
                    #{project?.id?.slice(0, 6) || "161-JC"}
                  </span>
                </div>
                <p className="text-sm text-text-secondary flex flex-wrap items-center gap-x-2">
                  <span>{project?.address || "161 Woodlawn Ave, Jersey City, NJ 07305"}</span>
                  <span className="hidden sm:inline text-text-muted">·</span>
                  <span className="text-text-muted">General Contractor: <strong className="text-text-secondary font-medium">Apex Build Corp</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link href={currentProjectId ? `/projects/${currentProjectId}/draws` : "/projects"}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                    Loan Draws <ExternalLink className="h-3.5 w-3.5 text-text-muted" />
                  </Button>
                </Link>
                <Link href={currentProjectId ? `/projects/${currentProjectId}/budget` : "/projects"}>
                  <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold shadow-xs">
                    <Plus className="h-3.5 w-3.5" /> Full Budget
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
              {/* Card 1: TOTAL BUDGET */}
              <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Total Budget
                    </span>
                    <SourcesButton
                      figureLabel="Total Budget"
                      amountOrValue={formatMoney((kpis as any)?.approved_budget?.amount || 147112000, { showCents: false })}
                      basis={(kpis as any)?.approved_budget?.basis || "Baseline contract + approved change orders"}
                      citations={(kpis as any)?.approved_budget?.sources || kpis?.forecast_profit?.sources}
                    />
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
                      {formatMoney((kpis as any)?.approved_budget?.amount || 147112000, { showCents: false })}
                    </span>
                    <span className="text-xs font-medium text-text-secondary font-mono">
                      +$16.1k vs start
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3">
                  <div className="text-xs text-text-muted">
                    <span className="block font-medium text-text-secondary">Contracts Signed</span>
                    <span className="text-[11px]">100% committed</span>
                  </div>
                  <div className="relative h-11 w-11 flex items-center justify-center shrink-0">
                    <svg className="h-11 w-11 -rotate-90 transform" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="transparent" stroke="#e2e8f0" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeDasharray="88"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-text-primary">100%</span>
                  </div>
                </div>
              </div>

              {/* Card 2: MONEY SPENT */}
              <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Money Spent
                    </span>
                    <span className="rounded bg-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-primary">
                      63.6% Spent
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
                      {formatMoney((kpis as any)?.actual_spend?.amount || 93660000, { showCents: false })}
                    </span>
                    <span className="text-xs text-text-muted">
                      Hard $702.5k · Soft $234.1k
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border space-y-1.5">
                  <div className="flex justify-between text-[11px] text-text-muted font-mono">
                    <span>$0</span>
                    <span className="font-medium text-text-secondary">Budget: $1.47M</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    <div className="h-full bg-blue-600 rounded-l-full" style={{ width: "47.7%" }} />
                    <div className="h-full bg-teal-500 rounded-r-full" style={{ width: "15.9%" }} />
                  </div>
                </div>
              </div>

              {/* Card 3: AVAILABLE CASH */}
              <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Available Cash
                    </span>
                    <span className="rounded bg-teal-50 text-teal-700 px-2 py-0.5 text-[11px] font-semibold">
                      Funded
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
                      {formatMoney((kpis as any)?.cash_funded?.amount || 108600000, { showCents: false })}
                    </span>
                    <span className="text-xs text-text-muted">
                      In Bank & Escrow
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3">
                  <div className="text-xs text-text-muted">
                    <span className="block font-medium text-text-secondary">Draws Received</span>
                    <span className="text-[11px]">Paid Draws #1 to #3</span>
                  </div>
                  <div className="relative h-11 w-11 flex items-center justify-center shrink-0">
                    <svg className="h-11 w-11 -rotate-90 transform" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="transparent" stroke="#e2e8f0" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke="#0d9488"
                        strokeWidth="3"
                        strokeDasharray="88"
                        strokeDashoffset="23"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-text-primary">73.8%</span>
                  </div>
                </div>
              </div>

              {/* Card 4: EXPECTED FINISH */}
              <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Expected Finish
                    </span>
                    <span className="rounded bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 35 Days Late
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
                      {formatDate(kpis?.forecast_completion?.date || "2025-12-15")}
                    </span>
                    <span className="text-xs font-semibold text-danger">
                      +$28.5k Delay Cost
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border space-y-1.5">
                  <div className="flex justify-between text-[11px] text-text-muted">
                    <span>Planned: Nov 10</span>
                    <span className="font-medium text-amber-700">Expected: Dec 15</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden relative">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "82%" }} />
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
            <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <div className="sm:px-3 pt-2 sm:pt-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                    Initial Budget
                  </span>
                  <div className="mt-1 text-base font-bold text-text-primary font-mono tabular-nums">
                    $1,070,000
                  </div>
                  <span className="text-[11px] text-text-muted">Expected: $1,471,120</span>
                </div>

                <div className="sm:px-3 pt-2 sm:pt-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                    Timeline
                  </span>
                  <div className="mt-1 text-base font-bold text-text-primary font-mono tabular-nums">
                    Nov 10 → Dec 15
                  </div>
                  <span className="text-[11px] text-text-muted">7 Months Total</span>
                </div>

                <div className="sm:px-3 pt-2 sm:pt-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                    Schedule Delay
                  </span>
                  <div className="mt-1 text-base font-bold text-amber-600 font-mono tabular-nums">
                    +35 Days Delay
                  </div>
                  <span className="text-[11px] text-text-muted">Structural steel delivery</span>
                </div>

                <div className="sm:px-3 pt-2 sm:pt-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                    Extra Delay Cost
                  </span>
                  <div className="mt-1 text-base font-bold text-danger font-mono tabular-nums">
                    +$28,500
                  </div>
                  <span className="text-[11px] text-text-muted">Loan interest & site fees</span>
                </div>

                <div className="sm:px-3 pt-2 sm:pt-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                    Progress vs Plan
                  </span>
                  <div className="mt-1 text-base font-bold text-danger font-mono tabular-nums">
                    -16% Behind Plan
                  </div>
                  <span className="text-[11px] text-text-muted">42% done vs 58% planned</span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TWO COLUMNS: BUDGET TABLE & CATEGORY DONUT / DRAWS                        */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 spans): Budget vs Actuals Table */}
              <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h2 className="text-base font-bold text-text-primary">
                        Budget vs. Actuals
                      </h2>
                      <p className="text-xs text-text-muted mt-0.5">
                        Planned budget compared with money spent and remaining balance
                      </p>
                    </div>
                    <Link href={currentProjectId ? `/projects/${currentProjectId}/budget` : "/projects"}>
                      <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                        View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Original</th>
                          <th className="py-2.5 px-3 text-right">Approved</th>
                          <th className="py-2.5 px-3 text-right">Spent</th>
                          <th className="py-2.5 px-3 text-right">Difference</th>
                          <th className="py-2.5 px-3 text-center min-w-[100px]">Progress</th>
                          <th className="py-2.5 px-2 text-center">Docs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs">
                        {(d?.forecast_table || [
                          {
                            category: "Direct Construction / Hard Costs",
                            variance_reason: "Structural steel and foundation concrete adjustment",
                            original_budget: "950000",
                            current_approved: "1045000",
                            actual_spend: "702450",
                            forecast_final: "1045000",
                            variance: "-95000",
                            sources: []
                          },
                          {
                            category: "Soft Costs & Professional Fees",
                            variance_reason: "Architectural revision & expediter permits",
                            original_budget: "280000",
                            current_approved: "295000",
                            actual_spend: "234150",
                            forecast_final: "295000",
                            variance: "-15000",
                            sources: []
                          },
                          {
                            category: "Buffer Reserve",
                            variance_reason: "Buffer reserve absorbed into hard cost structural scope",
                            original_budget: "50000",
                            current_approved: "35000",
                            actual_spend: "0",
                            forecast_final: "35000",
                            variance: "15000",
                            sources: []
                          },
                          {
                            category: "Total Project Capital",
                            variance_reason: "Cumulative capital portfolio status",
                            original_budget: "1280000",
                            current_approved: "1375000",
                            actual_spend: "936600",
                            forecast_final: "1375000",
                            variance: "-95000",
                            sources: []
                          }
                        ]).map((row, idx) => {
                          const isTotal = row.category.toLowerCase().includes("total");
                          const approvedNum = Number(row.current_approved) || 0;
                          const actualNum = Number(row.actual_spend) || 0;
                          const spendPct = approvedNum > 0
                            ? Math.min(100, Math.round((actualNum / approvedNum) * 100))
                            : 0;

                          return (
                            <tr
                              key={idx}
                              className={`transition-colors ${
                                isTotal ? "font-bold bg-subtle/40" : "hover:bg-subtle/30"
                              }`}
                            >
                              <td className="py-3 px-3 text-text-primary">
                                <div className={isTotal ? "text-sm font-bold" : "font-medium"}>
                                  {row.category}
                                </div>
                                {!isTotal && row.variance_reason && (
                                  <div className="text-[11px] text-text-muted font-normal mt-0.5 line-clamp-1">
                                    {row.variance_reason}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums font-mono text-text-muted">
                                {formatMoney(Number(row.original_budget) * 100, { showCents: false })}
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums font-mono font-medium text-text-primary">
                                {formatMoney(Number(row.current_approved) * 100, { showCents: false })}
                              </td>
                              <td className="py-3 px-3 text-right tabular-nums font-mono text-text-secondary">
                                {formatMoney(Number(row.actual_spend) * 100, { showCents: false })}
                              </td>
                              <td
                                className={`py-3 px-3 text-right tabular-nums font-mono font-semibold ${
                                  Number(row.variance) < 0
                                    ? "text-danger"
                                    : Number(row.variance) > 0
                                    ? "text-success"
                                    : "text-text-muted"
                                }`}
                              >
                                {Number(row.variance) > 0
                                  ? `+${formatMoney(Number(row.variance) * 100, { showCents: false })}`
                                  : formatMoney(Number(row.variance) * 100, { showCents: false })}
                              </td>
                              <td className="py-3 px-3">
                                <div className="space-y-1">
                                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        spendPct > 90 ? "bg-amber-500" : "bg-primary"
                                      }`}
                                      style={{ width: `${spendPct}%` }}
                                    />
                                  </div>
                                  <div className="text-[10px] text-right font-mono text-text-muted">
                                    {spendPct}%
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <SourcesButton
                                  figureLabel={row.category}
                                  amountOrValue={formatMoney(row.current_approved)}
                                  basis={row.variance_reason}
                                  citations={row.sources}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column (1 span): Category Distribution Donut Chart & Draw Summary */}
              <div className="space-y-6">
                {/* Category Distribution Donut Card */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-sm font-bold text-text-primary">
                      Where the Money Goes
                    </h3>
                    <span className="text-[11px] font-medium text-text-muted">
                      Total: $936.6k
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col items-center">
                    {/* SVG Donut Visual */}
                    <div className="relative h-32 w-32 flex items-center justify-center my-2">
                      <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 36 36">
                        {/* Background track */}
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                        {/* Segment 1: Hard Costs ~ 75% */}
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
                        {/* Segment 2: Soft Costs ~ 22% */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="transparent"
                          stroke="#0d9488"
                          strokeWidth="4.5"
                          strokeDasharray="19.3 88"
                          strokeDashoffset="-66"
                        />
                        {/* Segment 3: Contingency ~ 3% */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="transparent"
                          stroke="#d97706"
                          strokeWidth="4.5"
                          strokeDasharray="2.7 88"
                          strokeDashoffset="-85.3"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-xs font-bold text-text-primary font-mono block">$936.6k</span>
                        <span className="text-[10px] text-text-muted block">Spent</span>
                      </div>
                    </div>

                    {/* Legend Breakdown */}
                    <div className="w-full mt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-text-secondary">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          Construction Work
                        </span>
                        <span className="font-mono font-semibold text-text-primary">$702,450 (75%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-text-secondary">
                          <span className="h-2 w-2 rounded-full bg-teal-600" />
                          Fees & Permits
                        </span>
                        <span className="font-mono font-semibold text-text-primary">$234,150 (22%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-text-secondary">
                          <span className="h-2 w-2 rounded-full bg-amber-600" />
                          Emergency Reserve
                        </span>
                        <span className="font-mono font-semibold text-text-primary">$35,000 (3%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Draw Status Summary */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                      <Landmark className="h-4 w-4 text-primary" />
                      Loan Draw Status
                    </h3>
                    <span className="rounded bg-primary-subtle px-2 py-0.5 text-caption font-semibold text-primary">
                      Draw #{d?.draw_summary?.latest_draw_number || 1}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Requested by Builder</span>
                      <span className="font-mono font-medium text-text-primary tabular-nums">
                        {formatMoney(Number(d?.draw_summary?.requested || 350000) * 100, { showCents: false })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Inspector Approved</span>
                      <span className="font-mono font-medium text-text-primary tabular-nums">
                        {formatMoney(Number(d?.draw_summary?.recommended || 342500) * 100, { showCents: false })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Bank Approved</span>
                      <span className="font-mono font-medium text-text-primary tabular-nums">
                        {formatMoney(Number(d?.draw_summary?.approved || 335000) * 100, { showCents: false })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <span className="font-semibold text-success">Cash Paid Out</span>
                      <span className="font-mono font-bold text-success tabular-nums">
                        {formatMoney(Number(d?.draw_summary?.cleared_funded || 335000) * 100, { showCents: false })}
                      </span>
                    </div>

                    <div className="pt-2">
                      <Link href={currentProjectId ? `/projects/${currentProjectId}/draws` : "/projects"}>
                        <Button variant="outline" size="sm" className="w-full justify-center text-xs font-semibold">
                          View Loan Draws <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
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
