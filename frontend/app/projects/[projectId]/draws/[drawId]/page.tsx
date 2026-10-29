"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import {
  ArrowLeft,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { DrawItem, DrawLine } from "@/lib/types";
import {
  DRAW_REQUEST_FORM_ITEMS,
  getDrawTasksByNumber,
} from "@/lib/data/draw-request-form-items";
import { VerifyWorkModal } from "@/components/draws/verify-work-modal";
import { VerifyCostModal } from "@/components/draws/verify-cost-modal";
import { RecordDecisionModal } from "@/components/draws/record-decision-modal";
import { AllocateFundingModal } from "@/components/draws/allocate-funding-modal";

interface InspectionPhoto {
  id: string;
  title: string;
  url: string;
}

const DEFAULT_INSPECTION_PHOTOS: InspectionPhoto[] = [
  { id: "photo-0", title: "Site Excavation", url: "/inspection_images/0.jpg" },
  { id: "photo-1", title: "Trench Shoring", url: "/inspection_images/1.jpg" },
  { id: "photo-2", title: "Subgrade Liner", url: "/inspection_images/2.jpg" },
  { id: "photo-3", title: "Marine Piling", url: "/inspection_images/3.jpg" },
  { id: "photo-4", title: "Foundation Drilling", url: "/inspection_images/4.jpg" },
  { id: "photo-5", title: "Cofferdam Assembly", url: "/inspection_images/5.jpg" },
  { id: "photo-6", title: "Sheet Pile Wall", url: "/inspection_images/6.jpg" },
  { id: "photo-7", title: "Rebar & Concrete Pour", url: "/inspection_images/7.jpg" },
];

function formatDisplayDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

function getDrawDefaultPeriod(drawNumber: number) {
  switch (drawNumber) {
    case 1:
      return { start: "2025-05-01", end: "2026-01-12" };
    case 2:
      return { start: "2026-01-13", end: "2026-03-04" };
    case 3:
      return { start: "2026-03-05", end: "2026-05-19" };
    case 4:
      return { start: "2026-05-20", end: "2026-10-18" };
    default:
      return { start: "2026-05-20", end: "2026-10-18" };
  }
}

function getItemCodeAndName(line: DrawLine, idx: number): { code: string; name: string } {
  if (line.budget_line_code && line.budget_line_code !== "01.00") {
    const rawName = line.budget_line_name || "Work Item";
    const strippedName = rawName.replace(/^[0-9.]+\s*/, "").trim();
    return { code: line.budget_line_code, name: strippedName || rawName };
  }

  const rawName = line.budget_line_name || "Work Item";
  const match = rawName.match(/^([0-9]+(?:\.[0-9]+)+)\s*(.*)$/);
  if (match) {
    return { code: match[1], name: match[2].trim() };
  }

  return { code: `2.0${idx + 1}`, name: rawName };
}

