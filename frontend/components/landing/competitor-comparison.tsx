'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  X, 
  Zap, 
  CheckCircle2, 
  Calculator, 
  TrendingDown,
  ExternalLink,
  Layers,
  Building2,
  Scale,
  Sparkles,
  FileCheck,
  Landmark,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import { Reveal } from '../reveal';
import { cn } from '../../lib/utils';
import { MaskedText } from '../ui/masked-text';

export interface CompetitorComparisonProps {
  onStartOnboarding: () => void;
}

// ── Speed Benchmark Graphic Data ────────────────────────────────────────────
interface SpeedBenchmark {
  id: string;
  name: string;
  hours: number;
  label: string;
  relativeScale: number; // percentage width on chart
  accentColor: string;
  isGroundUp?: boolean;
  sublabel: string;
}

const SPEED_BENCHMARKS: SpeedBenchmark[] = [
  { 
    id: 'groundup', 
    name: 'GroundUp', 
    hours: 4, 
    label: '4 Hours (Packet Build)', 
    relativeScale: 10, 
    accentColor: '#059669', 
    isGroundUp: true,
    sublabel: 'Automated bank-ready AIA G702 / G703 package'
  },
  { 
    id: 'procore', 
    name: 'Procore', 
    hours: 336, 
    label: '14 Days (336 Hours)', 
    relativeScale: 67, 
    accentColor: '#64748b',
    sublabel: '84x longer manual compile across subcontractor spreadsheets'
  },
  { 
    id: 'buildertrend', 
    name: 'Buildertrend', 
    hours: 504, 
    label: '21 Days (504 Hours)', 
    relativeScale: 100, 
    accentColor: '#94a3b8',
    sublabel: '126x longer residential homeowner cycle'
  },
  { 
    id: 'projul', 
    name: 'Projul', 
    hours: 0, 
    label: 'Not Supported', 
    relativeScale: 25, 
    accentColor: '#cbd5e1',
    sublabel: 'Limited to trade crew dispatch; lacks bank draw package engine'
  },
];

// ── Competitor Profiles (Verified Financial Market Data) ───────────────────
interface CompetitorProfile {
  id: string;
  name: string;
  tagline: string;
  marketRole: string;
  badge: string;
  ticker: string;
  ownerAlignment: number; // 0-100 percentage
  turnaroundLabel: string;
  costModelSummary: string;
  volumeTaxPercentage: string;
  duplicateProtectionStatus: 'automated' | 'manual' | 'none';
  inspectionTruthStatus: 'municipal' | 'contractor_logs' | 'punch_lists' | 'timecards';
  lienWaiverStatus: 'statutory_automated' | 'manual_pdf' | 'none';
  citationLabel: string;
  citationUrl: string;
  coreDifferentiator: string;
  isGroundUp?: boolean;
}

