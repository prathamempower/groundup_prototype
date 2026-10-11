import * as React from "react";
import Link from "next/link";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  illustrationType?: "documents" | "transactions" | "draws" | "milestones" | "general";
  className?: string;
}

export function EmptyStateIllustration({ type = "general" }: { type?: EmptyStateProps["illustrationType"] }) {
  if (type === "documents") {
    return (
      <svg className="h-28 w-28 text-primary/10" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="20" width="70" height="80" rx="8" fill="currentColor" />
        <rect x="35" y="15" width="70" height="80" rx="8" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <path d="M48 35H82M48 45H82M48 55H70" stroke="var(--primary-accent)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="85" cy="75" r="14" fill="var(--primary-subtle)" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M85 70V80M80 75H90" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "draws" || type === "transactions") {
    return (
      <svg className="h-28 w-28 text-primary/10" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="45" fill="currentColor" />
        <circle cx="60" cy="60" r="38" fill="var(--bg-surface)" stroke="var(--border)" strokeWidth="1.5" />
        <rect x="42" y="52" width="36" height="22" rx="4" fill="var(--primary-subtle)" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M42 58H78" stroke="var(--primary)" strokeWidth="1.5" />
        <circle cx="50" cy="65" r="2" fill="var(--primary)" />
      </svg>
    );
  }

  return (
    <svg className="h-28 w-28 text-primary/10" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="30" width="80" height="60" rx="10" fill="currentColor" />
      <rect x="24" y="34" width="72" height="52" rx="8" fill="var(--bg-surface)" stroke="var(--border)" strokeWidth="1.5" />
      <path d="M40 54H80M40 66H65" stroke="var(--primary-accent)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="24" r="8" fill="var(--primary-subtle)" stroke="var(--primary)" strokeWidth="1.5" />
    </svg>
  );
}

export function ModernEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  illustrationType = "general",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-gradient-to-b from-surface to-subtle/30 shadow-xs",
        className
      )}
    >
      <div className="mb-4">
        <EmptyStateIllustration type={illustrationType} />
      </div>

      <h3 className="text-section font-bold text-text-primary">{title}</h3>
      <p className="mt-1.5 max-w-sm text-body text-text-secondary leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <div className="mt-6">
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
