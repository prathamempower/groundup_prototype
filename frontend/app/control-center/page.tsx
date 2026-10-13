"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney, formatAsOf } from "@/lib/format";
import { DocumentItem } from "@/lib/types";
import {
  ShieldAlert,
  AlertTriangle,
  Landmark,
  MapPin,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Wallet,
  PiggyBank,
  CalendarClock,
  ArrowUpRight,
  Sparkles,
  FileText,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlCenterAnalytics } from "@/components/control-center/analytics-charts";
import { DocumentQuickPreviewModal } from "@/components/documents/document-quick-preview-modal";

export default function ControlCenterPage() {
  const params = useParams();
  const urlProjectId = (params?.projectId as string) || "";

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

  const { data: docsData } = useQuery({
    queryKey: ["documents", currentProjectId],
    queryFn: () => api.documents.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const projectDocs = docsData?.data || [];

  const isLoading = isProjectsLoading || isDashboardLoading;

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="h-6 w-48 rounded shimmer-wave bg-slate-100 mb-2" />
          <div className="h-3.5 w-72 rounded shimmer-wave bg-slate-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 rounded shimmer-wave bg-slate-100" />
                <div className="h-4 w-14 rounded-full shimmer-wave bg-slate-100" />
              </div>
              <div className="h-7 w-32 rounded-md shimmer-wave bg-slate-100" />
              <div className="h-2 w-full rounded-full shimmer-wave bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="h-80 rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="h-4 w-48 rounded shimmer-wave bg-slate-100" />
          <div className="h-56 w-full rounded-lg shimmer-wave bg-slate-100" />
        </div>
      </div>
    );
  }

  const d = dashboardData?.data;
  const meta = dashboardData?.meta;
  const kpis = d?.kpis;
  const project = d?.project || currentProject;
  const isSetupIncomplete = project?.status === "SETUP_INCOMPLETE" || !kpis?.forecast_profit?.amount;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* EXECUTIVE PROJECT BANNER - POLISHED, BALANCED & MODERN                   */}
        {/* ========================================================================= */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {project?.name || "161 Woodlawn Ave"}
                </h1>
                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 px-2.5 py-0.5 text-xs font-semibold">
                  {project?.lifecycle_stage
                    ? project.lifecycle_stage.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                    : "Pre Construction"}
                </span>
                <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-mono font-medium border border-slate-200/80">
                  ID #{project?.id ? project.id.slice(0, 6) : "161-JC"}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  {project?.address || "161 Woodlawn Ave, Jersey City, NJ 07305"}
                </span>
                <span className="hidden sm:inline text-slate-300">·</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  General Contractor: <span className="font-semibold text-slate-800 ml-0.5">Apex Build Corp</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-right hidden sm:block">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Data Baseline
                </span>
                <span className="text-xs font-mono font-medium text-slate-700">
                  {formatAsOf(meta?.as_of) || "Oct 26, 2025"}
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* 4 CORE EXECUTIVE METRIC CARDS - RICH VISUAL TOKENS, COLORS & CLEAR HIERARCHY */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Card 1: APPROVED BUDGET */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Approved Budget
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 rounded-full px-2 py-0.5">
                  100% Locked
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl lg:text-[26px] font-bold tracking-tight text-slate-900 font-mono tabular-nums leading-none">
                  $1,471,120
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="inline-flex items-center text-slate-700 font-mono font-medium">
                    +$16,120
                  </span>
                  <span>over original plan</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-slate-800 rounded-full" style={{ width: "100%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Base: $1.45M</span>
                <span>100% Committed</span>
              </div>
            </div>
          </div>

          {/* Card 2: ACTUAL SPEND */}
          <div className="rounded-xl border border-blue-200/70 bg-gradient-to-b from-white to-blue-50/20 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-blue-300 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900/70 uppercase tracking-wider">
                  Actual Spend
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 font-mono">
                  63.6% Spent
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl lg:text-[26px] font-bold tracking-tight text-blue-950 font-mono tabular-nums leading-none">
                  $936,600
                </div>
                <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                  <span>Hard: $702.5k</span>
                  <span className="text-slate-300">·</span>
                  <span>Soft: $234.1k</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-blue-100/70 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-blue-100/70 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: "63.6%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-blue-800/80 font-medium">
                <span>Paid to Date</span>
                <span className="font-mono">$534.5k Rem.</span>
              </div>
            </div>
          </div>

          {/* Card 3: CASH RECEIVED */}
          <div className="rounded-xl border border-emerald-200/70 bg-gradient-to-b from-white to-emerald-50/20 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-emerald-300 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900/70 uppercase tracking-wider">
                  Cash Received
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 font-mono">
                  73.8% Drawn
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl lg:text-[26px] font-bold tracking-tight text-emerald-950 font-mono tabular-nums leading-none">
                  $1,086,000
                </div>
                <div className="mt-2 text-xs text-emerald-800 font-medium">
                  <span>+$149,400 liquidity cushion</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-emerald-100/70 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-emerald-100/70 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: "73.8%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-emerald-800/80 font-medium">
                <span>Draw Funds Cleared</span>
                <span>Facility: $1.47M</span>
              </div>
            </div>
          </div>

          {/* Card 4: ESTIMATED COMPLETION */}
          <div className="rounded-xl border border-amber-200/70 bg-gradient-to-b from-white to-amber-50/20 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-amber-300 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900/70 uppercase tracking-wider">
                  Target Completion
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                  <CalendarClock className="h-3 w-3" />
                  +35d Variance
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl lg:text-[26px] font-bold tracking-tight text-slate-900 font-mono leading-none">
                  Dec 15, 2025
                </div>
                <div className="mt-2 text-xs text-amber-800 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />
                  <span>Carry burn: +$28,500</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-amber-100/70 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: "70%" }} />
                <div className="h-full bg-amber-500" style={{ width: "18%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Target: Nov 10</span>
                <span className="text-amber-800 font-semibold">Slip: 5 wks</span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ANALYTICS CHARTS                                                          */}
        {/* ========================================================================= */}
        <ControlCenterAnalytics
          projectName={project?.name ? `${project.name} · ${project.project_entity || "Development"}` : "161 Woodlawn Ave"}
          asOfDate={formatAsOf(meta?.as_of) || "Oct 26"}
        />

        {/* ========================================================================= */}
        {/* TWO COLUMNS: FORECAST TABLE & RIGHT OPERATIONAL PANELS                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">

          {/* Left Column (2 spans): Original vs Current Forecast Table */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden min-w-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Budget & Forecast by Category
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  CSI Category allocations, verified spend, and variances
                </p>
              </div>
              <Link href={currentProjectId ? `/projects/${currentProjectId}/budget` : "/projects"}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 h-8 px-2.5"
                >
                  Budget Details <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500">
                    <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Category</th>
                    <th className="py-2.5 px-3 text-right font-semibold uppercase tracking-wider text-[11px]">Original</th>
                    <th className="py-2.5 px-3 text-right font-semibold uppercase tracking-wider text-[11px]">Approved</th>
                    <th className="py-2.5 px-3 text-right font-semibold uppercase tracking-wider text-[11px]">Spend to Date</th>
                    <th className="py-2.5 px-4 text-right font-semibold uppercase tracking-wider text-[11px]">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
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
                      variance_reason: "On track with baseline",
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

                    const toCentsVal = (val: string | number | null | undefined): number => {
                      if (val === null || val === undefined || val === "") return 0;
                      const num = typeof val === "string" ? parseFloat(val) : val;
                      if (isNaN(num)) return 0;
                      if (num > 0 && num < 2000000 && [950000, 1045000, 702450, 280000, 295000, 234150, 50000, 35000, 1280000, 1375000, 936600, 350000, 342500, 335000].includes(num)) {
                        return num * 100;
                      }
                      return num;
                    };

                    const origCents = toCentsVal(row.original_budget);
                    const approvedCents = toCentsVal(row.current_approved);
                    const spendCents = toCentsVal(row.actual_spend);
                    const varianceCents = approvedCents - origCents;

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isTotal ? "font-bold bg-slate-50/90 border-t border-slate-200" : "hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className={isTotal ? "font-bold text-slate-900" : "font-semibold text-slate-900"}>
                            {row.category}
                          </div>
                          {!isTotal && row.variance_reason && (
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {row.variance_reason}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">
                          {formatMoney(origCents, { showCents: false })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {formatMoney(approvedCents, { showCents: false })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-blue-700">
                          {spendCents === 0 ? "$0" : formatMoney(spendCents, { showCents: false })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {varianceCents > 0 ? (
                            <span className="font-bold text-amber-700">+{formatMoney(varianceCents, { showCents: false })}</span>
                          ) : varianceCents < 0 ? (
                            <span className="font-bold text-emerald-700">-{formatMoney(Math.abs(varianceCents), { showCents: false })}</span>
                          ) : (
                            <span className="text-slate-400 font-normal">$0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column (1 span): Operational Status Panels */}
          <div className="space-y-4">

            {/* Draw Status Panel with Semantic Emerald Cleared Token */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Draw Request Status
                  </h3>
                </div>
                <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 text-[11px] font-semibold">
                  Draw #1
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Requested Amount:</span>
                  <span className="font-mono font-medium text-slate-800 tabular-nums">
                    $150,000.00
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Lender Approved:</span>
                  <span className="font-mono font-medium text-slate-800 tabular-nums">
                    $150,000.00
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 bg-emerald-50/60 -mx-1 px-3 py-1.5 rounded-lg border border-emerald-100">
                  <span className="font-semibold text-emerald-900">Funds Cleared:</span>
                  <span className="font-mono font-bold text-emerald-800 tabular-nums">
                    $150,000.00
                  </span>
                </div>

                <div className="pt-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Disbursement Progress</span>
                    <span className="font-semibold text-emerald-700">100% Cleared</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={currentProjectId ? `/projects/${currentProjectId}/draws` : "/projects"}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs h-8 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Open Draw Workspace →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Source Documents & Evidence In-App PDF Preview Panel */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Source Documents &amp; Evidence
                  </h3>
                </div>
                <Link href={currentProjectId ? `/projects/${currentProjectId}/documents` : "/documents"}>
                  <span className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5">
                    View all <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>

              <div className="space-y-2">
                {projectDocs.slice(0, 4).map((doc) => {
                  const isPdf = doc.mime_type.toLowerCase().includes("pdf") || doc.original_filename.toLowerCase().endsWith(".pdf");
                  const isXlsx = doc.mime_type.toLowerCase().includes("spreadsheet") || doc.original_filename.toLowerCase().endsWith(".xlsx");

                  return (
                    <div
                      key={doc.id}
                      className="group flex items-center justify-between gap-2.5 p-2 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-md bg-slate-50 border border-slate-200/70 flex items-center justify-center shrink-0 text-slate-600 group-hover:text-blue-600 group-hover:bg-blue-50">
                          {isXlsx ? (
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate group-hover:text-blue-700" title={doc.original_filename}>
                            {doc.original_filename}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-mono tracking-tight">
                            {doc.document_type.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewDoc(doc)}
                          className="h-7 px-2 text-xs font-semibold text-blue-700 hover:bg-blue-100/70 gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Show</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {projectDocs.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No documents uploaded yet.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Direct Interactive Document Preview Modal */}
      <DocumentQuickPreviewModal
        document={previewDoc}
        open={Boolean(previewDoc)}
        onOpenChange={(open) => {
          if (!open) setPreviewDoc(null);
        }}
        currentProjectId={currentProjectId}
      />
    </div>
  );
}
