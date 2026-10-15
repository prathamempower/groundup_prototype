'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, Copy, FileWarning, TrendingUp, Wallet, X, Hammer } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MaskedText } from '../ui/masked-text';
import { Reveal } from '../reveal';
import { useInView } from '../../hooks/use-in-view';

type Resolution = 'open' | 'verified' | 'dismissed';

const ITEMS = [
  {
    id: 'duplicate',
    icon: Copy,
    title: 'Possible duplicate payment',
    meta: 'Concrete subcontractor: $184,300',
    found: 'Two outgoing ACH payments of $184,300 on Oct 2 and Oct 9 both reference invoice #2291.',
    why: 'If both cleared, spend is overstated and the subcontractor has been overpaid.',
    next: 'Confirm with the bank whether the Oct 9 payment cleared, then request a credit or refund.',
    evidence: ['Invoice #2291', 'Bank txn Oct 2', 'Bank txn Oct 9'],
  },
  {
    id: 'waiver',
    icon: FileWarning,
    title: 'Missing lien waiver',
    meta: 'Draw #7: Electrical ($212,000)',
    found: 'Draw #7 includes $212,000 for electrical work, but no signed conditional lien waiver is attached.',
    why: 'Lenders typically hold or remove lines without a waiver, which reduces the approved draw release.',
    next: 'Request the signed conditional lien waiver from the electrical subcontractor before lender submission.',
    evidence: ['Draw #7 package', 'Pay app #5'],
  },
  {
    id: 'overrun',
    icon: TrendingUp,
    title: 'Budget line trending over',
    meta: '05-200 Framing (+11%)',
    found: 'Committed cost on framing is $1.31M against a $1.18M budget line. Change order CO-14 is still pending.',
    why: 'Without an approved change order or reallocation, hard cost contingency will absorb the overrun.',
    next: 'Decide whether to execute CO-14, reallocate from another division, or draw on contingency.',
    evidence: ['Subcontract', 'CO-14 (pending)', 'Budget v3'],
  },
  {
    id: 'gap',
    icon: Wallet,
    title: 'Funding gap',
    meta: 'Spend vs. cleared funding: $1.02M',
    found: 'Supported spend is $9.62M while cleared funding is $8.60M. Draw #6 is approved but not yet received.',
    why: 'Upcoming trade payables may need to be covered by equity or scheduled around the next wire.',
    next: 'Confirm the expected wire release date for draw #6 with the lender and plan the payment run.',
    evidence: ['Lender approval #6', 'Bank statement', 'AP aging'],
  },
  {
    id: 'progress',
    icon: Hammer,
    title: 'Billing ahead of progress',
    meta: 'Site work: 78% billed vs. 61% verified',
    found: 'Site work has been billed at 78% complete, while the latest inspection verified 61%.',
    why: 'Paying ahead of verified progress increases developer exposure if the subcontractor slows work.',
    next: 'Hold the difference in retainage until the next inspection confirms physical progress.',
    evidence: ['Pay app #5', 'Inspection Oct 14'],
  },
];