export default function DrawDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const projectId = (params?.projectId as string) || "";
  const drawId = (params?.drawId as string) || "";

  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [previewPhoto, setPreviewPhoto] = useState<InspectionPhoto | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Workflow modals
  const [isVerifyWorkOpen, setIsVerifyWorkOpen] = useState(false);
  const [isVerifyCostOpen, setIsVerifyCostOpen] = useState(false);
  const [isRecordDecisionOpen, setIsRecordDecisionOpen] = useState(false);
  const [isAllocateFundingOpen, setIsAllocateFundingOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Queries
  const { data: drawData, refetch } = useQuery({
    queryKey: ["draw", drawId],
    queryFn: () => api.draws.getById(drawId),
    enabled: Boolean(drawId),
  });

  const { data: drawsListData } = useQuery({
    queryKey: ["draws", projectId],
    queryFn: () => api.draws.list(projectId),
    enabled: Boolean(projectId),
  });

  // Authentic draw state
  const activeDraw: DrawItem | null = React.useMemo(() => {
    let base: DrawItem | null = null;
    if (drawData?.data) {
      base = drawData.data;
    } else {
      const fromList = (drawsListData?.data || []).find(
        (d) => d.id === drawId || String(d.draw_number) === drawId
      );
      if (fromList) {
        base = fromList;
      }
    }

    let num = base?.draw_number || 1;
    if (!base?.draw_number) {
      if (drawId.includes("draw-73-01") || drawId === "1" || drawId.includes("draw-1") || drawId.includes("drw-1")) num = 1;
      else if (drawId.includes("draw-73-02") || drawId === "2" || drawId.includes("draw-2") || drawId.includes("drw-2")) num = 2;
      else if (drawId.includes("draw-73-03") || drawId === "3" || drawId.includes("draw-3") || drawId.includes("drw-3")) num = 3;
      else if (drawId.includes("draw-73-04") || drawId === "4" || drawId.includes("draw-4") || drawId.includes("drw-4")) num = 4;
      else {
        const match = drawId.match(/(\d+)/);
        if (match) {
          const parsed = parseInt(match[1], 10);
          num = parsed <= 10 ? parsed : 4;
        }
      }
    }

    // Check localStorage for draw packet created in Build Packet flow
    let savedPacket: {
      draw_number?: number;
      period_start?: string;
      period_end?: string;
      lender_name?: string;
      lines?: DrawLine[];
      photos?: InspectionPhoto[];
      status?: DrawItem["status"];
      is_revision?: boolean;
      revision_label?: string;
      revision_reason?: string;
    } | null = null;

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(`groundup_draw_packet_${projectId}_${num}`);
        if (raw) {
          savedPacket = JSON.parse(raw);
        }
      } catch {
        // ignore
      }
    }

    const baselineTasks = getDrawTasksByNumber(num);
    const resolvedLines: DrawLine[] =
      savedPacket?.lines && savedPacket.lines.length > 0
        ? savedPacket.lines.map((l, idx) => {
            const baseline =
              baselineTasks.find((b) => b.budget_line_code === l.budget_line_code) ||
              baselineTasks[idx];
            const rawApproved = parseInt(l.approved_amount || "0", 10);
            const baselineApproved = parseInt(baseline?.approved_amount || "0", 10);
            const approvedStr =
              rawApproved > 0
                ? l.approved_amount
                : baselineApproved > 0
                  ? baseline?.approved_amount
                  : num <= 3
                    ? l.requested_amount
                    : "0";
            const rawFunded = parseInt(l.funded_amount || "0", 10);
            const baselineFunded = parseInt(baseline?.funded_amount || "0", 10);
            const fundedStr =
              rawFunded > 0
                ? l.funded_amount
                : baselineFunded > 0
                  ? baseline?.funded_amount
                  : num <= 3
                    ? approvedStr
                    : "0";

            return {
              ...l,
              approved_amount: approvedStr,
              funded_amount: fundedStr,
              budgeted_amount: l.budgeted_amount || baseline?.budgeted_amount || l.requested_amount,
              lender_notes: l.lender_notes || baseline?.lender_notes,
            };
          })
        : base?.lines && base.lines.length > 0
          ? base.lines
          : baselineTasks;

    const lineRequestedCents = resolvedLines.reduce(
      (acc, l) => acc + (parseInt(l.requested_amount || "0", 10) || 0),
      0
    );
    const lineApprovedCents = resolvedLines.reduce(
      (acc, l) => acc + (parseInt(l.approved_amount || "0", 10) || 0),
      0
    );
    const lineFundedCents = resolvedLines.reduce(
      (acc, l) => acc + (parseInt(l.funded_amount || "0", 10) || 0),
      0
    );

    const resolvedPhotos =
      savedPacket?.photos && savedPacket.photos.length > 0
        ? savedPacket.photos
        : DEFAULT_INSPECTION_PHOTOS;

    const defaultPeriod = getDrawDefaultPeriod(num);

    if (!base) {
      return {
        id: drawId.startsWith("draw-") ? drawId : `draw-fallback-${num}`,
        project_id: projectId || "df16b577-3585-4fb0-a13a-ffadaca73e0f",
        loan_id: "loan-col-73",
        draw_number: num,
        revision_label: savedPacket?.revision_label,
        revision_reason: savedPacket?.revision_reason,
        status: savedPacket?.status || (num < 3 ? "FUNDED" : num === 3 ? "PARTIALLY_APPROVED" : "DRAFT"),
        period_start: savedPacket?.period_start || defaultPeriod.start,
        period_end: savedPacket?.period_end || defaultPeriod.end,
        lender_name:
          savedPacket?.lender_name || "Capital Reserve Trust",
        requested_amount: String(lineRequestedCents),
        recommended_amount: String(lineApprovedCents),
        approved_amount: String(lineApprovedCents),
        funded_amount: String(lineFundedCents),
        shortfall_amount: String(Math.max(0, lineRequestedCents - lineApprovedCents)),
        lines: resolvedLines,
        photos: resolvedPhotos,
        conditions: [
          { id: "c1", title: "Lender Title Date-Down Endorsement", status: "SATISFIED", required_for: "Wire Clearance" },
          { id: "c2", title: "Subcontractor Lien Waivers Reconciled", status: "SATISFIED", required_for: "Disbursement" },
          { id: "c3", title: "Certificate of Occupancy for Final Clean-up Release", status: num === 4 ? "OPEN" : "SATISFIED", required_for: "Final Holdback" },
        ],
        packet_checklist: [
          { id: "p1", requirement: "AIA G702 / G703 Application for Payment", status: "COMPLETE", document_name: "G702_Signed.pdf" },
          { id: "p2", requirement: "Transaction Bank Statement Cleared Expenses", status: "COMPLETE", document_name: "BCB_Operating_Stmt.pdf" },
          { id: "p3", requirement: "Draw Bank Loan Wire Confirmation", status: "COMPLETE", document_name: "CRT_Wire_Receipt.pdf" },
        ],
      };
    }

    return {
      ...base,
      draw_number: num,
      status: savedPacket?.status || base.status,
      period_start: savedPacket?.period_start || base.period_start || defaultPeriod.start,
      period_end: savedPacket?.period_end || base.period_end || defaultPeriod.end,
      lender_name: savedPacket?.lender_name || base.lender_name || "Capital Reserve Trust",
      revision_label: savedPacket?.revision_label || base.revision_label,
      revision_reason: savedPacket?.revision_reason || base.revision_reason,
      requested_amount: String(lineRequestedCents),
      approved_amount: String(lineApprovedCents),
      funded_amount: String(lineFundedCents),
      shortfall_amount: String(Math.max(0, lineRequestedCents - lineApprovedCents)),
      lines: resolvedLines,
      photos: resolvedPhotos,
    };
  }, [drawData, drawsListData, drawId, projectId]);

  const refreshAll = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["draws", projectId] });
  };

  const photos: InspectionPhoto[] = activeDraw?.photos || DEFAULT_INSPECTION_PHOTOS;
  const currentPhotoIndex = previewPhoto ? photos.findIndex((p) => p.id === previewPhoto.id) : -1;

  const handlePrevPhoto = () => {
    if (photos.length <= 1 || currentPhotoIndex === -1) return;
    const prevIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    setPreviewPhoto(photos[prevIndex]);
  };

  const handleNextPhoto = () => {
    if (photos.length <= 1 || currentPhotoIndex === -1) return;
    const nextIndex = (currentPhotoIndex + 1) % photos.length;
    setPreviewPhoto(photos[nextIndex]);
  };

  useEffect(() => {
    if (!previewPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewPhoto(null);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (photos.length > 1 && currentPhotoIndex !== -1) {
          const prevIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
          setPreviewPhoto(photos[prevIndex]);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (photos.length > 1 && currentPhotoIndex !== -1) {
          const nextIndex = (currentPhotoIndex + 1) % photos.length;
          setPreviewPhoto(photos[nextIndex]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewPhoto, currentPhotoIndex, photos]);

  if (!activeDraw) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mx-auto" />
        <p className="mt-3 text-xs text-slate-500">Loading draw application...</p>
      </div>
    );
  }

  const lines = activeDraw.lines && activeDraw.lines.length > 0 ? activeDraw.lines : DRAW_REQUEST_FORM_ITEMS;

  const totalBudgetCents = lines.reduce(
    (acc, l) => acc + (parseInt(l.budgeted_amount || l.requested_amount || "0", 10) || 0),
    0
  );

  const totalRequestedCents = lines.reduce(
    (acc, l) => acc + (parseInt(l.requested_amount || "0", 10) || 0),
    0
  );

  const totalApprovedCents = lines.reduce(
    (acc, l) => acc + (parseInt(l.approved_amount || "0", 10) || 0),
    0
  );

  const totalFundedCents = lines.reduce(
    (acc, l) => acc + (parseInt(l.funded_amount || "0", 10) || 0),
    0
  );

  const getStatusBadgeType = (status: DrawItem["status"]) => {
    switch (status) {
      case "FUNDED":
        return "funded" as const;
      case "APPROVED":
        return "verified" as const;
      case "PARTIALLY_APPROVED":
        return "short_funded" as const;
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "under_review" as const;
      case "REJECTED":
        return "blocked" as const;
      case "CLOSED":
        return "verified" as const;
      default:
        return "proposed" as const;
    }
  };

  const periodStartFormatted = formatDisplayDate(activeDraw.period_start);
  const periodEndFormatted = formatDisplayDate(activeDraw.period_end);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 min-w-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}/draws`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs shrink-0"
            title="Back to Draws Register"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href={`/projects/${projectId}/draws`} className="hover:text-slate-800 hover:underline">
                Draws
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">
                Draw #{activeDraw.draw_number}
              </span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Draw Application #{activeDraw.draw_number}
                {activeDraw.revision_label && `-${activeDraw.revision_label}`}
              </h1>
              <StatusBadge
                status={getStatusBadgeType(activeDraw.status)}
                customLabel={activeDraw.status.replace("_", " ")}
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projects/${projectId}/draws`)}
            className="text-xs font-semibold border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs cursor-pointer"
          >
            Back to Draws
          </Button>
        </div>
      </div>

      {/* UNIFIED APPLICATION OVERVIEW CARD */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {/* Top Section: Structured Application Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/60">
          <div className="px-5 py-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Construction Lender
            </span>
            <span className="text-xs sm:text-[13px] font-semibold text-slate-900 block truncate" title={activeDraw.lender_name}>
              {activeDraw.lender_name}
            </span>
          </div>

          <div className="px-5 py-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Billing Period
            </span>
            <span className="text-xs sm:text-[13px] font-semibold text-slate-900 block">
              {periodStartFormatted} to {periodEndFormatted}
            </span>
          </div>

          <div className="px-5 py-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Inspection Date
            </span>
            <span className="text-xs sm:text-[13px] font-semibold text-slate-900 block">
              {periodEndFormatted}
            </span>
          </div>
        </div>

        {/* Bottom Section: Financial & Field Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white">
          <div className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Requested Amount
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 block">
              {formatMoney(String(totalRequestedCents))}
            </span>
          </div>

          <div className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Approved Amount
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 block">
              {formatMoney(String(totalApprovedCents))}
            </span>
          </div>

          <div className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Funded Amount
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-600 block">
              {formatMoney(String(totalFundedCents))}
            </span>
          </div>

          <div className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Inspection Proof
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 block">
              {photos.length} Photos Verified
            </span>
          </div>
        </div>

        {/* Integrated Revision Reason Row */}
        {activeDraw.revision_reason && (
          <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Revision Reason
              </span>
              {activeDraw.revision_label && (
                <span className="font-mono text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  {activeDraw.revision_label}
                </span>
              )}
            </div>
            <span className="text-slate-300 hidden sm:inline select-none">·</span>
            <span className="font-medium text-slate-800">
              {activeDraw.revision_reason}
            </span>
          </div>
        )}
      </div>

      {/* SECTION 1: SCHEDULE OF VALUES (SOV TABLE) */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 sm:px-5 py-3 sm:py-3.5 gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Schedule of Values
            </h2>
            <span className="rounded-full bg-orange-100 border border-orange-200 px-2.5 py-0.5 text-[11px] font-bold text-[#C85A17]">
              {lines.length} Line Items
            </span>
          </div>

          {/* Mobile view toggle */}
          <div className="sm:hidden flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <TableIcon className="h-3 w-3" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Mobile View: Task Cards (sm:hidden) */}
        {viewMode === "cards" && (
          <div className="sm:hidden p-3.5 space-y-3 bg-slate-50/40">
            {lines.map((line, idx) => {
              const { code, name } = getItemCodeAndName(line, idx);
              const budgetedVal = line.budgeted_amount
                ? formatMoney(line.budgeted_amount)
                : formatMoney(line.requested_amount);
              const requestedVal = formatMoney(line.requested_amount);
              const approvedVal = formatMoney(line.approved_amount);
              const isZeroApproved = parseInt(line.approved_amount || "0", 10) === 0;
              const isUnderApproved = parseInt(line.approved_amount || "0", 10) < parseInt(line.requested_amount || "0", 10);

              return (
                <div
                  key={line.id}
                  className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shrink-0">
                        {code}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs sm:text-[13px] leading-snug">
                        {name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-slate-400 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Budgeted
                      </span>
                      <span className="font-mono text-xs text-slate-700 block tabular-nums">
                        {budgetedVal}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Requested
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 block tabular-nums">
                        {requestedVal}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Approved
                      </span>
                      {isZeroApproved || isUnderApproved ? (
                        <span className="font-mono text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block tabular-nums">
                          {approvedVal}
                        </span>
                      ) : (
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 inline-block tabular-nums">
                          {approvedVal}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Mobile Totals Card */}
            <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50/60 via-white to-orange-50/30 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C85A17]">
                  Totals Summary
                </span>
                <span className="text-[11px] font-bold text-slate-600 bg-orange-100 border border-orange-200/80 px-2 py-0.5 rounded-full">
                  {lines.length} Line Items
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block truncate">
                    Budget
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 tabular-nums block">
                    {formatMoney(String(totalBudgetCents))}
                  </span>
                </div>

                <div className="space-y-1 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block truncate">
                    Requested
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 tabular-nums block">
                    {formatMoney(String(totalRequestedCents))}
                  </span>
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 block truncate">
                    Approved
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-emerald-700 tabular-nums block">
                    {formatMoney(String(totalApprovedCents))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table View (Desktop always sm:block, mobile when viewMode === "table") */}
        <div
          className={cn(
            "overflow-x-auto custom-scrollbar",
            viewMode === "table" ? "block" : "hidden sm:block"
          )}
        >
          {/* Mobile Swipe Hint */}
          <div className="sm:hidden px-4 py-2 bg-orange-50/90 border-b border-orange-200/60 text-[11px] text-[#C85A17] font-medium flex items-center justify-between">
            <span>Scroll horizontally to view all columns</span>
            <span className="text-xs font-bold">→</span>
          </div>

          <table className="w-full min-w-[680px] text-left text-xs border-collapse">
            {/* Terracotta / Burnt Orange Header matching user specification */}
            <thead>
              <tr className="bg-[#C85A17] text-white font-bold text-xs">
                <th className="py-3.5 px-4 sm:px-5 text-left font-bold tracking-wide border-r border-[#B34F14] w-[14%]">
                  Line Item
                </th>
                <th className="py-3.5 px-4 sm:px-5 text-left font-bold tracking-wide border-r border-[#B34F14] w-[40%]">
                  Description
                </th>
                <th className="py-3.5 px-4 sm:px-5 text-right font-bold tracking-wide border-r border-[#B34F14] w-[15%]">
                  Budgeted Amount
                </th>
                <th className="py-3.5 px-4 sm:px-5 text-right font-bold tracking-wide border-r border-[#B34F14] w-[15%]">
                  Requested
                </th>
                <th className="py-3.5 px-4 sm:px-5 text-right font-bold tracking-wide w-[16%]">
                  Approved Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
              {lines.map((line, idx) => {
                const { code, name } = getItemCodeAndName(line, idx);
                const budgetedVal = line.budgeted_amount
                  ? formatMoney(line.budgeted_amount)
                  : formatMoney(line.requested_amount);
                const requestedVal = formatMoney(line.requested_amount);
                const approvedVal = formatMoney(line.approved_amount);
                const isZeroApproved = parseInt(line.approved_amount || "0", 10) === 0;

                const isUnderApproved = parseInt(line.approved_amount || "0", 10) < parseInt(line.requested_amount || "0", 10);

                return (
                  <tr
                    key={line.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Line Item Code */}
                    <td className="py-3.5 px-4 sm:px-5 border-r border-slate-100 font-mono font-bold text-slate-800 text-xs sm:text-[13px]">
                      {code}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 sm:px-5 border-r border-slate-100">
                      <div className="font-semibold text-slate-900 text-xs sm:text-[13px]">
                        {name}
                      </div>
                    </td>

                    {/* Budgeted Amount */}
                    <td className="py-3.5 px-4 sm:px-5 text-right tabular-nums text-slate-700 font-medium text-xs sm:text-[13px] border-r border-slate-100">
                      {budgetedVal}
                    </td>

                    {/* Requested */}
                    <td className="py-3.5 px-4 sm:px-5 text-right tabular-nums text-slate-900 font-semibold text-xs sm:text-[13px] border-r border-slate-100">
                      {requestedVal}
                    </td>

                    {/* Approved Amount */}
                    <td className="py-3.5 px-4 sm:px-5 text-right tabular-nums text-xs sm:text-[13px]">
                      {isZeroApproved || isUnderApproved ? (
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {approvedVal}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-900">
                          {approvedVal}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Totals Row */}
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50/90 font-bold text-slate-900">
                <td colSpan={2} className="py-4 px-4 sm:px-5 text-left font-bold text-xs sm:text-[13px] border-r border-slate-200">
                  Totals:
                </td>
                <td className="py-4 px-4 sm:px-5 text-right tabular-nums font-bold text-xs sm:text-[13px] text-slate-900 border-r border-slate-200">
                  {formatMoney(String(totalBudgetCents))}
                </td>
                <td className="py-4 px-4 sm:px-5 text-right tabular-nums font-bold text-xs sm:text-[13px] text-slate-900 border-r border-slate-200">
                  {formatMoney(String(totalRequestedCents))}
                </td>
                <td className="py-4 px-4 sm:px-5 text-right tabular-nums font-bold text-xs sm:text-[13px] text-emerald-700">
                  {formatMoney(String(totalApprovedCents))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* SECTION 2: FIELD INSPECTION PHOTOS */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Field Inspection Photos
            </h2>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              {photos.length} Photos
            </span>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setPreviewPhoto(photo)}
              className="group relative rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm">
                    <Eye className="h-3.5 w-3.5" />
                    Inspect
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-800 truncate" title={photo.title}>
                  {photo.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  #{idx + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX PORTAL FOR INSPECTION PHOTOS */}
      {isMounted &&
        previewPhoto &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-150"
            onClick={() => setPreviewPhoto(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {previewPhoto.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Photo {currentPhotoIndex + 1} of {photos.length} · Draw #{activeDraw.draw_number} Field Proof
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewPhoto(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Close (Esc)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Lightbox Image Container */}
              <div className="relative flex items-center justify-center bg-slate-950 min-h-[340px] max-h-[70vh] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewPhoto.url}
                  alt={previewPhoto.title}
                  className="max-h-[66vh] max-w-full w-auto object-contain rounded-lg select-none"
                />

                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white transition-all cursor-pointer hover:scale-105"
                      title="Previous photo (Left arrow)"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white transition-all cursor-pointer hover:scale-105"
                      title="Next photo (Right arrow)"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Lightbox Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/70 text-xs text-slate-600">
                <span className="text-[11px] text-slate-400 font-medium">
                  Use arrow keys or click buttons to navigate photos
                </span>
                <span className="font-mono text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {currentPhotoIndex + 1} / {photos.length}
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Sub-modals for workflow actions */}
      <VerifyWorkModal
        open={isVerifyWorkOpen}
        onOpenChange={setIsVerifyWorkOpen}
        draw={activeDraw}
        onSuccess={refreshAll}
      />

      <VerifyCostModal
        open={isVerifyCostOpen}
        onOpenChange={setIsVerifyCostOpen}
        draw={activeDraw}
        onSuccess={refreshAll}
      />

      <RecordDecisionModal
        open={isRecordDecisionOpen}
        onOpenChange={setIsRecordDecisionOpen}
        draw={activeDraw}
        onSuccess={refreshAll}
      />

      <AllocateFundingModal
        open={isAllocateFundingOpen}
        onOpenChange={setIsAllocateFundingOpen}
        draw={activeDraw}
        projectId={projectId}
        onSuccess={refreshAll}
      />
    </div>
  );
}
