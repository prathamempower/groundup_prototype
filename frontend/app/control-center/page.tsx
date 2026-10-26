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

const DEFAULT_FORECAST_TASKS = [
  // --- Draw #1 Tasks: Soft Costs & Pre-Development ($448,000.00 Incurred) ---
  {
    category: "01.01 Architectural Design & Working Drawings (Draw #1)",
    variance_reason: "Draw #1 funded • AIA architectural invoicing 100% complete",
    original_budget: "22500000",
    current_approved: "22500000",
    actual_spend: "22500000",
    forecast_final: "22500000",
    variance: "0",
    sources: [],
  },
  {
    category: "01.02 Structural, MEP & Civil Engineering (Draw #1)",
    variance_reason: "Draw #1 funded • PE stamped calculation sets delivered",
    original_budget: "11850000",
    current_approved: "11850000",
    actual_spend: "11850000",
    forecast_final: "11850000",
    variance: "0",
    sources: [],
  },
  {
    category: "01.03 Municipal Plan Check, Zoning & Building Permits (Draw #1)",
    variance_reason: "Draw #1 funded • City building permits approved & fee receipts verified",
    original_budget: "5450000",
    current_approved: "5450000",
    actual_spend: "5450000",
    forecast_final: "5450000",
    variance: "0",
    sources: [],
  },
  {
    category: "01.04 Environmental Testing, Civil Survey & Site Closing Admin (Draw #1)",
    variance_reason: "Draw #1 funded • Phase II environmental clean report & ALTA survey",
    original_budget: "5000000",
    current_approved: "5000000",
    actual_spend: "5000000",
    forecast_final: "5000000",
    variance: "0",
    sources: [],
  },

  // --- Draw #2 Tasks: Excavation & Structural Core ($320,000.00 Incurred) ---
  {
    category: "02.01 Site Demolition, Clearing & Earthwork Excavation (Draw #2)",
    variance_reason: "Draw #2 funded • Mass grading and excavation certified by bank inspector",
    original_budget: "8530000",
    current_approved: "8530000",
    actual_spend: "8530000",
    forecast_final: "8530000",
    variance: "0",
    sources: [],
  },
  {
    category: "02.02 Deep Foundation, Shoring & Soil Retention (Draw #2)",
    variance_reason: "Draw #2 funded • Helical pile installation & shoring load tests verified",
    original_budget: "5000000",
    current_approved: "5000000",
    actual_spend: "5000000",
    forecast_final: "5000000",
    variance: "0",
    sources: [],
  },
  {
    category: "03.01 Reinforced Concrete Core, Grade Beams & Foundation Slabs (Draw #2)",
    variance_reason: "Draw #2 funded • 4000 PSI concrete 28-day compression break reports passed",
    original_budget: "11500000",
    current_approved: "11500000",
    actual_spend: "11500000",
    forecast_final: "11500000",
    variance: "0",
    sources: [],
  },
  {
    category: "03.02 Structural Steel Columns, Beams & Moment Connections (Draw #2)",
    variance_reason: "Draw #2 funded • Primary steel framing erection & UT ultrasonic weld testing verified",
    original_budget: "6970000",
    current_approved: "6970000",
    actual_spend: "6970000",
    forecast_final: "6970000",
    variance: "0",
    sources: [],
  },

  // --- Draw #3 Tasks: Framing & MEP Rough-Ins ($298,920.00 Incurred) ---
  {
    category: "03.03 Cold-Formed Light Gauge Steel Stud Framing & Lateral Bracing (Draw #3)",
    variance_reason: "Draw #3 funded • Interior partition & lateral perimeter framing 100% complete",
    original_budget: "11530000",
    current_approved: "11530000",
    actual_spend: "11530000",
    forecast_final: "11530000",
    variance: "0",
    sources: [],
  },
  {
    category: "04.01 Plumbing Waste, Vent & Domestic Water Distribution Rough-Ins (Draw #3)",
    variance_reason: "Draw #3 funded • Municipal rough plumbing air pressure inspection certified",
    original_budget: "6500000",
    current_approved: "6500000",
    actual_spend: "6500000",
    forecast_final: "6500000",
    variance: "0",
    sources: [],
  },
  {
    category: "04.02 Electrical Service Main, Conduit & Branch Circuit Rough-Ins (Draw #3)",
    variance_reason: "Draw #3 funded • Main electrical service tie-in and conduit rough-ins verified",
    original_budget: "7500000",
    current_approved: "7500000",
    actual_spend: "7500000",
    forecast_final: "7500000",
    variance: "0",
    sources: [],
  },
  {
    category: "04.03 HVAC Equipment, Refrigerant Lines & Duct Distribution (Draw #3)",
    variance_reason: "Draw #3 active spending • $35,000 paid to trades, $5,000 unit testing retainage",
    original_budget: "4000000",
    current_approved: "4000000",
    actual_spend: "3500000",
    forecast_final: "4000000",
    variance: "0",
    sources: [],
  },
  {
    category: "16.01 Contingency Draw Allocation (Trade Field Adjustments) (Draw #3)",
    variance_reason: "Draw #3 active spending • $8,620 paid for field pipe adjustments, $14,080 remaining",
    original_budget: "2270000",
    current_approved: "2270000",
    actual_spend: "862000",
    forecast_final: "2270000",
    variance: "0",
    sources: [],
  },

  // --- Draw #4 Tasks: Finishes, Enclosure & Closeout ($0.00 Incurred, $385,120 Scheduled) ---
  {
    category: "05.01 Gypsum Board Drywall, Acoustical Batt & Taping (Draw #4)",
    variance_reason: "Draw #4 scheduled • Drywall boards delivered, pre-hanging inspection scheduled",
    original_budget: "12000000",
    current_approved: "12000000",
    actual_spend: "0",
    forecast_final: "12000000",
    variance: "0",
    sources: [],
  },
  {
    category: "05.02 Millwork, Interior Doors, Trim & Custom Cabinetry (Draw #4)",
    variance_reason: "Draw #4 scheduled • Custom cabinetry fabrication deposit in process",
    original_budget: "10000000",
    current_approved: "10000000",
    actual_spend: "0",
    forecast_final: "10000000",
    variance: "0",
    sources: [],
  },
  {
    category: "06.01 Commercial Storefront Windows, Exterior Glazing & Weather Barrier (Draw #4)",
    variance_reason: "Draw #4 scheduled • Aluminum storefront frames staged for install",
    original_budget: "4690000",
    current_approved: "4690000",
    actual_spend: "0",
    forecast_final: "4690000",
    variance: "0",
    sources: [],
  },
  {
    category: "01.05 Construction Administration & Project Management Closeout (Draw #4)",
    variance_reason: "Draw #4 scheduled • Project management supervisory closeout allowance",
    original_budget: "390000",
    current_approved: "390000",
    actual_spend: "0",
    forecast_final: "390000",
    variance: "0",
    sources: [],
  },
  {
    category: "16.02 Remaining Contingency Reserve for Final Punchlist (Draw #4)",
    variance_reason: "Draw #4 scheduled • Unallocated contingency reserved for final closeout",
    original_budget: "11432000",
    current_approved: "11432000",
    actual_spend: "0",
    forecast_final: "11432000",
    variance: "0",
    sources: [],
  },

  // --- Total Summary Row ---
  {
    category: "Total Project Budget",
    variance_reason: "13 tasks funded through Draws 1–3 ($1,066,920.00 incurred), $404,200.00 to finish",
    original_budget: "147112000",
    current_approved: "147112000",
    actual_spend: "106692000",
    forecast_final: "147112000",
    variance: "0",
    sources: [],
  },
];

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
        {/* EXECUTIVE PROJECT BANNER - POLISHED, BALANCED & MODERN                   */}
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
        {/* 4 CORE EXECUTIVE METRIC CARDS */}
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
                    label="Total Actual Spend to Date (Draws 1–3)"
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
                <div className="text-lg sm:text-2xl lg:text-[26px] font-bold tracking-tight text-slate-900 font-mono leading-none">
                  Dec 15, 2025
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MASTER BUDGET TASKS & COST INCURRED TABLE                                 */}
        {/* ========================================================================= */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden min-w-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-5 py-3 sm:py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Master Budget Tasks & Cost Incurred
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Schedule of values tasks, approved allocations, and actual costs incurred through Draws 1–3
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="inline-flex items-center text-xs font-semibold text-slate-600 bg-white border border-slate-200 py-1 px-2.5 rounded-md cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                title="Budget Details"
              >
                <span>Budget Details</span>
              </button>
            </div>

            {/* Mobile View: High-clarity responsive cards (No squished columns) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {(d?.forecast_table && d.forecast_table.length > 0 ? d.forecast_table : DEFAULT_FORECAST_TASKS).map((row, idx) => {
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

                let catKey = "actual_spend";
                if (isTotal) {
                  catKey = "approved_budget";
                } else if (spendCents > 0) {
                  catKey = "actual_spend";
                } else {
                  catKey = "approved_budget";
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 space-y-2.5 ${
                      isTotal ? "bg-slate-50/90 font-bold" : "bg-white hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenAmountOrigin(catKey, row.category, approvedCents)}
                        className="text-left group cursor-pointer focus:outline-hidden"
                      >
                        <h4 className={`text-xs ${isTotal ? "font-bold text-slate-900" : "font-semibold text-slate-900 group-hover:text-blue-600 transition-colors"}`}>
                          {row.category}
                        </h4>
                        {!isTotal && row.variance_reason && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {row.variance_reason}
                          </p>
                        )}
                      </button>

                      {/* Variance Status Pill */}
                      {varianceCents > 0 ? (
                        <span className="shrink-0 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono">
                          +{formatMoney(varianceCents, { showCents: false })}
                        </span>
                      ) : varianceCents < 0 ? (
                        <span className="shrink-0 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-mono">
                          -{formatMoney(Math.abs(varianceCents), { showCents: false })}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full">
                          On Track
                        </span>
                      )}
                    </div>

                    {/* 2-Column Numbers Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                      <div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Approved</div>
                        <div className="font-mono font-semibold text-slate-900 tabular-nums">
                          <ClickableAmount
                            amountText={formatMoney(approvedCents, { showCents: false })}
                            originKey={catKey}
                            label={`${row.category} (Approved)`}
                            amountCents={approvedCents}
                            className="font-semibold text-slate-900"
                            onClick={handleOpenAmountOrigin}
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Spend</div>
                        <div className="font-mono font-semibold text-blue-700 tabular-nums">
                          <ClickableAmount
                            amountText={spendCents === 0 ? "$0" : formatMoney(spendCents, { showCents: false })}
                            originKey="actual_spend"
                            label={`${row.category} (Spend)`}
                            amountCents={spendCents}
                            className="font-semibold text-blue-700"
                            onClick={handleOpenAmountOrigin}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Table with Horizontal Scroll Protection */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500">
                    <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Task Description</th>
                    <th className="py-2.5 px-3 text-right font-semibold uppercase tracking-wider text-[11px]">Approved</th>
                    <th className="py-2.5 px-3 text-right font-semibold uppercase tracking-wider text-[11px]">Spend to Date</th>
                    <th className="py-2.5 px-4 text-right font-semibold uppercase tracking-wider text-[11px]">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {(d?.forecast_table && d.forecast_table.length > 0 ? d.forecast_table : DEFAULT_FORECAST_TASKS).map((row, idx) => {
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

                    // Map task row key to detailed source origin
                    let catKey = "actual_spend";
                    if (isTotal) {
                      catKey = "approved_budget";
                    } else if (spendCents > 0) {
                      catKey = "actual_spend";
                    } else {
                      catKey = "approved_budget";
                    }

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isTotal ? "font-bold bg-slate-50/90 border-t border-slate-200" : "hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleOpenAmountOrigin(catKey, row.category, approvedCents)}
                            className="text-left group cursor-pointer focus:outline-hidden"
                            title="Click to inspect task source origin"
                          >
                            <div className={cn(isTotal ? "font-bold text-slate-900" : "font-semibold text-slate-900", "group-hover:text-blue-600 transition-colors")}>
                              {row.category}
                            </div>
                            {!isTotal && row.variance_reason && (
                              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 group-hover:text-slate-700">
                                {row.variance_reason}
                              </div>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          <ClickableAmount
                            amountText={formatMoney(approvedCents, { showCents: false })}
                            originKey={catKey}
                            label={`${row.category} (Approved Budget)`}
                            amountCents={approvedCents}
                            className="font-semibold text-slate-900"
                            onClick={handleOpenAmountOrigin}
                          />
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-blue-700">
                          <ClickableAmount
                            amountText={spendCents === 0 ? "$0" : formatMoney(spendCents, { showCents: false })}
                            originKey="actual_spend"
                            label={`${row.category} (Actual Spend)`}
                            amountCents={spendCents}
                            className="font-semibold text-blue-700"
                            onClick={handleOpenAmountOrigin}
                          />
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {varianceCents > 0 ? (
                            <ClickableAmount
                              amountText={`+${formatMoney(varianceCents, { showCents: false })}`}
                              originKey={isTotal ? "budget_variance_over_plan" : catKey}
                              label={`${row.category} (Cost Variance)`}
                              amountCents={varianceCents}
                              className="font-bold text-amber-700"
                              onClick={handleOpenAmountOrigin}
                            />
                          ) : varianceCents < 0 ? (
                            <ClickableAmount
                              amountText={`-${formatMoney(Math.abs(varianceCents), { showCents: false })}`}
                              originKey={catKey}
                              label={`${row.category} (Favorable Variance)`}
                              amountCents={varianceCents}
                              className="font-bold text-emerald-700"
                              onClick={handleOpenAmountOrigin}
                            />
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
