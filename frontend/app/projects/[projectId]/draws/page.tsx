"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import {
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  ListFilter,
  Layers,
  ChevronRight,
  ExternalLink,
  Check,
  Zap,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DrawItem } from "@/lib/types";
import { getExcelDrawLines } from "@/lib/data/excel-draw-schedule";
import { DRAW_REQUEST_FORM_ITEMS } from "@/lib/data/draw-request-form-items";
import { ExcelSovMatrix } from "@/components/draws/excel-sov-matrix";
import { cn } from "@/lib/utils";

// Modals and Drawers
import {
  BuildDrawPacketModal,
  type BuildDrawPacketSuccessData,
} from "@/components/draws/build-draw-packet-modal";
import { VerifyWorkModal } from "@/components/draws/verify-work-modal";
import { VerifyCostModal } from "@/components/draws/verify-cost-modal";
import { RecordDecisionModal } from "@/components/draws/record-decision-modal";
import { AllocateFundingModal } from "@/components/draws/allocate-funding-modal";
import { ResubmitRevisionModal } from "@/components/draws/resubmit-revision-modal";
import { DrawDetailDrawer } from "@/components/draws/draw-detail-drawer";

type FilterTab = "ALL" | "ACTIVE" | "FUNDED" | "DISCREPANCY";

export interface PipelineDrawNode {
  drawNumber: number;
  code: string;
  title: string;
  phaseTitle: string;
  amount: string;
  hasPacketBuilt: boolean;
  spendProgressPct: number;
  date: string;
  status: "COMPLETED" | "ACTIVE_SPENDING" | "PENDING_REVIEW" | "QUEUED";
}

const DRAW_PIPELINE_DATA: PipelineDrawNode[] = [
  {
    drawNumber: 1,
    code: "01",
    title: "Draw #1",
    phaseTitle: "Mobilization & Foundation",
    amount: "$448,000",
    hasPacketBuilt: true,
    spendProgressPct: 100,
    date: "Jan 12",
    status: "COMPLETED",
  },
  {
    drawNumber: 2,
    code: "02",
    title: "Draw #2",
    phaseTitle: "Concrete Core & Framing",
    amount: "$320,000",
    hasPacketBuilt: true,
    spendProgressPct: 100,
    date: "Mar 04",
    status: "COMPLETED",
  },
  {
    drawNumber: 3,
    code: "03",
    title: "Draw #3",
    phaseTitle: "Rough MEP & Utilities",
    amount: "$318,000",
    hasPacketBuilt: true,
    spendProgressPct: 94,
    date: "May 19",
    status: "ACTIVE_SPENDING",
  },
  {
    drawNumber: 4,
    code: "04",
    title: "Draw #4",
    phaseTitle: "Exterior & Roofing",
    amount: "$385,120",
    hasPacketBuilt: false,
    spendProgressPct: 0,
    date: "Oct 18",
    status: "PENDING_REVIEW",
  },
  {
    drawNumber: 5,
    code: "05",
    title: "Draw #5",
    phaseTitle: "Drywall & Interior Finishes",
    amount: "Scheduled",
    hasPacketBuilt: false,
    spendProgressPct: 0,
    date: "Scheduled",
    status: "QUEUED",
  },
];

