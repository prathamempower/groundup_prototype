'use client';

import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  FileWarning, 
  DollarSign,
  ArrowRight,
  Layers,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useScrollParallax } from '../../hooks/use-scroll-parallax';
import { MaskedText } from '../ui/masked-text';
import { Reveal } from '../reveal';

export function RecordsStory() {
  const [activeStep, setActiveStep] = useState(1);
  const flowRef = useScrollParallax<HTMLElement>({
    layerOffsets: [20, 45, 70, 95, 120],
  });

  return (
    <section 
      id="how-it-works" 
      ref={flowRef}
      className="parallax-wrapper scroll-mt-16 border-b border-border bg-slate-50/70 dark:bg-card/40 py-16 sm:py-20 lg:py-24 overflow-clip" 
      aria-labelledby="flow-heading"
    >
      <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* Section Header */}
        <div className="mb-10 sm:mb-12">
          <p className="text-xs sm:text-sm font-mono font-bold tracking-widest text-muted-foreground uppercase">
            From Scattered Documents to Financial Clarity
          </p>
          <h2 id="flow-heading" className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            <MaskedText as="span">
              From raw project paperwork to verified construction capital control.
            </MaskedText>
          </h2>
        </div>

        {/* 5 Connected Process Cards Grid */}
        <Reveal delay={80}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 items-stretch">
          
          {/* Step 1: Forward or upload */}
          <div 
            className="parallax-layer card-micro rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-foreground/30 transition-all cursor-pointer"
            data-layer="0"
          >
            <div className="space-y-2">
              <div className="size-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                1
              </div>
              <h3 className="font-bold text-sm text-foreground">
                Send or upload
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Send invoices, loan agreements, bank statements, and lien waivers to your project inbox.
              </p>
            </div>

            {/* Widget: Dropzone Preview */}
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3.5 text-center flex flex-col items-center justify-center gap-1.5 min-h-[140px]">
              <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground shadow-2xs">
                <UploadCloud className="size-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">Project Inbox &amp; Dropzone</span>
              <span className="text-[10px] font-mono text-muted-foreground tracking-tight">
                Invoices, Bank Statements, Waivers, Settlements
              </span>
            </div>
          </div>

          {/* Step 2: Automated extraction */}
          <div 
            className="parallax-layer card-micro rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-foreground/30 transition-all cursor-pointer"
            data-layer="1"
          >
            <div className="space-y-2">
              <div className="size-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                2
              </div>
              <h3 className="font-bold text-sm text-foreground">
                Extract &amp; classify
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatically extract line items, CSI cost codes, and loan terms directly into your budget ledger.
              </p>
            </div>

            {/* Widget: Document Extraction Mini Form */}
            <div className="rounded-xl border border-border bg-background p-3 text-[11px] space-y-2 min-h-[140px]">
              <div className="flex items-center gap-2 border-b border-border/60 pb-1.5 font-bold text-[10px] text-muted-foreground uppercase font-mono">
                <FileText className="size-3 text-primary" />
                <span>Extracted Record</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span className="font-mono font-semibold text-foreground">Columbia Bank Loan Note</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Draw Balance</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">$3,400,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">10% Retainage</span>
                  <span className="font-mono text-muted-foreground font-semibold">$340,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CSI Divisions</span>
                  <span className="font-mono font-semibold text-foreground">14 Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Discrepancy & Lien Protection */}
          <div 
            className="parallax-layer card-micro rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-foreground/30 transition-all cursor-pointer"
            data-layer="2"
          >
            <div className="space-y-2">
              <div className="size-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                3
              </div>
              <h3 className="font-bold text-sm text-foreground">
                Reconcile &amp; verify
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Match bank wires to settlement sheets, catch duplicate bills, and verify signed lien waivers.
              </p>
            </div>

            {/* Widget: Mini Checklist Statuses */}
            <div className="rounded-xl border border-border bg-background p-2.5 text-[10px] space-y-1.5 min-h-[140px] flex flex-col justify-center">
              <div className="flex items-start gap-1.5 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="truncate">HUD settlement reconciled</span>
              </div>
              <div className="flex items-start gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="truncate">CA Civil Code 8132 lien pending</span>
              </div>
              <div className="flex items-start gap-1.5 text-rose-800 dark:text-rose-300">
                <XCircle className="size-3 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="truncate">Municipal rough plumbing delayed</span>
              </div>
              <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                <AlertTriangle className="size-3 text-slate-500 shrink-0 mt-0.5" />
                <span className="truncate">Duplicate bill caught: Inv #1041</span>
              </div>
            </div>
          </div>

          {/* Step 4: The Four Truths */}
          <div 
            className="parallax-layer card-micro rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-foreground/30 transition-all cursor-pointer"
            data-layer="3"
          >
            <div className="space-y-2">
              <div className="size-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                4
              </div>
              <h3 className="font-bold text-sm text-foreground">
                The Four Truths
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track loan funds, equity, actual spend, and physical progress together on one real-time ledger.
              </p>
            </div>

            {/* Widget: Spend vs. Progress Curve */}
            <div className="rounded-xl border border-border bg-background p-3 text-[10px] space-y-2 min-h-[140px] flex flex-col justify-between">
              <span className="font-bold text-foreground block">Spend vs. verified progress</span>
              <div className="h-16 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* Spend line */}
                  <path d="M 0 35 Q 50 25, 100 10" fill="none" stroke="currentColor" className="text-foreground" strokeWidth="2" />
                  {/* Progress line */}
                  <path d="M 0 35 Q 50 30, 100 18" fill="none" stroke="#10b981" strokeWidth="2" />
                  <circle cx="100" cy="10" r="2.5" fill="currentColor" className="text-foreground" />
                  <circle cx="100" cy="18" r="2" fill="#10b981" />
                </svg>
              </div>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-foreground" /> Spend</span>
                <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> Progress</span>
                <span className="font-mono font-bold text-foreground">$3.40M</span>
              </div>
            </div>
          </div>

          {/* Step 5: Draw Packet Builder & Delay Forecast */}
          <div 
            className="parallax-layer card-micro rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-foreground/30 transition-all cursor-pointer"
            data-layer="3"
          >
            <div className="space-y-2">
              <div className="size-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                5
              </div>
              <h3 className="font-bold text-sm text-foreground">
                Draw packets &amp; forecast
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assemble lender-ready AIA G702 packets and forecast interest carry impact from inspection delays.
              </p>
            </div>

            {/* Widget: Municipal Delay & Carry Callout Box */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 p-2.5 text-[10px] space-y-1.5 min-h-[140px] flex flex-col justify-center">
              <div className="font-bold text-amber-900 dark:text-amber-200 border-b border-amber-500/20 pb-1 flex items-center gap-1">
                <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
                <span>Municipal Delay Advisor</span>
              </div>
              <div className="text-muted-foreground">
                <span className="font-bold text-foreground block">Framing re-inspection delay: +14 days</span>
                <span className="text-[9px]">Interest carry: $949/day on drawn principal</span>
              </div>
              <div className="text-muted-foreground pt-1 border-t border-border/40">
                <span className="font-bold text-foreground block">Lender Draw Packet #15</span>
                <span className="text-[9px]">Built with 7 verified CSI trade packages</span>
              </div>
            </div>
          </div>

        </div>
      </Reveal>
    </div>
  </section>
  );
}

export default RecordsStory;
