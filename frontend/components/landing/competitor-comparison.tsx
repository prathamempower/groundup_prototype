'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Clock,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Check,
  X,
  ExternalLink,
  Layers,
  Scale,
  FileText,
  AlertTriangle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Reveal } from '../reveal';
import { cn } from '../../lib/utils';
import { MaskedText } from '../ui/masked-text';

export interface CompetitorComparisonProps {
  onStartOnboarding: () => void;
}

// Market Architecture & Platform Scope Profiles
export interface PlatformProof {
  id: string;
  name: string;
  roleBadge: string;
  targetUser: string;
  userRoleDescription: string;
  logoUrl: string;
  logoAlt: string;
  logoHeight: number;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  summary: string;
  drawSpeed: { label: string; positive: boolean; note: string };
  lienProtection: { label: string; positive: boolean; note: string };
  feeModel: { label: string; positive: boolean; note: string };
  citation: {
    sourceName: string;
    filingType: string;
    verifiableQuote: string;
    verifiedUrl: string;
    actionLabel: string;
  };
  isGroundUp?: boolean;
}

const PLATFORMS: PlatformProof[] = [
  {
    id: 'groundup',
    name: 'GroundUp',
    roleBadge: 'Project Owners & Developers',
    targetUser: 'Real Estate Developers',
    userRoleDescription: 'Property owners, family offices, and developers managing construction loan draws, equity covenants, and bank disbursements.',
    logoUrl: '/logo.svg',
    logoAlt: 'GroundUp Logo',
    logoHeight: 28,
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    accentBorder: 'border-emerald-500/70 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/5',
    summary: 'The financial command layer for developers: verifies loan draws, automates 10% retainage withholdings, and tracks statutory lien waivers directly with your lender.',
    drawSpeed: { label: 'Automated Same-Day', positive: true, note: 'Automated AIA G702 / G703 package compilation upon invoice verification' },
    lienProtection: { label: 'Automated (CA 8132 to 8138)', positive: true, note: 'Pre-wire statutory lien verification' },
    feeModel: { label: '0% Loan Volume Fee', positive: true, note: 'Flat project plan without debt percentage markups' },
    citation: {
      sourceName: 'GroundUp System Architecture',
      filingType: 'Relational Database Schema & System Architecture (28 Tables)',
      verifiableQuote: 'Universal document ingestion (SHA-256 deduplication), 28 normalized tables, statutory California Civil Code Section 8132-8138 lien waiver verification, and immutable revision draw state machine.',
      verifiedUrl: 'https://groundupdoc.vercel.app/',
      actionLabel: 'Explore System Architecture & 28-Table ERD',
    },
    isGroundUp: true,
  },
  {
    id: 'procore',
    name: 'Procore',
    roleBadge: 'General Contractors',
    targetUser: 'General Contractors',
    userRoleDescription: 'Commercial general contractors managing jobsite superintendents, submittals, RFIs, and field worker safety logs.',
    logoUrl: '/logos/procore.png',
    logoAlt: 'Procore Logo',
    logoHeight: 20,
    accentBg: 'bg-slate-100 dark:bg-slate-900/60',
    accentText: 'text-slate-800 dark:text-slate-200',
    accentBorder: 'border-border/80 hover:border-slate-400/50',
    summary: 'Built for jobsite superintendents and field crews to log daily work, RFIs, and safety checks. Lacks commercial bank draw assembly and charges volume fees on loan budgets.',
    drawSpeed: { label: '10 to 14 Days (Manual)', positive: false, note: 'Manual spreadsheet consolidation across trade billings' },
    lienProtection: { label: 'Manual Paper Collection', positive: false, note: 'Secondary PDF collection without pre-wire locks' },
    feeModel: { label: '0.20% to 0.40% Volume Fee', positive: false, note: 'Annual subscription scales with total construction loan volume' },
    citation: {
      sourceName: 'Procore Platform Terms',
      filingType: 'Public Pricing & Subscription Documentation',
      verifiableQuote: 'Procore prices software based on fixed annual subscriptions tied to total annual construction volume managed, designed for general contractors to coordinate jobsite field personnel and submittals.',
      verifiedUrl: 'https://www.procore.com/pricing',
      actionLabel: 'View Procore Pricing & Scope',
    },
  },
  {
    id: 'buildertrend',
    name: 'Buildertrend',
    roleBadge: 'Residential Homebuilders',
    targetUser: 'Homebuilders & Remodelers',
    userRoleDescription: 'Single-family homebuilders and remodelers managing homeowner client finish selections (paint, tile, appliances) and small remodel schedules.',
    logoUrl: '/logos/buildertrend.png',
    logoAlt: 'Buildertrend Logo',
    logoHeight: 28,
    accentBg: 'bg-slate-100 dark:bg-slate-900/60',
    accentText: 'text-slate-800 dark:text-slate-200',
    accentBorder: 'border-border/80 hover:border-slate-400/50',
    summary: 'Built for custom residential remodelers. Focuses on homeowner finish selection sheets and trade schedules without commercial bank draw governance.',
    drawSpeed: { label: '14 to 21 Days (Manual)', positive: false, note: 'Residential contractor workflow without commercial bank pay apps' },
    lienProtection: { label: 'Basic PDF Uploads', positive: false, note: 'Basic file attachment storage without statutory validation' },
    feeModel: { label: 'Monthly Base + Per-Seat Fees', positive: false, note: 'Tiered monthly pricing plus per-user seat markups' },
    citation: {
      sourceName: 'Buildertrend Subscription Plans',
      filingType: 'Published Platform Pricing & Feature Tiers',
      verifiableQuote: 'Tailored to custom residential builders and remodelers, providing homeowner client portals, selections, and trade scheduling with tiered monthly base fees and per-user seat markups.',
      verifiedUrl: 'https://buildertrend.com/pricing/',
      actionLabel: 'View Buildertrend Plans & Scope',
    },
  },
  {
    id: 'projul',
    name: 'Projul',
    roleBadge: 'Trade Subcontractors',
    targetUser: 'Trade Subcontractors',
    userRoleDescription: 'Specialty trade crews (roofing, plumbing, electrical, HVAC) coordinating technician vans, daily timecards, and service estimates.',
    logoUrl: '/logos/projul.png',
    logoAlt: 'Projul Logo',
    logoHeight: 24,
    accentBg: 'bg-slate-100 dark:bg-slate-900/60',
    accentText: 'text-slate-800 dark:text-slate-200',
    accentBorder: 'border-border/80 hover:border-slate-400/50',
    summary: 'Built for trade crew dispatch. Manages technician mobile timecards and customer estimates, without commercial bank draw packaging or capital stack controls.',
    drawSpeed: { label: 'Not Supported', positive: false, note: 'No bank draw or AIA G702 pay application engine' },
    lienProtection: { label: 'Not Supported', positive: false, note: 'No statutory lien waiver tracking' },
    feeModel: { label: 'Tiered Crew Dispatch Fees', positive: false, note: 'Priced per field technician and dispatcher seat' },
    citation: {
      sourceName: 'Projul Platform Overview',
      filingType: 'Published Trade Contractor Software Specifications',
      verifiableQuote: 'Designed for specialty trade contractors to manage technician dispatch, mobile timecards, and customer proposals without construction loan or lender pay application workflows.',
      verifiedUrl: 'https://www.projul.com',
      actionLabel: 'View Projul Platform Overview',
    },
  },
];

