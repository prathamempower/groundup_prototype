'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUp, Mail, MapPin, ShieldCheck, Scale } from 'lucide-react';
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer 
      role="contentinfo" 
      className="border-t border-slate-200/80 bg-white text-slate-600 antialiased" 
      aria-label="GroundUp Platform Footer"
    >
      <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand & Contact Column (Left, 5 cols on lg) */}
          <div className="md:col-span-5 space-y-4">
            <Logo 
              theme="light" 
              onClick={scrollToTop}
              className="cursor-pointer"
            />
            
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              The construction financial command center for real estate developers. Reconcile trade invoices, municipal building inspections, and bank construction loan draws in one synchronized source of truth.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <a 
                  href="mailto:start@groundup.ai" 
                  className="font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  start@groundup.ai
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span>San Francisco, CA · New York, NY</span>
              </div>
            </div>
          </div>

          {/* Navigation Columns (Right, 7 cols on lg) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Column 1: Platform Anchors */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 font-mono">
                Platform
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li>
                  <a 
                    href="#how-it-works" 
                    onClick={(e) => handleScrollTo(e, '#how-it-works')}
                    className="hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Workflow
                  </a>
                </li>
                <li>
                  <a 
                    href="#audit-ledger" 
                    onClick={(e) => handleScrollTo(e, '#audit-ledger')}
                    className="hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Four Truths Ledger
                  </a>
                </li>
                <li>
                  <a 
                    href="#money-over-time" 
                    onClick={(e) => handleScrollTo(e, '#money-over-time')}
                    className="hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Timeline &amp; Debt Carry
                  </a>
                </li>
                <li>
                  <a 
                    href="#comparison" 
                    onClick={(e) => handleScrollTo(e, '#comparison')}
                    className="hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Market Benchmark
                  </a>
                </li>
                <li>
                  <a 
                    href="#faq" 
                    onClick={(e) => handleScrollTo(e, '#faq')}
                    className="hover:text-slate-900 transition-colors cursor-pointer font-medium text-blue-600 hover:text-blue-700"
                  >
                    Frequently Asked Questions
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Product Routes */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 font-mono">
                Product
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li>
                  {onStartOnboarding ? (
                    <button
                      type="button"
                      onClick={onStartOnboarding}
                      className="hover:text-slate-900 transition-colors cursor-pointer text-left p-0 bg-transparent border-none text-sm text-slate-600"
                    >
                      Start Project Intake
                    </button>
                  ) : (
                    <Link href="/auth/sign-up" className="hover:text-slate-900 transition-colors">
                      Start Project Intake
                    </Link>
                  )}
                </li>
                <li>
                  <Link href="/projects" className="hover:text-slate-900 transition-colors">
                    Project Portfolio
                  </Link>
                </li>
                <li>
                  <Link href="/draws" className="hover:text-slate-900 transition-colors">
                    Draw Packages
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-slate-900 transition-colors">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/sign-up" className="hover:text-slate-900 transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Trust & Legal */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 font-mono">
                Trust &amp; Legal
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Scale className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span>CA Civil Code § 8132 to § 8138</span>
                </li>
                <li className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span>10% Retainage (AIA A201)</span>
                </li>
                <li className="pt-1">
                  <Link
                    href="/privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      openLegal('privacy');
                    }}
                    className="hover:text-slate-900 transition-colors cursor-pointer text-sm text-slate-600 text-left inline-block"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    onClick={(e) => {
                      e.preventDefault();
                      openLegal('terms');
                    }}
                    className="hover:text-slate-900 transition-colors cursor-pointer text-sm text-slate-600 text-left inline-block"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            Copyright &copy; 2026 GroundUp AI Technologies Inc. All rights reserved.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer font-medium"
            aria-label="Scroll back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="size-3.5" aria-hidden="true" />
          </button>
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
