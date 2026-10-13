"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DocumentItem, ExtractionField } from "@/lib/types";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Edit3,
  Sparkles,
  CheckCheck,
  FileCheck,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  FileText,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function DocumentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const projectId = (params?.projectId as string) || "";
  const documentId = (params?.documentId as string) || "";

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const [rejectingFieldId, setRejectingFieldId] = useState<string | null>(null);
  const [rejectRationale, setRejectRationale] = useState("");

  const { data: docData, isLoading: isLoadingDoc } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => (documentId ? api.documents.getById(documentId) : Promise.reject(new Error("No ID"))),
    enabled: Boolean(documentId),
  });

  const { data: extractionsData, isLoading: isLoadingExtractions } = useQuery({
    queryKey: ["document-extractions", documentId],
    queryFn: () => (documentId ? api.documents.getExtractions(documentId) : Promise.reject(new Error("No ID"))),
    enabled: Boolean(documentId),
  });

  const document: DocumentItem | undefined = docData?.data;
  const extractions: ExtractionField[] = extractionsData?.data || [];

  const decideMutation = useMutation({
    mutationFn: ({
      fieldId,
      decision,
      normalizedValue,
      rationale,
    }: {
      fieldId: string;
      decision: "ACCEPT" | "REJECT" | "EDIT";
      normalizedValue?: string;
      rationale?: string;
    }) =>
      api.documents.decideExtractionField(
        fieldId,
        decision,
        normalizedValue,
        rationale
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-extractions", documentId] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setEditingFieldId(null);
      setRejectingFieldId(null);
      setEditedValue("");
      setEditRationale("");
      setRejectRationale("");
      toast({
        title: "Extraction updated",
        description: "Your decision has been recorded.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Action failed",
        description: "Failed to record decision. Please retry.",
        variant: "destructive",
      });
    },
  });

  const acceptAllMutation = useMutation({
    mutationFn: () => api.documents.acceptAllExtractions(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-extractions", documentId] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "All proposed fields accepted",
        description: "Batch validation complete.",
        variant: "default",
      });
    },
  });

  const completeReviewMutation = useMutation({
    mutationFn: () => api.documents.completeReview(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast({
        title: "Review completed",
        description: "Document certified as immutable project evidence.",
        variant: "default",
      });
      handleBack();
    },
  });

  const handleBack = () => {
    if (projectId) {
      router.push(`/projects/${projectId}/documents`);
    } else {
      router.push("/documents");
    }
  };

  const totalFields = extractions.length;
  const acceptedCount = extractions.filter((e) => e.status === "ACCEPTED" || e.status === "EDITED").length;
  const proposedCount = extractions.filter((e) => e.status === "PROPOSED").length;
  const avgConfidence = totalFields > 0
    ? Math.round((extractions.reduce((acc, e) => acc + e.confidence, 0) / totalFields) * 100)
    : 95;

  if (isLoadingDoc || !document) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading document workbench...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Documents</span>
          </Button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2 truncate">
            <span className="rounded bg-blue-50 text-blue-700 border border-blue-200/70 font-mono px-2 py-0.5 text-[10px] font-bold tracking-tight shrink-0">
              OCR REVIEW WORKBENCH
            </span>
            <span className="text-sm font-bold text-slate-900 truncate">
              {document.original_filename}
            </span>
            <StatusBadge
              status={
                document.ingestion_status === "REVIEWED"
                  ? "verified"
                  : document.ingestion_status === "QUARANTINED"
                  ? "blocked"
                  : "under_review"
              }
            />
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80 text-xs">
            <div className="text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight block">Confidence</span>
              <span className="font-bold text-emerald-600 font-mono text-xs">{avgConfidence}%</span>
            </div>
            <div className="h-5 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight block">Pending</span>
              <span className="font-bold text-amber-600 font-mono text-xs">{proposedCount}</span>
            </div>
            <div className="h-5 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight block">Verified</span>
              <span className="font-bold text-blue-600 font-mono text-xs">{acceptedCount} / {totalFields}</span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => acceptAllMutation.mutate()}
            isLoading={acceptAllMutation.isPending}
            disabled={proposedCount === 0}
            className="h-8.5 px-3 text-xs font-semibold shadow-2xs"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            Accept All ({proposedCount})
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => completeReviewMutation.mutate()}
            isLoading={completeReviewMutation.isPending}
            className="h-8.5 px-3.5 text-xs font-semibold shadow-xs"
          >
            <FileCheck className="h-3.5 w-3.5 mr-1" />
            Complete & Publish
          </Button>
        </div>
      </header>

      {/* Main Workspace Body - 2 Columns */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left: Document Viewer (65% width) */}
        <div className="flex-1 h-full p-4 overflow-hidden border-r border-slate-200/80 bg-slate-900 flex flex-col">
          <DocumentViewer
            document={document}
            extractions={extractions}
            selectedFieldId={selectedFieldId}
            onSelectField={(id) => setSelectedFieldId(id)}
          />
        </div>

        {/* Right: Extractions Inspector (35% width, max 480px) */}
        <div className="w-full md:w-[460px] h-full flex flex-col bg-white overflow-hidden shrink-0">
          {/* Header Bar */}
          <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Extraction Queue ({extractions.length} fields)
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                {acceptedCount} of {totalFields} verified
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${totalFields > 0 ? (acceptedCount / totalFields) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* List of Fields */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {extractions.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <div className="font-bold text-slate-700">No automated extraction fields</div>
                <p className="mt-1 max-w-xs mx-auto">This file type is indexed as supporting project evidence without parsed structured fields.</p>
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
                      "rounded-xl border p-3.5 transition-all text-xs relative",
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50/20 shadow-xs"
                        : "border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs",
                      field.status === "ACCEPTED" && "border-emerald-200 bg-emerald-50/20",
                      field.status === "REJECTED" && "border-rose-200 bg-rose-50/20 opacity-70"
                    )}
                  >
                    {/* Field Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {field.field_name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 font-semibold">
                            Page {field.citation?.page_number || 1}, Row {field.citation?.row_number || "N/A"}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold font-mono",
                              field.confidence >= 0.95
                                ? "text-emerald-700"
                                : field.confidence >= 0.8
                                ? "text-blue-700"
                                : "text-amber-700"
                            )}
                          >
                            {Math.round(field.confidence * 100)}% OCR
                          </span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {field.status === "ACCEPTED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Accepted
                          </span>
                        )}
                        {field.status === "EDITED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                            <Edit3 className="h-3 w-3" /> Corrected
                          </span>
                        )}
                        {field.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100/80 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                            <XCircle className="h-3 w-3" /> Rejected
                          </span>
                        )}
                        {field.status === "PROPOSED" && (
                          <span className="inline-flex items-center rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Pending Review
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Value Display */}
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200/60 font-mono text-xs font-semibold text-slate-800">
                      {field.normalized_value || field.raw_value}
                    </div>

                    {/* Review Actions */}
                    {field.status === "PROPOSED" && !isEditing && !isRejecting && (
                      <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRejectingFieldId(field.id);
                          }}
                          className="h-7 px-2 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 rounded-md"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFieldId(field.id);
                            setEditedValue(field.normalized_value || field.raw_value);
                          }}
                          className="h-7 px-2 text-[11px] font-semibold text-slate-700 rounded-md"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            decideMutation.mutate({
                              fieldId: field.id,
                              decision: "ACCEPT",
                            });
                          }}
                          className="h-7 px-2.5 text-[11px] font-semibold rounded-md"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                      </div>
                    )}

                    {/* Inline Edit Form */}
                    {isEditing && (
                      <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[11px] font-bold text-slate-700 block">Correct Value</label>
                        <input
                          type="text"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                          className="w-full rounded-md border border-slate-200 p-1.5 text-xs font-mono font-medium focus:border-blue-600 focus:outline-hidden"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingFieldId(null)}
                            className="h-6 px-2 text-[10px]"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              decideMutation.mutate({
                                fieldId: field.id,
                                decision: "EDIT",
                                normalizedValue: editedValue,
                                rationale: editRationale || "Human correction",
                              });
                            }}
                            className="h-6 px-2 text-[10px]"
                          >
                            Save Correction
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Inline Reject Form */}
                    {isRejecting && (
                      <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[11px] font-bold text-rose-700 block">Rejection Reason</label>
                        <input
                          type="text"
                          placeholder="e.g., Unverified figure, disputed rate, line item duplicate"
                          value={rejectRationale}
                          onChange={(e) => setRejectRationale(e.target.value)}
                          className="w-full rounded-md border border-rose-200 p-1.5 text-xs font-medium focus:border-rose-600 focus:outline-hidden"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRejectingFieldId(null)}
                            className="h-6 px-2 text-[10px]"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              decideMutation.mutate({
                                fieldId: field.id,
                                decision: "REJECT",
                                rationale: rejectRationale || "Rejected by reviewer",
                              });
                            }}
                            className="h-6 px-2 text-[10px]"
                          >
                            Confirm Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
