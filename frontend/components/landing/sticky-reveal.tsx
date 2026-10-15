'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  CheckCircle2,
  Lock,
  ArrowDown,
  Building2,
  FileCheck2,
  ShieldCheck,
  Landmark,
  BadgeCheck,
  Scale,
  MapPin,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface PhaseData {
  step: string;
  category: string;
  title: string;
  quote: string;
  highlight: string;
  badgeTone: string;
  indicator: string;
  cardType: 'budget' | 'spend' | 'progress' | 'funding';
}

const PHASES: PhaseData[] = [
  {
    step: '01',
    category: 'The Baseline Problem',
    title: 'Disconnected Spreadsheets',
    quote: 'Most development projects track millions across fragmented offline files, leaving cost drift undetected until the next bank loan draw.',
    highlight: 'Budget Truth',
    badgeTone: 'border-blue-300 bg-blue-50 text-blue-900',
    indicator: 'Approved baseline locks each CSI MasterFormat code',
    cardType: 'budget',
  },
  {
    step: '02',
    category: 'The Billing Discrepancy',
    title: 'Spend Ahead of Progress',
    quote: 'Trade invoices and payment applications arrive weekly, but bills are often approved before municipal building inspectors certify physical work.',
    highlight: 'Spend Truth',
    badgeTone: 'border-amber-300 bg-amber-50 text-amber-900',
    indicator: 'Mandatory 10% retainage withholdings enforced in escrow',
    cardType: 'spend',
  },
  {
    step: '03',
    category: 'The Inspection Gate',
    title: 'Unverified Milestones',
    quote: 'Township inspection cards and geotagged field photos must corroborate every dollar claimed in AIA G702 and G703 applications.',
    highlight: 'Progress Truth',
    badgeTone: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    indicator: 'Jurisdictional municipal pass cards certified on site',
    cardType: 'progress',
  },
  {
    step: '04',
    category: 'The Financial Settlement',
    title: 'Cleared Bank Proceeds',
    quote: 'Loan wires, equity contributions, and statutory unconditional lien waivers reconcile automatically to eliminate title clouds and mechanics liens.',
    highlight: 'Funding Truth',
    badgeTone: 'border-indigo-300 bg-indigo-50 text-indigo-900',
    indicator: 'Commercial bank wires matched directly to project accounts',
    cardType: 'funding',
  },
];

