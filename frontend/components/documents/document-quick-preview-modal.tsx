"use client";

import React from "react";
import { Modal, ModalContent, ModalTitle, ModalDescription, ModalClose } from "@/components/ui/modal";
import { DocumentItem } from "@/lib/types";
import { DocumentViewer } from "./document-viewer";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
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
  const viewerHref = targetProjectId
    ? `/projects/${targetProjectId}/documents/${document.id}`
    : `/documents/${document.id}`;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        maxWidth="full"
        showCloseButton={false}
        className="p-0 overflow-hidden flex flex-col h-[90vh] max-h-[92vh] rounded-xl bg-white border border-slate-200/90 shadow-overlay"
      >
        <ModalTitle className="sr-only">
          {document.original_filename}
        </ModalTitle>
        <ModalDescription className="sr-only">
          {document.original_filename} preview
        </ModalDescription>

        <div className="flex-1 p-2 overflow-hidden bg-slate-100/60 flex flex-col">
          <DocumentViewer
            document={document}
            actions={
              <Link href={viewerHref}>
                <Button
                  variant="success"
                  size="sm"
                  className="h-8 px-3 gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Open Review Workbench</span>
                </Button>
              </Link>
            }
            trailingAction={
              <ModalClose
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer transition-colors"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </ModalClose>
            }
          />
        </div>
      </ModalContent>
    </Modal>
  );
}
