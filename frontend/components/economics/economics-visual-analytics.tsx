"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatMoney } from "@/lib/format";
import {
  ProjectEconomics,
  ProFormaLineItem,
  BudgetLine,
} from "@/lib/types";
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  ArrowRight,
  Info,
  Scale,
  Percent,
  CheckCircle2,
  Sliders,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface EconomicsVisualAnalyticsProps {
  economics?: ProjectEconomics;
  proFormaLines?: ProFormaLineItem[];
  budgetLines?: BudgetLine[];
  isClosedProject?: boolean;
}

export function EconomicsVisualAnalytics({
  economics,
  proFormaLines = [],
  budgetLines = [],
  isClosedProject = false,
}: EconomicsVisualAnalyticsProps) {
  const [selectedOverrunPct, setSelectedOverrunPct] = useState<number>(0);
  const [activeVisualSubTab, setActiveVisualSubTab] = useState<
    "PROFIT_ANALYSIS" | "HUD_GUIDE" | "SENSITIVITY"
  >("PROFIT_ANALYSIS");
  const [isHudDetailsOpen, setIsHudDetailsOpen] = useState(false);

  // Financial values in raw numbers (dollars)
  const gdv = useMemo(() => {
    return Number(economics?.gross_development_value || "650000000") / 100;
  }, [economics?.gross_development_value]);

  const totalCost = useMemo(() => {
    return Number(economics?.total_cost || "528775000") / 100;
  }, [economics?.total_cost]);

  const netProfit = useMemo(() => {
    return Number(economics?.net_profit || "121225000") / 100;
  }, [economics?.net_profit]);

  // Actual spend incurred to date from live budget lines or realistic fallback
  const actualSpendIncurred = useMemo(() => {
    if (budgetLines.length > 0) {
      const sumCents = budgetLines.reduce(
        (acc, l) => acc + (parseInt(l.actual_spend, 10) || 0),
        0
      );
      if (sumCents > 0) return sumCents / 100;
    }
    // Estimated spend incurred based on project phase (approx 36.7% of budget)
    return isClosedProject ? totalCost : 1940000;
  }, [budgetLines, isClosedProject, totalCost]);

  // Remaining cost to incur before completion
  const remainingCostToComplete = Math.max(0, totalCost - actualSpendIncurred);

  // Cost of Profit ratio: Cost required to generate $1 of net profit
  const costPerDollarProfit = netProfit > 0 ? totalCost / netProfit : 0;

  // Profit margin on GDV
  const profitMarginOnGdv = gdv > 0 ? (netProfit / gdv) * 100 : 0;

  // Return on Cost (ROC)
  const returnOnCost =
    economics?.return_on_cost_pct ||
    (totalCost > 0 ? (netProfit / totalCost) * 100 : 0);

  // Overrun simulation calculations
  const simulatedCostIncrease = (totalCost * selectedOverrunPct) / 100;
  const simulatedTotalCost = totalCost + simulatedCostIncrease;
  const simulatedProfit = Math.max(0, gdv - simulatedTotalCost);
  const simulatedROC =
    simulatedTotalCost > 0 ? (simulatedProfit / simulatedTotalCost) * 100 : 0;

  // Breakeven cost overrun percentage: Maximum % cost increase before profit reaches $0
  const breakevenOverrunPct =
    totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  // 1. Chart Data: Capital Stack & Cost vs Profit Distribution
  const capitalBridgeData = [
    {
      category: "Original Baseline",
      "Actual Spent": 0,
      "Planned Construction": 5200000,
      "Expected Profit": 1300000,
    },
    {
      category: "Current Live Forecast",
      "Actual Spent": actualSpendIncurred,
      "Remaining Cost": remainingCostToComplete,
      "Expected Profit": netProfit,
    },
  ];

  // 2. Chart Data: Category Breakdown of Total Development Value
  const costBreakdownData = [
    {
      name: "Direct Construction (Hard Costs)",
      value: 4460000,
      color: "#3b82f6", // Blue
      pct: ((4460000 / gdv) * 100).toFixed(1),
    },
    {
      name: "Professional & Municipal (Soft Costs)",
      value: 280000,
      color: "#8b5cf6", // Purple
      pct: ((280000 / gdv) * 100).toFixed(1),
    },
    {
      name: "Financing, Interest & Carrying",
      value: 547750,
      color: "#f59e0b", // Amber
      pct: ((547750 / gdv) * 100).toFixed(1),
    },
    {
      name: "Net Developer Profit",
      value: 1212250,
      color: "#10b981", // Emerald
      pct: ((1212250 / gdv) * 100).toFixed(1),
    },
  ];

  // Progress percentages for the 3-part progress bar
  const spentPctOfGdv = ((actualSpendIncurred / gdv) * 100).toFixed(1);
  const remainingPctOfGdv = ((remainingCostToComplete / gdv) * 100).toFixed(1);
  const profitPctOfGdv = ((netProfit / gdv) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Visual Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveVisualSubTab("PROFIT_ANALYSIS")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeVisualSubTab === "PROFIT_ANALYSIS"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-subtle"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Expense vs Expected Profit Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveVisualSubTab("HUD_GUIDE")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeVisualSubTab === "HUD_GUIDE"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-subtle"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Budget Sheet & HUD Statement Usage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveVisualSubTab("SENSITIVITY")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeVisualSubTab === "SENSITIVITY"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-subtle"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Cost of Profit & Breakeven Cushion</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-caption text-text-muted">
          <Info className="h-3.5 w-3.5" />
          <span>Interactive Model • Updates with Draw Spend & Change Orders</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: EXPENSE VS EXPECTED PROFIT VISUAL                              */}
      {/* ========================================================================= */}
      {activeVisualSubTab === "PROFIT_ANALYSIS" && (
        <div className="space-y-6">
          {/* Main Visual Card: Expense Burn vs Expected Developer Profit */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-subtle pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-body font-bold text-text-primary">
                    Project Expense Incurred vs Expected Profit
                  </h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    Live Economics Bridge
                  </span>
                </div>
                <p className="text-caption text-text-secondary mt-1">
                  Comparison of actual spent capital to date, remaining construction costs, and the developer&apos;s expected net profit upon disposition.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="text-right">
                  <span className="text-caption text-text-muted block">Gross Dev Value (GDV)</span>
                  <span className="text-body font-bold text-slate-900 tabular-nums">
                    {formatMoney(gdv * 100)}
                  </span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-right">
                  <span className="text-caption text-text-muted block">Projected Net Profit</span>
                  <span className="text-body font-bold text-emerald-600 tabular-nums">
                    {formatMoney(netProfit * 100)}
                  </span>
                </div>
              </div>
            </div>

            {/* Three-Tone Stacked Value Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-caption font-semibold text-text-primary">
                <span>Value Absorption of Total $6.50M Gross Development Value</span>
                <span className="text-emerald-700">
                  {profitPctOfGdv}% Net Profit Margin on GDV
                </span>
              </div>

              <div className="h-5 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5 border border-border">
                {/* 1. Actual Spend */}
                <div
                  style={{ width: `${spentPctOfGdv}%` }}
                  className="bg-blue-600 h-full rounded-l-full relative group transition-all"
                  title={`Actual Incurred Spend: ${formatMoney(actualSpendIncurred * 100)} (${spentPctOfGdv}%)`}
                />
                {/* 2. Remaining Cost */}
                <div
                  style={{ width: `${remainingPctOfGdv}%` }}
                  className="bg-amber-400 h-full relative group transition-all"
                  title={`Remaining Cost to Complete: ${formatMoney(remainingCostToComplete * 100)} (${remainingPctOfGdv}%)`}
                />
                {/* 3. Expected Net Profit */}
                <div
                  style={{ width: `${profitPctOfGdv}%` }}
                  className="bg-emerald-500 h-full rounded-r-full relative group transition-all"
                  title={`Expected Net Profit: ${formatMoney(netProfit * 100)} (${profitPctOfGdv}%)`}
                />
              </div>

              {/* Progress Bar Legend */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5">
                  <span className="h-3 w-3 rounded-full bg-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-900 block">
                      1. Incurred / Cleared Expense
                    </span>
                    <span className="font-bold text-blue-700 text-sm tabular-nums">
                      {formatMoney(actualSpendIncurred * 100)}
                    </span>
                    <span className="text-caption text-blue-600 block">
                      {spentPctOfGdv}% of GDV • Cleared via draws & invoices
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-amber-100 bg-amber-50/50 p-2.5">
                  <span className="h-3 w-3 rounded-full bg-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-900 block">
                      2. Remaining Cost to Incur
                    </span>
                    <span className="font-bold text-amber-700 text-sm tabular-nums">
                      {formatMoney(remainingCostToComplete * 100)}
                    </span>
                    <span className="text-caption text-amber-600 block">
                      {remainingPctOfGdv}% of GDV • Unbilled contracts & soft costs
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50/50 p-2.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-900 block">
                      3. Expected Developer Profit
                    </span>
                    <span className="font-bold text-emerald-700 text-sm tabular-nums">
                      {formatMoney(netProfit * 100)}
                    </span>
                    <span className="text-caption text-emerald-600 block">
                      {profitPctOfGdv}% of GDV • {returnOnCost.toFixed(1)}% Return on Cost
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Charts Grid: 2 Charts Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
              {/* Chart 1: Capital Bridge Bar Chart */}
              <div className="rounded-lg border border-border bg-subtle/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-caption font-bold text-text-primary">
                      Capital Structure: Baseline Plan vs Current Forecast
                    </h4>
                    <p className="text-[11px] text-text-muted">
                      Shows how approved budget and carry costs bridge into developer profit
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={capitalBridgeData}
                      margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        formatter={(val: number) => [`$${val.toLocaleString()}`, ""]}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="Actual Spent" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="Remaining Cost" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="Planned Construction" stackId="a" fill="#64748b" />
                      <Bar dataKey="Expected Profit" stackId="a" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Cost Breakdown & Profit Allocation Donut */}
              <div className="rounded-lg border border-border bg-subtle/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-caption font-bold text-text-primary">
                      Gross Value Allocation Breakdown
                    </h4>
                    <p className="text-[11px] text-text-muted">
                      Distribution of the $6.50M Gross Development Value across major costs and net profit
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-64 w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {costBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: number) => [`$${val.toLocaleString()}`, ""]}
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full sm:w-1/2 space-y-2 text-xs">
                    {costBreakdownData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-1.5 rounded-md hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-text-secondary truncate max-w-[150px]" title={item.name}>
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right tabular-nums">
                          <span className="font-bold text-text-primary">
                            ${(item.value / 1000).toFixed(0)}k
                          </span>
                          <span className="text-caption text-text-muted ml-1">
                            ({item.pct}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick HUD Integration Snapshot Banner */}
          <div className="rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  How the Master Budget Sheet Integrates with HUD Settlement Statements
                </h4>
                <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">
                  Property acquisition HUD-1 line items establish initial cost basis on the budget sheet. At disposition, unit closing HUDs liquidate debt and realize developer profit.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveVisualSubTab("HUD_GUIDE")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
            >
              <span>View HUD Settlement Workflow Map</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PROPER USER UNDERSTANDING OF HUD STATEMENT & BUDGET SHEET      */}
      {/* ========================================================================= */}
      {activeVisualSubTab === "HUD_GUIDE" && (
        <div className="space-y-6">
          {/* Detailed Explainer Card */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-body font-bold text-text-primary">
                  Understanding HUD Settlement Statements in Ground-Up Development
                </h3>
              </div>
              <p className="text-caption text-text-secondary mt-1 max-w-3xl leading-relaxed">
                A HUD-1 (or ALTA) Settlement Statement is a certified financial closing document itemizing all incoming and outgoing funds in a real estate transaction. In construction and development projects, HUD statements bookend the financial lifecycle at two pivotal stages: <strong>Acquisition</strong> and <strong>Unit Disposition</strong>.
              </p>
            </div>

            {/* 3-Step Lifecycle Infographic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">
                    Phase 1: Inflow Basis
                  </span>
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Land & Property Acquisition
                </h4>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  The initial purchase HUD-1/ALTA establishes the project&apos;s verified cost basis. Closing costs, deed stamps, seller credits, and title fees flow directly into the budget sheet.
                </p>
                <div className="rounded-md bg-white p-2.5 border border-blue-100 text-[11px] text-slate-700 space-y-1 font-mono">
                  <div className="text-blue-700 font-bold">Budget Sheet Mapping:</div>
                  <div>• Line 01-000: Land Purchase Price</div>
                  <div>• Line 01-100: Title & Escrow Closing</div>
                  <div>• Line 02-000: Lender Origination Points</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    Phase 2: Execution
                  </span>
                  <Layers className="h-4 w-4 text-amber-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Master Budget Sheet & Draws
                </h4>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  During construction, expenses are incurred through General Contractor pay applications (AIA G702/G703) and invoices, clearing funds against approved budget lines.
                </p>
                <div className="rounded-md bg-white p-2.5 border border-amber-100 text-[11px] text-slate-700 space-y-1 font-mono">
                  <div className="text-amber-700 font-bold">Execution Controls:</div>
                  <div>• Hard Costs: Direct Trade Contracts</div>
                  <div>• Soft Costs: Arch, MEP & Municipal</div>
                  <div>• Contingency & Change Order Burns</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                    Phase 3: Outflow Realization
                  </span>
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Unit Sales & Profit Realization
                </h4>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  As completed units sell, each individual buyer HUD-1 document liquidates senior construction debt, pays commissions, and disburses net profit to equity partners.
                </p>
                <div className="rounded-md bg-white p-2.5 border border-emerald-100 text-[11px] text-slate-700 space-y-1 font-mono">
                  <div className="text-emerald-700 font-bold">Profit Flow:</div>
                  <div>• GDV Verified via Sale Prices</div>
                  <div>• Senior Debt Discharged at Close</div>
                  <div>• Net Developer Profit Cleared</div>
                </div>
              </div>
            </div>

            {/* Interactive HUD-1 Line Mapping Reference Table */}
            <div className="space-y-3 border-t border-border-subtle pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text-primary">
                    Certified HUD-1 / ALTA Settlement Statement Line Mapping
                  </h4>
                  <p className="text-caption text-text-secondary">
                    How specific accounting lines on a settlement statement correspond to GroundUp platform modules.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHudDetailsOpen(!isHudDetailsOpen)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>{isHudDetailsOpen ? "Collapse Reference" : "Expand Reference Table"}</span>
                  {isHudDetailsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {isHudDetailsOpen && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-subtle/60 border-b border-border text-text-secondary font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">HUD-1 Section / Line</th>
                        <th className="py-2.5 px-3">Description on Settlement</th>
                        <th className="py-2.5 px-3">GroundUp Platform Destination</th>
                        <th className="py-2.5 px-3">Impact on Economics & Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-slate-700">
                      <tr className="hover:bg-subtle/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">Line 101 / 401</td>
                        <td className="py-2.5 px-3">Contract Sales Price</td>
                        <td className="py-2.5 px-3 font-semibold">Gross Development Value (GDV)</td>
                        <td className="py-2.5 px-3 text-emerald-700">Increases Top-Line Disposition Revenue</td>
                      </tr>
                      <tr className="hover:bg-subtle/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">Line 103 / 1400</td>
                        <td className="py-2.5 px-3">Settlement Charges to Borrower</td>
                        <td className="py-2.5 px-3 font-semibold">Soft Cost: Closing & Title Basis</td>
                        <td className="py-2.5 px-3 text-amber-700">Added to Total Project Cost</td>
                      </tr>
                      <tr className="hover:bg-subtle/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">Line 504 / 505</td>
                        <td className="py-2.5 px-3">Payoff of Senior Construction Loan</td>
                        <td className="py-2.5 px-3 font-semibold">Debt Facility Liquidation</td>
                        <td className="py-2.5 px-3 text-slate-600">Retires Lender Commitment & Interest Accrual</td>
                      </tr>
                      <tr className="hover:bg-subtle/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">Line 700 - 703</td>
                        <td className="py-2.5 px-3">Broker Commissions & Listing Fees</td>
                        <td className="py-2.5 px-3 font-semibold">Disposition Soft Cost Deduction</td>
                        <td className="py-2.5 px-3 text-rose-700">Deducted from Gross Sales Proceeds</td>
                      </tr>
                      <tr className="hover:bg-subtle/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">Line 603 / Net to Seller</td>
                        <td className="py-2.5 px-3">Net Cash to Borrower / Sponsor</td>
                        <td className="py-2.5 px-3 font-semibold">Net Realized Equity & Profit</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold">Unlocks Net Development Profit</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: COST OF PROFIT & SENSITIVITY STRESS TEST                       */}
      {/* ========================================================================= */}
      {activeVisualSubTab === "SENSITIVITY" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <h3 className="text-body font-bold text-text-primary">
                  The &quot;Cost of Profit&quot; & Capital Efficiency Analysis
                </h3>
              </div>
              <p className="text-caption text-text-secondary mt-1 max-w-3xl leading-relaxed">
                The <strong>Cost of Profit</strong> evaluates how much total capital expense must be deployed to generate each dollar of developer profit, and measures your breakeven safety cushion against unforeseen construction budget overruns.
              </p>
            </div>

            {/* 4 Efficiency KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <span className="text-caption text-text-muted block">Cost to Profit Ratio</span>
                <span className="text-2xl font-bold tracking-tight text-slate-900 mt-1 block">
                  ${costPerDollarProfit.toFixed(2)} : $1.00
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  $4.36 invested creates $1.00 net return
                </span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <span className="text-caption text-text-muted block">Return on Cost (ROC)</span>
                <span className="text-2xl font-bold tracking-tight text-emerald-600 mt-1 block">
                  {returnOnCost.toFixed(1)}%
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Target threshold for ground-up: &gt;20.0%
                </span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <span className="text-caption text-text-muted block">Profit Margin on GDV</span>
                <span className="text-2xl font-bold tracking-tight text-blue-600 mt-1 block">
                  {profitMarginOnGdv.toFixed(1)}%
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Percentage of total exit sales retained
                </span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <span className="text-caption text-text-muted block">Breakeven Overrun Cushion</span>
                <span className="text-2xl font-bold tracking-tight text-amber-600 mt-1 block">
                  +{breakevenOverrunPct.toFixed(1)}%
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Max tolerable budget drift ({formatMoney(netProfit * 100)})
                </span>
              </div>
            </div>

            {/* Interactive Overrun Simulator */}
            <div className="rounded-xl border border-slate-200 bg-subtle/30 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-primary" />
                    Interactive Expense Overrun Stress Test
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Simulate what happens to expected profit and return on cost if construction expenses increase
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {[0, 3, 5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSelectedOverrunPct(pct)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                        selectedOverrunPct === pct
                          ? "bg-primary text-white shadow-xs"
                          : "bg-white border border-border text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Result Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-border">
                <div>
                  <span className="text-caption text-text-muted block">Simulated Total Cost</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatMoney(simulatedTotalCost * 100)}
                  </span>
                  <span className="text-[11px] text-rose-600 block">
                    +{formatMoney(simulatedCostIncrease * 100)} overrun
                  </span>
                </div>

                <div>
                  <span className="text-caption text-text-muted block">Simulated Net Profit</span>
                  <span className={`text-sm font-bold tabular-nums ${simulatedProfit > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatMoney(simulatedProfit * 100)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {simulatedProfit > 0 ? "Net equity preserved" : "Profit eroded (Loss)"}
                  </span>
                </div>

                <div>
                  <span className="text-caption text-text-muted block">Simulated Return on Cost</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {simulatedROC.toFixed(1)}% ROC
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Down from {returnOnCost.toFixed(1)}% baseline
                  </span>
                </div>

                <div>
                  <span className="text-caption text-text-muted block">Safety Cushion Remaining</span>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        simulatedProfit > 600000
                          ? "bg-emerald-500"
                          : simulatedProfit > 0
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, (simulatedProfit / netProfit) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {((simulatedProfit / netProfit) * 100).toFixed(0)}% profit preserved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
