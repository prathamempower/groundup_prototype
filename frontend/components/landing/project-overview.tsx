'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronDown, 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Archive,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface DocumentFeedItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'xlsx' | 'img' | 'zip';
  label: string;
}

const INCOMING_DOCS: DocumentFeedItem[] = [
  { id: 'doc-1', name: 'HUD-1 Settlement.pdf', size: '2.4 MB', type: 'pdf', label: 'HUD' },
  { id: 'doc-2', name: 'Columbia Bank Stmt.pdf', size: '1.8 MB', type: 'pdf', label: 'BANK' },
  { id: 'doc-3', name: 'Trade Pay Apps & Liens.xlsx', size: '1.1 MB', type: 'xlsx', label: 'AIA' },
  { id: 'doc-4', name: 'City Building Inspections.zip', size: '14 cards · 8.4 MB', type: 'zip', label: 'CITY' },
];

const TABS = ['Overview', 'Budget & Spend', 'Funding', 'Draws', 'Progress', 'Documents', 'Risks'];

export function ProjectOverview() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [hoveredPoint, setHoveredPoint] = useState(true);

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Outer Wrapper: Floating Documents + Dashboard Canvas */}
      <div className="relative flex flex-col lg:flex-row items-stretch lg:items-start gap-3 lg:gap-6 w-full min-w-0 max-w-full">
        
        {/* Left Floating Documents Stack (Layer 2) */}
        <div className="w-full lg:w-52 shrink-0 z-10 pt-1 lg:pt-14 min-w-0" data-layer="2">
          {/* Mobile feed title pill */}
          <div className="lg:hidden flex items-center justify-between px-1 mb-1.5 text-[10px] font-semibold text-muted-foreground">
            <span className="uppercase tracking-wider">Ingested records ({INCOMING_DOCS.length})</span>
            <span className="text-emerald-700 font-mono text-[9px]">Swipe to inspect &rarr;</span>
          </div>

          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 px-1 lg:px-0 no-scrollbar scroll-smooth snap-x snap-mandatory">
            {INCOMING_DOCS.map((doc) => (
              <div
                key={doc.id}
                className="relative flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xs text-xs shrink-0 cursor-pointer w-[150px] sm:w-[170px] lg:w-auto snap-start"
              >
                {/* Type Badge */}
                <div
                  className={cn(
                    'size-5 sm:size-6 rounded-md flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0 font-mono text-white',
                    doc.type === 'pdf' && 'bg-rose-500',
                    doc.type === 'xlsx' && 'bg-emerald-600',
                    doc.type === 'img' && 'bg-sky-500',
                    doc.type === 'zip' && 'bg-amber-600'
                  )}
                >
                  {doc.label}
                </div>

                {/* Meta */}
                <div className="min-w-0 pr-1 flex-1">
                  <span className="font-semibold text-foreground block truncate text-[10px] sm:text-[11px]">{doc.name}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground block truncate">{doc.size}</span>
                </div>

                {/* Verified check badge */}
                <div className="size-3.5 sm:size-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="size-2 sm:size-2.5 stroke-[3]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Connector SVG Lines linking Document Stack to Dashboard */}
        <svg
          className="hidden lg:block absolute left-52 top-16 w-10 h-56 pointer-events-none z-0 overflow-visible text-border"
          aria-hidden="true"
        >
          <path d="M 0 20 C 20 20, 20 75, 40 75" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 0 65 C 20 65, 20 80, 40 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 0 110 C 20 110, 20 85, 40 85" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 0 155 C 20 155, 20 90, 40 90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>

        {/* Main Dashboard Window Card (Layer 3) */}
        <div 
          className="flex-1 w-full min-w-0 max-w-full rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          data-layer="3"
        >
          {/* Window Frame Bar */}
          <div className="flex items-center justify-between border-b border-border/70 px-3 sm:px-6 py-2.5 sm:py-3 bg-muted/30 gap-2 min-w-0">
            {/* Window Controls + Project Identity */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" aria-hidden="true">
                <span className="size-2 sm:size-2.5 rounded-full bg-rose-400" />
                <span className="size-2 sm:size-2.5 rounded-full bg-amber-400" />
                <span className="size-2 sm:size-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center gap-2 pl-2 border-l border-border/70 min-w-0">
                <span className="font-bold text-xs sm:text-sm text-foreground truncate">73 Broadway, Hoboken</span>
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-border bg-card text-[10px] sm:text-[11px] font-medium text-muted-foreground shadow-2xs shrink-0">
              <span className="hidden sm:inline">Nov 2025 - Aug 2027</span>
              <span className="sm:hidden">2025 - 2027</span>
              <ChevronDown className="size-3 text-muted-foreground shrink-0" />
            </div>
          </div>

          {/* Sub Navigation Tabs with Smooth Horizontal Scroll & Right Fade Mask */}
          <div className="relative border-b border-border/70 bg-muted/10">
            <div className="px-3 sm:px-6 flex items-center gap-1 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth text-[10px] sm:text-xs font-semibold text-muted-foreground pr-8">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'tab-spring py-2 sm:py-2.5 px-1.5 sm:px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0',
                    activeTab === tab
                      ? 'border-foreground text-foreground font-bold'
                      : 'border-transparent hover:text-foreground'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Subtle Right Edge Fade Indicator to prevent harsh text slicing on mobile */}
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-card via-card/80 to-transparent pointer-events-none lg:hidden" aria-hidden="true" />
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/60 border-b border-border/70">
            <div className="bg-card p-2 sm:p-3.5 min-w-0">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-0.5 min-w-0">
                <span className="size-1.5 sm:size-2 rounded-full bg-slate-400 shrink-0" />
                <span className="truncate">Budget</span>
              </div>
              <span className="font-mono text-sm sm:text-base md:text-xl font-bold tabular-nums text-foreground block truncate">$18.40M</span>
            </div>
            <div className="bg-card p-2 sm:p-3.5 min-w-0">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-0.5 min-w-0">
                <span className="size-1.5 sm:size-2 rounded-full bg-foreground shrink-0" />
                <span className="truncate">Spend</span>
              </div>
              <span className="font-mono text-sm sm:text-base md:text-xl font-bold tabular-nums text-foreground block truncate">$9.62M</span>
            </div>
            <div className="bg-card p-2 sm:p-3.5 min-w-0">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-0.5 min-w-0">
                <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">Progress</span>
              </div>
              <span className="font-mono text-sm sm:text-base md:text-xl font-bold tabular-nums text-foreground block truncate">68%</span>
            </div>
            <div className="bg-card p-2 sm:p-3.5 min-w-0">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-0.5 min-w-0">
                <span className="size-1.5 sm:size-2 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">Funding</span>
              </div>
              <span className="font-mono text-sm sm:text-base md:text-xl font-bold tabular-nums text-foreground block truncate">$8.60M</span>
            </div>
          </div>

          {/* Inner Analytics Grids */}
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Cost vs. Funding Line Chart */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Cost vs. funding
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">+ Today</span>
                </div>

                {/* SVG Line Chart with Tooltip */}
                <div className="relative h-44 sm:h-48 w-full border-b border-l border-border/80 pl-2 pb-2">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25">
                    <div className="border-b border-border w-full" />
                    <div className="border-b border-border w-full" />
                    <div className="border-b border-border w-full" />
                    <div className="border-b border-border w-full" />
                  </div>

                  {/* SVG Curves */}
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120" preserveAspectRatio="none">
                    {/* Planned Curve (dotted) */}
                    <path
                      d="M 0 115 Q 120 70, 220 35 T 320 10"
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-400 dark:text-slate-600"
                      strokeWidth="1.5"
                      strokeDasharray="2 3"
                    />

                    {/* Spend Curve (Dark) */}
                    <path
                      d="M 0 118 Q 80 85, 140 60"
                      fill="none"
                      stroke="currentColor"
                      className="text-foreground"
                      strokeWidth="2.5"
                    />

                    {/* Progress Curve (Green) */}
                    <path
                      d="M 0 118 Q 80 92, 140 66"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />

                    {/* Funding Curve (Stepped Orange) */}
                    <path
                      d="M 0 118 H 50 V 95 H 100 V 70 H 140"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />

                    {/* Forecast Continuation (Dashed) */}
                    <path
                      d="M 140 60 Q 220 25, 320 8"
                      fill="none"
                      stroke="currentColor"
                      className="text-foreground/40"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />

                    {/* Target Current Milestone Dot at x=140 */}
                    <circle cx="140" cy="60" r="3.5" fill="#0f172a" className="dark:fill-white" />
                    <circle cx="140" cy="66" r="3" fill="#10b981" />
                    <circle cx="140" cy="70" r="3" fill="#f59e0b" />
                  </svg>

                  {/* Interactive Tooltip Callout at Mar 26 */}
                  {hoveredPoint && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-xl border border-border bg-card/95 backdrop-blur-md p-2.5 shadow-xl text-[10px] space-y-1 min-w-[125px] pointer-events-none">
                      <span className="font-bold text-foreground block border-b border-border/60 pb-1">Mar 26</span>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-slate-400" />
                          <span>Planned</span>
                        </span>
                        <span className="font-mono font-semibold text-foreground">$3.30M</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-foreground" />
                          <span>Spend</span>
                        </span>
                        <span className="font-mono font-semibold text-foreground">$3.40M</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          <span>Progress</span>
                        </span>
                        <span className="font-mono font-semibold text-foreground">$3.20M</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          <span>Funding</span>
                        </span>
                        <span className="font-mono font-semibold text-foreground">$3.20M</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* X-Axis labels */}
                <div className="flex justify-between text-[9px] font-mono text-muted-foreground mt-1.5 px-1">
                  <span>Nov 25</span>
                  <span>Feb 26</span>
                  <span>May 26</span>
                  <span>Aug 26</span>
                  <span>Nov 26</span>
                  <span>Feb 27</span>
                  <span>Aug 27</span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border/60">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-slate-400 rounded-full" />
                  <span>Planned</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-foreground rounded-full" />
                  <span>Spend</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full" />
                  <span>Progress</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-amber-500 rounded-full" />
                  <span>Funding</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-foreground/50" />
                  <span>Forecast</span>
                </span>
              </div>
            </div>

            {/* Right Column: Cash Position & Projected Profit */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4 border-t lg:border-t-0 lg:border-l border-border/70 lg:pl-6 pt-4 lg:pt-0">
              {/* Cash Position Mini Bar Chart */}
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Cash position
                </h4>
                <div className="h-16 w-full flex items-center justify-between gap-1 pt-1 border-b border-border/60 pb-1">
                  {[
                    { month: 'N', val: 24, pos: true },
                    { month: 'D', val: 32, pos: true },
                    { month: 'J', val: 18, pos: true },
                    { month: 'F', val: 12, pos: true },
                    { month: 'M', val: -16, pos: false },
                    { month: 'A', val: -28, pos: false },
                    { month: 'M', val: -35, pos: false },
                    { month: 'J', val: -22, pos: false },
                    { month: 'J', val: 14, pos: true },
                    { month: 'A', val: 26, pos: true },
                    { month: 'S', val: 19, pos: true },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-center h-full">
                      <div
                        className={cn(
                          'w-full max-w-[8px] rounded-xs transition-all',
                          bar.pos ? 'bg-emerald-500' : 'bg-rose-500'
                        )}
                        style={{ height: `${Math.abs(bar.val)}px` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-muted-foreground mt-1">
                  <span>Nov 25</span>
                  <span>May 26</span>
                  <span>Nov 26</span>
                  <span>May 27</span>
                </div>
              </div>

              {/* Projected Profit Mini Line Chart */}
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Projected profit
                </h4>
                <div className="h-16 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 160 50" preserveAspectRatio="none">
                    {/* Underwritten Baseline (dotted) */}
                    <line x1="0" y1="15" x2="160" y2="15" stroke="currentColor" className="text-slate-400" strokeWidth="1" strokeDasharray="2 3" />
                    {/* Projected Curve */}
                    <path d="M 0 16 Q 60 18, 110 32 T 160 45" fill="none" stroke="currentColor" className="text-foreground" strokeWidth="2" />
                    <circle cx="110" cy="32" r="2.5" fill="currentColor" className="text-foreground" />
                  </svg>
                </div>
                <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono mt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-foreground" />
                    <span>Projected</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-0.5 border-t border-dashed border-slate-400" />
                    <span>Underwritten</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectOverview;
