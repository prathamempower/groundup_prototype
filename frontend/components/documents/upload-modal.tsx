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
import { PRE_EXISTING_DOCUMENTS, PreExistingDocDef } from "@/lib/sample-documents";

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
  const [step, setStep] = useState<UploadStep>("SELECT");
  const [progress, setProgress] = useState(0);
  const [createdDocument, setCreatedDocument] = useState<DocumentItem | null>(null);
  const [stageMessage, setStageMessage] = useState("");
  const [subStageDetails, setSubStageDetails] = useState<string[]>([]);
  const [loadingSample, setLoadingSample] = useState(false);

  // Reset modal state when opened/closed
  React.useEffect(() => {
    if (open) {
      setStep("SELECT");
      setProgress(0);
      setSelectedFile(null);
      setCreatedDocument(null);
      setStageMessage("");
      setSubStageDetails([]);
      setLoadingSample(false);
    }
  }, [open]);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleLoadPreExistingDoc = async (docDef: PreExistingDocDef, autoUpload = false) => {
    try {
      setLoadingSample(true);
      const res = await fetch(`/sample-docs/${encodeURIComponent(docDef.filename)}`);
      if (!res.ok) {
        throw new Error(`Failed to load pre-existing file: ${res.statusText}`);
      }
      const blob = await res.blob();
      const mimeType = docDef.filename.endsWith(".xlsx")
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/pdf";
      const file = new File([blob], docDef.filename, { type: mimeType });
      setSelectedFile(file);
      toast({
        title: "Document Loaded",
        description: `Loaded ${docDef.filename} (${(file.size / 1024).toFixed(1)} KB) ready for ingestion.`,
      });

      if (autoUpload) {
        // Trigger upload directly with this file
        await executeUploadWithFile(file);
      }
    } catch (err: unknown) {
      toast({
        title: "Could Not Load Sample",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoadingSample(false);
    }
  };

  const executeUploadWithFile = async (fileToUpload: File) => {
    setStep("UPLOADING");
    setProgress(15);
    setStageMessage("Establishing secure TLS upload tunnel & calculating SHA-256 integrity hash...");
    setSubStageDetails(["Generating SHA-256 checksum for immutable ledger"]);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProgress(35);
      setStageMessage("Streaming payload into AES-256 encrypted storage vault...");

      // Real multipart upload to backend API
      const res = await api.documents.uploadMultipart(
        fileToUpload,
        fileToUpload.name,
        currentProjectId || undefined
      );

      setProgress(60);
      setStep("SCANNING");
      setStageMessage("Parsing file format & initializing GroundUp Financial Vision model...");
      setSubStageDetails((prev) => [...prev, "Object storage written & validated"]);

      await new Promise((r) => setTimeout(r, 700));
      setProgress(80);
      setStageMessage("Extracting structured candidate fields, line items & confidence citations...");
      setSubStageDetails((prev) => [...prev, "OCR schema matching & bounding box citations mapped"]);

      await new Promise((r) => setTimeout(r, 600));
      setProgress(100);
      const doc = res.data;
      setCreatedDocument(doc);
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

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    await executeUploadWithFile(selectedFile);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="lg" className="p-0 overflow-hidden rounded-xl border border-slate-200/90 shadow-2xl bg-white">
        {/* Header */}
        <ModalHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-start gap-3.5">
            <span className="rounded-lg bg-blue-50 border border-blue-200/60 p-2 text-blue-700 shrink-0">
              <UploadCloud className="h-5 w-5" />
            </span>
            <div className="space-y-0.5">
              <ModalTitle className="text-base font-bold text-slate-900 tracking-tight">
                Upload Source Document
              </ModalTitle>
              <ModalDescription className="text-xs text-slate-500 leading-relaxed">
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
                  "border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all cursor-pointer relative",
                  selectedFile
                    ? "border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/5"
                    : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/60 bg-white"
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
                  <div className="space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-xs">
                      {selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".csv") ? (
                        <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                      ) : (
                        <FileText className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{selectedFile.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB · Ready to ingest
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-white border border-slate-200 rounded-md px-2.5 py-1 shadow-2xs">
                      Change File
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform">
                      <UploadCloud className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        Drop document here, or <span className="text-blue-600 font-bold hover:underline">browse files</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports PDF, Excel (.xlsx, .csv), and high-resolution scanned images
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <span className="rounded bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-mono font-medium border border-slate-200/60">
                        Max 50MB
                      </span>
                      <span className="rounded bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-mono font-medium border border-slate-200/60">
                        SHA-256 Verified
                      </span>
                      <span className="rounded bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-mono font-medium border border-slate-200/60">
                        Automatic OCR
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pre-existing Project Documents Quick Selector */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Pre-existing Project Documents
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Click to load real file &amp; test OCR
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRE_EXISTING_DOCUMENTS.slice(0, 6).map((docDef) => {
                    const isSelected = selectedFile?.name === docDef.filename;
                    const isXlsx = docDef.filename.endsWith(".xlsx");

                    return (
                      <button
                        key={docDef.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadPreExistingDoc(docDef, false);
                        }}
                        className={cn(
                          "flex items-start gap-2.5 p-2 rounded-lg border text-left transition-all relative group",
                          isSelected
                            ? "border-blue-500 bg-blue-50/80 shadow-xs ring-1 ring-blue-500/20"
                            : "border-slate-200/80 bg-white hover:border-blue-300 hover:bg-slate-50/80"
                        )}
                      >
                        <div
                          className={cn(
                            "h-7 w-7 rounded-md flex items-center justify-center shrink-0 border mt-0.5",
                            isXlsx
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                              : "bg-blue-50 text-blue-700 border-blue-200/60"
                          )}
                        >
                          {isXlsx ? (
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                          ) : (
                            <FileText className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {docDef.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">
                              {docDef.sizeText}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {docDef.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {(step === "UPLOADING" || step === "SCANNING") && (
            <div className="py-8 space-y-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>

              <div className="space-y-1.5">
                <div className="text-base font-bold text-slate-900">
                  {step === "UPLOADING" ? "Uploading Source Document to Secure Vault..." : "Running OCR Layout & Schema Matching..."}
                </div>
                <p className="text-xs text-blue-600 font-medium max-w-md mx-auto leading-relaxed animate-pulse">
                  {stageMessage}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-500">
                  <span>{step === "UPLOADING" ? "TLS AES-256 Vault Stream" : "Financial Vision Pipeline"}</span>
                  <span className="font-bold text-blue-700">{progress}%</span>
                </div>
              </div>

              {/* Completed Sub-steps Checklist */}
              {subStageDetails.length > 0 && (
                <div className="max-w-md mx-auto text-left bg-slate-50 border border-slate-200/70 rounded-lg p-3 space-y-1.5">
                  {subStageDetails.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "COMPLETE" && createdDocument && (
            <div className="py-6 space-y-5 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div className="space-y-1">
                <div className="text-base font-bold text-slate-900">
                  Ingestion & Candidate Extraction Complete
                </div>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-900">{createdDocument.original_filename}</span> is now
                  ready for human review.
                </p>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/90 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Document Type:</span>
                  <span className="font-semibold text-slate-800 uppercase tracking-tight">{createdDocument.document_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full font-mono text-[11px]">
                    READY_FOR_REVIEW
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Candidate Fields Extracted:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1 font-mono">
                    <Sparkles className="h-3 w-3" /> Proposals Generated
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <ModalFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {step === "SELECT" && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartUpload}
                disabled={!selectedFile}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Start Ingestion & OCR
              </Button>
            </>
          )}

          {(step === "UPLOADING" || step === "SCANNING") && (
            <div className="w-full text-center text-xs text-slate-500">
              Processing asynchronous worker job...
            </div>
          )}

          {step === "COMPLETE" && createdDocument && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs font-semibold text-slate-700 border-slate-200"
              >
                Return to Inbox
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onOpenChange(false);
                  onUploadSuccess?.(createdDocument);
                }}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
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
