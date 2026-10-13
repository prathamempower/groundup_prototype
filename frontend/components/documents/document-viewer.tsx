"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, FileText, ExternalLink, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { DocumentItem, ExtractionField } from "@/lib/types";
import { SpreadsheetViewer } from "./spreadsheet-viewer";

interface DocumentViewerProps {
  document: DocumentItem;
  extractions?: ExtractionField[];
  selectedFieldId?: string | null;
  onSelectField?: (fieldId: string) => void;
}

export function DocumentViewer({ document, extractions, selectedFieldId }: DocumentViewerProps) {
  const download = useQuery({
    queryKey: ["document-download", document.id],
    queryFn: () => api.documents.getDownloadUrl(document.id),
    retry: false,
  });
  const rawUrl = download.data?.data.download_url;
  const baseUrl = rawUrl
    ? rawUrl.startsWith("http")
      ? rawUrl
      : `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"}${rawUrl.replace(/^\/api\/v1/, "")}`
    : undefined;
  
  // For viewing inline in iframe / new tab without triggering automatic download:
  const viewUrl = baseUrl ? `${baseUrl}?inline=true` : undefined;
  const downloadUrl = baseUrl ? `${baseUrl}?inline=false` : undefined;
  // Fallback direct static URL if it's one of the known sample documents
  const sampleUrl = `/sample-docs/${encodeURIComponent(document.original_filename)}`;
  const url = viewUrl || sampleUrl;
  const isPdf = document.mime_type.toLowerCase().includes("pdf") || document.original_filename.toLowerCase().endsWith(".pdf");
  const isImage = document.mime_type.toLowerCase().startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(document.original_filename);
  const isSpreadsheet =
    document.mime_type.includes("spreadsheet") ||
    document.mime_type.includes("excel") ||
    document.mime_type.includes("csv") ||
    /\.(xlsx|xls|csv)$/i.test(document.original_filename);

  const selectedField = extractions?.find((e) => e.id === selectedFieldId);

  return (
    <section className="flex h-full min-h-[480px] flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <header className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-4 py-2 bg-white">
        <div className="flex min-w-0 items-center gap-2 text-sm text-text-primary">
          <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate font-medium" title={document.original_filename}>
            {document.original_filename}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({document.document_type})
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <span>Open in tab</span>
            </a>
          )}
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={document.original_filename}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
              title="Download backup copy"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span className="hidden sm:inline">Save</span>
            </a>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden bg-slate-950">
        {download.isLoading ? (
          <div className="h-full min-h-64 w-full animate-pulse rounded-md bg-border/50" aria-label="Loading document preview" />
        ) : download.error ? (
          <div role="alert" className="m-auto max-w-md text-center text-sm text-danger p-6">
            The original document could not be loaded. Try again or contact your organization administrator.
          </div>
        ) : url && isSpreadsheet ? (
          <div className="w-full h-full">
            <SpreadsheetViewer
              url={url}
              filename={document.original_filename}
              highlightText={selectedField?.raw_value || selectedField?.normalized_value}
              selectedFieldCitation={selectedField?.citation}
            />
          </div>
        ) : url && isPdf ? (
          <iframe title={`Preview of ${document.original_filename}`} src={url} className="h-full min-h-[560px] w-full rounded-md bg-white border-0" />
        ) : url && isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={document.original_filename} className="m-auto max-h-full max-w-full object-contain p-4" />
        ) : (
          <div className="m-auto max-w-md text-center p-6 bg-white rounded-xl border border-slate-200">
            <FileText className="mx-auto h-8 w-8 text-text-muted" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-text-primary">Preview is not available for this file type.</p>
            <p className="mt-1 text-sm text-text-secondary">
              Open the original file to review its contents.
            </p>
            {url && (
              <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                <Download className="h-4 w-4" aria-hidden="true" />
                Open original document
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
