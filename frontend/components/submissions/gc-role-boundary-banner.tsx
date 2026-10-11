"use client";

import React from "react";
import { Shield, ShieldAlert, CheckCircle2, Info } from "lucide-react";
import { UserRole, Project } from "@/lib/types";

interface GcRoleBoundaryBannerProps {
  currentRole: UserRole;
  project?: Project;
}

export function GcRoleBoundaryBanner({ currentRole, project }: GcRoleBoundaryBannerProps) {
  const isGC = currentRole === "GC";
  const contractModelLabel =
    project?.contract_model === "COST_PLUS"
      ? "Cost-Plus (GMP) with 8.5% GC Fee Cap & 10% Retainage"
      : project?.contract_model === "FIXED_PRICE"
      ? "Fixed Price / Stipulated Sum with 10% Retainage"
      : project?.contract_model === "MILESTONE_BASED"
      ? "Milestone-Based Progress Billing with 10% Retainage"
      : project?.contract_model || "Cost Plus";

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary mt-0.5">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-body font-semibold text-text-primary">
                Contract Model & Submission Framework
              </span>
              <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-caption font-medium text-primary">
                {contractModelLabel}
              </span>
            </div>
            <p className="text-caption text-text-secondary mt-0.5">
              Project: <strong>{project?.name || "Current project"}</strong> • Contractor:{" "}
              <strong>Apex Construction Services LLC</strong>
            </p>
          </div>
        </div>

        {isGC ? (
          <div className="flex items-center gap-2 rounded-md bg-warning-subtle/50 px-3 py-1.5 text-caption text-text-secondary border border-warning/20">
            <ShieldAlert className="h-4 w-4 text-warning flex-shrink-0" />
            <span>
              <strong>GC Scope:</strong> Submissions & Evidence Intake Only
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md bg-success-subtle/40 px-3 py-1.5 text-caption text-text-secondary border border-success/20">
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
            <span>
              <strong>Sponsor Control:</strong> 3-Party Governance (PM, CFO, Owner)
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-border text-caption">
        <div className="flex items-center gap-2 text-text-muted">
          <Info className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span><strong>1. Progress Claims:</strong> Require % complete & site photo evidence.</span>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <Info className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span><strong>2. Cost Evidence:</strong> Checks duplicates against master accounting ledger.</span>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <Info className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span><strong>3. Change Orders:</strong> Spawn review tasks for PM, CFO, and Owner.</span>
        </div>
      </div>
    </div>
  );
}
