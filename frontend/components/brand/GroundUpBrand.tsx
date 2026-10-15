'use client';

import React from 'react';

/**
 * GroundUp AI Brand Identity System
 * Authentic Architectural Monogram & Typography Suite
 * 
 * Assets:
 * - GroundUpMark: Monogram hexagon with rising twin skyscraper towers (Sub Logo)
 * - GroundUpPrimaryLogo: Mark + "GroundUp" (Deep Navy & Electric Azure Blue) lockup
 * - GroundUpSecondaryLogo: Compact horizontal lockup with role/status badge
 * - GroundUpSubLogo: Architectural stamp variant with coordinate frame
 * - GroundUpFavicon: Tab & icon renderer
 * 
 * Brand Colors:
 * - Ground Navy: #041f39 (Dark theme: #ffffff)
 * - Up Electric Blue: #0075ff (Accent: #0066ee)
 * 
 * Rules:
 * - Zero em dashes.
 * - Role based corporate titles only: Developer / Owner, Finance Controller, Super Admin.
 */

export interface BrandProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
  monochrome?: boolean;
  onClick?: () => void;
}

const SIZE_MAP: Record<string, number> = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
};

function resolveSize(size?: number | 'sm' | 'md' | 'lg' | 'xl', fallback = 32): number {
  if (typeof size === 'number') return size;
  if (typeof size === 'string' && SIZE_MAP[size]) return SIZE_MAP[size];
  return fallback;
}

// ── 1. Sub Logo / Mark (Architectural Monogram) ─────────────────────────────
export const GroundUpMark: React.FC<{
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  monochrome?: boolean;
}> = ({
  size = 32,
  className = '',
  theme = 'auto',
  monochrome = false,
}) => {
  const pixelSize = resolveSize(size, 32);
  const navyColor = monochrome ? 'currentColor' : theme === 'dark' ? '#ffffff' : '#041f39';
  const blueColor = monochrome ? 'currentColor' : '#0075ff';

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 select-none ${className}`}
      aria-label="GroundUp Emblem"
    >
      {/* Stylized Hexagonal G Foundation (Navy) */}
      <path
        fill={navyColor}
        fillRule="evenodd"
        className={theme === 'auto' ? 'dark:fill-white' : ''}
        d="
          M 36 12
          L 7 27
          L 7 55
          L 30 68
          L 49 57
          L 49 39
          L 27 39
          L 27 45
          L 41 45
          L 41 52
          L 30 58
          L 16 50
          L 16 32
          L 36 22
          Z
        "
      />

      {/* Skyscraper Tower 1 (Middle Blue) */}
      <path
        fill={blueColor}
        d="
          M 41 9
          L 52 4
          L 52 35
          L 41 30
          Z
        "
      />

      {/* Skyscraper Tower 2 (Right Blue) */}
      <path
        fill={blueColor}
        d="
          M 56 12
          L 65 17
          L 65 55
          L 56 60
          Z
        "
      />
    </svg>
  );
};

// ── 2. Primary Logo (Mark + GroundUp Wordmark Lockup) ────────────────────────
export const GroundUpPrimaryLogo: React.FC<BrandProps> = ({
  className = '',
  size = 'md',
  theme = 'auto',
  showSubtitle = false,
  monochrome = false,
  onClick,
}) => {
  const markSize = resolveSize(size, 32);
  const navyText = theme === 'dark' ? 'text-white' : theme === 'auto' ? 'text-[#041f39] dark:text-white' : 'text-[#041f39]';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      aria-label="GroundUp"
    >
      <GroundUpMark size={markSize} theme={theme} monochrome={monochrome} />
      <div className="flex flex-col text-left leading-none">
        <div className="flex items-baseline gap-1">
          <span className={`font-bold tracking-tight text-xl ${navyText}`}>
            Ground<span className="text-[#0075ff]">Up</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] font-sans font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mt-1">
            Construction Intelligence
          </span>
        )}
      </div>
    </div>
  );
};

// ── 3. Secondary Logo (Horizontal Lockup with Status Divider) ────────────────
export const GroundUpSecondaryLogo: React.FC<BrandProps> = ({
  className = '',
  size = 'sm',
  theme = 'auto',
  monochrome = false,
  onClick,
}) => {
  const markSize = resolveSize(size, 26);
  const navyText = theme === 'dark' ? 'text-white' : theme === 'auto' ? 'text-[#041f39] dark:text-white' : 'text-[#041f39]';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      aria-label="GroundUp Secondary"
    >
      <GroundUpMark size={markSize} theme={theme} monochrome={monochrome} />
      <div className="flex items-center gap-2">
        <span className={`font-bold text-lg tracking-tight ${navyText}`}>
          Ground<span className="text-[#0075ff]">Up</span>
        </span>
        <span className="text-slate-300 dark:text-slate-600 font-light">|</span>
        <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
          Audit Sync
        </span>
      </div>
    </div>
  );
};

// ── 4. Sub Logo (Architectural Circular Stamp) ──────────────────────────────
export const GroundUpSubLogo: React.FC<{
  size?: number;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}> = ({
  size = 48,
  className = '',
  theme = 'auto',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-2 ${className}`}
      style={{ width: size, height: size }}
      aria-label="GroundUp Sub Logo"
    >
      <GroundUpMark size={size * 0.72} theme={theme} />
    </div>
  );
};

// ── 5. Scalable Favicon Component ───────────────────────────────────────────
export const GroundUpFavicon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return <GroundUpMark size={size} className={className} />;
};

// Legacy Aliases for backwards compatibility
export const GroundUpMonogram = GroundUpMark;
export default GroundUpPrimaryLogo;
