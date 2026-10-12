"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatMoney } from "@/lib/format";

export interface DivisionChartItem {
  code: string;
  shortName: string;
  fullName: string;
  originalBudgetCents: number;
  actualSpentCents: number;
  committedCents?: number;
}

interface BudgetDivisionChartProps {
  data?: DivisionChartItem[];
  divisionCount?: number;
}

const defaultChartData: DivisionChartItem[] = [
  {
    code: "01-100",
    shortName: "Gen Conditions",
    fullName: "General Conditions & Requirements",
    originalBudgetCents: 8500000,
    actualSpentCents: 4500000,
  },
  {
    code: "02-200",
    shortName: "Site Work",
    fullName: "Site Work & Excavation",
    originalBudgetCents: 14200000,
    actualSpentCents: 11000000,
  },
  {
    code: "03-300",
    shortName: "Concrete",
    fullName: "Concrete & Foundation Structure",
    originalBudgetCents: 31000000,
    actualSpentCents: 18545000,
  },
  {
    code: "06-100",
    shortName: "Framing",
    fullName: "Rough Carpentry & Framing",
    originalBudgetCents: 22000000,
    actualSpentCents: 8000000,
  },
  {
    code: "15-100",
    shortName: "Plumbing/HVAC",
    fullName: "Plumbing & HVAC Systems",
    originalBudgetCents: 17500000,
    actualSpentCents: 0,
  },
  {
    code: "16-100",
    shortName: "Electrical",
    fullName: "Electrical & Systems",
    originalBudgetCents: 8722000,
    actualSpentCents: 0,
  },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: {
      code: string;
      fullName: string;
      originalBudgetCents: number;
      actualSpentCents: number;
    };
  }>;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  const orig = item.originalBudgetCents;
  const spent = item.actualSpentCents;
  const pct = orig > 0 ? ((spent / orig) * 100).toFixed(1) : "0.0";

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-3.5 shadow-lg text-xs min-w-[220px]">
      <div className="border-b border-slate-100 pb-2 mb-2">
        <span className="font-mono text-[10px] font-bold text-slate-500 mr-1.5">
          {item.code}
        </span>
        <span className="font-bold text-slate-900">{item.fullName}</span>
      </div>
      <div className="space-y-1.5 font-mono text-[11px]">
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1.5 font-sans text-slate-500">
            <span className="h-2 w-2 rounded-sm bg-indigo-100 border border-indigo-200" />
            Original Budget
          </span>
          <span className="font-bold text-slate-900">{formatMoney(String(orig))}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1.5 font-sans text-indigo-600">
            <span className="h-2 w-2 rounded-sm bg-indigo-600" />
            Actual Drawn
          </span>
          <span className="font-bold text-indigo-700">{formatMoney(String(spent))}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100">
          <span className="font-sans">Drawn %</span>
          <span className="font-semibold text-slate-800">{pct}%</span>
        </div>
      </div>
    </div>
  );
};

export function BudgetDivisionChart({ data = defaultChartData, divisionCount = 6 }: BudgetDivisionChartProps) {
  const chartItems = (data && data.length > 0 ? data : defaultChartData).map((d) => ({
    ...d,
    budgetK: Math.round(d.originalBudgetCents / 100000), // in $k
    spentK: Math.round(d.actualSpentCents / 100000), // in $k
  }));

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Budget Allocation vs. Spend by Division
            </h3>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200/60">
              {divisionCount} CSI Divisions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Baseline budget allocation compared directly against actual disbursed costs
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-100 border border-indigo-200" />
            <span className="text-[11px] font-medium text-slate-600">Original Baseline</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-600">
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />
            <span className="text-[11px] font-medium text-indigo-700">Actual Spent</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartItems}
            margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
            barGap={4}
            barCategoryGap={24}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F8FAFC"
            />
            <XAxis
              dataKey="shortName"
              stroke="#94A3B8"
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: "#F1F5F9" }}
              interval={0}
              dy={10}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}k`}
              ticks={[0, 50, 100, 150, 200, 250, 300, 350]}
              domain={[0, 350]}
            />
            <Tooltip
              content={<CustomChartTooltip />}
              cursor={{ fill: "rgba(248, 250, 252, 0.8)" }}
            />
            <Bar
              dataKey="budgetK"
              name="Original Budget ($)"
              fill="#E0E7FF"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="spentK"
              name="Actual Drawn"
              fill="#4F46E5"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
