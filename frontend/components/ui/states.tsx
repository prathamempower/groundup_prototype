import * as React from "react";
import Link from "next/link";
import { AlertCircle, Ban, ArrowRight, RefreshCw, Inbox } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

// 1. Empty State
export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed border-border bg-surface",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-text-muted mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-section font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-body text-text-secondary">{description}</p>

      {actionLabel && (
        <div className="mt-5">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary">{actionLabel}</Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// 2. Skeleton Component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-subtle", className)}
      {...props}
    />
  );
}

// 3. Error State
export interface ErrorStateProps {
  title?: string;
  message: string;
  resolutionText?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Unable to complete request",
  message,
  resolutionText,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-lg border border-danger/30 bg-danger-subtle/30",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-subtle text-danger mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-section font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-md text-body text-danger font-medium">{message}</p>
      {resolutionText && (
        <p className="mt-1 max-w-md text-caption text-text-secondary">
          {resolutionText}
        </p>
      )}

      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}

// 4. Blocked State (Prerequisite Missing)
export interface BlockedStateProps {
  title?: string;
  reason: string;
  prerequisiteLabel: string;
  prerequisiteHref?: string;
  onConfigurePrerequisite?: () => void;
  className?: string;
}

export function BlockedState({
  title = "Action Blocked",
  reason,
  prerequisiteLabel,
  prerequisiteHref,
  onConfigurePrerequisite,
  className,
}: BlockedStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-lg border border-warning/40 bg-warning-subtle/30",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-subtle text-warning mb-3">
        <Ban className="h-5 w-5" />
      </div>
      <h3 className="text-section font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-md text-body text-text-secondary">{reason}</p>

      <div className="mt-4">
        {prerequisiteHref ? (
          <Link href={prerequisiteHref}>
            <Button variant="secondary" size="sm">
              <span>{prerequisiteLabel}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        ) : (
          <Button variant="secondary" size="sm" onClick={onConfigurePrerequisite}>
            <span>{prerequisiteLabel}</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

export { ModernEmptyState } from "./modern-empty-state";
