import { z } from "zod";

export const updateUserProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  defaultCurrency: z.string().trim().length(3).optional(),
  language: z.string().trim().min(2).max(10).optional(),
  timezone: z.string().trim().min(1).max(60).optional(),
  dateFormat: z.string().trim().min(1).max(30).optional(),
  notifyBudgetWarning: z.boolean().optional(),
  notifyBudgetExceeded: z.boolean().optional(),
  notifyUpcomingRecurring: z.boolean().optional(),
  notifySavingGoalReminder: z.boolean().optional(),
  notifySubscriptionReminder: z.boolean().optional(),
  notifyFinancialInsight: z.boolean().optional(),
  notifyMonthlyReport: z.boolean().optional(),
  notifyLoanPaymentReminder: z.boolean().optional(),
});
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
