"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";

export type AnalyticsTab = "COST_VS_FUNDING" | "CASH_POSITION" | "PROJECTED_PROFIT";

export interface CostFundingPoint {
  date: string;
  planned: number;
  spend: number | null;
  verifiedProgress: number | null;
  clearedFunding: number | null;
  spendForecast: number | null;
  fundingForecast: number | null;
  isToday?: boolean;
}

export interface CashPositionPoint {
  date: string;
  position: number;
  isForecast?: boolean;
  isToday?: boolean;
}

export interface ProjectedProfitPoint {
  date: string;
  underwritten: number;
  projectedProfit: number;
  isToday?: boolean;
}

interface AnalyticsDashboardProps {
  projectName?: string;
  asOfDate?: string;
  customCostFundingData?: CostFundingPoint[];
  customCashPositionData?: CashPositionPoint[];
  customProfitData?: ProjectedProfitPoint[];
}

export const ControlCenterAnalytics: React.FC<AnalyticsDashboardProps> = ({
  projectName = "161 Woodlawn Ave · 48-unit mixed-use",
  asOfDate = "Oct 26",
  customCostFundingData,
  customCashPositionData,
  customProfitData,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("COST_VS_FUNDING");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Cost vs Funding Dataset ($M)
  // Step curve for cleared funding, smooth lines for spend and progress, dashed for planned & forecast
  const costFundingData: CostFundingPoint[] = customCostFundingData || [
    { date: "Nov 25", planned: 0.8, spend: 0.6, verifiedProgress: 0.5, clearedFunding: 0.5, spendForecast: null, fundingForecast: null },
    { date: "Jan 26", planned: 2.1, spend: 1.8, verifiedProgress: 1.5, clearedFunding: 1.4, spendForecast: null, fundingForecast: null },
    { date: "Feb 26", planned: 3.5, spend: 3.2, verifiedProgress: 2.8, clearedFunding: 2.7, spendForecast: null, fundingForecast: null },
    { date: "May 26", planned: 5.6, spend: 5.2, verifiedProgress: 4.8, clearedFunding: 4.6, spendForecast: null, fundingForecast: null },
    { date: "Jul 26", planned: 7.4, spend: 7.1, verifiedProgress: 6.5, clearedFunding: 6.2, spendForecast: null, fundingForecast: null },
    { date: "Aug 26", planned: 8.8, spend: 8.5, verifiedProgress: 7.8, clearedFunding: 7.4, spendForecast: null, fundingForecast: null },
    {
      date: "Oct 26",
      planned: 10.4,
      spend: 10.1,
      verifiedProgress: 9.2,
      clearedFunding: 8.8,
      spendForecast: 10.1,
      fundingForecast: 8.8,
      isToday: true,
    },
    { date: "Nov 26", planned: 11.5, spend: null, verifiedProgress: null, clearedFunding: null, spendForecast: 10.9, fundingForecast: 9.8 },
    { date: "Dec 26", planned: 12.6, spend: null, verifiedProgress: null, clearedFunding: null, spendForecast: 11.6, fundingForecast: 10.9 },
    { date: "Feb 27", planned: 14.8, spend: null, verifiedProgress: null, clearedFunding: null, spendForecast: 13.9, fundingForecast: 13.0 },
    { date: "May 27", planned: 17.5, spend: null, verifiedProgress: null, clearedFunding: null, spendForecast: 16.8, fundingForecast: 15.9 },
    { date: "Aug 27", planned: 19.1, spend: null, verifiedProgress: null, clearedFunding: null, spendForecast: 18.4, fundingForecast: 17.8 },
  ];

  // 2. Cash Position Dataset (Monthly net funding delta in Millions)
  const cashPositionData: CashPositionPoint[] = customCashPositionData || [
    { date: "Nov 25", position: 0.18 },
    { date: "Dec 25", position: 0.48 },
    { date: "Jan 26", position: 0.58 },
    { date: "Feb 26", position: 0.55 },
    { date: "Mar 26", position: -0.22 },
    { date: "Apr 26", position: -0.38 },
    { date: "May 26", position: -0.52 },
    { date: "Jun 26", position: -0.80 },
    { date: "Jul 26", position: -1.02 },
    { date: "Aug 26", position: -1.02 },
    { date: "Sep 26", position: -1.05 },
    { date: "Oct 26", position: -1.02, isToday: true },
    { date: "Nov 26", position: -0.78, isForecast: true },
    { date: "Dec 26", position: -0.58, isForecast: true },
    { date: "Jan 27", position: -0.42, isForecast: true },
    { date: "Feb 27", position: -0.32, isForecast: true },
    { date: "Mar 27", position: -0.28, isForecast: true },
    { date: "May 27", position: -0.35, isForecast: true },
    { date: "Jun 27", position: -0.38, isForecast: true },
    { date: "Aug 27", position: -0.42, isForecast: true },
  ];

  // 3. Projected Profit Dataset (Millions of dollars)
  const projectedProfitData: ProjectedProfitPoint[] = customProfitData || [
    { date: "Nov 25", underwritten: 6.10, projectedProfit: 6.10 },
    { date: "Dec 25", underwritten: 6.10, projectedProfit: 6.10 },
    { date: "Jan 26", underwritten: 6.10, projectedProfit: 6.08 },
    { date: "Feb 26", underwritten: 6.10, projectedProfit: 6.05 },
    { date: "Mar 26", underwritten: 6.10, projectedProfit: 6.00 },
    { date: "May 26", underwritten: 6.10, projectedProfit: 5.82 },
    { date: "Jun 26", underwritten: 6.10, projectedProfit: 5.65 },
    { date: "Jul 26", underwritten: 6.10, projectedProfit: 5.52 },
    { date: "Aug 26", underwritten: 6.10, projectedProfit: 5.40, isToday: true },
    { date: "Sep 26", underwritten: 6.10, projectedProfit: 5.25 },
    { date: "Oct 26", underwritten: 6.10, projectedProfit: 5.10 },
  ];

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      {/* Top Header: Navigation Tabs + Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-6 py-3.5 gap-3 bg-white">
        {/* Clean Segmented Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveTab("COST_VS_FUNDING")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "COST_VS_FUNDING"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cost vs. funding
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CASH_POSITION")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "CASH_POSITION"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cash position
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PROJECTED_PROFIT")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "PROJECTED_PROFIT"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Projected profit
          </button>
        </div>
      </div>

      {/* Main Clean Chart Area (Without distracting side columns) */}
      <div className="p-6">
        {/* Title & Units Header */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            {activeTab === "COST_VS_FUNDING" && "Total spend, work done, and money received vs budget"}
            {activeTab === "CASH_POSITION" && "Money on hand each month (Money received minus money spent)"}
            {activeTab === "PROJECTED_PROFIT" && "Expected profit vs original target"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Amounts in millions ($M)</p>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: COST VS FUNDING                                                    */}
        {/* ========================================================================= */}
        {activeTab === "COST_VS_FUNDING" && (
          <div>
            <div className="w-full relative" style={{ width: "100%", height: 350, minHeight: 350 }}>
              {isMounted ? (
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={costFundingData} margin={{ top: 25, right: 24, left: -4, bottom: 8 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f172a" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity={0.00} />
                    </linearGradient>
                    <linearGradient id="verifiedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.00} />
                    </linearGradient>
                    <linearGradient id="clearedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.10} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.00} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    dy={6}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val === 0 ? "$0" : `$${val}M`)}
                    domain={[0, 22]}
                    ticks={[0, 5, 10, 15, 20]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0].payload as CostFundingPoint;
                        return (
                          <div className="rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-3.5 shadow-xl text-xs space-y-2 min-w-[190px]">
                            <div className="font-semibold text-slate-900 border-b border-slate-100 pb-2 flex justify-between items-center">
                              <span className="text-slate-800">{label}</span>
                              {p.isToday && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
                                  Current Month
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5 font-mono text-[11px]">
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="flex items-center gap-1.5 font-sans">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Planned Budget
                                </span>
                                <span className="font-semibold text-slate-900">${p.planned.toFixed(2)}M</span>
                              </div>
                              {p.spend !== null && (
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="flex items-center gap-1.5 font-sans">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-900" /> Total Spent
                                  </span>
                                  <span className="font-semibold text-slate-900">${p.spend.toFixed(2)}M</span>
                                </div>
                              )}
                              {p.verifiedProgress !== null && (
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="flex items-center gap-1.5 font-sans">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Verified Work Done
                                  </span>
                                  <span className="font-semibold text-emerald-700">${p.verifiedProgress.toFixed(2)}M</span>
                                </div>
                              )}
                              {p.clearedFunding !== null && (
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="flex items-center gap-1.5 font-sans">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Money Received
                                  </span>
                                  <span className="font-semibold text-amber-700">${p.clearedFunding.toFixed(2)}M</span>
                                </div>
                              )}
                              {p.spendForecast !== null && (
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="flex items-center gap-1.5 font-sans">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" /> Expected Spend
                                  </span>
                                  <span className="font-semibold text-slate-800">${p.spendForecast.toFixed(2)}M</span>
                                </div>
                              )}
                              {p.fundingForecast !== null && (
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="flex items-center gap-1.5 font-sans">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Expected Funding
                                  </span>
                                  <span className="font-semibold text-amber-700">${p.fundingForecast.toFixed(2)}M</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    x="Oct 26"
                    stroke="#0284c7"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Today",
                      position: "top",
                      fill: "#0369a1",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />

                  {/* 1. Planned (Dashed Indigo-Gray Baseline) */}
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke="#94a3b8"
                    strokeWidth={1.75}
                    strokeDasharray="4 4"
                    dot={false}
                  />

                  {/* 2. Spend (Crisp Dark Slate) */}
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls={false}
                  />

                  {/* 3. Verified Progress (Emerald) */}
                  <Line
                    type="monotone"
                    dataKey="verifiedProgress"
                    stroke="#10b981"
                    strokeWidth={2.25}
                    dot={false}
                    connectNulls={false}
                  />

                  {/* 4. Cleared Funding (Amber Stepped Profile) */}
                  <Line
                    type="stepAfter"
                    dataKey="clearedFunding"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />

                  {/* 5. Spend Forecast (Dashed Slate) */}
                  <Line
                    type="monotone"
                    dataKey="spendForecast"
                    stroke="#475569"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    connectNulls={false}
                  />

                  {/* 6. Funding Forecast (Dashed Amber Stepped Profile) */}
                  <Line
                    type="stepAfter"
                    dataKey="fundingForecast"
                    stroke="#fbbf24"
                    strokeWidth={1.75}
                    strokeDasharray="4 4"
                    dot={false}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-lg animate-pulse text-xs text-slate-400">
                  Loading chart...
                </div>
              )}
            </div>

            {/* Elevated Modern Legend with Clean Interactive Visual Tokens */}
            <div className="flex flex-wrap items-center justify-start gap-6 mt-5 pt-3.5 border-t border-slate-100 text-xs font-medium">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-0.5 w-4 border-t-2 border-dashed border-slate-400" /> Planned Budget
              </span>
              <span className="flex items-center gap-2 text-slate-900 font-semibold">
                <span className="h-1 w-4 rounded-full bg-slate-900" /> Total Spent
              </span>
              <span className="flex items-center gap-2 text-emerald-700 font-semibold">
                <span className="h-1 w-4 rounded-full bg-emerald-500" /> Work Done
              </span>
              <span className="flex items-center gap-2 text-amber-700 font-semibold">
                <span className="h-1 w-4 rounded-full bg-amber-500" /> Money Received
              </span>
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-0.5 w-4 border-t-2 border-dashed border-slate-600" /> Future Estimate
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CASH POSITION                                                      */}
        {/* ========================================================================= */}
        {activeTab === "CASH_POSITION" && (
          <div>
            <div className="w-full relative" style={{ width: "100%", height: 350, minHeight: 350 }}>
              {isMounted ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={cashPositionData} margin={{ top: 25, right: 24, left: -4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    dy={6}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val === 0 ? "$0" : val > 0 ? `+$${val.toFixed(2)}M` : `-$${Math.abs(val).toFixed(2)}M`)}
                    domain={[-1.2, 1.2]}
                    ticks={[-1.1, -0.55, 0, 0.55, 1.1]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0].payload as CashPositionPoint;
                        const isSurplus = p.position >= 0;
                        return (
                          <div className="rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-3.5 shadow-xl text-xs space-y-1.5 min-w-[170px]">
                            <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1.5 flex justify-between items-center">
                              <span>{label}</span>
                              {p.isToday && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="pt-1.5 flex items-center justify-between font-mono text-[11px]">
                              <span className="flex items-center gap-1.5 font-sans text-slate-600">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    isSurplus ? "bg-emerald-500" : "bg-rose-500"
                                  }`}
                                />
                                Cash in Bank:
                              </span>
                              <span
                                className={`font-bold ${
                                  isSurplus ? "text-emerald-700" : "text-rose-600"
                                }`}
                              >
                                {isSurplus
                                  ? `+$${p.position.toFixed(2)}M (Extra Cash)`
                                  : `-$${Math.abs(p.position).toFixed(2)}M (Cash Needed)`}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 2" />
                  <ReferenceLine
                    x="Oct 26"
                    stroke="#0284c7"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: "Today", position: "top", fill: "#0369a1", fontSize: 11, fontWeight: 600 }}
                  />
                  <Bar dataKey="position" maxBarSize={22} radius={[4, 4, 0, 0]}>
                    {cashPositionData.map((entry, index) => {
                      let fillColor = "#10b981"; // Emerald
                      if (entry.position < 0) {
                        fillColor = entry.isForecast ? "#f87171" : "#e11d48"; // Rose-red
                      } else if (entry.isForecast) {
                        fillColor = "#6ee7b7";
                      }
                      return <Cell key={`cell-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-lg animate-pulse text-xs text-slate-400">
                  Loading chart...
                </div>
              )}
            </div>

            {/* Elevated Modern Legend */}
            <div className="flex flex-wrap items-center justify-start gap-6 mt-5 pt-3.5 border-t border-slate-100 text-xs font-medium">
              <span className="flex items-center gap-2 text-emerald-800 font-semibold">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Extra Cash in Bank
              </span>
              <span className="flex items-center gap-2 text-rose-800 font-semibold">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Cash Shortage
              </span>
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300" /> Expected Shortage
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PROJECTED PROFIT                                                   */}
        {/* ========================================================================= */}
        {activeTab === "PROJECTED_PROFIT" && (
          <div>
            <div className="w-full relative" style={{ width: "100%", height: 350, minHeight: 350 }}>
              {isMounted ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={projectedProfitData} margin={{ top: 25, right: 24, left: -4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    dy={6}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val.toFixed(1)}M`}
                    domain={[4.8, 6.5]}
                    ticks={[5.0, 5.3, 5.7, 6.0, 6.4]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0].payload as ProjectedProfitPoint;
                        return (
                          <div className="rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-3.5 shadow-xl text-xs space-y-1.5 min-w-[170px]">
                            <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1.5 flex justify-between items-center">
                              <span>{label}</span>
                              {p.isToday && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5 font-mono text-[11px] pt-1">
                              <div className="flex justify-between items-center text-slate-600">
                                <span className="flex items-center gap-1.5 font-sans">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Original Target
                                </span>
                                <span className="font-semibold text-slate-900">${p.underwritten.toFixed(2)}M</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-600">
                                <span className="flex items-center gap-1.5 font-sans">
                                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" /> Expected Profit
                                </span>
                                <span className="font-bold text-indigo-950">${p.projectedProfit.toFixed(2)}M</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    x="Aug 26"
                    stroke="#0284c7"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: "Today", position: "top", fill: "#0369a1", fontSize: 11, fontWeight: 600 }}
                  />
                  {/* Underwritten line (dashed) */}
                  <Line
                    type="monotone"
                    dataKey="underwritten"
                    stroke="#94a3b8"
                    strokeWidth={1.75}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  {/* Projected profit line with markers */}
                  <Line
                    type="monotone"
                    dataKey="projectedProfit"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "#0f172a", stroke: "#ffffff", strokeWidth: 1.5 }}
                    activeDot={{ r: 5.5, fill: "#0284c7" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-lg animate-pulse text-xs text-slate-400">
                  Loading chart...
                </div>
              )}
            </div>

            {/* Elevated Modern Legend */}
            <div className="flex flex-wrap items-center justify-start gap-6 mt-5 pt-3.5 border-t border-slate-100 text-xs font-medium">
              <span className="flex items-center gap-2 text-slate-900 font-semibold">
                <span className="h-1 w-4 rounded-full bg-slate-900" /> Expected Profit
              </span>
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-0.5 w-4 border-t-2 border-dashed border-slate-400" /> Original Target
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

