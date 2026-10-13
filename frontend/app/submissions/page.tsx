"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import {
  Plus,
  Receipt,
  FileText,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { GcRoleBoundaryBanner } from "@/components/submissions/gc-role-boundary-banner";
import { SubmissionsTable } from "@/components/submissions/submissions-table";
import { CreateClaimModal } from "@/components/submissions/create-claim-modal";
import { CreateCostEvidenceModal } from "@/components/submissions/create-cost-evidence-modal";
import { CreateCorModal } from "@/components/submissions/create-cor-modal";

export default function SubmissionsPage() {
  const queryClient = useQueryClient();

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [isCorModalOpen, setIsCorModalOpen] = useState(false);

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

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
  const currentProject = projectsData?.data?.projects?.find((p) => p.id === currentProjectId);
  const currentRole = meData?.data?.role || "OWNER";

  const { data: submissionsData, isLoading: isSubmissionsLoading } = useQuery({
    queryKey: ["submissions", currentProjectId],
    queryFn: () => api.submissions.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const { data: milestonesData } = useQuery({
    queryKey: ["milestones", currentProjectId],
    queryFn: () => api.progress.getMilestones(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const submissions = submissionsData?.data || [];
  const milestones = milestonesData?.data || [];

  // Metrics computation
  const totalClaimed = submissions.reduce((acc, s) => acc + Number(s.claimed_amount || 0), 0);
  const underReviewSubmissions = submissions.filter((s) => s.status === "UNDER_REVIEW");
  const underReviewAmount = underReviewSubmissions.reduce(
    (acc, s) => acc + Number(s.claimed_amount || 0),
    0
  );
  const approvedSubmissions = submissions.filter((s) => s.status === "APPROVED");
  const approvedAmount = approvedSubmissions.reduce(
    (acc, s) => acc + Number(s.claimed_amount || 0),
    0
  );
  const totalRetainage = submissions.reduce((acc, s) => acc + Number(s.retainage_amount || 0), 0);

  const approvedPct = totalClaimed > 0 ? Math.round((approvedAmount / totalClaimed) * 100) : 0;
  const underReviewPct = totalClaimed > 0 ? Math.round((underReviewAmount / totalClaimed) * 100) : 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["submissions", currentProjectId] });
    queryClient.invalidateQueries({ queryKey: ["onboarding-tasks", currentProjectId] });
    queryClient.invalidateQueries({ queryKey: ["change-orders", currentProjectId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", currentProjectId] });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title={currentRole === "GC" ? "Contractor Claims & Evidence Intake" : "General Contractor Submissions"}
        statusBadge={{
          label: currentProject?.name || "Active Project",
          variant: "success",
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
        }}
        description="Review milestone claims, itemized receipts, and change order packages for sponsor certification and draw inclusion."
        primaryAction={
          currentRole === "GC" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCorModalOpen(true)}
              >
                <FileText className="h-4 w-4 mr-1.5" />
                Change Order
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCostModalOpen(true)}
              >
                <Receipt className="h-4 w-4 mr-1.5" />
                Cost Evidence
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsClaimModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Progress Claim
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="px-6 max-w-7xl mx-auto space-y-6">
        {/* Context Banner */}
        <GcRoleBoundaryBanner
          currentRole={currentRole}
          project={currentProject}
        />

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Claims Submitted */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total Claims Submitted
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  {submissions.length} Packages
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                  {formatMoney(String(totalClaimed))}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Across all active CSI trade divisions
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full" style={{ width: "100%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Intake Logged</span>
                <span>100% Recorded</span>
              </div>
            </div>
          </div>

          {/* Card 2: Under Sponsor Review */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Under Sponsor Review
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
                  <Clock className="h-3 w-3" />
                  {underReviewSubmissions.length} Pending
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                  {formatMoney(String(underReviewAmount))}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Awaiting PM, CFO, or Owner signoff
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, underReviewPct)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Review Pipeline</span>
                <span>{underReviewPct}% of Gross</span>
              </div>
            </div>
          </div>

          {/* Card 3: Approved & Certified */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Approved & Certified
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                  <CheckCircle2 className="h-3 w-3" />
                  {approvedSubmissions.length} Certified
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                  {formatMoney(String(approvedAmount))}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Cleared for monthly lender draw package
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, approvedPct)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Certified Rate</span>
                <span>{approvedPct}% Cleared</span>
              </div>
            </div>
          </div>

          {/* Card 4: Retainage Withheld */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Retainage Escrow (10%)
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200/60">
                  <Lock className="h-3 w-3" />
                  10% Withheld
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono tracking-tight text-amber-600">
                  {formatMoney(String(totalRetainage))}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Cumulative reserve for final project closeout
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "100%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Contract Escrow</span>
                <span>Held to Closeout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Submissions Table */}
        <SubmissionsTable
          submissions={submissions}
          currentRole={currentRole}
          onRefresh={handleRefresh}
          isLoading={isSubmissionsLoading}
        />
      </div>

      {/* Progress Claim Modal */}
      <CreateClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        projectId={currentProjectId}
        project={currentProject}
        milestones={milestones}
        onSuccess={handleRefresh}
      />

      {/* Cost Evidence Modal */}
      <CreateCostEvidenceModal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        projectId={currentProjectId}
        project={currentProject}
        onSuccess={handleRefresh}
      />

      {/* Change Order Request Modal */}
      <CreateCorModal
        isOpen={isCorModalOpen}
        onClose={() => setIsCorModalOpen(false)}
        projectId={currentProjectId}
        project={currentProject}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
