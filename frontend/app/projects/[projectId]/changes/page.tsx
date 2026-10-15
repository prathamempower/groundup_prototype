"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  BudgetLine,
  ChangeOrder,
  ContingencyMovement,
} from "@/lib/types";
import { formatMoney } from "@/lib/format";
import {
  PlusCircle,
  FileText,
  Search,
  Filter,
  ArrowRightLeft,
  ChevronRight,
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

import { ChangeOrderModal } from "@/components/budget/change-order-modal";
import { ChangeOrderReviewModal } from "@/components/budget/change-order-review-modal";
import { MoveContingencyModal } from "@/components/budget/move-contingency-modal";

export default function ChangesAndApprovalsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [coStatusFilter, setCoStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modals
  const [isChangeOrderOpen, setIsChangeOrderOpen] = useState(false);
  const [isMoveContingencyOpen, setIsMoveContingencyOpen] = useState(false);
  const [reviewingChangeOrder, setReviewingChangeOrder] = useState<ChangeOrder | null>(null);

  // 1. Projects & Current User
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const { data: userProfileData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.identity.getMe(),
  });
  const userRole = userProfileData?.data?.role || "OWNER";

  const routeProjectId = (params?.projectId as string) || "";
  const currentProjectId =
    routeProjectId && routeProjectId !== "new"
      ? routeProjectId
      : projectsData?.data?.current_project_id ||
        projectsData?.data?.projects?.[0]?.id ||
        "";

  const currentProject = (projectsData?.data?.projects || []).find(
    (p) => p.id === currentProjectId
  );
  const projectName = currentProject?.name || "Project";

  // 2. Budget Data (Lines for modals)
  const { data: budgetData } = useQuery({
    queryKey: ["budget", "current", currentProjectId],
    queryFn: () => api.budget.getCurrent(currentProjectId),
    enabled: Boolean(currentProjectId),
  });
  const dbBudgetLines: BudgetLine[] = useMemo(
    () => (budgetData?.data as any)?.lines || [],
    [budgetData?.data]
  );

  // 3. Change Orders
  const { data: changeOrdersData, isLoading: isLoadingCOs } = useQuery({
    queryKey: ["change-orders", currentProjectId],
    queryFn: () => api.budget.getChangeOrders(currentProjectId),
    enabled: Boolean(currentProjectId),
  });
  const changeOrders = useMemo(() => changeOrdersData?.data || [], [changeOrdersData?.data]);

  // 4. Contingency Movements
  const { data: contingencyMovementsData } = useQuery({
    queryKey: ["contingency-movements", currentProjectId],
    queryFn: () => api.budget.getContingencyMovements(currentProjectId),
    enabled: Boolean(currentProjectId),
  });
  const contingencyMovements = useMemo(
    () => contingencyMovementsData?.data || [],
    [contingencyMovementsData?.data]
  );

  // Quick stats
  const pendingCount = changeOrders.filter(
    (c) => c.status === "SUBMITTED" || c.status === "DRAFT"
  ).length;
  const approvedCount = changeOrders.filter((c) => c.status === "APPROVED").length;
  const rejectedCount = changeOrders.filter((c) => c.status === "REJECTED").length;

  const totalRequestedCents = changeOrders.reduce(
    (acc, co) => acc + parseInt(String(co.requested_amount || "0"), 10),
    0
  );
  const totalApprovedCents = changeOrders.reduce(
    (acc, co) => acc + parseInt(String(co.approved_amount || "0"), 10),
    0
  );

  const filteredChangeOrders = useMemo(() => {
    return changeOrders.filter((co) => {
      const matchesStatus =
        coStatusFilter === "ALL"
          ? true
          : coStatusFilter === "PENDING"
          ? co.status === "SUBMITTED" || co.status === "DRAFT"
          : co.status === coStatusFilter;

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (co.change_order_number || "").toLowerCase().includes(term) ||
        (co.title || "").toLowerCase().includes(term) ||
        (co.scope_description || "").toLowerCase().includes(term) ||
        (co.requested_by || "").toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [changeOrders, coStatusFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* PAGE HEADER */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span
              className="hover:text-slate-700 cursor-pointer"
              onClick={() => router.push("/projects")}
            >
              Projects
            </span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span
              className="hover:text-slate-700 cursor-pointer font-medium text-slate-600"
              onClick={() => router.push(`/projects/${currentProjectId}/control-center`)}
            >
              {projectName}
            </span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-900 font-semibold">Changes & Approvals</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                <CheckSquare className="h-6 w-6 text-blue-600" />
                Changes & Approvals
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Audit history of scope modifications, cost revisions, and contingency reallocations for {projectName}.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Decisions
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{pendingCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Awaiting review & sign-off</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Approved Orders
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{approvedCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Committed to contract</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Requested
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
              {formatMoney(totalRequestedCents)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Across all change orders</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Approved
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckSquare className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-2 tabular-nums">
              {formatMoney(totalApprovedCents)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Incorporated into budget</p>
          </div>
        </div>

        {/* Change Orders Table Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Change Orders & Scope Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter and review pending contractor submissions and approved variations.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search change orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setCoStatusFilter(st)}
                className={cn(
                  "px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer",
                  coStatusFilter === st
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {st === "ALL" ? "All Change Orders" : st}
              </button>
            ))}
          </div>

          {/* Change Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="text-left py-2.5 px-3">CO #</th>
                  <th className="text-left py-2.5 px-3">Title & Scope</th>
                  <th className="text-right py-2.5 px-3">Requested</th>
                  <th className="text-right py-2.5 px-3">Approved</th>
                  <th className="text-left py-2.5 px-3">Requested By</th>
                  <th className="text-center py-2.5 px-3">Status</th>
                  <th className="text-right py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChangeOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No change orders match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredChangeOrders.map((co) => {
                    const isPending = co.status === "SUBMITTED" || co.status === "DRAFT";
                    return (
                      <tr key={co.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {co.change_order_number || "CO-002"}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900">{co.title}</p>
                          <p className="text-[11px] text-slate-500 max-w-sm truncate">
                            {co.scope_description || (co as any).reason}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                          {formatMoney(parseInt(String(co.requested_amount || "0"), 10))}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                          {co.approved_amount
                            ? formatMoney(parseInt(String(co.approved_amount), 10))
                            : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {(() => {
                            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                              co.requested_by || ""
                            );
                            const displayName =
                              co.requester_name ||
                              (!isUuid && co.requested_by ? co.requested_by : "Frank Miller (General Contractor)");
                            return (
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">{displayName}</span>
                                {co.requester_role && (
                                  <span className="text-[10px] text-slate-400 capitalize">
                                    {co.requester_role.toLowerCase()}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              co.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isPending
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            )}
                          >
                            {co.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isPending && userRole === "OWNER" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReviewingChangeOrder(co)}
                              className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                            >
                              Review & Decide
                            </Button>
                          ) : (
                            <span className="text-slate-400 text-xs">Logged</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contingency Movements Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Contingency Movements & Line Reallocations
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct transfers between project contingency reserves and budget line items.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMoveContingencyOpen(true)}
              className="text-xs border-slate-200 h-8"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
              Reallocate Contingency
            </Button>
          </div>

          {contingencyMovements.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No contingency movements recorded.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-right py-2 px-3">Amount</th>
                    <th className="text-left py-2 px-3">Reason / Rationale</th>
                    <th className="text-left py-2 px-3">Approved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contingencyMovements.map((cm) => (
                    <tr key={cm.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-500">
                        {cm.created_at ? new Date(cm.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {formatMoney(parseInt(String(cm.amount || "0"), 10))}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{cm.reason}</td>
                      <td className="py-2.5 px-3 text-slate-500">Project Owner</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ChangeOrderModal
        projectId={currentProjectId}
        budgetLines={dbBudgetLines}
        open={isChangeOrderOpen}
        onOpenChange={setIsChangeOrderOpen}
      />

      {reviewingChangeOrder && (
        <ChangeOrderReviewModal
          changeOrder={reviewingChangeOrder}
          budgetLines={dbBudgetLines}
          open={Boolean(reviewingChangeOrder)}
          onOpenChange={(op) => {
            if (!op) setReviewingChangeOrder(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["change-orders", currentProjectId] });
            queryClient.invalidateQueries({ queryKey: ["budget", "current", currentProjectId] });
            queryClient.invalidateQueries({ queryKey: ["economics", currentProjectId] });
          }}
        />
      )}

      <MoveContingencyModal
        projectId={currentProjectId}
        budgetLines={dbBudgetLines}
        open={isMoveContingencyOpen}
        onOpenChange={setIsMoveContingencyOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["budget", "current", currentProjectId] });
          queryClient.invalidateQueries({ queryKey: ["contingency-movements", currentProjectId] });
          queryClient.invalidateQueries({ queryKey: ["economics", currentProjectId] });
        }}
      />
    </div>
  );
}
