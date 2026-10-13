"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { DocumentItem } from "@/lib/types";
import { DocumentViewer } from "./document-viewer";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DocumentQuickPreviewModalProps {
  document: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProjectId?: string;
}

export function DocumentQuickPreviewModal({
  document,
  open,
  onOpenChange,
  currentProjectId,
}: DocumentQuickPreviewModalProps) {
  if (!document) return null;

  const targetProjectId = document.project_id || currentProjectId;
  const reviewHref = targetProjectId
    ? `/projects/${targetProjectId}/documents/${document.id}`
    : `/documents/${document.id}`;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="full" className="p-0 overflow-hidden flex flex-col h-[90vh] max-h-[92vh] rounded-2xl bg-white border border-slate-200/90 shadow-2xl">
        <ModalHeader className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-3.5 flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-50 text-blue-700 border border-blue-200/70 font-mono px-2 py-0.5 text-[10px] font-bold tracking-tight">
                  SOURCE DOCUMENT PREVIEW
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {document.document_type.replace(/_/g, " ")}
                </span>
              </div>
              <ModalTitle className="text-base font-bold text-slate-900 tracking-tight">
                {document.original_filename}
              </ModalTitle>
              <ModalDescription className="text-xs text-slate-500">
                Direct in-browser interactive inspection with full OCR citation overlay and zero forced download.
              </ModalDescription>
            </div>

            <div className="flex items-center gap-2">
              <Link href={reviewHref}>
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold h-8 gap-1.5 shadow-xs"
                >
                  <span>Open Review Workbench</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </ModalHeader>

        <div className="flex-1 p-3 overflow-hidden bg-slate-900 flex flex-col">
          <DocumentViewer document={document} />
        </div>
      </ModalContent>
    </Modal>
  );
}