export function StickyReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

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
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const activeIndex = Math.min(
    Math.floor(scrollProgress * PHASES.length),
    PHASES.length - 1
  );
  const activePhase = PHASES[activeIndex];
  const backdropScale = 1 + scrollProgress * 0.12;

  const scrollToPhase = (idx: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const containerTop = rect.top + scrollTop;
    const totalScrollable = el.offsetHeight - window.innerHeight;
    const targetScroll = containerTop + ((idx + 0.15) / PHASES.length) * totalScrollable;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  return (
    <section
      id="audit-ledger"
      ref={containerRef}
      className="relative h-[280vh] border-b border-border bg-[#f8fafc] dark:bg-card/20 scroll-mt-16"
      aria-label="The Four Synchronized Truths: Sticky Executive Narrative"
    >
      {/* Sticky Fullscreen Pinned Viewport */}
      <div className="sticky top-0 h-screen min-h-[640px] w-full flex flex-col justify-between py-5 sm:py-6 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden select-none">
        
        {/* Parallax Scaling Monospace Backdrop */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden opacity-[0.03] dark:opacity-[0.05]"
          aria-hidden="true"
        >
          <span
            className="font-extrabold text-[11vw] tracking-tighter uppercase whitespace-nowrap will-change-transform font-mono"
            style={{ transform: `scale(${backdropScale})` }}
          >
            SYNCHRONIZED AUDIT LEDGER
          </span>
        </div>

        {/* Subtle Architectural Blueprint Grid */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.25] [background-image:radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:28px_28px]"
          aria-hidden="true" 
        />

        {/* Top Floating Stepper Navigator & Telemetry Bar */}
        <header className="relative z-20 max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-5 py-2.5 rounded-2xl shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase">
              The Four Synchronized Truths
            </h3>
            <span className="hidden sm:inline text-xs font-mono text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2.5">
              Financial Chain of Custody
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/70 dark:border-slate-700">
              {PHASES.map((p, idx) => (
                <button
                  key={p.step}
                  type="button"
                  onClick={() => scrollToPhase(idx)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer whitespace-nowrap',
                    activeIndex === idx
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  )}
                >
                  {p.step} {p.highlight.replace(' Truth', '')}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-muted-foreground ml-1">
              <span className="font-bold text-foreground">{Math.round(scrollProgress * 100)}%</span>
            </span>
          </div>
        </header>

        {/* Main Stage: Full Width 2-Column Presentation of Active Phase */}
        <main className="relative z-10 max-w-6xl w-full mx-auto flex-1 flex items-center justify-center py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            
            {/* Left Column: Narrative (6 Cols) */}
            <div className="lg:col-span-6 space-y-5 text-left">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
                <span className="text-xs font-mono font-bold text-primary">
                  Phase {activePhase.step} of 04
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  {activePhase.category}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
                {activePhase.title}
              </h2>

              {/* Paragraph Description */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
                {activePhase.quote}
              </p>

              {/* Status and Indicator Pills */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold shadow-2xs transition-all',
                    activePhase.badgeTone
                  )}
                >
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  <span>{activePhase.highlight}</span>
                </span>

                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                  {activePhase.indicator}
                </span>
              </div>
            </div>

            {/* Right Column: Realistic Live Construction / Financial Card (6 Cols) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end items-center">
              <div className="w-full max-w-md transition-all duration-300">
                {activePhase.cardType === 'budget' && <BudgetTruthCard />}
                {activePhase.cardType === 'spend' && <SpendTruthCard />}
                {activePhase.cardType === 'progress' && <ProgressTruthCard />}
                {activePhase.cardType === 'funding' && <FundingTruthCard />}
              </div>
            </div>

          </div>
        </main>

        {/* Bottom Interactive Progress Stepper */}
        <footer className="relative z-20 max-w-5xl w-full mx-auto space-y-2 shrink-0">
          <div className="grid grid-cols-4 gap-3">
            {PHASES.map((p, idx) => {
              const segmentProgress = Math.min(
                Math.max((scrollProgress - idx * 0.25) / 0.25, 0),
                1
              );
              const isCurrent = activeIndex === idx;
              return (
                <button
                  key={p.step}
                  type="button"
                  onClick={() => scrollToPhase(idx)}
                  className="group text-left space-y-1.5 cursor-pointer focus:outline-none"
                >
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-100 ease-out',
                        isCurrent ? 'bg-primary' : 'bg-slate-900 dark:bg-slate-300'
                      )}
                      style={{ width: `${segmentProgress * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={cn(
                      'font-semibold transition-colors',
                      isCurrent ? 'text-primary font-bold' : 'text-muted-foreground group-hover:text-foreground'
                    )}>
                      {p.step} {p.highlight.replace(' Truth', '')}
                    </span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      {Math.round(segmentProgress * 100)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-mono pt-1">
            <ArrowDown className="size-3 text-primary animate-bounce" />
            <span>Scroll downward or click any phase above to step through live financial reconciliation</span>
          </div>
        </footer>

      </div>
    </section>
  );
}

/* =========================================================================
   AUTHENTIC FINANCIAL & CONSTRUCTION ARTIFACT CARDS
   ========================================================================= */

function BudgetTruthCard() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white dark:bg-slate-900 shadow-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Building2 className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
              CSI MasterFormat Baseline
            </h4>
            <p className="text-[10px] text-muted-foreground font-mono">50 Divisions: Locked Pro Forma</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-200 dark:border-emerald-800">
          <Lock className="size-3" /> LOCKED
        </span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <span className="text-slate-700 dark:text-slate-300">Div 03: Concrete Foundation</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white">$480,000</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <span className="text-slate-700 dark:text-slate-300">Div 05: Structural Steel Framing</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white">$620,000</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <span className="text-slate-700 dark:text-slate-300">Div 26: Rough Electrical & Service</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white">$310,000</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-xs">
        <span className="text-muted-foreground">Total Baseline Commitment:</span>
        <span className="text-base font-extrabold text-slate-900 dark:text-white">$4,200,000</span>
      </div>
    </div>
  );
}

function SpendTruthCard() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white dark:bg-slate-900 shadow-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <Scale className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
              AIA Document A201 Reconciliation
            </h4>
            <p className="text-[10px] text-muted-foreground font-mono">Trade: Apex Structural Steelworks</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-mono font-bold border border-amber-200 dark:border-amber-800">
          WITHHOLDING ACTIVE
        </span>
      </div>

      <div className="space-y-2.5 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>Gross Trade Invoiced:</span>
          <span className="font-bold text-slate-900 dark:text-white">$184,300.00</span>
        </div>

        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-100 dark:border-rose-900">
          <span>Less: 10% Retainage Withholding:</span>
          <span className="font-bold">-$18,430.00</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
          <span className="font-bold">Net Authorized Payable:</span>
          <span className="text-sm font-extrabold">$165,870.00</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>Escrow Protocol:</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">10% Held in Trust Per A201 § 9.3</span>
      </div>
    </div>
  );
}

function ProgressTruthCard() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white dark:bg-slate-900 shadow-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <FileCheck2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
              Municipal Inspection Card
            </h4>
            <p className="text-[10px] text-muted-foreground font-mono">Jersey City Building Dept.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-200 dark:border-emerald-800">
          <BadgeCheck className="size-3" /> PASSED & STAMPED
        </span>
      </div>

      <div className="space-y-2.5 font-mono text-xs">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
          <span className="text-slate-600 dark:text-slate-400">Physical Milestone:</span>
          <span className="font-bold text-slate-900 dark:text-white">Framing & Metal Decking</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
          <span className="text-slate-600 dark:text-slate-400">Inspector Official:</span>
          <span className="font-bold text-slate-900 dark:text-white">Code Official #4091</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-blue-600" />
            <span className="text-[11px]">Geotagged Field Coordinates:</span>
          </div>
          <span className="font-bold text-[11px]">40.7282° N, 74.0776° W</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>AIA G702 Corroboration:</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Physically Verified</span>
      </div>
    </div>
  );
}

function FundingTruthCard() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white dark:bg-slate-900 shadow-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
            <Landmark className="size-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
              Columbia Bank Construction Loan
            </h4>
            <p className="text-[10px] text-muted-foreground font-mono">Draw Application #06 Settlement</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] font-mono font-bold border border-indigo-200 dark:border-indigo-800">
          WIRE CLEARED
        </span>
      </div>

      <div className="space-y-2.5 font-mono text-xs">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
          <span className="text-slate-600 dark:text-slate-400">Fedwire Confirmation:</span>
          <span className="font-bold text-slate-900 dark:text-white">IMAD 20261015-00984</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
          <span className="text-slate-600 dark:text-slate-400">Cleared Wire Amount:</span>
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">$340,000.00</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span className="text-[11px]">Statutory Lien Protection:</span>
          </div>
          <span className="font-bold text-[11px]">CA Civil Code § 8134 Active</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>Operating Account Match:</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">BCB Bank Operating #8821</span>
      </div>
    </div>
  );
}

export default StickyReveal;
