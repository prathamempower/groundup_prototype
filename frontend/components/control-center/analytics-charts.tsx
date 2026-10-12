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
import { TrendingUp } from "lucide-react";

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

  // 1. Cost vs Funding Dataset (Scaled realistically to $1.47M project budget)
  const costFundingData: CostFundingPoint[] = customCostFundingData || [
    { date: "May 26", planned: 0.18, spend: 0.15, verifiedProgress: 0.14, clearedFunding: 0.12 },
    { date: "Jun 26", planned: 0.38, spend: 0.35, verifiedProgress: 0.32, clearedFunding: 0.30 },
    { date: "Jul 26", planned: 0.62, spend: 0.58, verifiedProgress: 0.52, clearedFunding: 0.48 },
    { date: "Aug 26", planned: 0.85, spend: 0.74, verifiedProgress: 0.68, clearedFunding: 0.65 },
    { date: "Sep 26", planned: 1.05, spend: 0.86, verifiedProgress: 0.78, clearedFunding: 0.76 },
    {
      date: "Oct 26",
      planned: 1.22,
      spend: 0.94,
      verifiedProgress: 0.85,
      clearedFunding: 0.82,
      forecastSpend: 0.94,
      forecastFunding: 0.82,
      isToday: true,
    },
    { date: "Nov 26", planned: 1.38, spend: null, verifiedProgress: null, clearedFunding: null, forecastSpend: 1.18, forecastFunding: 1.05 },
    { date: "Dec 26", planned: 1.47, spend: null, verifiedProgress: null, clearedFunding: null, forecastSpend: 1.35, forecastFunding: 1.25 },
    { date: "Jan 27", planned: 1.47, spend: null, verifiedProgress: null, clearedFunding: null, forecastSpend: 1.47, forecastFunding: 1.47 },
  ];

  // 2. Cash Position Dataset (Monthly net delta in $M)
  const cashPositionData: CashPositionPoint[] = customCashPositionData || [
    { date: "May 26", position: 0.08 },
    { date: "Jun 26", position: 0.12 },
    { date: "Jul 26", position: 0.05 },
    { date: "Aug 26", position: -0.06 },
    { date: "Sep 26", position: -0.08 },
    { date: "Oct 26", position: -0.12, isToday: true },
    { date: "Nov 26", position: -0.08, isForecast: true },
    { date: "Dec 26", position: -0.04, isForecast: true },
    { date: "Jan 27", position: 0.02, isForecast: true },
  ];

  // 3. Projected Profit Dataset (Scaled to project development margin)
  const projectedProfitData: ProjectedProfitPoint[] = customProfitData || [
    { date: "May 26", underwritten: 0.53, projectedProfit: 0.53, marginPct: 24.2 },
    { date: "Jun 26", underwritten: 0.53, projectedProfit: 0.53, marginPct: 24.2 },
    { date: "Jul 26", underwritten: 0.53, projectedProfit: 0.52, marginPct: 23.9 },
    { date: "Aug 26", underwritten: 0.53, projectedProfit: 0.51, marginPct: 23.5 },
    { date: "Sep 26", underwritten: 0.53, projectedProfit: 0.49, marginPct: 22.8 },
    { date: "Oct 26", underwritten: 0.53, projectedProfit: 0.48, marginPct: 22.0, isToday: true },
    { date: "Nov 26", underwritten: 0.53, projectedProfit: 0.47, marginPct: 21.8 },
    { date: "Dec 26", underwritten: 0.53, projectedProfit: 0.46, marginPct: 21.5 },
    { date: "Jan 27", underwritten: 0.53, projectedProfit: 0.46, marginPct: 21.5 },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
      {/* Top Header: Executive Title + Minimalist Tab Controls & Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border px-5 py-3.5 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Capital & Schedule Trajectory
            </h2>
            <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.2 font-mono text-[10px] font-semibold border border-slate-200">
              EVM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Correlating baseline capital curve against actual verified spend and critical path milestones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Clean 3 Legend items matching user reference */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3.5 border-t-2 border-slate-400" /> Planned Baseline
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Actual Spend
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <span className="h-0.5 w-3.5 border-t-2 border-dashed border-amber-500" /> Forecast w/ Delay
            </span>
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
                    tickFormatter={(val) => (val === 0 ? "$0" : `$${val.toFixed(1)}M`)}
                    domain={[0, 1.6]}
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
                                  <span className="font-semibold text-blue-700">${p.spend.toFixed(2)}M</span>
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
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ fill: "#94a3b8", r: 3.5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ fill: "#2563eb", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecastSpend"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: "#f59e0b", r: 4 }}
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
                    tickFormatter={(val) => `$${(val * 1000).toFixed(0)}k`}
                    domain={[-0.2, 0.2]}
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
                              <span className="text-slate-500">Net Delta:</span>
                              <span
                                className={`font-semibold ${
                                  isSurplus ? "text-emerald-700" : "text-rose-600"
                                }`}
                              >
                                {isSurplus ? `+$${(p.position * 1000).toFixed(0)}k` : `-$${(Math.abs(p.position) * 1000).toFixed(0)}k`}
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
                    tickFormatter={(val) => `$${val.toFixed(2)}M`}
                    domain={[0.35, 0.6]}
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
