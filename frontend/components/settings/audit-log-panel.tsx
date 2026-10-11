"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AuditEvent } from "@/lib/types";
import { formatDate } from "@/lib/format";
import {
  History,
  Search,
  Filter,
  User,
  ShieldCheck,
  FileText,
  Eye,
  X,
  Calendar,
  Layers,
  CheckCircle2,
} from "lucide-react";

export function AuditLogPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actorFilter, setActorFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const { data: auditData, isLoading } = useQuery({
    queryKey: ["audit-events"],
    queryFn: () => api.alerts.getAuditEvents(),
  });

  const events = auditData?.data || [];

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (actorFilter !== "ALL" && e.actor_name !== actorFilter && e.actor_role !== actorFilter) return false;
    if (entityFilter !== "ALL" && e.entity_type !== entityFilter) return false;
    if (actionFilter !== "ALL" && !e.action_type.includes(actionFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${e.action_type} ${e.actor_name} ${e.entity_type} ${e.entity_id} ${e.rationale} ${e.source_citation || ""}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Unique actors and entity types for filters
  const uniqueActors = Array.from(new Set(events.map((e) => e.actor_name)));
  const uniqueEntities = Array.from(new Set(events.map((e) => e.entity_type)));

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-lg border border-border bg-surface p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-section font-bold text-text-primary flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <span>Immutable Project Audit Log & Governance Trail</span>
            </h3>
            <p className="text-caption text-text-secondary mt-0.5">
              Complete, timestamped record of every human decision, baseline change, approval, and funding transaction.
            </p>
          </div>

          <div className="text-caption text-text-muted bg-subtle px-3 py-1.5 rounded-md border border-border shrink-0">
            Total Logged Events: <strong className="text-text-primary tabular-nums">{events.length}</strong>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rationale, entity, action..."
              className="w-full rounded-md border border-border bg-surface pl-9 pr-3 py-1.5 text-body text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-hidden"
            />
          </div>

          {/* Actor filter */}
          <div>
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
            >
              <option value="ALL">All Actors & Roles</option>
              {uniqueActors.map((actor) => (
                <option key={actor} value={actor}>{actor}</option>
              ))}
            </select>
          </div>

          {/* Entity Type filter */}
          <div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
            >
              <option value="ALL">All Entity Types</option>
              {uniqueEntities.map((entity) => (
                <option key={entity} value={entity}>{entity.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          {/* Action category filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
            >
              <option value="ALL">All Action Categories</option>
              <option value="APPROVE">Approvals & Baselines</option>
              <option value="DRAW">Draws & Fundings</option>
              <option value="RECONCILIATION">Reconciliation Matches</option>
              <option value="ALERT">Alerts & Exceptions</option>
              <option value="PUBLISH">Investor Publications</option>
              <option value="CLOSEOUT">Project Closeouts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body">
            <thead className="bg-subtle border-b border-border text-caption font-semibold text-text-secondary">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Rationale / Audit Note</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-subtle/30 transition-colors">
                    <td className="py-3 px-4 text-caption text-text-secondary whitespace-nowrap tabular-nums font-mono">
                      {formatDate(evt.created_at)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-text-primary">{evt.actor_name}</span>
                        <span className="rounded bg-subtle border border-border px-1.5 py-0.5 text-caption font-semibold text-text-secondary">
                          {evt.actor_role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded bg-primary-subtle px-2 py-0.5 text-caption font-semibold text-primary">
                        {evt.action_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-caption text-text-secondary whitespace-nowrap">
                      <span className="font-medium text-text-primary">{evt.entity_type}</span>
                      <span className="text-text-muted ml-1">({evt.entity_id})</span>
                    </td>
                    <td className="py-3 px-4 text-caption text-text-secondary max-w-xs truncate">
                      {evt.rationale}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="inline-flex items-center gap-1 text-caption font-medium text-primary hover:text-primary-hover"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Audit Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-subtle text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-section font-semibold text-text-primary">
                    Audit Event Inspection
                  </h3>
                  <p className="text-caption text-text-secondary font-mono">
                    ID: {selectedEvent.id} &bull; {formatDate(selectedEvent.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded p-1 text-text-muted hover:bg-subtle hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-body">
              <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-subtle/30 p-3.5 text-caption">
                <div>
                  <span className="text-text-muted">Actor:</span>
                  <div className="font-semibold text-text-primary">{selectedEvent.actor_name} ({selectedEvent.actor_role})</div>
                </div>
                <div>
                  <span className="text-text-muted">Action:</span>
                  <div className="font-semibold text-primary">{selectedEvent.action_type}</div>
                </div>
                <div>
                  <span className="text-text-muted">Entity Type:</span>
                  <div className="font-semibold text-text-primary">{selectedEvent.entity_type}</div>
                </div>
                <div>
                  <span className="text-text-muted">Entity ID:</span>
                  <div className="font-mono text-text-primary">{selectedEvent.entity_id}</div>
                </div>
              </div>

              {(selectedEvent.previous_value || selectedEvent.new_value) && (
                <div className="rounded-md border border-border bg-surface p-3.5 space-y-2 text-caption">
                  <span className="font-semibold text-text-primary">State Mutation:</span>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-danger-subtle text-danger px-2 py-1 font-mono">
                      {selectedEvent.previous_value || "(none)"}
                    </span>
                    <span className="text-text-muted">&rarr;</span>
                    <span className="rounded bg-success-subtle text-success px-2 py-1 font-mono">
                      {selectedEvent.new_value || "(none)"}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-caption font-semibold text-text-primary">Audit Rationale & Justification:</span>
                <div className="rounded-md border border-border bg-subtle/40 p-3 text-caption text-text-secondary leading-relaxed">
                  {selectedEvent.rationale}
                </div>
              </div>

              {selectedEvent.source_citation && (
                <div className="space-y-1">
                  <span className="text-caption font-semibold text-text-primary">Verified Citation:</span>
                  <div className="rounded-md border border-primary/20 bg-primary-subtle/30 p-2.5 text-caption text-primary flex items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>{selectedEvent.source_citation}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-md bg-subtle border border-border px-4 py-2 text-body font-medium text-text-primary hover:bg-subtle/80"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
