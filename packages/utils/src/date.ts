export type TimeFilterPreset = "today" | "this_week" | "this_month" | "this_year";

/** Inclusive start / exclusive end range for a dashboard time-filter preset. */
export function getDateRangeForPreset(
  preset: TimeFilterPreset,
  now: Date = new Date(),
): { from: Date; to: Date } {
  const from = new Date(now);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  switch (preset) {
    case "today":
      from.setHours(0, 0, 0, 0);
      break;
    case "this_week": {
      const day = from.getDay(); // 0 = Sunday
      from.setDate(from.getDate() - day);
      from.setHours(0, 0, 0, 0);
      break;
    }
    case "this_month":
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      break;
    case "this_year":
      from.setMonth(0, 1);
      from.setHours(0, 0, 0, 0);
      break;
  }

  return { from, to };
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / msPerDay));
}
