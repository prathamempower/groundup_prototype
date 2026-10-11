"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  statusBadge?: {
    label: string;
    variant: "success" | "warning" | "danger" | "info" | "neutral";
    icon?: React.ReactNode;
  };
  asOf?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  actions?: React.ReactNode;
  description?: string;
  subtitle?: string;
}

export function PageHeader({
  title,
  statusBadge,
  asOf,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  actions,
  description,
  subtitle,
}: PageHeaderProps) {
  const getBadgeClasses = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-success-subtle text-success border border-success/30";
      case "warning":
        return "bg-warning-subtle text-warning border border-warning/30";
      case "danger":
        return "bg-danger-subtle text-danger border border-danger/30";
      case "info":
        return "bg-info-subtle text-info border border-info/30";
      default:
        return "bg-subtle text-text-secondary border border-border";
    }
  };

  return (
    <div className="border-b border-border bg-surface px-6 py-5 shadow-xs">
      {/* Breadcrumbs if present */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2.5 flex items-center gap-1.5 text-caption text-text-muted">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-primary transition-colors focus-visible:outline-primary font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-semibold text-text-primary" : ""}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="h-3 w-3 text-text-muted" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-title font-bold tracking-tight text-text-primary">
              {title}
            </h1>

            {statusBadge && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-semibold shadow-xs ${getBadgeClasses(
                  statusBadge.variant
                )}`}
              >
                {statusBadge.icon}
                {statusBadge.label}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-caption text-text-muted">
            {asOf && <span>{asOf.toLowerCase().startsWith("as of") ? asOf : `As of ${asOf}`}</span>}
            {(description || subtitle) && (
              <>
                {asOf && <span>•</span>}
                <span>{subtitle || description}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(primaryAction || secondaryActions || actions) && (
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {actions}
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>
    </div>
  );
}
