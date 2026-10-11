"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DocumentItem, ExtractionField } from "@/lib/types";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { DocumentViewer } from "./document-viewer";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Sparkles,
  CheckCheck,
  AlertTriangle,
  FileCheck,
  Building,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface DocumentReviewDrawerProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DocumentReviewDrawer({
  documentId,
  open,
  onOpenChange,
  onSuccess,
}: DocumentReviewDrawerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const [rejectingFieldId, setRejectingFieldId] = useState<string | null>(null);
  const [rejectRationale, setRejectRationale] = useState("");

  const { data: docData, isLoading: isLoadingDoc } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => (documentId ? api.documents.getById(documentId) : Promise.reject(new Error("No ID"))),
    enabled: !!documentId && open,
  });

  const { data: extractionsData, isLoading: isLoadingExtractions } = useQuery({
    queryKey: ["document-extractions", documentId],
    queryFn: () => (documentId ? api.documents.getExtractions(documentId) : Promise.reject(new Error("No ID"))),
    enabled: !!documentId && open,
  });

  const document = docData?.data;
  const extractions = extractionsData?.data || [];

  // Mutations
  const decideMutation = useMutation({
    mutationFn: ({
      fieldId,
      decision,
      normalizedValue,
      rationale,
    }: {
      fieldId: string;
      decision: "ACCEPT" | "EDIT" | "REJECT";
      normalizedValue?: string;
      rationale?: string;
    }) => api.documents.decideExtractionField(fieldId, decision, normalizedValue, rationale),
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["document-extractions", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setEditingFieldId(null);
      setRejectingFieldId(null);
      toast({
        title: `Proposal ${vars.decision === "ACCEPT" ? "Accepted" : vars.decision === "EDIT" ? "Updated" : "Rejected"}`,
        description: `Successfully applied decision to extraction field.`,
        variant: vars.decision === "REJECT" ? "destructive" : "default",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Decision Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const acceptAllMutation = useMutation({
    mutationFn: () => (documentId ? api.documents.acceptAllExtractions(documentId) : Promise.reject(new Error("No ID"))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-extractions", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "All Extractions Accepted",
        description: "All candidate fields have been accepted as verified source values.",
      });
    },
  });

  const completeReviewMutation = useMutation({
    mutationFn: () => (documentId ? api.documents.completeReview(documentId) : Promise.reject(new Error("No ID"))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["project-readiness"] });
      queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["data-quality-issues"] });
      toast({
        title: "Document Review Complete",
        description: "Document marked as Reviewed and published to downstream budget and draw ledgers.",
      });
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const startEdit = (field: ExtractionField) => {
    setEditingFieldId(field.id);
    setEditedValue(field.normalized_value);
    setEditRationale(field.decision_rationale || "");
    setRejectingFieldId(null);
  };

  const startReject = (field: ExtractionField) => {
    setRejectingFieldId(field.id);
    setRejectRationale("");
    setEditingFieldId(null);
  };

  const saveEdit = (fieldId: string) => {
    decideMutation.mutate({
      fieldId,
      decision: "EDIT",
      normalizedValue: editedValue,
      rationale: editRationale || "Human correction during document review",
    });
  };

  const submitReject = (fieldId: string) => {
    decideMutation.mutate({
      fieldId,
      decision: "REJECT",
      rationale: rejectRationale || "Rejected by human reviewer",
    });
  };

  // Calculate stats
  const totalFields = extractions.length;
  const acceptedCount = extractions.filter((e) => e.status === "ACCEPTED" || e.status === "EDITED").length;
  const proposedCount = extractions.filter((e) => e.status === "PROPOSED").length;
  const avgConfidence = totalFields > 0
    ? Math.round((extractions.reduce((acc, e) => acc + e.confidence, 0) / totalFields) * 100)
    : 95;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent width="split-view" className="flex flex-col h-full bg-surface">
        {/* Drawer Header */}
        <DrawerHeader className="border-b border-border bg-subtle/40 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary-subtle text-primary font-mono px-2 py-0.5 text-caption font-semibold">
                  OCR REVIEW WORKBENCH
                </span>
                {document && (
                  <StatusBadge
                    status={
                      document.ingestion_status === "REVIEWED"
                        ? "verified"
                        : document.ingestion_status === "QUARANTINED"
                        ? "blocked"
                        : "under_review"
                    }
                  />
                )}
              </div>
              <DrawerTitle className="text-section font-bold text-text-primary">
                {document?.original_filename || "Review Document"}
              </DrawerTitle>
              <DrawerDescription className="text-caption text-text-secondary">
                Verify AI candidate extractions against the source document. Accepted values become immutable evidence.
              </DrawerDescription>
            </div>

            {/* Quick stats summary */}
            <div className="hidden sm:flex items-center gap-4 bg-surface p-2.5 rounded-md border border-border">
              <div className="text-center px-2">
                <div className="text-caption text-text-muted">OCR Confidence</div>
                <div className="text-sm font-bold text-emerald-600 font-mono">{avgConfidence}%</div>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center px-2">
                <div className="text-caption text-text-muted">Pending Review</div>
                <div className="text-sm font-bold text-amber-600 font-mono">{proposedCount}</div>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center px-2">
                <div className="text-caption text-text-muted">Accepted</div>
                <div className="text-sm font-bold text-primary font-mono">{acceptedCount} / {totalFields}</div>
              </div>
            </div>
          </div>
        </DrawerHeader>

        {/* Drawer Body - Split View Grid */}
        <DrawerBody className="flex-1 p-0 overflow-hidden flex flex-col md:flex-row bg-background">
          {isLoadingDoc || isLoadingExtractions || !document ? (
            <div className="flex-1 flex items-center justify-center p-12 text-body text-text-muted">
              Loading document and extraction models...
            </div>
          ) : (
            <>
              {/* Left Side: Document Viewer (60% width) */}
              <div className="flex-1 h-full p-4 overflow-hidden border-r border-border bg-slate-950 flex flex-col">
                <DocumentViewer
                  document={document}
                  extractions={extractions}
                  selectedFieldId={selectedFieldId}
                  onSelectField={(id) => setSelectedFieldId(id)}
                />
              </div>

              {/* Right Side: Extraction Inspector & Decision Controls (40% width) */}
              <div className="w-full md:w-[480px] h-full flex flex-col bg-surface overflow-y-auto">
                {/* Confidence Bar & Review Guidance */}
                <div className="p-4 border-b border-border bg-subtle/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-primary flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Extraction Review Queue ({extractions.length} fields)
                    </span>
                    <span className="text-caption text-text-secondary font-mono">
                      {acceptedCount} of {totalFields} verified
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{
                        width: `${totalFields > 0 ? (acceptedCount / totalFields) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Extractions List */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {extractions.length === 0 ? (
                    <div className="text-center py-12 text-text-muted text-body">
                      No automated extraction fields detected for this document.
                    </div>
                  ) : (
                    extractions.map((field) => {
                      const isSelected = selectedFieldId === field.id;
                      const isEditing = editingFieldId === field.id;
                      const isRejecting = rejectingFieldId === field.id;

                      return (
                        <div
                          key={field.id}
                          onClick={() => setSelectedFieldId(field.id)}
                          className={cn(
                            "rounded-lg border p-3.5 transition-all text-body relative",
                            isSelected
                              ? "border-primary ring-1 ring-primary bg-primary-subtle/10"
                              : "border-border bg-surface hover:border-text-muted/50",
                            field.status === "ACCEPTED" && "border-emerald-200 bg-emerald-50/20",
                            field.status === "REJECTED" && "border-rose-200 bg-rose-50/20 opacity-70"
                          )}
                        >
                          {/* Field Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-text-primary block">
                                {field.field_name}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="rounded bg-subtle px-1.5 py-0.5 text-[10px] font-mono text-text-secondary">
                                  Page {field.citation?.page_number || 1}, Row {field.citation?.row_number || "N/A"}
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-mono font-medium",
                                    field.confidence >= 0.95
                                      ? "text-emerald-700"
                                      : field.confidence >= 0.85
                                      ? "text-amber-700"
                                      : "text-rose-700"
                                  )}
                                >
                                  {Math.round(field.confidence * 100)}% Conf
                                </span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {field.status === "PROPOSED" && (
                                <span className="rounded bg-amber-100 text-amber-900 px-2 py-0.5 text-[11px] font-semibold">
                                  Proposed
                                </span>
                              )}
                              {field.status === "ACCEPTED" && (
                                <span className="rounded bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Accepted
                                </span>
                              )}
                              {field.status === "EDITED" && (
                                <span className="rounded bg-primary-subtle text-primary px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1">
                                  <Edit3 className="h-3 w-3" /> Edited
                                </span>
                              )}
                              {field.status === "REJECTED" && (
                                <span className="rounded bg-rose-100 text-rose-900 px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1">
                                  <XCircle className="h-3 w-3" /> Rejected
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Raw and Normalized Values */}
                          <div className="mt-3 bg-subtle/50 p-2.5 rounded border border-border/60 text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-text-muted text-[11px]">OCR Text:</span>
                              <span className="font-mono text-text-primary text-right font-medium max-w-[240px] truncate" title={field.raw_value}>
                                {field.raw_value}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-border/40 pt-1">
                              <span className="text-text-muted text-[11px]">Normalized Value:</span>
                              <span className="font-mono font-bold text-text-primary text-right text-primary">
                                {field.normalized_value}
                              </span>
                            </div>
                          </div>

                          {field.decision_rationale && (
                            <div className="mt-2 text-[11px] text-text-secondary bg-surface p-1.5 rounded border border-border italic">
                              &quot;{field.decision_rationale}&quot;
                            </div>
                          )}

                          {/* Inline Edit Form */}
                          {isEditing && (
                            <div className="mt-3 p-3 bg-surface border border-primary rounded space-y-2 text-xs">
                              <div>
                                <label className="block text-[11px] font-semibold text-text-primary mb-1">
                                  Corrected Normalized Value:
                                </label>
                                <input
                                  type="text"
                                  value={editedValue}
                                  onChange={(e) => setEditedValue(e.target.value)}
                                  className="w-full rounded border border-border px-2 py-1 text-xs font-mono text-text-primary focus-visible:outline-primary"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-text-primary mb-1">
                                  Rationale for Modification:
                                </label>
                                <input
                                  type="text"
                                  value={editRationale}
                                  onChange={(e) => setEditRationale(e.target.value)}
                                  placeholder="e.g. Corrected decimal point based on Schedule B"
                                  className="w-full rounded border border-border px-2 py-1 text-xs text-text-primary focus-visible:outline-primary"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingFieldId(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    saveEdit(field.id);
                                  }}
                                  isLoading={decideMutation.isPending}
                                >
                                  Save Correction
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Inline Reject Form */}
                          {isRejecting && (
                            <div className="mt-3 p-3 bg-rose-50/60 border border-rose-300 rounded space-y-2 text-xs">
                              <div>
                                <label className="block text-[11px] font-semibold text-rose-900 mb-1">
                                  Reason for Rejection:
                                </label>
                                <input
                                  type="text"
                                  value={rejectRationale}
                                  onChange={(e) => setRejectRationale(e.target.value)}
                                  placeholder="e.g. Outdated schedule; superseded by CO-02"
                                  className="w-full rounded border border-rose-200 px-2 py-1 text-xs text-rose-950 focus-visible:outline-rose-500"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRejectingFieldId(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    submitReject(field.id);
                                  }}
                                  isLoading={decideMutation.isPending}
                                >
                                  Confirm Rejection
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Decision Action Buttons */}
                          {!isEditing && !isRejecting && (
                            <div className="mt-3 pt-2 border-t border-border flex items-center justify-end gap-1.5">
                              {field.status !== "ACCEPTED" && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    decideMutation.mutate({
                                      fieldId: field.id,
                                      decision: "ACCEPT",
                                      rationale: "Accepted proposal from OCR extraction",
                                    });
                                  }}
                                  className="flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Accept
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(field);
                                }}
                                className="flex items-center gap-1 rounded bg-subtle px-2.5 py-1 text-xs font-medium text-text-primary hover:bg-border transition-colors"
                              >
                                <Edit3 className="h-3.5 w-3.5 text-text-secondary" />
                                Edit
                              </button>
                              {field.status !== "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startReject(field);
                                  }}
                                  className="flex items-center gap-1 rounded bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </DrawerBody>

        {/* Drawer Footer */}
        <DrawerFooter className="flex items-center justify-between border-t border-border px-6 py-3.5 bg-subtle/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => acceptAllMutation.mutate()}
              isLoading={acceptAllMutation.isPending}
              disabled={proposedCount === 0}
            >
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Accept All Proposed ({proposedCount})
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => completeReviewMutation.mutate()}
              isLoading={completeReviewMutation.isPending}
            >
              <FileCheck className="h-4 w-4 mr-1.5" />
              Complete Human Review & Publish
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
