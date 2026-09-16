"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartInk, categoricalPalette } from "@/features/dashboard/chart-colors";
import type { AdminTraffic } from "./use-admin";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} requests</p>
    </div>
  );
}

export function TrafficChart({ data }: { data: AdminTraffic["requestsPerDay"] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={chartInk.gridline} />
        <XAxis
          dataKey="date"
          axisLine={{ stroke: chartInk.baseline }}
          tickLine={false}
          tick={{ fill: chartInk.muted, fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: chartInk.muted, fontSize: 12 }}
          width={40}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-muted)" }} />
        <Bar dataKey="count" fill={categoricalPalette[0]} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
