import * as React from "react";
import { AlertTriangle, Info, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BannerProps {
  variant?: "warning" | "danger" | "info" | "success";
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function Banner({
  variant = "warning",
  title,
  message,
  actionLabel,
  onAction,
  className,
}: BannerProps) {
  const getStyles = () => {
    switch (variant) {
      case "danger":
        return {
          wrapper: "border-danger/40 bg-danger-subtle text-danger",
          icon: AlertCircle,
          action: "text-danger hover:underline font-semibold",
        };
      case "success":
        return {
          wrapper: "border-success/40 bg-success-subtle text-success",
          icon: CheckCircle2,
          action: "text-success hover:underline font-semibold",
        };
      case "info":
        return {
          wrapper: "border-info/40 bg-info-subtle text-info",
          icon: Info,
          action: "text-info hover:underline font-semibold",
        };
      default: // warning
        return {
          wrapper: "border-warning/40 bg-warning-subtle text-warning",
          icon: AlertTriangle,
          action: "text-warning hover:underline font-semibold",
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 shadow-xs",
        styles.wrapper,
        className
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <div className="text-body font-semibold">{title}</div>}
        <div className="text-caption text-text-primary mt-0.5">{message}</div>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className={cn(
            "flex items-center gap-1 text-caption flex-shrink-0 focus-visible:outline-primary",
            styles.action
          )}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
