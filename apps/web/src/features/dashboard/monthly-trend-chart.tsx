"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@finora/utils";
import { chartInk, flowColors } from "./chart-colors";
import type { MonthlyTrendPoint } from "./use-dashboard";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="mt-1 flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="ml-auto font-medium text-foreground">
            {formatCurrency(entry.value, "BDT")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  const chartData = data.map((d) => ({
    month: d.month,
    Income: Number(d.income),
    Expense: Number(d.expense),
    Savings: Number(d.savings),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={chartInk.gridline} />
        <XAxis
          dataKey="month"
          axisLine={{ stroke: chartInk.baseline }}
          tickLine={false}
          tick={{ fill: chartInk.muted, fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: chartInk.muted, fontSize: 12 }}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-muted)" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: chartInk.secondary }} />
        <Bar dataKey="Income" fill={flowColors.income} radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="Expense" fill={flowColors.expense} radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Line
          type="monotone"
          dataKey="Savings"
          stroke={flowColors.savings}
          strokeWidth={2}
          dot={{ r: 4, fill: flowColors.savings, stroke: "var(--color-card)", strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
