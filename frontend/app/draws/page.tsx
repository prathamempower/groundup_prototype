"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import {
  Landmark,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  Building2,
  GitBranch,
  Layers,
  ArrowRight,
  Filter,
  Check,
  AlertCircle,
  Eye,
  FileText,
  Sliders,
  Calendar,
  Zap,
  ArrowUpRight,
  RefreshCw,
  CreditCard,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Lock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DrawItem } from "@/lib/types";
import { getExcelDrawLines } from "@/lib/data/excel-draw-schedule";
import { ExcelSovMatrix } from "@/components/draws/excel-sov-matrix";

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
  scopeSummary: string;
  amount: string;
  hasPacketBuilt: boolean;
  allocatedCents: number;
  spentCents: number;
  spentFormatted: string;
  remainingFormatted: string;
  spendProgressPct: number;
  date: string;
  status: "COMPLETED" | "ACTIVE_SPENDING" | "PENDING_REVIEW" | "QUEUED";
  allocationPass: "FIRST_PASS" | "SUBSEQUENT_PASS" | "NEXT_IN_REVIEW" | "QUEUED";
  allocationPassLabel: string;
  drawBankStatement: {
    bankName: string;
    accountMask: string;
    accountPurpose: string;
    wireRef: string;
    wireDate: string;
    disbursedAmount: string;
    clearedStatus: "CLEARED" | "PENDING" | "SCHEDULED";
    note: string;
  };
  txBankStatement: {
    bankName: string;
    accountMask: string;
    accountPurpose: string;
    clearedSpends: string;
    invoiceCount: number;
    reconciliationStatus: string;
    trades: { trade: string; amount: string; status: string }[];
  };
  nextDrawTrigger: {
    thresholdPct: number;
    isTriggered: boolean;
    triggerStatusMessage: string;
    unlockedNextDrawNumber: number;
    readinessChecklist: { item: string; done: boolean }[];
  };
}

