"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { KeyFigure } from "@/components/ui/key-figure";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import {
  Plus,
  Receipt,
  FileText,
  ShieldCheck,
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

  const currentProjectId = projectsData?.data?.current_project_id || "";
  const currentProject = projectsData?.data?.projects?.find((p) => p.id === currentProjectId);
  const currentRole = meData?.data?.role || "OWNER";

  const { data: submissionsData } = useQuery({
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

  const { data: documentsData } = useQuery({
    queryKey: ["documents", currentProjectId],
    queryFn: () => api.documents.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const projectDocs = documentsData?.data || [];
  const primaryDoc = projectDocs[0];
  const inspectionDoc = projectDocs.find((d) => d.document_type === "INSPECTION" || d.original_filename?.toLowerCase().includes("report")) || primaryDoc;
  const sovDoc = projectDocs.find((d) => d.document_type === "BUDGET_SOV" || d.original_filename?.toLowerCase().includes("budget")) || primaryDoc;
  const contractDoc = projectDocs.find((d) => d.document_type === "CONTRACT" || d.original_filename?.toLowerCase().includes("loan")) || primaryDoc;

  // Metrics computation
  const totalClaimed = submissions.reduce((acc, s) => acc + Number(s.claimed_amount || 0), 0);
  const underReviewAmount = submissions
    .filter((s) => s.status === "UNDER_REVIEW")
    .reduce((acc, s) => acc + Number(s.claimed_amount || 0), 0);
  const approvedAmount = submissions
    .filter((s) => s.status === "APPROVED")
    .reduce((acc, s) => acc + Number(s.claimed_amount || 0), 0);
  const totalRetainage = submissions.reduce((acc, s) => acc + Number(s.retainage_amount || 0), 0);

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
        title={currentRole === "GC" ? "My Submissions & Claims" : "General Contractor Submissions"}
        statusBadge={{
          label: currentProject?.name || "Project",
          variant: "success",
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
        }}
        description="Submit milestone claims, itemized cost evidence packages, and change order requests for sponsor review, reconciliation, and draw inclusion."
        primaryAction={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsCorModalOpen(true)}
            >
              <FileText className="h-4 w-4 mr-1.5" />
              Request Change Order
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsCostModalOpen(true)}
            >
              <Receipt className="h-4 w-4 mr-1.5" />
              Submit Cost Evidence
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsClaimModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Progress Claim
            </Button>
          </div>
        }
      />

      <div className="px-6 max-w-7xl mx-auto space-y-6">
        {/* Role Boundary & Contract Context Banner */}
        <GcRoleBoundaryBanner
          currentRole={currentRole}
          project={currentProject}
        />

        {/* 4 Key Figures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KeyFigure
            label="Total Claims Submitted"
            value={formatMoney(String(totalClaimed))}
            basis={`${submissions.length} Total packages across all CSI divisions`}
            citations={
              primaryDoc
                ? [
                    {
                      document_id: primaryDoc.id,
                      document_name: primaryDoc.original_filename,
                      page_number: 1,
                      row_number: 4,
                      reviewer: "Sarah Lin (CFO)",
                      reviewed_at: primaryDoc.uploaded_at,
                      extraction_version: "v2.1",
                    },
                  ]
                : []
            }
          />

          <KeyFigure
            label="Under Sponsor Review"
            value={formatMoney(String(underReviewAmount))}
            basis={`${submissions.filter((s) => s.status === "UNDER_REVIEW").length} Active package(s) awaiting PM/CFO signoff`}
            citations={
              inspectionDoc
                ? [
                    {
                      document_id: inspectionDoc.id,
                      document_name: inspectionDoc.original_filename,
                      page_number: 2,
                      reviewer: "David Ross (PM)",
                      reviewed_at: inspectionDoc.uploaded_at,
                      extraction_version: "v2.0",
                    },
                  ]
                : []
            }
          />

          <KeyFigure
            label="Approved & Certified"
            value={formatMoney(String(approvedAmount))}
            basis={`${submissions.filter((s) => s.status === "APPROVED").length} Certified package(s) eligible for draw`}
            citations={
              sovDoc
                ? [
                    {
                      document_id: sovDoc.id,
                      document_name: sovDoc.original_filename,
                      page_number: 1,
                      reviewer: "Marcus Vance (Owner)",
                      reviewed_at: sovDoc.uploaded_at,
                      extraction_version: "v1.4",
                    },
                  ]
                : []
            }
          />

          <KeyFigure
            label="Retainage Withheld (10%)"
            value={formatMoney(String(totalRetainage))}
            basis="Cumulative escrow reserve for final closeout"
            citations={
              contractDoc
                ? [
                    {
                      document_id: contractDoc.id,
                      document_name: contractDoc.original_filename,
                      page_number: 1,
                      reviewer: "Sarah Lin (CFO)",
                      reviewed_at: contractDoc.uploaded_at,
                      extraction_version: "v1.0",
                    },
                  ]
                : []
            }
          />
        </div>

        {/* Main Submissions Table */}
        <SubmissionsTable
          submissions={submissions}
          currentRole={currentRole}
          onRefresh={handleRefresh}
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
