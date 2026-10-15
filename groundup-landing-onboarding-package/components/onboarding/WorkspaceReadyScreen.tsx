'use client';

// GroundUp AI: Post-Onboarding Welcome & Guided Workspace Tour
// Governance: Zero em dashes, zero executive acronyms, pure high-trust construction fintech styling
// Impeccable Design: 5 to 10s automatic guided tour, personalized welcome, single unmistakable primary CTA

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layers,
  Building2,
  DollarSign,
  FileCheck2,
  Landmark,
  Pause,
  Play,
  Calendar,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { authAdapter } from '@/lib/api/adapters/auth-adapter';

export interface ProjectReportData {
  id?: string;
  name?: string;
  address?: string;
  target_budget?: number;
  funding?: string;
  projectStage?: string;
  projectStatus?: string;
  units?: number;
  sqFt?: number;
  teamMembers?: Array<{ email: string; role: string }>;
  [key: string]: unknown;
}

interface WorkspaceReadyScreenProps {
  userName?: string;
  userRole?: string;
  projectName: string;
  projectData: ProjectReportData;
  onRestartOnboarding?: () => void;
  onReturnToLanding?: () => void;
}

interface TourSlide {
  id: string;
  tag: string;
  title: string;
  guidance: string;
  badge: string;
  accentColor: string;
  icon: React.ComponentType<{ className?: string }>;
  metrics: Array<{ label: string; value: string }>;
  detailView: React.ReactNode;
}

const SLIDE_DURATION_MS = 2500; // 2.5s per slide, 4 slides = 10s total cycle

