"use client";

import React, { useState } from "react";
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
  forecastSpend?: number | null;
  forecastFunding?: number | null;
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
  marginPct?: number;
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
  projectName = "48-unit mixed-use",
  asOfDate = "Through Oct 26",
  customCostFundingData,
  customCashPositionData,
  customProfitData,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("COST_VS_FUNDING");

  // 1. Cost vs Funding Dataset (Clean cumulative trajectory)
  const costFundingData: CostFundingPoint[] = customCostFundingData || [
    { date: "Nov 25", planned: 0.8, spend: 0.7, verifiedProgress: 0.65, clearedFunding: 0.5 },
    { date: "Dec 25", planned: 1.8, spend: 1.65, verifiedProgress: 1.5, clearedFunding: 1.4 },
    { date: "Jan 26", planned: 3.2, spend: 3.1, verifiedProgress: 2.8, clearedFunding: 2.7 },
    { date: "Feb 26", planned: 4.8, spend: 4.6, verifiedProgress: 4.1, clearedFunding: 4.0 },
    { date: "Mar 26", planned: 6.4, spend: 6.2, verifiedProgress: 5.6, clearedFunding: 5.3 },
    { date: "Apr 26", planned: 8.0, spend: 7.7, verifiedProgress: 7.0, clearedFunding: 6.8 },
    { date: "May 26", planned: 9.6, spend: 9.2, verifiedProgress: 8.4, clearedFunding: 8.1 },
    { date: "Jun 26", planned: 11.2, spend: 10.7, verifiedProgress: 9.7, clearedFunding: 9.3 },
    { date: "Jul 26", planned: 12.8, spend: 12.1, verifiedProgress: 10.9, clearedFunding: 10.4 },
    { date: "Aug 26", planned: 14.2, spend: 13.4, verifiedProgress: 12.0, clearedFunding: 11.6 },
    { date: "Sep 26", planned: 15.4, spend: 14.5, verifiedProgress: 12.9, clearedFunding: 12.6 },
    {
      date: "Oct 26",
      planned: 16.5,
      spend: 15.6,
      verifiedProgress: 13.8,
      clearedFunding: 13.5,
      forecastSpend: 15.6,
      forecastFunding: 13.5,
      isToday: true,
    },
    { date: "Nov 26", planned: 17.4, spend: null, verifiedProgress: null, clearedFunding: null, forecastSpend: 16.7, forecastFunding: 14.6 },
    { date: "Dec 26", planned: 18.1, spend: null, verifiedProgress: null, clearedFunding: null, forecastSpend: 17.6, forecastFunding: 15.7 },
    { date: "Jan 27", planned: 18.6, spend: null, verifiedProgress: null, clearedFunding: null, forecastSpend: 18.3, forecastFunding: 16.8 },
    { date: "Feb 27", planned: 18.9, spend: null, verifiedProgress: null, clearedFunding: null, forecastSpend: 18.8, forecastFunding: 17.7 },
    { date: "Mar 27", planned: 19.1, spend: null, verifiedProgress: null, clearedFunding: null, forecastSpend: 19.1, forecastFunding: 18.4 },
  ];

  // 2. Cash Position Dataset (Monthly net delta)
  const cashPositionData: CashPositionPoint[] = customCashPositionData || [
    { date: "Nov 25", position: 0.18 },
    { date: "Dec 25", position: 0.52 },
    { date: "Jan 26", position: 0.62 },
    { date: "Feb 26", position: 0.58 },
    { date: "Mar 26", position: -0.22 },
    { date: "Apr 26", position: -0.38 },
    { date: "May 26", position: -0.45 },
    { date: "Jun 26", position: -0.70 },
    { date: "Jul 26", position: -0.92 },
    { date: "Aug 26", position: -1.02 },
    { date: "Sep 26", position: -0.98 },
    { date: "Oct 26", position: -1.02, isToday: true },
    { date: "Nov 26", position: -0.78, isForecast: true },
    { date: "Dec 26", position: -0.65, isForecast: true },
    { date: "Jan 27", position: -0.52, isForecast: true },
    { date: "Feb 27", position: -0.42, isForecast: true },
    { date: "Mar 27", position: -0.48, isForecast: true },
    { date: "Apr 27", position: -0.55, isForecast: true },
    { date: "May 27", position: -0.62, isForecast: true },
  ];

  // 3. Projected Profit Dataset
  const projectedProfitData: ProjectedProfitPoint[] = customProfitData || [
    { date: "Nov 25", underwritten: 6.1, projectedProfit: 6.1, marginPct: 24.2 },
    { date: "Dec 25", underwritten: 6.1, projectedProfit: 6.1, marginPct: 24.2 },
    { date: "Jan 26", underwritten: 6.1, projectedProfit: 6.08, marginPct: 24.1 },
    { date: "Feb 26", underwritten: 6.1, projectedProfit: 6.05, marginPct: 24.0 },
    { date: "Mar 26", underwritten: 6.1, projectedProfit: 6.0, marginPct: 23.8 },
    { date: "Apr 26", underwritten: 6.1, projectedProfit: 5.92, marginPct: 23.5 },
    { date: "May 26", underwritten: 6.1, projectedProfit: 5.85, marginPct: 23.2 },
    { date: "Jun 26", underwritten: 6.1, projectedProfit: 5.75, marginPct: 22.9 },
    { date: "Jul 26", underwritten: 6.1, projectedProfit: 5.62, marginPct: 22.6 },
    { date: "Aug 26", underwritten: 6.1, projectedProfit: 5.51, marginPct: 22.3 },
    { date: "Sep 26", underwritten: 6.1, projectedProfit: 5.44, marginPct: 22.1 },
    { date: "Oct 26", underwritten: 6.1, projectedProfit: 5.4, marginPct: 22.0, isToday: true },
    { date: "Nov 26", underwritten: 6.1, projectedProfit: 5.35, marginPct: 21.8 },
    { date: "Dec 26", underwritten: 6.1, projectedProfit: 5.3, marginPct: 21.6 },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
      {/* Top Header: Executive Title + Minimalist Tab Controls & Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border px-5 py-3.5 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
              Budget & Timeline Trajectory
            </h2>
            <span className="rounded bg-primary-subtle text-primary border border-primary/20 px-1.5 py-0.2 text-[10px] font-bold">
              Progress
            </span>
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Planned spending curve compared to actual payments and milestones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Pills */}
          <div className="flex items-center gap-1 bg-subtle p-0.5 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("COST_VS_FUNDING")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                activeTab === "COST_VS_FUNDING"
                  ? "bg-surface text-text-primary font-semibold shadow-2xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Cost vs. funding
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("CASH_POSITION")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                activeTab === "CASH_POSITION"
                  ? "bg-surface text-text-primary font-semibold shadow-2xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Cash position
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PROJECTED_PROFIT")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                activeTab === "PROJECTED_PROFIT"
                  ? "bg-surface text-text-primary font-semibold shadow-2xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Projected profit
            </button>
          </div>

          {/* Compact Legend placed cleanly in the header */}
          <div className="flex items-center gap-3.5 text-[11px] text-text-secondary font-medium">
            {activeTab === "COST_VS_FUNDING" && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 border-t-2 border-dashed border-slate-400" /> Planned Baseline
                </span>
                <span className="flex items-center gap-1.5 text-text-primary font-semibold">
                  <span className="h-2 w-2 rounded-full bg-blue-600" /> Actual Spend
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="h-2 w-2 rounded-full border-2 border-amber-500 bg-transparent" /> Forecast w/ Delay
                </span>
              </>
            )}

            {activeTab === "CASH_POSITION" && (
              <>
                <span className="flex items-center gap-1.5 text-teal-700 font-semibold">
                  <span className="h-2 w-2 rounded-xs bg-teal-600" /> Surplus
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                  <span className="h-2 w-2 rounded-xs bg-rose-600" /> Shortfall
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="h-2 w-2 rounded-xs bg-rose-300" /> Forecast
                </span>
              </>
            )}

            {activeTab === "PROJECTED_PROFIT" && (
              <>
                <span className="flex items-center gap-1.5 text-text-primary font-semibold">
                  <span className="h-2 w-2.5 rounded-xs bg-text-primary" /> Projected
                </span>
                <span className="flex items-center gap-1.5 text-text-muted">
                  <span className="h-0.5 w-3 border-t-2 border-dashed border-slate-400" /> Target ($6.1M)
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart Workspace - Full Width Clean Focus */}
      <div className="p-5">
          {/* CHART 1: COST VS FUNDING */}
          {activeTab === "COST_VS_FUNDING" && (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={costFundingData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#f1f5f9" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}M`}
                    domain={[0, 22]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0].payload as CostFundingPoint;
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs space-y-1 min-w-[140px]">
                            <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1 flex justify-between items-center">
                              <span>{label}</span>
                              {p.isToday && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-1 py-0.2 rounded font-semibold">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="space-y-0.5 font-mono text-[11px] pt-0.5">
                              <div className="flex justify-between items-center text-slate-500">
                                <span>Planned:</span>
                                <span className="font-medium text-slate-900">${p.planned.toFixed(2)}M</span>
                              </div>
                              {p.spend !== null && (
                                <div className="flex justify-between items-center text-slate-500">
                                  <span>Spend:</span>
                                  <span className="font-semibold text-slate-900">${p.spend.toFixed(2)}M</span>
                                </div>
                              )}
                              {p.verifiedProgress !== null && (
                                <div className="flex justify-between items-center text-slate-500">
                                  <span>Verified:</span>
                                  <span className="font-semibold text-teal-700">${p.verifiedProgress.toFixed(2)}M</span>
                                </div>
                              )}
                              {p.clearedFunding !== null && (
                                <div className="flex justify-between items-center text-slate-500">
                                  <span>Cleared:</span>
                                  <span className="font-semibold text-amber-700">${p.clearedFunding.toFixed(2)}M</span>
                                </div>
                              )}
                              {p.forecastSpend && (
                                <div className="flex justify-between items-center text-slate-500">
                                  <span>Forecast:</span>
                                  <span className="font-medium text-slate-900">${p.forecastSpend.toFixed(2)}M</span>
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
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    label={{ value: "Today", position: "top", fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke="#cbd5e1"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="#0f172a"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="verifiedProgress"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="clearedFunding"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecastSpend"
                    stroke="#64748b"
                    strokeWidth={1.8}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="forecastFunding"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* CHART 2: CASH POSITION */}
          {activeTab === "CASH_POSITION" && (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashPositionData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#f1f5f9" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}M`}
                    domain={[-1.2, 1.2]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0].payload as CashPositionPoint;
                        const isSurplus = p.position >= 0;
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs min-w-[120px]">
                            <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1 flex justify-between items-center">
                              <span>{label}</span>
                              {p.isToday && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-1 py-0.2 rounded font-semibold">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="pt-1.5 flex items-center justify-between font-mono text-[11px]">
                              <span className="text-slate-500">Net:</span>
                              <span
                                className={`font-semibold ${
                                  isSurplus ? "text-emerald-700" : "text-rose-600"
                                }`}
                              >
                                {isSurplus ? `+$${p.position.toFixed(2)}M` : `-$${Math.abs(p.position).toFixed(2)}M`}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={0} stroke="#e2e8f0" strokeWidth={1.5} />
                  <ReferenceLine
                    x="Oct 26"
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    label={{ value: "Today", position: "top", fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                  />
                  <Bar dataKey="position" radius={[2, 2, 0, 0]} maxBarSize={28}>
                    {cashPositionData.map((entry, index) => {
                      let fillColor = "#0d9488";
                      if (entry.position < 0) {
                        fillColor = entry.isForecast ? "#fca5a5" : "#e11d48";
                      } else if (entry.isForecast) {
                        fillColor = "#6ee7b7";
                      }
                      return <Cell key={`cell-${index}`} fill={fillColor} fillOpacity={entry.isForecast ? 0.6 : 0.9} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* CHART 3: PROJECTED PROFIT */}
          {activeTab === "PROJECTED_PROFIT" && (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectedProfitData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#f1f5f9" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}M`}
                    domain={[5.0, 6.5]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0].payload as ProjectedProfitPoint;
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs space-y-1 min-w-[130px]">
                            <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1 flex justify-between items-center">
                              <span>{label}</span>
                              {p.isToday && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-1 py-0.2 rounded font-semibold">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="space-y-0.5 font-mono text-[11px] pt-1">
                              <div className="flex justify-between items-center text-slate-500">
                                <span>Target:</span>
                                <span className="font-semibold text-slate-900">${p.underwritten.toFixed(2)}M</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-500">
                                <span>Projected:</span>
                                <span className="font-bold text-slate-900">${p.projectedProfit.toFixed(2)}M</span>
                              </div>
                              {p.marginPct && (
                                <div className="flex justify-between items-center text-slate-500">
                                  <span>Margin:</span>
                                  <span className="font-semibold text-blue-600">{p.marginPct.toFixed(1)}%</span>
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
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    label={{ value: "Today", position: "top", fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="underwritten"
                    stroke="#cbd5e1"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedProfit"
                    stroke="#0f172a"
                    strokeWidth={2.2}
                    dot={{ r: 2.5, fill: "#0f172a" }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
      </div>
    </div>
  );
};
