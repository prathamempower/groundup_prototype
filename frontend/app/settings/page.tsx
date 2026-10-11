"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { AlertsManagerPanel } from "@/components/settings/alerts-manager-panel";
import { TeamAccessPanel } from "@/components/settings/team-access-panel";
import { AuditLogPanel } from "@/components/settings/audit-log-panel";
import { ExportManagerPanel } from "@/components/settings/export-manager-panel";
import {
  Settings,
  ShieldCheck,
  AlertTriangle,
  Users,
  History,
  Download,
  Building,
  Sliders,
  CheckCircle2,
  DollarSign,
  Percent,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "ALERTS" | "TEAM" | "AUDIT" | "EXPORTS" | "PREFERENCES"
  >("ALERTS");

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const currentProjectId = projectsData?.data?.current_project_id || "";
  const projects = projectsData?.data?.projects || [];
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const { data: alertsData } = useQuery({
    queryKey: ["alerts", currentProjectId],
    queryFn: () => api.alerts.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const openAlertsCount = (alertsData?.data || []).filter((a) => a.status === "OPEN").length;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Settings, Governance & Administration"
        statusBadge={{
          label: "Organization Admin",
          variant: "neutral",
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
        }}
        description="Operational alerts, team permissions matrix, immutable audit log, and structured exports"
      />

      <div className="px-6 max-w-7xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-1">
          <button
            onClick={() => setActiveTab("ALERTS")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "ALERTS"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Alerts & Exceptions</span>
            {openAlertsCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-caption font-bold ${
                  activeTab === "ALERTS"
                    ? "bg-white text-primary"
                    : "bg-danger text-white"
                }`}
              >
                {openAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("TEAM")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "TEAM"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Team & Security</span>
          </button>

          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "AUDIT"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab("EXPORTS")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "EXPORTS"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Report Exports</span>
          </button>

          <button
            onClick={() => setActiveTab("PREFERENCES")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "PREFERENCES"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Project Preferences</span>
          </button>
        </div>

        {/* Tab 1: Alerts & Exceptions */}
        {activeTab === "ALERTS" && (
          <AlertsManagerPanel projectId={currentProjectId} />
        )}

        {/* Tab 2: Team & Security Governance */}
        {activeTab === "TEAM" && (
          <TeamAccessPanel projectId={currentProjectId} />
        )}

        {/* Tab 3: Immutable Audit Log */}
        {activeTab === "AUDIT" && (
          <AuditLogPanel />
        )}

        {/* Tab 4: Report Exports */}
        {activeTab === "EXPORTS" && (
          <ExportManagerPanel projectId={currentProjectId} />
        )}

        {/* Tab 5: Project Preferences & General Settings */}
        {activeTab === "PREFERENCES" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-5">
              <div className="border-b border-border pb-4">
                <h3 className="text-section font-bold text-text-primary flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <span>Project Identity & Governance Parameters</span>
                </h3>
                <p className="text-caption text-text-secondary mt-0.5">
                  Core configuration standards established during project onboarding.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-caption font-semibold text-text-muted">
                    Project Entity Name
                  </label>
                  <div className="rounded-md border border-border bg-subtle/30 px-3 py-2 text-body font-medium text-text-primary">
                    {currentProject?.project_entity || "Not provided"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-caption font-semibold text-text-muted">
                    Contract Model Standard
                  </label>
                  <div className="rounded-md border border-border bg-subtle/30 px-3 py-2 text-body font-medium text-text-primary flex items-center justify-between">
                    <span>{currentProject?.contract_model || "COST_PLUS"}</span>
                    <span className="text-caption text-primary font-semibold">Verified Baseline</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-caption font-semibold text-text-muted">
                    Currency & Accounting Denomination
                  </label>
                  <div className="rounded-md border border-border bg-subtle/30 px-3 py-2 text-body font-medium text-text-primary">
                    USD ($) &bull; Minor Units in Cents
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-caption font-semibold text-text-muted">
                    Default Trade Retainage Withholding
                  </label>
                  <div className="rounded-md border border-border bg-subtle/30 px-3 py-2 text-body font-medium text-text-primary">
                    10.0% Standard Retainage Rate
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4">
              <h4 className="text-section font-bold text-text-primary">
                Lender Governance & Financing Rules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-md border border-border bg-subtle/20 p-4">
                  <span className="text-caption text-text-muted font-medium">Lender Institution</span>
                  <div className="text-body font-bold text-text-primary mt-1">Columbia Bank Commercial</div>
                  <span className="text-caption text-text-muted">Account: •••• 4182</span>
                </div>
                <div className="rounded-md border border-border bg-subtle/20 p-4">
                  <span className="text-caption text-text-muted font-medium">Senior Facility Cap</span>
                  <div className="text-body font-bold text-text-primary mt-1">$4,200,000.00</div>
                  <span className="text-caption text-text-muted">Commitment locked</span>
                </div>
                <div className="rounded-md border border-border bg-subtle/20 p-4">
                  <span className="text-caption text-text-muted font-medium">Monthly Carry Rate</span>
                  <div className="text-body font-bold text-text-primary mt-1">$18,500.00 / mo</div>
                  <span className="text-caption text-text-muted">6.25% SOFR + Margin</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
