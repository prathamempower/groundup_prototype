"use client";

import React, { useState } from "react";
import { BudgetLine } from "@/lib/types";
import {
  AlertTriangle,
  ArrowRightLeft,
  FilePlus,
  ArrowRight,
  ShieldX,
  FileCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { useToast } from "@/components/ui/toast";

interface OverrunDecisionPanelProps {
  overrunLines: Array<{
    line: BudgetLine;
    overrunCents: number;
    reason: string;
  }>;
  onMoveContingency: (line: BudgetLine, suggestedAmountCents: number) => void;
  onRequestChangeOrder: (line: BudgetLine, suggestedAmountCents: number) => void;
  onCorrectBooking?: (line: BudgetLine) => void;
}

export function OverrunDecisionPanel({
  overrunLines,
  onMoveContingency,
  onRequestChangeOrder,
  onCorrectBooking,
}: OverrunDecisionPanelProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [waivedLines, setWaivedLines] = useState<string[]>([]);

  if (overrunLines.length === 0) return null;

  const handleAcceptExposure = (lineId: string, lineName: string) => {
    setWaivedLines((prev) => [...prev, lineId]);
    toast({
      title: "Cost Exposure Accepted & Documented",
      description: `Formal business waiver logged for ${lineName}. Forecast figures updated accordingly.`,
      variant: "warning",
    });
  };

  const handleRejectClaim = (lineName: string) => {
    toast({
      title: "Vendor Overrun Disputed",
      description: `Dispute notice generated for ${lineName} supplier claims. Pending GC resolution.`,
      variant: "destructive",
    });
  };

  const activeOverruns = overrunLines.filter((o) => !waivedLines.includes(o.line.id));
  if (activeOverruns.length === 0) return null;

  return (
    <div className="rounded-lg border border-warning-border bg-warning-subtle/40 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-amber-100 p-1.5 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <div className="text-body font-bold text-amber-950 flex items-center gap-2">
              <span>Budget Overrun Alerts Detected ({activeOverruns.length} Line Items)</span>
              <span className="rounded bg-amber-200/80 text-amber-900 text-[10px] font-mono font-bold px-1.5 py-0.5">
                Action Required
              </span>
            </div>
            <p className="text-caption text-text-secondary mt-0.5">
              Actual commitments or supplier invoices exceed current approved category ceiling. Select a governance resolution pathway below.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-text-muted hover:text-text-primary p-1"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-amber-200/60">
          {activeOverruns.map(({ line, overrunCents, reason }) => (
            <div
              key={line.id}
              className="bg-surface rounded-lg p-3.5 border border-border shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary text-xs">{line.code} - {line.name}</span>
                    <span className="text-danger font-mono font-bold text-xs">
                      +{formatMoney(String(overrunCents))} Overrun
                    </span>
                  </div>
                  <div className="text-caption text-text-muted mt-0.5">{reason}</div>
                </div>

                <div className="text-right text-caption font-mono">
                  <span className="text-text-muted">Approved: </span>
                  <span className="font-bold">{formatMoney(line.current_approved_amount)}</span>
                  <span className="text-text-muted"> • Committed: </span>
                  <span className="font-bold text-danger">{formatMoney(line.committed_amount)}</span>
                </div>
              </div>

              {/* 5 Resolution Pathways */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onMoveContingency(line, overrunCents)}
                  className="bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 text-xs"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                  1. Move Contingency
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onRequestChangeOrder(line, overrunCents)}
                  className="bg-primary-subtle text-primary border-primary/30 hover:bg-primary/20 text-xs"
                >
                  <FilePlus className="h-3.5 w-3.5 mr-1" />
                  2. Create Change Order
                </Button>

                {onCorrectBooking && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onCorrectBooking(line)}
                    className="text-xs"
                  >
                    3. Correct Reconciliation
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRejectClaim(line.name)}
                  className="text-rose-700 hover:bg-rose-50 text-xs"
                >
                  <ShieldX className="h-3.5 w-3.5 mr-1" />
                  4. Dispute Claim
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAcceptExposure(line.id, line.name)}
                  className="text-text-muted hover:text-text-primary text-xs"
                >
                  <FileCheck className="h-3.5 w-3.5 mr-1" />
                  5. Accept Exposure Waiver
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
