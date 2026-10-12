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
} from "lucide-react";
import type { DrawItem } from "@/lib/types";

// Modals and Drawers
import { BuildDrawPacketModal } from "@/components/draws/build-draw-packet-modal";
import { VerifyWorkModal } from "@/components/draws/verify-work-modal";
import { VerifyCostModal } from "@/components/draws/verify-cost-modal";
import { RecordDecisionModal } from "@/components/draws/record-decision-modal";
import { AllocateFundingModal } from "@/components/draws/allocate-funding-modal";
import { ResubmitRevisionModal } from "@/components/draws/resubmit-revision-modal";
import { DrawDetailDrawer } from "@/components/draws/draw-detail-drawer";

type FilterTab = "ALL" | "ACTIVE" | "FUNDED" | "DISCREPANCY";

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
  const [filterTab, setFilterTab] = useState<FilterTab>("ALL");
  const [selectedDraw, setSelectedDraw] = useState<DrawItem | null>(null);

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

  const nextDrawNumber = Math.max(0, ...draws.map((d) => d.draw_number)) + 1;

  const handleOpenDetail = (draw: DrawItem) => {
    setSelectedDraw(draw);
    setIsDrawerOpen(true);
  };

  // Static timeline milestones (Screenshot 1)
  const timelineMilestones = [
    { code: "D1", title: "Draw #1", amount: "$50,000", date: "Jan 12", status: "FUNDED" },
    { code: "D4", title: "Draw #4", amount: "$68,200", date: "Mar 04", status: "FUNDED" },
    { code: "D8", title: "Draw #8", amount: "$84,000", date: "May 19", status: "FUNDED" },
    { code: "D12", title: "Draw #12", amount: "$72,100", date: "Aug 14", status: "FUNDED" },
    { code: "D14", title: "Draw #14", amount: "$45,000", date: "Sep 20", status: "FUNDED" },
    { code: "D15", title: "Draw #15 (Active)", amount: "$23,750", date: "In Review", status: "PENDING" },
  ];

  // Core Showcase Rows from design (matching Screenshot 1)
  const showcaseRows = [
    {
      id: "drw-15",
      badge: "15",
      badgeType: "PENDING",
      title: "Draw #15 – Final Trim",
      drawRefId: "DRW-2023-015",
      inspectionDate: "Oct 10, 2026",
      requestedAmt: "$26,250.00",
      eligibleAmt: "$23,750.00",
      completionPct: 97,
      statusLabel: "PENDING LENDER REVIEW",
      statusType: "PENDING",
      actionLabel: "Inspect Packet",
      actionType: "PRIMARY",
    },
    {
      id: "drw-14",
      badge: "14",
      badgeType: "FUNDED",
      title: "Draw #14 – Millwork & Tile",
      drawRefId: "DRW-2023-014",
      inspectionDate: "Sep 20, 2026",
      requestedAmt: "$45,000.00",
      eligibleAmt: "$45,000.00",
      completionPct: 92,
      statusLabel: "APPROVED & CLEARED",
      statusType: "FUNDED",
      actionLabel: "View Receipt",
      actionType: "OUTLINE",
    },
    {
      id: "drw-13",
      badge: "R3",
      badgeType: "REJECTED",
      title: "Draw #13 Revision – Exterior Paving",
      drawRefId: "DRW-2023-013-REV",
      inspectionDate: "Sep 02, 2026",
      requestedAmt: "$12,500.00",
      eligibleAmt: "$0.00",
      completionPct: 0,
      statusLabel: "REJECTED / DISCREPANCY",
      subtitle: "Missing inspector photo validation",
      statusType: "REJECTED",
      actionLabel: "Fix Notes",
      actionType: "DANGER_OUTLINE",
    },
  ];

  // Filter logic
  const filteredShowcaseRows = useMemo(() => {
    return showcaseRows.filter((r) => {
      if (filterTab === "ACTIVE") return r.statusType === "PENDING";
      if (filterTab === "FUNDED") return r.statusType === "FUNDED";
      if (filterTab === "DISCREPANCY") return r.statusType === "REJECTED";
      return true;
    });
  }, [filterTab, showcaseRows]);

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
            onClick={() => setIsBuildDrawPacketOpen(true)}
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
                Cleared Cash Funded
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-50 text-[11px] font-bold text-teal-700">
                96.9%
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                $799,500.00
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>14 Draws Settled</span>
            </div>
          </div>

          {/* Card 3: ACTIVE PENDING REVIEW (Yellow/Amber Spotlight Card) */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/25 p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Active Pending Review
              </span>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                Draw #15
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                $23,750.00
              </span>
            </div>
            <div className="mt-1 text-[11px] text-amber-800">
              Submitted Oct 10 • Eligible Total
            </div>
            <div className="mt-3 rounded-lg bg-amber-100/70 border border-amber-200/80 px-2.5 py-1.5 flex items-center justify-between text-[11px]">
              <span className="text-amber-900 font-medium">Lender AMHAR Report:</span>
              <span className="font-bold text-amber-800">Awaiting Approval</span>
            </div>
          </div>

          {/* Card 4: OVERALL COMPLETION */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Overall Completion
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
                97% Target
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                <span>SOV Line Completion:</span>
                <span className="font-bold text-slate-900">97% Completed</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: "97%" }} />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 leading-tight">
              Includes 7 final trim line items requested in Draw 15.
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. HISTORICAL DRAW TIMELINE & FUNDING PROGRESSION (Exact Screenshot 1)     */}
        {/* ========================================================================= */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <Sliders className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Historical Draw Timeline & Funding Progression
                </h3>
                <p className="text-[11px] text-slate-500">
                  Visual inspection cadence and dollar allocations across all 15 project draws.
                </p>
              </div>
            </div>

            {/* Legend on right */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Funded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>Pending Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Rejected Item</span>
              </div>
            </div>
          </div>

          {/* Connected Horizontal Timeline Nodes */}
          <div className="relative pt-4 pb-2 px-2 overflow-x-auto">
            {/* Horizontal Line Connector */}
            <div className="absolute top-[28px] left-6 right-6 h-0.5 bg-slate-200 -z-0" />

            <div className="flex items-start justify-between min-w-[650px] relative z-10">
              {timelineMilestones.map((node) => {
                const isFunded = node.status === "FUNDED";
                const isPending = node.status === "PENDING";

                return (
                  <div key={node.code} className="flex flex-col items-center text-center group cursor-pointer">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-xs transition-transform group-hover:scale-110 ${
                        isFunded
                          ? "bg-emerald-500 text-white"
                          : isPending
                          ? "bg-amber-500 text-white"
                          : "bg-rose-500 text-white"
                      }`}
                    >
                      {node.code}
                    </div>

                    <div className="mt-2.5 space-y-0.5">
                      <div
                        className={`text-xs font-bold ${
                          isPending ? "text-amber-700" : "text-slate-900"
                        }`}
                      >
                        {node.title}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 tabular-nums">
                        {node.amount}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {node.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DRAW APPLICATIONS REGISTER TABLE (Exact Match to Screenshot 1)         */}
        {/* ========================================================================= */}
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

            {/* Filter Pills (Exact Screenshot 1) */}
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
                All Draws (16)
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
                Active / In Review (1)
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
                Funded / Cleared (14)
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
                  <th className="py-3 px-4">INSPECTION DATE</th>
                  <th className="py-3 px-4">REQUESTED AMT</th>
                  <th className="py-3 px-4">ELIGIBLE AMT</th>
                  <th className="py-3 px-4">COMPLETION %</th>
                  <th className="py-3 px-4">STATUS & FLAG</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredShowcaseRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => {
                      const matchingDraw = draws.find((d) => d.draw_number === 15) || draws[0];
                      if (matchingDraw) handleOpenDetail(matchingDraw);
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

                    {/* ELIGIBLE AMT */}
                    <td className="py-3.5 px-4 font-bold tabular-nums">
                      <span className={row.eligibleAmt === "$0.00" ? "text-slate-400" : "text-amber-800"}>
                        {row.eligibleAmt}
                      </span>
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
                            const matchingDraw = draws.find((d) => d.draw_number === 15) || draws[0];
                            if (matchingDraw) handleOpenDetail(matchingDraw);
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
                            const matchingDraw = draws.find((d) => d.draw_number === 14) || draws[0];
                            if (matchingDraw) handleOpenDetail(matchingDraw);
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
                            const matchingDraw = draws.find((d) => d.draw_number === 13) || draws[0];
                            if (matchingDraw) {
                              setSelectedDraw(matchingDraw);
                              setIsResubmitRevisionOpen(true);
                            }
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
      </div>

      {/* ========================================================================= */}
      {/* 5. MODALS & DRAWERS                                                       */}
      {/* ========================================================================= */}
      <BuildDrawPacketModal
        open={isBuildDrawPacketOpen}
        onOpenChange={setIsBuildDrawPacketOpen}
        projectId={currentProjectId}
        nextDrawNumber={nextDrawNumber}
        onSuccess={refreshAll}
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
      />
    </div>
  );
}
