"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { PublicationManagerPanel } from "@/components/investor/publication-manager-panel";
import { InvestorUpdatePreview } from "@/components/investor/investor-update-preview";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Printer,
  FileSpreadsheet,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function InvestorUpdatePage() {
  const [viewMode, setViewMode] = useState<"MANAGER" | "INVESTOR_VIEW">("MANAGER");
  const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState(0);

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const currentProjectId = projectsData?.data?.current_project_id || "";
  const projects = projectsData?.data?.projects || [];
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const { data: updatesData, isLoading: isLoadingUpdates } = useQuery({
    queryKey: ["investor-updates", currentProjectId],
    queryFn: () => api.investor.listUpdates(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const currentUser = meData?.data;
  const isInvestorRole = currentUser?.role === "INVESTOR";
  const snapshots = updatesData?.data || [];

  // For investors, filter to published and withdrawn snapshots
  const investorVisibleSnapshots = snapshots.filter((s) => s.status !== "DRAFT");
  const activeInvestorSnapshot = investorVisibleSnapshots[selectedSnapshotIndex] || investorVisibleSnapshots[0] || snapshots[0];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={isInvestorRole ? "Investor Development Brief" : "Investor Updates & Reporting"}
        statusBadge={{
          label: isInvestorRole ? "Verified LP Portal" : "Controlled Reporting",
          variant: "success",
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
        }}
        description={
          isInvestorRole
            ? "Official sponsor development snapshot, project economics, and milestone disclosures"
            : "Compile, customize, and publish immutable financial snapshots for equity partners"
        }
        primaryAction={
          <div className="flex items-center gap-2">
            {!isInvestorRole && (
              <div className="flex rounded-md border border-border bg-subtle p-0.5 text-caption print:hidden">
                <Button
                  type="button"
                  variant={viewMode === "MANAGER" ? "secondary" : "ghost"}
                  size="sm"
                  className="px-3 py-1"
                  onClick={() => setViewMode("MANAGER")}
                >
                  Publication Manager
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "INVESTOR_VIEW" ? "secondary" : "ghost"}
                  size="sm"
                  className="px-3 py-1"
                  onClick={() => setViewMode("INVESTOR_VIEW")}
                >
                  Investor Portal View
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 print:hidden"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 text-text-muted" />
              <span>Print Snapshot</span>
            </Button>
          </div>
        }
      />

      <div className="px-6 max-w-7xl mx-auto space-y-6">
        {/* INVESTOR VIEW (OR INVESTOR ROLE) */}
        {(isInvestorRole || viewMode === "INVESTOR_VIEW") && (
          <div className="space-y-6">
            {/* Snapshot Selector if multiple snapshots available */}
            {investorVisibleSnapshots.length > 1 && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3.5 shadow-xs print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">
                    Report Period:
                  </span>
                  <select
                    value={selectedSnapshotIndex}
                    onChange={(e) => setSelectedSnapshotIndex(Number(e.target.value))}
                    className="rounded-md border border-border bg-surface px-3 py-1 text-body font-semibold text-text-primary focus:border-primary focus:outline-hidden"
                  >
                    {investorVisibleSnapshots.map((s, idx) => (
                      <option key={s.id} value={idx}>
                        {s.title} (As of {s.as_of_date}) {s.status === "WITHDRAWN" ? "— [WITHDRAWN]" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-caption text-text-muted">
                  Showing <strong className="text-text-primary">{selectedSnapshotIndex + 1}</strong> of {investorVisibleSnapshots.length} updates
                </div>
              </div>
            )}

            {activeInvestorSnapshot ? (
              <div className="max-w-4xl mx-auto">
                <InvestorUpdatePreview
                  snapshot={activeInvestorSnapshot}
                  projectName={currentProject?.name}
                  projectAddress={currentProject?.address}
                  showPrintAction={false}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-surface p-12 text-center text-body text-text-muted">
                No published investor updates available for this project yet.
              </div>
            )}
          </div>
        )}

        {/* OWNER/CFO PUBLICATION MANAGER VIEW */}
        {!isInvestorRole && viewMode === "MANAGER" && (
          <PublicationManagerPanel
            projectId={currentProjectId}
            projectName={currentProject?.name}
            projectAddress={currentProject?.address}
            snapshots={snapshots}
            isLoading={isLoadingUpdates}
          />
        )}
      </div>
    </div>
  );
}
