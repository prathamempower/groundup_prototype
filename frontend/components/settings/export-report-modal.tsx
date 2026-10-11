"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ReportExportType } from "@/lib/types";
import { Download, X, AlertTriangle, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";

interface ExportReportModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ExportReportModal({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: ExportReportModalProps) {
  const queryClient = useQueryClient();
  const [reportType, setReportType] = useState<ReportExportType>("BUDGET_SOV_EXCEL");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const exportMutation = useMutation({
    mutationFn: () =>
      api.exports.request(projectId, {
        report_type: reportType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exports", projectId] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to generate report export";
      setErrorMsg(msg);
    },
  });

  if (!isOpen) return null;

  const exportOptions = [
    {
      type: "BUDGET_SOV_EXCEL" as const,
      title: "Master Construction Budget SOV & Cost Ledger",
      format: "Excel (.xlsx)",
      desc: "Full Schedule of Values, baseline allocations, COs, and actual line item spend.",
      icon: <FileSpreadsheet className="h-5 w-5 text-success" />,
    },
    {
      type: "DRAW_PACKAGE_PDF" as const,
      title: "Lender Draw Package & Verification Package",
      format: "PDF Document (.pdf)",
      desc: "Complete draw verification packet with lien waivers, inspections, and retainage sheets.",
      icon: <FileText className="h-5 w-5 text-primary" />,
    },
    {
      type: "AUDIT_LOG_CSV" as const,
      title: "Full Project Audit Trail & Governance Log",
      format: "CSV Data (.csv)",
      desc: "Immutable timestamped log of all approvals, waivers, adjustments, and user actions.",
      icon: <FileText className="h-5 w-5 text-text-secondary" />,
    },
    {
      type: "INVESTOR_UPDATE_PDF" as const,
      title: "Published Investor Development Snapshot",
      format: "PDF Document (.pdf)",
      desc: "Official sponsor brief, return waterfalls, milestones, and material disclosures.",
      icon: <FileText className="h-5 w-5 text-primary" />,
    },
    {
      type: "CLOSEOUT_RETURNS_PDF" as const,
      title: "Audited Financial Closeout & Investor Returns",
      format: "PDF Document (.pdf)",
      desc: "Comprehensive 7-gate closeout certification, HUD-1 proceeds, and final IRR report.",
      icon: <FileText className="h-5 w-5 text-warning" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-lg border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-text-primary">
                Generate & Export Audit Package
              </h3>
              <p className="text-caption text-text-secondary">
                Produce verified reporting files from approved project baselines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted hover:bg-subtle hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-md border border-danger-border bg-danger-subtle p-3 text-caption font-medium text-danger flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-2.5">
          <label className="block text-caption font-semibold text-text-primary">
            Select Report Package
          </label>
          <div className="space-y-2">
            {exportOptions.map((opt) => {
              const isSelected = reportType === opt.type;
              return (
                <div
                  key={opt.type}
                  onClick={() => setReportType(opt.type)}
                  className={`cursor-pointer rounded-lg border p-3.5 flex items-start gap-3 transition-all ${
                    isSelected
                      ? "border-primary bg-primary-subtle/30 ring-1 ring-primary shadow-xs"
                      : "border-border bg-surface hover:bg-subtle/50"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-body font-bold text-text-primary">{opt.title}</h4>
                      <span className="text-caption font-semibold text-text-secondary rounded bg-subtle px-2 py-0.5 border border-border">
                        {opt.format}
                      </span>
                    </div>
                    <p className="text-caption text-text-secondary mt-0.5">{opt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-surface px-4 py-2 text-body font-medium text-text-secondary hover:bg-subtle"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={exportMutation.isPending}
            onClick={() => exportMutation.mutate()}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover shadow-xs"
          >
            <Download className="h-4 w-4" />
            {exportMutation.isPending ? "Compiling Package..." : "Generate Export Package"}
          </button>
        </div>
      </div>
    </div>
  );
}
