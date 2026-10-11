"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AlertItem, DataQualityIssue } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { ResolveAlertModal } from "./resolve-alert-modal";
import { WaiveAlertModal } from "./waive-alert-modal";
import { EscalateAlertModal } from "./escalate-alert-modal";
import { ResolveDqiModal } from "./resolve-dqi-modal";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  ShieldCheck,
  FileCheck,
  Calendar,
  Layers,
  Wrench,
} from "lucide-react";

interface AlertsManagerPanelProps {
  projectId: string;
}

export function AlertsManagerPanel({ projectId }: AlertsManagerPanelProps) {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "RESOLVED" | "DATA_QUALITY">("ACTIVE");

  // Selected modals state
  const [resolvingAlert, setResolvingAlert] = useState<AlertItem | null>(null);
  const [waivingAlert, setWaivingAlert] = useState<AlertItem | null>(null);
  const [escalatingAlert, setEscalatingAlert] = useState<AlertItem | null>(null);
  const [resolvingDqi, setResolvingDqi] = useState<DataQualityIssue | null>(null);

  const { data: alertsData, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["alerts", projectId],
    queryFn: () => api.alerts.list(projectId),
  });

  const { data: dqiData, isLoading: isLoadingDqi } = useQuery({
    queryKey: ["data-quality-issues", projectId],
    queryFn: () => api.alerts.getDataQualityIssues(projectId),
  });

  const alerts = alertsData?.data || [];
  const dqiList = dqiData?.data || [];

  const openAlerts = alerts.filter((a) => a.status === "OPEN");
  const closedAlerts = alerts.filter((a) => a.status === "RESOLVED" || a.status === "WAIVED");
  const openDqi = dqiList.filter((d) => d.status === "OPEN");

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-text-muted">Active Exceptions</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-danger-subtle text-danger">
              <AlertOctagon className="h-4 w-4" />
            </span>
          </div>
          <div className="text-title font-bold text-danger tabular-nums mt-2">
            {openAlerts.length} Active
          </div>
          <span className="text-caption text-text-muted mt-1 block">Requires immediate human decision</span>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-text-muted">Data Quality Issues</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-warning-subtle text-warning">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="text-title font-bold text-text-primary tabular-nums mt-2">
            {openDqi.length} Unresolved
          </div>
          <span className="text-caption text-text-muted mt-1 block">Missing evidence or misfiled docs</span>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-text-muted">Resolved & Waived</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-success-subtle text-success">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="text-title font-bold text-success tabular-nums mt-2">
            {closedAlerts.length} Archive
          </div>
          <span className="text-caption text-text-muted mt-1 block">Fully audited resolutions</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex rounded-md border border-border bg-subtle p-0.5 text-caption">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`rounded px-3 py-1 font-medium transition-colors ${
              activeTab === "ACTIVE"
                ? "bg-surface text-text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Active Operational Alerts ({openAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab("DATA_QUALITY")}
            className={`rounded px-3 py-1 font-medium transition-colors ${
              activeTab === "DATA_QUALITY"
                ? "bg-surface text-text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Data Quality Issues ({openDqi.length})
          </button>
          <button
            onClick={() => setActiveTab("RESOLVED")}
            className={`rounded px-3 py-1 font-medium transition-colors ${
              activeTab === "RESOLVED"
                ? "bg-surface text-text-primary shadow-xs font-semibold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Resolution Archive ({closedAlerts.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE OPERATIONAL ALERTS */}
      {activeTab === "ACTIVE" && (
        <div className="space-y-4">
          {openAlerts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface p-12 text-center text-body text-text-muted">
              <CheckCircle2 className="mx-auto h-8 w-8 text-success mb-2" />
              All operational alerts have been resolved or waived!
            </div>
          ) : (
            openAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-5 shadow-xs transition-all ${
                  alert.severity === "DANGER"
                    ? "border-danger-border bg-danger-subtle/20"
                    : alert.severity === "WARNING"
                    ? "border-warning-border bg-warning-subtle/20"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption font-bold ${
                          alert.severity === "DANGER"
                            ? "bg-danger text-white"
                            : alert.severity === "WARNING"
                            ? "bg-warning text-white"
                            : "bg-primary text-white"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <h4 className="text-body font-bold text-text-primary">{alert.title}</h4>
                    </div>

                    <p className="text-body text-text-secondary leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-caption text-text-muted pt-1">
                      <span>Owner: <strong className="text-text-primary">{alert.owner}</strong></span>
                      <span>Created: {formatDate(alert.created_at)}</span>
                      {alert.escalated_to && (
                        <span className="text-danger font-semibold flex items-center gap-1">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          Escalated to: {alert.escalated_to}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => setResolvingAlert(alert)}
                      className="flex items-center gap-1 rounded-md bg-success px-3 py-1.5 text-caption font-medium text-white hover:bg-success/90 shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolve
                    </button>
                    <button
                      onClick={() => setWaivingAlert(alert)}
                      className="flex items-center gap-1 rounded-md border border-border bg-subtle px-3 py-1.5 text-caption font-medium text-text-primary hover:bg-subtle/80"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-warning" />
                      Waive
                    </button>
                    <button
                      onClick={() => setEscalatingAlert(alert)}
                      className="flex items-center gap-1 rounded-md border border-danger-border bg-danger-subtle px-3 py-1.5 text-caption font-medium text-danger hover:bg-danger/20"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Escalate
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: DATA QUALITY ISSUES */}
      {activeTab === "DATA_QUALITY" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4 text-caption text-text-secondary flex items-start gap-2.5">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              Data quality issues block dashboard verification and readiness gates until human review is confirmed.
            </span>
          </div>

          <div className="space-y-3">
            {dqiList.map((issue) => (
              <div
                key={issue.id}
                className="rounded-lg border border-border bg-surface p-4 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-caption font-semibold ${
                        issue.severity === "HIGH"
                          ? "bg-danger-subtle text-danger border border-danger-border"
                          : issue.severity === "MEDIUM"
                          ? "bg-warning-subtle text-warning border border-warning-border"
                          : "bg-subtle text-text-muted border border-border"
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="font-semibold text-text-primary">
                      {issue.issue_type.replace(/_/g, " ")}
                    </span>
                    {issue.status === "RESOLVED" && (
                      <span className="rounded-full bg-success-subtle px-2 py-0.5 text-caption font-semibold text-success border border-success-border">
                        Resolved
                      </span>
                    )}
                    {issue.status === "WAIVED" && (
                      <span className="rounded-full bg-warning-subtle px-2 py-0.5 text-caption font-semibold text-warning border border-warning-border">
                        Waived
                      </span>
                    )}
                  </div>

                  <p className="text-body text-text-secondary mt-1">{issue.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-caption text-text-muted pt-1">
                    <span>Entity: <strong className="text-text-primary">{issue.affected_entity_type} ({issue.affected_entity_id})</strong></span>
                    <span>Owner: {issue.owner}</span>
                    <span>Detected: {formatDate(issue.detected_at)}</span>
                  </div>

                  {issue.resolution_note && (
                    <div className="rounded-md border border-border bg-subtle/40 p-2.5 text-caption text-text-primary mt-2">
                      <strong className="text-success">Resolution:</strong> {issue.resolution_note}
                    </div>
                  )}
                </div>

                {issue.status === "OPEN" && (
                  <button
                    onClick={() => setResolvingDqi(issue)}
                    className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-caption font-medium text-white hover:bg-primary-hover shadow-xs shrink-0"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    Remediate Issue
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESOLUTION & WAIVER ARCHIVE */}
      {activeTab === "RESOLVED" && (
        <div className="space-y-3">
          {closedAlerts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface p-12 text-center text-body text-text-muted">
              No resolved or waived alert history found.
            </div>
          ) : (
            closedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-border bg-surface p-4 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption font-semibold ${
                        alert.status === "RESOLVED"
                          ? "bg-success-subtle text-success border border-success-border"
                          : "bg-warning-subtle text-warning border border-warning-border"
                      }`}
                    >
                      {alert.status}
                    </span>
                    <h4 className="text-body font-bold text-text-primary">{alert.title}</h4>
                  </div>
                  <span className="text-caption text-text-muted tabular-nums">
                    {formatDate(alert.resolved_at || alert.created_at)}
                  </span>
                </div>

                <p className="text-caption text-text-secondary">{alert.description}</p>

                {alert.resolution_note && (
                  <div className="rounded-md border border-success-border/40 bg-success-subtle/20 p-2.5 text-caption text-text-primary">
                    <strong className="text-success">Resolution Rationale:</strong> {alert.resolution_note}
                    {alert.resolved_by && <span className="text-text-muted ml-1">({alert.resolved_by})</span>}
                  </div>
                )}

                {alert.waived_reason && (
                  <div className="rounded-md border border-warning-border/40 bg-warning-subtle/20 p-2.5 text-caption text-text-primary">
                    <strong className="text-warning">Waiver Rationale:</strong> {alert.waived_reason}
                    {alert.waived_until && (
                      <span className="text-text-muted ml-2">Expires: {formatDate(alert.waived_until)}</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {resolvingAlert && (
        <ResolveAlertModal
          alert={resolvingAlert}
          isOpen={Boolean(resolvingAlert)}
          onClose={() => setResolvingAlert(null)}
        />
      )}

      {waivingAlert && (
        <WaiveAlertModal
          alert={waivingAlert}
          isOpen={Boolean(waivingAlert)}
          onClose={() => setWaivingAlert(null)}
        />
      )}

      {escalatingAlert && (
        <EscalateAlertModal
          alert={escalatingAlert}
          isOpen={Boolean(escalatingAlert)}
          onClose={() => setEscalatingAlert(null)}
        />
      )}

      {resolvingDqi && (
        <ResolveDqiModal
          issue={resolvingDqi}
          isOpen={Boolean(resolvingDqi)}
          onClose={() => setResolvingDqi(null)}
        />
      )}
    </div>
  );
}
