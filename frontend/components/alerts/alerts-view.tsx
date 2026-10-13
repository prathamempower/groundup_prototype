"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AlertItem, DataQualityIssue, UserRole } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { ResolveAlertModal } from "@/components/settings/resolve-alert-modal";
import { WaiveAlertModal } from "@/components/settings/waive-alert-modal";
import { EscalateAlertModal } from "@/components/settings/escalate-alert-modal";
import { ResolveDqiModal } from "@/components/settings/resolve-dqi-modal";
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
  Search,
  Filter,
  Check,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  XCircle,
  FileText,
  DollarSign,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertsViewProps {
  projectId: string;
  projectName?: string;
  userRole: UserRole;
}

export function AlertsView({ projectId, projectName, userRole }: AlertsViewProps) {
  const queryClient = useQueryClient();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "DATA_QUALITY" | "ARCHIVE">("ACTIVE");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "WARNING" | "MEDIUM" | "LOW" | "INFO">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Selected modals state
  const [resolvingAlert, setResolvingAlert] = useState<AlertItem | null>(null);
  const [waivingAlert, setWaivingAlert] = useState<AlertItem | null>(null);
  const [escalatingAlert, setEscalatingAlert] = useState<AlertItem | null>(null);
  const [resolvingDqi, setResolvingDqi] = useState<DataQualityIssue | null>(null);

  // Queries
  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    refetch: refetchAlerts,
    isRefetching: isRefetchingAlerts,
  } = useQuery({
    queryKey: ["alerts", projectId],
    queryFn: () => api.alerts.list(projectId),
    enabled: Boolean(projectId),
  });

  const {
    data: dqiData,
    isLoading: isLoadingDqi,
    refetch: refetchDqi,
    isRefetching: isRefetchingDqi,
  } = useQuery({
    queryKey: ["data-quality-issues", projectId],
    queryFn: () => api.alerts.getDataQualityIssues(projectId),
    enabled: Boolean(projectId) && ["OWNER", "CFO", "PM"].includes(userRole),
  });

  // Filtered Alert buckets
  const openAlerts = useMemo(() => {
    const list = alertsData?.data || [];
    return list.filter((a) => a.status === "OPEN" || a.status === ("ESCALATED" as unknown));
  }, [alertsData?.data]);

  const closedAlerts = useMemo(() => {
    const list = alertsData?.data || [];
    return list.filter((a) => a.status === "RESOLVED" || a.status === "WAIVED");
  }, [alertsData?.data]);

  const openDqi = useMemo(() => {
    const list = dqiData?.data || [];
    return list.filter((d) => d.status === "OPEN");
  }, [dqiData?.data]);

  // Role permissions
  const canWaive = ["OWNER", "CFO"].includes(userRole);
  const canEscalate = ["OWNER", "CFO", "PM"].includes(userRole);
  const canResolve = ["OWNER", "CFO", "PM", "GC"].includes(userRole);
  const canAccessDqi = ["OWNER", "CFO", "PM"].includes(userRole);

  // Unique alert types for filter dropdown
  const uniqueAlertTypes = useMemo(() => {
    const list = alertsData?.data || [];
    const types = new Set<string>();
    list.forEach((a) => {
      // alert_type or title breakdown
      const typeKey = (a as unknown as { alert_type?: string }).alert_type;
      if (typeKey) types.add(typeKey);
    });
    return Array.from(types);
  }, [alertsData?.data]);

  // Filtered lists based on search & severity
  const filteredActiveAlerts = useMemo(() => {
    return openAlerts.filter((a) => {
      const matchesSearch =
        searchQuery === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.owner.toLowerCase().includes(searchQuery.toLowerCase());

      const normalizedSeverity = a.severity.toUpperCase();
      const matchesSeverity =
        severityFilter === "ALL" ||
        normalizedSeverity === severityFilter ||
        (severityFilter === "HIGH" && normalizedSeverity === "DANGER") ||
        (severityFilter === "CRITICAL" && normalizedSeverity === "DANGER");

      const alertType = (a as unknown as { alert_type?: string }).alert_type;
      const matchesType = typeFilter === "ALL" || alertType === typeFilter;

      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [openAlerts, searchQuery, severityFilter, typeFilter]);

  const filteredDqiList = useMemo(() => {
    return openDqi.filter((d) => {
      const matchesSearch =
        searchQuery === "" ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.issue_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.affected_entity_type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        severityFilter === "ALL" || d.severity.toUpperCase() === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [openDqi, searchQuery, severityFilter]);

  const filteredArchiveAlerts = useMemo(() => {
    return closedAlerts.filter((a) => {
      const matchesSearch =
        searchQuery === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.resolution_note && a.resolution_note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.waived_reason && a.waived_reason.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSeverity =
        severityFilter === "ALL" || a.severity.toUpperCase() === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [closedAlerts, searchQuery, severityFilter]);

  // Refresh handler
  const handleRefresh = () => {
    refetchAlerts();
    if (canAccessDqi) refetchDqi();
  };

  const isRefreshing = isRefetchingAlerts || isRefetchingDqi;

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Critical & Active Exceptions */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs hover:border-danger/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold tracking-wide uppercase text-text-muted">
              Active Exceptions
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-subtle text-danger shadow-xs">
              <AlertOctagon className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-danger tabular-nums">
              {openAlerts.length}
            </span>
            <span className="text-caption text-text-muted font-medium">unresolved</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-caption text-text-secondary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
            <span>Blocks draw approvals and certification</span>
          </div>
        </div>

        {/* Metric 2: High Severity */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs hover:border-warning/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold tracking-wide uppercase text-text-muted">
              High / Warning
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-subtle text-warning shadow-xs">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-warning tabular-nums">
              {openAlerts.filter((a) => a.severity === "WARNING" || (a.severity as string) === "HIGH").length}
            </span>
            <span className="text-caption text-text-muted font-medium">elevated risk</span>
          </div>
          <div className="mt-2 text-caption text-text-secondary">
            Requires engineering or cost review
          </div>
        </div>

        {/* Metric 3: Data Quality Issues */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold tracking-wide uppercase text-text-muted">
              Data Quality Issues
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary shadow-xs">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-text-primary tabular-nums">
              {canAccessDqi ? openDqi.length : "—"}
            </span>
            <span className="text-caption text-text-muted font-medium">integrity flags</span>
          </div>
          <div className="mt-2 text-caption text-text-secondary">
            Missing receipts or unmapped spend records
          </div>
        </div>

        {/* Metric 4: Resolution Archive */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs hover:border-success/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold tracking-wide uppercase text-text-muted">
              Audited History
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-subtle text-success shadow-xs">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-success tabular-nums">
              {closedAlerts.length}
            </span>
            <span className="text-caption text-text-muted font-medium">resolved or waived</span>
          </div>
          <div className="mt-2 text-caption text-text-secondary">
            Full compliance audit trail recorded
          </div>
        </div>
      </div>

      {/* Main Filter & Tab Bar */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-4">
        {/* Row 1: Tabs + Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-subtle/50 p-1 text-caption">
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 font-medium transition-all ${
                activeTab === "ACTIVE"
                  ? "bg-surface text-text-primary font-semibold shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <AlertOctagon className="h-3.5 w-3.5 text-danger" />
              <span>Active Exceptions</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "ACTIVE" ? "bg-danger text-white" : "bg-danger-subtle text-danger"
              }`}>
                {openAlerts.length}
              </span>
            </button>

            {canAccessDqi && (
              <button
                onClick={() => setActiveTab("DATA_QUALITY")}
                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 font-medium transition-all ${
                  activeTab === "DATA_QUALITY"
                    ? "bg-surface text-text-primary font-semibold shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-warning" />
                <span>Data Quality Issues</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === "DATA_QUALITY" ? "bg-warning text-white" : "bg-warning-subtle text-warning"
                }`}>
                  {openDqi.length}
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("ARCHIVE")}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 font-medium transition-all ${
                activeTab === "ARCHIVE"
                  ? "bg-surface text-text-primary font-semibold shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span>Audit Archive</span>
              <span className="rounded-full bg-subtle px-1.5 py-0.2 text-[10px] font-bold text-text-muted border border-border">
                {closedAlerts.length}
              </span>
            </button>
          </div>

          {/* Refresh action */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-caption font-medium text-text-secondary hover:bg-subtle hover:text-text-primary transition-colors disabled:opacity-50 self-end sm:self-auto"
            title="Refresh alerts from server"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>{isRefreshing ? "Checking rules..." : "Re-evaluate Rules"}</span>
          </button>
        </div>

        {/* Row 2: Search & Severity Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exceptions by title, category, owner, or vendor..."
              className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-1.5 text-caption text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-caption text-text-muted font-medium">
              <Filter className="h-3.5 w-3.5" />
              <span>Severity:</span>
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
              aria-label="Filter alerts by severity"
              className="rounded-lg border border-border bg-surface px-2.5 py-1 text-caption text-text-primary focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary shadow-2xs font-medium"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="WARNING">Warning</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>

            {uniqueAlertTypes.length > 0 && activeTab === "ACTIVE" && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter alerts by exception category"
                className="rounded-lg border border-border bg-surface px-2.5 py-1 text-caption text-text-primary focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary shadow-2xs font-medium"
              >
                <option value="ALL">All Exception Categories</option>
                {uniqueAlertTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            )}

            {(searchQuery || severityFilter !== "ALL" || typeFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSeverityFilter("ALL");
                  setTypeFilter("ALL");
                }}
                className="text-caption text-primary hover:underline font-medium px-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT PANELS */}

      {/* 1. ACTIVE ALERTS TAB */}
      {activeTab === "ACTIVE" && (
        <div className="space-y-3">
          {isLoadingAlerts ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-2.5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredActiveAlerts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center shadow-xs">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success mb-3" />
              <h3 className="text-body font-bold text-text-primary">
                {openAlerts.length === 0
                  ? "Zero Open Exceptions"
                  : "No alerts match your filter criteria"}
              </h3>
              <p className="text-caption text-text-muted mt-1 max-w-md mx-auto">
                {openAlerts.length === 0
                  ? "All project exceptions have been successfully resolved or waived under compliance policy. Budget lines and draws are verified."
                  : "Try clearing your search query or selecting a different severity level."}
              </p>
            </div>
          ) : (
            filteredActiveAlerts.map((alert) => {
              const isDanger =
                alert.severity === "DANGER" || (alert.severity as string) === "CRITICAL";
              const isWarning =
                alert.severity === "WARNING" || (alert.severity as string) === "HIGH";

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-5 shadow-xs transition-all hover:shadow-md ${
                    isDanger
                      ? "border-danger-border bg-danger-subtle/15"
                      : isWarning
                      ? "border-warning-border bg-warning-subtle/15"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left content */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            isDanger
                              ? "bg-danger text-white shadow-2xs"
                              : isWarning
                              ? "bg-warning text-white shadow-2xs"
                              : "bg-primary text-white shadow-2xs"
                          }`}
                        >
                          {alert.severity}
                        </span>

                        {(alert as unknown as { alert_type?: string }).alert_type && (
                          <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-text-muted">
                            {(alert as unknown as { alert_type?: string }).alert_type?.replace(/_/g, " ")}
                          </span>
                        )}

                        <h4 className="text-body font-bold text-text-primary">
                          {alert.title}
                        </h4>
                      </div>

                      <p className="text-body text-text-secondary leading-relaxed">
                        {alert.description}
                      </p>

                      {/* Metadata row */}
                      <div className="flex flex-wrap items-center gap-4 text-caption text-text-muted pt-1">
                        <span>
                          Owner:{" "}
                          <strong className="text-text-primary font-medium">
                            {alert.owner || "Marcus Vance (Owner)"}
                          </strong>
                        </span>
                        <span>
                          Detected:{" "}
                          <span className="text-text-primary tabular-nums">
                            {formatDate(alert.created_at)}
                          </span>
                        </span>
                        {alert.escalated_to && (
                          <span className="text-danger font-semibold flex items-center gap-1 bg-danger-subtle px-2 py-0.5 rounded-md border border-danger-border">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            Escalated to: {alert.escalated_to}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t border-border/50 lg:border-t-0">
                      {canResolve && (
                        <button
                          onClick={() => setResolvingAlert(alert)}
                          className="flex items-center gap-1.5 rounded-lg bg-success px-3.5 py-1.5 text-caption font-semibold text-white hover:bg-success/90 transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}

                      {canWaive && (
                        <button
                          onClick={() => setWaivingAlert(alert)}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-caption font-semibold text-text-primary hover:bg-subtle transition-colors shadow-2xs"
                          title="Temporarily waive exception with documented justification"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-warning" />
                          <span>Waive</span>
                        </button>
                      )}

                      {canEscalate && (
                        <button
                          onClick={() => setEscalatingAlert(alert)}
                          className="flex items-center gap-1.5 rounded-lg border border-danger-border bg-danger-subtle px-3 py-1.5 text-caption font-semibold text-danger hover:bg-danger/20 transition-colors shadow-2xs"
                          title="Escalate issue to project leadership"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          <span>Escalate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. DATA QUALITY ISSUES TAB */}
      {activeTab === "DATA_QUALITY" && canAccessDqi && (
        <div className="space-y-4">
          <div className="rounded-xl border border-primary-border/60 bg-primary-subtle/20 p-4 text-caption text-text-secondary flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">
                GroundUp AI Continuous Integrity Engine
              </p>
              <p className="mt-0.5">
                Data quality issues represent unmapped line items, missing proof of payment, or unverified documents. Resolving them updates project certification status and enables clean lender draw packages.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {isLoadingDqi ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-2.5 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredDqiList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center shadow-xs">
                <CheckCircle2 className="mx-auto h-10 w-10 text-success mb-3" />
                <h3 className="text-body font-bold text-text-primary">
                  {openDqi.length === 0
                    ? "Zero Data Quality Issues"
                    : "No data quality issues match your filter"}
                </h3>
                <p className="text-caption text-text-muted mt-1 max-w-md mx-auto">
                  {openDqi.length === 0
                    ? "All financial records and schedule milestones are mapped to valid supporting evidence."
                    : "Try adjusting your search query or severity filter."}
                </p>
              </div>
            ) : (
              filteredDqiList.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col lg:flex-row lg:items-start justify-between gap-4 hover:border-text-muted/40 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          issue.severity === "HIGH"
                            ? "bg-danger-subtle text-danger border border-danger-border"
                            : issue.severity === "MEDIUM"
                            ? "bg-warning-subtle text-warning border border-warning-border"
                            : "bg-subtle text-text-muted border border-border"
                        }`}
                      >
                        {issue.severity}
                      </span>

                      <span className="font-bold text-body text-text-primary">
                        {issue.issue_type.replace(/_/g, " ")}
                      </span>

                      <span className="rounded-full bg-subtle px-2 py-0.5 text-caption text-text-muted border border-border">
                        Entity: {issue.affected_entity_type}
                      </span>
                    </div>

                    <p className="text-body text-text-secondary leading-relaxed">
                      {issue.description || `Integrity flag detected on ${issue.affected_entity_type} ID: ${issue.affected_entity_id}.`}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-caption text-text-muted pt-1">
                      <span>Affected ID: <code className="text-text-primary text-[11px] font-mono">{issue.affected_entity_id}</code></span>
                      <span>Owner: <strong className="text-text-primary">{issue.owner || "System Audit"}</strong></span>
                      <span>Detected: {formatDate(issue.detected_at)}</span>
                    </div>
                  </div>

                  {canWaive && (
                    <button
                      onClick={() => setResolvingDqi(issue)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-caption font-semibold text-white hover:bg-primary-hover shadow-xs shrink-0 self-start lg:self-center transition-colors"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Remediate / Waive</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. RESOLUTION ARCHIVE TAB */}
      {activeTab === "ARCHIVE" && (
        <div className="space-y-3">
          {filteredArchiveAlerts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center shadow-xs">
              <Clock className="mx-auto h-10 w-10 text-text-muted mb-3" />
              <h3 className="text-body font-bold text-text-primary">
                {closedAlerts.length === 0
                  ? "No Audited History Yet"
                  : "No archived records match your filter"}
              </h3>
              <p className="text-caption text-text-muted mt-1 max-w-md mx-auto">
                When operational exceptions are resolved or waived, their complete audit log and rationale appear here permanently.
              </p>
            </div>
          ) : (
            filteredArchiveAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-3 hover:border-text-muted/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                        alert.status === "RESOLVED"
                          ? "bg-success-subtle text-success border border-success-border"
                          : "bg-warning-subtle text-warning border border-warning-border"
                      }`}
                    >
                      {alert.status}
                    </span>

                    <h4 className="text-body font-bold text-text-primary">
                      {alert.title}
                    </h4>
                  </div>

                  <span className="text-caption text-text-muted tabular-nums shrink-0">
                    Archived: {formatDate(alert.resolved_at || alert.created_at)}
                  </span>
                </div>

                <p className="text-caption text-text-secondary leading-relaxed">
                  {alert.description}
                </p>

                {alert.resolution_note && (
                  <div className="rounded-lg border border-success-border/40 bg-success-subtle/20 p-3 text-caption text-text-primary">
                    <div className="flex items-center gap-1.5 font-semibold text-success mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Resolution Rationale</span>
                      {alert.resolved_by && (
                        <span className="text-text-muted font-normal">({alert.resolved_by})</span>
                      )}
                    </div>
                    <p className="text-text-secondary">{alert.resolution_note}</p>
                  </div>
                )}

                {alert.waived_reason && (
                  <div className="rounded-lg border border-warning-border/40 bg-warning-subtle/20 p-3 text-caption text-text-primary">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 font-semibold text-warning">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Waiver Rationale</span>
                        {alert.waived_by && (
                          <span className="text-text-muted font-normal">({alert.waived_by})</span>
                        )}
                      </div>
                      {alert.waived_until && (
                        <span className="text-text-muted text-[11px]">
                          Expires: {formatDate(alert.waived_until)}
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary">{alert.waived_reason}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Action Modals */}
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
