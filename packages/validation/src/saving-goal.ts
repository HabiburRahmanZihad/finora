import { z } from "zod";
import { moneyAmountSchema } from "./common.js";

export const createSavingGoalSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  icon: z.string().trim().max(60).optional(),
  targetAmount: moneyAmountSchema,
  currentAmount: moneyAmountSchema.optional().default("0"),
  targetDate: z.coerce.date().optional(),
});
export type CreateSavingGoalInput = z.infer<typeof createSavingGoalSchema>;

export const updateSavingGoalSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  icon: z.string().trim().max(60).optional(),
  targetAmount: moneyAmountSchema.optional(),
  targetDate: z.coerce.date().nullable().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});
export type UpdateSavingGoalInput = z.infer<typeof updateSavingGoalSchema>;

export const contributeSavingGoalSchema = z.object({
  amount: moneyAmountSchema,
  note: z.string().trim().max(200).optional(),
});
export type ContributeSavingGoalInput = z.infer<typeof contributeSavingGoalSchema>;
