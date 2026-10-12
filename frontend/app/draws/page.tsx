"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { KeyFigure } from "@/components/ui/key-figure";
import { SourcesButton } from "@/components/ui/source-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatMoney, formatDate } from "@/lib/format";
import {
  Landmark,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  ClipboardCheck,
  Building2,
  GitBranch,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import type { DrawItem } from "@/lib/types";

// Modals and Drawers
import { CreateDrawModal } from "@/components/draws/create-draw-modal";
import { VerifyWorkModal } from "@/components/draws/verify-work-modal";
import { VerifyCostModal } from "@/components/draws/verify-cost-modal";
import { RecordDecisionModal } from "@/components/draws/record-decision-modal";
import { AllocateFundingModal } from "@/components/draws/allocate-funding-modal";
import { ResubmitRevisionModal } from "@/components/draws/resubmit-revision-modal";
import { DrawDetailDrawer } from "@/components/draws/draw-detail-drawer";

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
  const [activeTab, setActiveTab] = useState<"applications" | "unallocated">("applications");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "FUNDED" | "CLOSED">("ALL");
  const [selectedDraw, setSelectedDraw] = useState<DrawItem | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
      // Re-fetch active draw
      api.draws.getById(selectedDraw.id).then((res) => {
        if (res?.data) setSelectedDraw(res.data);
      });
    }
  };

  // KPI Computations
  const totalRequestedCents = draws.reduce((sum, d) => sum + parseInt(d.requested_amount || "0", 10), 0);
  const totalFundedCents = draws.reduce((sum, d) => sum + parseInt(d.funded_amount || "0", 10), 0);
  const totalShortfallCents = draws.reduce((sum, d) => sum + parseInt(d.shortfall_amount || "0", 10), 0);

  // Filter draws
  const filteredDraws = draws.filter((draw) => {
    if (statusFilter === "ACTIVE") {
      return ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "PARTIALLY_APPROVED", "APPROVED"].includes(draw.status);
    }
    if (statusFilter === "FUNDED") {
      return draw.status === "FUNDED";
    }
    if (statusFilter === "CLOSED") {
      return draw.status === "CLOSED";
    }
    return true;
  });

  const nextDrawNumber = Math.max(0, ...draws.map((d) => d.draw_number)) + 1;

  const handleOpenDetail = (draw: DrawItem) => {
    setSelectedDraw(draw);
    setIsDrawerOpen(true);
  };

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
        return "provisional" as const;
    }
  };

  const { data: documentsData } = useQuery({
    queryKey: ["documents", currentProjectId],
    queryFn: () => api.documents.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const projectDocs = documentsData?.data || [];
  const primaryDoc = projectDocs[0];
  const drawPacketDoc = projectDocs.find((d) => d.document_type === "DRAW_PACKAGE" || d.original_filename?.toLowerCase().includes("draw") || d.original_filename?.toLowerCase().includes("report")) || primaryDoc;
  const statementDoc = projectDocs.find((d) => d.document_type === "BANK_STATEMENT" || d.document_type === "BUDGET_SOV" || d.original_filename?.toLowerCase().includes("statement")) || primaryDoc;

  const drawVolumeCitations = drawPacketDoc
    ? [
        {
          document_id: drawPacketDoc.id,
          document_name: drawPacketDoc.original_filename,
          page_number: 1,
          reviewer: "Marcus Vance",
          reviewed_at: drawPacketDoc.uploaded_at,
          extraction_version: "1.0",
        },
      ]
    : [];

  const clearedFundedCitations = statementDoc
    ? [
        {
          document_id: statementDoc.id,
          document_name: statementDoc.original_filename,
          page_number: 2,
          reviewer: "Sarah Lin",
          reviewed_at: statementDoc.uploaded_at,
          extraction_version: "1.0",
        },
      ]
    : [];

  const shortfallCitations = drawPacketDoc
    ? [
        {
          document_id: drawPacketDoc.id,
          document_name: drawPacketDoc.original_filename,
          page_number: 2,
          reviewer: "David Ross",
          reviewed_at: drawPacketDoc.uploaded_at,
          extraction_version: "1.0",
        },
      ]
    : [];

  const unallocatedCitations = statementDoc
    ? [
        {
          document_id: statementDoc.id,
          document_name: statementDoc.original_filename,
          page_number: 1,
          reviewer: "Sarah Lin",
          reviewed_at: statementDoc.uploaded_at,
          extraction_version: "1.0",
        },
      ]
    : [];

  return (
    <div className="space-y-6 pb-16">
      <div className="px-6 max-w-7xl mx-auto space-y-6 pt-4">
        <PageHeader
          title="Draws & Lender Funding"
          statusBadge={{
            label: `${draws.length} Applications`,
            variant: "neutral",
            icon: <Landmark className="h-3.5 w-3.5" />,
          }}
          primaryAction={
            currentRole !== "GC" && currentRole !== "INVESTOR" ? (
              <Button
                variant="primary"
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Prepare Draw
              </Button>
            ) : undefined
          }
        />

        {/* KEY FIGURES METRICS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KeyFigure
            label="Total Draw Volume"
            value={formatMoney(String(totalRequestedCents))}
            basis="Gross requested across all loan applications"
            citations={drawVolumeCitations}
          />

          <KeyFigure
            label="Cleared Cash Funded"
            value={formatMoney(String(totalFundedCents))}
            basis="Confirmed bank wire deposits with CLEARED status"
            citations={clearedFundedCitations}
          />

          <KeyFigure
            label="Active Lender Shortfall"
            value={formatMoney(String(totalShortfallCents))}
            basis="Lender withholdings pending condition satisfaction"
            citations={shortfallCitations}
          />

          <KeyFigure
            label="Unallocated Wire Deposits"
            value={formatMoney(totalUnallocatedCents)}
            basis="Cleared bank wires available for draw matching"
            citations={unallocatedCitations}
          />
        </div>

        {/* WORKSPACE TABS */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("applications")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "applications"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Draw Applications</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "applications" ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700"
                }`}>
                  {draws.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("unallocated")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "unallocated"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>Unallocated Deposits</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "unallocated" ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700"
                }`}>
                  {unallocatedDeposits.length}
                </span>
              </button>
            </div>

            {activeTab === "applications" && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                {(["ALL", "ACTIVE", "FUNDED", "CLOSED"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      statusFilter === filter
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {filter === "ALL" ? "All" : filter === "ACTIVE" ? "In Review" : filter === "FUNDED" ? "Funded" : "Closed"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TAB 1: DRAW APPLICATIONS REGISTER */}
          {activeTab === "applications" && (
            <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
              {isDrawsLoading ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  Loading draw register...
                </div>
              ) : filteredDraws.length === 0 ? (
                <div className="py-16 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mx-auto border border-slate-100">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900">
                    No matching draw applications
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Prepare a new draw application to initiate certified lender submission.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-body">
                    <thead>
                      <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
                        <th className="py-2.5 px-4">Application #</th>
                        <th className="py-2.5 px-4">Facility & Period</th>
                        <th className="py-2.5 px-4">Lifecycle Status</th>
                        <th className="py-2.5 px-4 text-right">Requested</th>
                        <th className="py-2.5 px-4 text-right">Inspector Rec.</th>
                        <th className="py-2.5 px-4 text-right">Lender Approved</th>
                        <th className="py-2.5 px-4 text-right font-bold text-success">Cleared Funded</th>
                        <th className="py-2.5 px-4 text-center">Dual Verification</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredDraws.map((draw) => {
                        const shortfall = parseInt(draw.shortfall_amount || "0", 10);
                        const isShort = shortfall > 0 || draw.status === "PARTIALLY_APPROVED";

                        return (
                          <tr
                            key={draw.id}
                            className="hover:bg-subtle/30 transition-colors cursor-pointer group"
                            onClick={() => handleOpenDetail(draw)}
                          >
                            <td className="py-3 px-4 font-semibold text-text-primary">
                              <div className="flex items-center gap-1.5">
                                <span>Draw #{draw.draw_number}</span>
                                {draw.revision_label && (
                                  <span className="rounded bg-primary-subtle px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                    {draw.revision_label}
                                  </span>
                                )}
                              </div>
                              {draw.parent_draw_id && (
                                <div className="text-[11px] font-normal text-text-muted flex items-center gap-1 mt-0.5">
                                  <GitBranch className="h-3 w-3" /> Child Revision
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4 text-body-sm">
                              <div className="font-medium text-text-primary truncate max-w-[180px]">
                                {draw.lender_name}
                              </div>
                              <div className="text-caption text-text-muted">
                                {draw.period_start} to {draw.period_end}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <StatusBadge
                                status={getStatusBadgeType(draw.status)}
                                customLabel={draw.status.replace("_", " ")}
                              />
                              {isShort && (
                                <div className="text-[11px] font-semibold text-warning mt-1 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Short: {formatMoney(String(shortfall))}
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                              {formatMoney(draw.requested_amount)}
                            </td>

                            <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                              {formatMoney(draw.recommended_amount)}
                            </td>

                            <td className="py-3 px-4 text-right tabular-nums font-medium text-text-primary">
                              {formatMoney(draw.approved_amount)}
                            </td>

                            <td className="py-3 px-4 text-right tabular-nums font-bold text-success">
                              {formatMoney(draw.funded_amount || "0")}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <span
                                  title={
                                    draw.pm_verification?.inspection_passed
                                      ? `PM Verified: ${draw.pm_verification.verified_by}`
                                      : "PM Work Verification Pending"
                                  }
                                  className={`rounded p-1 ${
                                    draw.pm_verification?.inspection_passed
                                      ? "bg-primary-subtle text-primary"
                                      : "bg-subtle text-text-muted"
                                  }`}
                                >
                                  <ClipboardCheck className="h-3.5 w-3.5" />
                                </span>

                                <span
                                  title={
                                    draw.cfo_verification?.costs_verified
                                      ? `CFO Verified: ${draw.cfo_verification.verified_by}`
                                      : "CFO Cost Verification Pending"
                                  }
                                  className={`rounded p-1 ${
                                    draw.cfo_verification?.costs_verified
                                      ? "bg-success-subtle text-success"
                                      : "bg-subtle text-text-muted"
                                  }`}
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenDetail(draw)}
                                  className="text-caption font-medium"
                                >
                                  Workbench
                                </Button>

                                {(draw.status === "SUBMITTED" || draw.status === "UNDER_REVIEW") && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDraw(draw);
                                      setIsRecordDecisionOpen(true);
                                    }}
                                    className="text-caption"
                                  >
                                    Decision
                                  </Button>
                                )}

                                {(isShort || draw.status === "APPROVED") && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDraw(draw);
                                      setIsAllocateFundingOpen(true);
                                    }}
                                    className="text-caption text-success border-success/30 hover:bg-success-subtle/20"
                                  >
                                    Allocate
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNALLOCATED WIRE DEPOSITS */}
          {activeTab === "unallocated" && (
            <div className="rounded-lg border border-border bg-surface p-6 space-y-4 shadow-xs">
              <div>
                <h3 className="text-section font-bold text-text-primary">
                  Cleared Bank Wire Deposits
                </h3>
                <p className="text-body-sm text-text-secondary mt-0.5">
                  Confirmed bank deposits received from lenders awaiting line-by-line allocation to approved draws.
                </p>
              </div>

              {unallocatedDeposits.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-lg bg-subtle/20">
                  <DollarSign className="mx-auto h-8 w-8 text-text-muted" />
                  <p className="mt-2 text-body font-semibold text-text-primary">
                    No unallocated wire deposits
                  </p>
                  <p className="text-caption text-text-muted">
                    All confirmed cash deposits have been fully allocated to active draw applications.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unallocatedDeposits.map((dep) => (
                    <div
                      key={dep.transaction_id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:bg-subtle/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-success-subtle p-2 text-success">
                          <Landmark className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary text-body">
                              {dep.institution}
                            </span>
                            <span className="rounded bg-success-subtle px-2 py-0.5 text-caption font-bold text-success">
                              CLEARED
                            </span>
                          </div>
                          <p className="text-caption text-text-secondary mt-0.5">{dep.memo}</p>
                          <span className="text-[11px] text-text-muted">
                            Cleared Date: {dep.cleared_date} • Ref ID: {dep.transaction_id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-caption text-text-muted block">Available Wire</span>
                          <span className="text-section font-bold tabular-nums text-success">
                            {formatMoney(dep.amount)}
                          </span>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            // Preselect Draw 3 or first approved draw
                            const target = draws.find((d) => d.status === "PARTIALLY_APPROVED" || d.status === "APPROVED") || draws[0];
                            setSelectedDraw(target || null);
                            setIsAllocateFundingOpen(true);
                          }}
                          className="flex items-center gap-1.5"
                        >
                          Allocate to Draw
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <CreateDrawModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
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
