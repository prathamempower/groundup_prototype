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
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/70";
      case "warning":
        return "bg-amber-50 text-amber-700 border border-amber-200/70";
      case "danger":
        return "bg-rose-50 text-rose-700 border border-rose-200/70";
      case "info":
        return "bg-blue-50 text-blue-700 border border-blue-200/70";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200/80";
    }
  };

  return (
    <div className="pt-2 pb-1 w-full">
      {/* Breadcrumbs if present */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-slate-900 transition-colors font-medium text-slate-500"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-semibold text-slate-700" : ""}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="h-3 w-3 text-slate-300" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>

            {statusBadge && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${getBadgeClasses(
                  statusBadge.variant
                )}`}
              >
                {statusBadge.icon}
                <span>{statusBadge.label}</span>
              </span>
            )}
          </div>

          {(subtitle || description || asOf) && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {(subtitle || description) && <span>{subtitle || description}</span>}
              {asOf && (
                <>
                  {(subtitle || description) && <span className="text-slate-300">•</span>}
                  <span>{asOf.toLowerCase().startsWith("as of") ? asOf : `As of ${asOf}`}</span>
                </>
              )}
            </div>
          )}
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
