"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { DocumentItem } from "@/lib/types";
import { predictTimelineSchedule } from "@/lib/utils/timeline-prediction";
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  FileText,
  Lock,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentQuickPreviewModal } from "@/components/documents/document-quick-preview-modal";
import {
  AmountSourceOrigin,
  getControlCenterAmountOrigin,
} from "@/lib/data/control-center-origins";
import { MetricDetailPanel } from "@/components/control-center/metric-detail-panel";
import { cn } from "@/lib/utils";

function ClickableAmount({
  amountText,
  originKey,
  label,
  amountCents,
  className,
  onClick,
  title = "Click to inspect source origin",
}: {
  amountText: React.ReactNode;
  originKey: string;
  label?: string;
  amountCents?: number;
  className?: string;
  onClick: (key: string, label?: string, amountCents?: number) => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(originKey, label, amountCents);
      }}
      title={title}
      className={cn(
        "cursor-pointer hover:text-blue-600 transition-colors text-left focus:outline-hidden",
        className
      )}
    >
      <span>{amountText}</span>
    </button>
  );
}

export default function ControlCenterPage() {
  const params = useParams();
  const urlProjectId = (params?.projectId as string) || "";

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const projects = projectsData?.data?.projects || [];
  const broadwayProject = projects.find((p) => p.id === "df16b577-3585-4fb0-a13a-ffadaca73e0f" || p.name?.toLowerCase().includes("broadway"));
  const defaultProjectId = broadwayProject?.id || projectsData?.data?.current_project_id || "df16b577-3585-4fb0-a13a-ffadaca73e0f";
  const currentProjectId = urlProjectId || defaultProjectId;
  const currentProject = projects.find((p) => p.id === currentProjectId) || broadwayProject || projects[0];

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

  const [selectedOriginKey, setSelectedOriginKey] = useState<string | null>("approved_budget");

  const selectedOrigin = useMemo(() => {
    if (!selectedOriginKey) return null;
    return getControlCenterAmountOrigin(selectedOriginKey);
  }, [selectedOriginKey]);

  const handleSelectMetric = (key: string) => {
    setSelectedOriginKey((prev) => (prev === key ? null : key));
  };

  // Real-time timeline schedule state synced with timeline editor
  const [timelineDelayDays, setTimelineDelayDays] = useState<number>(35);
  const [timelineOverrides, setTimelineOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    const readSchedule = () => {
      if (typeof window === "undefined") return;
      try {
        const saved = localStorage.getItem("groundup_timeline_schedule_completion_timeline");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.delayDays === "number") setTimelineDelayDays(parsed.delayDays);
          if (parsed.userOverrides && typeof parsed.userOverrides === "object") {
            setTimelineOverrides(parsed.userOverrides);
          }
        }
      } catch {
        // Ignore parse errors
      }
    };
    readSchedule();
    window.addEventListener("storage", readSchedule);
    return () => window.removeEventListener("storage", readSchedule);
  }, []);

  const timelinePredicted = useMemo(() => {
    return predictTimelineSchedule(timelineDelayDays, timelineOverrides);
  }, [timelineDelayDays, timelineOverrides]);

  const handleInspectDocument = (fileName: string) => {
    const cleanSearch = fileName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const matchedDoc = projectDocs.find((doc) => {
      const cleanDoc = doc.original_filename.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleanDoc.includes(cleanSearch) || cleanSearch.includes(cleanDoc);
    });

    if (matchedDoc) {
      setPreviewDoc(matchedDoc);
    } else {
      const isPdf = fileName.toLowerCase().endsWith(".pdf");
      const virtualDoc: DocumentItem = {
        id: "doc-" + fileName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        organization_id: currentProject?.organization_id || "org_default",
        project_id: currentProjectId || currentProject?.id || "",
        original_filename: fileName,
        mime_type: isPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        document_type: isPdf ? "BUDGET_SOV" : "DRAW_PACKAGE",
        document_date: "2025-04-01",
        ingestion_status: "REVIEWED",
        uploaded_by: "system",
        uploaded_at: new Date().toISOString(),
        pages_count: 1,
      };
      setPreviewDoc(virtualDoc);
    }
  };

  const isLoading = isProjectsLoading || isDashboardLoading;

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="h-6 w-48 rounded shimmer-wave bg-slate-100 mb-2" />
          <div className="h-3.5 w-72 rounded shimmer-wave bg-slate-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
      </div>
    );
  }

  const d = dashboardData?.data;
  const project = d?.project || currentProject;

  const isApprovedBudgetActive = selectedOriginKey === "approved_budget";
  const isSelfFundActive = selectedOriginKey === "self_fund";
  const isActualSpendActive = selectedOriginKey === "actual_spend";
  const isDrawReceivedActive = selectedOriginKey === "draw_received";
  const isTimelineActive = selectedOriginKey === "completion_timeline";

  return (
    <div className="min-h-full w-full max-w-full overflow-x-hidden bg-slate-50/60 pb-16 min-w-0">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-3.5 sm:space-y-6 min-w-0 max-w-full">

        {/* ========================================================================= */}
        {/* EXECUTIVE PROJECT BANNER                                                  */}
        {/* ========================================================================= */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs transition-shadow hover:shadow-sm min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                  {project?.name || "73 Broadway"}
                </h1>
                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 px-2 py-0.5 text-[11px] sm:text-xs font-semibold shrink-0">
                  {project?.lifecycle_stage
                    ? project.lifecycle_stage.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                    : "Construction"}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1">
                <span className="flex items-center gap-1 text-slate-600 truncate">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{project?.address || "73 Broadway, Jersey City, NJ 07306"}</span>
                </span>
                <span className="hidden sm:inline text-slate-300">·</span>
                <span className="flex items-center gap-1 text-slate-600 truncate">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  General Contractor: <span className="font-semibold text-slate-800 ml-0.5">Apex Build Corp</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 CORE EXECUTIVE METRIC CARDS                                             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full min-w-0">

          {/* Card 1: APPROVED BUDGET & SELF FUND */}
          <div
            className={cn(
              "relative rounded-xl border p-3 sm:p-4 lg:p-5 flex flex-col justify-between transition-all select-none min-w-0 h-full",
              isApprovedBudgetActive || isSelfFundActive
                ? "border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20 shadow-xs"
                : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs"
            )}
          >
            <div className="w-full min-w-0">
              {/* Approved Budget Main Section */}
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isApprovedBudgetActive}
                onClick={() => handleSelectMetric("approved_budget")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectMetric("approved_budget");
                  }
                }}
                title="Click to view Approved Budget breakdown below"
                className="cursor-pointer group rounded-md p-1 -m-1 transition-colors hover:bg-slate-50/60"
              >
                <div className="flex items-start justify-between gap-1 min-h-[26px] sm:min-h-[22px]">
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs font-semibold uppercase tracking-tight sm:tracking-wider leading-tight transition-colors line-clamp-2",
                      isApprovedBudgetActive ? "text-blue-700 font-bold" : "text-slate-500 group-hover:text-slate-700"
                    )}
                  >
                    Approved Budget
                  </span>
                </div>
                <div className="mt-1 sm:mt-2 lg:mt-3">
                  <div
                    className={cn(
                      "text-sm xs:text-base sm:text-xl lg:text-[22px] xl:text-2xl font-bold tracking-tight font-mono tabular-nums leading-none transition-colors truncate",
                      isApprovedBudgetActive ? "text-blue-900" : "text-slate-900 group-hover:text-blue-950"
                    )}
                  >
                    $1,471,120.00
                  </div>
                </div>
              </div>

              {/* Sub header: Self Fund / Additional Cost */}
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isSelfFundActive}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectMetric("self_fund");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectMetric("self_fund");
                  }
                }}
                title="Click to view Self Fund vs Additional Cost comparison table"
                className={cn(
                  "mt-3 pt-2.5 border-t transition-all rounded-md px-2 py-1.5 cursor-pointer -mx-1",
                  isSelfFundActive
                    ? "bg-blue-100/70 border-blue-300 ring-1 ring-blue-500/40"
                    : "border-slate-100 hover:bg-slate-100/70 hover:border-slate-200"
                )}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider truncate",
                      isSelfFundActive ? "text-blue-700 font-bold" : "text-slate-500"
                    )}
                  >
                    Self Fund / Additional Cost
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    Left: <strong className="text-slate-900 font-bold">$40,000</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] sm:text-xs">
                  <span className="text-black font-bold tabular-nums" title="Self Fund Amount">
                    $50,000
                  </span>
                  <span className="text-red-600 font-bold tabular-nums" title="Additional Cost Incurred">
                    -$10,000
                  </span>
                </div>
              </div>
            </div>
            {(isApprovedBudgetActive || isSelfFundActive) && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-b border-r border-blue-600 rotate-45 z-10 hidden lg:block" />
            )}
          </div>

          {/* Card 2: ACTUAL SPEND */}
          <div
            role="button"
            tabIndex={0}
            aria-expanded={isActualSpendActive}
            onClick={() => handleSelectMetric("actual_spend")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelectMetric("actual_spend");
              }
            }}
            title="Click to view Actual Spend breakdown below"
            className={cn(
              "relative rounded-xl border p-3 sm:p-4 lg:p-5 flex flex-col justify-between transition-all cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 select-none min-w-0 h-full",
              isActualSpendActive
                ? "border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20 shadow-xs"
                : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs"
            )}
          >
            <div className="w-full min-w-0">
              <div className="flex items-start justify-between gap-1 min-h-[26px] sm:min-h-[22px]">
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-semibold uppercase tracking-tight sm:tracking-wider leading-tight transition-colors line-clamp-2",
                    isActualSpendActive ? "text-blue-700 font-bold" : "text-slate-500"
                  )}
                >
                  Actual Spend
                </span>
              </div>
              <div className="mt-1 sm:mt-2 lg:mt-3">
                <div
                  className={cn(
                    "text-sm xs:text-base sm:text-xl lg:text-[22px] xl:text-2xl font-bold tracking-tight font-mono tabular-nums leading-none transition-colors truncate",
                    isActualSpendActive ? "text-blue-900" : "text-slate-900"
                  )}
                >
                  $1,066,920.00
                </div>
              </div>
            </div>
            {isActualSpendActive && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-b border-r border-blue-600 rotate-45 z-10 hidden lg:block" />
            )}
          </div>

          {/* Card 3: DRAW RECEIVED */}
          <div
            role="button"
            tabIndex={0}
            aria-expanded={isDrawReceivedActive}
            onClick={() => handleSelectMetric("draw_received")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelectMetric("draw_received");
              }
            }}
            title="Click to view Draw Received breakdown below"
            className={cn(
              "relative rounded-xl border p-3 sm:p-4 lg:p-5 flex flex-col justify-between transition-all cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 select-none min-w-0 h-full",
              isDrawReceivedActive
                ? "border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20 shadow-xs"
                : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs"
            )}
          >
            <div className="w-full min-w-0">
              <div className="flex items-start justify-between gap-1 min-h-[26px] sm:min-h-[22px]">
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-semibold uppercase tracking-tight sm:tracking-wider leading-tight transition-colors line-clamp-2",
                    isDrawReceivedActive ? "text-blue-700 font-bold" : "text-slate-500"
                  )}
                >
                  Draw Received
                </span>
              </div>
              <div className="mt-1 sm:mt-2 lg:mt-3">
                <div
                  className={cn(
                    "text-sm xs:text-base sm:text-xl lg:text-[22px] xl:text-2xl font-bold tracking-tight font-mono tabular-nums leading-none transition-colors truncate",
                    isDrawReceivedActive ? "text-blue-900" : "text-slate-900"
                  )}
                >
                  $1,086,000.00
                </div>
              </div>
            </div>
            {isDrawReceivedActive && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-b border-r border-blue-600 rotate-45 z-10 hidden lg:block" />
            )}
          </div>

          {/* Card 4: CONSTRUCTION TIMELINE */}
          <div
            role="button"
            tabIndex={0}
            aria-expanded={isTimelineActive}
            onClick={() => handleSelectMetric("completion_timeline")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelectMetric("completion_timeline");
              }
            }}
            title="Click to view Construction Timeline schedule below"
            className={cn(
              "relative rounded-xl border p-3 sm:p-4 lg:p-5 flex flex-col justify-between transition-all cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 select-none min-w-0 h-full",
              isTimelineActive
                ? "border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20 shadow-xs"
                : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs"
            )}
          >
            <div className="w-full min-w-0">
              <div className="flex items-start justify-between gap-1 min-h-[26px] sm:min-h-[22px]">
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-semibold uppercase tracking-tight sm:tracking-wider leading-tight transition-colors line-clamp-2",
                    isTimelineActive ? "text-blue-700 font-bold" : "text-slate-500"
                  )}
                >
                  Construction Timeline
                </span>
              </div>
              <div className="mt-1 sm:mt-2 lg:mt-3 space-y-1.5">
                <div
                  className={cn(
                    "text-sm xs:text-base sm:text-xl lg:text-[22px] xl:text-2xl font-bold tracking-tight font-mono leading-none transition-colors truncate",
                    isTimelineActive ? "text-blue-900" : "text-slate-900"
                  )}
                >
                  {timelinePredicted.finalCoDate || "Dec 15, 2025"}
                </div>

                {/* Visual Progress & Delay Slip Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 flex overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: "62%" }}
                    title="Progress: 62%"
                  />
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${Math.min(30, Math.round((timelineDelayDays / 35) * 23))}%` }}
                    title={`Delay Slip: +${timelineDelayDays}d`}
                  />
                  <div
                    className="bg-slate-200 h-full flex-1"
                    title="Remaining: 15%"
                  />
                </div>

                {/* Old Target Timeline vs Delay Slip */}
                <div className="flex items-center justify-between text-[11px] font-mono leading-tight">
                  <span className="text-slate-500 font-medium truncate mr-1">
                    Target: <strong className="text-slate-700 font-semibold">Nov 10</strong>
                  </span>
                  <span className="text-amber-700 font-bold shrink-0">
                    Slip: {Math.round(timelineDelayDays / 7)} wks
                  </span>
                </div>

                {/* Carrying Interest & Delay Days */}
                <div className="flex items-center justify-between text-[10px] font-mono text-amber-700/90 leading-tight">
                  <span className="inline-flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5 text-amber-600 shrink-0" />
                    +{timelineDelayDays}d delay
                  </span>
                  <span>{timelinePredicted.interestCarry.formatted.replace(",000", ".5k")} interest</span>
                </div>
              </div>
            </div>
            {isTimelineActive && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-b border-r border-blue-600 rotate-45 z-10 hidden lg:block" />
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* INLINE METRIC BREAKDOWN PANEL                                             */}
        {/* ========================================================================= */}
        {selectedOrigin && (
          <div className="pt-0.5 w-full max-w-full min-w-0 overflow-hidden">
            <MetricDetailPanel
              origin={selectedOrigin}
              onClose={() => setSelectedOriginKey(null)}
              onInspectDocument={handleInspectDocument}
            />
          </div>
        )}

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
