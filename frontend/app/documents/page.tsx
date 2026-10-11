"use client";

import React, { useState } from "react";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DocumentItem, Project } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { KeyFigure } from "@/components/ui/key-figure";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  ExternalLink,
  Edit,
  FolderSync,
  Download,
  Sparkles,
  AlertCircle,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { UploadModal } from "@/components/documents/upload-modal";
import { DocumentReviewDrawer } from "@/components/documents/document-review-drawer";
import { QuarantineResolverModal } from "@/components/documents/quarantine-resolver-modal";
import { ManualEntryModal } from "@/components/documents/manual-entry-modal";

type FilterTab = "ALL" | "NEEDS_REVIEW" | "REVIEWED" | "QUARANTINED" | "DUPLICATES";

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>("ALL");

  // Modal & Drawer states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reviewingDocId, setReviewingDocId] = useState<string | null>(null);
  const [quarantinedDoc, setQuarantinedDoc] = useState<DocumentItem | null>(null);
  const [manualEntryDoc, setManualEntryDoc] = useState<DocumentItem | null>(null);

  // Load Projects
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const projects = projectsData?.data?.projects || [];
  const currentProjectId = projectsData?.data?.current_project_id || "";

  // Load documents for current project & portfolio
  const projectDocumentQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["documents", project.id],
      queryFn: () => api.documents.list(project.id),
      enabled: Boolean(project.id),
    })),
  });

  const isLoadingCurrent = projectDocumentQueries.some((query) => query.isLoading);
  const allDocuments = projectDocumentQueries.flatMap((query) => query.data?.data || []);

  // Filtered list
  const filteredDocuments = allDocuments.filter((doc) => {
    // Project filter
    if (selectedProjectFilter !== "ALL" && doc.project_id !== selectedProjectFilter) {
      return false;
    }

    // Type filter
    if (selectedTypeFilter !== "ALL" && doc.document_type !== selectedTypeFilter) {
      return false;
    }

    // Search term
    if (
      searchTerm &&
      !doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !doc.uploaded_by.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(doc.notes && doc.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }

    // Tab filter
    if (activeTab === "NEEDS_REVIEW") {
      return doc.ingestion_status === "READY_FOR_REVIEW";
    }
    if (activeTab === "REVIEWED") {
      return doc.ingestion_status === "REVIEWED";
    }
    if (activeTab === "QUARANTINED") {
      return doc.ingestion_status === "QUARANTINED";
    }
    if (activeTab === "DUPLICATES") {
      return !!doc.duplicate_of_document_id;
    }

    return true;
  });

  // Metrics computation
  const totalCount = allDocuments.length;
  const needsReviewCount = allDocuments.filter((d) => d.ingestion_status === "READY_FOR_REVIEW").length;
  const reviewedCount = allDocuments.filter((d) => d.ingestion_status === "REVIEWED").length;
  const quarantinedCount = allDocuments.filter((d) => d.ingestion_status === "QUARANTINED").length;
  const reviewedRate = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;

  // Find any misfiled quarantine document for the prominent alert banner
  const misfiledQuarantinedDoc = allDocuments.find((d) => d.ingestion_status === "QUARANTINED");

  const handleDownload = async (docId: string, filename: string) => {
    try {
      const res = await api.documents.getDownloadUrl(docId);
      toast({
        title: "Download started",
        description: `${filename} is being downloaded.`,
      });
      const link = document.createElement("a");
      link.href = res.data.download_url;
      link.setAttribute("download", filename);
      link.click();
    } catch (err: unknown) {
      toast({
        title: "Download Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Document Inbox & Evidence"
        statusBadge={{
          label: `${totalCount} Verified Files`,
          variant: "neutral",
          icon: <FileText className="h-3.5 w-3.5" />,
        }}
        description="Centralized repository for invoices, bank statements, draw packages, and certified inspection reports with AI layout extraction"
        primaryAction={
          <Button
            variant="primary"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Document
          </Button>
        }
      />

      <div className="px-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KeyFigure
            label="Total Files Tracked"
            value={`${totalCount} Files`}
            basis="All active, pre-construction, and closed projects"
          />
          <KeyFigure
            label="Needs Human Review"
            value={`${needsReviewCount} Files`}
            basis="Pending OCR extraction and validation decisions"
          />
          <KeyFigure
            label="Quarantined / Exceptions"
            value={`${quarantinedCount} Exception`}
            basis="Documents flagged for follow-up in this organization"
          />
          <KeyFigure
            label="Human Verified Rate"
            value={`${reviewedRate}%`}
            basis={`${reviewedCount} of ${totalCount} source files verified & published`}
          />
        </div>

        {/* Quarantined documents need an explicit owner review. */}
        {misfiledQuarantinedDoc && (
          <div className="rounded-lg border border-danger-border bg-danger-subtle/50 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-danger-subtle p-2 text-danger flex-shrink-0 mt-0.5">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <div className="text-body font-bold text-danger-text flex items-center gap-2">
                  <span>Document needs review</span>
                </div>
                <p className="text-caption text-text-secondary mt-0.5">
                  <span className="font-semibold text-text-primary font-mono">{misfiledQuarantinedDoc.original_filename}</span> was
                  is quarantined in{" "}
                  <span className="font-semibold text-text-primary">
                    {projects.find((project) => project.id === misfiledQuarantinedDoc.project_id)?.name || "its project"}
                  </span>{" "}
                  and needs an authorized reviewer to resolve it.
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setQuarantinedDoc(misfiledQuarantinedDoc)}
              className="flex-shrink-0"
            >
              <FolderSync className="h-4 w-4 mr-1.5" />
              Review document
            </Button>
          </div>
        )}

        {/* Filter Navigation & Search Bar */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-caption font-semibold transition-all flex items-center gap-1.5",
                  activeTab === "ALL"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-secondary hover:bg-subtle hover:text-text-primary"
                )}
              >
                All Documents
                <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", activeTab === "ALL" ? "bg-white/20 text-white" : "bg-subtle text-text-muted")}>
                  {totalCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("NEEDS_REVIEW")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-caption font-semibold transition-all flex items-center gap-1.5",
                  activeTab === "NEEDS_REVIEW"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-secondary hover:bg-subtle hover:text-text-primary"
                )}
              >
                Needs Review
                <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", activeTab === "NEEDS_REVIEW" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900 font-bold")}>
                  {needsReviewCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("REVIEWED")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-caption font-semibold transition-all flex items-center gap-1.5",
                  activeTab === "REVIEWED"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-secondary hover:bg-subtle hover:text-text-primary"
                )}
              >
                Reviewed & Published
                <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", activeTab === "REVIEWED" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-900 font-bold")}>
                  {reviewedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("QUARANTINED")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-caption font-semibold transition-all flex items-center gap-1.5",
                  activeTab === "QUARANTINED"
                    ? "bg-danger text-white shadow-xs"
                    : "text-text-secondary hover:bg-subtle hover:text-text-primary"
                )}
              >
                Quarantined
                {quarantinedCount > 0 && (
                  <span className={cn("px-1.5 py-0.2 rounded-full text-[10px]", activeTab === "QUARANTINED" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-900 font-bold")}>
                    {quarantinedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("DUPLICATES")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-caption font-semibold transition-all flex items-center gap-1.5",
                  activeTab === "DUPLICATES"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-secondary hover:bg-subtle hover:text-text-primary"
                )}
              >
                Duplicates
              </button>
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center gap-2">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-caption font-medium text-text-primary focus-visible:outline-primary"
              >
                <option value="ALL">All File Types</option>
                <option value="INVOICE">Invoices</option>
                <option value="BANK_STATEMENT">Bank Statements</option>
                <option value="BUDGET_SOV">Budget / SOV</option>
                <option value="INSPECTION">Inspection Reports</option>
                <option value="DRAW_PACKAGE">Draw Packages</option>
                <option value="CONTRACT">Contracts</option>
              </select>

              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-caption font-medium text-text-primary focus-visible:outline-primary"
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search filename, vendor, uploader, or notes..."
              className="w-full rounded-md border border-border bg-surface pl-9 pr-3 py-1.5 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-primary"
            />
          </div>
        </div>

        {/* Documents Table */}
        <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
          {isLoadingCurrent ? (
            <div className="p-12 text-center text-body text-text-muted">
              Loading document index and extraction state...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-8 w-8 text-text-muted" />
              <h3 className="mt-2 text-section font-semibold text-text-primary">
                No matching documents found
              </h3>
              <p className="mt-1 text-body text-text-secondary">
                Try adjusting your search filters or upload a new source document.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-body">
              <thead>
                <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
                  <th className="py-3 px-4">Source Document</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Ingestion Status</th>
                  <th className="py-3 px-4">Project Scope</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4 text-right">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocuments.map((doc) => {
                  const projectObj = projects.find((p) => p.id === doc.project_id);

                  return (
                    <tr
                      key={doc.id}
                      className={cn(
                        "hover:bg-subtle/30 transition-colors",
                        doc.ingestion_status === "QUARANTINED" && "bg-danger-subtle/10",
                        doc.id === reviewingDocId && "bg-primary-subtle/10"
                      )}
                    >
                      {/* Name & Note */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          {doc.mime_type.includes("sheet") || doc.original_filename.endsWith(".xlsx") ? (
                            <FileSpreadsheet className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary hover:text-primary transition-colors cursor-pointer" onClick={() => setReviewingDocId(doc.id)}>
                                {doc.original_filename}
                              </span>
                              {doc.duplicate_of_document_id && (
                                <span className="rounded bg-amber-100 text-amber-900 font-mono text-[10px] px-1.5 py-0.2 font-semibold">
                                  Duplicate
                                </span>
                              )}
                            </div>
                            {doc.notes && (
                              <div className="text-caption text-text-muted line-clamp-1 mt-0.5">
                                {doc.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Classification Badge */}
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-subtle px-2 py-0.5 font-mono text-caption font-medium text-text-secondary">
                          {doc.document_type.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {doc.ingestion_status === "REVIEWED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-[11px] font-semibold text-success">
                            <CheckCircle2 className="h-3 w-3" /> Reviewed
                          </span>
                        )}
                        {doc.ingestion_status === "READY_FOR_REVIEW" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 text-[11px] font-semibold text-warning animate-pulse">
                            <Clock className="h-3 w-3" /> Ready for Review
                          </span>
                        )}
                        {doc.ingestion_status === "QUARANTINED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-danger-subtle px-2.5 py-0.5 text-[11px] font-semibold text-danger">
                            <ShieldAlert className="h-3 w-3" /> Quarantined
                          </span>
                        )}
                      </td>

                      {/* Project Scope */}
                      <td className="py-3.5 px-4">
                        <span className="text-caption text-text-secondary font-medium">
                          {projectObj?.name || "Unassigned"}
                        </span>
                      </td>

                      {/* Uploader */}
                      <td className="py-3.5 px-4 text-text-secondary text-caption">
                        {doc.uploaded_by}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right tabular-nums text-text-secondary font-mono text-caption">
                        {formatDate(doc.document_date)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {doc.ingestion_status === "QUARANTINED" ? (
                            <button
                              type="button"
                              onClick={() => setQuarantinedDoc(doc)}
                              className="rounded bg-danger-subtle px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/20 transition-colors flex items-center gap-1"
                            >
                              <FolderSync className="h-3.5 w-3.5" />
                              Resolve
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setReviewingDocId(doc.id)}
                              className="rounded bg-primary-subtle px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Review
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setManualEntryDoc(doc)}
                            title="Manual Line Entry Fallback"
                            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-subtle transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(doc.id, doc.original_filename)}
                            title="Download Source Document"
                            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-subtle transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals & Slide-out Drawers */}
      <UploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        projects={projects}
        currentProjectId={currentProjectId}
        onUploadSuccess={(newDoc) => {
          setReviewingDocId(newDoc.id);
        }}
      />

      <DocumentReviewDrawer
        documentId={reviewingDocId}
        open={!!reviewingDocId}
        onOpenChange={(open) => {
          if (!open) setReviewingDocId(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["documents"] });
        }}
      />

      <QuarantineResolverModal
        document={quarantinedDoc}
        open={!!quarantinedDoc}
        onOpenChange={(open) => {
          if (!open) setQuarantinedDoc(null);
        }}
        projects={projects}
        onResolved={() => {
          queryClient.invalidateQueries({ queryKey: ["documents"] });
        }}
      />

      <ManualEntryModal
        document={manualEntryDoc}
        open={!!manualEntryDoc}
        onOpenChange={(open) => {
          if (!open) setManualEntryDoc(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["documents"] });
        }}
      />
    </div>
  );
}
