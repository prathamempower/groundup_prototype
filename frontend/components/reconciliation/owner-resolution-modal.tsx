"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  UploadCloud,
  X,
  Plus,
  FileQuestion,
  Scale,
  Copy,
  DollarSign,
} from "lucide-react";

export interface ReviewItemData {
  id: string;
  date: string;
  account: string;
  description: string;
  type: string;
  direction: string;
  amount: string;
  proposedLink?: string;
  whyMatches?: string;
  evidence: string;
  status: string;
  resolutionType?: string;
  resolutionNote?: string;
  matchedDocument?: string;
  matchedAmount?: string;
  variance?: string;
  auditIssue?: string;
  auditDetail?: string;
  amountAtRisk?: string;
  sourceFileName?: string;
  uploadedFiles?: string[];
}

export type ResolutionActionType =
  | "UPLOAD_PROOF"
  | "REQUEST_INVOICE"
  | "ASSIGN_TRADE"
  | "CONFIRM_DRAW"
  | "SETTLE_LIABILITY"
  | "EXCLUDE_NON_PROJECT"
  | "OTHER";

export interface UploadedProofFile {
  id: string;
  name: string;
  size: number;
}

export interface OwnerResolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ReviewItemData | null;
  onResolve: (
    itemId: string,
    actionType: ResolutionActionType,
    reason: string,
    uploadedFiles?: string[]
  ) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function OwnerResolutionModal({
  open,
  onOpenChange,
  item,
  onResolve,
}: OwnerResolutionModalProps) {
  const [note, setNote] = useState<string>("");
  const [files, setFiles] = useState<UploadedProofFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && item) {
      setNote(item.resolutionNote || "");
      if (item.uploadedFiles && item.uploadedFiles.length > 0) {
        setFiles(
          item.uploadedFiles.map((name, index) => ({
            id: `existing-${index}-${name}`,
            name,
            size: 145000 + index * 42000,
          }))
        );
      } else {
        setFiles([]);
      }
    }
  }, [open, item]);

  if (!item) return null;

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles: UploadedProofFile[] = Array.from(fileList).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: f.name,
      size: f.size,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesAdded(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFilesAdded(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const fileNames = files.map((f) => f.name);
      let finalNote = note.trim();
      if (!finalNote) {
        if (fileNames.length > 0) {
          finalNote = `Proof attached: ${fileNames.join(", ")}`;
        } else {
          finalNote = "Verified and resolved";
        }
      }
      onResolve(item.id, "UPLOAD_PROOF", finalNote, fileNames);
      setIsSubmitting(false);
      onOpenChange(false);
    }, 100);
  };

  const isResolved = item.status === "Resolved";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md" className="p-5 sm:p-6">
        {/* Header: Title and Amount */}
        <ModalHeader className="pb-3 border-b border-slate-100 pr-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ModalTitle className="text-base font-bold text-slate-900">
                Resolve Transaction
              </ModalTitle>
              <span
                className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  item.auditIssue?.toLowerCase().includes("missing")
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : item.direction === "in"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                {item.amount}
              </span>
            </div>
          </div>
        </ModalHeader>

        {/* Transaction Summary Strip */}
        <div className="py-3 border-b border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-slate-900 truncate">
                {item.description}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 truncate">{item.account}</span>
            </div>
            <span className="text-slate-600 font-mono text-[11px] shrink-0 font-medium">
              {item.date}
            </span>
          </div>

          {item.auditIssue && (
            <div className="flex items-center gap-1.5 text-[11px]">
              {item.auditIssue.toLowerCase().includes("missing") ? (
                <FileQuestion className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              ) : item.auditIssue.toLowerCase().includes("variance") ? (
                <Scale className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              ) : item.auditIssue.toLowerCase().includes("duplicate") ? (
                <Copy className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              ) : (
                <DollarSign className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              )}
              <span
                className={`font-semibold ${
                  item.auditIssue.toLowerCase().includes("missing")
                    ? "text-rose-600"
                    : "text-slate-700"
                }`}
              >
                {item.auditIssue}
              </span>
              {item.auditDetail && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 truncate">{item.auditDetail}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Main Section: 1 Clear Option to Upload Proof Document */}
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900 block">
                Proof &amp; Supporting Documents
              </label>
              {files.length > 0 && (
                <span className="text-[11px] font-medium text-slate-500 font-mono">
                  {files.length} {files.length === 1 ? "file" : "files"} attached
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Upload invoices, receipts, signed delivery slips, or payment confirmations.
            </p>

            {/* Hidden native input supporting multiple files */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Zone / Drop Area */}
            {files.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <UploadCloud className="h-7 w-7 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-800">
                  Click to upload proof{" "}
                  <span className="font-normal text-slate-500">or drag &amp; drop</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  PDF, PNG, JPG, or spreadsheets (multiple files supported)
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-slate-600" />
                  Choose Files
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white overflow-hidden max-h-48 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        aria-label={`Remove ${file.name}`}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 text-slate-500" />
                    Add more files
                  </button>
                  <span className="text-[11px] text-slate-400">
                    PDF, PNG, JPG, or spreadsheets
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Note Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900 block">
                Note{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Add context or explanation (e.g. Card slip verified with superintendent, paid in full)..."
              className="text-xs font-normal text-slate-900 resize-none border-slate-200 focus:border-slate-400"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <ModalFooter className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2 mt-5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-600 hover:text-slate-900 h-8 px-3"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 h-8 px-4"
          >
            {isSubmitting
              ? "Saving..."
              : isResolved
              ? "Update Resolution"
              : "Resolve Transaction"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
