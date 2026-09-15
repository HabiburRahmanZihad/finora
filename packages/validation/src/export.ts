import { z } from "zod";

export const exportFormatSchema = z.enum(["csv", "excel", "pdf"]);
export type ExportFormat = z.infer<typeof exportFormatSchema>;

export const exportTransactionsQuerySchema = z.object({
  format: exportFormatSchema.default("csv"),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type ExportTransactionsQueryInput = z.infer<typeof exportTransactionsQuerySchema>;

export const exportReportQuerySchema = z.object({
  format: exportFormatSchema.default("pdf"),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});
export type ExportReportQueryInput = z.infer<typeof exportReportQuerySchema>;
