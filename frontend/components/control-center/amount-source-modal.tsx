"use client";

import React from "react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileSpreadsheet,
  Eye,
} from "lucide-react";
import { AmountSourceOrigin } from "@/lib/data/control-center-origins";
import { cn } from "@/lib/utils";

interface AmountSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  origin: AmountSourceOrigin | null;
  onInspectDocument?: (fileName: string) => void;
}

export function AmountSourceModal({
  open,
  onOpenChange,
  origin,
  onInspectDocument,
}: AmountSourceModalProps) {
  if (!origin) return null;

  const isXlsx =
    origin.sourceDocument.fileType === "xlsx" ||
    origin.sourceDocument.fileName.toLowerCase().endsWith(".xlsx");

  // Clean, short title
  const cleanTitle = origin.title
    .replace(" Scope", "")
    .replace(" Total", "")
    .replace(" KPI", "")
    .trim();

  // Location string (e.g. "Page 1" or "Sheet 'Monthly Spend'")
  const locationText = origin.sourceDocument.sectionOrPage || origin.sourceDocument.section || "";
  const shortLocation = locationText.split("•")[0]?.trim() || locationText;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md overflow-hidden flex flex-col p-0 rounded-xl bg-white border border-slate-200 shadow-xl">
        {/* Header - Clean & Simple */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {cleanTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Source Origin
            </p>
          </div>

          <div className="text-right pr-7">
            <span
              className={cn(
                "text-xl font-bold font-mono tabular-nums tracking-tight",
                origin.isNegative ? "text-rose-600" : "text-slate-900"
              )}
            >
              {origin.amountFormatted}
            </span>
          </div>
        </div>

        {/* Body - Clean, Essential items only */}
        <div className="p-5 space-y-4 text-xs">
          {/* Source Document Row */}
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "h-7 w-7 rounded-md flex items-center justify-center shrink-0 border",
                  isXlsx
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                )}
              >
                {isXlsx ? (
                  <FileSpreadsheet className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate text-xs">
                  {origin.sourceDocument.fileName}
                </p>
                {shortLocation && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    {shortLocation}
                  </p>
                )}
              </div>
            </div>

            {onInspectDocument && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInspectDocument(origin.sourceDocument.fileName)}
                className="h-7 px-2.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-slate-200 shrink-0 gap-1"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View Document</span>
              </Button>
            )}
          </div>

          {/* Clean Line Items Table (Without Share) */}
          {origin.components && origin.components.length > 0 && (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium">
                    <th className="py-2 px-3 text-left">Item</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {origin.components.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {c.name}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                        {c.amountFormatted}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 font-bold bg-slate-50/70 text-slate-900">
                    <td className="py-2 px-3">Total</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      {origin.amountFormatted}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7 px-3 text-xs bg-white text-slate-700 hover:bg-slate-50 border-slate-200 rounded-md font-medium"
          >
            Close
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