export function AttentionQueue() {
  const [selectedId, setSelectedId] = useState(ITEMS[0].id);
  const [resolutions, setResolutions] = useState<Record<string, Resolution>>({});
  const [isPaused, setIsPaused] = useState(false);

  const { ref: inViewRef, inView } = useInView<HTMLDivElement>({ threshold: 0.2, once: false });

  // Auto-cycle review items when in view unless hovered or interacted
  useEffect(() => {
    if (!inView || isPaused) return;
    const interval = setInterval(() => {
      setSelectedId((prevId) => {
        const currentIndex = ITEMS.findIndex((item) => item.id === prevId);
        const nextIndex = (currentIndex + 1) % ITEMS.length;
        return ITEMS[nextIndex].id;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [inView, isPaused]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ targetId?: string; item?: string }>;
      if (ce.detail?.item && ITEMS.some((i) => i.id === ce.detail.item)) {
        setSelectedId(ce.detail.item);
      }
    };
    window.addEventListener('groundup-nav', handler);
    return () => window.removeEventListener('groundup-nav', handler);
  }, []);

  const selected = ITEMS.find((i) => i.id === selectedId)!;
  const resolution = resolutions[selected.id] ?? 'open';
  const openCount = ITEMS.filter((i) => (resolutions[i.id] ?? 'open') === 'open').length;

  const resolve = (value: Resolution) => {
    setIsPaused(true);
    setResolutions((r) => ({ ...r, [selected.id]: value }));
  };

  return (
    <section 
      id="attention" 
      ref={inViewRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="scroll-mt-16 border-b border-border" 
      aria-labelledby="attention-heading"
    >
      <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 sm:py-20 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-muted-foreground">Exceptions</p>
            <h2 id="attention-heading" className="mt-2 text-fluid-title font-bold tracking-tight text-foreground">
              <MaskedText as="span">
                Know what needs attention, and why.
              </MaskedText>
            </h2>
          </div>
          <p className="text-fluid-subtitle leading-relaxed text-muted-foreground">
            The platform reconciles bank statements, HUD settlement filings, and vendor invoices against municipal inspection milestones. Any duplicate billing, missing statutory lien waiver, or municipal delay carry overrun is flagged for collaborative team review before funds move.
          </p>
        </div>

        <Reveal delay={80} className="mt-12">
          <div className="grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] shadow-sm">
            <div className="border-b border-border lg:border-r lg:border-b-0">
              <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-muted/20">
                <p className="text-sm font-bold text-foreground">Review queue</p>
                <span
                  key={openCount}
                  className="animate-badge-bounce font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25 tabular"
                  aria-live="polite"
                >
                  {openCount} open
                </span>
              </div>
            <ul role="listbox" aria-label="Items needing attention" className="divide-y border-border">
              {ITEMS.map((item) => {
                const Icon = item.icon;
                const state = resolutions[item.id] ?? 'open';
                const isSelected = item.id === selectedId;
                return (
                  <li key={item.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        'card-micro flex w-full items-start gap-3 px-5 py-4 text-left cursor-pointer transition-colors',
                        isSelected ? 'bg-muted/80 border-l-3 border-foreground' : 'hover:bg-muted/40',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform',
                          state === 'open' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {state === 'verified' ? (
                          <Check className="size-4 text-emerald-600 dark:text-emerald-400 stroke-[3] animate-checkmark-draw" />
                        ) : state === 'dismissed' ? (
                          <X className="size-4" />
                        ) : (
                          <Icon className="size-4" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className={cn('block text-sm font-semibold text-foreground', state !== 'open' && 'text-muted-foreground line-through decoration-foreground/30')}>
                          {item.title}
                        </span>
                        <span className="block truncate font-mono text-xs text-muted-foreground tabular">{item.meta}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div key={selected.id} className="animate-in fade-in flex flex-col p-5 duration-200 sm:p-7" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <AlertTriangle className="size-5 text-amber-500 shrink-0" aria-hidden="true" />
                {selected.title}
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-2xs">
                Flagged: awaiting review
              </span>
            </div>

            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase">What we found</dt>
                <dd className="mt-1.5 leading-relaxed text-foreground">{selected.found}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Why it matters</dt>
                <dd className="mt-1.5 leading-relaxed text-foreground">{selected.why}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Suggested next step</dt>
                <dd className="mt-1.5 leading-relaxed text-foreground">{selected.next}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Evidence</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {selected.evidence.map((e) => (
                    <span key={e} className="card-micro rounded-md border border-border bg-background px-2.5 py-1 text-xs font-mono text-foreground shadow-2xs">
                      {e}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-5">
              {resolution === 'open' ? (
                <>
                  <button
                    type="button"
                    onClick={() => resolve('verified')}
                    className="btn-micro inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 cursor-pointer shadow-sm"
                  >
                    <Check className="size-4 stroke-[3]" aria-hidden="true" />
                    Confirm issue
                  </button>
                  <button
                    type="button"
                    onClick={() => resolve('dismissed')}
                    className="btn-micro rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted text-foreground cursor-pointer shadow-2xs"
                  >
                    Not an issue
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {resolution === 'verified' ? 'Confirmed and logged to the project record.' : 'Dismissed and kept in the audit trail.'}
                  </p>
                  <button type="button" onClick={() => resolve('open')} className="text-sm font-medium underline-offset-4 hover:underline text-foreground">
                    Undo
                  </button>
                </>
              )}
              <p className="ml-auto text-xs text-muted-foreground">Interactive exception engine</p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);
}
