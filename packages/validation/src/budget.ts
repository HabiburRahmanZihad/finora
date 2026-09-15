import { z } from "zod";
import { moneyAmountSchema } from "./common.js";

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: moneyAmountSchema,
});
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = z.object({
  amount: moneyAmountSchema,
});
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
