"use client";

import React from "react";
import { AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { DuplicateInvoiceCheckResult } from "@/lib/types";

interface DuplicateInvoiceAlertProps {
  checkResult?: DuplicateInvoiceCheckResult | null;
  checking?: boolean;
}

export function DuplicateInvoiceAlert({ checkResult, checking }: DuplicateInvoiceAlertProps) {
  if (checking) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-surface-hover p-2.5 text-caption text-text-muted border border-border animate-pulse">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span>Scanning ledger and historical draws for duplicate invoice numbers...</span>
      </div>
    );
  }

  if (!checkResult) return null;

  if (checkResult.is_duplicate && checkResult.existing_record) {
    const { source, amount, date, vendor, draw_number, submission_number } = checkResult.existing_record;
    return (
      <div className="rounded-md border border-danger/40 bg-danger-subtle/30 p-3 space-y-1.5 text-caption">
        <div className="flex items-center gap-2 font-semibold text-danger">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Duplicate Invoice Detected: #{checkResult.invoice_number}</span>
        </div>
        <p className="text-text-primary">
          An invoice with this identifier is already registered in the system:
        </p>
        <div className="rounded bg-surface p-2 border border-border space-y-0.5 font-mono text-caption text-text-secondary">
          <div>• <strong>Source:</strong> {source}</div>
          <div>• <strong>Vendor:</strong> {vendor}</div>
          <div>• <strong>Amount:</strong> {formatMoney(amount)}</div>
          <div>• <strong>Recorded Date:</strong> {date}</div>
          {draw_number && <div>• <strong>Associated Draw:</strong> Draw #{draw_number}</div>}
          {submission_number && <div>• <strong>Previous Submission:</strong> {submission_number}</div>}
        </div>
        <p className="text-danger font-medium mt-1">
          Warning: Submitting duplicate invoices will cause immediate rejection during CFO reconciliation. Please confirm whether this is a revised billing or credit memo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md bg-success-subtle/30 p-2 text-caption text-success font-medium border border-success/30">
      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
      <span>Invoice #{checkResult.invoice_number} verified: No duplicate records found across ledger or historical draws.</span>
    </div>
  );
}
