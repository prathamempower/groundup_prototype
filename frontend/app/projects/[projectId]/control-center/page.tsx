"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { DocumentItem } from "@/lib/types";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentQuickPreviewModal } from "@/components/documents/document-quick-preview-modal";
import {
  AmountSourceOrigin,
  getControlCenterAmountOrigin,
} from "@/lib/data/control-center-origins";
import { AmountSourceModal } from "@/components/control-center/amount-source-modal";
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

  const [selectedOrigin, setSelectedOrigin] = useState<AmountSourceOrigin | null>(null);
  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);

  const handleOpenAmountOrigin = (
    key: string,
    label?: string,
    amountCents?: number
  ) => {
    const origin = getControlCenterAmountOrigin(key, label, amountCents);
    setSelectedOrigin(origin);
    setIsOriginModalOpen(true);
  };

  const handleInspectDocument = (fileName: string) => {
    setIsOriginModalOpen(false);
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
  const meta = dashboardData?.meta;
  const kpis = d?.kpis;
  const project = d?.project || currentProject;
  const isSetupIncomplete = project?.status === "SETUP_INCOMPLETE" || !kpis?.forecast_profit?.amount;

  return (
    <div className="min-h-full w-full bg-slate-50/60 pb-16 min-w-0">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-5 sm:space-y-6 min-w-0">

        {/* ========================================================================= */}
        {/* EXECUTIVE PROJECT BANNER                                                  */}
        {/* ========================================================================= */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {project?.name || "73 Broadway"}
                </h1>
                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 px-2.5 py-0.5 text-xs font-semibold">
                  {project?.lifecycle_stage
                    ? project.lifecycle_stage.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                    : "Construction"}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  {project?.address || "73 Broadway, Jersey City, NJ 07306"}
                </span>
                <span className="hidden sm:inline text-slate-300">·</span>
                <span className="flex items-center gap-1 text-slate-600">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">

          {/* Card 1: APPROVED BUDGET */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-1 min-h-[20px] sm:min-h-[22px]">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Approved Budget
                </span>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-base sm:text-xl lg:text-[22px] xl:text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums leading-none">
                  <ClickableAmount
                    amountText="$1,471,120.00"
                    originKey="approved_budget"
                    label="Approved Project Budget"
                    amountCents={147112000}
                    onClick={handleOpenAmountOrigin}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: ACTUAL SPEND */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-1 min-h-[20px] sm:min-h-[22px]">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Actual Spend
                </span>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-base sm:text-xl lg:text-[22px] xl:text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums leading-none">
                  <ClickableAmount
                    amountText="$1,066,920.00"
                    originKey="actual_spend"
                    label="Total Actual Spend to Date (Draws 1-3)"
                    amountCents={106692000}
                    onClick={handleOpenAmountOrigin}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: DRAW RECEIVED */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-1 min-h-[20px] sm:min-h-[22px]">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Draw Received
                </span>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-base sm:text-xl lg:text-[22px] xl:text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums leading-none">
                  <ClickableAmount
                    amountText="$1,086,000.00"
                    originKey="draw_received"
                    label="Draw Received"
                    amountCents={108600000}
                    onClick={handleOpenAmountOrigin}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: ESTIMATED COMPLETION */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-1 min-h-[20px] sm:min-h-[22px]">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Completion
                </span>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-base sm:text-xl lg:text-[22px] xl:text-2xl font-bold tracking-tight text-slate-900 font-mono leading-none">
                  <ClickableAmount
                    amountText="Dec 15, 2025"
                    originKey="completion_timeline"
                    label="Project Completion Timeline & Schedule"
                    onClick={handleOpenAmountOrigin}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Amount Source Origin & Document Provenance Modal */}
      <AmountSourceModal
        open={isOriginModalOpen}
        onOpenChange={setIsOriginModalOpen}
        origin={selectedOrigin}
        onInspectDocument={handleInspectDocument}
      />

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
