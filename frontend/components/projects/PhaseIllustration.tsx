'use client';

import React from 'react';
import { ProjectPhase } from '@/lib/types';

interface PhaseIllustrationProps {
  phase: ProjectPhase;
  active: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PRE-ACQUISITION: Feasibility study, cadastral boundary & LOI draft
// ─────────────────────────────────────────────────────────────────────────────
export function PreAcquisitionSvg({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 160 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="preacq-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={active ? '#0284c7' : '#94a3b8'} strokeWidth="0.5" strokeOpacity="0.18" />
        </pattern>
      </defs>
      <rect width="160" height="100" rx="8" fill="url(#preacq-grid)" />

      {/* Topographic Contour Curves */}
      <path
        d="M 10 75 Q 45 60 80 72 T 150 65"
        stroke={active ? '#38bdf8' : '#cbd5e1'}
        strokeWidth="1"
        strokeDasharray="2 2"
        fill="none"
      />
      <path
        d="M 10 88 Q 50 78 95 86 T 150 82"
        stroke={active ? '#0284c7' : '#94a3b8'}
        strokeWidth="1.2"
        fill="none"
      />

      {/* Cadastral Lot Boundary Polygon */}
      <polygon
        points="24,28 78,18 96,62 38,72"
        fill={active ? 'rgba(14, 165, 233, 0.08)' : 'rgba(241, 245, 249, 0.6)'}
        stroke={active ? '#0284c7' : '#64748b'}
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />

      {/* Lot Corner Boundary Survey Pins */}
      {[
        [24, 28],
        [78, 18],
        [96, 62],
        [38, 72],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="2.5" fill={active ? '#0284c7' : '#64748b'} />
          <circle cx={cx} cy={cy} r="4.5" stroke={active ? '#38bdf8' : '#94a3b8'} strokeWidth="0.8" fill="none" />
        </g>
      ))}

      {/* Feasibility Pro Forma Card */}
      <g transform="translate(86, 22)">
        <rect
          width="62"
          height="62"
          rx="5"
          fill={active ? '#ffffff' : '#f8fafc'}
          stroke={active ? '#0f172a' : '#cbd5e1'}
          strokeWidth="1.2"
        />
        <rect x="6" y="8" width="30" height="4" rx="1" fill={active ? '#0f172a' : '#64748b'} />
        <rect x="40" y="8" width="16" height="4" rx="1" fill={active ? '#0284c7' : '#94a3b8'} />
        <line x1="6" y1="18" x2="56" y2="18" stroke={active ? '#e2e8f0' : '#cbd5e1'} strokeWidth="1" />
        <rect x="6" y="24" width="22" height="3" rx="0.5" fill={active ? '#64748b' : '#94a3b8'} />
        <rect x="36" y="24" width="20" height="3" rx="0.5" fill={active ? '#0f172a' : '#64748b'} />
        <rect x="6" y="32" width="26" height="3" rx="0.5" fill={active ? '#64748b' : '#94a3b8'} />
        <rect x="38" y="32" width="18" height="3" rx="0.5" fill={active ? '#0f172a' : '#64748b'} />
        <line x1="6" y1="42" x2="56" y2="42" stroke={active ? '#0f172a' : '#cbd5e1'} strokeWidth="1" />
        <rect x="6" y="47" width="24" height="4" rx="1" fill={active ? '#0284c7' : '#64748b'} />
        <rect x="34" y="47" width="22" height="4" rx="1" fill={active ? '#10b981' : '#10b981'} />
      </g>

      {/* LOI Draft Planning Pill */}
      <g transform="translate(14, 12)">
        <rect
          width="54"
          height="14"
          rx="7"
          fill={active ? '#0f172a' : '#f1f5f9'}
          stroke={active ? '#334155' : '#cbd5e1'}
          strokeWidth="1"
        />
        <circle cx="8" cy="7" r="2.5" fill="#38bdf8" />
        <text x="14" y="9.5" fill={active ? '#f8fafc' : '#475569'} fontSize="6" fontWeight="bold" fontFamily="sans-serif">
          LOI PLANNING
        </text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ACQUISITION: Executed Title, Land Settlement Deed & Property Closing
// ─────────────────────────────────────────────────────────────────────────────
export function AcquisitionSvg({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 160 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="acq-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={active ? '#059669' : '#94a3b8'} strokeWidth="0.5" strokeOpacity="0.15" />
        </pattern>
      </defs>
      <rect width="160" height="100" rx="8" fill="url(#acq-grid)" />

      {/* Settlement Deed Document Sheet */}
      <g transform="translate(20, 14)">
        <rect
          width="76"
          height="72"
          rx="4"
          fill={active ? '#ffffff' : '#f8fafc'}
          stroke={active ? '#0f172a' : '#cbd5e1'}
          strokeWidth="1.4"
        />
        <rect x="8" y="10" width="34" height="4.5" rx="1" fill={active ? '#0f172a' : '#64748b'} />
        <rect x="46" y="10" width="22" height="4.5" rx="1" fill={active ? '#059669' : '#94a3b8'} />
        <line x1="8" y1="21" x2="68" y2="21" stroke={active ? '#e2e8f0' : '#cbd5e1'} strokeWidth="1" />

        <rect x="8" y="27" width="60" height="2.5" rx="0.5" fill={active ? '#64748b' : '#94a3b8'} />
        <rect x="8" y="34" width="52" height="2.5" rx="0.5" fill={active ? '#64748b' : '#94a3b8'} />
        <rect x="8" y="41" width="56" height="2.5" rx="0.5" fill={active ? '#64748b' : '#94a3b8'} />

        {/* Notary Ribbon Seal */}
        <g transform="translate(48, 48)">
          <polygon points="6,14 10,22 14,14 12,18 8,18" fill={active ? '#dc2626' : '#94a3b8'} />
          <circle cx="10" cy="10" r="7" fill={active ? '#b91c1c' : '#94a3b8'} />
          <circle cx="10" cy="10" r="5" stroke="#ffffff" strokeWidth="0.8" fill="none" />
        </g>

        {/* Signature Line */}
        <line x1="8" y1="58" x2="42" y2="58" stroke={active ? '#0f172a' : '#64748b'} strokeWidth="1.2" />
        <path d="M 12 55 Q 18 49 24 55 T 36 53" stroke={active ? '#2563eb' : '#64748b'} strokeWidth="1" fill="none" />
      </g>

      {/* Property Key Graphic */}
      <g transform="translate(108, 22)">
        <circle
          cx="22"
          cy="18"
          r="13"
          stroke={active ? '#d97706' : '#64748b'}
          strokeWidth="2.5"
          fill={active ? 'rgba(245, 158, 11, 0.12)' : 'none'}
        />
        <circle cx="22" cy="18" r="6" stroke={active ? '#d97706' : '#64748b'} strokeWidth="1.5" fill="none" />
        {/* Key Shaft & Teeth */}
        <line x1="22" y1="31" x2="22" y2="68" stroke={active ? '#d97706' : '#64748b'} strokeWidth="3" strokeLinecap="round" />
        <rect x="22" y="52" width="9" height="3" rx="0.5" fill={active ? '#d97706' : '#64748b'} />
        <rect x="22" y="60" width="7" height="3" rx="0.5" fill={active ? '#d97706' : '#64748b'} />
      </g>

      {/* Deed Recorded Badge */}
      <g transform="translate(18, 76)">
        <rect
          width="68"
          height="14"
          rx="7"
          fill={active ? '#ecfdf5' : '#f1f5f9'}
          stroke={active ? '#10b981' : '#cbd5e1'}
          strokeWidth="1"
        />
        <circle cx="8" cy="7" r="2.5" fill="#059669" />
        <text x="14" y="9.5" fill={active ? '#065f46' : '#475569'} fontSize="6" fontWeight="bold" fontFamily="sans-serif">
          DEED RECORDED
        </text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PERMITTING: Architectural blueprint sheet, 30-60 ruler & municipal seal
// ─────────────────────────────────────────────────────────────────────────────
export function PermittingSvg({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 160 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="permit-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={active ? '#0284c7' : '#94a3b8'} strokeWidth="0.5" strokeOpacity="0.16" />
        </pattern>
      </defs>
      <rect width="160" height="100" rx="8" fill="url(#permit-grid)" />

      {/* Architectural Plan Sheet */}
      <g transform="translate(18, 14)">
        <rect
          width="74"
          height="72"
          rx="4"
          fill={active ? '#0f172a' : '#f8fafc'}
          stroke={active ? '#38bdf8' : '#cbd5e1'}
          strokeWidth="1.4"
        />
        {/* Elevation Blueprint Lines */}
        <rect x="12" y="14" width="50" height="44" stroke={active ? '#38bdf8' : '#94a3b8'} strokeWidth="1" strokeDasharray="2 2" fill="none" />
        <line x1="12" y1="36" x2="62" y2="36" stroke={active ? '#38bdf8' : '#94a3b8'} strokeWidth="1.2" />
        <line x1="37" y1="14" x2="37" y2="58" stroke={active ? '#38bdf8' : '#94a3b8'} strokeWidth="1.2" />

        {/* Windows / Units */}
        <rect x="18" y="20" width="12" height="10" rx="1" fill={active ? 'rgba(56, 189, 248, 0.25)' : '#e2e8f0'} />
        <rect x="44" y="20" width="12" height="10" rx="1" fill={active ? 'rgba(56, 189, 248, 0.25)' : '#e2e8f0'} />
        <rect x="18" y="42" width="12" height="10" rx="1" fill={active ? 'rgba(56, 189, 248, 0.25)' : '#e2e8f0'} />
        <rect x="44" y="42" width="12" height="10" rx="1" fill={active ? 'rgba(56, 189, 248, 0.25)' : '#e2e8f0'} />
      </g>

      {/* Drafting 30-60 Triangle Ruler */}
      <g transform="translate(94, 18)">
        <polygon
          points="0,58 38,58 0,10"
          fill={active ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.12)'}
          stroke={active ? '#0284c7' : '#64748b'}
          strokeWidth="1.5"
        />
        <polygon points="5,53 26,53 5,24" fill="#ffffff" stroke={active ? '#0284c7' : '#94a3b8'} strokeWidth="1" />
        <line x1="0" y1="18" x2="3" y2="18" stroke={active ? '#0284c7' : '#64748b'} strokeWidth="1" />
        <line x1="0" y1="28" x2="3" y2="28" stroke={active ? '#0284c7' : '#64748b'} strokeWidth="1" />
        <line x1="0" y1="38" x2="3" y2="38" stroke={active ? '#0284c7' : '#64748b'} strokeWidth="1" />
        <line x1="0" y1="48" x2="3" y2="48" stroke={active ? '#0284c7' : '#64748b'} strokeWidth="1" />
      </g>

      {/* Municipal Permit Stamp Seal */}
      <g transform="translate(104, 52)">
        <circle
          cx="18"
          cy="18"
          r="16"
          fill={active ? '#fef3c7' : '#f1f5f9'}
          stroke={active ? '#d97706' : '#94a3b8'}
          strokeWidth="1.5"
          strokeDasharray="3 1.5"
        />
        <text x="18" y="15" textAnchor="middle" fill={active ? '#92400e' : '#475569'} fontSize="5.5" fontWeight="bold">
          PERMIT
        </text>
        <text x="18" y="23" textAnchor="middle" fill={active ? '#b45309' : '#64748b'} fontSize="4.5" fontWeight="bold">
          APPROVED
        </text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ACTIVE CONSTRUCTION: Tower crane, structural steel columns & live draw badge
// ─────────────────────────────────────────────────────────────────────────────
export function ActiveConstructionSvg({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 160 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="active-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={active ? '#0f172a' : '#94a3b8'} strokeWidth="0.5" strokeOpacity="0.15" />
        </pattern>
      </defs>
      <rect width="160" height="100" rx="8" fill="url(#active-grid)" />

      {/* Ground Foundation Line */}
      <line x1="10" y1="88" x2="150" y2="88" stroke={active ? '#0f172a' : '#64748b'} strokeWidth="2" strokeDasharray="3 3" />
      <rect x="22" y="86" width="65" height="4" rx="1" fill={active ? '#0f172a' : '#94a3b8'} />

      {/* Structural Steel Columns */}
      <rect x="28" y="42" width="4" height="44" rx="1" fill={active ? '#0f172a' : '#64748b'} />
      <rect x="50" y="42" width="4" height="44" rx="1" fill={active ? '#0f172a' : '#64748b'} />
      <rect x="72" y="54" width="4" height="32" rx="1" fill={active ? '#0f172a' : '#64748b'} />

      {/* Horizontal Structural Beams */}
      <line x1="26" y1="66" x2="76" y2="66" stroke={active ? '#0f172a' : '#64748b'} strokeWidth="2.5" />
      <line x1="26" y1="48" x2="54" y2="48" stroke={active ? '#0f172a' : '#64748b'} strokeWidth="2.5" />

      {/* Cross Bracing Tension Cables */}
      <line x1="30" y1="66" x2="48" y2="86" stroke={active ? '#3b82f6' : '#94a3b8'} strokeWidth="1" strokeDasharray="2 2" />
      <line x1="48" y1="66" x2="30" y2="86" stroke={active ? '#3b82f6' : '#94a3b8'} strokeWidth="1" strokeDasharray="2 2" />

      {/* Tower Crane Mast */}
      <rect x="100" y="16" width="5" height="72" rx="1" fill={active ? '#d97706' : '#94a3b8'} />
      <path d="M 100 28 L 105 38 M 100 48 L 105 58 M 100 68 L 105 78" stroke="#ffffff" strokeWidth="1" />

      {/* Crane Jib */}
      <line x1="68" y1="16" x2="136" y2="16" stroke={active ? '#d97706' : '#94a3b8'} strokeWidth="3" strokeLinecap="round" />
      <rect x="125" y="12" width="8" height="8" rx="1" fill={active ? '#0f172a' : '#64748b'} />
      <polygon points="102,6 88,16 116,16" fill="none" stroke={active ? '#d97706' : '#94a3b8'} strokeWidth="1.5" />

      {/* Hoist Trolley, Cable & Suspended I-Beam */}
      <rect x="80" y="15" width="5" height="3" rx="0.5" fill={active ? '#0f172a' : '#64748b'} />
      <line x1="82.5" y1="18" x2="82.5" y2="38" stroke={active ? '#0f172a' : '#64748b'} strokeWidth="1" strokeDasharray="1 1" />
      <rect x="76" y="38" width="13" height="3" rx="1" fill={active ? '#f59e0b' : '#64748b'} />

      {/* Active Draw / Verification Badge Pill */}
      <g transform="translate(16, 12)">
        <rect
          width="58"
          height="16"
          rx="8"
          fill={active ? '#0f172a' : '#f1f5f9'}
          stroke={active ? '#334155' : '#cbd5e1'}
          strokeWidth="1"
        />
        <circle cx="8" cy="8" r="3" fill="#10b981" />
        <text x="15" y="11" fill={active ? '#f8fafc' : '#475569'} fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
          Draw Active
        </text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. POST-CONSTRUCTION: Finished building facade, C.O. seal & handover badge
// ─────────────────────────────────────────────────────────────────────────────
export function PostConstructionSvg({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 160 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="post-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={active ? '#10b981' : '#94a3b8'} strokeWidth="0.5" strokeOpacity="0.15" />
        </pattern>
      </defs>
      <rect width="160" height="100" rx="8" fill="url(#post-grid)" />

      {/* Finished Modern Architectural Building */}
      <g transform="translate(24, 12)">
        {/* Main Tower Massing */}
        <rect
          x="10"
          y="6"
          width="60"
          height="74"
          rx="3"
          fill={active ? '#ffffff' : '#f8fafc'}
          stroke={active ? '#0f172a' : '#cbd5e1'}
          strokeWidth="1.5"
        />
        {/* Rooftop Parapet / Canopy */}
        <rect x="6" y="2" width="68" height="5" rx="1.5" fill={active ? '#0f172a' : '#64748b'} />

        {/* Vertical Architectural Louvers */}
        <line x1="30" y1="7" x2="30" y2="80" stroke={active ? '#e2e8f0' : '#cbd5e1'} strokeWidth="1" />
        <line x1="50" y1="7" x2="50" y2="80" stroke={active ? '#e2e8f0' : '#cbd5e1'} strokeWidth="1" />

        {/* Architectural Windows (Finished Reflective Panes) */}
        {[
          [16, 14], [36, 14], [56, 14],
          [16, 28], [36, 28], [56, 28],
          [16, 42], [36, 42], [56, 42],
          [16, 56], [36, 56], [56, 56],
        ].map(([wx, wy], idx) => (
          <rect
            key={idx}
            x={wx}
            y={wy}
            width="8"
            height="8"
            rx="1"
            fill={active ? '#0284c7' : '#94a3b8'}
            fillOpacity={active ? '0.25' : '0.2'}
            stroke={active ? '#0284c7' : '#94a3b8'}
            strokeWidth="0.8"
          />
        ))}

        {/* Grand Entry Canopy & Glass Lobby */}
        <rect x="28" y="70" width="24" height="10" rx="1" fill={active ? '#0f172a' : '#64748b'} />
        <rect x="34" y="73" width="12" height="7" rx="0.5" fill={active ? '#38bdf8' : '#e2e8f0'} />
      </g>

      {/* Certificate of Occupancy (C.O.) Official Seal */}
      <g transform="translate(100, 22)">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill={active ? '#ecfdf5' : '#f1f5f9'}
          stroke={active ? '#059669' : '#94a3b8'}
          strokeWidth="1.6"
          strokeDasharray="4 2"
        />
        <circle cx="20" cy="20" r="14" stroke={active ? '#10b981' : '#cbd5e1'} strokeWidth="0.8" fill="none" />
        <text x="20" y="18" textAnchor="middle" fill={active ? '#065f46' : '#475569'} fontSize="6" fontWeight="bold">
          C.O.
        </text>
        <text x="20" y="25" textAnchor="middle" fill={active ? '#047857' : '#64748b'} fontSize="4" fontWeight="bold">
          ISSUED
        </text>
      </g>

      {/* Handover Ready Badge */}
      <g transform="translate(94, 68)">
        <rect
          width="54"
          height="14"
          rx="7"
          fill={active ? '#0f172a' : '#f1f5f9'}
          stroke={active ? '#334155' : '#cbd5e1'}
          strokeWidth="1"
        />
        <circle cx="7" cy="7" r="2.5" fill="#10b981" />
        <text x="13" y="9.5" fill={active ? '#f8fafc' : '#475569'} fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">
          HANDOVER
        </text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Master Switcher Component
// ─────────────────────────────────────────────────────────────────────────────
export function PhaseIllustration({ phase, active, className }: PhaseIllustrationProps) {
  return (
    <div className={`overflow-hidden rounded-xl border transition-all ${
      active
        ? 'border-sky-300 bg-white shadow-xs'
        : 'border-slate-200/80 bg-slate-50/50'
    } ${className || ''}`}>
      {phase === 'PRE_ACQUISITION' && <PreAcquisitionSvg active={active} />}
      {phase === 'ACQUISITION' && <AcquisitionSvg active={active} />}
      {phase === 'PERMITTING' && <PermittingSvg active={active} />}
      {phase === 'ACTIVE_CONSTRUCTION' && <ActiveConstructionSvg active={active} />}
      {phase === 'POST_CONSTRUCTION' && <PostConstructionSvg active={active} />}
    </div>
  );
}
