'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, Circle, Play, Pause } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useInView } from '../../hooks/use-in-view';

const FLOWS = {
  draw: {
    label: 'Loan draw',
    subject: 'Draw #7: $1,240,000',
    stages: [
      { name: 'Requested', detail: 'Submitted to the lender with supporting AIA G702/G703 documents.', counts: false, note: 'Shown as pending: not counted as funding.' },
      { name: 'Approved', detail: 'Lender approved $1,180,000 after adjusting one unsupported line.', counts: false, note: 'Approved amount tracked: not counted as funding.' },
      { name: 'Funded', detail: 'Lender reports the loan wire as sent.', counts: false, note: 'Expected in account: waiting for bank confirmation.' },
      { name: 'Cleared', detail: 'Deposit matched to the project bank account.', counts: true, note: '$1,180,000 now counts toward Funding.' },
    ],
  },
  invoice: {
    label: 'Invoice',
    subject: 'Invoice #2291: $184,300',
    stages: [
      { name: 'Received', detail: 'Invoice extracted and coded to CSI MasterFormat 03-300 Cast-in-Place Concrete.', counts: false, note: 'Shown as a claim: not proof of cost.' },
      { name: 'Supported', detail: 'Matched to the trade contract, 10% retainage withholding, and pay application.', counts: true, note: 'Counts toward Spend as incurred and supported.' },
      { name: 'Paid', detail: 'Matched to an outgoing ACH from the project account.', counts: true, note: 'Payment confirmed by bank record, not by invoice claim.' },
      { name: 'Released', detail: 'Statutory unconditional lien waiver received and filed.', counts: true, note: 'Ready to support the next draw.' },
    ],
  },
} as const;

type FlowKey = keyof typeof FLOWS;

export function StatusLadder() {
  const [flowKey, setFlowKey] = useState<FlowKey>('draw');
  const [stage, setStage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const flow = FLOWS[flowKey];
  const current = flow.stages[stage];

  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: false });

  // Auto-step stages when in view unless hovered or paused
  useEffect(() => {
    if (!inView || isPaused) return;
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % FLOWS[flowKey].stages.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [inView, isPaused, flowKey]);

  return (
    <div 
      ref={ref}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="rounded-xl border border-border bg-background p-5 sm:p-6 shadow-sm transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Record type" className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
          {(Object.keys(FLOWS) as FlowKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={flowKey === key}
              onClick={() => {
                setFlowKey(key);
                setStage(0);
              }}
              className={cn(
                'tab-spring rounded-md px-3 py-1.5 text-sm font-semibold cursor-pointer',
                flowKey === key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              {FLOWS[key].label}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs text-muted-foreground tabular">{flow.subject}</p>
      </div>

      <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Stages">
        {flow.stages.map((s, i) => {
          const reached = i <= stage;
          return (
            <li key={s.name}>
              <button
                type="button"
                onClick={() => setStage(i)}
                aria-current={i === stage ? 'step' : undefined}
                className="btn-micro group flex w-full flex-col items-start gap-2 text-left cursor-pointer p-1 rounded-md"
              >
                <span
                  className={cn(
                    'h-1.5 w-full rounded-full transition-all duration-300',
                    reached
                      ? s.counts && i === stage
                        ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-foreground'
                      : 'bg-foreground/15 group-hover:bg-foreground/30',
                  )}
                />
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-semibold transition-colors sm:text-sm',
                    reached ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
                  )}
                >
                  {reached ? (
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3] animate-checkmark-draw shrink-0" aria-hidden="true" />
                  ) : (
                    <Circle className="size-3 shrink-0 opacity-40" aria-hidden="true" />
                  )}
                  {s.name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div
        key={`${flowKey}-${stage}`}
        className="mt-6 animate-in fade-in slide-in-from-bottom-1 rounded-xl border border-border bg-card p-4 sm:p-5 duration-200 shadow-2xs"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-foreground leading-relaxed">{current.detail}</p>
        <div className="mt-3 flex items-center justify-between">
          <p
            className={cn(
              'animate-badge-bounce inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold',
              current.counts
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30',
            )}
          >
            <span
              className={cn(
                'size-2 rounded-full',
                current.counts ? 'bg-emerald-500' : 'bg-amber-500',
              )}
              aria-hidden="true"
            />
            {current.note}
          </p>
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            Stage {stage + 1} of 4
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="btn-micro inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded"
          title={isPaused ? 'Resume auto-stepping' : 'Pause auto-stepping'}
        >
          {isPaused ? <Play className="size-3" /> : <Pause className="size-3" />}
          <span className="font-mono text-[11px]">{isPaused ? 'Paused' : 'Auto-stepping'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsPaused(true);
            setStage((s) => (s + 1) % flow.stages.length);
          }}
          className="btn-micro inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-md border border-border px-3 py-1.5 hover:bg-muted text-foreground cursor-pointer shadow-2xs"
        >
          {stage === flow.stages.length - 1 ? 'Start over' : `Next: ${flow.stages[stage + 1].name} →`}
        </button>
      </div>
    </div>
  );
}
