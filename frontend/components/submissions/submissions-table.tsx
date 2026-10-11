"use client";

import React, { useState, useMemo } from "react";
import { GCSubmission, UserRole } from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import { StatusBadge, StatusBadgeType } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Inbox,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";
import { SubmissionDetailDrawer } from "./submission-detail-drawer";

interface SubmissionsTableProps {
  submissions: GCSubmission[];
  currentRole: UserRole;
  onRefresh?: () => void;
}

export function SubmissionsTable({
  submissions,
  currentRole,
  onRefresh,
}: SubmissionsTableProps) {
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<GCSubmission | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const getStatusBadgeVariant = (status: GCSubmission["status"]): StatusBadgeType => {
    switch (status) {
      case "APPROVED":
        return "verified";
      case "UNDER_REVIEW":
        return "under_review";
      case "REJECTED":
        return "blocked";
      case "SUBMITTED":
        return "proposed";
      default:
        return "provisional";
    }
  };

  const handleRowClick = (item: GCSubmission) => {
    setSelectedSubmission(item);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1 shadow-xs overflow-x-auto">
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
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-caption font-medium transition-colors whitespace-nowrap ${
                selectedStatusTab === tab.id
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                  selectedStatusTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-surface-hover text-text-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, invoices, CSI..."
              className="pl-8 text-caption h-8"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="flex h-8 rounded-md border border-border bg-surface px-2.5 py-1 text-caption text-text-primary focus:border-primary focus:outline-none min-w-[160px]"
          >
            <option value="ALL">All Submission Types</option>
            <option value="PROGRESS_CLAIM">Progress Claims</option>
            <option value="COST_EVIDENCE">Cost Evidence Packages</option>
            <option value="CHANGE_ORDER_REQUEST">Change Order Requests</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-caption">
            <thead>
              <tr className="border-b border-border bg-surface-hover/70 text-text-secondary">
                <th className="py-3 px-4 font-semibold">Submission # & Scope</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold text-right">Gross Claim</th>
                <th className="py-3 px-4 font-semibold text-right">Retainage (10%)</th>
                <th className="py-3 px-4 font-semibold text-right">Net Payable</th>
                <th className="py-3 px-4 font-semibold">Submitted</th>
                <th className="py-3 px-4 font-semibold text-center">Review Gates (PM / CFO / Owner)</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-muted">
                    <Inbox className="h-8 w-8 mx-auto mb-2 text-text-muted/60" />
                    <p className="font-medium text-body">No submissions match this filter</p>
                    <p className="text-caption text-text-muted mt-0.5">
                      Create a new progress claim or cost evidence package to begin.
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
                      className="hover:bg-surface-hover/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-text-primary">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 text-text-muted text-[11px] mt-0.5">
                          <span className="font-mono text-primary font-medium">{item.submission_number}</span>
                          <span>•</span>
                          <span>{item.contractor_name}</span>
                          {item.csi_code && (
                            <>
                              <span>•</span>
                              <span className="rounded bg-surface-hover px-1.5 py-0.2 border border-border">
                                {item.csi_code} {item.csi_category}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border">
                          {item.type === "PROGRESS_CLAIM"
                            ? "Progress Claim"
                            : item.type === "COST_EVIDENCE"
                            ? "Cost Evidence"
                            : "Change Order Req"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-text-primary text-right tabular-nums whitespace-nowrap">
                        {formatMoney(item.claimed_amount)}
                      </td>

                      <td className="py-3 px-4 font-mono text-warning text-right tabular-nums whitespace-nowrap">
                        {formatMoney(item.retainage_amount)}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-primary text-right tabular-nums whitespace-nowrap">
                        {formatMoney(item.net_payable_amount)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-text-secondary">
                        <div>{formatDate(item.submitted_at)}</div>
                        <div className="text-[11px] text-text-muted">{item.submitted_by}</div>
                      </td>

                      {/* 3-step review gate pills */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* PM Gate */}
                          <div
                            title={`PM Gate: ${pmReview?.status || "PENDING"}`}
                            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              pmReview?.status === "APPROVED"
                                ? "bg-success-subtle text-success border border-success/30"
                                : pmReview?.status === "REJECTED"
                                ? "bg-danger-subtle text-danger border border-danger/30"
                                : "bg-warning-subtle text-warning border border-warning/30"
                            }`}
                          >
                            <span>PM</span>
                            {pmReview?.status === "APPROVED" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : pmReview?.status === "REJECTED" ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                          </div>

                          {/* CFO Gate */}
                          <div
                            title={`CFO Gate: ${cfoReview?.status || "PENDING"}`}
                            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              cfoReview?.status === "APPROVED"
                                ? "bg-success-subtle text-success border border-success/30"
                                : cfoReview?.status === "REJECTED"
                                ? "bg-danger-subtle text-danger border border-danger/30"
                                : "bg-warning-subtle text-warning border border-warning/30"
                            }`}
                          >
                            <span>CFO</span>
                            {cfoReview?.status === "APPROVED" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : cfoReview?.status === "REJECTED" ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                          </div>

                          {/* Owner Gate */}
                          <div
                            title={`Owner Gate: ${ownerReview?.status || "PENDING"}`}
                            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              ownerReview?.status === "APPROVED"
                                ? "bg-success-subtle text-success border border-success/30"
                                : ownerReview?.status === "REJECTED"
                                ? "bg-danger-subtle text-danger border border-danger/30"
                                : "bg-warning-subtle text-warning border border-warning/30"
                            }`}
                          >
                            <span>OWNER</span>
                            {ownerReview?.status === "APPROVED" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : ownerReview?.status === "REJECTED" ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <StatusBadge
                          status={getStatusBadgeVariant(item.status)}
                          customLabel={item.status.replace("_", " ")}
                        />
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRowClick(item)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredSubmissions.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border bg-surface-hover/80 font-semibold text-text-primary">
                  <td className="py-3 px-4" colSpan={2}>
                    <span>Pinned Totals ({filteredSubmissions.length} Submissions)</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatMoney(String(totalGrossClaimed))}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-warning tabular-nums">
                    {formatMoney(String(totalRetainage))}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-primary font-bold tabular-nums">
                    {formatMoney(String(totalNetPayable))}
                  </td>
                  <td colSpan={4} className="py-3 px-4 text-text-muted text-right">
                    Subject to sponsor verification
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
