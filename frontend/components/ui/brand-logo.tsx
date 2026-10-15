"use client";

import React from "react";
import Link from "next/link";
import { GroundUpMark } from "@/components/brand/GroundUpBrand";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  showBadge?: boolean;
  showSubtitle?: boolean;
  className?: string;
  iconOnly?: boolean;
  href?: string;
  onClick?: () => void;
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  showBadge = true,
  showSubtitle = true,
  className = "",
  iconOnly = false,
  href,
  onClick,
}: BrandLogoProps) {
  const sizeConfig = {
    sm: {
      box: "h-7 w-7 rounded-lg p-1",
      iconSize: 20,
      title: "text-xs font-extrabold",
      badge: "text-[8px] px-1 py-0.25",
      subtitle: "text-[9px]",
    },
    md: {
      box: "h-8 w-8 rounded-lg p-1.5",
      iconSize: 22,
      title: "text-sm font-extrabold",
      badge: "text-[9px] px-1 py-0.5",
      subtitle: "text-[10px]",
    },
    lg: {
      box: "h-10 w-10 rounded-xl p-2",
      iconSize: 28,
      title: "text-xl font-extrabold",
      badge: "text-[10px] px-1.5 py-0.5",
      subtitle: "text-[11px]",
    },
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      {/* High-Contrast Crisp Emblem Badge (High-Resolution Vector SVG) */}
      <div
        className={`relative shrink-0 ${sizeConfig.box} bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center transition-all group-hover:border-blue-400 group-hover:shadow-xs`}
      >
        <GroundUpMark size={sizeConfig.iconSize} className="select-none" />
      </div>

      {!iconOnly && showWordmark && (
        <div className="flex flex-col min-w-0 select-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`${sizeConfig.title} tracking-tight text-slate-900 leading-none group-hover:text-blue-600 transition-colors`}
            >
              GroundUp
            </span>
            {showBadge && (
              <span
                className={`rounded bg-blue-50 font-bold text-blue-700 border border-blue-200/70 leading-none ${sizeConfig.badge}`}
              >
                AI
              </span>
            )}
          </div>
          {showSubtitle && (
            <span
              className={`${sizeConfig.subtitle} text-slate-400 font-medium leading-none mt-1 truncate`}
            >
              Enterprise Capital
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="group inline-flex items-center cursor-pointer min-w-0"
        title="GroundUp — Workspace"
      >
        {content}
      </Link>
    );
  }

  return content;
}
