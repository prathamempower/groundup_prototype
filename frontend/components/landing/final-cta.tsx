'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '../reveal';
import { MaskedText } from '../ui/masked-text';

const STEPS = [
  'Forward bank statements, HUD filings, and loan agreements to your project inbox',
  'Reconcile investor equity and bank loan advances against CSI cost codes',
  'Assemble lender-ready draw packages collaboratively with your project team',
  'Forecast municipal inspection delay carry and protect project returns on one live timeline',
];

export interface FinalCtaProps {
  onStartOnboarding: () => void;
}

export function FinalCta({ onStartOnboarding }: FinalCtaProps) {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white" aria-labelledby="cta-heading">
      <div className="mx-auto grid max-w-7xl 2xl:max-w-screen-2xl gap-12 px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 sm:py-20 lg:py-28 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h2 id="cta-heading" className="text-fluid-title font-bold tracking-tight text-white">
            <span>
              Start with one project.
            </span>
          </h2>
          <p className="mt-5 max-w-md text-fluid-subtitle leading-relaxed text-slate-300">
            Connect your active construction loan agreements, bank statements, and trade bills. See where every dollar originates and clears across your Four Truths ledger.
          </p>
          <button
            type="button"
            onClick={onStartOnboarding}
            aria-label="Start your construction project onboarding"
            className="btn-micro group mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-100 cursor-pointer shadow-md"
          >
            <span>Start your project</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </Reveal>
        <Reveal delay={120}>
          <ol className="divide-y divide-white/15 border-y border-white/15">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-5 py-4">
                <span className="font-mono text-sm text-slate-400 tabular">0{i + 1}</span>
                <span className="text-base sm:text-lg text-slate-100">{step}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

// Re-export SiteFooter from site-footer for backwards-compatibility
export { SiteFooter } from './site-footer';
