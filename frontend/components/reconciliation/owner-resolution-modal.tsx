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
  Check,
  ExternalLink,
} from "lucide-react";
import { getSourceFileName } from "./reconciliation-helpers";

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
        {/* Header: Title and Subtitle */}
        <ModalHeader className="pb-3.5 border-b border-slate-100 pr-10">
          <div>
            <ModalTitle className="text-base font-bold text-slate-900">
              Resolve Transaction
            </ModalTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Attach a receipt, invoice, or note to resolve this transaction.
            </p>
          </div>
        </ModalHeader>

        {/* Transaction Summary Card */}
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
          {/* Top Row: Payee, Date, Amount, and Issue Flag */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                {item.description}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <span>{item.account}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono">{item.date}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div
                className={`font-mono text-base font-bold tabular-nums tracking-tight ${
                  item.direction === "in" || item.amount.startsWith("+")
                    ? "text-emerald-700"
                    : "text-slate-900"
                }`}
              >
                {item.amount}
              </div>
              {item.auditIssue && (
                <div className="mt-1 flex items-center justify-end gap-1.5">
                  {item.auditIssue.toLowerCase().includes("missing") ? (
                    <FileQuestion className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                  ) : item.auditIssue.toLowerCase().includes("variance") ||
                    item.auditIssue.toLowerCase().includes("mismatch") ? (
                    <Scale className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                  ) : item.auditIssue.toLowerCase().includes("duplicate") ? (
                    <Copy className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                  ) : (
                    <DollarSign className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      item.auditIssue.toLowerCase().includes("missing")
                        ? "text-rose-700"
                        : "text-slate-800"
                    }`}
                  >
                    {item.auditIssue}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Audit Trace: Source & Matched Records */}
          <div className="pt-2.5 border-t border-slate-200/70 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-3 text-slate-600">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium text-slate-500 shrink-0">
                  Source statement:
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-xs text-slate-700 truncate">
                    {getSourceFileName(item)}
                  </span>
                </div>
              </div>
              <a
                href={`#view-source-${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Opening statement preview for: ${getSourceFileName(item)}`);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 shrink-0 px-2 py-0.5 rounded border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                title="View origin document"
              >
                <span>View</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
            </div>

            {item.matchedDocument ? (
              <div className="flex items-center justify-between gap-3 text-slate-600">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-slate-500 shrink-0">
                    {item.auditIssue?.toLowerCase().includes("duplicate")
                      ? "Conflicting charge:"
                      : item.auditIssue?.toLowerCase().includes("variance") ||
                        item.auditIssue?.toLowerCase().includes("mismatch")
                      ? "Compared document:"
                      : item.auditIssue?.toLowerCase().includes("draw") ||
                        item.auditIssue?.toLowerCase().includes("deposit")
                      ? "Deposit notice:"
                      : item.auditIssue?.toLowerCase().includes("card")
                      ? "Settlement record:"
                      : "Document on file:"}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    {item.auditIssue?.toLowerCase().includes("duplicate") ? (
                      <Copy className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    ) : item.auditIssue?.toLowerCase().includes("draw") ||
                      item.auditIssue?.toLowerCase().includes("deposit") ? (
                      <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <Scale className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="text-xs text-slate-700 font-medium truncate">
                      {item.matchedDocument}
                    </span>
                  </div>
                </div>
                {item.matchedAmount && (
                  <span className="font-mono text-xs font-semibold text-slate-800 shrink-0">
                    {item.matchedAmount}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-slate-500 shrink-0">
                    Supporting document:
                  </span>
                  <span className="text-xs text-slate-400 italic">
                    None on file
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload & Notes */}
        <div className="space-y-4 pt-3.5">
          {/* Supporting Documents Upload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 block">
                Proof &amp; Supporting Documents
              </label>
              {files.length > 0 && (
                <span className="text-[11px] font-semibold text-slate-500 font-mono">
                  {files.length} {files.length === 1 ? "file" : "files"}
                </span>
              )}
            </div>

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
                className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-slate-800 bg-slate-50"
                    : "border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <UploadCloud className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    Drop file here, or{" "}
                    <span className="text-slate-900 underline underline-offset-2">Choose Files</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    PDF, PNG, JPG, or spreadsheets
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden max-h-40 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-3.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="h-4 w-4 text-slate-600 shrink-0" />
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

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5 text-slate-500" />
                    Choose Files
                  </button>
                  <span className="text-[11px] text-slate-400">
                    PDF, PNG, JPG, or spreadsheets
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Audit Note Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 block">
              Note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Add an explanation or reason..."
              className="text-xs font-normal text-slate-900 resize-none rounded-lg border-slate-200 focus:border-slate-400 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <ModalFooter className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2 mt-4">
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
            className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 h-8 px-4 rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
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
