"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UserRole } from "@/lib/types";
import {
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Check,
  Building2,
  Calendar,
  AlertOctagon,
  Info,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
} from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export interface AlertRowItem {
  id: string;
  title: string;
  description: string;
  category: "Construction" | "Financing" | "Budget" | "Documents";
  filterGroup: "schedule" | "funding" | "budget" | "documents";
  impact: string;
  impactDetail?: string;
  dueDate: string;
  status: "Open" | "Resolved" | "Waived";
  actionLabel: string;
  actionHref: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
}

const DEFAULT_PROJECT_ALERTS: AlertRowItem[] = [
  {
    id: "alert-1",
    title: "Framing completion delayed",
    description: "Framing milestone is 12 days behind schedule.",
    category: "Construction",
    filterGroup: "schedule",
    impact: "12-day delay",
    impactDetail: "May affect overall completion date",
    dueDate: "Oct 20, 2024",
    status: "Open",
    actionLabel: "View Schedule",
    actionHref: "/timeline",
    severity: "CRITICAL",
  },
  {
    id: "alert-2",
    title: "Upcoming cash shortfall",
    description: "Available cash is insufficient for upcoming payment obligations.",
    category: "Financing",
    filterGroup: "funding",
    impact: "$325,000 shortfall",
    impactDetail: "Required before next draw",
    dueDate: "Oct 18, 2024",
    status: "Open",
    actionLabel: "View Cash",
    actionHref: "/budget",
    severity: "CRITICAL",
  },
  {
    id: "alert-3",
    title: "Construction costs exceeding budget",
    description: "Actual costs are 18% higher than the approved budget.",
    category: "Budget",
    filterGroup: "budget",
    impact: "$12,650 over budget (18%)",
    impactDetail: "Budget: $116,100 | Actual: $128,750",
    dueDate: "Oct 22, 2024",
    status: "Open",
    actionLabel: "View Budget",
    actionHref: "/budget",
    severity: "WARNING",
  },
  {
    id: "alert-4",
    title: "Inspection pending",
    description: "Electrical inspection is not yet scheduled.",
    category: "Construction",
    filterGroup: "schedule",
    impact: "Delays next phase",
    impactDetail: "May delay timeline by 7–10 days",
    dueDate: "Oct 25, 2024",
    status: "Open",
    actionLabel: "View Schedule",
    actionHref: "/timeline",
    severity: "WARNING",
  },
  {
    id: "alert-5",
    title: "3 construction invoices missing",
    description: "Payments require missing vendor invoices and lien waivers.",
    category: "Documents",
    filterGroup: "funding",
    impact: "$48,000",
    impactDetail: "Missing invoices & lien waivers",
    dueDate: "Oct 19, 2024",
    status: "Open",
    actionLabel: "Upload Documents",
    actionHref: "/documents",
    severity: "CRITICAL",
  },
  {
    id: "alert-6",
    title: "Contingency running low",
    description: "Only 15% of the allocated contingency reserve remains.",
    category: "Budget",
    filterGroup: "budget",
    impact: "$12,470 remaining",
    impactDetail: "15% of baseline reserve",
    dueDate: "Oct 28, 2024",
    status: "Open",
    actionLabel: "View Budget",
    actionHref: "/budget",
    severity: "WARNING",
  },
  {
    id: "alert-7",
    title: "Final permit due",
    description: "Final municipal inspection permit has not yet been received.",
    category: "Documents",
    filterGroup: "documents",
    impact: "Due in 8 days",
    impactDetail: "Required for certificate of occupancy",
    dueDate: "Oct 30, 2024",
    status: "Open",
    actionLabel: "View Documents",
    actionHref: "/documents",
    severity: "INFO",
  },
  {
    id: "alert-8",
    title: "HVAC equipment delivery delay",
    description: "Supplier reported a delivery delay on primary HVAC equipment.",
    category: "Construction",
    filterGroup: "schedule",
    impact: "5–7 day delay",
    impactDetail: "May delay HVAC installation",
    dueDate: "Nov 05, 2024",
    status: "Open",
    actionLabel: "View Schedule",
    actionHref: "/timeline",
    severity: "INFO",
  },
];

interface AlertsViewProps {
  projectId: string;
  projectName?: string;
  userRole?: UserRole;
}

