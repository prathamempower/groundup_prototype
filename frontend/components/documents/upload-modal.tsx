"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DocumentItem, Project } from "@/lib/types";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  currentProjectId: string;
  onUploadSuccess?: (createdDoc: DocumentItem) => void;
}

type UploadStep = "SELECT" | "UPLOADING" | "SCANNING" | "COMPLETE";

export function UploadModal({
  open,
  onOpenChange,
  projects,
  currentProjectId,
  onUploadSuccess,
}: UploadModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetProjectId, setTargetProjectId] = useState(currentProjectId);
  const [documentType, setDocumentType] = useState<DocumentItem["document_type"]>("INVOICE");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<UploadStep>("SELECT");
  const [progress, setProgress] = useState(0);
  const [createdDocument, setCreatedDocument] = useState<DocumentItem | null>(null);

  // Reset modal state when opened/closed
  React.useEffect(() => {
    if (open) {
      setStep("SELECT");
      setProgress(0);
      setSelectedFile(null);
      setTargetProjectId(currentProjectId);
      setNotes("");
      setCreatedDocument(null);
    }
  }, [open, currentProjectId]);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    // Auto-detect type from filename
    const name = file.name.toLowerCase();
    if (name.includes("statement") || name.includes("bank") || name.includes("stmt")) {
      setDocumentType("BANK_STATEMENT");
    } else if (name.includes("budget") || name.includes("sov") || name.includes("schedule")) {
      setDocumentType("BUDGET_SOV");
    } else if (name.includes("insp") || name.includes("report") || name.includes("walkthrough")) {
      setDocumentType("INSPECTION");
    } else if (name.includes("draw") || name.includes("packet") || name.includes("payapp")) {
      setDocumentType("DRAW_PACKAGE");
    } else {
      setDocumentType("INVOICE");
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setStep("UPLOADING");
    setProgress(15);

    try {
      setProgress(25);
      // Real direct multipart upload to backend API
      const res = await api.documents.uploadMultipart(
        selectedFile,
        selectedFile.name,
        targetProjectId || undefined
      );
      setProgress(85);

      setStep("SCANNING");
      setProgress(95);

      const doc = res.data;
      setCreatedDocument(doc);
      setProgress(100);
      setStep("COMPLETE");

      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document Ingested & Verified",
        description: `Successfully uploaded ${doc.original_filename}${doc.sha256 ? ` (${doc.sha256.substring(0, 10)}...)` : ""}.`,
      });
    } catch (err: unknown) {
      setStep("SELECT");
      toast({
        title: "Upload Failed",
        description: (err as Error).message || "An error occurred during upload.",
        variant: "destructive",
      });
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="lg" className="p-0 overflow-hidden">
        {/* Header */}
        <ModalHeader className="px-6 pt-6 pb-4 border-b border-border bg-subtle/30">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary-subtle p-1.5 text-primary">
              <UploadCloud className="h-5 w-5" />
            </span>
            <div>
              <ModalTitle className="text-section font-bold text-text-primary">
                Upload Source Document
              </ModalTitle>
              <ModalDescription className="text-caption text-text-secondary">
                Secure OCR ingestion for contractor invoices, certified draw packets, budgets, and bank statements.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {step === "SELECT" && (
            <>
              {/* Dropzone Area */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  selectedFile
                    ? "border-primary bg-primary-subtle/20"
                    : "border-border hover:border-primary/60 hover:bg-subtle/30"
                )}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".pdf,.xlsx,.csv,.png,.jpg,.jpeg";
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files[0]) handleFileSelected(files[0]);
                  };
                  input.click();
                }}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary-subtle flex items-center justify-center text-primary">
                      {selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".csv") ? (
                        <FileSpreadsheet className="h-6 w-6" />
                      ) : (
                        <FileText className="h-6 w-6" />
                      )}
                    </div>
                    <div className="text-body font-bold text-text-primary">{selectedFile.name}</div>
                    <div className="text-caption text-text-muted font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop a different file to replace
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-full bg-subtle flex items-center justify-center text-text-muted">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div className="text-body font-medium text-text-primary">
                      Drop document here, or <span className="text-primary font-semibold">browse files</span>
                    </div>
                    <p className="text-caption text-text-muted">
                      Supports PDF, Excel (.xlsx, .csv), and high-resolution scanned images
                    </p>
                  </div>
                )}
              </div>

              {/* Form Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body">
                <div>
                  <label className="block text-caption font-semibold text-text-primary mb-1">
                    Document Classification
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as DocumentItem["document_type"])}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus-visible:outline-primary"
                  >
                    <option value="INVOICE">Commercial Invoice / Pay App</option>
                    <option value="BANK_STATEMENT">Bank Account Statement</option>
                    <option value="BUDGET_SOV">Schedule of Values / Budget Model</option>
                    <option value="INSPECTION">Lender Inspection Report</option>
                    <option value="DRAW_PACKAGE">Certified Draw Package</option>
                    <option value="CONTRACT">Contract / Agreement</option>
                    <option value="PERMIT">Permit / Regulatory Approval</option>
                  </select>
                </div>

                <div>
                  <label className="block text-caption font-semibold text-text-primary mb-1">
                    Target Project Workspace
                  </label>
                  <select
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus-visible:outline-primary"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.project_entity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-caption font-semibold text-text-primary mb-1">
                    Review Notes / Audit Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. October draw certified inspection report from Columbia Bank"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-primary"
                  />
                </div>
              </div>
            </>
          )}

          {(step === "UPLOADING" || step === "SCANNING") && (
            <div className="py-8 space-y-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary-subtle flex items-center justify-center text-primary animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>

              <div className="space-y-1">
                <div className="text-section font-bold text-text-primary">
                  {step === "UPLOADING" ? "Uploading Source Document to Secure Vault..." : "Running OCR Layout & Schema Matching..."}
                </div>
                <p className="text-body text-text-secondary max-w-md mx-auto">
                  {step === "UPLOADING"
                    ? "Generating SHA-256 integrity hash and storing in AES-256 encrypted object storage."
                    : "Extracting financial line items, bounding box citations, and confidence metrics."}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-caption font-mono text-text-muted">
                  <span>{step === "UPLOADING" ? "S3 Encrypted Ingestion" : "Financial Model Inference"}</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </div>
          )}

          {step === "COMPLETE" && createdDocument && (
            <div className="py-6 space-y-5 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <div className="text-section font-bold text-text-primary">
                  Ingestion & Candidate Extraction Complete
                </div>
                <p className="text-body text-text-secondary">
                  <span className="font-semibold text-text-primary">{createdDocument.original_filename}</span> is now
                  ready for human review.
                </p>
              </div>

              <div className="bg-subtle/50 p-4 rounded-lg border border-border text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Document Type:</span>
                  <span className="font-semibold text-text-primary">{createdDocument.document_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Status:</span>
                  <span className="font-semibold text-amber-700 font-mono">READY_FOR_REVIEW</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Candidate Fields Extracted:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1 font-mono">
                    <Sparkles className="h-3 w-3" /> Proposals Generated
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <ModalFooter className="px-6 py-4 border-t border-border bg-subtle/30 flex items-center justify-between">
          {step === "SELECT" && (
            <>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartUpload}
                disabled={!selectedFile}
              >
                Start Ingestion & OCR
              </Button>
            </>
          )}

          {(step === "UPLOADING" || step === "SCANNING") && (
            <div className="w-full text-center text-caption text-text-muted">
              Processing asynchronous worker job...
            </div>
          )}

          {step === "COMPLETE" && createdDocument && (
            <>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Return to Inbox
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onOpenChange(false);
                  onUploadSuccess?.(createdDocument);
                }}
              >
                Open Review Workbench <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
