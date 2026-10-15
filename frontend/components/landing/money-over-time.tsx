'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '../ui/chart';
import {
  CASH_SERIES,
  COST_SERIES,
  PROFIT_SERIES,
  SNAPSHOT,
  UNDERWRITTEN_PROFIT,
  formatMillions,
} from '../../lib/cashflow-data';
import { cn } from '../../lib/utils';
import { MaskedText } from '../ui/masked-text';
import { Reveal } from '../reveal';

type View = 'cost' | 'cash' | 'profit';

const VIEWS: { key: View; label: string; title: string; body: string }[] = [
  {
    key: 'cost',
    label: 'Cost vs. funding',
    title: 'Cumulative cost, progress, and funding against plan',
    body: 'Spend is running ahead of verified progress, and both are behind the planned draw curve. Cleared funding trails spend because draws arrive after costs are paid.',
  },
  {
    key: 'cash',
    label: 'Cash position',
    title: 'Cleared funding minus supported spend, by month',
    body: 'Months below zero are periods where the project paid out more than it had received. Each gap has to be covered by equity, a faster draw, or delayed payables.',
  },
  {
    key: 'profit',
    label: 'Projected profit',
    title: 'Projected profit against the underwritten deal',
    body: 'As the forecast cost at completion rises, projected profit falls. Small overruns on individual lines add up to a visible change in the return.',
  },
];

const costConfig = {
  planned: { label: 'Planned', color: '#64748B' },
  spend: { label: 'Spend', color: '#0F172A' },
  spendForecast: { label: 'Spend forecast', color: '#475569' },
  progress: { label: 'Verified progress', color: '#059669' },
  funding: { label: 'Cleared funding', color: '#2563EB' },
  fundingForecast: { label: 'Funding forecast', color: '#3B82F6' },
} satisfies ChartConfig;

const cashConfig = {
  position: { label: 'Cash position', color: '#059669' },
} satisfies ChartConfig;

const profitConfig = {
  profit: { label: 'Projected profit', color: '#0F172A' },
  underwritten: { label: 'Underwritten', color: '#64748B' },
} satisfies ChartConfig;

type TooltipEntry = { dataKey?: string | number; name?: string | number; value?: number | string | null; color?: string };

