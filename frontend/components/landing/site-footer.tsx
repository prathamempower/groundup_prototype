'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  ExternalLink,
  CheckCircle2,
  FileCheck2,
  Layers,
  Scale
} from 'lucide-react';
import { Logo } from '../logo';
import { LegalModal } from '../LegalModal';

export interface SiteFooterProps {
  onStartOnboarding?: () => void;
}

export function SiteFooter({ onStartOnboarding }: SiteFooterProps) {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');

  const openLegal = (tab: 'terms' | 'privacy') => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const el = document.getElementById(targetId);
    if (el) {
      const headerOffset = 76;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', href);
    }
  };

  return (
    <footer 
      role="contentinfo" 
      className="border-t border-slate-800 bg-slate-950 text-slate-400 antialiased" 
      aria-label="GroundUp AI Platform Footer"
    >
      {/* Institutional Capital Callout */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-12 lg:py-14">
        <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Ready to protect your construction capital?
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Reconcile trade invoices, municipal building inspections, and bank construction loan draws in one synchronized source of truth.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {onStartOnboarding && (
                <button
                  type="button"
                  onClick={onStartOnboarding}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>Start Project Intake</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              )}
              <a
                href="https://groundupdoc.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              >
                <span>Live 28-Table ERD</span>
                <ExternalLink className="size-3.5 text-slate-400" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Assurance Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/20 py-4">
        <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y-0 md:divide-x divide-slate-800/80 text-left">
            <div className="flex items-center gap-2.5 p-1">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white font-mono">Four Truths Ledger</p>
                <p className="text-[11px] text-slate-400">Budget, Spend, Progress, Funding</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1 md:pl-4">
              <ShieldCheck className="size-4 text-blue-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white font-mono">10% Retainage Enforced</p>
                <p className="text-[11px] text-slate-400">AIA Document A201 Compliance</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1 md:pl-4">
              <Scale className="size-4 text-amber-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white font-mono">Statutory Lien Protection</p>
                <p className="text-[11px] text-slate-400">CA Civil Code § 8132 to § 8138</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1 md:pl-4">
              <Lock className="size-4 text-indigo-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white font-mono">Cryptographic Custody</p>
                <p className="text-[11px] text-slate-400">SHA-256 Multi-Tenant Isolation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Structural Link Columns */}
      <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Column 1: Core Draw Engine */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Draw Engine
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a 
                  href="#how-it-works" 
                  onClick={(e) => handleScrollTo(e, '#how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Document Ingestion Sandbox
                </a>
              </li>
              <li>
                <a 
                  href="#verification" 
                  onClick={(e) => handleScrollTo(e, '#verification')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  CSI MasterFormat Matcher
                </a>
              </li>
              <li>
                <a 
                  href="#verification" 
                  onClick={(e) => handleScrollTo(e, '#verification')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  AIA G702 &amp; G703 Assembly
                </a>
              </li>
              <li>
                <a 
                  href="#verification" 
                  onClick={(e) => handleScrollTo(e, '#verification')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  10% Retainage Withholding
                </a>
              </li>
              <li>
                <a 
                  href="#attention" 
                  onClick={(e) => handleScrollTo(e, '#attention')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Exception Resolution Queue
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: The Four Truths */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              The Four Truths
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a 
                  href="#audit-ledger" 
                  onClick={(e) => handleScrollTo(e, '#audit-ledger')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Approved Baseline Budget
                </a>
              </li>
              <li>
                <a 
                  href="#audit-ledger" 
                  onClick={(e) => handleScrollTo(e, '#audit-ledger')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Incurred Spend &amp; Vendor Bills
                </a>
              </li>
              <li>
                <a 
                  href="#audit-ledger" 
                  onClick={(e) => handleScrollTo(e, '#audit-ledger')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Municipal Site Inspection Truth
                </a>
              </li>
              <li>
                <a 
                  href="#audit-ledger" 
                  onClick={(e) => handleScrollTo(e, '#audit-ledger')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cleared Bank Funding Truth
                </a>
              </li>
              <li>
                <a 
                  href="#money-over-time" 
                  onClick={(e) => handleScrollTo(e, '#money-over-time')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Compounding Debt Service Carry
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Accounting & ERP */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Accounting &amp; GL
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a 
                  href="#positioning" 
                  onClick={(e) => handleScrollTo(e, '#positioning')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  QuickBooks Online Integration
                </a>
              </li>
              <li>
                <a 
                  href="#positioning" 
                  onClick={(e) => handleScrollTo(e, '#positioning')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Sage 300 CRE (Timberline)
                </a>
              </li>
              <li>
                <a 
                  href="#positioning" 
                  onClick={(e) => handleScrollTo(e, '#positioning')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Yardi Voyager General Ledger
                </a>
              </li>
              <li>
                <a 
                  href="#positioning" 
                  onClick={(e) => handleScrollTo(e, '#positioning')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Procore Schedule Direct Import
                </a>
              </li>
              <li>
                <a 
                  href="#money-over-time" 
                  onClick={(e) => handleScrollTo(e, '#money-over-time')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Bank Wire Reconciler
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Statutory Compliance */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Statutory Protection
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="hover:text-slate-200 transition-colors">
                  CA Civil Code § 8132 (Conditional Progress)
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors">
                  CA Civil Code § 8134 (Unconditional Progress)
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors">
                  CA Civil Code § 8136 (Conditional Final)
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors">
                  CA Civil Code § 8138 (Unconditional Final)
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors">
                  CSI 50-Division MasterFormat
                </span>
              </li>
            </ul>
          </div>

          {/* Column 5: Reference Assets & Architecture */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              System References
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a 
                  href="https://groundupdoc.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <span>Interactive 28-Table ERD</span>
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <span className="text-slate-300">
                  73 Broadway ($4.2M Loan)
                </span>
              </li>
              <li>
                <span className="text-slate-300">
                  392 1st Street Disposition
                </span>
              </li>
              <li>
                <a 
                  href="#comparison" 
                  onClick={(e) => handleScrollTo(e, '#comparison')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Market Benchmark Analysis
                </a>
              </li>
              {onStartOnboarding && (
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={onStartOnboarding}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Start your project</span>
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </button>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Brand Mission Row */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Logo theme="dark" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <p className="text-xs text-slate-400 leading-relaxed">
              GroundUp AI delivers the construction financial command center for real estate developers, reconciling investor equity, construction loans, bank statements, and HUD settlement filings, enforcing 10% retainage withholdings, and assembling lender-ready draw packages without spreadsheet delays.
            </p>
          </div>
        </div>

        {/* Bottom Copyright & Governance Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>Copyright &copy; 2026 GroundUp AI Technologies Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <a 
              href="#main-content" 
              onClick={(e) => handleScrollTo(e, '#main-content')} 
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Agent Governance
            </a>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              type="button"
              onClick={() => openLegal('privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-none p-0 text-slate-500"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              type="button"
              onClick={() => openLegal('terms')}
              className="hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-none p-0 text-slate-500"
            >
              Terms of Service
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <a 
              href="https://groundupdoc.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <span>Live ERD Explorer</span>
              <ExternalLink className="size-2.5" aria-hidden="true" />
            </a>
          </div>
        </div>

      </div>

      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        initialTab={legalTab}
      />
    </footer>
  );
}

export default SiteFooter;
