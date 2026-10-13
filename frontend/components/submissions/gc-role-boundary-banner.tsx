"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { UserRole, Project } from "@/lib/types";

interface GcRoleBoundaryBannerProps {
  currentRole: UserRole;
  project?: Project;
}

export function GcRoleBoundaryBanner({ currentRole, project }: GcRoleBoundaryBannerProps) {
  const isGC = currentRole === "GC";
  const contractModelLabel =
    project?.contract_model === "COST_PLUS"
      ? "Cost-Plus (GMP) · 8.5% Fee Cap"
      : project?.contract_model === "FIXED_PRICE"
      ? "Fixed Price · Stipulated Sum"
      : project?.contract_model === "MILESTONE_BASED"
      ? "Milestone-Based Progress Billing"
      : project?.contract_model || "Cost Plus (GMP)";

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Contract & Project Metadata */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              {contractModelLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              10% Retainage Withheld
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/50">
              Active Framework
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
            <span>
              Entity: <strong className="text-slate-700 font-medium">{project?.project_entity || project?.name || "Active Development Entity"}</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              Contractor: <strong className="text-slate-700 font-medium">Apex Build Corp</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-[11px] text-slate-400">
              Proj #{project?.id ? project.id.slice(0, 8) : "161-JC"}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Governance & Workflow Scope */}
      <div className="shrink-0 flex items-center gap-2">
        {isGC ? (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800 border border-amber-200/70">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              Intake Scope: <strong>Submit claims & itemized receipts</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-700 border border-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              3-Tier Governance: <strong className="text-slate-900 font-semibold">PM · CFO · Owner Approvals</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
