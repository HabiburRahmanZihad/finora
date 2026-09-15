import { z } from "zod";

export const dailyReportQuerySchema = z.object({
  date: z.coerce.date().optional(),
});
export type DailyReportQueryInput = z.infer<typeof dailyReportQuerySchema>;

export const monthlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});
export type MonthlyReportQueryInput = z.infer<typeof monthlyReportQuerySchema>;

export const yearlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});
export type YearlyReportQueryInput = z.infer<typeof yearlyReportQuerySchema>;