const DRAW_PIPELINE_DATA: PipelineDrawNode[] = [
  {
    drawNumber: 1,
    code: "D1",
    title: "Draw #1",
    phaseTitle: "Site Mobilization & Foundation Footings",
    scopeSummary: "Demolition, perimeter shoring, mass excavation, and concrete footings.",
    amount: "$50,000",
    hasPacketBuilt: true,
    allocatedCents: 5000000,
    spentCents: 5000000,
    spentFormatted: "$50,000.00",
    remainingFormatted: "$0.00",
    spendProgressPct: 100,
    date: "Jan 12",
    status: "COMPLETED",
    allocationPass: "FIRST_PASS",
    allocationPassLabel: "First-Pass Initial Allocation",
    drawBankStatement: {
      bankName: "Capital Reserve Trust",
      accountMask: "•••• 8904",
      accountPurpose: "Lender Construction Loan Account",
      wireRef: "CRT-WIRE-99102",
      wireDate: "Jan 12, 2026",
      disbursedAmount: "$50,000.00",
      clearedStatus: "CLEARED",
      note: "Initial draw allocated and wired by lender on first pass upon facility execution.",
    },
    txBankStatement: {
      bankName: "BCB Community Bank",
      accountMask: "•••• 4120",
      accountPurpose: "Project Operating & Spend Account",
      clearedSpends: "$50,000.00",
      invoiceCount: 12,
      reconciliationStatus: "100% Cleared & Reconciled",
      trades: [
        { trade: "Excavation & Shoring", amount: "$22,500.00", status: "Cleared" },
        { trade: "Concrete Foundation Footings", amount: "$18,500.00", status: "Cleared" },
        { trade: "Site Permits & Mobilization", amount: "$9,000.00", status: "Cleared" },
      ],
    },
    nextDrawTrigger: {
      thresholdPct: 100,
      isTriggered: true,
      triggerStatusMessage: "Draw #1 fully spent & reconciled ($50,000 / $50,000) via dual statements ➔ Draw #2 unlocked & funded by lender.",
      unlockedNextDrawNumber: 2,
      readinessChecklist: [
        { item: "Draw Bank loan wire verified ($50,000.00)", done: true },
        { item: "Transaction Bank trade spends 100% matched ($50,000.00)", done: true },
        { item: "Lender closeout approval cleared ➔ Unlocked Draw #2", done: true },
      ],
    },
  },
  {
    drawNumber: 2,
    code: "D2",
    title: "Draw #2",
    phaseTitle: "Concrete Core & Structural Steel Framing",
    scopeSummary: "Slab-on-grade concrete pour, structural steel columns, and shear framing.",
    amount: "$68,200",
    hasPacketBuilt: true,
    allocatedCents: 6820000,
    spentCents: 6820000,
    spentFormatted: "$68,200.00",
    remainingFormatted: "$0.00",
    spendProgressPct: 100,
    date: "Mar 04",
    status: "COMPLETED",
    allocationPass: "SUBSEQUENT_PASS",
    allocationPassLabel: "Funded upon Draw 1 Completion",
    drawBankStatement: {
      bankName: "Capital Reserve Trust",
      accountMask: "•••• 8904",
      accountPurpose: "Lender Construction Loan Account",
      wireRef: "CRT-WIRE-99148",
      wireDate: "Mar 04, 2026",
      disbursedAmount: "$68,200.00",
      clearedStatus: "CLEARED",
      note: "Disbursed following Draw 1 100% spend verification and Amhar photo signoff.",
    },
    txBankStatement: {
      bankName: "BCB Community Bank",
      accountMask: "•••• 4120",
      accountPurpose: "Project Operating & Spend Account",
      clearedSpends: "$68,200.00",
      invoiceCount: 18,
      reconciliationStatus: "100% Cleared & Reconciled",
      trades: [
        { trade: "Structural Steel Framing", amount: "$38,200.00", status: "Cleared" },
        { trade: "Slab-on-Grade Concrete", amount: "$21,500.00", status: "Cleared" },
        { trade: "Formwork & Rebar Tie-ins", amount: "$8,500.00", status: "Cleared" },
      ],
    },
    nextDrawTrigger: {
      thresholdPct: 100,
      isTriggered: true,
      triggerStatusMessage: "Draw #2 fully spent & reconciled ($68,200 / $68,200) via dual statements ➔ Draw #3 unlocked & funded by lender.",
      unlockedNextDrawNumber: 3,
      readinessChecklist: [
        { item: "Draw Bank loan wire verified ($68,200.00)", done: true },
        { item: "Transaction Bank trade spends 100% matched ($68,200.00)", done: true },
        { item: "Lender closeout approval cleared ➔ Unlocked Draw #3", done: true },
      ],
    },
  },
  {
    drawNumber: 3,
    code: "D3",
    title: "Draw #3",
    phaseTitle: "Rough MEP & Utility Rough-Ins",
    scopeSummary: "HVAC sheet metal ductwork, sanitary plumbing stacks, and electrical branch conduit.",
    amount: "$84,000",
    hasPacketBuilt: true,
    allocatedCents: 8400000,
    spentCents: 7896000,
    spentFormatted: "$78,960.00",
    remainingFormatted: "$5,040.00",
    spendProgressPct: 94,
    date: "May 19",
    status: "ACTIVE_SPENDING",
    allocationPass: "SUBSEQUENT_PASS",
    allocationPassLabel: "Funded upon Draw 2 Completion",
    drawBankStatement: {
      bankName: "Capital Reserve Trust",
      accountMask: "•••• 8904",
      accountPurpose: "Lender Construction Loan Account",
      wireRef: "CRT-WIRE-99214",
      wireDate: "May 19, 2026",
      disbursedAmount: "$84,000.00",
      clearedStatus: "CLEARED",
      note: "Disbursed following Draw 2 completion. Capital active for MEP subcontractor draws.",
    },
    txBankStatement: {
      bankName: "BCB Community Bank",
      accountMask: "•••• 4120",
      accountPurpose: "Project Operating & Spend Account",
      clearedSpends: "$78,960.00",
      invoiceCount: 14,
      reconciliationStatus: "94.0% Cleared (Threshold Passed)",
      trades: [
        { trade: "HVAC Ductwork & Equipment", amount: "$34,500.00", status: "Cleared" },
        { trade: "Plumbing Rough-In Stacks", amount: "$23,260.00", status: "Cleared" },
        { trade: "Electrical Conduit & Panels", amount: "$21,200.00", status: "Cleared" },
      ],
    },
    nextDrawTrigger: {
      thresholdPct: 85,
      isTriggered: true,
      triggerStatusMessage: "⚡ Spend reached 94.0% ($78,960 / $84,000), crossing the 85% draw-cycle threshold! Draw #4 is ready for you to build the draw packet and assign the requested amount & work.",
      unlockedNextDrawNumber: 4,
      readinessChecklist: [
        { item: "Draw Bank wire received & active ($84,000.00)", done: true },
        { item: "Transaction Bank spend exceeds 85% threshold (94.0% reached)", done: true },
        { item: "Draw #4 unlocked: Borrower must build draw packet to set requested amount", done: true },
        { item: "Amhar third-party inspection scheduled (Oct 18, 2026)", done: true },
        { item: "Reconcile final $5,040.00 trade balance for 100% closeout", done: false },
      ],
    },
  },
  {
    drawNumber: 4,
    code: "D4",
    title: "Draw #4",
    phaseTitle: "Exterior Enclosure, Glazing & Roofing",
    scopeSummary: "Curtain wall glass, exterior weatherproofing membrane, and TPO roofing system.",
    amount: "—",
    hasPacketBuilt: false,
    allocatedCents: 0,
    spentCents: 0,
    spentFormatted: "$0.00",
    remainingFormatted: "—",
    spendProgressPct: 0,
    date: "Ready to Build",
    status: "PENDING_REVIEW",
    allocationPass: "NEXT_IN_REVIEW",
    allocationPassLabel: "Next Draw • Amount Not Decided",
    drawBankStatement: {
      bankName: "Capital Reserve Trust",
      accountMask: "•••• 8904",
      accountPurpose: "Lender Construction Loan Account",
      wireRef: "Awaiting Submission",
      wireDate: "Pending Packet",
      disbursedAmount: "Pending Packet Submission (Amount TBD)",
      clearedStatus: "PENDING",
      note: "In construction lending, Draw #4 amount is not predetermined. Click 'Build Draw Packet' to assign the requested dollar amount and scope of work for bank approval.",
    },
    txBankStatement: {
      bankName: "BCB Community Bank",
      accountMask: "•••• 4120",
      accountPurpose: "Project Operating & Spend Account",
      clearedSpends: "Pending Packet Approval",
      invoiceCount: 0,
      reconciliationStatus: "Awaiting Packet & Wire",
      trades: [
        { trade: "Exterior Glazing & Curtain Wall", amount: "Pending Claim", status: "Queued" },
        { trade: "TPO Roofing & Membrane", amount: "Pending Claim", status: "Queued" },
        { trade: "Exterior Sheathing & Barrier", amount: "Pending Claim", status: "Queued" },
      ],
    },
    nextDrawTrigger: {
      thresholdPct: 100,
      isTriggered: false,
      triggerStatusMessage: "Click 'Build Draw Packet' to assign SOV line claims, attach inspection photos, and submit Draw #4 to Capital Reserve Trust.",
      unlockedNextDrawNumber: 5,
      readinessChecklist: [
        { item: "Draw #3 threshold surpassed (>85% spent)", done: true },
        { item: "Assign requested amount and work in Build Draw Packet", done: false },
        { item: "Submit AIA G702/G703 packet to Capital Reserve Trust", done: false },
        { item: "Amhar onsite physical inspection sign-off", done: false },
      ],
    },
  },
  {
    drawNumber: 5,
    code: "D5",
    title: "Draw #5",
    phaseTitle: "Interior Drywall, Insulation & Finishes",
    scopeSummary: "Acoustical batting, drywall hanging, taped finish, and primer coats.",
    amount: "—",
    hasPacketBuilt: false,
    allocatedCents: 0,
    spentCents: 0,
    spentFormatted: "$0.00",
    remainingFormatted: "—",
    spendProgressPct: 0,
    date: "Queued",
    status: "QUEUED",
    allocationPass: "QUEUED",
    allocationPassLabel: "Queued in Master Pipeline",
    drawBankStatement: {
      bankName: "Capital Reserve Trust",
      accountMask: "•••• 8904",
      accountPurpose: "Lender Construction Loan Account",
      wireRef: "—",
      wireDate: "Est. Nov 20, 2026",
      disbursedAmount: "Queued (Amount TBD)",
      clearedStatus: "SCHEDULED",
      note: "Scheduled in master draw schedule. Amount will be assigned when Draw #4 spends near completion.",
    },
    txBankStatement: {
      bankName: "BCB Community Bank",
      accountMask: "•••• 4120",
      accountPurpose: "Project Operating & Spend Account",
      clearedSpends: "$0.00",
      invoiceCount: 0,
      reconciliationStatus: "Queued",
      trades: [
        { trade: "Drywall & Acoustic Insulation", amount: "TBD", status: "Queued" },
        { trade: "Prime Coating & Taping", amount: "TBD", status: "Queued" },
        { trade: "Door Jambs & Trim Package", amount: "TBD", status: "Queued" },
      ],
    },
    nextDrawTrigger: {
      thresholdPct: 0,
      isTriggered: false,
      triggerStatusMessage: "Preparation unlocks automatically when Draw #4 spends reach the 85% threshold.",
      unlockedNextDrawNumber: 6,
      readinessChecklist: [
        { item: "Preliminary schedule slot reserved", done: true },
        { item: "Trade subcontracts executed", done: true },
        { item: "Awaiting Draw #4 funding and execution", done: false },
      ],
    },
  },
];