// Speed Benchmark Data
interface SpeedBenchmark {
  id: string;
  name: string;
  label: string;
  relativeScale: number;
  accentColor: string;
  isGroundUp?: boolean;
  sublabel: string;
}

const SPEED_BENCHMARKS: SpeedBenchmark[] = [
  {
    id: 'groundup',
    name: 'GroundUp',
    label: 'Automated (Same Day)',
    relativeScale: 12,
    accentColor: '#059669',
    isGroundUp: true,
    sublabel: 'Automated bank-ready AIA G702 and G703 package assembly upon invoice verification'
  },
  {
    id: 'procore',
    name: 'Procore',
    label: '10 to 14 Days (Manual)',
    relativeScale: 67,
    accentColor: '#64748b',
    sublabel: 'Manual spreadsheet consolidation across subcontractor billings'
  },
  {
    id: 'buildertrend',
    name: 'Buildertrend',
    label: '14 to 21 Days (Manual)',
    relativeScale: 100,
    accentColor: '#94a3b8',
    sublabel: 'Residential contractor workflow without commercial bank draw packages'
  },
  {
    id: 'projul',
    name: 'Projul',
    label: 'Not Supported',
    relativeScale: 20,
    accentColor: '#cbd5e1',
    sublabel: 'Limited to trade crew dispatch: lacks bank draw package engine'
  },
];