const COMPETITORS: CompetitorProfile[] = [
  {
    id: 'groundup',
    name: 'GroundUp',
    tagline: 'Developer & Property Owner OS',
    marketRole: 'Real Estate Developers, Property Owners & Family Offices',
    badge: '100% Owner Focus',
    ticker: 'Active Multi-Asset Platform',
    ownerAlignment: 98,
    turnaroundLabel: '4 Hours',
    costModelSummary: 'Flat asset plan',
    volumeTaxPercentage: '0% Loan Tax',
    duplicateProtectionStatus: 'automated',
    inspectionTruthStatus: 'municipal',
    lienWaiverStatus: 'statutory_automated',
    citationLabel: 'Interactive Platform Architecture Explorer',
    citationUrl: 'https://groundupdoc.vercel.app/',
    coreDifferentiator: 'Eliminates construction loan volume taxes and cuts draw turnaround from weeks to hours with bank-verified backup.',
    isGroundUp: true,
  },
  {
    id: 'procore',
    name: 'Procore',
    tagline: 'Commercial General Contractor Suite',
    marketRole: 'General Contractors and Commercial Builders',
    badge: 'GC Field Tool',
    ticker: 'NYSE: PCOR',
    ownerAlignment: 34,
    turnaroundLabel: '14 Days',
    costModelSummary: '0.20% to 0.40% construction volume',
    volumeTaxPercentage: '$12k to $60k+/yr tax',
    duplicateProtectionStatus: 'manual',
    inspectionTruthStatus: 'contractor_logs',
    lienWaiverStatus: 'manual_pdf',
    citationLabel: 'SEC Form 10-K Annual Filing (NYSE: PCOR)',
    citationUrl: 'https://www.sec.gov/edgar/browse/?CIK=0001611052',
    coreDifferentiator: 'Built for jobsite superintendents, RFIs, and submittals, imposing volume penalties on your total construction loan.',
  },
  {
    id: 'buildertrend',
    name: 'Buildertrend',
    tagline: 'Residential Homebuilder Portal',
    marketRole: 'Residential Homebuilders & Custom Remodelers',
    badge: 'Homebuilder Suite',
    ticker: 'Bain Capital Portfolio',
    ownerAlignment: 42,
    turnaroundLabel: '21 Days',
    costModelSummary: '$499 to $1,499/mo + seat taxes',
    volumeTaxPercentage: 'Seat markups',
    duplicateProtectionStatus: 'manual',
    inspectionTruthStatus: 'punch_lists',
    lienWaiverStatus: 'manual_pdf',
    citationLabel: 'Bain Capital Tech Opportunities Portfolio Profile',
    citationUrl: 'https://www.baincapital.com/businesses/tech-opportunities',
    coreDifferentiator: 'Focuses on homeowner finish selections and single-family remodels without commercial bank draw governance.',
  },
  {
    id: 'projul',
    name: 'Projul',
    tagline: 'Trade Subcontractor Dispatch Tool',
    marketRole: 'Subcontractor Trade Crews (Roofing, Plumbing, MEP)',
    badge: 'Subcontractor App',
    ticker: 'Inc. 5000 Fastest Growing',
    ownerAlignment: 28,
    turnaroundLabel: 'No Engine',
    costModelSummary: '$199 to $499/mo tiered by crew size',
    volumeTaxPercentage: 'Crew fees',
    duplicateProtectionStatus: 'none',
    inspectionTruthStatus: 'timecards',
    lienWaiverStatus: 'none',
    citationLabel: 'Inc. 5000 Growth Index & Published Pricing',
    citationUrl: 'https://www.inc.com/inc5000',
    coreDifferentiator: 'Coordinates trade crews and estimates but cannot assemble multi-tier bank draws or manage project capital stacks.',
  },
];

// ── Feature Matrix Rows ─────────────────────────────────────────────────────
interface MatrixFeatureRow {
  dimension: string;
  metricDetail: string;
  groundup: { label: string; highlight: boolean };
  procore: { label: string; highlight: boolean };
  buildertrend: { label: string; highlight: boolean };
  projul: { label: string; highlight: boolean };
}

const MATRIX_FEATURES: MatrixFeatureRow[] = [
  {
    dimension: 'Audience Focus',
    metricDetail: 'Who the software was engineered to protect',
    groundup: { label: 'Property Owner / Developer', highlight: true },
    procore: { label: 'General Contractor', highlight: false },
    buildertrend: { label: 'Residential Homebuilder', highlight: false },
    projul: { label: 'Trade Subcontractor', highlight: false },
  },
  {
    dimension: 'Pricing Penalty',
    metricDetail: 'Fee model on active construction debt',
    groundup: { label: '0% Volume Tax (Flat Plan)', highlight: true },
    procore: { label: '0.20% to 0.40% Loan Tax', highlight: false },
    buildertrend: { label: 'Monthly Base + Per-Seat Tax', highlight: false },
    projul: { label: 'Tiered Field Crew Fee', highlight: false },
  },
  {
    dimension: 'Draw Package Speed',
    metricDetail: 'AIA G702 / G703 lender packet compile time',
    groundup: { label: 'Same Afternoon (4 Hours)', highlight: true },
    procore: { label: '10 to 14 Days Manual', highlight: false },
    buildertrend: { label: '14 to 21 Days Manual', highlight: false },
    projul: { label: 'Unsupported', highlight: false },
  },
  {
    dimension: 'Duplicate Bill Check',
    metricDetail: 'Protection against paying the same trade twice',
    groundup: { label: 'Automated Bank Reconciliation', highlight: true },
    procore: { label: 'Manual Spreadsheet Check', highlight: false },
    buildertrend: { label: 'Manual Spreadsheet Check', highlight: false },
    projul: { label: 'None (Trade Only)', highlight: false },
  },
  {
    dimension: 'Physical Site Truth',
    metricDetail: 'Proof required before authorizing payment',
    groundup: { label: 'Municipal Pass Cards', highlight: true },
    procore: { label: 'GC Daily Field Logs', highlight: false },
    buildertrend: { label: 'Homeowner Punch Lists', highlight: false },
    projul: { label: 'Crew Time Cards', highlight: false },
  },
  {
    dimension: 'Statutory Lien Protection',
    metricDetail: 'California Civil Code 8132-8138 verification',
    groundup: { label: 'Pre-Disbursement Validation', highlight: true },
    procore: { label: 'Secondary Paper Collection', highlight: false },
    buildertrend: { label: 'Basic PDF Attachment', highlight: false },
    projul: { label: 'None', highlight: false },
  },
];

