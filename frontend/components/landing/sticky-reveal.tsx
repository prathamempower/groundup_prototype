'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, DollarSign, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MaskedText } from '../ui/masked-text';

const PHASES = [
  {
    step: '01',
    category: 'The Baseline Problem',
    title: 'Disconnected Spreadsheets',
    quote: 'Most development projects track millions across fragmented offline files, leaving cost drift undetected until the next bank loan draw.',
    highlight: 'Budget Truth',
    color: 'border-slate-400 text-slate-700 dark:text-slate-300',
    indicator: 'Approved baseline locks each CSI code',
  },
  {
    step: '02',
    category: 'The Billing Discrepancy',
    title: 'Spend Ahead of Progress',
    quote: 'Trade invoices and payment applications arrive weekly, but bills are often approved before municipal building inspectors certify physical work.',
    highlight: 'Spend Truth',
    color: 'border-foreground text-foreground',
    indicator: 'Mandatory 10% retainage withholdings enforced',
  },
  {
    step: '03',
    category: 'The Inspection Gate',
    title: 'Unverified Milestones',
    quote: 'Township inspection cards and geotagged field photos must corroborate every dollar claimed in AIA G702 and G703 applications.',
    highlight: 'Progress Truth',
    color: 'border-emerald-500 text-emerald-800 dark:text-emerald-300',
    indicator: 'Jurisdictional municipal pass cards on file',
  },
  {
    step: '04',
    category: 'The Financial Settlement',
    title: 'Cleared Bank Proceeds',
    quote: 'Loan wires, equity contributions, and statutory unconditional lien waivers reconcile automatically to eliminate title clouds and mechanics liens.',
    highlight: 'Funding Truth',
    color: 'border-amber-500 text-amber-800 dark:text-amber-300',
    indicator: 'Commercial bank wires matched to project accounts',
  },
];

export function StickyReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine active phase based on progress (0.0 to 1.0)
  const activeIndex = Math.min(
    Math.floor(scrollProgress * PHASES.length),
    PHASES.length - 1
  );
  const activePhase = PHASES[activeIndex];

  // Calculate backdrop scale: scales from 1.0 to 1.15 as page scrolls
  const backdropScale = 1 + scrollProgress * 0.15;

  return (
    <section
      id="audit-ledger"
      ref={containerRef}
      className="relative h-[240vh] border-b border-border bg-[#f8f9fa] dark:bg-card/30 scroll-mt-16"
      aria-label="Sticky Executive Narrative"
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen flex flex-col justify-between overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Concept 3: Scroll-Driven Parallax Backdrop Text */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden opacity-[0.035] dark:opacity-[0.06]"
          aria-hidden="true"
        >
          <span
            className="font-extrabold text-[12vw] tracking-tighter uppercase whitespace-nowrap will-change-transform transition-transform duration-100 ease-out font-mono"
            style={{ transform: `scale(${backdropScale})` }}
          >
            SYNCHRONIZED AUDIT LEDGER
          </span>
        </div>

        {/* Top Header & Tagline */}
        <div className="relative z-10 mx-auto max-w-5xl w-full flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
              The Four Synchronized Truths: Financial Chain of Custody
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>Phase {activeIndex + 1} of 4</span>
            <span className="text-foreground font-bold">({Math.round(scrollProgress * 100)}% Scrolled)</span>
          </div>
        </div>

        {/* Center Sticky Narrative Container */}
        <div className="relative z-10 mx-auto max-w-4xl w-full text-center space-y-6 my-auto">
          {/* Phase Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card shadow-2xs">
            <span className="text-xs font-mono font-bold text-foreground">
              {activePhase.step}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {activePhase.category}
            </span>
          </div>

          {/* Masked Headline Title */}
          <div className="overflow-hidden">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground transition-all duration-300">
              {activePhase.title}
            </h2>
          </div>

          {/* Word-by-Word Scroll Highlight Narrative */}
          <p className="text-base sm:text-xl lg:text-2xl text-foreground/90 font-medium leading-relaxed max-w-3xl mx-auto transition-opacity duration-300 min-h-[5rem]">
            {activePhase.quote}
          </p>

          {/* Synchronized Truth Pill with Indicator */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <span
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs sm:text-sm font-bold shadow-xs transition-all duration-300',
                activePhase.color,
                'bg-card'
              )}
            >
              <CheckCircle2 className="size-4" />
              <span>{activePhase.highlight}</span>
            </span>
            <span className="text-xs font-mono text-muted-foreground bg-muted/40 px-3 py-2 rounded-xl border border-border/60">
              {activePhase.indicator}
            </span>
          </div>
        </div>

        {/* Bottom Scroll Stepper Progress Bar */}
        <div className="relative z-10 mx-auto max-w-3xl w-full space-y-3">
          {/* 4 Segmented Progress Bars */}
          <div className="grid grid-cols-4 gap-2">
            {PHASES.map((p, idx) => {
              const segmentProgress = Math.min(
                Math.max((scrollProgress - idx * 0.25) / 0.25, 0),
                1
              );
              return (
                <div key={p.step} className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-100 ease-out rounded-full"
                      style={{ width: `${segmentProgress * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground block text-center truncate">
                    {p.highlight}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Scroll Hint */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-mono">
            <ArrowDown className="size-3 animate-bounce" />
            <span>Scroll downward to step through live financial reconciliation</span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default StickyReveal;
