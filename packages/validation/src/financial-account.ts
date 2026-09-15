import { z } from "zod";
import { AccountStatus, AccountType } from "@finora/database";
import { moneyAmountSchema } from "./common.js";

export const createFinancialAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  type: z.nativeEnum(AccountType),
  balance: moneyAmountSchema.optional().default("0"),
  currency: z.string().trim().length(3).default("BDT"),
});
export type CreateFinancialAccountInput = z.infer<typeof createFinancialAccountSchema>;

export const updateFinancialAccountSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  type: z.nativeEnum(AccountType).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
});
export type UpdateFinancialAccountInput = z.infer<typeof updateFinancialAccountSchema>;
