'use client';

import React from 'react';
import { Reveal } from '../reveal';
import { StatusLadder } from './status-ladder';
import { MaskedText } from '../ui/masked-text';

export function FourViews() {
  return (
    <section id="verification" className="scroll-mt-16 border-b border-border bg-card" aria-labelledby="verification-heading">
      <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 sm:py-20 lg:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-muted-foreground">Draws and invoices</p>
            <h2 id="verification-heading" className="mt-3 text-fluid-title font-bold tracking-tight text-balance text-foreground">
              <MaskedText as="span">
                Clear verification from invoice to cleared bank wire.
              </MaskedText>
            </h2>
            <p className="mt-4 text-fluid-subtitle leading-relaxed text-pretty text-muted-foreground">
              A submitted draw request, an approved pay application, and cleared bank funds each represent a different milestone. GroundUp separates each stage clearly and only counts capital once verified by your bank and inspection cards.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Select any stage below to inspect how GroundUp verifies and accounts for project capital at each milestone.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <StatusLadder />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export const VerificationSection = FourViews;
export default FourViews;
