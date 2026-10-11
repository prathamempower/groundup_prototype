"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { DocumentItem, ExtractionField } from "@/lib/types";

interface DocumentViewerProps {
  document: DocumentItem;
  extractions?: ExtractionField[];
  selectedFieldId?: string | null;
  onSelectField?: (fieldId: string) => void;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const download = useQuery({
    queryKey: ["document-download", document.id],
    queryFn: () => api.documents.getDownloadUrl(document.id),
    retry: false,
  });
  const url = download.data?.data.download_url;
  const isPdf = document.mime_type.toLowerCase().includes("pdf");
  const isImage = document.mime_type.toLowerCase().startsWith("image/");

  return (
    <section className="flex h-full min-h-[480px] flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <header className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="flex min-w-0 items-center gap-2 text-sm text-text-primary">
          <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate font-medium" title={document.original_filename}>
            {document.original_filename}
          </span>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Open original
          </a>
        )}
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-subtle p-4">
        {download.isLoading ? (
          <div className="h-full min-h-64 w-full animate-pulse rounded-md bg-border/50" aria-label="Loading document preview" />
        ) : download.error ? (
          <p role="alert" className="max-w-md text-center text-sm text-danger">
            The original document could not be loaded. Try again or contact your organization administrator.
          </p>
        ) : url && isPdf ? (
          <iframe title={`Preview of ${document.original_filename}`} src={url} className="h-full min-h-[560px] w-full rounded-md bg-white" />
        ) : url && isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={document.original_filename} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="max-w-md text-center">
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
