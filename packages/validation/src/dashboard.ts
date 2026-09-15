import { z } from "zod";

export const dashboardQuerySchema = z.object({
  preset: z.enum(["today", "this_week", "this_month", "this_year", "custom"]).default("this_month"),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;

export const monthlyTrendQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});
export type MonthlyTrendQueryInput = z.infer<typeof monthlyTrendQuerySchema>;