export function WorkspaceReadyScreen({
  userName,
  userRole,
  projectName,
  projectData,
  onReturnToLanding,
}: WorkspaceReadyScreenProps) {
  const router = useRouter();

  // Resolve user display name
  const [displayName, setDisplayName] = useState<string>(() => {
    if (userName && userName.trim()) return userName.trim();
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('groundup_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name && parsed.name.trim()) return parsed.name.trim();
          if (parsed?.email) return parsed.email.split('@')[0];
        }
      } catch {}
    }
    return 'Developer';
  });

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stepProgress, setStepProgress] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formattedBudget = projectData?.target_budget
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
        projectData.target_budget
      )
    : '$4,200,000';

  const address = projectData?.address || '73 Broadway, Brooklyn, NY 11249';

  const handleEnterDashboard = useCallback(async () => {
    const activeProjectId =
      projectData?.id ||
      (typeof window !== 'undefined' &&
        (window.localStorage.getItem('groundup_active_project_id') ||
          window.localStorage.getItem('groundup_last_project_id'))) ||
      '73-broadway';

    if (typeof window !== 'undefined') {
      try {
        let authEmail = window.localStorage.getItem('groundup_active_auth_email');
        if (!authEmail) {
          const userStr = window.localStorage.getItem('groundup_user');
          if (userStr) {
            const u = JSON.parse(userStr);
            authEmail = u.email;
          }
        }
        if (!authEmail) {
          authEmail = 'alex.morgan@vancedevelopment.com';
        }
        await authAdapter.signIn(authEmail, 'password');
        window.localStorage.setItem('groundup_session_seen', '1');
      } catch (err) {
        console.warn('Auto-session initialization before entering dashboard:', err);
      }
    }

    router.push(`/projects/${activeProjectId}/control-center`);
  }, [projectData?.id, router]);

  // ── 4 Key Educational Tour Slides ──────────────────────────────────────────
  const slides: TourSlide[] = [
    {
      id: 'wbs-baseline',
      tag: 'Lens 1: Work Breakdown Structure',
      title: 'CSI MasterFormat WBS Budget Locked',
      guidance:
        'Your 50-division cost code structure is synchronized to pro forma baseline. Every subcontractor invoice automatically reconciles against approved trade lines to stop scope creep before funds disburse.',
      badge: '50 Divisions Active',
      accentColor: 'emerald',
      icon: Layers,
      metrics: [
        { label: 'Baseline Budget', value: formattedBudget },
        { label: 'Contingency Allocation', value: '7.5% Locked' },
      ],
      detailView: (
        <div className="space-y-2 bg-slate-900/90 text-white p-4 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 font-sans font-semibold">
            <span>CSI Code & Description</span>
            <span>Allocated Baseline</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span className="flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Div 03: Concrete & Foundation
            </span>
            <span>$480,000</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span className="flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Div 05: Structural Steel Framing
            </span>
            <span>$620,000</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span className="flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Div 26: Rough Electrical & Service
            </span>
            <span>$310,000</span>
          </div>
        </div>
      ),
    },
    {
      id: 'inspection-defense',
      tag: 'Lens 2: Field Verification & Inspections',
      title: 'Municipal Building Milestones Active',
      guidance:
        'Physical site milestones are tied directly to jurisdictional sign-offs. If an inspection card requires re-check, GroundUp isolates only that specific trade, defending your project from compounding debt service burn.',
      badge: 'Targeted Cost Isolation',
      accentColor: 'blue',
      icon: Building2,
      metrics: [
        { label: 'Municipal Authority', value: 'Department of Buildings' },
        { label: 'Carry Defense', value: '$840 / day protected' },
      ],
      detailView: (
        <div className="space-y-2 bg-slate-900/90 text-white p-4 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 font-semibold">
            <span>Mandatory Inspection Milestone</span>
            <span>Sign-Off Status</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-200">Foundation Rebar & Footings</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-200">Structural Framing & Shear Wall</span>
            <span className="inline-flex items-center gap-1 text-sky-400 font-bold font-mono">
              <Building2 className="w-3.5 h-3.5" /> Milestone Scheduled
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-200">MEP Rough-In Sign-Off</span>
            <span className="inline-flex items-center gap-1 text-slate-400 font-mono">
              Locked to Framing Sign-Off
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'lien-protection',
      tag: 'Lens 3: Statutory Lien Waiver Engine',
      title: 'California & Standard Statutory Waivers',
      guidance:
        'Conditional progress lien waivers are generated and verified before disbursement authorization. Mechanics liens and title clouds are preemptively blocked at every monthly payment cycle.',
      badge: 'Civil Code Compliant',
      accentColor: 'emerald',
      icon: ShieldCheck,
      metrics: [
        { label: 'Compliance Protocol', value: 'Civil Code § 8132 to § 8138' },
        { label: 'Retainage Withholding', value: '10% AIA A201 Standard' },
      ],
      detailView: (
        <div className="space-y-2 bg-slate-900/90 text-white p-4 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 font-semibold">
            <span>Trade Subcontractor</span>
            <span>Lien Waiver Status</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-200">Empire Concrete Contractors LLC</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold font-mono">
              <FileCheck2 className="w-3.5 h-3.5" /> Waiver Verified
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-200">Apex Structural Steelworks</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold font-mono">
              <FileCheck2 className="w-3.5 h-3.5" /> Waiver Verified
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-200">Standard Retainage Holdback</span>
            <span className="text-slate-300 font-mono">10% Held in Escrow</span>
          </div>
        </div>
      ),
    },
    {
      id: 'draw-assembly',
      tag: 'Lens 4: Lender Draw Package Assembly',
      title: 'Same-Day Bank Draw Package Assembly',
      guidance:
        'Transform hundreds of invoices into standardized AIA G702 and G703 draw submission packages, complete with inspection proofs formatted for your commercial bank loan officer.',
      badge: 'Bank-Ready AIA G702',
      accentColor: 'amber',
      icon: Landmark,
      metrics: [
        { label: 'Output Format', value: 'AIA G702 / G703 PDF' },
        { label: 'Lender Architecture', value: 'Direct Inbound / Outbound' },
      ],
      detailView: (
        <div className="space-y-2 bg-slate-900/90 text-white p-4 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 font-sans font-semibold">
            <span>AIA G702 Draw Summary</span>
            <span>Columbia Bank Package</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span className="font-sans">Gross Completed to Date</span>
            <span>$840,000.00</span>
          </div>
          <div className="flex items-center justify-between text-amber-400">
            <span className="font-sans">Less 10% Retainage Withheld</span>
            <span>($84,000.00)</span>
          </div>
          <div className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
            <span className="font-sans">Net Loan Reimbursement Payable</span>
            <span>$756,000.00</span>
          </div>
        </div>
      ),
    },
  ];

  // ── Auto-advance timer (5-10 second smooth animation) ─────────────────────
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const intervalStep = 50;
    const progressIncrement = (intervalStep / SLIDE_DURATION_MS) * 100;

    progressIntervalRef.current = setInterval(() => {
      setStepProgress(prev => {
        if (prev >= 100) {
          setActiveStep(curr => (curr + 1) % slides.length);
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalStep);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPaused, slides.length]);

  const handleSelectStep = (index: number) => {
    setActiveStep(index);
    setStepProgress(0);
  };

  const currentSlide = slides[activeStep];
  const IconComponent = currentSlide.icon;

  return (
    <div
      className="min-h-screen flex flex-col text-slate-900 font-sans antialiased bg-slate-50 selection:bg-slate-900 selection:text-white"
      style={{
        backgroundImage:
          'radial-gradient(at 100% 0%, rgba(224, 242, 254, 0.45) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(240, 253, 244, 0.45) 0px, transparent 50%)',
      }}
    >
      {/* ── Minimalist Top Bar (No duplicate distraction buttons) ─────────────── */}
      <header
        id="workspace-header"
        role="banner"
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Logo onClick={onReturnToLanding} />
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600">Workspace Ready</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden md:inline">
            Project: <strong className="text-slate-800">{projectName}</strong>
          </span>
          <button
            type="button"
            onClick={handleEnterDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <span>Skip tour</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Main Onboarding Welcome & Guided Tour Presentation ────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center gap-6">
        {/* Welcome Greeting Header */}
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Workspace Configured & Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Your project workspace for <strong className="text-slate-800 font-semibold">{projectName}</strong> is live.
            Review the 4 core controls initialized for your development operations:
          </p>
        </div>

        {/* Interactive Tour Card with Automatic Animation */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm transition-all relative overflow-hidden"
        >
          {/* 4-Step Animated Progress Indicator */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
            {slides.map((s, idx) => {
              const isPast = idx < activeStep;
              const isCurrent = idx === activeStep;
              const fillPercent = isPast ? 100 : isCurrent ? stepProgress : 0;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectStep(idx)}
                  className="group text-left focus:outline-hidden cursor-pointer"
                  title={`Jump to ${s.title}`}
                >
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all ease-linear ${
                        isCurrent || isPast ? 'bg-slate-900' : 'bg-transparent'
                      }`}
                      style={{
                        width: `${fillPercent}%`,
                        transitionDuration: isCurrent ? '50ms' : '200ms',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] sm:text-xs font-bold truncate ${
                        isCurrent ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      0{idx + 1}. {s.title.split(' ')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Screen Content with Transition Animation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Guidance & Clear Copy */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                  <IconComponent className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {currentSlide.tag}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-semibold">
                    {currentSlide.badge}
                  </span>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {currentSlide.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {currentSlide.guidance}
              </p>

              {/* Simplified Key Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {currentSlide.metrics.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                      {m.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual Verification Proof Mockup */}
            <div className="md:col-span-5 flex flex-col justify-center">
              <div className="rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs">
                {currentSlide.detailView}
              </div>
            </div>
          </div>

          {/* Tour Controls (Play/Pause & Step Count) */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPaused(p => !p)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                aria-label={isPaused ? 'Resume tour playback' : 'Pause tour playback'}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3 h-3 text-slate-700" />
                    <span>Play tour</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 text-slate-700" />
                    <span>Pause tour</span>
                  </>
                )}
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-[11px] text-slate-400">
                Screen {activeStep + 1} of {slides.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectStep(idx)}
                  className={`w-2 h-2 rounded-full transition cursor-pointer ${
                    idx === activeStep ? 'bg-slate-900 scale-125' : 'bg-slate-200 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Single Prominent Primary Action: Enter Dashboard ─────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-center sm:text-left">
            <div className="text-xs font-bold text-slate-800">
              {projectName}
            </div>
            <div className="text-xs text-slate-500">
              {address}
            </div>
          </div>

          <button
            id="btn-enter-dashboard"
            type="button"
            onClick={handleEnterDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer bg-slate-900 hover:bg-slate-800 active:scale-98"
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </main>
    </div>
  );
}
