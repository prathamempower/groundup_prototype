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

  const routeProjectId = typeof window !== "undefined"
    ? (window.location.pathname.match(/^\/projects\/([^\/]+)/)?.[1] || "")
    : "";
  const currentProjectId = (routeProjectId && routeProjectId !== "new")
    ? routeProjectId
    : projectsData?.data?.current_project_id || "";
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
      <div className="px-6 max-w-7xl mx-auto space-y-6 pt-4">
        <PageHeader
          title="Settings, Governance & Administration"
          statusBadge={{
            label: "Organization Admin",
            variant: "neutral",
            icon: <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />,
          }}
          description="Operational alerts, team permissions matrix, immutable audit log, and structured exports"
        />

        {/* Modern Segmented Navigation Tabs */}
        <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 shadow-2xs">
          <button
            onClick={() => setActiveTab("ALERTS")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "ALERTS"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Alerts & Exceptions</span>
            {openAlertsCount > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                  activeTab === "ALERTS"
                    ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                    : "bg-rose-600 text-white"
                }`}
              >
                {openAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("TEAM")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "TEAM"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Team & Security</span>
          </button>

          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "AUDIT"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab("EXPORTS")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "EXPORTS"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Report Exports</span>
          </button>

          <button
            onClick={() => setActiveTab("PREFERENCES")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "PREFERENCES"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
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
            <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span>Project Identity & Governance Parameters</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core configuration standards established during project onboarding and underwriting baseline.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Project Entity Name
                  </label>
                  <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-900 font-mono">
                    {currentProject?.project_entity || "161 Woodlawn Development LLC"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Contract Model Standard
                  </label>
                  <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-900 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 font-mono">{currentProject?.contract_model || "COST_PLUS"}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full px-2 py-0.5 font-semibold">
                      Verified Baseline
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Currency & Accounting Denomination
                  </label>
                  <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 font-mono">
                    USD ($) · Minor Units in Cents
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Default Trade Retainage Withholding
                  </label>
                  <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 font-mono">
                    10.0% Standard Retainage Rate
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Lender Governance & Financing Rules
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authorized senior debt facility terms and carry rate parameters.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Lender Institution</span>
                  <div className="text-sm font-bold text-slate-900 mt-1">Columbia Bank Commercial</div>
                  <span className="text-xs text-slate-500 font-mono mt-0.5 block">Account: •••• 4182</span>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Senior Facility Cap</span>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">$4,200,000.00</div>
                  <span className="text-xs text-emerald-700 font-semibold mt-0.5 block">Commitment locked</span>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Monthly Carry Rate</span>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">$18,500.00 / mo</div>
                  <span className="text-xs text-slate-500 font-mono mt-0.5 block">6.25% SOFR + Margin</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
