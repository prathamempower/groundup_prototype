"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { InvestorUpdateSnapshot } from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import { PublishSnapshotModal } from "./publish-snapshot-modal";
import { WithdrawSnapshotModal } from "./withdraw-snapshot-modal";
import { InvestorUpdatePreview } from "./investor-update-preview";
import {
  Sparkles,
  Plus,
  Edit3,
  ShieldCheck,
  AlertOctagon,
  FileText,
  Save,
  Send,
  Eye,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2,
  X,
} from "lucide-react";

interface PublicationManagerPanelProps {
  projectId: string;
  projectName?: string;
  projectAddress?: string;
  snapshots: InvestorUpdateSnapshot[];
  isLoading?: boolean;
}

export function PublicationManagerPanel({
  projectId,
  projectName,
  projectAddress,
  snapshots,
  isLoading,
}: PublicationManagerPanelProps) {
  const queryClient = useQueryClient();

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(
    snapshots.length > 0 ? snapshots[0].id : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "WITHDRAWN">("ALL");

  // Draft editing state
  const [editTitle, setEditTitle] = useState("");
  const [editAsOfDate, setEditAsOfDate] = useState("");
  const [editProgressSummary, setEditProgressSummary] = useState("");
  const [editDisclosures, setEditDisclosures] = useState<string[]>([]);
  const [newDisclosureInput, setNewDisclosureInput] = useState("");
  const [editRecipients, setEditRecipients] = useState<string[]>([]);
  const [newRecipientInput, setNewRecipientInput] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");

  // Modals state
  const [publishModalSnapshot, setPublishModalSnapshot] = useState<InvestorUpdateSnapshot | null>(null);
  const [withdrawModalSnapshot, setWithdrawModalSnapshot] = useState<InvestorUpdateSnapshot | null>(null);
  const [previewModalSnapshot, setPreviewModalSnapshot] = useState<InvestorUpdateSnapshot | null>(null);

  const selectedSnapshot = snapshots.find((s) => s.id === selectedSnapshotId) || snapshots[0];

  const handleStartEdit = (snapshot: InvestorUpdateSnapshot) => {
    setSelectedSnapshotId(snapshot.id);
    setEditTitle(snapshot.title);
    setEditAsOfDate(snapshot.as_of_date);
    setEditProgressSummary(snapshot.progress_summary);
    setEditDisclosures(snapshot.material_disclosures ? [...snapshot.material_disclosures] : []);
    setEditRecipients(snapshot.recipients ? [...snapshot.recipients] : ["Meridian Capital Group (All LP Investors)"]);
    setEditExpiryDate(snapshot.expiry_date || "");
    setIsEditing(true);
  };

  // Generate Draft Mutation
  const generateDraftMutation = useMutation({
    mutationFn: () => api.investor.generateDraft(projectId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["investor-updates", projectId] });
      handleStartEdit(res.data);
    },
  });

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: () => {
      if (!selectedSnapshot) throw new Error("No snapshot selected");
      return api.investor.saveDraft(projectId, {
        id: selectedSnapshot.id,
        title: editTitle,
        as_of_date: editAsOfDate,
        progress_summary: editProgressSummary,
        material_disclosures: editDisclosures,
        recipients: editRecipients,
        expiry_date: editExpiryDate || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investor-updates", projectId] });
      setIsEditing(false);
    },
  });

  const handleAddDisclosure = () => {
    if (newDisclosureInput.trim()) {
      setEditDisclosures([...editDisclosures, newDisclosureInput.trim()]);
      setNewDisclosureInput("");
    }
  };

  const handleRemoveDisclosure = (index: number) => {
    setEditDisclosures(editDisclosures.filter((_, i) => i !== index));
  };

  const handleAddRecipient = () => {
    if (newRecipientInput.trim() && !editRecipients.includes(newRecipientInput.trim())) {
      setEditRecipients([...editRecipients, newRecipientInput.trim()]);
      setNewRecipientInput("");
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setEditRecipients(editRecipients.filter((_, i) => i !== index));
  };

  const filteredSnapshots = snapshots.filter((s) => {
    if (activeTab === "ALL") return true;
    return s.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5 shadow-xs">
        <div>
          <h2 className="text-section font-bold text-text-primary">
            Investor Publication & Reporting Manager
          </h2>
          <p className="text-caption text-text-secondary mt-0.5">
            Compile immutable financial snapshots from approved project baselines and verified draws.
          </p>
        </div>

        <button
          onClick={() => generateDraftMutation.mutate()}
          disabled={generateDraftMutation.isPending}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover shadow-xs transition-colors shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          {generateDraftMutation.isPending ? "Generating Draft..." : "Generate Draft from Approved Data"}
        </button>
      </div>

      {/* Main Grid: Left Snapshots List, Right Detail/Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Snapshot List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
              Snapshots ({filteredSnapshots.length})
            </h3>
            {/* Filter Tabs */}
            <div className="flex rounded-md border border-border bg-subtle p-0.5 text-caption">
              {(["ALL", "PUBLISHED", "DRAFT"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-surface text-text-primary shadow-xs font-semibold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {tab === "ALL" ? "All" : tab === "PUBLISHED" ? "Published" : "Drafts"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredSnapshots.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-caption text-text-muted">
                No snapshots found for this view.
              </div>
            ) : (
              filteredSnapshots.map((s) => {
                const isSelected = s.id === (selectedSnapshot?.id || selectedSnapshotId);
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedSnapshotId(s.id);
                      setIsEditing(false);
                    }}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      isSelected
                        ? "border-primary bg-primary-subtle/30 shadow-xs ring-1 ring-primary"
                        : "border-border bg-surface hover:border-text-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-body font-bold text-text-primary leading-snug">
                        {s.title}
                      </h4>
                      {s.status === "PUBLISHED" && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-success-subtle px-2 py-0.5 text-caption font-semibold text-success border border-success-border">
                          Published
                        </span>
                      )}
                      {s.status === "DRAFT" && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-warning-subtle px-2 py-0.5 text-caption font-semibold text-warning border border-warning-border">
                          Draft
                        </span>
                      )}
                      {s.status === "WITHDRAWN" && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-danger-subtle px-2 py-0.5 text-caption font-semibold text-danger border border-danger-border">
                          Withdrawn
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-caption text-text-muted flex items-center justify-between">
                      <span>As of: <strong className="text-text-secondary">{formatDate(s.as_of_date)}</strong></span>
                      <span className="tabular-nums font-medium text-text-primary">
                        GDV: {formatMoney(s.gross_development_value)}
                      </span>
                    </div>

                    {s.published_at && (
                      <div className="mt-1.5 text-caption text-text-muted border-t border-border/50 pt-1.5 flex items-center justify-between">
                        <span>Pub: {formatDate(s.published_at)}</span>
                        <span className="truncate max-w-[120px] text-right">{s.published_by || "Marcus Vance"}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Detail Viewer / Draft Editor (8 cols) */}
        <div className="lg:col-span-8">
          {selectedSnapshot ? (
            isEditing ? (
              /* DRAFT EDITOR FORM */
              <div className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-section font-bold text-text-primary">
                      Edit Investor Update Draft
                    </h3>
                    <p className="text-caption text-text-secondary">
                      Customize disclosure narratives and distribution settings before publishing.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="rounded-md border border-border bg-surface px-3 py-1.5 text-caption font-medium text-text-secondary hover:bg-subtle"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveDraftMutation.mutate()}
                      disabled={saveDraftMutation.isPending}
                      className="flex items-center gap-1.5 rounded-md bg-subtle border border-border px-3 py-1.5 text-caption font-medium text-text-primary hover:bg-subtle/80"
                    >
                      <Save className="h-4 w-4" />
                      {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
                    </button>
                    <button
                      onClick={() => setPublishModalSnapshot(selectedSnapshot)}
                      className="flex items-center gap-1.5 rounded-md bg-success px-3.5 py-1.5 text-caption font-medium text-white hover:bg-success/90 shadow-xs"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Publish...
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-caption font-semibold text-text-primary">
                      Update Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-caption font-semibold text-text-primary">
                      As-of Valuation Date
                    </label>
                    <input
                      type="date"
                      value={editAsOfDate}
                      onChange={(e) => setEditAsOfDate(e.target.value)}
                      className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="space-y-1.5">
                  <label className="block text-caption font-semibold text-text-primary">
                    Development Status Narrative
                  </label>
                  <textarea
                    rows={4}
                    value={editProgressSummary}
                    onChange={(e) => setEditProgressSummary(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface p-3 text-body text-text-primary focus:border-primary focus:outline-hidden"
                    placeholder="Describe construction progress, foundation milestones, framing status, and trade activities..."
                  />
                </div>

                {/* Material Disclosures */}
                <div className="space-y-3">
                  <label className="block text-caption font-semibold text-text-primary">
                    Material Disclosures & Schedule Variances
                  </label>
                  <div className="space-y-2">
                    {editDisclosures.map((disc, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2 rounded-md border border-border bg-subtle/40 p-2.5 text-body text-text-primary"
                      >
                        <p className="text-caption leading-relaxed">{disc}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveDisclosure(idx)}
                          className="text-text-muted hover:text-danger p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDisclosureInput}
                      onChange={(e) => setNewDisclosureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDisclosure();
                        }
                      }}
                      placeholder="Add material disclosure note (e.g. steel lead-time adjustment, loan interest absorption)..."
                      className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddDisclosure}
                      className="rounded-md border border-border bg-subtle px-3 py-1.5 text-caption font-medium text-text-primary hover:bg-subtle/80"
                    >
                      Add Note
                    </button>
                  </div>
                </div>

                {/* Recipients and Expiry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                  <div className="space-y-2">
                    <label className="block text-caption font-semibold text-text-primary">
                      Recipients
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newRecipientInput}
                        onChange={(e) => setNewRecipientInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddRecipient();
                          }
                        }}
                        placeholder="Add recipient group..."
                        className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleAddRecipient}
                        className="rounded-md border border-border bg-subtle px-3 py-1.5 text-caption font-medium text-text-primary hover:bg-subtle/80"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {editRecipients.map((r, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-md bg-subtle border border-border px-2 py-0.5 text-caption font-medium text-text-primary"
                        >
                          {r}
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(idx)}
                            className="text-text-muted hover:text-danger"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-caption font-semibold text-text-primary">
                      Access Expiry Date
                    </label>
                    <input
                      type="date"
                      value={editExpiryDate}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                      className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* SNAPSHOT PREVIEW & ACTIONS */
              <div className="space-y-4">
                {/* Control bar */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-body font-bold text-text-primary">
                      {selectedSnapshot.title}
                    </span>
                    {selectedSnapshot.status === "PUBLISHED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-caption font-semibold text-success border border-success-border">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Live Snapshot
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedSnapshot.status === "DRAFT" && (
                      <>
                        <button
                          onClick={() => handleStartEdit(selectedSnapshot)}
                          className="flex items-center gap-1.5 rounded-md border border-border bg-subtle px-3 py-1.5 text-caption font-medium text-text-primary hover:bg-subtle/80"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit Draft
                        </button>
                        <button
                          onClick={() => setPublishModalSnapshot(selectedSnapshot)}
                          className="flex items-center gap-1.5 rounded-md bg-success px-3.5 py-1.5 text-caption font-medium text-white hover:bg-success/90 shadow-xs"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Publish Snapshot...
                        </button>
                      </>
                    )}

                    {selectedSnapshot.status === "PUBLISHED" && (
                      <button
                        onClick={() => setWithdrawModalSnapshot(selectedSnapshot)}
                        className="flex items-center gap-1.5 rounded-md border border-danger-border bg-danger-subtle px-3 py-1.5 text-caption font-medium text-danger hover:bg-danger/20 transition-colors"
                      >
                        <AlertOctagon className="h-3.5 w-3.5" />
                        Withdraw / Rescind Update...
                      </button>
                    )}
                  </div>
                </div>

                {/* Render Full Preview */}
                <InvestorUpdatePreview
                  snapshot={selectedSnapshot}
                  projectName={projectName}
                  projectAddress={projectAddress}
                  showPrintAction={true}
                />
              </div>
            )
          ) : (
            <div className="rounded-lg border border-border bg-surface p-12 text-center text-body text-text-muted">
              Select a snapshot from the list or generate a new draft from approved project data.
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {publishModalSnapshot && (
        <PublishSnapshotModal
          snapshot={publishModalSnapshot}
          isOpen={Boolean(publishModalSnapshot)}
          onClose={() => setPublishModalSnapshot(null)}
          onSuccess={(published) => {
            setSelectedSnapshotId(published.id);
            setIsEditing(false);
          }}
        />
      )}

      {/* Withdraw Modal */}
      {withdrawModalSnapshot && (
        <WithdrawSnapshotModal
          snapshot={withdrawModalSnapshot}
          isOpen={Boolean(withdrawModalSnapshot)}
          onClose={() => setWithdrawModalSnapshot(null)}
          onSuccess={(withdrawn) => {
            setSelectedSnapshotId(withdrawn.id);
          }}
        />
      )}
    </div>
  );
}
