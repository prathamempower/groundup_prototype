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
  projectName = "161 Woodlawn Ave",
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
      spendForecast: null,
      fundingForecast: null,
      isToday: true,
    },
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

  // 3. Projected Profit Dataset (Millions)
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
      {/* Top Header: Segmented Navigation + As Of Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 px-6 py-4 gap-4 bg-slate-50/40">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Spend & Cash Flow
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === "COST_VS_FUNDING" && "Spend, verified progress, and draw funds compared to approved budget."}
            {activeTab === "CASH_POSITION" && "Monthly cash balance after expenses."}
            {activeTab === "PROJECTED_PROFIT" && "Expected project profit compared to original plan."}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scrollbar-none">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-xs font-medium whitespace-nowrap shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("COST_VS_FUNDING")}
              className={`rounded-md px-3 py-1.5 transition-all shrink-0 ${
                activeTab === "COST_VS_FUNDING"
                  ? "bg-white text-blue-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cost vs. Funding
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("CASH_POSITION")}
              className={`rounded-md px-3 py-1.5 transition-all shrink-0 ${
                activeTab === "CASH_POSITION"
                  ? "bg-white text-blue-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cash Position
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PROJECTED_PROFIT")}
              className={`rounded-md px-3 py-1.5 transition-all shrink-0 ${
                activeTab === "PROJECTED_PROFIT"
                  ? "bg-white text-blue-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Projected Profit
            </button>
          </div>
        </div>
      </div>







      {/* Chart Canvas Area */}
      <div className="p-6">
        {/* TAB 1: COST VS FUNDING */}
        {activeTab === "COST_VS_FUNDING" && (
          <div>
            <div className="w-full relative" style={{ width: "100%", height: 360, minHeight: 360 }}>
              {isMounted ? (
                <ResponsiveContainer width="100%" height={360}>
                  <ComposedChart data={costFundingData} margin={{ top: 28, right: 24, left: -4, bottom: 4 }}>
                    <defs>
                      <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.16} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} vertical={false} />
                    
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={{ stroke: "#cbd5e1" }}
                      dy={6}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => (val === 0 ? "$0" : `$${val}M`)}
                      domain={[0, 12]}
                      ticks={[0, 3, 6, 9, 12]}
                      dx={-2}
                    />

                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload as CostFundingPoint;
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-lg text-xs space-y-2.5 min-w-[220px]">
                              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                                <span className="font-bold text-slate-900 text-sm">{label}</span>
                                {p.isToday ? (
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                    Current Baseline
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    Historical
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1.5 font-mono text-[11px]">
                                <div className="flex items-center justify-between text-slate-600">
                                  <span className="font-sans flex items-center gap-1.5 text-slate-600">
                                    <span className="h-2 w-2 rounded-full bg-slate-400" /> Planned Baseline:
                                  </span>
                                  <span className="font-semibold text-slate-900">${p.planned.toFixed(2)}M</span>
                                </div>
                                {p.spend !== null && (
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span className="font-sans flex items-center gap-1.5 text-blue-700 font-medium">
                                      <span className="h-2 w-2 rounded-full bg-blue-600" /> Spend to Date:
                                    </span>
                                    <span className="font-bold text-blue-700">${p.spend.toFixed(2)}M</span>
                                  </div>
                                )}
                                {p.verifiedProgress !== null && (
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span className="font-sans flex items-center gap-1.5 text-emerald-700 font-medium">
                                      <span className="h-2 w-2 rounded-full bg-emerald-600" /> Verified Progress:
                                    </span>
                                    <span className="font-bold text-emerald-700">${p.verifiedProgress.toFixed(2)}M</span>
                                  </div>
                                )}
                                {p.clearedFunding !== null && (
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span className="font-sans flex items-center gap-1.5 text-amber-700 font-medium">
                                      <span className="h-2 w-2 rounded-sm bg-amber-500" /> Cleared Funding:
                                    </span>
                                    <span className="font-bold text-amber-700">${p.clearedFunding.toFixed(2)}M</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    {/* Planned Baseline (Neutral dashed background guide) */}
                    <Line
                      type="monotone"
                      dataKey="planned"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />

                    {/* Spend to Date (High-contrast Vibrant Blue with filled focus) */}
                    <Line
                      type="monotone"
                      dataKey="spend"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#1d4ed8", stroke: "#ffffff", strokeWidth: 2 }}
                      connectNulls={false}
                    />

                    {/* Verified Progress (Emerald Green Line) */}
                    <Line
                      type="monotone"
                      dataKey="verifiedProgress"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: "#047857", stroke: "#ffffff", strokeWidth: 2 }}
                      connectNulls={false}
                    />

                    {/* Cleared Funding (Amber Stepped Profile) */}
                    <Line
                      type="stepAfter"
                      dataKey="clearedFunding"
                      stroke="#d97706"
                      strokeWidth={2.25}
                      dot={false}
                      connectNulls={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded text-xs text-slate-400">
                  Loading chart...
                </div>
              )}
            </div>

            {/* Clear, Smart, Enterprise Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-3.5 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-5 text-slate-600">
                <span className="flex items-center gap-2 font-semibold text-blue-700">
                  <span className="h-1 w-4 rounded-full bg-blue-600" /> Spend to Date
                </span>
                <span className="flex items-center gap-2 font-semibold text-emerald-700">
                  <span className="h-1 w-4 rounded-full bg-emerald-600" /> Verified Progress
                </span>
                <span className="flex items-center gap-2 font-semibold text-amber-700">
                  <span className="h-1.5 w-3.5 bg-amber-500 rounded-xs" /> Cleared Funding
                </span>
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-0.5 w-4 border-t-2 border-dashed border-slate-400" /> Planned Baseline
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Nov 25 – Oct 26 (Actuals to Date)
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CASH POSITION */}
        {activeTab === "CASH_POSITION" && (
          <div>
            <div className="w-full relative" style={{ width: "100%", height: 360, minHeight: 360 }}>
              {isMounted ? (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={cashPositionData} margin={{ top: 28, right: 24, left: -4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={{ stroke: "#cbd5e1" }}
                      dy={6}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => (val === 0 ? "$0" : val > 0 ? `+$${val.toFixed(1)}M` : `-$${Math.abs(val).toFixed(1)}M`)}
                      domain={[-1.2, 1.2]}
                      ticks={[-1.0, -0.5, 0, 0.5, 1.0]}
                      dx={-2}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload as CashPositionPoint;
                          const isPositive = p.position >= 0;
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-lg text-xs space-y-2 min-w-[190px]">
                              <div className="border-b border-slate-100 pb-1.5 flex justify-between items-center">
                                <span className="font-bold text-slate-900 text-sm">{label}</span>
                                {p.isToday && (
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="pt-1 flex items-center justify-between font-mono text-xs">
                                <span className="font-sans text-slate-600 font-medium">Net Working Capital:</span>
                                <span className={`font-bold ${isPositive ? "text-emerald-700" : "text-rose-600"}`}>
                                  {isPositive ? `+$${p.position.toFixed(2)}M` : `-$${Math.abs(p.position).toFixed(2)}M`}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 pt-0.5">
                                {isPositive ? "Surplus liquidity buffer" : "Outlay ahead of bank draw clearance"}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.25} />
                    <ReferenceLine
                      x="Oct 26"
                      stroke="#2563eb"
                      strokeDasharray="4 4"
                      strokeWidth={1.75}
                      label={{ value: "Current (Oct 26)", position: "top", fill: "#1d4ed8", fontSize: 11, fontWeight: 700, offset: 10 }}
                    />
                    <Bar dataKey="position" maxBarSize={22} radius={[3, 3, 0, 0]}>
                      {cashPositionData.map((entry, index) => {
                        let fillColor = entry.position >= 0 ? "#10b981" : "#e11d48";
                        if (entry.isForecast) {
                          fillColor = entry.position >= 0 ? "#6ee7b7" : "#fca5a5";
                        }
                        return <Cell key={`cell-${index}`} fill={fillColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded text-xs text-slate-400">
                  Loading chart...
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-3.5 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-5">
                <span className="flex items-center gap-2 font-semibold text-emerald-800">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Cash Positive Buffer
                </span>
                <span className="flex items-center gap-2 font-semibold text-rose-800">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-600" /> Outlay Exceeds Cleared Funding
                </span>
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> Lighter Shading = Forecast
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Monthly Net Cash Flow
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECTED PROFIT */}
        {activeTab === "PROJECTED_PROFIT" && (
          <div>
            <div className="w-full relative" style={{ width: "100%", height: 360, minHeight: 360 }}>
              {isMounted ? (
                <ResponsiveContainer width="100%" height={360}>
                  <LineChart data={projectedProfitData} margin={{ top: 28, right: 24, left: -4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={{ stroke: "#cbd5e1" }}
                      dy={6}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${val.toFixed(1)}M`}
                      domain={[4.8, 6.5]}
                      ticks={[5.0, 5.5, 6.0, 6.5]}
                      dx={-2}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload as ProjectedProfitPoint;
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-lg text-xs space-y-2 min-w-[190px]">
                              <div className="border-b border-slate-100 pb-1.5 flex justify-between items-center">
                                <span className="font-bold text-slate-900 text-sm">{label}</span>
                                {p.isToday && (
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1.5 font-mono text-xs pt-1">
                                <div className="flex justify-between items-center text-slate-600">
                                  <span className="font-sans text-slate-600 font-medium">Original Planned Profit:</span>
                                  <span className="font-bold text-slate-900">${p.underwritten.toFixed(2)}M</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                  <span className="font-sans text-emerald-700 font-medium">Estimated Profit:</span>
                                  <span className="font-bold text-emerald-700">${p.projectedProfit.toFixed(2)}M</span>
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
                      stroke="#2563eb"
                      strokeDasharray="4 4"
                      strokeWidth={1.75}
                      label={{ value: "Current (Aug 26)", position: "top", fill: "#1d4ed8", fontSize: 11, fontWeight: 700, offset: 10 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="underwritten"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedProfit"
                      stroke="#059669"
                      strokeWidth={2.75}
                      dot={{ r: 4, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#047857", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded text-xs text-slate-400">
                  Loading chart...
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-3.5 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-5">
                <span className="flex items-center gap-2 font-semibold text-emerald-700">
                  <span className="h-1 w-4 rounded-full bg-emerald-600" /> Estimated Profit ($5.10M)
                </span>
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-0.5 w-4 border-t-2 border-dashed border-slate-400" /> Original Target ($6.10M)
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Variance: -$1.00M (-16.4%)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