export function AlertsView({
  projectId,
  projectName = "73 Broadway",
  userRole = "OWNER",
}: AlertsViewProps) {
  const router = useRouter();

  // Active category filter state from KPI cards
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "schedule" | "funding" | "budget" | "documents"
  >("all");

  // Local alert state initialized with reference alerts
  const [alerts, setAlerts] = useState<AlertRowItem[]>(DEFAULT_PROJECT_ALERTS);

  // Detail & Resolution modal state
  const [selectedAlert, setSelectedAlert] = useState<AlertRowItem | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Calculate dynamic counts based on current alerts status
  const counts = useMemo(() => {
    const openAlerts = alerts.filter((a) => a.status === "Open");
    return {
      total: openAlerts.length,
      schedule: openAlerts.filter((a) => a.filterGroup === "schedule").length,
      funding: openAlerts.filter((a) => a.filterGroup === "funding").length,
      budget: openAlerts.filter((a) => a.filterGroup === "budget").length,
      documents: openAlerts.filter((a) => a.filterGroup === "documents").length,
    };
  }, [alerts]);

  // Filtered rows
  const filteredAlerts = useMemo(() => {
    if (selectedFilter === "all") return alerts;
    return alerts.filter((a) => a.filterGroup === selectedFilter);
  }, [alerts, selectedFilter]);



  // Handler to resolve alert
  const handleResolveAlert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedAlert) return;

    setIsResolving(true);
    setTimeout(() => {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === selectedAlert.id ? { ...a, status: "Resolved" } : a
        )
      );
      setIsResolving(false);
      setSelectedAlert(null);
      setResolutionNote("");
    }, 200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Standard Page Header */}
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                Alerts
              </h1>
              <span className="text-xs text-muted-foreground font-mono">
                {counts.total} active issues
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Key issues and action items for {projectName}.
            </p>
          </div>

          {selectedFilter !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFilter("all")}
              className="h-8 text-xs font-medium self-start sm:self-auto"
            >
              Clear Filter ({selectedFilter})
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-7xl mx-auto space-y-5">
        {/* 2. Top 5 Filter KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {/* Card 1: Total Alerts */}
          <button
            type="button"
            onClick={() => setSelectedFilter("all")}
            className={cn(
              "rounded-lg border bg-white p-4 text-left transition-all cursor-pointer",
              selectedFilter === "all"
                ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                : "border-border hover:bg-subtle/50"
            )}
          >
            <span className="text-[11px] font-medium text-muted-foreground block">
              Total Alerts
            </span>
            <span className="text-2xl font-bold font-mono text-foreground mt-1.5 block tabular-nums">
              {counts.total}
            </span>
          </button>

          {/* Card 2: Schedule Delays */}
          <button
            type="button"
            onClick={() =>
              setSelectedFilter(selectedFilter === "schedule" ? "all" : "schedule")
            }
            className={cn(
              "rounded-lg border bg-white p-4 text-left transition-all cursor-pointer",
              selectedFilter === "schedule"
                ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                : "border-border hover:bg-subtle/50"
            )}
          >
            <span className="text-[11px] font-medium text-muted-foreground block">
              Schedule Delays
            </span>
            <span className="text-2xl font-bold font-mono text-foreground mt-1.5 block tabular-nums">
              {counts.schedule}
            </span>
          </button>

          {/* Card 3: Funding & Cash */}
          <button
            type="button"
            onClick={() =>
              setSelectedFilter(selectedFilter === "funding" ? "all" : "funding")
            }
            className={cn(
              "rounded-lg border bg-white p-4 text-left transition-all cursor-pointer",
              selectedFilter === "funding"
                ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                : "border-border hover:bg-subtle/50"
            )}
          >
            <span className="text-[11px] font-medium text-muted-foreground block">
              Funding & Cash
            </span>
            <span className="text-2xl font-bold font-mono text-foreground mt-1.5 block tabular-nums">
              {counts.funding}
            </span>
          </button>

          {/* Card 4: Budget & Cost */}
          <button
            type="button"
            onClick={() =>
              setSelectedFilter(selectedFilter === "budget" ? "all" : "budget")
            }
            className={cn(
              "rounded-lg border bg-white p-4 text-left transition-all cursor-pointer",
              selectedFilter === "budget"
                ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                : "border-border hover:bg-subtle/50"
            )}
          >
            <span className="text-[11px] font-medium text-muted-foreground block">
              Budget & Cost
            </span>
            <span className="text-2xl font-bold font-mono text-foreground mt-1.5 block tabular-nums">
              {counts.budget}
            </span>
          </button>

          {/* Card 5: Missing Documents */}
          <button
            type="button"
            onClick={() =>
              setSelectedFilter(
                selectedFilter === "documents" ? "all" : "documents"
              )
            }
            className={cn(
              "col-span-2 sm:col-span-1 rounded-lg border bg-white p-4 text-left transition-all cursor-pointer",
              selectedFilter === "documents"
                ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                : "border-border hover:bg-subtle/50"
            )}
          >
            <span className="text-[11px] font-medium text-muted-foreground block">
              Missing Documents
            </span>
            <span className="text-2xl font-bold font-mono text-foreground mt-1.5 block tabular-nums">
              {counts.documents}
            </span>
          </button>
        </div>

        {/* 3. Alerts Table */}
        <div className="rounded-lg border border-border bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle/50 border-b border-border text-muted-foreground font-medium text-[11px]">
                <tr>
                  <th className="py-2.5 px-5">Issue</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Project Impact</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">
                        No active alerts in this category
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        All issues in this view have been resolved.
                      </p>
                      {selectedFilter !== "all" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFilter("all")}
                          className="mt-3 text-xs"
                        >
                          Show All Alerts
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedAlert(item)}
                      className="hover:bg-subtle/40 transition-colors cursor-pointer group"
                    >
                      {/* Issue */}
                      <td className="py-3.5 px-5 max-w-sm">
                        <div className="font-semibold text-foreground text-xs sm:text-sm group-hover:text-primary transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {item.description}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.category}
                        </span>
                      </td>

                      {/* Project Impact */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-foreground text-xs sm:text-sm">
                          {item.impact}
                        </div>
                        {item.impactDetail && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {item.impactDetail}
                          </div>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">
                          {item.dueDate}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border",
                            item.status === "Open"
                              ? "bg-slate-100 text-slate-700 border-slate-200"
                              : item.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                              : "bg-amber-50 text-amber-700 border-amber-200/60"
                          )}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td
                        className="py-3.5 px-5 text-right whitespace-nowrap"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="h-7 px-2.5 text-xs font-medium text-primary hover:text-primary gap-1"
                        >
                          <span>{item.actionLabel}</span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Alert Details & Resolution Modal (Using standard Radix Modal) */}
      <Modal
        open={Boolean(selectedAlert)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAlert(null);
            setResolutionNote("");
          }
        }}
      >
        <ModalContent
          maxWidth="md"
          className="p-0 overflow-hidden rounded-xl border border-border bg-white shadow-xl max-w-[540px]"
        >
          {selectedAlert && (
            <>
              {/* Modal Header */}
              <div className="pl-6 pr-14 py-5 border-b border-border bg-white">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                  {selectedAlert.category} Alert &middot; {selectedAlert.status}
                </span>
                <h2 className="text-base font-semibold text-foreground">
                  {selectedAlert.title}
                </h2>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedAlert.description}
                </p>

                {/* Impact Context Box */}
                <div className="rounded-lg border border-border bg-subtle/50 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Project Impact:</span>
                    <span className="font-semibold text-foreground">{selectedAlert.impact}</span>
                  </div>
                  {selectedAlert.impactDetail && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Context:</span>
                      <span className="text-foreground">{selectedAlert.impactDetail}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Target Resolution Date:</span>
                    <span className="font-mono text-foreground font-medium">{selectedAlert.dueDate}</span>
                  </div>
                </div>

                {/* Resolution Form if Open */}
                {selectedAlert.status === "Open" && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-medium text-foreground">
                      Resolution Note (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Describe action taken to mitigate or resolve this issue..."
                      className="w-full rounded-md border border-border bg-white p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-border bg-subtle/40 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                {selectedAlert.actionHref && selectedAlert.actionHref !== "/timeline" && selectedAlert.actionHref !== "/budget" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const href = selectedAlert.actionHref;
                      const targetUrl = projectId ? `/projects/${projectId}${href}` : href;
                      router.push(targetUrl);
                    }}
                    className="text-xs h-8 text-primary border-border gap-1.5 cursor-pointer font-medium w-full sm:w-auto"
                  >
                    <span>Go to {selectedAlert.actionLabel}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {selectedAlert.status === "Open" ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={isResolving}
                      onClick={handleResolveAlert}
                      className="text-xs h-8 font-medium cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      <span>{isResolving ? "Resolving..." : "Mark as Resolved"}</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedAlert(null)}
                      className="text-xs h-8"
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
