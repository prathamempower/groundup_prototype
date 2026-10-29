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
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Check,
  Zap,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DrawItem } from "@/lib/types";
import { getExcelDrawLines } from "@/lib/data/excel-draw-schedule";
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
import { DrawDetailDrawer } from "@/components/draws/draw-detail-drawer";

type FilterTab = "ALL" | "ACTIVE" | "FUNDED" | "DISCREPANCY";

export interface TimelineStepNode {
  num: number;
  nodeId: string;
  title: string;
  scope: string;
  amount: string;
  disbursedText: string;
  progressPct: number;
  date: string;
  status: "COMPLETED" | "ACTIVE" | "READY" | "UPCOMING";
  badgeLabel?: string;
  actionLabel: string;
  isPrimaryAction?: boolean;
}

const TIMELINE_STEPS: TimelineStepNode[] = [
  {
    num: 1,
    nodeId: "D1",
    title: "Draw #1",
    scope: "Site Mobilization & Foundation Footings",
    amount: "$448,000.00",
    disbursedText: "100% Spent",
    progressPct: 100,
    date: "Jan 12",
    status: "COMPLETED",
    actionLabel: "View Details",
  },
  {
    num: 2,
    nodeId: "D2",
    title: "Draw #2",
    scope: "Concrete Core & Structural Steel",
    amount: "$320,000.00",
    disbursedText: "100% Spent",
    progressPct: 100,
    date: "Mar 04",
    status: "COMPLETED",
    actionLabel: "View Details",
  },
  {
    num: 3,
    nodeId: "D3",
    title: "Draw #3",
    scope: "Rough MEP & Utility Rough-Ins",
    amount: "$318,000.00",
    disbursedText: "94% Spent",
    progressPct: 94,
    date: "May 19",
    status: "ACTIVE",
    badgeLabel: "Active",
    actionLabel: "View Details",
  },
  {
    num: 4,
    nodeId: "D4",
    title: "Draw #4",
    scope: "Exterior Enclosure & Roofing",
    amount: "$385,120.00",
    disbursedText: "Ready to Request",
    progressPct: 0,
    date: "Oct 18",
    status: "READY",
    badgeLabel: "Next",
    actionLabel: "Request Draw #4",
    isPrimaryAction: true,
  },
  {
    num: 5,
    nodeId: "D5",
    title: "Draw #5",
    scope: "Interior Finishes & Drywall",
    amount: "$350,000.00",
    disbursedText: "Scheduled",
    progressPct: 0,
    date: "Target: Dec",
    status: "UPCOMING",
    badgeLabel: "Upcoming",
    actionLabel: "View Details",
  },
];

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
    amount: "$448,000.00",
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
    amount: "$320,000.00",
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
    amount: "$318,000.00",
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
    amount: "$385,120.00",
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
    amount: "$350,000.00",
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
    disbursed: "$0.00",
    reconciledPct: 0,
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
  {
    id: "drw-3",
    badge: "03",
    badgeType: "ACTIVE",
    title: "Draw #3",
    scopeName: "Rough MEP & Utility Rough-Ins",
    drawRefId: "DRW-2026-003",
    date: "May 19, 2026",
    requestedAmt: "$318,000.00",
    statusLabel: "In Progress",
    statusType: "ACTIVE",
    actionLabel: "View Details",
    actionType: "OUTLINE",
    drawNumber: 3,
    disbursed: "$298,920.00",
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
  const [drawOverrides, setDrawOverrides] = useState<Record<number, DrawItem>>({});
  const [selectedDraw, setSelectedDraw] = useState<DrawItem | null>(null);
  const [selectedTimelineDrawNumber, setSelectedTimelineDrawNumber] = useState<number>(3);
  const [activeMobileStep, setActiveMobileStep] = useState<number>(3);
  const mobileCarouselRef = React.useRef<HTMLDivElement>(null);

  const scrollToMobileStep = (stepNum: number) => {
    setActiveMobileStep(stepNum);
    setSelectedTimelineDrawNumber(stepNum);
    if (mobileCarouselRef.current) {
      const targetChild = mobileCarouselRef.current.children[stepNum - 1] as HTMLElement | undefined;
      if (targetChild) {
        targetChild.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  const handleMobilePrev = () => {
    if (activeMobileStep > 1) {
      scrollToMobileStep(activeMobileStep - 1);
    }
  };

  const handleMobileNext = () => {
    if (activeMobileStep < TIMELINE_STEPS.length) {
      scrollToMobileStep(activeMobileStep + 1);
    }
  };

  const handleStepClick = (step: TimelineStepNode) => {
    if (step.status === "READY" || step.status === "UPCOMING" || step.isPrimaryAction) {
      // Not requested / upcoming draw - clicking is disabled
      return;
    }
    setSelectedTimelineDrawNumber(step.num);
    setActiveMobileStep(step.num);
    const fallback = buildDrawFallback(step.num, step.title, step.amount);
    const matching = draws.find((d) => d.draw_number === step.num) || fallback;
    handleOpenDetail(matching);
  };

  // Modal states
  const [isBuildDrawPacketOpen, setIsBuildDrawPacketOpen] = useState(false);
  const [isVerifyWorkOpen, setIsVerifyWorkOpen] = useState(false);
  const [isVerifyCostOpen, setIsVerifyCostOpen] = useState(false);
  const [isRecordDecisionOpen, setIsRecordDecisionOpen] = useState(false);
  const [isAllocateFundingOpen, setIsAllocateFundingOpen] = useState(false);
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
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-1.5 tabular-nums">
              $1,471,120.00
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Approved construction loan
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Draws Received
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-1.5 tabular-nums">
              $1,086,000.00
            </div>
            <span className="text-xs font-medium text-emerald-700 mt-1 block">
              73.8% of loan funded
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Actual Spend
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-1.5 tabular-nums">
              $1,066,920.00
            </div>
          </div>
        </div>

        {/* 3. Visual Draw Timeline */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs">
                  <CalendarRange className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Draw Timeline
                  </h3>
                  <p className="text-[11px] text-slate-500 sm:hidden">
                    Step {activeMobileStep} of {TIMELINE_STEPS.length} • {TIMELINE_STEPS[activeMobileStep - 1]?.title} ({TIMELINE_STEPS[activeMobileStep - 1]?.status === "ACTIVE" ? "Active" : TIMELINE_STEPS[activeMobileStep - 1]?.status === "READY" ? "Ready" : TIMELINE_STEPS[activeMobileStep - 1]?.status === "COMPLETED" ? "Funded" : "Scheduled"})
                  </p>
                </div>
              </div>

              {/* Mobile Prev / Next Arrows */}
              <div className="flex sm:hidden items-center gap-1">
                <button
                  type="button"
                  onClick={handleMobilePrev}
                  disabled={activeMobileStep <= 1}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 shadow-2xs cursor-pointer"
                  aria-label="Previous Draw"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleMobileNext}
                  disabled={activeMobileStep >= TIMELINE_STEPS.length}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 shadow-2xs cursor-pointer"
                  aria-label="Next Draw"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Status Legend (Desktop) */}
            <div className="hidden sm:flex items-center flex-wrap gap-3 sm:gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span className="text-slate-700">Funded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                <span className="text-slate-700">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-600" />
                <span className="text-slate-700">Ready to Request</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <span className="text-slate-500">Scheduled</span>
              </div>
            </div>
          </div>

          {/* Mobile Interactive Stepper Track & Cards (sm:hidden) */}
          <div className="sm:hidden pt-4 pb-2 space-y-4">
            {/* Connected Track */}
            <div className="relative py-1 px-2">
              {/* Background Track Line */}
              <div className="absolute top-[20px] left-[20px] right-[20px] h-[2px] bg-slate-200 z-0 pointer-events-none" />
              {/* Active Progress Line */}
              <div
                className="absolute top-[20px] left-[20px] h-[2px] bg-emerald-600 z-0 pointer-events-none transition-all duration-300"
                style={{
                  width: `${((Math.min(activeMobileStep, 4) - 1) / (TIMELINE_STEPS.length - 1)) * 100}%`,
                }}
              />

              <div className="flex justify-between items-center relative z-10">
                {TIMELINE_STEPS.map((step) => {
                  const isSelected = activeMobileStep === step.num;
                  const isCompleted = step.status === "COMPLETED";
                  const isActive = step.status === "ACTIVE";
                  const isReady = step.status === "READY";

                  return (
                    <button
                      key={`mob-step-${step.num}`}
                      type="button"
                      onClick={() => scrollToMobileStep(step.num)}
                      className="flex flex-col items-center group cursor-pointer focus:outline-hidden"
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ring-2 ring-white shadow-2xs",
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isActive
                            ? "bg-slate-900 text-white ring-slate-200"
                            : isReady
                            ? "bg-amber-600 text-white ring-amber-100"
                            : "bg-white text-slate-400 border border-slate-300",
                          isSelected && "scale-110 shadow-xs ring-slate-900 ring-offset-2"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        ) : (
                          <span className="font-mono text-[11px] font-bold">
                            0{step.num}
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-mono mt-1 font-semibold leading-none",
                          isSelected ? "text-slate-900 font-bold" : "text-slate-500"
                        )}
                      >
                        {step.nodeId}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Swipeable Card Carousel */}
            <div
              ref={mobileCarouselRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                const cardWidth = el.scrollWidth / TIMELINE_STEPS.length;
                const index = Math.round(el.scrollLeft / cardWidth);
                if (index >= 0 && index < TIMELINE_STEPS.length && TIMELINE_STEPS[index].num !== activeMobileStep) {
                  setActiveMobileStep(TIMELINE_STEPS[index].num);
                  setSelectedTimelineDrawNumber(TIMELINE_STEPS[index].num);
                }
              }}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none py-1 -mx-2 px-2"
            >
              {TIMELINE_STEPS.map((step) => {
                const isSelected = activeMobileStep === step.num;
                const isCompleted = step.status === "COMPLETED";
                const isActive = step.status === "ACTIVE";
                const isReady = step.status === "READY";
                const isUpcoming = step.status === "UPCOMING";
                const isUnrequested = isReady || isUpcoming;

                return (
                  <div
                    key={`carousel-card-${step.num}`}
                    onClick={() => {
                      if (isUnrequested) return;
                      handleStepClick(step);
                    }}
                    className={cn(
                      "w-[84vw] max-w-[310px] shrink-0 snap-center rounded-xl p-4 border transition-all space-y-3 shadow-xs",
                      isUnrequested ? "cursor-default" : "cursor-pointer hover:border-slate-300",
                      isSelected
                        ? "border-slate-900 bg-white ring-1 ring-slate-900/10"
                        : "border-slate-200/90 bg-white"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{step.title}</span>
                          {isCompleted && (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <Check className="h-3 w-3 stroke-[2.5]" /> Funded
                            </span>
                          )}
                          {isActive && (
                            <span className="text-[11px] font-semibold text-slate-900 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-900" /> Active
                            </span>
                          )}
                          {isReady && (
                            <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-amber-600" /> Ready
                            </span>
                          )}
                          {step.status === "UPCOMING" && (
                            <span className="text-[11px] font-medium text-slate-500">
                              Scheduled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">{step.scope}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 shrink-0">{step.date}</span>
                    </div>

                    {/* Financial Metrics */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Amount</span>
                        <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">{step.amount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Spent</span>
                        <span
                          className={cn(
                            "font-semibold text-xs mt-0.5 block tabular-nums",
                            isCompleted
                              ? "text-emerald-700"
                              : isActive
                              ? "text-slate-900 font-bold"
                              : isReady
                              ? "text-amber-800"
                              : "text-slate-500"
                          )}
                        >
                          {step.progressPct}% spent
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar for completed/active */}
                    {(isCompleted || isActive) && (
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            isCompleted ? "bg-emerald-600" : "bg-slate-900"
                          )}
                          style={{ width: `${step.progressPct}%` }}
                        />
                      </div>
                    )}

                    {/* Action Button */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {step.isPrimaryAction ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStepClick(step)}
                          className="w-full h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-2xs"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          {step.actionLabel}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStepClick(step)}
                          className="w-full h-8 text-xs font-medium text-slate-700 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-2xs flex items-center justify-center gap-1"
                        >
                          <span>{step.actionLabel}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtle pagination dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {TIMELINE_STEPS.map((s) => (
                <button
                  key={`dot-${s.num}`}
                  type="button"
                  onClick={() => scrollToMobileStep(s.num)}
                  className={cn(
                    "h-1.5 rounded-full transition-all cursor-pointer",
                    activeMobileStep === s.num ? "w-5 bg-slate-900" : "w-1.5 bg-slate-200 hover:bg-slate-300"
                  )}
                  aria-label={`Go to Draw ${s.num}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop Stepper Pipeline (hidden sm:block) */}
          <div className="hidden sm:block relative pt-6 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
            <div className="min-w-[640px] px-4 relative">
              <div className="grid grid-cols-5 relative">
                {/* Continuous Background Track */}
                <div className="absolute top-[18px] left-[10%] right-[10%] h-[2px] bg-slate-200 z-0 pointer-events-none" />
                {/* Completed Progress Line (From D1 through D3) */}
                <div className="absolute top-[18px] left-[10%] w-[50%] h-[2px] bg-emerald-600 z-0 pointer-events-none" />

                {TIMELINE_STEPS.map((step) => {
                  const isCompleted = step.status === "COMPLETED";
                  const isActive = step.status === "ACTIVE";
                  const isReady = step.status === "READY";
                  const isUpcoming = step.status === "UPCOMING";
                  const isUnrequested = isReady || isUpcoming;

                  return (
                    <div
                      key={`desk-step-${step.num}`}
                      className={cn(
                        "flex flex-col items-center px-2 select-none",
                        isUnrequested ? "cursor-default" : "cursor-pointer group"
                      )}
                      onClick={() => {
                        if (isUnrequested) return;
                        handleStepClick(step);
                      }}
                    >
                      <div className="relative z-10">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-150 ring-4 ring-white shadow-xs",
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isActive
                              ? "bg-slate-900 text-white ring-slate-200"
                              : isReady
                              ? "bg-amber-600 text-white ring-amber-100"
                              : "bg-white border border-slate-300 text-slate-400"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4 stroke-[2.5]" />
                          ) : isActive ? (
                            <span className="font-mono text-xs font-bold text-white">03</span>
                          ) : isReady ? (
                            <span className="font-mono text-xs font-bold text-white">04</span>
                          ) : (
                            <span className="font-mono text-xs font-medium text-slate-400">05</span>
                          )}
                        </div>
                      </div>

                      {/* Clean Single Typographic Hierarchy */}
                      <div className="text-center mt-2.5 space-y-1 w-full max-w-[130px]">
                        <div>
                          <span
                            className={cn(
                              "text-xs font-bold block tracking-tight transition-colors",
                              isActive
                                ? "text-slate-900"
                                : isUpcoming
                                ? "text-slate-600"
                                : "text-slate-900 group-hover:text-slate-700"
                            )}
                          >
                            {step.title}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 font-semibold tabular-nums block">
                            {step.amount}
                          </span>
                        </div>

                        <div className="pt-0.5 space-y-0.5">
                          <span
                            className={cn(
                              "text-[11px] font-semibold block tabular-nums",
                              isCompleted
                                ? "text-emerald-700"
                                : isActive
                                ? "text-slate-900 font-bold"
                                : isReady
                                ? "text-amber-800"
                                : "text-slate-500"
                            )}
                          >
                            {step.progressPct}% spent
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-medium block",
                              isCompleted
                                ? "text-slate-500"
                                : isActive
                                ? "text-slate-600"
                                : isReady
                                ? "text-slate-500"
                                : "text-slate-400"
                            )}
                          >
                            {isCompleted
                              ? `Funded ${step.date}`
                              : isActive
                              ? `Active (${step.date})`
                              : isReady
                              ? `Ready to request`
                              : `Target: Dec 2026`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Controls: Draws Register Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Draws Register
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredShowcaseRows.length})
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
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
                  "px-3 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer shrink-0",
                  filterTab === key
                    ? "bg-slate-900 text-white font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Draws Register: Responsive Table and Mobile Card List */}
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          {/* Mobile Card List (sm:hidden) */}
          <div className="divide-y divide-slate-100 sm:hidden">
            {isDrawsLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={`mob-skel-${idx}`} className="p-4 space-y-3 animate-pulse">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-48" />
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              ))
            ) : filteredShowcaseRows.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No draws found matching the selected filter.
              </div>
            ) : (
              filteredShowcaseRows.map((row, index) => {
                const isUnrequested = row.actionType === "PRIMARY" || row.statusType === "PENDING";
                return (
                  <div
                    key={`mob-row-${row.id}`}
                    onClick={() => {
                      if (isUnrequested) return;
                      setSelectedTimelineDrawNumber(row.drawNumber);
                      const matchingDraw =
                        draws.find((d) => d.draw_number === row.drawNumber) ||
                        buildDrawFallback(row.drawNumber, row.title, row.requestedAmt);
                      handleOpenDetail(matchingDraw);
                    }}
                    className={cn(
                      "p-4 transition-colors space-y-3",
                      isUnrequested ? "cursor-default" : "hover:bg-slate-50/70 cursor-pointer"
                    )}
                  >
                  {/* Top row: Sr + Title + Status + Date */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-slate-400 select-none">
                          #{index + 1}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{row.title}</span>
                        {row.statusType === "FUNDED" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <Check className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
                            Funded
                          </span>
                        )}
                        {row.statusType === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                            Active ({row.reconciledPct}%)
                          </span>
                        )}
                        {row.statusType === "PENDING" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Ready to Request
                          </span>
                        )}
                        {row.statusType === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                            <AlertCircle className="h-3 w-3 text-rose-600" />
                            Action Required
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                        {row.drawRefId}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium shrink-0 pt-0.5">
                      {row.date}
                    </span>
                  </div>

                  {/* Scope */}
                  <div className="text-xs text-slate-700 font-medium">
                    {row.scopeName}
                  </div>

                  {/* Financials Summary */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                        Requested
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                        {row.requestedAmt}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                        Spent
                      </span>
                      <span className="font-mono font-semibold text-slate-700 text-sm tabular-nums">
                        {row.disbursed}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                        {row.reconciledPct > 0 ? `${row.reconciledPct}% spent` : "0% spent"}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div onClick={(e) => e.stopPropagation()}>
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
                        className="w-full h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-2xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Request Draw #4
                      </Button>
                    ) : row.actionType === "DANGER_OUTLINE" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTimelineDrawNumber(row.drawNumber);
                          if (currentProjectId) {
                            router.push(`/projects/${currentProjectId}/draws/build-packet?draw=${row.drawNumber}&revision=true`);
                          }
                        }}
                        className="w-full h-8 text-xs font-semibold text-rose-700 border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 rounded-lg shadow-2xs cursor-pointer"
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
                        className="w-full h-8 text-xs font-medium text-slate-600 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-2xs flex items-center justify-center gap-1.5"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          </div>

          {/* Desktop Table (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[780px] text-left text-xs">
              <colgroup>
                <col className="w-12" />
                <col className="w-32" />
                <col className="w-48" />
                <col />
                <col className="w-32" />
                <col className="w-32" />
                <col className="w-36" />
                <col className="w-28" />
              </colgroup>
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 text-center whitespace-nowrap">#</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Draw</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4 text-right">Requested</th>
                  <th className="py-3 px-4 text-right">Spent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {isDrawsLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={`skel-${idx}`} className="animate-pulse">
                      <td className="py-3.5 px-3.5 text-center"><Skeleton className="h-4 w-4 mx-auto" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3.5 px-4 text-right"><Skeleton className="h-6 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredShowcaseRows.map((row, index) => {
                  const isUnrequested = row.actionType === "PRIMARY" || row.statusType === "PENDING";
                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        if (isUnrequested) return;
                        setSelectedTimelineDrawNumber(row.drawNumber);
                        const matchingDraw =
                          draws.find((d) => d.draw_number === row.drawNumber) ||
                          buildDrawFallback(row.drawNumber, row.title, row.requestedAmt);
                        handleOpenDetail(matchingDraw);
                      }}
                      className={cn(
                        "group transition-colors",
                        isUnrequested ? "cursor-default" : "hover:bg-slate-50/70 cursor-pointer"
                      )}
                    >
                    {/* Index */}
                    <td className="py-3.5 px-3.5 text-center font-mono text-xs text-slate-400 tabular-nums select-none">
                      {index + 1}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {row.date}
                    </td>

                    {/* Draw Ref */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                        {row.title}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 block">
                        {row.drawRefId}
                      </span>
                    </td>

                    {/* Scope */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {row.scopeName}
                    </td>

                    {/* Requested */}
                    <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-900 tabular-nums whitespace-nowrap">
                      {row.requestedAmt}
                    </td>

                    {/* Spent */}
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums whitespace-nowrap">
                      <span className="font-semibold text-slate-900 block">
                        {row.disbursed}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-sans">
                        {row.reconciledPct > 0 ? `${row.reconciledPct}% spent` : "0% spent"}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.statusType === "FUNDED" && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                          <span>Funded</span>
                        </div>
                      )}
                      {row.statusType === "ACTIVE" && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                          <span className="h-2 w-2 rounded-full bg-slate-900" />
                          <span>In Progress</span>
                        </div>
                      )}
                      {row.statusType === "PENDING" && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>Ready to Request</span>
                        </div>
                      )}
                      {row.statusType === "REJECTED" && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                          <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                          <span>Action Required</span>
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                            if (currentProjectId) {
                              router.push(`/projects/${currentProjectId}/draws/build-packet?draw=${row.drawNumber}&revision=true`);
                            }
                          }}
                          className="h-7 text-xs font-semibold px-3 text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-lg shadow-2xs cursor-pointer"
                        >
                          Resolve
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTimelineDrawNumber(row.drawNumber);
                            const matchingDraw =
                              draws.find((d) => d.draw_number === row.drawNumber) ||
                              buildDrawFallback(row.drawNumber, row.title, row.requestedAmt);
                            handleOpenDetail(matchingDraw);
                          }}
                          className="h-7 text-xs font-medium px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>View</span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </Button>
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

      <DrawDetailDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        draw={selectedDraw}
        onVerifyWork={() => setIsVerifyWorkOpen(true)}
        onVerifyCost={() => setIsVerifyCostOpen(true)}
        onRecordDecision={() => setIsRecordDecisionOpen(true)}
        onAllocateFunding={() => setIsAllocateFundingOpen(true)}
        onResubmitRevision={() => {
          if (currentProjectId && selectedDraw) {
            router.push(`/projects/${currentProjectId}/draws/build-packet?draw=${selectedDraw.draw_number}&revision=true`);
          }
        }}
        onRefresh={refreshAll}
        onUpdateDraw={handleUpdateSelectedDraw}
      />
    </div>
  );
}
