"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TimeFilterPreset } from "./use-dashboard";

const presets: { value: TimeFilterPreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
];

export function TimeFilter({
  value,
  onChange,
}: {
  value: TimeFilterPreset;
  onChange: (preset: TimeFilterPreset) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TimeFilterPreset)}>
      <TabsList>
        {presets.map((preset) => (
          <TabsTrigger key={preset.value} value={preset.value}>
            {preset.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