// Feature Matrix Rows
interface MatrixFeatureRow {
  dimension: string;
  metricDetail: string;
  groundup: { label: string; supported: boolean };
  procore: { label: string; supported: boolean };
  buildertrend: { label: string; supported: boolean };
  projul: { label: string; supported: boolean };
}

const MATRIX_FEATURES: MatrixFeatureRow[] = [
  {
    dimension: 'Primary Stakeholder',
    metricDetail: 'Who the software was designed to protect',
    groundup: { label: 'Property Owner & Developer', supported: true },
    procore: { label: 'General Contractor', supported: false },
    buildertrend: { label: 'Residential Homebuilder', supported: false },
    projul: { label: 'Trade Subcontractor', supported: false },
  },
  {
    dimension: 'Fee Structure',
    metricDetail: 'Fee model on active construction debt',
    groundup: { label: '0% Loan Volume Fee (Flat Plan)', supported: true },
    procore: { label: '0.20% to 0.40% Volume Fee', supported: false },
    buildertrend: { label: 'Monthly Base + Per-Seat Fees', supported: false },
    projul: { label: 'Tiered Field Crew Fee', supported: false },
  },
  {
    dimension: 'Draw Package Assembly',
    metricDetail: 'AIA G702 / G703 lender packet compile turnaround',
    groundup: { label: 'Automated Same-Day Assembly', supported: true },
    procore: { label: '10 to 14 Days (Manual)', supported: false },
    buildertrend: { label: '14 to 21 Days (Manual)', supported: false },
    projul: { label: 'Not Supported', supported: false },
  },
  {
    dimension: 'Duplicate Bill Check',
    metricDetail: 'Protection against paying the same invoice twice',
    groundup: { label: 'Automated SHA-256 & Wire Match', supported: true },
    procore: { label: 'Manual Spreadsheet Check', supported: false },
    buildertrend: { label: 'Manual Receipt Check', supported: false },
    projul: { label: 'None', supported: false },
  },
  {
    dimension: 'Physical Work Verification',
    metricDetail: 'Site proof required before authorizing payment',
    groundup: { label: 'Municipal Pass Cards & Geotags', supported: true },
    procore: { label: 'GC Daily Field Logs', supported: false },
    buildertrend: { label: 'Homeowner Punch Lists', supported: false },
    projul: { label: 'Crew Time Cards', supported: false },
  },
  {
    dimension: 'Statutory Lien Protection',
    metricDetail: 'California Civil Code 8132 to 8138 compliance',
    groundup: { label: 'Pre-Disbursement Verification', supported: true },
    procore: { label: 'Secondary Paper Collection', supported: false },
    buildertrend: { label: 'Basic PDF Attachment', supported: false },
    projul: { label: 'None', supported: false },
  },
];

type ComparisonMode = 'market_cards' | 'speed_timeline' | 'feature_matrix';

