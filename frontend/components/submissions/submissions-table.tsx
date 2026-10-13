"use client";

import React, { useState, useMemo } from "react";
import { GCSubmission, UserRole } from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Inbox,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ArrowRight,
  Filter,
  X,
  FileCheck2,
} from "lucide-react";
import { SubmissionDetailDrawer } from "./submission-detail-drawer";
import { Skeleton } from "@/components/ui/skeleton";

interface SubmissionsTableProps {
  submissions: GCSubmission[];
  currentRole: UserRole;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function SubmissionsTable({
  submissions,
  currentRole,
  onRefresh,
  isLoading = false,
}: SubmissionsTableProps) {
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<GCSubmission | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isReviewer = !["GC"].includes(currentRole);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      // Status tab filter
      if (selectedStatusTab !== "ALL" && item.status !== selectedStatusTab) {
        return false;
      }
      // Type filter
      if (selectedType !== "ALL" && item.type !== selectedType) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesNumber = item.submission_number.toLowerCase().includes(query);
        const matchesContractor = item.contractor_name.toLowerCase().includes(query);
        const matchesInvoices = item.invoice_numbers.some((num) =>
          num.toLowerCase().includes(query)
        );
        const matchesCSI = (item.csi_code || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesNumber && !matchesContractor && !matchesInvoices && !matchesCSI) {
          return false;
        }
      }
      return true;
    });
  }, [submissions, selectedStatusTab, selectedType, searchQuery]);

  // Summary Totals
  const totalGrossClaimed = filteredSubmissions.reduce(
    (acc, s) => acc + Number(s.claimed_amount || 0),
    0
  );
  const totalRetainage = filteredSubmissions.reduce(
    (acc, s) => acc + Number(s.retainage_amount || 0),
    0
  );
  const totalNetPayable = filteredSubmissions.reduce(
    (acc, s) => acc + Number(s.net_payable_amount || 0),
    0
  );

  const handleRowClick = (item: GCSubmission) => {
    setSelectedSubmission(item);
    setIsDrawerOpen(true);
  };

  const renderReviewGatePill = (role: string, review?: { status: string; reviewer_name?: string }) => {
    const isApproved = review?.status === "APPROVED";
    const isRejected = review?.status === "REJECTED";

    if (isApproved) {
      return (
        <span
          title={`${role}: Approved by ${review.reviewer_name || "Reviewer"}`}
          className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/70"
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          <span>{role}</span>
        </span>
      );
    }

    if (isRejected) {
      return (
        <span
          title={`${role}: Rejected`}
          className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200/70"
        >
          <XCircle className="h-3 w-3 text-rose-600" />
          <span>{role}</span>
        </span>
      );
    }

    return (
      <span
        title={`${role}: Pending review`}
        className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-500 border border-slate-200"
      >
        <Clock className="h-2.5 w-2.5 text-amber-500" />
        <span>{role}</span>
      </span>
    );
  };

  const renderStatusBadge = (status: GCSubmission["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Approved
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Under Review
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            Rejected
          </span>
        );
      case "SUBMITTED":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Submitted
          </span>
        );
    }
  };

  const renderTypeBadge = (type: GCSubmission["type"]) => {
    switch (type) {
      case "PROGRESS_CLAIM":
        return (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/60">
            Progress Claim
          </span>
        );
      case "COST_EVIDENCE":
        return (
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200/60">
            Cost Evidence
          </span>
        );
      case "CHANGE_ORDER_REQUEST":
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200/60">
            Change Order
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            Claim
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Segmented Status Tabs & Search Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-100/90 p-1 shadow-2xs overflow-x-auto">
          {[
            { id: "ALL", label: "All Submissions", count: submissions.length },
            {
              id: "UNDER_REVIEW",
              label: "Under Review",
              count: submissions.filter((s) => s.status === "UNDER_REVIEW").length,
            },
            {
              id: "APPROVED",
              label: "Approved",
              count: submissions.filter((s) => s.status === "APPROVED").length,
            },
            {
              id: "REJECTED",
              label: "Rejected",
              count: submissions.filter((s) => s.status === "REJECTED").length,
            },
          ].map((tab) => {
            const isActive = selectedStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] sm:min-w-[260px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, invoices, CSI..."
              className="pl-8 pr-7 text-xs h-9 rounded-lg border-slate-200 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none min-w-[160px] shadow-2xs"
            >
              <option value="ALL">All Claim Types</option>
              <option value="PROGRESS_CLAIM">Progress Claims</option>
              <option value="COST_EVIDENCE">Cost Evidence Packages</option>
              <option value="CHANGE_ORDER_REQUEST">Change Orders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Submissions Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3.5 min-w-[220px]">Submission # & Scope</th>
                <th className="py-3 px-2.5 w-[100px]">Type</th>
                <th className="py-3 px-3 text-right w-[95px]">Gross Claim</th>
                <th className="py-3 px-3 text-right w-[90px]">Retainage (10%)</th>
                <th className="py-3 px-3 text-right w-[95px]">Net Payable</th>
                <th className="py-3 px-3 w-[100px]">Submitted</th>
                <th className="py-3 px-2 text-center w-[190px]">3-Tier Review Gates</th>
                <th className="py-3 px-3 text-right w-[95px]">Status</th>
                <th className="py-3 px-3 text-right w-[75px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`sub-skel-${idx}`} className="animate-pulse">
                    <td className="py-3.5 px-4 min-w-[300px]">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Skeleton className="h-6 w-28 rounded-lg" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Skeleton className="h-5 w-16 ml-auto rounded-full" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Skeleton className="h-7 w-16 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-500">
                    <Inbox className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm text-slate-700">No submissions found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No packages match the current filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((item) => {
                  const pmReview = item.reviews.find((r) => r.role === "PM");
                  const cfoReview = item.reviews.find((r) => r.role === "CFO");
                  const ownerReview = item.reviews.find((r) => r.role === "OWNER");

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 min-w-[300px]">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-1">
                          <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/50 shrink-0">
                            {item.submission_number}
                          </span>
                          <span className="font-medium text-slate-600 truncate">{item.contractor_name}</span>
                          {item.csi_code && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 border border-slate-200/60 font-mono text-[10px] shrink-0">
                              {item.csi_code}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {renderTypeBadge(item.type)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 text-right tabular-nums whitespace-nowrap">
                        {formatMoney(item.claimed_amount)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-amber-600 font-medium text-right tabular-nums whitespace-nowrap">
                        {formatMoney(item.retainage_amount)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-right tabular-nums whitespace-nowrap">
                        {formatMoney(item.net_payable_amount)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <div className="font-medium text-slate-800">{formatDate(item.submitted_at)}</div>
                        <div className="text-[11px] text-slate-400">{item.submitted_by}</div>
                      </td>

                      {/* 3-tier review gates visual pipeline */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1 shadow-2xs">
                            {renderReviewGatePill("PM", pmReview)}
                            <span className="text-slate-300 text-[10px]">→</span>
                            {renderReviewGatePill("CFO", cfoReview)}
                            <span className="text-slate-300 text-[10px]">→</span>
                            {renderReviewGatePill("OWNER", ownerReview)}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {renderStatusBadge(item.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-xs font-semibold border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          onClick={() => handleRowClick(item)}
                        >
                          <span>{isReviewer && item.status === "UNDER_REVIEW" ? "Review" : "View"}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredSubmissions.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-semibold text-slate-900">
                  <td className="py-3.5 px-4" colSpan={2}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-700">
                        Total ({filteredSubmissions.length} Submissions)
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatMoney(String(totalGrossClaimed))}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-600 tabular-nums font-semibold">
                    {formatMoney(String(totalRetainage))}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-bold tabular-nums">
                    {formatMoney(String(totalNetPayable))}
                  </td>
                  <td colSpan={4} className="py-3.5 px-4 text-slate-400 text-right text-[11px] font-normal">
                    Subject to sponsor 3-party approval & draw schedule
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Slide-out Workbench Drawer */}
      <SubmissionDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        submission={selectedSubmission}
        currentRole={currentRole}
        onRefresh={() => {
          onRefresh?.();
        }}
      />
    </div>
  );
}
