"use client";

import React, { useState } from "react";
import {
  InvestorContribution,
  InvestorDistribution,
  ProjectEconomics,
} from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import {
  Landmark,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  FileCheck,
  Clock,
  PieChart,
} from "lucide-react";

interface InvestorLedgerPanelProps {
  economics: ProjectEconomics | undefined;
  contributions: InvestorContribution[];
  distributions: InvestorDistribution[];
  onOpenContributionModal: () => void;
  onOpenDistributionModal: () => void;
}

export function InvestorLedgerPanel({
  economics,
  contributions,
  distributions,
  onOpenContributionModal,
  onOpenDistributionModal,
}: InvestorLedgerPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"CONTRIBUTIONS" | "DISTRIBUTIONS">("CONTRIBUTIONS");

  const totalContributions = contributions.reduce((acc, c) => acc + Number(c.amount || 0), 0);
  const totalDistributions = distributions.reduce((acc, d) => acc + Number(d.amount || 0), 0);
  const sponsorInvested = Number(economics?.sponsor_equity_invested || 0);
  const lpInvested = Number(economics?.lp_equity_invested || 0);

  return (
    <div className="space-y-6">
      {/* Capital Stack Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Total Equity Contributed
          </span>
          <div className="text-title font-bold text-text-primary tabular-nums mt-1">
            {formatMoney(String(totalContributions))}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            Sponsor + LP Equity Calls
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Sponsor Equity (GP)
          </span>
          <div className="text-title font-bold text-primary tabular-nums mt-1">
            {formatMoney(String(sponsorInvested))}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            Vance Development LLC
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Limited Partner (LP)
          </span>
          <div className="text-title font-bold text-blue-600 tabular-nums mt-1">
            {formatMoney(String(lpInvested))}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            Institutional Fund Capital
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Total Distributed Returns
          </span>
          <div className="text-title font-bold text-success tabular-nums mt-1">
            {formatMoney(String(totalDistributions))}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            Return of capital + Profit splits
          </div>
        </div>
      </div>

      {/* Sub-tab Switcher & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("CONTRIBUTIONS")}
            className={`px-3 py-1.5 rounded-md text-caption font-semibold transition-colors ${
              activeSubTab === "CONTRIBUTIONS"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:text-text-primary border border-border"
            }`}
          >
            Equity Contributions ({contributions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("DISTRIBUTIONS")}
            className={`px-3 py-1.5 rounded-md text-caption font-semibold transition-colors ${
              activeSubTab === "DISTRIBUTIONS"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:text-text-primary border border-border"
            }`}
          >
            Waterfall Distributions ({distributions.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenContributionModal}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-caption font-medium text-text-primary hover:bg-subtle"
          >
            <Plus className="h-3.5 w-3.5" />
            Record Equity Contribution
          </button>
          <button
            type="button"
            onClick={onOpenDistributionModal}
            className="flex items-center gap-1.5 rounded-md bg-success px-3 py-1.5 text-caption font-medium text-white hover:bg-success/90"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Record Distribution Wire
          </button>
        </div>
      </div>

      {/* View 1: Contributions Register */}
      {activeSubTab === "CONTRIBUTIONS" && (
        <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
          {contributions.length === 0 ? (
            <div className="p-8 text-center text-caption text-text-muted">
              No equity contributions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body">
                <thead>
                  <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
                    <th className="py-3 px-4">Investor / Partner Entity</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Call Tranche Reference</th>
                    <th className="py-3 px-4">Effective Date</th>
                    <th className="py-3 px-4">Wire Reference</th>
                    <th className="py-3 px-4 text-right">Amount ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contributions.map((c) => (
                    <tr key={c.id} className="hover:bg-subtle/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text-primary">
                        {c.investor_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-subtle px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                          {c.investor_type === "SPONSOR" ? "Sponsor (GP)" : "Limited Partner (LP)"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-caption text-text-secondary">
                        {c.call_number}
                      </td>
                      <td className="py-3 px-4 tabular-nums text-caption text-text-secondary">
                        {formatDate(c.effective_date)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-text-muted">
                        {c.wire_reference}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-text-primary">
                        {formatMoney(c.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View 2: Distributions Register */}
      {activeSubTab === "DISTRIBUTIONS" && (
        <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
          {distributions.length === 0 ? (
            <div className="p-8 text-center text-caption text-text-muted">
              No distributions executed yet. Distributions trigger upon unit sales closing and loan payoff.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body">
                <thead>
                  <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
                    <th className="py-3 px-4">Recipient Partner</th>
                    <th className="py-3 px-4">Distribution Tier</th>
                    <th className="py-3 px-4">Disbursement Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Wire Reference</th>
                    <th className="py-3 px-4 text-right">Distributed Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {distributions.map((d) => (
                    <tr key={d.id} className="hover:bg-subtle/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text-primary">
                        {d.investor_name}
                      </td>
                      <td className="py-3 px-4 text-caption">
                        {d.distribution_type === "RETURN_OF_CAPITAL" && (
                          <span className="font-medium text-text-primary">Return of Principal</span>
                        )}
                        {d.distribution_type === "PREFERRED_RETURN" && (
                          <span className="font-medium text-blue-600">8.0% Preferred Return</span>
                        )}
                        {d.distribution_type === "PROFIT_SPLIT" && (
                          <span className="font-medium text-purple-600">Residual Profit Split</span>
                        )}
                      </td>
                      <td className="py-3 px-4 tabular-nums text-caption text-text-secondary">
                        {formatDate(d.effective_date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 text-[11px] font-semibold text-success">
                          <ShieldCheck className="h-3 w-3" /> Cleared Wire
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-text-muted">
                        {d.wire_reference || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-success">
                        {formatMoney(d.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
