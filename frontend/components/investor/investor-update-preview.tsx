"use client";

import React from "react";
import { InvestorUpdateSnapshot } from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import {
  ShieldCheck,
  AlertOctagon,
  FileText,
  Printer,
  Calendar,
  Building2,
  Lock,
  Layers,
  CheckCircle2,
  Clock,
  Home,
  FileCheck,
} from "lucide-react";

interface InvestorUpdatePreviewProps {
  snapshot: InvestorUpdateSnapshot;
  projectName?: string;
  projectAddress?: string;
  showPrintAction?: boolean;
}

export function InvestorUpdatePreview({
  snapshot,
  projectName = "Project update",
  projectAddress = "",
  showPrintAction = true,
}: InvestorUpdatePreviewProps) {
  const isWithdrawn = snapshot.status === "WITHDRAWN";
  const isDraft = snapshot.status === "DRAFT";
  const isPublished = snapshot.status === "PUBLISHED";

  return (
    <div className="space-y-6">
      {/* Action Header / Print Control */}
      {showPrintAction && (
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">
              Snapshot Viewer
            </span>
            {isPublished && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-caption font-medium text-success border border-success-border">
                <ShieldCheck className="h-3.5 w-3.5" />
                Immutable Published Snapshot
              </span>
            )}
            {isWithdrawn && (
              <span className="inline-flex items-center gap-1 rounded-full bg-danger-subtle px-2.5 py-0.5 text-caption font-medium text-danger border border-danger-border">
                <AlertOctagon className="h-3.5 w-3.5" />
                Withdrawn / Rescinded
              </span>
            )}
            {isDraft && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 text-caption font-medium text-warning border border-warning-border">
                <FileText className="h-3.5 w-3.5" />
                Unpublished Draft
              </span>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-body font-medium text-text-primary hover:bg-subtle shadow-xs transition-colors"
          >
            <Printer className="h-4 w-4 text-text-muted" />
            <span>Print Report</span>
          </button>
        </div>
      )}

      {/* Main Print Container */}
      <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-8 print:p-0 print:border-none print:shadow-none print:space-y-6">
        
        {/* WITHDRAWAL BANNER */}
        {isWithdrawn && (
          <div className="rounded-lg border-2 border-danger-border bg-danger-subtle/40 p-5 space-y-2">
            <div className="flex items-center gap-2 text-section font-bold text-danger">
              <AlertOctagon className="h-5 w-5 shrink-0" />
              <span>OFFICIAL NOTICE: SNAPSHOT WITHDRAWN</span>
            </div>
            <p className="text-body text-text-primary">
              This update was formally rescinded on{" "}
              <strong className="text-danger">{formatDate(snapshot.withdrawn_at)}</strong> by{" "}
              <strong>{snapshot.withdrawn_by || "Sponsor Management"}</strong>.
            </p>
            {snapshot.withdrawal_reason && (
              <div className="rounded-md border border-danger-border/40 bg-surface p-3 text-caption text-text-primary">
                <strong className="text-danger">Reason for Rescission:</strong> {snapshot.withdrawal_reason}
              </div>
            )}
          </div>
        )}

        {/* DRAFT BANNER */}
        {isDraft && (
          <div className="rounded-md border border-warning-border bg-warning-subtle/50 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-caption font-semibold text-warning">
              <FileText className="h-4 w-4" />
              <span>DRAFT PREVIEW &bull; Internal Review Only &bull; Not visible to LP Investors</span>
            </div>
            <span className="text-caption text-text-muted">Unpublished</span>
          </div>
        )}

        {/* DOCUMENT HEADER */}
        <div className="border-b border-border pb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-text-muted">
                <Building2 className="h-4 w-4 text-primary" />
                <span>Vance Development LLC &bull; Investor Brief</span>
              </div>
              <h1 className="text-title font-bold text-text-primary tracking-tight">
                {snapshot.title}
              </h1>
              <p className="text-body text-text-secondary">
                {projectName} &bull; {projectAddress}
              </p>
            </div>

            <div className="rounded-md border border-border bg-subtle/40 p-3 text-right space-y-1 sm:min-w-[180px]">
              <div className="text-caption text-text-muted">As-of Valuation Date</div>
              <div className="text-body font-bold text-text-primary tabular-nums">
                {formatDate(snapshot.as_of_date)}
              </div>
              {snapshot.published_at && (
                <div className="text-caption text-text-muted border-t border-border pt-1 mt-1">
                  Published: <span className="font-medium text-text-secondary">{formatDate(snapshot.published_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Row: Recipients, Expiry */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-caption text-text-muted border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-secondary">Recipients:</span>
              <span>{snapshot.recipients?.join(", ") || "Meridian Capital Group (All LP Investors)"}</span>
            </div>
            {snapshot.expiry_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-text-muted" />
                <span>Access Expiry: <strong className="text-text-primary">{formatDate(snapshot.expiry_date)}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* KEY RETURN & CAPITAL METRICS */}
        <div>
          <h2 className="text-caption font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" />
            <span>Executive Capital & Return Summary</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-md border border-border bg-subtle/30 p-4">
              <span className="text-caption font-medium text-text-muted">Target Gross Dev Value</span>
              <div className="text-title font-bold text-text-primary tabular-nums mt-1">
                {formatMoney(snapshot.gross_development_value)}
              </div>
              <span className="text-caption text-text-muted mt-0.5 block">Approved Appraisal</span>
            </div>

            <div className="rounded-md border border-border bg-subtle/30 p-4">
              <span className="text-caption font-medium text-text-muted">Current Forecast Profit</span>
              <div className="text-title font-bold text-success tabular-nums mt-1">
                {formatMoney(snapshot.current_forecast_profit)}
              </div>
              <span className="text-caption text-text-muted mt-0.5 block">Net Project Margin</span>
            </div>

            <div className="rounded-md border border-border bg-subtle/30 p-4">
              <span className="text-caption font-medium text-text-muted">Senior Debt Facility Drawn</span>
              <div className="text-title font-bold text-text-primary tabular-nums mt-1">
                {formatMoney(snapshot.senior_debt_drawn)}
              </div>
              <span className="text-caption text-text-muted mt-0.5 block">Reconciled Loan Draws</span>
            </div>

            <div className="rounded-md border border-border bg-subtle/30 p-4">
              <span className="text-caption font-medium text-text-muted">Total Equity Funded</span>
              <div className="text-title font-bold text-text-primary tabular-nums mt-1">
                {formatMoney(snapshot.equity_funded)}
              </div>
              <span className="text-caption text-text-muted mt-0.5 block">Sponsor & LP Equity</span>
            </div>
          </div>
        </div>

        {/* PROGRESS & DEVELOPMENT NARRATIVE */}
        <div className="space-y-3">
          <h2 className="text-caption font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>Development Status & Site Progress</span>
          </h2>
          <div className="rounded-md border border-border bg-surface p-4 text-body text-text-secondary leading-relaxed space-y-2">
            <p>{snapshot.progress_summary}</p>
          </div>
        </div>

        {/* MILESTONE SCHEDULE SUMMARY (if available) */}
        {snapshot.milestones_summary && snapshot.milestones_summary.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-caption font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Key Milestone Progress</span>
            </h2>
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-left text-body">
                <thead className="bg-subtle border-b border-border text-caption font-semibold text-text-secondary">
                  <tr>
                    <th className="py-2.5 px-4">Milestone</th>
                    <th className="py-2.5 px-4">Forecast Completion</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {snapshot.milestones_summary.map((m, idx) => (
                    <tr key={idx} className="hover:bg-subtle/30">
                      <td className="py-2.5 px-4 font-medium text-text-primary">{m.name}</td>
                      <td className="py-2.5 px-4 text-caption text-text-secondary tabular-nums">
                        {formatDate(m.forecast_end)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-caption font-medium ${
                            m.status === "COMPLETED"
                              ? "bg-success-subtle text-success border border-success-border"
                              : m.status === "IN_PROGRESS"
                              ? "bg-primary-subtle text-primary border border-primary/30"
                              : m.status === "DELAYED"
                              ? "bg-warning-subtle text-warning border border-warning-border"
                              : "bg-subtle text-text-muted border border-border"
                          }`}
                        >
                          {m.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-text-primary">
                        {m.percent_complete}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CAPITAL STACK BREAKDOWN (if available) */}
        {snapshot.capital_stack_summary && (
          <div className="space-y-3">
            <h2 className="text-caption font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" />
              <span>Project Capital Stack</span>
            </h2>
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-left text-body">
                <thead className="bg-subtle border-b border-border text-caption font-semibold text-text-secondary">
                  <tr>
                    <th className="py-2.5 px-4">Layer / Source</th>
                    <th className="py-2.5 px-4 text-right">Committed / Budget</th>
                    <th className="py-2.5 px-4 text-right">Funded / Drawn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-text-primary">Senior Construction Loan</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-text-primary tabular-nums">
                      {formatMoney(snapshot.capital_stack_summary.senior_debt_facility)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-text-secondary tabular-nums">
                      {formatMoney(snapshot.capital_stack_summary.senior_debt_drawn)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-text-primary">Sponsor Equity Commitment</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-text-primary tabular-nums">
                      {formatMoney(snapshot.capital_stack_summary.sponsor_equity)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-text-secondary tabular-nums">
                      {formatMoney(snapshot.capital_stack_summary.sponsor_equity)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-text-primary">Limited Partner (LP) Equity</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-text-primary tabular-nums">
                      {formatMoney(snapshot.capital_stack_summary.lp_equity)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-text-secondary tabular-nums">
                      {formatMoney(snapshot.capital_stack_summary.lp_equity)}
                    </td>
                  </tr>
                  <tr className="bg-subtle/40 font-bold">
                    <td className="py-2.5 px-4 text-text-primary">Total Project Budget / Stack</td>
                    <td className="py-2.5 px-4 text-right text-text-primary tabular-nums">
                      {formatMoney(snapshot.capital_stack_summary.total_budget)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-text-primary tabular-nums">
                      {formatMoney(
                        String(
                          parseInt(snapshot.capital_stack_summary.senior_debt_drawn, 10) +
                            parseInt(snapshot.capital_stack_summary.sponsor_equity, 10) +
                            parseInt(snapshot.capital_stack_summary.lp_equity, 10)
                        )
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SALES & DISPOSITION SUMMARY (if available) */}
        {snapshot.sales_summary && (
          <div className="space-y-3">
            <h2 className="text-caption font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Home className="h-4 w-4 text-primary" />
              <span>Unit Sales & Marketing Disposition</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-md border border-border bg-subtle/20 p-3.5">
                <span className="text-caption text-text-muted">Total Residential Units</span>
                <div className="text-section font-bold text-text-primary tabular-nums mt-0.5">
                  {snapshot.sales_summary.total_units} Units
                </div>
              </div>
              <div className="rounded-md border border-border bg-subtle/20 p-3.5">
                <span className="text-caption text-text-muted">Under Contract</span>
                <div className="text-section font-bold text-primary tabular-nums mt-0.5">
                  {snapshot.sales_summary.contracted_units} Units
                </div>
              </div>
              <div className="rounded-md border border-border bg-subtle/20 p-3.5">
                <span className="text-caption text-text-muted">Closed / Conveyed</span>
                <div className="text-section font-bold text-success tabular-nums mt-0.5">
                  {snapshot.sales_summary.closed_units} Units
                </div>
              </div>
              <div className="rounded-md border border-border bg-subtle/20 p-3.5">
                <span className="text-caption text-text-muted">Target Gross Realization</span>
                <div className="text-section font-bold text-text-primary tabular-nums mt-0.5">
                  {formatMoney(snapshot.sales_summary.gross_sales_value)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MATERIAL DISCLOSURES & NOTES */}
        {snapshot.material_disclosures && snapshot.material_disclosures.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-caption font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-warning" />
              <span>Sponsor Material Disclosures & Schedule Variances</span>
            </h2>
            <div className="rounded-md border border-warning-border/50 bg-warning-subtle/30 p-4 space-y-2.5">
              {snapshot.material_disclosures.map((disclosure, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-body text-text-primary">
                  <span className="h-2 w-2 rounded-full bg-warning shrink-0 mt-2" />
                  <p className="leading-relaxed">{disclosure}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REDACTION & CONFIDENTIALITY FOOTER */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-caption text-text-muted">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-text-muted" />
            <span>
              <strong>Verified Redaction Standard:</strong> Direct trade vendor invoices, bank routing numbers,
              and internal draft comments have been excluded from this report.
            </span>
          </div>
          <div className="tabular-nums">
            ID: {snapshot.id}
          </div>
        </div>

      </div>
    </div>
  );
}