const SHOWCASE_ROWS = [
  {
    id: "drw-4",
    badge: "04",
    badgeType: "PENDING",
    title: "Draw #4",
    scopeName: "Exterior Enclosure & Roofing",
    drawRefId: "DRW-2026-004",
    date: "Oct 18, 2026",
    requestedAmt: "$385,120.00",
    statusLabel: "Ready to Request",
    statusType: "PENDING",
    actionLabel: "Request Draw #4",
    actionType: "PRIMARY",
    drawNumber: 4,
    disbursed: "Pending",
    reconciledPct: 0,
  },
  {
    id: "drw-3",
    badge: "03",
    badgeType: "ACTIVE",
    title: "Draw #3",
    scopeName: "Rough MEP & Utility Rough-Ins",
    drawRefId: "DRW-2026-003",
    date: "May 19, 2026",
    requestedAmt: "$318,000.00",
    statusLabel: "Active (94%)",
    statusType: "ACTIVE",
    actionLabel: "View Details",
    actionType: "OUTLINE",
    drawNumber: 3,
    disbursed: "$318,000.00",
    reconciledPct: 94,
  },
  {
    id: "drw-2",
    badge: "02",
    badgeType: "FUNDED",
    title: "Draw #2",
    scopeName: "Concrete Core & Structural Steel",
    drawRefId: "DRW-2026-002",
    date: "Mar 04, 2026",
    requestedAmt: "$320,000.00",
    statusLabel: "Funded",
    statusType: "FUNDED",
    actionLabel: "View Details",
    actionType: "OUTLINE",
    drawNumber: 2,
    disbursed: "$320,000.00",
    reconciledPct: 100,
  },
  {
    id: "drw-1",
    badge: "01",
    badgeType: "FUNDED",
    title: "Draw #1",
    scopeName: "Site Mobilization & Foundation Footings",
    drawRefId: "DRW-2026-001",
    date: "Jan 12, 2026",
    requestedAmt: "$448,000.00",
    statusLabel: "Funded",
    statusType: "FUNDED",
    actionLabel: "View Details",
    actionType: "OUTLINE",
    drawNumber: 1,
    disbursed: "$448,000.00",
    reconciledPct: 100,
  },
  {
    id: "drw-rev3",
    badge: "R3",
    badgeType: "REJECTED",
    title: "Draw #3 Revision",
    scopeName: "Fire Riser Hydraulic Calculation Submittal",
    drawRefId: "DRW-2026-003-REV",
    date: "May 25, 2026",
    requestedAmt: "$19,080.00",
    statusLabel: "Action Required",
    statusType: "REJECTED",
    actionLabel: "Resolve",
    actionType: "DANGER_OUTLINE",
    drawNumber: 3,
    disbursed: "$0.00",
    reconciledPct: 0,
  },
];

