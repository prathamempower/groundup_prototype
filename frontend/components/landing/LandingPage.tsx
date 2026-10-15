// GroundUp AI: Architectural Construction Financial Management
// Precision Landing Experience & Direct Onboarding Portal
// Governance: Zero em dashes, zero executive acronyms, fully synchronized financial truths

'use client';

import React from 'react';
import { AuthenticatedUser } from '@/lib/types';
import {
  SiteHeader,
  Hero,
  ProductFilm,
  RecordsStory,
  FourViews,
  MoneyOverTime,
  AttentionQueue,
  CompetitorComparison,
  StickyReveal,
  FaqSection,
  FinalCta,
  SiteFooter,
} from './index';

export interface OnboardingPrefill {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  stage?: string;
  budget?: string;
}

export interface LandingPageProps {
  onAuthenticate?: (user: AuthenticatedUser) => void;
  onStartOnboarding: (prefill?: OnboardingPrefill) => void;
}

export function LandingPage({ onAuthenticate = () => {}, onStartOnboarding }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-attention/20 selection:text-foreground">
      <SiteHeader 
        onStartOnboarding={() => onStartOnboarding()} 
        onAuthenticate={onAuthenticate}
      />
      <main id="main-content">
        <Hero onStartOnboarding={() => onStartOnboarding()} />
        <ProductFilm onStartOnboarding={() => onStartOnboarding()} />
        <RecordsStory />
        <FourViews />
        <MoneyOverTime onStartOnboarding={() => onStartOnboarding()} />
        <CompetitorComparison onStartOnboarding={() => onStartOnboarding()} />
        <AttentionQueue />
        <StickyReveal />
        <FaqSection onStartOnboarding={() => onStartOnboarding()} />
        <FinalCta onStartOnboarding={() => onStartOnboarding()} />
      </main>
      <SiteFooter onStartOnboarding={() => onStartOnboarding()} />
    </div>
  );
}

export default LandingPage;