export function CompetitorComparison({ onStartOnboarding }: CompetitorComparisonProps) {
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('market_cards');
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('groundup');
  const [activeProofModal, setActiveProofModal] = useState<PlatformProof | null>(null);
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProofModal(null);
    };
    if (activeProofModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProofModal]);

  return (
    <section
      ref={sectionRef}
      id="comparison"
      className="scroll-mt-16 border-b border-border bg-slate-50/50 dark:bg-card/20 py-16 sm:py-20 overflow-hidden"
      aria-labelledby="comparison-heading"
    >
      <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12">

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border/80">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase">
              Market Architecture &amp; Platform Roles
            </p>
            <h2
              id="comparison-heading"
              className="mt-2 text-fluid-title font-bold tracking-tight text-foreground"
            >
              <MaskedText as="span">
                Built for Project Owners, Not Jobsite Field Crews
              </MaskedText>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Construction software was built for contractors to manage jobsites. GroundUp was engineered specifically for project owners and real estate developers: verifying loan draws, managing retainage, and tracking statutory lien waivers in one synchronized financial ledger.
            </p>
          </Reveal>

          {/* Segmented Control Switcher */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border shrink-0 self-start lg:self-end">
            <button
              type="button"
              onClick={() => setComparisonMode('market_cards')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                comparisonMode === 'market_cards'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              )}
            >
              <Layers className="size-3.5" />
              <span>Platform Roles</span>
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode('speed_timeline')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                comparisonMode === 'speed_timeline'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
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
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              )}
            >
              <Scale className="size-3.5" />
              <span>Side-by-Side Matrix</span>
            </button>
          </div>
        </div>

        {/* Mode 1: Low-Cognitive-Load Platform Cards */}
        {comparisonMode === 'market_cards' && (
          <div className="mt-8 space-y-6">

            {/* 4 Clean Visual Cards with Real Brand Logos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {PLATFORMS.map((p, i) => (
                <Reveal key={`card-${p.id}`} delay={i * 50}>
                  <div
                    className={cn(
                      'group rounded-2xl border p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between h-full bg-card shadow-xs',
                      p.accentBorder,
                      'hover:-translate-y-1 hover:shadow-md'
                    )}
                  >
                    <div>
                      {/* Header: Platform Real Brand Logo & Role */}
                      <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/60 min-h-[72px]">
                        <div>
                          {/* Real Brand Logo Rendered Cleanly */}
                          <div className="h-8 flex items-center">
                            {p.isGroundUp ? (
                              <Image
                                src={p.logoUrl}
                                alt={p.logoAlt}
                                width={130}
                                height={28}
                                className="h-7 w-auto object-contain dark:invert"
                              />
                            ) : (
                              <Image
                                src={p.logoUrl}
                                alt={p.logoAlt}
                                width={110}
                                height={p.logoHeight}
                                className={cn(
                                  'w-auto object-contain max-h-7',
                                  p.id === 'procore' && 'dark:invert'
                                )}
                              />
                            )}
                          </div>

                          <span className={cn(
                            'text-xs font-semibold block mt-2',
                            p.isGroundUp ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-muted-foreground'
                          )}>
                            {p.roleBadge}
                          </span>
                        </div>
                      </div>

                      {/* Conversational, Simple Role Summary */}
                      <p className="pt-4 pb-2 text-xs text-foreground/80 leading-relaxed min-h-[58px]">
                        {p.summary}
                      </p>

                      {/* Documented Scope & Architecture Trigger */}
                      <div className="py-2.5 my-3 border-y border-border/60 flex justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProofModal(p);
                          }}
                          className={cn(
                            'w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer group',
                            p.isGroundUp
                              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-muted/40 text-foreground/80 border-border/70 hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <FileText className="size-3.5 text-muted-foreground" />
                          <span>{p.isGroundUp ? 'System Architecture & ERD' : 'Platform Scope & Reference'}</span>
                          <ExternalLink className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>

                      {/* 3 Core Operational Points (Clean, Scannable Rows) */}
                      <div className="py-2 space-y-2.5 text-xs">

                        {/* 1. Draw Speed */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                            <Clock className="size-3 text-muted-foreground" />
                            <span>Bank Draws</span>
                          </span>
                          <span className={cn(
                            'font-bold text-[11px] px-2 py-0.5 rounded-md text-right',
                            p.drawSpeed.positive
                              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                              : 'bg-muted text-muted-foreground font-medium'
                          )}>
                            {p.drawSpeed.label}
                          </span>
                        </div>

                        {/* 2. Lien Protection */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                            <ShieldCheck className="size-3 text-muted-foreground" />
                            <span>Lien Waivers</span>
                          </span>
                          <span className={cn(
                            'text-[11px] font-medium text-right',
                            p.lienProtection.positive
                              ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'text-muted-foreground'
                          )}>
                            {p.lienProtection.label}
                          </span>
                        </div>

                        {/* 3. Fee Model */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                            <DollarSign className="size-3 text-muted-foreground" />
                            <span>Fee Model</span>
                          </span>
                          <span className={cn(
                            'text-[11px] font-medium text-right',
                            p.feeModel.positive
                              ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'text-muted-foreground'
                          )}>
                            {p.feeModel.label}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Architectural Integration Clarification */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
              <p className="leading-relaxed">
                GroundUp is not a replacement for your general contractor&apos;s field software. It connects to your loan agreement and bank accounts as the owner&apos;s independent financial verification layer.
              </p>
              <button
                type="button"
                onClick={onStartOnboarding}
                className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1"
              >
                <span>Get started with GroundUp</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: Draw Speed Benchmark */}
        {comparisonMode === 'speed_timeline' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Horizontal Timeline Bar Chart */}
            <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h3 className="font-bold text-foreground text-sm sm:text-base">
                    Bank Draw Preparation Turnaround
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Elapsed time collecting vendor bills, verifying 10% retainage withholdings, and delivering AIA Document G702 and G703 packages.
                  </p>
                </div>

                <div className="space-y-5 pt-2">
                  {SPEED_BENCHMARKS.map((item) => (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          {item.name}
                        </span>
                        <span className={cn(
                          'font-bold text-xs',
                          item.isGroundUp ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
                        )}>
                          {item.label}
                        </span>
                      </div>

                      {/* Bar Track */}
                      <div className="h-3.5 w-full bg-muted/60 rounded-full overflow-hidden p-0.5 border border-border/40">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
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

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  Same-day package delivery eliminates 10 to 14 days of idle carrying cost per draw.
                </span>
              </div>
            </div>

            {/* Value Details Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-3.5">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Same-Day Package Assembly</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Compile vendor pay applications, retainage withholdings, and statutory lien waivers continuously upon invoice approval, eliminating weeks of manual spreadsheet reconciliation.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="size-4 text-primary" />
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Automated Duplicate Bill Detection</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  SHA-256 file hashing and commercial bank wire reconciliation prevent paying the same vendor invoice or change order twice.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <DollarSign className="size-4 text-foreground" />
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">No Construction Volume Fees</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Avoid paying 0.20% to 0.40% in recurring volume fees on your total construction loan. Simple, predictable asset plans with no debt volume penalty.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mode 3: Side-by-Side Matrix Table */}
        {comparisonMode === 'feature_matrix' && (
          <div className="mt-8 rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-semibold">
                    <th className="p-4 text-muted-foreground min-w-[170px]">Feature &amp; Operational Dimension</th>
                    <th className="p-4 text-emerald-800 dark:text-emerald-300 min-w-[200px] bg-emerald-500/10">
                      GroundUp (Developer Command)
                    </th>
                    <th className="p-4 text-foreground min-w-[170px]">Procore (Commercial GC)</th>
                    <th className="p-4 text-foreground min-w-[170px]">Buildertrend (Residential)</th>
                    <th className="p-4 text-foreground min-w-[160px]">Projul (Trade Dispatch)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MATRIX_FEATURES.map((row) => (
                    <tr key={row.dimension} className="hover:bg-muted/20 transition-colors">
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

            <div className="p-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>GroundUp operates as an owner financial layer alongside your existing general ledger and general contractor project software.</span>
              <a
                href="#audit-ledger"
                className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <span>Explore the 4 Synchronized Truths</span>
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Platform Architecture & Scope Modal */}
      {activeProofModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="proof-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveProofModal(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  <span>Documented Architecture &amp; Platform Scope</span>
                </span>
                <h3 id="proof-modal-title" className="text-lg font-bold text-foreground mt-0.5">
                  {activeProofModal.name} ({activeProofModal.roleBadge})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveProofModal(null)}
                className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Document Citation Details */}
            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="font-semibold text-foreground block">
                  Reference &amp; Documentation Source:
                </span>
                <span className="font-mono text-muted-foreground mt-0.5 block">
                  {activeProofModal.citation.sourceName} · {activeProofModal.citation.filingType}
                </span>
              </div>

              <div>
                <span className="font-semibold text-foreground block">
                  Documented Specification:
                </span>
                <blockquote className="mt-1.5 p-3 rounded-xl border border-border bg-muted/40 font-mono text-[11px] leading-relaxed text-foreground/90">
                  &ldquo;{activeProofModal.citation.verifiableQuote}&rdquo;
                </blockquote>
              </div>

              <div>
                <span className="font-semibold text-foreground block">
                  Target User &amp; Operational Role:
                </span>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  {activeProofModal.userRoleDescription}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                <span className="font-semibold text-foreground block mb-1">
                  Architectural Focus for Developers:
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {activeProofModal.summary}
                </p>
              </div>
            </div>

            {/* Footer Single Working Link */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveProofModal(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted/50 cursor-pointer transition-colors"
              >
                Close
              </button>

              <a
                href={activeProofModal.citation.verifiedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                <span>{activeProofModal.citation.actionLabel}</span>
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CompetitorComparison;
