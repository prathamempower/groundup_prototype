'use client';

import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  ExternalLink,
  CheckCircle2,
  Layers,
  FileCheck2,
  Activity
} from 'lucide-react';
import { Logo } from '../logo';

export interface SiteFooterProps {
  onStartOnboarding?: () => void;
}

export function SiteFooter({ onStartOnboarding }: SiteFooterProps) {
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
      className="border-t border-border bg-slate-950 text-slate-300 antialiased" 
      aria-label="GroundUp AI Platform Footer"
    >
      {/* Institutional Assurance Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-4">
        <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x-0 md:divide-x divide-slate-800">
            <div className="flex items-center justify-center gap-2 p-1">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Four Truths Ledger</p>
                <p className="text-[10px] text-slate-400">Budget, Spend, Progress, Funding</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-1">
              <ShieldCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">10% Retainage Enforced</p>
                <p className="text-[10px] text-slate-400">AIA Document A201 Compliance</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-1">
              <Layers className="size-4 text-sky-400 shrink-0" aria-hidden="true" />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Draw Packet Builder</p>
                <p className="text-[10px] text-slate-400">Automated AIA G702 Assembly</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-1">
              <Lock className="size-4 text-indigo-400 shrink-0" aria-hidden="true" />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Cryptographic Custody</p>
                <p className="text-[10px] text-slate-400">SHA-256 Multi-Tenant Isolation</p>
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
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
                  Retainage Withholding
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
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
                  Bank Wire &amp; Disbursement Reconciler
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Statutory Compliance */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Statutory Protection
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="hover:text-slate-200 transition-colors">
                  CA Civil Code Section 8132 (Progress)
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors">
                  CA Civil Code Section 8134 (Unconditional)
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors">
                  CA Civil Code Section 8136 (Final)
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors">
                  CA Civil Code Section 8138 (Unconditional Final)
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              System References
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a 
                  href="https://groundupdoc.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
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
                    className="btn-micro inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
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
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Logo theme="dark" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <p className="text-xs text-slate-400 leading-relaxed">
              GroundUp AI delivers the construction financial command center for real estate developers: reconciling investor equity, construction loans, bank statements, and HUD settlement filings, enforcing 10% retainage withholdings, and building lender-ready draw packages without spreadsheet delays.
            </p>
          </div>
        </div>

        {/* Bottom Copyright & Governance Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>Copyright &copy; 2026 GroundUp AI Technologies Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#main-content" onClick={(e) => handleScrollTo(e, '#main-content')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Agent Governance
            </a>
            <span aria-hidden="true">·</span>
            <a href="#main-content" onClick={(e) => handleScrollTo(e, '#main-content')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Privacy Policy
            </a>
            <span aria-hidden="true">·</span>
            <a href="#main-content" onClick={(e) => handleScrollTo(e, '#main-content')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Terms of Service
            </a>
            <span aria-hidden="true">·</span>
            <a 
              href="https://groundupdoc.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-slate-300 transition-colors inline-flex items-center gap-1"
            >
              <span>Live ERD Explorer</span>
              <ExternalLink className="size-2.5" aria-hidden="true" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default SiteFooter;
