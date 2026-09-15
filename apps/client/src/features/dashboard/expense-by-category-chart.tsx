"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@finora/utils";
import { categoricalPalette, chartInk } from "./chart-colors";
import type { ExpenseByCategory } from "./use-dashboard";

const MAX_SLICES = 7;

function buildSlices(data: ExpenseByCategory[]) {
  const sorted = [...data].sort((a, b) => Number(b.amount) - Number(a.amount));
  const top = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);
  const otherTotal = rest.reduce((sum, item) => sum + Number(item.amount), 0);

  const slices = top.map((item, i) => ({
    name: item.categoryName,
    value: Number(item.amount),
    color: categoricalPalette[i],
  }));

  if (otherTotal > 0) {
    slices.push({ name: "Other", value: otherTotal, color: chartInk.otherSlice });
  }

  return slices;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  if (!entry) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: entry.payload.color }} />
        <span className="font-medium text-foreground">{entry.name}</span>
      </div>
      <p className="mt-1 text-muted-foreground">{formatCurrency(entry.value, "BDT")}</p>
    </div>
  );
}

export function ExpenseByCategoryChart({ data }: { data: ExpenseByCategory[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No expenses in this period yet.
      </div>
    );
  }

  const slices = buildSlices(data);
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="65%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="var(--color-card)"
              strokeWidth={2}
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(total, "BDT")}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {slices.map((slice) => (
          <div key={slice.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="truncate text-foreground">{slice.name}</span>
            </span>
            <span className="shrink-0 text-muted-foreground">
              {formatCurrency(slice.value, "BDT")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
