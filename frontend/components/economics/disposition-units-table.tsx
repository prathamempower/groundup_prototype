"use client";

import React from "react";
import { DispositionUnit } from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import { Home, FileText, CheckCircle, Clock, Plus, ExternalLink } from "lucide-react";

interface DispositionUnitsTableProps {
  units: DispositionUnit[];
  onOpenRecordSaleModal: (unit: DispositionUnit) => void;
}

export function DispositionUnitsTable({
  units,
  onOpenRecordSaleModal,
}: DispositionUnitsTableProps) {
  const totalSalesPrice = units.reduce(
    (acc, u) => acc + (u.status === "CLOSED" ? Number(u.contract_sale_price) : 0),
    0
  );
  const totalNetProceeds = units.reduce(
    (acc, u) => acc + (u.status === "CLOSED" ? Number(u.net_proceeds) : 0),
    0
  );
  const closedCount = units.filter((u) => u.status === "CLOSED").length;

  return (
    <div className="space-y-4">
      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Closed Sales Volume
          </span>
          <div className="text-title font-bold text-text-primary tabular-nums mt-1">
            {formatMoney(String(totalSalesPrice))}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {closedCount} of {units.length} units closed & funded
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Realized Net Proceeds
          </span>
          <div className="text-title font-bold text-success tabular-nums mt-1">
            {formatMoney(String(totalNetProceeds))}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            After broker commissions & NYC transfer taxes
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Pipeline Absorption
          </span>
          <div className="text-title font-bold text-primary tabular-nums mt-1">
            {Math.round((closedCount / Math.max(1, units.length)) * 100)}%
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {units.length - closedCount} units active / under contract
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body">
            <thead>
              <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
                <th className="py-3 px-4">Unit Identifier & Layout</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Contract Price</th>
                <th className="py-3 px-4">Purchaser / Buyer</th>
                <th className="py-3 px-4">HUD-1 Settlement</th>
                <th className="py-3 px-4 text-right">Net Proceeds</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {units.map((unit) => (
                <tr key={unit.id} className="hover:bg-subtle/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-text-primary">
                      {unit.unit_identifier}
                    </div>
                    <div className="text-caption text-text-secondary">
                      {unit.unit_type} &bull; {unit.sqft} SQFT
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {unit.status === "CLOSED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-[11px] font-semibold text-success">
                        <CheckCircle className="h-3 w-3" /> Closed
                      </span>
                    )}
                    {unit.status === "UNDER_CONTRACT" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        <Clock className="h-3 w-3" /> Under Contract
                      </span>
                    )}
                    {unit.status === "AVAILABLE" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-0.5 text-[11px] font-semibold text-text-muted">
                        Available
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-text-primary">
                    {formatMoney(unit.contract_sale_price || unit.original_list_price)}
                  </td>

                  <td className="py-3.5 px-4 text-caption text-text-secondary">
                    {unit.buyer_name || <span className="text-text-muted italic">Unassigned</span>}
                    {unit.closing_date && (
                      <div className="text-[11px] text-text-muted">
                        Closed {formatDate(unit.closing_date)}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-caption">
                    {unit.settlement_document_name ? (
                      <div className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
                        <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {unit.settlement_document_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-muted text-[11px]">Pending closing</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right tabular-nums font-bold text-success">
                    {formatMoney(unit.net_proceeds || "0")}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenRecordSaleModal(unit)}
                      className="rounded px-2.5 py-1 text-caption font-medium text-primary hover:bg-primary-subtle transition-colors"
                    >
                      Update Sale
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
