"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BudgetLine, ChangeOrder, ContingencyMovement, MilestoneItem } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { KeyFigure } from "@/components/ui/key-figure";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SourcesButton } from "@/components/ui/source-panel";
import { formatMoney, formatDate } from "@/lib/format";
import {
  ShieldCheck,
  PlusCircle,
  ArrowRightLeft,
  Lock,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Link2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { ApproveBaselineModal } from "@/components/budget/approve-baseline-modal";
import { ChangeOrderModal } from "@/components/budget/change-order-modal";
import { ChangeOrderReviewModal } from "@/components/budget/change-order-review-modal";
import { MoveContingencyModal } from "@/components/budget/move-contingency-modal";
import { LinkMilestoneModal } from "@/components/budget/link-milestone-modal";
import { OverrunDecisionPanel } from "@/components/budget/overrun-decision-panel";

type BudgetTab = "SOV" | "CHANGE_ORDERS" | "CONTINGENCY";

export default function BudgetPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<BudgetTab>("SOV");

  // Modal states
  const [isApproveBaselineOpen, setIsApproveBaselineOpen] = useState(false);
  const [isChangeOrderOpen, setIsChangeOrderOpen] = useState(false);
  const [isMoveContingencyOpen, setIsMoveContingencyOpen] = useState(false);
  const [reviewingChangeOrder, setReviewingChangeOrder] = useState<ChangeOrder | null>(null);
  const [linkingLine, setLinkingLine] = useState<BudgetLine | null>(null);

  // Pre-fill state for Overrun Decision Panel triggers
  const [selectedOverrunLineId, setSelectedOverrunLineId] = useState<string | undefined>(undefined);
  const [suggestedOverrunAmount, setSuggestedOverrunAmount] = useState<number | undefined>(undefined);

  // Load Projects
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const currentProjectId = projectsData?.data?.current_project_id || "";
  const currentProject = (projectsData?.data?.projects || []).find((p) => p.id === currentProjectId);

  // Load Current Budget Lines
  const { data: budgetData, isLoading: isLoadingBudget } = useQuery({
    queryKey: ["budget", currentProjectId],
    queryFn: () => api.budget.getCurrent(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  // Load Change Orders
  const { data: changeOrdersData, isLoading: isLoadingCOs } = useQuery({
    queryKey: ["change-orders", currentProjectId],
    queryFn: () => api.budget.getChangeOrders(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  // Load Milestones
  const { data: milestonesData } = useQuery({
    queryKey: ["milestones", currentProjectId],
    queryFn: () => api.progress.getMilestones(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  // Load Identity
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const lines = budgetData?.data?.lines || [];
  const changeOrders = changeOrdersData?.data || [];
  const milestones = milestonesData?.data || [];
  const currentUser = meData?.data;

  // Calculate totals
  const totalOriginalCents = lines.reduce((sum, l) => sum + parseInt(l.original_amount, 10), 0);
  const totalCurrentApprovedCents = lines.reduce((sum, l) => sum + parseInt(l.current_approved_amount, 10), 0);
  const totalActualSpendCents = lines.reduce((sum, l) => sum + parseInt(l.actual_spend, 10), 0);
  const totalCommittedCents = lines.reduce((sum, l) => sum + parseInt(l.committed_amount, 10), 0);

  const contingencyLine = lines.find((l) => l.code === "20-000" || l.category === "Contingency");
  const contingencyAvailableCents = parseInt(contingencyLine?.current_approved_amount || "0", 10);
  const contingencyOriginalCents = parseInt(contingencyLine?.original_amount || "0", 10);

  // Find lines with overruns
  const overrunLines = lines
    .filter((l) => {
      if (l.code === "20-000") return false;
      const approved = parseInt(l.current_approved_amount, 10);
      const committed = parseInt(l.committed_amount, 10);
      return committed > approved;
    })
    .map((l) => ({
      line: l,
      overrunCents: parseInt(l.committed_amount, 10) - parseInt(l.current_approved_amount, 10),
      reason:
        l.code === "05-100"
          ? "Steel fabricator surcharge and mill ASTM A992 moment connection delivery"
          : "Unforeseen site scope and supplier price adjustments",
    }));

  const handleTriggerMoveContingency = (line: BudgetLine, suggestedAmountCents: number) => {
    setSelectedOverrunLineId(line.id);
    setSuggestedOverrunAmount(suggestedAmountCents);
    setIsMoveContingencyOpen(true);
  };

  const handleTriggerChangeOrder = (line: BudgetLine, suggestedAmountCents: number) => {
    setSelectedOverrunLineId(line.id);
    setSuggestedOverrunAmount(suggestedAmountCents);
    setIsChangeOrderOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Budget & Change Control"
        statusBadge={{
          label: "Approved Baseline (Immutable)",
          variant: "success",
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
        }}
        description="Immutable baseline master Schedule of Values (SOV), approved change orders, and contingency reallocation ledger"
        primaryAction={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedOverrunLineId(undefined);
                setSuggestedOverrunAmount(undefined);
                setIsMoveContingencyOpen(true);
              }}
              className="flex items-center gap-1.5"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Move Contingency
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedOverrunLineId(undefined);
                setSuggestedOverrunAmount(undefined);
                setIsChangeOrderOpen(true);
              }}
              className="flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              Request Change Order
            </Button>
          </div>
        }
      />

      <div className="px-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Figures Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KeyFigure
            label="Original Baseline"
            value={formatMoney(String(totalOriginalCents))}
            basis="Approved Schedule of Values baseline locked 2025-03-25"
            citations={[
              {
                document_id: "doc_73_budget",
                document_name: "73_Broadway_Approved_Budget_2025.xlsx",
                sheet_name: "Master_Budget",
                page_number: 1,
                reviewer: "Marcus Vance",
                reviewed_at: "2025-03-26T14:32:00Z",
                extraction_version: "2025.1",
              },
            ]}
          />

          <KeyFigure
            label="Current Approved Budget"
            value={formatMoney(String(totalCurrentApprovedCents))}
            basis={`Original baseline + ${changeOrders.filter((c) => c.status === "APPROVED").length} approved Change Orders`}
            variance={{
              formattedAmount:
                totalCurrentApprovedCents >= totalOriginalCents
                  ? `+${formatMoney(String(totalCurrentApprovedCents - totalOriginalCents))}`
                  : `-${formatMoney(String(Math.abs(totalCurrentApprovedCents - totalOriginalCents)))}`,
              percentage:
                totalOriginalCents > 0
                  ? Math.round(
                      ((totalCurrentApprovedCents - totalOriginalCents) / totalOriginalCents) * 100
                    )
                  : 0,
              isFavorable: totalCurrentApprovedCents <= totalOriginalCents,
              comparisonLabel: "vs original baseline",
            }}
            citations={[
              {
                document_id: "doc_73_budget",
                document_name: "Approved Change Orders Register (CO-01 to CO-03)",
                page_number: 1,
                reviewer: "Marcus Vance",
                reviewed_at: "2025-08-18T14:00:00Z",
                extraction_version: "2025.3",
              },
            ]}
          />

          <KeyFigure
            label="Actual Cleared Spend"
            value={formatMoney(String(totalActualSpendCents))}
            basis="Sum of verified bank debits allocated to active CSI lines"
            citations={[
              {
                document_id: "doc_73_columbia_stmt_sept",
                document_name: "Columbia Bank & BCB Monthly Statements",
                page_number: 1,
                reviewer: "Sarah Lin",
                reviewed_at: "2025-10-01T11:20:00Z",
                extraction_version: "2025.3",
              },
            ]}
          />

          <KeyFigure
            label="Remaining Contingency"
            value={formatMoney(String(contingencyAvailableCents))}
            basis={`${formatMoney(String(contingencyAvailableCents))} left of ${formatMoney(String(contingencyOriginalCents))} original reserve`}
            variance={{
              formattedAmount:
                contingencyAvailableCents <= contingencyOriginalCents
                  ? `-${formatMoney(String(contingencyOriginalCents - contingencyAvailableCents))}`
                  : `+${formatMoney(String(contingencyAvailableCents - contingencyOriginalCents))}`,
              percentage:
                contingencyOriginalCents > 0
                  ? Math.round(
                      ((contingencyAvailableCents - contingencyOriginalCents) /
                        contingencyOriginalCents) *
                        100
                    )
                  : 0,
              isFavorable: contingencyAvailableCents >= contingencyOriginalCents,
              comparisonLabel: "transferred to overruns",
            }}
            citations={[
              {
                document_id: "doc_73_budget",
                document_name: "Contingency Allocation Ledger (Line 20-000)",
                row_number: 7,
                reviewer: "Marcus Vance",
                reviewed_at: "2025-08-18T14:00:00Z",
                extraction_version: "2025.3",
              },
            ]}
          />
        </div>

        {/* Overrun Decision Panel */}
        <OverrunDecisionPanel
          overrunLines={overrunLines}
          onMoveContingency={handleTriggerMoveContingency}
          onRequestChangeOrder={handleTriggerChangeOrder}
          onCorrectBooking={(line) => {
            toast({
              title: "Reconciliation Queue Opened",
              description: `Navigate to Reconciliation to review raw supplier bookings for ${line.name}.`,
              variant: "info",
            });
          }}
        />

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("SOV")}
              className={cn(
                "px-3.5 py-1.5 rounded-md text-caption font-semibold transition-all flex items-center gap-2",
                activeTab === "SOV"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:bg-subtle hover:text-text-primary"
              )}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Master Budget (SOV)
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", activeTab === "SOV" ? "bg-white/20 text-white" : "bg-subtle text-text-muted")}>
                {lines.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CHANGE_ORDERS")}
              className={cn(
                "px-3.5 py-1.5 rounded-md text-caption font-semibold transition-all flex items-center gap-2",
                activeTab === "CHANGE_ORDERS"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:bg-subtle hover:text-text-primary"
              )}
            >
              <Layers className="h-4 w-4" />
              Change Orders
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", activeTab === "CHANGE_ORDERS" ? "bg-white/20 text-white" : "bg-subtle text-text-muted")}>
                {changeOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CONTINGENCY")}
              className={cn(
                "px-3.5 py-1.5 rounded-md text-caption font-semibold transition-all flex items-center gap-2",
                activeTab === "CONTINGENCY"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:bg-subtle hover:text-text-primary"
              )}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Contingency Transfers
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsApproveBaselineOpen(true)}
              className="text-xs"
            >
              <Lock className="h-3.5 w-3.5 mr-1" />
              Baseline Governance
            </Button>
          </div>
        </div>

        {/* Tab 1: Master Budget SOV Table */}
        {activeTab === "SOV" && (
          <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
            {isLoadingBudget ? (
              <div className="p-12 text-center text-body text-text-muted">
                Loading master Schedule of Values...
              </div>
            ) : lines.length === 0 ? (
              <div className="p-12 text-center">
                <FileSpreadsheet className="mx-auto h-8 w-8 text-text-muted" />
                <h3 className="mt-2 text-section font-semibold text-text-primary">No budget lines configured</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body">
                  <thead>
                    <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
                      <th className="py-3 px-3">CSI Code</th>
                      <th className="py-3 px-3">Division Scope & Name</th>
                      <th className="py-3 px-3 text-right">Original</th>
                      <th className="py-3 px-3 text-right">Current Approved</th>
                      <th className="py-3 px-3 text-right">Actual Spend</th>
                      <th className="py-3 px-3 text-right">Committed</th>
                      <th className="py-3 px-3 text-right">Remaining Exposure</th>
                      <th className="py-3 px-3 text-center">Milestone</th>
                      <th className="py-3 px-3 text-right">Sources</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lines.map((line) => {
                      const orig = parseInt(line.original_amount, 10);
                      const approved = parseInt(line.current_approved_amount, 10);
                      const spend = parseInt(line.actual_spend, 10);
                      const committed = parseInt(line.committed_amount, 10);
                      const exposure = Math.max(0, approved - Math.max(spend, committed));
                      const isContingency = line.code === "20-000" || line.category === "Contingency";
                      const isOverrun = committed > approved;

                      const milestoneObj = milestones.find((m) => m.id === line.milestone_id);

                      return (
                        <tr
                          key={line.id}
                          className={cn(
                            "hover:bg-subtle/30 transition-colors",
                            isContingency && "bg-amber-50/20 font-medium",
                            isOverrun && "bg-rose-50/20"
                          )}
                        >
                          {/* Code */}
                          <td className="py-3 px-3 font-mono text-caption text-text-muted font-semibold">
                            {line.code}
                          </td>

                          {/* Name & Category */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-text-primary text-xs">{line.name}</div>
                            <div className="text-[11px] text-text-muted">{line.category}</div>
                          </td>

                          {/* Original */}
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-text-secondary text-caption">
                            {formatMoney(line.original_amount)}
                          </td>

                          {/* Current Approved */}
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-text-primary text-caption">
                            {formatMoney(line.current_approved_amount)}
                            {approved !== orig && (
                              <div className="text-[10px] text-primary font-normal">
                                {approved > orig ? `+${formatMoney(String(approved - orig))}` : `-${formatMoney(String(orig - approved))}`}
                              </div>
                            )}
                          </td>

                          {/* Actual Spend */}
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-text-primary text-caption">
                            {formatMoney(line.actual_spend)}
                          </td>

                          {/* Committed */}
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-caption">
                            <span className={cn(isOverrun ? "text-danger font-bold" : "text-text-primary")}>
                              {formatMoney(line.committed_amount)}
                            </span>
                          </td>

                          {/* Remaining Exposure */}
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-caption font-semibold">
                            {isContingency ? (
                              <span className="text-amber-800">{formatMoney(String(approved))}</span>
                            ) : (
                              <span className={exposure > 0 ? "text-text-secondary" : "text-danger"}>
                                {formatMoney(String(exposure))}
                              </span>
                            )}
                          </td>

                          {/* Milestone Link */}
                          <td className="py-3 px-3 text-center">
                            {isContingency ? (
                              <span className="text-text-muted text-[11px]">—</span>
                            ) : milestoneObj ? (
                              <button
                                type="button"
                                onClick={() => setLinkingLine(line)}
                                title="Click to re-link milestone"
                                className="inline-flex items-center gap-1 rounded bg-subtle px-2 py-0.5 text-[10px] font-mono text-text-primary hover:bg-border transition-colors"
                              >
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                {milestoneObj.name.split(" ")[0]}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setLinkingLine(line)}
                                className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-mono text-amber-800 hover:bg-amber-100 transition-colors"
                              >
                                <Link2 className="h-3 w-3" />
                                Link
                              </button>
                            )}
                          </td>

                          {/* Sources */}
                          <td className="py-3 px-3 text-right">
                            <SourcesButton
                              figureLabel={`${line.code} - ${line.name}`}
                              amountOrValue={formatMoney(line.current_approved_amount)}
                              basis={`Approved baseline: ${formatMoney(line.original_amount)}`}
                              citations={[
                                {
                                  document_id: "doc_73_budget",
                                  document_name: "73_Broadway_Approved_Budget_2025.xlsx",
                                  sheet_name: "Master_Budget",
                                  row_number: line.sort_order,
                                  reviewer: "Marcus Vance",
                                  reviewed_at: "2025-03-26T14:32:00Z",
                                  extraction_version: "2025.1",
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Pinned Totals Row */}
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 bg-subtle/80 font-bold text-caption">
                      <td className="py-3.5 px-3 uppercase" colSpan={2}>
                        Total Construction Budget (SOV)
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-text-secondary">
                        {formatMoney(String(totalOriginalCents))}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-primary text-body font-bold">
                        {formatMoney(String(totalCurrentApprovedCents))}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-text-primary">
                        {formatMoney(String(totalActualSpendCents))}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-text-primary">
                        {formatMoney(String(totalCommittedCents))}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-primary">
                        {formatMoney(String(totalCurrentApprovedCents - totalActualSpendCents))}
                      </td>
                      <td className="py-3.5 px-3 text-center text-text-muted">—</td>
                      <td className="py-3.5 px-3 text-right">
                        <SourcesButton
                          figureLabel="Master Construction Budget"
                          amountOrValue={formatMoney(String(totalCurrentApprovedCents))}
                          basis="Master Schedule of Values locked baseline + verified Change Orders"
                          citations={[
                            {
                              document_id: "doc_73_budget",
                              document_name: "73_Broadway_Approved_Budget_2025.xlsx",
                              sheet_name: "Summary_Page",
                              reviewer: "Marcus Vance",
                              reviewed_at: "2025-03-26T14:32:00Z",
                              extraction_version: "2025.1",
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Change Orders Register */}
        {activeTab === "CHANGE_ORDERS" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
              {isLoadingCOs ? (
                <div className="p-12 text-center text-body text-text-muted">
                  Loading change order register...
                </div>
              ) : changeOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <Layers className="mx-auto h-8 w-8 text-text-muted" />
                  <h3 className="mt-2 text-section font-semibold text-text-primary">No change orders on file</h3>
                  <p className="mt-1 text-body text-text-secondary">
                    Create a change order to adjust scope or category cost allocations.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-body">
                  <thead>
                    <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
                      <th className="py-3 px-4">CO Number</th>
                      <th className="py-3 px-4">Title & Scope</th>
                      <th className="py-3 px-4">Funding Source</th>
                      <th className="py-3 px-4 text-right">Requested</th>
                      <th className="py-3 px-4 text-right">Approved</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {changeOrders.map((co) => {
                      const targetLine = lines.find((l) => l.id === co.target_budget_line_id);

                      return (
                        <tr key={co.id} className="hover:bg-subtle/30 transition-colors">
                          {/* Number */}
                          <td className="py-3.5 px-4 font-mono font-bold text-caption text-primary">
                            {co.change_order_number}
                          </td>

                          {/* Title & Scope */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-text-primary text-xs">{co.title}</div>
                            <div className="text-caption text-text-muted line-clamp-1 mt-0.5">
                              {co.scope_description}
                            </div>
                            <div className="text-[11px] text-text-secondary font-mono mt-0.5">
                              Target: {targetLine ? `${targetLine.code} - ${targetLine.name}` : "General Line"}
                            </div>
                          </td>

                          {/* Funding Source */}
                          <td className="py-3.5 px-4">
                            <span className="rounded bg-subtle px-2 py-0.5 font-mono text-[11px] text-text-secondary">
                              {co.funding_source}
                            </span>
                          </td>

                          {/* Requested */}
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-caption text-text-secondary">
                            {formatMoney(co.requested_amount)}
                          </td>

                          {/* Approved */}
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-caption font-bold text-text-primary">
                            {co.approved_amount ? formatMoney(co.approved_amount) : "—"}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {co.status === "APPROVED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-[11px] font-semibold text-success">
                                <CheckCircle2 className="h-3 w-3" /> Approved
                              </span>
                            )}
                            {co.status === "SUBMITTED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 text-[11px] font-semibold text-warning">
                                <Clock className="h-3 w-3" /> Submitted
                              </span>
                            )}
                            {co.status === "REJECTED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-danger-subtle px-2.5 py-0.5 text-[11px] font-semibold text-danger">
                                <XCircle className="h-3 w-3" /> Rejected
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setReviewingChangeOrder(co)}
                              className="text-xs"
                            >
                              Review & Audit
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Contingency Movements Ledger */}
        {activeTab === "CONTINGENCY" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-section font-bold text-text-primary">
                    Contingency Allocation History (Line 20-000)
                  </h3>
                  <p className="text-caption text-text-secondary mt-0.5">
                    Immutable log of all reserve draw-downs and transfers to CSI category lines.
                  </p>
                </div>
                <div className="bg-primary-subtle p-3 rounded-lg border border-primary/20 text-right">
                  <span className="text-[11px] text-text-muted block">Available Hard Cost Reserve</span>
                  <span className="font-mono font-bold text-lg text-primary tabular-nums">
                    {formatMoney(String(contingencyAvailableCents))}
                  </span>
                </div>
              </div>

              <div className="rounded-md border border-dashed border-border p-8 text-center">
                <p className="text-sm font-medium text-text-primary">No contingency transfers yet</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Approved transfers will appear here with their destination and audit details.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsMoveContingencyOpen(true)}
                  disabled={!contingencyLine}
                >
                  Record a contingency transfer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ApproveBaselineModal
        budgetId={`b_${currentProjectId}_active`}
        projectId={currentProjectId}
        projectName={currentProject?.name || "Selected project"}
        totalOriginalAmount={String(totalOriginalCents)}
        open={isApproveBaselineOpen}
        onOpenChange={setIsApproveBaselineOpen}
      />

      <ChangeOrderModal
        projectId={currentProjectId}
        budgetLines={lines}
        initialBudgetLineId={selectedOverrunLineId}
        initialAmountCents={suggestedOverrunAmount}
        open={isChangeOrderOpen}
        onOpenChange={setIsChangeOrderOpen}
      />

      <ChangeOrderReviewModal
        changeOrder={reviewingChangeOrder}
        budgetLines={lines}
        open={!!reviewingChangeOrder}
        onOpenChange={(open) => {
          if (!open) setReviewingChangeOrder(null);
        }}
      />

      <MoveContingencyModal
        projectId={currentProjectId}
        budgetLines={lines}
        initialDestinationLineId={selectedOverrunLineId}
        initialAmountCents={suggestedOverrunAmount}
        open={isMoveContingencyOpen}
        onOpenChange={setIsMoveContingencyOpen}
      />

      <LinkMilestoneModal
        budgetLine={linkingLine}
        milestones={milestones}
        open={!!linkingLine}
        onOpenChange={(open) => {
          if (!open) setLinkingLine(null);
        }}
      />
    </div>
  );
}