// ── Project Presets for Financial Calculator ────────────────────────────────
interface ProjectPreset {
  id: string;
  name: string;
  budgetLabel: string;
  loanAmount: number;
  drawnAverage: number;
  apr: number;
  delayDays: number;
}

const PRESETS: ProjectPreset[] = [
  {
    id: '73broadway',
    name: '73 Broadway (Ground-Up Construction)',
    budgetLabel: '$4.2M Loan',
    loanAmount: 4200000,
    drawnAverage: 2200000,
    apr: 0.0825,
    delayDays: 14,
  },
  {
    id: 'midrise',
    name: 'Mid-Rise Multifamily Development',
    budgetLabel: '$12M Loan',
    loanAmount: 12000000,
    drawnAverage: 5500000,
    apr: 0.0825,
    delayDays: 14,
  },
  {
    id: 'commercial',
    name: 'Commercial Mixed-Use Project',
    budgetLabel: '$25M Loan',
    loanAmount: 25000000,
    drawnAverage: 11000000,
    apr: 0.085,
    delayDays: 16,
  },
  {
    id: 'portfolio',
    name: 'Multi-Phase Asset Portfolio',
    budgetLabel: '$50M Loan',
    loanAmount: 50000000,
    drawnAverage: 22000000,
    apr: 0.0875,
    delayDays: 18,
  },
];

// ── SVG Radial Gauge Component ──────────────────────────────────────────────
interface CircularGaugeProps {
  percentage: number;
  isGroundUp?: boolean;
  isVisible: boolean;
  size?: number;
}