const SHOWCASE_ROWS = [
  {
    id: "drw-4",
    badge: "04",
    badgeType: "PENDING",
    title: "Draw #4 – Exterior Enclosure & Roofing",
    drawRefId: "DRW-2026-004",
    inspectionDate: "Oct 18, 2026 (Scheduled)",
    requestedAmt: "Pending Packet Build",
    eligibleAmt: "—",
    completionPct: 0,
    statusLabel: "READY TO BUILD PACKET",
    statusType: "PENDING",
    actionLabel: "+ Build Draw Packet",
    actionType: "PRIMARY",
    drawNumber: 4,
    bankCleared: "Pending Packet Submission",
    spendStatus: "Triggered by Draw 3 Spends (94%)",
  },
  {
    id: "drw-3",
    badge: "03",
    badgeType: "ACTIVE",
    title: "Draw #3 – Rough MEP & Utility Rough-Ins",
    drawRefId: "DRW-2026-003",
    inspectionDate: "May 19, 2026",
    requestedAmt: "$84,000.00",
    eligibleAmt: "$84,000.00",
    completionPct: 94,
    statusLabel: "ACTIVE SPENDING (94% RECONCILED)",
    statusType: "PENDING",
    actionLabel: "View Spends & Statements",
    actionType: "PRIMARY",
    drawNumber: 3,
    bankCleared: "Wire Cleared • $84,000.00",
    spendStatus: "$78,960 Spent across 14 Invoices",
  },
  {
    id: "drw-2",
    badge: "02",
    badgeType: "FUNDED",
    title: "Draw #2 – Concrete Core & Framing",
    drawRefId: "DRW-2026-002",
    inspectionDate: "Mar 04, 2026",
    requestedAmt: "$68,200.00",
    eligibleAmt: "$68,200.00",
    completionPct: 100,
    statusLabel: "100% RECONCILED & SETTLED",
    statusType: "FUNDED",
    actionLabel: "View Receipt",
    actionType: "OUTLINE",
    drawNumber: 2,
    bankCleared: "Wire Cleared • $68,200.00",
    spendStatus: "100% Spent ($68,200 Reconciled)",
  },
  {
    id: "drw-1",
    badge: "01",
    badgeType: "FUNDED",
    title: "Draw #1 – Mobilization & Foundation",
    drawRefId: "DRW-2026-001",
    inspectionDate: "Jan 12, 2026",
    requestedAmt: "$50,000.00",
    eligibleAmt: "$50,000.00",
    completionPct: 100,
    statusLabel: "FIRST PASS • 100% RECONCILED",
    statusType: "FUNDED",
    actionLabel: "View Receipt",
    actionType: "OUTLINE",
    drawNumber: 1,
    bankCleared: "Wire Cleared • $50,000.00",
    spendStatus: "100% Spent ($50,000 Reconciled)",
  },
  {
    id: "drw-rev3",
    badge: "R3",
    badgeType: "REJECTED",
    title: "Draw #3 Line Revision – Fire Riser Hydraulic Calc",
    drawRefId: "DRW-2026-003-REV",
    inspectionDate: "May 25, 2026",
    requestedAmt: "$6,200.00",
    eligibleAmt: "$0.00",
    completionPct: 0,
    statusLabel: "REJECTED / DISCREPANCY",
    subtitle: "Mechanical PE hydraulic stamp missing on submittal",
    statusType: "REJECTED",
    actionLabel: "Fix Notes",
    actionType: "DANGER_OUTLINE",
    drawNumber: 3,
    bankCleared: "Hold on Line Item",
    spendStatus: "Unfunded Item",
  },
];

