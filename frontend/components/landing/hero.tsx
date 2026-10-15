'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';
import { MaskedText } from '../ui/masked-text';
import { RotatingWord } from '../ui/rotating-word';
import { ProjectOverview } from './project-overview';

export interface HeroProps {
  onStartOnboarding: () => void;
}

const ROTATING_PAIN_POINTS = [
  'Spreadsheet Lag.',
  'Lien Waiver Risks.',
  'Unverified Draws.',
  'Interest Carry Surprises.',
  'Paperwork Blindspots.'
];

export function Hero({ onStartOnboarding }: HeroProps) {
  const handleWatchFilm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('product-film');
    if (el) {
      const headerOffset = 76;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      window.history.pushState(null, '', '#product-film');
      const video = el.querySelector('video');
      if (video) video.play().catch(() => {});
    }
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-border/80 bg-background"
      aria-labelledby="hero-heading"
    >
      {/* Blueprint grid: left side only */}
      <div
        className="blueprint-grid pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-35 [mask-image:linear-gradient(to_right,black,transparent)]"
        aria-hidden="true"
      />

      {/* Building photography: full-bleed right half on desktop */}
      <div
        className="hidden lg:block absolute inset-y-0 right-0 w-[58%] pointer-events-none transition-opacity"
        aria-hidden="true"
      >
        <Image
          src="/landing/hero-building.jpg"
          alt="GroundUp Construction Asset"
          fill
          priority
          unoptimized
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Desktop Gradient: fades photo leftward */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(248,249,250,1) 0%, rgba(248,249,250,0.65) 30%, rgba(248,249,250,0.15) 70%, transparent 100%), ' +
              'linear-gradient(to top, rgba(248,249,250,0.85) 0%, transparent 35%)',
          }}
        />
      </div>

      {/* Main layout grid */}
      <div className="relative mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">

          {/* Left Column: Headline + Body + CTAs */}
          <div className="lg:col-span-5 min-w-0 flex flex-col gap-7">

            <div className="flex flex-col gap-3">
              <h1
                id="hero-heading"
                className="text-[clamp(1.65rem,6.2vw,2.25rem)] sm:text-[clamp(2.25rem,4.5vw,2.85rem)] lg:text-[clamp(2.15rem,2.7vw,2.65rem)] xl:text-[clamp(2.65rem,2.4vw,3.05rem)] 2xl:text-[3.4rem] font-extrabold tracking-tight text-foreground leading-[1.08] break-words"
              >
                <span className="block sm:whitespace-nowrap">
                  Protect Every Dollar
                </span>
                <span className="block sm:whitespace-nowrap">
                  of Project Capital.
                </span>
              </h1>

              {/* Rotating kinetic subtitle: separate element, controlled size, never overflows */}
              <p className="flex items-baseline gap-x-[0.3em] text-lg sm:text-xl lg:text-2xl font-bold leading-tight" aria-live="off">
                <span className="text-muted-foreground/65 shrink-0">Zero</span>
                <RotatingWord
                  words={ROTATING_PAIN_POINTS}
                  intervalMs={3200}
                  className="text-foreground overflow-hidden"
                  wordClassName="underline decoration-emerald-500/50 decoration-2 underline-offset-4"
                />
              </p>
            </div>

            <p className="text-[0.9375rem] text-muted-foreground leading-[1.7] max-w-[440px]">
              Reconcile construction loans and equity against actual job costs in real time. Turn invoices and bank records into verified, lender-ready draw packets with complete lien waiver tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                type="button"
                onClick={onStartOnboarding}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-slate-900 px-7 py-4 text-[0.9375rem] font-bold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98] shadow-md cursor-pointer whitespace-nowrap"
              >
                <span className="text-white">Start your project</span>
                <ArrowRight className="size-[1.05rem] text-white transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>

              <a
                href="#product-film"
                onClick={handleWatchFilm}
                className="inline-flex items-center gap-2.5 rounded-xl border border-border/80 bg-card px-5 py-4 text-[0.9375rem] font-semibold text-foreground transition-all hover:bg-muted cursor-pointer whitespace-nowrap"
              >
                <div className="size-6 rounded-full bg-foreground/8 flex items-center justify-center shrink-0">
                  <Play className="size-3 fill-current" aria-hidden="true" />
                </div>
                <span>Watch Product Film</span>
              </a>
            </div>



          </div>

          {/* Right Column: Dashboard floats over the building photo */}
          <div className="lg:col-span-7 min-w-0">
            <ProjectOverview />
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;
