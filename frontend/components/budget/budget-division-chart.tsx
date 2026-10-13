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
  const remaining = Math.max(0, orig - spent);
  const pct = orig > 0 ? ((spent / orig) * 100).toFixed(1) : "0.0";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl text-xs min-w-[240px]">
      <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
          CSI {item.code}
        </span>
        <span className="font-bold text-slate-900 truncate max-w-[150px]">{item.fullName}</span>
      </div>
      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-xs bg-slate-200 border border-slate-300" />
            Original Budget
          </span>
          <span className="font-semibold text-slate-900 tabular-nums">{formatMoney(String(orig))}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-blue-700 font-medium">
            <span className="h-2 w-2 rounded-xs bg-blue-600" />
            Actual Drawn
          </span>
          <span className="font-bold text-blue-700 tabular-nums">{formatMoney(String(spent))}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-xs bg-slate-100" />
            Remaining Balance
          </span>
          <span className="font-medium text-slate-700 tabular-nums">{formatMoney(String(remaining))}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 pt-1.5 border-t border-slate-100">
          <span className="font-medium text-slate-600">Drawn Rate</span>
          <span className="font-bold text-slate-900 tabular-nums">{pct}%</span>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              CSI Division Breakdown & Spend Velocity
            </h3>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200/80">
              {divisionCount} Divisions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Original contract baseline compared directly against approved disbursements
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2.5 w-2.5 rounded-xs bg-slate-200 border border-slate-300" />
            <span className="text-[11px] font-medium text-slate-600">Baseline Budget</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-700">
            <span className="h-2.5 w-2.5 rounded-xs bg-blue-600" />
            <span className="text-[11px] font-semibold text-blue-700">Actual Spent</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartItems}
            margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
            barGap={6}
            barCategoryGap={24}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="shortName"
              stroke="#64748B"
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              interval={0}
              dy={10}
            />
            <YAxis
              stroke="#64748B"
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
              cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
            />
            <Bar
              dataKey="budgetK"
              name="Original Budget ($)"
              fill="#CBD5E1"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="spentK"
              name="Actual Drawn"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