function CircularGauge({ percentage, isGroundUp, isVisible, size = 108 }: CircularGaugeProps) {
  const strokeWidth = 9;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isVisible 
    ? circumference - (circumference * percentage) / 100 
    : circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
          fill="transparent"
        />
        {/* Animated Active Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isGroundUp ? '#059669' : '#64748b'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center Percentage Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn(
          'text-2xl font-black tracking-tight leading-none',
          isGroundUp ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'
        )}>
          {percentage}%
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
          Owner Fit
        </span>
      </div>
    </div>
  );
}

export function CompetitorComparison({ onStartOnboarding }: CompetitorComparisonProps) {
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>('groundup');
  const [activePresetId, setActivePresetId] = useState<string>('midrise');
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState<boolean>(false);
  const [comparisonMode, setComparisonMode] = useState<'visual_dashboard' | 'speed_timeline' | 'feature_matrix' | 'cash_calculator'>('visual_dashboard');
  
  const sectionRef = useRef<HTMLElement>(null);

  // Auto-trigger animated figures when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasScrolledIntoView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const activeCompetitor = COMPETITORS.find(c => c.id === selectedCompetitorId) || COMPETITORS[0];
  const activePreset = PRESETS.find(p => p.id === activePresetId) || PRESETS[1];

  // Mathematical Debt Service & Savings Calculation
  const dailyCarryRate = (activePreset.drawnAverage * activePreset.apr) / 365;
  const idleDelayLoss = Math.round(dailyCarryRate * activePreset.delayDays);
  const volumeTaxLoss = Math.round(activePreset.loanAmount * 0.003); // 0.30% typical volume penalty
  const totalCashPreserved = idleDelayLoss + volumeTaxLoss;

  return (
    <section 
      ref={sectionRef}
      id="comparison" 
      className="scroll-mt-16 border-b border-border bg-slate-50/60 dark:bg-card/30 py-16 sm:py-20 overflow-hidden" 
      aria-labelledby="comparison-heading"
    >
      <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border/80">
          <Reveal className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Zap className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Visual Market Benchmark & Developer Alignment</span>
            </div>
            <h2 
              id="comparison-heading" 
              className="text-fluid-title font-bold tracking-tight text-foreground"
            >
              <MaskedText as="span">
                GroundUp vs Procore, Buildertrend & Projul
              </MaskedText>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              General contractor software manages field superintendent daily logs and RFIs. GroundUp is dedicated to the real estate developer: reconciling investor equity and bank loans, eliminating duplicate invoices, and building lender-ready draw packages without spreadsheet delays.
            </p>
          </Reveal>

          {/* Quick Interactive Graphical Lens Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-background border border-border shrink-0 shadow-2xs self-start lg:self-end">
            <button
              type="button"
              onClick={() => setComparisonMode('visual_dashboard')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                comparisonMode === 'visual_dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              <Layers className="size-3.5" />
              <span>Platform Figures</span>
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode('speed_timeline')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                comparisonMode === 'speed_timeline'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              <Clock className="size-3.5" />
              <span>Draw Speed Benchmark</span>
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode('feature_matrix')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                comparisonMode === 'feature_matrix'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              <Scale className="size-3.5" />
              <span>Side-by-Side Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode('cash_calculator')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                comparisonMode === 'cash_calculator'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              <Calculator className="size-3.5" />
              <span>Carry Simulator</span>
            </button>
          </div>
        </div>

        {/* ── Mode 1: Graphical Platform Cards (High-Impact Visual Metrics & Donut Gauges) ── */}
        {comparisonMode === 'visual_dashboard' && (
          <div className="mt-8 space-y-8">
            {/* 4 Graphical Comparison Cards Shown in Parallel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {COMPETITORS.map((c, i) => {
                const isSelected = selectedCompetitorId === c.id;
                return (
                  <Reveal key={`platform-card-${c.id}`} delay={i * 80}>
                    <div
                      onMouseEnter={() => setSelectedCompetitorId(c.id)}
                      onClick={() => setSelectedCompetitorId(c.id)}
                      className={cn(
                        'card-micro rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden group h-full',
                        c.isGroundUp
                          ? 'border-emerald-500/80 bg-white dark:bg-card shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                          : isSelected
                            ? 'border-slate-400 bg-white dark:bg-card shadow-sm ring-1 ring-slate-400/40'
                            : 'border-border/80 bg-white/70 dark:bg-card/70 hover:border-slate-300 hover:shadow-2xs'
                      )}
                    >
                    {/* Top Header & Tag */}
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-base text-foreground tracking-tight">
                              {c.name}
                            </span>
                            {c.isGroundUp && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                                <Sparkles className="size-2.5" />
                                <span>Owner OS</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground block font-medium mt-0.5">
                            {c.tagline}
                          </span>
                        </div>
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider',
                          c.isGroundUp 
                            ? 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-200' 
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {c.badge}
                        </span>
                      </div>

                      {/* Animated Circular Gauge Ring */}
                      <div className="my-5 flex flex-col items-center justify-center">
                        <CircularGauge 
                          percentage={c.ownerAlignment} 
                          isGroundUp={c.isGroundUp}
                          isVisible={hasScrolledIntoView}
                          size={116}
                        />
                      </div>

                      {/* 3 Core Graphical Figure Chips */}
                      <div className="space-y-2.5 pt-1 text-xs">
                        {/* Speed Metric */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-muted/40 border border-border/60">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                            <Clock className="size-3 text-muted-foreground" />
                            <span>Draw Prep</span>
                          </span>
                          <span className={cn(
                            'font-bold text-[11px] px-2 py-0.5 rounded-md',
                            c.isGroundUp 
                              ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
                              : 'bg-muted text-foreground'
                          )}>
                            {c.turnaroundLabel}
                          </span>
                        </div>

                        {/* Cost Structure Metric */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-muted/40 border border-border/60">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                            <DollarSign className="size-3 text-muted-foreground" />
                            <span>Volume Tax</span>
                          </span>
                          <span className={cn(
                            'font-bold text-[11px]',
                            c.isGroundUp ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-foreground'
                          )}>
                            {c.volumeTaxPercentage}
                          </span>
                        </div>

                        {/* Duplicate Bill Protection */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-muted/40 border border-border/60">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                            <ShieldCheck className="size-3 text-muted-foreground" />
                            <span>Bank Matching</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-semibold">
                            {c.duplicateProtectionStatus === 'automated' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                <Check className="size-3 stroke-[3]" />
                                <span>Automated</span>
                              </span>
                            ) : c.duplicateProtectionStatus === 'manual' ? (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <span className="size-1.5 rounded-full bg-slate-400" />
                                <span>Manual</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                <X className="size-3" />
                                <span>None</span>
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Punchy Concise Summary */}
                      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {c.coreDifferentiator}
                      </p>
                    </div>

                    {/* Footer Citation & Action */}
                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                      <span className={cn(
                        'font-bold text-[10px] uppercase tracking-wider',
                        c.isGroundUp ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
                      )}>
                        {c.isGroundUp ? 'GroundUp Advantage' : c.ticker.split(' ')[0]}
                      </span>
                      <a
                        href={c.citationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>Citation</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

            {/* Key Visual Executive Takeaway Strip */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">
                    Zero Volume Taxes. Automated Draw Packet Builder. Full Owner Ledger Control.
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    GroundUp operates as your developer command center without requiring your general contractor or lender to switch software.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20 shrink-0">
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Zero General Contractor or Lender Software Displacement</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Mode 2: Graphical Speed & Turnaround Benchmark ── */}
        {comparisonMode === 'speed_timeline' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Visual Horizontal Timeline Bar Chart */}
            <div className="lg:col-span-7 rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="font-bold text-foreground text-sm sm:text-base">
                      Bank Draw Preparation Turnaround (Days to Package Delivery)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Elapsed time collecting vendor bills, verifying 10% retainage withholdings, and delivering AIA Document G702 / G703 packages.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 whitespace-nowrap self-start sm:self-auto">
                    4 Hours vs 14+ Days
                  </span>
                </div>

                {/* Animated Horizontal Progress Bars */}
                <div className="space-y-5 pt-2">
                  {SPEED_BENCHMARKS.map((item) => (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isGroundUp && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-extrabold">
                              AUTOMATED
                            </span>
                          )}
                        </span>
                        <span className={cn(
                          'font-extrabold text-xs',
                          item.isGroundUp ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
                        )}>
                          {item.label}
                        </span>
                      </div>

                      {/* Bar Track */}
                      <div className="h-4 w-full bg-slate-100 dark:bg-muted/50 rounded-full overflow-hidden p-0.5 border border-border/40">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
                          style={{
                            width: hasScrolledIntoView ? `${item.relativeScale}%` : '5%',
                            backgroundColor: item.accentColor,
                          }}
                        />
                      </div>

                      <p className="text-[11px] text-muted-foreground">
                        {item.sublabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Eliminate 10 to 14 days of idle carrying cost on every draw</span>
                </span>
                <span className="text-[11px]">
                  Zero manual copy-pasting across contractor folders
                </span>
              </div>
            </div>

            {/* Visual Value Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-3.5">
              <div className="rounded-2xl border border-border bg-white dark:bg-card p-5 flex items-start gap-3.5 shadow-xs">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Save 10 to 14 Days Per Draw</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Stop waiting for month-end reconciliation cutoffs to discover missing subcontractor lien releases and mismatched invoice balances.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white dark:bg-card p-5 flex items-start gap-3.5 shadow-xs">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Automated Duplicate Bill Detection</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    GroundUp matches outgoing commercial bank wires directly against contractor bills to ensure you never pay the same line twice.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white dark:bg-card p-5 flex items-start gap-3.5 shadow-xs">
                <div className="size-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                  <DollarSign className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">0% Construction Volume Tax</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Avoid paying a 0.20% to 0.40% recurring fee on your total construction loan. Simple, predictable asset plans without minimum lock-in.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-slate-50 dark:bg-muted/40 p-3.5 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Standardized Turnaround Protocol</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">AIA G702 / G703 Automated Packet Builder</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Mode 3: Side-by-Side Matrix Table ── */}
        {comparisonMode === 'feature_matrix' && (
          <div className="mt-8 rounded-2xl border border-border bg-white dark:bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50 dark:bg-muted/40 font-semibold">
                    <th className="p-4 text-muted-foreground min-w-[170px]">Feature & Operational Dimension</th>
                    <th className="p-4 text-emerald-800 dark:text-emerald-300 min-w-[200px] bg-emerald-500/10">
                      GroundUp (Developer Command)
                    </th>
                    <th className="p-4 text-foreground min-w-[170px]">Procore (NYSE: PCOR)</th>
                    <th className="p-4 text-foreground min-w-[170px]">Buildertrend</th>
                    <th className="p-4 text-foreground min-w-[160px]">Projul</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MATRIX_FEATURES.map((row) => (
                    <tr key={row.dimension} className="hover:bg-slate-50/60 dark:hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-foreground block">{row.dimension}</span>
                        <span className="text-[11px] text-muted-foreground mt-0.5 block">{row.metricDetail}</span>
                      </td>
                      <td className="p-4 font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10">
                        <div className="flex items-center gap-1.5">
                          <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{row.groundup.label}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">{row.procore.label}</td>
                      <td className="p-4 text-muted-foreground font-medium">{row.buildertrend.label}</td>
                      <td className="p-4 text-muted-foreground font-medium">{row.projul.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50/70 dark:bg-muted/40 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>GroundUp operates as an owner financial layer alongside your existing general ledger and general contractor project software.</span>
              <a
                href="#four-views"
                className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <span>Explore the 4 Synchronized Truths</span>
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* ── Mode 4: Cash Savings & Idle Loan Carry Calculator ── */}
        {comparisonMode === 'cash_calculator' && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-xs">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
                    <span>Developer Cash Leak & Savings Calculator</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                      Real Real Estate Math
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Calculates idle loan interest carry burned during draw review delays, plus avoidable enterprise volume tax fees.
                  </p>
                </div>

                {/* Preset Deal Selector Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-muted/50 border border-border">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePresetId(p.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        activePresetId === p.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                      )}
                    >
                      {p.budgetLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Large Graphical Metric Blocks */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Idle Delay Carry Loss */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-200">14-Day Draw Delay Carry</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] uppercase">
                      Avoidable Loss
                    </span>
                  </div>
                  <div className="text-3xl font-black text-amber-700 dark:text-amber-400 tracking-tight">
                    ${idleDelayLoss.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Based on {activePreset.drawnAverage.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} drawn loan principal at {(activePreset.apr * 100).toFixed(2)}% APR burning interest during approval wait cycles.
                  </p>
                </div>

                {/* Legacy Volume Tax Fee */}
                <div className="rounded-xl border border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20 p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-900 dark:text-rose-200">Contractor App Volume Tax</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-800 dark:text-rose-300 text-[10px] uppercase">
                      Avoidable Fee
                    </span>
                  </div>
                  <div className="text-3xl font-black text-rose-700 dark:text-rose-400 tracking-tight">
                    ${volumeTaxLoss.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Standard 0.20% to 0.40% volume charge imposed by legacy contractor suites on total project construction budgets.
                  </p>
                </div>

                {/* Cash Kept by Developer */}
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30 p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950 dark:text-emerald-200">Total Cash Kept by Developer</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] uppercase flex items-center gap-1">
                      <TrendingDown className="size-3" />
                      <span>Preserved</span>
                    </span>
                  </div>
                  <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                    ${totalCashPreserved.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed font-medium">
                    Automated bank draw package assembly eliminates weeks of idle interest carry, and flat asset pricing eliminates the construction volume tax entirely.
                  </p>
                </div>
              </div>

              {/* Formula & Action Strip */}
              <div className="mt-6 p-4 rounded-xl border border-border bg-slate-50 dark:bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-foreground block">
                    Underwriting a specific deal or managing an active construction loan?
                  </span>
                  <span className="text-muted-foreground text-[11px] block mt-0.5">
                    Daily interest carry accrues on drawn principal regardless of spreadsheet compilation speed.
                  </span>
                </div>
                <a
                  href="#cta-heading"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors cursor-pointer shrink-0 border border-border"
                >
                  <span>See How to Get Started</span>
                  <ArrowRight className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default CompetitorComparison;