export default function DrawsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const routeProjectId =
    (params?.projectId as string) ||
    (typeof window !== "undefined"
      ? window.location.pathname.match(/^\/projects\/([^\/]+)/)?.[1] || ""
      : "");
  const currentProjectId =
    routeProjectId && routeProjectId !== "new"
      ? routeProjectId
      : projectsData?.data?.current_project_id || "";
  const currentProject = projectsData?.data?.projects?.find(
    (p) => p.id === currentProjectId
  );

  const { data: drawsData, isLoading: isDrawsLoading } = useQuery({
    queryKey: ["draws", currentProjectId],
    queryFn: () => api.draws.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const draws: DrawItem[] = drawsData?.data || [];

  // State
  const [pipelineData, setPipelineData] = useState<PipelineDrawNode[]>(DRAW_PIPELINE_DATA);
  const [showcaseRows, setShowcaseRows] = useState(SHOWCASE_ROWS);
  const [packetDrawNumber, setPacketDrawNumber] = useState<number>(4);
  const [filterTab, setFilterTab] = useState<FilterTab>("ALL");
  const [mainView, setMainView] = useState<"REGISTER" | "EXCEL_MATRIX">("REGISTER");
  const [drawOverrides, setDrawOverrides] = useState<Record<number, DrawItem>>({});
  const [selectedDraw, setSelectedDraw] = useState<DrawItem | null>(null);
  const [selectedTimelineDrawNumber, setSelectedTimelineDrawNumber] = useState<number>(3);

  // Modal states
  const [isBuildDrawPacketOpen, setIsBuildDrawPacketOpen] = useState(false);
  const [isVerifyWorkOpen, setIsVerifyWorkOpen] = useState(false);
  const [isVerifyCostOpen, setIsVerifyCostOpen] = useState(false);
  const [isRecordDecisionOpen, setIsRecordDecisionOpen] = useState(false);
  const [isAllocateFundingOpen, setIsAllocateFundingOpen] = useState(false);
  const [isResubmitRevisionOpen, setIsResubmitRevisionOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["draws", currentProjectId] });
    queryClient.invalidateQueries({ queryKey: ["unallocated-funding", currentProjectId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", currentProjectId] });
    if (selectedDraw) {
      api.draws.getById(selectedDraw.id).then((res) => {
        if (res?.data) setSelectedDraw(res.data);
      });
    }
  };

  const handleBuildPacketSuccess = (data?: BuildDrawPacketSuccessData) => {
    refreshAll();
    if (data) {
      if (data.lines && data.lines.length > 0) {
        const itemizedDraw: DrawItem = {
          id: `draw-fallback-${data.drawNumber}`,
          project_id: currentProjectId || "6b96d4aa-0ca1-4d8a-9909-cf7b5232c666",
          loan_id: "loan-crt-001",
          draw_number: data.drawNumber,
          status: "UNDER_REVIEW",
          period_start: "2026-09-25",
          period_end: data.inspectionDate,
          lender_name: "Capital Reserve Trust",
          requested_amount: String(data.totalRequestedCents),
          recommended_amount: String(data.totalRequestedCents),
          approved_amount: String(data.totalRequestedCents),
          funded_amount: "0",
          shortfall_amount: "0",
          lines: data.lines,
          conditions: [
            { id: "c1", title: "Lender Title Date-Down Endorsement", status: "SATISFIED", required_for: "Wire Clearance" },
            { id: "c2", title: "Subcontractor Lien Waivers Reconciled", status: "SATISFIED", required_for: "Disbursement" },
          ],
          packet_checklist: [
            { id: "p1", requirement: "AIA G702 / G703 Application for Payment", status: "COMPLETE", document_name: "G702_Signed.pdf" },
          ],
        };
        setDrawOverrides((prev) => ({ ...prev, [data.drawNumber]: itemizedDraw }));
        setSelectedDraw(itemizedDraw);
      }

      setPipelineData((prev) =>
        prev.map((node) =>
          node.drawNumber === data.drawNumber
            ? {
              ...node,
              hasPacketBuilt: true,
              amount: data.formattedAmount,
              status: "PENDING_REVIEW",
              date: "Submitted",
            }
            : node
        )
      );

      setShowcaseRows((prev) =>
        prev.map((row) =>
          row.drawNumber === data.drawNumber
            ? {
              ...row,
              requestedAmt: data.formattedAmount,
              statusLabel: "In Lender Review",
              actionLabel: "Review",
              actionType: "OUTLINE",
            }
            : row
        )
      );
    }
  };

  const buildDrawFallback = (drawNumber: number, title: string, amount: string): DrawItem => {
    if (drawOverrides[drawNumber]) {
      return drawOverrides[drawNumber];
    }
    const cleanAmt = parseFloat(amount.replace(/[^0-9.]/g, "")) || 50000;
    const cents = Math.round(cleanAmt * 100);
    const itemizedLines = getExcelDrawLines(drawNumber, cents);
    const computedRequestedCents = itemizedLines.reduce(
      (sum, l) => sum + (parseInt(l.requested_amount || "0", 10) || 0),
      0
    );
    const computedApprovedCents = itemizedLines.reduce(
      (sum, l) => sum + (parseInt(l.approved_amount || "0", 10) || 0),
      0
    );
    const computedFundedCents = itemizedLines.reduce(
      (sum, l) => sum + (parseInt(l.funded_amount || "0", 10) || 0),
      0
    );

    return {
      id: `draw-fallback-${drawNumber}`,
      project_id: currentProjectId || "df16b577-3585-4fb0-a13a-ffadaca73e0f",
      loan_id: "loan-col-73",
      draw_number: drawNumber,
      status: drawNumber <= 3 ? "FUNDED" : "UNDER_REVIEW",
      period_start: "2025-06-01",
      period_end: "2025-08-31",
      lender_name: "First National Bank Construction Lending",
      requested_amount: String(computedRequestedCents),
      recommended_amount: String(computedRequestedCents),
      approved_amount: String(computedApprovedCents),
      funded_amount: String(computedFundedCents),
      shortfall_amount: "0",
      lines: itemizedLines,
      conditions: [
        { id: "c1", title: "Lender Title Date-Down Endorsement", status: "SATISFIED", required_for: "Wire Clearance" },
        { id: "c2", title: "Subcontractor Lien Waivers Reconciled", status: "SATISFIED", required_for: "Disbursement" },
      ],
      packet_checklist: [
        { id: "p1", requirement: "AIA G702 / G703 Application for Payment", status: "COMPLETE", document_name: "G702_Signed.pdf" },
      ],
    };
  };

  const handleUpdateSelectedDraw = (updated: DrawItem) => {
    setSelectedDraw(updated);
    setDrawOverrides((prev) => ({ ...prev, [updated.draw_number]: updated }));
  };

  const handleOpenDetail = (draw: DrawItem) => {
    if (currentProjectId) {
      router.push(`/projects/${currentProjectId}/draws/${draw.id || draw.draw_number}`);
    } else {
      setSelectedDraw(draw);
      setIsDrawerOpen(true);
    }
  };

  const filteredShowcaseRows = useMemo(() => {
    return showcaseRows.filter((r) => {
      if (filterTab === "ACTIVE") return r.statusType === "ACTIVE" || r.statusType === "PENDING";
      if (filterTab === "FUNDED") return r.statusType === "FUNDED";
      if (filterTab === "DISCREPANCY") return r.statusType === "REJECTED";
      return true;
    });
  }, [showcaseRows, filterTab]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="border-b border-slate-200/80 bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Draw Requests
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (currentProjectId) {
                  router.push(`/projects/${currentProjectId}/draws/build-packet?draw=4`);
                } else {
                  setPacketDrawNumber(4);
                  setIsBuildDrawPacketOpen(true);
                }
              }}
              className="h-9 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Draw Request
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6 min-w-0">
        {/* 2. 3 Clean KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Loan Approved
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-1.5">
              $1,471,120.00
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Approved construction loan
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Draw Received
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-1.5">
              $1,086,000.00
            </div>
            <span className="text-xs font-medium text-emerald-700 mt-1 block">
              73.8% of loan funded
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Active Draw Spending
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-1.5">
              $298,920.00
            </div>
            <span className="text-xs font-medium text-slate-700 mt-1 block">
              94% paid to trades ($19,080 remaining)
            </span>
          </div>
        </div>

        {/* 3. Visual Draw Timeline */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs">
          {/* Header & Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Draw Timeline
              </h3>
            </div>

            {/* Status Legend */}
            <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-700">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                <span className="text-slate-700">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-700">Ready to Request</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="text-slate-500">Upcoming</span>
              </div>
            </div>
          </div>

          {/* Stepper Pipeline Container */}
          <div className="relative pt-6 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
            <div className="min-w-[640px] px-4 relative">
              {/* Stepper Track with Connected Line Segments */}
              <div className="grid grid-cols-5 relative">
                {/* Continuous Background Track */}
                <div className="absolute top-[20px] left-[10%] right-[10%] h-[3px] bg-slate-200 rounded-full z-0 pointer-events-none" />
                {/* Active Progress Line (From D1 through D4) */}
                <div className="absolute top-[20px] left-[10%] w-[60%] h-[3px] bg-emerald-500 rounded-full z-0 pointer-events-none shadow-[0_0_8px_rgba(16,185,129,0.25)]" />

                {/* Node 1: Draw #1 */}
                <div
                  className="flex flex-col items-center cursor-pointer group px-2 select-none"
                  onClick={() => {
                    setSelectedTimelineDrawNumber(1);
                    const fallback = buildDrawFallback(1, "Draw #1", "$448,000");
                    const matching = draws.find((d) => d.draw_number === 1) || fallback;
                    handleOpenDetail(matching);
                  }}
                >
                  <div className="relative z-10">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-4 ring-white group-hover:scale-105 transition-transform duration-150">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold font-mono border-2 border-white shadow-2xs leading-none">
                      D1
                    </span>
                  </div>

                  <div className="text-center mt-3 space-y-0.5 w-full max-w-[120px]">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Draw #1
                    </div>
                    <div className="text-sm font-bold font-mono tracking-tight text-slate-900">
                      $448,000
                    </div>
                    <div className="h-1 w-10 bg-emerald-500 rounded-full mx-auto my-1.5" />
                    <div className="text-[11px] font-semibold text-emerald-700">
                      100% Disbursed
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium pt-0.5">
                      Jan 12
                    </div>
                  </div>
                </div>

                {/* Node 2: Draw #2 */}
                <div
                  className="flex flex-col items-center cursor-pointer group px-2 select-none"
                  onClick={() => {
                    setSelectedTimelineDrawNumber(2);
                    const fallback = buildDrawFallback(2, "Draw #2", "$320,000");
                    const matching = draws.find((d) => d.draw_number === 2) || fallback;
                    handleOpenDetail(matching);
                  }}
                >
                  <div className="relative z-10">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-4 ring-white group-hover:scale-105 transition-transform duration-150">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold font-mono border-2 border-white shadow-2xs leading-none">
                      D2
                    </span>
                  </div>

                  <div className="text-center mt-3 space-y-0.5 w-full max-w-[120px]">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Draw #2
                    </div>
                    <div className="text-sm font-bold font-mono tracking-tight text-slate-900">
                      $320,000
                    </div>
                    <div className="h-1 w-10 bg-emerald-500 rounded-full mx-auto my-1.5" />
                    <div className="text-[11px] font-semibold text-emerald-700">
                      100% Disbursed
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium pt-0.5">
                      Mar 04
                    </div>
                  </div>
                </div>

                {/* Node 3: Draw #3 (Active) */}
                <div
                  className="flex flex-col items-center cursor-pointer group px-2 select-none"
                  onClick={() => {
                    setSelectedTimelineDrawNumber(3);
                    const fallback = buildDrawFallback(3, "Draw #3", "$318,000");
                    const matching = draws.find((d) => d.draw_number === 3) || fallback;
                    handleOpenDetail(matching);
                  }}
                >
                  <div className="relative z-10">
                    <div className="h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-md ring-4 ring-teal-300/80 ring-offset-2 ring-offset-teal-50 group-hover:scale-105 transition-transform duration-150">
                      <Zap className="h-4 w-4 fill-white stroke-[1.5]" />
                    </div>
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold font-mono border-2 border-white shadow-2xs leading-none">
                      D3
                    </span>
                  </div>

                  <div className="text-center mt-3 space-y-0.5 w-full max-w-[120px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs font-bold text-blue-600 group-hover:underline">Draw #3</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/70 leading-none">Active</span>
                    </div>
                    <div className="text-sm font-bold font-mono tracking-tight text-slate-900">
                      $318,000
                    </div>
                    <div className="h-1 w-10 bg-teal-500 rounded-full mx-auto my-1.5" />
                    <div className="text-[11px] font-semibold text-teal-700">
                      94% Disbursed
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium pt-0.5">
                      May 19
                    </div>
                  </div>
                </div>

                {/* Node 4: Draw #4 (Next) */}
                <div
                  className="flex flex-col items-center cursor-pointer group px-2 select-none"
                  onClick={() => {
                    setSelectedTimelineDrawNumber(4);
                    if (currentProjectId) {
                      router.push(`/projects/${currentProjectId}/draws/build-packet?draw=4`);
                    } else {
                      setPacketDrawNumber(4);
                      setIsBuildDrawPacketOpen(true);
                    }
                  }}
                >
                  <div className="relative z-10">
                    <div className="h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs ring-4 ring-white group-hover:scale-105 transition-transform duration-150">
                      <Plus className="h-4 w-4 stroke-[3]" />
                    </div>
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold font-mono border-2 border-white shadow-2xs leading-none">
                      D4
                    </span>
                  </div>

                  <div className="text-center mt-3 space-y-0.5 w-full max-w-[120px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Draw #4</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/70 leading-none">Next</span>
                    </div>
                    <div className="my-1">
                      <span className="inline-block border border-amber-200/80 bg-amber-50/90 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        Ready to Request
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium pt-0.5">
                      Oct 18
                    </div>
                  </div>
                </div>

                {/* Node 5: Draw #5 (Upcoming) */}
                <div
                  className="flex flex-col items-center cursor-pointer group px-2 select-none"
                  onClick={() => {
                    setSelectedTimelineDrawNumber(5);
                    if (currentProjectId) {
                      router.push(`/projects/${currentProjectId}/draws/build-packet?draw=5`);
                    } else {
                      setPacketDrawNumber(5);
                      setIsBuildDrawPacketOpen(true);
                    }
                  }}
                >
                  <div className="relative z-10">
                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200/90 text-slate-500 flex items-center justify-center shadow-2xs ring-4 ring-white group-hover:scale-105 transition-transform duration-150">
                      <Plus className="h-4 w-4 stroke-[2]" />
                    </div>
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold font-mono border-2 border-white shadow-2xs leading-none">
                      D5
                    </span>
                  </div>

                  <div className="text-center mt-3 space-y-0.5 w-full max-w-[120px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700">Draw #5</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/70 leading-none">Next</span>
                    </div>
                    <div className="my-1">
                      <span className="inline-block border border-amber-200/80 bg-amber-50/90 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        Scheduled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Controls: View Switcher (Register vs SOV) & Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented View Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 w-full sm:w-fit overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setMainView("REGISTER")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0",
                mainView === "REGISTER"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Draws Register</span>
            </button>
            <button
              type="button"
              onClick={() => setMainView("EXCEL_MATRIX")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0",
                mainView === "EXCEL_MATRIX"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Schedule of Values (SOV)</span>
            </button>
          </div>

          {/* Filter Pills (Shown only on Register view) */}
          {mainView === "REGISTER" && (
            <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              {(
                [
                  { key: "ALL", label: "All Draws" },
                  { key: "ACTIVE", label: "Active" },
                  { key: "FUNDED", label: "Funded" },
                  { key: "DISCREPANCY", label: "Needs Attention" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilterTab(key as FilterTab)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-lg transition-colors font-medium cursor-pointer shrink-0",
                    filterTab === key
                      ? "bg-slate-900 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. Main View: Draws Register or SOV Matrix */}
        {mainView === "EXCEL_MATRIX" ? (
          <ExcelSovMatrix
            onSelectDraw={(num) => {
              setSelectedTimelineDrawNumber(num);
              const matchingDraw =
                drawOverrides[num] ||
                draws.find((d) => d.draw_number === num) ||
                buildDrawFallback(num, `Draw #${num}`, "$50,000");
              handleOpenDetail(matchingDraw);
            }}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Draw</th>
                    <th className="py-3 px-4">Scope</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Requested</th>
                    <th className="py-3 px-4 text-right">Disbursed</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {isDrawsLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={`skel-${idx}`} className="animate-pulse">
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-40" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                        <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-3.5 px-4 text-right"><Skeleton className="h-6 w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredShowcaseRows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setSelectedTimelineDrawNumber(row.drawNumber);
                        const matchingDraw =
                          draws.find((d) => d.draw_number === row.drawNumber) ||
                          buildDrawFallback(row.drawNumber, row.title, row.requestedAmt);
                        handleOpenDetail(matchingDraw);
                      }}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      {/* Draw Ref */}
                      <td className="py-3.5 px-4 font-mono font-medium text-xs">
                        <div className="font-bold text-slate-900">{row.title}</div>
                        <span className="text-[11px] text-slate-400">{row.drawRefId}</span>
                      </td>

                      {/* Scope */}
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {row.scopeName}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {row.date}
                      </td>

                      {/* Requested */}
                      <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-900">
                        {row.requestedAmt}
                      </td>

                      {/* Disbursed */}
                      <td className="py-3.5 px-4 font-mono text-right text-slate-600 font-medium">
                        {row.disbursed}
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-4">
                        {row.statusType === "FUNDED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200/80">
                            Funded
                          </span>
                        )}
                        {row.statusType === "ACTIVE" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                            Active ({row.reconciledPct}%)
                          </span>
                        )}
                        {row.statusType === "PENDING" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                            Ready to Request
                          </span>
                        )}
                        {row.statusType === "REJECTED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                            Action Required
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {row.actionType === "PRIMARY" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedTimelineDrawNumber(row.drawNumber);
                              if (currentProjectId) {
                                router.push(`/projects/${currentProjectId}/draws/build-packet?draw=${row.drawNumber}`);
                              } else {
                                setPacketDrawNumber(row.drawNumber);
                                setIsBuildDrawPacketOpen(true);
                              }
                            }}
                            className="h-7 text-xs font-semibold px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-2xs"
                          >
                            Request Draw #4
                          </Button>
                        ) : row.actionType === "DANGER_OUTLINE" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTimelineDrawNumber(row.drawNumber);
                              const matchingDraw =
                                draws.find((d) => d.draw_number === row.drawNumber) ||
                                buildDrawFallback(row.drawNumber, row.title, row.requestedAmt);
                              setSelectedDraw(matchingDraw);
                              setIsResubmitRevisionOpen(true);
                            }}
                            className="h-7 text-xs font-semibold px-3 text-rose-700 border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 rounded-lg shadow-2xs"
                          >
                            Resolve
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTimelineDrawNumber(row.drawNumber);
                              const matchingDraw =
                                draws.find((d) => d.draw_number === row.drawNumber) ||
                                buildDrawFallback(row.drawNumber, row.title, row.requestedAmt);
                              handleOpenDetail(matchingDraw);
                            }}
                            className="h-7 text-xs font-medium px-3 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-2xs"
                          >
                            View Details
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <BuildDrawPacketModal
        open={isBuildDrawPacketOpen}
        onOpenChange={setIsBuildDrawPacketOpen}
        projectId={currentProjectId}
        nextDrawNumber={packetDrawNumber}
        onSuccess={handleBuildPacketSuccess}
      />

      <VerifyWorkModal
        open={isVerifyWorkOpen}
        onOpenChange={setIsVerifyWorkOpen}
        draw={selectedDraw}
        onSuccess={refreshAll}
      />

      <VerifyCostModal
        open={isVerifyCostOpen}
        onOpenChange={setIsVerifyCostOpen}
        draw={selectedDraw}
        onSuccess={refreshAll}
      />

      <RecordDecisionModal
        open={isRecordDecisionOpen}
        onOpenChange={setIsRecordDecisionOpen}
        draw={selectedDraw}
        onSuccess={refreshAll}
      />

      <AllocateFundingModal
        open={isAllocateFundingOpen}
        onOpenChange={setIsAllocateFundingOpen}
        draw={selectedDraw}
        projectId={currentProjectId}
        onSuccess={refreshAll}
      />

      <ResubmitRevisionModal
        open={isResubmitRevisionOpen}
        onOpenChange={setIsResubmitRevisionOpen}
        draw={selectedDraw}
        onSuccess={refreshAll}
      />

      <DrawDetailDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        draw={selectedDraw}
        onVerifyWork={() => setIsVerifyWorkOpen(true)}
        onVerifyCost={() => setIsVerifyCostOpen(true)}
        onRecordDecision={() => setIsRecordDecisionOpen(true)}
        onAllocateFunding={() => setIsAllocateFundingOpen(true)}
        onResubmitRevision={() => setIsResubmitRevisionOpen(true)}
        onRefresh={refreshAll}
        onUpdateDraw={handleUpdateSelectedDraw}
      />
    </div>
  );
}