export default function DrawsPage() {
  const queryClient = useQueryClient();

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const routeProjectId = typeof window !== "undefined"
    ? (window.location.pathname.match(/^\/projects\/([^\/]+)/)?.[1] || "")
    : "";
  const currentProjectId = (routeProjectId && routeProjectId !== "new")
    ? routeProjectId
    : projectsData?.data?.current_project_id || "";
  const currentProject = projectsData?.data?.projects?.find(
    (p) => p.id === currentProjectId
  );

  const { data: userProfile } = useQuery({
    queryKey: ["identity-me"],
    queryFn: () => api.identity.getMe(),
  });

  const currentRole = userProfile?.data?.role || "OWNER";

  const { data: drawsData, isLoading: isDrawsLoading } = useQuery({
    queryKey: ["draws", currentProjectId],
    queryFn: () => api.draws.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const { data: unallocatedData } = useQuery({
    queryKey: ["unallocated-funding", currentProjectId],
    queryFn: () => api.draws.getUnallocatedFunding(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const draws: DrawItem[] = drawsData?.data || [];
  const unallocatedDeposits = unallocatedData?.data?.unallocated_deposits || [];
  const totalUnallocatedCents = unallocatedData?.data?.total_unallocated || "0";

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
            { id: "c3", title: "Dual Bank Statement Spend Reconciliation", status: "OPEN", required_for: "Draw Release" },
          ],
          packet_checklist: [
            { id: "p1", requirement: "AIA G702 / G703 Application for Payment", status: "COMPLETE", document_name: "G702_Signed.pdf" },
            { id: "p2", requirement: "Transaction Bank Statement Cleared Expenses", status: "COMPLETE", document_name: "BCB_Operating_Stmt.pdf" },
            { id: "p3", requirement: "Draw Bank Loan Wire Confirmation", status: "COMPLETE", document_name: "CRT_Wire_Receipt.pdf" },
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
                allocatedCents: data.totalRequestedCents,
                spentFormatted: "$0.00",
                remainingFormatted: data.formattedAmount,
                allocationPassLabel: "Packet Submitted • In Lender Review",
                status: "PENDING_REVIEW",
                date: "Submitted",
                drawBankStatement: {
                  ...node.drawBankStatement,
                  disbursedAmount: `${data.formattedAmount} (Requested)`,
                  note: `Draw packet submitted to Capital Reserve Trust for ${data.formattedAmount}. Awaiting Amhar onsite inspection and loan committee wire clearance.`,
                  wireRef: `CRT-REQ-00${data.drawNumber}-SUBMITTED`,
                  clearedStatus: "PENDING",
                },
                nextDrawTrigger: {
                  ...node.nextDrawTrigger,
                  triggerStatusMessage: `Draw #${data.drawNumber} packet submitted for ${data.formattedAmount}. Awaiting lender inspection and wire disbursement.`,
                  readinessChecklist: [
                    { item: `Draw #${data.drawNumber} packet submitted with assigned SOV lines`, done: true },
                    { item: "Amhar onsite physical inspection scheduled", done: true },
                    { item: "Lender loan committee wire approval", done: false },
                    { item: "Draw #3 full spend reconciliation", done: true },
                  ],
                },
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
                eligibleAmt: data.formattedAmount,
                statusLabel: "SUBMITTED TO BANK • IN REVIEW",
                actionLabel: "Inspect Packet",
                actionType: "OUTLINE",
              }
            : row
        )
      );
    }
  };

  const nextDrawNumber = Math.max(0, ...draws.map((d) => d.draw_number)) + 1;

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
      project_id: currentProjectId || "6b96d4aa-0ca1-4d8a-9909-cf7b5232c666",
      loan_id: "loan-crt-001",
      draw_number: drawNumber,
      status: drawNumber < 3 ? "CLOSED" : drawNumber === 3 ? "APPROVED" : "UNDER_REVIEW",
      period_start: "2026-01-01",
      period_end: "2026-10-15",
      lender_name: "Capital Reserve Trust",
      requested_amount: String(computedRequestedCents),
      recommended_amount: String(computedRequestedCents),
      approved_amount: String(computedApprovedCents),
      funded_amount: String(computedFundedCents),
      shortfall_amount: "0",
      lines: itemizedLines,
      conditions: [
        { id: "c1", title: "Lender Title Date-Down Endorsement", status: "SATISFIED", required_for: "Wire Clearance" },
        { id: "c2", title: "Subcontractor Lien Waivers Reconciled", status: "SATISFIED", required_for: "Disbursement" },
        { id: "c3", title: "Dual Bank Statement Spend Reconciliation", status: drawNumber <= 2 ? "SATISFIED" : "OPEN", required_for: "Draw Release" },
      ],
      packet_checklist: [
        { id: "p1", requirement: "AIA G702 / G703 Application for Payment", status: "COMPLETE", document_name: "G702_Signed.pdf" },
        { id: "p2", requirement: "Transaction Bank Statement Cleared Expenses", status: "COMPLETE", document_name: "BCB_Operating_Stmt.pdf" },
        { id: "p3", requirement: "Draw Bank Loan Wire Confirmation", status: "COMPLETE", document_name: "CRT_Wire_Receipt.pdf" },
      ],
    };
  };

  const handleUpdateSelectedDraw = (updated: DrawItem) => {
    setSelectedDraw(updated);
    setDrawOverrides((prev) => ({ ...prev, [updated.draw_number]: updated }));
    setShowcaseRows((prev) =>
      prev.map((r) =>
        r.drawNumber === updated.draw_number
          ? {
              ...r,
              requestedAmt: formatMoney(updated.requested_amount),
              eligibleAmt: formatMoney(updated.approved_amount),
            }
          : r
      )
    );
  };

  const handleOpenDetail = (draw: DrawItem) => {
    setSelectedDraw(draw);
    setIsDrawerOpen(true);
  };



  // Filter logic
  const filteredShowcaseRows = useMemo(() => {
    return showcaseRows.filter((r) => {
      if (filterTab === "ACTIVE") return r.statusType === "PENDING" || r.badgeType === "ACTIVE";
      if (filterTab === "FUNDED") return r.statusType === "FUNDED";
      if (filterTab === "DISCREPANCY") return r.statusType === "REJECTED";
      return true;
    });
  }, [showcaseRows, filterTab]);

  return (
    <div className="space-y-6 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Exact Match to Screenshot 1)                               */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-200/80 bg-white px-6 py-5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Draw Workspace & Lender Funding
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Facility Active
              </span>
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 font-medium">
              <span>Loan Facility: <strong className="text-slate-700 font-semibold">#23-03394</strong></span>
              <span>•</span>
              <span>Lender: <strong className="text-slate-700 font-semibold">Capital Reserve Trust</strong></span>
              <span>•</span>
              <span>Property ID: <strong className="text-slate-700 font-semibold">{currentProject?.address || "392 1st St, Jersey City"}</strong></span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPacketDrawNumber(4);
              setIsBuildDrawPacketOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:bg-slate-950 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Build Draw Packet</span>
          </button>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto space-y-6">
        {/* ========================================================================= */}
        {/* 2. FOUR HERO KPI CARDS (Exact Match to Screenshot 1)                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: TOTAL DRAW FACILITY */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Draw Facility
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                $824,450.00
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 font-normal">
              Original Approved Budget: <span className="font-semibold text-slate-700">$850,000.00</span>
            </div>
          </div>

          {/* Card 2: CLEARED CASH FUNDED */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Cleared Cash Disbursed
              </span>
              <div className="flex items-center justify-center h-8 px-2.5 rounded-full border-2 border-teal-500 bg-teal-50 text-[11px] font-extrabold text-teal-700 tracking-tight shrink-0 shadow-2xs">
                24.5%
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                $202,200.00
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Draws #1 & #2 100% Settled • Draw #3 Active</span>
            </div>
          </div>

          {/* Card 3: ACTIVE DRAW SPENDING & NEXT DRAW */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/30 p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Active Spend • Next Draw
              </span>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                Draw #3 ➔ Draw #4
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                $78,960.00
              </span>
            </div>
            <div className="mt-1 text-[11px] text-amber-900 font-medium">
              Draw #3 Spent: <strong>94.0%</strong> of $84,000.00
            </div>
            <div className="mt-3 rounded-lg bg-amber-100/80 border border-amber-200/90 px-2.5 py-1.5 flex items-center justify-between text-[11px]">
              <span className="text-amber-900 font-medium">Draw #4 Pipeline Trigger:</span>
              <span className="font-bold text-amber-800 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-600" />
                Ready to Build Packet
              </span>
            </div>
          </div>

          {/* Card 4: OVERALL COMPLETION */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Reconciled Spend Ratio
              </span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                97.5% Cleared
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                <span>Active Draws Reconciliation:</span>
                <span className="font-bold text-emerald-700">97.5% Matched</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "97.5%" }} />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 leading-tight">
              Reconciled across Draw Bank wires and BCB operating account statements.
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SEQUENTIAL DRAW PROGRESSION & DUAL-STATEMENT VERIFICATION PANEL         */}
        {/* ========================================================================= */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Draw Progression Pipeline & Dual-Statement Verification</span>
                  <span className="text-[11px] font-normal text-slate-400">|</span>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                    Sequential Draw 1 ➔ Draw 5
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Sequential funding cadence: First-pass bank allocation ➔ Trade spends reconciliation ➔ Next draw auto-trigger.
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3.5 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>100% Reconciled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
                <span>Active Spending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>Pending Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span>Queued</span>
              </div>
            </div>
          </div>

          {/* Sequential Connected Pipeline Stepper */}
          <div className="relative pt-3 pb-3 px-2 overflow-x-auto">
            {/* Background Connector Bar with flow colors */}
            <div className="absolute top-[32px] left-10 right-10 h-1 bg-slate-200 -z-0">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-amber-500 transition-all duration-700"
                style={{ width: "75%" }}
              />
            </div>

            <div className="flex items-start justify-between min-w-[760px] relative z-10 px-2">
              {pipelineData.map((node) => {
                const isSelected = selectedTimelineDrawNumber === node.drawNumber;
                const isCompleted = node.status === "COMPLETED";
                const isActiveSpending = node.status === "ACTIVE_SPENDING";
                const isPendingReview = node.status === "PENDING_REVIEW";

                return (
                  <div
                    key={node.code}
                    onClick={() => {
                      if (!node.hasPacketBuilt) {
                        setPacketDrawNumber(node.drawNumber);
                        setIsBuildDrawPacketOpen(true);
                      } else {
                        setSelectedTimelineDrawNumber(node.drawNumber);
                        const fallback = buildDrawFallback(
                          node.drawNumber,
                          node.phaseTitle,
                          node.amount
                        );
                        const matching =
                          draws.find((d) => d.draw_number === node.drawNumber) || fallback;
                        handleOpenDetail(matching);
                      }
                    }}
                    className="flex flex-col items-center text-center group cursor-pointer max-w-[130px] transition-all"
                  >
                    {/* Node Circle */}
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all transform ${
                        isSelected
                          ? "ring-4 ring-blue-500 ring-offset-2 scale-110 shadow-md"
                          : "group-hover:scale-105 shadow-xs"
                      } ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isActiveSpending
                          ? "bg-teal-600 text-white ring-2 ring-teal-400 animate-pulse"
                          : isPendingReview
                          ? "bg-amber-500 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 stroke-[2.5]" />
                      ) : isActiveSpending ? (
                        <Zap className="h-4 w-4 fill-white" />
                      ) : !node.hasPacketBuilt ? (
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                      ) : isPendingReview ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}

                      {/* Small badge overlay */}
                      <span className="absolute -top-1.5 -right-1.5 text-[9px] font-extrabold px-1 rounded-full bg-slate-900 text-white shadow-xs">
                        {node.code}
                      </span>
                    </div>

                    {/* Node Text & Details */}
                    <div className="mt-3 space-y-1 w-full">
                      <div
                        className={`text-xs font-bold flex items-center justify-center gap-1 ${
                          isSelected
                            ? "text-blue-700 underline underline-offset-2"
                            : isPendingReview
                            ? "text-amber-700"
                            : isActiveSpending
                            ? "text-teal-700"
                            : "text-slate-900"
                        }`}
                      >
                        <span>{node.title}</span>
                        {isActiveSpending && (
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-1 rounded font-semibold">Active</span>
                        )}
                        {!node.hasPacketBuilt && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-semibold">Next</span>
                        )}
                      </div>

                      <div className="text-xs font-extrabold text-slate-800 tabular-nums min-h-[20px] flex items-center justify-center">
                        {node.hasPacketBuilt ? (
                          <span>{node.amount}</span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Amount TBD
                          </span>
                        )}
                      </div>

                      {/* Spend Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden my-1">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted
                              ? "bg-emerald-500"
                              : isActiveSpending
                              ? "bg-teal-500"
                              : isPendingReview && node.hasPacketBuilt
                              ? "bg-amber-400"
                              : "bg-slate-200"
                          }`}
                          style={{ width: `${node.hasPacketBuilt ? node.spendProgressPct : 0}%` }}
                        />
                      </div>

                      {node.hasPacketBuilt && (
                        <>
                          <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1">
                            {isCompleted ? (
                              <span className="text-emerald-700 font-bold">100% Spent</span>
                            ) : isActiveSpending ? (
                              <span className="text-teal-700 font-bold">{node.spendProgressPct}% Spent</span>
                            ) : isPendingReview ? (
                              <span className="text-amber-700">Awaiting Wire</span>
                            ) : (
                              <span>Queued</span>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-400">
                            {node.date}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

      </div>

        {/* ========================================================================= */}
        {/* 4. VIEW TOGGLE: REGISTER vs EXCEL SCHEDULE MATRIX                         */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setMainView("REGISTER")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mainView === "REGISTER"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Draw Applications Register</span>
            </button>
            <button
              type="button"
              onClick={() => setMainView("EXCEL_MATRIX")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mainView === "EXCEL_MATRIX"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Excel Schedule of Values Matrix</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  mainView === "EXCEL_MATRIX"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                Draws 1–9 Tasks
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            {mainView === "REGISTER"
              ? "Click any draw row to view itemized tasks & allocate work claim"
              : "Task-by-task breakdown reflecting exact contractor construction ledger"}
          </div>
        </div>

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
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden space-y-0">
            {/* Header & Filter Pills */}
            <div className="px-5 py-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Draw Applications Register
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Official ledger of requests, lender approvals, and wire clearance status.
                </p>
              </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFilterTab("ALL")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterTab === "ALL"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Draws (5)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("ACTIVE")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterTab === "ACTIVE"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active / In Review (2)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("FUNDED")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterTab === "FUNDED"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Funded & Settled (2)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("DISCREPANCY")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterTab === "DISCREPANCY"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Discrepancy (1)
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">DRAW REF</th>
                  <th className="py-3 px-4">LENDER INSPECTION</th>
                  <th className="py-3 px-4">DISBURSED / REQ</th>
                  <th className="py-3 px-4">DUAL STATEMENT STATUS</th>
                  <th className="py-3 px-4">SPEND RECONCILIATION</th>
                  <th className="py-3 px-4">DRAW STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isDrawsLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`draw-skel-${idx}`} className="animate-pulse">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Skeleton className="h-3.5 w-24" />
                      </td>
                      <td className="py-3.5 px-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-3.5 px-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-3.5 px-4">
                        <Skeleton className="h-3.5 w-16" />
                      </td>
                      <td className="py-3.5 px-4">
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Skeleton className="h-7 w-16 ml-auto rounded-md" />
                      </td>
                    </tr>
                  ))
                ) : filteredShowcaseRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedTimelineDrawNumber(row.drawNumber);
                      const matchingDraw =
                        draws.find((d) => d.draw_number === row.drawNumber) ||
                        buildDrawFallback(row.drawNumber, row.title, row.requestedAmt);
                      handleOpenDetail(matchingDraw);
                    }}
                  >
                    {/* DRAW REF */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                            row.badgeType === "PENDING"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : row.badgeType === "FUNDED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {row.badge}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-snug">
                            {row.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ID: {row.drawRefId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* INSPECTION DATE */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {row.inspectionDate}
                    </td>

                    {/* REQUESTED AMT */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                      {row.requestedAmt}
                    </td>

                    {/* DUAL STATEMENT STATUS */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {row.bankCleared}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {row.spendStatus}
                        </div>
                      </div>
                    </td>

                    {/* COMPLETION % */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.completionPct > 90
                                ? row.badgeType === "PENDING"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                            style={{ width: `${row.completionPct}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700 text-[11px] tabular-nums">
                          {row.completionPct}%
                        </span>
                      </div>
                    </td>

                    {/* STATUS & FLAG */}
                    <td className="py-3.5 px-4">
                      {row.statusType === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/90 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          • {row.statusLabel}
                        </span>
                      )}

                      {row.statusType === "FUNDED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          ✓ {row.statusLabel}
                        </span>
                      )}

                      {row.statusType === "REJECTED" && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/90 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                            ⚠ {row.statusLabel}
                          </span>
                          {row.subtitle && (
                            <div className="text-[10px] text-rose-600 mt-0.5">
                              {row.subtitle}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {row.actionType === "PRIMARY" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTimelineDrawNumber(row.drawNumber);
                            if (row.actionLabel.includes("Build Draw Packet")) {
                              setPacketDrawNumber(row.drawNumber);
                              setIsBuildDrawPacketOpen(true);
                            } else {
                              const matchingDraw =
                                draws.find((d) => d.draw_number === row.drawNumber) ||
                                buildDrawFallback(row.drawNumber, row.title, row.requestedAmt);
                              handleOpenDetail(matchingDraw);
                            }
                          }}
                          className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
                        >
                          {row.actionLabel}
                        </button>
                      )}

                      {row.actionType === "OUTLINE" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTimelineDrawNumber(row.drawNumber);
                            const matchingDraw =
                              draws.find((d) => d.draw_number === row.drawNumber) ||
                              buildDrawFallback(row.drawNumber, row.title, row.requestedAmt);
                            handleOpenDetail(matchingDraw);
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          {row.actionLabel}
                        </button>
                      )}

                      {row.actionType === "DANGER_OUTLINE" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTimelineDrawNumber(row.drawNumber);
                            const matchingDraw =
                              draws.find((d) => d.draw_number === row.drawNumber) ||
                              buildDrawFallback(row.drawNumber, row.title, row.requestedAmt);
                            setSelectedDraw(matchingDraw);
                            setIsResubmitRevisionOpen(true);
                          }}
                          className="rounded-lg border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors shadow-2xs"
                        >
                          {row.actionLabel}
                        </button>
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

      {/* ========================================================================= */}
      {/* 5. MODALS & DRAWERS                                                       */}
      {/* ========================================================================= */}
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
