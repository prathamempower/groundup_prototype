"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  CheckCircle2,
  ShieldAlert,
  Search,
  ChevronRight,
  FileText,
  Calendar,
  Building,
  DollarSign,
  FileQuestion,
  Landmark,
  ShieldCheck,
  Plus,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AlertsViewProps {
  projectId: string;
  projectName?: string;
  userRole: UserRole;
}

interface NormalizedException {
  id: string;
  title: string;
  description: string;
  category: "Budget" | "Schedule" | "Finance" | "Draws" | "Compliance" | "Reconciliation" | "Documentation" | "Data Quality" | "Reporting";
  severity: "CRITICAL" | "WARNING" | "INFO";
  status: "Open" | "Resolved" | "Waived";
  detectedAt: string;
  ownerName: string;
  ownerRole: string;
  ownerInitials: string;
  ownerAvatarColor: string;
  originalAlert?: AlertItem;
  originalDqi?: DataQualityIssue;
}

export function AlertsView({ projectId, projectName, userRole }: AlertsViewProps) {
  const queryClient = useQueryClient();

  // Tab Filter
  const [activeTab, setActiveTab] = useState<"ALL" | "CRITICAL" | "WARNINGS" | "INTEGRITY" | "RESOLVED">("ALL");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Modals state
  const [resolvingAlert, setResolvingAlert] = useState<AlertItem | null>(null);
  const [waivingAlert, setWaivingAlert] = useState<AlertItem | null>(null);
  const [escalatingAlert, setEscalatingAlert] = useState<AlertItem | null>(null);
  const [resolvingDqi, setResolvingDqi] = useState<DataQualityIssue | null>(null);

  // Queries
  const { data: alertsData, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["alerts", projectId],
    queryFn: () => api.alerts.list(projectId),
    enabled: Boolean(projectId),
  });

  const { data: dqiData, isLoading: isLoadingDqi } = useQuery({
    queryKey: ["data-quality-issues", projectId],
    queryFn: () => api.alerts.getDataQualityIssues(projectId),
    enabled: Boolean(projectId),
  });

  // Role permissions
  const canWaive = ["OWNER", "CFO"].includes(userRole);
  const canEscalate = ["OWNER", "CFO", "PM"].includes(userRole);
  const canResolve = ["OWNER", "CFO", "PM", "GC"].includes(userRole);

  // Normalize all alerts & DQIs into unified table exceptions
  const allExceptions: NormalizedException[] = useMemo(() => {
    const alerts = alertsData?.data || [];
    const dqis = dqiData?.data || [];

    const ownerColorMap: Record<string, { initials: string; role: string; color: string }> = {
      "Marcus Vance": { initials: "MV", role: "Owner", color: "bg-slate-900 text-white" },
      "Sarah Lin": { initials: "SL", role: "CFO", color: "bg-blue-100 text-blue-700" },
      "David Ross": { initials: "DR", role: "PM", color: "bg-emerald-100 text-emerald-700" },
      "Frank Miller": { initials: "FM", role: "GC", color: "bg-amber-100 text-amber-700" },
      "Elena Rostova": { initials: "ER", role: "Investor", color: "bg-purple-100 text-purple-700" },
    };

    const getOwnerMeta = (nameStr?: string) => {
      const defaultName = nameStr || "Marcus Vance";
      for (const [key, val] of Object.entries(ownerColorMap)) {
        if (defaultName.toLowerCase().includes(key.toLowerCase())) {
          return { name: key, ...val };
        }
      }
      return {
        name: defaultName,
        initials: defaultName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
        role: "Project Member",
        color: "bg-slate-800 text-white",
      };
    };

    const list: NormalizedException[] = [];

    // Map Alerts
    alerts.forEach((alert) => {
      let category: NormalizedException["category"] = "Budget";
      const titleLower = alert.title.toLowerCase();
      if (titleLower.includes("milestone") || titleLower.includes("schedule")) category = "Schedule";
      else if (titleLower.includes("cash") || titleLower.includes("deposit")) category = "Finance";
      else if (titleLower.includes("draw")) category = "Draws";
      else if (titleLower.includes("lien") || titleLower.includes("compliance")) category = "Compliance";
      else if (titleLower.includes("reconciliation") || titleLower.includes("transfer")) category = "Reconciliation";
      else if (titleLower.includes("document") || titleLower.includes("occupancy")) category = "Documentation";
      else if (titleLower.includes("report") || titleLower.includes("investor")) category = "Reporting";

      let sev: "CRITICAL" | "WARNING" | "INFO" = "INFO";
      if (alert.severity === "DANGER" || (alert.severity as string) === "CRITICAL") sev = "CRITICAL";
      else if (alert.severity === "WARNING" || (alert.severity as string) === "HIGH") sev = "WARNING";

      const ownerMeta = getOwnerMeta(alert.owner);

      list.push({
        id: `alert-${alert.id}`,
        title: alert.title,
        description: alert.description,
        category,
        severity: sev,
        status: alert.status === "RESOLVED" ? "Resolved" : alert.status === "WAIVED" ? "Waived" : "Open",
        detectedAt: alert.created_at,
        ownerName: ownerMeta.name,
        ownerRole: ownerMeta.role,
        ownerInitials: ownerMeta.initials,
        ownerAvatarColor: ownerMeta.color,
        originalAlert: alert,
      });
    });

    // Map DQIs
    dqis.forEach((dqi) => {
      const ownerMeta = getOwnerMeta(dqi.owner);
      list.push({
        id: `dqi-${dqi.id}`,
        title: dqi.issue_type.replace(/_/g, " "),
        description: dqi.description || `Integrity flag detected on ${dqi.affected_entity_type}`,
        category: "Data Quality",
        severity: dqi.severity === "HIGH" ? "CRITICAL" : dqi.severity === "MEDIUM" ? "WARNING" : "INFO",
        status: dqi.status === "RESOLVED" ? "Resolved" : dqi.status === "WAIVED" ? "Waived" : "Open",
        detectedAt: dqi.detected_at,
        ownerName: ownerMeta.name,
        ownerRole: ownerMeta.role,
        ownerInitials: ownerMeta.initials,
        ownerAvatarColor: ownerMeta.color,
        originalDqi: dqi,
      });
    });

    return list;
  }, [alertsData?.data, dqiData?.data]);

  // Counts
  const criticalCount = allExceptions.filter((e) => e.severity === "CRITICAL" && e.status === "Open").length;
  const warningCount = allExceptions.filter((e) => e.severity === "WARNING" && e.status === "Open").length;
  const integrityCount = allExceptions.filter((e) => e.category === "Data Quality" && e.status === "Open").length;
  const resolvedCount = allExceptions.filter((e) => e.status === "Resolved" || e.status === "Waived").length;

  // Filtered list
  const filteredExceptions = useMemo(() => {
    return allExceptions.filter((item) => {
      // Tab filter
      if (activeTab === "CRITICAL" && (item.severity !== "CRITICAL" || item.status !== "Open")) return false;
      if (activeTab === "WARNINGS" && (item.severity !== "WARNING" || item.status !== "Open")) return false;
      if (activeTab === "INTEGRITY" && (item.category !== "Data Quality" || item.status !== "Open")) return false;
      if (activeTab === "RESOLVED" && item.status !== "Resolved" && item.status !== "Waived") return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.ownerName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Severity dropdown
      if (severityFilter !== "ALL" && item.severity !== severityFilter) return false;

      // Category dropdown
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;

      return true;
    });
  }, [allExceptions, activeTab, searchQuery, severityFilter, categoryFilter]);

  // Unique categories for filter
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    allExceptions.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [allExceptions]);

  const getExceptionIcon = (item: NormalizedException) => {
    switch (item.category) {
      case "Budget":
        return <FileText className="h-4 w-4 text-rose-500" />;
      case "Schedule":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "Finance":
        return <Landmark className="h-4 w-4 text-blue-500" />;
      case "Draws":
        return <DollarSign className="h-4 w-4 text-amber-500" />;
      case "Compliance":
        return <FileText className="h-4 w-4 text-rose-500" />;
      case "Reconciliation":
        return <Landmark className="h-4 w-4 text-amber-500" />;
      case "Documentation":
        return <FileText className="h-4 w-4 text-rose-500" />;
      case "Data Quality":
        return <FileQuestion className="h-4 w-4 text-amber-500" />;
      case "Reporting":
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Summary Cards matching Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Exceptions */}
        <div
          onClick={() => setActiveTab("CRITICAL")}
          className={cn(
            "rounded-xl border bg-white p-5 shadow-xs transition-all cursor-pointer flex items-center justify-between group hover:shadow-md",
            activeTab === "CRITICAL" ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200/90 hover:border-rose-200"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100/80 shadow-2xs shrink-0">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {criticalCount}
              </div>
              <div className="text-xs font-bold text-slate-800">
                Critical Exceptions
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Require immediate action
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Elevated Warnings */}
        <div
          onClick={() => setActiveTab("WARNINGS")}
          className={cn(
            "rounded-xl border bg-white p-5 shadow-xs transition-all cursor-pointer flex items-center justify-between group hover:shadow-md",
            activeTab === "WARNINGS" ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200/90 hover:border-amber-200"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80 shadow-2xs shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {warningCount}
              </div>
              <div className="text-xs font-bold text-slate-800">
                Elevated Warnings
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Need review
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Integrity Flags */}
        <div
          onClick={() => setActiveTab("INTEGRITY")}
          className={cn(
            "rounded-xl border bg-white p-5 shadow-xs transition-all cursor-pointer flex items-center justify-between group hover:shadow-md",
            activeTab === "INTEGRITY" ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-200/90 hover:border-blue-200"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 shadow-2xs shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {integrityCount}
              </div>
              <div className="text-xs font-bold text-slate-800">
                Integrity Flags
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Data or documentation gaps
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Resolved */}
        <div
          onClick={() => setActiveTab("RESOLVED")}
          className={cn(
            "rounded-xl border bg-white p-5 shadow-xs transition-all cursor-pointer flex items-center justify-between group hover:shadow-md",
            activeTab === "RESOLVED" ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-200/90 hover:border-emerald-200"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 shadow-2xs shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {resolvedCount}
              </div>
              <div className="text-xs font-bold text-slate-800">
                Resolved
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Closed in this project
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Filter & Search Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border-b border-slate-200/80">
          {/* Horizontal Text Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "pb-1 transition-all whitespace-nowrap cursor-pointer border-b-2",
                activeTab === "ALL"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              All ({allExceptions.length})
            </button>

            <button
              onClick={() => setActiveTab("CRITICAL")}
              className={cn(
                "pb-1 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer border-b-2",
                activeTab === "CRITICAL"
                  ? "border-rose-600 text-rose-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span>Critical ({criticalCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("WARNINGS")}
              className={cn(
                "pb-1 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer border-b-2",
                activeTab === "WARNINGS"
                  ? "border-amber-600 text-amber-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Warnings ({warningCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("INTEGRITY")}
              className={cn(
                "pb-1 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer border-b-2",
                activeTab === "INTEGRITY"
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Integrity ({integrityCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("RESOLVED")}
              className={cn(
                "pb-1 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer border-b-2",
                activeTab === "RESOLVED"
                  ? "border-emerald-600 text-emerald-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Resolved ({resolvedCount})</span>
            </button>
          </div>

          {/* Search & Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exceptions..."
                className="w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden shadow-2xs font-normal"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs text-slate-700 font-medium focus:border-blue-600 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs text-slate-700 font-medium focus:border-blue-600 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold text-slate-500 tracking-wider">
                <th className="py-3 px-6 min-w-[320px]">Exception</th>
                <th className="py-3 px-4 min-w-[110px]">Category</th>
                <th className="py-3 px-4 min-w-[110px]">Severity</th>
                <th className="py-3 px-4 min-w-[100px]">Status</th>
                <th className="py-3 px-4 min-w-[110px]">Detected</th>
                <th className="py-3 px-5 min-w-[160px]">Owner</th>
                <th className="py-3 px-6 text-right min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoadingAlerts ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading exceptions...
                  </td>
                </tr>
              ) : filteredExceptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                    <div className="font-bold text-slate-800 text-sm">No exceptions found</div>
                    <div className="text-slate-400 text-xs mt-0.5">Try adjusting your filters or search term</div>
                  </td>
                </tr>
              ) : (
                filteredExceptions.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Exception Title & Snippet with Icon */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {getExceptionIcon(item)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Pill */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                          {item.category}
                        </span>
                      </td>

                      {/* Severity Pill */}
                      <td className="py-3.5 px-4">
                        {item.severity === "CRITICAL" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Critical
                          </span>
                        ) : item.severity === "WARNING" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Info
                          </span>
                        )}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3.5 px-4">
                        {item.status === "Open" ? (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold bg-rose-50/70 text-rose-700 border border-rose-200/50">
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            {item.status}
                          </span>
                        )}
                      </td>

                      {/* Detected Date */}
                      <td className="py-3.5 px-4 text-slate-500 tabular-nums text-xs">
                        {formatDate(item.detectedAt)}
                      </td>

                      {/* Owner Avatar & Name */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 tracking-tight",
                            item.ownerAvatarColor
                          )}>
                            {item.ownerInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-xs">
                              {item.ownerName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {item.ownerRole}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canResolve && item.status === "Open" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (item.originalAlert) setResolvingAlert(item.originalAlert);
                                else if (item.originalDqi) setResolvingDqi(item.originalDqi);
                              }}
                              className="h-7 px-3 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50/70 hover:border-blue-300 rounded-md"
                            >
                              Resolve
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (item.originalAlert && canWaive) setWaivingAlert(item.originalAlert);
                              else if (item.originalDqi && canWaive) setResolvingDqi(item.originalDqi);
                            }}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                            title="More actions"
                          >
                            <span className="font-bold text-sm tracking-widest leading-none select-none">···</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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


