"use client";

import React from "react";
import Link from "next/link";
import { GroundUpMark } from "@/components/brand/GroundUpBrand";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
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
  theme = "light",
  showWordmark = true,
  showBadge = false,
  showSubtitle = false,
  className = "",
  iconOnly = false,
  href,
  onClick,
}: BrandLogoProps) {
  const sizeConfig = {
    sm: {
      iconSize: 24,
      title: "text-base font-extrabold",
      badge: "text-[9px] px-1.5 py-0.5",
      subtitle: "text-[10px]",
    },
    md: {
      iconSize: 30,
      title: "text-xl font-black",
      badge: "text-[10px] px-1.5 py-0.5",
      subtitle: "text-[11px]",
    },
    lg: {
      iconSize: 38,
      title: "text-2xl font-black",
      badge: "text-[10px] px-2 py-0.5",
      subtitle: "text-xs",
    },
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Contrast Crisp Emblem Badge */}
      <div className="relative shrink-0 flex items-center justify-center">
        <GroundUpMark size={sizeConfig.iconSize} className="select-none transition-transform group-hover:scale-105" theme={theme} />
      </div>

      {!iconOnly && showWordmark && (
        <div className="flex flex-col min-w-0 select-none">
          <div className="flex items-center gap-1.5">
            <span className={`${sizeConfig.title} tracking-tight leading-none`}>
              <span className={theme === "dark" ? "text-white" : "text-slate-950"}>Ground</span>
              <span className="text-[#0066ee]">Up</span>
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
              className={`${sizeConfig.subtitle} text-slate-500 font-medium leading-none mt-1 truncate`}
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
        title="GroundUp Workspace"
      >
        {content}
      </Link>
    );
  }

  return content;
}
