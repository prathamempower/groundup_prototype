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
  const [step, setStep] = useState<UploadStep>("SELECT");
  const [progress, setProgress] = useState(0);
  const [createdDocument, setCreatedDocument] = useState<DocumentItem | null>(null);
  const [stageMessage, setStageMessage] = useState("");
  const [subStageDetails, setSubStageDetails] = useState<string[]>([]);

  // Reset modal state when opened/closed
  React.useEffect(() => {
    if (open) {
      setStep("SELECT");
      setProgress(0);
      setSelectedFile(null);
      setCreatedDocument(null);
      setStageMessage("");
      setSubStageDetails([]);
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

  const executeUploadWithFile = async (fileToUpload: File) => {
    setStep("UPLOADING");
    setProgress(20);
    setStageMessage("Uploading file...");
    setSubStageDetails([]);

    try {
      await new Promise((r) => setTimeout(r, 400));
      setProgress(50);
      setStageMessage("Processing document...");

      // Real multipart upload to backend API
      const res = await api.documents.uploadMultipart(
        fileToUpload,
        fileToUpload.name,
        currentProjectId || undefined
      );

      setProgress(75);
      setStep("SCANNING");
      setStageMessage("Extracting structured fields and line items...");

      await new Promise((r) => setTimeout(r, 500));
      setProgress(100);
      const doc = res.data;
      setCreatedDocument(doc);
      setStep("COMPLETE");

      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document Uploaded",
        description: `Successfully uploaded ${doc.original_filename}.`,
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
      <ModalContent maxWidth="lg" className="p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-overlay bg-white">
        {/* Header */}
        <ModalHeader className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 shrink-0 shadow-2xs">
              <UploadCloud className="h-5 w-5" />
            </span>
            <div className="space-y-0.5">
              <ModalTitle className="text-lg font-semibold text-slate-900 tracking-tight leading-snug antialiased">
                Upload Document
              </ModalTitle>
              <ModalDescription className="text-[13px] text-slate-500 font-normal leading-normal">
                Upload invoices, draw packets, budgets, or bank statements.
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
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-slate-900 tracking-tight truncate max-w-sm mx-auto">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono tabular-nums">
                        {(selectedFile.size / 1024).toFixed(1)} KB · Ready to upload
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium bg-white border border-slate-200/90 rounded-md px-3 py-1 hover:bg-slate-50 transition-colors shadow-2xs">
                        Change File
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform">
                      <UploadCloud className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-sm font-medium text-slate-700">
                        Drag and drop your document here, or{" "}
                        <span className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-blue-200 hover:decoration-blue-400 transition-colors">
                          browse files
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-normal">
                        PDF, Excel (.xlsx, .csv), or images up to 50 MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </>
          )}

          {(step === "UPLOADING" || step === "SCANNING") && (
            <div className="py-8 space-y-6 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>

              <div className="space-y-1">
                <div className="text-base font-semibold text-slate-900 tracking-tight">
                  {step === "UPLOADING" ? "Uploading document..." : "Processing document..."}
                </div>
                <p className="text-xs sm:text-[13px] text-slate-500 font-normal max-w-md mx-auto">
                  {stageMessage}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/40">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-500">
                  <span className="font-sans text-slate-500">
                    {step === "UPLOADING" ? "Uploading" : "Processing"}
                  </span>
                  <span className="font-semibold tabular-nums text-blue-700">{progress}%</span>
                </div>
              </div>

              {/* Completed Sub-steps Checklist */}
              {subStageDetails.length > 0 && (
                <div className="max-w-md mx-auto text-left bg-slate-50 border border-slate-200/70 rounded-lg p-3 space-y-1.5">
                  {subStageDetails.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
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
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <div className="text-base font-semibold text-slate-900 tracking-tight">
                  Document Uploaded
                </div>
                <p className="text-xs sm:text-[13px] text-slate-500 font-normal">
                  <span className="font-semibold text-slate-900">{createdDocument.original_filename}</span> is ready for review.
                </p>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/90 text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Document Type:</span>
                  <span className="font-semibold text-slate-800 tracking-tight">{createdDocument.document_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    READY_FOR_REVIEW
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <ModalFooter className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
          {step === "SELECT" && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-sm font-medium text-slate-700 border-slate-200/90 hover:bg-slate-100/80 hover:text-slate-900 h-9 px-4 rounded-lg shadow-2xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartUpload}
                disabled={!selectedFile}
                className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300 disabled:text-white/80 disabled:opacity-60 disabled:cursor-not-allowed h-9 px-4 rounded-lg shadow-xs"
              >
                Upload Document
              </Button>
            </>
          )}

          {(step === "UPLOADING" || step === "SCANNING") && (
            <div className="w-full text-center text-xs text-slate-500 font-medium">
              Processing document...
            </div>
          )}

          {step === "COMPLETE" && createdDocument && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-sm font-medium text-slate-700 border-slate-200/90 h-9 px-4 rounded-lg shadow-2xs"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onOpenChange(false);
                  onUploadSuccess?.(createdDocument);
                }}
                className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs h-9 px-4 rounded-lg"
              >
                Review Document <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