function MoneyTooltip({
  active,
  payload,
  label,
  config,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  config: ChartConfig;
}) {
  if (!active || !payload?.length) return null;
  const seen = new Set<string>();
  const rows = payload.filter((entry) => {
    if (entry.value == null) return false;
    const base = String(entry.dataKey).replace('Forecast', '');
    if (seen.has(base)) return false;
    seen.add(base);
    return true;
  });
  return (
    <div
      className="min-w-44 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs shadow-xl ring-1 ring-slate-950/5 select-none"
      style={{ backgroundColor: '#ffffff', opacity: 1 }}
    >
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      <ul className="space-y-1">
        {rows.map((entry) => {
          const key = String(entry.dataKey);
          const value = Number(entry.value);
          return (
            <li key={key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: config[key]?.color ?? entry.color }} />
                {config[key]?.label ?? key}
              </span>
              <span className="font-mono tabular text-foreground">{formatMillions(value, key === 'position')}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: 'var(--muted-foreground)' },
} as const;

interface MoneyOverTimeProps {
  onStartOnboarding: () => void;
}

export function MoneyOverTime({ onStartOnboarding }: MoneyOverTimeProps) {
  const [view, setView] = useState<View>('cost');

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ targetId?: string; view?: View }>;
      if (ce.detail?.view && ['cost', 'cash', 'profit'].includes(ce.detail.view)) {
        setView(ce.detail.view);
      }
    };
    window.addEventListener('groundup-nav', handler);
    return () => window.removeEventListener('groundup-nav', handler);
  }, []);

  const current = VIEWS.find((v) => v.key === view)!;

  return (
    <section id="money-over-time" className="scroll-mt-16 border-b border-border" aria-labelledby="money-heading">
      <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 sm:py-20 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-muted-foreground">Money over time</p>
            <h2 id="money-heading" className="mt-2 text-fluid-title font-bold tracking-tight text-foreground">
              <MaskedText as="span">
                See when cost, cash, and return drift apart.
              </MaskedText>
            </h2>
          </div>
          <p className="text-fluid-subtitle leading-relaxed text-muted-foreground">
            A budget pro forma tells you what the project should cost. The timeline tracks when investor equity and bank loan funds are drawn. GroundUp plots both against municipal inspection milestones, forecasting daily interest carry burn and equity return impact before gaps reach your lender.
          </p>
        </div>

        <Reveal delay={80} className="mt-12">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <div role="tablist" aria-label="Chart view" className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
                {VIEWS.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    role="tab"
                    id={`money-tab-${v.key}`}
                    aria-selected={view === v.key}
                    aria-controls="money-panel"
                    onClick={() => setView(v.key)}
                    className={cn(
                      'tab-spring rounded-md px-3.5 py-1.5 text-xs font-semibold sm:text-sm cursor-pointer',
                      view === v.key
                        ? 'bg-card text-foreground shadow-xs font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50',
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{current.title}</p>
            </div>

            <div id="money-panel" role="tabpanel" aria-labelledby={`money-tab-${view}`} className="grid lg:grid-cols-[1.55fr_1fr]">
              <div className="p-5 sm:p-6">
                <div className="mt-4">
                  {view === 'cost' && <CostChart />}
                  {view === 'cash' && <CashChart />}
                  {view === 'profit' && <ProfitChart />}
                </div>
                <ChartLegend view={view} />
              </div>

              <aside className="border-t border-border bg-background/60 p-5 sm:p-6 lg:border-t-0 lg:border-l">
                <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{current.body}</p>
                <Stats view={view} />
              </aside>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-border bg-card/60 text-xs sm:text-sm text-muted-foreground">
            <p className="max-w-xl leading-relaxed">
              Your cash flow curve synchronizes directly from CSI Schedule of Values, bank statements, and lender draw packages.
            </p>
            <a
              href="#comparison"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 cursor-pointer"
            >
              <span>Compare developer alignment</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CostChart() {
  return (
    <ChartContainer config={costConfig} className="aspect-auto h-72 w-full sm:h-80">
      <LineChart data={COST_SERIES} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="month" {...axisProps} interval={2} />
        <YAxis {...axisProps} tickFormatter={(v: any) => `$${v}M`} width={52} />
        <ChartTooltip content={<MoneyTooltip config={costConfig} />} />
        <ReferenceLine
          x={SNAPSHOT.month}
          stroke="#0F172A"
          strokeOpacity={0.35}
          strokeDasharray="3 3"
          label={{ value: 'Today', position: 'insideTopRight', fontSize: 11, fill: '#64748B' }}
        />
        <Line dataKey="planned" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
        <Line dataKey="spend" stroke="#0F172A" strokeWidth={2.5} dot={false} />
        <Line dataKey="spendForecast" stroke="#64748B" strokeWidth={2} strokeDasharray="5 4" strokeOpacity={0.6} dot={false} />
        <Line dataKey="progress" stroke="#059669" strokeWidth={2.5} dot={false} />
        <Line dataKey="funding" type="stepAfter" stroke="#2563EB" strokeWidth={2.5} dot={false} />
        <Line dataKey="fundingForecast" type="stepAfter" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 4" strokeOpacity={0.6} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}

function CashChart() {
  return (
    <ChartContainer config={cashConfig} className="aspect-auto h-72 w-full sm:h-80">
      <BarChart data={CASH_SERIES} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="month" {...axisProps} interval={2} />
        <YAxis {...axisProps} tickFormatter={(v: any) => `$${v}M`} width={52} />
        <ChartTooltip cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} content={<MoneyTooltip config={cashConfig} />} />
        <ReferenceLine y={0} stroke="#0F172A" strokeOpacity={0.4} />
        <ReferenceLine x={SNAPSHOT.month} stroke="#0F172A" strokeOpacity={0.35} strokeDasharray="3 3" />
        <Bar dataKey="position" radius={2}>
          {CASH_SERIES.map((d) => (
            <Cell
              key={d.month}
              fill={d.position >= 0 ? '#059669' : '#DC2626'}
              fillOpacity={d.forecast ? 0.45 : 0.9}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function ProfitChart() {
  return (
    <ChartContainer config={profitConfig} className="aspect-auto h-72 w-full sm:h-80">
      <LineChart data={PROFIT_SERIES} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="month" {...axisProps} interval={1} />
        <YAxis {...axisProps} domain={[5, 6.4]} tickFormatter={(v: any) => `$${Number(v).toFixed(1)}M`} width={56} />
        <ChartTooltip content={<MoneyTooltip config={profitConfig} />} />
        <Line dataKey="underwritten" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
        <Line dataKey="profit" stroke="#0F172A" strokeWidth={2.5} dot={{ r: 3, fill: '#0F172A' }} />
      </LineChart>
    </ChartContainer>
  );
}

const LEGENDS: Record<View, { label: string; swatch: string }[]> = {
  cost: [
    { label: 'Planned', swatch: 'border-t-2 border-dotted border-slate-400' },
    { label: 'Spend', swatch: 'h-0.5 bg-slate-900' },
    { label: 'Verified progress', swatch: 'h-0.5 bg-emerald-600' },
    { label: 'Cleared funding', swatch: 'h-0.5 bg-blue-600' },
    { label: 'Forecast', swatch: 'border-t-2 border-dashed border-slate-500' },
  ],
  cash: [
    { label: 'Funded ahead of spend', swatch: 'h-2 rounded-sm bg-emerald-600' },
    { label: 'Shortfall', swatch: 'h-2 rounded-sm bg-rose-600' },
    { label: 'Forecast', swatch: 'h-2 rounded-sm bg-rose-400' },
  ],
  profit: [
    { label: 'Projected profit', swatch: 'h-0.5 bg-slate-900' },
    { label: 'Underwritten', swatch: 'border-t-2 border-dotted border-slate-400' },
  ],
};

function ChartLegend({ view }: { view: View }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
      {LEGENDS[view].map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className={cn('w-4', item.swatch)} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function Stats({ view }: { view: View }) {
  const s = SNAPSHOT;
  const stats: Record<View, { label: string; value: string; tone?: 'loss' | 'gain' }[]> = {
    cost: [
      { label: 'Spend vs. verified progress', value: formatMillions(s.spend - s.progress, true), tone: 'loss' },
      { label: 'Progress vs. plan', value: formatMillions(s.progress - s.planned, true), tone: 'loss' },
      { label: 'Forecast cost at completion', value: formatMillions(s.forecastCost) },
      { label: 'Completion', value: `${s.forecastFinish} (plan ${s.plannedFinish})` },
    ],
    cash: [
      { label: `Position in ${s.month}`, value: formatMillions(s.funding - s.spend, true), tone: 'loss' },
      { label: 'Largest shortfall to date', value: formatMillions(s.peakShortfall, true), tone: 'loss' },
      { label: 'Committed funding', value: formatMillions(s.forecastFunding) },
      { label: 'Equity needed at completion', value: formatMillions(s.forecastCost - s.forecastFunding) },
    ],
    profit: [
      { label: 'Underwritten profit', value: formatMillions(UNDERWRITTEN_PROFIT) },
      { label: 'Projected profit today', value: formatMillions(s.projectedProfit) },
      { label: 'Change since closing', value: formatMillions(s.projectedProfit - UNDERWRITTEN_PROFIT, true), tone: 'loss' },
      { label: 'Projected margin', value: `${((s.projectedProfit / 24.5) * 100).toFixed(1)}%` },
    ],
  };
  return (
    <dl className="mt-6 divide-y divide-border border-y border-border">
      {stats[view].map((stat) => (
        <div key={stat.label} className="group flex items-baseline justify-between gap-4 py-3 transition-colors hover:bg-muted/30 px-2 rounded-sm">
          <dt className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</dt>
          <dd
            className={cn(
              'text-right font-mono text-sm font-semibold tabular transition-transform group-hover:scale-105 origin-right',
              stat.tone === 'loss' && 'text-destructive',
              stat.tone === 'gain' && 'text-verified',
            )}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
