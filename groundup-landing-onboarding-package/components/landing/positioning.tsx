'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';
import { Reveal } from '../reveal';
import { MaskedText } from '../ui/masked-text';

const CAPABILITIES = [
  'Tracks construction budgets against approved costs and formal change orders',
  'Verifies trade invoices against bank records and 10% retainage withholdings',
  'Tracks funding milestones across developer equity and commercial bank loan draws',
  'Monitors project spend against certified site inspection cards and statutory lien waivers',
];

const INTEGRATIONS = [
  'Synchronizes with QuickBooks, Sage 300 CRE, and Yardi general ledgers',
  'Exports standard AIA G702 and G703 pay application packages for lender inspection',
  'Leaves field scheduling and superintendent daily logs to your general contractor',
  'Requires human authorization for every bank wire and draw release',
];

const AUDIENCE = [
  { title: 'Owners & Developers', body: 'Reconcile investor equity and bank loan capital against actual trade spend without waiting for month-end reconciliation reports.' },
  { title: 'Finance Controllers & Accountants', body: 'Collaborate on one verified ledger instead of passing fragile spreadsheets. Ingest HUD filings and loan notes directly into automated draw packets.' },
  { title: "Owner's Representatives & PMs", body: 'Track municipal building department inspection signoffs, predict schedule delay carry, and verify 10% retainage before funds move.' },
];

export function Positioning() {
  return (
    <section id="positioning" className="scroll-mt-16 border-b border-border bg-card" aria-labelledby="positioning-heading">
      <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 sm:py-20 lg:py-28">
        <Reveal className="max-w-3xl">
          <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-muted-foreground">Who it is for</p>
          <h2 id="positioning-heading" className="mt-3 text-fluid-title font-bold tracking-tight text-foreground">
            <MaskedText as="span">
              Built for the people who carry the financial risk.
            </MaskedText>
          </h2>
        </Reveal>

        <ul className="mt-10 sm:mt-12 grid gap-6 sm:gap-8 lg:gap-10 sm:grid-cols-3">
          {AUDIENCE.map((a, i) => (
            <Reveal as="li" key={a.title} delay={i * 90} className="card-micro border-t border-foreground pt-5 p-3 rounded-lg hover:bg-muted/20">
              <h3 className="font-semibold text-foreground text-base sm:text-lg">{a.title}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">{a.body}</p>
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 sm:mt-16 grid gap-6 sm:gap-8 lg:gap-10 md:grid-cols-2">
          <Reveal className="card-micro rounded-xl border border-border bg-background p-6 shadow-xs">
            <h3 className="font-semibold text-foreground">Core financial control</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {CAPABILITIES.map((item) => (
                <li key={item} className="flex gap-2.5 text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-verified" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="card-micro rounded-xl border border-border bg-background p-6 shadow-xs">
            <h3 className="font-semibold text-foreground">Enterprise compatibility</h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground">
              {INTEGRATIONS.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-verified" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              GroundUp works alongside your existing bank and enterprise software. You stay in full control of every financial decision.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
