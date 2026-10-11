import * as React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileQuestion,
  Ban,
  DollarSign,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusBadgeType =
  | "verified"
  | "provisional"
  | "proposed"
  | "missing_evidence"
  | "blocked"
  | "funded"
  | "short_funded"
  | "under_review";

interface StatusBadgeConfig {
  label: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BADGE_CONFIGS: Record<StatusBadgeType, StatusBadgeConfig> = {
  verified: {
    label: "Verified",
    className: "bg-success-subtle text-success border-success/30",
    icon: CheckCircle2,
  },
  provisional: {
    label: "Provisional",
    className: "bg-warning-subtle text-warning border-warning/30",
    icon: AlertTriangle,
  },
  proposed: {
    label: "Proposed",
    className: "bg-info-subtle text-info border-info/30",
    icon: Sparkles,
  },
  missing_evidence: {
    label: "Missing evidence",
    className: "bg-danger-subtle text-danger border-danger/30",
    icon: FileQuestion,
  },
  blocked: {
    label: "Blocked",
    className: "bg-danger-subtle text-danger border-danger/30",
    icon: Ban,
  },
  funded: {
    label: "Funded",
    className: "bg-success-subtle text-success border-success/30",
    icon: CheckCircle2,
  },
  short_funded: {
    label: "Short-funded",
    className: "bg-warning-subtle text-warning border-warning/30",
    icon: AlertCircle,
  },
  under_review: {
    label: "Under review",
    className: "bg-info-subtle text-info border-info/30",
    icon: Clock,
  },
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusBadgeType;
  customLabel?: string;
}

export function StatusBadge({ status, customLabel, className, ...props }: StatusBadgeProps) {
  const config = BADGE_CONFIGS[status] || BADGE_CONFIGS.provisional;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-sm border px-2.5 py-0.5 text-caption font-semibold select-none shadow-xs transition-colors",
        config.className,
        className
      )}
      {...props}
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{customLabel || config.label}</span>
    </span>
  );
}
