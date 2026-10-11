"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ReportExportItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { ExportReportModal } from "./export-report-modal";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface ExportManagerPanelProps {
  projectId: string;
}

export function ExportManagerPanel({ projectId }: ExportManagerPanelProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: exportsData, isLoading } = useQuery({
    queryKey: ["exports", projectId],
    queryFn: () => api.exports.list(projectId),
  });

  const exportsList = exportsData?.data || [];

  const handleDownload = (item: ReportExportItem) => {
    setDownloadingId(item.id);
    setTimeout(() => {
      // Create a simulated downloadable text blob
      const content = `GroundUp AI Verified Report Package\nReport: ${item.title}\nProject ID: ${item.project_id}\nFormat: ${item.format}\nGenerated: ${item.completed_at || item.requested_at}\nRequested By: ${item.requested_by}\n\n[OFFICIAL CERTIFIED DATA SNAPSHOT - GROUNDUP AI ENGINE]`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.title.replace(/[^a-zA-Z0-9_-]/g, "_") + (item.format === "XLSX" ? ".xlsx" : item.format === "CSV" ? ".csv" : ".pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadingId(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5 shadow-xs">
        <div>
          <h3 className="text-section font-bold text-text-primary flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <span>Project Reporting & Structured Data Exports</span>
          </h3>
          <p className="text-caption text-text-secondary mt-0.5">
            Compile verified financial workbooks, draw lender packets, and audit change logs into shareable files.
          </p>
        </div>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover shadow-xs transition-colors shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span>Generate New Export Package</span>
        </button>
      </div>

      {/* Available Preset Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-success-subtle text-success">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <span className="text-caption font-bold text-text-secondary bg-subtle px-2 py-0.5 rounded border border-border">
              XLSX
            </span>
          </div>
          <div>
            <h4 className="text-body font-bold text-text-primary">Master Budget Schedule of Values</h4>
            <p className="text-caption text-text-secondary mt-1">
              Complete CSI divisions, original baselines, approved COs, and actual cleared expenses.
            </p>
          </div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="text-caption font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1"
          >
            <span>Request Workbook &rarr;</span>
          </button>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <span className="text-caption font-bold text-text-secondary bg-subtle px-2 py-0.5 rounded border border-border">
              PDF
            </span>
          </div>
          <div>
            <h4 className="text-body font-bold text-text-primary">Lender Draw Verification Package</h4>
            <p className="text-caption text-text-secondary mt-1">
              Signed pay applications, unconditional lien waivers, DOB inspection reports, and retainage sheets.
            </p>
          </div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="text-caption font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1"
          >
            <span>Request PDF Packet &rarr;</span>
          </button>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-subtle text-text-primary">
              <Clock className="h-5 w-5" />
            </span>
            <span className="text-caption font-bold text-text-secondary bg-subtle px-2 py-0.5 rounded border border-border">
              CSV
            </span>
          </div>
          <div>
            <h4 className="text-body font-bold text-text-primary">Complete Project Audit Trail</h4>
            <p className="text-caption text-text-secondary mt-1">
              Immutable ledger of all approvals, waivers, adjustments, baseline mutations, and user decisions.
            </p>
          </div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="text-caption font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1"
          >
            <span>Request CSV Export &rarr;</span>
          </button>
        </div>
      </div>

      {/* Export History Table */}
      <div className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4">
        <h4 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
          Generated Export Packages & Download History ({exportsList.length})
        </h4>

        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-left text-body">
            <thead className="bg-subtle border-b border-border text-caption font-semibold text-text-secondary">
              <tr>
                <th className="py-3 px-4">Report Package Title</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    Loading exports history...
                  </td>
                </tr>
              ) : exportsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No export packages have been generated yet.
                  </td>
                </tr>
              ) : (
                exportsList.map((item) => (
                  <tr key={item.id} className="hover:bg-subtle/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-text-primary">{item.title}</div>
                      <div className="text-caption text-text-muted font-mono">{item.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded px-2 py-0.5 text-caption font-bold ${
                          item.format === "XLSX"
                            ? "bg-success-subtle text-success border border-success-border"
                            : item.format === "PDF"
                            ? "bg-primary-subtle text-primary border border-primary/30"
                            : "bg-subtle text-text-secondary border border-border"
                        }`}
                      >
                        {item.format}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-caption text-text-secondary tabular-nums">
                      {item.file_size || "1.4 MB"}
                    </td>
                    <td className="py-3 px-4 text-caption text-text-secondary">
                      {item.requested_by}
                    </td>
                    <td className="py-3 px-4 text-caption text-text-secondary tabular-nums">
                      {formatDate(item.completed_at || item.requested_at)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 text-caption font-semibold text-success border border-success-border">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Ready
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDownload(item)}
                        disabled={downloadingId === item.id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-subtle border border-border px-3 py-1 text-caption font-medium text-text-primary hover:bg-subtle/80 shadow-xs transition-colors"
                      >
                        <Download className="h-3.5 w-3.5 text-text-muted" />
                        <span>{downloadingId === item.id ? "Preparing..." : "Download"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportReportModal
          projectId={projectId}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
