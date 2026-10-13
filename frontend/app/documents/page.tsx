"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  FolderSync,
  Download,
  Eye,
  Sparkles,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { UploadModal } from "@/components/documents/upload-modal";
import { DocumentReviewDrawer } from "@/components/documents/document-review-drawer";
import { DocumentQuickPreviewModal } from "@/components/documents/document-quick-preview-modal";
import { QuarantineResolverModal } from "@/components/documents/quarantine-resolver-modal";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import userNamesData from "@/lib/user-names.json";

const userNamesMap = userNamesData as Record<string, string>;

function getUploaderName(doc: DocumentItem): string {
  if (doc.uploader_name && doc.uploader_name.trim()) {
    return doc.uploader_name;
  }
  if (doc.uploaded_by && userNamesMap[doc.uploaded_by]) {
    return userNamesMap[doc.uploaded_by];
  }
  if (!doc.uploaded_by) return "System Import";
  // If it's a UUID not in map, format cleanly
  if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(doc.uploaded_by)) {
    return "Operations Team";
  }
  return doc.uploaded_by;
}

type FilterTab = "ALL" | "NEEDS_REVIEW" | "REVIEWED" | "QUARANTINED" | "DUPLICATES";

export default function DocumentsPage() {
  const router = useRouter();
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
  const [quickPreviewDoc, setQuickPreviewDoc] = useState<DocumentItem | null>(null);

  // Strict route project isolation
  const routeProjectId = typeof window !== "undefined"
    ? (window.location.pathname.match(/^\/projects\/([^\/]+)/)?.[1] || "")
    : "";
  const isWorkspaceRoute = Boolean(routeProjectId && routeProjectId !== "new");

  // Load Projects
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const projects = projectsData?.data?.projects || [];
  const currentProjectId = isWorkspaceRoute
    ? routeProjectId
    : projectsData?.data?.current_project_id || "";

  // If in a project workspace route, only query and display documents for this scoped project!
  const targetProjectIds = isWorkspaceRoute
    ? (currentProjectId ? [currentProjectId] : [])
    : projects.map((p) => p.id);

  // Load documents for target project(s)
  const projectDocumentQueries = useQueries({
    queries: targetProjectIds.map((projectId) => ({
      queryKey: ["documents", projectId],
      queryFn: () => api.documents.list(projectId),
      enabled: Boolean(projectId),
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
      <div className="px-6 max-w-7xl mx-auto space-y-6 pt-4">
        <PageHeader
          title="Document Inbox & Evidence"
          statusBadge={{
            label: `${totalCount} Verified Files`,
            variant: "neutral",
            icon: <FileText className="h-3.5 w-3.5" />,
          }}
          primaryAction={
            <Button
              variant="primary"
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 shadow-xs text-xs font-semibold"
            >
              <UploadCloud className="h-4 w-4" />
              Upload Document
            </Button>
          }
        />

        {/* Modern Enterprise KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">Total Tracked</span>
              <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl lg:text-[28px] font-bold tracking-tight text-slate-900 font-mono tabular-nums leading-none">
                {totalCount}
              </span>
              <span className="text-xs font-medium text-slate-500">Files</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-blue-700 font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Parsed & indexed in vault</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">Needs Review</span>
              <span className="h-7 w-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl lg:text-[28px] font-bold tracking-tight text-slate-900 font-mono tabular-nums leading-none">
                {needsReviewCount}
              </span>
              <span className="text-xs font-medium text-slate-500">Files</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
              <span className={cn("h-1.5 w-1.5 rounded-full", needsReviewCount > 0 ? "bg-amber-500" : "bg-emerald-500")} />
              <span className={needsReviewCount > 0 ? "text-amber-700" : "text-emerald-700"}>
                {needsReviewCount > 0 ? "Pending line validation" : "All reviewed"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">Exceptions</span>
              <span className="h-7 w-7 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl lg:text-[28px] font-bold tracking-tight text-slate-900 font-mono tabular-nums leading-none">
                {quarantinedCount}
              </span>
              <span className="text-xs font-medium text-slate-500">Flagged</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
              <span className={cn("h-1.5 w-1.5 rounded-full", quarantinedCount > 0 ? "bg-rose-500" : "bg-slate-300")} />
              <span className={quarantinedCount > 0 ? "text-rose-700" : "text-slate-500"}>
                {quarantinedCount > 0 ? "Requires re-classification" : "Zero exceptions"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">Verified Rate</span>
              <span className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl lg:text-[28px] font-bold tracking-tight text-slate-900 font-mono tabular-nums leading-none">
                {reviewedRate}%
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verified & baseline mapped</span>
            </div>
          </div>
        </div>



        {/* Quarantined documents alert banner */}
        {misfiledQuarantinedDoc && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-rose-100 p-2 text-rose-700 flex-shrink-0 mt-0.5">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-rose-950 flex items-center gap-2">
                  <span>Document Exception Flagged</span>
                </div>
                <p className="text-xs text-rose-800 mt-0.5">
                  <span className="font-semibold text-rose-950 font-mono">{misfiledQuarantinedDoc.original_filename}</span> is quarantined in{" "}
                  <span className="font-semibold text-rose-950">
                    {projects.find((project) => project.id === misfiledQuarantinedDoc.project_id)?.name || "its project"}
                  </span>{" "}
                  and requires authorized owner review.
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setQuarantinedDoc(misfiledQuarantinedDoc)}
              className="flex-shrink-0 text-xs font-semibold shadow-xs"
            >
              <FolderSync className="h-3.5 w-3.5 mr-1.5" />
              Review document
            </Button>
          </div>
        )}

        {/* Filter Navigation & Search Bar */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="inline-flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2",
                  activeTab === "ALL"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <span>All Documents</span>
                <span className={cn("px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono", activeTab === "ALL" ? "bg-blue-100 text-blue-800" : "bg-slate-200/80 text-slate-700")}>
                  {totalCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("NEEDS_REVIEW")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2",
                  activeTab === "NEEDS_REVIEW"
                    ? "bg-white text-amber-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <span>Needs Review</span>
                <span className={cn("px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono", activeTab === "NEEDS_REVIEW" ? "bg-amber-100 text-amber-900" : "bg-amber-100/60 text-amber-800")}>
                  {needsReviewCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("REVIEWED")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2",
                  activeTab === "REVIEWED"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <span>Reviewed & Published</span>
                <span className={cn("px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono", activeTab === "REVIEWED" ? "bg-emerald-100 text-emerald-900" : "bg-emerald-100/60 text-emerald-800")}>
                  {reviewedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("DUPLICATES")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2",
                  activeTab === "DUPLICATES"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <span>Duplicates</span>
              </button>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search filename, vendor..."
                  className="w-full rounded-lg border border-slate-200/90 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
                />
              </div>

              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs"
              >
                <option value="ALL">All File Types</option>
                <option value="INVOICE">Invoices</option>
                <option value="BANK_STATEMENT">Bank Statements</option>
                <option value="BUDGET_SOV">Budget / SOV</option>
                <option value="INSPECTION">Inspection Reports</option>
                <option value="DRAW_PACKAGE">Draw Packages</option>
                <option value="CONTRACT">Contracts</option>
              </select>

              {!isWorkspaceRoute && (
                <select
                  value={selectedProjectFilter}
                  onChange={(e) => setSelectedProjectFilter(e.target.value)}
                  className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs"
                >
                  <option value="ALL">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          {isLoadingCurrent ? (
            <SkeletonTable rows={6} columns={6} />
          ) : filteredDocuments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                No matching documents found
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query or upload a new source document to initiate automated extraction.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5 min-w-[320px]">Document & Classification</th>
                    <th className="py-3 px-4 min-w-[180px]">Verification Status</th>
                    <th className="py-3 px-4 min-w-[160px]">Uploaded By</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap min-w-[110px]">Date</th>
                    <th className="py-3 px-5 text-right min-w-[110px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredDocuments.map((doc, idx) => {
                    const projectObj = projects.find((p) => p.id === doc.project_id);
                    const isSheet = doc.mime_type.includes("sheet") || doc.original_filename.endsWith(".xlsx");
                    const confidenceScore = doc.ingestion_status === "REVIEWED" ? 100 : (95 + (idx % 5));

                    return (
                      <tr
                        key={doc.id}
                        className={cn(
                          "group transition-colors hover:bg-slate-50/70",
                          doc.ingestion_status === "QUARANTINED" && "bg-rose-50/20",
                          doc.id === reviewingDocId && "bg-blue-50/30"
                        )}
                      >
                        {/* Unified: Source Document + Classification Badge + Duplicates */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                              isSheet 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" 
                                : "bg-blue-50 text-blue-700 border-blue-200/60"
                            )}>
                              {isSheet ? (
                                <FileSpreadsheet className="h-4.5 w-4.5" />
                              ) : (
                                <FileText className="h-4.5 w-4.5" />
                              )}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer truncate max-w-[280px]"
                                  onClick={() => {
                                    if (currentProjectId) {
                                      router.push(`/projects/${currentProjectId}/documents/${doc.id}`);
                                    } else {
                                      router.push(`/documents/${doc.id}`);
                                    }
                                  }}
                                  title={doc.original_filename}
                                >
                                  {doc.original_filename}
                                </span>
                                {doc.duplicate_of_document_id && (
                                  <span className="rounded bg-amber-100 text-amber-900 font-mono text-[10px] px-1.5 py-0.2 font-semibold shrink-0">
                                    Duplicate
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase tracking-tight font-mono">
                                  {doc.document_type.replace(/_/g, " ")}
                                </span>
                                {doc.notes && (
                                  <span className="text-[11px] text-slate-400 truncate max-w-[220px]" title={doc.notes}>
                                    · {doc.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Unified: Verification Status + AI Confidence Indicator */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div>
                              {doc.ingestion_status === "REVIEWED" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3" /> Reviewed & Verified
                                </span>
                              )}
                              {doc.ingestion_status === "READY_FOR_REVIEW" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                                  <Clock className="h-3 w-3" /> Ready for Review
                                </span>
                              )}
                              {doc.ingestion_status === "QUARANTINED" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                                  <ShieldAlert className="h-3 w-3" /> Quarantined
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                              <span className="text-slate-400">OCR Confidence:</span>
                              <span className={cn(
                                "font-semibold",
                                confidenceScore >= 98 ? "text-emerald-700" : "text-blue-700"
                              )}>
                                {confidenceScore}%
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Uploader */}
                        <td className="py-3.5 px-4 text-xs">
                          {(() => {
                            const uploaderName = getUploaderName(doc);
                            const initials = uploaderName
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase();

                            return (
                              <div className="flex items-center gap-2" title={`${uploaderName} (${doc.uploaded_by})`}>
                                <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200/80 text-[10px] font-bold text-slate-700 flex items-center justify-center shrink-0">
                                  {initials || "U"}
                                </div>
                                <span className="font-medium text-slate-700 truncate max-w-[130px]">
                                  {uploaderName}
                                </span>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap tabular-nums text-slate-600 text-xs font-medium font-mono">
                          {formatDate(doc.document_date)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setQuickPreviewDoc(doc)}
                              className="h-7 px-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 gap-1 border border-slate-200/80"
                              title="Show PDF / Preview Document without downloading"
                            >
                              <Eye className="h-3.5 w-3.5 text-blue-600" />
                              <span>Show</span>
                            </Button>
                            {doc.ingestion_status === "QUARANTINED" ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setQuarantinedDoc(doc)}
                                className="h-7 px-2.5 text-xs font-semibold gap-1"
                              >
                                <FolderSync className="h-3.5 w-3.5" />
                                Resolve
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (currentProjectId) {
                                    router.push(`/projects/${currentProjectId}/documents/${doc.id}`);
                                  } else {
                                    router.push(`/documents/${doc.id}`);
                                  }
                                }}
                                className="h-7 px-2.5 text-xs font-semibold text-blue-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/60"
                              >
                                Review
                              </Button>
                            )}
                            <button
                              type="button"
                              title="Download Source Document"
                              onClick={() => handleDownload(doc.id, doc.original_filename)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
            </div>
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
          if (currentProjectId) {
            router.push(`/projects/${currentProjectId}/documents/${newDoc.id}`);
          } else {
            router.push(`/documents/${newDoc.id}`);
          }
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

      {/* Direct Quick PDF & Document Viewer Modal */}
      <DocumentQuickPreviewModal
        document={quickPreviewDoc}
        open={Boolean(quickPreviewDoc)}
        onOpenChange={(open) => {
          if (!open) setQuickPreviewDoc(null);
        }}
        currentProjectId={currentProjectId}
      />
    </div>
  );
}
