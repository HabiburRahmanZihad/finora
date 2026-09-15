import { z } from "zod";
import { RecurrenceFrequency, RecurringStatus, TransactionType } from "@finora/types";
import { moneyAmountSchema } from "./common.js";

export const createRecurringTransactionSchema = z.object({
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  amount: moneyAmountSchema,
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  frequency: z.nativeEnum(RecurrenceFrequency),
  customInterval: z.coerce.number().int().min(1).max(365).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  note: z.string().trim().max(200).optional(),
});
export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionSchema>;

export const updateRecurringTransactionSchema = z.object({
  amount: moneyAmountSchema.optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  endDate: z.coerce.date().nullable().optional(),
  status: z.nativeEnum(RecurringStatus).optional(),
  note: z.string().trim().max(200).optional(),
});
export type UpdateRecurringTransactionInput = z.infer<typeof updateRecurringTransactionSchema>;
