'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Building2, 
  Landmark, 
  FileCheck, 
  Layers, 
  AlertCircle,
  MapPin,
  Calendar,
  Compass
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TruthPhase {
  step: string;
  category: string;
  title: string;
  quote: string;
  highlight: string;
  watermark: string;
  color: string;
  badgeBg: string;
  indicator: string;
  artifact: React.ReactNode;
}

export function StickyReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const PHASES: TruthPhase[] = [
    {
      step: '01',
      category: 'The Baseline Problem',
      title: 'Disconnected Spreadsheets',
      quote: 'Most development projects track millions across fragmented offline files, leaving cost drift undetected until the next bank loan draw.',
      highlight: 'Budget Truth',
      watermark: '01 WBS // 50-DIV BASELINE',
      color: 'border-blue-500 text-blue-700 dark:text-blue-400',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      indicator: 'Approved baseline locks each CSI code',
      artifact: (
        <div className="w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl space-y-3.5 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
                <Layers className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">CSI MasterFormat Baseline</span>
                <span className="text-[10px] text-slate-500 font-mono">50 Divisions · Pro Forma Locked</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md">
              <Lock className="w-3 h-3" />
              LOCKED
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-700 font-sans font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                Div 03: Concrete & Foundation
              </span>
              <span className="font-bold text-slate-900">$480,000</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-700 font-sans font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                Div 05: Structural Steel Framing
              </span>
              <span className="font-bold text-slate-900">$620,000</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-700 font-sans font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                Div 26: Rough Electrical & Service
              </span>
              <span className="font-bold text-slate-900">$310,000</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
            <span>Total Baseline Commitment:</span>
            <span className="font-bold font-mono text-slate-900">$4,200,000</span>
          </div>
        </div>
      ),
    },
    {
      step: '02',
      category: 'The Billing Discrepancy',
      title: 'Spend Ahead of Progress',
      quote: 'Trade invoices and payment applications arrive weekly, but bills are often approved before municipal building inspectors certify physical work.',
      highlight: 'Spend Truth',
      watermark: '02 AIA // 10% RETAINAGE',
      color: 'border-slate-800 text-slate-900 dark:text-slate-200',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      indicator: 'Mandatory 10% retainage withholdings enforced',
      artifact: (
        <div className="w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl space-y-3.5 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-800 font-bold text-xs">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">AIA Document A201 Reconciliation</span>
                <span className="text-[10px] text-slate-500 font-mono">Trade: Apex Structural Steelworks</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
              WITHHOLDING ACTIVE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Gross Trade Invoiced:</span>
              <span className="font-mono font-bold text-slate-900">$184,300.00</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/70 border border-rose-100 text-rose-900">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                Less: 10% Retainage Withholding:
              </span>
              <span className="font-mono font-bold">-$18,430.00</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-900 font-bold">
              <span>Net Authorized Payable:</span>
              <span className="font-mono text-sm">$165,870.00</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 font-mono">
            <span>Escrow Protocol:</span>
            <span className="text-slate-700 font-semibold">10% Held in Trust Per A201 § 9.3</span>
          </div>
        </div>
      ),
    },
    {
      step: '03',
      category: 'The Inspection Gate',
      title: 'Unverified Milestones',
      quote: 'Township inspection cards and geotagged field photos must corroborate every dollar claimed in AIA G702 and G703 applications.',
      highlight: 'Progress Truth',
      watermark: '03 MUNICIPAL // CERTIFIED',
      color: 'border-emerald-500 text-emerald-800 dark:text-emerald-300',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      indicator: 'Jurisdictional municipal pass cards on file',
      artifact: (
        <div className="w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl space-y-3.5 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">Municipal Inspection Card</span>
                <span className="text-[10px] text-slate-500 font-mono">Jersey City Building Dept.</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              PASSED & STAMPED
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Physical Milestone:</span>
                <span className="font-mono text-slate-600">Framing & Decking</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Inspector Official:</span>
                <span className="font-mono text-slate-700">Code Official #4091</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px]">
              <span className="text-emerald-900 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                Geotagged Field Coordinates:
              </span>
              <span className="font-mono text-emerald-800 font-bold">40.7282° N, 74.0776° W</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 font-mono">
            <span>AIA G702 Corroboration:</span>
            <span className="text-emerald-700 font-bold">100% Verified</span>
          </div>
        </div>
      ),
    },
    {
      step: '04',
      category: 'The Financial Settlement',
      title: 'Cleared Bank Proceeds',
      quote: 'Loan wires, equity contributions, and statutory unconditional lien waivers reconcile automatically to eliminate title clouds and mechanics liens.',
      highlight: 'Funding Truth',
      watermark: '04 COLUMBIA // WIRE CLEARED',
      color: 'border-blue-600 text-blue-800 dark:text-blue-300',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
      indicator: 'Commercial bank wires matched to project accounts',
      artifact: (
        <div className="w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl space-y-3.5 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#0066ee] font-bold text-xs">
                <Landmark className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">Columbia Bank Construction Loan</span>
                <span className="text-[10px] text-slate-500 font-mono">Facility: $4,200,000 (8.25% APR)</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-blue-100 text-[#0066ee] border border-blue-300 px-2 py-0.5 rounded-md">
              WIRE CLEARED
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Draw Request #06 Released:</span>
              <span className="font-mono font-bold text-slate-900">$340,000.00</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-900 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Statutory Lien Waiver Status:
                </span>
                <span className="font-mono text-[11px]">CAL. CIV. § 8134</span>
              </div>
              <p className="text-[10px] text-emerald-800 font-sans leading-tight">
                Unconditional progress waiver recorded. Zero title clouds or mechanics liens pending.
              </p>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 font-mono">
            <span>Operating Account Match:</span>
            <span className="text-emerald-700 font-bold">BCB Bank Transferred</span>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const el = containerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const totalScrollable = rect.height - windowHeight;

        if (totalScrollable <= 0) return;

        const currentScroll = -rect.top;
        const progress = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
        setScrollProgress(progress);
        const idx = Math.min(Math.floor(progress * PHASES.length), PHASES.length - 1);
        setActiveIndex(idx);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [PHASES.length]);

  const scrollToPhase = useCallback((index: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const containerTop = rect.top + scrollTop;
    const totalScrollable = el.offsetHeight - window.innerHeight;
    const targetScroll = containerTop + (index / (PHASES.length - 1)) * totalScrollable;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, [PHASES.length]);

  // Horizontal translation percentage based on scroll progress (0% to -75% for 4 bays)
  const horizontalTranslatePercent = scrollProgress * (PHASES.length - 1) * 25;

  return (
    <section
      id="audit-ledger"
      ref={containerRef}
      className="relative h-[360vh] border-b border-slate-200 bg-slate-50/60 scroll-mt-16 select-none"
      aria-label="The Four Synchronized Truths: Panoramic Architectural Gallery"
    >
      {/* Sticky Fullscreen Pinned Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden py-6 sm:py-8 px-4 sm:px-8">
        
        {/* Subtle Architectural Blueprint Grid */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-25" 
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true" 
        />

        {/* ── Top Floating Stepper Navigator & Telemetry Bar ───────────────────── */}
        <div className="relative z-20 max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200/80 pb-4 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-[#0066ee] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-600 uppercase">
              The Four Synchronized Truths
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
              Chain of Custody
            </span>
          </div>

          {/* Interactive Stepper Navigation Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {PHASES.map((phase, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <button
                  key={phase.step}
                  type="button"
                  onClick={() => scrollToPhase(idx)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-mono',
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  )}
                  title={`Jump to ${phase.highlight}`}
                >
                  <span>{phase.step}</span>
                  <span className="hidden md:inline font-sans">{phase.highlight.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Progress Percentage Display */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Progress:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>
        </div>

        {/* ── Main Panoramic Horizontal Parallax Gallery Track ─────────────────── */}
        <div className="relative z-10 flex-1 my-auto flex items-center overflow-hidden">
          <div
            className="flex items-center transition-transform ease-out will-change-transform"
            style={{
              transform: `translate3d(-${horizontalTranslatePercent}%, 0, 0)`,
              width: `${PHASES.length * 100}%`,
              transitionDuration: '100ms',
            }}
          >
            {PHASES.map((phase, idx) => {
              return (
                <div
                  key={phase.step}
                  className="w-full flex-shrink-0 px-4 sm:px-12 lg:px-20 flex items-center justify-center"
                  style={{ width: `${100 / PHASES.length}%` }}
                >
                  <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Column: Narrative & Technical Category */}
                    <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
                      {/* Step & Category Pill */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {phase.step}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          {phase.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                        {phase.title}
                      </h2>

                      {/* Technical Narrative */}
                      <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl">
                        {phase.quote}
                      </p>

                      {/* Truth Indicator Badge */}
                      <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold shadow-2xs',
                            phase.badgeBg
                          )}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{phase.highlight}</span>
                        </span>
                        <span className="text-xs font-mono text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                          {phase.indicator}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Live Architectural Financial Artifact */}
                    <div className="lg:col-span-6 flex justify-center lg:justify-end">
                      <div className="w-full max-w-md transform transition-all duration-300 hover:scale-[1.01]">
                        {phase.artifact}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Stepper Controls & Continuous Rail Indicator ────────────── */}
        <div className="relative z-20 max-w-5xl w-full mx-auto space-y-2">
          {/* 4 Segmented Scrub Tracks */}
          <div className="grid grid-cols-4 gap-2.5">
            {PHASES.map((p, idx) => {
              const segmentProgress = Math.min(
                Math.max((scrollProgress - idx * 0.25) / 0.25, 0),
                1
              );
              return (
                <button
                  key={p.step}
                  type="button"
                  onClick={() => scrollToPhase(idx)}
                  className="space-y-1 text-left group cursor-pointer"
                >
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-slate-900 transition-all duration-100 ease-out rounded-full"
                      style={{ width: `${segmentProgress * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 group-hover:text-slate-700">
                    <span>{p.step}</span>
                    <span className="truncate">{p.highlight}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Panoramic Scroll Hint */}
          <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
            <button
              type="button"
              onClick={() => scrollToPhase(Math.max(activeIndex - 1, 0))}
              disabled={activeIndex === 0}
              className="inline-flex items-center gap-1 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Previous Truth</span>
            </button>

            <span className="hidden sm:inline">
              Scroll downward to scrub panoramic financial custody rail
            </span>

            <button
              type="button"
              onClick={() => scrollToPhase(Math.min(activeIndex + 1, PHASES.length - 1))}
              disabled={activeIndex === PHASES.length - 1}
              className="inline-flex items-center gap-1 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            >
              <span>Next Truth</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

export default StickyReveal;

